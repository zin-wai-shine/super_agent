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
    XMarkIcon,
    BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

const ListingsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [showMap, setShowMap] = useState(searchParams.get('view') === 'map');

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
        setLoading(true);
        try {
            const params = {
                page,
                limit: 12,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== '')
                ),
            };
            const response = await publicApi.getListings(params);
            setListings(response.data.listings || []);
            setTotal(response.data.total || 0);
        } catch (error) {
            console.error('Failed to fetch listings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [page, filters]);

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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Property Listings</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {total} {total === 1 ? 'property' : 'properties'} found
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Map toggle */}
                            <button
                                onClick={() => setShowMap(!showMap)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${showMap
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <MapIcon className="w-5 h-5" />
                                <span className="hidden sm:inline">Map</span>
                            </button>

                            {/* View mode */}
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                                >
                                    <Squares2X2Icon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                                >
                                    <ListBulletIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Filter toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${showFilters || hasActiveFilters
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <FunnelIcon className="w-5 h-5" />
                                <span>Filters</span>
                                {hasActiveFilters && (
                                    <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {Object.values(filters).filter((v) => v !== '').length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl animate-slide-down">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {/* Property Type */}
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                                        Property Type
                                    </label>
                                    <StyledSelect
                                        options={propertyTypeOptions}
                                        value={getSelectedOption(propertyTypeOptions, filters.type)}
                                        onChange={(opt) => handleSelectChange('type', opt)}
                                        placeholder="All Types"
                                        isClearable={false}
                                        isSearchable={false}
                                    />
                                </div>

                                {/* Listing Type */}
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                                        For
                                    </label>
                                    <StyledSelect
                                        options={listingTypeOptions}
                                        value={getSelectedOption(listingTypeOptions, filters.listing_type)}
                                        onChange={(opt) => handleSelectChange('listing_type', opt)}
                                        placeholder="Sale & Rent"
                                        isClearable={false}
                                        isSearchable={false}
                                    />
                                </div>

                                {/* Bedrooms */}
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                                        Bedrooms
                                    </label>
                                    <StyledSelect
                                        options={bedroomOptions}
                                        value={getSelectedOption(bedroomOptions, filters.bedrooms)}
                                        onChange={(opt) => handleSelectChange('bedrooms', opt)}
                                        placeholder="Any Beds"
                                        isClearable={false}
                                        isSearchable={false}
                                    />
                                </div>

                                {/* Min Price */}
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                                        Min Price
                                    </label>
                                    <input
                                        type="number"
                                        value={filters.min_price}
                                        onChange={(e) => handleFilterChange('min_price', e.target.value)}
                                        placeholder="฿ 0"
                                        className="input-field py-2 text-sm"
                                    />
                                </div>

                                {/* Max Price */}
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                                        Max Price
                                    </label>
                                    <input
                                        type="number"
                                        value={filters.max_price}
                                        onChange={(e) => handleFilterChange('max_price', e.target.value)}
                                        placeholder="฿ Any"
                                        className="input-field py-2 text-sm"
                                    />
                                </div>

                                {/* Clear */}
                                <div className="flex items-end">
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-gray-500 hover:text-red-600 flex items-center space-x-1 transition-colors h-[44px] px-3 rounded-lg hover:bg-red-50"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                        <span>Clear all</span>
                                    </button>
                                </div>
                            </div>

                            {/* Active station filter */}
                            {filters.station_id && (
                                <div className="mt-4 flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Filtering by station:</span>
                                    <span className="badge badge-info">{filters.station_id}</span>
                                    <button
                                        onClick={() => handleFilterChange('station_id', '')}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Map View */}
            {showMap && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <TransitMapFilter
                            onStationClick={handleStationSelect}
                            selectedStation={filters.station_id}
                        />
                    </div>
                </div>
            )}

            {/* Listings Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className={`grid gap-6 ${viewMode === 'grid'
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-1'
                        }`}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
                        ))}
                    </div>
                ) : listings.length > 0 ? (
                    <>
                        <div className={`grid gap-6 ${viewMode === 'grid'
                            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                            : 'grid-cols-1'
                            }`}>
                            {listings.map((listing) => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>

                        {/* Load more */}
                        {listings.length < total && (
                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    className="btn-secondary"
                                >
                                    Load More
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16">
                        <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No properties found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
                        <button onClick={clearFilters} className="btn-primary">
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListingsPage;
