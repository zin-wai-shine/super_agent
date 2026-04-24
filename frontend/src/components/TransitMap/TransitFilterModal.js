import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import TransitMapFilter from './TransitMapFilter';
import { MagnifyingGlassIcon, XMarkIcon, CheckIcon, MapIcon, ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { MdOutlineDirectionsTransit } from "react-icons/md";
import { publicApi } from '../../services/api';

const TransitFilterModal = ({
    isOpen,
    onClose,
    onApply,
    initialSelected = []
}) => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState(initialSelected);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [showMapOnMobile, setShowMapOnMobile] = useState(false);
    const pillsScrollRef = React.useRef(null);
    const [canScroll, setCanScroll] = useState({ left: false, right: false });

    // Function to check if scrolling is possible
    const checkScroll = () => {
        if (pillsScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = pillsScrollRef.current;
            setCanScroll({
                left: scrollLeft > 2,
                right: scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth - 2
            });
        }
    };

    useEffect(() => {
        // Run check after a short delay to allow layout to settle
        const timer = setTimeout(checkScroll, 100);
        window.addEventListener('resize', checkScroll);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', checkScroll);
        };
    }, [selectedIds, searchTerm]);

    const handleScroll = (direction) => {
        if (pillsScrollRef.current) {
            const scrollAmount = 200;
            pillsScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const [isExpanded, setIsExpanded] = useState(false);

    // Handle scroll to expand modal on mobile
    const handleModalScroll = (e) => {
        if (window.innerWidth < 640) { // Only on mobile
            if (e.target.scrollTop > 10) {
                if (!isExpanded) setIsExpanded(true);
            }
        }
    };

    // Reset expansion state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setIsExpanded(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const response = await publicApi.getStations();
                setStations(response.data.stations || []);
            } catch (error) {
                console.error('Failed to fetch stations:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStations();
    }, []);

    useEffect(() => {
        setSelectedIds(initialSelected);
    }, [initialSelected, isOpen]);

    useEffect(() => {
        if (!isOpen) setShowMapOnMobile(false);
        
        // Prevent body scroll when modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [isOpen]);

    const groupedStations = useMemo(() => {
        const groups = {};
        stations.forEach(station => {
            const line = station.line_name || 'Others';
            if (!groups[line]) {
                groups[line] = {
                    name: line,
                    color: station.line_color || '#ccc',
                    stations: []
                };
            }
            groups[line].stations.push(station);
        });

        // Define sorting priority
        const priority = {
            'BTS Sukhumvit': 1,
            'Yellow Line': 2,
            'BTS Silom': 3,
            'MRT Blue': 4,
            'MRT Purple': 5,
            'Pink Line': 6,
            'Gold Line': 7,
            'CEN Siam': 8,
            'Others': 99
        };

        return Object.values(groups).sort((a, b) => {
            const pA = priority[a.name] || 90;
            const pB = priority[b.name] || 90;
            if (pA !== pB) return pA - pB;
            return a.name.localeCompare(b.name);
        });
    }, [stations]);

    const filteredGroups = useMemo(() => {
        if (!searchTerm) return groupedStations;

        const normalize = (str) => str?.toString().toLowerCase().trim().replace(/\s+/g, '') || '';
        const normalizedTerm = normalize(searchTerm);

        return groupedStations.map(group => ({
            ...group,
            stations: group.stations.filter(s =>
                normalize(s.name_en).includes(normalizedTerm) ||
                normalize(s.id).includes(normalizedTerm) ||
                normalize(s.name_th).includes(normalizedTerm)
            )
        })).filter(group => group.stations.length > 0);
    }, [groupedStations, searchTerm]);

    // Map Focus Logic: When searching on map, find the best match to zoom/center
    const focusedStationId = useMemo(() => {
        if (!searchTerm || !showMapOnMobile || stations.length === 0) return null;
        
        const normalize = (str) => str?.toString().toLowerCase().trim().replace(/\s+/g, '') || '';
        const normalizedTerm = normalize(searchTerm);
        
        // 1. Try exact match first
        const exactMatch = stations.find(s => 
            normalize(s.name_en) === normalizedTerm || 
            normalize(s.id) === normalizedTerm
        );
        if (exactMatch) return exactMatch.id;

        // 2. Try starts with
        const startsWithMatch = stations.find(s => 
            normalize(s.name_en).startsWith(normalizedTerm)
        );
        if (startsWithMatch) return startsWithMatch.id;

        return null;
    }, [searchTerm, showMapOnMobile, stations]);

    const handleToggleStation = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectLine = (lineStations, allSelected) => {
        const lineIds = lineStations.map(s => s.id);
        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !lineIds.includes(id)));
        } else {
            setSelectedIds(prev => {
                const newIds = [...prev];
                lineIds.forEach(id => {
                    if (!newIds.includes(id)) newIds.push(id);
                });
                return newIds;
            });
        }
    };

    const handleClearAll = () => setSelectedIds([]);

    const handleApply = () => {
        onApply(selectedIds);
        onClose();
    };

    // Header Leading element for mobile back button
    const headerLeading = showMapOnMobile ? (
        <button
            onClick={() => setShowMapOnMobile(false)}
            className="lg:hidden flex items-center justify-center min-w-[44px] min-h-[44px] text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 p-3 -ml-2 rounded-full active:scale-95 transition-all duration-200"
        >
            <ArrowLeftIcon className="w-7 h-7 text-gray-900 dark:text-white" />
        </button>
    ) : null;
    return createPortal(
        <div className={`fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-500 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
                onClick={onClose}
            />

            {/* Modal Content container */}
            <div className={`relative w-full sm:w-[85%] sm:max-w-none flex flex-col transition-all duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] 
                ${isOpen 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-full sm:translate-y-12 sm:scale-95 opacity-0'
                }
            `}>
                {/* Desktop Close Button (Floating Above) */}
                <button
                    onClick={onClose}
                    className="hidden sm:flex absolute -top-12 right-0 w-10 h-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/80 text-white shadow-lg transition-all active:scale-95 group z-[2010]"
                >
                    <XMarkIcon className="w-6 h-6 stroke-[2.5] transition-transform group-hover:rotate-90" />
                </button>
                {/* Main Box - Bottom-up animation container */}
                <div className={`relative w-full bg-white dark:bg-dashboard-card rounded-t-[20px] sm:rounded-[28px] overflow-hidden flex flex-col transition-all duration-500 ease-in-out shadow-2xl border border-white/10
                    ${isExpanded || isSearchExpanded ? 'h-[92dvh]' : 'h-[75dvh]'} sm:h-[85vh] sm:max-h-[85vh]
                `}>

                    
                    {/* Pull Handle (Mobile) */}
                    <div className="flex justify-center pt-1.5 pb-0.5 sm:hidden flex-shrink-0">
                        <div className="w-12 h-1 bg-gray-200 dark:bg-white/10 rounded-full" />
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden min-h-0 h-full">
                        {/* Mobile Header: Compact Title + (Search, Map, Close) Buttons */}
                        <div className="sm:hidden px-4 pt-0 pb-1 flex-shrink-0 bg-white dark:bg-dashboard-card z-10 transition-all duration-300">
                            <div className="flex items-center justify-between w-full h-10">
                                <h2 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight truncate pr-4">Transit Stations</h2>
                                
                                <div className="flex items-center gap-1.5">
                                    {/* Search Toggle */}
                                    <button 
                                        onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-full active:scale-95 transition-all duration-300 ${isSearchExpanded ? 'bg-primary-600 text-white' : 'bg-gray-100/80 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}
                                    >
                                        <MagnifyingGlassIcon className="w-5 h-5" />
                                    </button>

                                    {/* Map View Toggle */}
                                    <button 
                                        onClick={() => setShowMapOnMobile(prev => !prev)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-full active:scale-95 transition-all duration-300 ${showMapOnMobile ? 'bg-primary-600 text-white' : 'bg-gray-100/80 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}
                                        aria-label="Toggle Map"
                                    >
                                        {showMapOnMobile ? <ListBulletIcon className="w-5 h-5" /> : <MapIcon className="w-5 h-5" />}
                                    </button>

                                    {/* Right Close Button */}
                                    <button 
                                        onClick={onClose}
                                        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100/80 dark:bg-white/5 text-gray-500 dark:text-gray-400 active:scale-95 transition-all"
                                        aria-label="Close"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Collapsible Search Input */}
                            <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSearchExpanded ? 'max-h-20 opacity-100 mt-3' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                <div className="relative group w-full pb-1.5">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none h-[44px] z-10">
                                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search stations..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full h-[44px] pl-11 pr-11 bg-gray-50/80 dark:bg-white/2 border border-gray-200 dark:border-white/10 focus:border-gray-800 dark:focus:border-white/60 transition-all outline-none rounded-full text-[14px] font-normal text-gray-900 dark:text-white"
                                    />
                                    {searchTerm && (
                                        <button 
                                            onClick={() => setSearchTerm('')}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors h-[44px] z-20"
                                        >
                                            <XMarkIcon className="w-5 h-5 bg-gray-200/50 dark:bg-white/10 rounded-full p-0.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content: list or map — footer stays below */}
                        <div className="flex-1 flex min-h-0 overflow-hidden flex-col sm:flex-row">
                            {/* Left Column: Map — shown on mobile when map icon tapped; min-h-0 so flex child can shrink and fill */}
                             <div className={`${showMapOnMobile ? 'flex flex-col' : 'hidden sm:flex flex-col'} flex-1 min-h-0 sm:flex-none sm:w-[70%] sm:min-w-0 relative bg-white dark:bg-dashboard-card min-w-0 p-0 sm:p-4 sm:pr-2`}>
                                <div className="w-full h-full sm:rounded-[20px] overflow-hidden sm:border sm:border-gray-900/5 dark:sm:border-white/5 sm:shadow-sm">
                                    <TransitMapFilter
                                        hideHeader={true}
                                        externalStations={stations}
                                        selectedStations={selectedIds}
                                        selectedStation={focusedStationId}
                                        onStationClick={(id) => handleToggleStation(id)}
                                    />
                                </div>
                            </div>

                            {/* Right Column: List — hidden on mobile when map is shown */}
                             <div className={`${showMapOnMobile ? 'hidden sm:flex' : 'flex'} flex-1 w-full sm:w-[30%] sm:min-w-0 flex-col bg-white dark:bg-dashboard-card min-h-0 min-w-0 p-0 sm:p-4 sm:pl-2`}>
                                <div className="flex-1 min-h-0 w-full flex flex-col bg-white dark:bg-dashboard-card sm:rounded-[20px] overflow-hidden sm:border sm:border-gray-900/5 dark:sm:border-white/5 sm:shadow-sm">
                                    {/* Desktop Header: Transforming Search (ONLY visible on desktop) */}
                                    <div className="hidden sm:block pt-4 px-4 pb-2 flex-shrink-0 bg-white dark:bg-dashboard-card">
                                        <div className="relative flex items-center min-h-[48px] w-full overflow-hidden">
                                            {/* Unified Animation: Title glides left while fading */}
                                            <div className={`flex items-center gap-3 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSearchExpanded ? 'opacity-0 -translate-x-full pointer-events-none' : 'opacity-100 translate-x-0'}`}>
                                                <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shadow-sm">
                                                    <MdOutlineDirectionsTransit className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                </div>
                                                <h2 className="text-[17px] sm:text-[16px] font-bold text-gray-900 dark:text-white tracking-tight whitespace-nowrap">Select Stations</h2>
                                            </div>

                                            {/* Search Container: Absolute right, glides across to full width */}
                                            <div 
                                                className={`absolute right-0 h-[48px] flex items-center rounded-full transition-all duration-600 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-[width,transform,background-color] ${isSearchExpanded ? 'w-full px-4 bg-gray-50/40 dark:bg-white/5 border border-[#222222] dark:border-white/20' : 'w-12 bg-transparent border-transparent'}`}
                                            >
                                                <button 
                                                    onClick={() => !isSearchExpanded && setIsSearchExpanded(true)}
                                                    className={`flex items-center justify-center transition-all duration-300 ${isSearchExpanded ? 'text-[#222222] dark:text-white mr-3' : 'w-12 h-12 rounded-full bg-gray-50/50 dark:bg-white/5 text-gray-400 hover:text-gray-900 shadow-sm hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                                >
                                                    <MagnifyingGlassIcon className="w-6 h-6" />
                                                </button>

                                                {isSearchExpanded && (
                                                    <div className="flex-1 flex items-center animate-in fade-in duration-300 delay-300">
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            placeholder="Search stations..."
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            onBlur={() => !searchTerm && setIsSearchExpanded(false)}
                                                            className="flex-1 h-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-[14px] font-normal placeholder:text-gray-400"
                                                        />
                                                        
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setIsSearchExpanded(false); setSearchTerm(''); }}
                                                            className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 transition-colors"
                                                        >
                                                            <XMarkIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selected Pills Header: Navigation buttons */}
                                    {selectedIds.length > 0 && (
                                        <div className="flex flex-col">
                                            <div className="hidden sm:flex items-center justify-between px-4 mt-2">
                                                <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400">Selected</span>
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => handleScroll('left')}
                                                        disabled={!canScroll.left}
                                                        className={`w-7 h-7 flex items-center justify-center rounded-full border border-gray-100 dark:border-white/10 transition-all ${canScroll.left ? 'bg-white dark:bg-white/5 text-gray-900 dark:text-white hover:border-gray-300 active:scale-90' : 'bg-gray-50/50 dark:bg-white/5 text-gray-200 dark:text-gray-700 cursor-not-allowed opacity-50'}`}
                                                    >
                                                        <ChevronLeftIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleScroll('right')}
                                                        disabled={!canScroll.right}
                                                        className={`w-7 h-7 flex items-center justify-center rounded-full border border-gray-100 dark:border-white/10 transition-all ${canScroll.right ? 'bg-white dark:bg-white/5 text-gray-900 dark:text-white hover:border-gray-300 active:scale-90' : 'bg-gray-50/50 dark:bg-white/5 text-gray-200 dark:text-gray-700 cursor-not-allowed opacity-50'}`}
                                                    >
                                                        <ChevronRightIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div 
                                                ref={pillsScrollRef}
                                                onScroll={checkScroll}
                                                className="overflow-y-hidden overflow-x-auto scrollbar-hide pt-2 pb-4 px-4" 
                                                style={{ maxHeight: '7rem' }}
                                            >
                                                <div className="inline-grid grid-flow-col grid-rows-2 auto-cols-max gap-x-3 gap-y-2 pb-0.5 md:pl-0">
                                                    {selectedIds.map(id => {
                                                        const station = stations.find(s => s.id === id);
                                                        if (!station) return null;
                                                        return (
                                                            <div
                                                                key={id}
                                                                className="flex items-center gap-1.5 px-3 py-1 sm:py-0.5 rounded-full border transition-all w-max group backdrop-blur-[2px]"
                                                                style={{ 
                                                                    backgroundColor: `${station.line_color || '#ccc'}15`, 
                                                                    borderColor: `${station.line_color || '#ccc'}30`
                                                                }}
                                                            >
                                                                <span 
                                                                    className="text-[13px] sm:text-[12px] font-medium whitespace-nowrap"
                                                                    style={{ color: station.line_color || '#666' }}
                                                                >
                                                                    {station.name_en}
                                                                </span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleToggleStation(id);
                                                                    }}
                                                                    className="p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0"
                                                                    style={{ color: station.line_color || '#666' }}
                                                                >
                                                                    <XMarkIcon className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Content: Scrollable — mobile: match filter base (px-6 py-6); desktop: px-6 pb-4 */}
                                    <div 
                                        onScroll={handleModalScroll}
                                        className="modal-scrollable flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar px-4 md:px-6 pt-0 pb-6 bg-white dark:bg-dashboard-card"
                                    >
                                        {loading ? (
                                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                                                <p className="text-[15px] sm:text-sm text-gray-400 font-medium">Loading stations...</p>
                                            </div>
                                        ) : filteredGroups.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                                    <XMarkIcon className="w-6 h-6 text-gray-300" />
                                                </div>
                                                <p className="text-[15px] sm:text-sm text-gray-400 font-medium">No stations found</p>
                                            </div>
                                        ) : (
                                            filteredGroups.map(group => {
                                                const lineIds = group.stations.map(s => s.id);
                                                const allSelected = lineIds.length > 0 && lineIds.every(id => selectedIds.includes(id));

                                                return (
                                                    <div 
                                                        key={group.name} 
                                                        className="sm:mt-2 first:mt-0 mt-4 mb-6 last:mb-20 p-3 sm:p-4 rounded-[16px] transition-all duration-300"
                                                        style={{ backgroundColor: `${group.color}08` }} // 3% opacity for a very subtle tint
                                                    >
                                                        <div className="flex items-center justify-between mb-4 transition-all">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: group.color }} />
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[15px] sm:text-[13px] font-bold text-gray-900 dark:text-white">
                                                                        {group.name}
                                                                    </span>
                                                                    <span className="text-[12px] sm:text-[11px] font-bold text-gray-400 dark:text-gray-500 bg-white/50 dark:bg-white/5 px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-gray-100 dark:border-white/5">
                                                                        {group.stations.length} stations
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleSelectLine(group.stations, allSelected)}
                                                                className="flex items-center gap-1.5 transition-colors group"
                                                            >
                                                                <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${allSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 group-hover:border-primary-600'}`}>
                                                                    <CheckIcon className={`w-3.5 h-3.5 text-white transition-opacity ${allSelected ? 'opacity-100' : 'opacity-0'}`} />
                                                                </div>
                                                                <span className={`text-[14px] sm:text-[12px] font-medium ${allSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 underline-offset-4 decoration-1 group-hover:text-primary-600'}`}>
                                                                    Select all
                                                                </span>
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                                            {group.stations.map(station => (
                                                                <div
                                                                    key={station.id}
                                                                    onClick={() => handleToggleStation(station.id)}
                                                                    className={`
                                                                    flex items-center gap-3 px-3 py-2.5 rounded-full cursor-pointer transition-all duration-200
                                                                    ${selectedIds.includes(station.id)
                                                                            ? 'bg-primary-50/50 dark:bg-primary-900/10'
                                                                            : 'hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95'}
                                                                `}
                                                                >
                                                                    <div className={`
                                                                    w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                                                                    ${selectedIds.includes(station.id)
                                                                            ? 'bg-primary-600 border-primary-600 shadow-sm'
                                                                            : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5'}
                                                                `}>
                                                                        <CheckIcon className={`w-3.5 h-3.5 text-white transition-opacity ${selectedIds.includes(station.id) ? 'opacity-100' : 'opacity-0'}`} />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className={`text-[15px] sm:text-[14px] font-normal leading-tight break-words transition-colors ${selectedIds.includes(station.id) ? 'text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                            {station.name_en}
                                                                        </div>
                                                                        <div className="text-[10px] sm:text-[9px] text-gray-400 font-extrabold uppercase tracking-[0.15em] mt-0.5">
                                                                            {station.id}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    
                                    {/* Desktop Inline Footer: Integrated inside the card base */}
                                    <div className="hidden sm:flex shrink-0 items-center justify-between p-4 bg-white dark:bg-dashboard-card">
                                        <div className="flex items-center">
                                            {selectedIds.length > 0 && (
                                                <button
                                                    onClick={handleClearAll}
                                                    className="px-6 py-2.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[13px] font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all active:scale-95 min-h-[40px]"
                                                >
                                                    Clear all
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleApply}
                                            className="px-8 py-2.5 rounded-full bg-gray-900 dark:bg-white border border-gray-900 dark:border-white text-white dark:text-gray-900 text-[14px] font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-95 min-h-[40px]"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                {/* Footer: match Sidebar design height exactly - HIDDEN ON DESKTOP */}
                <div 
                    className="sm:hidden shrink-0 bg-white dark:bg-dashboard-card flex flex-row flex-nowrap items-center justify-between gap-3 sm:gap-6 px-6 md:px-8 lg:px-12"
                    style={{
                        paddingTop: '0.75rem',
                        paddingBottom: '0.75rem',
                    }}
                >
                    <div className="flex items-center gap-4">
                        {selectedIds.length > 0 ? (
                            <button
                                onClick={handleClearAll}
                                className="text-[14px] md:text-[15px] font-semibold text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                            >
                                Clear all
                            </button>
                        ) : (
                            <div className="flex flex-col">
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Stations</span>
                                <span className="text-[14px] text-gray-900 dark:text-white font-bold leading-none">{selectedIds.length} Selected</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={handleApply}
                            className="flex-1 min-w-[140px] sm:min-w-[160px] px-8 py-3.5 md:px-5 md:py-2.5 rounded-full bg-gray-900 dark:bg-white border border-gray-900 dark:border-white text-white dark:text-gray-900 text-[14px] md:text-[13px] font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-95 min-h-[48px] md:min-h-[40px]"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>,
document.body
);
};

export default TransitFilterModal;
