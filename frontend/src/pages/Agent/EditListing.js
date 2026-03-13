import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { agentApi, publicApi, uploadApi, developerApi, PHOTO_ROOM_TYPES } from '../../services/api';
import toast from 'react-hot-toast';
import { PhotoIcon, TrashIcon, ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon, SparklesIcon } from '@heroicons/react/24/outline';
import {
    MdBed, MdBathtub, MdSquareFoot, MdLayers, MdCalendarToday,
    MdKitchen, MdTv, MdAir, MdMicrowave, MdLocalLaundryService, MdShower, MdRestaurant,
    MdLocalParking, MdPool, MdFitnessCenter, MdSecurity, MdHotTub, MdPark, MdChildCare, MdComputer,
    MdElevator, MdGroups, MdStore, MdDirectionsBus, MdSpa, MdGarage, MdMeetingRoom
} from 'react-icons/md';
import StyledSelect from '../../components/Form/StyledSelect';
import LocationPicker from '../../components/Listings/LocationPicker';
import { getMediaUrl } from '../../utils/media';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format, addMonths, subMonths, getYear, getMonth, setYear, setMonth } from 'date-fns';
import { enUS } from 'date-fns/locale';

const availabilityOptions = [
    { value: 'ready', label: '✅ Ready to Move In' },
    { value: 'date', label: '📅 Rented / Unavailable until...' }
];

