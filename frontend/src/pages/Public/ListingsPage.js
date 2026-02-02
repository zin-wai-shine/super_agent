import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { publicApi } from '../../services/api';
import ListingCard from '../../components/Listings/ListingCard';
import TransitMapFilter from '../../components/TransitMap/TransitMapFilter';
import StyledSelect from '../../components/Form/StyledSelect';


import {
    FunnelIcon,
    Squares2X2Icon,
    ListBulletIcon,
    MapIcon,
    MapPinIcon,
    XMarkIcon,
    BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

const ListingsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const observerTarget = React.useRef(null);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [showMap, setShowMap] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [priceLimits, setPriceLimits] = useState({ min: 0, max: 0 });
    const [agentId, setAgentId] = useState(null);

    useEffect(() => {
        const fetchAgentInfo = async () => {
            try {
                const response = await publicApi.getAgentInfo();
                setPriceLimits({
                    min: parseFloat(response.data.min_price_limit) || 0,
                    max: parseFloat(response.data.max_price_limit) || 0
                });
                setAgentId(response.data.id);
            } catch (error) {
                console.error('Failed to fetch agent info:', error);
            }
        };
        fetchAgentInfo();
    }, []);

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

    const fetchListings = async () => {
        if (page === 1) {
            setInitialLoading(true);
        }
        setLoading(true);
        try {
            const params = {
                page,
                limit: 5,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== '')
                ),
            };

            // Add artificial delay for smoother UX
            await new Promise(resolve => setTimeout(resolve, 1000));

            const response = await publicApi.getListings(params);

            if (page === 1) {
                setListings(response.data.listings || []);
            } else {
                setListings(prev => [...prev, ...(response.data.listings || [])]);
            }

            setTotal(response.data.total || 0);
        } catch (error) {
            console.error('Failed to fetch listings:', error);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [page, filters]);

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
        setShowMap(false);
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
    };

    const hasActiveFilters = Object.values(filters).some((v) => v !== '');

    // Get current selected options
    const getSelectedOption = (options, value) =>
        options.find(opt => opt.value === value) || null;

    const renderTopFilters = () => (
        <div className="hidden lg:flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-16 z-30 mb-8 border-t-0 rounded-t-none">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
                <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search properties..."
                    className="w-full bg-gray-50 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 transition-all"
                />
            </div>

            {/* Property Type */}
            <div className="w-40">
                <StyledSelect
                    options={propertyTypeOptions}
                    value={getSelectedOption(propertyTypeOptions, filters.type)}
                    onChange={(opt) => handleSelectChange('type', opt)}
                    placeholder="Type"
                    isClearable={false}
                    isSearchable={false}
                    styles={{
                        control: (base) => ({ ...base, minHeight: '38px', height: '38px' }),
                    }}
                />
            </div>

            {/* Listing Type */}
            <div className="w-36">
                <StyledSelect
                    options={listingTypeOptions}
                    value={getSelectedOption(listingTypeOptions, filters.listing_type)}
                    onChange={(opt) => handleSelectChange('listing_type', opt)}
                    placeholder="Action"
                    isClearable={false}
                    isSearchable={false}
                    styles={{
                        control: (base) => ({ ...base, minHeight: '38px', height: '38px' }),
                    }}
                />
            </div>

            {/* Bedrooms */}
            <div className="w-36">
                <StyledSelect
                    options={bedroomOptions}
                    value={getSelectedOption(bedroomOptions, filters.bedrooms)}
                    onChange={(opt) => handleSelectChange('bedrooms', opt)}
                    placeholder="Beds"
                    isClearable={false}
                    isSearchable={false}
                    styles={{
                        control: (base) => ({ ...base, minHeight: '38px', height: '38px' }),
                    }}
                />
            </div>

            {/* Price Range */}
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    placeholder={priceLimits.min > 0 ? `Min: ${priceLimits.min}` : "Min Price"}
                    min={priceLimits.min > 0 ? priceLimits.min : 0}
                    value={filters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    className="w-24 bg-gray-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-gray-400">-</span>
                <input
                    type="number"
                    placeholder={priceLimits.max > 0 ? `Max: ${priceLimits.max}` : "Max Price"}
                    max={priceLimits.max > 0 ? priceLimits.max : undefined}
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    className="w-24 bg-gray-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                />
            </div>

            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="text-xs text-red-500 hover:text-red-700 font-bold px-2"
                >
                    Reset
                </button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header / Mobile Breadcrumb or Title */}
            <div className="bg-white border-b border-gray-200 py-4 lg:hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-xl font-bold text-gray-900">Property Listings</h1>
                    <p className="text-xs text-gray-500">{total} properties found</p>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-0">
                {/* Floating Mobile Filter Toggle */}
                <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <button
                        onClick={() => setShowMobileFilters(true)}
                        className="bg-primary-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold animate-bounce-subtle"
                    >
                        <FunnelIcon className="w-5 h-5" />
                        Filters {hasActiveFilters && <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>}
                    </button>
                </div>

                {/* Mobile Filters Overlay */}
                {showMobileFilters && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
                        <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-2xl animate-slide-right flex flex-col">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                                <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <XMarkIcon className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">Search</label>
                                    <input
                                        type="text"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        placeholder="Search properties..."
                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">Property Type</label>
                                    <StyledSelect
                                        options={propertyTypeOptions}
                                        value={getSelectedOption(propertyTypeOptions, filters.type)}
                                        onChange={(opt) => handleSelectChange('type', opt)}
                                        placeholder="All Types"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">Listing Type</label>
                                    <StyledSelect
                                        options={listingTypeOptions}
                                        value={getSelectedOption(listingTypeOptions, filters.listing_type)}
                                        onChange={(opt) => handleSelectChange('listing_type', opt)}
                                        placeholder="Sale & Rent"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">Bedrooms</label>
                                    <StyledSelect
                                        options={bedroomOptions}
                                        value={getSelectedOption(bedroomOptions, filters.bedrooms)}
                                        onChange={(opt) => handleSelectChange('bedrooms', opt)}
                                        placeholder="Any Beds"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">Price Range</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            placeholder={priceLimits.min > 0 ? `Min: ${priceLimits.min}` : "Min"}
                                            min={priceLimits.min > 0 ? priceLimits.min : 0}
                                            value={filters.min_price}
                                            onChange={(e) => handleFilterChange('min_price', e.target.value)}
                                            className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder={priceLimits.max > 0 ? `Max: ${priceLimits.max}` : "Max"}
                                            max={priceLimits.max > 0 ? priceLimits.max : undefined}
                                            value={filters.max_price}
                                            onChange={(e) => handleFilterChange('max_price', e.target.value)}
                                            className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100">
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-200"
                                >
                                    Show Results ({total})
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Top Filters (Desktop) */}
                {renderTopFilters()}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Map (Span 4) */}
                    <div className="lg:col-span-4 hidden lg:block order-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-44">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapIcon className="w-4 h-4 text-primary-600" />
                                Explore by Transit
                            </h3>
                            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 h-[600px]">
                                <TransitMapFilter
                                    onStationClick={handleStationSelect}
                                    selectedStation={filters.station_id}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Listings & Content (Span 8) */}
                    <div className="lg:col-span-8 flex flex-col min-w-0 order-2">




                        {/* Control Bar */}
                        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mt-8">
                            <div className="hidden sm:block">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Properties for you
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Showing {listings.length} of {total} listings
                                </p>
                            </div>

                            <div className="flex items-center gap-4 ml-auto">
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded transition-all duration-200 ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <Squares2X2Icon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded transition-all duration-200 ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <ListBulletIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Active station filter */}
                        {filters.station_id && (
                            <div className="mb-6 flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-xl border border-primary-100 w-fit animate-fade-in">
                                <MapPinIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">Station: {filters.station_id}</span>
                                <button
                                    onClick={() => handleFilterChange('station_id', '')}
                                    className="p-1 hover:bg-primary-100 rounded-full transition-colors"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Listings Grid */}
                        {initialLoading ? (
                            <div className={`grid gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                                : 'grid-cols-1'
                                }`}>
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100 shadow-sm" />
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

                                    {/* Loading Skeletons for Scroll */}
                                    {loading && !initialLoading && (
                                        [...Array(5)].map((_, i) => (
                                            <div key={`skeleton-${i}`} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100 shadow-sm" />
                                        ))
                                    )}
                                </div>

                                {/* Infinite Scroll Target */}
                                <div ref={observerTarget} className="h-10 mt-8 flex items-center justify-center">
                                    {loading && !initialLoading && (
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                                <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No properties found</h3>
                                <p className="text-gray-500 mb-6">Try adjusting your filters or search criteria</p>
                                <button onClick={clearFilters} className="btn-primary">
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ListingsPage;
