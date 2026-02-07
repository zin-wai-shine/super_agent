import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { publicApi } from '../../services/api';
import {
    MapPinIcon,
    HomeIcon,
    ArrowLeftIcon,
    PhoneIcon,
    EnvelopeIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ShareIcon,
    HeartIcon,
    Square2StackIcon,
    ArrowsPointingOutIcon,
    SparklesIcon,
    CurrencyDollarIcon,
    CubeIcon,
    XMarkIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    ChatBubbleLeftRightIcon,
    DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { getMediaUrl } from '../../utils/media';
import ListingCard from '../../components/Listings/ListingCard';
import { TbTrain, TbCurrencyBaht } from "react-icons/tb";
import { LiaBedSolid } from "react-icons/lia";
import { PiBathtub, PiWavesLight } from "react-icons/pi";
import { RiStairsLine } from "react-icons/ri";
import { LuSofa, LuWind } from "react-icons/lu";
import {
    HiOutlineTv,
} from "react-icons/hi2";
import {
    MdOutlineKitchen,
    MdOutlineLocalParking,
    MdOutlinePool,
    MdOutlineFitnessCenter,
    MdOutlineHotTub,
    MdOutlinePark,
    MdOutlineChildCare,
    MdOutlineComputer,
    MdOutlineMicrowave,
    MdOutlineLocalLaundryService,
    MdOutlineSecurity,
    MdOutlineSoupKitchen
} from "react-icons/md";
import { BiSolidFridge } from "react-icons/bi";
import { IoWaterOutline } from "react-icons/io5";

// Custom Icons for "cool" look
const BedIcon = (props) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 20h20M5 20v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7M2 13h20" />
    </svg>
);
// Re-defining BedIcon nicely
const CustomBedIcon = (props) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 17h18M3 7v10M21 7v10M3 11h3a2 2 0 0 1 2 2v4M12 11h9" />
        {/* Simple Bed Side View */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 19h20M4 19v-9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9M2 14h2M20 14h2" />
    </svg>
);
// Actually using standard paths manually
const BedIconCool = (props) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18H4V8h2m14 10h-2V8h2m-6 3h-2v2h2v-2zM4 14h16" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 18h20" />
    </svg>
);

const BathIconCool = (props) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        {/* Shower Head */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4h6v2H9zM12 2v2M12 12V6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 14a4 4 0 1 0 8 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 16v1m4-1v1m-2 1v1" />
    </svg>
);
const BathIconCool2 = (props) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8a2 2 0 0 1 2-2h3.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 10a2 2 0 1 1-2.83 2.83" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5" />
    </svg>
);
// Sofa
const SofaIconCool = (props) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12V8H4v4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20v8H2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12v-2M18 12v-2" />
    </svg>
);

// Stairs
const StairsIconCool = (props) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 5h-4V9h-4v4H7v4H3" />
    </svg>
);

// Train
const TrainIconCool = (props) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 21l-2-3M16 21l2-3M4 11h16M9 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm10 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
    </svg>
);

const ListingDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);
    const [relatedListings, setRelatedListings] = useState([]);

    useEffect(() => {
        // Smooth scroll to top when changing listings
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setLoading(true);

        const fetchListing = async () => {
            try {
                const params = {};
                // If on localhost and user has agent_id, use it to simulate domain
                if (window.location.hostname.includes('localhost') && user?.agent_id) {
                    params.agent_id = user.agent_id;
                }

                const response = await publicApi.getListing(id, params);
                setListing(response.data);

                // Fetch related listings
                if (response.data) {
                    const relatedParams = {
                        limit: 12, // Fetch more to allow random suggestions from recent pool
                        exclude_id: id,
                        listing_type: response.data.listing_type, // "Currency filter" - match Sale/Rent
                    };

                    if (response.data.station_id) {
                        relatedParams.station_id = response.data.station_id;
                    } else if (response.data.district) {
                        relatedParams.district = response.data.district;
                    }

                    // Add agent_id for localhost dev if needed
                    if (window.location.hostname.includes('localhost') && user?.agent_id) {
                        relatedParams.agent_id = user.agent_id;
                    }

                    try {
                        const relatedResponse = await publicApi.getListings(relatedParams);
                        const allRelated = relatedResponse.data.listings || [];

                        // "Random and Recent": Shuffle the top recent results and pick 4
                        const shuffled = allRelated.sort(() => 0.5 - Math.random()).slice(0, 4);
                        setRelatedListings(shuffled);
                    } catch (err) {
                        console.error('Failed to fetch related listings:', err);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch listing:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id, user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Property not found</h2>
                    <p className="text-gray-500 mb-4">This property may have been removed or is unavailable.</p>
                    <Link to="/listings" className="btn-primary">
                        Browse Listings
                    </Link>
                </div>
            </div>
        );
    }

    const images = listing.media?.filter((m) => m.type === 'image') || [];
    const videos = listing.media?.filter((m) => m.type === 'video') || [];
    const hasImages = images.length > 0;

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: listing.price_unit || 'THB',
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div key={id} className="min-h-screen bg-white animate-in fade-in duration-500">
            {/* Back button */}
            <div className="sticky top-0 z-40 bg-white max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-20 pt-6 pb-4">
                <Link
                    to="/listings"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to listings
                </Link>
            </div>

            <div className="max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-20 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Details - Header Section */}
                        <div className="">
                            {/* Title & ID */}
                            <div className="flex justify-between items-start mb-2">
                                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                                    {listing.title}
                                </h1>
                                <div className="flex-shrink-0 ml-4 pt-1">
                                    <span className="text-gray-500 font-bold text-sm bg-gray-100 px-2 py-1 rounded">ID: {listing.id}</span>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-center text-gray-500 mb-6 text-lg">
                                <MapPinIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                                <span>
                                    {listing.project_name ? `${listing.project_name}, ` : ''}
                                    {listing.district}, {listing.province}
                                </span>
                            </div>

                            {/* Price */}
                            <div className="text-3xl font-bold text-gray-900 mb-4 flex items-baseline">
                                {formatPrice(listing.price)}
                                {listing.listing_type === 'rent' && (
                                    <span className="text-gray-700 text-xl font-semibold ml-2">/month</span>
                                )}
                            </div>

                            {/* Confirmed Button */}
                            <div className="">
                                <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded flex items-center transition-colors uppercase text-sm tracking-wide">
                                    <CheckBadgeIcon className="w-5 h-5 mr-2" />
                                    Confirmed Available Today
                                </button>
                            </div>
                        </div>

                        {/* Image Gallery - Desktop Bento Grid & Mobile Carousel */}
                        <div className="rounded-2xl overflow-hidden shadow-sm bg-white">
                            {/* Mobile Carousel (Visible on small screens) */}
                            <div className="lg:hidden relative aspect-[16/10]">
                                <img
                                    src={
                                        hasImages
                                            ? getMediaUrl(images[currentImageIndex].url)
                                            : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
                                    }
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                    onClick={() => {
                                        if (hasImages) {
                                            setGalleryIndex(currentImageIndex);
                                            setIsGalleryOpen(true);
                                        }
                                    }}
                                />
                                {hasImages && images.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                                        >
                                            <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                                        >
                                            <ChevronRightIcon className="w-5 h-5 text-gray-700" />
                                        </button>
                                        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                            {currentImageIndex + 1} / {images.length}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Desktop Bento Grid (Visible on lg screens) */}
                            <div className="hidden lg:grid grid-cols-4 gap-2 h-[400px] cursor-pointer">
                                {/* Main Image (Large, Left) */}
                                <div
                                    className="col-span-2 row-span-2 relative overflow-hidden group"
                                    onClick={() => { setGalleryIndex(0); setIsGalleryOpen(true); }}
                                >
                                    <img
                                        src={hasImages ? getMediaUrl(images[0].url) : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'}
                                        alt={listing.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>

                                {/* Second Image (Top Right Center) */}
                                <div
                                    className="col-span-1 row-span-1 relative overflow-hidden group"
                                    onClick={() => { setGalleryIndex(1); setIsGalleryOpen(true); }}
                                >
                                    {images[1] && (
                                        <>
                                            <img
                                                src={getMediaUrl(images[1].url)}
                                                alt="Gallery 2"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </>
                                    )}
                                </div>

                                {/* Third Image (Top Right) */}
                                <div
                                    className="col-span-1 row-span-1 relative overflow-hidden group rounded-tr-2xl"
                                    onClick={() => { setGalleryIndex(2); setIsGalleryOpen(true); }}
                                >
                                    {images[2] && (
                                        <>
                                            <img
                                                src={getMediaUrl(images[2].url)}
                                                alt="Gallery 3"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </>
                                    )}
                                </div>

                                {/* Fourth Image (Bottom Right Center) */}
                                <div
                                    className="col-span-1 row-span-1 relative overflow-hidden group"
                                    onClick={() => { setGalleryIndex(3); setIsGalleryOpen(true); }}
                                >
                                    {images[3] && (
                                        <>
                                            <img
                                                src={getMediaUrl(images[3].url)}
                                                alt="Gallery 4"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </>
                                    )}
                                </div>

                                {/* Fifth Image / Show All Button (Bottom Right) */}
                                <div
                                    className="col-span-1 row-span-1 relative overflow-hidden group rounded-br-2xl"
                                    onClick={() => { setGalleryIndex(4); setIsGalleryOpen(true); }}
                                >
                                    {images[4] ? (
                                        <>
                                            <img
                                                src={getMediaUrl(images[4].url)}
                                                alt="Gallery 5"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                            {/* Show All Overlay */}
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                                                <button className="bg-white/90 text-gray-900 px-4 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2 hover:bg-white transition-all transform group-hover:scale-105">
                                                    <Square2StackIcon className="w-5 h-5" />
                                                    Show all photos
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm shadow-sm border border-gray-200 hover:bg-gray-50 flex items-center gap-2">
                                                <Square2StackIcon className="w-5 h-5" />
                                                Show all {images.length} photos
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Badges Overlay (Common) */}
                            <div className="absolute top-4 left-4 flex space-x-2 pointer-events-none">
                                <span className={`badge ${listing.listing_type === 'sale' ? 'bg-primary-500' : 'bg-secondary-500'
                                    } text-white shadow-sm`}>
                                    For {listing.listing_type === 'sale' ? 'Sale' : 'Rent'}
                                </span>
                                {listing.is_featured && (
                                    <span className="badge bg-yellow-500 text-white shadow-sm">Featured</span>
                                )}
                            </div>

                            {/* Action Buttons Overlay (Common) */}
                            <div className="absolute top-4 right-4 flex space-x-2 z-10">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
                                    className="bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-colors"
                                >
                                    {isFavorite ? (
                                        <HeartSolidIcon className="w-5 h-5 text-red-500" />
                                    ) : (
                                        <HeartIcon className="w-5 h-5 text-gray-700" />
                                    )}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); }}
                                    className="bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-colors"
                                >
                                    <ShareIcon className="w-5 h-5 text-gray-700" />
                                </button>
                            </div>
                        </div>

                        {/* Details - Features & Description */}
                        <div className="">
                            {/* Features */}
                            {/* Features */}
                            {/* Features Grid */}
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8 mt-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                                    {/* Row 1 */}
                                    <div className="p-6 flex items-center space-x-4 hover:bg-gray-50 transition-colors">
                                        <LiaBedSolid className="w-8 h-8 text-gray-900" />
                                        <div>
                                            <div className="font-medium text-gray-700">{listing.bedrooms || 0} Bedrooms</div>
                                        </div>
                                    </div>
                                    <div className="p-6 flex items-center space-x-4 hover:bg-gray-50 transition-colors border-t md:border-t-0">
                                        <PiBathtub className="w-8 h-8 text-gray-900" />
                                        <div>
                                            <div className="font-medium text-gray-700">{listing.bathrooms || 0} Bathrooms</div>
                                        </div>
                                    </div>
                                    <div className="p-6 flex items-center space-x-4 hover:bg-gray-50 transition-colors border-t lg:border-t-0">
                                        <ArrowsPointingOutIcon className="w-8 h-8 text-gray-900" />
                                        <div>
                                            <div className="font-medium text-gray-700">{listing.area || 0} m²</div>
                                        </div>
                                    </div>
                                    <div className="p-6 flex items-center space-x-4 hover:bg-gray-50 transition-colors border-t lg:border-t-0">
                                        <RiStairsLine className="w-8 h-8 text-gray-900" />
                                        <div>
                                            <div className="font-medium text-gray-700">{listing.floor ? `${listing.floor} floor` : '-'}</div>
                                        </div>
                                    </div>

                                    {/* Additional Highlights */}
                                    {listing.year_built > 0 && (
                                        <div className="p-6 flex items-center space-x-4 hover:bg-gray-50 transition-colors border-t">
                                            <div className="text-2xl">🏗️</div>
                                            <div>
                                                <div className="font-medium text-gray-700">Built in {listing.year_built}</div>
                                            </div>
                                        </div>
                                    )}

                                    {listing.listing_type === 'sale' && (
                                        <div className="p-6 flex items-center space-x-4 hover:bg-gray-50 transition-colors border-t">
                                            <TbCurrencyBaht className="w-8 h-8 text-gray-900" />
                                            <div>
                                                <div className="font-medium text-gray-700">
                                                    {listing.price && listing.area
                                                        ? `฿${Math.round(listing.price / listing.area).toLocaleString()}/sqm`
                                                        : '-'}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-6 flex items-center space-x-4 hover:bg-gray-50 transition-colors border-t col-span-1 md:col-span-2">
                                        <TbTrain className="w-8 h-8 text-gray-900 flex-shrink-0" />
                                        <div>
                                            <div className="font-medium text-gray-700 truncate">
                                                {(listing.station_id || listing.station_name)
                                                    ? `${listing.distance_to_station || 0}m to ${listing.station_name || listing.station?.name_en || 'Station'}`
                                                    : 'Near Transit'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Features & Amenities Section */}
                            {listing.features && (
                                <div className="mb-12">
                                    <h3 className="text-2xl font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-4">Amenities & Features</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                                        {(() => {
                                            try {
                                                const featureList = JSON.parse(listing.features || '[]');
                                                const featureMap = {
                                                    'refrigerator': { label: 'Refrigerator', icon: <BiSolidFridge className="w-6 h-6 text-blue-500" /> },
                                                    'bathtub': { label: 'Bathtub', icon: <PiBathtub className="w-6 h-6 text-blue-400" /> },
                                                    'tv': { label: 'TV', icon: <HiOutlineTv className="w-6 h-6 text-gray-700" /> },
                                                    'ac': { label: 'Air Conditioning', icon: <LuWind className="w-6 h-6 text-blue-300" /> },
                                                    'microwave': { label: 'Microwave', icon: <MdOutlineMicrowave className="w-6 h-6 text-orange-600" /> },
                                                    'washing_machine': { label: 'Washing Machine', icon: <MdOutlineLocalLaundryService className="w-6 h-6 text-blue-600" /> },
                                                    'water_heater': { label: 'Water Heater', icon: <IoWaterOutline className="w-6 h-6 text-orange-400" /> },
                                                    'kitchen': { label: 'Kitchen / Stove', icon: <MdOutlineSoupKitchen className="w-6 h-6 text-gray-600" /> },
                                                    'parking': { label: 'Covered Car Park', icon: <MdOutlineLocalParking className="w-6 h-6 text-blue-700" /> },
                                                    'pool': { label: 'Swimming Pool', icon: <MdOutlinePool className="w-6 h-6 text-cyan-500" /> },
                                                    'gym': { label: 'Fitness / Gym', icon: <MdOutlineFitnessCenter className="w-6 h-6 text-gray-800" /> },
                                                    'security': { label: '24h Security', icon: <MdOutlineSecurity className="w-6 h-6 text-red-600" /> },
                                                    'sauna': { label: 'Sauna', icon: <MdOutlineHotTub className="w-6 h-6 text-orange-300" /> },
                                                    'garden': { label: 'Garden / BBQ', icon: <MdOutlinePark className="w-6 h-6 text-green-600" /> },
                                                    'playground': { label: 'Playground', icon: <MdOutlineChildCare className="w-6 h-6 text-yellow-500" /> },
                                                    'coworking': { label: 'Co-working Space', icon: <MdOutlineComputer className="w-6 h-6 text-indigo-500" /> },
                                                };

                                                if (!featureList.length) return <p className="text-gray-500 italic">No specific amenities listed.</p>;

                                                return featureList.map(featureId => {
                                                    const item = featureMap[featureId] || { label: featureId, icon: <SparklesIcon className="w-6 h-6 text-yellow-400" /> };
                                                    return (
                                                        <div key={featureId} className="flex items-center space-x-4 py-1 group">
                                                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-100">
                                                                {item.icon}
                                                            </div>
                                                            <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{item.label}</span>
                                                        </div>
                                                    );
                                                });
                                            } catch (e) {
                                                return null;
                                            }
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <h3 className="text-3xl font-extrabold text-gray-900 mb-6">About this listing</h3>
                                {listing.description ? (
                                    <div
                                        className="text-gray-600 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-3 [&>h1]:text-gray-900
                                                   [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3 [&>h2]:text-gray-900
                                                   [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mb-2 [&>h3]:text-gray-900
                                                   [&>p]:mb-4 [&>p]:leading-relaxed
                                                   [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4
                                                   [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4
                                                   [&>li]:mb-1
                                                   [&>strong]:font-semibold [&>strong]:text-gray-900
                                                   [&>a]:text-primary-600 [&>a]:underline"
                                        dangerouslySetInnerHTML={{ __html: listing.description }}
                                    />
                                ) : (
                                    <p className="text-gray-600">No description provided.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 sticky top-24 self-start">


                        {/* Contact Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
                            {/* Contact Header */}
                            <div>
                                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Interested in this property?</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Ready to make this yours? Contact us immediately to schedule a private viewing.
                                </p>
                            </div>



                            {/* Direct Contact Buttons */}
                            <div className="pt-6 border-t border-gray-100 space-y-3">
                                {/* Line */}
                                <a
                                    href="https://line.me/ti/p/~kiki33467"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center py-3.5 rounded-lg text-white font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                    style={{ backgroundColor: '#06C755' }}
                                >
                                    <div className="flex items-center w-36 space-x-3">
                                        <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 flex-shrink-0" />
                                        <span>Line</span>
                                    </div>
                                </a>

                                {/* Phone */}
                                <a
                                    href="tel:0951953607"
                                    className="w-full flex items-center justify-center py-3.5 rounded-lg text-white font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gray-900 hover:bg-black"
                                >
                                    <div className="flex items-center w-36 space-x-3">
                                        <PhoneIcon className="w-6 h-6 flex-shrink-0" />
                                        <span>Call Agent</span>
                                    </div>
                                </a>

                                {/* Viber */}
                                <a
                                    href="viber://chat?number=%2B66951953607"
                                    className="w-full flex items-center justify-center py-3.5 rounded-lg text-white font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                    style={{ backgroundColor: '#7360f2' }}
                                >
                                    <div className="flex items-center w-36 space-x-3">
                                        <ChatBubbleLeftRightIcon className="w-6 h-6 flex-shrink-0" />
                                        <span>Viber</span>
                                    </div>
                                </a>

                                {/* WhatsApp */}
                                <a
                                    href="https://wa.me/66951953607"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center py-3.5 rounded-lg text-white font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                    style={{ backgroundColor: '#25D366' }}
                                >
                                    <div className="flex items-center w-36 space-x-3">
                                        <DevicePhoneMobileIcon className="w-6 h-6 flex-shrink-0" />
                                        <span>WhatsApp</span>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Station Badge - Compact Flex */}

                    </div>
                </div>
            </div>

            {/* Related Listings Section */}
            {relatedListings.length > 0 && (
                <div className="max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-20 py-12 border-t border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">You might also like</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedListings.map((related) => (
                            <ListingCard key={related.id} listing={related} viewMode="grid" />
                        ))}
                    </div>
                </div>
            )}

            {/* Gallery Modal - Lightbox Style */}
            {isGalleryOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col justify-center items-center backdrop-blur-sm animate-in fade-in duration-300">
                    {/* Dynamic Blurred Background */}
                    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                        <img
                            src={getMediaUrl(images[galleryIndex].url)}
                            alt=""
                            className="w-full h-full object-cover blur-2xl opacity-40 scale-110"
                        />
                        <div className="absolute inset-0 bg-black/60" />
                    </div>

                    {/* Header: Counter & Close */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-[120] font-bold">
                        <div className="text-white/90 font-medium tracking-wide">
                            {galleryIndex + 1} / {images.length}
                        </div>
                        <button
                            onClick={() => setIsGalleryOpen(false)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-105 pointer-events-auto"
                        >
                            <XMarkIcon className="w-8 h-8" />
                        </button>
                    </div>

                    {/* Main Image */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-12" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={getMediaUrl(images[galleryIndex].url)}
                            alt={`Gallery ${galleryIndex + 1}`}
                            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                        />
                    </div>

                    {/* Navigation Buttons (Huge) */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setGalleryIndex((prev) => (prev - 1 + images.length) % images.length);
                                }}
                                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-4 md:p-6 bg-black/40 hover:bg-black/60 rounded-full text-white/90 hover:text-white transition-all hover:scale-110 backdrop-blur-md border border-white/10 group z-[120] pointer-events-auto"
                            >
                                <ChevronLeftIcon className="w-10 h-10 md:w-16 md:h-16 shadow-lg group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setGalleryIndex((prev) => (prev + 1) % images.length);
                                }}
                                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 md:p-6 bg-black/40 hover:bg-black/60 rounded-full text-white/90 hover:text-white transition-all hover:scale-110 backdrop-blur-md border border-white/10 group z-[120] pointer-events-auto"
                            >
                                <ChevronRightIcon className="w-10 h-10 md:w-16 md:h-16 shadow-lg group-hover:translate-x-1 transition-transform" />
                            </button>
                        </>
                    )}

                    {/* Bottom Caption (Optional) */}
                    <div className="absolute bottom-6 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-white/90 text-sm font-medium tracking-wide z-[120]">
                        {listing.title} | {formatPrice(listing.price)}{listing.listing_type === 'rent' && '/mo'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListingDetailPage;
