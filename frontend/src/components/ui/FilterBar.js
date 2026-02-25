import React, { useState, useRef, useCallback } from 'react';
import {
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    XMarkIcon,
    MapPinIcon,
    BuildingOffice2Icon,
    HomeIcon,
    SparklesIcon,
    MapIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';
import Button from './Button';
import TransitMapFilter from '../TransitMap/TransitMapFilter';
import Input from './Input';

const QUICK_SUGGESTIONS = [
    { icon: MapPinIcon, label: 'Near BTS / MRT stations', tag: 'transit' },
    { icon: HomeIcon, label: 'Condo for Rent', tag: 'Condo' },
    { icon: BuildingOffice2Icon, label: 'Commercial for Sale', tag: 'Commercial' },
    { icon: SparklesIcon, label: 'Featured properties', tag: 'featured' },
];


const FilterBar = ({
    total = 0,
    searchTerm = '',
    onSearchChange,
    onOpenFilters,
    hasActiveFilters = false,
    viewMode = 'grid',
    onViewModeChange,
    isGoogleMapOpen = false,
    onToggleMapView,
    isMapTransitioning = false,
    navVisible = true,
    isScrolled = false,
    className = "",
    showMapToggle = true,
    showViewToggles = true,
    showInventory = true,
    variant = 'full',
    filters = {},
    onFilterChange = () => { }
}) => {
    const isModalVariant = variant === 'modal';
    const [inputValue, setInputValue] = useState(searchTerm);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const [pendingStationIds, setPendingStationIds] = useState([]);

    // Sync local state when prop changes (e.g. from clear or suggestion)
    React.useEffect(() => {
        setInputValue(searchTerm);
    }, [searchTerm]);

    // Sync pending stations when filters change
    React.useEffect(() => {
        setPendingStationIds((filters.station_id || '').split(',').filter(Boolean));
    }, [filters.station_id]);

    const handleFocus = () => setIsFocused(true);

    const handleBlur = useCallback((e) => {
        // We now use handleClickOutside for closing
    }, []);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                inputRef.current &&
                !inputRef.current.contains(event.target)
            ) {
                setIsFocused(false);
            }
        };

        if (isFocused) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFocused]);

    const handleSearch = useCallback(() => {
        onSearchChange && onSearchChange(inputValue);
        onFilterChange('station_id', pendingStationIds.join(','));
        setIsFocused(false);
        inputRef.current && inputRef.current.blur();
    }, [inputValue, onSearchChange, onFilterChange, pendingStationIds]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSuggestionClick = (text) => {
        setInputValue(text);
        onSearchChange && onSearchChange(text);
        setIsFocused(false);
        inputRef.current && inputRef.current.blur();
    };

    const handleClear = () => {
        setInputValue('');
        onSearchChange && onSearchChange('');
        inputRef.current && inputRef.current.focus();
    };

    return (
        <div className={`w-full sticky z-[100] pointer-events-none transition-all duration-500 ease-in-out ${!isModalVariant && navVisible ? 'top-[4rem]' : 'top-0'} ${!isModalVariant ? 'bg-[#EEEEEE]' : ''} ${className}`}>
            <div className={`relative w-full transition-all duration-300 ${isModalVariant ? 'lg:pr-40 md:pr-40 pr-2' : ''}`}>
                <div
                    className={`relative w-full pointer-events-auto transition-all duration-300 ease-out h-[84px] flex items-center ${isModalVariant ? 'bg-white/80 backdrop-blur-md' : ''}`}
                    style={!isModalVariant ? { background: 'linear-gradient(to bottom, #EEEEEE 0%, #EEEEEE 85%, #EEEEEE 100%)' } : undefined}
                >
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full flex items-center">
                        {/* Search + map + filters: align start with cards below (cards have p-4 lg:p-5 in list column) */}
                        <div className="flex items-center gap-3 flex-shrink-0 ml-4 lg:ml-5">
                        {/* Search Section — centered */}
                        <div
                            className="relative"
                            style={{ width: '950px' }}
                        >
                            {/* Search input wrapper */}
                            <div className={`relative group h-[46px] bg-white border border-primary-500/30 ${isFocused
                                ? 'rounded-t-[24px] rounded-b-none border-b-transparent !bg-white'
                                : 'rounded-[24px]'
                                }`} style={{ transition: 'border-color 0.2s ease, background-color 0.2s ease' }}>
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                    <MagnifyingGlassIcon className={`w-5 h-5 transition-colors ${isFocused ? 'text-primary-500' : 'text-gray-400'}`} />
                                </div>

                                <input
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    placeholder="Search location, name, neighborhood..."
                                    className="w-full h-full bg-white pl-12 pr-24 text-[14px] font-medium text-gray-700 placeholder-gray-400 outline-none border-none focus:ring-0 rounded-[24px]"
                                />

                                <div className="absolute inset-y-0 right-0 flex items-center pr-[5px] gap-1">
                                    {/* Clear button */}
                                    {inputValue && (
                                        <button
                                            onClick={handleClear}
                                            className="px-2 h-full flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    )}

                                    {/* Circular Search Button */}
                                    <button
                                        onClick={handleSearch}
                                        className="w-9 h-9 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-sm transition-all duration-200 active:scale-95"
                                    >
                                        <MagnifyingGlassIcon className="w-5 h-5 stroke-[2.5]" />
                                    </button>
                                </div>
                            </div>

                            {/* Two-Column Search Dropdown */}
                            {isFocused && (
                                <div
                                    ref={dropdownRef}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="absolute top-full left-0 right-0 bg-white rounded-b-[24px] overflow-hidden z-[500] animate-in fade-in duration-150 pointer-events-auto flex flex-row h-[500px] border-l border-r border-b border-gray-200 shadow-[(-24px)_0_56px_-12px_rgba(0,0,0,0.2),24px_0_56px_-12px_rgba(0,0,0,0.2),0_32px_64px_-16px_rgba(0,0,0,0.25)]"
                                    style={{ width: '950px' }}
                                >
                                    {/* Left Column: Quick Searches (1/3) */}
                                    <div className="w-[320px] flex-shrink-0 flex flex-col bg-white shadow-[(-8px)_0_24px_-6px_rgba(0,0,0,0.1),0_8px_24px_-6px_rgba(0,0,0,0.12)]">
                                        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Quick Searches</p>
                                            <div className="space-y-1">
                                                {QUICK_SUGGESTIONS.map(({ icon: Icon, label, tag }) => (
                                                    <button
                                                        key={tag}
                                                        onMouseDown={() => handleSuggestionClick(label)}
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

                                        {/* Footer hint */}
                                        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center gap-1.5 mt-auto">
                                            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                                            <p className="text-[11px] text-gray-400 font-bold tracking-tight">Press Enter to search all results</p>
                                        </div>
                                    </div>

                                    {/* Right Column: Transit Map (2/3) */}
                                    <div className="flex-1 min-w-0 bg-slate-50 relative flex flex-col overflow-hidden rounded-tl-[24px] border-l border-t border-gray-200 shadow-[8px_0_20px_-4px_rgba(0,0,0,0.12),0_8px_20px_-4px_rgba(0,0,0,0.12)]">
                                        {/* Transit Explorer Title Overlay */}
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
                                                setPendingStationIds(prev =>
                                                    prev.includes(id)
                                                        ? prev.filter(i => i !== id)
                                                        : [...prev, id]
                                                );
                                            }}
                                            selectedStations={pendingStationIds}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Map View switch — right of search bar, pill shape, same height & border as search */}
                        {showMapToggle && onToggleMapView && (
                            <div className="h-[46px] flex items-center justify-between gap-3 pl-3 pr-2 py-1.5 bg-white border border-primary-500/30 rounded-full shadow-sm transition-all duration-300 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                                        <MapIcon className={`w-5 h-5 text-white ${isMapTransitioning ? 'animate-pulse' : ''}`} />
                                    </div>
                                    <span className="text-[14px] font-medium text-gray-900">Map View</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onToggleMapView(!isGoogleMapOpen)}
                                    disabled={isMapTransitioning}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none ${isGoogleMapOpen ? 'bg-primary-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-300 ease-in-out ${isGoogleMapOpen ? 'translate-x-[20px]' : 'translate-x-[4px]'}`}
                                    />
                                </button>
                            </div>
                        )}
                        {/* Filters — same row as search + Map View, consistent gap-3 and matching pill style */}
                        {isGoogleMapOpen && (
                            <button
                                type="button"
                                onClick={onOpenFilters}
                                className={`h-[46px] flex items-center gap-3 pl-3 pr-5 rounded-full bg-white border shadow-sm flex-shrink-0
                                  transition-all duration-200 ease-out
                                  hover:bg-primary-50/90 hover:border-primary-400/80 hover:shadow-md
                                  active:scale-[0.98] active:shadow-sm
                                  focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2
                                  relative group
                                  ${hasActiveFilters ? 'border-primary-500' : 'border-primary-500/30'}`}
                            >
                                <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                                    <AdjustmentsHorizontalIcon className="w-5 h-5 text-white" />
                                </div>
                                <span className={`text-[14px] font-medium ${hasActiveFilters ? 'text-primary-700' : 'text-gray-900'} group-hover:text-primary-700 transition-colors`}>Filters</span>
                                {hasActiveFilters && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-600 rounded-full border-2 border-white animate-pulse" />
                                )}
                            </button>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
