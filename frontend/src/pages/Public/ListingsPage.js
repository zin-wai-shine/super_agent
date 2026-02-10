import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { publicApi } from '../../services/api';
import ListingCard from '../../components/Listings/ListingCard';
import GoogleMap from '../../components/Listings/GoogleMap';
import TransitMapFilter from '../../components/TransitMap/TransitMapFilter';
import StyledSelect from '../../components/Form/StyledSelect';
import ShowcaseBanners from '../../components/Common/ShowcaseBanners';
import axios from 'axios';

import {
    FunnelIcon,
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

const getSelectedOption = (options, value) =>
    options.find(opt => opt.value === value) || null;

// Skeleton Component moved outside for stability
const ListingSkeleton = ({ viewMode = 'grid' }) => {
    const isListView = viewMode === 'list';

    if (isListView) {
        return (
            <div className="bg-white rounded-[3px] overflow-hidden shadow-sm border border-gray-100 flex flex-row animate-pulse h-[130px] md:h-[220px]">
                {/* Image Section Skeleton */}
                <div className="w-[130px] md:w-[40%] h-full bg-gray-200 flex-none relative">
                    {/* Type Badge Skeleton */}
                    <div className="absolute top-2 left-2 md:top-4 md:left-4 h-4 md:h-6 w-12 md:w-20 bg-gray-300 rounded-[3px]" />
                </div>

                {/* Content Section Skeleton */}
                <div className="p-3 md:p-4 flex flex-col justify-between flex-1 min-w-0">
                    <div>
                        <div className="flex items-start justify-between mb-1">
                            <div className="h-4 w-16 bg-gray-100 rounded-[3px]" />
                            <div className="h-6 md:h-8 w-24 md:w-32 bg-gray-200 rounded-[3px]" />
                        </div>
                        <div className="h-5 md:h-7 w-3/4 bg-gray-200 rounded-[3px] mb-2" />
                        <div className="space-y-2">
                            <div className="h-4 w-1/2 bg-gray-100 rounded-[3px]" />
                            <div className="h-4 w-1/3 bg-gray-100 rounded-[3px]" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4 pt-2">
                        <div className="h-4 w-12 bg-gray-100 rounded-[3px]" />
                        <div className="h-4 w-12 bg-gray-100 rounded-[3px]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
            {/* Image Skeleton */}
            <div className="aspect-[16/10] bg-gray-200 w-full relative">
                {/* Badge Top Left */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <div className="h-4 w-16 bg-gray-300 rounded-[3px]" />
                    <div className="h-4 w-20 bg-gray-300 rounded-[3px]" />
                </div>
                {/* Badge Top Right */}
                <div className="absolute top-3 right-3 h-5 w-16 bg-gray-300 rounded-[3px]" />
                {/* Price Overlay */}
                <div className="absolute bottom-3 left-3 h-8 w-32 bg-white/60 backdrop-blur-md rounded-[3px]" />
            </div>

            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                    <div className="h-4 w-16 bg-gray-100 rounded-[3px]" />
                    <div className="h-3 w-10 bg-gray-50 rounded-[3px]" />
                </div>
                <div className="h-6 w-full bg-gray-200 rounded-[3px]" />
                <div className="space-y-3 mt-4">
                    <div className="h-4 w-2/3 bg-gray-100 rounded-[3px]" />
                    <div className="h-4 w-1/2 bg-gray-100 rounded-[3px]" />
                    <div className="h-4 w-1/3 bg-gray-100 rounded-[3px]" />
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center mt-2">
                    <div className="h-4 w-20 bg-gray-100 rounded-[3px]" />
                    <div className="h-5 w-8 bg-gray-100 rounded-[3px]" />
                </div>
            </div>
        </div>
    );
};

const ListingsPage = () => {
    const { user } = useAuth();
    const { navVisible } = useOutletContext() || { navVisible: true };
    const [searchParams, setSearchParams] = useSearchParams();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const observerTarget = useRef(null);

    // Modal States
    const [isTransitModalOpen, setIsTransitModalOpen] = useState(false);
    const isGoogleMapOpen = searchParams.get('view') === 'map';
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
        document.body.style.overflow = (isTransitModalOpen || isGoogleMapOpen || isSidebarOpen) ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isTransitModalOpen, isGoogleMapOpen, isSidebarOpen]);

    const toggleMapView = (isOpen) => {
        const newParams = new URLSearchParams(searchParams);
        if (isOpen) newParams.set('view', 'map');
        else newParams.delete('view');
        setSearchParams(newParams);
    };

    const [stations, setStations] = useState([]);

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

        const fetchStations = async () => {
            try {
                const response = await publicApi.getStations();
                setStations(response.data.stations || []);
            } catch (error) {
                console.error('Failed to fetch stations:', error);
            }
        };

        fetchAgentInfo();
        fetchStations();
    }, [searchParams, user]);

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
    const [stationSearch, setStationSearch] = useState('');
    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    // Sync URL with restored filters on mount
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        let updated = false;
        Object.keys(filters).forEach(key => {
            if (filters[key] && !params.has(key)) {
                params.set(key, filters[key]);
                updated = true;
            }
        });
        if (updated) setSearchParams(params, { replace: true });
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== filters.search) {
                handleFilterChange('search', searchTerm);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const controller = new AbortController();
        const fetchListings = async () => {
            // Only show initial skeletons if we are on page 1
            if (page === 1) {
                // Avoid "flash" in map view. If map is open and we have results, 
                // we don't clear them or show skeletons while updating for new bounds.
                const isMapBoundsUpdate = isGoogleMapOpen && listings.length > 0;

                if (!isMapBoundsUpdate) {
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
                const response = await publicApi.getListings(params, { signal: controller.signal });

                const data = response.data;
                setListings(prev => page === 1 ? data.listings : [...prev, ...data.listings]);
                setTotal(data.total || 0);
            } catch (error) {
                if (axios.isCancel(error)) return;
                console.error('Failed to fetch listings', error);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                    setInitialLoading(false);
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

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        localStorage.setItem('listing_filters', JSON.stringify(newFilters));
        setPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to prevent jump
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(key, value);
        else newParams.delete(key);
        setSearchParams(newParams);
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
        setSearchParams({});
        setIsFilterModalOpen(false);
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
        const station = stations.find(s => s.id === parseInt(filters.station_id));
        if (station) activeFiltersList.push({ label: `Station: ${station.name_en}`, key: 'station_id' });
    }

    // --- Render Helper: Compact Filter Content (Reusable for Sidebar/Modal) ---
    const renderFilterContent = () => {
        return (
            <div className="space-y-6">
                {/* Active Filters Section */}
                <div className="bg-white rounded-[3px] shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <FunnelIcon className="w-4 h-4" />
                            Active Filters
                        </h3>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-sm text-red-500 font-medium hover:text-red-700">Clear All</button>
                        )}
                    </div>
                    {hasActiveFilters ? (
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {activeFiltersList.map((filter) => (
                                    <span key={filter.key} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full border border-primary-100">
                                        {filter.label}
                                        <button onClick={() => handleFilterChange(filter.key, '')} className="hover:text-primary-900">
                                            <XMarkIcon className="w-3 h-3" />
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

                    <div className="mt-4 bg-green-50 p-2 rounded-[3px] text-green-800 text-xs font-bold border border-green-100 flex items-center gap-2 justify-center">
                        <CheckCircleIcon className="w-4 h-4" />
                        {total} {total === 1 ? 'Property' : 'Properties'} Found
                    </div>
                </div>

                {/* Search */}
                <div className="space-y-2">
                    <label className="text-sm font-bold">Search</label>
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Type location, name..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-[3px]" />
                    </div>
                </div>
                {/* Selects */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold">Property Type</label>
                        <StyledSelect options={propertyTypeOptions} value={getSelectedOption(propertyTypeOptions, filters.type)} onChange={opt => handleSelectChange('type', opt)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold">Listing Type</label>
                        <StyledSelect options={listingTypeOptions} value={getSelectedOption(listingTypeOptions, filters.listing_type)} onChange={opt => handleSelectChange('listing_type', opt)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold">Bedrooms</label>
                        <StyledSelect options={bedroomOptions} value={getSelectedOption(bedroomOptions, filters.bedrooms)} onChange={opt => handleSelectChange('bedrooms', opt)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold">Price Range</label>
                        <div className="flex gap-2">
                            <input type="number" value={filters.min_price} onChange={e => handleFilterChange('min_price', e.target.value)} placeholder="Min" className="w-1/2 p-2 bg-gray-50 border rounded-[3px]" />
                            <input type="number" value={filters.max_price} onChange={e => handleFilterChange('max_price', e.target.value)} placeholder="Max" className="w-1/2 p-2 bg-gray-50 border rounded-[3px]" />
                        </div>
                    </div>
                </div>
                {/* Buttons */}
                <div className="space-y-4 border-t pt-6">
                    <button onClick={() => { setIsFilterModalOpen(false); setIsTransitModalOpen(true); }} className="w-full flex justify-between items-center p-4 bg-gray-50 border rounded-[3px] font-bold">
                        <span className="flex items-center gap-2"><MapPinIcon className="w-5 h-5" /> Open Transit Map</span>
                        <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                    </button>
                    <div className="p-1 bg-gray-50 rounded-[3px] flex gap-1">
                        <button onClick={() => setViewMode('grid')} className={`flex-1 py-3 rounded-[3px] font-bold flex items-center justify-center gap-2 ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}>
                            <Squares2X2Icon className="w-5 h-5" /> Grid
                        </button>
                        <button onClick={() => setViewMode('list')} className={`flex-1 py-3 rounded-[3px] font-bold flex items-center justify-center gap-2 ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}>
                            <ListBulletIcon className="w-5 h-5" /> List
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 relative">
            {/* --- MAP VIEW LAYOUT (SIDEBAR + FULL HEIGHT) --- */}
            {/* --- SIDEBAR FILTER MENU (SHARED) --- */}
            <div className={`fixed inset-y-0 left-0 z-[70] w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-4 border-b flex items-center justify-between bg-primary-600 text-white">
                        <span className="font-bold text-lg">Filters & Menu</span>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Sidebar Content (Filters) */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {renderFilterContent()}
                    </div>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t bg-gray-50">
                        <div className="flex gap-3">
                            <button onClick={clearFilters} className="px-4 py-2 bg-gray-200 rounded-[3px] font-bold text-gray-600 text-sm">Reset</button>
                            <button
                                onClick={() => {
                                    setIsSidebarOpen(false);
                                    if (isGoogleMapOpen) toggleMapView(false);
                                }}
                                className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-[3px] font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {isGoogleMapOpen ? (
                                    <>
                                        <Squares2X2Icon className="w-4 h-4" />
                                        Back to Grid
                                    </>
                                ) : (
                                    "View Results"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay for Sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/30 z-[65] backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* --- MAP VIEW LAYOUT (FULL SCREEN) --- */}
            <div className={`fixed inset-0 z-[60] bg-white transform transition-transform duration-500 ease-in-out ${isGoogleMapOpen ? 'translate-x-0' : '-translate-x-full shadow-2xl'}`}>
                <div className="flex h-screen overflow-hidden relative">


                    {/* Menu Toggle Button (Floating) */}


                    {/* Main Content Area (Split: List + Map) - Full Height */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* List Section */}
                        <div className="w-full lg:w-[45%] h-full flex flex-col bg-white border-r relative z-10 transition-all duration-300">
                            {/* List View Header (Sticky) */}
                            <div className="px-5 py-3 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-primary-600 to-primary-700 z-20 sticky top-0 shadow-lg backdrop-blur-sm bg-opacity-95 h-16">
                                {/* Left: Logo & Short Name */}
                                <div className="flex items-center gap-3 select-none">
                                    <div className="bg-white/20 p-1 rounded-xl backdrop-blur-md shadow-inner transition-transform hover:scale-105 border border-white/20">
                                        <Logo className="w-8 h-8 text-white drop-shadow-md" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className="text-xl font-black tracking-tighter text-white leading-none drop-shadow-sm">SUPER</span>
                                        <span className="text-[10px] font-bold tracking-[0.2em] text-white/90 uppercase leading-none mt-0.5 ml-0.5 drop-shadow-sm">Real Estate</span>
                                    </div>
                                </div>

                                {/* Right: Controls Group */}
                                <div className="flex items-center gap-4">
                                    {/* Filter Button */}
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 shadow-sm backdrop-blur-md transition-all group active:scale-95"
                                    >
                                        <div className="relative">
                                            <FunnelIcon className={`w-4 h-4 text-white group-hover:scale-110 transition-transform`} />
                                            {hasActiveFilters && (
                                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full border border-white" />
                                            )}
                                        </div>
                                        <span className="text-xs font-bold tracking-wide uppercase">Filters</span>
                                    </button>

                                    {/* Mobile Filter Icon Only */}
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="md:hidden p-2 bg-white/10 text-white rounded-full border border-white/20 active:scale-90 transition-transform"
                                    >
                                        <div className="relative">
                                            <FunnelIcon className="w-5 h-5" />
                                            {hasActiveFilters && (
                                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Divider */}
                                    <div className="w-px h-8 bg-white/10" />

                                    {/* Results Count */}
                                    <h2 className="hidden sm:block font-bold text-white text-xs tracking-wide bg-white/10 px-3 py-1.5 rounded-full border border-white/10 shadow-inner">{total} Results</h2>

                                    {/* Desktop Map Toggle Switch */}
                                    <div className="hidden lg:flex items-center gap-3">
                                        <span className="text-white/80 font-bold text-[10px] uppercase tracking-wider text-shadow-sm">Map View</span>
                                        <button
                                            onClick={() => toggleMapView(false)}
                                            className="w-12 h-7 bg-primary-500/50 hover:bg-primary-500/70 rounded-full relative transition-colors shadow-inner border border-white/20 flex items-center px-1"
                                        >
                                            <div className="w-5 h-5 bg-white rounded-full shadow-md absolute right-1 transition-transform" />
                                        </button>
                                    </div>

                                    <button onClick={() => toggleMapView(false)} className="lg:hidden text-white/90 font-bold text-sm hover:text-white">Close</button>
                                </div>
                            </div>



                            {/* Scrollable List */}
                            <div className="flex-1 overflow-y-auto p-4 content-visibility-auto">
                                {initialLoading ? (
                                    <div className={`grid gap-4 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                                        {[...Array(12)].map((_, i) => <ListingSkeleton key={i} viewMode={viewMode} />)}
                                    </div>
                                ) : listings.length > 0 ? (
                                    <>
                                        <div className={`grid gap-4 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                                            {listings.map(l => <ListingCard key={l.id} listing={l} viewMode={viewMode} priceFormat={priceFormat} />)}
                                            {loading && !initialLoading && (
                                                <div className="contents">
                                                    {[...Array(viewMode === 'list' ? 3 : 4)].map((_, i) => <ListingSkeleton key={`more-${i}`} viewMode={viewMode} />)}
                                                </div>
                                            )}
                                        </div>
                                        <div ref={observerTarget} className="h-20" />
                                    </>
                                ) : (
                                    <div className="text-center py-20">
                                        <SparklesIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-gray-900">No properties found</h3>
                                        <button onClick={clearFilters} className="mt-4 text-primary-600 font-bold underline">Clear filters</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Map Section */}
                        <div className="hidden lg:block flex-1 h-full relative z-0">
                            <GoogleMap
                                listings={listings}
                                onMarkerClick={(property) => window.open(`/listings/${property.id}`, '_blank')}
                                onBoundsChanged={handleMapBoundsChanged}
                            />

                            {/* Map Overlays */}
                            <div className="absolute top-4 right-4 z-10 hidden lg:block pointer-events-none">
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
                </div>
            </div>

            {/* --- STANDARD GRID LAYOUT --- */}
            <div className={`transform transition-transform duration-500 ease-in-out bg-gray-50 min-h-screen ${isGoogleMapOpen ? 'translate-x-full h-screen overflow-hidden fixed inset-0' : 'translate-x-0 relative'}`}>
                {/* Header Mobile */}
                <div className="pt-4 pb-2 px-4 lg:hidden">
                    <div className="flex items-baseline justify-between">
                        <h1 className="text-xl font-bold text-gray-900">Properties</h1>
                        <span className="text-sm font-medium text-gray-500">{total} results</span>
                    </div>
                </div>

                {/* Desktop Filter Bar - Full Width Clean Design */}
                <div className={`hidden lg:block w-full sticky z-40 transition-all duration-300 bg-white border-b border-gray-200 shadow-sm ${navVisible ? 'top-16' : 'top-0'} ${isScrolled ? 'mb-4 shadow-md' : 'mb-8'}`}>
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-between gap-4">

                            {/* Search Section */}
                            <div className="flex-1 max-w-2xl flex items-center bg-gray-100/80 hover:bg-gray-100 rounded-[3px] px-4 py-2.5 transition-colors group focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 border border-transparent">
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors mr-3" />
                                <input
                                    className="bg-transparent border-none focus:ring-0 focus:outline-none w-full text-sm font-medium text-gray-900 placeholder-gray-500 p-0 shadow-none focus:border-none"
                                    placeholder="Search location, name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Right Side Actions */}
                            <div className="flex items-center gap-3">
                                {/* Inventory Count */}
                                <div className="flex flex-col items-end mr-4 px-4 border-r border-gray-200">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Inventory</span>
                                    <span className="text-sm font-bold text-gray-900">{total} Results</span>
                                </div>

                                {/* Filters Button */}
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-[3px] text-sm font-bold transition-all border ${hasActiveFilters ? 'bg-primary-50 text-primary-600 border-primary-200 shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700'}`}
                                >
                                    <div className="relative">
                                        <FunnelIcon className="w-4 h-4" />
                                        {hasActiveFilters && (
                                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                                            </span>
                                        )}
                                    </div>
                                    <span>Filters</span>
                                </button>

                                {/* Transit Button */}
                                <button
                                    onClick={() => setIsTransitModalOpen(true)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-[3px] text-sm font-bold transition-all border ${filters.station_id ? 'bg-primary-50 text-primary-600 border-primary-200 shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700'}`}
                                >
                                    <MapPinIcon className="w-4 h-4" />
                                    <span>Transit</span>
                                </button>

                                {/* View Toggles (Grid/List) */}
                                <div className="flex items-center bg-gray-100 p-1 rounded-[3px] border border-gray-200 ml-2">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded-[2px] transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <Squares2X2Icon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-[2px] transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <ListBulletIcon className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Map View Switch */}
                                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isGoogleMapOpen ? 'text-primary-600' : 'text-gray-400'}`}>Map View</span>
                                    <button
                                        onClick={() => toggleMapView(!isGoogleMapOpen)}
                                        className={`w-11 h-6 rounded-full relative transition-colors duration-200 ease-in-out focus:outline-none pointer-events-auto ${isGoogleMapOpen ? 'bg-primary-600' : 'bg-gray-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ease-in-out shadow-sm ${isGoogleMapOpen ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-4 hidden lg:block transition-all duration-500">
                            <div className={`sticky space-y-6 ${navVisible ? 'top-40' : 'top-24'}`}>
                                <ShowcaseBanners agentId={agentId} loading={initialLoading} />

                                <div className="bg-white rounded-[3px] shadow-sm border border-gray-100 p-4">
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <FunnelIcon className="w-4 h-4" />
                                            Active Filters
                                        </h3>
                                        <button onClick={clearFilters} className="text-sm text-red-500 font-medium">Clear All</button>
                                    </div>
                                    {hasActiveFilters ? (
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                {activeFiltersList.map((filter) => (
                                                    <span key={filter.key} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full border border-primary-100">
                                                        {filter.label}
                                                        <button onClick={() => handleFilterChange(filter.key, '')} className="hover:text-primary-900">
                                                            <XMarkIcon className="w-3 h-3" />
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

                                    <div className="mt-4 bg-green-50 p-2 rounded-[3px] text-green-800 text-xs font-bold border border-green-100 flex items-center gap-2 justify-center">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        {total} {total === 1 ? 'Property' : 'Properties'} Found
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Listings Grid */}
                        <div className="lg:col-span-8 transition-all duration-500">
                            <div className="flex flex-col lg:flex-row gap-8 min-h-[70vh]">
                                {/* Left Side: Property List */}
                                <div className="w-full">
                                    {initialLoading ? (
                                        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                            {[...Array(12)].map((_, i) => <ListingSkeleton key={i} viewMode={viewMode} />)}
                                        </div>
                                    ) : listings.length > 0 ? (
                                        <>
                                            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                                {listings.map(l => <ListingCard key={l.id} listing={l} viewMode={viewMode} priceFormat={priceFormat} />)}
                                                {loading && !initialLoading && (
                                                    <div className="contents">
                                                        {[...Array(viewMode === 'grid' ? 6 : 3)].map((_, i) => <ListingSkeleton key={`more-${i}`} viewMode={viewMode} />)}
                                                    </div>
                                                )}
                                            </div>
                                            <div ref={observerTarget} className="h-20" />
                                        </>
                                    ) : (
                                        <div className="text-center py-20 bg-white rounded-[3px] border border-gray-100">
                                            <SparklesIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-gray-900">No properties found</h3>
                                            <p className="text-gray-500 mt-2">Try adjusting your filters to find more results</p>
                                            <button onClick={clearFilters} className="mt-6 text-primary-600 font-bold underline">Clear all filters</button>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Modals */}


            {
                isTransitModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsTransitModalOpen(false)} />
                        <div className="bg-white w-full h-[100dvh] md:h-[85vh] md:max-w-5xl md:rounded-[3px] shadow-2xl relative z-10 flex flex-col overflow-hidden">
                            <div className="p-4 border-b flex justify-between items-center bg-white/50 backdrop-blur-md">
                                <h3 className="font-bold flex items-center gap-2"><MapPinIcon className="w-5 h-5 text-primary-600" /> Select Station</h3>
                                <div className="flex-1 max-w-sm mx-4">
                                    <input value={stationSearch} onChange={e => setStationSearch(e.target.value)} placeholder="Search station..." className="w-full px-4 py-2 bg-gray-100 rounded-[3px] text-sm" />
                                </div>
                                <button onClick={() => setIsTransitModalOpen(false)} className="p-2"><XMarkIcon className="w-6 h-6" /></button>
                            </div>
                            <div className="flex-1 bg-white relative">
                                <TransitMapFilter onStationClick={id => { handleStationSelect(id); setIsTransitModalOpen(false); }} selectedStation={filters.station_id} searchable={false} />
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Scroll to top */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-28 right-6 md:bottom-8 md:right-8 bg-primary-600 text-white p-3 rounded-full shadow-lg transition-all z-[100] ${showScrollTop && !isTransitModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
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

                        {/* Transit Map Button */}
                        <button
                            onClick={() => setIsTransitModalOpen(true)}
                            className="flex flex-col items-center gap-1 text-white active:scale-90 transition-transform pt-0.5"
                        >
                            <div className="w-8 h-8 flex items-center justify-center">
                                <MapPinIcon className="w-6 h-6 stroke-[2.5]" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-tight">Stations</span>
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
                                    <FunnelIcon className="w-7 h-7 text-primary-600 stroke-[2.5]" />
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
                                className="p-3 bg-gray-50 rounded-[20px] hover:bg-gray-100 text-gray-400 transition-all active:scale-90"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 w-full relative">
                            <GoogleMap
                                listings={listings}
                                onMarkerClick={(property) => {
                                    window.open(`/listings/${property.id}`, '_blank');
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
        </div >
    );
};

export default ListingsPage;
