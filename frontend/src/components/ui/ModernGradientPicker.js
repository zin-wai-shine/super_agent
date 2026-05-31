import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';


const ModernGradientPicker = ({ value, onChange, label }) => {
    // Parse initial value or default
    const [stops, setStops] = useState([
        { id: 1, color: '#2663EB', position: 0 },
        { id: 2, color: '#34a853', position: 100 }
    ]);
    const [angle, setAngle] = useState(135);
    const [activeStopId, setActiveStopId] = useState(1);
    const trackRef = useRef(null);

    // Helper to parse gradient string
    const parseGradient = (gradientString) => {
        if (!gradientString || !gradientString.includes('linear-gradient')) return null;
        try {
            // Remove "linear-gradient(" and trailing ")"
            const content = gradientString.substring(
                gradientString.indexOf('(') + 1,
                gradientString.lastIndexOf(')')
            );

            // Split by comma BUT ignore commas inside parentheses (for rgba/hsla)
            const parts = content.split(/,(?![^(]*\))/).map(p => p.trim());

            // Parse Angle
            let parsedAngle = 135;
            let stopsStartIndex = 0;

            // Check if first part is an angle/direction
            // It is an angle if it contains 'deg' or starts with 'to '
            // OR if it DOES NOT look like a color stop (starts with #, rgb, hsl, or known color name)
            // Ideally we check if it starts with a number or 'to'
            const firstPartLower = parts[0].toLowerCase();
            if (firstPartLower.includes('deg') || firstPartLower.startsWith('to ') || /^\d+$/.test(parts[0])) {
                if (firstPartLower.includes('deg')) {
                    parsedAngle = parseInt(parts[0].replace('deg', ''));
                } else if (firstPartLower.startsWith('to ')) {
                    if (firstPartLower === 'to right') parsedAngle = 90;
                    else if (firstPartLower === 'to bottom') parsedAngle = 180;
                    else if (firstPartLower === 'to left') parsedAngle = 270;
                    else if (firstPartLower === 'to top') parsedAngle = 0;
                } else if (/^\d+$/.test(parts[0])) {
                    // Just a number, assume degrees
                    parsedAngle = parseInt(parts[0]);
                }
                stopsStartIndex = 1;
            }

            // Parse Stops
            const parsedStops = parts.slice(stopsStartIndex).map((part, index) => {
                // improved match: look for color value then optional percentage
                // Color can be hex, rgba, hsla, named
                const match = part.match(/((?:#[\da-f]{3,8})|(?:rgba?\(.*?\))|(?:hsla?\(.*?\))|[a-z]+)(?:\s+(\d+)%)?/i);

                let color = '#000000';
                let position = index === 0 ? 0 : 100;

                if (match) {
                    color = match[1];
                    if (match[2]) {
                        position = parseInt(match[2]);
                    } else {
                        // infer position if missing? For now simplistic
                        // If we have 2 stops and no pos, 0 and 100.
                        // If we have 3, 0, 50, 100.
                        // This simplistic parser assumes explicit % usually.
                        const totalStops = parts.length - stopsStartIndex;
                        if (totalStops > 1) {
                            position = Math.round((index / (totalStops - 1)) * 100);
                        }
                    }
                } else {
                    // Fallback using whole part as color
                    color = part;
                }

                return {
                    id: `stop-${index}-${Date.now()}`, // Temporary ID, will fail stability check but useful for fresh parses
                    color: color,
                    position: position
                };
            });

            return { angle: parsedAngle, stops: parsedStops };
        } catch (e) {
            console.error("Failed to parse gradient:", e);
            return null;
        }
    };

    // Sync local state when external value changes
    useEffect(() => {
        if (value) {
            // Reconstruct current state string for comparison
            // Normalize: remove spacing, lowercase
            const normalize = (s) => s ? s.toLowerCase().replace(/\s+/g, '').replace(/;$/, '') : '';

            const sortedStops = [...stops].sort((a, b) => a.position - b.position);
            const stopsString = sortedStops.map(s => `${s.color}${s.position}%`).join(','); // No spaces for norm
            const currentString = `linear-gradient(${angle}deg,${stopsString})`;

            // If the normalized value matches our current normalized state, DO NOT update.
            // This prevents infinite loops and cursor jumping.
            if (normalize(value) === normalize(currentString)) return;

            const parsed = parseGradient(value);
            if (parsed) {
                setAngle(parsed.angle);

                // CRITICAL: Preserve IDs if possible to prevent UI jumping
                let newStops = parsed.stops;
                if (newStops.length === stops.length) {
                    // If stop count is same, assume they map 1:1 by visual order
                    // We need to sort both sets to map them accurately by position
                    const existingSorted = [...stops].sort((a, b) => a.position - b.position);
                    const parsedSorted = [...newStops].sort((a, b) => a.position - b.position);

                    newStops = parsedSorted.map((ps, i) => ({
                        ...ps,
                        id: existingSorted[i].id // Reuse ID
                    }));
                }

                setStops(newStops);

                // Ensure activeStopId is valid
                if (newStops.length > 0) {
                    const stillExists = newStops.find(s => s.id === activeStopId);
                    if (!stillExists) {
                        // Only reset if we truly lost the ID
                        setActiveStopId(newStops[0].id);
                    }
                }
            }
        }
    }, [value]);

    // Reconstruct gradient string whenever local state changes
    useEffect(() => {
        const sortedStops = [...stops].sort((a, b) => a.position - b.position);
        const stopsString = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');
        const gradientString = `linear-gradient(${angle}deg, ${stopsString})`;

        // Prevent infinite loop: only call onChange if generated string is different from prop value
        if (value !== gradientString) {
            // Debounce could be here, but React state updates usually batch enough
            onChange(gradientString);
        }
    }, [stops, angle]);

    // Dragging Logic
    const [isDragging, setIsDragging] = useState(false);
    const dragStopIdRef = useRef(null);

    const handleMouseDown = (e, id) => {
        e.stopPropagation();
        e.preventDefault();
        setActiveStopId(id);
        dragStopIdRef.current = id;
        setIsDragging(true);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging || !dragStopIdRef.current || !trackRef.current) return;

            const rect = trackRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            let percent = (x / rect.width) * 100;
            percent = Math.max(0, Math.min(100, Math.round(percent)));

            setStops(prevStops => prevStops.map(s =>
                s.id === dragStopIdRef.current ? { ...s, position: percent } : s
            ));
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                dragStopIdRef.current = null;
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleTrackClick = (e) => {
        if (!trackRef.current) return;
        // Don't add stop if we just finished dragging (though click might not fire if default prevented)
        const rect = trackRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));

        const newStop = {
            id: Date.now(),
            color: '#ffffff',
            position: percent
        };
        setStops([...stops, newStop]);
        setActiveStopId(newStop.id);
    };

    const updateStop = (id, updates) => {
        setStops(stops.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const deleteStop = (id) => {
        if (stops.length <= 2) return; // Min 2 stops
        setStops(stops.filter(s => s.id !== id));
        if (activeStopId === id) {
            setActiveStopId(stops[0].id);
        }
    };

    const activeStop = stops.find(s => s.id === activeStopId) || stops[0];

    // Internal flag to ignore upgrades triggering loops
    const ignoreNextValueChange = useRef(false);

    // Sync local state when external value changes
    useEffect(() => {
        if (value) {
            // Check if this update matches what we just sent out
            // Ideally we'd compare normalized strings, but this simple check helps
            const sortedStops = [...stops].sort((a, b) => a.position - b.position);
            const stopsString = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');
            const currentString = `linear-gradient(${angle}deg, ${stopsString})`;

            if (value === currentString) return;

            const parsed = parseGradient(value);
            if (parsed) {
                setAngle(parsed.angle);
                setStops(parsed.stops);
                if (parsed.stops.length > 0) {
                    // Only change active stop if the current one is gone
                    if (!parsed.stops.find(s => s.id === activeStopId)) {
                        setActiveStopId(parsed.stops[0].id);
                    }
                }
            }
        }
    }, [value]);

    return (
        <div className="space-y-3 bg-blue-50 dark:bg-gray-800 p-4 rounded-xl border border-blue-200 dark:border-gray-700 shadow-sm relative z-10 min-h-[200px] block">
            {label && (
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">
                            {angle}°
                        </span>
                        {/* Simple Angle Preset Buttons */}
                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded p-0.5">
                            {[90, 135, 180].map(a => (
                                <button
                                    key={a}
                                    onClick={() => setAngle(a)}
                                    className={`w-5 h-5 flex items-center justify-center rounded text-[10px] transition-colors ${angle === a ? 'bg-white shadow dark:bg-gray-600 text-primary-500' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {a === 90 ? '→' : a === 180 ? '↓' : '↘'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                {/* Visual Preview Area */}
                <div
                    className="h-16 w-full rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4"
                    style={{ background: `linear-gradient(${angle}deg, ${stops.map(s => `${s.color} ${s.position}%`).sort((a, b) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1])).join(', ')})` }}
                />

                {/* Stops Track */}
                <div className="relative h-6 mb-4 select-none group">
                    {/* Track Line */}
                    <div
                        ref={trackRef}
                        className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
                        onClick={handleTrackClick}
                    >
                        {/* Gradient hint inside track */}
                        <div className="absolute inset-0 rounded-full opacity-50"
                            style={{ background: `linear-gradient(to right, ${stops.map(s => `${s.color} ${s.position}%`).sort((a, b) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1])).join(', ')})` }}
                        />
                    </div>

                    {/* Stop Handles */}
                    {stops.map(stop => (
                        <div
                            key={stop.id}
                            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 shadow-sm cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10 ${activeStopId === stop.id
                                ? 'border-primary-500 scale-110 ring-2 ring-primary-500/30'
                                : 'border-white dark:border-gray-600'
                                }`}
                            style={{
                                left: `${stop.position}%`,
                                backgroundColor: stop.color,
                                marginLeft: '-8px' // Center the handle
                            }}
                            onMouseDown={(e) => handleMouseDown(e, stop.id)}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveStopId(stop.id);
                            }}
                        />
                    ))}
                </div>

                {/* Active Stop Properties */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-end gap-3">
                        <div className="flex-1">
                            <label className="text-[10px] text-gray-400 font-bold uppercase mb-1.5 block">Color</label>
                            <div className="flex items-center gap-2">
                                <div className="relative w-9 h-9 flex-shrink-0">
                                    <div
                                        className="w-full h-full rounded border border-gray-200 dark:border-gray-600 shadow-sm"
                                        style={{ backgroundColor: activeStop.color }}
                                    />
                                    <input
                                        type="color"
                                        value={activeStop.color}
                                        onChange={(e) => updateStop(activeStop.id, { color: e.target.value })}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={activeStop.color}
                                    onChange={(e) => updateStop(activeStop.id, { color: e.target.value })}
                                    className="w-24 h-9 px-2 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                                />
                            </div>
                        </div>
                        <div className="w-20">
                            <label className="text-[10px] text-gray-400 font-bold uppercase mb-1.5 block">Pos %</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={activeStop.position}
                                onChange={(e) => updateStop(activeStop.id, { position: parseInt(e.target.value) || 0 })}
                                className="w-full h-9 px-2 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-center"
                            />
                        </div>
                        <div>
                            <button
                                onClick={() => deleteStop(activeStop.id)}
                                disabled={stops.length <= 2}
                                className={`h-9 w-9 flex items-center justify-center rounded-lg transition-colors border border-transparent ${stops.length <= 2
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-100 dark:hover:border-red-900/30'
                                    }`}
                                title="Delete Stop"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {[
                    { name: 'Sunset', grad: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)' },
                    { name: 'Ocean', grad: 'linear-gradient(135deg, #2663EB 0%, #34a853 100%)' },
                    { name: 'Purple', grad: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
                    { name: 'Night', grad: 'linear-gradient(135deg, #09203f 0%, #537895 100%)' },
                    { name: 'Fire', grad: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
                ].map((preset, i) => (
                    <button
                        key={i}
                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex-shrink-0 hover:scale-110 transition-transform"
                        style={{ background: preset.grad }}
                        onClick={() => onChange(preset.grad)}
                        title={preset.name}
                    />
                ))}
            </div>
        </div>
    );
};
export default ModernGradientPicker;
