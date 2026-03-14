import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import { appointmentApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import FilterBar from '../../components/ui/FilterBar';
import {
    CalendarIcon,
    MapPinIcon,
    ClockIcon,
    HomeIcon,
    BuildingOfficeIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowRightIcon,
    AdjustmentsHorizontalIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import BookingSkeleton from '../../components/ui/BookingSkeleton';

const MyBookings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const outletContext = useOutletContext() || {};
    const { filterBarSlot, navVisible = true, isScrolled: layoutScrolled = false } = outletContext;

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    
    // Track last known count for stable skeletons on reload
    const [skeletonCount, setSkeletonCount] = useState(() => {
        const saved = localStorage.getItem('bookings_count');
        return saved ? parseInt(saved) : 3;
    });
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [bookingsSearchTerm, setBookingsSearchTerm] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    // Save count for next reload
    useEffect(() => {
        if (!initialLoading && appointments.length > 0) {
            localStorage.setItem('bookings_count', appointments.length.toString());
        }
    }, [appointments.length, initialLoading]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            setInitialLoading(true);
            setIsExiting(false);

            const [response] = await Promise.all([
                appointmentApi.getMyAppointments(),
                new Promise(resolve => setTimeout(resolve, 200))
            ]);

            // Trigger exit animation (match Listings page)
            setIsExiting(true);
            await new Promise(resolve => setTimeout(resolve, 200));

            setAppointments(response.data.appointments || []);
            setInitialLoading(false);
            setIsExiting(false);
        } catch (err) {
            console.error('Failed to fetch appointments:', err);
            setError('Failed to load your bookings. Please try again later.');
            setInitialLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const filteredAppointments = appointments.filter(app => {
        if (filter === 'all') return true;
        return app.status === filter;
    });

    return (
        <div className="pt-10 pb-24 lg:pb-20 bg-white dark:bg-dashboard-dark min-h-screen">
            {/* Filter bar (desktop only): same as Favorites page; search/filters navigate to list page */}
            {filterBarSlot && createPortal(
                <div className="hidden lg:block w-full">
                    <FilterBar
                        total={appointments.length}
                        searchTerm={bookingsSearchTerm}
                        onSearchChange={setBookingsSearchTerm}
                        onSearchSubmit={(value) => navigate(`/listings${value ? `?search=${encodeURIComponent(value)}` : ''}`)}
                        onOpenFilters={() => navigate('/listings?open_filters=1')}
                        hasActiveFilters={false}
                        activeFilterCount={0}
                        viewMode="grid"
                        onViewModeChange={() => { }}
                        isGoogleMapOpen={localStorage.getItem('preferredView') === 'map'}
                        onToggleMapView={() => {
                            const newPreference = localStorage.getItem('preferredView') === 'map' ? 'list' : 'map';
                            localStorage.setItem('preferredView', newPreference);
                            navigate(`/listings?view=${newPreference}`);
                        }}
                        navVisible={navVisible}
                        isScrolled={layoutScrolled}
                        onClearSearch={() => setBookingsSearchTerm('')}
                    />
                </div>,
                filterBarSlot
            )}

            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
                {/* Header — same design/size as Favorites, left-aligned */}
                <div className="flex flex-col items-start text-left gap-8 mb-16 relative z-20 px-0">
                    <div>
                        <h1 className="text-[24px] font-semibold text-slate-900 dark:text-white tracking-tight leading-tight">
                            My Viewing Requests
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400 mt-2 font-medium text-lg max-w-md">
                            View and manage your property viewing requests.
                        </p>
                    </div>

                    {/* Status filter — pill chips (no select box) */}
                    <div className="w-full">
                        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
                            {[
                                { value: 'all', label: 'All' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'confirmed', label: 'Confirmed' },
                                { value: 'completed', label: 'Completed' },
                                { value: 'cancelled', label: 'Cancelled' }
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    role="tab"
                                    aria-selected={filter === value}
                                    onClick={() => setFilter(value)}
                                    className={`min-h-[44px] px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${filter === value
                                        ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-dashboard-dark'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {user?.late_cancellation_count >= 3 && !initialLoading && (
                    <div className="mx-0 lg:mx-0 bg-red-50 border-l-4 border-red-500 p-6 rounded-[3px] mb-10 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-start gap-4">
                            <div className="shrink-0 bg-red-100 p-2 rounded-full">
                                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-red-900 leading-none mb-2">Process Warning: Appointment Cancellations</h3>
                                <p className="text-red-700 font-bold leading-relaxed">
                                    Our system has detected multiple cancellations for confirmed appointments (Total: {user.late_cancellation_count}).
                                    Repeated late cancellations may lead to account restrictions. Please ensure you can attend before booking, or contact support if you need assistance.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mx-0 bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-[3px] mb-10 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm">
                        <XCircleIcon className="w-6 h-6 shrink-0" />
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                {/* Content Area */}
                <div className="relative min-h-[400px]">
                    {initialLoading ? (
                        /* Skeletons — using persisted count for zero-flicker reload */
                        <div className="flex flex-wrap gap-6 items-start pointer-events-none animate-fill-fast">
                            {[...Array(skeletonCount)].map((_, index) => (
                                <div
                                    key={`booking-skeleton-${index}`}
                                    className="w-full md:flex-[0_0_calc((100%-3rem)/3)] min-w-0"
                                >
                                    <BookingSkeleton
                                        index={index}
                                        isExiting={isExiting}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 group animate-fill-med">
                            <div className="mb-6 relative z-10 transition-transform duration-500">
                                <CalendarIcon className="w-14 h-14 text-slate-400" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-medium text-slate-900 dark:text-white mb-3 relative z-10">No viewings yet</h3>
                            <p className="text-slate-500 dark:text-gray-400 mb-10 max-w-sm text-center font-medium leading-relaxed relative z-10 px-4">
                                {filter === 'all'
                                    ? "Excited to find your new home? Your scheduled viewings will appear right here."
                                    : `You don't have any ${filter} viewings at the moment.`}
                            </p>
                            <Button
                                variant="ghost"
                                className="!p-0 !bg-transparent !border-none !shadow-none !text-slate-600 hover:!text-primary-600 font-semibold transition-all duration-300 group inline-flex items-center !outline-none !ring-0 !ring-offset-0 w-auto"
                                onClick={() => window.location.href = '/listings'}
                            >
                                <span className="text-base sm:text-lg font-bold text-slate-700 dark:text-gray-300 group-hover:dark:text-white">Explore Listings</span>
                                <ArrowRightIcon className="w-5 sm:w-6 h-5 sm:h-6 ml-2 sm:ml-3 text-slate-500 transition-transform duration-300 group-hover:translate-x-3" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-6 items-start">
                            {filteredAppointments.map((appointment) => {
                                const date = new Date(appointment.preferred_date);
                                const isPast = date < new Date();

                                return (
                                    <Link
                                        key={appointment.id}
                                        to={`/listings/${appointment.listing_id}?bookingId=${appointment.id}`}
                                        className={`w-full md:flex-[0_0_calc((100%-3rem)/3)] min-w-0 flex flex-col group bg-white dark:bg-dashboard-card border border-slate-200/70 dark:border-white/10 shadow-sm hover:shadow-lg hover:border-slate-300/80 dark:hover:border-white/20 transition-all duration-300 overflow-hidden rounded-2xl animate-fill-med relative ${isPast ? 'opacity-85' : ''}`}
                                    >
                                        {/* Status accent bar — left edge */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${appointment.status === 'confirmed' ? 'bg-blue-500' :
                                            appointment.status === 'completed' ? 'bg-emerald-500' :
                                                appointment.status === 'cancelled' ? 'bg-rose-400' :
                                                    'bg-amber-400'
                                            }`} aria-hidden />

                                        <div className="flex-1 flex flex-col pl-5 pr-5 pt-5 md:pt-6 pb-4">
                                            {/* Status pill + ID */}
                                            <div className="flex items-center justify-between gap-3 mb-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${appointment.status === 'confirmed' ? 'bg-blue-50 text-blue-700' :
                                                    appointment.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                                                        appointment.status === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                                                            'bg-amber-50 text-amber-700'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${appointment.status === 'confirmed' ? 'bg-blue-500' :
                                                        appointment.status === 'completed' ? 'bg-emerald-500' :
                                                            appointment.status === 'cancelled' ? 'bg-rose-500' :
                                                                'bg-amber-500'
                                                        }`} />
                                                    {appointment.status}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-400 tabular-nums truncate">
                                                    {appointment.id.slice(0, 8).toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-[15px] font-bold md:text-[17px] md:font-semibold text-slate-800 dark:text-white leading-snug group-hover:text-primary-600 transition-colors line-clamp-2 mb-1.5">
                                                {appointment.listing?.title || 'Unknown Property'}
                                            </h3>

                                            {/* Location */}
                                            <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                                                <MapPinIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                                <span className="truncate">{appointment.listing?.district || 'Location unavailable'}</span>
                                            </div>
                                        </div>

                                        {/* Date & time — clear, scannable row */}
                                        <div className="px-5 py-4 md:py-4 bg-slate-50/80 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-4 rounded-b-2xl">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                                <span className="text-sm font-semibold text-slate-800 dark:text-gray-200">
                                                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ClockIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                                <span className="text-sm font-semibold text-slate-800 dark:text-gray-200">{appointment.preferred_time}</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBookings;
