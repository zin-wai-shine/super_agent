import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import StyledSelect from '../Form/StyledSelect';
import Input from '../ui/Input';
import { publicApi } from '../../services/api';

const HeroFilter = () => {
    const navigate = useNavigate();
    const [listingType, setListingType] = useState('sale');
    const [searchTerm, setSearchTerm] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [stationId, setStationId] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [stations, setStations] = useState([]);

    // Fetch stations on mount
    useEffect(() => {
        const fetchStations = async () => {
            try {
                const response = await publicApi.getStations();
                setStations(response.data.stations || []);
            } catch (error) {
                console.error('Failed to fetch stations:', error);
            }
        };
        fetchStations();
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (propertyType) params.set('type', propertyType);
        if (stationId) params.set('station_id', stationId);
        if (bedrooms) params.set('bedrooms', bedrooms);
        if (minPrice) params.set('min_price', minPrice);
        if (maxPrice) params.set('max_price', maxPrice);
        params.set('listing_type', listingType);

        navigate(`/listings?${params.toString()}`);
    };

    // Site Standard Height Design (Reduced to 40px for a more compact look)
    const SITE_HEIGHT = '40px';

    // Custom styles for StyledSelect to match site height and font size
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            fontSize: '14px',
            minHeight: SITE_HEIGHT,
            height: SITE_HEIGHT,
            backgroundColor: '#F6F7F9',
            borderColor: state.isFocused ? 'var(--primary-color)' : '#DAE0E6',
            borderRadius: '3px',
            '&:hover': {
                borderColor: state.isFocused ? 'var(--primary-color)' : '#DAE0E6',
                backgroundColor: '#f3f4f6',
            }
        }),
        valueContainer: (base) => ({
            ...base,
            padding: '0 12px',
        }),
        placeholder: (base) => ({ ...base, fontSize: '14px', color: '#9ca3af' }),
        singleValue: (base) => ({ ...base, fontSize: '14px' }),
        option: (base) => ({ ...base, fontSize: '14px' }),
        menu: (base) => ({ ...base, zIndex: 100 }),
    };

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
        { value: '', label: 'All' },
        { value: '1', label: '1+' },
        { value: '2', label: '2+' },
        { value: '3', label: '3+' },
        { value: '4', label: '4+' },
        { value: '5', label: '5+' },
    ];

    const stationOptions = useMemo(() => {
        const base = [{ value: '', label: 'All Stations' }];
        const flat = stations.map(station => ({
            value: String(station.id),
            label: station.name_en || station.station_name,
            line_name: station.line_name,
            line_color: station.line_color
        }));
        return [...base, ...flat];
    }, [stations]);

    return (
        <div className="w-full max-w-6xl mx-auto animate-fade-up px-4" style={{ animationDelay: '0.4s' }}>
            <div className="bg-white rounded-[3px] p-6 sm:p-7 border border-gray-100 shadow-sm">

                {/* SEARCH LOCATION - Centered Label and Full Width Input */}
                <div className="mb-3 flex flex-col items-start w-full">
                    <label className="block text-[14px] font-bold text-gray-500 mb-2">
                        Search Location
                    </label>
                    <div className="w-full">
                        <Input
                            placeholder="Search location, neighborhood, project..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                            inputClassName="!bg-[#F6F7F9] !border-[#DAE0E6] focus:!border-black focus:!border-2 focus:!ring-0 transition-colors"
                            style={{
                                height: '80px',
                                fontSize: '14px',
                                paddingLeft: '16px'
                            }}
                        />
                    </div>
                </div>

                {/* Filters Row - Custom Responsive Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.5fr_2fr_1.5fr_1fr_1.5fr_1.5fr_auto] gap-4 items-end mb-2">
                    {/* Property Type */}
                    <div className="space-y-1.5">
                        <label className="block text-[14px] font-bold text-gray-500 pl-1">Property Type</label>
                        <StyledSelect
                            options={propertyTypeOptions}
                            value={propertyTypeOptions.find(o => o.value === propertyType)}
                            onChange={(val) => setPropertyType(val)}
                            styles={selectStyles}
                            placeholder="All Types"
                        />
                    </div>

                    {/* Transit Station */}
                    <div className="space-y-1.5">
                        <label className="block text-[14px] font-bold text-gray-500 pl-1">Transit Station</label>
                        <StyledSelect
                            options={stationOptions}
                            value={stationOptions.find(o => o.value === stationId) || null}
                            onChange={(val) => setStationId(val)}
                            styles={selectStyles}
                            placeholder="All Stations"
                        />
                    </div>

                    {/* Purpose */}
                    <div className="space-y-1.5">
                        <label className="block text-[14px] font-bold text-gray-500 pl-1">Listing Type</label>
                        <StyledSelect
                            options={listingTypeOptions}
                            value={listingTypeOptions.find(o => o.value === listingType)}
                            onChange={(val) => setListingType(val)}
                            styles={selectStyles}
                            placeholder="Select..."
                            isSearchable={false}
                        />
                    </div>

                    {/* Beds */}
                    <div className="space-y-1.5">
                        <label className="block text-[14px] font-bold text-gray-500 pl-1">Bedrooms</label>
                        <StyledSelect
                            options={bedroomOptions}
                            value={bedroomOptions.find(o => o.value === bedrooms)}
                            onChange={(val) => setBedrooms(val)}
                            styles={selectStyles}
                            placeholder="All"
                            isSearchable={false}
                        />
                    </div>

                    {/* Min Price */}
                    <div className="space-y-1.5">
                        <label className="block text-[14px] font-bold text-gray-500 pl-1">Min Price</label>
                        <Input
                            placeholder="0"
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            inputClassName="!bg-[#F6F7F9] !border-[#DAE0E6] focus:!border-black focus:!border-2 focus:!ring-0 transition-colors"
                            style={{
                                height: SITE_HEIGHT,
                                fontSize: '14px',
                            }}
                        />
                    </div>

                    {/* Max Price */}
                    <div className="space-y-1.5">
                        <label className="block text-[14px] font-bold text-gray-500 pl-1">Max Price</label>
                        <Input
                            placeholder="No limit"
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            inputClassName="!bg-[#F6F7F9] !border-[#DAE0E6] focus:!border-black focus:!border-2 focus:!ring-0 transition-colors"
                            style={{
                                height: SITE_HEIGHT,
                                fontSize: '14px',
                            }}
                        />
                    </div>

                    {/* Search Button (Icon Only) */}
                    <div className="flex flex-col items-center justify-end h-full">
                        <button
                            onClick={handleSearch}
                            className="w-[40px] bg-[#121826] hover:bg-black text-white flex items-center justify-center rounded-full transition-all duration-300 active:scale-95 shadow-sm group h-[40px]"
                            title="Search Properties"
                        >
                            <MagnifyingGlassIcon className="w-5 h-5 stroke-[2.5px] group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroFilter;
