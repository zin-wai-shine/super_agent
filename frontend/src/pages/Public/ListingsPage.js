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
            <div className="bg-white rounded-[3px] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row h-full animate-pulse">
                <div className="md:w-[480px] h-64 md:h-auto bg-gray-200 relative flex-none">
                    <div className="absolute top-4 right-4 w-20 h-6 bg-gray-300 rounded-[3px]" />
                    <div className="absolute top-4 left-4 w-16 h-5 bg-gray-300 rounded-[3px]" />
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-7 w-20 bg-gray-100 rounded-[3px]" />
                            <div className="h-10 w-40 bg-gray-200 rounded-[3px]" />
                        </div>
                        <div className="space-y-3 mb-6">
                            <div className="h-8 w-3/4 bg-primary-50 rounded-[3px]" />
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-5 w-48 bg-gray-100 rounded-[3px]" />
                            <div className="h-6 w-24 bg-blue-100 rounded-[3px]" />
                        </div>
                    </div>
                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex gap-4">
                            <div className="h-8 w-24 bg-gray-50 rounded-[3px]" />
                            <div className="h-8 w-24 bg-gray-50 rounded-[3px]" />
                            <div className="h-8 w-24 bg-gray-50 rounded-[3px]" />
                        </div>
                        <div className="ml-4 h-5 w-20 bg-gray-50 rounded-[3px]" />
                        <div className="h-10 w-32 bg-gray-200 rounded-[3px]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[3px] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full animate-pulse">
            <div className="aspect-[16/10] bg-gray-200 w-full relative">
                <div className="absolute top-3 left-3 w-12 h-4 bg-gray-300 rounded-[3px]" />
                <div className="absolute top-3 right-3 w-12 h-4 bg-gray-300 rounded-[3px]" />
                <div className="absolute bottom-3 left-3 w-24 h-8 bg-white/50 rounded-[3px]" />
            </div>
            <div className="p-4 flex-1 flex flex-col space-y-3">
                <div className="flex justify-between items-center">
                    <div className="h-4 w-16 bg-gray-200 rounded-[3px]" />
                    <div className="h-3 w-10 bg-gray-100 rounded-[3px]" />
                </div>
                <div className="h-5 w-full bg-gray-200 rounded-[3px]" />
                <div className="h-3 w-3/4 bg-gray-100 rounded-[3px]" />
                <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center">
                    <div className="flex gap-2">
                        <div className="h-4 w-6 bg-gray-100 rounded-[3px]" />
                        <div className="h-4 w-6 bg-gray-100 rounded-[3px]" />
                        <div className="h-4 w-6 bg-gray-100 rounded-[3px]" />
                    </div>
                    <div className="h-7 w-7 bg-gray-100 rounded-[3px]" />
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
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isTransitModalOpen, setIsTransitModalOpen] = useState(false);
    const [isGoogleMapOpen, setIsGoogleMapOpen] = useState(() => localStorage.getItem('show_google_map') === 'true');

    const [viewMode, setViewMode] = useState(() => localStorage.getItem('listings_view_mode') || 'grid');
    const [priceLimits, setPriceLimits] = useState({ min: 0, max: 0 });
    const [priceFormat, setPriceFormat] = useState('short');
    const [agentId, setAgentId] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mapBounds, setMapBounds] = useState(null); // Map bounds for geographic filtering

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
        document.body.style.overflow = (isFilterModalOpen || isTransitModalOpen || isGoogleMapOpen) ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isFilterModalOpen, isTransitModalOpen, isGoogleMapOpen]);

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
            if (listings.length === 0) setInitialLoading(true);
            setLoading(true);
            try {
                const params = { ...filters, page, limit: 6 };
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
    }, [filters, page, viewMode, user, mapBounds, isGoogleMapOpen]);

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
        setSearchParams({});
        setIsFilterModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Mobile */}
            <div className="pt-4 pb-2 px-4 lg:hidden">
                <div className="flex items-baseline justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Properties</h1>
                    <span className="text-sm font-medium text-gray-500">{total} results</span>
                </div>
            </div>

            {/* Desktop Filter Bar */}
            <div className={`hidden lg:block w-full sticky z-40 transition-all duration-300 ${isScrolled ? 'mb-4' : 'mb-8'} ${navVisible ? 'top-16' : 'top-0'} ${!isScrolled ? 'mt-2 lg:mt-6' : 'mt-0'}`}>
                <div className={`transition-all duration-300 mx-auto ${!navVisible ? 'w-full px-0' : 'max-w-[1600px] px-4 sm:px-6 lg:px-8'}`}>
                    <div className={`flex items-center relative transition-all duration-500 ${!navVisible
                        ? 'bg-primary-600 border-b border-white/10 shadow-lg py-3 px-4'
                        : 'bg-transparent lg:bg-white/95 lg:backdrop-blur-sm lg:rounded-[3px] lg:shadow-sm h-16 px-0 lg:px-4'}`}>

                        {/* Logo Left */}
                        <div className={`hidden lg:flex items-center transition-all ${!navVisible ? 'flex-1' : 'w-0 overflow-hidden'}`}>
                            <a href="/" className="flex items-center gap-2 mr-4 shrink-0">
                                <Logo className="h-8 w-8 text-white" />
                                <span className="text-xl font-bold text-white tracking-tight whitespace-nowrap">Super Real Estate</span>
                            </a>
                        </div>

                        {/* Search Center */}
                        <div className={`hidden lg:flex flex-[2] transition-all ${!navVisible ? 'justify-center' : 'justify-start'}`}>
                            <div className="flex items-center gap-3 w-full max-w-4xl">
                                <div className={`flex-1 flex items-center h-10 px-4 rounded-[3px] transition-all ${!navVisible
                                    ? 'bg-white/10 border border-white/20'
                                    : 'bg-white border border-gray-200'}`}>
                                    <MagnifyingGlassIcon className={`w-5 h-5 mr-3 shrink-0 ${!navVisible ? 'text-white/60' : 'text-gray-400'}`} />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search..."
                                        className={`bg-transparent border-none outline-none w-full text-sm ${!navVisible ? 'text-white placeholder-white/50' : 'text-gray-900 placeholder-gray-500'}`}
                                    />
                                </div>
                                <div className={`w-px h-8 ${!navVisible ? 'bg-white/20' : 'bg-gray-300/50'}`} />
                                <div className="flex gap-2">
                                    <button onClick={() => setIsFilterModalOpen(true)} className={`flex items-center gap-2 px-4 py-2 rounded-[3px] text-sm font-bold border ${hasActiveFilters ? 'bg-white text-primary-600 border-primary-600 shadow-md' : (!navVisible ? 'bg-white/10 text-white border-white/20' : 'bg-white text-gray-700 border-gray-200')}`}>
                                        <FunnelIcon className="w-4 h-4" />
                                        <span>Filters</span>
                                    </button>
                                    <button onClick={() => setIsTransitModalOpen(true)} className={`flex items-center gap-2 px-4 py-2 rounded-[3px] text-sm font-bold border ${filters.station_id ? 'bg-white text-primary-600 border-primary-600 shadow-md' : (!navVisible ? 'bg-white/10 text-white border-white/20' : 'bg-white text-gray-700 border-gray-200')}`}>
                                        <MapPinIcon className="w-4 h-4" />
                                        <span>Transit</span>
                                    </button>
                                    <div className="flex items-center gap-3 pl-2">
                                        <span className={`text-[11px] font-black uppercase tracking-widest ${isGoogleMapOpen ? 'text-primary-600' : 'text-gray-400'}`}>Map View</span>
                                        <button
                                            onClick={() => setIsGoogleMapOpen(!isGoogleMapOpen)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isGoogleMapOpen ? 'bg-primary-600' : (!navVisible ? 'bg-white/20' : 'bg-gray-200')}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isGoogleMapOpen ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Layout Select Right */}
                        <div className="hidden lg:flex flex-1 justify-end">
                            <div className={`flex items-center gap-1 rounded-lg p-1 ${!navVisible ? 'bg-white/10' : 'bg-gray-50'}`}>
                                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-400'}`}>
                                    <Squares2X2Icon className="w-5 h-5" />
                                </button>
                                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-400'}`}>
                                    <ListBulletIcon className="w-5 h-5" />
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
                    {!isGoogleMapOpen && (
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
                                    {!hasActiveFilters ? (
                                        <div className="text-center py-6">
                                            <div className="bg-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <SparklesIcon className="w-6 h-6 text-primary-600" />
                                            </div>
                                            <p className="text-sm text-gray-500">Find your perfect home with filters</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Simplified active filters display */}
                                            <div className="bg-green-50 p-3 rounded-[3px] text-green-800 text-sm font-bold border border-green-100 flex items-center gap-2">
                                                <CheckCircleIcon className="w-5 h-5" />
                                                {total} Results Matches
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Listings Grid */}
                    {/* Listings Grid + Map Split View */}
                    <div className={`${isGoogleMapOpen ? 'lg:col-span-12' : 'lg:col-span-8'} transition-all duration-500`}>
                        <div className={`flex flex-col lg:flex-row gap-8 min-h-[70vh]`}>
                            {/* Left Side: Property List */}
                            <div className={`transition-all duration-500 ${isGoogleMapOpen ? 'lg:w-1/2 lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto lg:pr-4' : 'lg:w-full'}`}>
                                {initialLoading ? (
                                    <div className={`grid gap-4 ${isGoogleMapOpen ? 'grid-cols-1 lg:grid-cols-2' : (viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}`}>
                                        {[...Array(6)].map((_, i) => <ListingSkeleton key={i} viewMode={isGoogleMapOpen ? 'grid' : viewMode} />)}
                                    </div>
                                ) : listings.length > 0 ? (
                                    <>
                                        <div className={`grid gap-4 ${isGoogleMapOpen ? 'grid-cols-1 lg:grid-cols-2' : (viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}`}>
                                            {listings.map(l => <ListingCard key={l.id} listing={l} viewMode={isGoogleMapOpen ? 'grid' : viewMode} priceFormat={priceFormat} />)}
                                        </div>
                                        <div ref={observerTarget} className="h-20 flex items-center justify-center">
                                            {loading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />}
                                        </div>
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

                            {/* Right Side: Google Map (Desktop Split) */}
                            {isGoogleMapOpen && (
                                <div className="hidden lg:block lg:w-1/2 sticky top-32 h-[calc(100vh-160px)] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-white animate-fade-in group pointer-events-auto">
                                    <GoogleMap
                                        listings={listings}
                                        onMarkerClick={(property) => window.open(`/listings/${property.id}`, '_blank')}
                                        onBoundsChanged={(bounds) => { setMapBounds(bounds); setPage(1); }}
                                    />

                                    {/* Stats Theme Card Overlays */}
                                    <div className="absolute top-4 left-4 z-10 pointer-events-none">
                                        <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-white flex items-center gap-3 animate-slide-up pointer-events-auto">
                                            <div className="bg-primary-50 w-10 h-10 rounded-xl flex items-center justify-center">
                                                <GlobeAltIcon className="w-6 h-6 text-primary-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Map Explorer</p>
                                                <p className="text-sm font-black text-gray-900 leading-none">{total} Properties Found</p>
                                            </div>
                                        </div>
                                    </div>


                                    {/* Legend Card */}
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
                                        <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-white flex items-center gap-6 animate-slide-up">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-primary-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                                                <span className="text-xs font-black uppercase tracking-widest text-gray-600">Rent</span>
                                            </div>
                                            <div className="w-px h-4 bg-gray-200" />
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-orange-600 shadow-[0_0_10px_rgba(234,88,12,0.4)]" />
                                                <span className="text-xs font-black uppercase tracking-widest text-gray-600">Sale</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {
                isFilterModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsFilterModalOpen(false)} />
                        <div className="bg-white w-full h-[100dvh] md:h-auto md:max-h-[85vh] md:max-w-lg md:rounded-[3px] shadow-2xl overflow-hidden relative z-10 flex flex-col animate-scale-up">
                            <div className="p-4 border-b flex justify-between items-center">
                                <h3 className="font-bold text-lg">Filter Properties</h3>
                                <button onClick={() => setIsFilterModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32 md:pb-6">
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
                            <div className="p-4 border-t bg-gray-50 flex gap-3 safe-area-bottom">
                                <button onClick={clearFilters} className="px-6 py-3 bg-gray-200/50 rounded-[3px] font-bold text-gray-600 hover:bg-gray-200 active:scale-95 transition-all text-sm">Reset</button>
                                <button onClick={() => setIsFilterModalOpen(false)} className="flex-1 bg-primary-600 text-white py-3 rounded-[3px] font-bold shadow-md hover:bg-primary-700 active:scale-95 transition-all">Show {total} Results</button>
                            </div>
                        </div>
                    </div>
                )
            }

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
                className={`fixed bottom-28 right-6 md:bottom-8 md:right-8 bg-primary-600 text-white p-3 rounded-full shadow-lg transition-all z-[100] ${showScrollTop && !isFilterModalOpen && !isTransitModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
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
                            onClick={() => setIsGoogleMapOpen(true)}
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
                                onClick={() => setIsFilterModalOpen(true)}
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
                                onClick={() => setIsGoogleMapOpen(false)}
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
                                onClick={() => setIsGoogleMapOpen(false)}
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
