import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi, appointmentApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { getMediaUrl } from '../../utils/media';
import {
    CheckCircleIcon as SolidCheckCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    MapPinIcon,
    PhoneIcon,
    ClockIcon,
    StarIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/solid';
import { BsCalendar2Week } from 'react-icons/bs';
import {
    HomeIcon,
    BuildingOfficeIcon,
} from '@heroicons/react/24/outline'; // Outline for generic icons
import GoogleMapComponent from '../../components/Listings/GoogleMap';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

import BookingSkeleton from '../../components/ui/BookingSkeleton';

const BookAppointment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

    const [availableSlots, setAvailableSlots] = useState([]);
    const [lockId, setLockId] = useState(null);
    const [expiresAt, setExpiresAt] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [fetchingSlots, setFetchingSlots] = useState(false);

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
                // Simulate delay as requested for "smooth animation like other page"
                await new Promise(resolve => setTimeout(resolve, 800));
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

    // Pre-fill form for logged-in users
    useEffect(() => {
        if (user) {
            setForm(prev => ({
                ...prev,
                full_name: `${user.first_name} ${user.last_name}`.trim(),
                email: user.email,
                phone: user.phone || '',
            }));
        }
    }, [user]);

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

    // --- Slot Management ---
    useEffect(() => {
        if (form.preferred_date && listing) {
            const fetchSlots = async () => {
                setFetchingSlots(true);
                try {
                    const response = await appointmentApi.getAvailableSlots({
                        listing_id: id,
                        date: form.preferred_date
                    });
                    setAvailableSlots(response.data.slots);
                } catch (error) {
                    console.error('Failed to fetch slots:', error);
                } finally {
                    setFetchingSlots(false);
                }
            };
            fetchSlots();
        }
    }, [form.preferred_date, listing, id]);

    const handleTimeSelect = async (time) => {
        if (form.preferred_time === time) return;

        setForm(prev => ({ ...prev, preferred_time: time }));
        setErrors(prev => ({ ...prev, submit: null }));

        try {
            const response = await appointmentApi.softLockSlot({
                lock_id: lockId,
                listing_id: id,
                preferred_date: form.preferred_date,
                preferred_time: time
            });
            setLockId(response.data.lock_id);
            setExpiresAt(new Date(response.data.expires_at));
        } catch (error) {
            setErrors({ submit: error.response?.data?.error || 'Slot is no longer available' });
            setForm(prev => ({ ...prev, preferred_time: '' }));
            // Refresh slots
            if (form.preferred_date) {
                const resp = await appointmentApi.getAvailableSlots({ listing_id: id, date: form.preferred_date });
                setAvailableSlots(resp.data.slots);
            }
        }
    };

    // --- Timer logic ---
    useEffect(() => {
        if (!expiresAt) return;

        const interval = setInterval(() => {
            const diff = expiresAt.getTime() - new Date().getTime();
            if (diff <= 0) {
                setLockId(null);
                setExpiresAt(null);
                setTimeLeft(null);
                setForm(prev => ({ ...prev, preferred_time: '' }));
                setErrors({ submit: 'Your session has expired. Please select a time slot again.' });
                clearInterval(interval);
            } else {
                const mins = Math.floor(diff / 1000 / 60);
                const secs = Math.floor((diff / 1000) % 60);
                setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const response = await appointmentApi.createAppointment({
                id: lockId,
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

    if (loading) return <BookingSkeleton />;
    if (!listing) return <div className="p-10 text-center">Listing not found</div>;

    const monthYear = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // --- Success View ---
    if (success && bookedAppointment) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dashboard-dark py-12 px-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-white dark:bg-dashboard-card rounded-[var(--btn-radius)] shadow-xl p-8 text-center border border-gray-100 dark:border-white/10">
                    <div className="w-20 h-20 bg-secondary-100 dark:bg-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <SolidCheckCircleIcon className="w-10 h-10 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Appointment Confirmed!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">We've sent the details to {form.email}</p>
                    <Button
                        onClick={() => navigate('/listings')}
                        variant="primary"
                        className="w-full font-bold"
                    >
                        Return to Listings
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-dashboard-dark py-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-800 dark:text-white">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link to={`/listings/${id}`} className="inline-flex items-center text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all group">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-transparent dark:bg-white/10 group-hover:bg-gray-100 dark:group-hover:bg-white/20 transition-all">
                            <ArrowLeftIcon className="w-4 h-4 text-current group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        Back to Property
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* LEFT COLUMN: Main Booking Flow */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. Purpose Selector (Minimal Design) */}
                        {/* Logic: If 'both', show a sleek segmented control. If single, show a clean badge/header combo. */}
                        {listing.listing_type === 'both' ? (
                            <div className="bg-white dark:bg-dashboard-dark/40 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 p-6 transition-colors">
                                <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">I want to</h3>
                                <div className="bg-gray-100 dark:bg-white/5 p-1 rounded-full flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, purpose: 'rent' }))}
                                        className={`flex-1 py-2 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${form.purpose === 'rent' ? 'bg-white dark:bg-white/10 shadow-sm ring-1 ring-gray-200 dark:ring-white/10 text-[var(--primary-color)]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'}`}
                                    >
                                        <HomeIcon className="w-4 h-4" />
                                        For Rent
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, purpose: 'buy' }))}
                                        className={`flex-1 py-2 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${form.purpose === 'buy' ? 'bg-white dark:bg-white/10 shadow-sm ring-1 ring-gray-200 dark:ring-white/10 text-[var(--primary-color)]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'}`}
                                    >
                                        <BuildingOfficeIcon className="w-4 h-4" />
                                        For Buy
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Single Option State (Rent only or Buy only)
                            <div className="flex items-center gap-3 mb-2 p-4 bg-white dark:bg-dashboard-dark/40 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 transition-colors">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center`}
                                    style={listing.listing_type === 'rent'
                                        ? { backgroundColor: 'color-mix(in srgb, var(--primary-color), white 90%)', color: 'var(--primary-color)' }
                                        : { backgroundColor: 'color-mix(in srgb, var(--secondary-color), white 90%)', color: 'var(--secondary-color)' }
                                    }>
                                    {listing.listing_type === 'rent' ? <HomeIcon className="w-5 h-5" /> : <BuildingOfficeIcon className="w-5 h-5" />}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Viewing Type</div>
                                    <div className="font-bold text-gray-900 dark:text-white text-sm">
                                        {listing.listing_type === 'rent' ? 'Property for Rent' : 'Property for Sale'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Date & Time Selection */}
                        <div className="bg-white dark:bg-dashboard-dark/40 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 p-6 transition-colors">
                            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">Select Date & Time</h3>

                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Calendar Side */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <button onClick={() => changeMonth(-1)} className="p-1.5 bg-transparent dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 transition-all rounded-full"><ChevronDownIcon className="w-5 h-5 rotate-90 text-gray-400 dark:text-white" /></button>
                                        <h3 className="font-bold text-gray-800 dark:text-white uppercase tracking-widest text-sm">
                                            {monthYear}
                                        </h3>
                                        <button onClick={() => changeMonth(1)} className="p-1.5 bg-transparent dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 transition-all rounded-full"><ChevronDownIcon className="w-5 h-5 -rotate-90 text-gray-400 dark:text-white" /></button>
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

                                            const currentDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);

                                            const isPast = currentDay < today;

                                            const horizon = new Date(today);
                                            horizon.setDate(today.getDate() + 14);
                                            horizon.setHours(23, 59, 59, 999);

                                            // March 10th should be disabled if today is Feb 20, 2026
                                            const isOutsideHorizon = currentDay > horizon;

                                            const isDisabled = isPast || isOutsideHorizon;

                                            return (
                                                <button
                                                    key={i}
                                                    disabled={isDisabled}
                                                    onClick={() => handleDateSelect(day)}
                                                    className={`
                                                        w-10 h-10 mx-auto rounded-full text-sm font-semibold flex items-center justify-center transition-all
                                                        ${isSelected
                                                            ? 'text-white shadow-lg bg-primary-500'
                                                            : isDisabled
                                                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-white/5'
                                                                : 'text-gray-700 dark:text-white hover:bg-[var(--primary-color-light)] dark:hover:bg-white/20 hover:text-[var(--primary-color)]'}
                                                    `}
                                                    style={isSelected ? { backgroundColor: 'var(--primary-color)', boxShadow: '0 4px 14px 0 var(--primary-color-light)' } : {}}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.preferred_date && <p className="text-red-500 text-xs mt-2 text-center font-bold">Please select a date</p>}
                                </div>

                                {/* Divider */}
                                <div className="hidden md:block w-px bg-gray-100 dark:bg-white/10 min-h-full"></div>

                                {/* Time Slots Side */}
                                <div className="flex-1">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex justify-between items-center">
                                        Morning
                                        {fetchingSlots && <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        {morningSlots.map(time => {
                                            const slotData = availableSlots.find(s => s.time === time);
                                            const isAvailable = slotData && slotData.status === 'available';
                                            const isLocked = slotData && slotData.status === 'locked';

                                            return (
                                                <button
                                                    key={time}
                                                    disabled={(!isAvailable && !isLocked) || isLocked || fetchingSlots}
                                                    onClick={() => handleTimeSelect(time)}
                                                    className={`py-2 px-3 rounded-full text-sm font-semibold border transition-all flex flex-col items-center justify-center
                                                        ${form.preferred_time === time
                                                            ? 'bg-[var(--primary-color)] text-white border-transparent'
                                                            : isLocked
                                                                ? 'bg-red-50 dark:bg-red-500/10 text-red-500 border-red-200 dark:border-red-500/20 cursor-not-allowed opacity-70'
                                                                : !isAvailable && !fetchingSlots
                                                                    ? 'bg-gray-50 dark:bg-white/5 text-gray-300 dark:text-gray-600 border-gray-100 dark:border-white/5 cursor-not-allowed'
                                                                    : 'bg-transparent dark:bg-white/10 text-gray-600 dark:text-white border-gray-200 dark:border-white/10 hover:border-[var(--primary-color)] hover:bg-gray-50 dark:hover:bg-white/20 hover:text-[var(--primary-color)]'}`}
                                                    style={form.preferred_time === time ? { backgroundColor: 'var(--primary-color)', boxShadow: '0 4px 14px 0 var(--primary-color-light)' } : {}}
                                                >
                                                    <span>{time}</span>
                                                    {isLocked && <span className="text-[10px] font-bold mt-0.5">Unavailable</span>}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Afternoon</h4>
                                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {afternoonSlots.map(time => {
                                            const slotData = availableSlots.find(s => s.time === time);
                                            const isAvailable = slotData && slotData.status === 'available';
                                            const isLocked = slotData && slotData.status === 'locked';

                                            return (
                                                <button
                                                    key={time}
                                                    disabled={(!isAvailable && !isLocked) || isLocked || fetchingSlots}
                                                    onClick={() => handleTimeSelect(time)}
                                                    className={`py-2 px-3 rounded-full text-sm font-semibold border transition-all flex flex-col items-center justify-center
                                                        ${form.preferred_time === time
                                                            ? 'bg-[var(--primary-color)] text-white border-transparent'
                                                            : isLocked
                                                                ? 'bg-red-50 dark:bg-red-500/10 text-red-500 border-red-200 dark:border-red-500/20 cursor-not-allowed opacity-70'
                                                                : !isAvailable && !fetchingSlots
                                                                    ? 'bg-gray-50 dark:bg-white/5 text-gray-300 dark:text-gray-600 border-gray-100 dark:border-white/5 cursor-not-allowed'
                                                                    : 'bg-transparent dark:bg-white/10 text-gray-600 dark:text-white border-gray-200 dark:border-white/10 hover:border-[var(--primary-color)] hover:bg-gray-50 dark:hover:bg-white/20 hover:text-[var(--primary-color)]'}`}
                                                    style={form.preferred_time === time ? { backgroundColor: 'var(--primary-color)', boxShadow: '0 4px 14px 0 var(--primary-color-light)' } : {}}
                                                >
                                                    <span>{time}</span>
                                                    {isLocked && <span className="text-[10px] font-bold mt-0.5">Unavailable</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.preferred_time && <p className="text-red-500 text-xs mt-2 text-center font-bold">Please select a time</p>}

                                </div>
                            </div>
                        </div>

                        {/* 3. User Details Form */}
                        <div className="bg-white dark:bg-dashboard-dark/40 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 p-6 transition-colors">
                            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">Your Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={form.full_name}
                                        onChange={e => setForm({ ...form, full_name: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-full bg-gray-50 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-white/10 focus:border-[var(--primary-color)] focus:ring-0 transition-all font-semibold text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                        placeholder="John Doe"
                                        autoComplete="name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                            className={`w-full px-5 py-3.5 rounded-full bg-gray-50 dark:bg-white/5 border transition-all font-semibold text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:bg-white dark:focus:bg-white/10 focus:ring-0 ${errors.phone ? 'border-red-300 bg-red-50 dark:bg-red-500/10' : 'border-transparent focus:border-[var(--primary-color)]'}`}
                                            placeholder="+66..."
                                            autoComplete="tel"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">Email</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            className={`w-full px-5 py-3.5 rounded-full bg-gray-50 dark:bg-white/5 border transition-all font-semibold text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:bg-white dark:focus:bg-white/10 focus:ring-0 ${errors.email ? 'border-red-300 bg-red-50 dark:bg-red-500/10' : 'border-transparent focus:border-[var(--primary-color)]'}`}
                                            placeholder="john@example.com"
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">Message (Optional)</label>
                                    <textarea
                                        rows={3}
                                        value={form.message}
                                        onChange={e => setForm({ ...form, message: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-white/10 focus:border-[var(--primary-color)] focus:ring-0 transition-all font-semibold text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                        placeholder="Any special requests?"
                                    />
                                </div>
                            </div>

                            {errors.submit && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm font-medium flex items-center mt-4">
                                    <span className="mr-2">⚠️</span> {errors.submit}
                                </div>
                            )}

                            <div className="mt-8">
                                <Button
                                    onClick={handleSubmit}
                                    isLoading={submitting}
                                    variant="primary"
                                    className="w-full font-bold shadow-lg rounded-full py-4 text-base"
                                    style={{ boxShadow: '0 10px 20px -10px var(--primary-color)' }}
                                >
                                    Confirm Appointment
                                </Button>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Info Sidebars */}
                    <div className="lg:col-span-1 space-y-6 sticky top-6">

                        {/* 1. Property Info Card */}
                        <div className="bg-white dark:bg-dashboard-dark/40 rounded-3xl shadow-xl shadow-gray-200 dark:shadow-none border border-gray-100 dark:border-white/5 overflow-hidden transition-all">
                            <div className="h-48 bg-gray-100 relative group z-0">
                                {listing.latitude && listing.longitude ? (
                                    <GoogleMapComponent
                                        listings={[listing]}
                                        center={{
                                            lat: parseFloat(listing.latitude),
                                            lng: parseFloat(listing.longitude)
                                        }}
                                        zoom={15}
                                        options={{
                                            disableDefaultUI: true,
                                            gestureHandling: 'cooperative',
                                            zoomControl: true, // Keep zoom for utility
                                            streetViewControl: false,
                                            mapTypeControl: false,
                                            fullscreenControl: false,
                                        }}
                                        mapStyle={{ width: '100%', height: '100%' }}
                                    />
                                ) : (
                                    <>
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{ backgroundImage: `url('/map-placeholder.png')` }}
                                        />
                                        <div className="absolute inset-0 bg-primary-50/50 flex items-center justify-center">
                                            <MapPinIcon className="w-10 h-10 text-[var(--primary-color)] drop-shadow-md" />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h2 className="font-bold text-lg text-gray-900 dark:text-white leading-tight mb-1">{listing.district}</h2>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{listing.province}</p>
                                    </div>
                                    <div className="px-2 py-1 bg-secondary-500 text-white text-xs font-bold rounded shadow-sm flex items-center gap-1">
                                        <StarIcon className="w-3 h-3" />
                                        4.9
                                    </div>
                                </div>

                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed line-clamp-2">
                                    {listing.title}
                                </p>

                                <div className="flex items-center text-xs font-mono text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-full w-fit">
                                    ID: {listing.id?.slice(0, 8).toUpperCase()}
                                </div>
                            </div>
                        </div>

                        {/* 2. Real-time Selection Summary (REDESIGNED V3 - Dark Mode Premium) */}
                        <div className="bg-white dark:bg-dashboard-dark/40 shadow-xl shadow-gray-200 dark:shadow-none border border-gray-100 dark:border-white/5 overflow-hidden relative ring-1 ring-gray-950/5 rounded-3xl transition-all">
                            {/* Header - Sleek Dark Blue */}
                            <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
                                {/* Abstract Geometric Pattern */}
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" />
                                        <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </div>

                                <h3 className="font-mono text-xs font-bold tracking-widest uppercase text-slate-400 mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Booking Summary
                                </h3>

                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center backdrop-blur-md relative">
                                        {timeLeft && (
                                            <div className="absolute -top-1 -right-1 bg-rose-500 text-[10px] text-white font-black px-1.5 py-0.5 rounded-full animate-pulse z-10 shadow-sm border border-rose-400">
                                                {timeLeft}
                                            </div>
                                        )}
                                        {form.preferred_date ? (
                                            <>
                                                <span className="text-[10px] items-center text-white/60 uppercase font-bold tracking-wider mb-px">
                                                    {new Date(form.preferred_date).toLocaleDateString('en-US', { month: 'short' })}
                                                </span>
                                                <span className="text-xl font-bold font-mono text-white leading-none">
                                                    {new Date(form.preferred_date).getDate()}
                                                </span>
                                            </>
                                        ) : (
                                            <BsCalendar2Week className="w-6 h-6 text-white/20" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-slate-400 mb-1 font-medium">Selected Date</div>
                                        <div className="font-bold text-lg text-white truncate">
                                            {form.preferred_date
                                                ? new Date(form.preferred_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric' })
                                                : <span className="opacity-50 italic font-normal text-sm">Select a date...</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Body - Clean White with Dividers */}
                            <div className="bg-transparent p-6">
                                <div className="space-y-5">
                                    {/* Time Row */}
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${form.preferred_time ? 'bg-[var(--primary-color-light)]' : 'bg-gray-50 dark:bg-white/5 text-gray-300 dark:text-gray-600'}`}
                                                style={form.preferred_time ? { color: 'var(--primary-color)' } : {}}>
                                                <ClockIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Time</div>
                                                <div className={`font-bold font-mono text-sm ${form.preferred_time ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}>
                                                    {form.preferred_time || '--:--'}
                                                </div>
                                            </div>
                                        </div>
                                        {form.preferred_time && (
                                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }}></div>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px bg-gray-100 dark:bg-white/5 w-full" />

                                    {/* Purpose Row */}
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                {form.purpose === 'rent' ? <HomeIcon className="w-5 h-5" /> : <BuildingOfficeIcon className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Type</div>
                                                <div className="font-bold text-gray-900 dark:text-white text-sm">
                                                    {form.purpose === 'rent' ? 'Rental Viewing' : 'Purchase Viewing'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                    </div>
                                </div>

                                {/* Status Footer */}
                                <div className="mt-8 pt-6 border-t border-dashed border-gray-200 dark:border-white/5">
                                    {(!form.preferred_date || !form.preferred_time) ? (
                                        <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 py-3 rounded-full border border-gray-100 dark:border-white/5 text-xs font-bold uppercase tracking-wide">
                                            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                            Pending Selection
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10 py-3 rounded-full border border-emerald-100/50 dark:border-emerald-500/20 text-xs font-bold uppercase tracking-wide animate-in fade-in">
                                            <SolidCheckCircleIcon className="w-4 h-4" />
                                            Ready to Book
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
