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

const PropertyMarker = ({ map, property, onClick }) => {
    const markerRef = React.useRef(null);

    React.useEffect(() => {
        if (!map || !property.latitude || !property.longitude) return;

        // Create the marker content element
        const content = document.createElement('div');
        content.className = 'group cursor-pointer transition-transform hover:scale-110 active:scale-95';

        const priceFormatted = new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            maximumFractionDigits: 0,
        }).format(property.price);

        const innerHTML = `
            <div class="px-4 py-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-white text-white font-black text-xs whitespace-nowrap flex items-center gap-2 transform transition-all duration-300 group-hover:shadow-2xl ${property.listing_type === 'sale' ? 'bg-orange-600' : 'bg-primary-600'}">
                <span class="tracking-tight">${priceFormatted}</span>
                <div class="w-px h-3 bg-white/30"></div>
                <span class="uppercase text-[9px] tracking-widest font-black opacity-80">${property.listing_type}</span>
            </div>
            <div class="w-4 h-4 rotate-45 mx-auto -mt-2 border-r-2 border-b-2 border-white shadow-xl ${property.listing_type === 'sale' ? 'bg-orange-600' : 'bg-primary-600'}"></div>
        `;

        content.innerHTML = innerHTML;

        // Create the AdvancedMarkerElement
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
            map,
            position: {
                lat: parseFloat(property.latitude),
                lng: parseFloat(property.longitude),
            },
            content: content,
            title: property.title || 'Property',
        });

        // Add click listener
        marker.addListener('click', () => {
            onClick(property);
        });

        markerRef.current = marker;

        return () => {
            if (markerRef.current) {
                markerRef.current.map = null;
            }
        };
    }, [map, property, onClick]);

    return null;
};

const GoogleMapComponent = ({ listings = [], center, zoom = 12, onMarkerClick, onBoundsChanged, mapStyle = mapContainerStyle }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
        libraries: ['places', 'marker'],
        version: 'beta'
    });

    const [map, setMap] = useState(null);
    const boundsTimeoutRef = React.useRef(null);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

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

    const defaultCenter = useMemo(() => ({
        lat: 13.7563, // Bangkok
        lng: 100.5018
    }), []);

    const mapCenter = useMemo(() => {
        if (center && center.lat && center.lng) return center;
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
            options={options}
            onIdle={handleBoundsChanged}
        >
            {listings.filter(l => l.latitude && l.longitude).map((property) => (
                <PropertyMarker
                    key={property.id}
                    map={map}
                    property={property}
                    onClick={onMarkerClick}
                />
            ))}
        </GoogleMap>
    );
};

export default React.memo(GoogleMapComponent);
