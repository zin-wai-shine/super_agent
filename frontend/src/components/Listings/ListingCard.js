import React from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
    MapPinIcon,
    BookmarkIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { getMediaUrl } from '../../utils/media';
import { TbTrain } from "react-icons/tb";

import { saveListing, unsaveListing, checkIfSaved } from '../../services/savedListingsApi';
const ListingCard = ({ listing, viewMode = 'grid', priceFormat = 'short', showSave = true, to, onSaveToggle, initialSaved = false }) => {
    console.log('--- ListingCard Render ---', { id: listing.id, viewMode });
    const {
        id,
        title,
        price,
        price_unit = 'THB',
        property_type,
        listing_type,
        bedrooms,
        bathrooms,
        area,
        station_id,
        station_name,
        district,
        road,
        line_color,
        line_name,
        station,
        media = [],
        is_featured,
        created_at,
    } = listing;

    // Get first image or placeholder
    const featuredImage = getMediaUrl(media.find((m) => m.type === 'image')?.url);

    // Get all listing images for slider
    const listingImages = media.filter(m => m.type === 'image').map(m => getMediaUrl(m.url));
    if (listingImages.length === 0) listingImages.push(featuredImage);

    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [isSaved, setIsSaved] = React.useState(initialSaved);
    const [savingListing, setSavingListing] = React.useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();

    // Check if listing is saved on mount
    React.useEffect(() => {
        const checkSavedStatus = async () => {
            if (initialSaved) return; // Skip if explicitly provided

            if (isAuthenticated && user) {
                try {
                    const response = await checkIfSaved(id);
                    // Backend returns { saved: true/false }
                    setIsSaved(response.saved);
                } catch (error) {
                    console.error('Error checking saved status:', error);
                }
            }
        };
        checkSavedStatus();
    }, [id, isAuthenticated, user, initialSaved]);

    // Listen for global save status changes to sync across components
    React.useEffect(() => {
        const handleStatusChange = (event) => {
            const { listingId, saved } = event.detail;
            if (String(listingId) === String(id)) {
                setIsSaved(saved);
            }
        };

        window.addEventListener('listing:saved-status-changed', handleStatusChange);
        return () => window.removeEventListener('listing:saved-status-changed', handleStatusChange);
    }, [id]);

    const handleToggleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: location.pathname } } });
            return;
        }

        setSavingListing(true);
        try {
            if (isSaved) {
                await unsaveListing(id);
                setIsSaved(false);
                if (onSaveToggle) onSaveToggle(id, false);

                // Dispatch global event for real-time synchronization
                window.dispatchEvent(new CustomEvent('listing:saved-status-changed', {
                    detail: { listingId: id, saved: false }
                }));
            } else {
                await saveListing(id);
                setIsSaved(true);
                if (onSaveToggle) onSaveToggle(id, true);

                // Dispatch global event for real-time synchronization
                window.dispatchEvent(new CustomEvent('listing:saved-status-changed', {
                    detail: { listingId: id, saved: true }
                }));
            }
        } catch (error) {
            console.error('Save listing error:', error);
        } finally {
            setSavingListing(false);
        }
    };

    const handleBookClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const bookingUrl = `/listings/${id}/book`;

        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: bookingUrl } } });
        } else {
            navigate(bookingUrl);
        }
    };

    const nearestStation = station?.name_en?.split('(')[0] || station_name?.split('(')[0] || '';

    // Format price
    const formatPrice = (price) => {
        if (!price) return 'N/A';
        // Always use full locale string as requested in the design
        return price.toLocaleString();
    };

    const formatRelativeTime = (dateStr) => {
        if (!dateStr) return '';
        const now = new Date();
        const date = new Date(dateStr);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? 'min' : 'mins'} ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Property type badge colors
    const typeColors = {
        condo: 'bg-blue-100 text-blue-800',
        house: 'bg-green-100 text-green-800',
        land: 'bg-yellow-100 text-yellow-800',
        townhouse: 'bg-purple-100 text-purple-800',
        townhome: 'bg-purple-100 text-purple-800',
        apartment: 'bg-pink-100 text-pink-800',
    };

    const isListView = viewMode === 'list';
    const isMapListView = viewMode === 'map-list';

    if (isMapListView) {
        const detailParams = new URLSearchParams(searchParams);
        detailParams.set('detail', id);
        return (
            <Link
                to={to || `/listings?${detailParams.toString()}`}
                className="group block bg-white overflow-hidden rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300"
            >
                {/* Image on top — column layout */}
                <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                        src={listingImages[currentImageIndex]}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-start z-10">
                        {is_featured && (
                            <span className="bg-[#2f3e46]/90 backdrop-blur-md text-white text-[11px] md:text-[12px] font-black px-2.5 py-1 rounded-full shadow-md tracking-wider">
                                Featured
                            </span>
                        )}
                        <span className="text-[11px] md:text-[12px] font-bold px-2.5 py-1 rounded-full bg-[#2f3e46]/90 backdrop-blur-md text-white shadow-sm tracking-tight">
                            {listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                        </span>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-[#2f3e46]/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider border border-white/10">
                        {formatRelativeTime(created_at)}
                    </div>
                    {/* Save above image — same style as map hover card */}
                    {showSave && (
                        <button
                            onClick={handleToggleSave}
                            disabled={savingListing}
                            className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-sm border border-gray-100/80 cursor-pointer hover:bg-white transition-colors"
                            aria-label={isSaved ? 'Unsave' : 'Save'}
                        >
                            {isSaved ? (
                                <BookmarkSolidIcon className="w-5 h-5 text-primary-600" />
                            ) : (
                                <BookmarkIcon className="w-5 h-5 text-gray-600 hover:text-primary-600" />
                            )}
                        </button>
                    )}
                </div>

                {/* Content below image — price, title, location, stats; no Share/Copy Link */}
                <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1 text-gray-900">
                            <span className="text-xl font-semibold tracking-tight">{formatPrice(price)}</span>
                            <span className="text-[11px] font-bold text-gray-400 tracking-wide">{price_unit}</span>
                            {listing_type === 'rent' && <span className="text-[11px] font-bold text-gray-400">/mo</span>}
                        </div>
                        <span className="text-[10px] text-gray-300 font-mono opacity-60">#{String(id).slice(0, 6)}</span>
                    </div>
                    <h3 className="text-[15px] font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                        {title}
                    </h3>
                    <div className="flex items-center text-[13px] text-gray-700 flex-wrap gap-x-3 gap-y-0.5">
                        <span className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4 text-gray-700 shrink-0" />
                            {district || 'Bangkok'}
                        </span>
                        {nearestStation && (
                            <>
                                <span className="w-px h-3 bg-gray-200" />
                                <span className="flex items-center gap-1">
                                    <TbTrain className="w-4 h-4 text-gray-700 shrink-0" />
                                    {nearestStation}
                                </span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-6 text-[13px] text-gray-700">
                        <span><span className="font-bold">{bedrooms}</span> <span className="font-medium">bed</span></span>
                        <span><span className="font-bold">{bathrooms}</span> <span className="font-medium">bath</span></span>
                        {area > 0 && (
                            <span><span className="font-bold">{area}</span> <span className="font-medium">sqm</span></span>
                        )}
                    </div>
                </div>
            </Link>
        );
    }

    if (isListView) {
        const detailParams = new URLSearchParams(searchParams);
        detailParams.set('detail', id);
        return (
            <Link
                to={to || `/listings?${detailParams.toString()}`}
                className="group block bg-white overflow-hidden rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300"
            >
                {/* Image on top — column layout */}
                <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                        src={listingImages[currentImageIndex]}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-start z-10">
                        {is_featured && (
                            <span className="bg-[#2f3e46]/90 backdrop-blur-md text-white text-[11px] md:text-[12px] font-black px-2.5 py-1 rounded-full shadow-md tracking-wider">
                                Featured
                            </span>
                        )}
                        <span className="text-[11px] md:text-[12px] font-bold px-2.5 py-1 rounded-full bg-[#2f3e46]/90 backdrop-blur-md text-white shadow-sm tracking-tight">
                            {listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                        </span>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-[#2f3e46]/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider border border-white/10">
                        {formatRelativeTime(created_at)}
                    </div>
                    {showSave && (
                        <button
                            onClick={handleToggleSave}
                            disabled={savingListing}
                            className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-sm border border-gray-100/80 cursor-pointer hover:bg-white transition-colors"
                            aria-label={isSaved ? 'Unsave' : 'Save'}
                        >
                            {isSaved ? (
                                <BookmarkSolidIcon className="w-5 h-5 text-primary-600" />
                            ) : (
                                <BookmarkIcon className="w-5 h-5 text-gray-600 hover:text-primary-600" />
                            )}
                        </button>
                    )}
                </div>

                {/* Content below image */}
                <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1 text-gray-900">
                            <span className="text-xl font-semibold tracking-tight">{formatPrice(price)}</span>
                            <span className="text-[11px] font-bold text-gray-400 tracking-wide">{price_unit}</span>
                            {listing_type === 'rent' && <span className="text-[11px] font-bold text-gray-400">/mo</span>}
                        </div>
                        <span className="text-[10px] text-gray-300 font-mono opacity-60">#{String(id).slice(0, 6)}</span>
                    </div>
                    <h3 className="text-[15px] font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                        {title}
                    </h3>
                    <div className="flex items-center text-[13px] text-gray-700 flex-wrap gap-x-3 gap-y-0.5">
                        <span className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4 text-gray-700 shrink-0" />
                            {district || 'Bangkok'}
                        </span>
                        {nearestStation && (
                            <>
                                <span className="w-px h-3 bg-gray-200" />
                                <span className="flex items-center gap-1">
                                    <TbTrain className="w-4 h-4 text-gray-700 shrink-0" />
                                    {nearestStation}
                                </span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-6 text-[13px] text-gray-700">
                        <span><span className="font-bold">{bedrooms}</span> <span className="font-medium">bed</span></span>
                        <span><span className="font-bold">{bathrooms}</span> <span className="font-medium">bath</span></span>
                        {area > 0 && (
                            <span><span className="font-bold">{area}</span> <span className="font-medium">sqm</span></span>
                        )}
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link
            to={to || `/listings?detail=${id}`}
            className="group block bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 animate-fade-in-scale border border-gray-100/50"
            style={{ borderRadius: 'var(--card-radius)' }}
        >
            {/* Image Section */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <img
                    src={featuredImage}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />

                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-start z-10">
                    {is_featured && (
                        <div className="bg-[#2f3e46]/90 backdrop-blur-md text-white text-[11px] md:text-[12px] font-black px-2.5 py-1 rounded-full shadow-md tracking-wider">
                            Featured
                        </div>
                    )}
                    <div className="text-[11px] md:text-[12px] font-bold px-2.5 py-1 rounded-full bg-[#2f3e46]/90 backdrop-blur-md text-white shadow-sm tracking-tight">
                        {listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                    </div>
                </div>

                {/* Date Badge - Minimalist bottom right */}
                <div className="absolute bottom-3 right-3 bg-[#2f3e46]/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider border border-white/10">
                    {formatRelativeTime(created_at)}
                </div>
                {/* Save above image — same style as map hover card */}
                {showSave && (
                    <button
                        onClick={handleToggleSave}
                        disabled={savingListing}
                        className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-sm border border-gray-100/80 cursor-pointer hover:bg-white transition-colors"
                        aria-label={isSaved ? 'Unsave' : 'Save'}
                    >
                        {isSaved ? (
                            <BookmarkSolidIcon className="w-5 h-5 text-primary-600" />
                        ) : (
                            <BookmarkIcon className="w-5 h-5 text-gray-600 hover:text-primary-600" />
                        )}
                    </button>
                )}
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col gap-3">
                {/* Price and ID Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1 text-gray-900">
                        <span className="text-2xl font-semibold tracking-tight">{formatPrice(price)}</span>
                        <span className="text-[11px] font-bold text-gray-400 tracking-wide">{price_unit}</span>
                        {listing_type === 'rent' && <span className="text-[11px] font-bold text-gray-400">/mo</span>}
                    </div>
                    <span className="text-[11px] text-gray-300 font-mono tracking-tighter opacity-60">#{id.slice(0, 5)}</span>
                </div>

                {/* Title - Dark with primary hover */}
                <h3 className="text-[17px] font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-[1.3] h-[2.6em]">
                    {title}
                </h3>

                {/* Information Rows */}
                <div className="space-y-3">
                    <div className="flex items-center text-[14px] text-gray-700">
                        <MapPinIcon className="w-5 h-5 mr-1 text-gray-700 shrink-0" />
                        <span className="truncate">{district || 'Bangkok'}</span>
                        {nearestStation && (
                            <>
                                <div className="mx-2 w-px h-3 bg-gray-200" />
                                <TbTrain className="w-5 h-5 mr-1 text-gray-700 shrink-0" />
                                <span className="truncate">{nearestStation}</span>
                            </>
                        )}
                    </div>

                    {/* Stats Refined Row */}
                    <div className="flex items-center gap-8 pb-1 text-[14px] text-gray-700">
                        <span><span className="font-bold">{bedrooms}</span> <span className="font-medium">bed</span></span>
                        <span><span className="font-bold">{bathrooms}</span> <span className="font-medium">bath</span></span>
                        {area > 0 && (
                            <span><span className="font-bold">{area}</span> <span className="font-medium">sqm</span></span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ListingCard;
