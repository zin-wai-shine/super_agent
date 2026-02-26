import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MagnifyingGlassIcon,
    MapPinIcon,
    BuildingOffice2Icon,
    HomeIcon,
    SparklesIcon,
    MapIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';
import TransitMapFilter from '../TransitMap/TransitMapFilter';

const QUICK_SUGGESTIONS = [
    { icon: MapPinIcon, label: 'Near BTS / MRT stations', tag: 'transit' },
    { icon: HomeIcon, label: 'Condo for Rent', tag: 'Condo' },
    { icon: BuildingOffice2Icon, label: 'Commercial for Sale', tag: 'Commercial' },
    { icon: SparklesIcon, label: 'Featured properties', tag: 'featured' },
];

const HeroFilter = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({ search: '', station_id: '' });

    const navigateWithFilters = (next) => {
        const params = new URLSearchParams();
        if (next.search) params.set('search', next.search);
        if (next.station_id) params.set('station_id', next.station_id);
        if (next.max_distance_to_station) params.set('max_distance_to_station', next.max_distance_to_station);
        if (next.type) params.set('type', next.type);
        if (next.listing_type) params.set('listing_type', next.listing_type);
        navigate(`/listings?${params.toString()}`);
    };

    // Hero-only: only update local state; navigate only on Search button or Enter
    const handleSearchChange = (value) => {
        setFilters((prev) => ({ ...prev, search: value }));
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSuggestionClick = (tag, label) => {
        const search = encodeURIComponent(label || (tag === 'transit' ? 'Near BTS / MRT stations' : tag === 'Condo' ? 'Condo for Rent' : tag === 'Commercial' ? 'Commercial for Sale' : 'Featured properties'));
        if (tag === 'transit') {
            navigate(`/listings?max_distance_to_station=600&search=${search}`);
            return;
        }
        if (tag === 'Condo') {
            navigate(`/listings?type=Condo&listing_type=rent&search=${search}`);
            return;
        }
        if (tag === 'Commercial') {
            navigate(`/listings?type=Commercial&listing_type=sale&search=${search}`);
            return;
        }
        if (tag === 'featured') {
            navigate(`/listings?search=${search}`);
            return;
        }
    };

    const handleSearchSubmit = (overrides = {}) => {
        navigateWithFilters({ ...filters, ...overrides });
    };

    const stationIds = (filters.station_id || '').split(',').filter(Boolean);

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Search bar — same definite design as FilterBar: pill shape, primary border, 24px radius */}
            <div
                className="relative w-full h-[46px] bg-white border border-primary-500/30 rounded-t-[24px] rounded-b-none border-b-transparent"
                style={{ transition: 'border-color 0.2s ease' }}
            >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <MagnifyingGlassIcon className="w-5 h-5 text-primary-500" />
                </div>
                <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearchSubmit({ search: e.currentTarget.value });
                        }
                    }}
                    placeholder="Search location, name, neighborhood..."
                    className="absolute inset-0 w-full h-full bg-transparent border-none outline-none pl-12 pr-24 text-[14px] font-medium text-gray-700 placeholder-gray-400 rounded-t-[24px]"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-[5px]">
                    <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="w-9 h-9 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-sm transition-all duration-200 active:scale-95"
                    >
                        <MagnifyingGlassIcon className="w-5 h-5 stroke-[2.5]" />
                    </button>
                </div>
            </div>

            {/* Panel — same definite design as FilterBar: one card, rounded bottom, shared shadows */}
            <div className="w-full flex flex-row h-[420px] overflow-hidden rounded-b-[24px] border-l border-r border-b border-gray-200 bg-white shadow-[(-24px)_0_56px_-12px_rgba(0,0,0,0.2),24px_0_56px_-12px_rgba(0,0,0,0.2),0_32px_64px_-16px_rgba(0,0,0,0.25)]">
                {/* Left: Quick Searches — same as FilterBar */}
                <div className="w-[320px] flex-shrink-0 flex flex-col bg-white shadow-[(-8px)_0_24px_-6px_rgba(0,0,0,0.1),0_8px_24px_-6px_rgba(0,0,0,0.12)]">
                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Quick Searches</p>
                        <div className="space-y-1">
                            {QUICK_SUGGESTIONS.map(({ icon: Icon, label, tag }) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleSuggestionClick(tag, label)}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary-50/40 text-left transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                                        <span className="text-[13px] text-gray-600 font-medium group-hover:text-gray-900 transition-colors">{label}</span>
                                    </div>
                                    <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-primary-400 transition-all -translate-x-1 group-hover:translate-x-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center gap-1.5 mt-auto">
                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                        <p className="text-[11px] text-gray-400 font-bold tracking-tight">Press Enter to search all results</p>
                    </div>
                </div>

                {/* Right: Transit Explorer — same radius design as filter (rounded corners, cool map radius) */}
                <div className="flex-1 min-w-0 bg-slate-50 relative flex flex-col overflow-hidden rounded-tl-[24px] rounded-br-[24px] border-l border-t border-gray-200 shadow-[8px_0_20px_-4px_rgba(0,0,0,0.12),0_8px_20px_-4px_rgba(0,0,0,0.12)]">
                    <div className="absolute top-6 left-6 z-[100] pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-gray-200 flex items-center gap-2">
                            <div className="bg-primary-600 p-1 rounded-full">
                                <MapIcon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Transit Explorer</span>
                        </div>
                    </div>
                    <TransitMapFilter
                        searchable
                        hideHeader
                        onStationClick={(id) => {
                            const next = stationIds.includes(id)
                                ? stationIds.filter((i) => i !== id)
                                : [...stationIds, id];
                            handleFilterChange('station_id', next.join(','));
                        }}
                        selectedStations={stationIds}
                    />
                </div>
            </div>
        </div>
    );
};

export default HeroFilter;
