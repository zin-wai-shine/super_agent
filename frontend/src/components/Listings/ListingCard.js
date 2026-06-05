import React from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
    MapPinIcon,
    BookmarkIcon,
    StarIcon,
    ShareIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import {
    BookmarkIcon as BookmarkSolidIcon,
    StarIcon as StarSolidIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon as MapPinSolidIcon,
    GlobeAltIcon
} from '@heroicons/react/24/solid';
import { SiLine, SiFacebook, SiInstagram, SiLinkedin } from 'react-icons/si';
import { BsHeart, BsFillHeartFill } from 'react-icons/bs';
import Modal from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useTranslation } from 'react-i18next';
import { getMediaUrl } from '../../utils/media';
import { TbTrain, TbHandFinger } from "react-icons/tb";
import { MdOutlineDirectionsTransit } from "react-icons/md";

import { saveListing, unsaveListing, checkIfSaved } from '../../services/savedListingsApi';
import { PHOTO_ROOM_TYPES } from '../../services/api';
import { formatDistance, formatBedrooms } from '../../utils/format';
import { useDynamicTranslation } from '../../hooks/useDynamicTranslation';

const HeartButton = ({ isSaved, onClick, disabled, className, iconClassName = "w-[32px] h-[32px] md:w-[26px] md:h-[26px]" }) => {
    const [animate, setAnimate] = React.useState(false);
    const [showSaved, setShowSaved] = React.useState(false);
    const [isFlashing, setIsFlashing] = React.useState(false);

    const handleClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (disabled) return;
        
        // Trigger animation only when saving
        if (!isSaved) {
            setAnimate(true);
            setShowSaved(true);
            setIsFlashing(true);
            setTimeout(() => setAnimate(false), 850);
            setTimeout(() => setShowSaved(false), 1200);
            setTimeout(() => setIsFlashing(false), 400);
        }
        onClick(e);
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={`relative flex items-center justify-center transition-all active:scale-90 hover:scale-105 ${className}`}
        >
            {/* Flash Effect */}
            {isFlashing && (
                <div className="absolute inset-[-4px] bg-rose-500/20 dark:bg-rose-500/30 rounded-full animate-heart-flash blur-sm" />
            )}
            {/* YouTube-style Saved Tooltip */}
            {showSaved && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none z-[100] animate-saved-tooltip">
                    <span className="bg-[#222222]/90 text-white text-[12px] px-2.5 py-1 rounded-full whitespace-nowrap shadow-xl font-medium border border-white/10">
                        Saved
                    </span>
                </div>
            )}

            {/* Particles (Dots and Sparkles) */}
            {animate && (
                <>
                    {/* Dots */}
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div 
                            key={`dot-${i}`} 
                            className={`heart-particle heart-dot-active-${i} ${i % 2 === 0 ? 'bg-rose-500' : 'bg-amber-400'}`} 
                        />
                    ))}
                    {/* Sparkles */}
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div 
                            key={`sparkle-${i}`} 
                            className={`heart-particle heart-sparkle heart-sparkle-active-${i} ${i % 2 === 0 ? 'bg-pink-400' : 'bg-white'}`} 
                        />
                    ))}
                </>
            )}

            <div className={animate ? 'heart-pop-active' : ''}>
                {isSaved ? (
                    <BsFillHeartFill className={`text-rose-500 drop-shadow-md transition-colors duration-300 ${iconClassName}`} />
                ) : (
                    <BsFillHeartFill 
                        className={`drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] transition-colors duration-300 ${iconClassName}`}
                        style={{ 
                            color: 'rgba(0, 0, 0, 0.55)', 
                            stroke: '#ffffff', 
                            strokeWidth: '1px',
                            paintOrder: 'stroke',
                            overflow: 'visible'
                        }}
                    />
                )}
            </div>
        </button>
    );
};

