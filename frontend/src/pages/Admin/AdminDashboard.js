import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import ActivityChart from '../../components/Common/ActivityChart';
import RevenueChart from '../../components/Common/RevenueChart';
import {
    UsersIcon,
    BuildingOfficeIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    EllipsisHorizontalIcon,
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
        {
            name: 'Total Agents',
            value: stats?.total_agents || 0,
            icon: UsersIcon,
            change: '+12%',
            iconBg: 'bg-blue-50 text-blue-600'
        },
        {
            name: 'Active Subscriptions',
            value: stats?.active_subscriptions || 0,
            icon: CurrencyDollarIcon,
            change: '+5%',
            iconBg: 'bg-green-50 text-green-600'
        },
        {
            name: 'Total Listings',
            value: stats?.total_listings || 0,
            icon: BuildingOfficeIcon,
            change: '+18%',
            iconBg: 'bg-purple-50 text-purple-600'
        },
        {
            name: 'Monthly Revenue',
            value: `฿${(stats?.monthly_revenue || 0).toLocaleString()}`,
            icon: ChartBarIcon,
            change: '+8%',
            iconBg: 'bg-amber-50 text-amber-600'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">Platform overview and analytics</p>
            </div>

            {/* Stats Grid - Modern Look */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                                <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</div>
                            <div className="text-xs font-medium text-gray-500 mt-1">{stat.name}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart Section - Double Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Revenue Overview</h2>
                            <p className="text-xs text-gray-500">Monthly revenue performance</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                            <EllipsisHorizontalIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <RevenueChart />
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">User Activity</h2>
                            <p className="text-xs text-gray-500">Weekly platform engagement</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                            <EllipsisHorizontalIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <ActivityChart />
                </div>
            </div>

            {/* Quick Actions - Colored Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.01]">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                            <UsersIcon className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">Agent Management</h2>
                        <p className="text-blue-100 text-sm mb-6 max-w-sm">View registered agents, manage approvals, and monitor platform activity.</p>
                        <Link
                            to="/admin/agents"
                            className="inline-flex items-center bg-white text-blue-600 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-50 transition-colors"
                        >
                            View All Agents
                        </Link>
                    </div>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 shadow-lg shadow-emerald-500/25 transition-transform hover:scale-[1.01]">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                            <CurrencyDollarIcon className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">Subscription Plans</h2>
                        <p className="text-emerald-100 text-sm mb-6 max-w-sm">Configure pricing tiers, update features, and manage billing cycles.</p>
                        <Link
                            to="/admin/plans"
                            className="inline-flex items-center bg-white text-emerald-600 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-emerald-50 transition-colors"
                        >
                            Manage Plans
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-6">
                    {[
                        { action: 'New agent registered', time: '2 hours ago', icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { action: 'Subscription upgraded', time: '5 hours ago', icon: CurrencyDollarIcon, color: 'text-green-600', bg: 'bg-green-50' },
                        { action: 'New listing created', time: '1 day ago', icon: BuildingOfficeIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-start space-x-4">
                            <div className={`p-2.5 rounded-xl ${item.bg} ${item.color} mt-1`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                                <div className="font-semibold text-gray-900">{item.action}</div>
                                <div className="text-sm text-gray-500 mt-0.5">{item.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
