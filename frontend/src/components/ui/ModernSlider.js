import React from 'react';

const ModernSlider = ({
    label,
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    valueLabel
}) => {
    // Calculate percentage for background gradient
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
                <span className="text-[12px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-admin">
                    {valueLabel || value}
                </span>
            </div>
            <div className="relative w-full h-6 flex items-center">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="absolute w-full h-1.5 opacity-0 cursor-pointer z-10"
                />
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full transition-all duration-75"
                        style={{
                            width: `${percentage}%`,
                            backgroundColor: 'var(--primary-color, #2663EB)'
                        }}
                    />
                </div>
                <div
                    className="absolute h-4 w-4 rounded-full shadow-md border-2 border-white dark:border-gray-800 pointer-events-none transition-all duration-75"
                    style={{
                        left: `calc(${percentage}% - 8px)`,
                        backgroundColor: 'var(--primary-color, #2663EB)'
                    }}
                />
            </div>
        </div>
    );
};

export default ModernSlider;
