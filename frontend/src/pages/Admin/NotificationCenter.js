import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { notificationApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
    PaperAirplaneIcon,
    BellIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

const NotificationCenter = () => {
    const { isSuperAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState('send'); // 'send' or 'history'
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
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
                <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('send')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'send'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Send Notification
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        History
                    </button>
                </nav>
            </div>

            {activeTab === 'send' && (
                <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
                    {successMessage && (
                        <div className="mb-4 p-4 rounded-md bg-green-50 flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                            <span className="text-green-700">{successMessage}</span>
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
                                <select className="input-field" {...register('type')}>
                                    <option value="info">Info</option>
                                    <option value="warning">Warning</option>
                                    <option value="system">System</option>
                                </select>
                            </div>

                            <div>
                                <label className="input-label">Target Audience</label>
                                <select className="input-field" {...register('target_role')}>
                                    <option value="">Specific User (ID required)</option>
                                    {isSuperAdmin && <option value="agent">All Agents</option>}
                                    <option value="public">{isSuperAdmin ? 'All Public Users' : 'My Site Visitors'}</option>
                                </select>
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
                                <p className="text-xs text-gray-500 mt-1">Leave empty if broadcasting to a role.</p>
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
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    {history.length === 0 ? (
                        <p className="p-6 text-center text-gray-500">No notifications found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {history.map((notification) => (
                                        <tr key={notification.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                        notification.type === 'system' ? 'bg-red-100 text-red-800' :
                                                            'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {notification.title}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={notification.message}>
                                                {notification.message}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {notification.target_role === 'agent' ? 'All Agents' :
                                                    notification.target_role === 'public' ? 'Public Users' :
                                                        notification.receiver_id ? 'Specific User' : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(notification.created_at).toLocaleDateString()}
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
