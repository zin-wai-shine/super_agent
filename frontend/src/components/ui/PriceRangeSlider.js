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

    return (
        <div className="w-full flex flex-col gap-6 select-none relative pt-4 px-4">
            {/* Visual Slider Container */}
            <div className="relative w-full h-8 flex items-center">
                {/* Invisible native range inputs for interaction */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={minVal}
                    onChange={handleMinChange}
                    className="absolute z-30 opacity-0 w-full h-full cursor-pointer pointer-events-none appearance-none"
                    style={{ pointerEvents: minVal > max - 100 ? 'none' : 'auto' }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={maxVal}
                    onChange={handleMaxChange}
                    className="absolute z-40 opacity-0 w-full h-full cursor-pointer pointer-events-none appearance-none"
                    style={{ pointerEvents: 'auto' }}
                />

                {/* Custom Visual Track */}
                <div className="absolute w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full z-10" />

                {/* Active Range Highlight */}
                <div
                    ref={range}
                    className="absolute h-1.5 bg-primary-500 rounded-full z-20 pointer-events-none"
                />

                {/* Left Thumb Visual */}
                <div
                    className="absolute w-[16px] h-[16px] bg-white rounded-full border-[3px] border-primary-500 shadow-md z-30 pointer-events-none -ml-[8px]"
                    style={{ left: `${getPercent(minVal)}%` }}
                />

                {/* Right Thumb Visual */}
                <div
                    className="absolute w-[16px] h-[16px] bg-white rounded-full border-[3px] border-primary-500 shadow-md z-40 pointer-events-none -ml-[8px]"
                    style={{ left: `${getPercent(maxVal)}%` }}
                />
            </div>

            {/* Value Inputs */}
            <div className="flex items-center justify-between gap-3 relative z-50">
                <div className="flex flex-col flex-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1.5">
                        Min
                    </span>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">฿</span>
                        <input
                            type="text"
                            value={minInput}
                            onChange={(e) => setMinInput(e.target.value.replace(/[^0-9]/g, ''))}
                            onBlur={handleMinInputBlur}
                            onKeyDown={(e) => handleKeyDown(e, 'min')}
                            className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-[28px] pl-7 pr-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-shadow"
                        />
                    </div>
                </div>

                <div className="flex items-center pt-5 text-gray-400 font-light">
                    -
                </div>

                <div className="flex flex-col flex-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1.5">
                        Max
                    </span>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">฿</span>
                        <input
                            type="text"
                            value={maxInput}
                            onChange={(e) => setMaxInput(e.target.value.replace(/[^0-9]/g, ''))}
                            onBlur={handleMaxInputBlur}
                            onKeyDown={(e) => handleKeyDown(e, 'max')}
                            className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-[28px] pl-7 pr-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-shadow"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriceRangeSlider;
