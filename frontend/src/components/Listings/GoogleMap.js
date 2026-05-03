import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GoogleMap, useJsApiLoader, OverlayView, OverlayViewF } from '@react-google-maps/api';
import {
    XMarkIcon,
    MapPinIcon,
    PlusIcon,
    MinusIcon,
    ArrowPathIcon,
    ArrowsPointingOutIcon,
    SparklesIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { getMediaUrl } from '../../utils/media';
import { useTheme } from '../../contexts/ThemeContext';
import { ListingImageSlider } from './ListingCard';
import { formatDistance, formatBedrooms } from '../../utils/format';
import { MdOutlineDirectionsTransit } from "react-icons/md";
import { BsHeart, BsFillHeartFill } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { PiBuildingApartmentBold } from "react-icons/pi";

const HeartButton = ({ isSaved, onClick, disabled, className, iconClassName = "w-[32px] h-[32px] md:w-[26px] md:h-[26px]" }) => {
    const [animate, setAnimate] = React.useState(false);
    const [showSaved, setShowSaved] = React.useState(false);
    const [isFlashing, setIsFlashing] = React.useState(false);

    const handleClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (disabled) return;
        
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
            {isFlashing && (
                <div className="absolute inset-[-4px] bg-rose-500/20 dark:bg-rose-500/30 rounded-full animate-heart-flash blur-sm" />
            )}
            {showSaved && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none z-[100] animate-saved-tooltip">
                    <span className="bg-[#222222]/90 text-white text-[12px] px-2.5 py-1 rounded-full whitespace-nowrap shadow-xl font-medium border border-white/10">
                        Saved
                    </span>
                </div>
            )}
            {animate && (
                <>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={`dot-${i}`} className={`heart-particle heart-dot-active-${i} ${i % 2 === 0 ? 'bg-rose-500' : 'bg-amber-400'}`} />
                    ))}
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={`sparkle-${i}`} className={`heart-particle heart-sparkle heart-sparkle-active-${i} ${i % 2 === 0 ? 'bg-pink-400' : 'bg-white'}`} />
                    ))}
                </>
            )}
            <div className={animate ? 'heart-pop-active' : ''}>
                {isSaved ? (
                    <BsFillHeartFill className={`text-rose-500 drop-shadow-md transition-colors duration-300 ${iconClassName}`} />
                ) : (
                    <BsHeart className={`text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] transition-colors duration-300 ${iconClassName}`} />
                )}
            </div>
        </button>
    );
};

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const LIBRARIES = ['places', 'marker'];

const options = {
    disableDefaultUI: true,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy',
};

