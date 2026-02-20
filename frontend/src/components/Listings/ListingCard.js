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
import { MdOutlineBookmarkAdded, MdOutlineBookmarkBorder } from "react-icons/md";
import { TbTrain } from "react-icons/tb";
import { LiaBedSolid } from "react-icons/lia";
import { PiBathtub } from "react-icons/pi";

import { saveListing, unsaveListing, checkIfSaved } from '../../services/savedListingsApi';
import PropertyShare from './PropertyShare';


const ListingCard = ({ listing, viewMode = 'grid', priceFormat = 'short', showSave = true, to }) => {
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
            navigate('/login', { state: { from: { pathname: location.pathname } } });
            return;
        }

        setSavingListing(true);
        try {
            if (isSaved) {
                await unsaveListing(id);
                setIsSaved(false);
            } else {
                await saveListing(id);
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Save listing error:', error);
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
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }
                document.body.removeChild(textArea);
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
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

    if (isListView) {
        return (
            <Link
                to={to || `/listings?detail=${id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100/50 flex flex-row group hover:shadow-lg transition-all duration-500 h-[135px] md:h-[190px] animate-fade-in-scale"
            >
                {/* Image Section */}
                <div className="w-[135px] md:w-[35%] h-full relative overflow-hidden flex-none">
                    <img
                        src={listingImages[currentImageIndex]}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />

                    <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
                        <div className="text-[12px] md:text-[13px] font-bold px-2.5 py-1 rounded-[3px] bg-[#2f3e46]/90 backdrop-blur-md text-white shadow-sm tracking-tight">
                            {listing_type === 'sale' ? 'Sale' : 'Rent'}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-4 md:p-6 flex flex-col flex-1 min-w-0">
                    <div className="flex flex-col gap-2">
                        {/* Price Row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-1 text-gray-900">
                                <span className="text-xl md:text-2xl font-black tracking-tight">{formatPrice(price)}</span>
                                <span className="text-[10px] md:text-[11px] font-bold text-gray-400 tracking-wide">{price_unit}</span>
                                {listing_type === 'rent' && <span className="text-[9px] md:text-[10px] font-bold text-gray-400">/mo</span>}
                            </div>
                            <span className="text-[10px] md:text-[11px] text-gray-300 font-mono">#{id.slice(0, 5)}</span>
                        </div>

                        {/* Title - Dark text with primary hover */}
                        <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                            {title}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-[13px] md:text-[14px] text-gray-400 mb-1">
                            <div className="flex items-center">
                                <MapPinIcon className="w-4 h-4 mr-1 text-gray-300 shrink-0" />
                                <span className="truncate">{district || 'Bangkok'}</span>
                            </div>
                            {nearestStation && (
                                <>
                                    <div className="w-px h-3 bg-gray-200" />
                                    <div className="flex items-center">
                                        <TbTrain className="w-4 h-4 mr-1 text-gray-300 shrink-0" />
                                        <span className="truncate">{nearestStation}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                        {/* Stats Row */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-1.5">
                                <LiaBedSolid className="w-5 h-5 text-gray-400" />
                                <span className="text-[14px] font-bold text-gray-700">{bedrooms}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <PiBathtub className="w-5 h-5 text-gray-400" />
                                <span className="text-[14px] font-bold text-gray-700">{bathrooms}</span>
                            </div>
                            {area > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[13px] font-bold text-gray-400">M²</span>
                                    <span className="text-[14px] font-bold text-gray-700">{area}</span>
                                </div>
                            )}
                        </div>

                        {/* Actions aligned to right in List View */}
                        <div className="flex items-center gap-4">
                            {showSave && (
                                <button
                                    onClick={handleToggleSave}
                                    disabled={savingListing}
                                    className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 transition-colors"
                                >
                                    {isSaved ? (
                                        <MdOutlineBookmarkAdded className="w-[24px] h-[24px] text-emerald-500 drop-shadow-md" />
                                    ) : (
                                        <MdOutlineBookmarkBorder className="w-[24px] h-[24px] transition-transform duration-300 hover:scale-110" />
                                    )}
                                    <span className="text-[13px] font-medium hidden sm:inline transition-colors">
                                        {isSaved ? 'Saved' : 'Save'}
                                    </span>
                                </button>
                            )}

                            <PropertyShare
                                property={{
                                    id, title,
                                    description: `${bedrooms} Bed, ${bathrooms} Bath, ${area} sqm property in ${district || 'Bangkok'}`,
                                    image: featuredImage
                                }}
                                className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 transition-colors"
                                showLabel={true}
                                labelClassName="text-[13px] font-medium hidden sm:inline"
                                iconClassName="w-4 h-4"
                            />

                            <button
                                onClick={handleCopyLink}
                                className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 transition-colors min-w-[30px] sm:min-w-[80px] justify-end"
                            >
                                <LinkIcon className="w-4 h-4" />
                                <span className="text-[13px] font-medium hidden sm:inline">
                                    {copied && location.pathname === '/listings' ? 'Copied' : 'Copy Link'}
                                </span>
                            </button>
                        </div>
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
                        <div className="bg-[#2f3e46]/90 backdrop-blur-md text-white text-[11px] md:text-[12px] font-black px-2.5 py-1 rounded-[3px] shadow-md tracking-wider">
                            Featured
                        </div>
                    )}
                    <div className="text-[11px] md:text-[12px] font-bold px-2.5 py-1 rounded-[3px] bg-[#2f3e46]/90 backdrop-blur-md text-white shadow-sm tracking-tight">
                        {listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                    </div>
                </div>

                {/* Date Badge - Minimalist bottom right */}
                <div className="absolute bottom-3 right-3 bg-[#2f3e46]/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-[3px] tracking-wider border border-white/10">
                    {formatRelativeTime(created_at)}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col gap-3">
                {/* Price and ID Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1 text-gray-900">
                        <span className="text-2xl font-black tracking-tight">{formatPrice(price)}</span>
                        <span className="text-[11px] font-bold text-gray-400 tracking-wide">{price_unit}</span>
                        {listing_type === 'rent' && <span className="text-[11px] font-bold text-gray-400">/mo</span>}
                    </div>
                    <span className="text-[11px] text-gray-300 font-mono tracking-tighter opacity-60">#{id.slice(0, 5)}</span>
                </div>

                {/* Title - Dark with primary hover */}
                <h3 className="text-[17px] font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-[1.3] h-[2.6em]">
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
                    <div className="flex items-center gap-8 pb-1">
                        <div className="flex items-center gap-2.5">
                            <LiaBedSolid className="w-5 h-5 text-gray-700" />
                            <span className="text-[14px] font-bold text-gray-700">{bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <PiBathtub className="w-5 h-5 text-gray-700" />
                            <span className="text-[14px] font-bold text-gray-700">{bathrooms}</span>
                        </div>
                        {area > 0 && (
                            <div className="flex items-center gap-2.5">
                                <span className="text-[13px] font-bold text-gray-700 tracking-tighter">M²</span>
                                <span className="text-[14px] font-bold text-gray-700">{area}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Redesigned Footer Action Bar */}
                <div className="pt-4 mt-1 border-t border-gray-100/60">
                    <div className="flex items-center justify-between w-full">
                        {/* Save Action */}
                        {showSave && (
                            <button
                                onClick={handleToggleSave}
                                disabled={savingListing}
                                className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-all disabled:opacity-50 w-[68px]"
                            >
                                {isSaved ? (
                                    <MdOutlineBookmarkAdded className="w-[18px] h-[18px] text-emerald-500" />
                                ) : (
                                    <MdOutlineBookmarkBorder className="w-[18px] h-[18px] transition-colors duration-300 hover:scale-110" />
                                )}
                                <span className={`text-[12px] font-medium transition-colors ${isSaved ? 'text-emerald-600' : 'text-gray-700'}`}>
                                    {isSaved ? 'Saved' : 'Save'}
                                </span>
                            </button>
                        )}

                        {/* Share Action */}
                        <PropertyShare
                            property={{
                                id,
                                title,
                                description: `${bedrooms} Bed, ${bathrooms} Bath, ${area} sqm property in ${district || 'Bangkok'}`,
                                image: featuredImage
                            }}
                            className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-all w-[68px]"
                            showLabel={true}
                            labelClassName="text-[12px] font-medium"
                            iconClassName="w-4 h-4 text-gray-700 group-hover:text-primary-600 transition-colors"
                        />

                        {/* Copy Link Action */}
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-all w-[92px]"
                        >
                            <LinkIcon className="w-4 h-4 text-gray-700 group-hover:text-primary-600 transition-colors" />
                            <span className="text-[12px] font-medium whitespace-nowrap">
                                {copied ? 'Copied' : 'Copy Link'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ListingCard;
