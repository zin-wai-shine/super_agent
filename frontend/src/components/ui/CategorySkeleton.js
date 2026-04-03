import React from 'react';

const CategorySkeleton = ({ index = 0 }) => {
    // Consistent staggered behavior
    const delay = `${(index % 8) * 60}ms`;

    return (
        <div 
            className="flex-shrink-0 animate-fade-in opacity-0"
            style={{ animationDelay: delay, animationFillMode: 'forwards' }}
        >
            <div className="h-14 min-w-[160px] md:min-w-[180px] p-2 pr-6 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex flex-row items-center gap-3 animate-shimmer">
                {/* Icon Circle */}
                <div className="w-10 h-10 rounded-full bg-gray-200/50 dark:bg-white/10 flex-shrink-0 animate-pulse" />
                
                {/* Text Line */}
                <div className="h-4 w-20 md:w-24 bg-gray-200/50 dark:bg-white/10 rounded-full animate-pulse" />
            </div>
        </div>
    );
};

export default CategorySkeleton;
