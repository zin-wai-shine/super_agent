import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { bannerApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
    PhotoIcon,
    TrashIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

const BannerManagement = () => {
    const { isSuperAdmin } = useAuth();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const response = await bannerApi.getBanners();
            setBanners(response.data);
        } catch (error) {
            console.error("Failed to fetch banners", error);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // Convert days_active to int
            const payload = {
                ...data,
                days_active: parseInt(data.days_active, 10),
                is_active: true
            };

            await axios.post('/api/banners', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBanners();
            reset();
        } catch (error) {
            console.error("Failed to create banner", error);
            alert("Failed to create banner");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this banner?")) return;
        try {
            await bannerApi.deleteBanner(id);
            fetchBanners();
        } catch (error) {
            console.error("Failed to delete banner", error);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create Form */}
                <div className="bg-white shadow rounded-lg p-6 h-fit">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Create New Banner
                    </h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="input-label">Title</label>
                            <input
                                type="text"
                                className="input-field"
                                {...register('title', { required: 'Title is required' })}
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                        </div>

                        <div>
                            <label className="input-label">Image URL</label>
                            <input
                                type="url"
                                className="input-field"
                                {...register('image_url', { required: 'Image URL is required' })}
                            />
                            {errors.image_url && <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>}
                        </div>

                        <div>
                            <label className="input-label">Link URL (Optional)</label>
                            <input
                                type="url"
                                className="input-field"
                                {...register('link_url')}
                            />
                        </div>

                        <div>
                            <label className="input-label">Target Role</label>
                            <select className="input-field" {...register('target_role')}>
                                {isSuperAdmin ? (
                                    <>
                                        <option value="all">All Users</option>
                                        <option value="agent">Agents Only</option>
                                        <option value="public">Public Only</option>
                                    </>
                                ) : (
                                    <option value="public">My Site Visitors</option>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="input-label">Duration (Days)</label>
                            <input
                                type="number"
                                className="input-field"
                                defaultValue={30}
                                {...register('days_active')}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? 'Creating...' : 'Create Banner'}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Active Banners</h2>
                    {banners.length === 0 ? (
                        <p className="text-gray-500">No active banners.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {banners.map((banner) => (
                                <div key={banner.id} className="bg-white shadow rounded-lg overflow-hidden flex flex-col sm:flex-row">
                                    <div className="sm:w-48 h-32 relative bg-gray-100">
                                        <img
                                            src={banner.image_url}
                                            alt={banner.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/300x150?text=No+Image' }}
                                        />
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{banner.title}</h3>
                                            <p className="text-sm text-gray-500 truncate">{banner.link_url}</p>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                                                Target: {banner.target_role}
                                            </span>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <button
                                                onClick={() => handleDelete(banner.id)}
                                                className="text-red-600 hover:text-red-900 text-sm font-medium flex items-center"
                                            >
                                                <TrashIcon className="w-4 h-4 mr-1" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BannerManagement;
