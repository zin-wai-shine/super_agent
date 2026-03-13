import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { agentApi } from '../../services/api';
import RevenueChart from '../../components/Common/RevenueChart';
import ActivityChart from '../../components/Common/ActivityChart';
import {
    BuildingOfficeIcon,
    EyeIcon,
    UsersIcon,
    PlusIcon,
    ArrowTrendingUpIcon,
    EllipsisHorizontalIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { getMediaUrl } from '../../utils/media';

import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';

const AgentDashboard = () => {
    const { user } = useAuth();
    const { lastMessage } = useWebSocket();
    const [stats, setStats] = useState(null);
    const [recentListings, setRecentListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        try {
            const response = await agentApi.getDashboard();
            setStats(response.data.stats);
            setRecentListings(response.data.recent_listings || []);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    // WebSocket real-time updates
    useEffect(() => {
        if (lastMessage) {
            // Re-fetch dashboard data for various updates
            fetchDashboard();
        }
    }, [lastMessage]);

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const statCards = [
        {
            name: 'Total Listings',
            value: stats?.total_listings || 0,
            icon: BuildingOfficeIcon,
            iconBg: 'bg-primary-50 text-primary-600 dark:bg-primary-600/10 dark:text-primary-400',
            trend: '+2 this week'
        },
        {
            name: 'Total Views',
            value: stats?.total_views || 0,
            icon: EyeIcon,
            iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-600/10 dark:text-blue-400',
            trend: 'Lifetime'
        },
        {
            name: 'Published',
            value: stats?.published_listings || 0,
            icon: BuildingOfficeIcon,
            iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-600/10 dark:text-emerald-400',
            trend: 'Active'
        },
        {
            name: 'Sub-Agents',
            value: stats?.total_sub_agents || 0,
            icon: UsersIcon,
            iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-600/10 dark:text-indigo-400',
            trend: 'Team'
        },
        {
            name: 'Total Appointments',
            value: stats?.total_appointments || 0,
            icon: CalendarDaysIcon,
            iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-600/10 dark:text-amber-400',
            trend: `${stats?.appointments_this_week || 0} this week`,
            feature: 'appointments'
        },
        {
            name: 'Registered Users',
            value: stats?.total_users || 0,
            icon: UsersIcon,
            iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-600/10 dark:text-purple-400',
            trend: 'Direct'
        },
    ];

    // Filter cards based on feature flags (SAFE VERSION)
    const filteredCards = statCards.filter(card => {
        const sub = user?.agent?.subscription || user?.agent?.Subscription;
        if (!sub) return true;
        if (card.feature === 'appointments') {
            // Check for allow_appointments safely
            return sub.allow_appointments === true || sub.AllowAppointments === true;
        }
        return true;
    });

    return (
        <div className="space-y-8">
            {/* Header */}


            {/* Stats Grid - Clean Minimal Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredCards.map((stat) => (
                    <div key={stat.name} className="bg-white dark:bg-dashboard-card rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{stat.name}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{stat.value}</p>
                                <div className="flex items-center text-xs">
                                    <ArrowTrendingUpIcon className="w-3 h-3 text-green-500 mr-1" />
                                    <span className="text-green-600 dark:text-green-500 font-medium">{stat.trend}</span>
                                    <span className="text-gray-400 dark:text-gray-500 ml-1">vs last period</span>
                                </div>
                            </div>
                            <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
                                <stat.icon className="w-5 h-5" aria-hidden="true" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white dark:bg-dashboard-card rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="mb-4">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Monthly revenue performance</p>
                    </div>
                    <RevenueChart />
                </div>

                {/* Activity Chart */}
                <div className="bg-white dark:bg-dashboard-card rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="mb-4">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">User Activity</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Weekly platform engagement</p>
                    </div>
                    <ActivityChart />
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Recent Listings */}
                <div className="lg:col-span-2">
                    {/* Recent Listings */}
                    <div className="bg-white dark:bg-dashboard-card rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Listings</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{recentListings.length} new listings this week</p>
                            </div>
                            <Link to="/dashboard/listings" className="text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline">View all</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50/50 dark:bg-gray-800/20 rounded-lg">
                                    <tr>
                                        <th className="px-4 py-3 font-medium rounded-l-lg">Property</th>
                                        <th className="px-4 py-3 font-medium">Price</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium rounded-r-lg">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {recentListings.map((listing) => (
                                        <tr key={listing.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                                        {listing.images?.[0] ? (
                                                            <img src={getMediaUrl(listing.images[0])} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <BuildingOfficeIcon className="w-6 h-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{listing.title}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{listing.location}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                ฿{listing.price?.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${listing.status === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-600/10 dark:text-emerald-400' :
                                                    listing.status === 'draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-600/10 dark:text-gray-400' :
                                                        'bg-amber-100 text-amber-800 dark:bg-amber-600/10 dark:text-amber-400'
                                                    }`}>
                                                    {listing.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <button className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                                    <EllipsisHorizontalIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Quick Actions */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-dashboard-card rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                             <Link to="/dashboard/listings/new" className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-primary-500/10 transition-colors group">
                                <div className="p-2 bg-primary-50 dark:bg-primary-600/15 text-primary-600 dark:text-primary-400 rounded-lg group-hover:scale-110 transition-transform">
                                    <PlusIcon className="w-5 h-5" />
                                </div>
                                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Add New Listing</span>
                            </Link>
                            <Link to="/dashboard/users" className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-purple-500/10 transition-colors group">
                                <div className="p-2 bg-purple-50 dark:bg-purple-600/15 text-purple-600 dark:text-purple-400 rounded-lg group-hover:scale-110 transition-transform">
                                    <UsersIcon className="w-5 h-5" />
                                </div>
                                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Manage Users</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
