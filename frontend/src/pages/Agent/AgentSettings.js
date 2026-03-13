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
import StyledSelect from '../../components/Form/StyledSelect';

const AgentSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
    const priceFormat = watch('price_format');

    const SOCIAL_PLATFORMS = [
        'Facebook', 'Instagram', 'Line', 'WhatsApp', 'LinkedIn',
        'Viber', 'TikTok', 'YouTube', 'Website', 'Other'
    ].map(p => ({ label: p, value: p }));

    const [socialLinks, setSocialLinks] = useState([]);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await agentApi.getSettings();
            reset(response.data);

            // Handle social links JSON
            if (response.data.social_links) {
                try {
                    const parsed = JSON.parse(response.data.social_links);
                    setSocialLinks(parsed && Array.isArray(parsed) ? parsed : []);
                } catch (e) {
                    setSocialLinks([]);
                }
            } else {
                // Migrate from old fields or show defaults
                const defaults = [];
                if (response.data.facebook) defaults.push({ platform: 'Facebook', value: response.data.facebook });
                if (response.data.instagram) defaults.push({ platform: 'Instagram', value: response.data.instagram });
                if (response.data.line) defaults.push({ platform: 'Line', value: response.data.line });

                if (defaults.length === 0) {
                    setSocialLinks([
                        { platform: 'Facebook', value: '' },
                        { platform: 'Line', value: '' },
                        { platform: 'Viber', value: '' }
                    ]);
                } else {
                    setSocialLinks(defaults);
                }
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const addSocialLink = () => {
        setSocialLinks([...socialLinks, { platform: 'Facebook', value: '' }]);
    };

    const removeSocialLink = (index) => {
        setSocialLinks(socialLinks.filter((_, i) => i !== index));
    };

    const updateSocialLink = (index, field, value) => {
        const newLinks = [...socialLinks];
        newLinks[index][field] = value;
        setSocialLinks(newLinks);
    };

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            // Filter out completely empty entries
            const filteredLinks = socialLinks.filter(l => l.value && l.value.trim() !== '');

            await agentApi.updateSettings({
                min_price_limit: parseFloat(data.min_price_limit) || 0,
                max_price_limit: parseFloat(data.max_price_limit) || 0,
                price_format: data.price_format,
                description: data.description,
                vision: data.vision,
                mission: data.mission,
                phone: data.phone,
                social_links: JSON.stringify(filteredLinks),
                // Keep old fields in sync for now if needed by other components
                facebook: filteredLinks.find(l => l.platform === 'Facebook')?.value || '',
                instagram: filteredLinks.find(l => l.platform === 'Instagram')?.value || '',
                linkedin: filteredLinks.find(l => l.platform === 'LinkedIn')?.value || '',
                line: filteredLinks.find(l => l.platform === 'Line')?.value || '',
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
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-l-4 border-primary-500 pl-3">
                                    Social Media Links
                                </h3>
                                <button
                                    type="button"
                                    onClick={addSocialLink}
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Link
                                </button>
                            </div>

                            <div className="space-y-4">
                                {socialLinks.map((link, index) => (
                                    <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-end animate-fade-in-up">
                                        <div className="w-full md:w-1/3">
                                            <label className="input-label">Platform</label>
                                            <div className="mt-1">
                                                <StyledSelect
                                                    options={SOCIAL_PLATFORMS}
                                                    value={link.platform}
                                                    onChange={(value) => updateSocialLink(index, 'platform', value)}
                                                    placeholder="Platform"
                                                    isSearchable={false}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-full md:flex-1">
                                            <label className="input-label">URL or ID</label>
                                            <input
                                                type="text"
                                                className="input-field mt-1"
                                                placeholder={link.platform === 'Line' || link.platform === 'Viber' ? 'ID or Link' : 'https://...'}
                                                value={link.value}
                                                onChange={(e) => updateSocialLink(index, 'value', e.target.value)}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeSocialLink(index)}
                                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                            title="Remove"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}

                                {socialLinks.length === 0 && (
                                    <div className="text-center py-10 bg-gray-50/50 dark:bg-dashboard-input/50 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 italic text-gray-400">
                                        No social links added yet.
                                    </div>
                                )}
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
                                <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none data-[checked]:border-primary-600 data-[checked]:ring-1 data-[checked]:ring-primary-600 dark:bg-dashboard-input dark:border-gray-700">
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
                                    <span className={`h-5 w-5 rounded-full border flex items-center justify-center ${errors.price_format ? 'border-red-300' : priceFormat === 'full' ? 'border-primary-600' : 'border-gray-300'}`}>
                                        <span className={`h-2.5 w-2.5 rounded-full bg-primary-600 ${priceFormat === 'full' ? 'block' : 'hidden'}`} />
                                    </span>
                                    <div className={`absolute -inset-px rounded-lg border-2 pointer-events-none ${priceFormat === 'full' ? 'border-primary-600' : 'border-transparent'}`} aria-hidden="true" />
                                </label>

                                <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none data-[checked]:border-primary-600 data-[checked]:ring-1 data-[checked]:ring-primary-600 dark:bg-dashboard-input dark:border-gray-700">
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
                                    <span className={`h-5 w-5 rounded-full border flex items-center justify-center ${errors.price_format ? 'border-red-300' : priceFormat === 'short' ? 'border-primary-600' : 'border-gray-300'}`}>
                                        <span className={`h-2.5 w-2.5 rounded-full bg-primary-600 ${priceFormat === 'short' ? 'block' : 'hidden'}`} />
                                    </span>
                                    <div className={`absolute -inset-px rounded-lg border-2 pointer-events-none ${priceFormat === 'short' ? 'border-primary-600' : 'border-transparent'}`} aria-hidden="true" />
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
