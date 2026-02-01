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
            iconBg: 'bg-blue-50 text-blue-600',
            trend: '+2 this week'
        },
        {
            name: 'Published',
            value: stats?.published_listings || 0,
            icon: EyeIcon,
            iconBg: 'bg-green-50 text-green-600',
            trend: 'Active'
        },
        {
            name: 'Drafts',
            value: stats?.draft_listings || 0,
            icon: ArrowTrendingUpIcon,
            iconBg: 'bg-amber-50 text-amber-600',
            trend: 'Pending'
        },
        {
            name: 'Sub-Agents',
            value: stats?.total_sub_agents || 0,
            icon: UsersIcon,
            iconBg: 'bg-purple-50 text-purple-600',
            trend: 'Team members'
        },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back! Here's your overview.</p>
                </div>
                <Link to="/agent/listings/new" className="btn-primary flex items-center space-x-2 px-4 py-2 rounded-xl shadow-sm shadow-primary-500/20 active:scale-95 transition-all">
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Listing</span>
                </Link>
            </div>

            {/* Stats Grid - Modern */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</div>
                            <div className="text-sm font-medium text-gray-500 mt-1">{stat.name}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid - Double Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Performance</h2>
                            <p className="text-sm text-gray-500">Projected metrics</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                            <EllipsisHorizontalIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <RevenueChart />
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Views Activity</h2>
                            <p className="text-sm text-gray-500">Weekly listing views</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                            <EllipsisHorizontalIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <ActivityChart />
                </div>
            </div>

            {/* Featured Section - Total Views */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 shadow-lg shadow-indigo-500/25">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500 opacity-20 rounded-full blur-2xl"></div>

                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between">
                    <div>
                        <div className="text-5xl font-bold text-white mb-2">{stats?.total_views || 0}</div>
                        <p className="text-indigo-100 text-lg">Total views across all your listings</p>
                    </div>
                    <div className="mt-6 sm:mt-0 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                        <EyeIcon className="w-12 h-12 text-white" />
                    </div>
                </div>
            </div>

            {/* Recent Listings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Recent Listings</h2>
                    <Link to="/agent/listings" className="text-primary-600 text-sm font-medium hover:text-primary-700 hover:underline">
                        View all listings
                    </Link>
                </div>

                {recentListings.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {recentListings.map((listing) => (
                            <Link
                                key={listing.id}
                                to={`/agent/listings/${listing.id}/edit`}
                                className="flex items-center p-4 hover:bg-gray-50 transition-all group"
                            >
                                <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 relative">
                                    {listing.media?.[0]?.url ? (
                                        <img
                                            src={listing.media[0].url}
                                            alt={listing.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="ml-4 flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">{listing.title}</h3>
                                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                                        {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(listing.price)}
                                    </p>
                                </div>
                                <div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${listing.is_published
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-amber-100 text-amber-800'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${listing.is_published ? 'bg-green-500' : 'bg-amber-500'
                                            }`}></span>
                                        {listing.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="inline-flex p-4 rounded-full bg-gray-50 mb-4">
                            <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No listings yet</h3>
                        <p className="text-gray-500 mt-1 mb-6">Get started by creating your first property listing.</p>
                        <Link to="/agent/listings/new" className="btn-primary inline-flex items-center">
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
