import React, { useMemo, useCallback, useState } from 'react';
import { GoogleMap, Marker, OverlayView } from '@react-google-maps/api';
import { getMediaUrl } from '../../utils/media';

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const options = {
    disableDefaultUI: true,
    zoomControl: true,
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

const PropertyMarker = React.memo(({ map, property, onClick, useDefaultMarkers }) => {
    const markerRef = React.useRef(null);
    const contentRef = React.useRef(null);
    const lastContentRef = React.useRef('');

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
        content.querySelector('.marker-group')?.addEventListener('mouseenter', handleMouseEnter);
        content.querySelector('.marker-group')?.addEventListener('mouseleave', handleMouseLeave);

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

        // Get first image
        const imageUrl = getMediaUrl(property.media?.find(m => m.type === 'image')?.url);

        const newInnerHTML = `
            <style>
                .marker-group.hovered .resting-pill { scale: 0; opacity: 0; pointer-events: none; transition: all 0.2s ease; }
                .marker-group.hovered .resting-nub { opacity: 0; transition: opacity 0.2s ease; }

                .marker-group.hovered .expanded-card { width: 310px; height: 130px; opacity: 1; padding: 0; }
                .marker-group.hovered .expanded-content { opacity: 1; }
            </style>
            <div class="marker-group group relative cursor-pointer flex flex-col items-center" style="transform: translate(-50%, -100%);">
                <!-- Resting Pill: Multi-line card with checkmark + address + price -->
                <div class="resting-pill flex items-center gap-3 pl-3 pr-4 py-2.5 bg-white border border-gray-200 rounded-[3px] transition-all duration-200 z-10 min-w-[160px]">
                    <!-- Checkmark Icon -->
                    <div class="flex-none w-7 h-7 rounded-full border-2 border-black flex items-center justify-center">
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                            <path d="M1 5L4.5 8.5L11 1.5" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <!-- Text block -->
                    <div class="flex flex-col">
                        <span class="text-[11px] text-gray-500 font-medium leading-tight whitespace-nowrap">${property.road || property.district || property.title || 'Property'}</span>
                        <span class="text-[13px] font-bold text-gray-900 leading-tight whitespace-nowrap">${priceFormatted}</span>
                    </div>
                </div>
                <!-- Small Triangle Nub: only V-shaped sides drawn, no top border -->
                <svg class="resting-nub flex-none transition-opacity duration-200 pointer-events-none group-hover:opacity-0" width="18" height="9" viewBox="0 0 18 9">
                    <!-- White fill covers the interior -->
                    <polygon points="0,0 18,0 9,9" fill="white"/>
                    <!-- Only the two diagonal sides are stroked (open path, no top edge) -->
                    <path d="M0,0 L9,9 L18,0" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>

                <!-- HOVER EXPANDED CARD: Two-column layout with image + details -->
                <div class="expanded-card absolute left-1/2 -translate-x-1/2 bottom-[8px] w-0 h-0 opacity-0 bg-white rounded-[3px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-200 overflow-hidden transition-all duration-300 ease-out group-hover:w-[310px] group-hover:h-[130px] group-hover:opacity-100 flex z-10">

                    <!-- Left: Image -->
                    <div class="expanded-content opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-[90px] flex-none">
                        <img src="${imageUrl}" class="w-full h-full object-cover" />
                    </div>

                    <!-- Right: Info -->
                    <div class="expanded-content opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between flex-1 min-w-0 px-3 py-2.5">

                        <!-- Title + Price -->
                        <div>
                            <div class="flex items-center justify-between gap-1 mb-1.5">
                                <div class="text-[11px] font-bold text-gray-900 truncate leading-tight">${property.title}</div>
                                <div class="text-[11px] font-black text-gray-900 whitespace-nowrap ml-1">${priceFormatted}</div>
                            </div>

                            <!-- Info rows -->
                            <div class="flex flex-col gap-[2px]">
                                <div class="flex items-center gap-1.5">
                                    <span class="text-[9px] text-gray-400 w-[42px] flex-none tracking-wide">Location</span>
                                    <span class="text-[9px] text-gray-300">:</span>
                                    <span class="text-[9px] font-semibold text-gray-600 truncate">${property.district || '—'}</span>
                                </div>
                                <div class="flex items-center gap-1.5">
                                    <span class="text-[9px] text-gray-400 w-[42px] flex-none tracking-wide">Station</span>
                                    <span class="text-[9px] text-gray-300">:</span>
                                    <span class="text-[9px] font-semibold text-gray-600 truncate">${property.station_name || property.station || '—'}</span>
                                </div>
                                <div class="flex items-center gap-1.5">
                                    <span class="text-[9px] text-gray-400 w-[42px] flex-none tracking-wide">Type</span>
                                    <span class="text-[9px] text-gray-300">:</span>
                                    <span class="text-[9px] font-semibold text-gray-600 capitalize truncate">${property.property_type || '—'} • ${property.listing_type || '—'}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Bottom stats: Beds / Baths / m² -->
                        <div class="flex items-center gap-3 pt-1.5 border-t border-gray-100 mt-1">
                            <span class="text-[9px] text-gray-400">Beds <span class="font-bold text-gray-700">${property.bedrooms ?? '—'}</span></span>
                            <span class="text-[9px] text-gray-400">Baths <span class="font-bold text-gray-700">${property.bathrooms ?? '—'}</span></span>
                            <span class="text-[9px] text-gray-400">m² <span class="font-bold text-gray-700">${property.area ?? '—'}</span></span>
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
        };
    }, [property.price, property.listing_type, property.latitude, property.longitude, property.title, property.property_type, property.media, useDefaultMarkers]);

    return null;
}, (prevProps, nextProps) => {
    // Custom comparison to avoid re-renders if core data hasn't changed
    return (
        prevProps.map === nextProps.map &&
        prevProps.useDefaultMarkers === nextProps.useDefaultMarkers &&
        prevProps.property.id === nextProps.property.id &&
        prevProps.property.price === nextProps.property.price &&
        prevProps.property.latitude === nextProps.property.latitude &&
        prevProps.property.longitude === nextProps.property.longitude &&
        prevProps.property.listing_type === nextProps.property.listing_type
    );
});

const GoogleMapComponent = ({ isLoaded, listings = [], center, zoom = 12, onMarkerClick, onBoundsChanged, mapStyle = mapContainerStyle, options: customOptions, useDefaultMarkers = false }) => {


    const [map, setMap] = useState(null);
    const boundsTimeoutRef = React.useRef(null);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

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
                    useDefaultMarkers={useDefaultMarkers}
                />
            ))}
        </GoogleMap>
    );
};

export default React.memo(GoogleMapComponent);
