import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { agentApi } from '../../services/api';
import {
    BuildingOfficeIcon,
    EyeIcon,
    UsersIcon,
    PlusIcon,
    ArrowTrendingUpIcon,
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
        { name: 'Total Listings', value: stats?.total_listings || 0, icon: BuildingOfficeIcon, color: 'blue' },
        { name: 'Published', value: stats?.published_listings || 0, icon: EyeIcon, color: 'green' },
        { name: 'Drafts', value: stats?.draft_listings || 0, icon: ArrowTrendingUpIcon, color: 'yellow' },
        { name: 'Sub-Agents', value: stats?.total_sub_agents || 0, icon: UsersIcon, color: 'purple' },
    ];

    const colorClasses = {
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-green-50 text-green-700',
        yellow: 'bg-yellow-50 text-yellow-700',
        purple: 'bg-purple-50 text-purple-700',
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back! Here's your overview.</p>
                </div>
                <Link to="/agent/listings/new" className="btn-primary flex items-center space-x-2">
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Listing</span>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-gray-500 text-sm">{stat.name}</div>
                    </div>
                ))}
            </div>

            {/* Total Views */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-4xl font-bold">{stats?.total_views || 0}</div>
                        <div className="text-primary-100">Total views on your listings</div>
                    </div>
                    <EyeIcon className="w-16 h-16 text-white/20" />
                </div>
            </div>

            {/* Recent Listings */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Listings</h2>
                        <Link to="/agent/listings" className="text-primary-600 text-sm font-medium hover:text-primary-700">
                            View all
                        </Link>
                    </div>
                </div>

                {recentListings.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {recentListings.map((listing) => (
                            <Link
                                key={listing.id}
                                to={`/agent/listings/${listing.id}/edit`}
                                className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                                    {listing.media?.[0]?.url ? (
                                        <img
                                            src={listing.media[0].url}
                                            alt={listing.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="font-medium text-gray-900">{listing.title}</h3>
                                    <p className="text-sm text-gray-500">
                                        {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(listing.price)}
                                    </p>
                                </div>
                                <div>
                                    <span className={`badge ${listing.is_published ? 'badge-success' : 'badge-warning'}`}>
                                        {listing.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <BuildingOfficeIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No listings yet</p>
                        <Link to="/agent/listings/new" className="btn-primary mt-4">
                            Create your first listing
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentDashboard;