const EditListing = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stations, setStations] = useState([]);
    const [media, setMedia] = useState([]);
    const [projects, setProjects] = useState([]);

    const [uploading, setUploading] = useState(false);
    const [walkingTime, setWalkingTime] = useState('');

    // Availability State
    const [availabilityType, setAvailabilityType] = useState(null);
    const [availabilityDate, setAvailabilityDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [shownDate, setShownDate] = useState(new Date());
    const datePickerRef = useRef(null);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const WALKING_SPEED_MPM = 80; // Meters per minute

    // Options


    const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
    const fieldValues = watch();

    // Close datepicker when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setShowDatePicker(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
    const formatOptionLabel = ({ label, description }, { context }) => (
        <div className="flex items-center">
            <span className="font-medium">{label}</span>
            {context === 'menu' && description && (
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
                lineGroups[lineName] = {
                    label: lineName,
                    options: []
                };
            }
            lineGroups[lineName].options.push({
                value: station.id || station.ID,
                label: `${station.id || station.ID} - ${station.name_en || station.NameEN}`,
                line_name: lineName,
                line_color: station.line_color || station.LineColor
            });
        });

        return Object.values(lineGroups);
    }, [stations]);

    const fetchData = useCallback(async () => {
        try {
            const [listingRes, stationsRes, projectsRes] = await Promise.all([
                agentApi.getListing(id),
                publicApi.getStations(),
                developerApi.getProjects(),
            ]);
            const listing = listingRes.data;
            const stationData = Array.isArray(stationsRes.data)
                ? stationsRes.data
                : (stationsRes.data.stations || []);
            const projectsData = projectsRes.data?.projects || [];

            setStations(stationData);
            setProjects(projectsData);

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
                floor: listing.floor,
                distance_to_station: listing.distance_to_station,
                availability_status: listing.availability_status,
                year_built: listing.year_built,
                latitude: listing.latitude,
                longitude: listing.longitude,
                map_url: listing.map_url,
            });

            // Parse features
            if (listing.features) {
                try {
                    const featureList = JSON.parse(listing.features);
                    const unitAmenities = ['refrigerator', 'bathtub', 'tv', 'ac', 'microwave', 'washing_machine', 'water_heater', 'kitchen'];
                    const buildingFeatures = ['parking', 'pool', 'gym', 'security', 'sauna', 'garden', 'playground', 'coworking'];
                    const projectFacilities = ['communal_elevator', 'communal_reception', 'communal_restaurant', 'communal_shop', 'communal_shuttle', 'communal_spa', 'communal_coworking', 'communal_security_24', 'communal_parking', 'communal_covered_parking', 'communal_function_room'];

                    setValue('unit_amenities', featureList.filter(f => unitAmenities.includes(f)));
                    setValue('building_features', featureList.filter(f => buildingFeatures.includes(f)));
                    setValue('project_facilities', featureList.filter(f => projectFacilities.includes(f)));
                } catch (e) {
                    console.error('Failed to parse features:', e);
                }
            }

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

            // Set project
            if (listing.project_id) {
                const proj = projectsData.find(p => p.id === listing.project_id);
                if (proj) {
                    setValue('project_id', {
                        value: proj.id,
                        label: `${proj.name} — ${proj.developer?.name || 'Unknown'}`,
                    });
                }
            }

            if (listing.distance_to_station) {
                setWalkingTime(Math.round(listing.distance_to_station / WALKING_SPEED_MPM));
            }

            // Availability Parsing
            if (listing.availability_status === 'Ready to Move In') {
                setAvailabilityType('ready');
            } else if (listing.availability_status && listing.availability_status.includes('Unavailable until')) {
                setAvailabilityType('date');
                const dateStr = listing.availability_status.replace('Unavailable until ', '');
                const date = new Date(dateStr);
                if (!isNaN(date)) {
                    setAvailabilityDate(date);
                    setShownDate(date);
                }
            }

            setMedia(listing.media || []);
        } catch (error) {
            toast.error('Failed to load listing');
            navigate('/dashboard/listings');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, reset, setValue]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onError = (errors) => {
        console.error('Form errors:', errors);
        toast.error('Please check the required fields');
    };

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
                latitude: parseFloat(data.latitude) || 0,
                longitude: parseFloat(data.longitude) || 0,
                map_url: data.map_url || '',
                floor: data.floor || '',
                distance_to_station: parseInt(data.distance_to_station) || 0,
                availability_status: data.availability_status || '',
                project_id: data.project_id?.value || data.project_id || null,
                year_built: data.year_built ? parseInt(data.year_built) : null,
                features: JSON.stringify([
                    ...(data.unit_amenities || []),
                    ...(data.building_features || []),
                    ...(data.project_facilities || [])
                ]),
            });
            toast.success('Listing updated successfully!');
            navigate('/dashboard/listings');
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (roomType, e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setUploading(true);
        try {
            for (const file of files) {
                await uploadApi.uploadImage(id, file, { roomType });
            }
            toast.success('Images uploaded successfully!');
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
            const index = imageList.findIndex((m) => m.id === mediaId);
            setMedia((prev) => prev.filter((m) => m.id !== mediaId));

            if (index >= 0) {
                if (lightboxIndex === index) setLightboxIndex(null);
                else if (lightboxIndex > index) setLightboxIndex(lightboxIndex - 1);
            }

            toast.success('Image deleted successfully');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const imageList = useMemo(() => {
        const byType = {};
        (media || []).filter((m) => m.type === 'image').forEach((m) => {
            const rt = (m.room_type && m.room_type.trim()) ? m.room_type.trim() : 'Additional Photos';
            if (!byType[rt]) byType[rt] = [];
            byType[rt].push(m);
        });
        return PHOTO_ROOM_TYPES.flatMap((t) => byType[t] || []);
    }, [media]);

    const nextImage = (e) => {
        e.stopPropagation();
        setLightboxIndex((prev) => (prev + 1) % imageList.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setLightboxIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
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
            <Link
                to="/dashboard/listings"
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
            >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to listings
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Edit Listing</h1>

            <style>
                {`
                    .ql-toolbar {
                        border-top-left-radius: 0.5rem;
                        border-top-right-radius: 0.5rem;
                        border: 1px solid #d1d5db !important;
                        border-bottom: none !important;
                    }
                    .ql-container {
                        border-bottom-left-radius: 0.5rem;
                        border-bottom-right-radius: 0.5rem;
                        border: 1px solid #d1d5db !important;
                        border-top: 1px solid #e5e7eb !important;
                        min-height: 300px;
                        font-family: inherit;
                        font-size: 0.875rem;
                    }
                    .dark .ql-toolbar {
                        background-color: #1f2937;
                        border-color: #374151 !important;
                    }
                    .dark .ql-container {
                        background-color: #111827;
                        border-color: #374151 !important;
                        color: white;
                    }
                    .dark .ql-stroke {
                        stroke: #9ca3af !important;
                    }
                    .dark .ql-fill {
                        fill: #9ca3af !important;
                    }
                    .dark .ql-picker {
                        color: #9ca3af !important;
                    }
                `}
            </style>

            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
                {/* Media Upload — one section per room type, upload under each title */}
                <div className="bg-white dark:bg-dashboard-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">📸 Photos</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Add photos under each section. Images uploaded in a section use that section&apos;s type.
                    </p>

                    <div className="space-y-8">
                        {PHOTO_ROOM_TYPES.map((roomType) => {
                            const items = (media || []).filter(
                                (m) => m.type === 'image' && ((m.room_type && m.room_type.trim()) ? m.room_type.trim() : 'Additional Photos') === roomType
                            );
                            let flatIndexOffset = 0;
                            PHOTO_ROOM_TYPES.forEach((t) => {
                                if (t === roomType) return;
                                flatIndexOffset += (media || []).filter(
                                    (m) => m.type === 'image' && ((m.room_type && m.room_type.trim()) ? m.room_type.trim() : 'Additional Photos') === t
                                ).length;
                            });
                            return (
                                <div key={roomType} className="space-y-3">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{roomType}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {items.map((item, i) => {
                                            const flatIndex = flatIndexOffset >= 0 ? flatIndexOffset + i : 0;
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="relative aspect-video rounded-xl overflow-hidden group shadow-md border border-gray-100 dark:border-gray-800 cursor-pointer"
                                                    onClick={() => setLightboxIndex(flatIndex)}
                                                >
                                                    <img src={getMediaUrl(item.url)} alt="" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteMedia(item.id);
                                                        }}
                                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg shadow-lg opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 z-10"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        <label className="aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group bg-gray-50/50 dark:bg-gray-800/10">
                                            <PhotoIcon className="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors mb-2" />
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 px-2 text-center">
                                                {uploading ? 'Uploading...' : 'Add photos'}
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => handleImageUpload(roomType, e)}
                                                disabled={uploading}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            );
                        })}
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

                        {/* Project Selector */}
                        <div>
                            <label className="input-label">
                                Project {(fieldValues.listing_type?.value || fieldValues.listing_type) === 'sale' ? '*' : '(Optional)'}
                            </label>
                            <Controller
                                name="project_id"
                                control={control}
                                rules={{
                                    validate: (value) => {
                                        const lt = fieldValues.listing_type?.value || fieldValues.listing_type;
                                        if (lt === 'sale' && !value) return 'Project is required for sale listings';
                                        return true;
                                    }
                                }}
                                render={({ field }) => (
                                    <StyledSelect
                                        {...field}
                                        options={projects.map(p => ({
                                            value: p.id,
                                            label: `${p.name} — ${p.developer?.name || 'Unknown'}`,
                                        }))}
                                        placeholder="Select project..."
                                        error={!!errors.project_id}
                                        isClearable
                                    />
                                )}
                            />
                            {errors.project_id && (
                                <p className="text-sm text-red-500 mt-1">{errors.project_id.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="input-label">Description</label>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <ReactQuill
                                        theme="snow"
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        modules={{
                                            toolbar: [
                                                [{ 'header': [1, 2, false] }],
                                                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                ['link'],
                                                ['clean']
                                            ],
                                        }}
                                        className="bg-white dark:bg-gray-900 rounded-lg"
                                        placeholder="Describe the property features, amenities, and unique selling points..."
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white dark:bg-dashboard-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">📍 Location</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="input-label">Availability / Status</label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="w-full sm:w-1/2 relative z-20">
                                    <StyledSelect
                                        options={availabilityOptions}
                                        value={availabilityType}
                                        onChange={(val) => {
                                            setAvailabilityType(val);
                                            if (val === 'ready') {
                                                setValue('availability_status', 'Ready to Move In');
                                            } else {
                                                setValue('availability_status', `Unavailable until ${format(availabilityDate, 'MMM dd, yyyy')}`);
                                                setShowDatePicker(true);
                                            }
                                        }}
                                        isSearchable={false}
                                        placeholder="Select status..."
                                    />
                                </div>

                                <div className="relative w-full sm:w-1/2 z-10" ref={datePickerRef}>
                                    <div
                                        className={`input-field flex items-center h-[38px] transition-colors ${availabilityType === 'date'
                                            ? 'cursor-pointer bg-white dark:bg-dashboard-card'
                                            : 'cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400 opacity-70'
                                            }`}
                                        onClick={() => availabilityType === 'date' && setShowDatePicker(!showDatePicker)}
                                    >
                                        <CalendarIcon className={`w-5 h-5 mr-2 ${availabilityType === 'date' ? 'text-gray-400' : 'text-gray-300'}`} />
                                        <span className="text-sm">
                                            {availabilityType === 'date'
                                                ? format(availabilityDate, 'MMM dd, yyyy')
                                                : '—'}
                                        </span>
                                    </div>

                                    {showDatePicker && (
                                        <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-2 z-50 shadow-lg rounded-md border border-gray-100 dark:border-gray-700 bg-white dark:bg-dashboard-card w-auto min-w-[300px]">
                                            {/* Custom Header */}
                                            <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
                                                <button
                                                    type="button"
                                                    onClick={() => setShownDate(subMonths(shownDate, 1))}
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400"
                                                >
                                                    <ChevronLeftIcon className="w-5 h-5" />
                                                </button>

                                                <div className="flex items-center gap-2">
                                                    <div className="w-32">
                                                        <StyledSelect
                                                            value={getMonth(shownDate instanceof Date && !isNaN(shownDate.getTime()) ? shownDate : new Date())}
                                                            onChange={(val) => setShownDate(setMonth(shownDate, val))}
                                                            options={Array.from({ length: 12 }, (_, i) => ({
                                                                value: i,
                                                                label: format(new Date(2000, i, 1), 'MMMM')
                                                            }))}
                                                            isSearchable={false}
                                                            styles={{
                                                                control: (base) => ({
                                                                    ...base,
                                                                    minHeight: '30px',
                                                                    height: '30px',
                                                                    fontSize: '0.8rem'
                                                                }),
                                                                dropdownIndicator: (base) => ({
                                                                    ...base,
                                                                    padding: '2px'
                                                                })
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="w-28">
                                                        <StyledSelect
                                                            value={getYear(shownDate instanceof Date && !isNaN(shownDate.getTime()) ? shownDate : new Date())}
                                                            onChange={(val) => setShownDate(setYear(shownDate, val))}
                                                            options={Array.from({ length: 10 }, (_, i) => {
                                                                const year = new Date().getFullYear() + i;
                                                                return { value: year, label: year.toString() };
                                                            })}
                                                            isSearchable={false}
                                                            styles={{
                                                                control: (base) => ({
                                                                    ...base,
                                                                    minHeight: '30px',
                                                                    height: '30px',
                                                                    fontSize: '0.8rem'
                                                                }),
                                                                dropdownIndicator: (base) => ({
                                                                    ...base,
                                                                    padding: '2px'
                                                                })
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setShownDate(addMonths(shownDate, 1))}
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400"
                                                >
                                                    <ChevronRightIcon className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <DateRange
                                                locale={enUS}
                                                editableDateInputs={false}
                                                showDateDisplay={false}
                                                onChange={(item) => {
                                                    const date = item.selection.startDate;
                                                    setAvailabilityDate(date);
                                                    setValue('availability_status', `Unavailable until ${format(date, 'MMM dd, yyyy')}`);
                                                    setShowDatePicker(false);
                                                }}
                                                moveRangeOnFirstSelection={false}
                                                ranges={[{
                                                    startDate: availabilityDate,
                                                    endDate: availabilityDate,
                                                    key: 'selection'
                                                }]}
                                                shownDate={shownDate instanceof Date && !isNaN(shownDate.getTime()) ? shownDate : new Date()}
                                                showMonthAndYearPickers={false}
                                                rangeColors={['#3b82f6']}
                                                minDate={new Date()}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="input-label">Distance (meters)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🚶</span>
                                        <input
                                            type="number"
                                            className="input-field pl-12"
                                            placeholder="e.g. 350"
                                            {...register('distance_to_station', {
                                                onChange: (e) => {
                                                    const val = e.target.value;
                                                    setWalkingTime(val ? Math.round(val / WALKING_SPEED_MPM) : '');
                                                }
                                            })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="input-label">Walking Time (min)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">⏱️</span>
                                        <input
                                            type="number"
                                            className="input-field pl-12"
                                            placeholder="e.g. 5"
                                            value={walkingTime}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setWalkingTime(val);
                                                setValue('distance_to_station', val ? Math.round(val * WALKING_SPEED_MPM) : '');
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="input-label">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    className="input-field"
                                    placeholder="e.g., 13.7563"
                                    {...register('latitude')}
                                />
                            </div>
                            <div>
                                <label className="input-label">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    className="input-field"
                                    placeholder="e.g., 100.5018"
                                    {...register('longitude')}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Google Maps Link or Coordinates</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Paste Google Maps link or Coordinates (e.g., 13.75, 100.5)"
                                {...register('map_url', {
                                    onChange: (e) => {
                                        const url = e.target.value;
                                        if (!url) return;

                                        // Robust extraction from various formats
                                        const patterns = [
                                            /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng
                                            /q=(-?\d+\.\d+),(-?\d+\.\d+)/, // q=lat,lng
                                            /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // !3dlat!4dlng
                                            /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ll=lat,lng
                                            /(-?\d+\.\d+),\s*(-?\d+\.\d+)/, // Plain lat, lng (anywhere)
                                        ];

                                        for (const pattern of patterns) {
                                            const match = url.match(pattern);
                                            if (match) {
                                                setValue('latitude', match[1]);
                                                setValue('longitude', match[2]);
                                                break;
                                            }
                                        }
                                    }
                                })}
                            />
                            <p className="mt-1 text-xs text-gray-500 italic">
                                Tip: Paste a Google Maps link to automatically set coordinates.
                            </p>
                        </div>

                        {/* Map Picker & Preview */}
                        <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-6">
                            <label className="input-label mb-4 block flex justify-between items-center">
                                <span>📍 Pin Property Location</span>
                                {fieldValues.latitude && fieldValues.longitude && (
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                                        Location Pinned
                                    </span>
                                )}
                            </label>
                            <div className="w-full h-[400px] rounded-[24px] overflow-hidden shadow-lg border-2 border-primary-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 group relative">
                                <LocationPicker
                                    value={{
                                        lat: fieldValues.latitude,
                                        lng: fieldValues.longitude
                                    }}
                                    onChange={(pos) => {
                                        setValue('latitude', pos.lat);
                                        setValue('longitude', pos.lng);
                                    }}
                                    address={`${fieldValues.address || ''} ${fieldValues.district || ''} ${fieldValues.province || ''}`}
                                />
                            </div>
                            <p className="mt-3 text-xs text-gray-400 flex items-start gap-2 leading-relaxed">
                                <SparklesIcon className="w-4 h-4 text-primary-500 shrink-0" />
                                <span>
                                    Click anywhere on the map to set the exact location, or search for an address.
                                    This will help users find your property more easily!
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="bg-white dark:bg-dashboard-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">💰 Price & Features</h2>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
                                    <MdBed />
                                </span>
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
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
                                    <MdBathtub />
                                </span>
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
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
                                    <MdSquareFoot />
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="input-field pl-12"
                                    placeholder="0"
                                    {...register('area')}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Floor</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
                                    <MdLayers />
                                </span>
                                <input
                                    type="text"
                                    className="input-field pl-12"
                                    placeholder="e.g. 12A"
                                    {...register('floor')}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Year Built</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
                                    <MdCalendarToday />
                                </span>
                                <input
                                    type="number"
                                    className="input-field pl-12"
                                    placeholder="e.g. 2013"
                                    {...register('year_built')}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">Unit Amenities</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'refrigerator', label: 'Refrigerator', icon: <MdKitchen className="w-5 h-5 text-blue-400" /> },
                                    { id: 'bathtub', label: 'Bathtub', icon: <MdBathtub className="w-5 h-5 text-blue-300" /> },
                                    { id: 'tv', label: 'TV', icon: <MdTv className="w-5 h-5 text-gray-600" /> },
                                    { id: 'ac', label: 'Air Conditioning', icon: <MdAir className="w-5 h-5 text-cyan-400" /> },
                                    { id: 'microwave', label: 'Microwave', icon: <MdMicrowave className="w-5 h-5 text-orange-400" /> },
                                    { id: 'washing_machine', label: 'Washing Machine', icon: <MdLocalLaundryService className="w-5 h-5 text-gray-400" /> },
                                    { id: 'water_heater', label: 'Water Heater', icon: <MdShower className="w-5 h-5 text-blue-400" /> },
                                    { id: 'kitchen', label: 'Kitchen / Stove', icon: <MdRestaurant className="w-5 h-5 text-orange-500" /> },
                                ].map((item) => (
                                    <label key={item.id} className="flex items-center p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group">
                                        <input
                                            type="checkbox"
                                            value={item.id}
                                            {...register('unit_amenities')}
                                            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="ml-3 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white flex items-center">
                                            <span className="mr-2 flex items-center justify-center">{item.icon}</span>
                                            {item.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">Building Features</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'parking', label: 'Covered Car Park', icon: <MdLocalParking className="w-5 h-5 text-blue-500" /> },
                                    { id: 'pool', label: 'Swimming Pool', icon: <MdPool className="w-5 h-5 text-cyan-500" /> },
                                    { id: 'gym', label: 'Fitness / Gym', icon: <MdFitnessCenter className="w-5 h-5 text-gray-700" /> },
                                    { id: 'security', label: '24h Security', icon: <MdSecurity className="w-5 h-5 text-red-500" /> },
                                    { id: 'sauna', label: 'Sauna', icon: <MdHotTub className="w-5 h-5 text-orange-400" /> },
                                    { id: 'garden', label: 'Garden / BBQ', icon: <MdPark className="w-5 h-5 text-green-500" /> },
                                    { id: 'playground', label: 'Playground', icon: <MdChildCare className="w-5 h-5 text-purple-400" /> },
                                    { id: 'coworking', label: 'Co-working Space', icon: <MdComputer className="w-5 h-5 text-gray-600" /> },
                                ].map((item) => (
                                    <label key={item.id} className="flex items-center p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group">
                                        <input
                                            type="checkbox"
                                            value={item.id}
                                            {...register('building_features')}
                                            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="ml-3 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white flex items-center">
                                            <span className="mr-2">{item.icon}</span>
                                            {item.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">Project Facilities</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {[
                                { id: 'communal_elevator', label: 'Communal Elevator', icon: <MdElevator className="w-5 h-5 text-gray-500" /> },
                                { id: 'communal_reception', label: 'Communal Reception', icon: <MdGroups className="w-5 h-5 text-amber-600" /> },
                                { id: 'communal_restaurant', label: 'Communal Restaurant', icon: <MdRestaurant className="w-5 h-5 text-orange-500" /> },
                                { id: 'communal_shop', label: 'Communal Shop', icon: <MdStore className="w-5 h-5 text-emerald-600" /> },
                                { id: 'communal_shuttle', label: 'Communal Shuttle Service', icon: <MdDirectionsBus className="w-5 h-5 text-blue-500" /> },
                                { id: 'communal_spa', label: 'Communal Spa', icon: <MdSpa className="w-5 h-5 text-pink-400" /> },
                                { id: 'communal_coworking', label: 'Communal Coworking Space', icon: <MdComputer className="w-5 h-5 text-gray-600" /> },
                                { id: 'communal_security_24', label: 'Communal Security 24 hours', icon: <MdSecurity className="w-5 h-5 text-red-500" /> },
                                { id: 'communal_parking', label: 'Communal Car Park', icon: <MdLocalParking className="w-5 h-5 text-blue-500" /> },
                                { id: 'communal_covered_parking', label: 'Communal Covered Car Park', icon: <MdGarage className="w-5 h-5 text-blue-600" /> },
                                { id: 'communal_function_room', label: 'Communal Function Room', icon: <MdMeetingRoom className="w-5 h-5 text-amber-700" /> },
                            ].map((item) => (
                                <label key={item.id} className="flex items-center p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group">
                                    <input
                                        type="checkbox"
                                        value={item.id}
                                        {...register('project_facilities')}
                                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="ml-3 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white flex items-center">
                                        <span className="mr-2 flex items-center justify-center">{item.icon}</span>
                                        {item.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/listings')}
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
            </form >

            {/* Lightbox */}
            {lightboxIndex !== null && imageList.length > 0 && imageList[lightboxIndex] && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setLightboxIndex(null)}
                >
                    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                        <img
                            src={getMediaUrl(imageList[lightboxIndex].url)}
                            alt=""
                            className="w-full h-full object-cover blur-2xl opacity-40 scale-110 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-black/60" />
                    </div>
                    <button
                        className="absolute top-6 right-6 p-3 text-white hover:text-gray-300 transition-colors z-[110]"
                        onClick={() => setLightboxIndex(null)}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <button
                        className="absolute bottom-6 right-6 p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xl transition-all flex items-center gap-2 font-bold z-[110]"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMedia(imageList[lightboxIndex].id);
                        }}
                    >
                        <TrashIcon className="w-6 h-6" />
                        <span>Delete Permanently</span>
                    </button>
                    {imageList.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 w-16 h-32 sm:w-24 sm:h-48 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all rounded-3xl group z-[110]"
                                onClick={prevImage}
                            >
                                <ChevronLeftIcon className="w-12 h-12 sm:w-16 sm:h-16 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                                className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-16 h-32 sm:w-24 sm:h-48 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all rounded-3xl group z-[110]"
                                onClick={nextImage}
                            >
                                <ChevronRightIcon className="w-12 h-12 sm:w-16 sm:h-16 group-hover:scale-110 transition-transform" />
                            </button>
                        </>
                    )}
                    <div
                        className="relative z-10 max-w-5xl w-full max-h-[85vh] flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={getMediaUrl(imageList[lightboxIndex].url)}
                            alt="Full Preview"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-all duration-300"
                        />
                        <div className="absolute -bottom-10 left-0 right-0 text-center text-white/60 text-sm font-medium">
                            {lightboxIndex + 1} / {imageList.length}
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default EditListing;
