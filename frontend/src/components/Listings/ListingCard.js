import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPinIcon, HomeIcon, ArrowRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { getMediaUrl } from '../../utils/media';
import { TbTrain } from "react-icons/tb";
import { LiaBedSolid } from "react-icons/lia";
import { PiBathtub } from "react-icons/pi";

const ListingCard = ({ listing, viewMode = 'grid', priceFormat = 'short' }) => {
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
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();

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

    // Format price
    const formatPrice = (price) => {
        if (priceFormat === 'full') {
            return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
        }

        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)}M`;
        }
        if (price >= 1000) {
            return `${(price / 1000).toFixed(0)}K`;
        }
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

    if (isListView) {
        return (
            <Link
                to={`/listings/${id}`}
                className="bg-white rounded-[3px] overflow-hidden shadow-sm border border-gray-100 flex flex-row group hover:shadow-md transition-all duration-300 h-[130px] md:h-[220px] animate-fade-in-scale"
            >
                {/* Image Section - Fixed width on mobile, percentage on desktop */}
                <div className="w-[130px] md:w-[40%] h-full relative overflow-hidden flex-none group/slider">
                    <img
                        src={listingImages[currentImageIndex]}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />

                    {/* Navigation Buttons - Desktop Only */}
                    {listingImages.length > 1 && (
                        <div className="hidden md:block">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentImageIndex((prev) => (prev === 0 ? listingImages.length - 1 : prev - 1));
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity z-10"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentImageIndex((prev) => (prev === listingImages.length - 1 ? 0 : prev + 1));
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity z-10"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Dots Indicator */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                {listingImages.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white/80'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Listing type badge - Mobile: Small Top Left / Desktop: Standard */}
                    <div className={`absolute top-2 left-2 md:top-4 md:left-4 text-[9px] md:text-[11px] uppercase font-black px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-[3px] shadow-sm tracking-wider z-10 ${listing_type === 'sale' ? 'bg-primary-600 text-white' : 'bg-emerald-600 text-white'}`}>
                        {listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                    </div>

                    {/* Featured badge - Desktop Only */}
                    {is_featured && (
                        <div className="hidden md:block absolute top-4 right-4 bg-yellow-400 text-white text-[11px] uppercase font-black px-2.5 py-1 rounded-[3px] shadow-sm tracking-wider z-10">
                            Featured
                        </div>
                    )}

                    {/* Date badge - Desktop Only */}
                    <div className="hidden md:flex absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-gray-700 text-[10px] font-bold uppercase px-2 py-1 rounded-[3px] shadow-sm tracking-wider items-center gap-1.5 z-10">
                        <CalendarDaysIcon className="w-3.5 h-3.5 text-primary-500" />
                        Listed {formatRelativeTime(created_at)}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-3 md:p-4 flex flex-col justify-between flex-1 min-w-0 relative">
                    <div>
                        <div className="flex items-start justify-between mb-1">
                            <span className={`hidden md:inline-block px-2 py-0.5 rounded-[3px] text-[10px] font-bold uppercase tracking-wider ${typeColors[property_type?.toLowerCase().trim()] || 'bg-gray-100 text-gray-800'}`}>
                                {property_type || 'Property'}
                            </span>
                            <div className="flex items-baseline gap-1 text-primary-600">
                                <span className="text-lg md:text-2xl font-black tracking-tight">{formatPrice(price)}</span>
                                <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">{price_unit}</span>
                                {listing_type === 'rent' && <span className="text-[10px] md:text-xs font-bold text-gray-400">/mo</span>}
                            </div>
                        </div>

                        <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight">
                            {title}
                        </h3>

                        {/* Information Group */}
                        <div className="space-y-1 md:space-y-2 mb-0">
                            {/* Location & Station */}
                            <div className="space-y-1">
                                <div className="flex items-center text-gray-500">
                                    <MapPinIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 flex-shrink-0 text-primary-600" />
                                    <span className="text-xs md:text-sm font-medium truncate">
                                        {road || district || 'Bangkok'}
                                    </span>
                                </div>


                                {((station_name || station_id) || (station?.name_en || station?.id)) && (
                                    <div className="flex items-center gap-1.5">
                                        {/* Train Icon */}
                                        <TbTrain className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-600 flex-shrink-0" />

                                        <span className="text-[10px] md:text-xs text-primary-600 font-bold whitespace-nowrap hidden md:inline">
                                            {line_name || station?.line_name || 'BTS'}
                                        </span>

                                        <span className="text-[10px] md:text-xs text-gray-900 font-semibold truncate">
                                            {station?.name_en?.split('(')[0] || station_name?.split('(')[0]}
                                        </span>

                                        <span
                                            className="px-1 py-0.5 rounded-[3px] text-[8px] md:text-[9px] font-bold text-white tabular-nums"
                                            style={{ backgroundColor: line_color || station?.line_color || '#3b82f6' }}
                                        >
                                            {station?.id || station_id}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Features for List View - Desktop Only / Simplified on Mobile */}
                            <div className="flex items-center gap-3 md:gap-4 pt-1 md:pt-2">
                                <div className="flex items-center gap-1 text-gray-600">
                                    <LiaBedSolid className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-600" />
                                    <span className="text-xs md:text-sm font-medium">{bedrooms} <span className="hidden md:inline">Beds</span></span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <PiBathtub className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-600" />
                                    <span className="text-xs md:text-sm font-medium">{bathrooms} <span className="hidden md:inline">Baths</span></span>
                                </div>
                                {area > 0 && (
                                    <div className="hidden md:flex items-center gap-1 text-gray-600">
                                        <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                        </svg>
                                        <span className="text-sm font-medium">{area}m²</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                        <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest gap-2">
                            <span className="text-[10px]">ID: #{id.slice(0, 8)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`/listings/${id}`);
                                }}
                                className="px-4 py-2 text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-[3px] transition-all"
                            >
                                View Details
                            </button>
                            {user?.role !== 'agent' && user?.role !== 'sub_agent' && (
                                <button
                                    onClick={handleBookClick}
                                    className="bg-primary-600 text-white text-xs font-bold px-4 py-2 rounded-[3px] hover:bg-primary-700 transition-all shadow-sm"
                                >
                                    Book Viewing
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link
            to={`/listings/${id}`}
            className="listing-card group block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-scale"
        >
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <img
                    src={featuredImage}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Featured badge & Date badge - Stacked Top Left */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    {is_featured && (
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[11px] uppercase font-black px-1.5 py-0.5 rounded-[3px] shadow-lg tracking-tight">
                            Featured
                        </div>
                    )}
                    <div className="bg-white/90 backdrop-blur-md text-gray-700 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-[3px] shadow-sm tracking-wider flex items-center gap-1">
                        <CalendarDaysIcon className="w-3 h-3 text-primary-500" />
                        {formatRelativeTime(created_at)}
                    </div>
                </div>

                {/* Listing type badge */}
                <div className={`absolute top-3 right-3 text-[11px] uppercase font-black px-2 py-0.5 rounded-[3px] shadow-sm ${listing_type === 'sale' ? 'bg-primary-500 text-white' : 'bg-secondary-500 text-white'
                    }`}>
                    {listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                </div>

                {/* Price overlay: Light glassmorphism style */}
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-[3px] shadow-md border border-white/40">
                    <div className="flex items-center space-x-1.5 text-gray-900">
                        <span className="text-primary-600 font-bold text-sm">฿</span>
                        <span className="text-base font-black tracking-tight">{formatPrice(price)}</span>
                        <span className="text-[12px] font-bold text-gray-500 uppercase">{price_unit}</span>
                        {listing_type === 'rent' && <span className="text-[12px] font-bold text-gray-500">/mo</span>}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Property type & ID */}
                <div className="flex items-center justify-between mb-1.5">
                    <span className={`px-1.5 py-0.5 rounded-[3px] text-[11px] font-bold uppercase tracking-wider ${typeColors[property_type?.toLowerCase().trim()] || 'bg-gray-100 text-gray-800'}`}>
                        {property_type || 'Property'}
                    </span>
                    <span className="text-[12px] text-gray-400 font-medium tabular-nums">#{id.slice(0, 5)}</span>
                </div>

                <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1 mb-4">
                    {title}
                </h3>

                {/* Information Group Grouped Above Footer */}
                <div className="space-y-3 mb-4">
                    {/* Location & Station - Stacked for clarity */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center text-gray-500 text-[13px]">
                            <MapPinIcon className="w-4 h-4 mr-1.5 flex-shrink-0 text-primary-600" />
                            <span className="truncate">
                                {road || district || 'Bangkok'}
                            </span>
                        </div>

                        {((station_name || station_id) || (station?.name_en || station?.id)) && (
                            <div className="flex items-center gap-1.5 ml-0.5">
                                {/* Train Icon */}
                                <TbTrain className="w-4 h-4 text-primary-600 flex-shrink-0" />

                                <div className="flex items-baseline gap-1.5 overflow-hidden">
                                    {/* Line Name */}
                                    <span className="text-[12px] text-primary-600 font-semibold whitespace-nowrap">
                                        {line_name || station?.line_name || 'BTS'}
                                    </span>

                                    {/* Station Name */}
                                    <span className="text-[13px] text-gray-800 font-medium truncate" title={station?.name_en || station_name}>
                                        {station?.name_en?.split('(')[0] || station_name?.split('(')[0]}
                                    </span>
                                </div>

                                {/* Station ID Badge */}
                                <span
                                    className="px-1.5 py-0.5 rounded-[3px] text-[10px] font-bold text-white tabular-nums flex-shrink-0"
                                    style={{ backgroundColor: line_color || station?.line_color || '#3b82f6' }}
                                >
                                    {station?.id || station_id}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Features (Now Grouped Here) */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1" title="Bedrooms">
                            <LiaBedSolid className="w-4 h-4 text-primary-600" />
                            <span className="text-[13px] text-gray-500">{bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Bathrooms">
                            <PiBathtub className="w-4 h-4 text-primary-600" />
                            <span className="text-[13px] text-gray-500">{bathrooms}</span>
                        </div>
                        {area > 0 && (
                            <div className="flex items-center gap-1" title="Area">
                                <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                                <span className="text-[13px] text-gray-500">{area}m²</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Card Footer */}
                <div className="flex-1 flex gap-2">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(`/listings/${id}`);
                        }}
                        className="flex-1 py-2 text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-[3px] transition-all"
                    >
                        View Details
                    </button>
                    {user?.role !== 'agent' && user?.role !== 'sub_agent' && (
                        <button
                            onClick={handleBookClick}
                            className="flex-1 py-2 bg-primary-600 text-white text-xs font-bold rounded-[3px] hover:bg-primary-700 transition-all shadow-sm flex items-center justify-center gap-1 group/btn"
                        >
                            <span>Book Viewing</span>
                            <ArrowRightIcon className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ListingCard;
