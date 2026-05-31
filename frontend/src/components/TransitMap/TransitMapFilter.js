import React, { useState, useEffect, useRef } from 'react';
import { publicApi } from '../../services/api';
import { TransitMapSVG } from './transit_map.svg.js';
import { XMarkIcon, MapPinIcon, SparklesIcon, MagnifyingGlassIcon, MapIcon, PlusIcon, MinusIcon, ArrowPathIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import { usePublicDarkTheme } from '../../contexts/PublicDarkThemeContext';

const TransitMapFilter = ({
    onStationClick,
    selectedStations = [], // Array of station IDs
    selectedStation = null, // Single ID for centering/focus
    searchable = false,
    showTitle = false,
    onClose = null,
    externalStations = null,
    hideHeader = false,
    forceDarkMode = false
}) => {
    const { isDarkMode: contextDarkMode } = usePublicDarkTheme();
    const isDarkMode = forceDarkMode || contextDarkMode;
    const [internalStations, setInternalStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const stations = externalStations || internalStations;
    const [markers, setMarkers] = useState([]); // Array of {id, x, y}
    const [zoom, setZoom] = useState(1.55);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isInteracting, setIsInteracting] = useState(false); // no transition during drag/zoom for smooth follow
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    const svgContainerRef = useRef(null);
    const mapWrapperRef = useRef(null);
    const touchStateRef = useRef(null);
    const panZoomRef = useRef({ pan, zoom });
    useEffect(() => { panZoomRef.current = { pan, zoom }; }, [pan, zoom]);

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

    // Touch move with passive: false so preventDefault works on mobile (React default is passive: true)
    useEffect(() => {
        const el = mapWrapperRef.current;
        if (!el) return;
        const handleTouchMove = (e) => {
            if (touchStateRef.current && (e.touches.length === 1 || e.touches.length === 2)) {
                e.preventDefault();
            }
        };
        el.addEventListener('touchmove', handleTouchMove, { passive: false });
        return () => el.removeEventListener('touchmove', handleTouchMove);
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
            const stationGroup = e.target.closest('[data-station-id]');

            if (stationGroup) {
                e.stopPropagation();
                const stationId = stationGroup.getAttribute('data-station-id');
                const stationName = stationGroup.querySelector('[data-name="label-en"] text')?.textContent || stationId;

                if (onStationClick) {
                    onStationClick(stationId, stationName);
                }
            }
        };

        container.addEventListener('click', handleMapClick);

        // Add cursor style and selective highlighting
        const style = document.createElement('style');
        style.textContent = `
            [data-station-id] { cursor: pointer; }
            [data-station-id]:hover circle { stroke: #EF4444; stroke-width: 4px; transition: all 0.2s; }
            [data-station-id].is-selected circle { stroke: #EF4444; stroke-width: 1px; fill: #EF4444 !important; transform: scale(0.5); transform-origin: center; transform-box: fill-box; transition: all 0.3s; }
            [data-station-id]:hover text { fill: #EF4444; font-weight: bold; }
        `;
        container.appendChild(style);

        return () => {
            container.removeEventListener('click', handleMapClick);
            if (style.parentNode) style.parentNode.removeChild(style);
        };
    }, [onStationClick]);

    // Update markers based on selectedStations
    useEffect(() => {
        const container = svgContainerRef.current;
        if (!container || loading) return;

        const newMarkers = [];
        const stationsToProcess = (selectedStations || []);

        stationsToProcess.forEach(id => {
            const stationGroup = container.querySelector(`[data-station-id="${id}"]`);
            if (stationGroup) {
                stationGroup.classList.add('is-selected');
                const circles = stationGroup.querySelectorAll('circle');
                if (circles.length > 0) {
                    let cx = 0, cy = 0;
                    circles.forEach(c => {
                        cx += parseFloat(c.getAttribute('cx') || 0);
                        cy += parseFloat(c.getAttribute('cy') || 0);
                    });
                    newMarkers.push({
                        id,
                        x: cx / circles.length,
                        y: cy / circles.length
                    });
                }
            }
        });

        // Cleanup old selections
        container.querySelectorAll('[data-station-id]').forEach(el => {
            const id = el.getAttribute('data-station-id');
            if (!stationsToProcess.includes(id)) {
                el.classList.remove('is-selected');
            }
        });

        setMarkers(newMarkers);
    }, [selectedStations, loading]);

    // Centering logic for selectedStation (single focus)
    useEffect(() => {
        if (!mapWrapperRef.current || !selectedStation || loading) return;
        const { width: wrapperWidth, height: wrapperHeight } = mapWrapperRef.current.getBoundingClientRect();

        const container = svgContainerRef.current;
        if (!container) return;

        const stationGroup = container.querySelector(`[data-station-id="${selectedStation}"]`);
        if (stationGroup) {
            const circles = stationGroup.querySelectorAll('circle');
            if (circles.length > 0) {
                let cx = 0, cy = 0;
                circles.forEach(c => {
                    cx += parseFloat(c.getAttribute('cx') || 0);
                    cy += parseFloat(c.getAttribute('cy') || 0);
                });
                cx /= circles.length;
                cy /= circles.length;

                // Targeted zoom on selection
                const targetZoom = 2.5;
                const newPanX = (wrapperWidth / 2) - (cx * targetZoom);
                const newPanY = (wrapperHeight / 2) - (cy * targetZoom);

                setPan({ x: newPanX, y: newPanY });
                setZoom(targetZoom);
            }
        }
    }, [selectedStation, loading]);

    // Constrain Pan Logic — use actual map size (1368×1340) and small buffer so right/bottom stations are reachable
    const constrainPan = (newPan, currentZoom) => {
        if (!mapWrapperRef.current) return newPan;

        const { width: wrapperWidth, height: wrapperHeight } = mapWrapperRef.current.getBoundingClientRect();
        const mapWidth = 1368;
        const mapHeight = 1340;

        const scaledWidth = mapWidth * currentZoom;
        const scaledHeight = mapHeight * currentZoom;

        let constrainedX = newPan.x;
        let constrainedY = newPan.y;

        const bufferX = Math.min(24, wrapperWidth * 0.08);

        if (scaledWidth <= wrapperWidth) {
            constrainedX = (wrapperWidth - scaledWidth) / 2;
        } else {
            const minX = wrapperWidth - scaledWidth - bufferX;
            const maxX = bufferX;
            constrainedX = Math.min(maxX, Math.max(minX, newPan.x));
        }

        const bufferY = Math.min(24, wrapperHeight * 0.08);

        if (scaledHeight <= wrapperHeight) {
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
        <div className="relative h-full min-h-0 flex flex-col flex-1">
            {/* Conditional Header with Integrated Search */}
            {!hideHeader && (showTitle || searchable) && (
                <div className="h-16 px-4 pr-6 border-b border-gray-100 dark:border-white/5 flex items-center bg-white dark:bg-dashboard-card flex-shrink-0 z-[110] relative">
                    {showTitle && (
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="bg-primary-50 dark:bg-primary-900/20 p-2 rounded-full shadow-sm">
                                <MapIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white whitespace-nowrap">Transit Explorer</h3>
                        </div>
                    )}

                    {searchable && (
                        <div className={`${showTitle ? 'ml-6' : ''} flex-1 max-w-xl`} ref={searchRef}>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                    <MagnifyingGlassIcon className="h-6 w-6 text-[#222222] dark:text-white transition-colors" />
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
                                    className="block w-full pl-12 pr-4 py-2.5 bg-gray-50/40 dark:bg-white/5 border border-[#222222] dark:border-white/20 rounded-full text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-all shadow-sm"
                                />

                                {showResults && searchTerm && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-dashboard-card/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 dark:border-white/5 max-h-[400px] overflow-y-auto z-[120] animate-fade-in custom-scrollbar">
                                        {stations
                                            .filter(s => {
                                                const normalize = (str) => str?.toString().toLowerCase().trim().replace(/\s+/g, '') || '';
                                                const normalizedTerm = normalize(searchTerm);
                                                return (
                                                    normalize(s.name_en).includes(normalizedTerm) ||
                                                    normalize(s.id).includes(normalizedTerm)
                                                );
                                            })
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
                                                    className="w-full text-left px-5 py-3.5 hover:bg-primary-50/50 dark:hover:bg-white/5 flex items-center justify-between group/item transition-all border-b border-gray-100/50 dark:border-white/5 last:border-0"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-[1px] bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover/item:bg-primary-100 group-hover/item:text-primary-600 transition-colors">
                                                            {station.id.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 dark:text-white leading-tight">{station.name_en}</div>
                                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{station.id}</div>
                                                        </div>
                                                    </div>
                                                    <span className="text-primary-600 opacity-0 group-hover/item:opacity-100 text-[10px] font-black uppercase tracking-widest transition-opacity translate-x-1 group-hover/item:translate-x-0">
                                                        {selectedStations.includes(station.id) ? 'Deselect' : 'Select'}
                                                    </span>
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

            {/* Legend */}
            {!hideHeader && (
                <div className="px-6 py-4 relative z-[100] bg-white dark:bg-dashboard-card border-b border-gray-100/80 dark:border-white/5 w-full max-w-full overflow-hidden flex-shrink-0">
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
                            { name: 'River', color: isDarkMode ? '#1e3a4a' : '#B8E5FA' },
                        ].map((line) => (
                            <div
                                key={line.name}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow cursor-default"
                            >
                                <div
                                    className="w-2.5 h-2.5 rounded-[1px] flex-none ring-2 ring-white"
                                    style={{ backgroundColor: line.color }}
                                />
                                <span className="text-[11px] text-gray-600 dark:text-gray-400 font-bold whitespace-nowrap">{line.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Interactive Map Container */}
            <div className="relative bg-transparent overflow-hidden group flex-1">
                {/* Zoom & Reset Controls - Bottom Right Vertical (Hidden on Mobile) */}
                <div className="absolute bottom-6 right-6 z-[90] hidden sm:flex flex-col items-center gap-3">
                    {/* Zoom Pill */}
                    <div className="bg-white/70 dark:bg-black/50 backdrop-blur-xl rounded-full shadow-2xl border border-white/50 dark:border-white/10 flex flex-col p-1 overflow-hidden">
                        <button
                            onClick={() => {
                                if (!mapWrapperRef.current) return;
                                const newZoom = Math.min(zoom + 0.1, 2.0);
                                if (newZoom === zoom) return;

                                const { width, height } = mapWrapperRef.current.getBoundingClientRect();
                                const centerX = width / 2;
                                const centerY = height / 2;

                                const scaleChange = newZoom / zoom;
                                const newPanX = centerX - (centerX - pan.x) * scaleChange;
                                const newPanY = centerY - (centerY - pan.y) * scaleChange;

                                setZoom(newZoom);
                                setPan(constrainPan({ x: newPanX, y: newPanY }, newZoom));
                            }}
                            className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10 transition-all active:scale-90"
                            title="Zoom In"
                        >
                            <PlusIcon className="w-5 h-5 stroke-[2.5]" />
                        </button>
                        <div className="h-px bg-white/40 mx-2" />
                        <button
                            onClick={() => {
                                if (!mapWrapperRef.current) return;
                                const minZoom = getMinZoom();
                                const newZoom = Math.max(zoom - 0.1, minZoom);
                                if (newZoom === zoom) return;

                                const { width, height } = mapWrapperRef.current.getBoundingClientRect();
                                const centerX = width / 2;
                                const centerY = height / 2;

                                const scaleChange = newZoom / zoom;
                                const newPanX = centerX - (centerX - pan.x) * scaleChange;
                                const newPanY = centerY - (centerY - pan.y) * scaleChange;

                                setZoom(newZoom);
                                setPan(constrainPan({ x: newPanX, y: newPanY }, newZoom));
                            }}
                            className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10 transition-all active:scale-90"
                            title="Zoom Out"
                        >
                            <MinusIcon className="w-5 h-5 stroke-[2.5]" />
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            const defaultZoom = 1.55;
                            const { width: wrapperWidth, height: wrapperHeight } = mapWrapperRef.current.getBoundingClientRect();
                            const initialPanX = (wrapperWidth - 1368 * defaultZoom) / 2;
                            const initialPanY = (wrapperHeight - 1340 * defaultZoom) / 2;

                            setZoom(defaultZoom);
                            setPan(constrainPan({ x: initialPanX, y: initialPanY }, defaultZoom));
                        }}
                        className="w-12 h-12 bg-white/70 dark:bg-black/50 backdrop-blur-xl rounded-full shadow-2xl border border-white/50 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10 transition-all active:scale-95 group"
                        title="Reset View"
                    >
                        <ArrowPathIcon className="w-6 h-6 group-active:rotate-180 transition-transform duration-500" />
                    </button>
                </div>

                <div
                    ref={mapWrapperRef}
                    className="relative cursor-grab active:cursor-grabbing select-none h-full bg-transparent z-10"
                    style={{ overflow: 'hidden', touchAction: 'none' }}
                    onMouseDown={(e) => {
                        setIsInteracting(true);
                        const startX = e.pageX - pan.x;
                        const startY = e.pageY - pan.y;

                        const handleMouseMove = (mm) => {
                            const newPan = { x: mm.pageX - startX, y: mm.pageY - startY };
                            setPan(constrainPan(newPan, zoom));
                        };

                        const handleMouseUp = () => {
                            window.removeEventListener('mousemove', handleMouseMove);
                            window.removeEventListener('mouseup', handleMouseUp);
                            setIsInteracting(false);
                        };

                        window.addEventListener('mousemove', handleMouseMove);
                        window.addEventListener('mouseup', handleMouseUp);
                    }}
                    onTouchStart={(e) => {
                        setIsInteracting(true);
                        if (e.touches.length === 1) {
                            touchStateRef.current = {
                                type: 'pan',
                                startPan: { ...panZoomRef.current.pan },
                                startX: e.touches[0].clientX,
                                startY: e.touches[0].clientY
                            };
                        } else if (e.touches.length === 2) {
                            const rect = mapWrapperRef.current.getBoundingClientRect();
                            const a = e.touches[0], b = e.touches[1];
                            const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
                            touchStateRef.current = {
                                type: 'pinch',
                                startZoom: panZoomRef.current.zoom,
                                startDist: dist,
                                startPan: { ...panZoomRef.current.pan },
                                centerX: (a.clientX + b.clientX) / 2 - rect.left,
                                centerY: (a.clientY + b.clientY) / 2 - rect.top
                            };
                        }
                    }}
                    onTouchCancel={() => {
                        touchStateRef.current = null;
                        setIsInteracting(false);
                    }}
                    onTouchMove={(e) => {
                        const state = touchStateRef.current;
                        if (!state) return;
                        e.preventDefault();
                        if (state.type === 'pan' && e.touches.length === 1) {
                            const dx = e.touches[0].clientX - state.startX;
                            const dy = e.touches[0].clientY - state.startY;
                            const newPan = { x: state.startPan.x + dx, y: state.startPan.y + dy };
                            setPan(constrainPan(newPan, panZoomRef.current.zoom));
                        } else if (state.type === 'pinch' && e.touches.length === 2) {
                            const a = e.touches[0], b = e.touches[1];
                            const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
                            if (state.startDist <= 0) return;
                            const ratio = dist / state.startDist;
                            const minZoom = getMinZoom();
                            const newZoom = Math.max(minZoom, Math.min(2.0, state.startZoom * ratio));

                            if (newZoom !== zoom) {
                                const scaleChange = newZoom / state.startZoom;
                                const newPanX = state.centerX - (state.centerX - state.startPan.x) * scaleChange;
                                const newPanY = state.centerY - (state.centerY - state.startPan.y) * scaleChange;

                                setZoom(newZoom);
                                setPan(constrainPan({ x: newPanX, y: newPanY }, newZoom));
                            }
                        }
                    }}
                    onTouchEnd={(e) => {
                        if (e.touches.length === 0) {
                            touchStateRef.current = null;
                            setIsInteracting(false);
                        } else if (e.touches.length === 1) {
                            touchStateRef.current = {
                                type: 'pan',
                                startPan: { ...panZoomRef.current.pan },
                                startX: e.touches[0].clientX,
                                startY: e.touches[0].clientY
                            };
                        } else if (e.touches.length === 2) {
                            const rect = mapWrapperRef.current.getBoundingClientRect();
                            const a = e.touches[0], b = e.touches[1];
                            const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
                            touchStateRef.current = {
                                type: 'pinch',
                                startZoom: panZoomRef.current.zoom,
                                startDist: dist,
                                startPan: { ...panZoomRef.current.pan },
                                centerX: (a.clientX + b.clientX) / 2 - rect.left,
                                centerY: (a.clientY + b.clientY) / 2 - rect.top
                            };
                        }
                    }}
                    onWheel={(e) => {
                        e.preventDefault();
                        const rect = mapWrapperRef.current.getBoundingClientRect();
                        const mouseX = e.clientX - rect.left;
                        const mouseY = e.clientY - rect.top;

                        const delta = e.deltaY > 0 ? -0.1 : 0.1;
                        const minZoom = getMinZoom();
                        const newZoom = Math.max(minZoom, Math.min(2.0, zoom + delta));

                        if (newZoom !== zoom) {
                            const scaleChange = newZoom / zoom;
                            const newPanX = mouseX - (mouseX - pan.x) * scaleChange;
                            const newPanY = mouseY - (mouseY - pan.y) * scaleChange;

                            setZoom(newZoom);
                            setPan(constrainPan({ x: newPanX, y: newPanY }, newZoom));
                        }
                    }}
                >
                    <div
                        className="relative"
                        style={{
                            width: '1368px',
                            height: '1340px',
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transformOrigin: '0 0',
                            transition: isInteracting ? 'none' : 'transform 0.15s ease-out',
                            willChange: isInteracting ? 'transform' : 'auto'
                        }}
                    >
                        <div
                            ref={svgContainerRef}
                            className="w-full h-full transit-map-svg"
                        >
                            <TransitMapSVG isDarkMode={isDarkMode} />
                        </div>

                        {/* Selected Station Markers: 3D Location Pin Design (reduced size) */}
                        {markers.map(m => (
                            <div
                                key={m.id}
                                className="absolute pointer-events-none z-50 transition-all duration-300 ease-out"
                                style={{
                                    left: `${m.x}px`,
                                    top: `${m.y}px`,
                                    transform: 'translate(-50%, -100%)' // Align bottom of pin to station center
                                }}
                            >
                                <div className="relative group">
                                    {/* Ground shadow - static */}
                                    <div className="absolute top-[85%] left-1/2 -translate-x-1/2 w-2 h-0.5 bg-black/20 rounded-full blur-[1px]"></div>

                                    {/* Pin shape container - static */}
                                    <div className="relative">
                                        <svg
                                            width="16"
                                            height="20"
                                            viewBox="0 0 32 40"
                                            fill="none"
                                            className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
                                        >
                                            <path
                                                d="M16 0C7.16344 0 0 7.16344 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.16344 24.8366 0 16 0Z"
                                                fill="#EF4444"
                                                className="fill-red-600"
                                            />
                                            <circle cx="16" cy="16" r="6" fill="white" fillOpacity="0.9" />
                                            {/* 3D highlight effect */}
                                            <path
                                                d="M16 2C8.26801 2 2 8.26801 2 16C2 17.5 2.5 19.5 3.5 21.5L4 22.5"
                                                stroke="white"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeOpacity="0.3"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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
