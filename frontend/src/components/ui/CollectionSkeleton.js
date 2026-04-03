import React from 'react';

const CollectionSkeleton = ({ index = 0, isExiting = false }) => {
    // Staggered reveal delays based on index
    const delay = isExiting ? `${(index % 10) * 50}ms` : `${(index % 10) * 100}ms`;

    const skeletonStyle = {
        animationDelay: delay,
    };

    return (
        <div 
            className="flex flex-col w-full" 
        >
            {/* Image Area — matches Aspect Ratios of CollectionCard */}
            <div className="relative aspect-[1/1] md:aspect-[4/3] rounded-[23px] overflow-hidden mb-3 bg-gray-100 dark:bg-white/5 animate-shimmer">
                {/* Center Icon Placeholder: Only show while active loading */}
                {!isExiting && (
                    <div className="absolute inset-0 flex items-center justify-center animate-fill-med">
                        <div className="w-12 h-12 rounded-xl bg-gray-200/50 dark:bg-white/10" />
                    </div>
                )}
            </div>

            {/* Content Area — Keeps its physical height but becomes invisible when replaced */}
            <div className={`px-1 flex flex-col gap-1.5 transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100 animate-fillIn'}`}>
                <div className="h-[15px] w-1/3 bg-gray-50 dark:bg-white/10 rounded-[3px] animate-fill-med" />
                <div className="h-[20px] w-2/3 bg-gray-100 dark:bg-white/5 rounded-[4px] animate-fill-med" />
            </div>
        </div>
    );
};

export default CollectionSkeleton;
