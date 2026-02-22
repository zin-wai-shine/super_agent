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
            title: property.title || 'Property',
        });

        const listener = marker.addListener('click', () => {
            onClick(property);
        });

        markerRef.current = marker;

        return () => {
            if (markerRef.current) {
                markerRef.current.map = null;
                markerRef.current = null;
            }
            if (listener) {
                listener.remove();
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
            <div class="group relative cursor-pointer flex items-center justify-center" style="transform: translate(-50%, -100%);">
                <!-- RESTING STATE: Professional Pill Design -->
                <div class="flex items-center gap-2 px-4 py-2 bg-white border-2 border-primary-600 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-0 group-hover:opacity-0 group-hover:pointer-events-none">
                    <span class="text-primary-600 font-extrabold text-[13px] whitespace-nowrap tracking-tight">${priceFormatted}</span>
                </div>

                <!-- HOVER EXPANDED CARD: Modern Summary -->
                <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 w-0 h-0 opacity-0 bg-white rounded-[24px] shadow-[0_30px_60px_-12px_rgba(50,50,93,0.25),0_18px_36px_-18px_rgba(0,0,0,0.3)] border border-gray-100/50 overflow-hidden transition-all duration-600 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:w-[280px] group-hover:h-[96px] group-hover:opacity-100 group-hover:p-3.5 flex items-center gap-4 group-hover:-translate-y-4">
                    <!-- Thumbnail with subtle zoom and rounded edges -->
                    <div class="w-[68px] h-[68px] rounded-[18px] overflow-hidden shadow-sm flex-none bg-gray-100">
                        <img src="${imageUrl}" class="w-full h-full object-cover transition-all duration-1000 delay-100 group-hover:scale-110" />
                    </div>
                    
                    <!-- Content area with "Small to Large" text animation -->
                    <div class="flex flex-col min-w-0 flex-1 transition-all duration-500 delay-100 transform scale-50 group-hover:scale-100 origin-left">
                        <span class="text-[10px] font-black uppercase text-primary-500 tracking-[0.2em] mb-1 leading-none">${property.property_type || 'Property'}</span>
                        <div class="text-[14px] font-bold text-gray-900 truncate leading-tight mb-1">${property.title}</div>
                        <div class="flex items-center gap-2">
                            <span class="text-[16px] font-black text-gray-900">${priceFormatted}</span>
                            <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span class="text-[11px] font-bold text-gray-500 capitalize opacity-80">${property.listing_type}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Expanded shadow overlay for depth -->
                <div class="absolute inset-0 bg-primary-600/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                
                <!-- Bottom Pointer (Arrow) -->
                <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-r-2 border-b-2 border-primary-600 bg-white transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-2"></div>
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
