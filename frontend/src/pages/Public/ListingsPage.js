import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useOutletContext, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { publicApi } from '../../services/api';
import ListingCard from '../../components/Listings/ListingCard';
import GoogleMap from '../../components/Listings/GoogleMap';
import TransitMapFilter from '../../components/TransitMap/TransitMapFilter';
import StyledSelect from '../../components/Form/StyledSelect';
import ShowcaseBanners from '../../components/Common/ShowcaseBanners';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ListingDetailModal from '../../components/Listings/ListingDetailModal';
import FilterBar from '../../components/ui/FilterBar';
import Modal from '../../components/ui/Modal';
import ListingSkeleton from '../../components/ui/ListingSkeleton';

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

const bedroomOptions = [
    { value: '', label: 'Any Beds' },
    { value: '1', label: '1+ Beds' },
    { value: '2', label: '2+ Beds' },
    { value: '3', label: '3+ Beds' },
    { value: '4', label: '4+ Beds' },
    { value: '5', label: '5+ Beds' },
];

const formatPrice = (p) => p ? `${parseInt(p).toLocaleString()}` : '';

const getSelectedOption = (options, value) => {
    if (!options || !value) return null;
    return options.find(opt => opt.value === value) || null;
};


const ListingsPage = () => {
    const { user } = useAuth();
    const { navVisible } = useOutletContext() || { navVisible: true };
    const [searchParams, setSearchParams] = useSearchParams();
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

    const [viewMode, setViewMode] = useState(() => localStorage.getItem('listings_view_mode') || 'grid');
    const [priceLimits, setPriceLimits] = useState({ min: 0, max: 0 });
    const [priceFormat, setPriceFormat] = useState('short');
    const [agentId, setAgentId] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
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
                const flat = fetchedStations.map(station => ({
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

    // Filter states
    const [filters, setFilters] = useState(() => {
        const saved = JSON.parse(localStorage.getItem('listing_filters') || '{}');
        return {
            type: searchParams.get('type') || saved.type || '',
            listing_type: searchParams.get('listing_type') || saved.listing_type || '',
            min_price: searchParams.get('min_price') || saved.min_price || '',
            max_price: searchParams.get('max_price') || saved.max_price || '',
            bedrooms: searchParams.get('bedrooms') || saved.bedrooms || '',
            station_id: searchParams.get('station_id') || saved.station_id || '',
            search: searchParams.get('search') || saved.search || '',
        };
    });

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
            search: params.get('search') || '',
        };

        // Only update if filters have actually changed to avoid infinite loops
        const hasChanged = Object.keys(newFilters).some(key => newFilters[key] !== filters[key]);
        if (hasChanged) {
            setFilters(newFilters);
            setPage(1);
        }
    }, [searchParams]);


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

                // Call API and artificial delay in parallel for premium "serial" loading feel
                const [response] = await Promise.all([
                    publicApi.getListings(params, { signal: controller.signal }),
                    new Promise(resolve => setTimeout(resolve, 1500)) // Artificial 1.5s delay as requested
                ]);

                const data = response.data;

                if (page === 1 && initialLoading) {
                    // Trigger exit animation
                    setIsExiting(true);
                    // Wait for the longest delay (11 * 60ms) + animation duration (600ms) = ~1260ms
                    await new Promise(resolve => setTimeout(resolve, 1300));
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

    const handleStationSelect = (stationId) => {
        handleFilterChange('station_id', stationId);
    };

    const clearFilters = () => {
        setFilters({
            type: '',
            listing_type: '',
            min_price: '',
            max_price: '',
            bedrooms: '',
            station_id: '',
            search: '',
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
    if (filters.station_id) {
        // Use flatStations (already flat option objects) to find the label
        const station = flatStations.find(s => s && s.value === filters.station_id);
        if (station) activeFiltersList.push({ label: `Station: ${station.label}`, key: 'station_id' });
    }

    // --- Render Helper: Compact Filter Content (Reusable for Sidebar/Modal) ---
    const renderFilterContent = () => {
        return (
            <div className="space-y-6">
                {/* Active Filters Section */}
                <div className="p-4 rounded-[3px] border border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <AdjustmentsHorizontalIcon className="w-5 h-5" />
                            Active Filters
                        </h3>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-[14px] font-medium text-red-500 hover:text-red-700 transition-colors">Clear All</button>
                        )}
                    </div>
                    {hasActiveFilters ? (
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {activeFiltersList.map((filter) => (
                                    <span key={filter.key} className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary-50 text-primary-700 text-[14px] font-bold rounded-full border border-primary-100 shadow-sm leading-none">
                                        {filter.label}
                                        <button onClick={() => handleFilterChange(filter.key, '')} className="hover:text-red-500 transition-colors">
                                            <XMarkIcon className="w-3.5 h-3.5 stroke-[2]" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <div className="bg-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <SparklesIcon className="w-6 h-6 text-primary-600" />
                            </div>
                            <p className="text-sm text-gray-500">Find your perfect home with filters</p>
                        </div>
                    )}

                    <div className="mt-6 bg-primary-50 p-3 rounded-[3px] text-primary-800 text-[14px] font-bold border border-primary-100 flex items-center gap-2 justify-center shadow-sm">
                        <CheckCircleIcon className="w-5 h-5" />
                        {total} {total === 1 ? 'Property' : 'Properties'} Found
                    </div>
                </div>

                {/* Selects */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                    {/* PROPERTY TYPE */}
                    <div className="space-y-2">
                        <label className="text-[14px] font-bold text-gray-500">Property Type</label>
                        <StyledSelect options={propertyTypeOptions} value={getSelectedOption(propertyTypeOptions, filters.type)} onChange={opt => handleFilterChange('type', opt)} />
                    </div>
                    <div className="space-y-2 col-span-2">
                        <label className="text-[14px] font-bold text-gray-500">Transit Station</label>
                        {stationsLoaded ? (
                            <StyledSelect
                                key={`station-select-${flatStations.length}`}
                                options={flatStations}
                                value={flatStations.find(opt => opt && opt.value === filters.station_id) || null}
                                onChange={opt => handleSelectChange('station_id', opt)}
                                placeholder="All Stations"
                                isSearchable={true}
                            />
                        ) : (
                            <div className="h-[38px] bg-gray-50 border border-gray-200 rounded-[3px] flex items-center px-4 text-sm text-gray-400">Loading stations...</div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[14px] font-bold text-gray-500">Listing Type</label>
                        <StyledSelect options={listingTypeOptions} value={getSelectedOption(listingTypeOptions, filters.listing_type)} onChange={opt => handleSelectChange('listing_type', opt)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[14px] font-bold text-gray-500">Bedrooms</label>
                        <StyledSelect options={bedroomOptions} value={getSelectedOption(bedroomOptions, filters.bedrooms)} onChange={opt => handleSelectChange('bedrooms', opt)} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[14px] font-bold text-gray-500">Min Price</label>
                        <Input type="number" value={filters.min_price} onChange={e => handleFilterChange('min_price', e.target.value)} placeholder="0" className="w-full" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[14px] font-bold text-gray-500">Max Price</label>
                        <Input type="number" value={filters.max_price} onChange={e => handleFilterChange('max_price', e.target.value)} placeholder="No limit" className="w-full" />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
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
            {/* --- MAP VIEW LAYOUT (SIDEBAR + FULL HEIGHT) --- */}
            {/* --- SIDEBAR FILTER MENU (SHARED) --- */}
            {/* --- FILTER MODAL (94vw x 94vh) --- */}
            <Modal
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                size="full"
                title={null}
                hideHeader={false}
                className="!w-[94vw] !h-[94vh] !max-w-[94vw] !max-h-[94vh]"
                headerExtra={
                    <div className="flex items-center w-full">
                        {/* First column header title: Filter Settings (aligned with 400px sidebar) */}
                        <div className="w-[376px] flex-shrink-0 flex items-center pr-12">
                            <h3 className="text-lg font-bold text-gray-900">Filter Settings</h3>
                        </div>

                        <div className="flex items-center gap-6 flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap">Transit Explorer</h3>

                            <div className="flex-1 relative" ref={transitSearchRef}>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={transitSearchTerm}
                                        onChange={(e) => {
                                            setTransitSearchTerm(e.target.value);
                                            setShowTransitResults(true);
                                        }}
                                        onFocus={() => setShowTransitResults(true)}
                                        placeholder="Search transit station..."
                                        className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-[3px] text-base font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                                    />

                                    {/* Search Results Dropdown */}
                                    {showTransitResults && transitSearchTerm && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[3px] shadow-2xl border border-gray-100 max-h-[400px] overflow-y-auto z-[120] animate-fade-in custom-scrollbar">
                                            {stations
                                                .filter(s =>
                                                    s.name_en?.toLowerCase().includes(transitSearchTerm.toLowerCase()) ||
                                                    s.id?.toLowerCase().includes(transitSearchTerm.toLowerCase())
                                                )
                                                .map(station => (
                                                    <button
                                                        key={station.id}
                                                        onClick={() => {
                                                            handleStationSelect(station.id);
                                                            setTransitSearchTerm('');
                                                            setShowTransitResults(false);
                                                        }}
                                                        className="w-full text-left px-5 py-4 hover:bg-primary-50/50 flex items-center justify-between group/item transition-all border-b border-gray-100/50 last:border-0"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-[1px] bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover/item:bg-primary-100 group-hover/item:text-primary-600 transition-colors">
                                                                {station.id.substring(0, 2)}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-900 leading-tight">{station.name_en}</div>
                                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{station.id}</div>
                                                            </div>
                                                        </div>
                                                        <span className="text-primary-600 opacity-0 group-hover/item:opacity-100 text-[10px] font-black uppercase tracking-widest transition-opacity translate-x-1 group-hover/item:translate-x-0">Select</span>
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                }
            >
                <div className="flex-1 flex overflow-hidden h-full">
                    {/* Left Pane: Filters (Wider 400px) */}
                    <div className="w-[400px] flex-shrink-0 flex flex-col border-r border-gray-100 bg-white h-full relative z-10 transition-all duration-500 overflow-hidden">
                        {/* Sidebar Content (Filters) */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {renderFilterContent()}
                        </div>

                    </div>

                    {/* Right Pane: Content Area (Full Height Map) */}
                    <div className="flex-1 min-w-0 flex flex-col h-full bg-white relative">
                        {/* Transit Map - Full Height */}
                        <div className="flex-1 relative bg-gray-50 overflow-hidden">
                            <TransitMapFilter
                                onStationClick={id => {
                                    handleStationSelect(id);
                                }}
                                selectedStation={filters.station_id}
                                hideHeader={true}
                                externalStations={stations}
                                onClose={() => setIsSidebarOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            </Modal >

            {/* Overlay for Sidebar */}
            {
                isSidebarOpen && (
                    <div className="fixed inset-0 bg-black/30 z-[65] backdrop-blur-sm" />
                )
            }



            {/* --- STANDARD GRID LAYOUT --- */}
            <div className="w-full bg-white min-h-screen relative">
                {/* Header Mobile */}
                <div className="pt-4 pb-2 px-4 lg:hidden">
                    <div className="flex items-baseline justify-between">
                        <h1 className="text-xl font-bold text-gray-900">Properties</h1>
                        <span className="text-sm font-medium text-gray-500">{total} results</span>
                    </div>
                </div>

                {/* Full Width Filter Bar (outside constrained container for background bleed) */}
                <FilterBar
                    className="mb-6"
                    total={total}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onOpenFilters={() => setIsSidebarOpen(true)}
                    hasActiveFilters={hasActiveFilters}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    isMapViewOpen={isGoogleMapOpen}
                    onToggleMapView={toggleMapView}
                    isMapTransitioning={isMapTransitioning}
                    navVisible={navVisible}
                    isScrolled={isScrolled}
                />

                {/* Main Content (Constrained Grid) */}
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-12">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar */}
                        <div className={`lg:col-span-3 hidden lg:block transition-all duration-500 ${isGoogleMapOpen ? '!hidden' : ''}`}>
                            <div className={`sticky transition-all duration-500 ease-in-out ${navVisible ? 'top-[172px]' : 'top-[116px]'}`}>
                                {renderFilterContent()}
                            </div>
                        </div>

                        {/* Listings Grid or Map */}
                        <div className={`${isGoogleMapOpen ? 'lg:col-span-12' : 'lg:col-span-9'} transition-all duration-500 relative`}>
                            <div className={`flex flex-col lg:flex-row gap-8 ${isGoogleMapOpen ? 'min-h-[calc(100vh-140px)]' : 'min-h-[70vh]'}`}>
                                {/* Left Side: Property List */}
                                <div className={`w-full ${isGoogleMapOpen ? 'hidden lg:block lg:w-[45%] lg:pr-4 lg:overflow-y-auto lg:h-[calc(100vh-190px)] custom-scrollbar' : ''}`}>
                                    {initialLoading ? (
                                        <div className={`grid gap-4 ${isGoogleMapOpen ? 'grid-cols-1' : (viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}`}>
                                            {[...Array(isGoogleMapOpen ? 6 : 12)].map((_, i) => <ListingSkeleton key={i} index={i} viewMode={isGoogleMapOpen ? 'map-list' : viewMode} isExiting={isExiting} />)}
                                        </div>
                                    ) : listings.length > 0 ? (
                                        <>
                                            <div className={`grid gap-4 ${isGoogleMapOpen ? 'grid-cols-1' : (viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}`}>
                                                {listings.map((l, i) => (
                                                    <div
                                                        key={l.id}
                                                        className="animate-in fade-in fill-mode-both duration-500"
                                                        style={{ animationDelay: `${(i % 12) * 50}ms` }}
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
                                        <div className="text-center py-20 bg-white rounded-[3px] animate-fadeInUp">
                                            <SparklesIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-gray-900">No properties found</h3>
                                            <p className="text-gray-500 mt-2">Try adjusting your filters to find more results</p>
                                            <button onClick={clearFilters} className="mt-6 text-primary-600 font-bold underline">Clear all filters</button>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Map (Desktop/Tablet) */}
                                {isGoogleMapOpen && (
                                    <div className={`hidden lg:block w-[55%] sticky transition-all duration-500 ease-in-out ${navVisible ? 'top-[172px] h-[calc(100vh-190px)]' : 'top-[116px] h-[calc(100vh-130px)]'}`}>
                                        <div className="w-full h-full rounded-[var(--site-radius)] overflow-hidden shadow-sm border border-gray-200">
                                            <GoogleMap
                                                listings={listings}
                                                onMarkerClick={(property) => {
                                                    const newParams = new URLSearchParams(searchParams);
                                                    newParams.set('detail', property.id);
                                                    setSearchParams(newParams);
                                                }}
                                                onBoundsChanged={handleMapBoundsChanged}
                                            />
                                            {/* Map Overlays */}
                                            <div className="absolute top-4 right-4 z-10 pointer-events-none">
                                                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/50 flex items-center gap-3">
                                                    <div className="bg-primary-50 p-2 rounded-lg">
                                                        <GlobeAltIcon className="w-5 h-5 text-primary-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Map Mode</p>
                                                        <p className="text-sm font-bold text-gray-900">{total} Properties</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Bottom Map override for Mobile (replaces properties entirely logic fallback) */}
                                {isGoogleMapOpen && (
                                    <div className="block lg:hidden w-full h-[75vh] rounded-[var(--site-radius)] overflow-hidden shadow-sm border border-gray-200 relative">
                                        <GoogleMap
                                            listings={listings}
                                            onMarkerClick={(property) => {
                                                const newParams = new URLSearchParams(searchParams);
                                                newParams.set('detail', property.id);
                                                setSearchParams(newParams);
                                            }}
                                            onBoundsChanged={handleMapBoundsChanged}
                                        />
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

            {/* Mobile Bottom Bar - Premium Curved Design */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] safe-area-bottom pointer-events-none">
                <div className="relative h-16 w-full pointer-events-auto">
                    {/* The Curved Background SVG */}
                    <svg
                        viewBox="0 0 400 64"
                        className="absolute inset-0 w-full h-full drop-shadow-[0_-8px_20px_rgba(0,0,0,0.06)]"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M0 0H140C160 0 170 38 200 38C230 38 240 0 260 0H400V64H0V0Z"
                            fill="#2563eb"
                        />
                    </svg>

                    {/* Navigation Items */}
                    <div className="relative h-full flex items-center justify-between px-6 sm:px-10">
                        {/* Google Map Button */}
                        <button
                            onClick={() => toggleMapView(true)}
                            className="flex flex-col items-center gap-1 text-white active:scale-90 transition-transform pt-0.5"
                        >
                            <div className="w-8 h-8 flex items-center justify-center">
                                <GlobeAltIcon className="w-6 h-6 stroke-[2.5]" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-tight">Map View</span>
                        </button>



                        {/* Bulging Filter Button - Submerged into the curve */}
                        <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-20 h-20 flex items-center justify-center">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full animate-pulse" />
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-[0_8px_25px_-5px_rgba(0,0,0,0.2)] active:scale-95 transition-all z-10 border-4 border-primary-600"
                            >
                                <div className="relative">
                                    <AdjustmentsHorizontalIcon className="w-7 h-7 text-primary-600 stroke-[2.5]" />
                                    {hasActiveFilters && (
                                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary-600 rounded-full border-2 border-white shadow-sm" />
                                    )}
                                </div>
                            </button>
                        </div>

                        {/* View Mode Button */}
                        <button
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            className="flex flex-col items-center gap-1 text-white active:scale-90 transition-transform pt-0.5"
                        >
                            <div className="w-8 h-8 flex items-center justify-center">
                                {viewMode === 'grid' ? <ListBulletIcon className="w-6 h-6 stroke-[2.5]" /> : <Squares2X2Icon className="w-6 h-6 stroke-[2.5]" />}
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-tight">{viewMode === 'grid' ? 'List' : 'Grid'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Google Maps Modal (Mobile Only) */}
            {
                isGoogleMapOpen && (
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
            <ListingDetailModal />
        </div >
    );
};

export default ListingsPage;
