import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
    AdjustmentsHorizontalIcon,
    XMarkIcon,
    MapPinIcon,
    BuildingOffice2Icon,
    HomeIcon,
    SparklesIcon,
    MapIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { BsSearch } from 'react-icons/bs';
import Button from './Button';
import TransitMapFilter from '../TransitMap/TransitMapFilter';
import Input from './Input';
import { extractCoordinates, resolveShortLink } from '../../utils/map';

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
    onSearchSubmit = null,
    stations = [],
}) => {
    const isModalVariant = variant === 'modal';
    const [inputValue, setInputValue] = useState(searchTerm);
    const [isFocused, setIsFocused] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
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
                if (isFocused && !isClosing) {
                    setIsClosing(true);
                    setTimeout(() => {
                        setIsFocused(false);
                        setIsClosing(false);
                    }, 150);
                }
            }
        };

        if (isFocused) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFocused, isClosing]);

    const normalize = (str) => str?.toString().toLowerCase().trim().replace(/\s+/g, '') || '';

    const handleSearch = useCallback(async () => {
        let finalStationIds = [...pendingStationIds];

        let finalInput = inputValue;
        if (inputValue.includes('maps.app.goo.gl') || inputValue.includes('goo.gl/maps')) {
            const resolved = await resolveShortLink(inputValue);
            if (resolved) {
                finalInput = resolved;
            }
        }

        // Robust extraction from various formats
        const coords = extractCoordinates(finalInput);
        if (coords) {
            if (onFilterChange) {
                onFilterChange('map_center', `${coords.lat},${coords.lng}`);
            }
            // If it's a pure coordinate string or a URL, we don't necessarily want to search for it as text
            const isUrl = inputValue.includes('http') || inputValue.includes('maps.google.com') || inputValue.includes('maps.app.goo.gl');
            if (isUrl || inputValue.includes(',')) {
                // It was likely a location jump request, clear search term or keep it?
                // For now, let's just trigger the location jump via onFilterChange
            }
        }

        // Auto-match station if not already selected from the map/modal
        if (finalStationIds.length === 0 && inputValue.trim() && !coords) {
            const normalizedInput = normalize(inputValue);
            const match = (stations || []).find(s => 
                normalize(s.name_en) === normalizedInput || 
                normalize(s.name_th) === normalizedInput ||
                normalize(s.id) === normalizedInput
            );
            if (match) {
                finalStationIds = [match.id];
            }
        }

        onSearchChange && onSearchChange(inputValue);
        onFilterChange && onFilterChange('station_id', finalStationIds.join(','));
        onSearchSubmit && onSearchSubmit(inputValue);
        if (isFocused && !isClosing) {
            setIsClosing(true);
            setTimeout(() => {
                setIsFocused(false);
                setIsClosing(false);
                inputRef.current && inputRef.current.blur();
            }, 150);
        } else {
            inputRef.current && inputRef.current.blur();
        }
    }, [inputValue, onSearchChange, onFilterChange, onSearchSubmit, pendingStationIds, isFocused, isClosing, stations]);

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
        if (isFocused && !isClosing) {
            setIsClosing(true);
            setTimeout(() => {
                setIsFocused(false);
                setIsClosing(false);
                inputRef.current && inputRef.current.blur();
            }, 150);
        } else {
            inputRef.current && inputRef.current.blur();
        }
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
            <div
                className={`w-full pointer-events-none transition-all duration-500 ease-in-out ${className}`}
            >
                <div className="relative w-full pointer-events-auto">
                    <div className="w-full">
                        <div
                            className={`relative w-full pointer-events-auto transition-all duration-300 ease-out h-[72px] flex items-center justify-center ${isModalVariant ? 'bg-white/80 dark:bg-dashboard-card/80 backdrop-blur-md' : 'bg-transparent'}`}
                        >
                            <div className="w-full flex items-center justify-center">
                                {/* Search Section — centered; 50% → 95% / lg 100% / xl 100% when focused; expand & reduce animated */}
                                <div className={`relative flex-shrink-0 transition-[width] duration-300 ease-in-out ${isFocused ? 'w-[95%] lg:w-[100%] xl:w-[100%]' : 'w-[50%] max-w-[520px] min-w-[260px]'}`}>
                                    {/* Search input wrapper */}
                                    <div className={`relative group h-[58px] sm:h-[44px] sm:min-h-[40px] bg-white dark:bg-dashboard-card sm:bg-[#F9FAFC] dark:sm:bg-dashboard-card/80 border border-gray-200 dark:border-white/10 sm:border-primary-500/30 ${isFocused
                                        ? 'rounded-t-[24px] rounded-b-none border-b-transparent'
                                        : 'rounded-full'
                                        }`} style={{ transition: 'all 0.3s ease' }}>
                                        <div className="absolute inset-y-0 left-0 pl-6 sm:pl-4 flex items-center pointer-events-none z-10">
                                            <BsSearch className={`w-5 h-5 transition-colors ${isFocused ? 'text-primary-500' : 'text-gray-400'}`} />
                                        </div>

                                        <input
                                            ref={inputRef}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                            placeholder="Search properties & filters"
                                            className="w-full h-full bg-white dark:bg-dashboard-card sm:bg-[#F9FAFC] dark:sm:bg-dashboard-card/80 pl-16 sm:pl-12 pr-12 sm:pr-[3.25rem] text-[15px] sm:text-[14px] font-normal text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none border-none focus:ring-0 rounded-full"
                                        />

                                        <div className="absolute inset-y-0 right-0 flex items-center pr-[5px] gap-1">
                                            {/* Clear button */}
                                            {inputValue && (
                                                <button
                                                    onClick={handleClear}
                                                    className="p-2 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                            )}

                                            {/* Circular Search Button - Desktop Only */}
                                            <button
                                                onClick={handleSearch}
                                                className="hidden sm:flex w-9 h-9 items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-all duration-200 active:scale-95"
                                            >
                                                <BsSearch className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Two-Column Search Dropdown — same width as search box when focused */}
                                    {(isFocused || isClosing) && (
                                        <div
                                            ref={dropdownRef}
                                            onMouseDown={(e) => e.preventDefault()}
                                            className={`absolute top-full left-0 right-0 w-full bg-[#F9FAFC] dark:bg-dashboard-card lg:bg-white dark:lg:bg-dashboard-card rounded-b-[24px] overflow-hidden z-[500] pointer-events-auto flex flex-row h-[500px] border-l border-r border-b border-gray-200 dark:border-white/10 xl:border-gray-200 xl:dark:border-white/10 xl:rounded-[24px] xl:rounded-t-none ${isClosing ? 'animate-out fade-out duration-150' : 'animate-in fade-in duration-150'}`}
                                        >
                                            {/* Left Column: Quick Searches (1/3) */}
                                            <div className="w-[320px] flex-shrink-0 flex flex-col bg-[#F9FAFC] dark:bg-dashboard-card lg:bg-white dark:lg:bg-dashboard-card">
                                                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                                    <p className="text-[13px] sm:text-[11px] font-bold mb-4" style={{ color: '#222222' }}>Quick Searches</p>
                                                    <div className="space-y-1">
                                                        {QUICK_SUGGESTIONS.map(({ icon: Icon, label, tag }) => (
                                                            <button
                                                                key={tag}
                                                                onMouseDown={() => handleSuggestionClick(label, tag)}
                                                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary-50/40 dark:hover:bg-white/5 text-left transition-all group"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                                                                    <span className="text-[15px] sm:text-[13px] text-gray-600 dark:text-gray-400 font-normal group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
                                                                </div>
                                                                <ChevronRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary-400 transition-all -translate-x-1 group-hover:translate-x-0" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Footer hint */}
                                                <div className="px-6 py-4 bg-gray-50/80 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex items-center gap-1.5 mt-auto">
                                                    <BsSearch className="w-4 h-4 text-gray-400" />
                                                    <p className="text-[13px] sm:text-[11px] text-gray-400 dark:text-gray-500 font-normal tracking-tight">Press Enter to search all results</p>
                                                </div>
                                            </div>

                                            {/* Right Column: Transit Map (2/3) — no vertical divider on desktop */}
                                            <div className="flex-1 min-w-0 bg-slate-50 dark:bg-dashboard-dark relative flex flex-col overflow-hidden rounded-tl-[24px] border-l md:border-l-0 border-gray-200 dark:border-white/10">
                                                {/* Transit Explorer Title Overlay */}
                                                <div className="absolute top-6 left-6 z-[100] pointer-events-none">
                                                    <div className="bg-white/90 dark:bg-dashboard-card/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-gray-200 dark:border-white/10 flex items-center gap-2">
                                                        <div className="bg-primary-600 p-1 rounded-full">
                                                            <MapIcon className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                        <span className="text-[13px] sm:text-[11px] font-bold" style={{ color: '#222222' }}>Transit Explorer</span>
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
                                                        if (isFocused && !isClosing) {
                                                            setIsClosing(true);
                                                            setTimeout(() => {
                                                                setIsFocused(false);
                                                                setIsClosing(false);
                                                                if (inputRef.current) {
                                                                    inputRef.current.blur();
                                                                }
                                                            }, 150);
                                                        } else if (inputRef.current) {
                                                            inputRef.current.blur();
                                                        }
                                                    }}
                                                    selectedStations={pendingStationIds}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Filters — now right after search box; honors isFocused (hidden when searching) */}
                                {!isFocused && (
                                    <>
                                    <div className={`h-[44px] flex items-center flex-shrink-0 ml-4 hidden ${isGoogleMapOpen ? 'md:flex' : 'lg:flex'}`}>
                                        <button
                                            type="button"
                                            onClick={onOpenFilters}
                                            className="h-[44px] min-w-[90px] lg:min-w-0 lg:w-[26px] lg:justify-center xl:min-w-[90px] xl:px-1 xl:gap-2 flex items-center gap-1.5 pl-1 pr-1 rounded-full flex-shrink-0
                                              transition-all duration-200 ease-out
                                              bg-white dark:bg-dashboard-card sm:bg-[#F9FAFC] dark:sm:bg-dashboard-card/80
                                              hover:bg-gray-50 dark:hover:bg-dashboard-hover sm:hover:bg-gray-100
                                              border border-gray-200 dark:border-white/10 sm:border-primary-500/30
                                              active:scale-[0.98]
                                              focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2
                                              relative group"
                                            aria-label="Filters"
                                        >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 relative ${activeFilterCount > 0 ? 'bg-transparent' : 'bg-transparent'}`}>
                                                    <AdjustmentsHorizontalIcon className={`text-gray-800 dark:text-white w-5 h-5`} />
                                                    {activeFilterCount > 0 && (
                                                        <span className="absolute -top-[3px] -right-[3px] min-w-[14px] h-[14px] px-0.5 flex items-center justify-center rounded-full bg-primary-600 text-white text-[9px] font-semibold border-2 border-white shadow-md leading-none">
                                                            {activeFilterCount > 99 ? '99+' : activeFilterCount}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[13px] font-medium text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-300 transition-colors lg:hidden xl:inline">Filters</span>
                                            </button>
                                        </div>

                                    {/* Map View switch — moved after Filters; hidden on mobile */}
                                    {showMapToggle && onToggleMapView && (
                                        <div className="hidden md:flex h-[44px] items-center justify-between gap-2.5 pl-3 pr-1.5 lg:pl-1 lg:pr-1 xl:pl-3 xl:pr-1.5 lg:min-w-0 py-1 rounded-full bg-white dark:bg-dashboard-card sm:bg-[#F9FAFC] dark:sm:bg-dashboard-card/80 border border-gray-200 dark:border-white/10 sm:border-primary-500/30 hover:bg-gray-50 hover:dark:bg-dashboard-hover sm:hover:bg-gray-100 transition-all duration-300 flex-shrink-0 ml-3">
                                                <div className="flex items-center gap-1.5 lg:gap-1 xl:gap-1.5">
                                                    <div className="flex items-center justify-center flex-shrink-0">
                                                        <MapIcon className={`w-5 h-5 text-gray-800 dark:text-white ${isMapTransitioning ? 'animate-pulse' : ''}`} />
                                                    </div>
                                                    <span className="text-[13px] font-medium text-gray-900 dark:text-white lg:hidden xl:inline">Map View</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => onToggleMapView(!isGoogleMapOpen)}
                                                    disabled={isMapTransitioning}
                                                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none ${isGoogleMapOpen ? 'bg-primary-600' : 'bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20'}`}
                                                >
                                                    <span
                                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full ring-0 transition duration-300 ease-in-out ${isGoogleMapOpen ? 'translate-x-[16px] bg-white shadow-sm' : 'translate-x-[4px] bg-primary-600'}`}
                                                    />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Redundant Right spacer removed */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FilterBar;
