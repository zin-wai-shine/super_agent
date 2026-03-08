import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';
import {
    XMarkIcon,
    MapPinIcon,
    PlusIcon,
    MinusIcon,
    ArrowPathIcon,
    ArrowsPointingOutIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { getMediaUrl } from '../../utils/media';
import { useTheme } from '../../contexts/ThemeContext';
import { ListingImageSlider } from './ListingCard';

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const LIBRARIES = ['places'];

const options = {
    disableDefaultUI: true,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy',
};

const PropertyMarker = React.memo(({ property, onClick, onSaveClick, savedListingIds = [], highlightedMarkerListingId = null, openedMarkerId = null, onCardToggle, onCloseCard, markerType = 'price' }) => {
    const initialSaved = Array.isArray(savedListingIds) && savedListingIds.some((sid) => String(sid) === String(property.id));
    const isOpened = String(property.id) === String(openedMarkerId);
    const isHighlighted = String(property.id) === String(highlightedMarkerListingId);

    const priceNumber = (property.price != null && property.price !== '')
        ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(property.price))
        : '—';

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

    return (
        <OverlayView
            position={{ lat: parseFloat(property.latitude), lng: parseFloat(property.longitude) }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
            <div
                className={`marker-group ${isHighlighted ? 'list-highlighted' : ''} ${isOpened ? 'opened' : ''} relative flex flex-col items-center`}
                style={{ transform: 'translate(-50%, -100%)' }}
            >
                <style>{`
                    .marker-group .resting-pill {
                        background: #1a1a1a; color: white; padding: 7px 12px; display: flex; align-items: center; gap: 6px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(0,0,0,0.18); transition: all 0.2s ease; min-width: 65px; justify-content: center; cursor: pointer;
                    }
                    .marker-group .home-marker {
                        background: #1a1a1a; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25); border: 2px solid white; color: white; transition: all 0.2s ease; cursor: pointer;
                    }
                    .marker-group .resting-pill .price-text { font-size: 13px; font-weight: 500; white-space: nowrap; }
                    .marker-group .resting-nub { fill: #1a1a1a; margin-top: -1px; }

                    .marker-group.opened, .marker-group:hover { z-index: 1000; }
                    
                    .marker-group.opened .resting-pill, .marker-group.list-highlighted .resting-pill, .marker-group:hover .resting-pill {
                        background: #ffffff; color: #1a1a1a; transform: scale(1.05);
                    }
                    .marker-group.opened .resting-nub, .marker-group.list-highlighted .resting-nub, .marker-group:hover .resting-nub {
                        fill: #ffffff;
                    }
                    .marker-group.opened .home-marker, .marker-group:hover .home-marker { 
                        background: #ffffff; color: #1a1a1a;
                    }

                    .marker-group.opened .expanded-card { width: 320px; opacity: 1; pointer-events: auto; }
                    .expanded-card { pointer-events: none; }
                `}</style>

                {markerType === 'home' ? (
                    <div className="home-marker z-10" onClick={() => onCardToggle(property.id)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                ) : (
                    <div className="resting-pill z-10" onClick={() => onCardToggle(property.id)}>
                        <span className="price-icon text-[15px] font-medium opacity-90 leading-none">฿</span>
                        <span className="price-text">{priceNumber}</span>
                    </div>
                )}

                <svg className="resting-nub flex-none transition-all duration-200 pointer-events-none" width="12" height="6" viewBox="0 0 16 8">
                    <polygon points="0,0 16,0 8,8" />
                </svg>

                {/* EXPANDED CARD */}
                <div
                    className="expanded-card absolute left-1/2 -translate-x-1/2 bottom-[14px] w-0 opacity-0 bg-white/75 backdrop-blur-2xl rounded-[32px] border border-white/60 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col z-20 shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.8)', borderLeft: '1px solid rgba(255,255,255,0.8)' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {isOpened && (
                        <>
                            <div className="relative aspect-[16/10] w-full flex-none overflow-hidden">
                                <ListingImageSlider images={listingImages} title={property.title} cardLink={cardLink} />

                                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-start z-10 pointer-events-none">
                                    {isFeatured && (
                                        <span className="bg-amber-400/90 backdrop-blur-md text-amber-950 text-[10px] font-black px-3 py-1.5 rounded-full shadow-[0_4px_12px_rgba(251,191,36,0.3)] border border-amber-300/50 tracking-[0.1em] uppercase flex items-center gap-1.5">
                                            <SparklesIcon className="w-3 h-3" />
                                            Featured
                                        </span>
                                    )}
                                    <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white shadow-lg border border-white/20 tracking-[0.1em] uppercase">
                                        {listingType === 'sale' ? 'For Sale' : 'For Rent'}
                                    </span>
                                </div>

                                {dateStr && (
                                    <div className="absolute bottom-3 right-3 bg-slate-900/60 backdrop-blur-md text-white/90 text-[9px] font-black px-3 py-1.5 rounded-full tracking-widest uppercase border border-white/10 z-10 pointer-events-none transition-opacity duration-300">
                                        {dateStr}
                                    </div>
                                )}

                                <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onCloseCard(); }}
                                        className="w-10 h-10 rounded-full bg-slate-900/40 backdrop-blur-xl flex items-center justify-center shadow-2xl border border-white/20 text-white transition-all hover:bg-slate-900/60 active:scale-90"
                                    >
                                        <XMarkIcon className="w-5 h-5 stroke-[2.5]" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onSaveClick(property.id, initialSaved); }}
                                        className="w-10 h-10 rounded-full bg-slate-900/40 backdrop-blur-xl flex items-center justify-center shadow-2xl border border-white/20 text-white transition-all hover:bg-slate-900/60 active:scale-90"
                                    >
                                        <svg className={`w-5 h-5 ${initialSaved ? 'text-rose-500 fill-rose-500' : 'text-white fill-transparent'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div
                                className="flex flex-col flex-1 min-w-0 p-[20px] pb-[16px] gap-2.5 cursor-pointer bg-white/95 hover:bg-white transition-colors border-t border-white/50"
                                onClick={() => onClick(property)}
                            >
                                {/* Title */}
                                <div className="text-[17px] font-[600] text-slate-900 leading-snug line-clamp-1 group-hover:text-primary-600 transition-colors">
                                    {property.title}
                                </div>

                                {/* Location */}
                                <div className="flex items-center text-[15px] font-normal text-slate-500 flex-wrap gap-x-2 gap-y-1">
                                    <MapPinIcon className="w-[16px] h-[16px] text-slate-400" />
                                    <span>{district}</span>
                                    {stationName !== '—' && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                            <span className="text-slate-500">{stationName}</span>
                                        </>
                                    )}
                                </div>

                                {/* Property Specs (Beds, Baths, Sqm) */}
                                <div className="flex items-center text-[15px] font-normal text-slate-500 flex-wrap gap-x-1.5 gap-y-1">
                                    <span>{property.bedrooms ?? '—'} Bed</span>
                                    <span className="w-[3px] h-[3px] rounded-full bg-slate-300 mx-0.5"></span>
                                    <span>{property.bathrooms ?? '—'} Bath</span>
                                    <span className="w-[3px] h-[3px] rounded-full bg-slate-300 mx-0.5"></span>
                                    <span>{property.area ?? '—'} Sqm</span>
                                </div>

                                {/* Date Area (Optional based on design) */}
                                {dateStr && (
                                    <div className="text-[14px] font-normal text-slate-400/80 mb-2">
                                        {dateStr}
                                    </div>
                                )}

                                {/* Price */}
                                <div className="flex items-baseline gap-1.5 mt-auto pt-1">
                                    <span className="text-[17px] font-[600] text-slate-900 tracking-tight leading-none">฿{priceNumber}</span>
                                    {listingType === 'rent' && <span className="text-[14px] font-[400] text-slate-500">/ mo</span>}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </OverlayView>
    );
}, (prevProps, nextProps) => {
    const p = prevProps.property;
    const n = nextProps.property;
    return (
        p.id === n.id &&
        p.price === n.price &&
        p.latitude === n.latitude &&
        p.longitude === n.longitude &&
        p.listing_type === n.listing_type &&
        p.title === n.title &&
        p.district === n.district &&
        p.station_name === n.station_name &&
        p.station?.name_en === n.station?.name_en &&
        p.property_type === n.property_type &&
        p.area === n.area &&
        p.bathrooms === n.bathrooms &&
        prevProps.openedMarkerId === nextProps.openedMarkerId &&
        prevProps.highlightedMarkerListingId === nextProps.highlightedMarkerListingId &&
        prevProps.savedListingIds?.length === nextProps.savedListingIds?.length
    );
});

const PADDING = { top: 60, right: 60, bottom: 60, left: 60 };
const MOBILE_PADDING = { top: 150, right: 40, bottom: 250, left: 40 };
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
    showMapLoading = false,
    openedMarkerId: externalOpenedMarkerId,
    onOpenedMarkerChange,
    onClick,
    disableMarkerExpansion = false,
    markerType = 'price'
}) => {
    const isMobile = window.innerWidth < 768;
    const effectiveZoom = zoom !== undefined ? zoom : (isMobile ? DEFAULT_MOBILE_ZOOM : DEFAULT_ZOOM);
    const effectivePadding = isMobile ? MOBILE_PADDING : PADDING;
    const [internalOpenedMarkerId, setInternalOpenedMarkerId] = useState(null);
    const openedMarkerId = disableMarkerExpansion ? null : (externalOpenedMarkerId !== undefined ? externalOpenedMarkerId : internalOpenedMarkerId);

    const [displayLoading, setDisplayLoading] = useState(showMapLoading);

    useEffect(() => {
        if (showMapLoading) {
            setDisplayLoading(true);
        } else {
            const timer = setTimeout(() => setDisplayLoading(false), 800);
            return () => clearTimeout(timer);
        }
    }, [showMapLoading]);

    const handleCardToggle = useCallback((propertyId) => {
        const newValue = String(openedMarkerId) === String(propertyId) ? null : propertyId;
        if (onOpenedMarkerChange) {
            onOpenedMarkerChange(newValue);
        } else {
            setInternalOpenedMarkerId(newValue);
        }
    }, [openedMarkerId, onOpenedMarkerChange]);

    const handleCloseCard = useCallback(() => {
        if (onOpenedMarkerChange) {
            onOpenedMarkerChange(null);
        } else {
            setInternalOpenedMarkerId(null);
        }
    }, [onOpenedMarkerChange]);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
        libraries: LIBRARIES,
    });

    const [map, setMap] = useState(null);
    const boundsTimeoutRef = useRef(null);

    const listingsWithCoords = useMemo(() => listings.filter(l => l.latitude != null && l.longitude != null), [listings]);
    const listingsBoundsKey = useMemo(() => listingsWithCoords.map(l => `${l.id}-${l.latitude}-${l.longitude}`).join(','), [listingsWithCoords]);

    useEffect(() => {
        if (!fitBoundsOnListingsChange || !map || !window.google?.maps) return;
        const withCoords = listingsWithCoords;
        if (withCoords.length === 0) return;
        const bounds = new window.google.maps.LatLngBounds();
        withCoords.forEach(l => bounds.extend({ lat: parseFloat(l.latitude), lng: parseFloat(l.longitude) }));
        map.fitBounds(bounds, effectivePadding);
    }, [map, listingsBoundsKey, fitBoundsOnListingsChange, effectivePadding, listingsWithCoords]);

    const mapOptions = useMemo(() => {
        return {
            ...options,
            ...customOptions,
            ...(hideControls ? {
                zoomControl: false,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            } : {})
        };
    }, [customOptions, hideControls]);

    const handleBoundsChanged = useCallback(() => {
        if (!map || !onBoundsChanged) return;
        if (boundsTimeoutRef.current) clearTimeout(boundsTimeoutRef.current);
        boundsTimeoutRef.current = setTimeout(() => {
            const bounds = map.getBounds();
            const center = map.getCenter();
            const zoom = map.getZoom();
            if (bounds && center) {
                const ne = bounds.getNorthEast();
                const sw = bounds.getSouthWest();
                onBoundsChanged({
                    min_lat: sw.lat(),
                    max_lat: ne.lat(),
                    min_lng: sw.lng(),
                    max_lng: ne.lng(),
                    center: { lat: center.lat(), lng: center.lng() },
                    zoom: zoom
                });
            }
        }, 250);
    }, [map, onBoundsChanged]);

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
        return { lat: 13.7563, lng: 100.5018 }; // Bangkok
    }, [center, listings]);

    if (!isLoaded) return <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Maps...</div>;

    return (
        <div className="relative w-full h-full">
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
                onClick={onClick}
            >
                {listings.filter(l => l.latitude && l.longitude).map((property) => (
                    <PropertyMarker
                        key={property.id}
                        property={property}
                        onClick={onMarkerClick}
                        onSaveClick={onSaveClick}
                        savedListingIds={savedListingIds}
                        highlightedMarkerListingId={highlightedMarkerListingId}
                        openedMarkerId={openedMarkerId}
                        onCardToggle={handleCardToggle}
                        onCloseCard={handleCloseCard}
                        markerType={markerType}
                    />
                ))}
            </GoogleMap>

            {/* CUSTOM CONTROLS — Liquid Glass Design restorative fix */}
            {!hideCustomControls && map && (
                <div className="absolute bottom-6 right-6 z-20 flex flex-col items-center gap-3">
                    {/* Zoom Pill */}
                    {!hideControls && (
                        <div className="bg-white/70 backdrop-blur-xl rounded-full shadow-2xl border border-white/50 flex flex-col p-1 overflow-hidden">
                            <button
                                onClick={() => map.setZoom(map.getZoom() + 1)}
                                className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-white/30 transition-all active:scale-90"
                                aria-label="Zoom in"
                            >
                                <PlusIcon className="w-5 h-5 stroke-[2.5]" />
                            </button>
                            <div className="h-px bg-white/40 mx-2" />
                            <button
                                onClick={() => map.setZoom(map.getZoom() - 1)}
                                className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-white/30 transition-all active:scale-90"
                                aria-label="Zoom out"
                            >
                                <MinusIcon className="w-5 h-5 stroke-[2.5]" />
                            </button>
                        </div>
                    )}

                    {/* Sync Button */}
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
                        className="w-12 h-12 bg-white/70 backdrop-blur-xl rounded-full shadow-2xl border border-white/50 flex items-center justify-center text-slate-700 hover:bg-white/30 transition-all active:scale-95 group"
                        aria-label="Sync map"
                    >
                        <ArrowPathIcon className="w-5 h-5 stroke-[2] group-active:rotate-180 transition-transform duration-500" />
                    </button>

                    {/* Expand Button */}
                    {onExpandClick && !isExpanded && (
                        <button
                            onClick={onExpandClick}
                            className="w-12 h-12 bg-white/70 backdrop-blur-xl rounded-full shadow-2xl border border-white/50 flex items-center justify-center text-slate-700 hover:bg-white/30 transition-all active:scale-95"
                            aria-label="Expand map"
                        >
                            <ArrowsPointingOutIcon className="w-5 h-5 stroke-[2]" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default React.memo(GoogleMapComponent);
