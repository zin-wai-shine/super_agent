import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import { createPortal } from 'react-dom';
import { useSearchParams, useOutletContext, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { saveListing, unsaveListing } from '../../services/savedListingsApi';
import { useTenant } from '../../contexts/TenantContext';
import { publicApi } from '../../services/api';
import ListingCard from '../../components/Listings/ListingCard';
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
    MagnifyingGlassIcon,
    GlobeAltIcon,
    SparklesIcon,
    ArrowUpIcon,
    TagIcon,
    BanknotesIcon,
    KeyIcon,
    HomeIcon,
    ChevronLeftIcon,
} from '@heroicons/react/24/outline';

import {
    CheckCircleIcon,
    HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid';
import { TbMapSearch } from "react-icons/tb";
import { LuTextSearch } from "react-icons/lu";
import Logo from '../../components/Common/Logo';

// Static Options moved outside to prevent recreation
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
    const { agent, actual_min_price, actual_max_price } = useTenant();
    const outletContext = useOutletContext() || {};
    const { navVisible, filterBarSlot, isScrolled: layoutScrolled, setMobileBottomNavVisible } = outletContext;
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const [savedListingIds, setSavedListingIds] = useState([]);

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const [total, setTotal] = useState(0);
    const [pendingTotal, setPendingTotal] = useState(null); // Count for current sidebar draft (background fetch, no loading UI)
    const [page, setPage] = useState(1);
    const observerTarget = useRef(null);

    // Modal States

    const [isGoogleMapOpen, setIsGoogleMapOpen] = useState(() => {
        const urlView = searchParams.get('view');
        if (urlView) return urlView === 'map';
        return localStorage.getItem('preferredView') === 'map';
    });
    const [isTransitModalOpen, setIsTransitModalOpen] = useState(false);
    const [listHoveredListingId, setListHoveredListingId] = useState(null);
    const [selectedListingId, setSelectedListingId] = useState(null);
    const [sheetOffset, setSheetOffset] = useState(48); // Percentage from top (48% = 52vh visible)
    const [showMapButton, setShowMapButton] = useState(false);
    const isMapView = searchParams.get('view') === 'map';

    const [isMapListExpanded, setIsMapListExpanded] = useState(() => {
        return localStorage.getItem('isMapListExpanded') === 'true';
    });

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

    // Manage mobile navigation visibility and Map button visibility
    useEffect(() => {
        if (!setMobileBottomNavVisible) return;

        if (isMapView) {
            const isFullyExpanded = sheetOffset < 40;
            const isMinimized = sheetOffset > 75 || !isMapListExpanded;

            if (isFullyExpanded || isMinimized) {
                setMobileBottomNavVisible(false);
                setShowMapButton(isFullyExpanded); // Show Map button only when expanded to allow "Back to Map"
            } else {
                setMobileBottomNavVisible(true);
                setShowMapButton(false);
            }
        } else {
            // Regular List View logic
            const handleScroll = () => {
                const currentScrollY = window.scrollY;
                if (currentScrollY > 100) {
                    setShowMapButton(true);
                } else {
                    setShowMapButton(false);
                }
                setMobileBottomNavVisible(true);
            };
            window.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll(); // Initial check
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [sheetOffset, setMobileBottomNavVisible, isMapView, isMapListExpanded]);

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
            setIsGoogleMapOpen(toMap);
            localStorage.setItem('preferredView', toMap ? 'map' : 'list');
        } else {
            // If URL doesn't have view param, use localStorage or default to false
            const stored = localStorage.getItem('preferredView');
            if (stored) {
                setIsGoogleMapOpen(stored === 'map');
            }
        }
    }, [searchParams]);

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
    const [priceLimits, setPriceLimits] = useState({ min: 0, max: 0 });
    const [priceFormat, setPriceFormat] = useState('short');
    const [agentId, setAgentId] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [developers, setDevelopers] = useState([]);
    const [projectsList, setProjectsList] = useState([]);
    const [mapBounds, setMapBounds] = useState(null); // Map bounds for geographic filtering

    // Use a ref to track bounds to avoid redundant state updates in onBoundsChanged
    const lastBoundsRef = useRef(null);
    const prevMapBoundsRef = useRef(null);
    const fetchTriggeredByBoundsRef = useRef(false); // when true, skip fitBounds so map stays where user panned
    const lastFetchedParamsRef = useRef(null); // Ref to avoid redundant fetches on back-nav

    const handleMapBoundsChanged = React.useCallback((bounds) => {
        // Simple comparison to prevent identical bounds from triggering a reload
        const isSame = lastBoundsRef.current &&
            lastBoundsRef.current.min_lat === bounds.min_lat &&
            lastBoundsRef.current.max_lat === bounds.max_lat &&
            lastBoundsRef.current.min_lng === bounds.min_lng &&
            lastBoundsRef.current.max_lng === bounds.max_lng;

        if (!isSame) {
            lastBoundsRef.current = bounds;
            setMapBounds(bounds);
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
        document.body.style.overflow = (isGoogleMapOpen || isSidebarOpen) ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isGoogleMapOpen, isSidebarOpen]);

    const toggleMapView = (isOpen) => {
        if (isOpen === isGoogleMapOpen) return;

        const newParams = new URLSearchParams(searchParams);
        if (isOpen) newParams.set('view', 'map');
        else {
            newParams.delete('view');
            setIsMapListExpanded(false); // Reset bottom sheet when returning to normal list
        }
        setSearchParams(newParams);
        setIsGoogleMapOpen(isOpen);
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

    const [showScrollTop, setShowScrollTop] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
            if (window.location.hostname.includes('localhost') && user?.agent_id && !params.agent_id) {
                params.agent_id = user.agent_id;
            }
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
            (prev.min_lat !== mapBounds.min_lat || prev.max_lat !== mapBounds.max_lat ||
                prev.min_lng !== mapBounds.min_lng || prev.max_lng !== mapBounds.max_lng);
        fetchTriggeredByBoundsRef.current = !!boundsJustChanged;
        prevMapBoundsRef.current = mapBounds;
        const isBoundsTriggeredFetch = !!boundsJustChanged;

        const controller = new AbortController();
        const fetchListings = async () => {
            const params = { ...filters, page, limit: 12 };
            if (mapBounds && isGoogleMapOpen) {
                params.min_lat = mapBounds.min_lat;
                params.max_lat = mapBounds.max_lat;
                params.min_lng = mapBounds.min_lng;
                params.max_lng = mapBounds.max_lng;
            }
            if (window.location.hostname.includes('localhost') && user?.agent_id && !params.agent_id) {
                params.agent_id = user.agent_id;
            }

            // Check if we already have this data (e.g. just closing a detail modal)
            const currentParamsKey = JSON.stringify(params);
            if (lastFetchedParamsRef.current === currentParamsKey && listings.length > 0) {
                setLoading(false);
                setInitialLoading(false);
                return;
            }

            // Optimistic loading: If map is open but bounds aren't ready, wait.
            // This prevents "showing all properties" flash on reload in Map View.
            if (isGoogleMapOpen && !mapBounds) {
                if (initialLoading) setLoading(true);
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
                    setInitialLoading(true);
                }
            }
            setLoading(true);

            try {
                // Map-pan fetch: re-add artificial delay so the user sees the skeleton loading state
                // giving a perception of deep data processing to feel premium.
                const response = isBoundsTriggeredFetch
                    ? (await Promise.all([
                        publicApi.getListings(params, { signal: controller.signal }),
                        new Promise(resolve => setTimeout(resolve, 800))
                    ]))[0]
                    : (await Promise.all([
                        publicApi.getListings(params, { signal: controller.signal }),
                        new Promise(resolve => setTimeout(resolve, 200))
                    ]))[0];

                const data = response.data;

                if (page === 1 && initialLoading) {
                    // Trigger exit animation for skeletons to fade out before revealing cards
                    setIsExiting(true);
                    await new Promise(resolve => setTimeout(resolve, 600)); // matches CSS exit duration
                    setListings(data.listings);
                    setIsExiting(false);
                    setInitialLoading(false);
                } else {
                    setListings(prev => page === 1 ? data.listings : [...prev, ...data.listings]);
                    if (page === 1) setInitialLoading(false);
                }

                setTotal(data.total || 0);
                lastFetchedParamsRef.current = currentParamsKey;
            } catch (error) {
                if (axios.isCancel(error)) return;
                console.error('Failed to fetch listings', error);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                    // Do not reset fetchTriggeredByBoundsRef here — keeps map from zooming/fitting when pan-load completes
                    // Only set initialLoading false here if it wasn't handled by the animation block
                    if (page !== 1) setInitialLoading(false);
                }
            }
        };
        fetchListings();
        return () => controller.abort();
    }, [filters, page, user, mapBounds, isGoogleMapOpen]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loading && listings.length < total) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 0.1 }
        );
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => { if (observerTarget.current) observer.unobserve(observerTarget.current); };
    }, [loading, listings.length, total]);

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
                        <h2 className="text-[15px] md:text-[13px] font-semibold text-gray-900">Selected</h2>
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
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-800 bg-white text-gray-900 text-[13px] font-medium transition-all duration-200 ease-out animate-fade-in ${isExiting ? 'opacity-0 scale-90 pointer-events-none' : ''
                                            }`}
                                        style={isExiting ? { minWidth: 0, overflow: 'hidden' } : undefined}
                                    >
                                        <span className="break-words max-w-[140px] min-w-0">{label}</span>
                                        <button
                                            type="button"
                                            onClick={handleRemove}
                                            className="flex-shrink-0 p-0.5 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
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
                <div className="space-y-2">
                    <label className="block text-[15px] md:text-[13px] font-semibold text-gray-900">Search by text</label>
                    <input
                        type="text"
                        value={pendingFilters.search ?? ''}
                        onChange={(e) => {
                            const v = e.target.value;
                            updatePendingFilters({ search: v });
                            setSearchTerm(v);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyFilters(); } }}
                        placeholder="Keyword, location, property name..."
                        className="w-full px-4 py-3 min-h-[48px] rounded-full border border-gray-200 bg-white text-gray-900 text-[13px] font-normal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all"
                    />
                </div>

                {/* Filter Sections */}
                <div className="space-y-10">


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
                                className="w-full flex items-center justify-between pl-4 pr-1.5 py-1.5 bg-white border border-gray-200 rounded-full transition-all group hover:border-gray-400"
                            >
                                <div className="flex items-center gap-3">
                                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
                                    <span className="text-[13px] font-normal text-gray-500 group-hover:text-gray-700">Search transit station...</span>
                                </div>
                                <div className="bg-white border border-gray-800 p-2 rounded-full active:scale-95 transition-all flex items-center justify-center">
                                    <MapIcon className="w-5 h-5 text-gray-800" strokeWidth={2} />
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
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-800 hover:border-gray-600 rounded-full transition-colors group"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-gray-800" />
                                        <span className="text-[13px] font-normal text-gray-900">
                                            {station ? station.label : id}
                                        </span>
                                        <XMarkIcon className="w-4 h-4 text-gray-600 group-hover:text-gray-800" strokeWidth={2.5} />
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
                            min={0}
                            max={100000000}
                            step={100000}
                            initialMin={pendingFilters.min_price ? parseInt(pendingFilters.min_price) : 0}
                            initialMax={pendingFilters.max_price ? parseInt(pendingFilters.max_price) : 100000000}
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
                                subtitle: d.company || 'Real Estate Developer',
                                image: d.logo || d.image,
                                isAvatar: true
                            }))}
                            selectedId={pendingFilters.developer_id}
                            onSelect={id => handlePendingFilterChange('developer_id', id)}
                            placeholder="Search developer..."
                            allLabel="All Developers"
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
                                subtitle: p.developer?.name || p.developer_name,
                                image: p.cover_image || p.image,
                                isAvatar: false
                            }))}
                            selectedId={pendingFilters.project_id}
                            onSelect={id => handlePendingFilterChange('project_id', id)}
                            placeholder="Search project..."
                            allLabel="All Projects"
                        />
                    </FilterCard>
                    {/* Spacer for bottom of sidebar */}
                    <div className="h-12 pointer-events-none" />
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-inter">
            {/* --- FILTER SIDEBAR (slide-in from right with open/close animation) --- */}
            {isSidebarOpen && (
                <>
                    <div
                        className={`fixed inset-0 z-[260] bg-black/25 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${isSidebarClosing ? 'opacity-0' : 'opacity-100'}`}
                        onClick={closeFilterSidebar}
                        aria-hidden
                    />
                    <aside
                        className={`fixed right-0 top-0 h-full w-full sm:w-[360px] sm:max-w-[85vw] z-[261] bg-white shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-out ${(isSidebarClosing || sidebarAnimateIn) ? 'translate-x-full' : 'translate-x-0'}`}
                        role="dialog"
                        aria-label="Filter settings"
                    >
                        {/* Sidebar header */}
                        <div className="flex-shrink-0 flex items-center justify-between px-4 lg:px-6 py-4 border-b border-gray-200 md:border-gray-100 bg-white">
                            <h3 className="text-[15px] md:text-[13px] font-bold text-gray-900">Filter Settings</h3>
                            <button
                                type="button"
                                onClick={closeFilterSidebar}
                                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                aria-label="Close filters"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Filter box content */}
                        <div className="flex-1 min-h-0 overflow-y-auto px-4 lg:px-6 py-6 custom-scrollbar modal-scrollable">
                            {renderFilterContent()}
                        </div>
                        {/* Sidebar footer (mobile-first): slimmer height, Clear on left, Search on right; iPhone safe area */}
                        <div
                            className="flex-shrink-0 py-4 lg:px-6 lg:pb-6 border-t border-gray-200 md:border-gray-100 bg-white md:bg-white flex flex-row flex-nowrap items-center justify-between gap-3 pt-4 pb-5"
                            style={{
                                paddingTop: 'max(1.25rem, env(safe-area-inset-top, 0px))',
                                paddingBottom: 'max(2rem, calc(1.75rem + env(safe-area-inset-bottom, 0px)))',
                                paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
                                paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
                            }}
                        >
                            <button
                                onClick={clearPendingFilters}
                                disabled={!hasActivePendingFilters}
                                className={`order-1 px-2.5 py-2 md:px-3 md:py-2 rounded text-[13px] font-normal transition-all duration-300 ${hasActivePendingFilters
                                    ? 'bg-transparent border-none text-red-600 hover:text-red-700'
                                    : 'bg-transparent border-none text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Clear all
                            </button>
                            <button
                                onClick={() => applyFilters()}
                                className="order-2 inline-flex items-center justify-center px-8 py-3.5 md:px-5 md:py-2.5 rounded-full text-[13px] md:text-[12px] font-normal transition-all duration-300 bg-gray-900 hover:bg-gray-800 text-white border border-gray-900 hover:border-gray-800 min-h-[48px] md:min-h-[40px]"
                            >
                                <span>Show {pendingTotal ?? total} {(pendingTotal ?? total) === 1 ? 'property' : 'properties'}</span>
                            </button>
                        </div>
                    </aside>
                </>
            )}



            {/* --- STANDARD GRID LAYOUT --- */}
            <div className="w-full bg-white min-h-screen relative">
                {/* Mobile search bar: real input + filter icon outside; shadow only when scrolled */}
                <div className={`lg:hidden sticky top-0 z-[100] bg-white py-4 px-4 transition-shadow duration-200 ${layoutScrolled ? 'shadow-[0_4px_12px_-2px_rgba(0,0,0,0.1)]' : ''}`}>
                    <div className="flex items-center gap-3 w-full">
                        <div className="flex-1 min-w-0 flex items-center gap-2 min-h-[52px] pl-4 pr-4 py-2 rounded-full bg-white border border-gray-200">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
                                placeholder="Search properties & filters"
                                className="flex-1 min-w-0 py-2.5 text-[14px] font-medium text-gray-900 placeholder:text-gray-500 bg-transparent border-none focus:outline-none focus:ring-0"
                                aria-label="Search properties"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => { setIsSidebarOpen(true); setSidebarAnimateIn(true); }}
                            className={`flex-shrink-0 relative w-11 h-11 rounded-full flex items-center justify-center text-gray-800 hover:text-gray-900 active:scale-95 transition-all ${activeFiltersList.length > 0 ? 'border-2 border-gray-800 bg-white hover:border-gray-700' : 'bg-white'}`}
                            aria-label="Open filters"
                        >
                            <AdjustmentsHorizontalIcon className={`${activeFiltersList.length > 0 ? 'w-5 h-5' : 'w-8 h-8'}`} />
                            {activeFiltersList.length > 0 && (
                                <span className="absolute -top-[4px] -right-[4px] min-w-[16px] h-[16px] px-0.5 flex items-center justify-center rounded-full bg-gray-800 text-white text-[10px] font-semibold border border-white leading-none">
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
                    />,
                    filterBarSlot
                )}

                {/* Main Content Grid — same width as nav: max-w-[1440px]; mobile: left/right padding */}
                <div className="max-w-[1600px] mx-auto w-full px-6 md:px-12 lg:px-20 mt-2 lg:mt-3">
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
                        <div className="lg:col-span-12 transition-all duration-500 relative">
                            <div className={`flex flex-col lg:flex-row gap-6 lg:gap-8 relative ${isGoogleMapOpen ? 'min-h-[85vh] pt-0.5' : 'min-h-[70vh]'}`}>
                                {/* Left Side: Property List — no overflow; full card height; scroll is on main container */}
                                <div className={`w-full flex flex-col ${isGoogleMapOpen ? (isMapExpanded ? 'hidden' : 'hidden lg:block lg:w-[42%] xl:w-[52%] h-full p-0') : ''}`}>
                                    {/* Header: Results Count */}
                                    <div className="mb-4 mt-1 flex justify-end">
                                        {initialLoading ? (
                                            <div className={`h-7 w-32 bg-gray-100 rounded animate-pulse ${isExiting ? 'animate-fadeOutDown' : ''}`} />
                                        ) : (listings || []).length > 0 ? (
                                            <h2 className="text-[15px] font-bold text-gray-900 animate-fadeInUp">
                                                {total} {total === 1 ? 'property' : 'properties'}
                                            </h2>
                                        ) : null}
                                    </div>

                                    {initialLoading ? (
                                        <div className={`grid gap-4 ${isGoogleMapOpen ? 'grid-cols-2 lg:grid-cols-1 xl:grid-cols-2' : (viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1')}`}>
                                            {[...Array(isGoogleMapOpen ? 6 : 12)].map((_, i) => <ListingSkeleton key={i} index={i} viewMode={isGoogleMapOpen ? 'map-list' : viewMode} isExiting={isExiting} />)}
                                        </div>

                                    ) : (listings || []).length > 0 ? (
                                        <>
                                            <div className={`grid gap-4 ${isGoogleMapOpen ? 'grid-cols-2 lg:grid-cols-1 xl:grid-cols-2' : (viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1')}`}>
                                                {(listings || []).map((l, i) => (
                                                    <div
                                                        key={l.id}
                                                        onMouseEnter={() => isGoogleMapOpen && setListHoveredListingId(l.id)}
                                                        onMouseLeave={() => setListHoveredListingId(null)}
                                                    >
                                                        <ListingCard
                                                            index={i}
                                                            listing={l}
                                                            viewMode={isGoogleMapOpen ? 'map-list' : viewMode}
                                                            priceFormat={priceFormat}
                                                            to={`${location.pathname}?${(function () {
                                                                const p = new URLSearchParams(searchParams);
                                                                p.set('detail', l.id);
                                                                return p.toString();
                                                            })()}`}
                                                        />
                                                    </div>
                                                ))}
                                                {loading && !initialLoading && !isGoogleMapOpen && (
                                                    <div className="contents">
                                                        {[...Array(viewMode === 'grid' ? 6 : 3)].map((_, i) => <ListingSkeleton key={`more-${i}`} index={i} viewMode={viewMode} />)}
                                                    </div>
                                                )}
                                            </div>
                                            <div ref={observerTarget} className="h-20" />
                                        </>
                                    ) : (
                                        <div className={`flex flex-col items-center justify-center py-24 px-4 bg-gray-50/50 border border-dashed border-gray-200 rounded-[24px] animate-fadeInUp flex-1 ${isGoogleMapOpen ? 'h-full min-h-[50vh]' : 'min-h-[50vh]'}`}>
                                            <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-5">
                                                <SparklesIcon className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-[17px] font-bold text-gray-900">No properties found</h3>
                                            <p className="text-[14px] text-gray-500 mt-1 max-w-[260px] text-center leading-relaxed">
                                                Try adjusting your search or filters to discover more matching results.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Map — sticky below filter bar: moves up with initial scroll then stops under filter bar */}
                                {isGoogleMapOpen && (
                                    <div className={`hidden lg:block transition-all duration-300 ${isMapExpanded ? 'w-full flex-1 relative h-[85vh] min-h-[85vh] lg:h-[calc(100vh-124px)] lg:min-h-[calc(100vh-124px)] xl:h-[85vh] xl:min-h-[85vh]' : `lg:w-[58%] xl:w-[48%] lg:sticky lg:self-start h-[85vh] min-h-[85vh] lg:h-[calc(100vh-124px)] lg:min-h-[calc(100vh-124px)] xl:h-[85vh] xl:min-h-[85vh] ${navVisible ? 'lg:top-[112px]' : 'lg:top-[80px]'}`}`}>
                                        <div className="map-overlays-rounded relative w-full h-full min-h-0 rounded-[24px] overflow-hidden shadow-sm border border-gray-200">
                                            <GoogleMap
                                                listings={listings}
                                                onMarkerClick={(property) => {
                                                    const newParams = new URLSearchParams(searchParams);
                                                    newParams.set('detail', property.id);
                                                    setSearchParams(newParams);
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
                                                    className="absolute top-4 right-4 z-[20] w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95"
                                                    aria-label="Close expanded map"
                                                >
                                                    <XMarkIcon className="w-6 h-6" />
                                                </button>
                                            )}
                                            {/* Map Overlays (hide when expanded so X is visible) */}
                                            {!isMapExpanded && (
                                                <div className="absolute top-4 right-4 z-10 pointer-events-none">
                                                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50 flex items-center gap-3">
                                                        <div className="bg-primary-50 p-2 rounded-full">
                                                            <GlobeAltIcon className="w-5 h-5 text-primary-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Map Mode</p>
                                                            <p className="text-sm font-bold text-gray-900">{total} Properties</p>
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




            {/* Scroll to top */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-28 right-6 md:bottom-8 md:right-8 bg-primary-600 text-white p-3 rounded-full shadow-lg transition-all z-[100] ${showScrollTop && !isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                <ArrowUpIcon className="w-6 h-6" />
            </button>

            {/* Google Maps Modal (Mobile Only) */}
            {
                isGoogleMapOpen && (
                    <div className="fixed inset-0 z-[200] bg-gray-100 flex flex-col items-center lg:!hidden pointer-events-auto overflow-hidden">
                        {/* MAP EXPLORER Header */}
                        {/* Mobile Header: Back button + Search Bar + Filter Icon */}
                        <div className={`absolute top-0 w-full bg-white/95 backdrop-blur-md border-b px-4 py-5 flex items-center gap-2 shadow-sm z-[205] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]`}>
                            <div className="flex-1 flex items-center gap-2 min-h-[48px] px-4 py-2 rounded-full bg-white border border-gray-200">
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search properties & filters"
                                    className="flex-1 min-w-0 py-1.5 text-[14px] font-medium text-gray-900 placeholder:text-gray-400 bg-transparent border-none focus:outline-none focus:ring-0"
                                    aria-label="Search properties"
                                />
                            </div>
                            <button
                                onClick={() => { setIsSidebarOpen(true); setSidebarAnimateIn(true); }}
                                className={`flex-shrink-0 relative w-11 h-11 rounded-full flex items-center justify-center text-gray-800 hover:text-gray-900 active:scale-95 transition-all ${activeFiltersList.length > 0 ? 'border-2 border-gray-800 bg-white hover:border-gray-700' : 'bg-white'}`}
                                aria-label="Open filters"
                            >
                                <AdjustmentsHorizontalIcon className={`${activeFiltersList.length > 0 ? 'w-5 h-5' : 'w-8 h-8'}`} />
                                {activeFiltersList.length > 0 && (
                                    <span className="absolute -top-[4px] -right-[4px] min-w-[16px] h-[16px] px-0.5 flex items-center justify-center rounded-full bg-gray-800 text-white text-[10px] font-semibold border border-white leading-none">
                                        {activeFiltersList.length > 99 ? '99+' : activeFiltersList.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Map Container - fills behind header and sheet */}
                        <div className="absolute inset-0 z-[201] pt-[88px]">
                            <GoogleMap
                                listings={listings}
                                onMarkerClick={(property) => {
                                    if (property && property.id) {
                                        setSelectedListingId(property.id);
                                    }
                                }}
                                onBoundsChanged={(bounds) => { setMapBounds(bounds); setPage(1); }}
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

                            {/* Mobile Legend Overlay - Move below header */}
                            <div className="absolute top-4 left-4 right-4 z-[202] pointer-events-none">
                                <div className="bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-full shadow-lg border border-white/50 flex items-center justify-center gap-8 animate-slide-up pointer-events-auto max-w-max mx-auto">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3.5 h-3.5 rounded-full bg-primary-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Rent</span>
                                    </div>
                                    <div className="w-px h-4 bg-gray-200" />
                                    <div className="flex items-center gap-3">
                                        <div className="w-3.5 h-3.5 rounded-full bg-orange-600 shadow-[0_0_10px_rgba(234,88,12,0.4)]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Sale</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Soft Dark Backdrop (appears when sheet is expanded) */}
                        <div
                            className={`absolute inset-0 bg-black/30 backdrop-blur-[1px] z-[202] transition-opacity duration-500 ${isMapListExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                            onClick={() => setIsMapListExpanded(false)}
                        />

                        {/* Draggable Bottom Sheet */}
                        <div
                            className={`absolute left-0 right-0 bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.15)] rounded-t-[32px] flex flex-col z-[203] ${isDragging ? '' : 'transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]'} ${!isMapListExpanded && !selectedListingId ? 'pointer-events-none' : 'pointer-events-auto'}`}
                            style={{
                                bottom: 0,
                                height: '100vh',
                                transform: isMapListExpanded
                                    ? `translateY(${sheetOffset}%)`
                                    : `translateY(calc(100% - ${selectedListingId ? '180px' : '90px'}))`,
                            }}
                        >

                            <div
                                className="flex flex-col items-center pt-4 pb-2 cursor-pointer touch-none select-none z-10 shrink-0 pointer-events-auto"
                                onClick={() => {
                                    if (!isMapListExpanded) {
                                        setIsMapListExpanded(true);
                                        setSheetOffset(48);
                                    } else {
                                        if (sheetOffset < 10) setSheetOffset(48);
                                        else setIsMapListExpanded(false);
                                    }
                                }}
                                onTouchStart={handleMapTouchStart}
                                onTouchMove={handleMapTouchMove}
                                onTouchEnd={handleMapTouchEnd}
                            >
                                <div className="w-10 h-1.5 rounded-full bg-gray-300" />
                            </div>

                            {/* Collapsed Content Base */}
                            {!isMapListExpanded && (
                                <div className="px-4 pb-6 pt-2 pb-safe animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    {!selectedListingId ? (
                                        <div
                                            key="homes-count"
                                            className="text-center font-black text-[15px] text-gray-900 cursor-pointer py-4 animate-in fade-in slide-in-from-top-2 duration-500 ease-out tracking-tight pointer-events-auto"
                                            onClick={() => setIsMapListExpanded(true)}
                                        >
                                            Over {total > 1000 ? '1,000' : total} homes
                                        </div>
                                    ) : (
                                        <div className="py-2">
                                            {(() => {
                                                const listing = listings.find(l => String(l.id) === String(selectedListingId));
                                                if (!listing) return null;
                                                const featuredImage = getMediaUrl(listing.media?.find((m) => m.type === 'image')?.url);
                                                const formatListingPrice = (p) => p ? p.toLocaleString() : 'N/A';
                                                const nearestStationName = (listing.station?.name_en || listing.station_name || '').split('(')[0].trim() || '';
                                                const isSaved = savedListingIds.includes(listing.id);

                                                return (
                                                    <div
                                                        key={`preview-${listing.id}`}
                                                        className="flex gap-4 relative animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-auto"
                                                        onClick={() => {
                                                            const newParams = new URLSearchParams(searchParams);
                                                            newParams.set('detail', listing.id);
                                                            setSearchParams(newParams);
                                                        }}
                                                    >
                                                        {/* Image Container */}
                                                        <div className="w-[100px] h-[100px] rounded-[16px] overflow-hidden flex-shrink-0 relative">
                                                            <img src={featuredImage} alt={listing.title} className="w-full h-full object-cover" />
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setSelectedListingId(null); }}
                                                                className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-900 active:scale-90 transition-all z-10"
                                                            >
                                                                <XMarkIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1 min-w-0 pr-2">
                                                                    <h3 className="text-[15px] font-semibold text-gray-900 truncate tracking-tight mb-0.5">{listing.title}</h3>
                                                                    <div className="text-[14px] text-gray-500 font-medium truncate mb-1">
                                                                        {listing.district || 'Bangkok'}{nearestStationName ? ` · ${nearestStationName}` : ''}
                                                                    </div>
                                                                    <div className="text-[13px] font-medium text-gray-600 py-0.5 px-2 bg-gray-50 rounded-md max-w-fit">
                                                                        {listing.bedrooms} Bed · {listing.bathrooms} Bath · {listing.area} Sqm
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleMapSaveClick(listing.id, isSaved); }}
                                                                    className={`flex-shrink-0 p-1.5 rounded-full transition-all active:scale-110 ${isSaved ? 'text-red-500' : 'text-gray-400'}`}
                                                                >
                                                                    {isSaved ? <HeartSolidIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                                                                </button>
                                                            </div>
                                                            <div className="flex items-baseline gap-1 mt-1">
                                                                <span className="text-[15px] font-bold text-gray-900 tracking-tight">฿{formatListingPrice(listing.price)}</span>
                                                                {listing.listing_type === 'rent' && <span className="text-[14px] text-gray-500 font-medium">/ mo</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Expanded Content */}
                            {isMapListExpanded && (
                                <div
                                    ref={expandedSheetRef}
                                    onScroll={handleSheetScroll}
                                    className="flex-1 overflow-y-auto overflow-x-hidden w-full px-4 pb-12 animate-in fade-in duration-300 bg-white shadow-xl isolate pointer-events-auto overscroll-contain rounded-t-[23px]"
                                >
                                    {/* Listings Stream */}
                                    <div className="flex flex-col gap-6 pb-32 mt-2 w-full max-w-lg mx-auto">
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
                                            <div className="flex flex-col gap-6 w-full">
                                                <ListingSkeleton />
                                                <ListingSkeleton />
                                                <ListingSkeleton />
                                            </div>
                                        )}
                                        {/* Simple subtle load more if they reach end */}
                                        {!loading && listings.length < total && (
                                            <button onClick={() => setPage(p => p + 1)} className="w-full py-4 text-center font-bold text-primary-600 mt-4 rounded-xl border border-primary-100 bg-primary-50">
                                                Load More Results
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
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

            {/* Floating Map Button (Mobile only) */}
            {
                showMapButton && (
                    <div
                        className="fixed left-0 right-0 flex justify-center z-[220] md:hidden pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                        style={{
                            bottom: !setMobileBottomNavVisible || (isMapView && (sheetOffset < 40 || (sheetOffset > 75 || !isMapListExpanded))) ? 'max(2.25rem, calc(env(safe-area-inset-bottom, 16px) + 20px))' : 'max(7.25rem, calc(80px + env(safe-area-inset-bottom, 16px) + 20px))'
                        }}
                    >
                        <div className="animate-fadeInUp pointer-events-auto">
                            <button
                                onClick={handleSwitchToMap}
                                className="flex items-center gap-2 px-6 py-3 bg-[#222222] text-white rounded-full shadow-lg font-bold text-sm tracking-wide active:scale-95 transition-transform"
                            >
                                Map <MapIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ListingsPage;
