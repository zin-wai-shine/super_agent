import React from 'react';
import Card from './Card';

const ListingSkeleton = ({ viewMode = 'grid', index = 0, isExiting = false }) => {
    const isListView = viewMode === 'list';
    const isMapListView = viewMode === 'map-list';

    // Entry: 0 -> 11, Exit: 0 -> 11 (start from first card)
    const delay = isExiting ? `${(index % 12) * 60}ms` : `${(index % 12) * 100}ms`;

    const skeletonStyle = {
        borderRadius: 'var(--card-radius)',
        animation: isExiting ? 'fadeOutDown 0.6s ease-in forwards' : 'fadeInUp 0.6s ease-out forwards',
        animationDelay: delay,
        opacity: isExiting ? 1 : 0,
    };

    if (isMapListView) {
        return (
            <div className="flex flex-row gap-4 py-4 md:py-5 border-b border-gray-100 animate-pulse px-2 -mx-2" style={skeletonStyle}>
                {/* Image Section Skeleton */}
                <div className="w-[160px] md:w-[240px] aspect-[4/3] bg-[#f8fafb] relative rounded-[var(--card-radius)] overflow-hidden flex-none">
                    <div className="absolute top-2 left-2 h-6 w-20 bg-[#e2e8f0] rounded-[3px]" />
                </div>

                {/* Content Section Skeleton */}
                <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5 md:py-1">
                    <div className="flex flex-col gap-3">
                        {/* Title Skeleton */}
                        <div className="h-5 w-[90%] bg-[#e2e8f0] rounded-[3px]" />

                        {/* Property Info Skeleton */}
                        <div className="space-y-2 mt-1">
                            <div className="flex items-center gap-4">
                                <div className="h-3.5 w-16 bg-[#f1f5f9] rounded-[2px]" />
                                <div className="h-3.5 w-32 bg-[#e2e8f0] rounded-[2px]" />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-3.5 w-16 bg-[#f1f5f9] rounded-[2px]" />
                                <div className="h-3.5 w-40 bg-[#e2e8f0] rounded-[2px]" />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-3.5 w-16 bg-[#f1f5f9] rounded-[2px]" />
                                <div className="h-3.5 w-24 bg-[#e2e8f0] rounded-[2px]" />
                            </div>
                        </div>

                        {/* Stats Skeleton */}
                        <div className="flex items-center gap-6 mt-1.5 pt-3 border-t border-gray-100/60">
                            <div className="h-4 w-14 bg-[#f1f5f9] rounded-[2px]" />
                            <div className="h-4 w-14 bg-[#f1f5f9] rounded-[2px]" />
                            <div className="h-4 w-16 bg-[#f1f5f9] rounded-[2px]" />
                        </div>
                    </div>

                    {/* Footer Actions Skeleton */}
                    <div className="mt-3 pt-3 border-t border-gray-100/60 flex items-center justify-start gap-6">
                        <div className="h-4 w-12 bg-[#f1f5f9] rounded-[2px]" />
                        <div className="h-4 w-12 bg-[#f1f5f9] rounded-[2px]" />
                        <div className="h-4 w-20 bg-[#f1f5f9] rounded-[2px]" />
                    </div>
                </div>
            </div>
        );
    }

    if (isListView) {
        return (
            <Card className="flex flex-row animate-pulse bg-white border border-gray-100 h-[135px] md:h-[190px]" style={skeletonStyle}>
                {/* Image Section Skeleton */}
                <div className="w-[135px] md:w-[35%] h-full bg-[#f8fafb] flex-none relative overflow-hidden">
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <div className="h-4 w-12 bg-[#e2e8f0] rounded-[3px]" />
                        <div className="h-4 w-16 bg-[#e2e8f0] rounded-[3px]" />
                    </div>
                </div>

                {/* Content Section Skeleton */}
                <div className="p-4 md:p-6 flex flex-col flex-1 min-w-0 bg-white">
                    <div className="space-y-3">
                        {/* Price & ID */}
                        <div className="flex justify-between items-center">
                            <div className="h-6 w-32 bg-[#e2e8f0] rounded-[3px]" />
                            <div className="h-3 w-10 bg-[#f1f5f9] rounded-[3px]" />
                        </div>

                        {/* Title */}
                        <div className="h-5 w-[85%] bg-[#e2e8f0] rounded-[3px]" />

                        {/* Details */}
                        <div className="flex gap-4">
                            <div className="h-4 w-20 bg-[#f1f5f9] rounded-[3px]" />
                            <div className="h-4 w-20 bg-[#f1f5f9] rounded-[3px]" />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="h-4 w-8 bg-[#f1f5f9] rounded-[3px]" />
                            <div className="h-4 w-8 bg-[#f1f5f9] rounded-[3px]" />
                            <div className="h-4 w-8 bg-[#f1f5f9] rounded-[3px]" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-4 w-12 bg-[#f1f5f9] rounded-[3px]" />
                            <div className="h-4 w-12 bg-[#f1f5f9] rounded-[3px]" />
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="animate-pulse bg-white border border-gray-100 overflow-hidden" style={skeletonStyle}>
            {/* Top Section (Image) */}
            <div className="aspect-[16/10] bg-[#f8fafb] w-full relative">
                {/* Top left blocks */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="h-4 w-16 bg-[#e2e8f0] rounded-[3px]" />
                    <div className="h-4 w-20 bg-[#e2e8f0] rounded-[3px]" />
                </div>
                {/* Top right block */}
                <div className="absolute top-4 right-4 h-5 w-16 bg-[#e2e8f0] rounded-[3px]" />

                {/* Feature tag like block */}
                <div className="absolute bottom-4 left-4 h-9 w-[35%] bg-white/70 backdrop-blur-md rounded-[3px]" />
            </div>

            {/* Bottom Section (Content) */}
            <div className="p-5 flex flex-col gap-4 bg-white">
                {/* Row 1: Price & ID */}
                <div className="flex justify-between items-center">
                    <div className="h-7 w-40 bg-[#e2e8f0] rounded-[3px]" />
                    <div className="h-3 w-10 bg-[#f1f5f9] rounded-[3px]" />
                </div>

                {/* Row 2: Title */}
                <div className="h-6 w-full bg-[#f1f5f9] rounded-[3px]" />

                {/* Row 3-5: Details */}
                <div className="space-y-3">
                    <div className="h-4 w-[75%] bg-[#f1f5f9] rounded-[3px]" />
                    <div className="h-4 w-[55%] bg-[#f1f5f9] rounded-[3px]" />
                    <div className="h-4 w-[35%] bg-[#f1f5f9] rounded-[3px]" />
                </div>

                {/* Divider & Footer */}
                <div className="pt-3 border-t border-gray-100/70 mt-1 flex justify-between items-center">
                    <div className="h-5 w-24 bg-[#f1f5f9] rounded-[3px]" />
                    <div className="h-5 w-10 bg-[#f1f5f9] rounded-[3px]" />
                </div>
            </div>
        </Card>
    );
};

export default ListingSkeleton;
