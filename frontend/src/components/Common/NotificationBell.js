import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationApi } from '../../services/api';
import { BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';

const NotificationBell = () => {
    const { isAuthenticated, isSuperAdmin } = useAuth();
    const { lastNotification } = useWebSocket() || {}; // Safe access if used outside provider (shouldn't happen but good practice)
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const response = await notificationApi.getMyNotifications();
            const data = response.data;
            setNotifications(data.slice(0, 5)); // Show latest 5
            setUnreadCount(data.filter(n => !n.is_read).length); // Simple unread check
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            // Poll every 60s as backup
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    // Handle real-time notifications
    useEffect(() => {
        if (lastNotification) {
            // Add new notification to top of list
            setNotifications(prev => {
                // Remove potential duplicate if ID exists (unlikely in this flow but good safety)
                const filtered = prev.filter(n => n.id !== lastNotification.id);
                return [lastNotification, ...filtered].slice(0, 5);
            });
            // Increment unread count
            setUnreadCount(prev => prev + 1);
        }
    }, [lastNotification]);

    const markAsRead = async (id) => {
        try {
            await notificationApi.markRead(id);
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const linkPath = isSuperAdmin ? '/admin/notifications' : '/agent/notifications';

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors relative"
            >
                <BellIcon className="w-6 h-6 lg:w-5 lg:h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-dashboard-card" />
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-40 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-medium text-gray-900">Notifications</h3>
                            <Link
                                to={linkPath}
                                onClick={() => setIsOpen(false)}
                                className="text-xs text-primary-600 hover:text-primary-800"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    No notifications
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                                                >
                                                    Mark read
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(notification.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
