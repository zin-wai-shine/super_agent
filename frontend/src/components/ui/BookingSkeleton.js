import React from 'react';
import Card from './Card';

const BookingSkeleton = ({ index = 0, isExiting = false }) => {
    // Entry: 0 -> 3, Exit: 0 -> 3 (start from first card)
    const delay = isExiting ? `${(index % 4) * 60}ms` : `${(index % 4) * 100}ms`;

    const skeletonStyle = {
        borderRadius: 'var(--card-radius)',
        animation: isExiting ? 'fadeOutDown 0.6s ease-in forwards' : 'fadeInUp 0.6s ease-out forwards',
        animationDelay: delay,
        opacity: isExiting ? 1 : 0,
    };

    return (
        <Card
            className="w-full md:w-[calc(50%-12px)] xl:w-[480px] flex flex-col bg-white border border-slate-200/60 shadow-sm overflow-hidden animate-pulse"
            style={skeletonStyle}
        >
            {/* Top Section */}
            <div className="p-5 md:p-6 pb-6 bg-white flex-1 relative">
                {/* Status & ID */}
                <div className="flex items-center justify-between mb-5">
                    <div className="h-6 w-24 bg-slate-100 rounded-[4px]" />
                    <div className="h-6 w-20 bg-emerald-50/50 rounded-full" />
                </div>

                {/* Title */}
                <div className="mb-2.5 space-y-2">
                    <div className="h-6 w-[90%] bg-slate-100 rounded-[3px]" />
                    <div className="h-6 w-[60%] bg-slate-100 rounded-[3px]" />
                </div>

                {/* Location */}
                <div className="flex items-center mt-4">
                    <div className="h-4 w-4 mr-2 bg-slate-100 rounded-full" />
                    <div className="h-4 w-32 bg-slate-100 rounded-[3px]" />
                </div>
            </div>

            {/* Bottom Section */}
            <div className="p-4 md:p-6 bg-[#f8fafc] border-t border-slate-200/60 flex items-center justify-between mt-auto">
                <div className="space-y-1.5">
                    <div className="h-3 w-10 bg-slate-200/50 rounded-[2px]" />
                    <div className="h-5 w-24 bg-slate-200/80 rounded-[3px]" />
                </div>
                <div className="flex flex-col items-end space-y-1.5">
                    <div className="h-3 w-10 bg-slate-200/50 rounded-[2px]" />
                    <div className="h-5 w-16 bg-slate-200/80 rounded-[3px]" />
                </div>
            </div>
        </Card>
    );
};

export default BookingSkeleton;
