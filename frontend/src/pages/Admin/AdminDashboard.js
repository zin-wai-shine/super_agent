import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import {
    UsersIcon,
    BuildingOfficeIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await adminApi.getStats();
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const statCards = [
        { name: 'Total Agents', value: stats?.total_agents || 0, icon: UsersIcon, color: 'blue', change: '+12%' },
        { name: 'Active Subscriptions', value: stats?.active_subscriptions || 0, icon: CurrencyDollarIcon, color: 'green', change: '+5%' },
        { name: 'Total Listings', value: stats?.total_listings || 0, icon: BuildingOfficeIcon, color: 'purple', change: '+18%' },
        { name: 'Monthly Revenue', value: `฿${(stats?.monthly_revenue || 0).toLocaleString()}`, icon: ChartBarIcon, color: 'yellow', change: '+8%' },
    ];

    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        yellow: 'bg-yellow-500',
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">Platform overview and analytics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${colorClasses[stat.color]} bg-opacity-10`}>
                                <stat.icon className={`w-6 h-6 ${colorClasses[stat.color].replace('bg-', 'text-')}`} />
                            </div>
                            <span className="text-sm font-medium text-green-600 flex items-center">
                                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                                {stat.change}
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-gray-500 text-sm mt-1">{stat.name}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
                    <h2 className="text-xl font-bold mb-2">Agent Management</h2>
                    <p className="text-primary-100 mb-4">View and manage all registered agents</p>
                    <Link
                        to="/admin/agents"
                        className="inline-block bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                        View Agents
                    </Link>
                </div>

                <div className="bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-2xl p-6 text-white">
                    <h2 className="text-xl font-bold mb-2">Subscription Plans</h2>
                    <p className="text-secondary-100 mb-4">Configure pricing and features</p>
                    <Link
                        to="/admin/plans"
                        className="inline-block bg-white text-secondary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                        Manage Plans
                    </Link>
                </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    {[
                        { action: 'New agent registered', time: '2 hours ago', icon: UsersIcon },
                        { action: 'Subscription upgraded', time: '5 hours ago', icon: CurrencyDollarIcon },
                        { action: 'New listing created', time: '1 day ago', icon: BuildingOfficeIcon },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center space-x-4 text-sm">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <item.icon className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">{item.action}</div>
                                <div className="text-gray-500">{item.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
