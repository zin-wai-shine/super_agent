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
            {/* Search bar — Liquid Glass design */}
            <div
                className="relative w-full h-[46px] bg-white/75 backdrop-blur-2xl border border-white/60 rounded-t-[24px] rounded-b-none border-b-white/20"
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
                    className="absolute inset-0 w-full h-full bg-transparent border-none outline-none pl-12 pr-24 text-[14px] font-medium text-slate-700 placeholder-slate-400 rounded-t-[24px]"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-[5px]">
                    <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="w-9 h-9 flex items-center justify-center bg-primary-600/90 hover:bg-primary-600 text-white rounded-full shadow-lg shadow-primary-500/20 transition-all duration-300 active:scale-95 group/btn overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                        <MagnifyingGlassIcon className="w-5 h-5 stroke-[2.5] relative z-10" />
                    </button>
                </div>
            </div>

            {/* Panel — Liquid Glass Design: shared shadows & translucency */}
            <div className="w-full flex flex-row h-[420px] overflow-hidden rounded-b-[24px] border border-white/40 bg-white/70 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)]">
                {/* Left: Quick Searches — Glass Sidebar */}
                <div className="w-[320px] flex-shrink-0 flex flex-col bg-white/30 backdrop-blur-md border-r border-white/20">
                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400/80 mb-4">Quick Searches</p>
                        <div className="space-y-1">
                            {QUICK_SUGGESTIONS.map(({ icon: Icon, label, tag }) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleSuggestionClick(tag, label)}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary-50/40 text-left transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-5 h-5 text-slate-400/70 group-hover:text-primary-600 transition-colors" />
                                        <span className="text-[13px] text-slate-600/90 font-medium group-hover:text-slate-900 transition-colors">{label}</span>
                                    </div>
                                    <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-primary-400 transition-all -translate-x-1 group-hover:translate-x-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-white/20 border-t border-white/10 flex items-center gap-1.5 mt-auto">
                        <MagnifyingGlassIcon className="w-4 h-4 text-slate-400/60" />
                        <p className="text-[11px] text-slate-400/80 font-bold tracking-tight">Press Enter to search all results</p>
                    </div>
                </div>

                {/* Right: Transit Explorer — Glass Map Container */}
                <div className="flex-1 min-w-0 bg-slate-50 relative flex flex-col overflow-hidden rounded-tl-[24px] rounded-br-[24px] border-l border-t border-white/30">
                    <div className="absolute top-6 left-6 z-[100] pointer-events-none">
                        <div className="bg-white/70 backdrop-blur-xl px-4 py-2 rounded-full shadow-2xl border border-white/50 flex items-center gap-3">
                            <div className="bg-primary-600 p-1.5 rounded-full shadow-lg shadow-primary-500/20">
                                <MapIcon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-[11px] font-black text-slate-900/90 uppercase tracking-[0.15em]">Transit Explorer</span>
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
