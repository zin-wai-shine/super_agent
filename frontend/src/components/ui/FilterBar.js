import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
    activeFilterCount = 0,
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
    onFilterChange = () => { },
    onQuickSearchClick = null,
    onClearSearch = null,
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

    const handleSuggestionClick = (text, tag) => {
        setInputValue(text);
        if (onQuickSearchClick && tag) {
            onQuickSearchClick(tag, text);
        } else {
            onSearchChange && onSearchChange(text);
        }
        setIsFocused(false);
        inputRef.current && inputRef.current.blur();
    };

    const handleClear = () => {
        setInputValue('');
        if (onClearSearch) {
            onClearSearch();
        } else {
            onSearchChange && onSearchChange('');
        }
        inputRef.current && inputRef.current.focus();
    };

    const overlayEl = !isModalVariant && isFocused && typeof document !== 'undefined' && document.body;

    return (
        <>
            {/* Dark soft overlay portaled to body so it sits above listings; nav (z-150) and filter bar (z-100) stay above */}
            {overlayEl && createPortal(
                <div
                    className="fixed left-0 right-0 bottom-0 z-[90] bg-black/40 backdrop-blur-[2px] pointer-events-auto animate-in fade-in duration-200"
                    style={{ top: navVisible ? '4rem' : '0' }}
                    aria-hidden
                    onClick={() => inputRef.current?.blur()}
                />,
                document.body
            )}
        <div
                className={`w-full ${!isModalVariant ? 'fixed left-0 right-0' : ''} z-[100] pointer-events-none transition-all duration-500 ease-in-out ${!isModalVariant && navVisible ? 'top-[4rem]' : !isModalVariant ? 'top-0' : ''} ${!isModalVariant ? 'bg-white' : ''} ${className}`}
            >
                <div className={`relative w-full transition-all duration-300 pointer-events-auto ${!isModalVariant && isScrolled ? 'shadow-lg' : ''}`}>
                {/* Same inner width as nav bar: max-w-[1440px] + px-6 lg:px-12 */}
                <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-12">
                <div
                    className={`relative w-full pointer-events-auto transition-all duration-300 ease-out h-[90px] flex items-center ${isModalVariant ? 'bg-white/80 backdrop-blur-md' : 'bg-white'}`}
                >
                    <div className="w-full max-w-full flex items-center">
                        {/* Left spacer — centers the search */}
                        <div className="flex-1 min-w-0" aria-hidden />
                        {/* Search Section — centered; 50% → 85% / lg 95% / xl 80% when focused; expand & reduce animated */}
                        <div className={`relative flex-shrink-0 transition-[width] duration-300 ease-in-out ${isFocused ? 'w-[85%] lg:w-[95%] xl:w-[80%]' : 'w-[50%] max-w-[520px] min-w-[260px]'}`}>
                            {/* Search input wrapper */}
                            <div className={`relative group h-[52px] min-h-[44px] bg-[#F9FAFC] lg:bg-white border border-primary-500/30 ${isFocused
                                ? 'rounded-t-[24px] rounded-b-none border-b-transparent'
                                : 'rounded-full'
                                }`} style={{ transition: 'border-color 0.2s ease, background-color 0.2s ease' }}>
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                    <MagnifyingGlassIcon className={`w-6 h-6 transition-colors ${isFocused ? 'text-primary-500' : 'text-gray-400'}`} />
                                </div>

                                <input
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    placeholder="Search location, name, neighborhood..."
                                    className="w-full h-full min-h-[44px] bg-[#F9FAFC] lg:bg-white pl-12 pr-[3.25rem] text-[15px] sm:text-[14px] font-normal text-gray-700 placeholder-gray-400 outline-none border-none focus:ring-0 rounded-full"
                                />

                                <div className="absolute inset-y-0 right-0 flex items-center pr-[5px] gap-1">
                                    {/* Clear button */}
                                    {inputValue && (
                                        <button
                                            onClick={handleClear}
                                            className="p-2 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    )}

                                    {/* Circular Search Button */}
                                    <button
                                        onClick={handleSearch}
                                        className="w-10 h-10 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-sm transition-all duration-200 active:scale-95"
                                    >
                                        <MagnifyingGlassIcon className="w-6 h-6 stroke-[2.5]" />
                                    </button>
                                </div>
                            </div>

                            {/* Two-Column Search Dropdown — same width as search box when focused */}
                            {isFocused && (
                                <div
                                    ref={dropdownRef}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="absolute top-full left-0 right-0 w-full bg-[#F9FAFC] lg:bg-white rounded-b-[24px] overflow-hidden z-[500] animate-in fade-in duration-150 pointer-events-auto flex flex-row h-[500px] border-l border-r border-b border-gray-200 shadow-[(-24px)_0_56px_-12px_rgba(0,0,0,0.2),24px_0_56px_-12px_rgba(0,0,0,0.2),0_32px_64px_-16px_rgba(0,0,0,0.25)] xl:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.05)] xl:border-gray-200 xl:rounded-[24px] xl:rounded-t-none"
                                >
                                    {/* Left Column: Quick Searches (1/3) */}
                                    <div className="w-[320px] flex-shrink-0 flex flex-col bg-[#F9FAFC] lg:bg-white shadow-[(-8px)_0_24px_-6px_rgba(0,0,0,0.1),0_8px_24px_-6px_rgba(0,0,0,0.12)]">
                                        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                            <p className="text-[13px] sm:text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-4">Quick Searches</p>
                                            <div className="space-y-1">
                                                {QUICK_SUGGESTIONS.map(({ icon: Icon, label, tag }) => (
                                                    <button
                                                        key={tag}
                                                        onMouseDown={() => handleSuggestionClick(label, tag)}
                                                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary-50/40 text-left transition-all group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Icon className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                                                            <span className="text-[15px] sm:text-[13px] text-gray-600 font-normal group-hover:text-gray-900 transition-colors">{label}</span>
                                                        </div>
                                                        <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-primary-400 transition-all -translate-x-1 group-hover:translate-x-0" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Footer hint */}
                                        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center gap-1.5 mt-auto">
                                            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                                            <p className="text-[13px] sm:text-[11px] text-gray-400 font-normal tracking-tight">Press Enter to search all results</p>
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
                                                <span className="text-[13px] sm:text-[11px] font-medium text-gray-900 uppercase tracking-widest">Transit Explorer</span>
                                            </div>
                                        </div>

                                        <TransitMapFilter
                                            searchable
                                            hideHeader
                                            onStationClick={(id) => {
                                                setPendingStationIds(prev => {
                                                    const next = prev.includes(id)
                                                        ? prev.filter(i => i !== id)
                                                        : [...prev, id];
                                                    if (onFilterChange) {
                                                        onFilterChange('station_id', next.join(','));
                                                    }
                                                    return next;
                                                });
                                                // Close dropdown after selection so results update immediately
                                                setIsFocused(false);
                                                if (inputRef.current) {
                                                    inputRef.current.blur();
                                                }
                                            }}
                                            selectedStations={pendingStationIds}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right spacer — always flex-1 so search stays centered; content hidden when search focused for symmetric expand */}
                        <div className="flex-1 flex items-center justify-end gap-3 min-w-0 pl-2">
                        {!isFocused && (
                        <>
                        {/* Map View switch — hidden on mobile; at lg icon + toggle only; at xl show text and container */}
                        {showMapToggle && onToggleMapView && (
                            <div className="hidden md:flex h-[52px] items-center justify-between gap-3 pl-3 pr-2 lg:pl-2 lg:pr-2 lg:min-w-0 py-1.5 rounded-full transition-all duration-300 flex-shrink-0 bg-transparent border-transparent shadow-none">
                                <div className="flex items-center gap-3 lg:gap-2">
                                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                                        <MapIcon className={`w-6 h-6 text-white ${isMapTransitioning ? 'animate-pulse' : ''}`} />
                                    </div>
                                    <span className="text-[15px] sm:text-[14px] font-medium text-gray-900 lg:hidden xl:inline">Map View</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onToggleMapView(!isGoogleMapOpen)}
                                    disabled={isMapTransitioning}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none ${isGoogleMapOpen ? 'bg-primary-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full ring-0 transition duration-300 ease-in-out ${isGoogleMapOpen ? 'translate-x-[20px] bg-white shadow-sm' : 'translate-x-[4px] bg-primary-600'}`}
                                    />
                                </button>
                            </div>
                        )}

                        {/* Filters — hidden on mobile; in map view show from md; in list view show from lg */}
                        <div className={`h-[52px] flex items-center flex-shrink-0 hidden ${isGoogleMapOpen ? 'md:flex' : 'lg:flex'}`}>
                            <button
                                type="button"
                                onClick={onOpenFilters}
                                className="h-[52px] min-w-[130px] lg:min-w-0 lg:w-[52px] lg:px-0 lg:justify-center xl:min-w-[130px] xl:px-4 xl:gap-2 flex items-center gap-2 pl-3 pr-4 rounded-full flex-shrink-0
                                  transition-all duration-200 ease-out
                                  bg-transparent border-transparent shadow-none
                                  hover:bg-primary-50/90 hover:border-primary-400/80
                                  active:scale-[0.98] active:shadow-sm
                                  focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2
                                  relative group"
                                aria-label="Filters"
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 relative ${activeFilterCount > 0 ? 'border-2 border-gray-800 bg-white group-hover:scale-105 group-hover:border-gray-700' : 'bg-white'}`}>
                                    <AdjustmentsHorizontalIcon className={`text-gray-800 ${activeFilterCount > 0 ? 'w-5 h-5' : 'w-7 h-7'}`} />
                                    {activeFilterCount > 0 && (
                                        <span className="absolute -top-[4px] -right-[4px] min-w-[16px] h-[16px] px-0.5 flex items-center justify-center rounded-full bg-gray-800 text-white text-[10px] font-normal border border-white leading-none">
                                            {activeFilterCount > 99 ? '99+' : activeFilterCount}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[15px] sm:text-[14px] font-medium text-gray-900 group-hover:text-primary-700 transition-colors lg:hidden xl:inline">Filters</span>
                            </button>
                        </div>
                        </>
                        )}
                        </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </>
    );
};

export default FilterBar;
