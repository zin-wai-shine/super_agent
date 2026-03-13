import React from 'react';

const ListingSkeleton = ({ viewMode = 'grid', index = 0, isExiting = false }) => {
    const isSavedGrid = viewMode === 'saved-grid';
    const isListView = viewMode === 'list';

    const delay = isExiting ? `${(index % 12) * 60}ms` : `${(index % 12) * 100}ms`;

    const skeletonStyle = {
        animation: isExiting ? 'fadeOutDown 0.6s ease-in forwards' : 'fadeInUp 0.6s ease-out forwards',
        animationDelay: delay,
        opacity: isExiting ? 1 : 0,
    };

    const bar = 'bg-gray-100 dark:bg-white/5 animate-pulse';
    const barLight = 'bg-gray-50 dark:bg-white/10 animate-pulse';

    // Grid card: same structure as ListingCard (aspect-[4/3] image, then title, location, bed/bath, ID, price)
    const renderGridSkeleton = () => (
        <div className="flex flex-col w-full bg-white dark:bg-dashboard-dark rounded-none border-none" style={skeletonStyle}>
            {/* Image — same aspect and radius as ListingCard */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[23px] mb-0">
                <div className={`h-full w-full ${bar}`} />
                <div className="absolute top-3.5 left-3.5">
                    <div className={`h-6 w-16 ${barLight} rounded-full`} />
                </div>
                <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 dark:bg-black/20 animate-pulse" />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${barLight}`} />
                    ))}
                </div>
            </div>

            {/* Content — same padding and layout as ListingCard (py-3 px-1.5, gap-1) */}
            <div className="py-3 px-1.5 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                    <div className={`h-4 w-3/4 ${bar} rounded`} />
                </div>
                <div className="flex items-center gap-1.5 mb-0.5">
                    <div className={`h-3.5 w-3.5 ${barLight} rounded`} />
                    <div className={`h-3.5 w-1/2 ${barLight} rounded`} />
                </div>
                <div className={`h-3.5 w-2/5 ${barLight} rounded`} />
                <div className={`h-3.5 w-1/3 ${barLight} rounded mt-0.5`} />
                <div className="mt-2 flex items-baseline gap-1">
                    <div className={`h-4 w-20 ${bar} rounded`} />
                    <div className={`h-3 w-8 ${barLight} rounded`} />
                </div>
            </div>
        </div>
    );

    // Saved grid / Favorites: aspect-[5/4], simpler content (title + bed/bath)
    const renderSavedGridSkeleton = () => (
        <div className="flex flex-col w-full" style={skeletonStyle}>
            <div className={`aspect-[5/4] w-full ${bar} rounded-[23px] relative overflow-hidden mb-2`}>
                <div className="absolute top-3 left-3">
                    <div className={`h-6 w-16 ${barLight} rounded-full`} />
                </div>
                <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 dark:bg-black/20" />
            </div>
            <div className="px-1.5 py-2">
                <div className={`h-4 w-3/4 ${bar} rounded mb-1`} />
                <div className={`h-3.5 w-1/2 ${barLight} rounded`} />
            </div>
        </div>
    );

    // List view: horizontal layout to match list card
    const renderListSkeleton = () => (
        <div className="flex flex-col w-full" style={skeletonStyle}>
            <div className="p-4 flex gap-5">
                <div className={`aspect-[4/3] w-40 sm:w-48 rounded-[23px] flex-shrink-0 ${bar}`} />
                <div className="flex-1 py-1 flex flex-col justify-between gap-2">
                    <div className={`h-5 w-4/5 ${bar} rounded`} />
                    <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 ${barLight} rounded`} />
                        <div className={`h-4 w-1/3 ${barLight} rounded`} />
                    </div>
                    <div className={`h-4 w-1/2 ${barLight} rounded`} />
                    <div className={`h-5 w-24 ${bar} rounded mt-auto`} />
                </div>
            </div>
        </div>
    );

    // Grouped category (mobile favorites): 2x2 collage style
    const renderGroupedSavedCategorySkeleton = () => (
        <div className="flex flex-col gap-2" style={skeletonStyle}>
            {/* Collage Container */}
            <div className="w-full aspect-square bg-white dark:bg-dashboard-card border border-gray-50 dark:border-white/5 rounded-[20px] overflow-hidden p-1.5 shadow-sm">
                <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-[4px] rounded-[14px] overflow-hidden">
                    <div className={`w-full h-full ${bar}`} />
                    <div className={`w-full h-full ${barLight}`} />
                    <div className={`w-full h-full ${barLight}`} />
                    <div className={`w-full h-full ${bar}`} />
                </div>
            </div>
            {/* Label and Count */}
            <div className="px-1">
                <div className={`h-[17px] w-2/3 ${bar} rounded mb-1.5`} />
                <div className={`h-[14px] w-1/3 ${barLight} rounded`} />
            </div>
        </div>
    );

    if (viewMode === 'grouped-saved-category') return renderGroupedSavedCategorySkeleton();
    if (isSavedGrid) return renderSavedGridSkeleton();
    if (isListView) return renderListSkeleton();
    return renderGridSkeleton();
};

export default ListingSkeleton;
