import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { publicApi } from '../../services/api';
import ListingCard from '../../components/Listings/ListingCard';
import TransitMapFilter from '../../components/TransitMap/TransitMapFilter';
import StyledSelect from '../../components/Form/StyledSelect';
import ShowcaseBanners from '../../components/Common/ShowcaseBanners';

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
    TagIcon,
} from '@heroicons/react/24/outline';

import {
    CheckCircleIcon
} from '@heroicons/react/24/solid';
import Logo from '../../components/Common/Logo';

// Static Options moved outside to prevent recreation
const propertyTypeOptions = [
    { value: '', label: '🏘️ All Types' },
    { value: 'condo', label: '🏢 Condo' },
    { value: 'house', label: '🏠 House' },
    { value: 'townhouse', label: '🏘️ Townhouse' },
    { value: 'apartment', label: '🏬 Apartment' },
    { value: 'land', label: '🌳 Land' },
];

const listingTypeOptions = [
    { value: '', label: '🔄 Sale & Rent' },
    { value: 'sale', label: '💰 For Sale' },
    { value: 'rent', label: '🔑 For Rent' },
];

const bedroomOptions = [
    { value: '', label: '🛏️ Any Beds' },
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
    const { navVisible } = useOutletContext() || { navVisible: true }; // Fallback for dev
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

    const [viewMode, setViewMode] = useState(() => localStorage.getItem('listings_view_mode') || 'grid');
    const [priceLimits, setPriceLimits] = useState({ min: 0, max: 0 });
    const [priceFormat, setPriceFormat] = useState('short'); // Default to short to match previous behavior
    const [agentId, setAgentId] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);

    // Scroll listener for filter bar margin
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Save view mode selection
    useEffect(() => {
        localStorage.setItem('listings_view_mode', viewMode);
    }, [viewMode]);

    // Lock background scroll when modals are open
    useEffect(() => {
        if (isFilterModalOpen || isTransitModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isFilterModalOpen, isTransitModalOpen]);

    const [stations, setStations] = useState([]);

    useEffect(() => {
        const fetchAgentInfo = async () => {
            try {
                // Prioritize agent_id from URL for development/testing
                let urlAgentId = searchParams.get('agent_id') || searchParams.get('agent');

                // If on localhost and no URL param, use logged-in agent (simulating domain)
                if (!urlAgentId && window.location.hostname.includes('localhost') && user?.agent_id) {
                    urlAgentId = user.agent_id;
                }

                const response = await publicApi.getAgentInfo(urlAgentId ? { agent_id: urlAgentId } : {});
                setPriceLimits({
                    min: parseFloat(response.data.min_price_limit) || 0,
                    max: parseFloat(response.data.max_price_limit) || 0
                });
                if (response.data.price_format) {
                    setPriceFormat(response.data.price_format);
                }
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
    }, [searchParams]);

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
    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    // Sync URL with restored filters on mount if URL was empty
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        let updated = false;
        Object.keys(filters).forEach(key => {
            if (filters[key] && !params.has(key)) {
                params.set(key, filters[key]);
                updated = true;
            }
        });
        if (updated) {
            setSearchParams(params, { replace: true });
        }
    }, []);

    // Debounce search input
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
            // Only set initial loading if we don't have listings yet (first load or new search)
            if (listings.length === 0) setInitialLoading(true);
            setLoading(true);
            try {
                // Determine layout mode based on filters
                const params = {
                    ...filters,
                    page,
                    limit: 6
                };

                // If on localhost, inject logged-in agent ID to simulate domain filtering
                if (window.location.hostname.includes('localhost') && user?.agent_id && !params.agent_id) {
                    params.agent_id = user.agent_id;
                }

                // Pass signal to axios
                const response = await publicApi.getListings(params, { signal: controller.signal });
                const data = response.data;

                setListings(prev => page === 1 ? data.listings : [...prev, ...data.listings]);
                setTotal(data.total || 0);

            } catch (error) {
                // Ignore abort errors
                if (axios.isCancel(error) || error.name === 'CanceledError') return;
                console.error('Failed to fetch listings', error);
            } finally {
                // Only update state if not aborted
                if (!controller.signal.aborted) {
                    setLoading(false);
                    setInitialLoading(false);
                }
            }
        };

        fetchListings();

        return () => controller.abort();
    }, [filters, page, viewMode]); // Re-run when filters/page change

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loading && listings.length < total) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [loading, listings.length, total]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Persist to localStorage
        localStorage.setItem('listing_filters', JSON.stringify(newFilters));

        setPage(1);
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    const handleSelectChange = (key, option) => {
        // StyledSelect now returns the value if s.value is used in onChange
        // We handle both object and primitive cases for robustness
        const val = (option && typeof option === 'object') ? option.value : option;
        handleFilterChange(key, val || '');
    };

    const handleStationSelect = (stationId) => {
        handleFilterChange('station_id', stationId);
        // Modal closes in the render logic or handler wrapper
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
        setIsFilterModalOpen(false); // Close modal on reset
    };


    // --- Components ---










    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header / Mobile Breadcrumb or Title */}
            <div className="py-6 lg:hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
                    <p className="text-sm text-gray-500 mt-1">{total} properties found</p>
                </div>
            </div>

            {/* Render Control Bar Outside Main Container for Full Width */}
            <div className={`w-full sticky z-40 transition-all duration-300 ${isScrolled ? 'mb-4' : 'mb-8'} ${navVisible ? 'top-16' : 'top-0'
                } ${!isScrolled ? 'mt-6' : 'mt-0'}`}>
                <div className={`transition-all duration-300 mx-auto ${!navVisible
                    ? 'w-full px-0'
                    : 'max-w-[1600px] px-4 sm:px-6 lg:px-8'
                    }`}>

                    <div className={`flex items-center relative h-16 bg-white/95 backdrop-blur-sm transition-all duration-300 ${!navVisible
                        ? 'rounded-none border-b border-gray-200 px-4 sm:px-6 lg:px-8'
                        : 'rounded-[3px] shadow-sm px-4'
                        }`}>

                        {/* 3-Column Layout: Logo (Left), Search/Filters (Center), Stats (Right) */}
                        <div className="flex-1 flex items-center min-w-0">
                            {initialLoading ? (
                                <div className="flex items-center gap-2 animate-pulse">
                                    <div className="h-8 w-8 bg-gray-200 rounded-[3px]" />
                                    <div className="h-6 w-32 bg-gray-200 rounded-[3px] hidden sm:block" />
                                </div>
                            ) : (
                                <a href="/" className={`flex items-center gap-2 transition-all duration-300 origin-left shrink-0 ${!navVisible
                                    ? 'w-auto opacity-100 scale-100 mr-4'
                                    : 'w-0 opacity-0 scale-90 overflow-hidden'
                                    }`}>
                                    <Logo className="h-8 w-8 text-primary-600" />
                                    <span className="text-xl font-bold text-gray-900 tracking-tight whitespace-nowrap">
                                        Super Real Estate
                                    </span>
                                </a>
                            )}
                        </div>

                        <div className="flex-[2] flex justify-center min-w-0">
                            {initialLoading ? (
                                <div className="flex items-center gap-3 animate-pulse w-full max-w-fit">
                                    <div className="w-48 sm:w-72 h-10 bg-gray-200 rounded-[3px]" />
                                    <div className="w-px h-8 bg-gray-200 hidden sm:block" />
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-10 bg-gray-200 rounded-[3px]" />
                                        <div className="w-24 h-10 bg-gray-200 rounded-[3px]" />
                                        <div className="w-16 h-10 bg-gray-200 rounded-[3px] hidden md:block" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 w-full max-w-fit">
                                    <div className="w-64 sm:w-96 flex items-center h-10 px-4 bg-white rounded-[3px] border border-gray-200 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all">
                                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search..."
                                            className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 w-full text-sm text-gray-900 placeholder-gray-500 p-0"
                                        />
                                    </div>

                                    <div className="w-px h-8 bg-gray-300/50 hidden sm:block" />

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setIsFilterModalOpen(true)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-[3px] text-sm font-semibold transition-all border shrink-0 ${hasActiveFilters
                                                ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <FunnelIcon className="w-4 h-4" />
                                            <span className="hidden sm:inline">Filters</span>
                                        </button>

                                        <button
                                            onClick={() => setIsTransitModalOpen(true)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-[3px] text-sm font-semibold transition-all border shrink-0 ${filters.station_id
                                                ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <MapPinIcon className="w-4 h-4" />
                                            <span className="hidden sm:inline">Transit</span>
                                        </button>

                                        <a
                                            href="/listings?view=map"
                                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-[3px] text-sm font-semibold bg-white text-gray-700 border border-gray-200 hover:border-gray-300 transition-all shrink-0"
                                        >
                                            <GlobeAltIcon className="w-4 h-4" />
                                            <span>Map</span>
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 flex justify-end min-w-0">
                            {initialLoading ? (
                                <div className="flex items-center gap-4 animate-pulse">
                                    <div className="hidden sm:flex flex-col items-end gap-1">
                                        <div className="h-4 w-16 bg-gray-200 rounded-[3px]" />
                                        <div className="h-3 w-10 bg-gray-100 rounded-[3px]" />
                                    </div>
                                    <div className="w-px h-6 bg-gray-200 hidden sm:block" />
                                    <div className="flex items-center gap-1">
                                        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                                        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 bg-gray-50/50 rounded-lg p-1.5 backdrop-blur-sm">
                                    <div className="hidden sm:flex items-baseline gap-2 text-right pr-2 lg:pr-4">
                                        <span className="text-base font-bold text-gray-900">Properties</span>
                                        <span className="text-sm text-gray-500 font-medium">
                                            {listings.length} results
                                        </span>
                                    </div>

                                    <div className="w-px h-6 bg-gray-200 hidden sm:block" />

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                                                ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <Squares2X2Icon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                                                ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <ListBulletIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-0">
                {/* Main Layout - 12 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT SIDEBAR: ACTIVE FILTERS (Span 4) */}
                    <div className="lg:col-span-4 hidden lg:block order-1">
                        <div className={`sticky space-y-6 ${navVisible ? 'top-40' : 'top-24'}`}>
                            {/* Banners in Sidebar */}
                            <div className="w-full">
                                <ShowcaseBanners agentId={agentId} loading={initialLoading} />
                            </div>

                            {/* Active Filters Sidebar - Stable Container Wrapper */}
                            <div className="bg-white rounded-[3px] shadow-sm border border-gray-100 overflow-hidden">
                                {initialLoading ? (
                                    <div className="p-4 animate-pulse">
                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                                            <div className="h-5 w-32 bg-gray-200 rounded" />
                                            <div className="h-4 w-12 bg-gray-100 rounded" />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex gap-3">
                                                <div className="w-4 h-4 bg-gray-100 rounded" />
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-3 w-12 bg-gray-50 rounded" />
                                                    <div className="h-4 w-24 bg-gray-200 rounded" />
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="w-4 h-4 bg-gray-100 rounded" />
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-3 w-16 bg-gray-50 rounded" />
                                                    <div className="h-4 w-32 bg-gray-200 rounded" />
                                                </div>
                                            </div>
                                            <div className="mt-6 h-12 w-full bg-green-50/50 rounded-[3px] border border-green-50" />
                                        </div>
                                    </div>
                                ) : !hasActiveFilters ? (
                                    <div className="p-6">
                                        <div className="text-center">
                                            <div className="bg-primary-50 w-12 h-12 rounded-[3px] flex items-center justify-center mx-auto mb-4">
                                                <SparklesIcon className="w-6 h-6 text-primary-600" />
                                            </div>
                                            <h3 className="text-gray-900 font-bold mb-2">Discover Your Home</h3>
                                            <p className="text-sm text-gray-500 mb-6">
                                                Use the filters above or select a station to find properties that match your lifestyle.
                                            </p>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-[3px]">Apartments</span>
                                                <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-[3px]">Near BTS</span>
                                                <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-[3px]">Luxury</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 animate-fade-in">
                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                <FunnelIcon className="w-4 h-4 text-primary-600" />
                                                Active Filters
                                            </h3>
                                            <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 font-medium">
                                                Clear All
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {filters.search && (
                                                <div className="flex items-start gap-3 text-sm text-gray-700">
                                                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                                    <div>
                                                        <span className="text-xs text-gray-500 block">Search</span>
                                                        <span className="font-medium">"{filters.search}"</span>
                                                    </div>
                                                </div>
                                            )}

                                            {filters.station_id && (
                                                <div className="flex items-start gap-3 text-sm text-gray-700">
                                                    <MapPinIcon className="w-4 h-4 text-primary-500 mt-0.5" />
                                                    <div>
                                                        <span className="text-sm text-gray-500 block">Station</span>
                                                        <span className="font-medium text-primary-700">
                                                            {stations.find(s => s.id === filters.station_id)?.name_en || filters.station_id}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {filters.type && (
                                                <div className="flex items-start gap-3 text-sm text-gray-700">
                                                    <BuildingOfficeIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                                    <div>
                                                        <span className="text-xs text-gray-500 block">Property Type</span>
                                                        <span className="font-medium capitalize">{filters.type}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {filters.listing_type && (
                                                <div className="flex items-start gap-3 text-sm text-gray-700">
                                                    <TagIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                                    <div>
                                                        <span className="text-sm text-gray-500 block">Listing Type</span>
                                                        <span className="font-medium capitalize">{filters.listing_type === 'sale' ? 'For Sale' : 'For Rent'}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {(filters.min_price || filters.max_price) && (
                                                <div className="flex items-start gap-3 text-sm text-gray-700">
                                                    <span className="w-4 text-center font-bold text-gray-400">฿</span>
                                                    <div>
                                                        <span className="text-xs text-gray-500 block">Price Range</span>
                                                        <span className="font-medium">
                                                            {filters.min_price ? formatPrice(filters.min_price) : '0'}
                                                            {' - '}
                                                            {filters.max_price ? formatPrice(filters.max_price) : 'Any'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 p-3 bg-green-50 rounded-[3px] flex items-center gap-3 border border-green-100">
                                            <div className="flex items-center justify-center">
                                                {loading ? (
                                                    <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                                )}
                                            </div>
                                            <span className="text-sm text-green-800 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                                {total} Properties Found
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: LISTINGS (Span 8) */}
                    <div className="lg:col-span-8 flex flex-col min-w-0 order-2">

                        {/* Listings Content */}
                        <div className="w-full">
                            {initialLoading ? (
                                <div className={`grid gap-6 ${viewMode === 'grid'
                                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                                    : 'grid-cols-1'
                                    }`}>
                                    {[...Array(6)].map((_, i) => (
                                        <ListingSkeleton key={i} viewMode={viewMode} />
                                    ))}
                                </div>
                            ) : listings.length > 0 ? (
                                <>
                                    <div className={`grid gap-6 ${viewMode === 'grid'
                                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                                        : 'grid-cols-1'
                                        }`}>
                                        {listings.map((listing) => (
                                            <ListingCard key={listing.id} listing={listing} viewMode={viewMode} priceFormat={priceFormat} />
                                        ))}

                                        {/* Scroll Loading */}
                                        {listings.length < total && loading && (
                                            [...Array(3)].map((_, i) => (
                                                <ListingSkeleton key={`skel-${i}`} viewMode={viewMode} />
                                            ))
                                        )}
                                    </div>

                                    <div ref={observerTarget} className="h-20 mt-8 flex items-center justify-center">
                                        {loading && listings.length < total && (
                                            <div className="flex gap-2">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center flex flex-col items-center justify-center min-h-[600px] bg-white rounded-3xl border border-gray-100 shadow-sm animate-fade-in p-12">
                                    <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                                        <SparklesIcon className="w-12 h-12 text-blue-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Discover Your Home</h3>
                                    <p className="text-gray-500 mb-8 max-w-md text-lg leading-relaxed">
                                        Use the filters above or select a station to find properties that match your lifestyle.
                                    </p>

                                    <div className="flex flex-wrap justify-center gap-3">
                                        <button
                                            onClick={() => {
                                                setInitialLoading(true);
                                                setFilters(prev => ({ ...prev, type: 'condo' }));
                                            }}
                                            className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Condos
                                        </button>
                                        <button
                                            onClick={() => {
                                                setInitialLoading(true);
                                                setFilters(prev => ({ ...prev, search: 'BTS' }));
                                            }}
                                            className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Near BTS
                                        </button>
                                        <button
                                            onClick={() => {
                                                setInitialLoading(true);
                                                setFilters(prev => ({ ...prev, min_price: '5000000', search: 'Luxury' }));
                                            }}
                                            className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Luxury
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Render Modals Inlined */}
                {isFilterModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
                        <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-lg overflow-hidden relative z-10 animate-scale-up">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">Filter Properties</h3>
                                <button onClick={() => setIsFilterModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-[3px] transition-colors">
                                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Property Type</label>
                                        <StyledSelect
                                            options={propertyTypeOptions}
                                            value={getSelectedOption(propertyTypeOptions, filters.type)}
                                            onChange={(opt) => handleSelectChange('type', opt)}
                                            placeholder="Any Type"
                                            isClearable={false}
                                            isSearchable={false}
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Listing Type</label>
                                        <StyledSelect
                                            options={listingTypeOptions}
                                            value={getSelectedOption(listingTypeOptions, filters.listing_type)}
                                            onChange={(opt) => handleSelectChange('listing_type', opt)}
                                            placeholder="Sale & Rent"
                                            isClearable={false}
                                            isSearchable={false}
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Bedrooms</label>
                                        <StyledSelect
                                            options={bedroomOptions}
                                            value={getSelectedOption(bedroomOptions, filters.bedrooms)}
                                            onChange={(opt) => handleSelectChange('bedrooms', opt)}
                                            placeholder="Any"
                                            isClearable={false}
                                            isSearchable={false}
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Price Range</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                placeholder={priceLimits.min > 0 ? `Min (${priceLimits.min})` : "Min Price"}
                                                min={0}
                                                value={filters.min_price}
                                                onChange={(e) => handleFilterChange('min_price', e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-[3px] px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            />
                                            <span className="text-gray-400 font-medium">-</span>
                                            <input
                                                type="number"
                                                placeholder={priceLimits.max > 0 ? `Max (${priceLimits.max})` : "Max Price"}
                                                min={0}
                                                value={filters.max_price}
                                                onChange={(e) => handleFilterChange('max_price', e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-[3px] px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
                                <button onClick={clearFilters} className="text-gray-500 font-medium hover:text-gray-900 px-4 text-sm">
                                    Reset filters
                                </button>
                                <button onClick={() => setIsFilterModalOpen(false)} className="btn-primary flex-1 py-3 text-sm">
                                    Show {total} Properties
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isTransitModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/5 backdrop-blur-sm transition-opacity backdrop-saturate-150" />
                        <div className="bg-white/95 backdrop-blur-xl rounded-[3px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] w-full max-w-5xl h-[85vh] overflow-hidden relative z-10 flex flex-col animate-scale-up border border-white/20">
                            <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-md z-20">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 tracking-tight">
                                        <div className="p-1.5 bg-primary-100 rounded-[3px]">
                                            <MapPinIcon className="w-5 h-5 text-primary-600" />
                                        </div>
                                        Select Transit Station
                                    </h3>
                                    <p className="text-sm font-medium text-gray-400 mt-0.5 ml-9">Click a station to filter properties nearby</p>
                                </div>
                                <button onClick={() => setIsTransitModalOpen(false)} className="p-2 hover:bg-gray-100/50 rounded-[3px] transition-all hover:scale-110 active:scale-95 group">
                                    <XMarkIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-hidden relative bg-white">
                                <TransitMapFilter
                                    onStationClick={(id) => {
                                        handleStationSelect(id);
                                        setIsTransitModalOpen(false);
                                    }}
                                    selectedStation={filters.station_id}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListingsPage;
