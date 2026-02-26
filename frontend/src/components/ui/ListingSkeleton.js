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

    const bar = 'bg-gray-200 animate-pulse';
    const barLight = 'bg-gray-100 animate-pulse';

    // Match ListingCard structure: image aspect-[16/10], then content (price+id, title, location+transit, stats)
    const cardClass = 'bg-white overflow-hidden shadow-sm border border-gray-100 animate-pulse';
    const radiusClass = isMapListView || isListView ? 'rounded-[24px]' : 'rounded-[24px]';

    return (
        <div className={`${cardClass} ${radiusClass} border-gray-100/50`} style={skeletonStyle}>
            {/* Image — same as ListingCard */}
            <div className="aspect-[16/10] bg-gray-100 w-full relative">
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <div className={`h-5 w-14 ${bar} rounded-full`} />
                    <div className={`h-5 w-16 ${bar} rounded-full`} />
                </div>
                <div className="absolute bottom-3 right-3 h-5 w-16 bg-gray-200 rounded-full" />
                <div className="absolute top-2 right-2 h-9 w-9 rounded-full bg-gray-200/80" />
            </div>
            {/* Content — same structure as ListingCard grid: p-5, gap-3, price+id, title, location row, stats row */}
            <div className={`flex flex-col ${viewMode === 'grid' ? 'p-5 gap-3' : 'p-4 gap-2'}`}>
                {/* Price and ID row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                        <div className={`h-7 w-24 ${bar} rounded`} />
                        <div className={`h-3 w-10 ${barLight} rounded`} />
                    </div>
                    <div className={`h-3 w-10 ${barLight} rounded`} />
                </div>
                {/* Title — same height as card (h-[2.6em] / line-clamp-2) */}
                <div className={`h-4 w-full max-w-[95%] ${barLight} rounded`} />
                <div className={`h-4 w-3/4 ${barLight} rounded`} />
                {/* Location row: icon + district, divider, icon + station (500m) */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className={`h-4 w-4 rounded ${barLight}`} />
                    <div className={`h-3.5 w-16 ${barLight} rounded`} />
                    <div className="w-px h-3 bg-gray-200" />
                    <div className={`h-4 w-4 rounded ${barLight}`} />
                    <div className={`h-3.5 w-14 ${barLight} rounded`} />
                    <div className={`h-3.5 w-10 ${barLight} rounded`} />
                </div>
                {/* Stats row: bed, bath, sqm — gap-8 like card */}
                <div className="flex items-center gap-8 pt-0.5">
                    <div className={`h-3.5 w-12 ${barLight} rounded`} />
                    <div className={`h-3.5 w-12 ${barLight} rounded`} />
                    <div className={`h-3.5 w-14 ${barLight} rounded`} />
                </div>
            </div>
        </div>
    );
};

export default ListingSkeleton;
