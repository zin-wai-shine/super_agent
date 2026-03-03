import React from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
    MapPinIcon,
    BookmarkIcon,
    HeartIcon,
    StarIcon,
    ShareIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import {
    BookmarkIcon as BookmarkSolidIcon,
    HeartIcon as HeartSolidIcon,
    StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { getMediaUrl } from '../../utils/media';
import { TbTrain } from "react-icons/tb";

import { saveListing, unsaveListing, checkIfSaved } from '../../services/savedListingsApi';
import { PHOTO_ROOM_TYPES } from '../../services/api';

const ListingCard = ({ listing = {}, viewMode = 'grid', priceFormat = 'short', showSave = true, to, onSaveToggle, initialSaved = false, cardClassName = '', index = 0 }) => {
    if (!listing || Object.keys(listing).length === 0 || !listing.id) return null; // Defensive check for undefined listings
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
        distance_to_station,
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

    // Order images by session: Bedroom first, then Living Room, then rest (same as detail page)
    const listingImages = React.useMemo(() => {
        const images = media.filter(m => m.type === 'image');
        if (!images.length) return featuredImage ? [featuredImage] : [];
        const order = (rt) => {
            const i = PHOTO_ROOM_TYPES.indexOf(rt && rt.trim() ? rt.trim() : 'Additional Photos');
            return i >= 0 ? i : PHOTO_ROOM_TYPES.length;
        };
        const sorted = [...images].sort((a, b) => order(a.room_type) - order(b.room_type));
        return sorted.map(m => getMediaUrl(m.url));
    }, [media, featuredImage]);

    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const dragStartRef = React.useRef(null);
    const didDragRef = React.useRef(false);
    const cardImageSwipeRef = React.useRef(null);
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

    // Non-passive touch listener so we can preventDefault on horizontal swipe (enables drag-to-switch on mobile)
    React.useEffect(() => {
        const el = cardImageSwipeRef.current;
        if (!el || listingImages.length <= 1) return;
        const onMove = (e) => {
            const start = dragStartRef.current;
            if (!start || e.touches.length === 0) return;
            const deltaX = Math.abs(e.touches[0].clientX - start.x);
            const deltaY = Math.abs(e.touches[0].clientY - start.y);
            if (deltaX > 40 && deltaX > deltaY && e.cancelable) e.preventDefault();
        };
        el.addEventListener('touchmove', onMove, { passive: false });
        return () => el.removeEventListener('touchmove', onMove);
    }, [listingImages.length]);

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

    const nearestStationName = (station?.name_en || station_name || '').split('(')[0].trim() || '';
    const stationWithDistance = nearestStationName && (distance_to_station != null && distance_to_station !== '' && Number(distance_to_station) >= 0)
        ? `${nearestStationName} (${Number(distance_to_station)}m)`
        : nearestStationName;

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
    const linkTo = to || `/listings/${id}`;

    // --- RENDER LOGIC ---
    const renderUnifiedCard = (cardLink) => {
        const isSavedMode = viewMode === 'saved-grid';

        const animationStyle = { animationDelay: `${index * 50}ms`, animationFillMode: 'both' };
        const animationClass = 'animate-in fade-in slide-in-from-bottom-4 duration-500';

        if (isSavedMode || isListView) {
            return (
                <div
                    className={`bg-white rounded-none overflow-hidden group ${animationClass}`}
                    style={animationStyle}
                >
                    <div className="relative aspect-[5/4.2] md:aspect-[5/4.7] rounded-[23px] overflow-hidden mb-2">
                        <Link to={cardLink}>

                            <img
                                src={listingImages[0]}
                                alt={title}
                                className="h-full w-full object-cover md:group-hover:scale-105 transition-transform duration-700"
                            />
                        </Link>

                        {/* Status Badge (Rent/Sale) — smaller on mobile for Favorites */}
                        <div className="absolute top-3.5 left-3.5">
                            <span className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] md:text-[11px] font-medium text-gray-900 shadow-sm">
                                {listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                            </span>
                        </div>

                        {showSave && (
                            <button
                                onClick={handleToggleSave}
                                disabled={savingListing}
                                className="absolute top-3 right-3 z-10 p-1 active:scale-95"
                            >
                                {isSaved ? (
                                    <HeartSolidIcon className="w-8 h-8 text-rose-500 stroke-white stroke-[2px] drop-shadow-md" />
                                ) : (
                                    <HeartSolidIcon className="w-8 h-8 text-slate-800/40 stroke-white stroke-[2px] drop-shadow-md" />
                                )}
                            </button>
                        )}
                    </div>

                    <div className="px-1.5 py-2">
                        <Link to={cardLink} className="block group/link">
                            <h3 className="text-[15px] md:text-[13px] font-medium text-slate-900 line-clamp-1 leading-snug md:group-hover:text-primary-600 transition-colors">
                                {title}
                            </h3>
                            <div className="mt-1 flex flex-col gap-0.5">
                                <p className="text-[15px] md:text-[13px] text-gray-500 font-medium">
                                    {bedrooms} Bed · {bathrooms} Bath
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            );
        }

        const SWIPE_THRESHOLD = 40;
        const handleCardImageDragStart = (clientX, clientY) => {
            dragStartRef.current = { x: clientX, y: clientY };
            didDragRef.current = false;
        };
        const handleCardImageDragMove = (e, clientX, clientY) => {
            const start = dragStartRef.current;
            if (!start) return;
            const deltaX = Math.abs(clientX - start.x);
            const deltaY = Math.abs(clientY - start.y);
            if (deltaX > 15 && deltaX > deltaY) didDragRef.current = true;
            if (deltaX > SWIPE_THRESHOLD && deltaX > deltaY && e?.cancelable) e.preventDefault();
        };
        const handleCardImageDragEnd = (e, clientX, clientY) => {
            const start = dragStartRef.current;
            if (!start || listingImages.length <= 1) {
                dragStartRef.current = null;
                return;
            }
            const deltaX = clientX - start.x;
            const deltaY = clientY - start.y;
            if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
                didDragRef.current = true;
                if (e && e.cancelable) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (deltaX > 0) {
                    setCurrentImageIndex(i => (i - 1 + listingImages.length) % listingImages.length);
                } else {
                    setCurrentImageIndex(i => (i + 1) % listingImages.length);
                }
            }
            dragStartRef.current = null;
        };

        return (
            <div
                className={`group relative flex flex-col transition-all duration-300 ${cardClassName} animate-in fade-in slide-in-from-bottom-4 duration-500`}
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
                <div className="flex flex-col w-full bg-white rounded-none border-none">
                    <Link
                        to={cardLink}

                        className="relative aspect-[4/3.8] md:aspect-[4/3.5] w-full overflow-hidden rounded-[23px] block"
                        onClick={(e) => { if (didDragRef.current) { e.preventDefault(); didDragRef.current = false; } }}
                    >
                        <div
                            ref={cardImageSwipeRef}
                            className="flex h-full w-full"
                            style={{
                                width: `${listingImages.length * 100}%`,
                                transform: `translateX(-${(currentImageIndex / listingImages.length) * 100}%)`,
                                transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                touchAction: 'pan-y',
                            }}
                            onTouchStart={(e) => handleCardImageDragStart(e.touches[0].clientX, e.touches[0].clientY)}
                            onTouchMove={(e) => { handleCardImageDragMove(e, e.touches[0].clientX, e.touches[0].clientY); }}
                            onTouchEnd={(e) => handleCardImageDragEnd(e, e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
                            onMouseDown={(e) => handleCardImageDragStart(e.clientX, e.clientY)}
                            onMouseMove={(e) => { if (dragStartRef.current) handleCardImageDragMove(null, e.clientX, e.clientY); }}
                            onMouseUp={(e) => handleCardImageDragEnd(e.clientX, e.clientY)}
                            onMouseLeave={() => { dragStartRef.current = null; }}
                        >
                            {listingImages.map((src, i) => (
                                <div key={i} className="flex-shrink-0 w-full h-full overflow-hidden" style={{ width: `${100 / listingImages.length}%` }}>
                                    <img
                                        src={src}
                                        alt={title}
                                        className="h-full w-full object-cover md:group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-3.5 left-3.5">
                            <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[15px] md:text-[12px] font-semibold text-gray-900 shadow-sm">
                                {is_featured ? 'Featured' : (listing_type === 'rent' ? 'For Rent' : 'For Sale')}
                            </span>
                        </div>

                        {listingImages.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); didDragRef.current = true; setCurrentImageIndex(i => (i - 1 + listingImages.length) % listingImages.length); }}
                                    className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 md:hover:bg-white text-gray-800 shadow-md border border-gray-200/80 items-center justify-center active:scale-95 transition-all opacity-0 md:group-hover:opacity-100 duration-200"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeftIcon className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); didDragRef.current = true; setCurrentImageIndex(i => (i + 1) % listingImages.length); }}
                                    className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 md:hover:bg-white text-gray-800 shadow-md border border-gray-200/80 items-center justify-center active:scale-95 transition-all opacity-0 md:group-hover:opacity-100 duration-200"
                                    aria-label="Next image"
                                >
                                    <ChevronRightIcon className="w-5 h-5" />
                                </button>
                            </>
                        )}

                        {showSave && (
                            <button
                                onClick={handleToggleSave}
                                disabled={savingListing}
                                className="absolute top-3 right-3 z-10 p-1 active:scale-95"
                            >
                                {isSaved ? (
                                    <HeartSolidIcon className="w-8 h-8 text-rose-500 stroke-white stroke-[2px] drop-shadow-md" />
                                ) : (
                                    <HeartSolidIcon className="w-8 h-8 text-slate-800/40 stroke-white stroke-[2px] drop-shadow-md" />
                                )}
                            </button>
                        )}

                        {listingImages.length > 1 && (
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 z-10">
                                {[0, 1, 2, 3, 4].map((i) => {
                                    const isCenter = i === 2;
                                    const imageIndex = currentImageIndex - 2 + i;
                                    const inRange = imageIndex >= 0 && imageIndex < listingImages.length;
                                    return (
                                        <div
                                            key={i}
                                            className={`w-1.5 h-1.5 rounded-full transition-all flex-shrink-0 ${isCenter ? 'bg-white scale-110' : inRange ? 'bg-white/60' : 'bg-white/30'
                                                }`}
                                            aria-hidden
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </Link>

                    <Link to={cardLink} className="py-3 px-1.5 flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                            <h3 className="text-[15px] md:text-[16px] font-semibold text-slate-900 truncate md:group-hover:text-primary-600 transition-colors">{title}</h3>
                        </div>

                        <div className="text-[15px] md:text-[14px] text-gray-500 flex items-center gap-1.5 mb-0.5">
                            <MapPinIcon className="w-4 h-4 md:w-3.5 md:h-3.5" />
                            <span className="truncate">{district || 'Bangkok'}</span>
                            {nearestStationName && (
                                <>
                                    <span className="text-gray-300">·</span>
                                    <span className="truncate font-medium text-gray-600">{nearestStationName}</span>
                                </>
                            )}
                        </div>

                        <p className="text-[15px] md:text-[14px] text-gray-500">
                            {bedrooms} Bed · {bathrooms} Bath · {area} Sqm
                        </p>

                        {created_at && (
                            <p className="text-[15px] md:text-[14px] text-gray-400 mt-0.5">
                                {new Date(created_at).toLocaleDateString('en-GB')}
                            </p>
                        )}

                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-[15px] md:text-[14.5px] font-semibold text-gray-900">฿{formatPrice(price)}</span>
                            <span className="text-[15px] md:text-[13px] text-gray-500">{listing_type === 'rent' ? '/ mo' : ''}</span>
                        </div>
                    </Link>
                </div>
            </div>
        );
    };

    // List view: horizontal row (image left, content right)
    if (isListView) {
        return (
            <div
                className={`group bg-white rounded-none border-b border-gray-100 flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500 ${cardClassName}`}
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
                <div className="p-4 flex gap-5">
                    <Link to={linkTo} className="relative aspect-[4/3.5] w-40 sm:w-48 overflow-hidden rounded-[23px] flex-shrink-0">

                        <img
                            src={listingImages[0]}
                            alt={title}
                            className="h-full w-full object-cover md:group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-3.5 left-3.5 z-10">
                            <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                                <span className="text-[12px] font-semibold text-gray-900">{listing_type === 'sale' ? 'For Sale' : 'For Rent'}</span>
                            </div>
                        </div>
                        {showSave && (
                            <button
                                onClick={handleToggleSave}
                                disabled={savingListing}
                                className="absolute top-2 right-2 z-10 p-1 active:scale-95"
                            >
                                {isSaved ? (
                                    <HeartSolidIcon className="w-8 h-8 text-rose-500 stroke-white stroke-[2px] drop-shadow-md" />
                                ) : (
                                    <HeartSolidIcon className="w-8 h-8 text-slate-800/40 stroke-white stroke-[2px] drop-shadow-md" />
                                )}
                            </button>
                        )}
                    </Link>
                    <div className="flex-1 py-1 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <Link to={linkTo}>
                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 md:hover:text-primary-600 transition-colors">{title}</h3>
                                </Link>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <MapPinIcon className="w-4 h-4" />
                                <span className="truncate">{district || 'Bangkok'}</span>
                                {stationWithDistance && (
                                    <>
                                        <span className="text-gray-300">·</span>
                                        <span className="truncate">{stationWithDistance}</span>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-4 text-sm text-gray-600">
                                <span>{bedrooms} Bed</span>
                                <span>{bathrooms} Bath</span>
                                <span>{area} sqm</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-end">
                            <p className="text-[16px] font-semibold text-gray-900">
                                ฿{formatPrice(price)}
                                <span className="text-sm font-normal text-gray-500">{listing_type === 'rent' ? '/mo' : ''}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Map view and grid: same card design as list page (image on top, details below)
    return renderUnifiedCard(linkTo);
};

export default ListingCard;
