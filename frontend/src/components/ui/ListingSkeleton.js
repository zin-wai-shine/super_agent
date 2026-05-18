import React from 'react';

const GridSkeleton = () => {
    const skeletonStyle = { opacity: 1 };
    return (
        <div className="flex flex-col w-full bg-transparent" style={skeletonStyle}>
            <div className="relative aspect-[4/4] md:aspect-[4/3.7] w-full overflow-hidden rounded-[32px] md:rounded-[23px] mb-0">
                <div className="h-full w-full bg-gray-50 dark:bg-white/[0.02] animate-fill-fast" />
                <div className="absolute top-3.5 left-3.5">
                    <div className="h-6 w-16 bg-white/40 dark:bg-white/5 rounded-[100px] animate-fill-med" />
                </div>
                <div className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/10 dark:bg-white/[0.02] animate-fill-med" />
                <div className="absolute bottom-[10px] left-[10px] md:bottom-[15px] md:left-[15px]">
                    <div className="w-[88px] md:w-[112px] aspect-[3/1] bg-gray-50 dark:bg-white/10 rounded-[100px] opacity-60 animate-fill-slow" />
                </div>
            </div>
            <div className="py-3 px-1.5 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                    <div className="h-4.5 w-3/4 bg-gray-100 dark:bg-white/5 rounded-[100px] animate-fill-med" />
                </div>
                <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="h-3.5 w-3.5 bg-gray-50 dark:bg-white/10 rounded-full flex-shrink-0 animate-fill-slow" />
                    <div className="h-3.5 w-20 bg-gray-50 dark:bg-white/10 rounded-[100px] animate-fill-slow" />
                    <div className="h-1 w-1 bg-gray-200 dark:bg-white/10 rounded-full mx-0.5" />
                    <div className="h-3.5 w-24 bg-gray-50 dark:bg-white/10 rounded-[100px] animate-fill-slow" />
                </div>
                <div className="h-3.5 w-1/2 bg-gray-50 dark:bg-white/10 rounded-[100px] animate-fill-slow" />
                <div className="mt-2 flex items-baseline gap-1">
                    <div className="h-[18px] w-24 bg-gray-100 dark:bg-white/5 rounded-[100px] animate-fill-med" />
                    <div className="h-3 w-8 bg-gray-50 dark:bg-white/10 rounded-[100px] animate-fill-slow" />
                </div>
            </div>
        </div>
    );
};

const SavedGridSkeleton = () => {
    const skeletonStyle = { opacity: 1 };
    return (
        <div className="flex flex-col w-full" style={skeletonStyle}>
            <div className="aspect-[5/4.5] md:aspect-[5/5.0] w-full rounded-[23px] relative overflow-hidden mb-2">
                <div className="h-full w-full bg-gray-50 dark:bg-white/[0.02] animate-fill-fast" />
                <div className="absolute top-3 left-3">
                    <div className="h-6 w-16 bg-white/40 dark:bg-white/5 rounded-[100px] animate-fill-med" />
                </div>
                <div className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/10 dark:bg-white/[0.02] animate-fill-med" />
                <div className="absolute bottom-[10px] left-[10px] md:bottom-[15px] md:left-[15px]">
                    <div className="w-[88px] md:w-[112px] aspect-[2.8/1] bg-gray-50 dark:bg-white/10 rounded-[100px] opacity-60 animate-fill-slow" />
                </div>
            </div>
            <div className="px-1.5 py-2">
                <div className="h-[15px] w-3/4 bg-gray-100 dark:bg-white/5 rounded-[100px] mb-1.5 animate-fill-med" />
                <div className="h-[13px] w-1/2 bg-gray-50 dark:bg-white/10 rounded-[100px] animate-fill-slow" />
            </div>
        </div>
    );
};

