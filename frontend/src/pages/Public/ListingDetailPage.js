import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { getMediaUrl } from '../../utils/media';

const ListingDetailPage = () => {
    const { id } = useParams();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await publicApi.getListing(id);
                setListing(response.data);
            } catch (error) {
                console.error('Failed to fetch listing:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id]);

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
        <div className="min-h-screen bg-gray-50">
            {/* Back button */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <Link
                    to="/listings"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to listings
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                            <div className="relative aspect-[16/10]">
                                <img
                                    src={
                                        hasImages
                                            ? getMediaUrl(images[currentImageIndex].url)
                                            : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
                                    }
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                />

                                {/* Navigation arrows */}
                                {hasImages && images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                                        >
                                            <ChevronLeftIcon className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                                        >
                                            <ChevronRightIcon className="w-6 h-6" />
                                        </button>
                                    </>
                                )}

                                {/* Image counter */}
                                {hasImages && (
                                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                        {currentImageIndex + 1} / {images.length}
                                    </div>
                                )}

                                {/* Badges */}
                                <div className="absolute top-4 left-4 flex space-x-2">
                                    <span className={`badge ${listing.listing_type === 'sale' ? 'bg-primary-500' : 'bg-secondary-500'
                                        } text-white`}>
                                        For {listing.listing_type === 'sale' ? 'Sale' : 'Rent'}
                                    </span>
                                    {listing.is_featured && (
                                        <span className="badge bg-yellow-500 text-white">Featured</span>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="absolute top-4 right-4 flex space-x-2">
                                    <button
                                        onClick={() => setIsFavorite(!isFavorite)}
                                        className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                                    >
                                        {isFavorite ? (
                                            <HeartSolidIcon className="w-6 h-6 text-red-500" />
                                        ) : (
                                            <HeartIcon className="w-6 h-6 text-gray-700" />
                                        )}
                                    </button>
                                    <button className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors">
                                        <ShareIcon className="w-6 h-6 text-gray-700" />
                                    </button>
                                </div>
                            </div>

                            {/* Thumbnail strip */}
                            {hasImages && images.length > 1 && (
                                <div className="flex p-4 space-x-2 overflow-x-auto">
                                    {images.map((img, index) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden ${index === currentImageIndex ? 'ring-2 ring-primary-500' : ''
                                                }`}
                                        >
                                            <img
                                                src={getMediaUrl(img.url)}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">{listing.title}</h1>

                            {/* Location */}
                            <div className="flex items-center text-gray-600 mb-6">
                                <MapPinIcon className="w-5 h-5 mr-2" />
                                <span>
                                    {listing.address || listing.district || 'Bangkok'}
                                    {listing.station_name && ` • Near ${listing.station_name}`}
                                </span>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">{listing.bedrooms || '-'}</div>
                                    <div className="text-sm text-gray-500">Bedrooms</div>
                                </div>
                                <div className="text-center border-x border-gray-200">
                                    <div className="text-2xl font-bold text-gray-900">{listing.bathrooms || '-'}</div>
                                    <div className="text-sm text-gray-500">Bathrooms</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">{listing.area || '-'}</div>
                                    <div className="text-sm text-gray-500">sqm</div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                                <p className="text-gray-600 whitespace-pre-line">
                                    {listing.description || 'No description provided.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Price Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                            <div className="text-3xl font-bold text-gray-900 mb-2">
                                {formatPrice(listing.price)}
                            </div>
                            {listing.listing_type === 'rent' && (
                                <div className="text-gray-500 mb-6">per month</div>
                            )}

                            {/* Contact Buttons */}
                            <div className="space-y-3">
                                <button className="btn-primary w-full flex items-center justify-center space-x-2">
                                    <PhoneIcon className="w-5 h-5" />
                                    <span>Call Agent</span>
                                </button>
                                <button className="btn-secondary w-full flex items-center justify-center space-x-2">
                                    <EnvelopeIcon className="w-5 h-5" />
                                    <span>Send Message</span>
                                </button>
                            </div>

                            {/* Agent Info */}
                            {listing.agent && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                            <span className="text-primary-600 font-bold">
                                                {listing.agent.name?.[0]?.toUpperCase() || 'A'}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{listing.agent.name}</div>
                                            <div className="text-sm text-gray-500">Real Estate Agent</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Station Badge */}
                        {((listing.station_id || listing.station_name) || (listing.station?.id || listing.station?.name_en)) && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-4">Nearby Transit</h3>
                                <Link
                                    to={`/listings?station_id=${listing.station_id || listing.station?.id}`}
                                    className="inline-flex items-center px-4 py-2 rounded-lg transition-colors"
                                    style={{
                                        backgroundColor: `${listing.station?.line_color || '#3b82f6'}15`,
                                        color: listing.station?.line_color || '#3b82f6'
                                    }}
                                >
                                    <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: listing.station?.line_color || '#3b82f6' }}
                                    ></div>
                                    <span className="font-medium">{listing.station_name || listing.station?.name_en || listing.station_id || listing.station?.id}</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDetailPage;
