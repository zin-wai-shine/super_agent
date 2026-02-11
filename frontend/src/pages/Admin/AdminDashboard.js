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
    CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const adminRes = await adminApi.getStats();
                setStats(adminRes.data);
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
            iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
        },
        {
            name: 'Active Subscriptions',
            value: stats?.active_subscriptions || 0,
            icon: CurrencyDollarIcon,
            change: '+5%',
            iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
        },
        {
            name: 'Total Listings',
            value: stats?.total_listings || 0,
            icon: BuildingOfficeIcon,
            change: '+18%',
            iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
        },
        {
            name: 'Monthly Revenue',
            value: `฿${(stats?.monthly_revenue || 0).toLocaleString()}`,
            icon: ChartBarIcon,
            change: '+8%',
            iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
        },
    ];

    return (
        <div className="space-y-8">


            {/* Stats Grid - Modern Look */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.name} className="bg-white dark:bg-dashboard-card rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-500/10 px-2 py-1 rounded-full">
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{stat.value}</div>
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{stat.name}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart Section - Double Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-dashboard-card rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Revenue Overview</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Monthly revenue performance</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                            <EllipsisHorizontalIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <RevenueChart />
                </div>

                <div className="bg-white dark:bg-dashboard-card rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">User Activity</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Weekly platform engagement</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                            <EllipsisHorizontalIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <ActivityChart />
                </div>
            </div>

            {/* Quick Actions - Clean Minimal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-dashboard-card rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl ring-1 ring-blue-100 dark:ring-blue-900/30">
                                <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Platform Management</h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm font-medium">Oversee all registered agents, manage approvals, and monitor system-wide activity.</p>
                        <Link
                            to="/admin/agents"
                            className="inline-flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700 hover:shadow-blue-500/20 transition-all duration-200"
                        >
                            View All Agents
                        </Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-dashboard-card rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl ring-1 ring-emerald-100 dark:ring-emerald-900/30">
                                <CurrencyDollarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Subscription Plans</h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm font-medium">Configure pricing tiers, update features, and manage billing cycles.</p>
                        <Link
                            to="/admin/plans"
                            className="inline-flex items-center bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-emerald-700 hover:shadow-emerald-500/20 transition-all duration-200"
                        >
                            Manage Plans
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-dashboard-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Activity</th>
                                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {[
                                { action: 'New agent registered', time: '2 hours ago', icon: UsersIcon, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', status: 'Agent' },
                                { action: 'Subscription upgraded', time: '5 hours ago', icon: CurrencyDollarIcon, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', status: 'Payment' },
                                { action: 'New listing created', time: '1 day ago', icon: BuildingOfficeIcon, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', status: 'Listing' },
                            ].map((item, i) => (
                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-lg ${item.bg} ${item.color} mr-3 ring-1 ring-gray-100 dark:ring-gray-700`}>
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{item.action}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-500 dark:text-gray-400">
                                        {item.time}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${item.color.includes('blue') ? 'bg-blue-50 text-blue-600 border-blue-100' : item.color.includes('emerald') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
