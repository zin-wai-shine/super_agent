import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { bannerApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import StyledSelect from '../../components/Form/StyledSelect';
import {
    PhotoIcon,
    TrashIcon,
    PlusIcon,
    InboxIcon
} from '@heroicons/react/24/outline';
import EmptyState from '../../components/Common/EmptyState';

const BannerManagement = () => {
    const { isSuperAdmin } = useAuth();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm();

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

            await bannerApi.createBanner(payload);
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Banner Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create Form */}
                <div className="bg-white dark:bg-dashboard-card shadow rounded-lg p-6 h-fit border dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
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
                            <Controller
                                name="target_role"
                                control={control}
                                defaultValue="all"
                                render={({ field }) => (
                                    <StyledSelect
                                        {...field}
                                        options={isSuperAdmin ? [
                                            { value: 'all', label: 'All Users' },
                                            { value: 'agent', label: 'Agents Only' },
                                            { value: 'public', label: 'Public Only' },
                                        ] : [
                                            { value: 'public', label: 'My Site Visitors' },
                                        ]}
                                    />
                                )}
                            />
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
                            className="btn-primary w-full shadow-sm"
                        >
                            {loading ? 'Creating...' : 'Create Banner'}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active Banners</h2>
                    {banners.length === 0 ? (
                        <div className="bg-white dark:bg-dashboard-card shadow rounded-lg border dark:border-gray-700">
                            <EmptyState
                                icon={InboxIcon}
                                title="No active banners"
                                description="There are currently no active banners being displayed to users."
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {banners.map((banner) => (
                                <div key={banner.id} className="bg-white dark:bg-dashboard-card shadow rounded-lg overflow-hidden flex flex-col sm:flex-row border dark:border-gray-700">
                                    <div className="sm:w-48 h-32 relative bg-gray-100 dark:bg-gray-800">
                                        <img
                                            src={banner.image_url}
                                            alt={banner.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/300x150?text=No+Image' }}
                                        />
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">{banner.title}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{banner.link_url}</p>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 mt-2">
                                                Target: {banner.target_role}
                                            </span>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <button
                                                onClick={() => handleDelete(banner.id)}
                                                className="p-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-100 dark:ring-red-900/30 hover:ring-red-200 dark:hover:ring-red-800 rounded-lg transition-all duration-200 flex items-center shadow-sm"
                                                title="Delete Banner"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                                <span className="ml-1 text-sm font-medium">Delete</span>
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
