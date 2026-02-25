import React from 'react';

const FilterCard = ({ title, icon, onClear, children }) => {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/50 rounded-[10px] shadow-sm overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 transition-colors group">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {onClear && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClear();
                            }}
                            className="text-[12px] font-medium text-primary-500 hover:text-primary-600 dark:text-primary-400 transition-colors mr-1"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Content Space */}
            <div className="p-4">
                {children}
            </div>
        </div>
    );
};

export default FilterCard;
