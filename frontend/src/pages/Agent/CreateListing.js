import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { agentApi, publicApi } from '../../services/api';
import toast from 'react-hot-toast';
import StyledSelect from '../../components/Form/StyledSelect';

const CreateListing = () => {
    const [loading, setLoading] = useState(false);
    const [stations, setStations] = useState([]);
    const navigate = useNavigate();

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const response = await publicApi.getStations();
                const stationData = Array.isArray(response.data)
                    ? response.data
                    : (response.data.stations || []);
                setStations(stationData);
            } catch (error) {
                console.error('Failed to fetch stations:', error);
            }
        };
        fetchStations();
    }, []);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await agentApi.createListing({
                title: data.title,
                description: data.description,
                property_type: data.property_type?.value,
                listing_type: data.listing_type?.value,
                station_id: data.station_id?.value || null,
                address: data.address,
                district: data.district,
                province: data.province,
                price: parseFloat(data.price),
                bedrooms: parseInt(data.bedrooms) || 0,
                bathrooms: parseInt(data.bathrooms) || 0,
                area: parseFloat(data.area) || 0,
            });
            toast.success('Listing created successfully!');
            navigate(`/agent/listings/${response.data.id}/edit`);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    // Dropdown options
    const propertyTypeOptions = [
        { value: 'condo', label: '🏢 Condo', description: 'Condominium unit' },
        { value: 'house', label: '🏠 House', description: 'Single-family home' },
        { value: 'townhouse', label: '🏘️ Townhouse', description: 'Row house' },
        { value: 'apartment', label: '🏬 Apartment', description: 'Apartment unit' },
        { value: 'land', label: '🌳 Land', description: 'Vacant land' },
    ];

    const listingTypeOptions = [
        { value: 'sale', label: '💰 For Sale', description: 'Property for sale' },
        { value: 'rent', label: '🔑 For Rent', description: 'Property for rent' },
    ];

    // Group stations by line for better organization
    const stationOptions = useMemo(() => {
        const lineGroups = {};
        stations.forEach((station) => {
            const lineName = station.line_name || station.LineName || 'Other';
            if (!lineGroups[lineName]) {
                lineGroups[lineName] = [];
            }
            lineGroups[lineName].push({
                value: station.id || station.ID,
                label: `${station.id || station.ID} - ${station.name_en || station.NameEN}`,
            });
        });

        return Object.entries(lineGroups).map(([line, options]) => ({
            label: line,
            options,
        }));
    }, [stations]);

    // Custom option renderer for property types
    const formatOptionLabel = ({ label, description }) => (
        <div className="flex items-center">
            <span className="font-medium">{label}</span>
            {description && (
                <span className="text-gray-400 text-xs ml-2">— {description}</span>
            )}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Create New Listing</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Info */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="input-label">Title *</label>
                            <input
                                type="text"
                                className={`input-field ${errors.title ? 'border-red-300' : ''}`}
                                placeholder="e.g., Modern 2-BR Condo near BTS Asok"
                                {...register('title', { required: 'Title is required' })}
                            />
                            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="input-label">Property Type *</label>
                                <Controller
                                    name="property_type"
                                    control={control}
                                    rules={{ required: 'Property type is required' }}
                                    render={({ field }) => (
                                        <StyledSelect
                                            {...field}
                                            options={propertyTypeOptions}
                                            placeholder="Select property type..."
                                            formatOptionLabel={formatOptionLabel}
                                            error={!!errors.property_type}
                                            isClearable
                                        />
                                    )}
                                />
                                {errors.property_type && (
                                    <p className="text-sm text-red-500 mt-1">{errors.property_type.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="input-label">Listing Type *</label>
                                <Controller
                                    name="listing_type"
                                    control={control}
                                    rules={{ required: 'Listing type is required' }}
                                    render={({ field }) => (
                                        <StyledSelect
                                            {...field}
                                            options={listingTypeOptions}
                                            placeholder="Select listing type..."
                                            formatOptionLabel={formatOptionLabel}
                                            error={!!errors.listing_type}
                                            isClearable
                                        />
                                    )}
                                />
                                {errors.listing_type && (
                                    <p className="text-sm text-red-500 mt-1">{errors.listing_type.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Description</label>
                            <textarea
                                rows={4}
                                className="input-field"
                                placeholder="Describe the property features, amenities, and unique selling points..."
                                {...register('description')}
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Pricing</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="input-label">Price (THB) *</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">฿</span>
                                <input
                                    type="number"
                                    className={`input-field pl-8 ${errors.price ? 'border-red-300' : ''}`}
                                    placeholder="0"
                                    {...register('price', { required: 'Price is required', min: 0 })}
                                />
                            </div>
                            {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>}
                        </div>
                        <div className="flex items-center">
                            <div className="p-4 bg-blue-50 rounded-xl">
                                <p className="text-sm text-blue-700">
                                    💡 Enter monthly rent for rentals, or total price for sales.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Features</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <label className="input-label">Bedrooms</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🛏️</span>
                                <input
                                    type="number"
                                    className="input-field pl-12"
                                    placeholder="0"
                                    min="0"
                                    {...register('bedrooms', { min: 0 })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Bathrooms</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🚿</span>
                                <input
                                    type="number"
                                    className="input-field pl-12"
                                    placeholder="0"
                                    min="0"
                                    {...register('bathrooms', { min: 0 })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Area (sqm)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">📐</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="input-field pl-12"
                                    placeholder="0"
                                    min="0"
                                    {...register('area', { min: 0 })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Location</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="input-label">Nearby Transit Station</label>
                            <Controller
                                name="station_id"
                                control={control}
                                render={({ field }) => (
                                    <StyledSelect
                                        {...field}
                                        options={stationOptions}
                                        placeholder="🚇 Search and select a transit station..."
                                        isSearchable
                                        isClearable
                                        noOptionsMessage={() => 'No stations found'}
                                    />
                                )}
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                📍 This helps buyers find your property on the interactive transit map.
                            </p>
                        </div>

                        <div>
                            <label className="input-label">Address</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Full street address"
                                {...register('address')}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="input-label">District</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g., Watthana"
                                    {...register('district')}
                                />
                            </div>
                            <div>
                                <label className="input-label">Province</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g., Bangkok"
                                    {...register('province')}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/agent/listings')}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </>
                        ) : (
                            'Create Listing'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateListing;
