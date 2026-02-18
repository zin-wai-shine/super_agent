import React, { useState, useEffect, useRef } from 'react';
import { publicApi } from '../../services/api';
import { TransitMapSVG } from './transit_map.svg.js';
import { XMarkIcon, MapPinIcon, SparklesIcon, MagnifyingGlassIcon, MapIcon } from '@heroicons/react/24/outline';

const TransitMapFilter = ({
    onStationClick,
    selectedStation,
    searchable = false,
    showTitle = false,
    onClose = null,
    externalStations = null,
    hideHeader = false
}) => {
    const [internalStations, setInternalStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const stations = externalStations || internalStations;
    const [markerPos, setMarkerPos] = useState(null);
    const [zoom, setZoom] = useState(1.5);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    const svgContainerRef = useRef(null);
    const mapWrapperRef = useRef(null);

    // Center on mount
    useEffect(() => {
        if (!mapWrapperRef.current) return;

        const { width: wrapperWidth, height: wrapperHeight } = mapWrapperRef.current.getBoundingClientRect();
        const mapWidth = 1368;
        const mapHeight = 1340;

        // Center the map content
        const initialPanX = (wrapperWidth - mapWidth * zoom) / 2;
        const initialPanY = (wrapperHeight - mapHeight * zoom) / 2;

        setPan({ x: initialPanX, y: initialPanY });
    }, []);

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

    // Fetch stations on mount if not provided externally
    useEffect(() => {
        if (externalStations) {
            setLoading(false);
            return;
        }
        const fetchStations = async () => {
            try {
                const response = await publicApi.getStations();
                setInternalStations(response.data.stations || []);
            } catch (error) {
                console.error('Failed to fetch stations:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStations();
    }, [externalStations]);

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

    // Sync selectedStation prop with marker position and zoom
    useEffect(() => {
        if (!mapWrapperRef.current) return;
        const { width: wrapperWidth, height: wrapperHeight } = mapWrapperRef.current.getBoundingClientRect();
        const mapWidth = 1368;
        const mapHeight = 1340;

        if (!selectedStation) {
            setMarkerPos(null);
            // Default centered view
            const defaultZoom = 1.2;
            const resetPanX = (wrapperWidth - mapWidth * defaultZoom) / 2;
            const resetPanY = (wrapperHeight - mapHeight * defaultZoom) / 2;
            setZoom(defaultZoom);
            setPan({ x: resetPanX, y: resetPanY });
            return;
        }

        if (loading || stations.length === 0) return;

        const container = svgContainerRef.current;
        if (!container) return;

        const stationGroup = container.querySelector(`[data-station-id="${selectedStation}"]`);
        if (stationGroup) {
            const circle = stationGroup.querySelector('circle');
            if (circle) {
                const cx = parseFloat(circle.getAttribute('cx'));
                const cy = parseFloat(circle.getAttribute('cy'));
                setMarkerPos({ x: cx, y: cy });

                // Targeted zoom on selection
                const targetZoom = 2.5;

                // Calculate pan to center the point
                const newPanX = (wrapperWidth / 2) - (cx * targetZoom);
                const newPanY = (wrapperHeight / 2) - (cy * targetZoom);

                setPan({ x: newPanX, y: newPanY });
                setZoom(targetZoom);
            }
        }
    }, [selectedStation, loading, stations]);

    // Constrain Pan Logic
    const constrainPan = (newPan, currentZoom) => {
        if (!mapWrapperRef.current) return newPan;

        const { width: wrapperWidth, height: wrapperHeight } = mapWrapperRef.current.getBoundingClientRect();
        // Slightly larger than the raw SVG to account for labels and allow "breathing room"
        const mapWidth = 1450;
        const mapHeight = 1450;

        const scaledWidth = mapWidth * currentZoom;
        const scaledHeight = mapHeight * currentZoom;

        let constrainedX = newPan.x;
        let constrainedY = newPan.y;

        // X constraints - allow panning until mostly off-screen but keep a buffer
        const bufferX = wrapperWidth * 0.4; // Allow 40% of the screen to be "over-panned"

        if (scaledWidth <= wrapperWidth) {
            // If map is smaller than container, center it or allow small movement
            constrainedX = (wrapperWidth - scaledWidth) / 2;
        } else {
            const minX = wrapperWidth - scaledWidth - bufferX;
            const maxX = bufferX;
            constrainedX = Math.min(maxX, Math.max(minX, newPan.x));
        }

        // Y constraints
        const bufferY = wrapperHeight * 0.4;

        if (scaledHeight <= wrapperHeight) {
            // If map is smaller than container, center it
            constrainedY = (wrapperHeight - scaledHeight) / 2;
        } else {
            const minY = wrapperHeight - scaledHeight - bufferY;
            const maxY = bufferY;
            constrainedY = Math.min(maxY, Math.max(minY, newPan.y));
        }

        return { x: constrainedX, y: constrainedY };
    };

    const getMinZoom = () => {
        if (!mapWrapperRef.current) return 0.2;
        const { width, height } = mapWrapperRef.current.getBoundingClientRect();
        return Math.max(width / 1368, height / 1340);
    };

    return (
        <div className="relative h-full flex flex-col">
            {/* Conditional Header with Integrated Search */}
            {!hideHeader && (showTitle || searchable) && (
                <div className="h-16 px-4 pr-6 border-b border-primary-700/30 flex items-center bg-primary-600 shadow-md flex-shrink-0 z-[110] relative">
                    {showTitle && (
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="bg-white/20 p-2 rounded-[3px] backdrop-blur-md">
                                <MapIcon className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-bold text-white whitespace-nowrap">Transit Explorer</h3>
                        </div>
                    )}

                    {/* Integrated Search Box - Near Title */}
                    {searchable && (
                        <div className={`${showTitle ? 'ml-6' : ''} flex-1 max-w-xl`} ref={searchRef}>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-white/70 group-focus-within:text-white transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowResults(true);
                                    }}
                                    onFocus={() => setShowResults(true)}
                                    placeholder="Search transit station..."
                                    className="block w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-[3px] text-sm font-bold text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all shadow-inner"
                                />

                                {/* Search Results Dropdown - Relative to Header */}
                                {showResults && searchTerm && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-[3px] shadow-2xl border border-white/20 max-h-[400px] overflow-y-auto z-[120] animate-fade-in custom-scrollbar">
                                        {stations
                                            .filter(s =>
                                                s.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                s.id?.toLowerCase().includes(searchTerm.toLowerCase())
                                            )
                                            .map(station => (
                                                <button
                                                    key={station.id}
                                                    onClick={() => {
                                                        if (onStationClick) {
                                                            onStationClick(station.id, station.name_en);
                                                        }
                                                        setSearchTerm('');
                                                        setShowResults(false);
                                                    }}
                                                    className="w-full text-left px-5 py-3.5 hover:bg-primary-50/50 flex items-center justify-between group/item transition-all border-b border-gray-100/50 last:border-0"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-[1px] bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover/item:bg-primary-100 group-hover/item:text-primary-600 transition-colors">
                                                            {station.id.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 leading-tight">{station.name_en}</div>
                                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{station.id}</div>
                                                        </div>
                                                    </div>
                                                    <span className="text-primary-600 opacity-0 group-hover/item:opacity-100 text-[10px] font-black uppercase tracking-widest transition-opacity translate-x-1 group-hover/item:translate-x-0">Select</span>
                                                </button>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Legend - Modern Pill Chips with Wrap Support */}
            <div className="px-6 py-4 relative z-[100] bg-white border-b border-gray-100/80 w-full max-w-full overflow-hidden flex-shrink-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 w-full min-w-0 flex-1">
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
                            className="flex items-center gap-2 px-3 py-1.5 rounded-[3px] bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-default"
                        >
                            <div
                                className="w-2.5 h-2.5 rounded-[1px] flex-none ring-2 ring-white"
                                style={{ backgroundColor: line.color }}
                            />
                            <span className="text-[11px] text-gray-600 font-bold whitespace-nowrap">{line.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Interactive Map Container - Full Bleed */}
            <div className="relative bg-white overflow-hidden group flex-1">
                {/* Search box removed from here (moved to header) */}

                {/* Zoom & Reset Controls Overlay - Floating Glassmorphism */}
                <div className="absolute top-6 right-6 z-[90] flex flex-col gap-3">
                    <div className="flex flex-col bg-white/90 backdrop-blur-xl rounded-[3px] shadow-2xl border border-white/20 p-2">
                        <button
                            onClick={() => {
                                const newZoom = Math.min(zoom + 0.1, 2.0);
                                setZoom(newZoom);
                                setPan(p => constrainPan(p, newZoom));
                            }}
                            className="w-12 h-12 flex items-center justify-center text-gray-800 hover:bg-primary-600 hover:text-white rounded-[3px] transition-all duration-300 group/btn"
                            title="Zoom In"
                        >
                            <span className="text-2xl font-light group-hover/btn:scale-110 transition-transform">+</span>
                        </button>
                        <div className="h-px bg-gray-100/50 my-1 mx-2 transition-opacity group-hover:opacity-0" />
                        <button
                            onClick={() => {
                                const minZoom = getMinZoom();
                                const newZoom = Math.max(zoom - 0.1, minZoom);
                                setZoom(newZoom);
                                setPan(p => constrainPan(p, newZoom));
                            }}
                            className="w-12 h-12 flex items-center justify-center text-gray-800 hover:bg-primary-600 hover:text-white rounded-[3px] transition-all duration-300 group/btn"
                            title="Zoom Out"
                        >
                            <span className="text-2xl font-light group-hover/btn:scale-110 transition-transform">−</span>
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            const defaultZoom = 1.5;
                            const { width: wrapperWidth, height: wrapperHeight } = mapWrapperRef.current.getBoundingClientRect();
                            const initialPanX = (wrapperWidth - 1368 * defaultZoom) / 2;
                            const initialPanY = (wrapperHeight - 1340 * defaultZoom) / 2;

                            setZoom(defaultZoom);
                            setPan(constrainPan({ x: initialPanX, y: initialPanY }, defaultZoom));
                        }}
                        className="w-16 h-16 bg-white/90 backdrop-blur-xl shadow-2xl border border-white/20 rounded-[3px] flex items-center justify-center text-gray-800 hover:text-primary-600 hover:bg-white transition-all duration-500 group/reset active:scale-95"
                        title="Reset View"
                    >
                        <svg className="w-7 h-7 transition-transform duration-700 group-hover/reset:rotate-[360deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>

                <div
                    ref={mapWrapperRef}
                    className="relative cursor-grab active:cursor-grabbing select-none h-full bg-slate-50 z-10"
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
                        const startX = touch.pageX - pan.x;
                        const startY = touch.pageY - pan.y;

                        const handleTouchMove = (tm) => {
                            if (tm.cancelable) tm.preventDefault();
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
            </div >

            {/* Selected Station Info Card - Modern Premium with 3px Radius */}
            {
                selectedStation && (
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
                )
            }

            {
                !selectedStation && (
                    <div className="flex items-center justify-center gap-2 mt-8 py-4 px-6 bg-gray-50/50 rounded-[3px] border border-dashed border-gray-200">
                        <SparklesIcon className="w-4 h-4 text-primary-400" />
                        <p className="text-gray-400 text-sm font-bold tracking-tight">
                            Click any station on the map to find nearby properties
                        </p>
                    </div>
                )
            }

            <style dangerouslySetInnerHTML={{
                __html: `
                .transit-map-svg svg { width: 100%; height: 100%; }
                
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}} />
        </div >
    );
};

export default TransitMapFilter;
