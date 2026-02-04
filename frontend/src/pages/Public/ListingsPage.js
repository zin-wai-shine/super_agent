import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
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

const ListingsPage = () => {
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

    const [viewMode, setViewMode] = useState('grid');
    const [priceLimits, setPriceLimits] = useState({ min: 0, max: 0 });
    const [agentId, setAgentId] = useState(null);

    useEffect(() => {
        const fetchAgentInfo = async () => {
            try {
                // Prioritize agent_id from URL for development/testing
                const urlAgentId = searchParams.get('agent_id') || searchParams.get('agent');

                const response = await publicApi.getAgentInfo(urlAgentId ? { agent_id: urlAgentId } : {});
                setPriceLimits({
                    min: parseFloat(response.data.min_price_limit) || 0,
                    max: parseFloat(response.data.max_price_limit) || 0
                });
                setAgentId(urlAgentId || response.data.id);
            } catch (error) {
                console.error('Failed to fetch agent info:', error);
            }
        };
        fetchAgentInfo();
    }, [searchParams]);

    // Filter states
    const [filters, setFilters] = useState({
        type: searchParams.get('type') || '',
        listing_type: searchParams.get('listing_type') || '',
        min_price: searchParams.get('min_price') || '',
        max_price: searchParams.get('max_price') || '',
        bedrooms: searchParams.get('bedrooms') || '',
        station_id: searchParams.get('station_id') || '',
        search: searchParams.get('search') || '',
    });

    // Dropdown options
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

    useEffect(() => {
        const fetchListings = async () => {
            // Only set initial loading if we don't have listings yet (first load or new search)
            if (listings.length === 0) setInitialLoading(true);
            setLoading(true);
            try {
                // Determine layout mode based on filters (example logic)
                // For now, standard fetch
                const queryParams = new URLSearchParams();
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) queryParams.append(key, value);
                });
                queryParams.append('page', page);
                queryParams.append('limit', 6); // Initial limit 6 per request as requested

                // Simulate API delay for smoothness
                await new Promise(r => setTimeout(r, 800));

                /* 
                   Replace with actual API call:
                   const response = await api.get(`/listings?${queryParams}`);
                   setListings(prev => page === 1 ? response.data : [...prev, ...response.data]);
                   setTotal(response.total);
                */

                // MOCK DATA: Generate 6 items per page
                const mockListings = Array(6).fill(null).map((_, i) => ({
                    id: `mock-${page}-${i}`,
                    title: `Beautiful Property ${page}-${i}`,
                    price: 2500000 + (i * 100000),
                    location: 'Bangkok, Thailand',
                    bedrooms: 2,
                    bathrooms: 2,
                    area: 85,
                    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
                    type: ['condo', 'house', 'townhome'][i % 3],
                    tags: ['BTS', 'Luxury']
                }));
                // Filter mock data based on search/type (basic)
                let filtered = mockListings;
                if (filters.type) filtered = filtered.filter(l => l.type === filters.type);

                setListings(prev => page === 1 ? filtered : [...prev, ...filtered]);
                setTotal(120); // Mock total

            } catch (error) {
                console.error('Failed to fetch listings', error);
            } finally {
                setLoading(false);
                setInitialLoading(false);
            }
        };

        fetchListings();
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
        setFilters((prev) => ({ ...prev, [key]: value }));
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
        handleFilterChange(key, option?.value || '');
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
        setSearchParams({});
        setIsFilterModalOpen(false); // Close modal on reset
    };

    const hasActiveFilters = Object.values(filters).some((v) => v !== '');

    // Get current selected options
    const getSelectedOption = (options, value) =>
        options.find(opt => opt.value === value) || null;

    // --- Components ---

    const renderControlBar = () => (
        <div className={`w-full mb-8 sticky z-40 transition-[top] duration-300 ${navVisible ? 'top-16' : 'top-0'
            }`}>
            {/* Width Constraint Wrapper */}
            <div className={`transition-all duration-300 mx-auto ${!navVisible
                ? 'w-full px-0'
                : 'max-w-[1600px] px-4 sm:px-6 lg:px-8'
                }`}>

                {/* Visual Bar (White Background) */}
                <div className={`flex items-center relative h-16 bg-white/95 backdrop-blur-sm transition-all duration-300 ${!navVisible
                    ? 'rounded-none border-b border-gray-200 px-4 sm:px-6 lg:px-8'
                    : 'rounded-xl shadow-sm px-4'
                    }`}>

                    {/* Left Side: Logo (Visible on Scroll) */}
                    <div className="flex-1 flex items-center">
                        <a href="/" className={`flex items-center gap-2 transition-all duration-300 origin-left ${!navVisible
                            ? 'w-auto opacity-100 scale-100 mr-4'
                            : 'w-0 opacity-0 scale-90 overflow-hidden'
                            }`}>
                            <Logo className="h-8 w-8 text-primary-600" />
                            <span className="text-xl font-bold text-gray-900 tracking-tight whitespace-nowrap">
                                Super Real Estate
                            </span>
                        </a>
                    </div>

                    {/* Center Group: Search + Filters (Absolute Centered) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-full max-w-fit flex justify-center">
                        <div className="flex items-center gap-3">
                            {/* Search Input */}
                            <div className="w-72 flex items-center h-10 px-4 bg-white rounded-full shadow-sm border border-gray-200 hover:shadow-md focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all">
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    placeholder="Search..."
                                    className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 w-full text-sm text-gray-900 placeholder-gray-500 p-0"
                                />
                            </div>

                            {/* Separator */}
                            <div className="w-px h-8 bg-gray-300/50 hidden sm:block" />

                            {/* Filter Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsFilterModalOpen(true)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border shrink-0 ${hasActiveFilters
                                        ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200'
                                        : 'bg-white text-gray-700 border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
                                        }`}
                                >
                                    <FunnelIcon className="w-4 h-4" />
                                    <span>Filters</span>
                                </button>

                                <button
                                    onClick={() => setIsTransitModalOpen(true)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border shrink-0 ${filters.station_id
                                        ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200'
                                        : 'bg-white text-gray-700 border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
                                        }`}
                                >
                                    <MapPinIcon className="w-4 h-4" />
                                    <span>Transit</span>
                                </button>

                                <a
                                    href="/listings?view=map"
                                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white text-gray-700 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all shrink-0"
                                >
                                    <GlobeAltIcon className="w-4 h-4" />
                                    <span>Map</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Properties Count & View Toggles */}
                    <div className="flex-1 flex justify-end z-20">
                        <div className="flex items-center gap-4 bg-gray-50/50 rounded-lg p-1.5 backdrop-blur-sm">
                            <div className="hidden sm:flex items-baseline gap-2 text-right pr-2">
                                <span className="text-sm font-bold text-gray-900">Properties</span>
                                <span className="text-xs text-gray-500 font-medium">
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
                    </div>
                </div>
            </div>
        </div>
    );

    const ActiveFiltersSidebar = () => {
        if (!hasActiveFilters) {
            return (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="text-center">
                        <div className="bg-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                            <SparklesIcon className="w-6 h-6 text-primary-600" />
                        </div>
                        <h3 className="text-gray-900 font-bold mb-2">Discover Your Home</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Use the filters above or select a station to find properties that match your lifestyle.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Apartments</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Near BTS</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Luxury</span>
                        </div>
                    </div>
                </div>
            );
        }

        const formatPrice = (p) => p ? `${parseInt(p).toLocaleString()}` : '';

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-fade-in">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <FunnelIcon className="w-4 h-4 text-primary-600" />
                        Active Filters
                    </h3>
                    <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium">
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
                                <span className="text-xs text-gray-500 block">Station</span>
                                <span className="font-medium text-primary-700">{filters.station_id}</span>
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
                                <span className="text-xs text-gray-500 block">Listing Type</span>
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

                <div className="mt-6 p-3 bg-green-50 rounded-lg flex items-center gap-3 border border-green-100">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-800 font-medium">
                        {total} Properties Found
                    </span>
                </div>
            </div>
        );
    };

    const FilterModal = () => {
        if (!isFilterModalOpen) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsFilterModalOpen(false)}
                />
                {/* Modal Content */}
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 animate-scale-up">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Filter Properties</h3>
                        <button onClick={() => setIsFilterModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                            <XMarkIcon className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {/* Form Groups */}
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
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    />
                                    <span className="text-gray-400 font-medium">-</span>
                                    <input
                                        type="number"
                                        placeholder={priceLimits.max > 0 ? `Max (${priceLimits.max})` : "Max Price"}
                                        min={0}
                                        value={filters.max_price}
                                        onChange={(e) => handleFilterChange('max_price', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
                        <button
                            onClick={clearFilters}
                            className="text-gray-500 font-medium hover:text-gray-900 px-4 text-sm"
                        >
                            Reset filters
                        </button>
                        <button
                            onClick={() => setIsFilterModalOpen(false)}
                            className="btn-primary flex-1 py-3 text-sm"
                        >
                            Show {total} Properties
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const TransitModal = () => {
        if (!isTransitModalOpen) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsTransitModalOpen(false)}
                />

                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden relative z-10 flex flex-col animate-scale-up">
                    <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white z-20">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <MapPinIcon className="w-5 h-5 text-primary-600" />
                                Select Transit Station
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">Click a station to filter properties nearby</p>
                        </div>
                        <button onClick={() => setIsTransitModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                            <XMarkIcon className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden relative bg-gray-50">
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
        );
    }

    // Skeleton Component
    const ListingSkeleton = () => (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full animate-pulse">
            {/* Image Skeleton */}
            <div className="h-48 bg-gray-200 w-full relative">
                <div className="absolute top-4 left-4 w-16 h-6 bg-gray-300 rounded-full" />
                <div className="absolute top-4 right-4 w-16 h-6 bg-gray-300 rounded-full" />
            </div>
            {/* Content Skeleton */}
            <div className="p-4 flex-1 flex flex-col space-y-3">
                {/* Price & Badge */}
                <div className="flex justify-between items-center">
                    <div className="h-8 w-24 bg-gray-200 rounded-lg" />
                    <div className="h-4 w-12 bg-gray-100 rounded" />
                </div>
                {/* Title */}
                <div className="space-y-2">
                    <div className="h-5 w-3/4 bg-gray-200 rounded" />
                    <div className="h-5 w-1/2 bg-gray-200 rounded" />
                </div>
                {/* Location */}
                <div className="h-4 w-1/3 bg-gray-100 rounded mt-2" />

                <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between">
                    <div className="h-4 w-8 bg-gray-100 rounded" />
                    <div className="h-4 w-8 bg-gray-100 rounded" />
                    <div className="h-4 w-8 bg-gray-100 rounded" />
                </div>
            </div>
        </div>
    );

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
            {renderControlBar()}

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-0">

                {/* Main Layout - 12 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT SIDEBAR: ACTIVE FILTERS (Span 4) */}
                    <div className="lg:col-span-4 hidden lg:block order-1">
                        <div className={`sticky transition-[top] duration-300 space-y-6 ${navVisible ? 'top-40' : 'top-24'}`}>
                            {/* Banners in Sidebar */}
                            <div className="w-full">
                                <ShowcaseBanners agentId={agentId} />
                            </div>
                            <ActiveFiltersSidebar />
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
                                        <ListingSkeleton key={i} />
                                    ))}
                                </div>
                            ) : listings.length > 0 ? (
                                <>
                                    <div className={`grid gap-6 ${viewMode === 'grid'
                                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                                        : 'grid-cols-1'
                                        }`}>
                                        {listings.map((listing) => (
                                            <ListingCard key={listing.id} listing={listing} viewMode={viewMode} />
                                        ))}

                                        {/* Scroll Loading */}
                                        {listings.length < total && loading && (
                                            [...Array(3)].map((_, i) => (
                                                <ListingSkeleton key={`skel-${i}`} />
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
                                    <div className="bg-primary-50 w-24 h-24 rounded-full flex items-center justify-center mb-8">
                                        <SparklesIcon className="w-12 h-12 text-primary-600" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 mb-4">Discover Your Perfect Home</h3>
                                    <p className="text-gray-500 mb-10 max-w-lg text-lg leading-relaxed">
                                        Use the search bar or filters above to find properties<br />that match your lifestyle.
                                    </p>

                                    {!hasActiveFilters ? (
                                        <button
                                            onClick={() => setIsFilterModalOpen(true)}
                                            className="px-8 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
                                        >
                                            Browse Filters
                                        </button>
                                    ) : (
                                        <button onClick={clearFilters} className="btn-primary">
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Render Modals */}
                <FilterModal />
                <TransitModal />
            </div>
        </div>
    );
};

export default ListingsPage;
