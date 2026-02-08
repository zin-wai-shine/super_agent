import React, { useState, useEffect, useRef } from 'react';
import { publicApi } from '../../services/api';
import { TransitMapSVG } from './transit_map.svg.js';
import { XMarkIcon, MapPinIcon, SparklesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const TransitMapFilter = ({ onStationClick, selectedStation, searchable = false }) => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markerPos, setMarkerPos] = useState(null);
    const [zoom, setZoom] = useState(0.8);
    const [pan, setPan] = useState({ x: -200, y: -200 });
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    const svgContainerRef = useRef(null);
    const mapWrapperRef = useRef(null);

    // Close search results on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch stations on mount
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

    // Handle SVG Interactions (Click & Hover)
    useEffect(() => {
        const container = svgContainerRef.current;
        if (!container) return;

        const handleMapClick = (e) => {
            // Check if clicked element is part of a station group
            const stationGroup = e.target.closest('[data-station-id]');

            if (stationGroup) {
                e.stopPropagation(); // Prevent map click from triggering other things
                const stationId = stationGroup.getAttribute('data-station-id');
                const stationName = stationGroup.querySelector('[data-name="label-en"] text')?.textContent || stationId;

                // Get station coordinates for the marker
                // We use the circle element's cx/cy which are relative to the SVG coordinate system
                const circle = stationGroup.querySelector('circle');
                if (circle) {
                    const cx = parseFloat(circle.getAttribute('cx'));
                    const cy = parseFloat(circle.getAttribute('cy'));
                    setMarkerPos({ x: cx, y: cy });
                }

                if (onStationClick) {
                    onStationClick(stationId, stationName);
                }
            } else {
                // Clicked on empty map space - clear selection if needed?
                // For now, do nothing or let parent handle
            }
        };

        // Add listener to the SVG container (delegation)
        container.addEventListener('click', handleMapClick);

        // Add cursor style
        const style = document.createElement('style');
        style.textContent = `
            [data-station-id] { cursor: pointer; }
            [data-station-id]:hover circle { stroke: #EF4444; stroke-width: 4px; transition: all 0.2s; }
            [data-station-id]:hover text { fill: #EF4444; font-weight: bold; }
        `;
        container.appendChild(style);

        return () => {
            container.removeEventListener('click', handleMapClick);
            if (style.parentNode) style.parentNode.removeChild(style);
        };
    }, [onStationClick]);

    // Sync selectedStation prop with marker position
    useEffect(() => {
        if (!selectedStation || loading || stations.length === 0) return;

        const container = svgContainerRef.current;
        if (!container) return;

        const stationGroup = container.querySelector(`[data-station-id="${selectedStation}"]`);
        if (stationGroup) {
            const circle = stationGroup.querySelector('circle');
            if (circle) {
                const cx = parseFloat(circle.getAttribute('cx'));
                const cy = parseFloat(circle.getAttribute('cy'));
                setMarkerPos({ x: cx, y: cy });

                // Optional: Center map on selection
                // valid zoom ranges roughly 0.2 to 2.0
                // We'll keep current zoom if reasonable, or set default
                const targetZoom = Math.max(zoom, 0.6);
                const mapWidth = 1368;
                const mapHeight = 1340;

                // Calculate pan to center the point
                // viewport center = (containerWidth/2, containerHeight/2)
                // point in pixels = (cx * zoom + panX, cy * zoom + panY)
                // We want point in pixels to be center

                if (mapWrapperRef.current) {
                    const { width: wrapperWidth, height: wrapperHeight } = mapWrapperRef.current.getBoundingClientRect();

                    const newPanX = (wrapperWidth / 2) - (cx * targetZoom);
                    const newPanY = (wrapperHeight / 2) - (cy * targetZoom);

                    setPan({ x: newPanX, y: newPanY });
                    if (targetZoom !== zoom) setZoom(targetZoom);
                }
            }
        }
    }, [selectedStation, loading, stations]);

    // Constrain Pan Logic
    const constrainPan = (newPan, currentZoom) => {
        // Simple constraints to prevent panning too far away
        // Valid range depends on zoom level
        const mapWidth = 1368;
        const mapHeight = 1340;

        // Just return newPan for now to allow free movement, or implement bounds if needed
        return newPan;
    };

    const getMinZoom = () => {
        if (!mapWrapperRef.current) return 0.2;
        const { width, height } = mapWrapperRef.current.getBoundingClientRect();
        return Math.max(width / 1368, height / 1340);
    };

    return (
        <div className="relative h-full flex flex-col">
            {/* Search Bar (Optional) */}
            {searchable && (
                <div className="mb-4 relative z-50 px-4 pt-4" ref={searchRef}>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowResults(true);
                            }}
                            onFocus={() => setShowResults(true)}
                            placeholder="Search station..."
                            className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-[3px] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                        />
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && searchTerm && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[3px] shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-50 animate-fade-in custom-scrollbar">
                            {stations
                                .filter(s =>
                                    s.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    s.id?.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map(station => (
                                    <button
                                        key={station.id}
                                        onClick={() => {
                                            // Trigger regular click logic
                                            const group = svgContainerRef.current?.querySelector(`[data-station-id="${station.id}"]`);
                                            if (group) group.click();

                                            setSearchTerm('');
                                            setShowResults(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between group/item transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900">{station.name_en}</div>
                                            <div className="text-xs text-gray-500">{station.id}</div>
                                        </div>
                                        <span className="text-primary-600 opacity-0 group-hover/item:opacity-100 text-xs font-bold transition-opacity">Select</span>
                                    </button>
                                ))
                            }
                            {stations.filter(s => s.name_en?.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                <div className="p-4 text-center text-sm text-gray-500">No stations found</div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Legend - Modern Pill Chips with 3px Radius & Padding */}
            <div className="px-4">
                <div className="mb-2 md:mb-6 flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-visible gap-2 px-3 py-3 md:px-1 md:py-4 bg-gray-50/30 rounded-[3px] border-b md:border border-gray-100/50 custom-scrollbar shrink-0 w-full md:w-auto -mx-0 md:mx-0">
                    {[
                        { name: 'BTS Sukhumvit', color: '#7FBA00' },
                        { name: 'BTS Silom', color: '#006633' },
                        { name: 'CEN Siam', color: '#666666' },
                        { name: 'MRT Blue', color: '#1E50A0' },
                        { name: 'MRT Purple', color: '#800080' },
                        { name: 'Yellow Line', color: '#FFD700' },
                        { name: 'Pink Line', color: '#FF69B4' },
                        { name: 'Gold Line', color: '#D4AF37' },
                        { name: 'Chao Phraya River', color: '#B8E5FA' },
                    ].map((line) => (
                        <div
                            key={line.name}
                            className="flex items-center gap-2 px-3 py-2 rounded-[3px] bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-default whitespace-nowrap"
                        >
                            <div
                                className="w-2.5 h-2.5 rounded-[1px] flex-none ring-2 ring-white"
                                style={{ backgroundColor: line.color }}
                            />
                            <span className="text-[11px] text-gray-600 font-bold">{line.name}</span>
                        </div>
                    ))}
                </div>
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
                                const minZoom = getMinZoom();
                                const newZoom = Math.max(zoom - 0.1, minZoom);
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
                    style={{ overflow: 'hidden', touchAction: 'none' }}
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
                    onTouchStart={(e) => {
                        if (e.touches.length !== 1) return;
                        const touch = e.touches[0];
                        // Calculate initial offset
                        const startX = touch.pageX - pan.x;
                        const startY = touch.pageY - pan.y;

                        const handleTouchMove = (tm) => {
                            if (tm.cancelable) tm.preventDefault(); // Prevent scrolling
                            const t = tm.touches[0];
                            const newPan = {
                                x: t.pageX - startX,
                                y: t.pageY - startY
                            };
                            setPan(constrainPan(newPan, zoom));
                        };

                        const handleTouchEnd = () => {
                            window.removeEventListener('touchmove', handleTouchMove);
                            window.removeEventListener('touchend', handleTouchEnd);
                        };

                        // Use passive: false to allow preventing default scroll
                        window.addEventListener('touchmove', handleTouchMove, { passive: false });
                        window.addEventListener('touchend', handleTouchEnd);
                    }}
                    onWheel={(e) => {
                        e.preventDefault();
                        const delta = e.deltaY > 0 ? -0.05 : 0.05;
                        const minZoom = getMinZoom();
                        const newZoom = Math.max(minZoom, Math.min(2.0, zoom + delta));
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
                        >
                            <TransitMapSVG />
                        </div>

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
