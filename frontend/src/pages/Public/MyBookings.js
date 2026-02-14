import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
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
            <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#f8fafc]">
            <div className="max-w-7xl mx-auto">
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

                    {/* Filter Tabs - Premium Pill (Now Sharp per Site Radius) */}
                    <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-[3px] border border-slate-200/60 shadow-sm self-start lg:self-auto overflow-x-auto max-w-full no-scrollbar">
                        {[
                            { id: 'all', label: 'All', icon: FunnelIcon },
                            { id: 'pending', label: 'Pending', icon: ClockIcon },
                            { id: 'confirmed', label: 'Confirmed', icon: CheckCircleIcon },
                            { id: 'cancelled', label: 'Cancelled', icon: XCircleIcon }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id)}
                                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-[2px] text-sm font-black transition-all duration-500 whitespace-nowrap ${filter === tab.id
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20 scale-[1.02]'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                                    }`}
                            >
                                <tab.icon className={`w-4 h-4 ${filter === tab.id ? 'text-white' : 'text-slate-400'}`} />
                                {tab.label}
                            </button>
                        ))}
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
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3px] border border-slate-200/60 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-30 -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-50 rounded-full blur-3xl opacity-30 -ml-32 -mb-32"></div>

                        <div className="w-24 h-24 bg-primary-50 rounded-[3px] flex items-center justify-center mb-8 relative z-10 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <CalendarIcon className="w-12 h-12 text-primary-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3 relative z-10">No bookings yet</h3>
                        <p className="text-slate-500 mb-10 max-w-sm text-center font-medium leading-relaxed relative z-10">
                            {filter === 'all'
                                ? "Excited to find your new home? Your scheduled viewings will appear right here."
                                : `You don't have any ${filter} bookings at the moment.`}
                        </p>
                        <Link
                            to="/listings"
                            className="inline-flex items-center justify-center px-10 py-4 bg-slate-900 text-white font-bold rounded-[3px] shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-1 active:scale-95 transition-all duration-300 relative z-10"
                        >
                            Explore Listings <ArrowRightIcon className="w-5 h-5 ml-2.5" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAppointments.map((appointment) => {
                            const date = new Date(appointment.appointment_date);
                            const isPast = date < new Date();
                            const propertyImage = appointment.listing?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';

                            return (
                                <div
                                    key={appointment.id}
                                    className={`group bg-white rounded-[3px] border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-primary-600/5 hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col ${isPast ? 'opacity-90' : ''}`}
                                >
                                    {/* Image & Status Area */}
                                    <div className="relative h-48 sm:h-56 shrink-0 overflow-hidden">
                                        <img
                                            src={propertyImage}
                                            alt={appointment.listing?.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                        {/* Glassmorphic Status Badge */}
                                        <div className="absolute top-4 left-4">
                                            <div className={`backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/20 text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-sm ${appointment.status === 'confirmed' ? 'bg-emerald-500/80 text-white' :
                                                appointment.status === 'cancelled' ? 'bg-rose-500/80 text-white' :
                                                    'bg-amber-500/80 text-white'
                                                }`}>
                                                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                                {appointment.status}
                                            </div>
                                        </div>

                                        {/* Date Tag */}
                                        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-[3px] p-2.5 flex items-center gap-3 border border-white/20 shadow-lg">
                                            <div className="bg-primary-50 w-10 h-10 rounded-[3px] flex flex-col items-center justify-center shrink-0">
                                                <span className="text-[10px] font-black text-primary-600 leading-none mb-0.5 uppercase">
                                                    {date.toLocaleDateString('en-US', { month: 'short' })}
                                                </span>
                                                <span className="text-base font-black text-slate-900 leading-none">
                                                    {date.getDate()}
                                                </span>
                                            </div>
                                            <div className="pr-2">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Time Slots</div>
                                                <div className="text-sm font-black text-slate-800 leading-none">{appointment.preferred_time}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-7 flex flex-col flex-1">
                                        <div className="mb-6 flex-1">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-1.5 h-4 bg-primary-600 rounded-full"></div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Booking ID: #{appointment.id.slice(0, 8).toUpperCase()}</span>
                                            </div>

                                            <Link to={`/listings/${appointment.listing_id}`} className="block">
                                                <h3 className="text-xl font-black text-slate-900 mb-2 leading-snug hover:text-primary-600 transition-colors line-clamp-2">
                                                    {appointment.listing?.title || 'Unknown Property'}
                                                </h3>
                                            </Link>

                                            <div className="flex items-center text-slate-500 font-bold text-sm">
                                                <MapPinIcon className="w-4 h-4 mr-2 text-primary-500/70" />
                                                <span className="truncate">{appointment.listing?.district || 'Location unavailable'}</span>
                                            </div>
                                        </div>

                                        {/* Action Area */}
                                        <div className="pt-6 border-t border-slate-100 mt-auto flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-[3px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                                    {appointment.purpose === 'rent' ? <HomeIcon className="w-5 h-5" /> : <BuildingOfficeIcon className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Booking Type</div>
                                                    <div className="text-xs font-black text-slate-700 capitalize">{appointment.purpose}</div>
                                                </div>
                                            </div>

                                            <Link
                                                to={`/listings/${appointment.listing_id}`}
                                                className="w-12 h-12 bg-slate-900 text-white rounded-[3px] flex items-center justify-center shadow-lg shadow-slate-900/10 hover:bg-primary-600 hover:shadow-primary-600/20 active:scale-90 transition-all duration-300"
                                            >
                                                <ArrowRightIcon className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
