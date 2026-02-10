import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi, appointmentApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { getMediaUrl } from '../../utils/media';
import {
    CheckCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    MapPinIcon,
    PhoneIcon,
    ClockIcon,
    CalendarIcon,
    UserIcon,
    StarIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/solid';
import {
    HomeIcon,
    BuildingOfficeIcon,
} from '@heroicons/react/24/outline'; // Outline for generic icons

const BookAppointment = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [bookedAppointment, setBookedAppointment] = useState(null);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        preferred_date: '',
        preferred_time: '',
        purpose: 'rent', // Will be updated based on listing type
        message: '',
    });

    const [calendarMonth, setCalendarMonth] = useState(new Date());

    // --- Helper Logic for Calendar ---
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
        return { days, firstDay };
    };

    const generateCalendarGrid = () => {
        const { days, firstDay } = getDaysInMonth(calendarMonth);
        const grid = [];
        let dayCounter = 1;

        // Empty cells for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            grid.push(null);
        }

        // Days of the month
        for (let i = 1; i <= days; i++) {
            grid.push(i);
        }
        return grid;
    };

    const handleDateSelect = (day) => {
        if (!day) return;
        const selectedDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
        // Clean date formatting
        const offset = selectedDate.getTimezoneOffset();
        const adjustedDate = new Date(selectedDate.getTime() - (offset * 60 * 1000));
        const formatted = adjustedDate.toISOString().split('T')[0];
        setForm(prev => ({ ...prev, preferred_date: formatted }));
    };

    const changeMonth = (offset) => {
        const newDate = new Date(calendarMonth.setMonth(calendarMonth.getMonth() + offset));
        setCalendarMonth(new Date(newDate));
    };

    // --- Data Fetching ---
    useEffect(() => {
        const fetchListing = async () => {
            try {
                const params = {};
                if (window.location.hostname.includes('localhost') && user?.agent_id) {
                    params.agent_id = user.agent_id;
                }
                const response = await publicApi.getListing(id, params);
                const listingData = response.data;
                setListing(listingData);

                // Pre-select purpose based on listing type
                if (listingData.listing_type === 'rent') {
                    setForm(prev => ({ ...prev, purpose: 'rent' }));
                } else if (listingData.listing_type === 'sale') {
                    setForm(prev => ({ ...prev, purpose: 'buy' }));
                }
            } catch (error) {
                console.error('Failed to fetch listing:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id, user]);

    // --- Time Slots ---
    const morningSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
    const afternoonSlots = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

    // --- Validation ---
    const validateForm = () => {
        const newErrors = {};
        if (!form.full_name.trim()) newErrors.full_name = 'Required';
        if (!form.email.trim()) newErrors.email = 'Required';
        if (!form.phone.trim()) newErrors.phone = 'Required';
        if (!form.preferred_date) newErrors.preferred_date = 'Required';
        if (!form.preferred_time) newErrors.preferred_time = 'Required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const response = await appointmentApi.createAppointment({
                listing_id: id,
                ...form,
            });
            setBookedAppointment(response.data.appointment);
            setSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            setErrors({ submit: error.response?.data?.error || 'Failed to book' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    if (!listing) return <div className="p-10 text-center">Listing not found</div>;

    const monthYear = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // --- Success View ---
    if (success && bookedAppointment) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircleIcon className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h2>
                    <p className="text-gray-500 mb-8">We've sent the details to {form.email}</p>
                    <Link to="/listings" className="block w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition">Return to Listings</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto">
                {/* Back Link */}
                <div className="mb-6">
                    <Link to={`/listings/${id}`} className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors group">
                        <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Property
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* LEFT COLUMN: Main Booking Flow */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. Purpose Selector (Minimal Design) */}
                        {/* Logic: If 'both', show a sleek segmented control. If single, show a clean badge/header combo. */}
                        {listing.listing_type === 'both' ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">I want to</h3>
                                <div className="bg-gray-100 p-1.5 rounded-xl flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, purpose: 'rent' }))}
                                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${form.purpose === 'rent' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <HomeIcon className="w-4 h-4" />
                                        For Rent
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, purpose: 'buy' }))}
                                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${form.purpose === 'buy' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <BuildingOfficeIcon className="w-4 h-4" />
                                        For Buy
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Single Option State (Rent only or Buy only)
                            <div className="flex items-center gap-3 mb-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${listing.listing_type === 'rent' ? 'bg-primary-50 text-primary-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {listing.listing_type === 'rent' ? <HomeIcon className="w-5 h-5" /> : <BuildingOfficeIcon className="w-5 h-5" />}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Viewing Type</div>
                                    <div className="font-bold text-gray-900 text-sm">
                                        {listing.listing_type === 'rent' ? 'Property for Rent' : 'Property for Sale'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Date & Time Selection */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Select Date & Time</h3>

                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Calendar Side */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronDownIcon className="w-5 h-5 rotate-90 text-gray-400" /></button>
                                        <h3 className="font-bold text-gray-800 uppercase tracking-widest text-sm">
                                            {monthYear}
                                        </h3>
                                        <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronDownIcon className="w-5 h-5 -rotate-90 text-gray-400" /></button>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                            <div key={i} className="text-xs font-bold text-gray-400 py-1">{d}</div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-1">
                                        {generateCalendarGrid().map((day, i) => {
                                            if (!day) return <div key={i} className="" />;

                                            const isSelected = form.preferred_date &&
                                                new Date(form.preferred_date).getDate() === day &&
                                                new Date(form.preferred_date).getMonth() === calendarMonth.getMonth() &&
                                                new Date(form.preferred_date).getFullYear() === calendarMonth.getFullYear();

                                            const isPast = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day) < new Date(new Date().setHours(0, 0, 0, 0));

                                            return (
                                                <button
                                                    key={i}
                                                    disabled={isPast}
                                                    onClick={() => handleDateSelect(day)}
                                                    className={`
                                                        w-10 h-10 mx-auto rounded-full text-sm font-semibold flex items-center justify-center transition-all
                                                        ${isSelected
                                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 scale-105'
                                                            : isPast
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'}
                                                    `}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.preferred_date && <p className="text-red-500 text-xs mt-2 text-center font-bold">Please select a date</p>}
                                </div>

                                {/* Divider */}
                                <div className="hidden md:block w-px bg-gray-100 min-h-full"></div>

                                {/* Time Slots Side */}
                                <div className="flex-1">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Morning</h4>
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        {morningSlots.map(time => (
                                            <button
                                                key={time}
                                                onClick={() => setForm(prev => ({ ...prev, preferred_time: time }))}
                                                className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-all ${form.preferred_time === time ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-100' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'}`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>

                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Afternoon</h4>
                                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {afternoonSlots.map(time => (
                                            <button
                                                key={time}
                                                onClick={() => setForm(prev => ({ ...prev, preferred_time: time }))}
                                                className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-all ${form.preferred_time === time ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-100' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'}`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.preferred_time && <p className="text-red-500 text-xs mt-2 text-center font-bold">Please select a time</p>}

                                </div>
                            </div>
                        </div>

                        {/* 3. User Details Form */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Your Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={form.full_name}
                                        onChange={e => setForm({ ...form, full_name: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 border transition-all font-semibold text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-0 ${errors.full_name ? 'border-red-300 bg-red-50' : 'border-transparent focus:border-primary-300'}`}
                                        placeholder="John Doe"
                                        autoComplete="name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                            className={`w-full px-4 py-3 rounded-xl bg-gray-50 border transition-all font-semibold text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-0 ${errors.phone ? 'border-red-300 bg-red-50' : 'border-transparent focus:border-primary-300'}`}
                                            placeholder="+66..."
                                            autoComplete="tel"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            className={`w-full px-4 py-3 rounded-xl bg-gray-50 border transition-all font-semibold text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-0 ${errors.email ? 'border-red-300 bg-red-50' : 'border-transparent focus:border-primary-300'}`}
                                            placeholder="john@example.com"
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message (Optional)</label>
                                    <textarea
                                        rows={3}
                                        value={form.message}
                                        onChange={e => setForm({ ...form, message: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary-300 focus:ring-0 transition-all font-semibold text-gray-800 placeholder-gray-400"
                                        placeholder="Any special requests?"
                                    />
                                </div>
                            </div>

                            {errors.submit && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center mt-4">
                                    <span className="mr-2">⚠️</span> {errors.submit}
                                </div>
                            )}

                            <div className="mt-8">
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-primary-200 hover:bg-primary-700 hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Scheduling...' : 'Confirm Appointment'}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Info Sidebars */}
                    <div className="lg:col-span-1 space-y-6 sticky top-6">

                        {/* 1. Property Info Card */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200 border border-gray-100 overflow-hidden">
                            <div className="h-40 bg-gray-100 relative group">
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url('/map-placeholder.png')` }}
                                />
                                <div className="absolute inset-0 bg-primary-50/50 flex items-center justify-center">
                                    <MapPinIcon className="w-10 h-10 text-primary-600 drop-shadow-md" />
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h2 className="font-bold text-lg text-gray-900 leading-tight mb-1">{listing.district}</h2>
                                        <p className="text-gray-500 text-sm">{listing.province}</p>
                                    </div>
                                    <div className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1">
                                        <StarIcon className="w-3 h-3" />
                                        4.9
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                                    {listing.title}
                                </p>

                                <div className="flex items-center text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded w-fit">
                                    ID: {listing.id?.slice(0, 8).toUpperCase()}
                                </div>
                            </div>
                        </div>

                        {/* 2. Real-time Selection Summary (REDESIGNED) */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200 border border-gray-100 overflow-hidden relative">
                            {/* Header Gradient */}
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 pb-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
                                <h3 className="font-bold text-sm tracking-widest uppercase relative z-10 opacity-90">Summary</h3>
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                        <CalendarIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-xs opacity-70 mb-0.5">Selected Date</div>
                                        <div className="font-bold text-lg leading-tight">
                                            {form.preferred_date
                                                ? new Date(form.preferred_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                                                : <span className="opacity-50 text-sm font-normal">No date selected</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 pt-0 -mt-4 bg-white rounded-t-3xl relative z-10">
                                <div className="pt-6 space-y-6">
                                    <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                                                <ClockIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Time</div>
                                                <div className={`font-bold ${form.preferred_time ? 'text-gray-900' : 'text-gray-400 italic font-normal text-sm'}`}>
                                                    {form.preferred_time || 'No time selected'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                {form.purpose === 'rent' ? <HomeIcon className="w-5 h-5" /> : <BuildingOfficeIcon className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Purpose</div>
                                                <div className="font-bold text-gray-900">
                                                    {form.purpose === 'rent' ? 'For Rent' : 'For Buy'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                                    {(!form.preferred_date || !form.preferred_time) ? (
                                        <div className="text-xs text-center text-gray-400 font-medium bg-gray-50 py-2 rounded-lg">
                                            Please select date & time to continue
                                        </div>
                                    ) : (
                                        <div className="text-xs text-center text-emerald-600 font-bold bg-emerald-50 py-2 rounded-lg flex items-center justify-center gap-2">
                                            <CheckCircleIcon className="w-4 h-4" />
                                            Ready to schedule
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default BookAppointment;
