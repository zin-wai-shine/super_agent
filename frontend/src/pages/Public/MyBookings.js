import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import StyledSelect from '../../components/Form/StyledSelect';
import Button from '../../components/ui/Button';
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
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const [skeletonCount, setSkeletonCount] = useState(1);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            setInitialLoading(true);
            setIsExiting(false);
            setSkeletonCount(1);

            // Sequential skeleton increase (1 to 4)
            const skeletonInterval = setInterval(() => {
                setSkeletonCount(prev => {
                    if (prev >= 4) {
                        clearInterval(skeletonInterval);
                        return 4;
                    }
                    return prev + 1;
                });
            }, 200);

            // Promise.all to ensure minimum visibility of the loading state
            const [response] = await Promise.all([
                appointmentApi.getMyAppointments(),
                new Promise(resolve => setTimeout(resolve, 1500))
            ]);

            clearInterval(skeletonInterval);
            setSkeletonCount(4);

            // Trigger exit animation
            setIsExiting(true);
            // Wait for animation duration
            await new Promise(resolve => setTimeout(resolve, 900));

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
        <div className="min-h-screen pt-24 pb-20 bg-white">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                {/* Modern Header Section */}
                <div className="flex flex-col items-center text-center gap-8 mb-16 relative z-20">
                    <div>
                        <h1 className="text-4xl font-medium text-slate-900 tracking-tight leading-tight">
                            My Bookings
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium text-lg max-w-md mx-auto">
                            Your journey to finding the perfect home starts here.
                        </p>
                    </div>

                    {/* Filter Dropdown - Standardized StyledSelect */}
                    {!initialLoading && (
                        <div className="w-full max-w-xs animate-fadeInUp">
                            <StyledSelect
                                options={[
                                    { value: 'all', label: 'All Bookings' },
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'confirmed', label: 'Confirmed' },
                                    { value: 'cancelled', label: 'Cancelled' }
                                ]}
                                value={filter}
                                onChange={setFilter}
                                isSearchable={false}
                                placeholder="Filter by status"
                            />
                        </div>
                    )}
                </div>

                {user?.late_cancellation_count >= 3 && !initialLoading && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-[3px] mb-10 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
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
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-[3px] mb-10 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm">
                        <XCircleIcon className="w-6 h-6 shrink-0" />
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                {/* Content Area */}
                <div className="relative min-h-[400px]">
                    {initialLoading ? (
                        /* Skeletons — same layout as cards: 3 per row on md+ */
                        <div className="flex flex-wrap gap-6 items-start pointer-events-none">
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
                        <div className="flex flex-col items-center justify-center py-24 group animate-fadeInUp">
                            <div className="mb-6 relative z-10 transition-transform duration-500">
                                <CalendarIcon className="w-14 h-14 text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3 relative z-10">No bookings yet</h3>
                            <p className="text-slate-500 mb-10 max-w-sm text-center font-medium leading-relaxed relative z-10">
                                {filter === 'all'
                                    ? "Excited to find your new home? Your scheduled viewings will appear right here."
                                    : `You don't have any ${filter} bookings at the moment.`}
                            </p>
                            <Button
                                variant="ghost"
                                className="!p-0 !bg-transparent !border-none !shadow-none !text-slate-600 hover:!text-primary-600 !font-black transition-all duration-300 group inline-flex items-center !outline-none !ring-0 !ring-offset-0 w-auto"
                                onClick={() => window.location.href = '/listings'}
                            >
                                <span className="text-lg">Explore Listings</span>
                                <ArrowRightIcon className="w-6 h-6 ml-3 transition-transform duration-300 group-hover:translate-x-3" />
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
                                        className={`w-full md:flex-[0_0_calc((100%-3rem)/3)] min-w-0 flex flex-col group bg-white border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-primary-600/5 hover:border-primary-500/30 transition-all duration-300 overflow-hidden rounded-[24px] animate-fadeInUp ${isPast ? 'opacity-90 grayscale-[0.2]' : ''}`}
                                    >
                                        {/* Top Section */}
                                        <div className="p-5 md:p-6 pb-6 bg-white flex-1 relative">
                                            {/* Status & ID */}
                                            <div className="flex items-center justify-between mb-5">
                                                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-[0.05em] uppercase bg-slate-100/80 px-2.5 py-1.5 rounded-[4px]">
                                                    ID: {appointment.id.slice(0, 8).toUpperCase()}
                                                </span>
                                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${appointment.status === 'confirmed' ? 'bg-emerald-50/80 text-emerald-600' :
                                                    appointment.status === 'completed' ? 'bg-amber-100/80 text-amber-700' :
                                                        appointment.status === 'cancelled' ? 'bg-rose-50/80 text-rose-600' :
                                                            'bg-amber-50/80 text-amber-600'
                                                    }`}>
                                                    <div className={`w-[5px] h-[5px] rounded-full ${appointment.status === 'confirmed' ? 'bg-emerald-500' :
                                                        appointment.status === 'completed' ? 'bg-amber-500' :
                                                            appointment.status === 'cancelled' ? 'bg-rose-500' :
                                                                'bg-amber-500'
                                                        }`}></div>
                                                    {appointment.status}
                                                </div>
                                            </div>

                                            {/* Title — smaller and less bold at lg */}
                                            <div className="mb-2.5">
                                                <h3 className="text-base md:text-xl lg:text-[16px] font-bold text-[#1e293b] leading-tight group-hover:text-primary-600 transition-colors line-clamp-2">
                                                    {appointment.listing?.title || 'Unknown Property'}
                                                </h3>
                                            </div>

                                            {/* Location */}
                                            <div className="flex items-center text-slate-500 font-semibold text-[13px] md:text-sm">
                                                <MapPinIcon className="w-[18px] h-[18px] mr-1.5 text-slate-400" />
                                                <span className="truncate">{appointment.listing?.district || 'Location unavailable'}</span>
                                            </div>
                                        </div>

                                        {/* Bottom Section */}
                                        <div className="p-4 md:p-6 bg-[#f8fafc] border-t border-slate-200/60 flex items-center justify-between mt-auto">
                                            <div className="flex flex-col">
                                                <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Date</div>
                                                <div className="text-[13px] md:text-[15px] lg:text-[13px] font-bold lg:font-semibold text-[#0f172a]">
                                                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Time</div>
                                                <div className="text-[13px] md:text-[15px] lg:text-[13px] font-bold lg:font-semibold text-[#0f172a]">
                                                    {appointment.preferred_time}
                                                </div>
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
