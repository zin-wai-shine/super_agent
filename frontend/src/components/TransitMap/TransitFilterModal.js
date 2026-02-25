import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import TransitMapFilter from './TransitMapFilter';
import { MagnifyingGlassIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Transit Station Selection"
            size="full"
            className="!w-[96vw] !h-[92vh] max-w-none rounded-[22px] overflow-hidden"
        >
            <div className="flex-1 flex overflow-hidden min-h-0 h-full">
                {/* Left Column: List — fixed width, column layout so only station list scrolls */}
                <div className="w-[450px] flex flex-col bg-white min-h-0 max-h-full border-r border-gray-100">
                    {/* Header: Fixed */}
                    <div className="p-6 border-b border-gray-50 flex-shrink-0 bg-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center">
                                <MdOutlineDirectionsTransit className="w-6 h-6 text-primary-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Select Stations</h2>
                        </div>

                        <div className="relative mb-4">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search BTS/MRT station..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-[10px] text-[14px] focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all font-medium"
                            />
                        </div>

                        {/* Selected Pills */}
                        {selectedIds.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {selectedIds.map(id => {
                                    const station = stations.find(s => s.id === id);
                                    if (!station) return null;
                                    return (
                                        <div
                                            key={id}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 rounded-full border border-primary-100 group transition-all"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: station.line_color || '#ccc' }} />
                                            <span className="text-[12px] font-bold text-primary-700">
                                                {station.name_en}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleStation(id);
                                                }}
                                                className="p-0.5 rounded-full hover:bg-primary-100 text-primary-400 hover:text-primary-600 transition-colors"
                                            >
                                                <XMarkIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Content: Scrollable — only this section scrolls when there are many stations (modal-scrollable allows scroll despite Modal lock) */}
                    <div className="modal-scrollable flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar px-6 pb-4 bg-white">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                                <p className="text-sm text-gray-400 font-medium">Loading stations...</p>
                            </div>
                        ) : filteredGroups.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                    <XMarkIcon className="w-6 h-6 text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-400 font-medium">No stations found</p>
                            </div>
                        ) : (
                            filteredGroups.map(group => {
                                const lineIds = group.stations.map(s => s.id);
                                const allSelected = lineIds.length > 0 && lineIds.every(id => selectedIds.includes(id));

                                return (
                                    <div key={group.name} className="mt-6 first:mt-0 mb-10 last:mb-20">
                                        <div className="flex items-center justify-between mb-4 bg-white z-10 sticky top-0 pt-4 pb-3 -mx-6 px-6 border-b border-gray-50/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[13px] font-black text-gray-900 uppercase tracking-widest">
                                                        {group.name}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
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
                                                <span className={`text-[12px] font-bold uppercase tracking-widest ${allSelected ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'}`}>
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
                                                        <div className={`text-[14px] font-bold leading-tight truncate transition-colors ${selectedIds.includes(station.id) ? 'text-primary-700' : 'text-gray-700'}`}>
                                                            {station.name_en}
                                                        </div>
                                                        <div className="text-[9px] text-gray-400 font-extrabold uppercase tracking-[0.15em] mt-0.5">
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

                    {/* Footer: Fixed */}
                    <div className="p-6 border-t border-gray-100 flex-shrink-0 bg-white flex items-center justify-between gap-6 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-[13px] font-black text-gray-900 uppercase tracking-widest leading-none">
                                    {selectedIds.length} stations
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">
                                    selected
                                </p>
                            </div>
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors border-l border-gray-100 pl-4 py-1"
                                >
                                    Clear Filter
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleApply}
                            className="flex-1 max-w-[200px] py-4 bg-primary-600 text-white text-sm font-black uppercase tracking-widest rounded-[10px] hover:bg-primary-700 transition-all hover:shadow-xl hover:shadow-primary-600/30 active:scale-95"
                        >
                            Done
                        </button>
                    </div>
                </div>

                {/* Right Column: Map */}
                <div className="flex-1 relative bg-gray-50 overflow-hidden">
                    <TransitMapFilter
                        hideHeader={true}
                        externalStations={stations}
                        selectedStations={selectedIds}
                        onStationClick={(id) => handleToggleStation(id)}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default TransitFilterModal;
