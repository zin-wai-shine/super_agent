import React from 'react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

/**
 * A single row for "Rooms and beds" style filter: label on the left, stepper (minus | value | plus) on the right.
 * @param {string} label - Row label (e.g. "Bedrooms", "Beds", "Bathrooms")
 * @param {Array<{value: string, label: string}>} options - Options in order (e.g. Any, 1+, 2+, ...)
 * @param {string} value - Current selected value (e.g. '' or '2')
 * @param {function(string)} onChange - Called with new value when user steps
 */
const RoomStepperRow = ({ label, options = [], value, onChange }) => {
    const currentIndex = options.findIndex(o => o.value === value);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const displayLabel = (options[safeIndex] && options[safeIndex].label) || 'Any';
    const canDecrement = safeIndex > 0;
    const canIncrement = safeIndex < options.length - 1 && safeIndex >= 0;

    const handleMinus = () => {
        if (!canDecrement) return;
        const prev = options[safeIndex - 1];
        if (prev) onChange(prev.value);
    };

    const handlePlus = () => {
        if (!canIncrement) return;
        const next = options[safeIndex + 1];
        if (next) onChange(next.value);
    };

    const buttonClass = (enabled) =>
        `flex items-center justify-center w-8 h-8 rounded-full border transition-all flex-shrink-0 ${
            enabled
                ? 'border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50'
                : 'border-gray-200 text-gray-300 cursor-default'
        }`;

    return (
        <div className="flex items-center justify-between gap-3 w-full">
            <span className="text-base font-normal text-gray-900">{label}</span>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={handleMinus}
                    disabled={!canDecrement}
                    aria-label={`Decrease ${label}`}
                    className={buttonClass(canDecrement)}
                >
                    <MinusIcon className="w-4 h-4" strokeWidth={2} />
                </button>
                <span className="min-w-[3rem] text-center text-base font-normal text-gray-900 py-1">
                    {displayLabel}
                </span>
                <button
                    type="button"
                    onClick={handlePlus}
                    disabled={!canIncrement}
                    aria-label={`Increase ${label}`}
                    className={buttonClass(canIncrement)}
                >
                    <PlusIcon className="w-4 h-4" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
};

export default RoomStepperRow;