const PropertyMarker = React.memo(({ property, onClick, onSaveClick, savedListingIds = [], highlightedMarkerListingId = null, openedMarkerId = null, onCardToggle, onCloseCard, markerType = 'price', isZoomedIn, formatPrice }) => {
    const initialSaved = Array.isArray(savedListingIds) && savedListingIds.some((sid) => String(sid) === String(property.id));
    const isOpened = String(property.id) === String(openedMarkerId);
    const isHighlighted = String(property.id) === String(highlightedMarkerListingId);

    const priceDisplay = formatPrice ? formatPrice(property.price) : property.price;

    const district = property.district || '—';
    const stationRaw = property.station?.name_en || property.station_name || '';
    const stationName = (typeof stationRaw === 'string' ? stationRaw.split('(')[0].trim() : '') || '—';
    const isFeatured = property.is_featured === true || property.is_featured === '1';
    const listingType = property.listing_type || 'rent';
    const dateStr = property.created_at ? (() => {
        try {
            const d = new Date(property.created_at);
            return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (_) { return ''; }
    })() : '';

    const listingImages = useMemo(() => {
        return (property.media || [])
            .filter(m => m.type === 'image')
            .map(m => getMediaUrl(m.url));
    }, [property.media]);

    const cardLink = `/listings/${property.id}`;

    const position = useMemo(() => ({ 
        lat: parseFloat(property.latitude), 
        lng: parseFloat(property.longitude) 
    }), [property.latitude, property.longitude]);

    return (
        <OverlayViewF
            position={position}
            mapPaneName="overlayMouseTarget"
        >
            <div
                className={`marker-group ${isHighlighted ? 'list-highlighted' : ''} ${isOpened ? 'opened' : ''} relative`}
                style={{ transform: 'translate(-50%, -50%)', zIndex: isOpened ? 1000 : 1 }}
            >
                {/* PILL/HOME MARKER - Anchored with bottom at coordinate */}
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 transition-opacity transition-transform duration-300 ease-out flex flex-col items-center scale-100 opacity-100 pointer-events-auto`}
                    style={{ transform: 'translateY(-2px)' }}
                >
                        {markerType === 'home' ? (
                            <div className="home-marker z-10" 
                                onClick={(e) => { e.stopPropagation(); onCardToggle(property); }}
                                onPointerDown={(e) => e.stopPropagation()}
                            >
                                <PiBuildingApartmentBold className="w-[22px] h-[22px]" />
                            </div>
                        ) : (
                            <div className={`resting-pill z-10 ${isFeatured ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`} 
                                onClick={(e) => { e.stopPropagation(); onCardToggle(property); }}
                                onPointerDown={(e) => e.stopPropagation()}
                            >
                                <span className="price-icon text-[15px] font-medium opacity-90 leading-none">฿</span>
                                <span className="price-text font-bold">{priceDisplay}</span>
                            </div>
                        )}

                        <svg className={`resting-nub flex-none transition-transform duration-300 pointer-events-none ${isFeatured ? 'fill-primary-500 scale-125' : 'fill-[#1a1a1a]'}`} width="12" height="6" viewBox="0 0 16 8">
                            <polygon points="0,0 16,0 8,8" />
                        </svg>
                    </div>
                {/* EXPANDED CARD */}
                <div
                    className="expanded-card absolute left-1/2 -translate-x-1/2 bottom-[14px] w-0 opacity-0 bg-transparent overflow-visible transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col z-20"
                    onClick={(e) => e.stopPropagation()}
                >
                    {isOpened && (
                        <div className="flex flex-col w-[300px] md:w-[320px] bg-transparent rounded-none border-none drop-shadow-2xl">
                            <div className="relative">
                                <div className="relative aspect-[4/3.7] w-full overflow-hidden rounded-[23px] block shadow-lg">
                                    <ListingImageSlider images={listingImages} title={property.title} cardLink={cardLink} />
                                </div>
                                
                                {/* Status Badge */}
                                <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-50 pointer-events-none">
                                    <span className="bg-[#f0f0f0]/95 backdrop-blur-md border border-white/40 px-7 py-2.5 md:px-5 md:py-1.5 rounded-full text-[14px] md:text-[13px] font-bold text-gray-900 shadow-sm">
                                        {isFeatured ? 'Featured' : (listingType === 'sale' ? 'For Sale' : 'For Rent')}
                                    </span>
                                </div>

                                {/* Close and Save Buttons */}
                                <div className="absolute top-2 right-3 z-50 flex items-center gap-0 pointer-events-auto">
                                    <HeartButton
                                        isSaved={initialSaved}
                                        onClick={(e) => { onSaveClick(property.id, initialSaved); }}
                                        className="w-12 h-12"
                                        iconClassName="w-[32px] h-[32px] md:w-[26px] md:h-[26px]"
                                    />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onCloseCard(); }}
                                        className="w-9 h-9 rounded-full bg-[#333333]/90 backdrop-blur-xl flex items-center justify-center text-white transition-all hover:bg-[#222222] active:scale-90 shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-white/10 ml-1"
                                    >
                                        <XMarkIcon className="w-5 h-5 stroke-[2.5]" />
                                    </button>
                                </div>
                            </div>

                            {/* Property Details */}
                            <div className="py-4 px-5 flex flex-col gap-1 cursor-pointer bg-[#222222]/95 backdrop-blur-md rounded-[24px] mt-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] border border-white/5" onClick={() => onClick(property)}>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-[16.5px] font-semibold text-white truncate transition-colors">
                                        {property.title}
                                    </h3>
                                </div>

                                {stationName && stationName !== '—' && (
                                    <div className="text-[14px] flex items-center gap-2 mt-0.5 font-sans">
                                        <div className="w-[28px] h-[20px] rounded-[5px] flex items-center justify-center p-1 flex-shrink-0 bg-[#82b40a]">
                                            <MdOutlineDirectionsTransit className="w-full h-full text-white" />
                                        </div>
                                        <span className="truncate font-medium text-gray-300">{stationName}</span>
                                    </div>
                                )}
                                
                                <p className="text-[14px] text-gray-400 font-normal">
                                    {formatBedrooms(property.bedrooms)} · {property.bathrooms ?? '—'} Bath · {property.area ?? '—'} Sqm
                                </p>

                                <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-[17px] font-semibold text-white">฿{priceDisplay}</span>
                                    {listingType === 'rent' && <span className="text-[14px] text-gray-400 font-normal">/ month</span>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </OverlayViewF>
    );
}, (prevProps, nextProps) => {
    const p = prevProps.property;
    const n = nextProps.property;
    return (
        p.id === n.id &&
        p.price === n.price &&
        prevProps.savedListingIds?.length === nextProps.savedListingIds?.length &&
        prevProps.openedMarkerId === nextProps.openedMarkerId &&
        prevProps.highlightedMarkerListingId === nextProps.highlightedMarkerListingId &&
        prevProps.isZoomedIn === nextProps.isZoomedIn &&
        prevProps.formatPrice === nextProps.formatPrice &&
        Math.abs(parseFloat(p.latitude) - parseFloat(n.latitude)) < 0.0001 &&
        Math.abs(parseFloat(p.longitude) - parseFloat(n.longitude)) < 0.0001
    );
});

const PropertyClusterMarker = React.memo(({ properties, onClick, onSaveClick, savedListingIds = [], highlightedMarkerListingId = null, openedMarkerId = null, onCardToggle, onCloseCard, markerType = 'price', isZoomedIn, formatPrice }) => {
    const count = properties.length;
    
    // Sort properties by price to get min and max
    const sortedProperties = [...properties].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    const minProperty = sortedProperties[0];
    const maxProperty = sortedProperties[count - 1];

    const minPriceStr = formatPrice ? formatPrice(minProperty.price) : minProperty.price;
    const maxPriceStr = formatPrice ? formatPrice(maxProperty.price) : maxProperty.price;
    
    const priceRangeDisplay = minPriceStr === maxPriceStr 
        ? minPriceStr 
        : `${minPriceStr} - ${maxPriceStr}`;

    const isAnyOpened = properties.some(p => String(p.id) === String(openedMarkerId));
    const isAnyHighlighted = properties.some(p => String(p.id) === String(highlightedMarkerListingId));
    
    const currentIndex = properties.findIndex(p => String(p.id) === String(openedMarkerId));
    const safeIndex = currentIndex === -1 ? 0 : currentIndex;
    const openedProperty = properties[safeIndex];

    const onNext = () => {
        if (safeIndex < count - 1) {
            onCardToggle(properties[safeIndex + 1]);
        }
    };
    const onPrev = () => {
        if (safeIndex > 0) {
            onCardToggle(properties[safeIndex - 1]);
        }
    };

    const position = { 
        lat: parseFloat(properties[0].latitude), 
        lng: parseFloat(properties[0].longitude) 
    };

    return (
        <OverlayViewF
            position={position}
            mapPaneName="overlayMouseTarget"
        >
            <div
                className={`marker-group ${isAnyHighlighted ? 'list-highlighted' : ''} ${isAnyOpened ? 'opened' : ''} relative`}
                style={{ transform: 'translate(-50%, -50%)', zIndex: isAnyOpened ? 1000 : 1 }}
            >
                {/* CLUSTER MARKER VISUALS */}
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 transition-opacity transition-transform duration-300 ease-out flex flex-col items-center scale-100 opacity-100 pointer-events-auto`}
                    style={{ transform: 'translateY(-2px)' }}
                >
                    {!isZoomedIn && !isAnyOpened ? (
                        // ONLY SHOW COUNT BADGE WHEN ZOOMED OUT
                        <div 
                            className="w-[36px] h-[36px] rounded-full bg-[#222222] dark:bg-white text-white dark:text-[#222222] border-[2.5px] border-white dark:border-[#222222] shadow-[0_6px_16px_rgba(0,0,0,0.3)] flex items-center justify-center font-bold text-[15px] cursor-pointer hover:scale-110 transition-transform duration-300"
                            onClick={(e) => { e.stopPropagation(); onCardToggle(openedProperty); }}
                        >
                            {count}
                        </div>
                    ) : (
                        // SHOW FULL PRICE RANGE WHEN ZOOMED IN OR OPENED
                        <>
                            <div className="relative">
                                <div className={`resting-pill relative z-10 !min-w-[50px] !px-3`} 
                                    onClick={(e) => { e.stopPropagation(); onCardToggle(openedProperty); }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                >
                                    <span className="price-icon text-[14px] font-medium opacity-90 leading-none mr-0.5">฿</span>
                                    <span className="price-text font-bold text-[11px] tracking-tight">{priceRangeDisplay}</span>
                                </div>
                                
                                {/* Larger count badge on right top of pill */}
                                {count > 1 && (
                                    <div className="count-badge absolute -top-2.5 -right-2.5 z-[15] text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300">
                                        {count}
                                    </div>
                                )}
                            </div>

                            <svg className={`resting-nub flex-none transition-transform duration-300 pointer-events-none fill-[#1a1a1a] dark:fill-white`} width="12" height="6" viewBox="0 0 16 8">
                                <polygon points="0,0 16,0 8,8" />
                            </svg>
                        </>
                    )}
                </div>

                {/* EXPANDED CARD (Shared for cluster) */}
                {/* For now, we show the card for the specifically opened property in the cluster */}
                <div
                    className="expanded-card absolute left-1/2 -translate-x-1/2 bottom-[14px] w-0 opacity-0 bg-transparent overflow-visible transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col z-20"
                    onClick={(e) => e.stopPropagation()}
                >
                    {isAnyOpened && (
                        <div className="flex flex-col">
                            {/* If many, we could show a switcher here, but for now just the property detail */}
                            <PropertyCardContent 
                                property={openedProperty} 
                                onSaveClick={onSaveClick}
                                savedListingIds={savedListingIds}
                                onCloseCard={onCloseCard}
                                onClick={onClick}
                            />
                            {count > 1 && (
                                <div className="px-5 py-3.5 bg-[#222222]/95 backdrop-blur-md rounded-[24px] mt-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex items-center justify-between border border-white/5">
                                    <span className="text-[13px] font-medium text-gray-300">{safeIndex + 1} of {count} properties</span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onPrev(); }}
                                            disabled={safeIndex === 0}
                                            className={`p-2 rounded-full transition-all active:scale-90 shadow-sm ${safeIndex === 0 ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                        >
                                            <ChevronLeftIcon className="w-4 h-4 stroke-[2.5]" />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onNext(); }}
                                            disabled={safeIndex === count - 1}
                                            className={`p-2 rounded-full transition-all active:scale-90 shadow-sm ${safeIndex === count - 1 ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                        >
                                            <ChevronRightIcon className="w-4 h-4 stroke-[2.5]" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </OverlayViewF>
    );
});

// Helper component for expanded card content to avoid duplication
const PropertyCardContent = ({ property, onSaveClick, savedListingIds, onCloseCard, onClick, formatPrice }) => {
    const initialSaved = Array.isArray(savedListingIds) && savedListingIds.some((sid) => String(sid) === String(property.id));
    const isFeatured = property.is_featured === true || property.is_featured === '1';
    const listingType = property.listing_type || 'rent';
    const dateStr = property.created_at ? (() => {
        try {
            const d = new Date(property.created_at);
            return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (_) { return ''; }
    })() : '';

    const listingImages = useMemo(() => {
        return (property.media || [])
            .filter(m => m.type === 'image')
            .map(m => getMediaUrl(m.url));
    }, [property.media]);

    const cardLink = `/listings/${property.id}`;
    const priceDisplay = formatPrice ? formatPrice(property.price) : property.price;

    return (
        <div className="flex flex-col w-[300px] md:w-[320px] bg-transparent rounded-none border-none drop-shadow-2xl">
            <div className="relative">
                <div className="relative aspect-[4/3.7] w-full overflow-hidden rounded-[23px] block shadow-lg">
                    <ListingImageSlider images={listingImages} title={property.title} cardLink={cardLink} />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-50 pointer-events-none">
                    <span className="bg-[#f0f0f0]/95 backdrop-blur-md border border-white/40 px-7 py-2.5 md:px-5 md:py-1.5 rounded-full text-[14px] md:text-[13px] font-bold text-gray-900 shadow-sm">
                        {isFeatured ? 'Featured' : (listingType === 'sale' ? 'For Sale' : 'For Rent')}
                    </span>
                </div>

                {/* Close and Save Buttons */}
                <div className="absolute top-2 right-3 z-50 flex items-center gap-0 pointer-events-auto">
                    <HeartButton
                        isSaved={initialSaved}
                        onClick={(e) => { onSaveClick(property.id, initialSaved); }}
                        className="w-12 h-12"
                        iconClassName="w-[32px] h-[32px] md:w-[26px] md:h-[26px]"
                    />
                    <button
                        onClick={(e) => { e.stopPropagation(); onCloseCard(); }}
                        className="w-9 h-9 rounded-full bg-[#333333]/90 backdrop-blur-xl flex items-center justify-center text-white transition-all hover:bg-[#222222] active:scale-90 shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-white/10 ml-1"
                    >
                        <XMarkIcon className="w-5 h-5 stroke-[2.5]" />
                    </button>
                </div>
            </div>

            {/* Property Details */}
            <div className="py-4 px-5 flex flex-col gap-1 cursor-pointer bg-[#222222]/95 backdrop-blur-md rounded-[24px] mt-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] border border-white/5" onClick={() => onClick(property)}>
                <div className="flex justify-between items-start">
                    <h3 className="text-[16.5px] font-semibold text-white truncate transition-colors">
                        {property.title}
                    </h3>
                </div>

                {property.district && (
                    <div className="text-[14px] flex items-center gap-2 mt-0.5 font-sans">
                        <div className="w-[28px] h-[20px] rounded-[5px] flex items-center justify-center p-1 flex-shrink-0 bg-[#82b40a]">
                            <MdOutlineDirectionsTransit className="w-full h-full text-white" />
                        </div>
                        <span className="truncate font-medium text-gray-300">{property.district}</span>
                    </div>
                )}
                
                <p className="text-[14px] text-gray-400 font-normal">
                    {formatBedrooms(property.bedrooms)} · {property.bathrooms ?? '—'} Bath · {property.area ?? '—'} Sqm
                </p>

                <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-[17px] font-semibold text-white">฿{priceDisplay}</span>
                    {listingType === 'rent' && <span className="text-[14px] text-gray-400 font-normal">/ month</span>}
                </div>
            </div>
        </div>
    );
};

const PADDING = { top: 100, right: 100, bottom: 100, left: 100 };
const MOBILE_PADDING = { top: 180, right: 60, bottom: 320, left: 60 };
const DEFAULT_ZOOM = 12;
const DEFAULT_MOBILE_ZOOM = 10;

const GoogleMapComponent = ({
    listings = [],
    center,
    zoom,
    onMarkerClick,
    onBoundsChanged,
    onExpandClick,
    isExpanded,
    mapStyle = mapContainerStyle,
    options: customOptions,
    useDefaultMarkers = false,
    onSaveClick,
    savedListingIds = [],
    highlightedMarkerListingId = null,
    isVisible = true,
    hideControls = false,
    hideCustomControls = false,
    fitBoundsOnListingsChange = true,
    fitBoundsNonce = 0,
    showMapLoading = false,
    openedMarkerId: externalOpenedMarkerId,
    onOpenedMarkerChange,
    onClick,
    disableMarkerExpansion = false,
    markerType = 'price',
    hideSyncButton = false,
    hideSettingsButton = false
}) => {
    const isMobile = window.innerWidth < 768;
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef(null);
    const bottomSheetRef = useRef(null);

    // Close settings when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                settingsRef.current && !settingsRef.current.contains(event.target) &&
                (!bottomSheetRef.current || !bottomSheetRef.current.contains(event.target))
            ) {
                setIsSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const effectiveZoom = zoom !== undefined ? zoom : (isMobile ? DEFAULT_MOBILE_ZOOM : DEFAULT_ZOOM);
    const effectivePadding = isMobile ? MOBILE_PADDING : PADDING;
    const [isZoomedIn, setIsZoomedIn] = useState(() => effectiveZoom >= 13);

    const [internalOpenedMarkerId, setInternalOpenedMarkerId] = useState(null);
    const openedMarkerId = disableMarkerExpansion ? null : (externalOpenedMarkerId !== undefined ? externalOpenedMarkerId : internalOpenedMarkerId);

    const [displayLoading, setDisplayLoading] = useState(showMapLoading);
    const [isFitted, setIsFitted] = useState(false);
    const [map, setMap] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
        libraries: LIBRARIES,
        version: 'weekly'
    });

    useEffect(() => {
        if (showMapLoading) {
            setDisplayLoading(true);
        } else {
            const timer = setTimeout(() => setDisplayLoading(false), 800);
            return () => clearTimeout(timer);
        }
    }, [showMapLoading]);

    const cancelPendingFetch = useCallback(() => {
        if (boundsTimeoutRef.current) {
            clearTimeout(boundsTimeoutRef.current);
            boundsTimeoutRef.current = null;
        }
    }, []);

    const handleCardToggle = useCallback((property) => {
        const propertyId = property.id;
        const newValue = String(openedMarkerId) === String(propertyId) ? null : propertyId;
        
        // If selecting a property from a zoomed-out state (dots), pan and zoom in
        if (newValue && map) {
            const currentZoom = map.getZoom();
            if (currentZoom < 14) {
                map.panTo({ lat: parseFloat(property.latitude), lng: parseFloat(property.longitude) });
                map.setZoom(15);
            }
        }

        if (onOpenedMarkerChange) {
            onOpenedMarkerChange(newValue);
        } else {
            setInternalOpenedMarkerId(newValue);
        }
    }, [openedMarkerId, onOpenedMarkerChange, map]);

    const handleCloseCard = useCallback(() => {
        if (onOpenedMarkerChange) {
            onOpenedMarkerChange(null);
        } else {
            setInternalOpenedMarkerId(null);
        }
    }, [onOpenedMarkerChange]);

    const boundsTimeoutRef = useRef(null);
    const isDraggingRef = useRef(false);
    const dragEndCooldownRef = useRef(null);
    const [useShortPrice, setUseShortPrice] = useState(true);
    const [useModernMap, setUseModernMap] = useState(true);

    const formatPrice = useCallback((price) => {
        if (price == null || price === '') return '—';
        const num = Number(price);
        if (isNaN(num)) return '—';

        if (!useShortPrice) {
            return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);
        }

        if (num >= 1000000) {
            return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'K';
        }
        return num.toString();
    }, [useShortPrice]);

    const lastReportedBoundsRef = useRef(null);
    const lastReportedCenterRef = useRef(null);
    const internalMoveRef = useRef(false);
    const lastMoveTimestampRef = useRef(0);

    // Sync external center changes to the map instance
    useEffect(() => {
        if (!map || !center) return;
        
        // CRITICAL PROTECTION: Block updates if the user is interacting with the map
        // or has finished interacting very recently.
        const interactionRecent = Date.now() - lastMoveTimestampRef.current < 2500;
        if (internalMoveRef.current || interactionRecent) {
            return;
        }

        const currentMapCenter = map.getCenter();
        if (!currentMapCenter || !center || center.lat === undefined || center.lng === undefined) return;
        
        const lat = parseFloat(center.lat);
        const lng = parseFloat(center.lng);

        const latDiff = Math.abs(currentMapCenter.lat() - lat);
        const lngDiff = Math.abs(currentMapCenter.lng() - lng);

        // Only pan if the difference is substantial (strictly prevents snap-back during drag/fetch cycles)
        if (latDiff > 0.0001 || lngDiff > 0.0001) {
            map.panTo({ lat, lng });
        }
    }, [center, map]);

    // Sync external zoom changes
    useEffect(() => {
        if (!map || zoom === undefined) return;
        if (internalMoveRef.current || (Date.now() - lastMoveTimestampRef.current < 2500)) return;

        if (map.getZoom() !== zoom) {
            map.setZoom(zoom);
        }
    }, [zoom, map]);

    // Initial reveal if fitBounds is not going to run or if map is idle
    useEffect(() => {
        if (!map) return;
        const listener = window.google.maps.event.addListener(map, 'idle', () => {
            setIsFitted(true);
            window.google.maps.event.removeListener(listener);
        });
        // Safety timeout to reveal map even if idle event is delayed
        const timer = setTimeout(() => setIsFitted(true), 1500);
        return () => {
            window.google.maps.event.removeListener(listener);
            clearTimeout(timer);
        };
    }, [map]);

    const listingsWithCoords = useMemo(() => listings.filter(l => l.latitude != null && l.longitude != null), [listings]);
    const listingsBoundsKey = useMemo(() => listingsWithCoords.map(l => `${l.id}-${l.latitude}-${l.longitude}`).join(','), [listingsWithCoords]);

    useEffect(() => {
        if (!fitBoundsOnListingsChange || !map || !window.google?.maps) return;
        
        // CRITICAL FIX: If the user is actively dragging, DO NOT snap back to result bounds.
        // This prevents the "panning then jumping back" issue when API results return.
        // We only block during active drags (internalMoveRef). The drag cooldown and
        // debounce in handleBoundsChanged already handle the timing — no need for timestamp guard.
        if (internalMoveRef.current) return;

        const withCoords = listingsWithCoords;
        if (withCoords.length === 0) {
            setIsFitted(true);
            return;
        }
        const bounds = new window.google.maps.LatLngBounds();
        withCoords.forEach(l => bounds.extend({ lat: parseFloat(l.latitude), lng: parseFloat(l.longitude) }));
        map.fitBounds(bounds, effectivePadding);
        
        // Capping zoom level after fitBounds (especially important for single results)
        // so it doesn't zoom in "to the end".
        const listener = window.google.maps.event.addListener(map, 'idle', () => {
            if (map.getZoom() > 14) {
                map.setZoom(14);
            }
            window.google.maps.event.removeListener(listener);
            setIsFitted(true);
        });
    }, [map, listingsBoundsKey, fitBoundsOnListingsChange, fitBoundsNonce, effectivePadding, listingsWithCoords]);
    const { isDarkMode: themeDarkMode, theme } = useTheme();
    const isDarkMode = themeDarkMode || document.documentElement.classList.contains('dark');
    const primaryColor = theme?.primaryColor || '#0b6732'; // Default primary green

    const darkStyle = useMemo(() => [
        { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }, { visibility: "on" }, { weight: 2 }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
        { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#333333" }] },
        { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#999999" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
        { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212121" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
        { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#212121" }] },
        { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f5f5f5" }] },
        { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
        { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
        { elementType: "labels.icon", stylers: [{ invert_lightness: true, saturation: -20, lightness: 10 }] }
    ], []);

    const premiumStandardStyle = useMemo(() => [
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9e4f2" }] },
        { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#edf5e1" }] },
        { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#f7f7f7" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#d9ebb5" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e6e6e6" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
        { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#dadada" }] },
        // Show POIs and Transit for better context
        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#444444" }] },
        { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#444444" }] },
        { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#222222" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#444444" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#666666" }] },
        // Ensure icons are visible but subtle
        { elementType: "labels.icon", stylers: [{ saturation: -20, lightness: 20 }] }
    ], []);

    const mapOptions = useMemo(() => {
        const hasMapId = options?.mapId || customOptions?.mapId;
        return {
            ...options,
            ...customOptions,
            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
            styles: hasMapId ? undefined : (useModernMap 
                ? (isDarkMode 
                    ? darkStyle 
                    : (customOptions?.styles && customOptions.styles.length > 0 ? customOptions.styles : premiumStandardStyle))
                : []),
            ...(hideControls ? {
                zoomControl: false,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            } : {})
        };
    }, [options, customOptions, hideControls, isDarkMode, darkStyle, premiumStandardStyle, useModernMap]);

    // Force style update when theme changes
    useEffect(() => {
        if (map) {
            map.setOptions({
                styles: useModernMap 
                    ? (isDarkMode ? darkStyle : (customOptions?.styles && customOptions.styles.length > 0 ? customOptions.styles : premiumStandardStyle))
                    : [],
                backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff'
            });
        }
    }, [map, isDarkMode, darkStyle, premiumStandardStyle, customOptions, useModernMap]);

    const handleBoundsChanged = useCallback(() => {
        if (!map || !onBoundsChanged) return;
        
        // AIRBNB-STYLE: If the user is still actively dragging, do NOT process.
        // We wait until the drag has fully ended AND a cooldown has passed.
        if (isDraggingRef.current) return;
        
        const bounds = map.getBounds();
        const center = map.getCenter();
        const zoom = map.getZoom();
        
        if (!bounds || !center) return;

        const data = {
            min_lat: bounds.getSouthWest().lat(),
            max_lat: bounds.getNorthEast().lat(),
            min_lng: bounds.getSouthWest().lng(),
            max_lng: bounds.getNorthEast().lng(),
            center: { lat: center.lat(), lng: center.lng() },
            zoom: zoom
        };

        // Check if bounds have actually changed from the last time we reported them
        // This prevents the loading pill from getting stuck when 'onIdle' fires but no movement occurred
        const isSame = lastReportedBoundsRef.current &&
            Math.abs(lastReportedBoundsRef.current.min_lat - data.min_lat) < 0.000001 &&
            Math.abs(lastReportedBoundsRef.current.max_lat - data.max_lat) < 0.000001 &&
            Math.abs(lastReportedBoundsRef.current.min_lng - data.min_lng) < 0.000001 &&
            Math.abs(lastReportedBoundsRef.current.max_lng - data.max_lng) < 0.000001;

        if (isSame) return;

        if (boundsTimeoutRef.current) clearTimeout(boundsTimeoutRef.current);
        
        // AIRBNB-STYLE: 600ms debounce — gives user time to start another drag
        // before we commit to fetching. This is the key to smooth rapid panning.
        boundsTimeoutRef.current = setTimeout(() => {
            // Double-check: user may have started dragging again during the debounce
            if (isDraggingRef.current) return;
            
            lastReportedBoundsRef.current = data;
            if (data.center) lastReportedCenterRef.current = data.center;
            
            // Stable zoom check: only update isZoomedIn if threshold is actually crossed
            setIsZoomedIn(zoom >= 13);
            
            onBoundsChanged(data);
            
            // Allow external syncs again after a shorter cooling period
            setTimeout(() => { 
                internalMoveRef.current = false; 
            }, 300);
        }, 600);
    }, [map, onBoundsChanged, cancelPendingFetch]);

    const mapCenter = useMemo(() => {
        const hasValidCenter = center && (typeof center.lat === 'number' || !isNaN(parseFloat(center.lat))) && (typeof center.lng === 'number' || !isNaN(parseFloat(center.lng)));
        if (hasValidCenter) {
            return {
                lat: typeof center.lat === 'number' ? center.lat : parseFloat(center.lat),
                lng: typeof center.lng === 'number' ? center.lng : parseFloat(center.lng)
            };
        }
        if (listings.length > 0) {
            const validListings = listings.filter(l => l.latitude && l.longitude);
            if (validListings.length > 0) {
                return {
                    lat: parseFloat(validListings[0].latitude),
                    lng: parseFloat(validListings[0].longitude)
                };
            }
        }
    }, [center, listings]);

    const memoizedMarkers = useMemo(() => {
        const validListings = listings.filter(l => l.latitude && l.longitude);
        if (validListings.length === 0) return null;

        // Base grouping: group listings at exact same coordinates first
        const exactGroups = {};
        validListings.forEach(property => {
            const key = `${parseFloat(property.latitude).toFixed(5)}_${parseFloat(property.longitude).toFixed(5)}`;
            if (!exactGroups[key]) exactGroups[key] = [];
            exactGroups[key].push(property);
        });

        const locations = Object.keys(exactGroups).map(key => ({
            key,
            lat: parseFloat(exactGroups[key][0].latitude),
            lng: parseFloat(exactGroups[key][0].longitude),
            properties: exactGroups[key]
        }));

        // Dynamic Distance Clustering
        const RADIUS_PX = 45; // Minimum pixel distance before markers cluster
        // Approximate degrees per pixel based on zoom
        const pixelsPerLngDegree = (256 * Math.pow(2, effectiveZoom)) / 360;
        const threshold = RADIUS_PX / pixelsPerLngDegree;

        const clusters = [];
        const visited = new Set();

        for (let i = 0; i < locations.length; i++) {
            if (visited.has(i)) continue;
            
            const locA = locations[i];
            const clusterProps = [...locA.properties];
            visited.add(i);

            // Greedily gather all nearby locations
            for (let j = i + 1; j < locations.length; j++) {
                if (visited.has(j)) continue;
                const locB = locations[j];
                
                // Pythagorean distance in degrees
                const dLat = locA.lat - locB.lat;
                const dLng = locA.lng - locB.lng;
                const distance = Math.sqrt(dLat * dLat + dLng * dLng);

                if (distance <= threshold) {
                    clusterProps.push(...locB.properties);
                    visited.add(j);
                }
            }
            
            clusters.push({
                lat: locA.lat,
                lng: locA.lng,
                properties: clusterProps
            });
        }

        return clusters.map((cluster, index) => {
            const groupProperties = cluster.properties;
            // Generate a stable key for React tracking
            const key = groupProperties.map(p => p.id).sort().join('_').substring(0, 40) + `_${index}`;

            if (groupProperties.length === 1) {
                const property = groupProperties[0];
                return (
                    <PropertyMarker
                        key={property.id}
                        property={property}
                        onClick={onMarkerClick}
                        onSaveClick={onSaveClick}
                        savedListingIds={savedListingIds}
                        highlightedMarkerListingId={highlightedMarkerListingId}
                        openedMarkerId={openedMarkerId}
                        onOpenedMarkerChange={onOpenedMarkerChange}
                        onCardToggle={handleCardToggle}
                        onCloseCard={handleCloseCard}
                        markerType={markerType}
                        isZoomedIn={isZoomedIn}
                        formatPrice={formatPrice}
                    />
                );
            } else {
                return (
                    <PropertyClusterMarker
                        key={key}
                        properties={groupProperties}
                        onClick={onMarkerClick}
                        onSaveClick={onSaveClick}
                        savedListingIds={savedListingIds}
                        highlightedMarkerListingId={highlightedMarkerListingId}
                        openedMarkerId={openedMarkerId}
                        onCardToggle={handleCardToggle}
                        onCloseCard={handleCloseCard}
                        markerType={markerType}
                        isZoomedIn={isZoomedIn}
                        formatPrice={formatPrice}
                    />
                );
            }
        });
    }, [listings, onMarkerClick, onSaveClick, savedListingIds, highlightedMarkerListingId, openedMarkerId, onOpenedMarkerChange, handleCardToggle, handleCloseCard, markerType, isZoomedIn, formatPrice, effectiveZoom]);

    if (!isLoaded) return <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Maps...</div>;

    return (
        <div className={`relative w-full h-full transition-opacity duration-700 ease-in-out ${isFitted ? 'opacity-100' : 'opacity-0'}`}>
            <style>{`
                .marker-group {
                    will-change: transform;
                    backface-visibility: hidden;
                    transform-style: preserve-3d;
                }
                .marker-group .resting-pill {
                    background: rgba(34, 34, 34, 0.9);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    color: white;
                    padding: 7px 14px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    border-radius: 9999px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    min-width: 65px;
                    justify-content: center;
                    cursor: pointer;
                    border: 1.5px solid #222222;
                }
                .dark .marker-group .resting-pill {
                    background: rgba(255, 255, 255, 0.9);
                    color: #1a1a1a;
                    border: 1.5px solid rgba(0,0,0,0.1);
                    box-shadow: 
                        0 4px 15px rgba(0,0,0,0.2),
                        inset 0 1px 1px rgba(255,255,255,0.5);
                }
                .marker-group .home-marker {
                    background: rgba(34, 34, 34, 0.9);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 
                        0 4px 15px rgba(0,0,0,0.3),
                        inset 0 1px 1px rgba(255,255,255,0.2);
                    border: 1.5px solid #222222;
                    color: white;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                .dark .marker-group .home-marker {
                    background: rgba(255, 255, 255, 0.9);
                    color: #1a1a1a;
                    border: 1.5px solid #1a1a1a;
                }
                .marker-group .resting-pill .price-text { font-size: 13px; font-weight: 600; white-space: nowrap; letter-spacing: -0.01em; }
                .marker-group .resting-nub { fill: rgba(34, 34, 34, 0.9); margin-top: -1px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
                .dark .marker-group .resting-nub { fill: rgba(255, 255, 255, 0.9); }
                .count-badge {
                    background: rgba(34, 34, 34, 0.9);
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    box-shadow: 
                        0 4px 10px rgba(0,0,0,0.3),
                        inset 0 1px 1px rgba(255,255,255,0.2);
                    border: 1.5px solid rgba(255,255,255,0.9);
                }
                .dark .count-badge {
                    background: rgba(255, 255, 255, 0.9);
                    color: #1a1a1a;
                    border: 1.5px solid #1a1a1a;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                }

                .marker-group.opened, .marker-group:hover { z-index: 1000; }
                
                .marker-group.opened .resting-pill, .marker-group.list-highlighted .resting-pill {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.25) !important;
                    background: ${primaryColor} !important;
                    color: #ffffff !important;
                    border: 1.5px solid ${primaryColor} !important;
                }
                .marker-group:hover .resting-pill {
                    background: ${primaryColor} !important;
                    color: #ffffff !important;
                    border: 1.5px solid ${primaryColor} !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.25) !important;
                }
                .dark .marker-group:hover .resting-pill {
                    background: ${primaryColor} !important;
                    color: #ffffff !important;
                    border: 1.5px solid ${primaryColor} !important;
                }
                .count-badge {
                    background: #222222 !important;
                    color: #ffffff !important;
                    border: 1.5px solid #ffffff !important;
                }
                .marker-group:hover .count-badge, .marker-group.opened .count-badge {
                    background: ${primaryColor} !important;
                    color: #ffffff !important;
                    border-color: ${primaryColor} !important;
                }
                .marker-group.opened .resting-nub, .marker-group.list-highlighted .resting-nub, .marker-group:hover .resting-nub {
                    fill: ${primaryColor} !important;
                    transform: translateY(-2px) scale(1.1) !important;
                }
                .dark .marker-group.opened .resting-nub, .dark .marker-group.list-highlighted .resting-nub, .dark .marker-group:hover .resting-nub {
                    fill: ${primaryColor} !important;
                }

                .marker-group.opened .home-marker, .marker-group:hover .home-marker { 
                    background: ${primaryColor} !important; color: #ffffff !important; border-color: ${primaryColor} !important;
                }
                .dark .marker-group.opened .home-marker, .dark .marker-group:hover .home-marker { 
                    background: ${primaryColor} !important; color: #ffffff !important; border-color: ${primaryColor} !important;
                }

                .marker-group.opened .expanded-card { width: 320px; opacity: 1; pointer-events: auto; }
                .expanded-card { pointer-events: none; }
            `}</style>


            {displayLoading && (
                <div className="absolute top-0 left-0 right-0 z-[15] flex justify-center pt-3 pointer-events-none">
                    <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200 flex items-center gap-1">
                        <span className="text-gray-600 text-sm font-medium">Loading</span>
                        <div className="flex gap-0.5">
                            <div className="w-1 h-1 rounded-full bg-gray-400 animate-pulse" />
                            <div className="w-1 h-1 rounded-full bg-gray-400 animate-pulse [animation-delay:200ms]" />
                            <div className="w-1 h-1 rounded-full bg-gray-400 animate-pulse [animation-delay:400ms]" />
                        </div>
                    </div>
                </div>
            )}
            <GoogleMap
                mapContainerStyle={mapStyle}
                center={mapCenter}
                zoom={effectiveZoom}
                onLoad={setMap}
                options={mapOptions}
                onIdle={handleBoundsChanged}
                onDragStart={() => {
                    isDraggingRef.current = true;
                    internalMoveRef.current = true;
                    lastMoveTimestampRef.current = Date.now();
                    cancelPendingFetch();
                    // Clear any pending cooldown from a previous drag
                    if (dragEndCooldownRef.current) {
                        clearTimeout(dragEndCooldownRef.current);
                        dragEndCooldownRef.current = null;
                    }
                }}
                onDrag={() => {
                    // Constant update to lastMoveTimestamp while dragging to keep the lock active
                    lastMoveTimestampRef.current = Date.now(); 
                }}
                onDragEnd={() => {
                    // AIRBNB-STYLE: Don't immediately allow onIdle to fire.
                    // Wait 500ms after finger lifts — if user starts a new drag within
                    // this window, the cooldown is cleared and no fetch happens.
                    lastMoveTimestampRef.current = Date.now();
                    if (dragEndCooldownRef.current) clearTimeout(dragEndCooldownRef.current);
                    dragEndCooldownRef.current = setTimeout(() => {
                        isDraggingRef.current = false;
                        dragEndCooldownRef.current = null;
                        // Now manually trigger the idle handler since the real onIdle
                        // may have already fired (and been suppressed) while we were in cooldown
                        handleBoundsChanged();
                    }, 500);
                }}
                onZoomChanged={() => {
                    internalMoveRef.current = true;
                    lastMoveTimestampRef.current = Date.now();
                    cancelPendingFetch();
                }}
                onClick={onClick}
            >
                {/* Always show markers, handle style changes transparently */}
                {memoizedMarkers}
            </GoogleMap>


            {/* Settings Button (Mobile Only) - Placed under the filter button */}
            {isMobile && !hideSettingsButton && map && (
                <div className="absolute top-[92px] right-6 z-[210]" ref={settingsRef}>
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className="w-14 h-14 flex items-center justify-center bg-[#222222]/80 backdrop-blur-xl rounded-full shadow-2xl border border-white/10 text-white hover:bg-[#222222]/95 transition-all active:scale-90 group"
                        aria-label="Map settings"
                    >
                        <IoSettingsOutline className={`w-7 h-7 transition-transform duration-500 ${isSettingsOpen ? 'rotate-90' : 'rotate-0'}`} />
                    </button>
                </div>
            )}

            {/* CUSTOM CONTROLS — Liquid Glass Design restorative fix */}
            {!hideCustomControls && map && (
                <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-3">
                    
                    {/* Settings Button (Desktop Only) */}
                    {!isMobile && !hideSettingsButton && (
                        <div className="relative" ref={settingsRef}>
                            <button
                                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                className="w-12 h-12 flex items-center justify-center bg-[#222222]/80 backdrop-blur-xl rounded-full shadow-2xl border border-white/10 text-white hover:bg-[#222222]/95 transition-all active:scale-90 group"
                                aria-label="Map settings"
                            >
                                <IoSettingsOutline className={`w-5 h-5 transition-transform duration-500 ${isSettingsOpen ? 'rotate-90' : 'rotate-0'}`} />
                            </button>
                            
                            {/* Desktop Settings Dropdown */}
                            {isSettingsOpen && (
                                <div className="absolute bottom-0 right-[calc(100%+16px)] w-60 bg-[#222222]/85 backdrop-blur-3xl rounded-[24px] shadow-2xl border border-white/10 p-5 animate-in fade-in slide-in-from-right-2 duration-300">
                                    <h4 className="text-[16px] font-bold text-white mb-5 px-1">Settings</h4>
                                    <div className="flex flex-col gap-4">
                                        {/* Map Theme Toggle */}
                                        <div 
                                            className="flex items-center gap-3 cursor-pointer group" 
                                            onClick={() => setUseModernMap(!useModernMap)}
                                        >
                                            <button
                                                type="button"
                                                className="relative w-[38px] h-[22px] rounded-full transition-all duration-500 ease-in-out bg-white/20 p-0.5 overflow-hidden flex-none group-hover:bg-white/30"
                                            >
                                                <div className={`absolute inset-0 transition-all duration-500 rounded-full ${useModernMap ? 'bg-white opacity-100' : 'bg-black/5 opacity-0'}`} />
                                                <div className={`absolute top-[2px] w-[18px] h-[18px] rounded-full transition-all duration-500 shadow-[0_1px_4px_rgba(0,0,0,0.2)] z-10 ${useModernMap ? 'translate-x-[16px] bg-[#222222]' : 'translate-x-0 bg-white'}`} 
                                                    style={{ transitionTimingFunction: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)' }}
                                                />
                                            </button>
                                            <span className="text-[14px] font-semibold text-white/90 group-hover:text-white transition-colors">
                                                Modern Map Style
                                            </span>
                                        </div>

                                        {/* Short Price Toggle */}
                                        <div 
                                            className="flex items-center gap-3 cursor-pointer group" 
                                            onClick={() => setUseShortPrice(!useShortPrice)}
                                        >
                                            <button
                                                type="button"
                                                className="relative w-[38px] h-[22px] rounded-full transition-all duration-500 ease-in-out bg-white/20 p-0.5 overflow-hidden flex-none group-hover:bg-white/30"
                                            >
                                                <div className={`absolute inset-0 transition-all duration-500 rounded-full ${useShortPrice ? 'bg-white opacity-100' : 'bg-black/5 opacity-0'}`} />
                                                <div className={`absolute top-[2px] w-[18px] h-[18px] rounded-full transition-all duration-500 shadow-[0_1px_4px_rgba(0,0,0,0.2)] z-10 ${useShortPrice ? 'translate-x-[16px] bg-[#222222]' : 'translate-x-0 bg-white'}`} 
                                                    style={{ transitionTimingFunction: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)' }}
                                                />
                                            </button>
                                            <span className="text-[14px] font-semibold text-white/90 group-hover:text-white transition-colors">
                                                {useShortPrice ? 'Show as 1K' : 'Show as 1,000'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Zoom In */}
                    {!hideControls && (
                        <button
                            onClick={() => map.setZoom(map.getZoom() + 1)}
                            className="w-12 h-12 flex items-center justify-center bg-[#222222]/80 backdrop-blur-xl rounded-full shadow-2xl border border-white/10 text-white hover:bg-[#222222]/95 transition-all active:scale-90 group"
                            aria-label="Zoom in"
                            title="Zoom In"
                        >
                            <PlusIcon className="w-5 h-5 stroke-[2.5]" />
                        </button>
                    )}

                    {/* Sync/Reload Button */}
                    {!hideSyncButton && (
                        <button
                            onClick={() => {
                                if (listingsWithCoords.length > 0) {
                                    const bounds = new window.google.maps.LatLngBounds();
                                    listingsWithCoords.forEach(l => bounds.extend({ lat: parseFloat(l.latitude), lng: parseFloat(l.longitude) }));
                                    map.fitBounds(bounds, effectivePadding);
                                } else {
                                    map.setCenter(mapCenter);
                                    map.setZoom(effectiveZoom);
                                }
                            }}
                            className="w-12 h-12 flex items-center justify-center bg-[#222222]/80 backdrop-blur-xl rounded-full shadow-2xl border border-white/10 text-white hover:bg-[#222222]/95 transition-all active:scale-90 group"
                            aria-label="Sync map"
                            title="Sync Map"
                        >
                            <ArrowPathIcon className="w-5 h-5 stroke-[2] group-active:rotate-180 transition-transform duration-500" />
                        </button>
                    )}

                    {/* Zoom Out */}
                    {!hideControls && (
                        <button
                            onClick={() => map.setZoom(map.getZoom() - 1)}
                            className="w-12 h-12 flex items-center justify-center bg-[#222222]/80 backdrop-blur-xl rounded-full shadow-2xl border border-white/10 text-white hover:bg-[#222222]/95 transition-all active:scale-90 group"
                            aria-label="Zoom out"
                            title="Zoom Out"
                        >
                            <MinusIcon className="w-5 h-5 stroke-[2.5]" />
                        </button>
                    )}

                    {/* Expand Button */}
                    {onExpandClick && !isExpanded && (
                        <button
                            onClick={onExpandClick}
                            className="w-12 h-12 flex items-center justify-center bg-[#222222]/80 backdrop-blur-xl rounded-full shadow-2xl border border-white/10 text-white hover:bg-[#222222]/95 transition-all active:scale-90 group"
                            aria-label="Expand map"
                            title="Expand Map"
                        >
                            <ArrowsPointingOutIcon className="w-5 h-5 stroke-[2]" />
                        </button>
                    )}
                </div>
            )}

            {/* Mobile Settings Bottom Sheet (Rendered via Portal to escape stacking context) */}
            {isSettingsOpen && isMobile && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999] pointer-events-none flex items-end justify-center sm:hidden">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-auto transition-opacity" 
                        onClick={() => setIsSettingsOpen(false)} 
                    />
                    
                    {/* Bottom Sheet */}
                    <div ref={bottomSheetRef} className="relative w-full min-h-[50svh] flex flex-col bg-white dark:bg-dashboard-card rounded-t-[32px] shadow-[0_-20px_60px_rgba(0,0,0,0.18)] border-t border-gray-100/30 dark:border-white/10 pointer-events-auto animate-in slide-in-from-bottom-full duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] pb-[env(safe-area-inset-bottom,0px)]">
                        {/* Handle */}
                        <div
                            className="flex justify-center pt-5 pb-2 cursor-pointer shrink-0"
                            onClick={() => setIsSettingsOpen(false)}
                        >
                            <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-white/10" />
                        </div>
                        
                        <div className="px-6 pb-10 pt-4 flex-1">
                            <h3 className="text-[20px] font-bold text-gray-900 dark:text-white mb-8 px-2">Settings</h3>
                            
                            <div className="flex flex-col gap-6">
                                {/* Toggle Switch Row 1 - Map Theme */}
                                <div 
                                    className="flex items-center gap-4 px-2 cursor-pointer select-none"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setUseModernMap(!useModernMap);
                                    }}
                                >
                                    <button
                                        type="button"
                                        className={`relative w-[44px] h-[24px] rounded-full transition-all duration-300 ease-in-out flex-none ${useModernMap ? 'bg-[#222222]' : 'bg-gray-200 dark:bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-[2px] w-[20px] h-[20px] bg-white rounded-full transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.3)] z-10 ${useModernMap ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} 
                                            style={{ transitionTimingFunction: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)' }}
                                        />
                                    </button>
                                    <span className="text-[15px] font-semibold text-gray-900 dark:text-white">Modern Map Style</span>
                                </div>

                                {/* Toggle Switch Row 2 - Short Price */}
                                <div 
                                    className="flex items-center gap-4 px-2 cursor-pointer select-none"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setUseShortPrice(!useShortPrice);
                                    }}
                                >
                                    <button
                                        type="button"
                                        className={`relative w-[44px] h-[24px] rounded-full transition-all duration-300 ease-in-out flex-none ${useShortPrice ? 'bg-[#222222]' : 'bg-gray-200 dark:bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-[2px] w-[20px] h-[20px] bg-white rounded-full transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.3)] z-10 ${useShortPrice ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} 
                                            style={{ transitionTimingFunction: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)' }}
                                        />
                                    </button>
                                    <span className="text-[15px] font-semibold text-gray-900 dark:text-white">Show as 1K</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default React.memo(GoogleMapComponent);
