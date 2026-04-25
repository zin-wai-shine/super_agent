import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import { appointmentApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import FilterBar from '../../components/ui/FilterBar';
import {
    MapPinIcon,
    ClockIcon,
    HomeIcon,
    BuildingOfficeIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowRightIcon,
    AdjustmentsHorizontalIcon,
    ExclamationTriangleIcon,
    ChevronRightIcon,
    CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { BsCalendar2Week, BsClock } from 'react-icons/bs';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { RiBuilding2Line } from 'react-icons/ri';
import BookingSkeleton from '../../components/ui/BookingSkeleton';
import { getMediaUrl } from '../../utils/media';

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

    const getStatusConfig = (status) => {
        switch (status) {
            case 'confirmed':
                return {
                    label: 'Confirmed',
                    dotColor: 'bg-blue-500',
                    bgColor: 'bg-blue-50 dark:bg-blue-500/10',
                    textColor: 'text-blue-700 dark:text-blue-400',
                    accentColor: 'from-blue-600 to-blue-400',
                    icon: <CheckCircleIcon className="w-3.5 h-3.5" />
                };
            case 'completed':
                return {
                    label: 'Completed',
                    dotColor: 'bg-emerald-500',
                    bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
                    textColor: 'text-emerald-700 dark:text-emerald-400',
                    accentColor: 'from-emerald-600 to-emerald-400',
                    icon: <CheckCircleIcon className="w-3.5 h-3.5" />
                };
            case 'cancelled':
                return {
                    label: 'Cancelled',
                    dotColor: 'bg-rose-500',
                    bgColor: 'bg-rose-50 dark:bg-rose-500/10',
                    textColor: 'text-rose-700 dark:text-rose-400',
                    accentColor: 'from-rose-600 to-rose-400',
                    icon: <XCircleIcon className="w-3.5 h-3.5" />
                };
            default:
                return {
                    label: 'Pending',
                    dotColor: 'bg-amber-500',
                    bgColor: 'bg-amber-50 dark:bg-amber-500/10',
                    textColor: 'text-amber-700 dark:text-amber-400',
                    accentColor: 'from-amber-600 to-amber-400',
                    icon: <ClockIcon className="w-3.5 h-3.5" />
                };
        }
    };

    return (
        <div className="pt-10 pb-24 lg:pb-20 bg-white dark:bg-dashboard-dark min-h-screen">
            {/* Filter bar (desktop only) */}
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
                {/* Header */}
                <div className="flex flex-col items-start text-left gap-8 mb-16 relative z-20 px-0">
                    <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                        <h1 className="text-[32px] md:text-[40px] font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-4">
                            My Viewing Requests
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400 font-medium text-lg max-w-xl">
                            Track and manage your upcoming property visits and historical viewings.
                        </p>
                    </div>

                    {/* Status filter — Pill chips */}
                    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <div className="flex flex-wrap gap-3" role="tablist" aria-label="Filter by status">
                            {[
                                { value: 'all', label: 'All Requests' },
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
                                    className={`min-h-[48px] px-6 py-2.5 rounded-full text-[15px] font-bold transition-all duration-300 active:scale-[0.96] border shadow-sm ${filter === value
                                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-dashboard-dark dark:border-white shadow-lg'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:bg-white/5 dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/10 dark:hover:text-white'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {user?.late_cancellation_count >= 3 && !initialLoading && (
                    <div className="bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-500 p-8 rounded-2xl mb-12 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-start gap-5">
                            <div className="shrink-0 bg-rose-100 dark:bg-rose-500/20 p-3 rounded-2xl">
                                <ExclamationTriangleIcon className="h-7 w-7 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-rose-900 dark:text-rose-300 leading-none mb-3">Policy Alert: High Cancellation Rate</h3>
                                <p className="text-rose-700 dark:text-rose-400 font-medium leading-relaxed max-w-3xl">
                                    Our records show {user.late_cancellation_count} late cancellations. To ensure a fair experience for all users and agents, please confirm your availability before booking. Repeated late cancellations may impact your ability to schedule future viewings.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 px-6 py-4 rounded-2xl mb-10 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm">
                        <XCircleIcon className="w-6 h-6 shrink-0" />
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                {/* Content Area */}
                <div className="relative min-h-[400px]">
                    {initialLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                            {[...Array(skeletonCount)].map((_, index) => (
                                <BookingSkeleton
                                    key={`booking-skeleton-${index}`}
                                    index={index}
                                    isExiting={isExiting}
                                />
                            ))}
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 group animate-in fade-in duration-700">
                            <div className="mb-8 relative transition-transform duration-500 group-hover:scale-110">
                                <div className="absolute inset-0 bg-slate-100 dark:bg-white/5 rounded-full scale-150 blur-2xl -z-10" />
                                <BsCalendar2Week className="w-16 h-16 text-slate-300 dark:text-slate-700" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">No requests found</h3>
                            <p className="text-slate-500 dark:text-gray-400 mb-12 max-w-sm text-center font-medium leading-relaxed px-4">
                                {filter === 'all'
                                    ? "You haven't scheduled any viewings yet. Explore our listings to find your next dream home."
                                    : `You don't have any ${filter} viewing requests at the moment.`}
                            </p>
                            <Link
                                to="/listings"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-dashboard-dark rounded-full font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-slate-200 dark:shadow-none"
                            >
                                <span>Browse Listings</span>
                                <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                            {filteredAppointments.map((appointment, index) => {
                                const date = new Date(appointment.preferred_date);
                                const isPast = date < new Date();
                                const statusConfig = getStatusConfig(appointment.status);
                                const featuredImage = appointment.listing?.media?.find(m => m.type === 'image')?.url;

                                return (
                                    <Link
                                        key={appointment.id}
                                        to={`/listings/${appointment.listing_id}?bookingId=${appointment.id}`}
                                        className={`group relative flex flex-col bg-white dark:bg-dashboard-card border border-slate-200/60 dark:border-white/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] hover:border-slate-300 dark:hover:border-white/20 transition-all duration-500 overflow-hidden rounded-[28px] animate-in fade-in slide-in-from-bottom-6 duration-700 ${isPast ? 'opacity-90 grayscale-[0.3]' : ''}`}
                                        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                                    >
                                        {/* Thumbnail Header */}
                                        <div className="relative h-48 sm:h-56 w-full overflow-hidden shrink-0">
                                            {featuredImage ? (
                                                <img 
                                                    src={getMediaUrl(featuredImage)} 
                                                    alt="" 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                                    <RiBuilding2Line className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                                                </div>
                                            )}
                                            
                                            {/* Status Badge - Floating */}
                                            <div className="absolute top-4 left-4 z-10">
                                                <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md border shadow-sm ${statusConfig.bgColor} ${statusConfig.textColor} border-white/20 dark:border-white/10`}>
                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${statusConfig.dotColor} animate-pulse`} />
                                                    <span className="text-[13px] font-bold uppercase tracking-wider">{statusConfig.label}</span>
                                                </div>
                                            </div>

                                            {/* ID Badge - Floating Right */}
                                            <div className="absolute top-4 right-4 z-10">
                                                <div className="px-2.5 py-1.5 bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold text-white/90 tabular-nums">
                                                    #{appointment.id.slice(0, 8).toUpperCase()}
                                                </div>
                                            </div>

                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                                        </div>

                                        <div className="flex-1 flex flex-col p-6 pt-5">
                                            {/* Property Type & Location */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 text-[11px] font-bold rounded-full uppercase tracking-wider">
                                                    {appointment.listing?.property_type || 'Property'}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-slate-400 dark:text-gray-500 text-xs font-medium">
                                                    <HiOutlineLocationMarker className="w-3.5 h-3.5 shrink-0" />
                                                    <span className="truncate">{appointment.listing?.district || 'Location'}</span>
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-6 min-h-[3rem]">
                                                {appointment.listing?.title || 'Untitled Property'}
                                            </h3>

                                            {/* Action / Schedule Area */}
                                            <div className="mt-auto flex flex-col gap-4">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex flex-col gap-1.5 p-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 transition-colors group-hover:bg-slate-100 dark:group-hover:bg-white/10">
                                                        <div className="flex items-center gap-2 text-slate-400 dark:text-gray-500">
                                                            <BsCalendar2Week className="w-3.5 h-3.5" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">Date</span>
                                                        </div>
                                                        <span className="text-[15px] font-bold text-slate-900 dark:text-white truncate">
                                                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 p-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 transition-colors group-hover:bg-slate-100 dark:group-hover:bg-white/10">
                                                        <div className="flex items-center gap-2 text-slate-400 dark:text-gray-500">
                                                            <BsClock className="w-3.5 h-3.5" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">Time</span>
                                                        </div>
                                                        <span className="text-[15px] font-bold text-slate-900 dark:text-white">
                                                            {appointment.preferred_time}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Arrow Link Indicator */}
                                                <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100 dark:border-white/5">
                                                    <span className="text-sm font-bold text-slate-500 dark:text-gray-400">View Details</span>
                                                    <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-dashboard-dark flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 shadow-lg">
                                                        <ChevronRightIcon className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Accent Bar - Bottom */}
                                        <div className={`h-1.5 w-full bg-gradient-to-r ${statusConfig.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
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
