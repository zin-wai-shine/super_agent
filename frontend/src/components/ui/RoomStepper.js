import React from 'react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

/**
 * A single row: label on the left, stepper (minus / value / plus) on the right.
 * @param {string} label - e.g. "Bedrooms", "Beds", "Bathrooms"
 * @param {string} value - current value (e.g. '' for Any, '1', '2', ...)
 * @param {Array<{value: string, label: string}>} options - e.g. [{ value: '', label: 'Any' }, { value: '1', label: '1+' }, ...]
 * @param {function(string)} onChange - called with new value when minus/plus is clicked
 */
const RoomStepper = ({ label, value, options = [], onChange }) => {
    const index = options.findIndex((o) => o.value === value);
    const currentOption = index >= 0 ? options[index] : options[0];
    const displayLabel = currentOption ? currentOption.label : 'Any';
    const minIndex = 0;
    const maxIndex = options.length - 1;
    const atMin = index <= minIndex;
    const atMax = index >= maxIndex;

    const handleMinus = () => {
        if (atMin) return;
        const next = options[index - 1];
        if (next) onChange(next.value);
    };
    const handlePlus = () => {
        if (atMax) return;
        const next = options[index + 1];
        if (next) onChange(next.value);
    };

    return (
        <div className="flex items-center justify-between gap-3 w-full">
            <span className="text-[13px] font-normal text-gray-700 dark:text-gray-300 flex-shrink-0">
                {label}
            </span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                    type="button"
                    onClick={handleMinus}
                    disabled={atMin}
                    aria-label={`Decrease ${label}`}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                        atMin
                            ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-400'
                    }`}
                >
                    <MinusIcon className="w-4 h-4 stroke-[2.5]" />
                </button>
                <span className="min-w-[3rem] text-center text-[13px] font-normal text-gray-900 dark:text-gray-100">
                    {displayLabel}
                </span>
                <button
                    type="button"
                    onClick={handlePlus}
                    disabled={atMax}
                    aria-label={`Increase ${label}`}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                        atMax
                            ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-400'
                    }`}
                >
                    <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                </button>
            </div>
        </div>
    );
};

export default RoomStepper;
