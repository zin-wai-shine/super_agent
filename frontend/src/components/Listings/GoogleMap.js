import React, { useMemo, useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, OverlayView } from '@react-google-maps/api';

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
            content.className = 'group cursor-pointer transition-transform hover:scale-110 active:scale-95';
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

        const newInnerHTML = `
            <div class="px-4 py-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-white text-white font-black text-xs whitespace-nowrap flex items-center gap-2 transform transition-all duration-300 group-hover:shadow-2xl ${property.listing_type === 'sale' ? 'bg-orange-600' : 'bg-primary-600'}">
                <span class="tracking-tight">${priceFormatted}</span>
                <div class="w-px h-3 bg-white/30"></div>
                <span class="uppercase text-[9px] tracking-widest font-black opacity-80">${property.listing_type}</span>
            </div>
            <div class="w-4 h-4 rotate-45 mx-auto -mt-2 border-r-2 border-b-2 border-white shadow-xl ${property.listing_type === 'sale' ? 'bg-orange-600' : 'bg-primary-600'}"></div>
        `;

        // Only update DOM if content actually changed
        if (lastContentRef.current !== newInnerHTML) {
            contentRef.current.innerHTML = newInnerHTML;
            lastContentRef.current = newInnerHTML;
        }

        // Update position if it changed
        const newPos = {
            lat: parseFloat(property.latitude),
            lng: parseFloat(property.longitude),
        };

        if (markerRef.current.position.lat !== newPos.lat || markerRef.current.position.lng !== newPos.lng) {
            markerRef.current.position = newPos;
        }
    }, [property.price, property.listing_type, property.latitude, property.longitude, useDefaultMarkers]);

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

const GoogleMapComponent = ({ listings = [], center, zoom = 12, onMarkerClick, onBoundsChanged, mapStyle = mapContainerStyle, options: customOptions, useDefaultMarkers = false }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
        libraries: ['places', 'marker'],
        version: 'weekly'
    });

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
