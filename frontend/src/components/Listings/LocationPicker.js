import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const defaultCenter = {
    lat: 13.7563, // Bangkok
    lng: 100.5018
};

const DraggableMarker = ({ map, position, onDragEnd }) => {
    const markerRef = React.useRef(null);

    React.useEffect(() => {
        if (!map || !position) return;

        const marker = new window.google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            gmpDraggable: true,
            title: "Property Location",
        });

        const listener = marker.addListener('dragend', (e) => {
            onDragEnd({
                latLng: {
                    lat: () => marker.position.lat,
                    lng: () => marker.position.lng
                }
            });
        });

        markerRef.current = marker;

        return () => {
            if (markerRef.current) {
                markerRef.current.map = null;
            }
            if (listener) listener.remove();
        };
    }, [map]); // Only run on map load to avoid recreating marker on every position change

    // Sync position separately if needed, but for precision picker it's usually fine to let map handle it.
    // However, if the address search updates the position, we need to sync it.
    React.useEffect(() => {
        if (markerRef.current && position) {
            markerRef.current.position = position;
        }
    }, [position]);

    return null;
};

const LocationPicker = ({ value, onChange, address }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
        libraries: ['places', 'marker'],
        version: 'beta'
    });

    const [map, setMap] = useState(null);
    const [autocomplete, setAutocomplete] = useState(null);

    const center = useMemo(() => {
        if (value && value.lat && value.lng) {
            return { lat: parseFloat(value.lat), lng: parseFloat(value.lng) };
        }
        return defaultCenter;
    }, [value]);

    const markerPosition = useMemo(() => {
        if (value && value.lat && value.lng) {
            return { lat: parseFloat(value.lat), lng: parseFloat(value.lng) };
        }
        return null;
    }, [value]);

    const onMapClick = useCallback((e) => {
        onChange({
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        });
    }, [onChange]);

    const onMarkerDragEnd = useCallback((e) => {
        onChange({
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        });
    }, [onChange]);

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
                const newPos = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };
                onChange(newPos);
                if (map) {
                    map.panTo(newPos);
                    map.setZoom(17);
                }
            }
        }
    };

    if (!isLoaded) return <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl" />;

    return (
        <div className="relative h-full w-full">
            <div className="absolute top-4 left-4 right-4 z-10">
                <Autocomplete
                    onLoad={setAutocomplete}
                    onPlaceChanged={onPlaceChanged}
                >
                    <input
                        type="text"
                        placeholder="Search for a location or address..."
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[3px] shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                    />
                </Autocomplete>
            </div>

            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={markerPosition ? 17 : 12}
                onClick={onMapClick}
                onLoad={setMap}
                options={{
                    disableDefaultUI: false,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    gestureHandling: 'greedy', // Allow direct scroll zoom without Cmd key
                    mapId: 'DEMO_MAP_ID'
                }}
            >
                {markerPosition && (
                    <DraggableMarker
                        map={map}
                        position={markerPosition}
                        onDragEnd={onMarkerDragEnd}
                    />
                )}
            </GoogleMap>

            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-[3px] shadow-sm border border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Click on map or drag pin to adjust
            </div>
        </div>
    );
};

export default React.memo(LocationPicker);
