import React, { useState, useEffect, useCallback } from 'react';
import { appointmentApi } from '../../services/api';
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
} from '@heroicons/react/24/outline';

const STATUS_CONFIG = {
    pending: { label: 'Pending', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
    confirmed: { label: 'Confirmed', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
    completed: { label: 'Completed', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
};

const AppointmentManagement = () => {
    const { isDarkMode } = useDashboardTheme();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [agentNotes, setAgentNotes] = useState('');
    const [updating, setUpdating] = useState(false);

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (statusFilter) params.status = statusFilter;
            if (search) params.search = search;
            const response = await appointmentApi.getAppointments(params);
            setAppointments(response.data.appointments || []);
            setTotal(response.data.total || 0);
            setTotalPages(response.data.pages || 0);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        } finally {
            setLoading(false);
        }
    }, [page, limit, statusFilter, search]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

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

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const count = appointments.filter(a => a.status === key).length;
                    return (
                        <button
                            key={key}
                            onClick={() => { setStatusFilter(statusFilter === key ? '' : key); setPage(1); }}
                            className={`relative p-4 rounded-2xl border transition-all hover:shadow-sm ${statusFilter === key
                                ? 'border-primary-300 bg-primary-50/50 dark:border-primary-700 dark:bg-primary-900/20 shadow-sm'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-dashboard-card hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{config.label}</span>
                            </div>
                            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{count}</div>
                        </button>
                    );
                })}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by visitor name or email..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-dashboard-card border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                    />
                </form>
                <div className="relative">
                    <FunnelIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="pl-10 pr-8 py-2.5 bg-white dark:bg-dashboard-card border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white appearance-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white dark:bg-dashboard-card border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="p-12 text-center">
                        <CalendarDaysIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No appointments found</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {statusFilter || search ? 'Try adjusting your filters.' : 'Appointments will appear here when visitors book viewings.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Visitor</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Listing</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date & Time</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Purpose</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                                        <th className="text-right px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {appointments.map(appointment => (
                                        <tr key={appointment.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-sm text-gray-900 dark:text-white">{appointment.full_name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{appointment.email}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
                                                    {appointment.listing?.title || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white font-medium">{formatDate(appointment.preferred_date)}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <ClockIcon className="w-3 h-3" /> {appointment.preferred_time}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${appointment.purpose === 'buy'
                                                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                                                    : 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300'
                                                    }`}>
                                                    {appointment.purpose}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4"><StatusBadge status={appointment.status} /></td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => openDetailModal(appointment)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                                        title="View Details"
                                                    >
                                                        <EyeIcon className="w-4 h-4" />
                                                    </button>
                                                    <StatusActions appointment={appointment} compact />
                                                    <button
                                                        onClick={() => setShowDeleteConfirm(appointment.id)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700/50">
                            {appointments.map(appointment => (
                                <div key={appointment.id} className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="font-semibold text-sm text-gray-900 dark:text-white">{appointment.full_name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{appointment.email}</div>
                                        </div>
                                        <StatusBadge status={appointment.status} />
                                    </div>
                                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 truncate">{appointment.listing?.title}</div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        <span className="flex items-center gap-1">
                                            <CalendarDaysIcon className="w-3.5 h-3.5" />
                                            {formatDate(appointment.preferred_date)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <ClockIcon className="w-3.5 h-3.5" />
                                            {appointment.preferred_time}
                                        </span>
                                        <span className={`font-bold uppercase ${appointment.purpose === 'buy' ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-600 dark:text-secondary-400'
                                            }`}>
                                            {appointment.purpose}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <StatusActions appointment={appointment} />
                                        <div className="flex items-center gap-1.5">
                                            <button onClick={() => openDetailModal(appointment)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setShowDeleteConfirm(appointment.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700/50">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page <= 1}
                                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeftIcon className="w-4 h-4" />
                                    </button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) pageNum = i + 1;
                                        else if (page <= 3) pageNum = i + 1;
                                        else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                                        else pageNum = page - 2 + i;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${page === pageNum
                                                    ? 'bg-primary-600 text-white shadow-sm'
                                                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
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
