import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import TransitMapFilter from '../../components/TransitMap/TransitMapFilter';
import StyledSelect from '../../components/Form/StyledSelect';

const MobileSearchPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Initialize state from URL params
    const [activeTab, setActiveTab] = useState('keywords');
    const [filters, setFilters] = useState({
        type: searchParams.get('type') || '',
        listing_type: searchParams.get('listing_type') || '',
        min_price: searchParams.get('min_price') || '',
        max_price: searchParams.get('max_price') || '',
        bedrooms: searchParams.get('bedrooms') || '',
        station_id: searchParams.get('station_id') || '',
        search: searchParams.get('search') || '',
    });

    const [priceLimits] = useState({ min: 0, max: 0 }); // Could fetch from API if needed, simpler for now

    // Options (Duplicated from ListingsPage for now, ideally shared config)
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

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSelectChange = (key, option) => {
        handleFilterChange(key, option?.value || '');
    };

    // Helper for StyledSelect
    const getSelectedOption = (options, value) =>
        options.find(opt => opt.value === value) || null;

    const handleApplyFilters = () => {
        // Construct query params
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        navigate({ pathname: '/listings', search: params.toString() });
    };

    return (
        <div className="h-[100dvh] bg-white flex flex-col pb-safe overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h1 className="text-xl font-bold text-gray-900">Search Properties</h1>
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
            </div>

            {/* Tabs */}
            <div className="px-4 border-b border-gray-100 flex gap-8">
                <button
                    onClick={() => setActiveTab('keywords')}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'keywords'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    KEYWORDS
                </button>
                <button
                    onClick={() => setActiveTab('map')}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'map'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    TRANSIT MAP
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
                {activeTab === 'keywords' ? (
                    <>
                        {/* Search Input */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">Keywords</label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Search by name, location..."
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        {/* Filters Grid */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">Property Type</label>
                            <StyledSelect
                                options={propertyTypeOptions}
                                value={getSelectedOption(propertyTypeOptions, filters.type)}
                                onChange={(opt) => handleSelectChange('type', opt)}
                                placeholder="All Types"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">Action</label>
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
                        </div>

                        {/* Price */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">Price Range</label>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    placeholder="Min Price"
                                    value={filters.min_price}
                                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-primary-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Max Price"
                                    value={filters.max_price}
                                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    /* Transit Map */
                    <div className="h-full flex flex-col">
                        <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4" />
                            Search by Location
                        </label>
                        {filters.station_id && (
                            <div className="mb-2 text-sm text-primary-600 font-medium bg-primary-50 px-3 py-1 rounded-lg inline-block w-fit">
                                Selected: {filters.station_id}
                            </div>
                        )}
                        <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-1 min-h-[400px]">
                            <TransitMapFilter
                                onStationClick={(stationId) => handleFilterChange('station_id', stationId)}
                                selectedStation={filters.station_id}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Action - Static Flex Child */}
            <div className="p-4 border-t border-gray-100 bg-white z-20">
                <button
                    onClick={handleApplyFilters}
                    className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-200 active:scale-[0.98] transition-transform"
                >
                    Show Results
                </button>
            </div>
        </div>
    );
};

export default MobileSearchPage;
