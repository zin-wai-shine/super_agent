import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { GoogleMap, Marker, OverlayView, useJsApiLoader } from '@react-google-maps/api';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon, PlusIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getMediaUrl } from '../../utils/media';
import { useTheme } from '../../contexts/ThemeContext';

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const options = {
    disableDefaultUI: true,
    zoomControl: false, // Use custom zoom + fullscreen controls
    gestureHandling: 'greedy', // Allow direct scroll zoom without Cmd key
    mapId: 'DEMO_MAP_ID', // Using the ID from user's snippet
    styles: [
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
        },
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#e9e9e9" }, { lightness: 17 }]
        },
        {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }, { lightness: 20 }]
        },
        {
            featureType: "road.highway",
            elementType: "geometry.fill",
            stylers: [{ color: "#ffffff" }, { lightness: 17 }]
        },
        {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#ffffff" }, { lightness: 29 }, { weight: 0.2 }]
        },
        {
            featureType: "road.arterial",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }, { lightness: 18 }]
        },
        {
            featureType: "road.local",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }, { lightness: 16 }]
        },
        {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#f2f2f2" }, { lightness: 19 }]
        },
        {
            featureType: "administrative",
            elementType: "geometry.fill",
            stylers: [{ color: "#fefefe" }, { lightness: 20 }]
        },
        {
            featureType: "administrative",
            elementType: "geometry.stroke",
            stylers: [{ color: "#fefefe" }, { lightness: 17 }, { weight: 1.2 }]
        }
    ]
};

