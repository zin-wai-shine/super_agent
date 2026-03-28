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
            className="w-full flex flex-col gap-2 select-none relative pt-1 px-4"
        >

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
