import React from 'react';

const BookingSkeleton = ({ index = 0, isExiting = false }) => {
    const delay = isExiting ? `${(index % 4) * 60}ms` : `${(index % 4) * 100}ms`;

    const skeletonStyle = {
        animation: isExiting ? 'fadeOutDown 0.6s ease-in forwards' : 'fadeInUp 0.6s ease-out forwards',
        animationDelay: delay,
        opacity: isExiting ? 1 : 0,
    };

    // Match My Bookings card: rounded-[24px], top section (ID + status), title, location, bottom strip (DATE / TIME)
    return (
        <div
            className="w-full flex flex-col bg-white border border-slate-200/60 shadow-sm overflow-hidden rounded-[24px] animate-pulse"
            style={skeletonStyle}
        >
            {/* Top Section — same padding as real card */}
            <div className="p-5 md:p-6 pb-6 bg-white flex-1 relative">
                {/* Status & ID row */}
                <div className="flex items-center justify-between mb-5">
                    <div className="h-6 w-24 bg-slate-100 rounded-[4px]" />
                    <div className="h-6 w-20 bg-emerald-50/50 rounded-full" />
                </div>

                {/* Title — same as card (line-clamp-2, mb-2.5) */}
                <div className="mb-2.5 space-y-2">
                    <div className="h-5 w-[90%] bg-slate-100 rounded-[3px]" />
                    <div className="h-5 w-[60%] bg-slate-100 rounded-[3px]" />
                </div>

                {/* Location — icon + text */}
                <div className="flex items-center mt-4">
                    <div className="h-[18px] w-[18px] mr-1.5 bg-slate-100 rounded-full" />
                    <div className="h-4 w-32 bg-slate-100 rounded-[3px]" />
                </div>
            </div>

            {/* Bottom Section — DATE / TIME strip, same as real card */}
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
        </div>
    );
};

export default BookingSkeleton;
