import React, { useState, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
    AdjustmentsHorizontalIcon,
    XMarkIcon,
    MapPinIcon,
    BuildingOffice2Icon,
    HomeIcon,
    SparklesIcon,
    MapIcon,
    ChevronRightIcon,
    Squares2X2Icon,
    ListBulletIcon,
} from '@heroicons/react/24/outline';
import { BsSearch } from 'react-icons/bs';
import Button from './Button';
import TransitMapFilter from '../TransitMap/TransitMapFilter';
import Input from './Input';
import { extractCoordinates, resolveShortLink } from '../../utils/map';
import { getMediaUrl } from '../../utils/media';

const QUICK_SUGGESTIONS = [
    { icon: MapPinIcon, label: 'Near BTS / MRT stations', tag: 'transit' },
    { icon: HomeIcon, label: 'Condo for Rent', tag: 'Condo' },
    { icon: BuildingOffice2Icon, label: 'Commercial for Sale', tag: 'Commercial' },
    { icon: SparklesIcon, label: 'Featured properties', tag: 'featured' },
];


const FilterBar = ({
    listings = [],
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
    listingType = '',
    onListingTypeChange = null,
    onQuickSearchClick = null,
    onClearSearch = null,
    onSearchSubmit = null,
    stations = [],
}) => {
    const isModalVariant = variant === 'modal';
    const [inputValue, setInputValue] = useState(searchTerm);
    const [isFocused, setIsFocused] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef(null);
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);
    const [pendingStationIds, setPendingStationIds] = useState([]);
    // Rent/Sale sliding pill measurement
    const rsContainerRef = useRef(null);
    const rentBtnRef = useRef(null);
    const saleBtnRef = useRef(null);
    const [rsPillStyle, setRsPillStyle] = useState({ width: 0, left: 4 });

    React.useEffect(() => {
        const updateRsPill = () => {
            const activeBtn = listingType === 'sale' ? saleBtnRef.current : rentBtnRef.current;
            const container = rsContainerRef.current;
            if (activeBtn && container) {
                const cRect = container.getBoundingClientRect();
                const bRect = activeBtn.getBoundingClientRect();
                setRsPillStyle({ width: bRect.width, left: bRect.left - cRect.left });
            }
        };
        updateRsPill();
        window.addEventListener('resize', updateRsPill);
        return () => window.removeEventListener('resize', updateRsPill);
    }, [listingType, onListingTypeChange]);

    React.useEffect(() => {
        if (inputValue) {
            setIsSearching(true);
            const timer = setTimeout(() => {
                setIsSearching(false);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setIsSearching(false);
        }
    }, [inputValue]);
    const [recentSearches, setRecentSearches] = useState(() => {
        try {
            const saved = localStorage.getItem('recentSearches');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const handleResultClick = (listing) => {
        if (listing && listing.title) {
            const text = listing.title;
            setRecentSearches(prev => {
                const next = [text, ...prev.filter(t => typeof t === 'string' ? t !== text : t.id !== text)].slice(0, 5);
                localStorage.setItem('recentSearches', JSON.stringify(next));
                return next;
            });
        }
        
        if (isFocused && !isClosing) {
            setIsClosing(true);
            setTimeout(() => {
                setIsFocused(false);
                setIsClosing(false);
                if (inputRef.current) inputRef.current.blur();
            }, 150);
        } else if (inputRef.current) {
            inputRef.current.blur();
        }
    };

    const searchResults = useMemo(() => {
        if (!inputValue) return [];
        const lowerVal = inputValue.toLowerCase();
        return listings.filter(l => 
            (l.title && l.title.toLowerCase().includes(lowerVal)) || 
            (l.station_name && l.station_name.toLowerCase().includes(lowerVal)) ||
            (l.address && l.address.toLowerCase().includes(lowerVal))
        ).slice(0, 10);
    }, [inputValue, listings]);

    const formatPrice = (p) => p ? p.toLocaleString() : 'N/A';

    // Auto-focus the search input inside the dropdown when opened
    React.useEffect(() => {
        if (isFocused && inputRef.current) {
            const timer = setTimeout(() => {
                inputRef.current.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isFocused]);

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

    // Lock ALL scroll when overlay is active (desktop only)
    React.useEffect(() => {
        const isActive = (isFocused || isClosing) && !isModalVariant && window.innerWidth >= 768;
        if (!isActive) return;

        // Measure scrollbar width to prevent layout shift
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        // Lock html + body + main scroll container
        const html = document.documentElement;
        const scrollContainer = document.getElementById('main-scroll-container');

        html.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        // Compensate for scrollbar disappearing so content doesn't shift
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
        if (scrollContainer) scrollContainer.style.overflow = 'hidden';

        // Block wheel & touchmove on document to catch everything
        const blockScroll = (e) => {
            // Allow scrolling inside the dropdown itself
            if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
            e.preventDefault();
        };
        document.addEventListener('wheel', blockScroll, { passive: false });
        document.addEventListener('touchmove', blockScroll, { passive: false });

        return () => {
            html.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            if (scrollContainer) scrollContainer.style.overflow = '';
            document.removeEventListener('wheel', blockScroll);
            document.removeEventListener('touchmove', blockScroll);
        };
    }, [isFocused, isClosing, isModalVariant]);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                inputRef.current &&
                !inputRef.current.contains(event.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target)
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

        if (inputValue.trim()) {
            const text = inputValue.trim();
            setRecentSearches(prev => {
                const next = [text, ...prev.filter(t => typeof t === 'string' ? t !== text : t.id !== text)].slice(0, 5);
                localStorage.setItem('recentSearches', JSON.stringify(next));
                return next;
            });
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
        if (text) {
            setRecentSearches(prev => {
                const next = [text, ...prev.filter(t => typeof t === 'string' ? t !== text : t.id !== text)].slice(0, 5);
                localStorage.setItem('recentSearches', JSON.stringify(next));
                return next;
            });
        }

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

    const overlayEl = !isModalVariant && typeof document !== 'undefined' ? document.body : null;

    // Get the bottom position of the navbar for the fixed dropdown
    const [dropdownTop, setDropdownTop] = React.useState(72);
    React.useEffect(() => {
        if (isFocused && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Find the navbar container (go up to find the fixed navbar bar)
            let el = triggerRef.current.parentElement;
            while (el && !el.classList.contains('fixed')) el = el.parentElement;
            const navBottom = el ? el.getBoundingClientRect().bottom : rect.bottom + 12;
            setDropdownTop(navBottom + 12);
        }
    }, [isFocused]);

    return (
        <>
            {/* Soft dark backdrop overlay — desktop only; sits below dropdown (z-400) but above page content */}
            {overlayEl && (isFocused || isClosing) && createPortal(
                <div
                    className={`hidden md:block fixed inset-0 bg-[#222222]/50 backdrop-blur-sm transition-opacity duration-200 ${
                        isClosing ? 'opacity-0' : 'opacity-100'
                    }`}
                    style={{ zIndex: 160 }}
                    onMouseDown={(e) => e.preventDefault()}
                />,
                overlayEl
            )}
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
                                    <div className={`relative group h-[58px] sm:h-[44px] sm:min-h-[40px] border rounded-full transition-all duration-300 ${isFocused
                                        ? 'bg-white dark:bg-dashboard-card border-transparent shadow-none'
                                        : 'bg-white dark:bg-dashboard-card sm:bg-[#F9FAFC] dark:sm:bg-dashboard-card/80 border-gray-200 dark:border-white/10 sm:border-primary-500/30'
                                        }`} style={{ transition: 'all 0.3s ease' }}>
                                        {!isFocused && (
                                            <div className="absolute inset-y-0 left-0 pl-6 sm:pl-4 flex items-center pointer-events-none z-10">
                                                <BsSearch className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            ref={triggerRef}
                                            onClick={handleFocus}
                                            className={`w-full h-full pr-12 sm:pr-[3.25rem] text-[15px] sm:text-[14px] font-normal text-left text-gray-700 dark:text-white outline-none border-none focus:ring-0 rounded-full cursor-pointer flex items-center transition-all duration-300 ${isFocused 
                                                ? 'bg-white dark:bg-dashboard-card pl-6 sm:pl-5' 
                                                : 'bg-white dark:bg-dashboard-card sm:bg-[#F9FAFC] dark:sm:bg-dashboard-card/80 pl-16 sm:pl-12'}`}
                                        >
                                            <span className={inputValue ? 'text-gray-700 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
                                                {inputValue || "Search properties & filters"}
                                            </span>
                                        </button>

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
                                            {!isFocused && (
                                                <button
                                                    onClick={handleSearch}
                                                    className="hidden sm:flex w-9 h-9 items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-all duration-200 active:scale-95"
                                                >
                                                    <BsSearch className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Two-Column Search Dropdown — portalled to body with fixed positioning to align with navbar */}
                                    {overlayEl && (isFocused || isClosing) && createPortal(
                                        <div
                                            ref={dropdownRef}
                                            onMouseDown={(e) => {
                                                if (e.target.tagName !== 'INPUT') {
                                                    e.preventDefault();
                                                }
                                            }}
                                            style={{ top: dropdownTop }}
                                            className={`fixed left-6 right-6 md:left-12 md:right-12 lg:left-20 lg:right-20 bg-white rounded-[24px] overflow-hidden z-[500] pointer-events-auto flex flex-row h-[550px] border border-gray-100 shadow-[0_12px_40px_rgb(0,0,0,0.12)] ${
                                                isClosing 
                                                    ? 'transition-all duration-200 ease-in opacity-0 translate-y-6 scale-[0.98]' 
                                                    : 'animate-in fade-in slide-in-from-bottom-8 duration-300 ease-out'
                                            }`}
                                        >
                                            {/* Left Column: Search + Suggestions */}
                                            <div className="w-[40%] flex-shrink-0 flex flex-col bg-transparent">
                                                {/* Search Input at the top of the Column */}
                                                <div className="px-6 pt-6 pb-0 bg-transparent">
                                                    <div className="relative flex items-center bg-gray-100/80 rounded-full px-5 py-3 border border-transparent focus-within:border-gray-300 transition-all">
                                                        <BsSearch className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                                                        <input
                                                            ref={inputRef}
                                                            type="text"
                                                            value={inputValue}
                                                            onChange={(e) => setInputValue(e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                            placeholder="Type BTS/MRT, address or paste URL..."
                                                            className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-500 outline-none border-none p-0 focus:ring-0"
                                                        />
                                                        {inputValue && (
                                                            <button
                                                                type="button"
                                                                onClick={handleClear}
                                                                className="p-1 rounded-full text-gray-400 hover:text-gray-700 transition-colors"
                                                            >
                                                                <XMarkIcon className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="px-6 pb-6 pt-4 flex-1 overflow-y-auto custom-scrollbar">
                                                    {inputValue ? (
                                                        <div className="space-y-3">
                                                            {isSearching ? (
                                                                // Premium Shimmering Lazy Loading Skeletons
                                                                Array.from({ length: 4 }).map((_, index) => (
                                                                    <div key={index} className="flex items-center gap-4 p-2 animate-pulse">
                                                                        <div className="w-14 h-14 rounded-md bg-gray-200/60 dark:bg-white/10 flex-shrink-0" />
                                                                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                                                                            <div className="h-3.5 bg-gray-200/60 dark:bg-white/10 rounded-md w-3/4" />
                                                                            <div className="h-3 bg-gray-200/60 dark:bg-white/10 rounded-md w-1/3" />
                                                                            <div className="h-2.5 bg-gray-200/60 dark:bg-white/10 rounded-md w-1/2" />
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : searchResults.length > 0 ? (
                                                                searchResults.map(listing => {
                                                                    const safeMedia = listing.media || [];
                                                                    const featuredImage = getMediaUrl(safeMedia.find((m) => m.type === 'image')?.url);
                                                                    return (
                                                                        <Link 
                                                                            key={listing.id} 
                                                                            to={`/listings/${listing.id}`} 
                                                                            onClick={() => handleResultClick(listing)}
                                                                            className="flex items-center gap-4 p-2 transition-all group"
                                                                        >
                                                                            <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                                                                                <img 
                                                                                    src={featuredImage || '/placeholder.jpg'} 
                                                                                    alt={listing.title} 
                                                                                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-2" 
                                                                                />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                                                <h4 className="text-[13px] font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-300" title={listing.title}>
                                                                                    {listing.title?.split(' ').length > 10 ? listing.title.split(' ').slice(0, 10).join(' ') + '...' : listing.title}
                                                                                </h4>
                                                                                <p className="text-[12px] text-gray-600 mt-0.5 font-medium group-hover:text-gray-900 transition-colors duration-300">฿{formatPrice(listing.price)} {listing.listing_type === 'rent' ? '/ month' : ''}</p>
                                                                                <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                                                                                    <span>{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms || '-'} Bed`}</span>
                                                                                    <span>·</span>
                                                                                    <span>{listing.bathrooms || '-'} Bath</span>
                                                                                    <span>·</span>
                                                                                    <span>{listing.area || '-'} Sqm</span>
                                                                                    {listing.status && (
                                                                                        <>
                                                                                            <span>·</span>
                                                                                            <span className="capitalize">{listing.status.replace('_', ' ')}</span>
                                                                                        </>
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                        </Link>
                                                                    );
                                                                })
                                                            ) : (
                                                                <p className="text-sm text-gray-500 text-center py-4">No properties match your search.</p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-6">
                                                            {recentSearches.length > 0 && (
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center justify-between px-2">
                                                                        <h3 className="text-[13px] font-semibold text-gray-500">Recent searches</h3>
                                                                        <button 
                                                                            onClick={() => {
                                                                                setRecentSearches([]);
                                                                                localStorage.removeItem('recentSearches');
                                                                            }}
                                                                            className="text-[11px] text-gray-400 hover:text-primary-600 transition-colors"
                                                                        >
                                                                            Clear
                                                                        </button>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        {recentSearches.map((text, idx) => {
                                                                            const displayText = typeof text === 'string' ? text : (text.title || '');
                                                                            if (!displayText) return null;
                                                                            return (
                                                                                <button 
                                                                                    key={`recent-${idx}`} 
                                                                                    onClick={() => handleSuggestionClick(displayText, null)}
                                                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full hover:bg-gray-100 text-left transition-all group"
                                                                                >
                                                                                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                    </svg>
                                                                                    <span className="text-[14px] text-gray-700 font-normal group-hover:text-gray-900 transition-colors">{displayText}</span>
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="space-y-2">
                                                                <h3 className="text-[13px] font-semibold text-gray-500 px-2 mb-3">Suggestions</h3>
                                                                <div className="space-y-1">
                                                                    {QUICK_SUGGESTIONS.map(({ icon: Icon, label, tag }) => (
                                                                        <button
                                                                            key={tag}
                                                                            type="button"
                                                                            onMouseDown={() => handleSuggestionClick(label, tag)}
                                                                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-full hover:bg-gray-100 text-left transition-all group"
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <Icon className="w-5 h-5 text-gray-500 group-hover:text-gray-900 transition-colors" />
                                                                                <span className="text-[15px] sm:text-[13px] text-gray-700 font-normal group-hover:text-gray-900 transition-colors">{label}</span>
                                                                            </div>
                                                                            <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-all -translate-x-1 group-hover:translate-x-0" />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right Column: Transit Map */}
                                            <div className="w-[60%] min-w-0 bg-transparent relative flex flex-col overflow-hidden p-6">
                                                {/* Close button — top-right of map column */}
                                                <button
                                                    type="button"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        if (isFocused && !isClosing) {
                                                            setIsClosing(true);
                                                            setTimeout(() => {
                                                                setIsFocused(false);
                                                                setIsClosing(false);
                                                                if (inputRef.current) inputRef.current.blur();
                                                            }, 150);
                                                        }
                                                    }}
                                                    className="absolute top-4 right-4 z-[600] flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full bg-gray-900/90 hover:bg-gray-900 text-white text-[11px] font-medium shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 hover:scale-105 backdrop-blur-sm"
                                                    aria-label="Close search"
                                                >
                                                    <XMarkIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                                                    <span>Close</span>
                                                </button>

                                                <div className="flex-1 w-full h-full rounded-[16px] overflow-hidden relative">
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
                                        </div>,
                                        overlayEl
                                    )}
                                </div>

                                {/* Filters — now right after search box; honors isFocused (hidden when searching) */}
                                {!isFocused && (
                                    <>
                                    <div className={`h-[44px] flex items-center flex-shrink-0 ml-4 ${isGoogleMapOpen ? 'hidden md:flex' : 'flex'}`}>
                                        <button
                                            type="button"
                                            onClick={onOpenFilters}
                                            className="h-[44px] min-w-[90px] lg:min-w-0 lg:w-[26px] lg:justify-center xl:min-w-[90px] xl:px-1 xl:gap-2 flex items-center gap-1.5 pl-1 pr-1 rounded-full flex-shrink-0
                                              transition-all duration-300 ease-out
                                              bg-white dark:bg-dashboard-card sm:bg-[#F9FAFC] dark:sm:bg-dashboard-card/80
                                              hover:bg-white dark:hover:bg-dashboard-hover sm:hover:bg-white
                                              border border-gray-200 dark:border-white/10 sm:border-primary-500/30
                                              hover:border-[#222222] dark:hover:border-white/40
                                              hover:shadow-md hover:-translate-y-[1px]
                                              active:scale-[0.98]
                                              focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2
                                              relative group"
                                            aria-label="Filters"
                                        >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 relative ${activeFilterCount > 0 ? 'bg-transparent' : 'bg-transparent'}`}>
                                                    <AdjustmentsHorizontalIcon className={`text-gray-800 dark:text-white w-[22px] h-[22px]`} />
                                                    {activeFilterCount > 0 && (
                                                        <span className="absolute -top-[3px] -right-[3px] min-w-[14px] h-[14px] px-0.5 flex items-center justify-center rounded-full bg-primary-600 text-white text-[9px] font-semibold border-2 border-white shadow-md leading-none">
                                                            {activeFilterCount > 99 ? '99+' : activeFilterCount}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[12.5px] font-semibold text-[#222222] dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors lg:hidden xl:inline">Filters</span>
                                            </button>
                                        </div>

                                    {/* Rent / Sale Segmented Control */}
                                    {onListingTypeChange && (
                                        <div
                                            ref={rsContainerRef}
                                            className="hidden md:flex h-[44px] items-center p-1 rounded-full flex-shrink-0 ml-3
                                          bg-white dark:bg-dashboard-card sm:bg-[#F9FAFC] dark:sm:bg-dashboard-card/80
                                          border border-gray-200 dark:border-white/10 sm:border-primary-500/30
                                          hover:border-[#222222] dark:hover:border-white/40
                                          hover:shadow-md hover:-translate-y-[1px]
                                          transition-all duration-300 ease-out
                                          relative">
                                            {/* Sliding pill — width & left driven by measured button rect */}
                                            <div
                                                className="absolute top-1 bottom-1 rounded-full bg-primary-600 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                                                style={{ width: rsPillStyle.width, left: rsPillStyle.left }}
                                            />
                                            <button
                                                ref={rentBtnRef}
                                                type="button"
                                                onClick={() => onListingTypeChange('rent')}
                                                className={`relative z-10 flex items-center justify-center h-full px-4 rounded-full text-[12.5px] font-bold whitespace-nowrap transition-colors duration-300 focus:outline-none active:scale-95 ${
                                                    listingType !== 'sale'
                                                        ? 'text-white'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                For Rent
                                            </button>
                                            <button
                                                ref={saleBtnRef}
                                                type="button"
                                                onClick={() => onListingTypeChange('sale')}
                                                className={`relative z-10 flex items-center justify-center h-full px-4 rounded-full text-[12.5px] font-bold whitespace-nowrap transition-colors duration-300 focus:outline-none active:scale-95 ${
                                                    listingType === 'sale'
                                                        ? 'text-white'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                For Sale
                                            </button>
                                        </div>
                                    )}

                                    {/* Map / List View Segmented Control — hidden on mobile */}
                                    {showMapToggle && onToggleMapView && (
                                        <div className="hidden md:flex h-[44px] items-center p-1 rounded-full flex-shrink-0 ml-3
                                          bg-white dark:bg-dashboard-card sm:bg-[#F9FAFC] dark:sm:bg-dashboard-card/80
                                          border border-gray-200 dark:border-white/10 sm:border-primary-500/30
                                          hover:border-[#222222] dark:hover:border-white/40
                                          hover:shadow-md hover:-translate-y-[1px]
                                          transition-all duration-300 ease-out
                                          relative">
                                            {/* Sliding pill background */}
                                            <div
                                                className="absolute top-1 bottom-1 rounded-full bg-primary-600 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                                                style={{
                                                    width: 'calc(50% - 4px)',
                                                    left: '4px',
                                                    transform: isGoogleMapOpen ? 'translateX(100%)' : 'translateX(0)',
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => !isMapTransitioning && onToggleMapView(false)}
                                                disabled={isMapTransitioning}
                                                className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 h-full px-4 rounded-full text-[12.5px] font-bold transition-colors duration-300 focus:outline-none active:scale-95 ${
                                                    !isGoogleMapOpen
                                                        ? 'text-white'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                                </svg>
                                                <span>List</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => !isMapTransitioning && onToggleMapView(true)}
                                                disabled={isMapTransitioning}
                                                className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 h-full px-4 rounded-full text-[12.5px] font-bold transition-colors duration-300 focus:outline-none active:scale-95 ${
                                                    isGoogleMapOpen
                                                        ? 'text-white'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                <MapIcon className="w-[18px] h-[18px]" />
                                                <span>Map</span>
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
