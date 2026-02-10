import React, { useState, useEffect, useCallback } from 'react';
import { appointmentApi } from '../../services/api';
import StyledSelect from '../../components/Form/StyledSelect';
import { useDashboardTheme } from '../../contexts/DashboardThemeContext';
import {
    CalendarDaysIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    EyeIcon,
    CheckIcon,
    XMarkIcon,
    TrashIcon,
    ClockIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    ChatBubbleBottomCenterTextIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    PlusIcon, // If needed for new appointments
} from '@heroicons/react/24/outline';
import { format, startOfDay, endOfDay, subDays, startOfMonth, subMonths, addMonths, getMonth, getYear, setMonth, setYear } from 'date-fns';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const STATUS_CONFIG = {
    pending: { label: 'Pending', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
    confirmed: { label: 'Confirmed', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
    completed: { label: 'Completed', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
};

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const AppointmentManagement = () => {
    const { isDarkMode } = useDashboardTheme();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [agentNotes, setAgentNotes] = useState('');
    const [updating, setUpdating] = useState(false);
    const [stats, setStats] = useState({ pending: 0, confirmed: 0, completed: 0, cancelled: 0, total: 0 });

    // Date Filter State
    const [dateRange, setDateRange] = useState([
        {
            startDate: startOfDay(new Date()),
            endDate: endOfDay(new Date()),
            key: 'selection'
        }
    ]);
    const [datePreset, setDatePreset] = useState('today');
    const [isDateFiltered, setIsDateFiltered] = useState(false); // Default false, or 'today' if we want it active
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [shownDate, setShownDate] = useState(new Date());
    const datePickerRef = React.useRef(null);

    // Fetch Appointments
    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (statusFilter) params.status = statusFilter;
            if (search) params.search = search;

            if (isDateFiltered && dateRange[0].startDate && dateRange[0].endDate) {
                params.date_from = format(dateRange[0].startDate, 'yyyy-MM-dd');
                params.date_to = format(dateRange[0].endDate, 'yyyy-MM-dd');
            }

            const response = await appointmentApi.getAppointments(params);
            setAppointments(response.data.appointments || []);
            setTotal(response.data.total || 0);
            setTotalPages(response.data.pages || 0);
            if (response.data.stats) setStats(response.data.stats);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        } finally {
            setLoading(false);
        }
    }, [page, limit, statusFilter, search, isDateFiltered, dateRange]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Close datepicker when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setShowDatePicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDatePresetChange = (preset) => {
        setDatePreset(preset);
        setShowDatePicker(false);
        const today = new Date();

        switch (preset) {
            case 'today':
                setDateRange([{
                    startDate: startOfDay(today),
                    endDate: endOfDay(today),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                break;
            case 'yesterday':
                const yesterday = subDays(today, 1);
                setDateRange([{
                    startDate: startOfDay(yesterday),
                    endDate: endOfDay(yesterday),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                break;
            case 'last7days':
                setDateRange([{
                    startDate: startOfDay(subDays(today, 6)),
                    endDate: endOfDay(today),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                break;
            case 'thismonth':
                setDateRange([{
                    startDate: startOfMonth(today),
                    endDate: endOfDay(today),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                break;
            case 'alltime':
                setIsDateFiltered(false);
                break;
            case 'custom':
                setShowDatePicker(true);
                break;
            default:
                break;
        }
        setPage(1);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleStatusChange = async (appointment, newStatus) => {
        setUpdating(true);
        try {
            await appointmentApi.updateAppointment(appointment.id, { status: newStatus });
            fetchAppointments();
            if (showDetailModal && selectedAppointment?.id === appointment.id) {
                setSelectedAppointment(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!selectedAppointment) return;
        setUpdating(true);
        try {
            await appointmentApi.updateAppointment(selectedAppointment.id, { agent_notes: agentNotes });
            fetchAppointments();
            setSelectedAppointment(prev => ({ ...prev, agent_notes: agentNotes }));
        } catch (error) {
            console.error('Failed to save notes:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await appointmentApi.deleteAppointment(id);
            setShowDeleteConfirm(null);
            fetchAppointments();
        } catch (error) {
            console.error('Failed to delete appointment:', error);
        }
    };

    const openDetailModal = (appointment) => {
        setSelectedAppointment(appointment);
        setAgentNotes(appointment.agent_notes || '');
        setShowDetailModal(true);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    };

    const StatusBadge = ({ status }) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                {config.label}
            </span>
        );
    };

    const StatusActions = ({ appointment, compact = false }) => {
        const { status } = appointment;
        const btnBase = compact
            ? 'p-1.5 rounded-lg transition-all text-xs'
            : 'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all';
        return (
            <div className="flex items-center gap-1.5">
                {status === 'pending' && (
                    <button
                        onClick={() => handleStatusChange(appointment, 'confirmed')}
                        disabled={updating}
                        className={`${btnBase} bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40`}
                        title="Confirm"
                    >
                        <CheckIcon className={compact ? 'w-4 h-4' : 'w-3.5 h-3.5 inline mr-1'} />
                        {!compact && 'Confirm'}
                    </button>
                )}
                {status === 'confirmed' && (
                    <button
                        onClick={() => handleStatusChange(appointment, 'completed')}
                        disabled={updating}
                        className={`${btnBase} bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40`}
                        title="Complete"
                    >
                        <CheckIcon className={compact ? 'w-4 h-4' : 'w-3.5 h-3.5 inline mr-1'} />
                        {!compact && 'Complete'}
                    </button>
                )}
                {(status === 'pending' || status === 'confirmed') && (
                    <button
                        onClick={() => handleStatusChange(appointment, 'cancelled')}
                        disabled={updating}
                        className={`${btnBase} bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40`}
                        title="Cancel"
                    >
                        <XMarkIcon className={compact ? 'w-4 h-4' : 'w-3.5 h-3.5 inline mr-1'} />
                        {!compact && 'Cancel'}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm">
                            <CalendarDaysIcon className="w-5 h-5 text-white" />
                        </div>
                        Appointments
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {total} total appointment{total !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Stats Cards (Global Summary) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const count = stats[key] || 0;
                    // Use soft background colors matching the status badge themes
                    const softBg = key === 'pending' ? 'bg-amber-50/50 dark:bg-amber-900/10'
                        : key === 'confirmed' ? 'bg-blue-50/50 dark:bg-blue-900/10'
                            : key === 'completed' ? 'bg-emerald-50/50 dark:bg-emerald-900/10'
                                : 'bg-red-50/50 dark:bg-red-900/10';
                    const borderColor = key === 'pending' ? 'border-amber-100 dark:border-amber-900/30'
                        : key === 'confirmed' ? 'border-blue-100 dark:border-blue-900/30'
                            : key === 'completed' ? 'border-emerald-100 dark:border-emerald-900/30'
                                : 'border-red-100 dark:border-red-900/30';

                    return (
                        <div
                            key={key}
                            className={`p-5 rounded-[3px] border transition-all ${softBg} ${borderColor} shadow-sm flex flex-col items-center justify-center text-center`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.1em]">{config.label}</span>
                            </div>
                            <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{count}</div>
                        </div>
                    );
                })}
            </div>

            {/* Search & Filters (Standardized Toolbar) */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">

                {/* LEFT: Page Size */}
                <div className="flex items-center space-x-2 h-[38px] w-full lg:w-auto">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Show</span>
                    <div className="w-16">
                        <StyledSelect
                            options={[
                                { value: 5, label: '5' },
                                { value: 10, label: '10' },
                                { value: 20, label: '20' },
                                { value: 50, label: '50' },
                            ]}
                            value={{ value: limit, label: `${limit}` }}
                            onChange={(val) => { setLimit(val); setPage(1); }}
                            isSearchable={false}
                            components={{
                                DropdownIndicator: () => null,
                                IndicatorSeparator: () => null
                            }}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    minHeight: '34px',
                                    height: '34px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    borderRadius: '3px'
                                }),
                                valueContainer: (base) => ({
                                    ...base,
                                    justifyContent: 'center',
                                    padding: '0'
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    margin: '0',
                                    textAlign: 'center',
                                    width: '100%'
                                })
                            }}
                        />
                    </div>
                </div>

                {/* CENTER: Core Filters */}
                <div className="flex flex-wrap items-center lg:justify-center gap-3 flex-1 w-full">
                    {/* Status Filter */}
                    <div className="w-full sm:w-40">
                        <StyledSelect
                            options={statusOptions}
                            value={statusFilter}
                            onChange={(val) => { setStatusFilter(val || ''); setPage(1); }}
                            placeholder="All Status"
                            isSearchable={false}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    minHeight: '34px',
                                    height: '34px',
                                    fontSize: '12px',
                                    borderRadius: '3px'
                                }),
                                valueContainer: (base) => ({
                                    ...base,
                                    padding: '0 8px'
                                })
                            }}
                        />
                    </div>

                    {/* Date Filters */}
                    <div className="relative flex items-center gap-2" ref={datePickerRef}>
                        <div className="w-full sm:w-56">
                            <StyledSelect
                                options={[
                                    { value: 'today', label: 'Today' },
                                    { value: 'yesterday', label: 'Yesterday' },
                                    { value: 'last7days', label: 'Last 7 Days' },
                                    { value: 'thismonth', label: 'This Month' },
                                    { value: 'alltime', label: 'All Time' },
                                    { value: 'custom', label: 'Custom Range...' },
                                ]}
                                value={datePreset}
                                onChange={(val) => handleDatePresetChange(val)}
                                isSearchable={false}
                                placeholder="Date Range"
                                formatOptionLabel={(option) => (
                                    <div className="flex items-center justify-between w-full">
                                        <span>
                                            {option.value === 'custom' && datePreset === 'custom' && dateRange?.[0]
                                                ? `${format(dateRange[0].startDate, "MMM dd")} - ${format(dateRange[0].endDate, "MMM dd")}`
                                                : option.label}
                                        </span>
                                    </div>
                                )}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        minHeight: '34px',
                                        height: '34px',
                                        fontSize: '12px',
                                        borderRadius: '3px'
                                    }),
                                    valueContainer: (base) => ({
                                        ...base,
                                        padding: '0 8px'
                                    })
                                }}
                            />
                        </div>

                        <button
                            onClick={() => handleDatePresetChange('alltime')}
                            className={`p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-[3px] transition-colors ${!isDateFiltered ? 'invisible' : ''}`}
                            title="Reset Filters"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                        </button>

                        {showDatePicker && (
                            <div className="absolute top-full left-0 mt-2 z-50 shadow-lg rounded-[3px] overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-dashboard-card w-[350px]">
                                <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
                                    <button onClick={() => setShownDate(subMonths(shownDate, 1))} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeftIcon className="w-5 h-5" /></button>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32">
                                            <StyledSelect
                                                value={{ value: getMonth(shownDate || new Date()), label: format(shownDate || new Date(), 'MMMM') }}
                                                onChange={(val) => setShownDate(setMonth(shownDate || new Date(), val))}
                                                options={Array.from({ length: 12 }, (_, i) => ({ value: i, label: format(new Date(2000, i, 1), 'MMMM') }))}
                                                isSearchable={false}
                                                styles={{ control: (base) => ({ ...base, minHeight: '30px', height: '30px', fontSize: '12px', borderRadius: '3px' }) }}
                                            />
                                        </div>
                                        <div className="w-24">
                                            <StyledSelect
                                                value={{ value: getYear(shownDate || new Date()), label: getYear(shownDate || new Date()).toString() }}
                                                onChange={(val) => setShownDate(setYear(shownDate || new Date(), val))}
                                                options={Array.from({ length: 10 }, (_, i) => { const y = new Date().getFullYear() - 5 + i; return { value: y, label: y.toString() }; })}
                                                isSearchable={false}
                                                styles={{ control: (base) => ({ ...base, minHeight: '30px', height: '30px', fontSize: '12px', borderRadius: '3px' }) }}
                                            />
                                        </div>
                                    </div>
                                    <button onClick={() => setShownDate(addMonths(shownDate, 1))} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRightIcon className="w-5 h-5" /></button>
                                </div>
                                <DateRange
                                    editableDateInputs={false}
                                    onChange={item => {
                                        setDateRange([item.selection]);
                                        setIsDateFiltered(true);
                                        setDatePreset('custom');
                                        setPage(1);
                                    }}
                                    moveRangeOnFirstSelection={false}
                                    ranges={dateRange && dateRange.length > 0 ? dateRange : [{ startDate: new Date(), endDate: new Date(), key: 'selection' }]}
                                    shownDate={shownDate || new Date()}
                                    showMonthAndYearPickers={false}
                                    rangeColors={['#3b82f6']}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Search */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-56 h-[34px]">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search visitor..."
                            className="w-full pl-9 pr-4 h-[34px] bg-white dark:bg-dashboard-card border border-gray-200 dark:border-gray-700 rounded-[3px] text-[12px] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                        />
                    </form>
                </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white dark:bg-dashboard-card border border-gray-100 dark:border-gray-700 rounded-[3px] overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="p-12 text-center">
                        <CalendarDaysIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No appointments found</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {statusFilter || search || isDateFiltered ? 'Try adjusting your filters.' : 'Appointments will appear here when visitors book viewings.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visitor</th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Listing</th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Booking Date</th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Preferred Time</th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Decision</th>
                                        <th className="text-right px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {appointments.map(appointment => (
                                        <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900 dark:text-white text-sm">{appointment.full_name}</div>
                                                <div className="text-xs text-gray-400 font-medium">{appointment.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 max-w-[200px]">
                                                    {appointment.listing?.title || 'N/A'}
                                                </div>
                                                <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                                                    {appointment.purpose === 'buy' ? 'Purchase' : 'Rental'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{format(new Date(appointment.created_at), 'MMM dd, yyyy')}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{format(new Date(appointment.created_at), 'hh:mm a')}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(appointment.preferred_date)}</div>
                                                <div className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 font-bold mt-0.5">
                                                    <ClockIcon className="w-3.5 h-3.5" /> {appointment.preferred_time}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={appointment.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusActions appointment={appointment} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openDetailModal(appointment)}
                                                        className="p-1.5 text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-400 dark:hover:bg-primary-500/20 rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <EyeIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setShowDeleteConfirm(appointment.id)}
                                                        className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                Showing <span className="text-gray-900 dark:text-white">{(page - 1) * limit + 1}</span> to <span className="text-gray-900 dark:text-white">{Math.min(page * limit, total)}</span> of <span className="text-gray-900 dark:text-white">{total}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setPage(1)}
                                    disabled={page === 1}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-[3px] hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500"
                                >
                                    <ChevronDoubleLeftIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-[3px] hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>
                                <div className="flex items-center space-x-1.5">
                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Page</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={totalPages}
                                        value={page}
                                        onChange={(e) => {
                                            const p = e.target.value ? Number(e.target.value) : 1;
                                            setPage(Math.min(Math.max(1, p), totalPages));
                                        }}
                                        className="w-12 h-8 text-center border border-gray-300 dark:border-gray-600 rounded-[3px] text-xs font-bold bg-white dark:bg-dashboard-dark text-gray-900 dark:text-white"
                                    />
                                    <span className="text-xs text-gray-500 font-bold uppercase">of {totalPages}</span>
                                </div>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-[3px] hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPage(totalPages)}
                                    disabled={page === totalPages}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-[3px] hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500"
                                >
                                    <ChevronDoubleRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
                    <div className="relative bg-white dark:bg-dashboard-card rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white dark:bg-dashboard-card border-b border-gray-100 dark:border-gray-700 px-6 py-4 rounded-t-3xl flex items-center justify-between z-10">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Appointment Details</h3>
                            <button onClick={() => setShowDetailModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Status & Actions */}
                            <div className="flex items-center justify-between">
                                <StatusBadge status={selectedAppointment.status} />
                                <StatusActions appointment={selectedAppointment} />
                            </div>

                            {/* Visitor Info */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Visitor</h4>
                                <div className="flex items-center gap-3">
                                    <UserIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedAppointment.full_name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <EnvelopeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <a href={`mailto:${selectedAppointment.email}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">{selectedAppointment.email}</a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <PhoneIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <a href={`tel:${selectedAppointment.phone}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">{selectedAppointment.phone}</a>
                                </div>
                            </div>

                            {/* Appointment Info */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Schedule</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Date</div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                                            <CalendarDaysIcon className="w-4 h-4 text-primary-500" />
                                            {formatDate(selectedAppointment.preferred_date)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Time</div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                                            <ClockIcon className="w-4 h-4 text-primary-500" />
                                            {selectedAppointment.preferred_time}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Purpose</div>
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${selectedAppointment.purpose === 'buy'
                                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                                            : 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300'
                                            }`}>
                                            {selectedAppointment.purpose}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Booked</div>
                                        <div className="text-sm text-gray-700 dark:text-gray-300">{formatDate(selectedAppointment.created_at)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Listing Info */}
                            {selectedAppointment.listing && (
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Property</h4>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{selectedAppointment.listing.title}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <MapPinIcon className="w-3.5 h-3.5" />
                                        {selectedAppointment.listing.district}, {selectedAppointment.listing.province}
                                    </div>
                                </div>
                            )}

                            {/* Message */}
                            {selectedAppointment.message && (
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                                        <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5" /> Visitor Message
                                    </h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedAppointment.message}</p>
                                </div>
                            )}

                            {/* Agent Notes */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Agent Notes</h4>
                                <textarea
                                    value={agentNotes}
                                    onChange={(e) => setAgentNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Add private notes about this appointment..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none resize-none"
                                />
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={updating || agentNotes === (selectedAppointment.agent_notes || '')}
                                    className="mt-2 px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    {updating ? 'Saving...' : 'Save Notes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
                    <div className="relative bg-white dark:bg-dashboard-card rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Appointment?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentManagement;
