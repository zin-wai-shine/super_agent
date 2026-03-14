import React from 'react';

const ListingSkeleton = ({ viewMode = 'grid', index = 0, isExiting = false }) => {
    const isSavedGrid = viewMode === 'saved-grid';
    const isListView = viewMode === 'list';

    const delay = isExiting ? `${(index % 12) * 60}ms` : `${(index % 12) * 100}ms`;

    const skeletonStyle = {
        opacity: 1,
    };

    const isMapView = viewMode === 'map-list';

    const bar = 'bg-gray-100 dark:bg-white/5 animate-pulse';
    const barLight = 'bg-gray-50 dark:bg-white/10 animate-pulse';

    // Grid card / Map card: identical structure to ListingCard
    const renderGridSkeleton = () => (
        <div className="flex flex-col w-full bg-transparent" style={skeletonStyle}>
            {/* Image — matching ListingCard's specific adaptive aspect ratio */}
            <div className={`relative aspect-[4/3.8] md:aspect-[4/3.5] w-full overflow-hidden rounded-[23px] mb-0`}>
                <div className={`h-full w-full bg-gray-100 dark:bg-white/5 animate-fill-fast`} />
                
                {/* Status Badge */}
                <div className="absolute top-3.5 left-3.5">
                    <div className={`h-6 w-16 bg-gray-50 dark:bg-white/10 rounded-full animate-fill-med`} />
                </div>
                
                {/* Heart/Save Button */}
                <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 dark:bg-black/10 animate-fill-med" />

                {/* Agent Profile Overlay Placeholder */}
                <div className="absolute bottom-[10px] left-[10px] md:bottom-[15px] md:left-[15px]">
                    <div className={`w-[88px] md:w-[112px] aspect-[3/1] bg-gray-50 dark:bg-white/10 rounded-lg opacity-60 animate-fill-slow`} />
                </div>
            </div>

            {/* Content — py-3 px-1.5 gap-1 (EXACT MATCH to ListingCard) */}
            <div className="py-3 px-1.5 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                    <div className={`h-4.5 w-3/4 bg-gray-100 dark:bg-white/5 rounded animate-fill-med`} />
                </div>
                
                {/* Location Row (MapPin + District + Station) */}
                <div className="flex items-center gap-1.5 mb-0.5">
                    <div className={`h-3.5 w-3.5 bg-gray-50 dark:bg-white/10 rounded-full flex-shrink-0 animate-fill-slow`} />
                    <div className={`h-3.5 w-20 bg-gray-50 dark:bg-white/10 rounded animate-fill-slow`} />
                    <div className={`h-1 w-1 bg-gray-200 dark:bg-white/10 rounded-full mx-0.5`} />
                    <div className={`h-3.5 w-24 bg-gray-50 dark:bg-white/10 rounded animate-fill-slow`} />
                </div>
                
                {/* Details Row (Bed/Bath/Area) */}
                <div className={`h-3.5 w-1/2 bg-gray-50 dark:bg-white/10 rounded animate-fill-slow`} />
                
                {/* Price Row */}
                <div className="mt-2 flex items-baseline gap-1">
                    <div className={`h-[18px] w-24 bg-gray-100 dark:bg-white/5 rounded animate-fill-med`} />
                    <div className={`h-3 w-8 bg-gray-50 dark:bg-white/10 rounded animate-fill-slow`} />
                </div>
            </div>
        </div>
    );

    // Saved grid / Favorites: matching ListingCard's aspect-[5/4.2] md:aspect-[5/4.7]
    const renderSavedGridSkeleton = () => (
        <div className="flex flex-col w-full" style={skeletonStyle}>
            <div className={`aspect-[5/4.2] md:aspect-[5/4.7] w-full rounded-[23px] relative overflow-hidden mb-2`}>
                <div className="h-full w-full bg-gray-100 dark:bg-white/5 animate-fill-fast" />
                
                {/* Status Badge Placeholder */}
                <div className="absolute top-3 left-3">
                    <div className={`h-6 w-16 bg-gray-50 dark:bg-white/10 rounded-full animate-fill-med`} />
                </div>
                
                {/* Heart Button Placeholder */}
                <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 dark:bg-black/20 animate-fill-med" />
                
                {/* Agent Profile Overlay Placeholder */}
                <div className="absolute bottom-[10px] left-[10px] md:bottom-[15px] md:left-[15px]">
                    <div className={`w-[88px] md:w-[112px] aspect-[2.8/1] bg-gray-50 dark:bg-white/10 rounded-lg opacity-60 animate-fill-slow`} />
                </div>
            </div>
            {/* Text Area matched to saved cards */}
            <div className="px-1.5 py-2">
                <div className={`h-[15px] w-3/4 bg-gray-100 dark:bg-white/5 rounded-sm mb-1.5 animate-fill-med`} />
                <div className={`h-[13px] w-1/2 bg-gray-50 dark:bg-white/10 rounded-sm animate-fill-slow`} />
            </div>
        </div>
    );

    // List view: horizontal layout to match list card aspect-[4/3.5]
    const renderListSkeleton = () => (
        <div className="flex flex-col w-full" style={skeletonStyle}>
            <div className="p-4 flex gap-5">
                <div className={`aspect-[4/3.5] w-40 sm:w-48 rounded-[23px] flex-shrink-0 relative overflow-hidden ${bar}`}>
                    {/* Agent Profile Overlay Placeholder */}
                    <div className="absolute bottom-[10px] left-[10px] md:bottom-[12px] md:left-[12px]">
                        <div className={`w-[60px] md:w-[80px] aspect-[3/1] ${barLight} rounded-lg opacity-60`} />
                    </div>
                </div>
                <div className="flex-1 py-1 flex flex-col justify-between gap-1.5">
                    <div className={`h-5 w-4/5 ${bar} rounded mb-1`} />
                    <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 ${barLight} rounded flex-shrink-0`} />
                        <div className={`h-4 w-20 ${barLight} rounded`} />
                        <div className={`h-1 w-1 bg-gray-200 dark:bg-white/10 rounded-full mx-0.5`} />
                        <div className={`h-4 w-24 ${barLight} rounded`} />
                    </div>
                    <div className={`h-4 w-1/2 ${barLight} rounded mt-1`} />
                    <div className={`h-5 w-32 ${bar} rounded mt-auto`} />
                </div>
            </div>
        </div>
    );

    // Grouped category (mobile favorites): 2x2 collage style
    const renderGroupedSavedCategorySkeleton = () => (
        <div className="flex flex-col gap-2" style={skeletonStyle}>
            {/* Collage Container — Identical to GroupedSavedCard */}
            <div className="w-full aspect-square bg-white dark:bg-dashboard-card border border-gray-100 dark:border-white/10 shadow-sm rounded-[20px] overflow-hidden p-1.5">
                <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-[4px] rounded-[14px] overflow-hidden">
                    <div className="w-full h-full bg-gray-100 dark:bg-white/5 animate-fill-fast" />
                    <div className="w-full h-full bg-gray-50 dark:bg-white/10 animate-fill-med" />
                    <div className="w-full h-full bg-gray-50 dark:bg-white/10 animate-fill-med" />
                    <div className="w-full h-full bg-gray-100 dark:bg-white/5 animate-fill-slow" />
                </div>
            </div>
            {/* Text Area — Precisely matched height and placement */}
            <div className="px-1 relative">
                {/* Title Line Placeholder: Matches 17px font + leading-tight height */}
                <div className="h-[22px] w-2/3 bg-gray-100 dark:bg-white/5 rounded-[4px] animate-fill-med" />
                {/* Count Line Placeholder: Matches 14px font height */}
                <div className="mt-0.5 h-[18px] w-1/3 bg-gray-50 dark:bg-white/10 rounded-[4px] animate-fill-slow" />
            </div>
        </div>
    );

    // Detail Page Skeleton: full layout matching ListingDetailPage
    const renderDetailSkeleton = () => (
        <div className="w-full flex flex-col" style={skeletonStyle}>
            {/* Header / Nav Area */}
            <div className="hidden lg:flex items-center justify-between px-20 py-8 border-b border-gray-100 dark:border-white/10">
                <div className="h-10 w-10 bg-gray-100 dark:bg-white/5 rounded-full animate-fill-fast" />
                <div className="h-6 w-32 bg-gray-50 dark:bg-white/10 rounded animate-fill-med" />
                <div className="flex gap-4">
                    <div className="h-10 w-10 bg-gray-100 dark:bg-white/5 rounded-full animate-fill-med" />
                    <div className="h-10 w-10 bg-gray-100 dark:bg-white/5 rounded-full animate-fill-med" />
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 lg:px-20 py-8">
                {/* Back Link & Title Area */}
                <div className="flex flex-col gap-4 mb-8">
                    <div className="h-6 w-24 bg-gray-50 dark:bg-white/10 rounded animate-fill-fast" />
                    <div className="h-10 w-3/4 bg-gray-100 dark:bg-white/5 rounded animate-fill-med" />
                    <div className="h-6 w-1/3 bg-gray-50 dark:bg-white/10 rounded animate-fill-med" />
                </div>

                {/* Big Image Section: matches lg collage or mobile carousel */}
                <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-3 aspect-[16/9] lg:h-[60vh] w-full rounded-[20px] overflow-hidden mb-12">
                    <div className="lg:col-span-2 lg:row-span-2 bg-gray-100 dark:bg-white/5 animate-fill-fast" />
                    <div className="hidden lg:block bg-gray-50 dark:bg-white/10 animate-fill-med" />
                    <div className="hidden lg:block bg-gray-50 dark:bg-white/10 animate-fill-med" />
                    <div className="hidden lg:block bg-gray-50 dark:bg-white/10 animate-fill-slow" />
                    <div className="hidden lg:block bg-gray-50 dark:bg-white/10 animate-fill-slow" />
                </div>

                {/* Info & Booking Sidebar Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-8">
                        <div className="h-40 w-full bg-gray-50 dark:bg-white/5 rounded-2xl animate-fill-slow" />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={`icon-${i}`} className="h-20 bg-gray-50/50 dark:bg-white/5 rounded-xl animate-fill-slow" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (viewMode === 'detail') return renderDetailSkeleton();
    if (viewMode === 'grouped-saved-category') return renderGroupedSavedCategorySkeleton();
    if (isSavedGrid) return renderSavedGridSkeleton();
    if (isListView) return renderListSkeleton();
    return renderGridSkeleton();
};

export default ListingSkeleton;
