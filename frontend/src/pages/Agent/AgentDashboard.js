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
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { getMediaUrl } from '../../utils/media';

const AgentDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentListings, setRecentListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchDashboard();
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
            name: 'Total Listings',
            value: stats?.total_listings || 0,
            icon: BuildingOfficeIcon,
            iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
            trend: '+2 this week'
        },
        {
            name: 'Total Views',
            value: stats?.total_views || 0,
            icon: EyeIcon,
            iconBg: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
            trend: 'Lifetime'
        },
        {
            name: 'Published',
            value: stats?.published_listings || 0,
            icon: BuildingOfficeIcon,
            iconBg: 'bg-green-500/10 text-green-600 dark:text-green-400',
            trend: 'Active'
        },
        {
            name: 'Sub-Agents',
            value: stats?.total_sub_agents || 0,
            icon: UsersIcon,
            iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
            trend: 'Team'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}


            {/* Stats Grid - Modern */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.name} className="bg-white dark:bg-dashboard-card rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-2.5 rounded-[3px] ${stat.iconBg}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-500/10 px-2 py-1 rounded-full">
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{stat.value}</div>
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{stat.name}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid - Double Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-dashboard-card rounded-[3px] p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Performance</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Projected metrics</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                            <EllipsisHorizontalIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <RevenueChart />
                </div>

                <div className="bg-white dark:bg-dashboard-card rounded-[3px] p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Views Activity</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Weekly listing views</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                            <EllipsisHorizontalIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <ActivityChart />
                </div>
            </div>


            {/* Recent Listings */}
            <div className="bg-white dark:bg-dashboard-card rounded-[3px] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Listings</h2>
                    <Link to="/agent/listings" className="text-primary-600 text-sm font-medium hover:text-primary-700 hover:underline">
                        View all listings
                    </Link>
                </div>

                {recentListings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Listing</th>
                                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {recentListings.map((listing) => (
                                    <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link to={`/agent/listings/${listing.id}/edit`} className="flex items-center">
                                                <div className="w-12 h-12 bg-gray-200 rounded-[3px] overflow-hidden flex-shrink-0 relative">
                                                    <img src={getMediaUrl(listing.media?.[0]?.url)} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-[13px] font-semibold text-gray-900 dark:text-white truncate max-w-[200px] group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                        {listing.title}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 dark:text-gray-400">{listing.property_type || 'Property'}</div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-[13px] font-medium text-gray-900 dark:text-white">
                                                {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(listing.price)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${listing.is_published
                                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                }`}>
                                                <span className={`w-1 h-1 rounded-full mr-1.5 ${listing.is_published ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                                {listing.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-[12px] text-gray-500 dark:text-gray-400">
                                            {listing.created_at ? format(new Date(listing.created_at), 'MMM dd, yyyy') : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="inline-flex p-4 rounded-full bg-gray-50 mb-4">
                            <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
                        </div>

                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No listings yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">Get started by creating your first property listing.</p>
                        <Link to="/agent/listings/new" className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap shadow-sm">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Create Listing
                        </Link>
                    </div>
                )}
            </div>
        </div>

    );
};

export default AgentDashboard;
