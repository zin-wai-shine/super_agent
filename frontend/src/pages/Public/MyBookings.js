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
    FunnelIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const MyBookings = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await appointmentApi.getMyAppointments();
            setAppointments(response.data.appointments || []);
        } catch (err) {
            console.error('Failed to fetch appointments:', err);
            setError('Failed to load your bookings. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const filteredAppointments = appointments.filter(app => {
        if (filter === 'all') return true;
        return app.status === filter;
    });

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-6 lg:px-12 max-w-[1440px] mx-auto">
                <div className="animate-pulse space-y-10">
                    <div className="flex flex-col gap-4">
                        <div className="h-10 bg-gray-200 rounded-[3px] w-48"></div>
                        <div className="h-4 bg-gray-200 rounded-[3px] w-64"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-[420px] bg-gray-100 rounded-[3px] border border-gray-200/50"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 bg-white">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                {/* Modern Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                    <div className="relative">
                        <div className="absolute -left-4 top-0 w-1 h-12 bg-primary-600 rounded-full hidden lg:block"></div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                            My <span className="text-primary-600">Bookings</span>
                        </h1>
                        <p className="text-slate-500 mt-2 font-semibold text-lg max-w-md">
                            Your journey to finding the perfect home starts here.
                        </p>
                    </div>

                    {/* Filter Dropdown - Standardized StyledSelect */}
                    <div className="w-full lg:w-64">
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
                </div>

                {user?.late_cancellation_count >= 3 && (
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

                {filteredAppointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 group">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredAppointments.map((appointment) => {
                            const date = new Date(appointment.preferred_date);
                            const isPast = date < new Date();

                            return (
                                <Link
                                    key={appointment.id}
                                    to={`/listings/${appointment.listing_id}?bookingId=${appointment.id}`}
                                    className={`group block bg-white rounded-[var(--btn-radius)] border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-primary-600/5 hover:border-primary-500/50 transition-all duration-300 p-6 md:p-8 ${isPast ? 'opacity-90 grayscale-[0.2]' : ''}`}
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        {/* Column 1: Property & Status */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-2 py-0.5 rounded-[2px] border border-slate-100">
                                                    ID: {appointment.id.slice(0, 8).toUpperCase()}
                                                </span>
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${appointment.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    appointment.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                        'bg-amber-50 text-amber-600 border border-amber-100'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${appointment.status === 'confirmed' ? 'bg-emerald-500' :
                                                        appointment.status === 'cancelled' ? 'bg-rose-500' :
                                                            'bg-amber-500'
                                                        }`}></div>
                                                    {appointment.status}
                                                </div>
                                            </div>

                                            <div className="mb-2">
                                                <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-primary-600 transition-colors line-clamp-2">
                                                    {appointment.listing?.title || 'Unknown Property'}
                                                </h3>
                                            </div>

                                            <div className="flex items-center text-slate-500 font-bold text-sm">
                                                <MapPinIcon className="w-4 h-4 mr-2 text-primary-500/70" />
                                                <span className="truncate">{appointment.listing?.district || 'Location unavailable'}</span>
                                            </div>
                                        </div>

                                        {/* Column 2: Date, Time */}
                                        <div className="flex flex-col justify-center md:text-right md:items-end gap-6 md:min-w-[180px]">
                                            <div className="flex md:flex-col gap-6 md:gap-3">
                                                <div className="flex flex-col md:items-end">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Date</div>
                                                    <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                                                        <CalendarIcon className="w-4 h-4 text-slate-400 md:hidden" />
                                                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col md:items-end">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Time</div>
                                                    <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                                                        <ClockIcon className="w-4 h-4 text-slate-400 md:hidden" />
                                                        {appointment.preferred_time}
                                                    </div>
                                                </div>
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
    );
};

export default MyBookings;
