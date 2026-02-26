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

    const bar = 'bg-gray-200';
    const barLight = 'bg-gray-100';

    // Same card design for all: image on top, content below, no footer (matches ListingCard)
    const cardRadius = isMapListView || isListView ? 'rounded-[24px]' : '';
    const cardRadiusStyle = viewMode === 'grid' ? { borderRadius: 'var(--card-radius)' } : {};

    return (
        <div
            className={`animate-pulse bg-white overflow-hidden shadow-sm border border-gray-100 ${cardRadius}`}
            style={{ ...cardRadiusStyle, ...skeletonStyle }}
        >
            {/* Image on top — same as card */}
            <div className="aspect-[16/10] bg-gray-100 w-full relative">
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <div className={`h-5 w-14 ${bar} rounded-full`} />
                    <div className={`h-5 w-16 ${bar} rounded-full`} />
                </div>
                <div className="absolute bottom-3 right-3 h-5 w-16 bg-gray-200 rounded-full" />
                <div className="absolute top-3 right-3 h-10 w-10 rounded-full bg-gray-200/80" />
            </div>
            {/* Content below — price, title, location, stats; no footer */}
            <div className={`flex flex-col gap-2 ${viewMode === 'grid' ? 'p-5 gap-3' : 'p-4'}`}>
                <div className="flex justify-between items-center">
                    <div className={`h-6 w-32 ${bar} rounded`} />
                    <div className={`h-3 w-12 ${barLight} rounded`} />
                </div>
                <div className={`h-4 w-full max-w-[90%] ${barLight} rounded`} />
                <div className="flex items-center gap-3 flex-wrap">
                    <div className={`h-3.5 w-20 ${barLight} rounded`} />
                    <div className={`h-3 w-16 ${barLight} rounded`} />
                </div>
                <div className="flex items-center gap-6">
                    <div className={`h-3.5 w-8 ${barLight} rounded`} />
                    <div className={`h-3.5 w-8 ${barLight} rounded`} />
                    <div className={`h-3.5 w-10 ${barLight} rounded`} />
                </div>
            </div>
        </div>
    );
};

export default ListingSkeleton;
