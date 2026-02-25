import React from 'react';
import clsx from 'clsx';

const FilterPill = ({ label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            type="button"
            className={clsx(
                "px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 select-none",
                isActive
                    ? "bg-primary-500 text-white shadow-sm ring-1 ring-primary-500"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-400 dark:hover:border-primary-500/50 hover:text-primary-600 dark:hover:text-primary-400"
            )}
        >
            {label}
        </button>
    );
};

export default FilterPill;
