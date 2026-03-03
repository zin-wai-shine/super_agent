import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import TransitMapFilter from './TransitMapFilter';
import { MagnifyingGlassIcon, XMarkIcon, CheckIcon, MapIcon, ChevronLeftIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
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
        return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
    }, [stations]);

    const filteredGroups = useMemo(() => {
        if (!searchTerm) return groupedStations;
        const term = searchTerm.toLowerCase();
        return groupedStations.map(group => ({
            ...group,
            stations: group.stations.filter(s =>
                s.name_en?.toLowerCase().includes(term) ||
                s.id?.toLowerCase().includes(term) ||
                s.name_th?.toLowerCase().includes(term)
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
            className="lg:hidden flex items-center justify-center min-w-[44px] min-h-[44px] text-gray-900 hover:text-gray-700 p-3 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-200"
        >
            <ArrowLeftIcon className="w-7 h-7" />
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
            className="!w-full !h-full max-w-none rounded-none overflow-hidden shadow-none"
        >
            <div className="flex-1 flex flex-col overflow-hidden min-h-0 h-full">
                {/* Content: list or map — footer stays below */}
                <div className="flex-1 flex min-h-0 overflow-hidden flex-col sm:flex-row">
                    {/* Left Column: List — hidden on mobile when map is shown */}
                    <div className={`${showMapOnMobile ? 'hidden sm:flex' : 'flex'} w-full sm:w-[35%] sm:flex-none sm:min-w-0 flex-col bg-white min-h-0 border-r border-gray-100 flex-1 min-w-0`}>
                        {/* Header: Fixed — mobile: match filter base (px-4 py-4); desktop: p-6 */}
                        <div className="px-4 pt-3 pb-0 sm:pb-4 md:px-8 lg:px-20 border-b border-gray-200 sm:border-gray-50 flex-shrink-0 bg-white">
                            <div className="hidden sm:flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center">
                                    <MdOutlineDirectionsTransit className="w-6 h-6 text-primary-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Select Stations</h2>
                            </div>

                            <div className="flex items-center gap-3 mb-0 sm:mb-4">
                                <div className="relative flex-1 min-w-0">
                                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search BTS/MRT station..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 min-h-[44px] rounded-full border border-gray-200 bg-white text-gray-900 text-[15px] sm:text-[13px] font-normal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all"
                                    />
                                </div>
                                {/* Transit map — tap whole container to show map instead of list (mobile); no border, larger */}
                                <button
                                    type="button"
                                    onClick={() => setShowMapOnMobile(prev => !prev)}
                                    className="flex-shrink-0 sm:hidden flex items-center justify-center w-14 h-14 rounded-full bg-transparent text-gray-600 hover:text-primary-600 hover:bg-gray-50 active:scale-95 transition-all"
                                    aria-label={showMapOnMobile ? 'Show station list' : 'Show transit map'}
                                >
                                    <MapIcon className="w-8 h-8" strokeWidth={2} />
                                </button>
                            </div>

                            {/* Selected Pills — mobile: same horizontal padding as filter; desktop: full width scroll */}
                            {selectedIds.length > 0 && (
                                <div className="overflow-y-hidden overflow-x-auto scrollbar-hide py-3 px-4 md:-mx-8 lg:-mx-12 sm:w-[calc(100%+3rem)] sm:px-0" style={{ maxHeight: '6rem' }}>
                                    <div className="inline-grid grid-flow-col grid-rows-2 auto-cols-max gap-x-3 gap-y-2 pb-0.5 md:pl-8 lg:pl-12">
                                        {selectedIds.map(id => {
                                            const station = stations.find(s => s.id === id);
                                            if (!station) return null;
                                            return (
                                                <div
                                                    key={id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 rounded-full border border-primary-100 group transition-all w-max"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: station.line_color || '#ccc' }} />
                                                    <span className="text-[14px] sm:text-[12px] font-bold text-primary-700 whitespace-nowrap">
                                                        {station.name_en}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleStation(id);
                                                        }}
                                                        className="p-0.5 rounded-full hover:bg-primary-100 text-primary-400 hover:text-primary-600 transition-colors flex-shrink-0"
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
                        <div className="modal-scrollable flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar px-4 md:px-8 lg:px-20 pt-0 pb-6 sm:py-0 sm:pb-4 bg-white">
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
                                            <div className="flex items-center justify-between mb-0 sm:mb-4 bg-white z-10 sticky top-0 pt-1 pb-1 sm:pt-4 sm:pb-3 md:-mx-8 lg:-mx-20 md:px-8 lg:px-20">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[15px] sm:text-[13px] font-normal text-gray-900">
                                                            {group.name}
                                                        </span>
                                                        <span className="text-[12px] sm:text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                                                            {group.stations.length} stations
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleSelectLine(group.stations, allSelected)}
                                                    className="flex items-center gap-1.5 transition-colors group"
                                                >
                                                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${allSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-200 bg-white group-hover:border-primary-400'}`}>
                                                        <CheckIcon className={`w-3 h-3 text-white transition-opacity ${allSelected ? 'opacity-100' : 'opacity-0'}`} />
                                                    </div>
                                                    <span className={`text-[14px] sm:text-[12px] font-normal ${allSelected ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'}`}>
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
                                                                ? 'bg-primary-50/50'
                                                                : 'hover:bg-gray-50 active:scale-95'}
                                                    `}
                                                    >
                                                        <div className={`
                                                        w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0
                                                        ${selectedIds.includes(station.id)
                                                                ? 'bg-primary-600 border-primary-600 shadow-sm'
                                                                : 'border-gray-200 bg-white'}
                                                    `}>
                                                            <CheckIcon className={`w-3.5 h-3.5 text-white transition-opacity ${selectedIds.includes(station.id) ? 'opacity-100' : 'opacity-0'}`} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className={`text-[15px] sm:text-[14px] font-normal leading-tight break-words transition-colors ${selectedIds.includes(station.id) ? 'text-primary-700' : 'text-gray-700'}`}>
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
                    <div className={`${showMapOnMobile ? 'flex flex-col min-h-0' : 'hidden sm:flex flex-col min-h-0'} flex-1 sm:flex-none sm:w-[65%] sm:min-w-0 relative bg-gray-50 overflow-hidden min-w-0`}>
                        <TransitMapFilter
                            hideHeader={true}
                            externalStations={stations}
                            selectedStations={selectedIds}
                            onStationClick={(id) => handleToggleStation(id)}
                        />
                    </div>
                </div>

                {/* Footer: mobile — match filter base padding and safe area; desktop: px-8 lg:px-12 py-6 */}
                <div className="transit-modal-footer-safe px-4 md:px-8 lg:px-20 py-4 md:py-6 border-t border-gray-200 sm:border-gray-100 flex-shrink-0 bg-white flex flex-row flex-nowrap items-center justify-between gap-3 sm:gap-6 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-[13px] sm:text-[13px] font-black text-gray-900 uppercase tracking-widest leading-none">
                                {selectedIds.length} <span className="hidden sm:inline">stations</span>
                            </p>
                            <p className="text-[11px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">
                                selected
                            </p>
                        </div>
                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="sm:hidden text-[14px] font-black text-red-500 hover:text-red-600 transition-colors border-l border-gray-100 pl-4 py-1"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="hidden sm:block text-[11px] sm:text-[14px] font-black text-red-500 hover:text-red-600 transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                        <button
                            onClick={handleApply}
                            className="flex-1 min-w-[160px] sm:min-w-[60px] sm:w-[180px] sm:flex-none max-w-[340px] py-3.5 bg-gray-900 border border-gray-900 text-white text-[15px] sm:text-[13px] font-normal rounded-full hover:bg-gray-800 hover:border-gray-800 transition-all hover:shadow-xl hover:shadow-black/20 active:scale-95"
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
