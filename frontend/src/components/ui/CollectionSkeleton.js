import React from 'react';

const CollectionSkeleton = ({ index = 0, isExiting = false }) => {
    // Staggered reveal delays based on index
    const delay = isExiting ? `${(index % 10) * 50}ms` : `${(index % 10) * 100}ms`;

    const skeletonStyle = {
        animationDelay: delay,
    };

    return (
        <div className="flex flex-col w-full animate-pulse">
            {/* Image Area */}
            <div className="relative aspect-[1/1] md:aspect-[4/3] rounded-[24px] overflow-hidden mb-3 bg-gray-100 dark:bg-white/5" />

            {/* Content Area */}
            <div className="px-1 space-y-2">
                <div className="h-3 w-1/3 bg-gray-50 dark:bg-white/5 rounded-full" />
                <div className="h-4 w-2/3 bg-gray-100 dark:bg-white/10 rounded-full" />
            </div>
        </div>
    );
};

export default CollectionSkeleton;
