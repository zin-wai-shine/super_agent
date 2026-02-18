import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    MapPinIcon,
    BookmarkIcon,
    LinkIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { getMediaUrl } from '../../utils/media';
import { TbTrain } from "react-icons/tb";
import { LiaBedSolid } from "react-icons/lia";
import { PiBathtub } from "react-icons/pi";
import { toast } from 'react-toastify';
import { saveListing, unsaveListing, checkIfSaved } from '../../services/savedListingsApi';
import PropertyShare from './PropertyShare';


const ListingCard = ({ listing, viewMode = 'grid', priceFormat = 'short' }) => {
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
    const [isSaved, setIsSaved] = React.useState(false);
    const [savingListing, setSavingListing] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();

    // Check if listing is saved on mount
    React.useEffect(() => {
        const checkSavedStatus = async () => {
            if (isAuthenticated && user) {
                try {
                    const response = await checkIfSaved(id);
                    setIsSaved(response.is_saved);
                } catch (error) {
                    console.error('Error checking saved status:', error);
                }
            }
        };
        checkSavedStatus();
    }, [id, isAuthenticated, user]);

    const handleToggleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Please login to save listings', {
                onClick: () => navigate('/login')
            });
            return;
        }

        setSavingListing(true);
        try {
            if (isSaved) {
                await unsaveListing(id);
                setIsSaved(false);
                toast.success('Property removed from saved listings');
            } else {
                await saveListing(id);
                setIsSaved(true);
                toast.success('Property saved successfully');
            }
        } catch (error) {
            console.error('Save listing error:', error);
            toast.error(error.error || error.message || 'Failed to update saved status');
        } finally {
            setSavingListing(false);
        }
    };

    const handleCopyLink = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const url = `${window.location.origin}/listings?detail=${id}`;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } else {
                // Fallback for non-secure contexts
                const textArea = document.createElement("textarea");
                textArea.value = url;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                textArea.style.top = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    toast.success('Link copied to clipboard');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } catch (err) {
                    console.error('Fallback copy failed', err);
                    toast.error('Failed to copy link');
                }
                document.body.removeChild(textArea);
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
            toast.error('Failed to copy link');
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
        if (priceFormat === 'short') {
            if (price >= 1000000) return (price / 1000000).toFixed(1) + 'M';
            if (price >= 1000) return (price / 1000).toFixed(0) + 'K';
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
                to={`/listings?detail=${id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100/50 flex flex-row group hover:shadow-lg transition-all duration-500 h-[135px] md:h-[190px] animate-fade-in-scale"
            >
                {/* Image Section */}
                <div className="w-[135px] md:w-[35%] h-full relative overflow-hidden flex-none">
                    <img
                        src={listingImages[currentImageIndex]}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />

                    {/* Badges Overlay */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
                        <div
                            className={`text-[12px] md:text-[13px] font-bold px-2.5 py-1 rounded-sm shadow-sm tracking-tight ${listing_type === 'sale' ? 'bg-primary-600 text-white' : 'bg-emerald-600 text-white'
                                }`}
                        >
                            {listing_type === 'sale' ? 'Sale' : 'Rent'}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-3 md:p-5 flex flex-col justify-between flex-1 min-w-0">
                    <div className="flex flex-col gap-1 md:gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-1 text-primary-600">
                                <span className="text-xl md:text-2xl font-black tracking-tight text-primary-600">{formatPrice(price)}</span>
                                <span className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest">{price_unit}</span>
                                {listing_type === 'rent' && <span className="text-[9px] md:text-[10px] font-bold text-gray-400">/mo</span>}
                            </div>
                            <span className="text-[9px] md:text-[10px] text-gray-300 font-mono opacity-60">#{id.slice(0, 5)}</span>
                        </div>

                        <div className="min-w-0 py-1">
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1 mb-1">
                                {title}
                            </h3>
                            <div className="flex items-center gap-2 text-[13px] text-gray-400">
                                <div className="flex items-center">
                                    <MapPinIcon className="w-[18px] h-[18px] mr-1 text-gray-300 shrink-0" />
                                    <span className="truncate">{district || 'Bangkok'}</span>
                                </div>
                                {nearestStation && (
                                    <>
                                        <div className="w-px h-3 bg-gray-200" />
                                        <div className="flex items-center">
                                            <TbTrain className="w-[18px] h-[18px] mr-1 text-gray-300 shrink-0" />
                                            <span className="truncate">{nearestStation}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                        {/* Features Row */}
                        <div className="flex items-center gap-5">
                            <div className="flex items-center gap-2">
                                <LiaBedSolid className="w-[18px] h-[18px] text-gray-400" />
                                <span className="text-[13px] font-bold text-gray-700">{bedrooms}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <PiBathtub className="w-[18px] h-[18px] text-gray-400" />
                                <span className="text-[13px] font-bold text-gray-700">{bathrooms}</span>
                            </div>
                            {area > 0 && (
                                <div className="hidden md:flex items-center gap-2">
                                    <span className="text-[13px] font-bold text-gray-400 leading-none">M²</span>
                                    <span className="text-[13px] font-bold text-gray-700 tabular-nums leading-none">{area}</span>
                                </div>
                            )}
                        </div>

                        {/* Labeled Actions in List View */}
                        <div className="flex items-center gap-1 md:gap-3">
                            <button
                                onClick={handleToggleSave}
                                disabled={savingListing}
                                className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-all text-gray-400 hover:text-primary-600 disabled:opacity-50"
                            >
                                {isSaved ? (
                                    <BookmarkSolidIcon className="w-4 h-4 text-primary-600" />
                                ) : (
                                    <BookmarkIcon className="w-4 h-4" />
                                )}
                                <span className="text-[13px] font-bold capitalize">Save</span>
                            </button>

                            <PropertyShare
                                property={{
                                    id, title,
                                    description: `${bedrooms} Bed, ${bathrooms} Bath, ${area} sqm property in ${district || 'Bangkok'}`,
                                    image: featuredImage
                                }}
                                className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-900"
                                showLabel={true}
                                labelClassName="text-[13px] font-bold capitalize"
                            />

                            <button
                                onClick={handleCopyLink}
                                className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-900 min-w-[70px] justify-center"
                            >
                                {copied && location.pathname === '/listings' ? (
                                    <span className="text-[13px] font-bold text-emerald-600 capitalize">Link Copied</span>
                                ) : (
                                    <>
                                        <LinkIcon className="w-4 h-4" />
                                        <span className="text-[13px] font-bold capitalize">Copy link</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link
            to={`/listings?detail=${id}`}
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
                        <div className="bg-amber-400 text-white text-[11px] md:text-[12px] font-black px-2.5 py-1 rounded-sm shadow-md tracking-wider">
                            Featured
                        </div>
                    )}
                    <div
                        className={`text-[11px] md:text-[12px] font-bold px-2.5 py-1 rounded-sm shadow-sm tracking-tight ${listing_type === 'sale' ? 'bg-primary-600 text-white' : 'bg-emerald-600 text-white'
                            }`}
                    >
                        {listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                    </div>
                </div>

                {/* Date Badge - Minimalist bottom right */}
                <div className="absolute bottom-3 right-3 bg-black/30 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider border border-white/10">
                    {formatRelativeTime(created_at)}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col gap-1.5">
                {/* Price and ID Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1 text-primary-600">
                        <span className="text-xl font-black tracking-tight">{formatPrice(price)}</span>
                        <span className="text-[10px] font-bold text-gray-400 tracking-wide">{price_unit}</span>
                        {listing_type === 'rent' && <span className="text-[10px] font-bold text-gray-400">/mo</span>}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium font-mono tracking-tighter tabular-nums opacity-60">#{id.slice(0, 5)}</span>
                </div>

                {/* Title */}
                <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-[1.3] h-[2.6em]">
                    {title}
                </h3>

                {/* Information Rows */}
                <div className="space-y-1">
                    {/* Redesigned Info Rows */}
                    <div className="space-y-1.5 mb-3">
                        <div className="flex items-center text-[13px] text-gray-400">
                            <MapPinIcon className="w-[18px] h-[18px] mr-1 text-gray-300 shrink-0" />
                            <span className="truncate">{district || 'Bangkok'}</span>
                            {nearestStation && (
                                <>
                                    <div className="mx-2 w-px h-3 bg-gray-200" />
                                    <TbTrain className="w-[18px] h-[18px] mr-1 text-gray-300 shrink-0" />
                                    <span className="truncate">{nearestStation}</span>
                                </>
                            )}
                        </div>

                        {/* Stats Refined Row */}
                        <div className="flex items-center gap-6 py-1">
                            <div className="flex items-center gap-2" title="Bedrooms">
                                <LiaBedSolid className="w-[18px] h-[18px] text-gray-400" />
                                <span className="text-[13px] font-bold text-gray-700 tabular-nums">{bedrooms}</span>
                            </div>
                            <div className="flex items-center gap-2" title="Bathrooms">
                                <PiBathtub className="w-[18px] h-[18px] text-gray-400" />
                                <span className="text-[13px] font-bold text-gray-700 tabular-nums">{bathrooms}</span>
                            </div>
                            {area > 0 && (
                                <div className="flex items-center gap-2" title="Area">
                                    <span className="text-[13px] font-bold text-gray-300 tracking-tighter w-[18px] text-center">M²</span>
                                    <span className="text-[13px] font-bold text-gray-700 tabular-nums">{area}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Redesigned Footer Action Bar */}
                <div className="pt-2 mt-1 border-t border-gray-50">
                    <div className="flex items-center flex-1">
                        {/* Save Action */}
                        <button
                            onClick={handleToggleSave}
                            disabled={savingListing}
                            className="flex-1 flex items-center justify-start gap-1.5 py-1 rounded-lg transition-all text-gray-500 hover:text-primary-600 group/action disabled:opacity-50"
                        >
                            {isSaved ? (
                                <BookmarkSolidIcon className="w-4 h-4 text-primary-600 animate-in zoom-in-75 duration-300" />
                            ) : (
                                <BookmarkIcon className="w-4 h-4 group-hover/action:scale-110 transition-transform duration-300" />
                            )}
                            <span className="text-[10px] font-bold capitalize tracking-wider">{isSaved ? 'Saved' : 'Save'}</span>
                        </button>

                        <PropertyShare
                            property={{
                                id,
                                title,
                                description: `${bedrooms} Bed, ${bathrooms} Bath, ${area} sqm property in ${district || 'Bangkok'}`,
                                image: featuredImage
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1 rounded-lg transition-all text-gray-500 hover:text-primary-600 group/action"
                            showLabel={true}
                            labelClassName="text-[10px] font-bold capitalize tracking-wider group-hover/action:text-primary-600 transition-colors"
                            iconClassName="w-4 h-4 text-gray-500 group-hover/action:text-primary-600 transition-all duration-300 group-hover/action:scale-110"
                        />

                        {/* Copy Link Action */}
                        <button
                            onClick={handleCopyLink}
                            className="flex-1 flex items-center justify-end gap-1.5 py-1 rounded-lg transition-all text-gray-500 hover:text-primary-600 group/action"
                        >
                            <LinkIcon className="w-4 h-4 group-hover/action:scale-110 transition-transform duration-300" />
                            <span className="text-[10px] font-bold capitalize tracking-wider whitespace-nowrap">
                                {(copied && location.pathname === '/listings') ? 'Link Copied' : 'Copy link'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ListingCard;
