import React from 'react';
import clsx from 'clsx';

const FilterPill = ({ label, isActive, onClick, icon }) => {
    return (
        <button
            onClick={onClick}
            type="button"
            className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-normal transition-all duration-200 select-none",
                isActive
                    ? "bg-white dark:bg-gray-800 border border-gray-800 dark:border-gray-300 text-gray-900 dark:text-gray-100"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
            )}
        >
            {icon && <span className="flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:text-current">{icon}</span>}
            <span>{label}</span>
        </button>
    );
};

export default FilterPill;
