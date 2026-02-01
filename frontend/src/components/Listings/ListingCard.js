import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, HomeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const ListingCard = ({ listing }) => {
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

    return (
        <Link
            to={`/listings/${id}`}
            className="listing-card group block"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={featuredImage}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Featured badge */}
                {is_featured && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        Featured
                    </div>
                )}

                {/* Listing type badge */}
                <div className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full ${listing_type === 'sale' ? 'bg-primary-500 text-white' : 'bg-secondary-500 text-white'
                    }`}>
                    For {listing_type === 'sale' ? 'Sale' : 'Rent'}
                </div>

                {/* Price overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex items-center space-x-1 text-white">
                        <CurrencyDollarIcon className="w-5 h-5" />
                        <span className="text-xl font-bold">{formatPrice(price)}</span>
                        <span className="text-sm opacity-80">{price_unit}</span>
                        {listing_type === 'rent' && <span className="text-sm opacity-80">/mo</span>}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Property type */}
                <div className="flex items-center space-x-2 mb-2">
                    <span className={`badge ${typeColors[property_type?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                        {property_type || 'Property'}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {title}
                </h3>

                {/* Location */}
                <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">
                        {station_name || station_id || district || 'Bangkok'}
                    </span>
                </div>

                {/* Features */}
                <div className="flex items-center space-x-4 text-sm text-gray-600 pt-3 border-t border-gray-100">
                    {bedrooms > 0 && (
                        <div className="flex items-center space-x-1">
                            <HomeIcon className="w-4 h-4" />
                            <span>{bedrooms} Bed{bedrooms > 1 ? 's' : ''}</span>
                        </div>
                    )}
                    {bathrooms > 0 && (
                        <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                            </svg>
                            <span>{bathrooms} Bath{bathrooms > 1 ? 's' : ''}</span>
                        </div>
                    )}
                    {area > 0 && (
                        <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                            <span>{area} sqm</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ListingCard;
