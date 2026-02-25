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

    if (isMapListView) {
        return (
            <div
                className="flex flex-row gap-3 p-3 bg-white rounded-[24px] shadow-sm border border-gray-100 animate-pulse"
                style={skeletonStyle}
            >
                <div className="w-[160px] md:w-[240px] aspect-[4/3] bg-gray-100 relative rounded-[16px] overflow-hidden flex-none">
                    <div className="absolute top-2 left-2 h-6 w-16 bg-gray-200 rounded-full" />
                </div>
                <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
                    <div className="flex flex-col gap-1.5">
                        <div className="h-4 w-[85%] bg-gray-200 rounded-[2px]" />
                        <div className="space-y-1.5 mt-1">
                            <div className="flex items-center gap-1">
                                <div className={`h-3 w-14 ${barLight} rounded-[2px] shrink-0`} />
                                <div className={`h-3 w-24 ${bar} rounded-[2px] min-w-0`} />
                            </div>
                            <div className="flex items-center gap-1">
                                <div className={`h-3 w-14 ${barLight} rounded-[2px] shrink-0`} />
                                <div className={`h-3 w-28 ${bar} rounded-[2px] min-w-0`} />
                            </div>
                            <div className="flex items-center gap-1">
                                <div className={`h-3 w-14 ${barLight} rounded-[2px] shrink-0`} />
                                <div className={`h-3 w-20 ${bar} rounded-[2px] min-w-0`} />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <div className={`h-3.5 w-10 ${barLight} rounded-[2px]`} />
                            <div className={`h-3.5 w-10 ${barLight} rounded-[2px]`} />
                            <div className={`h-3.5 w-12 ${barLight} rounded-[2px]`} />
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100/60 flex items-center justify-start gap-5">
                        <div className={`h-3.5 w-10 ${barLight} rounded-[2px]`} />
                        <div className={`h-3.5 w-10 ${barLight} rounded-[2px]`} />
                        <div className={`h-3.5 w-14 ${barLight} rounded-[2px]`} />
                    </div>
                </div>
            </div>
        );
    }

    if (isListView) {
        return (
            <div
                className="flex flex-row animate-pulse bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100/50 h-[135px] md:h-[190px]"
                style={skeletonStyle}
            >
                <div className="w-[135px] md:w-[35%] h-full bg-gray-100 flex-none relative overflow-hidden">
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <div className={`h-4 w-12 ${bar} rounded-[3px]`} />
                        <div className={`h-4 w-16 ${bar} rounded-[3px]`} />
                    </div>
                </div>
                <div className="p-4 md:p-6 flex flex-col flex-1 min-w-0">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div className={`h-6 w-32 ${bar} rounded-[3px]`} />
                            <div className={`h-3 w-10 ${barLight} rounded-[3px]`} />
                        </div>
                        <div className={`h-5 w-[85%] ${bar} rounded-[3px]`} />
                        <div className="flex gap-4">
                            <div className={`h-4 w-20 ${barLight} rounded-[3px]`} />
                            <div className={`h-4 w-20 ${barLight} rounded-[3px]`} />
                        </div>
                    </div>
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className={`h-4 w-8 ${barLight} rounded-[3px]`} />
                            <div className={`h-4 w-8 ${barLight} rounded-[3px]`} />
                            <div className={`h-4 w-8 ${barLight} rounded-[3px]`} />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`h-4 w-12 ${barLight} rounded-[3px]`} />
                            <div className={`h-4 w-12 ${barLight} rounded-[3px]`} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="animate-pulse bg-white overflow-hidden shadow-sm border border-gray-100/50"
            style={{ borderRadius: 'var(--card-radius)', ...skeletonStyle }}
        >
            <div className="aspect-[16/10] bg-gray-100 w-full relative">
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className={`h-4 w-16 ${bar} rounded-[3px]`} />
                    <div className={`h-4 w-20 ${bar} rounded-[3px]`} />
                </div>
                <div className="absolute top-4 right-4 h-5 w-16 bg-gray-200 rounded-[3px]" />
                <div className="absolute bottom-4 left-4 h-9 w-[35%] bg-white/80 rounded-[3px]" />
            </div>
            <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div className={`h-7 w-40 ${bar} rounded-[3px]`} />
                    <div className={`h-3 w-10 ${barLight} rounded-[3px]`} />
                </div>
                <div className={`h-6 w-full ${barLight} rounded-[3px]`} />
                <div className="space-y-3">
                    <div className={`h-4 w-[75%] ${barLight} rounded-[3px]`} />
                    <div className={`h-4 w-[55%] ${barLight} rounded-[3px]`} />
                    <div className={`h-4 w-[35%] ${barLight} rounded-[3px]`} />
                </div>
                <div className="pt-3 border-t border-gray-100/70 mt-1 flex justify-between items-center">
                    <div className={`h-5 w-24 ${barLight} rounded-[3px]`} />
                    <div className={`h-5 w-10 ${barLight} rounded-[3px]`} />
                </div>
            </div>
        </div>
    );
};

export default ListingSkeleton;
