import React from 'react';

const ListingSkeleton = ({ viewMode = 'grid', index = 0, isExiting = false }) => {
    const isListView = viewMode === 'list';
    const isMapListView = viewMode === 'map-list';

    const delay = isExiting ? `${(index % 12) * 60}ms` : `${(index % 12) * 100}ms`;

    const skeletonStyle = {
        animation: isExiting ? 'fadeOutDown 0.6s ease-in forwards' : 'fadeInUp 0.6s ease-out forwards',
        animationDelay: delay,
        opacity: isExiting ? 1 : 0,
    };

    const bar = 'bg-gray-100 animate-pulse';
    const barLight = 'bg-gray-50 animate-pulse';

    return (
        <div className="flex flex-col w-full" style={skeletonStyle}>
            {/* Image Skeleton */}
            <div className={`${viewMode === 'saved-grid' ? 'aspect-[5/4]' : 'aspect-square'} w-full ${bar} rounded-[23px] relative overflow-hidden mb-3`}>
                {/* Top badges skeleton */}
                <div className="absolute top-3 left-3 flex gap-2">
                    <div className={`h-6 w-16 ${barLight} rounded-full`} />
                </div>
                {/* Heart icon skeleton */}
                <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20" />
                {/* Carousel dots skeleton */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${barLight}`} />
                    ))}
                </div>
            </div>

            {/* Info Section */}
            <div className="flex flex-col gap-2 px-1.5">
                <div className="flex justify-between items-start">
                    <div className={`h-5 w-3/4 ${bar} rounded`} />
                </div>

                <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 ${barLight} rounded`} />
                    <div className={`h-4 w-1/3 ${barLight} rounded`} />
                </div>

                <div className={`h-4 w-1/2 ${barLight} rounded`} />

                <div className={`h-3 w-1/4 ${barLight} rounded mt-1`} />

                <div className="mt-2 flex items-baseline gap-1">
                    <div className={`h-6 w-24 ${bar} rounded`} />
                </div>
            </div>
        </div>
    );
};

export default ListingSkeleton;
