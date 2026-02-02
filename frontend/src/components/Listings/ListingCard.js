import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, HomeIcon, CurrencyDollarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const ListingCard = ({ listing, viewMode = 'grid' }) => {
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
        media = [],
        is_featured,
    } = listing;

    // Get first image or placeholder
    const featuredImage = media.find((m) => m.type === 'image')?.url ||
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop';

    // Format price
    const formatPrice = (price) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)}M`;
        }
        if (price >= 1000) {
            return `${(price / 1000).toFixed(0)}K`;
        }
        return price.toLocaleString();
    };

    // Property type badge colors
    const typeColors = {
        condo: 'bg-blue-100 text-blue-800',
        house: 'bg-green-100 text-green-800',
        land: 'bg-yellow-100 text-yellow-800',
        townhouse: 'bg-purple-100 text-purple-800',
        apartment: 'bg-pink-100 text-pink-800',
    };

    const isListView = viewMode === 'list';

    if (isListView) {
        return (
            <Link
                to={`/listings/${id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row group hover:shadow-md transition-all duration-300"
            >
                {/* Image Section */}
                <div className="md:w-72 h-48 md:h-auto relative overflow-hidden flex-none">
                    <img
                        src={featuredImage}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Featured badge */}
                    {is_featured && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded shadow-lg tracking-tighter">
                            Featured
                        </div>
                    )}

                    {/* Listing type badge */}
                    <div className={`absolute top-3 right-3 text-[10px] uppercase font-black px-2 py-0.5 rounded ${listing_type === 'sale' ? 'bg-primary-500 text-white' : 'bg-secondary-500 text-white'}`}>
                        For {listing_type === 'sale' ? 'Sale' : 'Rent'}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${typeColors[property_type?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                                {property_type || 'Property'}
                            </span>
                            <div className="flex items-center space-x-1 text-primary-600">
                                <span className="text-xl font-black">{formatPrice(price)}</span>
                                <span className="text-xs font-bold text-gray-500">{price_unit}</span>
                                {listing_type === 'rent' && <span className="text-xs font-bold text-gray-500">/mo</span>}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                            {title}
                        </h3>

                        <div className="flex items-center text-gray-500 text-sm mb-4">
                            <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span>{station_name || station_id || district || 'Bangkok'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                        {bedrooms > 0 && (
                            <div className="flex items-center gap-1.5 text-gray-700">
                                <div className="p-1.5 bg-gray-50 rounded-lg"><HomeIcon className="w-4 h-4 text-gray-400" /></div>
                                <span className="text-xs font-bold">{bedrooms} Beds</span>
                            </div>
                        )}
                        {bathrooms > 0 && (
                            <div className="flex items-center gap-1.5 text-gray-700">
                                <div className="p-1.5 bg-gray-50 rounded-lg">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold">{bathrooms} Baths</span>
                            </div>
                        )}
                        {area > 0 && (
                            <div className="flex items-center gap-1.5 text-gray-700">
                                <div className="p-1.5 bg-gray-50 rounded-lg">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold">{area} sqm</span>
                            </div>
                        )}

                        <div className="ml-auto">
                            <button className="bg-primary-600 text-white text-xs font-bold px-4 py-2 rounded-xl group-hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
                                View Deal
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link
            to={`/listings/${id}`}
            className="listing-card group block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={featuredImage}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Featured badge */}
                {is_featured && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded shadow-lg tracking-tighter">
                        Featured
                    </div>
                )}

                {/* Listing type badge */}
                <div className={`absolute top-3 right-3 text-[10px] uppercase font-black px-2 py-0.5 rounded shadow-sm ${listing_type === 'sale' ? 'bg-primary-500 text-white' : 'bg-secondary-500 text-white'
                    }`}>
                    For {listing_type === 'sale' ? 'Sale' : 'Rent'}
                </div>

                {/* Price overlay: Light glassmorphism style */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/20">
                    <div className="flex items-center space-x-1 text-gray-900">
                        <CurrencyDollarIcon className="w-4 h-4 text-primary-600" />
                        <span className="text-lg font-black">{formatPrice(price)}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">{price_unit}</span>
                        {listing_type === 'rent' && <span className="text-[10px] font-bold text-gray-500">/mo</span>}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Property type */}
                <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${typeColors[property_type?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                        {property_type || 'Property'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">#{id.slice(0, 5)}</span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[3rem]">
                    {title}
                </h3>

                {/* Location */}
                <div className="flex items-center text-gray-500 text-sm mb-4">
                    <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0 text-gray-400" />
                    <span className="truncate">
                        {station_name || station_id || district || 'Bangkok'}
                    </span>
                </div>

                {/* Features */}
                <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        {bedrooms > 0 && (
                            <div className="flex items-center gap-1" title="Bedrooms">
                                <HomeIcon className="w-4 h-4 text-gray-300" />
                                <span className="text-xs font-bold text-gray-700">{bedrooms}</span>
                            </div>
                        )}
                        {bathrooms > 0 && (
                            <div className="flex items-center gap-1" title="Bathrooms">
                                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                </svg>
                                <span className="text-xs font-bold text-gray-700">{bathrooms}</span>
                            </div>
                        )}
                        {area > 0 && (
                            <div className="flex items-center gap-1" title="Area">
                                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                                <span className="text-xs font-bold text-gray-700">{area}m²</span>
                            </div>
                        )}
                    </div>

                    <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors">
                        <ArrowRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default ListingCard;
