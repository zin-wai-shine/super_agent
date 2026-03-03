import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { GoogleMap, Marker, OverlayView, useJsApiLoader } from '@react-google-maps/api';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon, PlusIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getMediaUrl } from '../../utils/media';
import { useTheme } from '../../contexts/ThemeContext';

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const LIBRARIES = ['places', 'marker'];

const options = {
    disableDefaultUI: true,
    zoomControl: false, // Use custom zoom + fullscreen controls
    gestureHandling: 'greedy', // Allow direct scroll zoom without Cmd key
    // mapId and styles are handled dynamically in mapOptions useMemo
    mapId: 'DEMO_MAP_ID'
};

const PropertyMarker = React.memo(({ map, property, onClick, onSaveClick, savedListingIds = [], useDefaultMarkers, highlightedMarkerListingId = null, openedMarkerId = null, onCardToggle, onCloseCard, markerType = 'price' }) => {
    const { theme } = useTheme();
    const primaryColor = theme?.primaryColor || '#2663EB';
    const initialSaved = Array.isArray(savedListingIds) && savedListingIds.some((sid) => String(sid) === String(property.id));

    const [marker, setMarker] = useState(null);
    const contentRef = React.useRef(null);
    const lastContentRef = React.useRef('');
    const saveBtnListenerRef = React.useRef(null);

    // Initial Marker Creation
    React.useEffect(() => {
        if (!map || !property.latitude || !property.longitude || marker) return;

        let markerContent = null;
        if (!useDefaultMarkers) {
            const content = document.createElement('div');
            // Ensure the container itself can show overflow for the card
            content.className = 'marker-container relative';
            contentRef.current = content;
            markerContent = content;
        }

        const newMarker = new window.google.maps.marker.AdvancedMarkerElement({
            map,
            position: {
                lat: parseFloat(property.latitude),
                lng: parseFloat(property.longitude),
            },
            content: markerContent, // If null/undefined, uses default pin
            title: '', // Remove title to stop the native grey tooltip
            collisionBehavior: window.google.maps.CollisionBehavior.REQUIRED,
        });

        const listener = newMarker.addListener('click', () => {
            if (onCardToggle) onCardToggle(property.id);
        });

        const handleMouseEnter = () => {
            if (newMarker) {
                newMarker.zIndex = 10000;
                if (contentRef.current) contentRef.current.style.zIndex = "10000";
            }
        };

        const handleMouseLeave = () => {
            if (newMarker) {
                newMarker.zIndex = 1;
                if (contentRef.current) contentRef.current.style.zIndex = "1";
            }
        };

        const content = contentRef.current;
        if (content) {
            // Use a slight delay to ensure the DOM is ready if needed, but usually it's immediate
            setTimeout(() => {
                const group = content.querySelector('.marker-group');
                group?.addEventListener('mouseenter', handleMouseEnter);
                group?.addEventListener('mouseleave', handleMouseLeave);
            }, 0);
        }

        setMarker(newMarker);

        return () => {
            newMarker.map = null;
            if (listener) {
                listener.remove();
            }
            if (content) {
                const group = content.querySelector('.marker-group');
                group?.removeEventListener('mouseenter', handleMouseEnter);
                group?.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [map, useDefaultMarkers, property.id, property.latitude, property.longitude]);

    // Sync Data (Price/Position)
    React.useEffect(() => {
        // If using default markers, skip content updates
        if (useDefaultMarkers || !marker || !contentRef.current) return;

        const priceFormatted = new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            maximumFractionDigits: 0,
        }).format(property.price);

        const priceNumber = (property.price != null && property.price !== '') ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(property.price)) : '—';

        const imageUrl = getMediaUrl(property.media?.find(m => m.type === 'image')?.url);
        const district = property.district || '—';
        const stationRaw = property.station?.name_en || property.station_name || '';
        const stationName = (typeof stationRaw === 'string' ? stationRaw.split('(')[0].trim() : '') || '—';
        const typeLine = (property.property_type || 'Property') + ' • ' + (property.listing_type === 'sale' ? 'Sale' : 'Rent');
        const isFeatured = property.is_featured === true || property.is_featured === '1';
        const listingType = property.listing_type || 'rent';
        const dateStr = property.created_at ? (() => { try { const d = new Date(property.created_at); return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch (_) { return ''; } })() : '';
        const priceUnit = property.price_unit || 'THB';

        const saveIconSvg = initialSaved
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="${primaryColor}" stroke="${primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>`;

        const newInnerHTML = `
            <style>
                @keyframes marker-pulse-in {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    100% { transform: translate(-50%, -100%) scale(1); opacity: 1; }
                }
                .marker-group {
                    animation: marker-pulse-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
                }
                /* Initial: pill and nub black; when card opened: pill and nub dark, card visible (click-only) */
                .marker-group .resting-pill {
                    background: #1a1a1a;
                    border: none;
                    color: white;
                    padding: 7px 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    border-radius: 9999px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.18);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    min-width: 65px;
                    justify-content: center;
                }
                .marker-group .home-marker {
                    background: #1a1a1a;
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                    border: 2px solid white;
                    color: white;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .marker-group .home-marker svg {
                    width: 22px;
                    height: 22px;
                }
                .marker-group .resting-pill .resting-pill-icon { color: white; flex-shrink: 0; }
                .marker-group .resting-pill .price-text { 
                    font-size: 13px; 
                    font-weight: 500; 
                    white-space: nowrap;
                    letter-spacing: -0.01em;
                }
                .marker-group .resting-nub { fill: #1a1a1a; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); transition: fill 0.2s ease; margin-top: -1px; }

                .marker-group.opened .resting-pill,
                .marker-group.list-highlighted .resting-pill,
                .marker-group:hover .resting-pill {
                    background: #ffffff;
                    color: #1a1a1a;
                    transform: scale(1.05);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.15);
                }
                .marker-group.opened .resting-nub,
                .marker-group.list-highlighted .resting-nub,
                .marker-group:hover .resting-nub,
                .marker-group.opened .home-marker,
                .marker-group:hover .home-marker { 
                    fill: #ffffff; 
                    background: #ffffff;
                    color: #1a1a1a;
                    transform: scale(1.05);
                }

                .marker-group.opened .expanded-card { width: 320px; min-height: 320px; opacity: 1; padding: 0; }
                .marker-group.opened .expanded-content { opacity: 1; }

                /* Hide hover card when Save is clicked */
                .marker-group.save-clicked .expanded-card { width: 0; height: 0; opacity: 0; pointer-events: none; overflow: hidden; transition: width 0.2s ease, height 0.2s ease, opacity 0.2s ease; }
                .marker-group.save-clicked .expanded-content { opacity: 0; }
            </style>
            <div class="marker-group group ${String(property.id) === String(highlightedMarkerListingId) ? 'list-highlighted' : ''} ${String(property.id) === String(openedMarkerId) ? 'opened' : ''} relative cursor-pointer flex flex-col items-center" style="transform: translate(-50%, -100%);">
                <!-- Resting Pill: Price + Baht Icon -->
                ${markerType === 'home' ? `
                    <div class="home-marker z-10">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                ` : `
                    <div class="resting-pill z-10">
                        <span class="price-icon text-[15px] font-medium opacity-90 leading-none">฿</span>
                        <span class="price-text">${priceNumber}</span>
                    </div>
                `}
                <svg class="resting-nub flex-none transition-all duration-200 pointer-events-none" width="12" height="6" viewBox="0 0 16 8">
                    <polygon points="0,0 16,0 8,8" />
                </svg>

                <!-- EXPANDED CARD (click to open): image on top, content below; click inside does not toggle -->
                <div class="expanded-card absolute left-1/2 -translate-x-1/2 bottom-[12px] w-0 min-h-0 opacity-0 bg-white rounded-[24px] border border-gray-100 overflow-hidden transition-all duration-300 ease-out flex flex-col z-10" style="box-shadow: 8px 0 20px -4px rgba(0,0,0,0.12), 0 8px 20px -4px rgba(0,0,0,0.12);">
                    <!-- Image on top (same as main card) -->
                    <div class="expanded-content opacity-0 transition-opacity duration-300 relative aspect-[16/10] w-full flex-none overflow-hidden">
                        <img src="${imageUrl}" class="w-full h-full object-cover" alt="" />
                        <div class="absolute top-2 left-2 flex flex-wrap gap-1.5 items-start z-10">
                            ${isFeatured ? '<span class="bg-[#2f3e46]/90 backdrop-blur-md text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md tracking-wider">Featured</span>' : ''}
                            <span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2f3e46]/90 backdrop-blur-md text-white shadow-sm tracking-tight">${listingType === 'sale' ? 'For Sale' : 'For Rent'}</span>
                        </div>
                        ${dateStr ? `<div class="absolute bottom-2 right-2 bg-[#2f3e46]/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider border border-white/10">${dateStr}</div>` : ''}
                        <div class="absolute top-2 right-2 z-10 flex items-center gap-1.5">
                            <div class="w-9 h-9 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-sm border border-gray-100/80 cursor-pointer hover:bg-white transition-colors pointer-events-auto" data-marker-close role="button" tabindex="0" aria-label="Close"><svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></div>
                            <div class="w-9 h-9 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-sm border border-gray-100/80 cursor-pointer hover:bg-white transition-colors pointer-events-auto" data-marker-save role="button" tabindex="0" aria-label="${initialSaved ? 'Unsave' : 'Save'} listing">${saveIconSvg}</div>
                        </div>
                    </div>
                    <!-- Content below (price, title, location, stats – like main card) -->
                    <div class="expanded-content opacity-0 transition-opacity duration-300 flex flex-col flex-1 min-w-0 p-3 gap-2">
                        <div class="flex items-center justify-between">
                            <div class="flex items-baseline gap-1 text-gray-900">
                                <span class="text-lg font-semibold tracking-tight">${priceNumber}</span>
                                <span class="text-[11px] font-medium text-gray-400 tracking-wide">${priceUnit}</span>
                                ${listingType === 'rent' ? '<span class="text-[11px] font-medium text-gray-400">/mo</span>' : ''}
                            </div>
                            <span class="text-[10px] text-gray-300 font-mono opacity-60">#${String(property.id).slice(0, 6)}</span>
                        </div>
                        <div class="text-[14px] font-semibold text-gray-900 leading-tight line-clamp-2">${property.title}</div>
                        <div class="flex items-center text-[13px] text-gray-700 flex-wrap gap-x-2 gap-y-0.5">
                            <span class="flex items-center gap-0.5"><svg class="w-4 h-4 text-gray-700 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>${district}</span>
                            <span class="w-px h-2.5 bg-gray-200"></span>
                            <span class="flex items-center gap-0.5"><svg class="w-4 h-4 text-gray-700 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 3v2m-6 4h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2zm0 4h12M6 15v2m12-2v2"/></svg>${stationName}</span>
                        </div>
                        <div class="flex items-center gap-4 text-[13px] text-gray-700">
                            <span><span class="font-bold">${property.bedrooms ?? '—'}</span> <span class="font-medium">bed</span></span>
                            <span><span class="font-bold">${property.bathrooms ?? '—'}</span> <span class="font-medium">bath</span></span>
                            <span><span class="font-bold">${property.area ?? '—'}</span> <span class="font-medium">sqm</span></span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Only update DOM if content actually changed
        if (lastContentRef.current !== newInnerHTML) {
            contentRef.current.innerHTML = newInnerHTML;
            lastContentRef.current = newInnerHTML;
        }

        // Save button: stop propagation, call onSaveClick, then hide card
        const markerGroup = contentRef.current?.querySelector('.marker-group');
        const saveBtn = contentRef.current?.querySelector('[data-marker-save]');
        const closeBtn = contentRef.current?.querySelector('[data-marker-close]');
        if (saveBtn && onSaveClick) {
            if (saveBtnListenerRef.current?.el) {
                try {
                    saveBtnListenerRef.current.el.removeEventListener('click', saveBtnListenerRef.current.handler);
                    saveBtnListenerRef.current.el.removeEventListener('keydown', saveBtnListenerRef.current.keyHandler);
                } catch (_) { }
            }
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                onSaveClick(property.id, initialSaved);
                if (markerGroup) markerGroup.classList.add('save-clicked');
            };
            const keyHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(e); }
            };
            saveBtn.addEventListener('click', handler);
            saveBtn.addEventListener('keydown', keyHandler);
            saveBtnListenerRef.current = { el: saveBtn, handler, keyHandler };
        }
        if (closeBtn && onCloseCard) {
            const closeHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                onCloseCard();
            };
            closeBtn.addEventListener('click', closeHandler);
            closeBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeHandler(e); } });
        }
        let cardClickCleanup = null;
        const expandedCardEl = contentRef.current?.querySelector('.expanded-card');
        if (expandedCardEl) {
            const handleCardClick = (e) => {
                e.stopPropagation();
                if (e.target.closest('[data-marker-save]') || e.target.closest('[data-marker-close]')) return;
                if (onClick) onClick(property);
            };
            expandedCardEl.addEventListener('click', handleCardClick);
            cardClickCleanup = () => expandedCardEl.removeEventListener('click', handleCardClick);
        }
        if (markerGroup) {
            const removeSaveClicked = () => markerGroup.classList.remove('save-clicked');
            markerGroup.addEventListener('mouseleave', removeSaveClicked);
        }

        // Raise z-index on hover to ensure expanded card is never clipped by other markers
        const hoverListener = marker.addListener('mouseover', () => {
            marker.zIndex = 1000;
        });
        const outListener = marker.addListener('mouseout', () => {
            marker.zIndex = 1;
        });

        // Update position if it changed
        const newPos = {
            lat: parseFloat(property.latitude),
            lng: parseFloat(property.longitude),
        };

        if (marker.position.lat !== newPos.lat || marker.position.lng !== newPos.lng) {
            marker.position = newPos;
        }

        return () => {
            hoverListener.remove();
            outListener.remove();
            if (cardClickCleanup) cardClickCleanup();
            if (saveBtnListenerRef.current?.el) {
                try {
                    saveBtnListenerRef.current.el.removeEventListener('click', saveBtnListenerRef.current.handler);
                    saveBtnListenerRef.current.el.removeEventListener('keydown', saveBtnListenerRef.current.keyHandler);
                } catch (_) { }
                saveBtnListenerRef.current = null;
            }
        };
    }, [marker, property.id, property.price, property.listing_type, property.latitude, property.longitude, property.title, property.property_type, property.media, property.district, property.station, property.station_name, property.bedrooms, property.bathrooms, property.area, useDefaultMarkers, onSaveClick, initialSaved, savedListingIds, highlightedMarkerListingId, openedMarkerId, onCardToggle, onCloseCard, markerType]);

    return null;
}, (prevProps, nextProps) => {
    const p = prevProps.property;
    const n = nextProps.property;
    return (
        prevProps.map === nextProps.map &&
        prevProps.useDefaultMarkers === nextProps.useDefaultMarkers &&
        p.id === n.id &&
        p.price === n.price &&
        p.latitude === n.latitude &&
        p.longitude === n.longitude &&
        p.listing_type === n.listing_type &&
        p.title === n.title &&
        p.district === n.district &&
        (p.station_name === n.station_name && (p.station?.name_en === n.station?.name_en)) &&
        p.property_type === n.property_type &&
        p.area === n.area &&
        p.bathrooms === n.bathrooms &&
        prevProps.onSaveClick === nextProps.onSaveClick &&
        (prevProps.savedListingIds?.length === nextProps.savedListingIds?.length && (prevProps.savedListingIds || []).every((id, i) => (nextProps.savedListingIds || [])[i] === id)) &&
        prevProps.highlightedMarkerListingId === nextProps.highlightedMarkerListingId &&
        prevProps.openedMarkerId === nextProps.openedMarkerId &&
        prevProps.onCardToggle === nextProps.onCardToggle &&
        prevProps.onCloseCard === nextProps.onCloseCard &&
        prevProps.markerType === nextProps.markerType
    );
});

const PADDING = { top: 60, right: 60, bottom: 60, left: 60 };
const MOBILE_PADDING = { top: 150, right: 40, bottom: 250, left: 40 };
const DEFAULT_ZOOM = 12;
const DEFAULT_MOBILE_ZOOM = 10;

const GoogleMapComponent = ({ listings = [], center, zoom, onMarkerClick, onBoundsChanged, onExpandClick, isExpanded, mapStyle = mapContainerStyle, options: customOptions, useDefaultMarkers = false, onSaveClick, savedListingIds = [], highlightedMarkerListingId = null, isVisible = true, hideControls = false, hideCustomControls = false, fitBoundsOnListingsChange = true, showMapLoading = false, openedMarkerId: externalOpenedMarkerId, onOpenedMarkerChange, onClick, disableMarkerExpansion = false, markerType = 'price' }) => {
    const isMobile = window.innerWidth < 768;
    const effectiveZoom = zoom !== undefined ? zoom : (isMobile ? DEFAULT_MOBILE_ZOOM : DEFAULT_ZOOM);
    const effectivePadding = isMobile ? MOBILE_PADDING : PADDING;
    const [internalOpenedMarkerId, setInternalOpenedMarkerId] = useState(null);
    const openedMarkerId = disableMarkerExpansion ? null : (externalOpenedMarkerId !== undefined ? externalOpenedMarkerId : internalOpenedMarkerId);

    const [mapType, setMapType] = useState('roadmap');
    const [displayLoading, setDisplayLoading] = useState(showMapLoading);

    React.useEffect(() => {
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
        version: 'weekly'
    });


    const [map, setMap] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const boundsTimeoutRef = React.useRef(null);
    const wrapperRef = useRef(null);

    const triggerMapResizeRef = useRef(null);
    const onLoad = useCallback(function callback(map) {
        setMap(map);
        if (triggerMapResizeRef.current) clearTimeout(triggerMapResizeRef.current);
        triggerMapResizeRef.current = setTimeout(() => {
            if (map && window.google?.maps?.event) {
                window.google.maps.event.trigger(map, 'resize');
            }
            triggerMapResizeRef.current = null;
        }, 300);
    }, []);

    // Listen for fullscreen change (user can press Escape); support standard + webkit (Safari)
    useEffect(() => {
        const handler = () => {
            const el = document.fullscreenElement ?? document.webkitFullscreenElement;
            setIsFullscreen(!!el);
        };
        document.addEventListener('fullscreenchange', handler);
        document.addEventListener('webkitfullscreenchange', handler);
        return () => {
            document.removeEventListener('fullscreenchange', handler);
            document.removeEventListener('webkitfullscreenchange', handler);
        };
    }, []);

    const triggerMapResize = useCallback(() => {
        if (map && window.google?.maps?.event) {
            window.google.maps.event.trigger(map, 'resize');
        }
    }, [map]);

    useEffect(() => {
        if (map && (isExpanded || isVisible)) {
            const t = setTimeout(triggerMapResize, 150);
            return () => clearTimeout(t);
        }
    }, [map, isExpanded, isVisible, triggerMapResize]);

    // Fit map bounds to all listing markers when listings change (e.g. new filter results) — smooth, Airbnb-like
    const listingsWithCoords = useMemo(() => listings.filter(l => l.latitude != null && l.longitude != null), [listings]);
    const listingsBoundsKey = useMemo(() => listingsWithCoords.map(l => `${l.id}-${l.latitude}-${l.longitude}`).join(','), [listingsWithCoords]);
    const listingsWithCoordsRef = useRef(listingsWithCoords);
    listingsWithCoordsRef.current = listingsWithCoords;
    useEffect(() => {
        if (!fitBoundsOnListingsChange || !map || !window.google?.maps) return;
        const withCoords = listingsWithCoordsRef.current;
        if (withCoords.length === 0) return;
        const bounds = new window.google.maps.LatLngBounds();
        withCoords.forEach(l => bounds.extend({ lat: parseFloat(l.latitude), lng: parseFloat(l.longitude) }));
        map.fitBounds(bounds, effectivePadding);
    }, [map, listingsBoundsKey, fitBoundsOnListingsChange, effectivePadding]);

    useEffect(() => {
        if (map && map.setMapTypeId) {
            map.setMapTypeId(mapType);
        }
    }, [map, mapType]);

    const toggleFullscreen = useCallback(() => {
        const el = wrapperRef.current;
        if (!el) return;
        const isCurrentlyFullscreen = !!document.fullscreenElement || !!document.webkitFullscreenElement;
        if (isCurrentlyFullscreen) {
            const exitFs = document.exitFullscreen ?? document.webkitExitFullscreen;
            if (typeof exitFs === 'function') {
                exitFs.call(document).then(() => {
                    setIsFullscreen(false);
                    setTimeout(triggerMapResize, 200);
                }).catch(() => {
                    setIsFullscreen(false);
                });
            } else {
                setIsFullscreen(false);
            }
        } else {
            if (onExpandClick) {
                onExpandClick();
                return;
            }
            const requestFs = el.requestFullscreen ?? el.webkitRequestFullscreen;
            if (requestFs) {
                requestFs.call(el).then(() => {
                    setIsFullscreen(true);
                    setTimeout(triggerMapResize, 250);
                }).catch(() => { });
            }
        }
    }, [triggerMapResize, onExpandClick]);

    const zoomIn = useCallback(() => {
        if (map) {
            const z = map.getZoom();
            if (typeof z === 'number' && z < 21) map.setZoom(z + 1);
        }
    }, [map]);

    const zoomOut = useCallback(() => {
        if (map) {
            const z = map.getZoom();
            if (typeof z === 'number' && z > 1) map.setZoom(z - 1);
        }
    }, [map]);

    const onUnmount = useCallback(function callback(map) {
        if (triggerMapResizeRef.current) {
            clearTimeout(triggerMapResizeRef.current);
            triggerMapResizeRef.current = null;
        }
        setMap(null);
    }, []);

    // Merge default options with custom options
    const mapOptions = useMemo(() => {
        const merged = {
            ...options,
            ...customOptions,
            ...(hideControls ? {
                mapTypeControl: false,
                fullscreenControl: false,
                zoomControl: false,
                streetViewControl: false,
                scaleControl: false,
                rotateControl: false,
                panControl: false
            } : {})
        };

        // CRITICAL: A map cannot have both 'styles' and 'mapId' set at the same time.
        // If mapId is present (it is by default in our options), we must remove styles.
        if (merged.mapId) {
            delete merged.styles;
        } else {
            // Re-apply our default styles if NO mapId is present
            merged.styles = [
                { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
                { featureType: "water", elementType: "geometry", stylers: [{ color: "#e9e9e9" }, { lightness: 17 }] },
                { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5f5f5" }, { lightness: 20 }] },
                { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }, { lightness: 17 }] },
                { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#ffffff" }, { lightness: 29 }, { weight: 0.2 }] },
                { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#ffffff" }, { lightness: 18 }] },
                { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#ffffff" }, { lightness: 16 }] },
                { featureType: "transit", elementType: "geometry", stylers: [{ color: "#f2f2f2" }, { lightness: 19 }] },
                { featureType: "administrative", elementType: "geometry.fill", stylers: [{ color: "#fefefe" }, { lightness: 20 }] },
                { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#fefefe" }, { lightness: 17 }, { weight: 1.2 }] }
            ];
        }

        return merged;
    }, [customOptions]);

    // Debounced bounds change handler
    const handleBoundsChanged = useCallback(() => {
        if (!map || !onBoundsChanged) return;

        // Clear existing timeout
        if (boundsTimeoutRef.current) {
            clearTimeout(boundsTimeoutRef.current);
        }

        // Debounce: wait 250ms after user stops interacting so fetch starts sooner and markers appear faster
        boundsTimeoutRef.current = setTimeout(() => {
            const bounds = map.getBounds();
            if (bounds) {
                const ne = bounds.getNorthEast();
                const sw = bounds.getSouthWest();
                onBoundsChanged({
                    min_lat: sw.lat(),
                    max_lat: ne.lat(),
                    min_lng: sw.lng(),
                    max_lng: ne.lng(),
                });
            }
        }, 250);
    }, [map, onBoundsChanged]);

    const defaultCenter = useMemo(() => ({
        lat: 13.7563, // Bangkok
        lng: 100.5018
    }), []);

    const mapCenter = useMemo(() => {
        // When center is provided from props (e.g. detail page), always use it so the map and marker render
        const hasValidCenter = center && (typeof center.lat === 'number' || !isNaN(parseFloat(center.lat))) && (typeof center.lng === 'number' || !isNaN(parseFloat(center.lng)));
        if (hasValidCenter) {
            return {
                lat: typeof center.lat === 'number' ? center.lat : parseFloat(center.lat),
                lng: typeof center.lng === 'number' ? center.lng : parseFloat(center.lng)
            };
        }

        // List view: use first valid listing for center
        if (listings.length > 0) {
            const validListings = listings.filter(l => l.latitude && l.longitude);
            if (validListings.length > 0) {
                return {
                    lat: parseFloat(validListings[0].latitude),
                    lng: parseFloat(validListings[0].longitude)
                };
            }
        }
        return defaultCenter;
    }, [center, listings, defaultCenter]);

    // When data loads from user pan (fitBoundsOnListingsChange false), don't move map: keep center so map stays where user stopped
    const frozenCenterRef = useRef(mapCenter);
    if (fitBoundsOnListingsChange) {
        frozenCenterRef.current = mapCenter;
    }
    const effectiveCenter = fitBoundsOnListingsChange ? mapCenter : frozenCenterRef.current;

    if (!isLoaded) {
        return (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center text-gray-400">
                Loading Maps...
            </div>
        );
    }

    return (
        <div
            ref={wrapperRef}
            className={`relative w-full h-full ${isFullscreen ? '!w-screen !h-screen !min-w-full !min-h-full bg-gray-100' : ''}`}
            style={isFullscreen ? { width: '100vw', height: '100vh' } : undefined}
        >
            {/* Loading strip at top when user pans map — "..." animation until data is received */}
            {displayLoading && (
                <div className="absolute top-0 left-0 right-0 z-[15] flex justify-center pt-3 pointer-events-none" aria-live="polite" aria-busy="true">
                    <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200 flex items-center gap-1">
                        <span className="text-gray-600 text-sm font-medium">Loading</span>
                        <span className="inline-flex gap-0.5" aria-hidden>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-[mapLoadingDot_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-[mapLoadingDot_0.6s_ease-in-out_infinite]" style={{ animationDelay: '200ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-[mapLoadingDot_0.6s_ease-in-out_infinite]" style={{ animationDelay: '400ms' }} />
                        </span>
                    </div>
                </div>
            )}
            <GoogleMap
                mapContainerStyle={mapStyle}
                center={effectiveCenter}
                zoom={effectiveZoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
                onIdle={handleBoundsChanged}
                onClick={onClick}
            >
                {listings.filter(l => l.latitude && l.longitude).map((property) => (
                    <PropertyMarker
                        key={property.id}
                        map={map}
                        property={property}
                        onClick={onMarkerClick}
                        onSaveClick={onSaveClick}
                        savedListingIds={savedListingIds}
                        useDefaultMarkers={useDefaultMarkers}
                        highlightedMarkerListingId={highlightedMarkerListingId}
                        openedMarkerId={openedMarkerId}
                        onCardToggle={handleCardToggle}
                        onCloseCard={handleCloseCard}
                        markerType={markerType}
                    />
                ))}
            </GoogleMap>
            {/* X close button when fullscreen - only when controls are shown */}
            {!hideControls && map && isFullscreen && (
                <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="absolute top-4 right-4 z-[20] w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95"
                    aria-label="Close fullscreen"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            )}
            {/* Detail map: Map/Satellite pill (rounded-full) + fullscreen (rounded-full) only */}
            {hideControls && !hideCustomControls && map && (
                <>
                    <div className="absolute top-4 left-4 z-[10] pointer-events-auto isolate flex rounded-full overflow-hidden bg-white shadow-md border border-gray-200" style={{ isolation: 'isolate', transform: 'translateZ(0)' }}>
                        <button
                            type="button"
                            onClick={() => setMapType('roadmap')}
                            className={`px-4 py-2.5 text-sm font-bold transition-colors ${mapType === 'roadmap' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                            aria-label="Map view"
                        >
                            Map
                        </button>
                        <button
                            type="button"
                            onClick={() => setMapType('hybrid')}
                            className={`px-4 py-2.5 text-sm font-bold transition-colors ${mapType === 'hybrid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                            aria-label="Satellite view"
                        >
                            Satellite
                        </button>
                    </div>
                    {!isFullscreen ? (
                        <div className="absolute top-4 right-4 z-[10] pointer-events-auto isolate" style={{ transform: 'translateZ(0)' }}>
                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:shadow-lg transition-all active:scale-95"
                                aria-label="Fullscreen"
                            >
                                <ArrowsPointingOutIcon className="w-5 h-5 flex-shrink-0" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="absolute top-4 right-4 z-[20] w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95"
                            aria-label="Close fullscreen"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    )}
                </>
            )}
            {/* List/projects map: fullscreen + zoom controls */}
            {!hideControls && !hideCustomControls && map && (
                <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-[10] pointer-events-auto isolate">
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:shadow-lg transition-all active:scale-95 shrink-0"
                        style={{ isolation: 'isolate', transform: 'translateZ(0)' }}
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? (
                            <ArrowsPointingInIcon className="w-5 h-5 flex-shrink-0" />
                        ) : (
                            <ArrowsPointingOutIcon className="w-5 h-5 flex-shrink-0" />
                        )}
                    </button>
                    <div className="rounded-full overflow-hidden bg-white shadow-md border border-gray-200 flex flex-col isolate" style={{ transform: 'translateZ(0)' }}>
                        <button
                            type="button"
                            onClick={zoomIn}
                            className="w-10 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                            aria-label="Zoom in"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={zoomOut}
                            className="w-10 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
                            aria-label="Zoom out"
                        >
                            <MinusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(GoogleMapComponent);