// Internal component for smooth, flicker-free image loading
const GracefulImage = ({ src, alt, className, shouldLoad = true, onReady }) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);
    const imgRef = React.useRef(null);
    const onReadyRef = React.useRef(onReady);
    
    // Keep ref up to date
    React.useEffect(() => {
        onReadyRef.current = onReady;
    }, [onReady]);

    const markReady = React.useCallback(() => {
        setIsLoaded(true);
        onReadyRef.current?.();
    }, []);

    const handleError = React.useCallback(() => {
        setHasError(true);
        markReady();
    }, [markReady]);

    // Check if image is already cached (instant display)
    React.useEffect(() => {
        if (!shouldLoad) return;
        if (!src) {
            handleError();
            return;
        }
        
        // Check browser cache immediately
        const img = new Image();
        img.src = src;
        if (img.complete && img.naturalWidth > 0) {
            markReady();
        }
    }, [src, shouldLoad, markReady, handleError]);

    return (
        <div className="relative w-full h-full bg-[#f7f7f7] dark:bg-white/5 overflow-hidden">
            {shouldLoad && !hasError && (
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    onLoad={markReady}
                    onError={handleError}
                    decoding="async"
                    className={`${className} transition-opacity duration-500 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                />
            )}
            
            {/* Error state fallback */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-white/5">
                    <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            )}
            
            {/* Shimmer Placeholder */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200/60 via-gray-100/60 to-gray-200/60 dark:from-white/5 dark:via-white/10 dark:to-white/5 animate-pulse" />
            )}
        </div>
    );
};

export const ListingCardSkeleton = ({ viewMode = 'grid' }) => {
    const isListView = viewMode === 'list';
    
    if (isListView) {
        return (
            <div className="p-4 flex gap-5 border-b border-gray-100 dark:border-white/10">
                <div className="w-40 sm:w-48 aspect-[4/3.8] rounded-[23px] bg-gray-200 dark:bg-white/5 animate-pulse flex-shrink-0" />
                <div className="flex-1 py-1 space-y-3">
                    <div className="h-5 bg-gray-200 dark:bg-white/5 rounded-md w-3/4 animate-pulse" />
                    <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-md w-1/2 animate-pulse" />
                    <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-md w-1/3 animate-pulse" />
                    <div className="pt-2 h-6 bg-gray-200 dark:bg-white/5 rounded-md w-1/4 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="aspect-[4/3.7] md:aspect-[4/3.3] w-full rounded-[32px] md:rounded-[23px] bg-gray-200 dark:bg-white/5 animate-pulse" />
            <div className="px-1.5 space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-white/5 rounded-md w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-md w-1/2 animate-pulse" />
                <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-md w-1/4 animate-pulse" />
            </div>
        </div>
    );
};

export const ListingImageSlider = ({ images, title, cardLink, arrowPadding = '3', initialIndex = 0, onImageClick, isGalleryMode = false, showArrows = true, showDots = true, shouldLoadFirst = false, onFirstImageReady }) => {
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
    const [loadOthers, setLoadOthers] = React.useState(false);
    const [showIndicator, setShowIndicator] = React.useState(() => {
        return !localStorage.getItem('has_experienced_swipe');
    });
    const scrollRef = React.useRef(null);
    const isManualScrolling = React.useRef(false);

    const markAsExperienced = () => {
        if (!localStorage.getItem('has_experienced_swipe')) {
            localStorage.setItem('has_experienced_swipe', 'true');
            window.dispatchEvent(new CustomEvent('listing:swiped'));
        }
    };

    React.useEffect(() => {
        const handleGlobalSwipe = () => setShowIndicator(false);
        window.addEventListener('listing:swiped', handleGlobalSwipe);
        
        // Initial scroll to index if provided
        if (initialIndex > 0 && scrollRef.current) {
            const timeout = setTimeout(() => {
                scrollToImage(initialIndex);
            }, 50);
            return () => {
                clearTimeout(timeout);
                window.removeEventListener('listing:swiped', handleGlobalSwipe);
            };
        }

        return () => window.removeEventListener('listing:swiped', handleGlobalSwipe);
    }, [initialIndex]);

    const handleScroll = () => {
        if (!scrollRef.current || isManualScrolling.current) return;
        setLoadOthers(true); // User interacted, load all
        const scrollLeft = scrollRef.current.scrollLeft;
        const width = scrollRef.current.offsetWidth;
        const newIndex = Math.round(scrollLeft / width);
        if (newIndex !== currentIndex) {
            setCurrentIndex(newIndex);
            markAsExperienced();
        }
    };

    const scrollToImage = (index, e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (!scrollRef.current) return;

        setLoadOthers(true); // User interacted, load all
        isManualScrolling.current = true;
        const width = scrollRef.current.offsetWidth;
        scrollRef.current.scrollTo({
            left: index * width,
            behavior: 'smooth'
        });
        setCurrentIndex(index);

        // Reset manual scroll flag after transition
        setTimeout(() => {
            isManualScrolling.current = false;
        }, 500);
    };

    const nextImage = (e) => {
        if (currentIndex < images.length - 1) {
            scrollToImage(currentIndex + 1, e);
            markAsExperienced();
        }
    };

    const prevImage = (e) => {
        if (currentIndex > 0) {
            scrollToImage(currentIndex - 1, e);
            markAsExperienced();
        }
    };

    if (!images || images.length === 0) return null;

    return (
        <div 
            className={`w-full h-full group/slider relative overflow-hidden ${isGalleryMode ? 'bg-black' : ''}`}
            onMouseEnter={() => setLoadOthers(true)}
            onTouchStart={() => setLoadOthers(true)}
        >
            {/* Scroll Container */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain no-scrollbar"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                `}} />
                {images.map((img, i) => (
                    <div
                        key={i}
                        className="w-full h-full flex-shrink-0 snap-center relative flex items-center justify-center"
                    >
                        <Link
                            to={onImageClick || isGalleryMode ? '#' : cardLink}
                            className={`block w-full h-full cursor-pointer ${isGalleryMode ? 'p-0 md:p-8' : ''}`}
                            onClick={(e) => {
                                if (onImageClick) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onImageClick(i);
                                } else if (isGalleryMode) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }
                            }}
                        >
                            <GracefulImage
                                src={img}
                                alt={`${title} - image ${i + 1}`}
                                shouldLoad={i === 0 ? shouldLoadFirst : loadOthers}
                                onReady={i === 0 ? () => {
                                    onFirstImageReady?.();
                                } : undefined}
                                className={`w-full h-full select-none pointer-events-none ${isGalleryMode ? 'object-contain rounded-[32px] md:rounded-[23px]' : 'object-cover'}`}
                            />
                        </Link>
                    </div>
                ))}
            </div>
            
            {/* Swipe Tutorial Indicator Overlay */}
            {showIndicator && images.length > 1 && (
                <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
                    <div className="relative">
                        {/* Hand Gesture Icon & Arrow */}
                        <div className="relative flex items-center justify-center">
                             {/* Arrow with flick animation */}
                             <div className="absolute -left-12 animate-swipe-arrow-flick">
                                  <ChevronLeftIcon className="w-8 h-8 text-white" strokeWidth={2.5} />
                             </div>

                             {/* The Hand with rotation loop */}
                             <div className="relative text-white drop-shadow-2xl animate-swipe-hand-loop origin-center">
                                  <TbHandFinger size={52} strokeWidth={1.2} />
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Subtle Gradient Overlays for better depth/visibility */}
            {images.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent z-10 pointer-events-none" />
            )}

            {/* 5-Dot Sliding Window Indicator (Oldest Design Style) */}
            {showDots && images.length > 1 && (
                <div className={`absolute ${isGalleryMode ? 'bottom-12' : 'bottom-4'} left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30`}>
                    {(() => {
                        const maxDots = 5;
                        const total = images.length;
                        let startIndex = 0;
                        if (total > maxDots) {
                            startIndex = Math.max(0, Math.min(currentIndex - 2, total - maxDots));
                        }
                        return images.slice(startIndex, startIndex + maxDots).map((_, i) => {
                            const actualIndex = startIndex + i;
                            const isActive = actualIndex === currentIndex;
                            return (
                                <div 
                                    key={actualIndex}
                                    className={`transition-all duration-300 rounded-full ${
                                        isActive 
                                            ? 'w-5 h-1.5 bg-white shadow-sm' 
                                            : 'w-1.5 h-1.5 bg-white/40'
                                    }`}
                                />
                            );
                        });
                    })()}
                </div>
            )}

            {/* Arrows */}
            {showArrows && images.length > 1 && (
                <>
                    {currentIndex > 0 && (
                        <button
                            onClick={prevImage}
                            className={`absolute ${isGalleryMode ? 'left-6 lg:left-20' : `left-${arrowPadding}`} top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 hidden md:flex items-center justify-center text-gray-700 opacity-0 md:group-hover/slider:opacity-100 transition-all duration-300 z-30 hover:scale-110 hover:bg-white/90 active:scale-95 pointer-events-auto shadow-md`}
                            aria-label="Previous image"
                        >
                            <ChevronLeftIcon className="w-[18px] h-[18px] drop-shadow-sm" strokeWidth={2.5} />
                        </button>
                    )}
                    {currentIndex < images.length - 1 && (
                        <button
                            onClick={nextImage}
                            className={`absolute ${isGalleryMode ? 'right-6 lg:right-20' : `right-${arrowPadding}`} top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 hidden md:flex items-center justify-center text-gray-700 opacity-0 md:group-hover/slider:opacity-100 transition-all duration-300 z-30 hover:scale-110 hover:bg-white/90 active:scale-95 pointer-events-auto shadow-md`}
                            aria-label="Next image"
                        >
                            <ChevronRightIcon className="w-[18px] h-[18px] drop-shadow-sm" strokeWidth={2.5} />
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

const ListingCard = ({ listing = {}, viewMode = 'grid', priceFormat = 'short', showSave = true, to, onSaveToggle, initialSaved = false, cardClassName = '', index = 0 }) => {
    const { t } = useTranslation();
    const tDynamic = useDynamicTranslation();
    const isListView = viewMode === 'list';
    const {
        id, price, listing_type, bedrooms, bathrooms, area, station_name,
        distance_to_station, line_color, station, media = [], is_featured, agent
    } = listing;
    const title = tDynamic(listing, 'title');

    const safeMedia = Array.isArray(media) ? media : [];
    const featuredImage = getMediaUrl(safeMedia.find((m) => m.type === 'image')?.url);
    const listingImages = React.useMemo(() => {
        const images = safeMedia.filter(m => m.type === 'image');
        if (!images.length) return featuredImage ? [featuredImage] : [];
        const order = (rt) => {
            if (!rt) return PHOTO_ROOM_TYPES.length;
            const normalized = rt.trim().toLowerCase();
            const idx = PHOTO_ROOM_TYPES.findIndex(type => 
                type.toLowerCase() === normalized || 
                (normalized === 'bed room' && type.toLowerCase() === 'bedroom')
            );
            return idx >= 0 ? idx : PHOTO_ROOM_TYPES.length;
        };
        return [...images].sort((a, b) => order(a.room_type) - order(b.room_type)).map(m => getMediaUrl(m.url));
    }, [safeMedia, featuredImage]);

    const [isSaved, setIsSaved] = React.useState(initialSaved);
    const [savingListing, setSavingListing] = React.useState(false);
    const [isAgentModalOpen, setIsAgentModalOpen] = React.useState(false);
    const [isInView, setIsInView] = React.useState(true);
    const [isFirstImageReady, setIsFirstImageReady] = React.useState(false);
    const cardRef = React.useRef(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, savedListingIds, setSavedListingIds } = useAuth();
    const { isMainDomain } = useTenant();

    // Use global saved state to avoid N+1 API calls
    React.useEffect(() => {
        if (initialSaved) {
            setIsSaved(true);
        } else if (isAuthenticated && savedListingIds) {
            setIsSaved(savedListingIds.includes(String(id)));
        } else {
            setIsSaved(false);
        }
    }, [id, isAuthenticated, savedListingIds, initialSaved]);

    React.useEffect(() => {
        const handleStatusChange = (event) => {
            if (String(event.detail.listingId) === String(id)) setIsSaved(event.detail.saved);
        };
        window.addEventListener('listing:saved-status-changed', handleStatusChange);
        return () => window.removeEventListener('listing:saved-status-changed', handleStatusChange);
    }, [id]);

    if (!listing || Object.keys(listing).length === 0 || !listing.id) return null;

    const handleToggleSave = async (e) => {
        e.preventDefault(); e.stopPropagation();
        if (savingListing) return;
        if (!isAuthenticated) { navigate('/login', { state: { from: location } }); return; }
        setSavingListing(true);
        try {
            if (isSaved) {
                await unsaveListing(id);
                setIsSaved(false);
                if (setSavedListingIds) setSavedListingIds(prev => prev.filter(sid => String(sid) !== String(id)));
                window.dispatchEvent(new CustomEvent('listing:saved-status-changed', { detail: { listingId: id, saved: false } }));
            } else {
                await saveListing(id);
                setIsSaved(true);
                if (setSavedListingIds) setSavedListingIds(prev => prev.some(sid => String(sid) === String(id)) ? prev : [...prev, String(id)]);
                window.dispatchEvent(new CustomEvent('listing:saved-status-changed', { detail: { listingId: id, saved: true } }));
            }
            if (onSaveToggle) onSaveToggle(!isSaved);
        } catch (error) { console.error('Error toggling save:', error); } finally { setSavingListing(false); }
    };

    const handleAgentClick = (e) => { e.preventDefault(); e.stopPropagation(); setIsAgentModalOpen(true); };
    const nearestStationName = (station?.name_en || station_name || '').split('(')[0].trim() || '';
    const stationWithDistance = nearestStationName && (distance_to_station != null && distance_to_station !== '' && Number(distance_to_station) >= 0)
        ? `${nearestStationName} (${formatDistance(distance_to_station)})` : nearestStationName;

    const formatPrice = (p) => p ? p.toLocaleString() : 'N/A';
    const linkTo = to || `/listings/${id}`;

    const renderUnifiedCard = (cardLink) => {
        const isSavedMode = viewMode === 'saved-grid';
        if (isSavedMode || viewMode === 'list') {
            return (
                <div ref={cardRef} className="relative bg-transparent rounded-none group transition-all duration-700">
                    {!isFirstImageReady && <ListingCardSkeleton viewMode={viewMode} />}
                    <div className={`transition-all duration-700 ${isFirstImageReady ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
                        <div className="relative">
                            <div className="relative aspect-[4/3.7] md:aspect-[4/3.3] rounded-[23px] overflow-hidden mb-2">
                                <ListingImageSlider images={listingImages} title={title} cardLink={cardLink} shouldLoadFirst={isInView} onFirstImageReady={() => setIsFirstImageReady(true)} />
                                {isMainDomain && listing.agent && (
                                    <button onClick={handleAgentClick} className="absolute bottom-[10px] left-[10px] md:bottom-[15px] md:left-[15px] z-10 pointer-events-auto active:scale-95 transition-all duration-300">
                                        <div className="bg-white/90 dark:bg-dashboard-card/90 backdrop-blur-xl rounded-lg shadow-lg flex items-center justify-center border border-white/60 dark:border-white/10 w-[88px] md:w-[112px] aspect-[2.8/1] overflow-hidden hover:bg-white dark:hover:bg-dashboard-hover transition-all duration-300"
                                             style={(listing.agent.logo || listing.agent.theme?.logo_url) ? { backgroundImage: `url('${getMediaUrl(listing.agent.logo || listing.agent.theme?.logo_url)}')`, backgroundSize: '75%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' } : {}}>
                                            {!(listing.agent.logo || listing.agent.theme?.logo_url) && <span className="text-primary-600 font-bold text-[11px] md:text-xs whitespace-nowrap px-2 truncate w-full text-center">{listing.agent.name || 'Agent'}</span>}
                                        </div>
                                    </button>
                                )}
                            </div>
                            <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-50 pointer-events-none">
                                <span className="bg-[#f0f0f0]/95 backdrop-blur-md border border-white/40 px-5 py-2 md:px-4 md:py-1 rounded-full text-[11px] md:text-[12px] font-bold text-gray-900 shadow-sm">{listing_type === 'rent' ? t('listing.forRent') : t('listing.forSale')}</span>
                            </div>
                            {showSave && user?.role !== 'sub_agent' && (
                                <div className="absolute top-2 right-3.5 z-50 pointer-events-none">
                                    <HeartButton isSaved={isSaved} onClick={handleToggleSave} disabled={savingListing} className="pointer-events-auto w-12 h-12 flex items-center justify-center" />
                                </div>
                            )}
                        </div>
                        <div className="px-1.5 py-2">
                            <Link to={cardLink} className="block group/link">
                                <h3 className="text-[16px] md:text-[13px] font-medium text-[#222222] dark:text-white line-clamp-1 leading-snug md:group-hover:text-primary-600 transition-colors">{title}</h3>
                                <div className="mt-1 flex flex-col gap-0.5">
                                    <p className="text-[16px] md:text-[13px] text-[#222222]/70 dark:text-gray-300 font-medium">{Number(bedrooms) <= 0 ? t('listing.studio') : t('listing.bed', { count: bedrooms })} · {t('listing.bath', { count: bathrooms })}</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div ref={cardRef} className={`group relative flex flex-col w-full md:w-[96%] mx-auto transition-all duration-700 ${cardClassName}`}>
                {!isFirstImageReady && <ListingCardSkeleton viewMode="grid" />}
                <div className={`flex flex-col w-full bg-transparent rounded-none border-none transition-all duration-700 ${isFirstImageReady ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98] absolute inset-0 pointer-events-none'}`}>
                    <div className="relative">
                        <div className="relative aspect-[4/3.7] md:aspect-[4/3.3] w-full overflow-hidden rounded-[32px] md:rounded-[23px] block animate-fill-fast">
                            <ListingImageSlider images={listingImages} title={title} cardLink={cardLink} shouldLoadFirst={isInView} onFirstImageReady={() => setIsFirstImageReady(true)} />
                            {isMainDomain && listing.agent && (
                                <button onClick={handleAgentClick} className="absolute bottom-[10px] left-[10px] md:bottom-[15px] md:left-[15px] z-10 pointer-events-auto group/agent active:scale-95 transition-all duration-300 group-hover:translate-y-[-3px] group-hover:scale-[1.04]">
                                    <div className="bg-white/85 backdrop-blur-xl rounded-[4px] shadow-[0_4px_20px_0_rgba(31,38,135,0.12)] flex items-center justify-center border border-white/60 w-[88px] md:w-[112px] h-auto aspect-[3/1] overflow-hidden shimmer-sweep hover:bg-white transition-all duration-300 group-hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.18)]"
                                         style={(listing.agent.logo || listing.agent.theme?.logo_url) ? { backgroundImage: `url('${getMediaUrl(listing.agent.logo || listing.agent.theme?.logo_url)}')`, backgroundSize: '78%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', padding: '0px' } : {}}>
                                        {!(listing.agent.logo || listing.agent.theme?.logo_url) && <span className="text-primary-600 font-bold text-xs md:text-sm whitespace-nowrap px-2 truncate w-full text-center">{listing.agent.name || 'Agent'}</span>}
                                    </div>
                                </button>
                            )}
                        </div>
                        <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-50 pointer-events-none animate-fill-med">
                            <span className="bg-[#f0f0f0]/95 backdrop-blur-md border border-white/40 px-5 py-2 md:px-4 md:py-1 rounded-full text-[13px] md:text-[12px] font-bold text-gray-900 shadow-sm">{is_featured ? t('listing.featured') : (listing_type === 'rent' ? t('listing.forRent') : t('listing.forSale'))}</span>
                        </div>
                        {showSave && user?.role !== 'sub_agent' && (
                            <div className="absolute top-2 right-3.5 z-50 pointer-events-none">
                                <HeartButton isSaved={isSaved} onClick={handleToggleSave} disabled={savingListing} className="pointer-events-auto w-12 h-12 flex items-center justify-center" />
                            </div>
                        )}
                    </div>
                </div>
                <Link to={cardLink} className="py-3 px-1.5 flex flex-col gap-1">
                    <div className="flex justify-between items-start animate-fill-med">
                        <h3 className="text-[16px] md:text-[16px] font-medium text-[#222222] dark:text-white truncate md:group-hover:text-primary-600 transition-colors">{title}</h3>
                    </div>
                    {stationWithDistance && (
                        <div className="text-[17px] md:text-[14px] flex items-center gap-2 mb-1.5 animate-fill-med mt-0.5 font-sans">
                            <div className="w-[34px] h-[26px] md:w-[30px] md:h-[22px] rounded-[6px] flex items-center justify-center p-1 flex-shrink-0 shadow-sm" style={{ backgroundColor: station?.line_color || line_color || '#222222' }}>
                                <MdOutlineDirectionsTransit className="w-full h-full text-white" />
                            </div>
                            <span className="truncate font-medium text-[#646464] dark:text-gray-300">{stationWithDistance}</span>
                        </div>
                    )}
                    <p className="text-[16px] md:text-[14px] text-[#222222]/70 dark:text-gray-300 animate-fill-slow">{Number(bedrooms) <= 0 ? t('listing.studio') : t('listing.bed', { count: bedrooms })} · {t('listing.bath', { count: bathrooms })} · {t('listing.sqm', { count: area })}</p>
                    <div className="mt-2 flex items-baseline gap-1 animate-fill-slow">
                        <span className="text-[16.5px] md:text-[14.5px] font-semibold text-[#222222] dark:text-white">฿{formatPrice(price)}</span>
                        <span className="text-[14.5px] md:text-[13px] text-[#222222]/60 dark:text-gray-400">{listing_type === 'rent' ? t('listing.rentUnit') : ''}</span>
                    </div>
                </Link>
            </div>
        );
    };

    if (isListView) {
        return (
            <div ref={cardRef} className={`group bg-transparent rounded-none border-b border-gray-100 dark:border-white/10 flex flex-col transition-all duration-700 animate-in fade-in duration-500 ${cardClassName}`} style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
                {!isFirstImageReady && <ListingCardSkeleton viewMode="list" />}
                <div className={`transition-all duration-700 ${isFirstImageReady ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
                    <div className="p-4 flex gap-5 relative">
                        <div className="relative aspect-[4/3.8] w-40 sm:w-48 overflow-hidden rounded-[23px] flex-shrink-0">
                            <ListingImageSlider images={listingImages} title={title} cardLink={linkTo} shouldLoadFirst={isInView} onFirstImageReady={() => setIsFirstImageReady(true)} />
                            <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2 pointer-events-none">
                                <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm"><span className="text-[12px] font-semibold text-gray-900">{listing_type === 'sale' ? t('listing.forSale') : t('listing.forRent')}</span></div>
                            </div>
                            {showSave && user?.role !== 'sub_agent' && (
                                <div className="absolute top-2 right-3.5 z-10 pointer-events-none">
                                    <HeartButton isSaved={isSaved} onClick={handleToggleSave} disabled={savingListing} className="pointer-events-auto w-12 h-12 flex items-center justify-center" />
                                </div>
                            )}
                            {isMainDomain && listing.agent && (
                                <button onClick={handleAgentClick} className="absolute bottom-[10px] left-[10px] md:bottom-[15px] md:left-[15px] z-10 pointer-events-auto group/agent active:scale-95 transition-all duration-300 group-hover:translate-y-[-3px] group-hover:scale-[1.04]">
                                    <div className="bg-white/85 backdrop-blur-xl rounded-[4px] shadow-[0_4px_20px_0_rgba(31,38,135,0.12)] flex items-center justify-center border border-white/60 w-[88px] md:w-[112px] h-auto aspect-[3/1] overflow-hidden shimmer-sweep hover:bg-white transition-all duration-300 group-hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.18)]"
                                         style={(listing.agent.logo || listing.agent.theme?.logo_url) ? { backgroundImage: `url('${getMediaUrl(listing.agent.logo || listing.agent.theme?.logo_url)}')`, backgroundSize: '78%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', padding: '0px' } : {}}>
                                        {!(listing.agent.logo || listing.agent.theme?.logo_url) && <span className="text-primary-600 font-bold text-xs md:text-sm whitespace-nowrap px-2 truncate w-full text-center">{listing.agent.name || 'Agent'}</span>}
                                    </div>
                                </button>
                            )}
                        </div>
                        <div className="flex-1 py-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <Link to={linkTo}><h3 className="text-[16px] sm:text-lg font-medium text-[#222222] dark:text-white line-clamp-1 md:hover:text-primary-600 transition-colors">{title}</h3></Link>
                                </div>
                                {stationWithDistance && (
                                    <div className="flex items-center gap-2 text-[17px] sm:text-sm mb-1.5 mt-0.5 font-sans">
                                        <div className="w-[34px] h-[26px] sm:w-[30px] sm:h-[22px] rounded-[6px] flex items-center justify-center p-1 flex-shrink-0 shadow-sm" style={{ backgroundColor: station?.line_color || line_color || '#222222' }}>
                                            <MdOutlineDirectionsTransit className="w-full h-full text-white" />
                                        </div>
                                        <span className="truncate font-medium text-[#646464] dark:text-gray-300">{stationWithDistance}</span>
                                    </div>
                                )}
                                <div className="flex gap-4 text-[16px] sm:text-sm text-[#222222]/70 dark:text-gray-300">
                                    <span>{Number(bedrooms) <= 0 ? t('listing.studio') : t('listing.bed', { count: bedrooms })}</span>
                                    <span>{t('listing.bath', { count: bathrooms })}</span>
                                    <span>{t('listing.sqm', { count: area })}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <p className="text-[16.5px] font-semibold text-[#222222] dark:text-white">฿{formatPrice(price)}<span className="text-[14.5px] font-normal text-[#222222]/60 dark:text-gray-400">{listing_type === 'rent' ? t('listing.rentUnit') : ''}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {renderUnifiedCard(linkTo)}
            {isAgentModalOpen && listing.agent && (
                <AgentProfileModal isOpen={isAgentModalOpen} onClose={() => setIsAgentModalOpen(false)} agent={listing.agent} />
            )}
        </>
    );
};

const AgentProfileModal = ({ isOpen, onClose, agent }) => {
    const logoUrl = getMediaUrl(agent.logo || agent.theme?.logo_url);
    const websiteUrl = agent.custom_domain
        ? `https://${agent.custom_domain}`
        : `http://${agent.subdomain}.${process.env.REACT_APP_MAIN_DOMAIN || 'superealestate.localhost'}`;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            title=""
            hideHeader={true}
            contentClassName="bg-white/80 backdrop-blur-2xl border border-white/60"
        >
            <>
                {/* Custom Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors shadow-sm"
                >
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex flex-col md:flex-row min-h-[560px] overflow-hidden rounded-2xl relative">
                    {/* ... content ... */}
                    <div
                        className="md:w-[360px] flex-shrink-0 flex flex-col items-center justify-start px-10 pt-14 pb-10 relative overflow-hidden border-r border-gray-100 dark:border-white/10 bg-white dark:bg-dashboard-card"
                        style={{
                            backgroundImage: logoUrl ? `url('${logoUrl}')` : 'none',
                            backgroundSize: '180px',
                            backgroundPosition: 'center 60px',
                            backgroundRepeat: 'no-repeat'
                        }}
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-gray-50/50 dark:bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                        <div className="h-[180px] w-full" />
                        <div className="text-center z-10 mb-10">
                            <span className="text-[10px] font-bold mb-2 block" style={{ color: '#222222' }}>Official Agent</span>
                            <h2 className="text-2xl font-black text-slate-900/90 dark:text-white leading-tight">{agent.name}</h2>
                        </div>
                        <div className="w-full space-y-4 z-10">
                            {agent.email && (
                                <a href={`mailto:${agent.email}`} className="flex items-center gap-4 group/item">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-primary-50 dark:group-hover/item:bg-white/20 transition-all duration-300 border border-slate-100 dark:border-white/10 shadow-sm">
                                        <EnvelopeIcon className="w-5 h-5 text-gray-400 dark:text-gray-300 group-hover/item:text-primary-600 dark:group-hover/item:text-white transition-colors" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-[10px] font-bold mb-0.5" style={{ color: '#222222' }}>Email</span>
                                        <span className="text-[14px] text-slate-700/80 dark:text-gray-200 truncate font-medium group-hover/item:text-primary-600 dark:group-hover/item:text-white transition-colors">{agent.email}</span>
                                    </div>
                                </a>
                            )}
                            {agent.phone && (
                                <a href={`tel:${agent.phone}`} className="flex items-center gap-4 group/item">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-primary-50 dark:group-hover/item:bg-white/20 transition-all duration-300 border border-slate-100 dark:border-white/10 shadow-sm">
                                        <PhoneIcon className="w-5 h-5 text-gray-400 dark:text-gray-300 group-hover/item:text-primary-600 dark:group-hover/item:text-white transition-colors" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-[10px] font-bold mb-0.5" style={{ color: '#222222' }}>Phone</span>
                                        <span className="text-[14px] text-slate-700/80 dark:text-gray-200 truncate font-medium group-hover/item:text-primary-600 dark:group-hover/item:text-white transition-colors">{agent.phone}</span>
                                    </div>
                                </a>
                            )}
                        </div>
                        <div className="mt-auto w-full z-10 flex flex-col pt-10">
                            <div className="flex items-center gap-4 mb-10">
                                {agent.line && (
                                    <a href={`https://line.me/ti/p/~${agent.line}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/10 hover:bg-[#06C755] border border-slate-100 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-gray-300 hover:text-white transition-all duration-300 shadow-sm">
                                        <SiLine className="w-5 h-5" />
                                    </a>
                                )}
                                {agent.facebook && (
                                    <a href={agent.facebook} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/10 hover:bg-[#1877F2] border border-slate-100 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-gray-300 hover:text-white transition-all duration-300 shadow-sm">
                                        <SiFacebook className="w-5 h-5" />
                                    </a>
                                )}
                                {agent.instagram && (
                                    <a href={agent.instagram} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/10 hover:bg-[#E4405F] border border-slate-100 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-gray-300 hover:text-white transition-all duration-300 shadow-sm">
                                        <SiInstagram className="w-5 h-5" />
                                    </a>
                                )}
                                {agent.linkedin && (
                                    <a href={agent.linkedin} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/10 hover:bg-[#0A66C2] border border-slate-100 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-gray-300 hover:text-white transition-all duration-300 shadow-sm">
                                        <SiLinkedin className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                            {(agent.subdomain || agent.custom_domain) && (
                                <a href={websiteUrl} target="_blank" rel="noreferrer" className="w-full group relative h-12 overflow-hidden rounded-xl bg-slate-900 dark:bg-white border border-slate-800 dark:border-white/10 flex items-center justify-center gap-2.5 text-white dark:text-dashboard-dark active:scale-95 transition-all duration-500 shadow-xl">
                                    <div className="absolute inset-0 w-full h-full -translate-x-[110%] group-hover:translate-x-[110%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-0" />
                                    <div className="relative z-10 flex items-center gap-2.5 whitespace-nowrap">
                                        <GlobeAltIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-500" />
                                        <span className="text-[13px] font-bold" style={{ color: '#222222' }}>Visit Website</span>
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col px-12 py-14 overflow-y-auto bg-white dark:bg-dashboard-dark">
                        <div className="mb-6">
                            <span className="text-[10px] font-bold" style={{ color: '#222222' }}>About our Vision</span>
                            <h3 className="text-3xl font-black text-slate-900/95 dark:text-white mt-1 leading-tight">{agent.name}</h3>
                        </div>
                        {agent.description ? (
                            <div className="relative mb-10">
                                <div className="absolute -top-3 -left-2 text-8xl text-primary-100/40 dark:text-primary-500/10 leading-none select-none pointer-events-none">"</div>
                                <p className="text-[16px] text-slate-600/90 dark:text-gray-300 leading-relaxed pt-8 pl-5 relative z-10 italic">{agent.description}</p>
                            </div>
                        ) : (
                            <div className="mb-10 flex items-center justify-center h-28 bg-white/20 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-dashed border-white/40 dark:border-white/10">
                                <p className="text-gray-500 dark:text-gray-400 text-[15px] italic font-medium">No description provided for this agency.</p>
                            </div>
                        )}
                        {(agent.mission || agent.vision) && (
                            <div className="grid grid-cols-1 gap-4 mb-10">
                                {agent.vision && (
                                    <div className="bg-gradient-to-br from-primary-50/50 to-white dark:from-white/5 dark:to-dashboard-card border border-primary-100/50 dark:border-white/10 rounded-[2rem] p-6 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2"><div className="w-2 h-6 bg-primary-500 rounded-full" /><span className="text-[11px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">Our Vision</span></div>
                                        <p className="text-[14px] text-gray-600 dark:text-gray-300 leading-relaxed">{agent.vision}</p>
                                    </div>
                                )}
                                {agent.mission && (
                                    <div className="bg-gradient-to-br from-indigo-50/50 to-white dark:from-white/5 dark:to-dashboard-card border border-indigo-100/50 dark:border-white/10 rounded-[2rem] p-6 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2"><div className="w-2 h-6 bg-indigo-500 rounded-full" /><span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Our Mission</span></div>
                                        <p className="text-[14px] text-gray-600 dark:text-gray-300 leading-relaxed">{agent.mission}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="mt-auto pt-8 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
                            <div className="flex flex-col"><span className="text-xs font-bold text-slate-900/80 dark:text-white/80">Premium Partner</span><span className="text-[11px] text-slate-400 dark:text-gray-500 font-medium tracking-wide">✓ Verified by Super Real Estate</span></div>
                        </div>
                    </div>
                </div>
            </>
        </Modal>
    );
};

export default React.memo(ListingCard);
