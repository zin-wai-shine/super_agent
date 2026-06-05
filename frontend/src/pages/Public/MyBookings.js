import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import { appointmentApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
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
    XMarkIcon
} from '@heroicons/react/24/outline';
import { BsCalendar2Week } from 'react-icons/bs';
import BookingSkeleton from '../../components/ui/BookingSkeleton';

const MyBookings = () => {
    const { t, i18n } = useTranslation();
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
    const [cancellationModal, setCancellationModal] = useState({ open: false, appointmentId: null, reason: '', submitting: false });

    useEffect(() => {
        fetchAppointments();
    }, []);

    // Save count for next reload
    useEffect(() => {
        if (!initialLoading && appointments.length > 0) {
            localStorage.setItem('bookings_count', appointments.length.toString());
        }
    }, [appointments.length, initialLoading]);

    // Prevent body scroll and layout shift when modal is open
    useEffect(() => {
        if (cancellationModal.open) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.paddingRight = '';
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.paddingRight = '';
            document.body.style.overflow = '';
        };
    }, [cancellationModal.open]);

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

    const handleCancelSubmit = async () => {
        if (!cancellationModal.reason.trim()) return;
        
        try {
            setCancellationModal(prev => ({ ...prev, submitting: true }));
            await appointmentApi.cancelAppointment(cancellationModal.appointmentId, { reason: cancellationModal.reason });
            
            // Update local state
            setAppointments(prev => prev.map(app => 
                app.id === cancellationModal.appointmentId 
                    ? { ...app, status: 'cancelled', cancellation_reason: cancellationModal.reason }
                    : app
            ));
            
            setCancellationModal({ open: false, appointmentId: null, reason: '', submitting: false });
        } catch (err) {
            console.error('Failed to cancel appointment:', err);
            alert('Failed to cancel appointment. Please try again.');
            setCancellationModal(prev => ({ ...prev, submitting: false }));
        }
    };

    const filteredAppointments = appointments.filter(app => {
        if (filter === 'all') return true;
        return app.status === filter;
    });

    return (
        <>
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
                            {t('bookings.title')}
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400 mt-2 font-medium text-lg max-w-md">
                            {t('bookings.desc')}
                        </p>
                    </div>

                    {/* Status filter — pill chips matching FilterBar button design */}
                    <div className="w-full">
                        <div className="flex flex-wrap gap-2.5" role="tablist" aria-label="Filter by status">
                            {[
                                { value: 'all', label: t('filters.any') },
                                { value: 'pending', label: t('listing.requested') },
                                { value: 'confirmed', label: t('listing.confirmed') },
                                { value: 'completed', label: t('listing.completed', 'Completed') },
                                { value: 'cancelled', label: t('listing.cancelled') }
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    role="tab"
                                    aria-selected={filter === value}
                                    onClick={() => setFilter(value)}
                                    className={`h-[44px] px-5 rounded-full text-[13px] font-semibold
                                        transition-all duration-300 ease-out
                                        active:scale-[0.98]
                                        focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2
                                        ${filter === value
                                            ? 'bg-[#222222] dark:bg-white text-white dark:text-dashboard-dark border border-[#222222] dark:border-white shadow-md'
                                            : `bg-white dark:bg-dashboard-card sm:bg-[#F9FAFC] dark:sm:bg-dashboard-card/80
                                               border border-gray-200 dark:border-white/10 sm:border-primary-500/30
                                               text-[#222222] dark:text-white
                                               hover:bg-white dark:hover:bg-dashboard-hover sm:hover:bg-white
                                               hover:border-[#222222] dark:hover:border-white/40
                                               hover:shadow-md hover:-translate-y-[1px]`
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {user?.late_cancellation_count >= 3 && !initialLoading && (
                    <div className="mx-0 lg:mx-0 bg-red-50 border-l-4 border-red-500 p-6 rounded-xl mb-10 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-start gap-4">
                            <div className="shrink-0 bg-red-100 p-2 rounded-full">
                                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-red-900 leading-none mb-2">{t('bookings.warningTitle')}</h3>
                                <p className="text-red-700 font-bold leading-relaxed">
                                    {t('bookings.warningDesc', { count: user.late_cancellation_count })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mx-0 bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-xl mb-10 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm">
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
                                <BsCalendar2Week className="w-12 h-12 text-slate-400" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-medium text-slate-900 dark:text-white mb-3 relative z-10">{t('bookings.noViewingsYet')}</h3>
                            <p className="text-slate-500 dark:text-gray-400 mb-10 max-w-sm text-center font-medium leading-relaxed relative z-10 px-4">
                                {filter === 'all'
                                    ? t('bookings.emptyAll')
                                    : t('bookings.emptyStatus', { status: filter === 'pending' ? t('listing.requested') : t(`listing.${filter}`, filter) })}
                            </p>
                            <Button
                                variant="ghost"
                                className="!p-0 !bg-transparent !border-none !shadow-none !text-slate-600 hover:!text-primary-600 font-semibold transition-all duration-300 group inline-flex items-center !outline-none !ring-0 !ring-offset-0 w-auto"
                                onClick={() => window.location.href = '/listings'}
                            >
                                <span className="text-base sm:text-lg font-bold text-slate-700 dark:text-gray-300 group-hover:dark:text-white">{t('bookings.exploreListings')}</span>
                                <ArrowRightIcon className="w-5 sm:w-6 h-5 sm:h-6 ml-2 sm:ml-3 text-slate-500 transition-transform duration-300 group-hover:translate-x-3" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-6 items-start">
                            {filteredAppointments.map((appointment) => {
                                const date = new Date(appointment.preferred_date);
                                const isPast = date < new Date();

                                return (
                                    <div
                                        key={appointment.id}
                                        className={`w-full md:flex-[0_0_calc((100%-3rem)/3)] min-w-0 flex flex-col group bg-white dark:bg-dashboard-card border border-slate-200/70 dark:border-white/10 transition-all duration-300 overflow-hidden rounded-[23px] animate-fill-med relative ${isPast ? 'opacity-85' : ''}`}
                                    >
                                        <div className="flex-1 flex flex-col px-5 pt-5 pb-4">
                                            {/* Status pill + ID */}
                                            <div className="flex items-center justify-between gap-3 mb-3">
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
                                                    {appointment.status === 'pending' ? t('listing.requested') : t(`listing.${appointment.status}`, appointment.status)}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-400 tabular-nums truncate">
                                                    {appointment.id.slice(0, 8).toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-[15px] font-bold md:text-[17px] md:font-semibold text-slate-800 dark:text-white leading-snug line-clamp-2 mb-4">
                                                {appointment.listing?.title || 'Unknown Property'}
                                            </h3>

                                            {/* Date Section - NEW DESIGN */}
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter leading-none">
                                                        {date.getDate()}
                                                    </span>
                                                    <div className="flex flex-col -gap-0.5">
                                                        <span className="text-[13px] font-black uppercase tracking-wider text-slate-400 leading-tight">
                                                            {date.toLocaleDateString(i18n.language || 'en', { month: 'short' })}
                                                        </span>
                                                        <span className="text-[12px] font-bold text-slate-900 dark:text-gray-300 leading-tight">
                                                            {date.getFullYear()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-px h-10 bg-slate-100 dark:bg-white/10" />
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{t('bookingFlow.time')}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <ClockIcon className="w-4 h-4 text-slate-400" />
                                                        <span className="text-[15px] font-bold text-slate-800 dark:text-white">{appointment.preferred_time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-5 pb-5 pt-0 flex justify-end items-center gap-2 mt-auto">
                                            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCancellationModal({ open: true, appointmentId: appointment.id, reason: '', submitting: false });
                                                    }}
                                                    className="h-[44px] px-5 rounded-full text-[13px] font-semibold
                                                        bg-rose-50 dark:bg-rose-500/10
                                                        border border-transparent
                                                        text-rose-600 dark:text-rose-400
                                                        hover:bg-rose-100 dark:hover:bg-rose-500/20
                                                        hover:shadow-md hover:-translate-y-[1px]
                                                        transition-all duration-300 ease-out active:scale-[0.98]"
                                                >
                                                    {t('bookings.cancel')}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => navigate(`/listings/${appointment.listing_id}?bookingId=${appointment.id}`)}
                                                className="h-[44px] px-5 rounded-full text-[13px] font-semibold
                                                    bg-[#222222] dark:bg-white
                                                    border border-[#222222] dark:border-white
                                                    text-white dark:text-dashboard-dark
                                                    hover:bg-black dark:hover:bg-gray-100
                                                    hover:border-black dark:hover:border-gray-100
                                                    hover:shadow-md hover:-translate-y-[1px]
                                                    transition-all duration-300 ease-out active:scale-[0.98]
                                                    flex items-center gap-2 group/btn"
                                            >
                                                {t('bookings.viewDetails')}
                                                <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Cancellation Reason Modal - Mobile Bottom Sheet Style (Matches Contact Modal Animation) */}
        {createPortal(
            <div className={`fixed inset-0 z-[300] transition-all duration-500 ${cancellationModal.open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                {/* Backdrop */}
                <div 
                    className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500 ${cancellationModal.open ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => !cancellationModal.submitting && setCancellationModal({ open: false, appointmentId: null, reason: '', submitting: false })}
                />
                
                {/* Modal Content - Sliding from Bottom */}
                <div className={`absolute bottom-0 left-0 right-0 sm:left-1/2 sm:right-auto sm:top-1/2 sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 w-full max-w-lg bg-white dark:bg-dashboard-card rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl transition-all duration-[600ms] cubic-bezier(0.32,0.72,0,1) will-change-transform
                    ${cancellationModal.open ? 'translate-y-0 opacity-100' : 'translate-y-full sm:translate-y-[120%] opacity-0'}`}>
                    
                    {/* Close Button - Desktop Only */}
                    <button 
                        onClick={() => !cancellationModal.submitting && setCancellationModal({ open: false, appointmentId: null, reason: '', submitting: false })}
                        className="absolute top-6 right-6 p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 hidden sm:flex items-center justify-center group"
                    >
                        <XMarkIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                    
                    {/* Handle for mobile */}
                    <div className="flex justify-center pt-4 pb-2 sm:hidden">
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full" />
                    </div>
                    <div className="px-8 pt-6 sm:pt-10 pb-10">
                        <h3 className="text-[26px] sm:text-[22px] font-black text-slate-900 dark:text-white mb-2 leading-tight">{t('bookings.cancelTitle')}</h3>
                        <p className="text-[17px] sm:text-[15px] text-slate-500 dark:text-gray-400 font-medium mb-8 leading-relaxed max-w-[90%] sm:max-w-full">
                            {t('bookings.cancelDesc')}
                        </p>
 
                        <div className="space-y-6">
                            <div className="relative">
                                <label className="block text-[15px] sm:text-[14px] font-bold text-slate-600 dark:text-gray-300 mb-3 ml-1">
                                    {t('bookings.reasonLabel')}
                                </label>
                                <textarea
                                    autoFocus={cancellationModal.open}
                                    value={cancellationModal.reason}
                                    onChange={(e) => setCancellationModal(prev => ({ ...prev, reason: e.target.value }))}
                                    placeholder={t('bookings.reasonPlaceholder')}
                                    rows={4}
                                    className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-[24px] px-6 py-5 text-[16px] sm:text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500/20 transition-all resize-none font-medium"
                                />
                            </div>

                            <div className="flex flex-row gap-3 pt-2">
                                <button
                                    disabled={cancellationModal.submitting}
                                    onClick={() => setCancellationModal({ open: false, appointmentId: null, reason: '', submitting: false })}
                                    className="flex-1 h-[44px] flex items-center justify-center gap-2 px-5 rounded-full bg-white dark:bg-dashboard-card border border-gray-200 dark:border-white/10 text-[#222222] dark:text-white font-bold text-[13px] hover:border-[#222222] dark:hover:border-white/40 hover:shadow-md hover:-translate-y-[1px] transition-all duration-300 active:scale-[0.98] group/btn whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                >
                                    {t('bookings.goBack')}
                                </button>
                                <button
                                    disabled={!cancellationModal.reason.trim() || cancellationModal.submitting}
                                    onClick={handleCancelSubmit}
                                    className={`flex-1 h-[44px] flex items-center justify-center gap-2 px-5 rounded-full font-bold text-[13px] transition-all duration-300 active:scale-[0.98] whitespace-nowrap border
                                        ${!cancellationModal.reason.trim() || cancellationModal.submitting
                                            ? 'bg-gray-100 dark:bg-white/10 border-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            : 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700 hover:border-rose-700 hover:shadow-md hover:shadow-rose-600/20 hover:-translate-y-[1px]'
                                        }`}
                                >
                                    {cancellationModal.submitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        t('bookings.confirmCancellation')
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        )}
        </>
    );
};

export default MyBookings;
