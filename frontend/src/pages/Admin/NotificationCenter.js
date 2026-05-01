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
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Center</h1>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('send')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'send'
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        Send Notification
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history'
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        History
                    </button>
                </nav>
            </div>

            {activeTab === 'send' && (
                <div className="bg-white dark:bg-dashboard-card shadow rounded-xl p-6 max-w-2xl border dark:border-gray-700">
                    {successMessage && (
                        <div className="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center border border-green-100 dark:border-green-800">
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
                <div className="bg-white dark:bg-dashboard-card shadow overflow-hidden sm:rounded-xl border dark:border-gray-700">
                    {history.length === 0 ? (
                        <EmptyState
                            icon={InboxIcon}
                            title="No notifications found"
                            description="Your notification history is empty. Sent notifications will appear here."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Message</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dashboard-card divide-y divide-gray-200 dark:divide-gray-700">
                                    {history.map((notification) => (
                                        <tr key={notification.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
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