const ListSkeleton = () => {
    const skeletonStyle = { opacity: 1 };
    const bar = 'bg-gray-100 dark:bg-white/5 animate-pulse rounded-full';
    const barLight = 'bg-gray-50 dark:bg-white/10 animate-pulse rounded-full';
    return (
        <div className="flex flex-col w-full" style={skeletonStyle}>
            <div className="p-4 flex gap-5">
                <div className={`aspect-[4/3.8] w-40 sm:w-48 rounded-[23px] flex-shrink-0 relative overflow-hidden bg-gray-100 dark:bg-white/5 animate-pulse`}>
                    <div className="absolute bottom-[10px] left-[10px] md:bottom-[12px] md:left-[12px]">
                        <div className={`w-[60px] md:w-[80px] aspect-[3/1] bg-gray-50 dark:bg-white/10 rounded-[100px] animate-pulse opacity-60`} />
                    </div>
                </div>
                <div className="flex-1 py-1 flex flex-col justify-between gap-1.5">
                    <div className={`h-5 w-4/5 ${bar} mb-1`} />
                    <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 ${barLight} flex-shrink-0`} />
                        <div className={`h-4 w-20 ${barLight}`} />
                        <div className="h-1 w-1 bg-gray-200 dark:bg-white/10 rounded-full mx-0.5" />
                        <div className={`h-4 w-24 ${barLight}`} />
                    </div>
                    <div className={`h-4 w-1/2 ${barLight} mt-1`} />
                    <div className={`h-5 w-32 ${bar} mt-auto`} />
                </div>
            </div>
        </div>
    );
};

const GroupedSavedCategorySkeleton = () => {
    const skeletonStyle = { opacity: 1 };
    return (
        <div className="flex flex-col gap-2" style={skeletonStyle}>
            <div className="w-full aspect-square bg-white dark:bg-dashboard-card border border-gray-100 dark:border-white/10 shadow-sm rounded-[20px] overflow-hidden p-1.5">
                <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-[4px] rounded-[14px] overflow-hidden">
                    <div className="w-full h-full bg-gray-100 dark:bg-white/5 animate-fill-fast" />
                    <div className="w-full h-full bg-gray-50 dark:bg-white/10 animate-fill-med" />
                    <div className="w-full h-full bg-gray-50 dark:bg-white/10 animate-fill-med" />
                    <div className="w-full h-full bg-gray-100 dark:bg-white/5 animate-fill-slow" />
                </div>
            </div>
            <div className="px-1 relative">
                <div className="h-[22px] w-2/3 bg-gray-100 dark:bg-white/5 rounded-[100px] animate-fill-med" />
                <div className="mt-0.5 h-[18px] w-1/3 bg-gray-50 dark:bg-white/10 rounded-[100px] animate-fill-slow" />
            </div>
        </div>
    );
};

const DetailSkeleton = ({ status }) => {
    const skeletonStyle = { opacity: 1 };

    return (
        <div className="w-full flex flex-col min-h-screen bg-white dark:bg-dashboard-dark" style={skeletonStyle}>
            {/* Mobile Hero / Gallery Placeholder */}
            <div className="lg:hidden relative w-full h-[45vh] bg-gray-100 dark:bg-white/5 animate-fill-fast overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[76px] px-4 flex items-center justify-between z-10">
                    <div className="w-[44px] h-[44px] rounded-full bg-white/40 dark:bg-white/20 animate-pulse shadow-sm" />
                    <div className="flex items-center gap-2">
                        <div className="w-[44px] h-[44px] rounded-full bg-white/40 dark:bg-white/20 animate-pulse shadow-sm" />
                        <div className="w-[44px] h-[44px] rounded-full bg-white/40 dark:bg-white/20 animate-pulse shadow-sm" />
                    </div>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-6 w-16 bg-black/20 rounded-full animate-pulse" />
            </div>

            <div className="max-w-[1440px] mx-auto w-full px-0 md:px-8 lg:px-20 relative z-10">
                {/* Desktop Header Skeleton — aligned exactly like real page */}
                <div className="hidden lg:flex items-center justify-between px-4 md:px-0 lg:px-20 py-6 sticky top-0 z-[100] bg-white dark:bg-dashboard-dark -mx-4 md:-mx-8 lg:-mx-20 border-b border-transparent">
                    <div className="flex items-center gap-2">
                        {/* Back button & Home button group */}
                        <div className="h-[44px] w-[44px] bg-gray-100 dark:bg-white/5 rounded-full animate-fill-fast" />
                        <div className="h-[44px] w-[120px] bg-gray-100 dark:bg-white/5 rounded-full animate-fill-med" />
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Contact & Booking group */}
                        <div className="flex items-center gap-2 pr-2">
                            <div className="h-[44px] w-[110px] bg-gray-100 dark:bg-white/5 rounded-full animate-fill-med" />
                            <div className="h-[44px] w-[130px] bg-gray-100 dark:bg-white/5 rounded-full animate-fill-med" />
                        </div>
                        {/* Save & Share group */}
                        <div className="flex items-center gap-2">
                            <div className="h-[44px] w-[100px] bg-gray-100 dark:bg-white/5 rounded-full animate-fill-med" />
                            <div className="h-[44px] w-[100px] bg-gray-100 dark:bg-white/5 rounded-full animate-fill-med" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-dashboard-dark rounded-t-[32px] lg:rounded-none -mt-10 lg:mt-0 px-0 pt-6 lg:pt-0 pb-32 lg:pb-8 min-h-[60vh]">                    
                    {/* Title & Info Section */}
                    <div className="flex flex-col gap-1 mb-8 px-4 lg:px-0">
                        {/* Title */}
                        <div className="h-9 lg:h-11 w-3/4 bg-gray-100 dark:bg-white/5 rounded-full animate-fill-med mb-2" />
                        
                        {/* Price & Badge */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-baseline gap-2">
                                <div className="h-9 w-32 bg-gray-100 dark:bg-white/5 rounded-full animate-fill-med" />
                                <div className="h-5 w-16 bg-gray-50 dark:bg-white/10 rounded-full animate-fill-slow" />
                            </div>
                            
                            {/* Standard Pill Badge */}
                            <div className="h-[44px] w-[180px] bg-gray-50 dark:bg-white/10 rounded-full animate-fill-fast" />
                        </div>
                    </div>

                    {/* Gallery - Desktop Bento Grid */}
                    <div className="hidden lg:grid grid-cols-4 gap-2 h-[400px] w-full rounded-[24px] overflow-hidden mb-12 shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="col-span-2 row-span-2 bg-gray-100 dark:bg-white/5 animate-fill-fast" />
                        <div className="col-span-1 row-span-1 bg-gray-50 dark:bg-white/10 animate-fill-med" />
                        <div className="col-span-1 row-span-1 bg-gray-50 dark:bg-white/10 animate-fill-med" />
                        <div className="col-span-1 row-span-1 bg-gray-50 dark:bg-white/10 animate-fill-slow" />
                        <div className="col-span-1 row-span-1 bg-gray-50 dark:bg-white/10 animate-fill-slow flex items-center justify-center">
                            <div className="h-[44px] w-32 bg-white/10 rounded-full" />
                        </div>
                    </div>

                    {/* Features Card Layout */}
                    <div className="px-4 lg:px-0 mb-12">
                        <div className="grid grid-cols-2 lg:grid-cols-4 border border-gray-100 dark:border-white/10 rounded-[24px] divide-x-0 lg:divide-x divide-gray-100 dark:divide-white/5 overflow-hidden">
                            {[...Array(4)].map((_, i) => (
                                <div key={`feat-${i}`} className="p-6 flex items-center gap-4">
                                    <div className="h-8 w-8 bg-gray-100 dark:bg-white/5 rounded-full animate-fill-slow" />
                                    <div className="h-5 w-24 bg-gray-50 dark:bg-white/10 rounded-full animate-fill-slow" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 px-4 lg:px-0">
                        <div className="lg:col-span-8 space-y-10">
                            <div className="space-y-6">
                                <div className="h-7 w-48 bg-gray-100 dark:bg-white/5 rounded-full animate-fill-med" />
                                <div className="space-y-4">
                                    <div className="h-4 w-full bg-gray-50 dark:bg-white/5 rounded-full animate-fill-slow" />
                                    <div className="h-4 w-full bg-gray-50 dark:bg-white/5 rounded-full animate-fill-slow" />
                                    <div className="h-4 w-4/5 bg-gray-50 dark:bg-white/5 rounded-full animate-fill-slow" />
                                </div>
                            </div>
                        </div>
                        {/* Sidebar map/info box skeleton */}
                        <div className="hidden lg:block lg:col-span-4 h-[400px] bg-gray-50 dark:bg-white/5 rounded-[32px] animate-fill-slow" />
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Bar Fixed Skeleton */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[80px] bg-white dark:bg-dashboard-card border-t border-gray-100 dark:border-white/10 px-6 py-4 flex items-center justify-between z-[100]">
                <div className="flex flex-col gap-1">
                    <div className="h-6 w-24 bg-gray-100 dark:bg-white/5 rounded-full animate-fill-med" />
                    <div className="h-3 w-12 bg-gray-50 dark:bg-white/10 rounded-full animate-fill-slow" />
                </div>
                <div className="flex gap-2">
                    <div className="h-[44px] w-24 bg-gray-100 dark:bg-white/5 rounded-full animate-fill-med" />
                    <div className="h-[44px] w-32 bg-gray-100 dark:bg-white/5 rounded-full animate-fill-med" />
                </div>
            </div>
        </div>
    );
};

const ListingSkeleton = ({ viewMode = 'grid', index = 0, isExiting = false, status = null }) => {
    if (viewMode === 'detail') return <DetailSkeleton status={status} />;
    if (viewMode === 'grouped-saved-category') return <GroupedSavedCategorySkeleton />;
    if (viewMode === 'saved-grid') return <SavedGridSkeleton />;
    if (viewMode === 'list') return <ListSkeleton />;
    return <GridSkeleton />;
};

export default ListingSkeleton;
