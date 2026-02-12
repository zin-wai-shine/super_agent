import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { agentApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
    Cog6ToothIcon,
    CurrencyDollarIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const AgentSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            // We can fetch settings from agent info public endpoint or a specific settings endpoint
            // For now, let's assume we can get it from getAgentInfo via public or dedicated endpoint.
            // Using publicApi.getAgentInfo wouldn't be right as it uses subdomain/tenant context.
            // We should use a protected endpoint.
            // Wait, we didn't adding GET /dashboard/settings.
            // But we can get current agent info via getProfile or getTheme? No.
            // Actually, we usually preload agent settings or have a "get me" for agent.
            // Let's rely on the fact that we can fetch "theme" or just use a new "getSettings" if we had one.
            // BUT, looking at backend, we didn't add GET /settings.
            // However, we *published* these fields in public info.
            // Let's use `agentApi.getTheme()`? No, that returns Theme struct.
            // Let's check `GetProfile` in AuthController.

            // To be safe, I should probably have added GET /settings.
            // But for now, as a workaround or if I missed it, I can add it, OR use existing data.
            // `AuthMiddleware` puts agent in context. `GetListings` uses it.
            // Let's add GET /settings quickly?
            // Or... wait, `GetAgentInfo` in PublicController is for PUBLIC.

            // Re-evaluating: I missed adding GET /dashboard/settings in backend plan.
            // I should add it now to be complete.
            // But to save time/steps, maybe there is another way?
            // `GetTheme` returns `Theme` model.
            // `GetDashboard` returns stats.

            // Okay, I will add GET /dashboard/settings quickly in backend.

            // Wait, I can't interrupt this file creation easily.
            // I will write the frontend assuming GET /dashboard/settings exists, and then go BACK to backend to add it.

            const response = await agentApi.getSettings(); // I need to add this to api.js too
            reset(response.data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            // If it fails (e.g. 404), maybe just default to 0
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            await agentApi.updateSettings({
                min_price_limit: parseFloat(data.min_price_limit),
                max_price_limit: parseFloat(data.max_price_limit),
                price_format: data.price_format,
                description: data.description,
                vision: data.vision,
                mission: data.mission,
                facebook: data.facebook,
                instagram: data.instagram,
                linkedin: data.linkedin,
                line: data.line,
                phone: data.phone
            });
            toast.success('Settings updated successfully!');
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Cog6ToothIcon className="w-8 h-8 text-primary-500" />
                        General Settings
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Configure general preferences for your agent site.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-dashboard-card rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <CurrencyDollarIcon className="w-4 h-4 text-primary-500" />
                        Search Price Limits
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    <p className="text-sm text-gray-500 mb-4">
                        Define the minimum and maximum price range users can search for on your public site.
                        Leave as 0 for no limit.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Site Content Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-l-4 border-primary-500 pl-3">
                                Profile & About
                            </h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="input-label">Bio / Description</label>
                                    <textarea
                                        rows={4}
                                        className="input-field mt-1"
                                        placeholder="Enter a brief bio or description of your agency..."
                                        {...register('description')}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="input-label">Our Vision</label>
                                        <textarea
                                            rows={3}
                                            className="input-field mt-1 italic"
                                            placeholder="What is your long-term goal?"
                                            {...register('vision')}
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">Our Mission</label>
                                        <textarea
                                            rows={3}
                                            className="input-field mt-1"
                                            placeholder="How do you help your clients?"
                                            {...register('mission')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-l-4 border-primary-500 pl-3 mb-6">
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="input-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="input-field mt-1"
                                        placeholder="+66 81 234 5678"
                                        {...register('phone')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Media Section */}
                        <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-l-4 border-primary-500 pl-3 mb-6">
                                Social Media Links
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="input-label">Facebook URL</label>
                                    <input
                                        type="url"
                                        className="input-field mt-1"
                                        placeholder="https://facebook.com/..."
                                        {...register('facebook')}
                                    />
                                </div>
                                <div>
                                    <label className="input-label">Instagram URL</label>
                                    <input
                                        type="url"
                                        className="input-field mt-1"
                                        placeholder="https://instagram.com/..."
                                        {...register('instagram')}
                                    />
                                </div>
                                <div>
                                    <label className="input-label">LinkedIn URL</label>
                                    <input
                                        type="url"
                                        className="input-field mt-1"
                                        placeholder="https://linkedin.com/in/..."
                                        {...register('linkedin')}
                                    />
                                </div>
                                <div>
                                    <label className="input-label">Line ID / Link</label>
                                    <input
                                        type="text"
                                        className="input-field mt-1"
                                        placeholder="Line ID or link"
                                        {...register('line')}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-l-4 border-primary-500 pl-3 mb-6">
                                Search Configuration
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Min Price Limit */}
                                <div>
                                    <label htmlFor="min_price_limit" className="input-label">
                                        Minimum Price Limit
                                    </label>
                                    <div className="relative mt-1 rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            id="min_price_limit"
                                            className="input-field pl-7"
                                            placeholder="0"
                                            {...register('min_price_limit', { valueAsNumber: true })}
                                        />
                                    </div>
                                </div>

                                {/* Max Price Limit */}
                                <div>
                                    <label htmlFor="max_price_limit" className="input-label">
                                        Maximum Price Limit
                                    </label>
                                    <div className="relative mt-1 rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            id="max_price_limit"
                                            className="input-field pl-7"
                                            placeholder="0"
                                            {...register('max_price_limit', { valueAsNumber: true })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Price Format Selection */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <label className="input-label mb-3 block">Price Display Format</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none data-[checked]:border-primary-600 data-[checked]:ring-1 data-[checked]:ring-primary-600 dark:bg-gray-800 dark:border-gray-700">
                                    <input
                                        type="radio"
                                        value="full"
                                        {...register('price_format')}
                                        className="sr-only"
                                    />
                                    <span className="flex flex-1">
                                        <span className="flex flex-col">
                                            <span className="block text-sm font-medium text-gray-900 dark:text-white">Full Price</span>
                                            <span className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                e.g. 3,000 / mo
                                            </span>
                                        </span>
                                    </span>
                                    <span className={`h-5 w-5 rounded-full border flex items-center justify-center ${errors.price_format ? 'border-red-300' : 'border-gray-300'}`}>
                                        <span className={`h-2.5 w-2.5 rounded-full bg-primary-600 ${register('price_format').value === 'full' ? 'block' : 'hidden'}`} />
                                    </span>
                                    <div className={`absolute -inset-px rounded-lg border-2 pointer-events-none ${"full" === (document.querySelector('input[name="price_format"]:checked')?.value) ? 'border-primary-600' : 'border-transparent'}`} aria-hidden="true" />
                                </label>

                                <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none data-[checked]:border-primary-600 data-[checked]:ring-1 data-[checked]:ring-primary-600 dark:bg-gray-800 dark:border-gray-700">
                                    <input
                                        type="radio"
                                        value="short"
                                        {...register('price_format')}
                                        className="sr-only"
                                    />
                                    <span className="flex flex-1">
                                        <span className="flex flex-col">
                                            <span className="block text-sm font-medium text-gray-900 dark:text-white">Short Price</span>
                                            <span className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                e.g. 3K / mo
                                            </span>
                                        </span>
                                    </span>
                                    <span className={`h-5 w-5 rounded-full border flex items-center justify-center ${errors.price_format ? 'border-red-300' : 'border-gray-300'}`}>
                                        <span className={`h-2.5 w-2.5 rounded-full bg-primary-600 ${register('price_format').value === 'short' ? 'block' : 'hidden'}`} />
                                    </span>
                                    <div className={`absolute -inset-px rounded-lg border-2 pointer-events-none ${"short" === (document.querySelector('input[name="price_format"]:checked')?.value) ? 'border-primary-600' : 'border-transparent'}`} aria-hidden="true" />
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary px-8 h-[42px] shadow-primary-500/20"
                            >
                                {saving ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircleIcon className="w-5 h-5" />
                                        Save Settings
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AgentSettings;
