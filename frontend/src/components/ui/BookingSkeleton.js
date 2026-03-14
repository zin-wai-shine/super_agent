import React from 'react';

const BookingSkeleton = ({ index = 0, isExiting = false }) => {
    const skeletonStyle = {
        opacity: 1,
    };

    // Match My Bookings card: rounded-2xl, status accent bar, title, location, bottom row
    return (
        <div
            className="w-full h-full flex flex-col bg-white dark:bg-dashboard-card border border-slate-200/70 dark:border-white/10 shadow-sm overflow-hidden rounded-2xl relative"
            style={skeletonStyle}
        >
            {/* Status accent bar — same as real card */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100 dark:bg-white/10 rounded-l-2xl" />

            {/* Content Area */}
            <div className="flex-1 flex flex-col pl-5 pr-5 pt-5 md:pt-6 pb-4">
                {/* Status pill + ID row */}
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="h-6 w-20 bg-slate-100 dark:bg-white/5 rounded-full animate-fill-med" />
                    <div className="h-3 w-12 bg-slate-50 dark:bg-white/10 rounded-sm animate-fill-med" />
                </div>

                {/* Title Line Placeholder: Matches 17px font + leading-snug height (~23px) */}
                <div className="mb-1.5">
                    <div className="h-[23px] w-[95%] bg-slate-100 dark:bg-white/5 rounded-sm animate-fill-med" />
                </div>

                {/* Location Line Placeholder: Sit naturally below title like real card */}
                <div className="flex items-center gap-1.5">
                    <div className="h-4 w-4 bg-slate-50 dark:bg-white/10 rounded-full animate-fill-slow" />
                    <div className="h-[18px] w-32 bg-slate-50 dark:bg-white/10 rounded-sm animate-fill-slow" />
                </div>
            </div>

            {/* Bottom Strip: Date & Time */}
            <div className="px-5 py-4 md:py-4 bg-slate-50/80 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-4 rounded-b-2xl">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-100 dark:bg-white/10 rounded-sm animate-fill-slow" />
                    <div className="h-[18px] w-24 bg-slate-100 dark:bg-white/10 rounded-sm animate-fill-slow" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-100 dark:bg-white/10 rounded-sm animate-fill-slow" />
                    <div className="h-[18px] w-16 bg-slate-100 dark:bg-white/10 rounded-sm animate-fill-slow" />
                </div>
            </div>
        </div>
    );
};

export default BookingSkeleton;
