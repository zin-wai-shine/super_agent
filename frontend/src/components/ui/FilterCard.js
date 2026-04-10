import React from 'react';

const FilterCard = ({ title, icon, onClear, children, titleTag: TitleTag = 'span', titleClassName = '' }) => {
    return (
        <div className="transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between transition-colors group mb-3">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div 
                            className="flex-shrink-0 w-[36px] h-[36px] flex items-center justify-center rounded-full" 
                            style={{ backgroundColor: '#222222' }}
                        >
                            {React.cloneElement(icon, { 
                                className: `${icon.props.className || ''} w-[18px] h-[18px] text-white`.trim(),
                                strokeWidth: 2.2
                            })}
                        </div>
                    )}
                    <TitleTag 
                        className={`text-[15px] md:text-[13px] font-bold tracking-wider ${titleClassName}`.trim()}
                        style={{ color: '#222222' }}
                    >
                        {title}
                    </TitleTag>
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
