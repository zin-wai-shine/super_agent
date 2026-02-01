import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { agentApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
    BuildingOfficeIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const AgentListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter !== 'all') params.status = filter;
            if (search) params.search = search;

            const response = await agentApi.getListings(params);
            setListings(response.data || []);
        } catch (error) {
            console.error('Failed to fetch listings:', error);
            toast.error('Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [filter]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchListings();
    };

    const handlePublish = async (id, isPublished) => {
        try {
            if (isPublished) {
                await agentApi.unpublishListing(id);
                toast.success('Listing unpublished');
            } else {
                await agentApi.publishListing(id);
                toast.success('Listing published');
            }
            fetchListings();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;

        try {
            await agentApi.deleteListing(id);
            toast.success('Listing deleted');
            fetchListings();
        } catch (error) {
            toast.error('Failed to delete listing');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
                <Link to="/agent/listings/new" className="btn-primary flex items-center space-x-2">
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Listing</span>
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Filter tabs */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {['all', 'published', 'draft'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === tab
                                        ? 'bg-white text-gray-900 shadow'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search listings..."
                                className="input-field pl-10 py-2"
                            />
                        </div>
                    </form>
                </div>
            </div>

            {/* Listings Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : listings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Property</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Price</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Type</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Views</th>
                                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {listings.map((listing) => (
                                    <tr key={listing.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                    {listing.media?.[0]?.url ? (
                                                        <img
                                                            src={listing.media[0].url}
                                                            alt={listing.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <BuildingOfficeIcon className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 line-clamp-1">{listing.title}</div>
                                                    <div className="text-sm text-gray-500">{listing.station_name || listing.district}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(listing.price)}
                                            </div>
                                            {listing.listing_type === 'rent' && <div className="text-sm text-gray-500">/month</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="capitalize text-gray-700">{listing.property_type}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${listing.is_published ? 'badge-success' : 'badge-warning'}`}>
                                                {listing.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {listing.view_count || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handlePublish(listing.id, listing.is_published)}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title={listing.is_published ? 'Unpublish' : 'Publish'}
                                                >
                                                    {listing.is_published ? (
                                                        <EyeSlashIcon className="w-5 h-5" />
                                                    ) : (
                                                        <EyeIcon className="w-5 h-5" />
                                                    )}
                                                </button>
                                                <Link
                                                    to={`/agent/listings/${listing.id}/edit`}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(listing.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
                        <p className="text-gray-500 mb-4">Get started by creating your first property listing.</p>
                        <Link to="/agent/listings/new" className="btn-primary">
                            Add Listing
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentListings;
