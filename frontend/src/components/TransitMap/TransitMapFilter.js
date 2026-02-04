import React, { useState, useEffect, useRef } from 'react';
import { publicApi } from '../../services/api';
import { TransitMapSVG } from './transit_map.svg';
import { renderToString } from 'react-dom/server';
import { XMarkIcon, MapPinIcon, SparklesIcon } from '@heroicons/react/24/outline';

const TransitMapFilter = ({ onStationClick, selectedStation }) => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markerPos, setMarkerPos] = useState(null);
    const [zoom, setZoom] = useState(0.8); // Default zoom matched to visual
    const [pan, setPan] = useState({ x: -200, y: -200 });
    const svgContainerRef = useRef(null);
    const mapWrapperRef = useRef(null);

    // Map dimensions (from SVG)
    const MAP_WIDTH = 1368;
    const MAP_HEIGHT = 1340;

    const constrainPan = (newPan, currentZoom) => {
        if (!mapWrapperRef.current) return newPan;

        const containerWidth = mapWrapperRef.current.clientWidth;
        const containerHeight = mapWrapperRef.current.clientHeight;

        // Calculate boundaries
        // If scaled map is larger than container, we can pan
        // If smaller, we center it or lock to 0
        const scaledWidth = MAP_WIDTH * currentZoom;
        const scaledHeight = MAP_HEIGHT * currentZoom;

        let minX, maxX, minY, maxY;

        if (scaledWidth > containerWidth) {
            minX = containerWidth - scaledWidth;
            maxX = 0;
        } else {
            // Center horizontally if smaller
            minX = (containerWidth - scaledWidth) / 2;
            maxX = minX;
        }

        if (scaledHeight > containerHeight) {
            minY = containerHeight - scaledHeight;
            maxY = 0;
        } else {
            // Center vertically if smaller
            minY = (containerHeight - scaledHeight) / 2;
            maxY = minY;
        }

        return {
            x: Math.min(Math.max(newPan.x, minX), maxX),
            y: Math.min(Math.max(newPan.y, minY), maxY)
        };
    };

    // Fetch stations data
    useEffect(() => {
        const fetchStations = async () => {
            try {
                const response = await publicApi.getStations();
                setStations(response.data.stations || []);

                // Initial centering based on common Bangkok stations (or just middle)
                // setPan({ x: -450, y: -450 }); // Rough center for the 1368x1340 map - now set as initial state
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
        <div className="relative h-full flex flex-col">
            {/* Legend - Modern Pill Chips with 3px Radius & Padding */}
            <div className="mb-6 flex flex-wrap gap-2 px-1 py-4 bg-gray-50/30 rounded-[3px] border border-gray-100/50">
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
                    <div
                        key={line.name}
                        className="flex items-center gap-2 px-3 py-2 rounded-[3px] bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-default"
                    >
                        <div
                            className="w-2.5 h-2.5 rounded-[1px] flex-none ring-2 ring-white"
                            style={{ backgroundColor: line.color }}
                        />
                        <span className="text-[11px] text-gray-600 font-bold whitespace-nowrap">{line.name}</span>
                    </div>
                ))}
            </div>

            {/* Interactive Map Container - Full Bleed */}
            <div className="relative bg-white overflow-hidden group flex-1">
                {/* Zoom Controls Overlay - Floating Glassmorphism */}
                <div className="absolute top-6 right-6 z-50 flex flex-col gap-2">
                    <div className="flex flex-col bg-white/80 backdrop-blur-md rounded-[3px] shadow-xl border border-white/20 p-1">
                        <button
                            onClick={() => {
                                const newZoom = Math.min(zoom + 0.1, 2.0);
                                setZoom(newZoom);
                                setPan(p => constrainPan(p, newZoom));
                            }}
                            className="w-11 h-11 flex items-center justify-center text-gray-700 font-bold hover:bg-white hover:text-primary-600 rounded-[3px] transition-all active:scale-95"
                            title="Zoom In"
                        >
                            <span className="text-xl">+</span>
                        </button>
                        <div className="h-px bg-gray-100 mx-2" />
                        <button
                            onClick={() => {
                                const newZoom = Math.max(zoom - 0.1, 0.2);
                                setZoom(newZoom);
                                setPan(p => constrainPan(p, newZoom));
                            }}
                            className="w-11 h-11 flex items-center justify-center text-gray-700 font-bold hover:bg-white hover:text-primary-600 rounded-[3px] transition-all active:scale-95"
                            title="Zoom Out"
                        >
                            <span className="text-xl">−</span>
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            const defaultZoom = 0.8;
                            setZoom(defaultZoom);
                            setPan(constrainPan({ x: -200, y: -200 }, defaultZoom));
                        }}
                        className="w-11 h-11 bg-white/80 backdrop-blur-md shadow-xl border border-white/20 rounded-[3px] flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-white transition-all active:scale-95"
                        title="Reset View"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>

                <div
                    ref={mapWrapperRef}
                    className="relative cursor-grab active:cursor-grabbing select-none h-full bg-slate-50"
                    style={{ overflow: 'hidden' }}
                    onMouseDown={(e) => {
                        const startX = e.pageX - pan.x;
                        const startY = e.pageY - pan.y;

                        const handleMouseMove = (mm) => {
                            const newPan = {
                                x: mm.pageX - startX,
                                y: mm.pageY - startY
                            };
                            setPan(constrainPan(newPan, zoom));
                        };

                        const handleMouseUp = () => {
                            window.removeEventListener('mousemove', handleMouseMove);
                            window.removeEventListener('mouseup', handleMouseUp);
                        };

                        window.addEventListener('mousemove', handleMouseMove);
                        window.addEventListener('mouseup', handleMouseUp);
                    }}
                    onWheel={(e) => {
                        e.preventDefault();
                        const delta = e.deltaY > 0 ? -0.05 : 0.05;
                        const newZoom = Math.max(0.2, Math.min(2.0, zoom + delta));
                        setZoom(newZoom);
                        setPan(p => constrainPan(p, newZoom));
                    }}
                >
                    <div
                        className="relative"
                        style={{
                            width: '1368px',
                            height: '1340px',
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transformOrigin: '0 0',
                            transition: 'transform 0.1s ease-out'
                        }}
                    >
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
                                    <div className="w-4 h-4 bg-red-600 rounded-[1px] shadow-lg border-2 border-white relative z-10"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Map Controls Tips */}
                <div className="absolute bottom-6 right-6 flex flex-col items-end space-y-2 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur px-3 py-2 rounded-[3px] shadow-sm border border-gray-100 flex items-center space-x-2">
                        <span className="text-[10px] text-gray-400 font-medium">Scroll to explore map</span>
                    </div>
                </div>
            </div>

            {/* Selected Station Info Card - Modern Premium with 3px Radius */}
            {selectedStation && (
                <div className="mt-6 p-4 bg-white rounded-[3px] border border-gray-100 shadow-xl flex items-center justify-between animate-fade-in ring-1 ring-black/[0.02]">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-50 rounded-[3px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <MapPinIcon className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <span className="block text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] leading-none mb-1.5">Station Active</span>
                            <span className="text-lg font-black text-gray-900 tracking-tight">
                                {stations.find(s => s.id === selectedStation)?.name_en || selectedStation}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setMarkerPos(null);
                            onStationClick('', '');
                        }}
                        className="p-2.5 hover:bg-gray-50 text-gray-400 hover:text-red-500 rounded-[3px] transition-all hover:rotate-90"
                        title="Clear Selection"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            {!selectedStation && (
                <div className="flex items-center justify-center gap-2 mt-8 py-4 px-6 bg-gray-50/50 rounded-[3px] border border-dashed border-gray-200">
                    <SparklesIcon className="w-4 h-4 text-primary-400" />
                    <p className="text-gray-400 text-sm font-bold tracking-tight">
                        Click any station on the map to find nearby properties
                    </p>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .transit-map-svg svg { width: 100%; height: 100%; }
                
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}} />
        </div>
    );
};

export default TransitMapFilter;
