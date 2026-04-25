import React from 'react';

const BookingSkeleton = ({ index, isExiting }) => {
    // If index is provided, render the Card Skeleton for MyBookings page
    if (index !== undefined) {
        return (
            <div 
                className={`w-full flex flex-col bg-white dark:bg-dashboard-card border border-slate-200/70 dark:border-white/10 overflow-hidden rounded-[23px] transition-all duration-500 ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                style={{ animationDelay: `${index * 50}ms` }}
            >
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col px-5 pt-5 pb-4">
                    {/* Status Pill + ID Row */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="w-20 h-6 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" />
                        <div className="w-16 h-3 bg-slate-50 dark:bg-white/5 rounded-full animate-pulse" />
                    </div>

                    {/* Title Skeleton */}
                    <div className="space-y-2 mb-4">
                        <div className="h-5 w-full bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" />
                        <div className="h-5 w-2/3 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" />
                    </div>

                    {/* Date/Time Section */}
                    <div className="flex items-center gap-6">
                        {/* Day Number + Month/Year */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
                            <div className="flex flex-col gap-1.5">
                                <div className="w-10 h-3 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" />
                                <div className="w-8 h-3 bg-slate-50 dark:bg-white/5 rounded-full animate-pulse" />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-10 bg-slate-100 dark:bg-white/10" />

                        {/* Time Section */}
                        <div className="flex flex-col gap-1.5">
                            <div className="w-10 h-2.5 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" />
                            <div className="w-14 h-4 bg-slate-50 dark:bg-white/5 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Footer Button Section */}
                <div className="px-5 pb-5 pt-0 flex justify-end mt-auto">
                    <div className="w-32 h-10 bg-slate-900/10 dark:bg-white/10 rounded-full animate-pulse" />
                </div>
            </div>
        );
    }

    // Default Page Skeleton for BookAppointment page
    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-dashboard-dark py-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-800 dark:text-white animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto">
                {/* Back Button Skeleton */}
                <div className="mb-6">
                    <div className="inline-flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
                        <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* LEFT COLUMN: Main Booking Flow */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* 1. Purpose Selector Skeleton */}
                        <div className="bg-white dark:bg-dashboard-dark/40 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 p-6">
                            <div className="h-3 w-20 bg-gray-100 dark:bg-white/5 rounded-full mb-4 animate-pulse" />
                            <div className="bg-gray-100 dark:bg-white/5 p-1 rounded-full flex items-center gap-2">
                                <div className="flex-1 h-9 bg-white dark:bg-white/10 rounded-full shadow-sm animate-pulse" />
                                <div className="flex-1 h-9 bg-transparent rounded-full animate-pulse opacity-50" />
                            </div>
                        </div>

                        {/* 2. Date & Time Selection Skeleton */}
                        <div className="bg-white dark:bg-dashboard-dark/40 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 p-6">
                            <div className="h-3 w-32 bg-gray-100 dark:bg-white/5 rounded-full mb-8 animate-pulse" />
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 animate-pulse" />
                                        <div className="h-4 w-24 bg-gray-100 dark:bg-white/10 rounded-full animate-pulse" />
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 animate-pulse" />
                                    </div>
                                    <div className="grid grid-cols-7 gap-4">
                                        {[...Array(28)].map((_, i) => (
                                            <div key={i} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 animate-pulse" />
                                        ))}
                                    </div>
                                </div>
                                <div className="hidden md:block w-px bg-gray-100 dark:bg-white/10 min-h-full" />
                                <div className="flex-1">
                                    <div className="h-3 w-16 bg-gray-100 dark:bg-white/5 rounded-full mb-4 animate-pulse" />
                                    <div className="grid grid-cols-2 gap-3 mb-8">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="h-10 rounded-full bg-gray-50 dark:bg-white/5 animate-pulse" />
                                        ))}
                                    </div>
                                    <div className="h-3 w-16 bg-gray-100 dark:bg-white/5 rounded-full mb-4 animate-pulse" />
                                    <div className="grid grid-cols-2 gap-3">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="h-10 rounded-full bg-gray-50 dark:bg-white/5 animate-pulse" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. User Details Form Skeleton */}
                        <div className="bg-white dark:bg-dashboard-dark/40 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 p-6">
                            <div className="h-3 w-24 bg-gray-100 dark:bg-white/5 rounded-full mb-6 animate-pulse" />
                            <div className="space-y-6">
                                <div>
                                    <div className="h-3 w-16 bg-gray-50 dark:bg-white/5 rounded-full mb-3 ml-1 animate-pulse" />
                                    <div className="h-12 w-full bg-gray-50 dark:bg-white/5 rounded-full animate-pulse" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-12 w-full bg-gray-50 dark:bg-white/5 rounded-full animate-pulse" />
                                    <div className="h-12 w-full bg-gray-50 dark:bg-white/5 rounded-full animate-pulse" />
                                </div>
                                <div className="h-24 w-full bg-gray-50 dark:bg-white/5 rounded-2xl animate-pulse" />
                            </div>
                            <div className="mt-10 h-14 w-full bg-primary-500/20 rounded-full animate-pulse" />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Info Sidebars Skeleton */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-dashboard-dark/40 rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden">
                            <div className="h-48 bg-gray-200 dark:bg-white/10 animate-pulse" />
                            <div className="p-6 space-y-4">
                                <div className="h-6 w-3/4 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
                                <div className="h-4 w-1/2 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
                                <div className="h-12 w-full bg-gray-50 dark:bg-white/5 rounded-full animate-pulse" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-dashboard-dark/40 rounded-3xl h-64 border border-gray-100 dark:border-white/5 animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingSkeleton;
