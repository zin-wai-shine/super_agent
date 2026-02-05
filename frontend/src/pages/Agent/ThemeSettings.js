import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { agentApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
    SwatchIcon,
    ArrowPathIcon,
    PhotoIcon,
    TypeIcon,
    GlobeAltIcon,
    CloudArrowUpIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import StyledSelect from '../../components/Form/StyledSelect';
import { useAuth } from '../../contexts/AuthContext';
import { getMediaUrl } from '../../utils/media';

const ThemeSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const logoInputRef = useRef(null);

    const { register, control, handleSubmit, reset, watch, setValue } = useForm({
        mode: 'onChange'
    });
    const watchAll = watch();

    const fontOptions = [
        { value: 'Inter, sans-serif', label: 'Inter' },
        { value: 'Roboto, sans-serif', label: 'Roboto' },
        { value: 'Poppins, sans-serif', label: 'Poppins' },
        { value: 'Montserrat, sans-serif', label: 'Montserrat' },
        { value: 'Open Sans, sans-serif', label: 'Open Sans' },
        { value: 'Source Sans Pro, sans-serif', label: 'Source Sans Pro' },
        { value: 'system-ui, sans-serif', label: 'System Default' },
    ];

    const DEFAULT_THEME = {
        background_color: '#f5f5f5',
        primary_color: '#3b82f6',
        secondary_color: '#34a853',
        text_color: '#202124',
        logo_url: '',
        header_text: 'Super Real Estate',
        footer_text: '© 2024 Super Real Estate',
        font_family: 'Inter, sans-serif'
    };

    // Derived state for live preview (always reflects form state)
    const preview = {
        ...DEFAULT_THEME,
        ...watchAll,
        font_family: watchAll.font_family?.value || watchAll.font_family || DEFAULT_THEME.font_family
    };

    useEffect(() => {
        fetchTheme();
    }, []);

    const fetchTheme = async () => {
        try {
            const response = await agentApi.getTheme();
            const theme = response.data;
            const initialData = {
                background_color: theme.background_color || DEFAULT_THEME.background_color,
                primary_color: theme.primary_color || DEFAULT_THEME.primary_color,
                secondary_color: theme.secondary_color || DEFAULT_THEME.secondary_color,
                text_color: theme.text_color || DEFAULT_THEME.text_color,
                logo_url: theme.logo_url || '',
                header_text: theme.header_text || '',
                footer_text: theme.footer_text || '',
            };
            reset(initialData);

            const fontOption = fontOptions.find(f => f.value === (theme.font_family || DEFAULT_THEME.font_family));
            setValue('font_family', fontOption || fontOptions[0]);
        } catch (error) {
            console.error('Failed to fetch theme:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            await agentApi.updateTheme({
                ...data,
                font_family: data.font_family?.value || data.font_family,
            });
            toast.success('Theme updated successfully!');
        } catch (error) {
            toast.error('Failed to update theme');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Logo must be smaller than 2MB');
            return;
        }

        setUploadingLogo(true);
        try {
            const response = await agentApi.uploadLogo(file);
            setValue('logo_url', response.data.url);
            toast.success('Logo uploaded!');
        } catch (error) {
            toast.error('Failed to upload logo');
        } finally {
            setUploadingLogo(false);
        }
    };

    const resetToDefaults = () => {
        if (!window.confirm('Reset all theme settings to defaults?')) return;
        reset(DEFAULT_THEME);
        setValue('font_family', fontOptions[0]);
        toast.success('Reset to defaults');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <SwatchIcon className="w-8 h-8 text-primary-500" />
                        Theme Settings
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Customize your public site's appearance to match your brand.
                    </p>
                </div>
                <button
                    onClick={resetToDefaults}
                    className="btn-secondary h-[34px] text-[12px] px-3 flex items-center gap-2"
                >
                    <ArrowPathIcon className="w-4 h-4" />
                    Reset to Defaults
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* SETTINGS PANEL (LEFT) */}
                <div className="lg:col-span-7 space-y-6">
                    <form id="theme-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* 1. BRAND IDENTITY */}
                        <div className="bg-white dark:bg-dashboard-card rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <GlobeAltIcon className="w-4 h-4 text-primary-500" />
                                    Brand Identity
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Logo Upload */}
                                <div>
                                    <label className="input-label">Site Logo</label>
                                    <div
                                        onClick={() => logoInputRef.current?.click()}
                                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl hover:border-primary-400 dark:hover:border-primary-500 transition-colors cursor-pointer group bg-gray-50/30 dark:bg-gray-900/10"
                                    >
                                        <div className="space-y-1 text-center">
                                            {watchAll.logo_url ? (
                                                <div className="relative inline-block">
                                                    <img src={getMediaUrl(watchAll.logo_url)} alt="Preview" className="h-16 w-auto mx-auto object-contain rounded" />
                                                    <div className="mt-2 text-xs text-primary-600 dark:text-primary-400 font-medium">Click to change</div>
                                                </div>
                                            ) : (
                                                <>
                                                    {uploadingLogo ? (
                                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto"></div>
                                                    ) : (
                                                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                                    )}
                                                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="relative cursor-pointer rounded-md font-medium text-primary-600 dark:text-primary-400">Upload a file</span>
                                                        <p className="pl-1">or drag and drop</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">PNG, JPG, WebP up to 2MB</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={logoInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="input-label">Header Title</label>
                                        <input
                                            type="text"
                                            className="input-field h-[42px]"
                                            placeholder="Super Real Estate"
                                            {...register('header_text')}
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">Footer Text</label>
                                        <input
                                            type="text"
                                            className="input-field h-[42px]"
                                            placeholder="© 2024 Your Name"
                                            {...register('footer_text')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. COLORS & STYLE */}
                        <div className="bg-white dark:bg-dashboard-card rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 rounded-t-2xl">
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <SwatchIcon className="w-4 h-4 text-primary-500" />
                                    Visual Style
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="pb-6 border-b border-gray-50 dark:border-gray-800">
                                    <label className="input-label">Typography</label>
                                    <Controller
                                        name="font_family"
                                        control={control}
                                        render={({ field }) => (
                                            <StyledSelect
                                                {...field}
                                                options={fontOptions}
                                                placeholder="Select a font..."
                                                isSearchable={false}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {/* Primary Color */}
                                    <div className="space-y-2">
                                        <label className="input-label">Primary Accent</label>
                                        <div className="flex items-center gap-3 p-1 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-100 dark:border-gray-800">
                                            <input
                                                type="color"
                                                className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                                                {...register('primary_color')}
                                                value={preview.primary_color}
                                            />
                                            <input
                                                type="text"
                                                className="bg-transparent border-0 focus:ring-0 text-xs font-mono w-full"
                                                {...register('primary_color')}
                                                value={preview.primary_color}
                                            />
                                        </div>
                                    </div>

                                    {/* Secondary Color */}
                                    <div className="space-y-2">
                                        <label className="input-label">Secondary Color</label>
                                        <div className="flex items-center gap-3 p-1 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-100 dark:border-gray-800">
                                            <input
                                                type="color"
                                                className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                                                {...register('secondary_color')}
                                                value={preview.secondary_color}
                                            />
                                            <input
                                                type="text"
                                                className="bg-transparent border-0 focus:ring-0 text-xs font-mono w-full"
                                                {...register('secondary_color')}
                                                value={preview.secondary_color}
                                            />
                                        </div>
                                    </div>

                                    {/* Background Color */}
                                    <div className="space-y-2">
                                        <label className="input-label">Background</label>
                                        <div className="flex items-center gap-3 p-1 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-100 dark:border-gray-800">
                                            <input
                                                type="color"
                                                className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                                                {...register('background_color')}
                                                value={preview.background_color}
                                            />
                                            <input
                                                type="text"
                                                className="bg-transparent border-0 focus:ring-0 text-xs font-mono w-full"
                                                {...register('background_color')}
                                                value={preview.background_color}
                                            />
                                        </div>
                                    </div>

                                    {/* Text Color */}
                                    <div className="space-y-2">
                                        <label className="input-label">Body Text</label>
                                        <div className="flex items-center gap-3 p-1 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-100 dark:border-gray-800">
                                            <input
                                                type="color"
                                                className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                                                {...register('text_color')}
                                                value={preview.text_color}
                                            />
                                            <input
                                                type="text"
                                                className="bg-transparent border-0 focus:ring-0 text-xs font-mono w-full"
                                                {...register('text_color')}
                                                value={preview.text_color}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary px-8 h-[42px] shadow-primary-500/20"
                            >
                                {saving ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Applying Changes...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircleIcon className="w-5 h-5" />
                                        Save & Build Site
                                    </div>
                                )}
                            </button>
                        </div>

                    </form>
                </div>

                {/* LIVE PREVIEW (RIGHT) */}
                <div className="lg:col-span-5 relative">
                    <div className="sticky top-24 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Live Browser Preview</h2>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                <span className="w-1 h-1 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                Real-time
                            </span>
                        </div>

                        {/* BROWSER WINDOW MOCKUP */}
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col h-[520px] transform hover:scale-[1.01] transition-transform duration-500">
                            {/* Browser Header Bar */}
                            <div className="bg-gray-100/80 dark:bg-gray-900 px-4 py-2 flex items-center gap-4">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                </div>
                                <div className="flex-1 bg-white/50 dark:bg-white/10 rounded-md h-6 flex items-center px-3">
                                    <div className="text-[10px] text-gray-400 truncate">
                                        agent.{window.location.host}
                                    </div>
                                </div>
                            </div>

                            {/* PREVIEW CONTENT */}
                            <div
                                className="flex-1 overflow-y-auto transition-all duration-300"
                                style={{
                                    backgroundColor: preview.background_color,
                                    fontFamily: preview.font_family,
                                    color: preview.text_color
                                }}
                            >
                                {/* Navbar */}
                                <div className="bg-white/90 backdrop-blur-md px-4 py-3 border-b flex items-center justify-between shadow-sm sticky top-0 z-10">
                                    <div className="flex items-center gap-2">
                                        {preview.logo_url ? (
                                            <img src={getMediaUrl(preview.logo_url)} className="h-6 w-auto object-contain" alt="Logo" />
                                        ) : (
                                            <div className="w-6 h-6 rounded bg-gray-200" />
                                        )}
                                        <span className="text-xs font-bold leading-none" style={{ color: preview.text_color }}>
                                            {preview.header_text || 'Super Real Estate'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-2 rounded bg-gray-100" />
                                        <div className="w-8 h-2 rounded bg-gray-100" />
                                    </div>
                                </div>

                                {/* Hero / Content */}
                                <div className="p-6 space-y-4">
                                    <div className="space-y-1">
                                        <div className="h-2 w-24 rounded bg-gray-200" />
                                        <div className="h-5 w-48 rounded font-bold text-xl uppercase tracking-tight" style={{ color: preview.primary_color }}>
                                            Featured Property
                                        </div>
                                    </div>

                                    {/* Mock Listing Card */}
                                    <div className="bg-white rounded-xl shadow-lg border overflow-hidden p-0">
                                        <div className="h-32 bg-gray-100 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80)' }} />
                                        <div className="p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-bold">Luxury Penthouse</div>
                                                    <div className="text-[10px] text-gray-500">Sukhumvit, Bangkok</div>
                                                </div>
                                                <div className="text-sm font-bold" style={{ color: preview.primary_color }}>฿45,000</div>
                                            </div>
                                            <button
                                                className="w-full py-2.5 rounded-lg text-white font-bold text-[10px] uppercase tracking-wider transition-all"
                                                style={{ backgroundColor: preview.secondary_color }}
                                            >
                                                Book Viewing
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-10 p-6 border-t bg-black/5 flex flex-col items-center gap-3">
                                    <div className="flex gap-4">
                                        <div className="w-4 h-4 rounded-full bg-gray-300" />
                                        <div className="w-4 h-4 rounded-full bg-gray-300" />
                                        <div className="w-4 h-4 rounded-full bg-gray-300" />
                                    </div>
                                    <div className="text-[10px] opacity-60">
                                        {preview.footer_text || '© 2024 Super Real Estate. All rights reserved.'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hints */}
                        <div className="bg-primary-50 dark:bg-primary-900/10 rounded-xl p-4 border border-primary-100 dark:border-primary-900/30">
                            <h3 className="text-[11px] font-bold text-primary-700 dark:text-primary-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <CheckCircleIcon className="w-3.5 h-3.5" />
                                Expert Tip
                            </h3>
                            <p className="text-[11px] text-primary-600 dark:text-primary-500 leading-relaxed">
                                Darker body text and more vibrant primary colors generally lead to 15% better engagement for property buyers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeSettings;
