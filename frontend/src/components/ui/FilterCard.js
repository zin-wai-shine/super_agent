import React from 'react';

const FilterCard = ({ title, icon, onClear, children, titleTag: TitleTag = 'span', titleClassName = '' }) => {
    return (
        <div className="transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between transition-colors group">
                <div className="flex items-center gap-2">
                    {icon}
                    <TitleTag className={`text-[15px] md:text-[13px] font-semibold text-gray-900 dark:text-gray-100 ${titleClassName}`.trim()}>{title}</TitleTag>
                </div>
                <div className="flex items-center gap-2">
                    {onClear && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClear();
                            }}
                            className="text-[13px] font-normal text-primary-500 hover:text-primary-600 dark:text-primary-400 transition-colors mr-1"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Content Space — padding only on direct children */}
            <div className="[&>*]:pt-2">
                {children}
            </div>
        </div>
    );
};

export default FilterCard;
