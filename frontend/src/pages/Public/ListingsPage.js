import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { createPortal } from 'react-dom';
import { useSearchParams, useOutletContext, Link, useNavigate } from 'react-router-dom';
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

import {
    AdjustmentsHorizontalIcon,
    Squares2X2Icon,
    ListBulletIcon,
    MapIcon,
    MapPinIcon,
    XMarkIcon,
    BuildingOfficeIcon,
    MagnifyingGlassIcon,
    GlobeAltIcon,
    SparklesIcon,
    ArrowUpIcon,
    TagIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';

import {
    CheckCircleIcon
} from '@heroicons/react/24/solid';
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
];

const bedroomOptions = [
    { value: '', label: 'Any' },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
    { value: '5', label: '5+' },
];

const formatPrice = (p) => p ? `${parseInt(p).toLocaleString()}` : '';

const getSelectedOption = (options, value) => {
    if (!options || !value) return null;
    return options.find(opt => opt.value === value) || null;
};

const MapTransitionOverlay = ({ active, switchActive }) => {
    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-700 ease-in-out ${active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Background: Glassmorphism + Map Blur Effect */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-2xl" />

            {/* Subtle Gradient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] animate-pulse" />

            {/* Content Container */}
            <div className="relative flex flex-col items-center gap-8">
                {/* Globe Icon Container */}
                <div className="w-20 h-20 bg-white/80 backdrop-blur-lg rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 flex items-center justify-center animate-bounce-subtle">
                    <GlobeAltIcon className="w-10 h-10 text-gray-400" />
                </div>

                {/* Visual Dot */}
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />

                {/* Animated Toggle Icon (Shuttle style) */}
                <div className="relative w-16 h-8 bg-gray-200/50 rounded-full border border-gray-200/50 p-1 backdrop-blur-sm">
                    <div className={`w-6 h-6 bg-black rounded-full shadow-lg flex items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${switchActive ? 'translate-x-8' : 'translate-x-0'}`}>
                        <MapIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                </div>

                {/* Text Group */}
                <div className="flex flex-col items-center gap-3">
                    <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-gray-900 animate-fade-in-up">
                        Activating Map
                    </h2>
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                        <span className="flex gap-1">
                            <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0s' }} />
                            <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </span>
                        Generating View
                    </div>
                </div>
            </div>
        </div>
    );
};


const ListingsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { agent, actual_min_price, actual_max_price } = useTenant();
    const outletContext = useOutletContext() || {};
    const { navVisible, filterBarSlot } = outletContext;
    const [searchParams, setSearchParams] = useSearchParams();
    const [savedListingIds, setSavedListingIds] = useState([]);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const observerTarget = useRef(null);

    // Modal States

    const [isGoogleMapOpen, setIsGoogleMapOpen] = useState(searchParams.get('view') === 'map');
    const [isMapTransitioning, setIsMapTransitioning] = useState(false);
    const [overlaySwitchActive, setOverlaySwitchActive] = useState(false);
    const [isTransitModalOpen, setIsTransitModalOpen] = useState(false);
    const [listHoveredListingId, setListHoveredListingId] = useState(null);

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

    // Update local state when searchParams change, except during transition
    useEffect(() => {
        if (!isMapTransitioning) {
            setIsGoogleMapOpen(searchParams.get('view') === 'map');
        }
    }, [searchParams, isMapTransitioning]);

    // Effect for MapTransitionOverlay switch animation
    useEffect(() => {
        if (isMapTransitioning) {
            const timer = setTimeout(() => {
                setOverlaySwitchActive(true);
            }, 50);
            return () => clearTimeout(timer);
        } else {
            setOverlaySwitchActive(false);
        }
    }, [isMapTransitioning]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state for Map View
    const [isMapSidebarOpen, setIsMapSidebarOpen] = useState(false); // Sidebar state for Map Overlay
    const [isMapExpanded, setIsMapExpanded] = useState(false); // Map full-width (hide list) when true

    // Open sidebar filters when triggered from mobile nav search pill
    useEffect(() => {
        const mobileFilters = searchParams.get('mobile_filters');
        if (mobileFilters === '1') {
            setIsSidebarOpen(true);
            const next = new URLSearchParams(searchParams);
            next.delete('mobile_filters');
            setSearchParams(next);
        }
    }, [searchParams, setSearchParams]);

    const [viewMode, setViewMode] = useState(() => localStorage.getItem('listings_view_mode') || 'grid');
    const [priceLimits, setPriceLimits] = useState({ min: 0, max: 0 });
    const [priceFormat, setPriceFormat] = useState('short');
    const [agentId, setAgentId] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isAdvancedFilter, setIsAdvancedFilter] = useState(() => localStorage.getItem('is_advanced_filter') === 'true');
    const [developers, setDevelopers] = useState([]);
    const [projectsList, setProjectsList] = useState([]);
    const [mapBounds, setMapBounds] = useState(null); // Map bounds for geographic filtering

    // Use a ref to track bounds to avoid redundant state updates in onBoundsChanged
    const lastBoundsRef = useRef(null);

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
        if (isOpen === isGoogleMapOpen || isMapTransitioning) return;

        setIsMapTransitioning(true);

        // Update URL immediately so map/list starts loading in background
        const newParams = new URLSearchParams(searchParams);
        if (isOpen) newParams.set('view', 'map');
        else newParams.delete('view');
        setSearchParams(newParams);

        // Premium transition delay
        setTimeout(() => {
            setIsMapTransitioning(false);
        }, 1200);
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
            station_id: searchParams.get('station_id') || saved.station_id || '',
            max_distance_to_station: searchParams.get('max_distance_to_station') || saved.max_distance_to_station || '',
            developer_id: searchParams.get('developer_id') || saved.developer_id || '',
            project_id: searchParams.get('project_id') || saved.project_id || '',
            search: searchParams.get('search') || saved.search || '',
            min_area: searchParams.get('min_area') || saved.min_area || '',
            max_area: searchParams.get('max_area') || saved.max_area || '',
        };
    });
    const [pendingFilters, setPendingFilters] = useState(() => ({ type: '', listing_type: '', min_price: '', max_price: '', bedrooms: '', station_id: '', max_distance_to_station: '', developer_id: '', project_id: '', search: '', min_area: '', max_area: '' }));
    const prevSidebarOpenRef = useRef(false);

    const [searchTerm, setSearchTerm] = useState(filters.search);


    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== filters.search) {
                // Pass false for shouldScroll to keep focus/position while typing
                handleFilterChange('search', searchTerm, false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);
    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    // Sync filters with URL search params
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        const newFilters = {
            type: params.get('type') || '',
            listing_type: params.get('listing_type') || '',
            min_price: params.get('min_price') || '',
            max_price: params.get('max_price') || '',
            bedrooms: params.get('bedrooms') || '',
            station_id: params.get('station_id') || '',
            max_distance_to_station: params.get('max_distance_to_station') || '',
            developer_id: params.get('developer_id') || '',
            project_id: params.get('project_id') || '',
            search: params.get('search') || '',
        };

        // Only update if filters have actually changed to avoid infinite loops
        const hasChanged = Object.keys(newFilters).some(key => newFilters[key] !== filters[key]);
        if (hasChanged) {
            setFilters(newFilters);
            setPendingFilters(newFilters);
            setPage(1);
        }
    }, [searchParams]);

    // When sidebar opens, sync pending filters from applied filters so user can edit and apply
    useEffect(() => {
        if (isSidebarOpen && !prevSidebarOpenRef.current) {
            setPendingFilters({ ...filters });
        }
        prevSidebarOpenRef.current = isSidebarOpen;
    }, [isSidebarOpen, filters]);


    useEffect(() => {
        const controller = new AbortController();
        const fetchListings = async () => {
            // Optimistic loading: If map is open but bounds aren't ready, wait.
            // This prevents "showing all properties" flash on reload in Map View.
            if (isGoogleMapOpen && !mapBounds) {
                if (initialLoading) setLoading(true);
                return;
            }

            // Only show initial skeletons if we are on page 1
            if (page === 1) {
                // Avoid "flash" in map view OR during typing search.
                // If map is open OR filters.search is changing, we don't clear results.
                const isMapBoundsUpdate = isGoogleMapOpen && listings.length > 0;
                const isSearchTyped = searchTerm !== filters.search && listings.length > 0;

                if (!isMapBoundsUpdate && !isSearchTyped) {
                    setInitialLoading(true);
                    setListings([]); // Clear listings for fresh fetch on page 1
                }
            }
            setLoading(true);

            try {
                const params = { ...filters, page, limit: 12 };
                // Add map bounds to params if available and map is open
                if (mapBounds && isGoogleMapOpen) {
                    params.min_lat = mapBounds.min_lat;
                    params.max_lat = mapBounds.max_lat;
                    params.min_lng = mapBounds.min_lng;
                    params.max_lng = mapBounds.max_lng;
                }
                if (window.location.hostname.includes('localhost') && user?.agent_id && !params.agent_id) {
                    params.agent_id = user.agent_id;
                }

                // Call API and minimal delay in parallel
                const [response] = await Promise.all([
                    publicApi.getListings(params, { signal: controller.signal }),
                    new Promise(resolve => setTimeout(resolve, 200))
                ]);

                const data = response.data;

                if (page === 1 && initialLoading) {
                    // Trigger exit animation
                    setIsExiting(true);
                    await new Promise(resolve => setTimeout(resolve, 200));
                    setListings(data.listings);
                    setIsExiting(false);
                    setInitialLoading(false);
                } else {
                    setListings(prev => page === 1 ? data.listings : [...prev, ...data.listings]);
                }

                setTotal(data.total || 0);
            } catch (error) {
                if (axios.isCancel(error)) return;
                console.error('Failed to fetch listings', error);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
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
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        if (isSidebarOpen) setPendingFilters(prev => ({ ...prev, [key]: value }));
        localStorage.setItem('listing_filters', JSON.stringify(newFilters));
        setPage(1);

        if (shouldScroll) {
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to prevent jump
            const newParams = new URLSearchParams(searchParams);
            if (value) newParams.set(key, value);
            else newParams.delete(key);
            setSearchParams(newParams);
        }
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

    const applyFilters = () => {
        // Commit pending filters to applied filters so the fetch effect runs and data loads
        const next = { ...pendingFilters };
        setFilters(next);
        setSearchTerm(next.search ?? '');
        localStorage.setItem('listing_filters', JSON.stringify(next));
        setPage(1);
        const newParams = new URLSearchParams(searchParams);
        const view = searchParams.get('view');
        ['type', 'listing_type', 'min_price', 'max_price', 'bedrooms', 'station_id', 'max_distance_to_station', 'developer_id', 'project_id', 'search', 'min_area', 'max_area'].forEach(key => {
            const v = next[key];
            if (v) newParams.set(key, v);
            else newParams.delete(key);
        });
        if (view) newParams.set('view', view);
        setSearchParams(newParams);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsSidebarOpen(false);
    };

    const clearFilters = () => {
        setFilters({
            type: '',
            listing_type: '',
            min_price: '',
            max_price: '',
            bedrooms: '',
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
        const opt = propertyTypeOptions.find(o => o.value === filters.type);
        if (opt) activeFiltersList.push({ label: opt.label, key: 'type' });
    }
    if (filters.listing_type) {
        const opt = listingTypeOptions.find(o => o.value === filters.listing_type);
        if (opt) activeFiltersList.push({ label: opt.label, key: 'listing_type' });
    }
    if (filters.bedrooms) {
        const opt = bedroomOptions.find(o => o.value === filters.bedrooms);
        if (opt) activeFiltersList.push({ label: opt.label, key: 'bedrooms' });
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

    // --- Render Helper: Compact Filter Content (Reusable for Sidebar/Modal) ---
    const renderFilterContent = () => {
        return (
            <div className="space-y-6 [&>*:first-child]:mt-0">
                {/* Advanced Filter Toggle */}
                <div className="flex items-center justify-between py-4 px-6 bg-white border border-gray-100 rounded-[10px] shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[10px] bg-primary-50 flex items-center justify-center transition-all duration-300">
                            <AdjustmentsHorizontalIcon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="flex flex-col">
                            <div className="text-[14px] font-bold text-gray-900 leading-none">Advanced Filter</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">More Options</div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const newValue = !isAdvancedFilter;
                            setIsAdvancedFilter(newValue);
                            localStorage.setItem('is_advanced_filter', newValue);
                        }}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none ${isAdvancedFilter ? 'bg-primary-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-300 ease-in-out ${isAdvancedFilter ? 'translate-x-[20px]' : 'translate-x-[4px]'}`}
                        />
                    </button>
                </div>

                {/* Properties Found Counter */}
                <div className="flex items-center gap-3 px-2 text-primary-600 text-[16px] font-bold transition-all duration-300 mt-2">
                    <div className="w-6 h-6 rounded-full border-2 border-primary-600 flex items-center justify-center flex-shrink-0">
                        <CheckIcon className="w-3.5 h-3.5 stroke-[4]" />
                    </div>
                    <span>{total} {total === 1 ? 'Property' : 'Properties'} Found</span>
                </div>

                {/* Text Search — applied only when user clicks Search (Apply) */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-900">Search by text</label>
                    <input
                        type="text"
                        value={pendingFilters.search ?? ''}
                        onChange={(e) => updatePendingFilters({ search: e.target.value })}
                        placeholder="Keyword, location, property name..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                    />
                </div>

                {/* Filter Sections */}
                <div className="space-y-3">


                    {/* LISTING TYPE (Buy/Rent) */}
                    <FilterCard
                        title="Listing Type"
                        icon={FilterIcons.tag}
                    >
                        <div className="flex flex-wrap gap-2">
                            {listingTypeOptions.map(({ value, label }) => {
                                const isActive = filters.listing_type === value;
                                return (
                                    <FilterPill
                                        key={value}
                                        label={label}
                                        isActive={isActive}
                                        onClick={() => handleFilterChange('listing_type', value)}
                                    />
                                );
                            })}
                        </div>
                    </FilterCard>

                    {/* PROPERTY TYPE */}
                    <FilterCard
                        title="Property Type"
                        icon={FilterIcons.property}
                    >
                        <div className="flex flex-wrap gap-2">
                            {propertyTypeOptions.map(({ value, label }) => {
                                const isActive = filters.type === value || (!filters.type && value === '');
                                return (
                                    <FilterPill
                                        key={value}
                                        label={label}
                                        isActive={isActive}
                                        onClick={() => handleFilterChange('type', value)}
                                    />
                                );
                            })}
                        </div>
                    </FilterCard>

                    {/* BEDROOMS */}
                    <FilterCard
                        title="Bedrooms"
                        icon={FilterIcons.bed}
                    >
                        <div className="flex flex-wrap gap-2">
                            {bedroomOptions.map(({ value, label }) => {
                                const isActive = filters.bedrooms === value || (!filters.bedrooms && value === '');
                                return (
                                    <FilterPill
                                        key={value}
                                        label={label}
                                        isActive={isActive}
                                        onClick={() => handleFilterChange('bedrooms', value)}
                                    />
                                );
                            })}
                        </div>
                    </FilterCard>

                    {/* BATHROOMS */}
                    <FilterCard
                        title="Bathrooms"
                        icon={FilterIcons.bath}
                    >
                        <div className="flex flex-wrap gap-2">
                            {bathroomOptions.map(({ value, label }) => {
                                const isActive = filters.bathrooms === value || (!filters.bathrooms && value === '');
                                return (
                                    <FilterPill
                                        key={value}
                                        label={label}
                                        isActive={isActive}
                                        onClick={() => handleFilterChange('bathrooms', value)}
                                    />
                                );
                            })}
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
                                className="w-full flex items-center justify-between pl-4 pr-1.5 py-1.5 bg-gray-50 border border-gray-100 rounded-[10px] transition-all group shadow-sm hover:border-primary-500/30 hover:bg-white"
                            >
                                <div className="flex items-center gap-3">
                                    <MagnifyingGlassIcon className="w-5 h-5 text-primary-600/70 group-hover:text-primary-600 transition-colors" />
                                    <span className="font-semibold text-gray-500 group-hover:text-gray-700">Search transit station...</span>
                                </div>
                                <div className="bg-primary-600 text-white p-2 rounded-full shadow-md shadow-primary-900/10 active:scale-95 transition-all flex items-center justify-center">
                                    <MapIcon className="w-5 h-5" strokeWidth={2} />
                                </div>
                            </button>

                            {/* Selection Pills */}
                            {(filters.station_id || '').split(',').filter(Boolean).map(id => {
                                const station = flatStations.find(s => s.value === id);
                                return (
                                    <button
                                        key={id}
                                        onClick={() => {
                                            const currentIds = filters.station_id.split(',');
                                            const newIds = currentIds.filter(i => i !== id);
                                            handleFilterChange('station_id', newIds.join(','));
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 rounded-full transition-colors group"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-primary-500" />
                                        <span className="text-sm font-bold text-primary-600">
                                            {station ? station.label : id}
                                        </span>
                                        <XMarkIcon className="w-4 h-4 text-primary-500 group-hover:text-primary-600" strokeWidth={2.5} />
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
                            initialMin={filters.min_price ? parseInt(filters.min_price) : 0}
                            initialMax={filters.max_price ? parseInt(filters.max_price) : 100000000}
                            onChange={({ min, max }) => {
                                updateFilters({
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
                            initialMin={filters.min_area ? parseInt(filters.min_area) : 0}
                            initialMax={filters.max_area ? parseInt(filters.max_area) : 500}
                            onChange={({ min, max }) => {
                                updateFilters({
                                    min_area: min?.toString() || '',
                                    max_area: max?.toString() || ''
                                });
                            }}
                        />
                    </FilterCard>


                    {
                        isAdvancedFilter && (
                            <>
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
                                        selectedId={filters.developer_id}
                                        onSelect={id => handleFilterChange('developer_id', id)}
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
                                        selectedId={filters.project_id}
                                        onSelect={id => handleFilterChange('project_id', id)}
                                        placeholder="Search project..."
                                        allLabel="All Projects"
                                    />
                                </FilterCard>
                            </>
                        )
                    }
                    {/* Spacer for bottom of sidebar */}
                    <div className="h-12 pointer-events-none" />
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-inter">
            {/* Map Transition Loading Overlay */}
            {isMapTransitioning && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-all duration-300 animate-in fade-in">
                    <div className="flex flex-col items-center gap-8">
                        {/* Map Logo Design */}
                        <div className="flex flex-col items-center gap-4 mb-2 animate-in fade-in zoom-in duration-700">
                            <div className="w-20 h-20 bg-primary-50 rounded-[24px] flex items-center justify-center shadow-sm border border-primary-100">
                                <GlobeAltIcon className="w-12 h-12 text-primary-600 animate-pulse" />
                            </div>
                            <div className="w-1.5 h-1.5 bg-primary-600 rounded-full opacity-50" />
                        </div>

                        {/* Custom Animated Switch Logo */}
                        <div className="relative w-32 h-16 bg-gray-100 rounded-full p-2 border-2 border-gray-200 shadow-[inner_0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden">
                            <div
                                className="absolute top-2 w-12 h-12 bg-primary-600 rounded-full shadow-lg transition-all duration-700 ease-in-out flex items-center justify-center text-white"
                                style={{
                                    left: overlaySwitchActive
                                        ? (!isGoogleMapOpen ? 'calc(100% - 3.5rem)' : '0.5rem')
                                        : (!isGoogleMapOpen ? '0.5rem' : 'calc(100% - 3.5rem)')
                                }}
                            >
                                {overlaySwitchActive
                                    ? (!isGoogleMapOpen ? <MapIcon className="w-7 h-7" /> : <ListBulletIcon className="w-7 h-7" />)
                                    : (!isGoogleMapOpen ? <ListBulletIcon className="w-7 h-7" /> : <MapIcon className="w-7 h-7" />)
                                }
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-2 text-center">
                            <h3 className="text-xl font-black uppercase tracking-[0.2em] text-primary-600">
                                {!isGoogleMapOpen ? 'Activating Map' : 'Returning to List'}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest pl-1">
                                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                <span>Generating View</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* --- FILTER SIDEBAR (slide-in from left when Filters clicked) --- */}
            {isSidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[260] bg-black/25 backdrop-blur-[2px] transition-opacity duration-300"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-hidden
                    />
                    <aside
                        className="fixed right-0 top-0 h-full w-full sm:w-[320px] sm:max-w-[85vw] z-[261] bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
                        role="dialog"
                        aria-label="Filter settings"
                    >
                        {/* Sidebar header */}
                        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 md:border-gray-100 bg-white">
                            <h3 className="text-lg font-bold text-gray-900">Filter Settings</h3>
                            <button
                                type="button"
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                aria-label="Close filters"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Filter box content */}
                        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 custom-scrollbar modal-scrollable">
                            {renderFilterContent()}
                        </div>
                        {/* Sidebar footer (mobile-first): slimmer height, Clear on left, Search on right; desktop keeps centered layout */}
                        <div className="flex-shrink-0 px-4 py-4 pb-5 lg:px-6 lg:pb-6 border-t border-gray-200 md:border-gray-100 bg-white md:bg-white flex flex-row flex-nowrap items-center justify-between md:justify-center gap-3">
                            <button
                                onClick={clearFilters}
                                disabled={!hasActiveFilters}
                                className={`order-1 md:order-2 px-2.5 py-2 md:px-3 md:py-2 rounded text-[13px] font-bold transition-all duration-300 ${hasActiveFilters
                                    ? 'bg-transparent border-none text-rose-600 hover:text-rose-700'
                                    : 'bg-transparent border-none text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Clear all filters
                            </button>
                            <button
                                onClick={applyFilters}
                                className="order-2 md:order-1 inline-flex items-center justify-center px-6 py-2.5 md:px-8 md:py-3 rounded-full text-[13px] font-bold transition-all duration-300 bg-primary-600 text-white hover:bg-primary-700 border border-primary-600 shadow-sm hover:shadow-md"
                            >
                                <MagnifyingGlassIcon className="w-4 h-4 mr-1.5" />
                                <span>Search</span>
                            </button>
                        </div>
                    </aside>
                </>
            )}



            {/* --- STANDARD GRID LAYOUT --- */}
            <div className="w-full bg-white min-h-screen relative">
                {/* Header Mobile */}
                <div className="pt-4 pb-2 px-4 lg:hidden">
                    <div className="flex items-baseline justify-between">
                        <h1 className="text-xl font-semibold text-gray-900">Properties</h1>
                        <span className="text-sm font-medium text-gray-500">{total} results</span>
                    </div>
                </div>

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
                        onOpenFilters={() => setIsSidebarOpen(true)}
                        hasActiveFilters={hasActiveFilters}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        isGoogleMapOpen={isGoogleMapOpen}
                        onToggleMapView={toggleMapView}
                        isMapTransitioning={isMapTransitioning}
                        navVisible={navVisible}
                        isScrolled={isScrolled}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onQuickSearchClick={handleQuickSearchFilters}
                    />,
                    filterBarSlot
                )}
                {/* Spacer so content doesn't sit under the fixed filter bar (bar height 90px) */}
                <div className="hidden lg:block h-[90px] flex-shrink-0" aria-hidden />

                {/* Main Content Grid — same width as nav: max-w-[1440px] + px-6 lg:px-12 */}
                <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-12 mt-2 lg:mt-5">
                    {/* Main Content Grid — at lg only: no sidebar (use Filters drawer); at xl: sidebar visible again */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar — removed from list page; use Filters button to open filter drawer */}
                        <div className={`hidden transition-all duration-500 ${isGoogleMapOpen ? '!hidden' : ''}`}>
                            <div className={`sticky transition-all duration-500 ease-in-out ${navVisible ? 'top-[154px] h-[calc(100vh-154px)]' : 'top-[90px] h-[calc(100vh-90px)]'} flex flex-col bg-white border-r border-gray-100/50`}>
                                <div className="flex-1 overflow-y-auto custom-scrollbar-hover scroll-smooth pr-4 overscroll-contain group">
                                    {renderFilterContent()}
                                </div>

                                {/* Desktop Sidebar Fixed Footer */}
                                <div className="flex-shrink-0 p-6 border-t border-gray-50 bg-white flex flex-row flex-nowrap items-center justify-center gap-3">
                                    <button
                                        onClick={applyFilters}
                                        className="px-8 py-3 rounded-full text-[13px] font-bold transition-all duration-300 bg-primary-600 text-white hover:bg-primary-700 border border-primary-600 shadow-sm hover:shadow-md"
                                    >
                                        Apply Filter
                                    </button>
                                    <button
                                        onClick={clearFilters}
                                        disabled={!hasActiveFilters}
                                        className={`px-3 py-2 rounded text-[13px] font-bold transition-all duration-300 ${hasActiveFilters
                                            ? 'bg-transparent border-none text-rose-600 hover:text-rose-700'
                                            : 'bg-transparent border-none text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Listings Grid or Map — full width at lg; at xl sidebar visible so 9 cols */}
                        <div className="lg:col-span-12 transition-all duration-500 relative">
                            <div
                                className={`flex flex-col lg:flex-row gap-8 ${isGoogleMapOpen ? 'min-h-[80vh]' : 'min-h-[70vh]'}`}
                            >
                                {/* Left Side: Property List — no overflow; full card height; scroll is on main container */}
                                <div className={`w-full ${isGoogleMapOpen ? (isMapExpanded ? 'hidden' : 'hidden lg:block lg:w-[42%] xl:w-[52%] p-0') : ''}`}>
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
                                                        className="animate-in fade-in fill-mode-both duration-500"
                                                        style={{ animationDelay: `${(i % 12) * 50}ms` }}
                                                        onMouseEnter={() => isGoogleMapOpen && setListHoveredListingId(l.id)}
                                                        onMouseLeave={() => setListHoveredListingId(null)}
                                                    >
                                                        <ListingCard listing={l} viewMode={isGoogleMapOpen ? 'map-list' : viewMode} priceFormat={priceFormat} />
                                                    </div>
                                                ))}
                                                {loading && !initialLoading && (
                                                    <div className="contents">
                                                        {[...Array(viewMode === 'grid' ? (isGoogleMapOpen ? 3 : 6) : 3)].map((_, i) => <ListingSkeleton key={`more-${i}`} index={i} viewMode={isGoogleMapOpen ? 'map-list' : viewMode} />)}
                                                    </div>
                                                )}
                                            </div>
                                            <div ref={observerTarget} className="h-20" />
                                        </>
                                    ) : (
                                        <div className="text-center py-20 bg-white rounded-[24px] animate-fadeInUp">
                                            <SparklesIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-gray-900">No properties found</h3>
                                            <p className="text-gray-500 mt-2">Try adjusting your filters to find more results</p>
                                            <button onClick={clearFilters} className="mt-6 text-primary-600 font-bold underline">Clear all filters</button>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Map — sticky below filter bar: moves up with initial scroll then stops under filter bar */}
                                {((isGoogleMapOpen || (isMapTransitioning && searchParams.get('view') === 'map'))) && (
                                    <div className={`hidden lg:block transition-all duration-300 ${isMapExpanded ? 'w-full flex-1 relative h-[80vh] min-h-[80vh] lg:h-[calc(100vh-12.5rem)] lg:min-h-[calc(100vh-12.5rem)] xl:h-[80vh] xl:min-h-[80vh]' : `lg:w-[58%] xl:w-[48%] lg:sticky lg:self-start h-[80vh] min-h-[80vh] lg:h-[calc(100vh-12.5rem)] lg:min-h-[calc(100vh-12.5rem)] xl:h-[80vh] xl:min-h-[80vh] ${navVisible ? 'lg:top-[154px]' : 'lg:top-[90px]'}`}`}>
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
                                                isVisible={isGoogleMapOpen || (isMapTransitioning && searchParams.get('view') === 'map')}
                                                onSaveClick={handleMapSaveClick}
                                                savedListingIds={savedListingIds}
                                                highlightedMarkerListingId={listHoveredListingId}
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

            {/* Mobile Floating Action Button - Filters */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] safe-area-bottom pointer-events-none flex items-center gap-3 shadow-2xl rounded-full">
                <button
                    onClick={() => toggleMapView()}
                    className="pointer-events-auto flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-3.5 rounded-full shadow-xl hover:shadow-2xl active:scale-95 transition-all border border-gray-700"
                >
                    {isGoogleMapOpen ? <ListBulletIcon className="w-5 h-5 stroke-[2]" /> : <MapIcon className="w-5 h-5 stroke-[2]" />}
                    <span className="text-sm font-bold tracking-wide">{isGoogleMapOpen ? 'List' : 'Map'}</span>
                </button>
                <div className="w-px h-6 bg-gray-700 pointer-events-none" />
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="pointer-events-auto relative flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-3.5 rounded-full shadow-xl hover:shadow-2xl active:scale-95 transition-all border border-gray-700"
                >
                    <AdjustmentsHorizontalIcon className="w-5 h-5 text-white stroke-[2]" />
                    <span className="text-sm font-bold tracking-wide">Filters</span>
                    {hasActiveFilters && (
                        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-primary-600 rounded-full border-2 border-gray-900 translate-x-1/4 -translate-y-1/4" />
                    )}
                </button>
            </div>

            {/* Google Maps Modal (Mobile Only) */}
            {
                (isGoogleMapOpen || (isMapTransitioning && searchParams.get('view') === 'map')) && (
                    <div className="fixed inset-0 z-[120] bg-white flex flex-col items-center lg:!hidden pointer-events-auto lg:pointer-events-none lg:opacity-0">
                        <div className="w-full bg-white border-b px-4 py-4 flex items-center justify-between shadow-sm z-10 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary-50 w-12 h-12 rounded-[20px] shadow-sm flex items-center justify-center">
                                    <GlobeAltIcon className="w-6 h-6 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 leading-none">Map Explorer</h2>
                                    <p className="text-[10px] font-bold text-gray-500 mt-1.5 uppercase tracking-tighter">Found {total} locations</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleMapView(false)}
                                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                                style={{ borderRadius: 'var(--btn-radius)' }}
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 w-full relative">
                            <GoogleMap
                                listings={listings}
                                onMarkerClick={(property) => {
                                    const newParams = new URLSearchParams(searchParams);
                                    newParams.set('detail', property.id);
                                    setSearchParams(newParams);
                                }}
                                onBoundsChanged={(bounds) => { setMapBounds(bounds); setPage(1); }}
                                onSaveClick={handleMapSaveClick}
                                savedListingIds={savedListingIds}
                                highlightedMarkerListingId={listHoveredListingId}
                                isVisible={isGoogleMapOpen || (isMapTransitioning && searchParams.get('view') === 'map')}
                            />

                            {/* Mobile Legend Overlay - Theme Card Style */}
                            <div className="absolute top-4 left-4 right-4 z-10">
                                <div className="bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-[20px] shadow-xl border border-white/50 flex items-center justify-center gap-8 animate-slide-up">
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

                        {/* Quick Action Footer */}
                        <div className="w-full p-4 bg-white border-t flex flex-col gap-4 safe-area-bottom">
                            <button
                                onClick={() => toggleMapView(false)}
                                className="w-full bg-primary-600 text-white py-4.5 rounded-[20px] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-200 active:scale-95 transition-all text-center flex items-center justify-center h-14"
                            >
                                Back to List
                            </button>
                        </div>
                    </div>
                )
            }
            {/* Status Overlays */}
            <MapTransitionOverlay active={isMapTransitioning} switchActive={overlaySwitchActive} />

            <TransitFilterModal
                isOpen={isTransitModalOpen}
                onClose={() => setIsTransitModalOpen(false)}
                initialSelected={filters.station_id ? filters.station_id.split(',') : []}
                onApply={handleStationSelect}
            />

            <ListingDetailModal />
        </div >
    );
};

export default ListingsPage;
