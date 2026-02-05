import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { agentApi, publicApi, uploadApi } from '../../services/api';
import toast from 'react-hot-toast';
import { PhotoIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import StyledSelect from '../../components/Form/StyledSelect';
import { getMediaUrl } from '../../utils/media';

const EditListing = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stations, setStations] = useState([]);
    const [media, setMedia] = useState([]);
    const [uploading, setUploading] = useState(false);

    const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm();

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

    // Custom option renderer for property types
    const formatOptionLabel = ({ label, description }) => (
        <div className="flex items-center">
            <span className="font-medium">{label}</span>
            {description && (
                <span className="text-gray-400 text-xs ml-2">— {description}</span>
            )}
        </div>
    );

    // Group stations by line
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

    const fetchData = useCallback(async () => {
        try {
            const [listingRes, stationsRes] = await Promise.all([
                agentApi.getListing(id),
                publicApi.getStations(),
            ]);
            const listing = listingRes.data;
            const stationData = Array.isArray(stationsRes.data)
                ? stationsRes.data
                : (stationsRes.data.stations || []);

            setStations(stationData);

            // Reset form with listing data
            reset({
                title: listing.title,
                description: listing.description,
                price: listing.price,
                bedrooms: listing.bedrooms,
                bathrooms: listing.bathrooms,
                area: listing.area,
                address: listing.address,
                district: listing.district,
                province: listing.province,
            });

            // Set select values
            const propertyType = propertyTypeOptions.find(o => o.value === listing.property_type);
            const listingType = listingTypeOptions.find(o => o.value === listing.listing_type);

            setValue('property_type', propertyType || listing.property_type || null);
            setValue('listing_type', listingType || listing.listing_type || null);

            // Find station
            if (listing.station_id) {
                // Flatten station options to find the station
                const allStationOptions = stationOptions.reduce((acc, group) => [...acc, ...group.options], []);
                const stationOption = allStationOptions.find(opt => opt.value === listing.station_id);

                if (stationOption) {
                    setValue('station_id', stationOption);
                } else {
                    // Fallback to manual object if not found in options yet
                    setValue('station_id', {
                        value: listing.station_id,
                        label: listing.station_name || listing.station_id
                    });
                }
            }

            setMedia(listing.media || []);
        } catch (error) {
            toast.error('Failed to load listing');
            navigate('/agent/listings');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, reset, setValue]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            await agentApi.updateListing(id, {
                title: data.title,
                description: data.description,
                property_type: data.property_type?.value || data.property_type,
                listing_type: data.listing_type?.value || data.listing_type,
                station_id: data.station_id?.value || data.station_id || null,
                address: data.address,
                district: data.district,
                province: data.province,
                price: parseFloat(data.price),
                bedrooms: parseInt(data.bedrooms) || 0,
                bathrooms: parseInt(data.bathrooms) || 0,
                area: parseFloat(data.area) || 0,
            });
            toast.success('Listing updated!');
        } catch (error) {
            toast.error('Failed to update listing');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploading(true);
        try {
            for (const file of files) {
                await uploadApi.uploadImage(id, file);
            }
            toast.success('Images uploaded!');
            fetchData();
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteMedia = async (mediaId) => {
        try {
            await uploadApi.deleteMedia(mediaId);
            setMedia(media.filter((m) => m.id !== mediaId));
            toast.success('Image deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <button
                onClick={() => navigate('/agent/listings')}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
            >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to listings
            </button>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Edit Listing</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Media Upload */}
                <div className="bg-white dark:bg-dashboard-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">📸 Photos</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {media.filter((m) => m.type === 'image').map((item) => (
                            <div key={item.id} className="relative aspect-video rounded-xl overflow-hidden group shadow-md border border-gray-100 dark:border-gray-800">
                                <img src={getMediaUrl(item.url)} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <button
                                    type="button"
                                    onClick={() => handleDeleteMedia(item.id)}
                                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-lg shadow-lg opacity-100 transition-all hover:bg-red-600"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-4 left-4 text-white text-[12px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    Click to delete
                                </div>
                            </div>
                        ))}

                        <label className="aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group bg-gray-50/50 dark:bg-gray-800/10">
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm group-hover:scale-110 transition-transform mb-3">
                                <PhotoIcon className="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors px-4 text-center">
                                {uploading ? 'Uploading your photos...' : 'Add High-Quality Photos'}
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                disabled={uploading}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Basic Info */}
                <div className="bg-white dark:bg-dashboard-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">📋 Basic Information</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="input-label">Title *</label>
                            <input
                                type="text"
                                className={`input-field ${errors.title ? 'border-red-300' : ''}`}
                                placeholder="e.g., Modern 2-BR Condo near BTS Asok"
                                {...register('title', { required: 'Required' })}
                            />
                            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="input-label">Property Type</label>
                                <Controller
                                    name="property_type"
                                    control={control}
                                    render={({ field }) => (
                                        <StyledSelect
                                            {...field}
                                            options={propertyTypeOptions}
                                            placeholder="Select property type..."
                                            formatOptionLabel={formatOptionLabel}
                                            isClearable
                                        />
                                    )}
                                />
                            </div>
                            <div>
                                <label className="input-label">Listing Type</label>
                                <Controller
                                    name="listing_type"
                                    control={control}
                                    render={({ field }) => (
                                        <StyledSelect
                                            {...field}
                                            options={listingTypeOptions}
                                            placeholder="Select listing type..."
                                            formatOptionLabel={formatOptionLabel}
                                            isClearable
                                        />
                                    )}
                                />
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

                {/* Price & Features */}
                <div className="bg-white dark:bg-dashboard-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">💰 Price & Features</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <label className="input-label">Price (THB)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">฿</span>
                                <input
                                    type="number"
                                    className="input-field pl-8"
                                    placeholder="0"
                                    {...register('price')}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Bedrooms</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2">🛏️</span>
                                <input
                                    type="number"
                                    className="input-field pl-12"
                                    placeholder="0"
                                    {...register('bedrooms')}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Bathrooms</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2">🚿</span>
                                <input
                                    type="number"
                                    className="input-field pl-12"
                                    placeholder="0"
                                    {...register('bathrooms')}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Area (sqm)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2">📐</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="input-field pl-12"
                                    placeholder="0"
                                    {...register('area')}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white dark:bg-dashboard-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">📍 Location</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="input-label">Transit Station</label>
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
                                This helps buyers find your property on the transit map.
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

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/agent/listings')}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button type="submit" disabled={saving} className="btn-primary">
                        {saving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditListing;
