import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import { createPortal } from 'react-dom';
import { useSearchParams, useOutletContext, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { saveListing, unsaveListing } from '../../services/savedListingsApi';
import { useTenant } from '../../contexts/TenantContext';
import { publicApi } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import ListingCard from '../../components/Listings/ListingCard';
import CollectionBar from '../../components/Listings/CollectionBar';
import GoogleMap from '../../components/Listings/GoogleMap';
import TransitMapFilter from '../../components/TransitMap/TransitMapFilter';
import TransitFilterModal from '../../components/TransitMap/TransitFilterModal';
import StyledSelect from '../../components/Form/StyledSelect';
import ShowcaseBanners from '../../components/Common/ShowcaseBanners';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ListingDetailModal from '../../components/Listings/ListingDetailModal';
import FilterBar from '../../components/ui/FilterBar';
import ListingSkeleton from '../../components/ui/ListingSkeleton';
import PriceRangeSlider from '../../components/ui/PriceRangeSlider';
import SizeRangeSlider from '../../components/ui/SizeRangeSlider';
import FilterCard from '../../components/ui/FilterCard';
import FilterPill from '../../components/ui/FilterPill';
import { FilterIcons } from '../../utils/IconMap';
import ScrollableFilterList from '../../components/ui/ScrollableFilterList';
import RoomStepperRow from '../../components/ui/RoomStepperRow';
import { getMediaUrl } from '../../utils/media';

import {
    AdjustmentsHorizontalIcon,
    Squares2X2Icon,
    ListBulletIcon,
    MapIcon,
    MapPinIcon,
    XMarkIcon,
    HeartIcon,
    BuildingOfficeIcon,
    BuildingOffice2Icon,
    GlobeAltIcon,
    SparklesIcon,
    ArrowUpIcon,
    TagIcon,
    BanknotesIcon,
    KeyIcon,
    HomeIcon,
    ChevronLeftIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { BsSearch } from 'react-icons/bs';

import {
    CheckCircleIcon,
    HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid';
import { TbMapSearch } from "react-icons/tb";
import { LuTextSearch } from "react-icons/lu";
import Logo from '../../components/Common/Logo';

// Static Options moved outside to prevent recreation
// Module-level cache to preserve list state and scroll position across navigations
// on the same browser tab without relying on heavy global context.
export let globalListCache = null;
const propertyTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'condo', label: 'Condo' },
    { value: 'house', label: 'House' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'land', label: 'Land' },
];

const listingTypeOptions = [
    { value: '', label: 'Sale & Rent' },
    { value: 'sale', label: 'For Sale' },
    { value: 'rent', label: 'For Rent' },
];

const bathroomOptions = [
    { value: '', label: 'Any' },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
    { value: '5', label: '5+' },
    { value: '6', label: '6+' },
    { value: '7', label: '7+' },
];

const bedroomOptions = [
    { value: '', label: 'Any' },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
    { value: '5', label: '5+' },
    { value: '6', label: '6+' },
    { value: '7', label: '7+' },
];

const formatPrice = (p) => p ? `${parseInt(p).toLocaleString()}` : '';

const getSelectedOption = (options, value) => {
    if (!options || !value) return null;
    return options.find(opt => opt.value === value) || null;
};

const ListingsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { agent, actual_min_price, actual_max_price, isMainDomain } = useTenant();
    const { theme } = useTheme();
    const outletContext = useOutletContext() || {};
    const { navVisible, filterBarSlot, isScrolled: layoutScrolled, mobileBottomNavVisible, setMobileBottomNavVisible } = outletContext;
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const [savedListingIds, setSavedListingIds] = useState([]);
    
    // Synchronously check cache before any hooks to use in initial state
    const currentPathPlusSearch = location.pathname + location.search;
    const isCacheValidSync = globalListCache && globalListCache.url === currentPathPlusSearch;

    const [listings, setListings] = useState(() => {
        if (isCacheValidSync && globalListCache?.listings) return globalListCache.listings;
        return [];
    });
    const [total, setTotal] = useState(() => {
        if (isCacheValidSync && globalListCache?.total) return globalListCache.total;
        return 0;
    });
    const [page, setPage] = useState(() => {
        if (isCacheValidSync && globalListCache?.page) return globalListCache.page;
        return 1;
    });
    const [initialLoading, setInitialLoading] = useState(() => {
        if (isCacheValidSync) return false;
        return true;
    });
    
    const [mapCenter, setMapCenter] = useState(() => {
        if (isCacheValidSync && globalListCache?.mapCenter) return globalListCache.mapCenter;
        // Default to Bangkok center for new sessions to ensure map initializes and reports bounds
        return { lat: 13.7563, lng: 100.5018 };
    });
    const [mapZoom, setMapZoom] = useState(() => {
        if (isCacheValidSync && globalListCache?.mapZoom) return globalListCache.mapZoom;
        return 12; // Default zoom level for initial load
    });
    const [mapBounds, setMapBounds] = useState(() => {
        if (isCacheValidSync && globalListCache?.mapBounds) return globalListCache.mapBounds;
        return null;
    });

    const [loading, setLoading] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [pendingTotal, setPendingTotal] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const observerTarget = useRef(null);
    const stateCacheRef = useRef({ listings: [], page: 1, total: 0, searchParamsString: '' });
    const scrollPositionRef = useRef(0);
    const hasRestoredScrollRef = useRef(false);
    
    // Initialize lastFetchedParamsRef synchronously if cache is valid
    const lastFetchedParamsRef = useRef(() => {
        if (isCacheValidSync && globalListCache) {
            const filterParams = {};
            const keys = ['type', 'listing_type', 'min_price', 'max_price', 'bedrooms', 'bathrooms', 'station_id', 'max_distance_to_station', 'developer_id', 'project_id', 'search', 'min_area', 'max_area'];
            const savedFilters = JSON.parse(localStorage.getItem('listing_filters') || '{}');
            keys.forEach(k => {
                filterParams[k] = searchParams.get(k) || savedFilters[k] || '';
            });

            const params = { ...filterParams, page: globalListCache.page, limit: 12 };

            if (globalListCache.mapBounds && localStorage.getItem('show_google_map') === 'true') {
                params.min_lat = globalListCache.mapBounds.min_lat;
                params.max_lat = globalListCache.mapBounds.max_lat;
                params.min_lng = globalListCache.mapBounds.min_lng;
                params.max_lng = globalListCache.mapBounds.max_lng;
            }
            return JSON.stringify(params);
        }
        return null;
    });
    const lastFetchedBoundsRef = useRef(null); // The actual bounds used in the last buffered fetch
    const hasFullResultsForLastBoundsRef = useRef(false); // Whether the last buffered fetch returned ALL items in that area
    const currentFetchIdRef = useRef(0); // For race condition handling and interaction locks

    const [isScrolledPastMap, setIsScrolledPastMap] = useState(false);
    const [isMobileSheetExpanded, setIsMobileSheetExpanded] = useState(false);
    const [isNavVisible, setIsNavVisible] = useState(false);
    const [mapOverlayOpacity, setMapOverlayOpacity] = useState(0);
    const scrollContainerRef = useRef(null);
    const lastMobileMapScrollRef = useRef(0);



    const lastFetchedParamsStateRef = useRef(null);
    useEffect(() => {
        if (typeof lastFetchedParamsRef.current === 'function') {
            lastFetchedParamsRef.current = lastFetchedParamsRef.current();
        }
    }, []); // Map bounds for geographic filtering
    

    // Track state for caching on unmount
    useEffect(() => {
        stateCacheRef.current = {
            listings,
            page,
            total,
            searchParamsString: searchParams.toString(),
            mapBounds,
            mapCenter,
            mapZoom
        };
    }, [listings, page, total, searchParams, mapBounds, mapCenter, mapZoom]);

    // Track scroll position continuously
    useEffect(() => {
        const handleScroll = () => {
            // We track both window and container to be safe, preferring the non-zero one
            const container = document.getElementById('main-scroll-container');
            const winScroll = typeof window !== 'undefined' ? window.scrollY : 0;
            const contScroll = container ? container.scrollTop : 0;

            // Update ref with current scroll - prefer window scroll for main page
            scrollPositionRef.current = winScroll > 0 ? winScroll : contScroll;
        };

        // Listen on both targets
        window.addEventListener('scroll', handleScroll, { passive: true });
        const container = document.getElementById('main-scroll-container');
        if (container) container.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (container) container.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Save cache on unmount
    useEffect(() => {
        const currentUrl = window.location.pathname + window.location.search;
        return () => {
            // Save state even if listings haven't loaded yet? 
            // Better to only save if we have some data to restore.
            if (stateCacheRef.current.listings.length > 0) {
                globalListCache = {
                    ...stateCacheRef.current,
                    url: currentUrl,
                    timestamp: Date.now(),
                    scrollY: scrollPositionRef.current
                };
            }
        };
    }, []);

    // Restore scroll position once data is mounted from cache
    // Use useLayoutEffect to perform restoration BEFORE paint, avoiding the "start from start" flash.
    React.useLayoutEffect(() => {
        if (isCacheValidSync && globalListCache && !hasRestoredScrollRef.current && listings.length > 0) {
            const pos = globalListCache.scrollY;
            if (pos > 0) {
                // Restoration should be instant to avoid visible scrolling
                window.scrollTo({ top: pos, behavior: 'instant' });
                const container = document.getElementById('main-scroll-container');
                if (container) {
                    container.scrollTo({ top: pos, behavior: 'instant' });
                }
                hasRestoredScrollRef.current = true;
            }
        }
    }, [isCacheValidSync, listings.length]);

    // Modal States

    const [isGoogleMapOpen, setIsGoogleMapOpen] = useState(() => {
        // 1. First, respect the user's explicit saved preference if it exists
        const savedPreference = localStorage.getItem('preferredView');
        if (savedPreference) {
            return savedPreference === 'map';
        }
        // 2. Fallback to URL params if no saved preference
        const urlView = searchParams.get('view');
        if (urlView) return urlView === 'map';

        // 3. Default state (List mode)
        return false;
    });

    // Helper to safely update listings without duplication and prune remote markers
    const updateListingsUnique = useCallback((newItems, replace = false, currentBounds = null) => {
        setListings(prev => {
            if (replace) return newItems;
            
            // To ensure markers always appear, we skip pruning for now
            let baseList = prev;
            /* if (currentBounds && isGoogleMapOpen) {
                ... pruning logic ...
            } */

            // Deduplicate based on listing ID
            const existingIds = new Set(baseList.map(item => String(item.id)));
            const uniqueNew = (newItems || []).filter(item => item && item.id && !existingIds.has(String(item.id)));
            
            return [...baseList, ...uniqueNew];
        });
    }, [isGoogleMapOpen]);
    const [isTransitModalOpen, setIsTransitModalOpen] = useState(false);
    const [listHoveredListingId, setListHoveredListingId] = useState(null);
    const [selectedListingId, setSelectedListingId] = useState(null);
    const [sheetOffset, setSheetOffset] = useState(48); // Percentage from top (48% = 52vh visible)
    const [showMapButton, setShowMapButton] = useState(false);

    const isMapView = searchParams.get('view') === 'map' || (!searchParams.get('view') && localStorage.getItem('preferredView') === 'map');

    const [isMapListExpanded, setIsMapListExpanded] = useState(() => {
        return localStorage.getItem('isMapListExpanded') === 'true';
    });
    const [isMapRefetching, setIsMapRefetching] = useState(false);

    const initialHeight = React.useRef(window.visualViewport ? window.visualViewport.height : window.innerHeight);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    React.useEffect(() => {
        const handleViewportChange = () => {
            const viewport = window.visualViewport;
            if (!viewport) return;
            // Detect if height dropped by more than 150px (typical keyboard height)
            const isKeyboardVisible = viewport.height < initialHeight.current - 150;
            setIsKeyboardOpen(isKeyboardVisible);
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportChange);
        } else {
            window.addEventListener('resize', handleViewportChange);
        }

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleViewportChange);
            } else {
                window.removeEventListener('resize', handleViewportChange);
            }
        };
    }, []);

    const handleSwitchToMap = () => {
        if (!isMapView) {
            const params = new URLSearchParams(location.search);
            params.set('view', 'map');
            setSearchParams(params);
        }
        setSheetOffset(92); // Collapse to tiny bar at the very bottom
        setIsMapListExpanded(false);
        localStorage.setItem('isMapListExpanded', 'false');
    };

    // Outdated scroll logic removed - now handled by handleUnifiedScroll


    // Swipe/Drag logic
    const [mapTouchStartY, setMapTouchStartY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const initialDragOffset = useRef(48);

    const handleMapTouchStart = (e) => {
        setMapTouchStartY(e.touches[0].clientY);
        setIsDragging(true);
        initialDragOffset.current = sheetOffset;
    };

    const handleMapTouchMove = (e) => {
        if (!isDragging) return;
        const touchCurrentY = e.touches[0].clientY;
        const deltaY = touchCurrentY - mapTouchStartY;
        const screenHeight = window.innerHeight;
        const deltaPercent = (deltaY / screenHeight) * 100;

        let newOffset = initialDragOffset.current + deltaPercent;
        // Constraints
        if (newOffset < 0) newOffset = 0;
        if (newOffset > 100) newOffset = 100;

        setSheetOffset(newOffset);
    };

    const handleMapTouchEnd = (e) => {
        setIsDragging(false);
        // Snap logic
        if (sheetOffset < 24) {
            setSheetOffset(0);
        } else if (sheetOffset < 70) {
            setSheetOffset(48);
        } else {
            setIsMapListExpanded(false);
            setSheetOffset(92); // Snaps to the collapsed state at the very bottom
        }
    };

    // Persist expansion state
    useEffect(() => {
        localStorage.setItem('isMapListExpanded', isMapListExpanded);
    }, [isMapListExpanded]);

    const expandedSheetRef = useRef(null);

    // Persist scroll position of the expanded sheet
    useEffect(() => {
        if (isMapListExpanded && expandedSheetRef.current) {
            const savedScroll = localStorage.getItem('mapListExpandedScroll');
            if (savedScroll) {
                expandedSheetRef.current.scrollTop = parseInt(savedScroll, 10);
            }
        }
    }, [isMapListExpanded, listings.length]); // Also trigger when listings load

    const lastScrollTop = useRef(0);
    const handleSheetScroll = (e) => {
        const currentScrollTop = e.target.scrollTop;
        const delta = currentScrollTop - lastScrollTop.current;

        if (isMapListExpanded) {
            // If the sheet is not at the very top (full screen), 
            // any attempt to scroll up within context should pull the sheet up first.
            if (sheetOffset > 0 && currentScrollTop > 0) {
                // Prevent content scrolling while we have offset to clear
                const screenHeight = window.innerHeight;
                const scrollDeltaPercent = (currentScrollTop / screenHeight) * 100;
                const newOffset = Math.max(0, sheetOffset - scrollDeltaPercent * 2); // Multiplier for faster "pull"
                setSheetOffset(newOffset);
                e.target.scrollTop = 0;
            } else if (sheetOffset === 0 && currentScrollTop <= 0 && delta < 0) {
                // At top of full screen and pulling down -> slide down to 48%
                setSheetOffset(48);
            }
            localStorage.setItem('mapListExpandedScroll', currentScrollTop);
        }
        lastScrollTop.current = currentScrollTop;
    };

    // Sync savedListingIds when list cards dispatch save status (so map markers stay in sync)
    useEffect(() => {
        const handler = (e) => {
            const { listingId, saved } = e.detail || {};
            if (!listingId) return;
            const id = String(listingId);
            setSavedListingIds((prev) =>
                saved ? (prev.some((sid) => String(sid) === id) ? prev : [...prev, id]) : prev.filter((sid) => String(sid) !== id)
            );
        };
        window.addEventListener('listing:saved-status-changed', handler);
        return () => window.removeEventListener('listing:saved-status-changed', handler);
    }, []);


    // Sync map view from URL when it changes (e.g. back/forward)
    useEffect(() => {
        const urlView = searchParams.get('view');
        if (urlView) {
            const toMap = urlView === 'map';
            if (toMap !== isGoogleMapOpen) {
                // Ensure we start at the top of the map design when switching to map
                if (toMap) {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                }
                setIsGoogleMapOpen(toMap);
                localStorage.setItem('preferredView', toMap ? 'map' : 'list');
            }
        } else {
            // If URL doesn't have view param, use localStorage or default to false
            const stored = localStorage.getItem('preferredView');
            if (stored) {
                const toMap = stored === 'map';
                if (toMap !== isGoogleMapOpen) {
                    setIsGoogleMapOpen(toMap);
                }
            } else if (isGoogleMapOpen) {
                // Default to list
                setIsGoogleMapOpen(false);
            }
        }
    }, [searchParams, isGoogleMapOpen]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state for Map View
    const [isSidebarClosing, setIsSidebarClosing] = useState(false); // For close animation
    const [sidebarAnimateIn, setSidebarAnimateIn] = useState(false); // Start off-screen for open animation
    const [isMapSidebarOpen, setIsMapSidebarOpen] = useState(false); // Sidebar state for Map Overlay
    const [isMapExpanded, setIsMapExpanded] = useState(false); // Map full-width (hide list) when true

    // Open sidebar filters when triggered from mobile nav search pill
    useEffect(() => {
        const mobileFilters = searchParams.get('mobile_filters');
        if (mobileFilters === '1') {
            setIsSidebarOpen(true);
            setSidebarAnimateIn(true);
            const next = new URLSearchParams(searchParams);
            next.delete('mobile_filters');
            setSearchParams(next);
        }
    }, [searchParams, setSearchParams]);

    // Open filter sidebar when navigating from Favorites with open_filters=1
    useEffect(() => {
        if (searchParams.get('open_filters') === '1') {
            setIsSidebarOpen(true);
            setSidebarAnimateIn(true);
            const next = new URLSearchParams(searchParams);
            next.delete('open_filters');
            setSearchParams(next, { replace: true });
        }
    }, [searchParams]);

    // Filter sidebar open animation: start off-screen then transition in
    useEffect(() => {
        if (isSidebarOpen && sidebarAnimateIn) {
            const t = requestAnimationFrame(() => {
                requestAnimationFrame(() => setSidebarAnimateIn(false));
            });
            return () => cancelAnimationFrame(t);
        }
    }, [isSidebarOpen, sidebarAnimateIn]);

    // Filter sidebar close animation: slide out then unmount
    const closeFilterSidebar = useCallback(() => setIsSidebarClosing(true), []);
    useEffect(() => {
        if (!isSidebarClosing) return;
        const t = setTimeout(() => {
            setIsSidebarOpen(false);
            setIsSidebarClosing(false);
        }, 300);
        return () => clearTimeout(t);
    }, [isSidebarClosing]);

    const [viewMode, setViewMode] = useState(() => localStorage.getItem('listings_view_mode') || 'grid');
    const [priceLimits, setPriceLimits] = useState({ min: 0, max: 100000000 });
    const [priceFormat, setPriceFormat] = useState('short');
    const [agentId, setAgentId] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [developers, setDevelopers] = useState([]);
    const [projectsList, setProjectsList] = useState([]);

    // Use a ref to track bounds to avoid redundant state updates in onBoundsChanged
    const lastBoundsRef = useRef(null);
    const prevMapBoundsRef = useRef(null);
    const fetchTriggeredByBoundsRef = useRef(false); // when true, skip fitBounds so map stays where user panned

    const handleMapBoundsChanged = React.useCallback((data) => {
        // Simple comparison to prevent identical bounds from triggering a reload
        const isSame = lastBoundsRef.current &&
            lastBoundsRef.current.min_lat === data.min_lat &&
            lastBoundsRef.current.max_lat === data.max_lat &&
            lastBoundsRef.current.min_lng === data.min_lng &&
            lastBoundsRef.current.max_lng === data.max_lng;

        if (!isSame) {
            lastBoundsRef.current = data;
            fetchTriggeredByBoundsRef.current = true; // Sync update to block fitBounds immediately
            setMapBounds(data);
            if (data.center) setMapCenter(data.center);
            if (data.zoom !== undefined) setMapZoom(data.zoom);
            setPage(1);
        }
    }, []);

    const handleMapSaveClick = React.useCallback(async (listingId, currentSaved) => {
        if (!user) {
            navigate('/login', { state: { from: { pathname: '/listings' } } });
            return;
        }
        const id = String(listingId);
        try {
            if (currentSaved) {
                await unsaveListing(id);
                setSavedListingIds((prev) => prev.filter((sid) => String(sid) !== id));
                window.dispatchEvent(new CustomEvent('listing:saved-status-changed', { detail: { listingId: id, saved: false } }));
            } else {
                await saveListing(id);
                setSavedListingIds((prev) => (prev.some((sid) => String(sid) === id) ? prev : [...prev, id]));
                window.dispatchEvent(new CustomEvent('listing:saved-status-changed', { detail: { listingId: id, saved: true } }));
            }
        } catch (err) {
            console.error('Save listing error:', err);
        }
    }, [user, navigate]);

    // Scroll listener for filter bar margin
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Save view mode selection
    useEffect(() => {
        localStorage.setItem('listings_view_mode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        localStorage.setItem('show_google_map', isGoogleMapOpen);
        // Only lock body scroll for the sidebar/filters drawer, NOT for the map view
        // because map view uses unified window scroll for the bottom sheet effect.
        const shouldLock = isSidebarOpen;
        document.body.style.overflow = shouldLock ? 'hidden' : '';
        document.documentElement.style.overflow = shouldLock ? 'hidden' : '';

        // Handle mobile nav visibility: hide on entry to map, but let scroll handle it thereafter
        if (isGoogleMapOpen && window.innerWidth < 1024) {
            const currentScroll = window.scrollY || 0;
            if (currentScroll <= 100) {
                setMobileBottomNavVisible?.(false);
                setIsNavVisible(false);
            }
        } else if (!isGoogleMapOpen) {
            setMobileBottomNavVisible?.(true);
            setIsNavVisible(true);
        }

        return () => { 
            document.body.style.overflow = ''; 
            document.documentElement.style.overflow = '';
        };
    }, [isGoogleMapOpen, isSidebarOpen, setMobileBottomNavVisible]);

    const handleUnifiedScroll = useCallback(() => {
        if (!isGoogleMapOpen || window.innerWidth >= 1024) return;
        const currentScroll = window.scrollY;
        const threshold = 180;
        const navShowThreshold = 100;
        const navHideThresholdDeep = 450;

        // Use scroll position to track expansion state
        setIsMobileSheetExpanded(currentScroll > navShowThreshold);

        // If scrolling the list up significantly, clear selection
        if (selectedListingId && currentScroll > 150) {
            setSelectedListingId(null);
        }

        // Calculate overlay opacity (max 0.6)
        // Starts fading in after 20px, reaches max at threshold
        const opacity = Math.min(0.6, Math.max(0, (currentScroll - 20) / threshold));
        setMapOverlayOpacity(opacity);

        // Manage isScrolledPastMap state
        if (currentScroll > threshold && !isScrolledPastMap) {
            setIsScrolledPastMap(true);
        } else if (currentScroll <= threshold && isScrolledPastMap) {
            setIsScrolledPastMap(false);
        }

        // Manage Mobile Bottom Nav visibility
        const isScrollingUpContent = currentScroll > lastMobileMapScrollRef.current; // Swiping UP = seeing more content below
        const scrollDelta = Math.abs(currentScroll - lastMobileMapScrollRef.current);

        if (currentScroll > navShowThreshold) {
            if (currentScroll < navHideThresholdDeep) {
                // Header/Initial list zone - Always show nav bar
                setMobileBottomNavVisible?.(true);
                setIsNavVisible(true);
            } else {
                // Deeper in the list - Direction aware
                if (isScrollingUpContent && scrollDelta > 10) {
                    setMobileBottomNavVisible?.(false);
                    setIsNavVisible(false);
                } else if (!isScrollingUpContent && scrollDelta > 10) {
                    setMobileBottomNavVisible?.(true);
                    setIsNavVisible(true);
                }
            }
        } else {
            // Back to map view - Hide nav bar
            setMobileBottomNavVisible?.(false);
            setIsNavVisible(false);
        }

        // Essential: Update the ref for next scroll iteration
        lastMobileMapScrollRef.current = currentScroll;
    }, [isGoogleMapOpen, isScrolledPastMap, isMobileSheetExpanded, selectedListingId, mapOverlayOpacity, setMobileBottomNavVisible]);

    useEffect(() => {
        if (isGoogleMapOpen && window.innerWidth < 1024) {
            window.addEventListener('scroll', handleUnifiedScroll, { passive: true });
            return () => window.removeEventListener('scroll', handleUnifiedScroll);
        }
    }, [isGoogleMapOpen, handleUnifiedScroll]);

    const toggleMobileSheet = () => {
        if (window.innerWidth >= 1024) return;

        const currentScroll = window.scrollY;
        const isAtBase = currentScroll < 100;

        // Always clear marker preview when interacting with the handle
        setSelectedListingId(null);

        if (isAtBase) {
            // Click to expand slightly higher
            const target = (window.innerHeight * 0.42);
            window.scrollTo({ top: target, behavior: 'smooth' });
        } else {
            // Click to scroll back to base position
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const scrollToMap = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleMapView = (isOpen) => {
        if (isOpen === isGoogleMapOpen) return;

        // Reset scroll position to top when switching views
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Persist the user's explicit choice
        localStorage.setItem('preferredView', isOpen ? 'map' : 'list');

        const newParams = new URLSearchParams(searchParams);
        if (isOpen) {
            newParams.set('view', 'map');
        } else {
            newParams.delete('view');
            setIsMapListExpanded(false); // Reset bottom sheet when returning to normal list
        }

        setSearchParams(newParams);
        setIsGoogleMapOpen(isOpen);

        // Hide bottom nav immediately when opening map
        if (isOpen && window.innerWidth < 1024) {
            setMobileBottomNavVisible?.(false);
        } else {
            setMobileBottomNavVisible?.(true);
        }
    };

    const [stations, setStations] = useState([]);
    const [flatStations, setFlatStations] = useState([]); // Flat options for StyledSelect
    const [stationsLoaded, setStationsLoaded] = useState(false);
    const [transitSearchTerm, setTransitSearchTerm] = useState('');
    const [showTransitResults, setShowTransitResults] = useState(false);
    const transitSearchRef = useRef(null);

    // Unified Data Fetching
    useEffect(() => {
        const fetchAgentInfo = async () => {
            try {
                let urlAgentId = searchParams.get('agent_id') || searchParams.get('agent');
                if (!urlAgentId && window.location.hostname.includes('localhost') && user?.agent_id) {
                    urlAgentId = user.agent_id;
                }
                const response = await publicApi.getAgentInfo(urlAgentId ? { agent_id: urlAgentId } : {});
                setPriceLimits({
                    min: parseFloat(response.data.min_price_limit) || 0,
                    max: parseFloat(response.data.max_price_limit) || 0
                });
                if (response.data.price_format) setPriceFormat(response.data.price_format);
                setAgentId(urlAgentId || response.data.id);
            } catch (error) {
                console.error('Failed to fetch agent info:', error);
            }
        };

        fetchAgentInfo();
    }, [searchParams, user]);

    // Fetch stations once on mount (stations don't change based on URL params)
    useEffect(() => {
        const fetchStationsData = async () => {
            try {
                const response = await publicApi.getStations();
                const fetchedStations = response.data.stations || [];
                setStations(fetchedStations); // Flat list for header search

                // Flat options for StyledSelect (avoids react-select grouped options crash)
                const flat = (fetchedStations || []).map(station => ({
                    value: station.id,
                    label: station.name_en,
                    line_name: station.line_name,
                    line_color: station.line_color
                }));
                setFlatStations(flat);
                setStationsLoaded(true);
            } catch (error) {
                console.error('Failed to fetch stations:', error);
            }
        };
        fetchStationsData();
    }, []); // Fetch stations only once on mount

    // Fetch Developers and Projects for Advanced Filter
    useEffect(() => {
        const fetchAdvancedFilterData = async () => {
            try {
                const [devRes, projRes] = await Promise.all([
                    publicApi.getDevelopers(),
                    publicApi.getProjects({ limit: 100 }) // Fetch enough projects for the dropdown
                ]);
                setDevelopers(devRes.data.developers || []);
                setProjectsList(projRes.data.projects || []);
            } catch (error) {
                console.error('Failed to fetch advanced filter data:', error);
            }
        };
        fetchAdvancedFilterData();
    }, []);

    // Close search results on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (transitSearchRef.current && !transitSearchRef.current.contains(event.target)) {
                setShowTransitResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter states: filters = applied (triggers API); pendingFilters = sidebar draft (apply on button click)
    const [filters, setFilters] = useState(() => {
        const saved = JSON.parse(localStorage.getItem('listing_filters') || '{}');
        return {
            type: searchParams.get('type') || saved.type || '',
            listing_type: searchParams.get('listing_type') || saved.listing_type || '',
            min_price: searchParams.get('min_price') || saved.min_price || '',
            max_price: searchParams.get('max_price') || saved.max_price || '',
            bedrooms: searchParams.get('bedrooms') || saved.bedrooms || '',
            bathrooms: searchParams.get('bathrooms') || saved.bathrooms || '',
            station_id: searchParams.get('station_id') || saved.station_id || '',
            max_distance_to_station: searchParams.get('max_distance_to_station') || saved.max_distance_to_station || '',
            developer_id: searchParams.get('developer_id') || saved.developer_id || '',
            project_id: searchParams.get('project_id') || saved.project_id || '',
            search: searchParams.get('search') || saved.search || '',
            min_area: searchParams.get('min_area') || saved.min_area || '',
            max_area: searchParams.get('max_area') || saved.max_area || '',
        };
    });
    const [pendingFilters, setPendingFilters] = useState(() => ({ type: '', listing_type: '', min_price: '', max_price: '', bedrooms: '', bathrooms: '', station_id: '', max_distance_to_station: '', developer_id: '', project_id: '', search: '', min_area: '', max_area: '' }));
    const prevSidebarOpenRef = useRef(false);
    const skipNextUrlSyncRef = useRef(false);
    const [exitingChipKeys, setExitingChipKeys] = useState(new Set());

    const [searchTerm, setSearchTerm] = useState(filters.search);

    const FILTER_KEYS = ['type', 'listing_type', 'min_price', 'max_price', 'bedrooms', 'bathrooms', 'station_id', 'max_distance_to_station', 'developer_id', 'project_id', 'search', 'min_area', 'max_area'];
    const toSerializableFilters = (obj) => {
        const out = {};
        FILTER_KEYS.forEach(k => { out[k] = obj[k] != null && typeof obj[k] === 'string' ? obj[k] : (obj[k] != null ? String(obj[k]) : ''); });
        return out;
    };

    const listingTypeIconMap = { '': TagIcon, sale: BanknotesIcon, rent: KeyIcon };
    const propertyTypeIconMap = { '': Squares2X2Icon, condo: BuildingOffice2Icon, house: HomeIcon, townhouse: BuildingOfficeIcon, apartment: BuildingOffice2Icon, land: MapIcon };


    // Debounce search — apply quickly so data reloads feel instant; scroll to top when applied
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== filters.search) {
                handleFilterChange('search', searchTerm, true);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);
    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    // Sync filters with URL search params (e.g. browser back/forward). Skip when we just applied filters so we don't overwrite with stale URL.
    useEffect(() => {
        if (skipNextUrlSyncRef.current) {
            skipNextUrlSyncRef.current = false;
            return;
        }
        const params = new URLSearchParams(searchParams);
        const newFilters = {
            type: params.get('type') || '',
            listing_type: params.get('listing_type') || '',
            min_price: params.get('min_price') || '',
            max_price: params.get('max_price') || '',
            bedrooms: params.get('bedrooms') || '',
            bathrooms: params.get('bathrooms') || '',
            station_id: params.get('station_id') || '',
            max_distance_to_station: params.get('max_distance_to_station') || '',
            developer_id: params.get('developer_id') || '',
            project_id: params.get('project_id') || '',
            search: params.get('search') || '',
            min_area: params.get('min_area') || '',
            max_area: params.get('max_area') || '',
        };

        // Only update if filters have actually changed to avoid infinite loops
        const hasChanged = Object.keys(newFilters).some(key => newFilters[key] !== filters[key]);
        if (hasChanged) {
            setFilters(newFilters);
            setPendingFilters(newFilters);
            setPage(1);
        }
    }, [searchParams]);

    // When sidebar opens, sync pending filters from applied filters (and current searchTerm so inside/outside text match)
    useEffect(() => {
        if (isSidebarOpen && !prevSidebarOpenRef.current) {
            setPendingFilters({ ...filters, search: searchTerm });
            setPendingTotal(total); // show current count until background count returns
        }
        if (!isSidebarOpen) setPendingTotal(null);
        prevSidebarOpenRef.current = isSidebarOpen;
    }, [isSidebarOpen, filters, searchTerm, total]);

    // Background count when sidebar is open and pending filters change — no loading UI, list/map unchanged until "Show X properties"
    const countAbortRef = useRef(null);
    const pendingFiltersKey = useMemo(() => JSON.stringify(pendingFilters), [pendingFilters]);
    useEffect(() => {
        if (!isSidebarOpen) return;
        const timer = setTimeout(() => {
            const params = { ...pendingFilters, page: 1, limit: 1 };
            if (countAbortRef.current) countAbortRef.current.abort();
            const controller = new AbortController();
            countAbortRef.current = controller;
            publicApi.getListings(params, { signal: controller.signal })
                .then((res) => { setPendingTotal(res.data?.total ?? 0); })
                .catch((err) => { if (!axios.isCancel(err)) setPendingTotal(null); })
                .finally(() => { countAbortRef.current = null; });
        }, 400);
        return () => {
            clearTimeout(timer);
            if (countAbortRef.current) countAbortRef.current.abort();
        };
    }, [isSidebarOpen, pendingFiltersKey, user?.agent_id]);


    useEffect(() => {
        const prev = prevMapBoundsRef.current;
        const boundsJustChanged = isGoogleMapOpen && mapBounds && prev &&
            (Math.abs(prev.min_lat - mapBounds.min_lat) > 0.00001 || 
             Math.abs(prev.max_lat - mapBounds.max_lat) > 0.00001 ||
             Math.abs(prev.min_lng - mapBounds.min_lng) > 0.00001 || 
             Math.abs(prev.max_lng - mapBounds.max_lng) > 0.00001);
        
        fetchTriggeredByBoundsRef.current = !!boundsJustChanged;
        prevMapBoundsRef.current = mapBounds;
        const isBoundsTriggeredFetch = !!boundsJustChanged;

        const controller = new AbortController();
        const fetchListings = async () => {
            const params = { 
                ...filters, 
                page, 
                limit: isGoogleMapOpen ? 40 : 12
            };
            let bufferedBounds = null;

            if (mapBounds && isGoogleMapOpen) {
                // Buffer the request by 15% to allow small pans without re-fetching
                const latPadding = (mapBounds.max_lat - mapBounds.min_lat) * 0.15;
                const lngPadding = (mapBounds.max_lng - mapBounds.min_lng) * 0.15;
                
                bufferedBounds = {
                    min_lat: mapBounds.min_lat - latPadding,
                    max_lat: mapBounds.max_lat + latPadding,
                    min_lng: mapBounds.min_lng - lngPadding,
                    max_lng: mapBounds.max_lng + lngPadding
                };

                params.min_lat = bufferedBounds.min_lat;
                params.max_lat = bufferedBounds.max_lat;
                params.min_lng = bufferedBounds.min_lng;
                params.max_lng = bufferedBounds.max_lng;
            }

            // Client-side Buffer Check:
            // If we are in Map View and moving the screen, check if the new screen 
            // is still entirely within our last buffered fetch area AND we have all data for that area.
            if (isGoogleMapOpen && isBoundsTriggeredFetch && lastFetchedBoundsRef.current && hasFullResultsForLastBoundsRef.current) {
                const isContained = 
                    mapBounds.min_lat >= lastFetchedBoundsRef.current.min_lat &&
                    mapBounds.max_lat <= lastFetchedBoundsRef.current.max_lat &&
                    mapBounds.min_lng >= lastFetchedBoundsRef.current.min_lng &&
                    mapBounds.max_lng <= lastFetchedBoundsRef.current.max_lng;

                // Also check if filters other than bounds have changed
                const filtersKey = JSON.stringify(filters);
                const lastFiltersKey = lastFetchedParamsRef.current ? JSON.parse(lastFetchedParamsRef.current) : null;
                const filtersMatch = lastFiltersKey && JSON.stringify({ ...lastFiltersKey, min_lat: undefined, max_lat: undefined, min_lng: undefined, max_lng: undefined }) === 
                                                 JSON.stringify({ ...filters, min_lat: undefined, max_lat: undefined, min_lng: undefined, max_lng: undefined });

                if (isContained && filtersMatch) {
                    setIsMapRefetching(false);
                    setLoading(false);
                    return;
                }
            }

            // Check if we already have this data (e.g. just closing a detail modal)
            const currentParamsKey = JSON.stringify(params);

            // Bypass fetch if we already restored this exact state from cache
            if (isCacheValidSync && page === globalListCache.page) {
                lastFetchedParamsRef.current = currentParamsKey;
                setLoading(false);
                setInitialLoading(false);
                setIsMapRefetching(false);
                return;
            }

            if (lastFetchedParamsRef.current === currentParamsKey && listings.length > 0) {
                setLoading(false);
                setInitialLoading(false);
                setIsMapRefetching(false);
                return;
            }

            // Optimistic loading: If map is open but bounds aren't ready, wait.
            // This prevents "showing all properties" flash on reload in Map View.
            // Optimistic loading: If map is open but bounds aren't ready or valid, wait.
            // This prevents "showing all properties" flash on reload in Map View.
            const hasValidBounds = mapBounds && mapBounds.min_lat !== undefined;
            if (isGoogleMapOpen && !hasValidBounds) {
                // We MUST wait for the map to report bounds to prevent global results flash.
                // The map will report its bounds as soon as it initializes (using our default center if no cache).
                if (initialLoading) {
                    setLoading(true);
                    setInitialLoading(true);
                }
                return;
            }

            // Only show initial skeletons if we are on page 1
            if (page === 1) {
                // Avoid "flash" in map view OR during typing search.
                const isMapBoundsUpdate = isGoogleMapOpen && listings.length > 0;
                const isSearchTyped = searchTerm !== filters.search && listings.length > 0;

                if (!isMapBoundsUpdate && !isSearchTyped) {
                    setInitialLoading(true);
                    setListings([]); // Clear listings for fresh fetch on page 1
                } else if (isBoundsTriggeredFetch) {
                    setIsMapRefetching(true);
                    setInitialLoading(false);
                }
            }
            setLoading(true);

            try {
                // Artificial delays removed for speed as requested.
                // Batch fetch with minimal responsiveness gap.
                const response = await publicApi.getListings(params, { signal: controller.signal });

                const data = response.data;
                const newItems = data.listings || [];
                const limit = isGoogleMapOpen ? 40 : 12;

                // Stop loading more if the current response returned fewer items than the limit
                if (newItems.length < limit || newItems.length === 0) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

                // Cache metadata for buffered map interaction
                if (isGoogleMapOpen && bufferedBounds) {
                    lastFetchedBoundsRef.current = bufferedBounds;
                    hasFullResultsForLastBoundsRef.current = newItems.length < limit;
                }

                if (page === 1) {
                    // Trigger exit animation for skeletons to fade out before revealing cards
                    if (initialLoading) {
                        setIsExiting(true);
                        await new Promise(resolve => setTimeout(resolve, 600)); // matches CSS exit duration
                        setIsExiting(false);
                    }
                    
                    // IF we are in Map View and this was a pan-triggered fetch,
                    // ACCUMULATE items instead of replacing to avoid flickering markers.
                    // BUT: Only accumulate if other filters haven't changed.
                    const filtersKey = JSON.stringify(filters);
                    const lastFiltersHandle = lastFetchedParamsRef.current ? JSON.parse(lastFetchedParamsRef.current) : null;
                    const filtersMatch = lastFiltersHandle && JSON.stringify({ ...lastFiltersHandle, min_lat: undefined, max_lat: undefined, min_lng: undefined, max_lng: undefined }) === 
                                                 JSON.stringify({ ...filters, min_lat: undefined, max_lat: undefined, min_lng: undefined, max_lng: undefined });
                    
                    const isPureMapMove = isGoogleMapOpen && isBoundsTriggeredFetch && filtersMatch;
                    
                    if (isPureMapMove) {
                        updateListingsUnique(newItems, false, mapBounds); // Merge + Prune
                    } else {
                        updateListingsUnique(newItems, true); // Replace for filter changes
                    }
                    
                    setInitialLoading(false);
                } else {
                    updateListingsUnique(newItems, false); // Unique append for pagination
                }

                setTotal(data.total || 0);
                lastFetchedParamsRef.current = currentParamsKey;
            } catch (error) {
                if (axios.isCancel(error)) return;
                console.error('Failed to fetch listings', error);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                    setInitialLoading(false);
                    setIsMapRefetching(false);
                }
            }
        };
        fetchListings();
        return () => controller.abort();
    }, [filters, page, user, mapBounds, isGoogleMapOpen]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loading && hasMore && (listings.length > 0 && listings.length < total)) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 0.1 }
        );
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => { if (observerTarget.current) observer.unobserve(observerTarget.current); };
    }, [loading, listings.length, total, hasMore]);

    const handleFilterChange = (key, value, shouldScroll = true) => {
        const safeValue = value != null && typeof value !== 'string' ? String(value) : (value ?? '');
        const newFilters = toSerializableFilters({ ...filters, [key]: safeValue });
        setFilters(newFilters);
        if (isSidebarOpen) setPendingFilters(prev => ({ ...prev, [key]: safeValue }));
        localStorage.setItem('listing_filters', JSON.stringify(newFilters));
        setPage(1);

        if (shouldScroll) {
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to prevent jump
            skipNextUrlSyncRef.current = true;
            const newParams = new URLSearchParams(searchParams);
            if (value) newParams.set(key, value);
            else newParams.delete(key);
            setSearchParams(newParams);
        }
    };

    // Toggle one value in a comma-separated multi-select filter (e.g. listing_type, type)
    const toggleMultiFilter = (key, valueToToggle, shouldScroll = true) => {
        const current = (filters[key] || '').toString().split(',').filter(Boolean);
        const set = new Set(current);
        if (valueToToggle === '') {
            handleFilterChange(key, '', shouldScroll);
            return;
        }
        if (set.has(valueToToggle)) set.delete(valueToToggle);
        else set.add(valueToToggle);
        const next = [...set].join(',');
        handleFilterChange(key, next, shouldScroll);
    };

    // Remove one value from a comma-separated filter (for Selected chip ×)
    const clearFilterValue = (key, valueToRemove) => {
        const current = (filters[key] || '').toString().split(',').filter(Boolean);
        const next = current.filter(v => v !== valueToRemove).join(',');
        handleFilterChange(key, next);
    };

    const handleSelectChange = (key, option) => {
        const val = (option && typeof option === 'object') ? option.value : option;
        handleFilterChange(key, val || '');
    };

    const handleStationSelect = (stationIds) => {
        const value = Array.isArray(stationIds) ? stationIds.join(',') : stationIds;
        handleFilterChange('station_id', value);
    };

    const handleQuickSearchFilters = (tag, label = '') => {
        const updates = {};
        const searchText = label || (tag === 'featured' ? 'Featured properties' : '');
        if (tag === 'transit') {
            updates.max_distance_to_station = '600';
            updates.station_id = '';
            updates.search = searchText || 'Near BTS / MRT stations';
        } else if (tag === 'Condo') {
            updates.type = 'Condo';
            updates.listing_type = 'rent';
            updates.search = searchText || 'Condo for Rent';
            updates.max_distance_to_station = '';
        } else if (tag === 'Commercial') {
            updates.type = 'Commercial';
            updates.listing_type = 'sale';
            updates.search = searchText || 'Commercial for Sale';
            updates.max_distance_to_station = '';
        } else if (tag === 'featured') {
            updates.search = searchText || 'Featured properties';
            updates.max_distance_to_station = '';
        }
        if (Object.keys(updates).length === 0) return;
        const newFilters = { ...filters, ...updates };
        setFilters(newFilters);
        setSearchTerm(updates.search !== undefined ? updates.search : filters.search);
        localStorage.setItem('listing_filters', JSON.stringify(newFilters));
        setPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const newParams = new URLSearchParams(searchParams);
        ['type', 'listing_type', 'search', 'station_id', 'max_distance_to_station'].forEach(key => {
            const v = newFilters[key];
            if (v) newParams.set(key, v);
            else newParams.delete(key);
        });
        const view = searchParams.get('view');
        if (view) newParams.set('view', view);
        setSearchParams(newParams);
    };

    const handlePendingFilterChange = (key, value) => {
        setPendingFilters(prev => ({ ...prev, [key]: value }));
    };
    const updatePendingFilters = (partial) => {
        setPendingFilters(prev => ({ ...prev, ...partial }));
    };
    const togglePendingMultiFilter = (key, valueToToggle) => {
        setPendingFilters(prev => {
            const current = (prev[key] || '').toString().split(',').filter(Boolean);
            const set = new Set(current);
            if (valueToToggle === '') {
                return { ...prev, [key]: '' };
            }
            if (set.has(valueToToggle)) set.delete(valueToToggle);
            else set.add(valueToToggle);
            return { ...prev, [key]: [...set].join(',') };
        });
    };
    const emptyPendingFilters = { type: '', listing_type: '', min_price: '', max_price: '', bedrooms: '', bathrooms: '', station_id: '', max_distance_to_station: '', developer_id: '', project_id: '', search: '', min_area: '', max_area: '' };
    const hasActivePendingFilters = Object.keys(emptyPendingFilters).some(k => (pendingFilters[k] || '') !== '');
    const clearPendingFilters = () => {
        setPendingFilters({ ...emptyPendingFilters });
        setSearchTerm('');
    };
    const clearPendingFilterValue = (key, valueToRemove) => {
        if (valueToRemove != null) {
            const current = (pendingFilters[key] || '').toString().split(',').filter(Boolean);
            const next = current.filter(v => v !== valueToRemove).join(',');
            setPendingFilters(prev => ({ ...prev, [key]: next }));
        } else {
            setPendingFilters(prev => ({ ...prev, [key]: '' }));
        }
    };

    const applyFilters = (override, closeSidebar = true) => {
        const raw = override ? { ...pendingFilters, ...override } : { ...pendingFilters };
        const next = toSerializableFilters(raw);
        const filtersUnchanged = FILTER_KEYS.every(k => (filters[k] || '') === (next[k] || ''));
        skipNextUrlSyncRef.current = true; // prevent URL sync from overwriting filters with stale params
        if (!filtersUnchanged) {
            setFilters(next);
            setPendingFilters(next);
            setPage(1);
        } else {
            setPendingFilters(next);
        }
        setSearchTerm(next.search ?? '');
        localStorage.setItem('listing_filters', JSON.stringify(next));
        const newParams = new URLSearchParams(searchParams);
        const view = searchParams.get('view');
        ['type', 'listing_type', 'min_price', 'max_price', 'bedrooms', 'bathrooms', 'station_id', 'max_distance_to_station', 'developer_id', 'project_id', 'search', 'min_area', 'max_area'].forEach(key => {
            const v = next[key];
            if (v) newParams.set(key, v);
            else newParams.delete(key);
        });
        if (view) newParams.set('view', view);
        setSearchParams(newParams);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (closeSidebar) setIsSidebarClosing(true);
    };

    const clearFilters = () => {
        setFilters({
            type: '',
            listing_type: '',
            min_price: '',
            max_price: '',
            bedrooms: '',
            bathrooms: '',
            station_id: '',
            max_distance_to_station: '',
            developer_id: '',
            project_id: '',
            search: '',
            min_area: '',
            max_area: '',
        });

        localStorage.removeItem('listing_filters');
        setSearchTerm('');
        setPage(1); // Reset page
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        // Preserve 'view' parameter if it exists
        const newParams = new URLSearchParams();
        const currentView = searchParams.get('view');
        if (currentView) newParams.set('view', currentView);
        setSearchParams(newParams);
    };

    // Generate active filters list (memoized or simple var)
    const activeFiltersList = [];
    if (filters.search) activeFiltersList.push({ label: `"${filters.search}"`, key: 'search' });
    if (filters.type) {
        filters.type.split(',').filter(Boolean).forEach(v => {
            const opt = propertyTypeOptions.find(o => o.value === v);
            if (opt) activeFiltersList.push({ label: opt.label, key: 'type', valueToRemove: v });
        });
    }
    if (filters.listing_type) {
        filters.listing_type.split(',').filter(Boolean).forEach(v => {
            const opt = listingTypeOptions.find(o => o.value === v);
            if (opt) activeFiltersList.push({ label: opt.label, key: 'listing_type', valueToRemove: v });
        });
    }
    if (filters.bedrooms) {
        const opt = bedroomOptions.find(o => o.value === filters.bedrooms);
        if (opt) activeFiltersList.push({ label: `Bedrooms: ${opt.label}`, key: 'bedrooms' });
    }
    if (filters.bathrooms) {
        const opt = bathroomOptions.find(o => o.value === filters.bathrooms);
        if (opt) activeFiltersList.push({ label: `Bathrooms: ${opt.label}`, key: 'bathrooms' });
    }
    if (filters.min_price) activeFiltersList.push({ label: `Min: ฿${parseInt(filters.min_price).toLocaleString()}`, key: 'min_price' });
    if (filters.max_price) activeFiltersList.push({ label: `Max: ฿${parseInt(filters.max_price).toLocaleString()}`, key: 'max_price' });
    if (filters.max_distance_to_station) {
        activeFiltersList.push({ label: `Near BTS/MRT (≤${filters.max_distance_to_station}m)`, key: 'max_distance_to_station' });
    }
    if (filters.station_id) {
        // Use flatStations (already flat option objects) to find the label
        const station = flatStations.find(s => s && s.value === filters.station_id);
        if (station) activeFiltersList.push({ label: `Station: ${station.label}`, key: 'station_id' });
    }
    if (filters.developer_id) {
        const developer = developers.find(d => d.id === filters.developer_id);
        if (developer) activeFiltersList.push({ label: `Dev: ${developer.name}`, key: 'developer_id' });
    }
    if (filters.project_id) {
        const project = projectsList.find(p => p.id === filters.project_id);
        if (project) activeFiltersList.push({ label: `Project: ${project.name}`, key: 'project_id' });
    }
    if (filters.min_area) activeFiltersList.push({ label: `Min Area: ${filters.min_area} sqm`, key: 'min_area' });
    if (filters.max_area) activeFiltersList.push({ label: `Max Area: ${filters.max_area} sqm`, key: 'max_area' });

    // Pending filters list for sidebar — chips reflect draft; only "Show X properties" applies
    const pendingFiltersList = [];
    if (pendingFilters.search) pendingFiltersList.push({ label: `"${pendingFilters.search}"`, key: 'search' });
    if (pendingFilters.type) {
        (pendingFilters.type || '').split(',').filter(Boolean).forEach(v => {
            const opt = propertyTypeOptions.find(o => o.value === v);
            if (opt) pendingFiltersList.push({ label: opt.label, key: 'type', valueToRemove: v });
        });
    }
    if (pendingFilters.listing_type) {
        (pendingFilters.listing_type || '').split(',').filter(Boolean).forEach(v => {
            const opt = listingTypeOptions.find(o => o.value === v);
            if (opt) pendingFiltersList.push({ label: opt.label, key: 'listing_type', valueToRemove: v });
        });
    }
    if (pendingFilters.bedrooms) {
        const opt = bedroomOptions.find(o => o.value === pendingFilters.bedrooms);
        if (opt) pendingFiltersList.push({ label: `Bedrooms: ${opt.label}`, key: 'bedrooms' });
    }
    if (pendingFilters.bathrooms) {
        const opt = bathroomOptions.find(o => o.value === pendingFilters.bathrooms);
        if (opt) pendingFiltersList.push({ label: `Bathrooms: ${opt.label}`, key: 'bathrooms' });
    }
    if (pendingFilters.min_price) pendingFiltersList.push({ label: `Min: ฿${parseInt(pendingFilters.min_price).toLocaleString()}`, key: 'min_price' });
    if (pendingFilters.max_price) pendingFiltersList.push({ label: `Max: ฿${parseInt(pendingFilters.max_price).toLocaleString()}`, key: 'max_price' });
    if (pendingFilters.station_id) {
        (pendingFilters.station_id || '').split(',').filter(Boolean).forEach(id => {
            const station = flatStations.find(s => s && s.value === id);
            if (station) pendingFiltersList.push({ label: station.label, key: 'station_id', valueToRemove: id });
        });
    }
    if (pendingFilters.developer_id) {
        const d = developers.find(x => x.id === pendingFilters.developer_id);
        if (d) pendingFiltersList.push({ label: `Dev: ${d.name}`, key: 'developer_id' });
    }
    if (pendingFilters.project_id) {
        const p = projectsList.find(x => x.id === pendingFilters.project_id);
        if (p) pendingFiltersList.push({ label: `Project: ${p.name}`, key: 'project_id' });
    }
    if (pendingFilters.min_area) pendingFiltersList.push({ label: `Min Area: ${pendingFilters.min_area} sqm`, key: 'min_area' });
    if (pendingFilters.max_area) pendingFiltersList.push({ label: `Max Area: ${pendingFilters.max_area} sqm`, key: 'max_area' });

    // --- Render Helper: Compact Filter Content (Sidebar — draft only; apply on "Show X properties") ---
    const renderFilterContent = () => {
        return (
            <div className="space-y-6 [&>*:first-child]:mt-0">
                {/* Selected (pending) filters — chips with × to remove; only updates draft */}
                {pendingFiltersList.length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-[15px] md:text-[13px] font-semibold text-gray-900 dark:text-white">Selected</h2>
                        <div className="flex flex-wrap gap-2">
                            {pendingFiltersList.map(({ label, key, valueToRemove }) => {
                                const chipKey = valueToRemove != null ? `${key}-${valueToRemove}` : key;
                                const isExiting = exitingChipKeys.has(chipKey);
                                const handleRemove = () => {
                                    setExitingChipKeys(prev => new Set(prev).add(chipKey));
                                    setTimeout(() => {
                                        valueToRemove != null ? clearPendingFilterValue(key, valueToRemove) : handlePendingFilterChange(key, '');
                                        setExitingChipKeys(prev => { const n = new Set(prev); n.delete(chipKey); return n; });
                                    }, 200);
                                };
                                return (
                                    <span
                                        key={chipKey}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-800 dark:border-white/30 bg-white dark:bg-dashboard-card text-gray-900 dark:text-white text-[13px] font-medium transition-all duration-200 ease-out animate-fade-in ${isExiting ? 'opacity-0 scale-90 pointer-events-none' : ''
                                            }`}
                                    >
                                        <span className="truncate max-w-[200px] min-w-0">{label}</span>
                                        <button
                                            type="button"
                                            onClick={handleRemove}
                                            className="flex-shrink-0 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                            aria-label={`Remove ${label}`}
                                        >
                                            <XMarkIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Text Search — draft only; applies when "Show X properties" */}
                <input
                    type="text"
                    value={pendingFilters.search || ''}
                    onChange={(e) => {
                        const v = e.target.value;
                        updatePendingFilters({ search: v });
                        setSearchTerm(v);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyFilters(); } }}
                    placeholder="Keyword, location, property name..."
                    className="w-full h-[52px] sm:h-[48px] px-6 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-dashboard-card text-gray-900 dark:text-white text-[15px] font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-gray-800 dark:focus:border-white/60 transition-all mb-7"
                />

                {/* Filter Sections */}
                <div className="space-y-7">


                    {/* LISTING TYPE (Buy/Rent) — draft only */}
                    <FilterCard
                        title="Listing Type"
                        icon={FilterIcons.tag}
                    >
                        <div className="flex flex-wrap gap-2.5">
                            {listingTypeOptions.map(({ value, label }) => {
                                const selectedSet = new Set((pendingFilters.listing_type || '').split(',').filter(Boolean));
                                const isActive = value === '' ? selectedSet.size === 0 : selectedSet.has(value);
                                const IconComp = listingTypeIconMap[value];
                                return (
                                    <FilterPill
                                        key={value || 'all'}
                                        label={label}
                                        isActive={isActive}
                                        onClick={() => togglePendingMultiFilter('listing_type', value)}
                                        icon={IconComp ? <IconComp className="w-4 h-4" /> : null}
                                    />
                                );
                            })}
                        </div>
                    </FilterCard>

                    {/* PROPERTY TYPE — draft only */}
                    <FilterCard
                        title="Property Type"
                        icon={FilterIcons.property}
                    >
                        <div className="flex flex-wrap gap-2.5">
                            {propertyTypeOptions.map(({ value, label }) => {
                                const selectedSet = new Set((pendingFilters.type || '').split(',').filter(Boolean));
                                const isActive = value === '' ? selectedSet.size === 0 : selectedSet.has(value);
                                const IconComp = propertyTypeIconMap[value];
                                return (
                                    <FilterPill
                                        key={value || 'all'}
                                        label={label}
                                        isActive={isActive}
                                        onClick={() => togglePendingMultiFilter('type', value)}
                                        icon={IconComp ? <IconComp className="w-4 h-4" /> : null}
                                    />
                                );
                            })}
                        </div>
                    </FilterCard>

                    {/* ROOMS AND BEDS */}
                    <FilterCard
                        titleClassName="font-semibold"
                    >
                        <div className="space-y-4">
                            <RoomStepperRow
                                label="Bedrooms"
                                options={bedroomOptions}
                                value={pendingFilters.bedrooms}
                                onChange={(v) => handlePendingFilterChange('bedrooms', v)}
                            />
                            <RoomStepperRow
                                label="Bathrooms"
                                options={bathroomOptions}
                                value={pendingFilters.bathrooms}
                                onChange={(v) => handlePendingFilterChange('bathrooms', v)}
                            />
                        </div>
                    </FilterCard>

                    {/* TRANSIT STATION - Modal Trigger */}
                    <FilterCard
                        title="Transit Station"
                        icon={FilterIcons.transit}
                    >
                        <div className="space-y-3">
                            <button
                                onClick={() => setIsTransitModalOpen(true)}
                                className="w-full h-[52px] sm:h-[48px] flex items-center justify-between pl-5 pr-1.5 bg-white dark:bg-dashboard-card border border-gray-200 dark:border-white/10 rounded-full transition-all group hover:border-gray-400 dark:hover:border-white/30"
                            >
                                <div className="flex items-center gap-3">
                                    <MagnifyingGlassIcon className="w-[22px] h-[22px] text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                                    <span className="text-[13px] font-normal text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300">Search transit station...</span>
                                </div>
                                <div className="bg-white dark:bg-dashboard-card border border-gray-800 dark:border-white/30 w-[42px] h-[42px] sm:w-9 sm:h-9 rounded-full active:scale-95 transition-all flex items-center justify-center">
                                    <MapIcon className="w-[20px] h-[20px] sm:w-5 sm:h-5 text-gray-800 dark:text-white" strokeWidth={2} />
                                </div>
                            </button>

                            {/* Selection Pills — draft only */}
                            {(pendingFilters.station_id || '').split(',').filter(Boolean).map(id => {
                                const station = flatStations.find(s => s.value === id);
                                return (
                                    <button
                                        key={id}
                                        onClick={() => {
                                            const currentIds = (pendingFilters.station_id || '').split(',');
                                            const newIds = currentIds.filter(i => i !== id);
                                            handlePendingFilterChange('station_id', newIds.join(','));
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-dashboard-card border border-gray-800 dark:border-white/30 hover:border-gray-600 dark:hover:border-white/50 rounded-full transition-colors group"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-gray-800 dark:bg-white" />
                                        <span className="text-[13px] font-normal text-gray-900 dark:text-white">
                                            {station ? station.label : id}
                                        </span>
                                        <XMarkIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white" strokeWidth={2.5} />
                                    </button>
                                );
                            })}
                        </div>
                    </FilterCard>

                    {/* PRICE RANGE */}
                    <FilterCard
                        title="Price Range"
                        icon={FilterIcons.price}
                    >
                        <PriceRangeSlider
                            min={priceLimits.min}
                            max={priceLimits.max}
                            step={priceLimits.max - priceLimits.min > 1000000 ? 100000 : 500}
                            initialMin={pendingFilters.min_price ? parseInt(pendingFilters.min_price) : priceLimits.min}
                            initialMax={pendingFilters.max_price ? parseInt(pendingFilters.max_price) : priceLimits.max}
                            onChange={({ min, max }) => {
                                updatePendingFilters({
                                    min_price: min?.toString() || '',
                                    max_price: max?.toString() || ''
                                });
                            }}
                        />
                    </FilterCard>

                    {/* SIZE RANGE */}
                    <FilterCard
                        title="Size Range (sqm)"
                        icon={FilterIcons.size}
                    >
                        <SizeRangeSlider
                            min={0}
                            max={500}
                            step={1}
                            initialMin={pendingFilters.min_area ? parseInt(pendingFilters.min_area) : 0}
                            initialMax={pendingFilters.max_area ? parseInt(pendingFilters.max_area) : 500}
                            onChange={({ min, max }) => {
                                updatePendingFilters({
                                    min_area: min?.toString() || '',
                                    max_area: max?.toString() || ''
                                });
                            }}
                        />
                    </FilterCard>


                    {/* DEVELOPER FILTER */}
                    <FilterCard
                        title="Developer"
                        icon={FilterIcons.developer}
                    >
                        <ScrollableFilterList
                            items={(developers || []).map(d => ({
                                id: d.id,
                                name: d.name,
                                subtitle: d.company || '',
                                image: d.logo || d.image,
                                isAvatar: true
                            }))}
                            selectedId={pendingFilters.developer_id}
                            onSelect={id => handlePendingFilterChange('developer_id', id)}
                            placeholder="Search developer..."
                            allLabel="All"
                            useModal={true}
                            title="Developer"
                            icon={FilterIcons.developer}
                        />
                    </FilterCard>

                    {/* PROJECT FILTER */}
                    <FilterCard
                        title="Project"
                        icon={FilterIcons.project}
                    >
                        <ScrollableFilterList
                            items={(projectsList || []).map(p => ({
                                id: p.id,
                                name: p.name,
                                subtitle: p.developer?.name || p.developer_name || '',
                                image: p.cover_image || p.image,
                                isAvatar: false
                            }))}
                            selectedId={pendingFilters.project_id}
                            onSelect={id => handlePendingFilterChange('project_id', id)}
                            placeholder="Search project..."
                            allLabel="All"
                            useModal={true}
                            title="Project"
                            icon={FilterIcons.project}
                        />
                    </FilterCard>
                    {/* Spacer for bottom of sidebar */}
                    <div className="h-12 pointer-events-none" />
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white dark:bg-dashboard-dark flex flex-col font-inter">
            {/* --- FILTER SIDEBAR (slide-in from right with open/close animation) --- */}
            {isSidebarOpen && (
                <>
                    <div
                        className={`fixed inset-0 z-[260] bg-black/25 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${isSidebarClosing ? 'opacity-0' : 'opacity-100'}`}
                        onClick={closeFilterSidebar}
                        aria-hidden
                    />
                    <aside
                        className={`fixed right-0 top-0 h-full w-full sm:w-[360px] sm:max-w-[85vw] z-[261] bg-white dark:bg-dashboard-card shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-out ${(isSidebarClosing || sidebarAnimateIn) ? 'translate-x-full' : 'translate-x-0'}`}
                        role="dialog"
                        aria-label="Filter settings"
                    >
                        {/* Sidebar header */}
                        <div className="flex-shrink-0 flex items-center justify-between px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-white/10 md:border-gray-100 bg-white dark:bg-dashboard-card">
                            <h3 className="text-[17px] font-semibold text-gray-900 dark:text-white tracking-[0.05em]">Filter Settings</h3>
                            <button
                                type="button"
                                onClick={closeFilterSidebar}
                                className="flex items-center justify-center rounded-full text-[#222222] dark:text-white hover:text-gray-600 dark:hover:text-primary-400 transition-all active:scale-90"
                                aria-label="Close filters"
                            >
                                <XMarkIcon className="w-7 h-7" />
                            </button>
                        </div>
                        {/* Filter box content */}
                        <div className="flex-1 min-h-0 overflow-y-auto px-4 lg:px-6 py-6 custom-scrollbar modal-scrollable">
                            {renderFilterContent()}
                        </div>
                        {/* Sidebar footer (mobile-first): slimmer height, Clear on left, Search on right; iPhone safe area */}
                        <div
                            className="flex-shrink-0 py-4 lg:px-6 lg:pb-6 border-t border-gray-200 dark:border-white/10 md:border-gray-100 bg-white dark:bg-dashboard-card flex flex-row flex-nowrap items-center justify-between gap-3 pt-4 pb-5"
                            style={{
                                paddingTop: '0.75rem',
                                paddingBottom: '0.75rem',
                                paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
                                paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
                            }}
                        >
                            {hasActivePendingFilters && (
                                <button
                                    onClick={clearPendingFilters}
                                    className="order-1 px-6 py-3.5 md:px-5 md:py-2.5 min-h-[48px] md:min-h-[40px] rounded-full text-[13px] font-medium text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 flex items-center justify-center"
                                >
                                    Clear all
                                </button>
                            )}
                            <button
                                onClick={() => applyFilters()}
                                className="order-2 ml-auto inline-flex items-center justify-center px-8 py-3.5 md:px-5 md:py-2.5 rounded-full text-[13px] md:text-[12px] font-normal transition-all duration-300 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-dashboard-card border border-gray-900 dark:border-white hover:border-gray-800 dark:hover:border-white min-h-[48px] md:min-h-[40px]"
                            >
                                <span>Show {pendingTotal ?? total} {(pendingTotal ?? total) === 1 ? 'property' : 'properties'}</span>
                            </button>
                        </div>
                    </aside>
                </>
            )}



            {/* --- STANDARD GRID LAYOUT --- */}
            <div className={`w-full bg-transparent min-h-screen relative ${isGoogleMapOpen ? 'hidden lg:block' : ''}`}>
                {/* Mobile search bar: real input + filter icon outside; shadow only when scrolled */}
                <div className={`lg:hidden sticky top-0 z-[100] bg-white dark:bg-dashboard-dark py-4 px-4 transition-shadow duration-200 ${layoutScrolled ? 'shadow-[0_4px_12px_-2px_rgba(0,0,0,0.1)]' : ''}`}>
                    <div className="flex items-center gap-3 w-full">
                        <div className="flex-1 min-w-0 flex items-center gap-2 min-h-[44px] pl-4 pr-4 py-1.5 rounded-full bg-white dark:bg-dashboard-card border border-gray-200 dark:border-white/10">
                            <BsSearch className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
                                placeholder="Search properties & filters"
                                className="flex-1 min-w-0 py-2.5 text-[14px] font-medium text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0"
                                aria-label="Search properties"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => { setIsSidebarOpen(true); setSidebarAnimateIn(true); }}
                            className={`flex-shrink-0 relative w-11 h-11 rounded-full flex items-center justify-center text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-gray-300 active:scale-95 transition-all bg-white dark:bg-dashboard-card border-none`}
                            aria-label="Open filters"
                        >
                            <AdjustmentsHorizontalIcon className={`${activeFiltersList.length > 0 ? 'w-5 h-5' : 'w-8 h-8'} text-gray-800 dark:text-white`} />
                            {activeFiltersList.length > 0 && (
                                <span className="absolute -top-[4px] -right-[4px] min-w-[16px] h-[16px] px-0.5 flex items-center justify-center rounded-full bg-primary-600 text-white text-[10px] font-semibold border-2 border-white shadow-md leading-none">
                                    {activeFiltersList.length > 99 ? '99+' : activeFiltersList.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
                {/* Header Mobile */}


                {/* Filter bar: portaled into layout so it sits in same container as nav bar */}
                {filterBarSlot && createPortal(
                    <FilterBar
                        className=""
                        total={total}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        onClearSearch={() => {
                            setSearchTerm('');
                            handleFilterChange('search', '', true);
                        }}
                        onOpenFilters={() => { setIsSidebarOpen(true); setSidebarAnimateIn(true); }}
                        hasActiveFilters={hasActiveFilters}
                        activeFilterCount={activeFiltersList.length}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        isGoogleMapOpen={isGoogleMapOpen}
                        onToggleMapView={toggleMapView}
                        navVisible={navVisible}
                        isScrolled={layoutScrolled}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onQuickSearchClick={handleQuickSearchFilters}
                        stations={stations}
                    />,
                    filterBarSlot
                )}

                {/* Main Content Grid — same width as nav: max-w-[1440px]; mobile: left/right padding */}
                <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 lg:px-20 mt-2 lg:mt-3">
                    {/* Main Content Grid — at lg only: no sidebar (use Filters drawer); at xl: sidebar visible again */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar — removed from list page; use Filters button to open filter drawer */}
                        <div className={`hidden transition-all duration-500 ${isGoogleMapOpen ? '!hidden' : ''}`}>
                            <div className={`sticky transition-all duration-500 ease-in-out ${navVisible ? 'top-[112px] lg:top-[128px] h-[calc(100vh-112px)] lg:h-[calc(100vh-128px)]' : 'top-[48px] h-[calc(100vh-48px)]'} flex flex-col bg-white border-r border-gray-100/50`}>
                                <div className="flex-1 overflow-y-auto custom-scrollbar-hover scroll-smooth pr-4 overscroll-contain group">
                                    {renderFilterContent()}
                                </div>

                                {/* Desktop Sidebar Fixed Footer */}
                                <div className="flex-shrink-0 p-6 border-t border-gray-50 bg-white flex flex-row flex-nowrap items-center justify-center gap-3">
                                    <button
                                        onClick={() => applyFilters()}
                                        className="px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 bg-gray-900 hover:bg-gray-800 text-white border border-gray-900 hover:border-gray-800 shadow-sm hover:shadow-md min-h-[40px]"
                                    >
                                        Show {pendingTotal ?? total} {(pendingTotal ?? total) === 1 ? 'property' : 'properties'}
                                    </button>
                                    <button
                                        onClick={clearPendingFilters}
                                        disabled={!hasActivePendingFilters}
                                        className={`px-3 py-2 rounded text-[13px] font-bold transition-all duration-300 ${hasActivePendingFilters
                                            ? 'bg-transparent border-none text-red-600 hover:text-red-700'
                                            : 'bg-transparent border-none text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Clear all
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Listings Grid or Map — full width at lg; at xl sidebar visible so 9 cols */}
                        <div className="lg:col-span-12 transition-all duration-700 relative">
                            <div className={`flex flex-col lg:flex-row lg:justify-end transition-all duration-700 ease-in-out relative ${isMapExpanded ? 'gap-0' : 'gap-6 lg:gap-8'} ${isGoogleMapOpen ? 'min-h-[85vh] pt-0.5' : 'min-h-[70vh]'}`}>
                                {/* Left Side: Property List — no overflow; full card height; scroll is on main container */}
                                <div className={`flex flex-col transition-all duration-700 ease-in-out ${isGoogleMapOpen ? (isMapExpanded ? 'lg:w-0 opacity-0 pointer-events-none' : 'w-full lg:w-[42%] xl:w-[52%] opacity-100') : 'w-full'} h-full p-0`}>
                                    
                                    {!isGoogleMapOpen && (
                                        <CollectionBar 
                                            key={`collection-bar-${location.pathname}`}
                                            readOnly={true}
                                            canEdit={false}
                                        />
                                    )}

                                    {/* Header: Results Count */}
                                    <div className="mb-4 mt-1 flex justify-start">
                                        {(initialLoading || (isMapRefetching && !isGoogleMapOpen)) ? (
                                            <div className="h-7 w-32 bg-gray-100 dark:bg-white/5 rounded animate-fill-fast" />
                                        ) : (listings || []).length > 0 ? (
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-[17px] md:text-[17px] font-semibold text-[#222222] dark:text-white tracking-[0.05em]">
                                                    {total} {total === 1 ? 'property' : 'properties'}
                                                </h2>
                                            </div>
                                        ) : null}
                                    </div>

                                    {(initialLoading || (isMapRefetching && !isGoogleMapOpen)) ? (
                                        <div className={`grid gap-4 ${isGoogleMapOpen ? 'grid-cols-2 lg:grid-cols-1 xl:grid-cols-2' : (viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1')}`}>
                                            {[...Array(isGoogleMapOpen ? 6 : 12)].map((_, i) => <ListingSkeleton key={i} index={i} viewMode={isGoogleMapOpen ? 'map-list' : viewMode} isExiting={isExiting} />)}
                                        </div>
                                    ) : (listings || []).length > 0 ? (
                                        <div className="relative">
                                            <div className={`grid gap-4 transition-all duration-500 opacity-100 ${isGoogleMapOpen ? 'grid-cols-2 lg:grid-cols-1 xl:grid-cols-2' : (viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1')}`}>
                                                {(listings || []).map((l, i) => (
                                                    <div
                                                        key={l.id}
                                                        onMouseEnter={() => isGoogleMapOpen && setListHoveredListingId(l.id)}
                                                        onMouseLeave={() => setListHoveredListingId(null)}
                                                        className="animate-fillIn"
                                                        style={{ animationDelay: `${i * 120}ms` }}
                                                    >
                                                        <ListingCard
                                                            index={i}
                                                            listing={l}
                                                            viewMode={isGoogleMapOpen ? 'map-list' : viewMode}
                                                            priceFormat={priceFormat}
                                                            to={window.innerWidth >= 1024 ? `/listings/${l.id}` : `${location.pathname}?${(function () {
                                                                const p = new URLSearchParams(searchParams);
                                                                p.set('detail', l.id);
                                                                return p.toString();
                                                            })()}`}
                                                        />
                                                    </div>
                                                ))}
                                                {loading && !initialLoading && !isGoogleMapOpen && (
                                                    <div className="contents animate-fill-fast">
                                                        {[...Array(Math.min(viewMode === 'grid' ? 6 : 3, total - listings.length))].map((_, i) => (
                                                            <ListingSkeleton key={`more-${i}`} index={i} viewMode={viewMode} />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div ref={observerTarget} className="h-20" />
                                        </div>
                                    ) : (
                                        <div className={`flex flex-col items-center justify-center py-24 px-4 bg-gray-50/50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-[24px] animate-fill-med flex-1 ${isGoogleMapOpen ? 'h-full min-h-[50vh]' : 'min-h-[50vh]'}`}>
                                            <div className="w-16 h-16 bg-white dark:bg-dashboard-card shadow-sm border border-gray-100 dark:border-white/10 rounded-full flex items-center justify-center mb-5">
                                                <SparklesIcon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                                            </div>
                                            <h3 className="text-[17px] font-bold text-gray-900 dark:text-white">No properties found</h3>
                                            <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1 max-w-[260px] text-center leading-relaxed">
                                                Try adjusting your search or filters to discover more matching results.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Map — sticky below filter bar: moves up with initial scroll then stops under filter bar */}
                                {isGoogleMapOpen && (
                                    <div className={`hidden lg:block transition-all duration-700 ease-in-out relative lg:ml-auto ${isMapExpanded ? 'w-full h-[85vh] min-h-[85vh] lg:h-[calc(100vh-124px)] lg:min-h-[calc(100vh-124px)] xl:h-[85vh] xl:min-h-[85vh]' : `lg:w-[58%] xl:w-[48%] lg:sticky lg:self-start h-[85vh] min-h-[85vh] lg:h-[calc(100vh-124px)] lg:min-h-[calc(100vh-124px)] xl:h-[85vh] xl:min-h-[85vh] ${navVisible ? 'lg:top-[112px]' : 'lg:top-[80px]'}`}`}>
                                        <div className="map-overlays-rounded relative w-full h-full min-h-0 rounded-[24px] overflow-hidden shadow-sm border border-gray-200 dark:border-white/10">
                                            <GoogleMap
                                                listings={listings}
                                                center={mapCenter}
                                                zoom={mapZoom}
                                                onMarkerClick={(property) => {
                                                    if (window.innerWidth >= 1024) {
                                                        navigate(`/listings/${property.id}`);
                                                    } else {
                                                        const newParams = new URLSearchParams(searchParams);
                                                        newParams.set('detail', property.id);
                                                        setSearchParams(newParams);
                                                    }
                                                }}
                                                onBoundsChanged={handleMapBoundsChanged}
                                                onExpandClick={() => setIsMapExpanded(true)}
                                                isExpanded={isMapExpanded}
                                                isVisible={isGoogleMapOpen}
                                                onSaveClick={handleMapSaveClick}
                                                savedListingIds={savedListingIds}
                                                highlightedMarkerListingId={listHoveredListingId}
                                                fitBoundsOnListingsChange={!fetchTriggeredByBoundsRef.current}
                                                showMapLoading={loading && fetchTriggeredByBoundsRef.current}
                                            />
                                            {/* X close when map expanded full width */}
                                            {isMapExpanded && (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsMapExpanded(false)}
                                                    className="absolute top-4 right-4 z-[20] w-11 h-11 rounded-full bg-white dark:bg-dashboard-card shadow-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"
                                                    aria-label="Close expanded map"
                                                >
                                                    <XMarkIcon className="w-6 h-6" />
                                                </button>
                                            )}
                                            {/* Map Overlays (hide when expanded so X is visible) */}
                                            {!isMapExpanded && (
                                                <div className="absolute top-4 right-4 z-10 pointer-events-none">
                                                    <div className="bg-white/70 dark:bg-dashboard-card/80 backdrop-blur-xl px-4 py-2 rounded-full shadow-2xl border border-white/50 dark:border-white/10 flex items-center gap-3">
                                                        <div className="bg-slate-100/50 dark:bg-white/10 p-2 rounded-full border border-white/40 dark:border-white/10">
                                                            <GlobeAltIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold" style={{ color: '#222222' }}>Map Mode</p>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{total} Properties</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>




            {/* Modals */}




            {/* Google Maps Modal (Mobile Only) */}
            {
                isGoogleMapOpen && (
                    <div className="absolute top-0 left-0 w-full min-h-[100svh] z-[200] bg-[#f7f7f7] dark:bg-dashboard-dark lg:!hidden flex flex-col pointer-events-auto">
                        {/* Dynamic Header Bar - Appears when sheet is expanded */}
                        <div className={`fixed top-0 left-0 right-0 z-[220] bg-white dark:bg-dashboard-card lg:hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] pointer-events-none ${isMobileSheetExpanded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                            <div className="flex-shrink-0 w-full border-b dark:border-white/10 px-4 py-3.5 flex items-center gap-2 shadow-sm pointer-events-auto">
                                <div className="flex-1 flex items-center gap-2 min-h-[44px] px-4 py-1.5 rounded-full bg-white dark:bg-dashboard-card border border-gray-200 dark:border-white/10">
                                    <BsSearch className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <input
                                        type="search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search properties & filters"
                                        className="flex-1 min-w-0 py-1.5 text-[14px] font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0"
                                        aria-label="Search properties"
                                    />
                                </div>
                                <button
                                    onClick={() => { setIsSidebarOpen(true); setSidebarAnimateIn(true); }}
                                    className={`flex-shrink-0 relative w-11 h-11 rounded-full flex items-center justify-center text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-gray-300 active:scale-95 transition-all bg-white dark:bg-dashboard-card border-none`}
                                    aria-label="Open filters"
                                >
                                    <AdjustmentsHorizontalIcon className={`${activeFiltersList.length > 0 ? 'w-5 h-5' : 'w-8 h-8'}`} />
                                    {activeFiltersList.length > 0 && (
                                        <span className="absolute -top-[4px] -right-[4px] min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full bg-primary-600 text-white text-[10px] font-bold border-2 border-white dark:border-dashboard-card shadow-md">
                                            {activeFiltersList.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Middle Scrollable Area - unified scroll for map and list */}
                        <div
                            ref={scrollContainerRef}
                            className="w-full bg-transparent"
                        >
                            {/* Map Container - Sticky at the top, list slides over it */}
                            <div className="sticky top-0 w-full h-[100svh] z-[201] flex-shrink-0">
                                {/* Floating Filter Button (Black at corner) - Hidden when header is shown */}
                                <button
                                    onClick={() => { setIsSidebarOpen(true); setSidebarAnimateIn(true); }}
                                    className={`absolute top-6 right-6 z-[210] w-14 h-14 bg-white dark:bg-dashboard-card rounded-full flex items-center justify-center text-gray-900 dark:text-white border-none active:scale-95 transition-all outline-none ${isMobileSheetExpanded ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}`}
                                    aria-label="Open filters"
                                >
                                    <AdjustmentsHorizontalIcon className="w-7 h-7" />
                                    {activeFiltersList.length > 0 && (
                                        <span className="absolute -top-[4px] -right-[4px] min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full bg-primary-600 text-white text-[10px] font-bold border-2 border-white dark:border-dashboard-card shadow-md">
                                            {activeFiltersList.length}
                                        </span>
                                    )}
                                </button>
                                <GoogleMap
                                    listings={listings}
                                    center={mapCenter}
                                    zoom={mapZoom}
                                    onMarkerClick={(property) => {
                                        if (property && property.id) {
                                            setSelectedListingId(property.id);
                                        }
                                    }}
                                    onBoundsChanged={handleMapBoundsChanged}
                                    onOpenedMarkerChange={setSelectedListingId}
                                    openedMarkerId={selectedListingId}
                                    onClick={() => setSelectedListingId(null)}
                                    onSaveClick={handleMapSaveClick}
                                    savedListingIds={savedListingIds}
                                    highlightedMarkerListingId={selectedListingId || listHoveredListingId}
                                    isVisible={isGoogleMapOpen}
                                    fitBoundsOnListingsChange={!fetchTriggeredByBoundsRef.current}
                                    showMapLoading={loading && fetchTriggeredByBoundsRef.current}
                                    hideControls={true}
                                    hideCustomControls={true}
                                    disableMarkerExpansion={true}
                                />
                                {/* Soft Dark Overlay Layer - increases as you scroll up */}
                                <div
                                    className={`absolute inset-0 bg-black z-[202] transition-opacity duration-75 ${mapOverlayOpacity > 0 ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}`}
                                    style={{ opacity: mapOverlayOpacity }}
                                    onClick={() => {
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                />
                            </div>

                            {/* Property Stream Container - Hidden when a marker is selected on mobile */}
                            <div className={`relative z-[205] bg-white dark:bg-dashboard-card px-4 pb-32 rounded-t-[20px] shadow-[0_-20px_60px_rgba(0,0,0,0.18)] border-t border-gray-100/30 dark:border-white/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${selectedListingId && isGoogleMapOpen ? 'opacity-0 translate-y-20 pointer-events-none' : '-mt-[70px] opacity-100 translate-y-0'}`}>
                                {/* Sheet Header Area - Simple text count below the handle */}
                                <div
                                    className="sticky top-0 z-[220] flex flex-col items-center justify-center h-[80px] gap-2 cursor-pointer bg-white dark:bg-dashboard-card transition-colors rounded-t-[20px] border-b border-gray-50 dark:border-white/5"
                                    onClick={toggleMobileSheet}
                                >
                                    {/* Handle at above */}
                                    <div className="w-10 h-1.5 rounded-full bg-gray-200/80 dark:bg-white/10" />

                                    {/* Simple Count Text (No Box) - Hidden when a marker is selected on mobile */}
                                    {!(isGoogleMapOpen && selectedListingId) && (
                                        <span 
                                            className="text-[16px] font-bold tracking-tight animate-in fade-in duration-300"
                                            style={{ color: '#222222' }}
                                        >
                                            Found around {total} properties
                                        </span>
                                    )}
                                </div>

                                {/* Listings List */}
                                <div className="flex flex-col gap-6 max-w-lg mx-auto">
                                    {listings.filter(p => p && p.id).map((property) => (
                                        <ListingCard
                                            key={property.id}
                                            listing={property}
                                            viewMode="grid"
                                            onHover={setListHoveredListingId}
                                            to={`${location.pathname}?${(function () {
                                                const p = new URLSearchParams(searchParams);
                                                p.set('detail', property.id);
                                                return p.toString();
                                            })()}`}
                                        />
                                    ))}

                                    {loading && (
                                        <div className="flex flex-col gap-6 w-full animate-fill-fast">
                                            {[...Array(Math.min(2, total - listings.length))].map((_, i) => (
                                                <ListingSkeleton key={`mob-more-${i}`} />
                                            ))}
                                        </div>
                                    )}

                                    {!loading && listings.length < total && (
                                        <button
                                            onClick={() => setPage(p => p + 1)}
                                            className="w-full py-5 text-center font-bold text-primary-600 dark:text-primary-400 mt-4 rounded-2xl border border-primary-100 dark:border-primary-900/30 bg-primary-50 dark:bg-primary-950/20 active:scale-[0.98] transition-all"
                                        >
                                            View More Results
                                        </button>
                                    )}

                                    {/* Watermark Logo at the end of the scroll */}
                                    {isMainDomain && (
                                        <div className="flex flex-col items-center justify-center pt-8 pb-16 opacity-[0.08] pointer-events-none">
                                            <div
                                                className="w-56 h-56 bg-[length:100%_auto] bg-no-repeat bg-center flex items-center justify-center"
                                                style={theme?.logoUrl ? { backgroundImage: `url(${getMediaUrl(theme.logoUrl)})` } : {}}
                                            >
                                                {!theme?.logoUrl && (
                                                    <Logo className="w-56 h-56" style={{ color: 'var(--primary-color)' }} />
                                                )}
                                            </div>
                                            {!theme?.logoUrl && (
                                                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">StayNest</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Floating "View Map" button when scrolled past map */}
                        <div
                            className={`fixed left-0 right-0 flex justify-center z-[220] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isScrolledPastMap ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-12 pointer-events-none'}`}
                            style={{ bottom: isScrolledPastMap ? (isNavVisible ? '100px' : '32px') : '0px' }}
                        >
                            <button
                                onClick={scrollToMap}
                                className="flex items-center gap-2.5 px-6 py-3.5 bg-gray-900 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] font-bold text-sm tracking-wide active:scale-95 transition-all border border-white/10"
                            >
                                <MapIcon className="w-5 h-5 text-white" />
                                <span>View Map</span>
                            </button>
                        </div>

                        {/* Standalone Marker Preview Card (Floating at the very base on mobile) */}
                        {isGoogleMapOpen && selectedListingId && (
                            <div
                                className="fixed inset-x-3 z-[300] md:hidden animate-in fade-in slide-in-from-bottom-6 duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                                style={{ bottom: isNavVisible ? 'calc(env(safe-area-inset-bottom) + 92px)' : 'calc(env(safe-area-inset-bottom) + 12px)' }}
                            >
                                {(() => {
                                    const property = listings.find(l => String(l.id) === String(selectedListingId));
                                    if (!property) return null;
                                    return (
                                        <div className="relative">
                                            <div
                                                className="bg-white dark:bg-dashboard-card rounded-[28px] border border-gray-100 dark:border-white/10 shadow-[0_12px_45px_rgba(0,0,0,0.15)] overflow-hidden flex items-center p-2.5 relative active:scale-[0.98] transition-all cursor-pointer"
                                                onClick={() => navigate(`/listings/${property.id}${location.search}`)}
                                            >
                                                {/* Small Image at Left */}
                                                <div className="w-28 h-28 rounded-[22px] overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-white/5">
                                                    <img
                                                        src={getMediaUrl((property.media || []).find(m => m.type === 'image')?.url || property.images?.[0])}
                                                        alt={property.title}
                                                        className="w-full h-full object-cover select-none"
                                                    />
                                                </div>

                                                {/* Information at Right */}
                                                <div className="ml-4 flex-1 min-w-0 pr-6">
                                                    <h3 className="text-[15px] font-normal text-gray-900 dark:text-white truncate mb-1">
                                                        {property.title}
                                                    </h3>
                                                    <p className="text-[15px] font-normal text-gray-400 dark:text-gray-500 truncate mb-1.5">
                                                        {[
                                                            property.bedrooms > 0 ? `${property.bedrooms} Bed` : null,
                                                            property.bathrooms > 0 ? `${property.bathrooms} Bath` : null,
                                                            property.area > 0 ? `${property.area} Sqm` : null
                                                        ].filter(Boolean).join(' · ')}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[15px] font-normal text-gray-900 dark:text-white">
                                                            ฿{Number(property.price).toLocaleString()}
                                                        </span>
                                                        <span className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-[11px] px-2 py-1 rounded">
                                                            {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Floating Close Button outside the overflow-hidden container */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedListingId(null);
                                                }}
                                                className="absolute -top-1.5 -right-1.5 w-9 h-9 bg-white dark:bg-dashboard-card rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 shadow-2xl border border-gray-100 dark:border-white/10 active:bg-gray-50 dark:active:bg-white/5 z-[310]"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                )
            }
            <TransitFilterModal
                isOpen={isTransitModalOpen}
                onClose={() => setIsTransitModalOpen(false)}
                initialSelected={(pendingFilters.station_id || '').split(',').filter(Boolean)}
                onApply={(ids) => handlePendingFilterChange('station_id', Array.isArray(ids) ? ids.join(',') : ids)}
            />

            <ListingDetailModal />

            {
                showMapButton && !isGoogleMapOpen && (
                    <div
                        className={`fixed left-0 right-0 flex justify-center z-[220] md:hidden pointer-events-none transition-all ease-[cubic-bezier(0.32,0.72,0,1)] ${isKeyboardOpen ? 'opacity-0 duration-0' : 'opacity-100 duration-500'}`}
                        style={{
                            bottom: isNavVisible ? 'max(7.25rem, calc(80px + env(safe-area-inset-bottom, 16px) + 20px))' : 'max(2.25rem, calc(env(safe-area-inset-bottom, 16px) + 20px))'
                        }}
                    >
                        <div className="animate-fill-med pointer-events-auto">
                            <button
                                onClick={handleSwitchToMap}
                                className="flex items-center gap-2 px-6 py-3 bg-[#222222] text-white rounded-full shadow-lg font-bold text-sm tracking-wide active:scale-95 transition-transform"
                            >
                                Map <MapIcon className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ListingsPage;
