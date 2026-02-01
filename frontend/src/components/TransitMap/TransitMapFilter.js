import React, { useState, useEffect, useRef } from 'react';
import { publicApi } from '../../services/api';
import { TransitMapSVG } from './transit_map.svg';
import { renderToString } from 'react-dom/server';

const TransitMapFilter = ({ onStationClick, selectedStation }) => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markerPos, setMarkerPos] = useState(null);
    const svgContainerRef = useRef(null);

    // Fetch stations data
    useEffect(() => {
        const fetchStations = async () => {
            try {
                const response = await publicApi.getStations();
                setStations(response.data.stations || []);
            } catch (error) {
                console.error('Failed to fetch stations:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStations();
    }, []);

    // Load SVG and attach listeners
    useEffect(() => {
        if (!loading && svgContainerRef.current) {
            // Use the integrated SVG component instead of fetching external file
            // This ensures the map is bundled with the code
            const svgString = renderToString(<TransitMapSVG />);
            svgContainerRef.current.innerHTML = svgString;

            // Add click listeners to stations
            const stationsGroups = svgContainerRef.current.querySelectorAll('[data-name="station"], [data-name="transit-station"], [data-name="transit"]');

            const attachListeners = (groups) => {
                groups.forEach(group => {
                    group.style.cursor = 'pointer';
                    group.onclick = (e) => {
                        const stationId = group.getAttribute('data-station-id');
                        const labelEn = group.querySelector('[data-name="label-en"] text')?.textContent || stationId;

                        // Find circle or rect for position
                        const shape = group.querySelector('circle, rect');
                        if (shape) {
                            const rect = shape.getBBox();
                            const cx = shape.getAttribute('cx') || rect.x + rect.width / 2;
                            const cy = shape.getAttribute('cy') || rect.y + rect.height / 2;
                            setMarkerPos({ x: cx, y: cy });
                        }

                        if (onStationClick) {
                            onStationClick(stationId, labelEn);
                        }
                    };

                    // Hover effects
                    group.onmouseenter = () => {
                        group.style.filter = 'brightness(1.2) drop-shadow(0 0 2px rgba(0,0,0,0.3))';
                    };
                    group.onmouseleave = () => {
                        group.style.filter = 'none';
                    };
                });
            };

            attachListeners(stationsGroups);

            // Initial marker position if a station is already selected
            if (selectedStation) {
                const selectedGroup = Array.from(stationsGroups).find(g => g.getAttribute('data-station-id') === selectedStation);
                if (selectedGroup) {
                    const shape = selectedGroup.querySelector('circle, rect');
                    if (shape) {
                        const rect = shape.getBBox();
                        const cx = shape.getAttribute('cx') || rect.x + rect.width / 2;
                        const cy = shape.getAttribute('cy') || rect.y + rect.height / 2;
                        setMarkerPos({ x: cx, y: cy });
                    }
                }
            }
        }
    }, [loading, selectedStation, onStationClick]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Legend - Basic lines info */}
            <div className="mb-6 flex flex-wrap gap-4 justify-center">
                {[
                    { name: 'BTS Sukhumvit', color: '#7FBA00' },
                    { name: 'BTS Silom', color: '#006633' },
                    { name: 'CEN Siam', color: '#666666' },
                    { name: 'MRT Blue', color: '#1E50A0' },
                    { name: 'MRT Purple', color: '#800080' },
                    { name: 'Yellow Line', color: '#FFD700' },
                    { name: 'Pink Line', color: '#FF69B4' },
                    { name: 'Gold Line', color: '#D4AF37' },
                ].map((line) => (
                    <div key={line.name} className="flex items-center space-x-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: line.color }}
                        />
                        <span className="text-xs text-gray-500 font-medium">{line.name}</span>
                    </div>
                ))}
            </div>

            {/* Interactive Map Container */}
            <div className="relative bg-white rounded-3xl p-6 shadow-xl border border-gray-100 overflow-hidden">
                <div
                    className="overflow-auto custom-scrollbar"
                    style={{ maxHeight: '70vh' }}
                >
                    <div className="relative" style={{ width: '1368px', height: '1340px' }}>
                        <div
                            ref={svgContainerRef}
                            className="w-full h-full transit-map-svg"
                        />

                        {/* Selected Station Highlighter (Pulsing Dot) */}
                        {markerPos && (
                            <div
                                className="absolute pointer-events-none z-50 transition-all duration-300 ease-out"
                                style={{
                                    left: `${markerPos.x}px`,
                                    top: `${markerPos.y}px`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <div className="relative flex items-center justify-center">
                                    <div className="w-8 h-8 bg-red-500/30 rounded-full animate-ping absolute"></div>
                                    <div className="w-4 h-4 bg-red-600 rounded-full shadow-lg border-2 border-white relative z-10"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Map Controls Tips */}
                <div className="absolute bottom-6 right-6 flex flex-col items-end space-y-2 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-2">
                        <span className="text-[10px] text-gray-400 font-medium">Scroll to explore map</span>
                    </div>
                </div>
            </div>

            {/* Selected Station Info Card */}
            {selectedStation && (
                <div className="mt-6 p-5 bg-white rounded-2xl border-l-4 border-primary-500 shadow-lg animate-fade-in flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <span className="block text-xs font-semibold text-primary-600 uppercase tracking-wider">Active Filter</span>
                            <span className="text-lg font-bold text-gray-900">
                                Station: {stations.find(s => s.id === selectedStation)?.name_en || selectedStation}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setMarkerPos(null);
                            onStationClick('', '');
                        }}
                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {!selectedStation && (
                <p className="text-center text-gray-400 text-sm mt-6 font-medium">
                    Click on any station in the map to find nearby properties
                </p>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                
                .transit-map-svg svg { width: 100%; height: 100%; }
                
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default TransitMapFilter;
