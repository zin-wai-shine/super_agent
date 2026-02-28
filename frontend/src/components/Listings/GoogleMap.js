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

const PropertyMarker = React.memo(({ map, property, onClick, onSaveClick, savedListingIds = [], useDefaultMarkers, highlightedMarkerListingId = null, openedMarkerId = null, onCardToggle, onCloseCard }) => {
    const { theme } = useTheme();
    const primaryColor = theme?.primaryColor || '#2663EB';
    const initialSaved = Array.isArray(savedListingIds) && savedListingIds.some((sid) => String(sid) === String(property.id));

    const markerRef = React.useRef(null);
    const contentRef = React.useRef(null);
    const lastContentRef = React.useRef('');
    const saveBtnListenerRef = React.useRef(null);

    // Initial Marker Creation
    React.useEffect(() => {
        if (!map || !property.latitude || !property.longitude || markerRef.current) return;

        let markerContent = null;
        if (!useDefaultMarkers) {
            const content = document.createElement('div');
            // Ensure the container itself can show overflow for the card
            content.className = 'marker-container relative';
            contentRef.current = content;
            markerContent = content;
        }

        const marker = new window.google.maps.marker.AdvancedMarkerElement({
            map,
            position: {
                lat: parseFloat(property.latitude),
                lng: parseFloat(property.longitude),
            },
            content: markerContent, // If null/undefined, uses default pin
            title: '', // Remove title to stop the native grey tooltip
        });

        const listener = marker.addListener('click', () => {
            if (onCardToggle) onCardToggle(property.id);
        });

        const handleMouseEnter = () => {
            if (markerRef.current) {
                markerRef.current.zIndex = 10000;
                if (contentRef.current) contentRef.current.style.zIndex = "10000";
            }
        };

        const handleMouseLeave = () => {
            if (markerRef.current) {
                markerRef.current.zIndex = 1;
                if (contentRef.current) contentRef.current.style.zIndex = "1";
            }
        };

        const content = contentRef.current;
        if (content) {
            content.querySelector('.marker-group')?.addEventListener('mouseenter', handleMouseEnter);
            content.querySelector('.marker-group')?.addEventListener('mouseleave', handleMouseLeave);
        }

        markerRef.current = marker;

        return () => {
            if (markerRef.current) {
                markerRef.current.map = null;
                markerRef.current = null;
            }
            if (listener) {
                listener.remove();
            }
            if (content) {
                const group = content.querySelector('.marker-group');
                group?.removeEventListener('mouseenter', handleMouseEnter);
                group?.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [map, useDefaultMarkers]); // Re-run if useDefaultMarkers changes drastically (though unlikely)

    // Sync Data (Price/Position)
    React.useEffect(() => {
        // If using default markers, skip content updates
        if (useDefaultMarkers || !markerRef.current || !contentRef.current) return;

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
                /* Initial: pill and nub primary; when card opened: pill and nub dark, card visible (click-only) */
                .marker-group .resting-pill {
                    background: var(--primary-color);
                    border-color: var(--primary-color);
                    color: white;
                    transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
                }
                .marker-group .resting-pill span { color: white; }
                .marker-group .resting-pill .resting-pill-icon { stroke: white; }
                .marker-group .resting-nub { fill: var(--primary-color); transition: fill 0.2s ease; }
                .marker-group .resting-nub .nub-stroke { stroke: rgba(0,0,0,0.15); }

                .marker-group.opened .resting-pill {
                    background: #1f2937;
                    border-color: #1f2937;
                    color: white;
                }
                .marker-group.opened .resting-pill span { color: white; }
                .marker-group.opened .resting-pill .resting-pill-icon { stroke: white; }
                .marker-group.opened .resting-nub { fill: #1f2937; }
                .marker-group.opened .resting-nub .nub-stroke { stroke: rgba(0,0,0,0.2); }

                .marker-group.opened .expanded-card { width: 320px; min-height: 320px; opacity: 1; padding: 0; }
                .marker-group.opened .expanded-content { opacity: 1; }

                /* Price pill (if used elsewhere) */
                .marker-group:hover .price-pill,
                .marker-group.opened .price-pill {
                    background: var(--primary-color);
                    border-color: var(--primary-color);
                    color: white;
                    transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
                }
                .marker-group:hover .price-pill span,
                .marker-group.opened .price-pill span { color: white; }
                /* When list card is hovered, target (pill + nub) turns dark like opened state */
                .marker-group.list-highlighted .resting-pill {
                    background: #1f2937;
                    border-color: #1f2937;
                    color: white;
                }
                .marker-group.list-highlighted .resting-pill span { color: white; }
                .marker-group.list-highlighted .resting-pill .resting-pill-icon { stroke: white; }
                .marker-group.list-highlighted .resting-nub { fill: #1f2937; }
                .marker-group.list-highlighted .resting-nub .nub-stroke { stroke: rgba(0,0,0,0.2); }
                /* Hide hover card when Save is clicked */
                .marker-group.save-clicked .expanded-card { width: 0; height: 0; opacity: 0; pointer-events: none; overflow: hidden; transition: width 0.2s ease, height 0.2s ease, opacity 0.2s ease; }
                .marker-group.save-clicked .expanded-content { opacity: 0; }
                .marker-group.save-clicked .resting-pill { background: var(--primary-color); border-color: var(--primary-color); }
                .marker-group.save-clicked .resting-nub { fill: var(--primary-color); }
            </style>
            <div class="marker-group group ${String(property.id) === String(highlightedMarkerListingId) ? 'list-highlighted' : ''} ${String(property.id) === String(openedMarkerId) ? 'opened' : ''} relative cursor-pointer flex flex-col items-center" style="transform: translate(-50%, -100%);">
                <!-- Resting Pill: icon + price only (initial = primary bg + white text) -->
                <div class="resting-pill flex items-center gap-2.5 pl-2.5 pr-3.5 py-2 rounded-full transition-all duration-200 z-10 min-w-0 border">
                    <div class="flex-none flex items-center justify-center">
                        <svg class="resting-pill-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <span class="text-[13px] font-bold leading-tight whitespace-nowrap">${priceFormatted}</span>
                </div>
                <svg class="resting-nub flex-none transition-all duration-200 pointer-events-none" width="18" height="9" viewBox="0 0 18 9">
                    <polygon points="0,0 18,0 9,9" />
                    <path class="nub-stroke" d="M0,0 L9,9 L18,0" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>

                <!-- EXPANDED CARD (click to open): image on top, content below; click inside does not toggle -->
                <div class="expanded-card absolute left-1/2 -translate-x-1/2 bottom-[8px] w-0 min-h-0 opacity-0 bg-white rounded-[24px] border border-gray-100 overflow-hidden transition-all duration-300 ease-out flex flex-col z-10" style="box-shadow: 8px 0 20px -4px rgba(0,0,0,0.12), 0 8px 20px -4px rgba(0,0,0,0.12);">
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
        const hoverListener = markerRef.current.addListener('mouseover', () => {
            markerRef.current.zIndex = 1000;
        });
        const outListener = markerRef.current.addListener('mouseout', () => {
            markerRef.current.zIndex = 1;
        });

        // Update position if it changed
        const newPos = {
            lat: parseFloat(property.latitude),
            lng: parseFloat(property.longitude),
        };

        if (markerRef.current.position.lat !== newPos.lat || markerRef.current.position.lng !== newPos.lng) {
            markerRef.current.position = newPos;
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
    }, [property.id, property.price, property.listing_type, property.latitude, property.longitude, property.title, property.property_type, property.media, property.district, property.station, property.station_name, property.bedrooms, property.bathrooms, property.area, useDefaultMarkers, onSaveClick, initialSaved, savedListingIds, highlightedMarkerListingId, openedMarkerId, onCardToggle, onCloseCard]);

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
        prevProps.onCloseCard === nextProps.onCloseCard
    );
});

const GoogleMapComponent = ({ listings = [], center, zoom = 12, onMarkerClick, onBoundsChanged, onExpandClick, isExpanded, mapStyle = mapContainerStyle, options: customOptions, useDefaultMarkers = false, onSaveClick, savedListingIds = [], highlightedMarkerListingId = null, isVisible = true }) => {
    const [openedMarkerId, setOpenedMarkerId] = useState(null);
    const handleCardToggle = useCallback((propertyId) => {
        setOpenedMarkerId((prev) => (String(prev) === String(propertyId) ? null : propertyId));
    }, []);
    const handleCloseCard = useCallback(() => setOpenedMarkerId(null), []);

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
            ...customOptions
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

        // Debounce: wait 500ms after user stops interacting
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
        }, 500);
    }, [map, onBoundsChanged]);

    const [hasInitiallyCentered, setHasInitiallyCentered] = useState(false);

    const defaultCenter = useMemo(() => ({
        lat: 13.7563, // Bangkok
        lng: 100.5018
    }), []);

    const mapCenter = useMemo(() => {
        // If we've already centered once, don't let listing updates force a re-center
        // This is the core of the infinite loop fix
        if (hasInitiallyCentered) return undefined;

        if (center && center.lat && center.lng) {
            setHasInitiallyCentered(true);
            return center;
        }

        if (listings.length > 0) {
            const validListings = listings.filter(l => l.latitude && l.longitude);
            if (validListings.length > 0) {
                setHasInitiallyCentered(true);
                return {
                    lat: parseFloat(validListings[0].latitude),
                    lng: parseFloat(validListings[0].longitude)
                };
            }
        }
        return defaultCenter;
    }, [center, listings, defaultCenter, hasInitiallyCentered]);

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
            <GoogleMap
                mapContainerStyle={mapStyle}
                center={mapCenter}
                zoom={zoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
                onIdle={handleBoundsChanged}
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
                    />
                ))}
            </GoogleMap>
            {/* X close button when fullscreen - always visible and clickable */}
            {map && isFullscreen && (
                <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="absolute top-4 right-4 z-[20] w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95"
                    aria-label="Close fullscreen"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            )}
            {/* Custom map controls: fullscreen + zoom (pill) */}
            {map && (
                <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-[10] pointer-events-auto">
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:shadow-lg transition-all active:scale-95"
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? (
                            <ArrowsPointingInIcon className="w-5 h-5" />
                        ) : (
                            <ArrowsPointingOutIcon className="w-5 h-5" />
                        )}
                    </button>
                    <div className="rounded-full overflow-hidden bg-white shadow-md border border-gray-200 flex flex-col">
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
