import React from 'react';

const BookingSkeleton = () => {
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
