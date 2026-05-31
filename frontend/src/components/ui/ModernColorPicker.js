import React, { useState, useEffect } from 'react';

const ModernColorPicker = ({ label, value, onChange }) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (newValue) => {
        setLocalValue(newValue);
        onChange(newValue);
    };

    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {label}
            </label>
            <div className="flex items-center gap-2 group bg-gray-50 dark:bg-dashboard-input p-1.5 rounded-admin border-admin focus-within:ring-1 focus-within:ring-primary-500/20 transition-all">
                <div className="relative w-8 h-8 flex-shrink-0">
                    <input
                        type="color"
                        value={localValue}
                        onChange={(e) => handleChange(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div
                        className="w-full h-full rounded-[8px] border border-gray-200 dark:border-gray-600 shadow-sm"
                        style={{ backgroundColor: localValue }}
                    />
                </div>
                <input
                    type="text"
                    value={localValue}
                    onChange={(e) => handleChange(e.target.value)}
                    className="flex-1 bg-transparent border-none p-0 text-sm text-gray-700 dark:text-gray-200 focus:ring-0 uppercase"
                    spellCheck={false}
                />
            </div>
        </div>
    );
};

export default ModernColorPicker;