const PropertyMarker = React.memo(({ map, property, onClick, onSaveClick, savedListingIds = [], useDefaultMarkers, highlightedMarkerListingId = null }) => {
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
            onClick(property);
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

        const saveIconSvg = initialSaved
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="${primaryColor}" stroke="${primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>`;

        const newInnerHTML = `
            <style>
                .marker-group.hovered .resting-pill { scale: 0; opacity: 0; pointer-events: none; transition: all 0.2s ease; }
                .marker-group.hovered .resting-nub { opacity: 0; transition: opacity 0.2s ease; }

                .marker-group.hovered .expanded-card { width: 510px; height: 220px; opacity: 1; padding: 0; }
                .marker-group.hovered .expanded-content { opacity: 1; }

                /* Hover card price badge: same as main (list-highlighted) – primary background, white text */
                .marker-group:hover .price-pill,
                .marker-group.hovered .price-pill {
                    background: var(--primary-color);
                    border-color: var(--primary-color);
                    color: white;
                    transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
                }
                .marker-group:hover .price-pill span,
                .marker-group.hovered .price-pill span { color: white; }
                /* When list card is hovered, resting pill gets primary background and white text */
                .marker-group.list-highlighted .resting-pill {
                    background: var(--primary-color);
                    border-color: var(--primary-color);
                    color: white;
                    transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
                }
                .marker-group.list-highlighted .resting-pill span { color: white; }
                .marker-group.list-highlighted .resting-pill svg { stroke: white; }
            </style>
            <div class="marker-group group ${String(property.id) === String(highlightedMarkerListingId) ? 'list-highlighted' : ''} relative cursor-pointer flex flex-col items-center" style="transform: translate(-50%, -100%);">
                <!-- Resting Pill: icon + price only -->
                <div class="resting-pill flex items-center gap-2.5 pl-2.5 pr-3.5 py-2 bg-white border border-gray-200 rounded-full transition-all duration-200 z-10 min-w-0">
                    <div class="flex-none flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${primaryColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <span class="text-[13px] font-bold text-gray-900 leading-tight whitespace-nowrap">${priceFormatted}</span>
                </div>
                <svg class="resting-nub flex-none transition-opacity duration-200 pointer-events-none group-hover:opacity-0" width="18" height="9" viewBox="0 0 18 9">
                    <polygon points="0,0 18,0 9,9" fill="white"/>
                    <path d="M0,0 L9,9 L18,0" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>

                <!-- HOVER EXPANDED CARD: container padding, image rounded on all 4 sides -->
                <div class="expanded-card absolute left-1/2 -translate-x-1/2 bottom-[8px] w-0 h-0 opacity-0 bg-white rounded-[24px] border border-gray-100 overflow-hidden transition-all duration-300 ease-out group-hover:w-[510px] group-hover:h-[220px] group-hover:opacity-100 flex flex-col z-10 p-3" style="box-shadow: 8px 0 20px -4px rgba(0,0,0,0.12), 0 8px 20px -4px rgba(0,0,0,0.12);">

                    <div class="flex flex-1 min-h-0 w-full">
                    <!-- Left: Image reduced size (50%), full height, rounded on all 4 sides like main card -->
                    <div class="expanded-content opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-[50%] flex-none relative overflow-hidden rounded-[16px] h-full">
                        <img src="${imageUrl}" class="w-full h-full object-cover" />
                        <!-- Price: rounded pill on image (top-left); primary soft + reduced opacity on card hover -->
                        <div class="price-pill absolute top-2 left-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm border border-gray-100/80 transition-all duration-200">
                            <span class="text-[13px] md:text-[14px] font-bold text-gray-900 tracking-tight">${priceNumber}</span>
                        </div>
                        <!-- Save icon on image (top-right) – clickable, stops propagation -->
                        <div class="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm border border-gray-100/80 cursor-pointer hover:bg-white transition-colors pointer-events-auto" data-marker-save role="button" tabindex="0" aria-label="${initialSaved ? 'Unsave' : 'Save'} listing">${saveIconSvg}</div>
                    </div>

                    <!-- Right: Text panel – dark title, increased gaps between lines -->
                    <div class="expanded-content opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col flex-1 min-w-0 pl-3 pr-2 py-0 justify-start overflow-hidden">
                        <div class="text-sm md:text-[15px] font-semibold leading-tight line-clamp-2 text-left break-words text-gray-900">${property.title}</div>
                        <div class="flex flex-col gap-3 mt-2.5 text-[12px] md:text-[13px] text-left">
                            <div class="flex items-start gap-1 min-w-0"><span class="font-medium text-gray-400 shrink-0 w-24">Location</span><span class="font-bold text-gray-700 min-w-0 break-words line-clamp-2">: ${district}</span></div>
                            <div class="flex items-start gap-1 min-w-0"><span class="font-medium text-gray-400 shrink-0 w-24">Station</span><span class="font-bold text-gray-700 min-w-0 break-words line-clamp-2">: ${stationName}</span></div>
                            <div class="flex items-start gap-1 min-w-0"><span class="font-medium text-gray-400 shrink-0 w-24">Type</span><span class="font-bold text-gray-700 min-w-0 break-words line-clamp-2 capitalize">: ${typeLine}</span></div>
                        </div>
                        <div class="flex items-center gap-5 mt-4 text-[12px] md:text-[13px] text-[#2F3E46] flex-shrink-0 flex-wrap">
                            <span class="font-medium text-gray-400 tracking-tight shrink-0">Beds</span><span class="font-bold text-gray-700 shrink-0">: ${property.bedrooms ?? '—'}</span>
                            <span class="font-medium text-gray-400 tracking-tight shrink-0">Baths</span><span class="font-bold text-gray-700 shrink-0">: ${property.bathrooms ?? '—'}</span>
                            <span class="font-medium text-gray-400 tracking-tight shrink-0">m²</span><span class="font-bold text-gray-700 shrink-0">: ${property.area ?? '—'}</span>
                        </div>
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

        // Save button: stop propagation and call onSaveClick so marker click doesn't fire
        const saveBtn = contentRef.current?.querySelector('[data-marker-save]');
        if (saveBtn && onSaveClick) {
            if (saveBtnListenerRef.current?.el) {
                try {
                    saveBtnListenerRef.current.el.removeEventListener('click', saveBtnListenerRef.current.handler);
                    saveBtnListenerRef.current.el.removeEventListener('keydown', saveBtnListenerRef.current.keyHandler);
                } catch (_) {}
            }
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                onSaveClick(property.id, initialSaved);
            };
            const keyHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(e); }
            };
            saveBtn.addEventListener('click', handler);
            saveBtn.addEventListener('keydown', keyHandler);
            saveBtnListenerRef.current = { el: saveBtn, handler, keyHandler };
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
            if (saveBtnListenerRef.current?.el) {
                try {
                    saveBtnListenerRef.current.el.removeEventListener('click', saveBtnListenerRef.current.handler);
                    saveBtnListenerRef.current.el.removeEventListener('keydown', saveBtnListenerRef.current.keyHandler);
                } catch (_) {}
                saveBtnListenerRef.current = null;
            }
        };
    }, [property.id, property.price, property.listing_type, property.latitude, property.longitude, property.title, property.property_type, property.media, property.district, property.station, property.station_name, property.bedrooms, property.bathrooms, property.area, useDefaultMarkers, onSaveClick, initialSaved, savedListingIds, highlightedMarkerListingId]);

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
        prevProps.highlightedMarkerListingId === nextProps.highlightedMarkerListingId
    );
});

const GoogleMapComponent = ({ listings = [], center, zoom = 12, onMarkerClick, onBoundsChanged, onExpandClick, isExpanded, mapStyle = mapContainerStyle, options: customOptions, useDefaultMarkers = false, onSaveClick, savedListingIds = [], highlightedMarkerListingId = null }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
        libraries: ['places', 'marker'],
        version: 'weekly'
    });


    const [map, setMap] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const boundsTimeoutRef = React.useRef(null);
    const wrapperRef = useRef(null);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
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
        if (map && isExpanded) {
            const t = setTimeout(triggerMapResize, 150);
            return () => clearTimeout(t);
        }
    }, [map, isExpanded, triggerMapResize]);

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
                }).catch(() => {});
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
        setMap(null);
    }, []);

    // Merge default options with custom options
    const mapOptions = useMemo(() => ({
        ...options,
        ...customOptions
    }), [customOptions]);

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
