import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import TransitMapFilter from './TransitMapFilter';
import { MagnifyingGlassIcon, XMarkIcon, CheckIcon, MapIcon, ChevronLeftIcon, ArrowLeftIcon, ListBulletIcon } from '@heroicons/react/24/outline';
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
    const [showMapOnMobile, setShowMapOnMobile] = useState(false);

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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Transit Station Selection"
            size="full"
            fullScreenMobile={true}
            fullBleedDesktop={true}
            headerLeading={headerLeading}
            hideCloseButton={showMapOnMobile}
            className="!w-full !h-full max-w-none rounded-none overflow-hidden"
            useBackButton={!showMapOnMobile}
        >
            <div className="flex-1 flex flex-col overflow-hidden min-h-0 h-full">
                {/* Content: list or map — footer stays below */}
                <div className="flex-1 flex min-h-0 overflow-hidden flex-col sm:flex-row">
                    {/* Left Column: List — hidden on mobile when map is shown */}
                    <div className={`${showMapOnMobile ? 'hidden sm:flex' : 'flex'} w-full sm:w-[28%] sm:flex-none sm:min-w-0 flex-col bg-white dark:bg-dashboard-dark min-h-0 flex-1 min-w-0 border-r border-gray-100 dark:border-white/5`}>
                        {/* Header: Fixed — mobile: match filter base (px-4 py-4); desktop: p-6 */}
                        <div className="px-4 pt-6 pb-2 sm:pb-6 md:px-6 lg:px-8 flex-shrink-0 bg-white dark:bg-dashboard-dark">
                            <div className="hidden sm:flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                                    <MdOutlineDirectionsTransit className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                </div>
                                <h2 className="text-[17px] font-semibold text-gray-900 dark:text-white tracking-tight">Select Stations</h2>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative flex-1 min-w-0">
                                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search BTS/MRT station..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 min-h-[44px] rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-[15px] sm:text-[13px] font-normal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-white/10 focus:border-gray-500 dark:focus:border-primary-500 transition-all"
                                    />
                                </div>
                                {/* Transit map — tap whole container to show map instead of list (mobile); no border, larger */}
                                <button
                                    type="button"
                                    onClick={() => setShowMapOnMobile(prev => !prev)}
                                    className="flex-shrink-0 sm:hidden flex items-center justify-center gap-2 px-6 h-[44px] min-h-[44px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full active:scale-95 transition-all shadow-lg"
                                    aria-label={showMapOnMobile ? 'Show station list' : 'Show transit map'}
                                >
                                    <span className="font-normal text-sm tracking-wide">Map</span>
                                    <MapIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Selected Pills — mobile: same horizontal padding as filter; desktop: full width scroll */}
                            {selectedIds.length > 0 && (
                                <div className="overflow-y-hidden overflow-x-auto scrollbar-hide pt-2 pb-6 px-4 md:-mx-8 lg:-mx-12 sm:w-[calc(100%+3rem)] sm:px-0" style={{ maxHeight: '7rem' }}>
                                    <div className="inline-grid grid-flow-col grid-rows-2 auto-cols-max gap-x-3 gap-y-2 pb-0.5 md:pl-8 lg:pl-12">
                                        {selectedIds.map(id => {
                                            const station = stations.find(s => s.id === id);
                                            if (!station) return null;
                                            return (
                                                <div
                                                    key={id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/10 rounded-full border border-primary-100 dark:border-primary-500/20 group transition-all w-max"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: station.line_color || '#ccc' }} />
                                                    <span className="text-[14px] sm:text-[12px] font-bold text-primary-700 dark:text-primary-400 whitespace-nowrap">
                                                        {station.name_en}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleStation(id);
                                                        }}
                                                        className="p-0.5 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors flex-shrink-0"
                                                    >
                                                        <XMarkIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content: Scrollable — mobile: match filter base (px-6 py-6); desktop: px-6 pb-4 */}
                        <div className="modal-scrollable flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar px-4 md:px-6 lg:px-8 pt-0 pb-6 sm:py-0 sm:pb-4 bg-white dark:bg-dashboard-dark">
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
                                        <div key={group.name} className="mt-4 first:mt-0 mb-10 last:mb-20">
                                            <div className="flex items-center justify-between mb-0 sm:mb-4 bg-white dark:bg-dashboard-dark z-10 sticky top-0 pt-1 pb-1 sm:pt-4 sm:pb-3 md:-mx-6 lg:-mx-8 md:px-6 lg:px-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[15px] sm:text-[13px] font-normal text-gray-900 dark:text-white">
                                                            {group.name}
                                                        </span>
                                                        <span className="text-[12px] sm:text-[11px] font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded-full">
                                                            {group.stations.length} stations
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleSelectLine(group.stations, allSelected)}
                                                    className="flex items-center gap-1.5 transition-colors group"
                                                >
                                                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${allSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 group-hover:border-primary-400'}`}>
                                                        <CheckIcon className={`w-3 h-3 text-white transition-opacity ${allSelected ? 'opacity-100' : 'opacity-0'}`} />
                                                    </div>
                                                    <span className={`text-[14px] sm:text-[12px] font-normal ${allSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary-500'}`}>
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
                                                        flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200
                                                        ${selectedIds.includes(station.id)
                                                                ? 'bg-primary-50/50 dark:bg-primary-900/10'
                                                                : 'hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95'}
                                                    `}
                                                    >
                                                        <div className={`
                                                        w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0
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
                    </div>

                    {/* Right Column: Map — shown on mobile when map icon tapped; min-h-0 so flex child can shrink and fill */}
                    <div className={`${showMapOnMobile ? 'flex flex-col min-h-0' : 'hidden sm:flex flex-col min-h-0'} flex-1 sm:flex-none sm:w-[72%] sm:min-w-0 relative bg-gray-50 dark:bg-dashboard-dark overflow-hidden min-w-0`}>
                        {/* Mobile "Back to List" button — mirrors the "Map" button in list header */}
                        {showMapOnMobile && (
                            <div className="absolute top-6 right-6 z-[100] sm:hidden">
                                <button
                                    type="button"
                                    onClick={() => setShowMapOnMobile(false)}
                                    className="flex items-center justify-center gap-2 px-6 h-[44px] min-h-[44px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full active:scale-95 transition-all shadow-lg"
                                    aria-label="Show station list"
                                >
                                    <span className="font-normal text-sm tracking-wide">List</span>
                                    <ListBulletIcon className="w-5 h-5 font-bold" />
                                </button>
                            </div>
                        )}
                        <TransitMapFilter
                            hideHeader={true}
                            externalStations={stations}
                            selectedStations={selectedIds}
                            onStationClick={(id) => handleToggleStation(id)}
                        />
                    </div>
                </div>

                {/* Footer: match Sidebar design height exactly */}
                <div 
                    className="shrink-0 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-dashboard-card flex flex-row flex-nowrap items-center justify-between gap-3 sm:gap-6 px-6 md:px-8 lg:px-12"
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
                            className="flex-1 min-w-[140px] sm:min-w-[160px] px-8 py-3.5 md:px-5 md:py-2.5 rounded-full bg-gray-900 dark:bg-white border border-gray-900 dark:border-white text-white dark:text-gray-900 text-[14px] md:text-[13px] font-normal hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-95 min-h-[48px] md:min-h-[40px]"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default TransitFilterModal;
