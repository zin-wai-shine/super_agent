import React, { useState, useEffect, useCallback, useRef } from 'react';

const PriceRangeSlider = ({ min, max, initialMin, initialMax, step = 1000, onChange }) => {
    const safeInitialMin = initialMin ?? min ?? 0;
    const safeInitialMax = initialMax ?? max ?? 10000;

    const [minVal, setMinVal] = useState(safeInitialMin);
    const [maxVal, setMaxVal] = useState(safeInitialMax);
    const minValRef = useRef(safeInitialMin);
    const maxValRef = useRef(safeInitialMax);
    const range = useRef(null);

    // States for input text to allow typing
    const [minInput, setMinInput] = useState(safeInitialMin.toString());
    const [maxInput, setMaxInput] = useState(safeInitialMax.toString());

    // Sync state when initial values change
    useEffect(() => {
        const safeMin = initialMin ?? min ?? 0;
        setMinVal(safeMin);
        setMinInput(safeMin.toString());
        minValRef.current = safeMin;
    }, [initialMin, min]);

    useEffect(() => {
        const safeMax = initialMax ?? max ?? 10000;
        setMaxVal(safeMax);
        setMaxInput(safeMax.toString());
        maxValRef.current = safeMax;
    }, [initialMax, max]);

    // Convert to percentage
    const getPercent = useCallback(
        (value) => Math.round(((value - min) / (max - min)) * 100),
        [min, max]
    );

    // Set width of the range to decrease from the left side
    useEffect(() => {
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxValRef.current);

        if (range.current) {
            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, getPercent]);

    // Set width of the range to decrease from the right side
    useEffect(() => {
        const minPercent = getPercent(minValRef.current);
        const maxPercent = getPercent(maxVal);

        if (range.current) {
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [maxVal, getPercent]);

    const handleMinChange = (event) => {
        const value = Math.min(Number(event.target.value), maxVal);
        setMinVal(value);
        setMinInput(value.toString());
        minValRef.current = value;
        onChange({ min: value, max: maxVal });
    };

    const handleMaxChange = (event) => {
        const value = Math.max(Number(event.target.value), minVal);
        setMaxVal(value);
        setMaxInput(value.toString());
        maxValRef.current = value;
        onChange({ min: minVal, max: value });
    };

    const handleMinInputBlur = () => {
        let value = parseInt(minInput.replace(/[^0-9]/g, ''));
        if (isNaN(value)) value = min;
        value = Math.max(min, Math.min(value, maxVal)); // min cannot exceed max
        setMinVal(value);
        setMinInput(value.toString());
        minValRef.current = value;
        onChange({ min: value, max: maxVal });
    };

    const handleMaxInputBlur = () => {
        let value = parseInt(maxInput.replace(/[^0-9]/g, ''));
        if (isNaN(value)) value = max;
        value = Math.min(max, Math.max(value, minVal)); // max cannot be less than min
        setMaxVal(value);
        setMaxInput(value.toString());
        maxValRef.current = value;
        onChange({ min: minVal, max: value });
    };

    const handleKeyDown = (e, type) => {
        if (e.key === 'Enter') {
            if (type === 'min') handleMinInputBlur();
            else handleMaxInputBlur();
            e.target.blur();
        }
    };

    // Determine which slider should be on top based on proximity to the cursor/touch
    const [zIndexMin, setZIndexMin] = useState(30);
    const [zIndexMax, setZIndexMax] = useState(40);

    const handleInteraction = useCallback((clientX) => {
        if (!range.current) return;
        const rect = range.current.parentElement.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = ((x / rect.width) * (max - min)) + min;

        const distMin = Math.abs(percent - minVal);
        const distMax = Math.abs(percent - maxVal);

        if (distMin < distMax) {
            setZIndexMin(45);
            setZIndexMax(40);
        } else {
            setZIndexMin(30);
            setZIndexMax(45);
        }
    }, [minVal, maxVal, min, max]);

    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxVal);
    const rangeWidthPercent = maxPercent - minPercent;

    return (
        <div
            className="w-full flex flex-col gap-6 select-none relative pt-4 px-4"
            onMouseDown={(e) => handleInteraction(e.clientX)}
            onTouchStart={(e) => handleInteraction(e.touches[0].clientX)}
        >
            {/* Visual Slider Container — fixed height for consistent centering */}
            <div className="relative w-full h-12 flex items-center">
                {/* Invisible native range inputs for interaction */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={minVal}
                    onChange={handleMinChange}
                    className="absolute opacity-0 w-full h-full cursor-pointer appearance-none z-10"
                    style={{
                        zIndex: zIndexMin,
                        pointerEvents: 'auto'
                    }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={maxVal}
                    onChange={handleMaxChange}
                    className="absolute opacity-0 w-full h-full cursor-pointer appearance-none z-10"
                    style={{
                        zIndex: zIndexMax,
                        pointerEvents: 'auto'
                    }}
                />

                {/* Wave Visual — sitting on top of the track */}
                {rangeWidthPercent > 0 && (
                    <div
                        className="absolute z-0 pointer-events-none transition-all duration-300 ease-out"
                        style={{
                            left: `${minPercent}%`,
                            width: `${rangeWidthPercent}%`,
                            height: 42,
                            bottom: '50%',
                            marginBottom: '2px', // Slight gap from track
                            ['--wave-glass']: 'color-mix(in srgb, var(--primary-color) 15%, white)',
                        }}
                    >
                        <svg viewBox="0 0 100 28" className="w-full h-full block" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="price-wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="var(--wave-glass)" stopOpacity="0" />
                                    <stop offset="10%" stopColor="var(--wave-glass)" stopOpacity="0.8" />
                                    <stop offset="50%" stopColor="var(--wave-glass)" stopOpacity="0.95" />
                                    <stop offset="90%" stopColor="var(--wave-glass)" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="var(--wave-glass)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M 0 28 C 5 28 11 14 17 14 C 23 14 27 5 33 5 C 39 5 44 22 50 22 C 56 22 61 12 67 12 C 73 12 77 22 83 22 C 89 22 95 26 100 28 Z"
                                fill="url(#price-wave-gradient)"
                            />
                        </svg>
                    </div>
                )}

                {/* Custom Visual Track */}
                <div className="absolute w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full z-10 top-1/2 -translate-y-1/2" />

                {/* Active Range Highlight */}
                <div
                    ref={range}
                    className="absolute h-1.5 bg-primary-500 rounded-full z-20 pointer-events-none top-1/2 -translate-y-1/2"
                />

                {/* Left Thumb Visual */}
                <div
                    className="absolute w-[22px] h-[22px] bg-white rounded-full border-[5px] border-primary-500 shadow-xl z-30 pointer-events-none -ml-[11px] flex items-center justify-center"
                    style={{ left: `${minPercent}%` }}
                >
                    <div className="w-full h-full rounded-full ring-4 ring-transparent group-hover:ring-primary-500/10 transition-all" />
                </div>

                {/* Right Thumb Visual */}
                <div
                    className="absolute w-[22px] h-[22px] bg-white rounded-full border-[5px] border-primary-500 shadow-xl z-40 pointer-events-none -ml-[11px] flex items-center justify-center"
                    style={{ left: `${maxPercent}%` }}
                >
                    <div className="w-full h-full rounded-full ring-4 ring-transparent group-hover:ring-primary-500/10 transition-all" />
                </div>
            </div>

            {/* Value Inputs */}
            <div className="flex items-center justify-between gap-3 relative z-50">
                <div className="flex flex-col flex-1">
                    <span className="text-[13px] font-normal text-gray-600 dark:text-gray-400 leading-none mb-1.5 text-center">
                        Minimum
                    </span>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-normal text-[13px]">฿</span>
                        <input
                            type="text"
                            value={minInput}
                            onChange={(e) => setMinInput(e.target.value.replace(/[^0-9]/g, ''))}
                            onBlur={handleMinInputBlur}
                            onKeyDown={(e) => handleKeyDown(e, 'min')}
                            className="w-full min-h-[40px] bg-white dark:bg-dashboard-card border border-gray-200 dark:border-white/10 rounded-full pl-8 pr-4 py-2 text-[13px] font-normal text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-white/20 focus:border-gray-400 dark:focus:border-white/30 transition-shadow"
                        />
                    </div>
                </div>

                <div className="flex items-center text-gray-400 dark:text-gray-600 font-light self-end pb-3">
                    -
                </div>

                <div className="flex flex-col flex-1">
                    <span className="text-[13px] font-normal text-gray-600 dark:text-gray-400 leading-none mb-1.5 text-center">
                        Maximum
                    </span>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-normal text-[13px]">฿</span>
                        <input
                            type="text"
                            value={maxInput}
                            onChange={(e) => setMaxInput(e.target.value.replace(/[^0-9]/g, ''))}
                            onBlur={handleMaxInputBlur}
                            onKeyDown={(e) => handleKeyDown(e, 'max')}
                            className="w-full min-h-[40px] bg-white dark:bg-dashboard-card border border-gray-200 dark:border-white/10 rounded-full pl-8 pr-4 py-2 text-[13px] font-normal text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-white/20 focus:border-gray-400 dark:focus:border-white/30 transition-shadow"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriceRangeSlider;
