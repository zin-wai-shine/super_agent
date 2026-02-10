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
    MagnifyingGlassIcon
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

    const getStatusStyle = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10';
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10';
            case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/10';
            case 'completed': return 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/10';
            default: return 'bg-gray-50 text-gray-700 border-gray-100 ring-gray-500/10';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed': return <CheckCircleIcon className="w-3.5 h-3.5 stroke-[2.5]" />;
            case 'cancelled': return <XCircleIcon className="w-3.5 h-3.5 stroke-[2.5]" />;
            default: return <ClockIcon className="w-3.5 h-3.5 stroke-[2.5]" />;
        }
    };

    const filteredAppointments = appointments.filter(app => {
        if (filter === 'all') return true;
        return app.status === filter;
    });

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-gray-100 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
            <div className="max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Access Bookings</h1>
                        <p className="text-gray-500 mt-2 font-medium">Manage your upcoming property viewings</p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm self-start md:self-auto overflow-x-auto max-w-full">
                        {['all', 'pending', 'confirmed', 'cancelled'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-4 py-1.5 rounded-[4px] text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filter === tab
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                        <XCircleIcon className="w-5 h-5" /> {error}
                    </div>
                )}

                {filteredAppointments.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100/50">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-gray-50/50">
                            <CalendarIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            {filter === 'all'
                                ? "You haven't scheduled any property viewings yet. Browse our listings to find your dream home."
                                : `You don't have any ${filter} bookings.`}
                        </p>
                        <Link
                            to="/listings"
                            className="inline-flex items-center justify-center px-8 py-3 bg-primary-600 text-white font-bold rounded-[3px] shadow-lg shadow-primary-200/50 hover:bg-primary-700 hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Find a Property <ArrowRightIcon className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filteredAppointments.map((appointment) => {
                            const date = new Date(appointment.preferred_date);
                            const isPast = date < new Date();

                            return (
                                <div
                                    key={appointment.id}
                                    className={`group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all duration-300 relative ${isPast ? 'opacity-75 grayscale-[0.5]' : ''}`}
                                >
                                    <div className="flex flex-col md:flex-row">
                                        {/* Date Section - Left Side Accent */}
                                        <div className="md:w-32 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 p-6 flex flex-row md:flex-col items-center justify-center md:justify-center gap-3 text-center shrink-0">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-primary-600 uppercase tracking-widest leading-none mb-1">
                                                    {date.toLocaleDateString('en-US', { month: 'short' })}
                                                </span>
                                                <span className="text-4xl font-black text-gray-900 leading-none tracking-tight">
                                                    {date.getDate()}
                                                </span>
                                                <span className="text-xs font-medium text-gray-400 mt-1">
                                                    {date.getFullYear()}
                                                </span>
                                            </div>
                                            <div className="visible md:hidden w-px h-8 bg-gray-200 mx-2"></div>
                                            <div className="bg-white px-3 py-1 rounded-[3px] border border-gray-200 text-sm font-bold text-gray-700 shadow-sm md:mt-2">
                                                {appointment.preferred_time}
                                            </div>
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[10px] font-black uppercase tracking-wider border ring-1 ring-inset ${getStatusStyle(appointment.status)}`}>
                                                            {getStatusIcon(appointment.status)}
                                                            {appointment.status}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                                            #{appointment.id.slice(0, 6)}
                                                        </span>
                                                    </div>

                                                    <Link to={`/listings/${appointment.listing_id}`} className="group-hover:text-primary-600 transition-colors block">
                                                        <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
                                                            {appointment.listing?.title || 'Unknown Property'}
                                                        </h3>
                                                    </Link>

                                                    <div className="flex items-center text-gray-500 font-medium">
                                                        <MapPinIcon className="w-4 h-4 mr-1.5 text-gray-400 shrink-0" />
                                                        <span className="truncate">{appointment.listing?.district || 'Location unavailable'}</span>
                                                    </div>
                                                </div>

                                                <div className="flex md:flex-col gap-3 shrink-0">
                                                    <Link
                                                        to={`/listings/${appointment.listing_id}`}
                                                        className="px-5 py-2.5 bg-white text-gray-700 text-xs font-bold uppercase tracking-wide border border-gray-200 rounded-[3px] hover:bg-gray-50 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm text-center min-w-[120px]"
                                                    >
                                                        View Listing
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* Footer Details */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-5 border-t border-gray-100/50 mt-auto">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                                        {appointment.purpose === 'rent'
                                                            ? <HomeIcon className="w-4 h-4 text-indigo-600" />
                                                            : <BuildingOfficeIcon className="w-4 h-4 text-indigo-600" />
                                                        }
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Type</div>
                                                        <div className="text-sm font-bold text-gray-700 capitalize">
                                                            {appointment.purpose}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3 col-span-2 sm:col-span-1">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                                        <ClockIcon className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Created</div>
                                                        <div className="text-sm font-bold text-gray-700">
                                                            {new Date(appointment.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
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
