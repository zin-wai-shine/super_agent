import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { notificationApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import StyledSelect from '../../components/Form/StyledSelect';
import {
    PaperAirplaneIcon,
    BellIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    InboxIcon
} from '@heroicons/react/24/outline';
import EmptyState from '../../components/Common/EmptyState';

const NotificationCenter = () => {
    const { isSuperAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState('send'); // 'send' or 'history'
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');

    const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm();
    const targetRole = watch('target_role');

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);

    const fetchHistory = async () => {
        try {
            const response = await notificationApi.getSentNotifications();
            setHistory(response.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setSuccessMessage('');
        try {
            await notificationApi.createNotification(data);
            setSuccessMessage('Notification sent successfully!');
            reset();
        } catch (error) {
            console.error("Failed to send notification", error);
            alert("Failed to send notification");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 pb-2">
                <div className="lg:min-w-[280px]">
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-[color-mix(in_srgb,var(--primary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--primary-color),transparent_90%)] rounded-admin flex items-center justify-center shadow-sm border border-[color-mix(in_srgb,var(--primary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--primary-color),transparent_80%)]">
                            <BellIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        Notification Center
                    </h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-8">
                <button
                    onClick={() => setActiveTab('send')}
                    className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                        activeTab === 'send'
                            ? 'bg-[color-mix(in_srgb,var(--primary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--primary-color),transparent_90%)] text-primary-600 dark:text-primary-400 shadow-sm border border-[color-mix(in_srgb,var(--primary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--primary-color),transparent_80%)]'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                    Send Notification
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                        activeTab === 'history'
                            ? 'bg-[color-mix(in_srgb,var(--primary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--primary-color),transparent_90%)] text-primary-600 dark:text-primary-400 shadow-sm border border-[color-mix(in_srgb,var(--primary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--primary-color),transparent_80%)]'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                    History
                </button>
            </div>

            {activeTab === 'send' && (
                <div className="bg-white dark:bg-dashboard-card rounded-admin p-8 max-w-2xl shadow-sm border border-gray-100 dark:border-white/5">
                    {successMessage && (
                        <div className="mb-4 p-4 rounded-admin bg-green-50 dark:bg-green-900/20 flex items-center border border-green-100 dark:border-green-800">
                            <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                            <span className="text-green-700 dark:text-green-300">{successMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="input-label">Title *</label>
                            <input
                                type="text"
                                className="input-field"
                                {...register('title', { required: 'Title is required' })}
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                        </div>

                        <div>
                            <label className="input-label">Message *</label>
                            <textarea
                                rows={4}
                                className="input-field"
                                {...register('message', { required: 'Message is required' })}
                            />
                            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="input-label">Type</label>
                                <Controller
                                    name="type"
                                    control={control}
                                    defaultValue="info"
                                    render={({ field }) => (
                                        <StyledSelect
                                            {...field}
                                            options={[
                                                { value: 'info', label: 'Info' },
                                                { value: 'warning', label: 'Warning' },
                                                { value: 'system', label: 'System' },
                                            ]}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <label className="input-label">Target Audience</label>
                                <Controller
                                    name="target_role"
                                    control={control}
                                    defaultValue="public"
                                    render={({ field }) => (
                                        <StyledSelect
                                            {...field}
                                            options={isSuperAdmin ? [
                                                { value: '', label: 'Specific User (ID required)' },
                                                { value: 'agent', label: 'All Agents' },
                                                { value: 'public', label: 'All Public Users' },
                                            ] : [
                                                { value: '', label: 'Specific User (ID required)' },
                                                { value: 'public', label: 'My Site Visitors' },
                                            ]}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        {!targetRole && (
                            <div>
                                <label className="input-label">Receiver ID (UUID)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g., 00000000-0000-..."
                                    {...register('receiver_id')}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave empty if broadcasting to a role.</p>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex items-center"
                            >
                                {loading ? 'Sending...' : (
                                    <>
                                        <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                                        Send Notification
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-white dark:bg-dashboard-card overflow-hidden sm:rounded-admin border border-gray-100 dark:border-white/5 shadow-sm">
                    {history.length === 0 ? (
                        <EmptyState
                            icon={InboxIcon}
                            title="No notifications found"
                            description="Your notification history is empty. Sent notifications will appear here."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse divide-y divide-gray-100 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400">Type</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400">Title</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400">Message</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400">Target</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dashboard-card divide-y divide-gray-200 dark:divide-gray-700">
                                    {history.map((notification) => (
                                        <tr key={notification.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-admin text-xs font-medium ${notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                                    notification.type === 'system' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                                                        'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                                    }`}>
                                                    {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {notification.title}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={notification.message}>
                                                {notification.message}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {notification.target_role === 'agent' ? 'All Agents' :
                                                    notification.target_role === 'public' ? 'Public Users' :
                                                        notification.receiver_id ? 'Specific User' : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {notification.created_at ? new Date(notification.created_at).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
