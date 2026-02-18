import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { agentApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
    SwatchIcon,
    ArrowPathIcon,
    PhotoIcon,
    TypeIcon,
    GlobeAltIcon,
    CloudArrowUpIcon,
    CheckCircleIcon,
    SparklesIcon,
    UserCircleIcon,
    ChartBarIcon,
    ArrowRightOnRectangleIcon,
    CalendarDaysIcon,
    Bars3Icon,
    MagnifyingGlassIcon,
    MapIcon,
    TagIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import StyledSelect from '../../components/Form/StyledSelect';
import { useAuth } from '../../contexts/AuthContext';
import { getMediaUrl } from '../../utils/media';
import ModernSlider from '../../components/ui/ModernSlider';
import ModernColorPicker from '../../components/ui/ModernColorPicker';
import ModernSwitch from '../../components/ui/ModernSwitch';
import ModernCornerRadiusInput from '../../components/ui/ModernCornerRadiusInput';
import ModernShadowPicker from '../../components/ui/ModernShadowPicker';

const ThemeSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [activeTab, setActiveTab] = useState('brand');
    const logoInputRef = useRef(null);

    const { register, control, handleSubmit, reset, setValue } = useForm({
        mode: 'onChange'
    });
    const watchAll = useWatch({ control });

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
        primary_color: '#2663EB',
        secondary_color: '#34a853',
        text_color: '#202124',
        logo_url: '',
        header_text: 'Super Real Estate',
        footer_text: '© 2024 Super Real Estate',
        font_family: 'Inter, sans-serif',
        button_radius: '0.3rem',
        card_radius: '0.3rem',
        menu_radius: '0.3rem',
        menu_background_color: '#ffffff',
        button_gradient: false,
        button_gradient_color2: '#34a853',
        shadow_style: 'soft',
        shadow_x: 0,
        shadow_y: 4,
        shadow_blur: 4,
        shadow_spread: 0,
        shadow_color: '#000000',
        shadow_opacity: 25,
        button_shadow_x: 0,
        button_shadow_y: 4,
        button_shadow_blur: 4,
        button_shadow_spread: 0,
        button_shadow_color: '#000000',
        button_shadow_opacity: 25,
    };

    // Derived state for live preview (always reflects form state)
    const preview = {
        ...DEFAULT_THEME,
        ...watchAll,
        font_family: watchAll?.font_family?.value || watchAll?.font_family || DEFAULT_THEME.font_family,
        menu_background_color: watchAll?.menu_background_color || DEFAULT_THEME.menu_background_color,
    };

    useEffect(() => {
        fetchTheme();
        register('primary_color');
        register('secondary_color');
        register('background_color');
        register('text_color');
        register('button_radius');
        register('card_radius');
        register('menu_radius');
        register('menu_background_color');
        register('button_gradient');
        register('button_gradient_color2');
        register('shadow_style');
        register('shadow_x');
        register('shadow_y');
        register('shadow_blur');
        register('shadow_spread');
        register('shadow_color');
        register('shadow_opacity');
        register('button_shadow_x');
        register('button_shadow_y');
        register('button_shadow_blur');
        register('button_shadow_spread');
        register('button_shadow_color');
        register('button_shadow_opacity');
    }, [register]);

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
                font_family: theme.font_family || DEFAULT_THEME.font_family,
                button_radius: theme.button_radius || DEFAULT_THEME.button_radius,
                card_radius: theme.card_radius || DEFAULT_THEME.card_radius,
                menu_radius: theme.menu_radius || DEFAULT_THEME.menu_radius,
                menu_background_color: theme.menu_background_color || DEFAULT_THEME.menu_background_color,
                button_gradient: theme.button_gradient || false,
                button_gradient_color2: theme.button_gradient_color2 || DEFAULT_THEME.button_gradient_color2,
                shadow_style: theme.shadow_style || 'soft',
                shadow_x: theme.shadow_x ?? DEFAULT_THEME.shadow_x,
                shadow_y: theme.shadow_y ?? DEFAULT_THEME.shadow_y,
                shadow_blur: theme.shadow_blur ?? DEFAULT_THEME.shadow_blur,
                shadow_spread: theme.shadow_spread ?? DEFAULT_THEME.shadow_spread,
                shadow_color: theme.shadow_color || DEFAULT_THEME.shadow_color,
                shadow_opacity: theme.shadow_opacity ?? DEFAULT_THEME.shadow_opacity,
                button_shadow_x: theme.button_shadow_x ?? DEFAULT_THEME.button_shadow_x,
                button_shadow_y: theme.button_shadow_y ?? DEFAULT_THEME.button_shadow_y,
                button_shadow_blur: theme.button_shadow_blur ?? DEFAULT_THEME.button_shadow_blur,
                button_shadow_spread: theme.button_shadow_spread ?? DEFAULT_THEME.button_shadow_spread,
                button_shadow_color: theme.button_shadow_color || DEFAULT_THEME.button_shadow_color,
                button_shadow_opacity: theme.button_shadow_opacity ?? DEFAULT_THEME.button_shadow_opacity,
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
            console.error(error);
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

    const hexToRgba = (hex, opacity) => {
        if (!hex) return 'rgba(0,0,0,0.25)';
        let color = hex.replace('#', '');
        if (color.length === 3) {
            color = color.split('').map(c => c + c).join('');
        }
        const r = parseInt(color.slice(0, 2), 16);
        const g = parseInt(color.slice(2, 4), 16);
        const b = parseInt(color.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const tabs = [
        { id: 'brand', label: 'Identity', icon: GlobeAltIcon },
        { id: 'colors', label: 'Colors & Type', icon: SwatchIcon },
        { id: 'buttons', label: 'Buttons', icon: SparklesIcon },
        { id: 'cards', label: 'Cards', icon: PhotoIcon },
        { id: 'menus', label: 'Menus & Dropdowns', icon: Bars3Icon },
    ];

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
                <div className="flex items-center gap-3">
                    <button
                        onClick={resetToDefaults}
                        className="btn-secondary h-[34px] text-[12px] px-3 flex items-center gap-2"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        Reset
                    </button>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={saving}
                        className="btn-primary h-[34px] text-[12px] px-4 flex items-center gap-2 shadow-lg shadow-primary-500/20"
                    >
                        {saving ? (
                            <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <CheckCircleIcon className="w-4 h-4" />
                        )}
                        Export & Build
                    </button>
                </div>
            </div>

            <div className="flex justify-center h-[calc(100vh-200px)] min-h-[600px]">
                {/* SETTINGS PANEL - CENTERED - FULL WIDTH */}
                <div className="w-full bg-white dark:bg-dashboard-card rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex relative">
                    {/* Content Area - Left Side */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white dark:bg-transparent rounded-l-xl">
                        {/* Section Title */}
                        <div className="mb-6 pb-4 border-b border-gray-50 dark:border-white/5">
                            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                {React.createElement(tabs.find(t => t.id === activeTab).icon, { className: "w-4 h-4 text-primary-500" })}
                                {tabs.find(t => t.id === activeTab).label}
                            </h2>
                        </div>
                        {activeTab === 'brand' && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Logo Upload */}
                                <div>
                                    <label className="input-label">Site Logo</label>
                                    <div
                                        onClick={() => logoInputRef.current?.click()}
                                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl hover:border-primary-400 dark:hover:border-primary-500 transition-colors cursor-pointer group bg-gray-50/30 dark:bg-gray-900/10"
                                    >
                                        <div className="space-y-1 text-center">
                                            {watchAll.logo_url ? (
                                                <div className="relative inline-block group-hover:scale-105 transition-transform duration-300">
                                                    <img src={getMediaUrl(watchAll.logo_url)} alt="Preview" className="h-16 w-auto mx-auto object-contain rounded" />
                                                    <div className="mt-2 text-[10px] text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Change Logo</div>
                                                </div>
                                            ) : (
                                                <>
                                                    {uploadingLogo ? (
                                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto"></div>
                                                    ) : (
                                                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-300 group-hover:text-primary-500 transition-colors duration-300" />
                                                    )}
                                                    <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center mt-2">
                                                        <span className="relative cursor-pointer rounded-md font-medium text-primary-600 dark:text-primary-400">Upload file</span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, WebP up to 2MB</p>
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

                                <div className="space-y-4">
                                    <div>
                                        <label className="input-label">Header Title</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Super Real Estate"
                                            {...register('header_text')}
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">Footer Text</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="© 2024 Your Name"
                                            {...register('footer_text')}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'colors' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
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

                                <div className="space-y-4 pt-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Palette</label>
                                    <ModernColorPicker
                                        label="Primary Color"
                                        value={preview.primary_color}
                                        onChange={(val) => setValue('primary_color', val)}
                                    />
                                    <ModernColorPicker
                                        label="Secondary Color"
                                        value={preview.secondary_color}
                                        onChange={(val) => setValue('secondary_color', val)}
                                    />
                                    <ModernColorPicker
                                        label="Background Color"
                                        value={preview.background_color}
                                        onChange={(val) => setValue('background_color', val)}
                                    />
                                    <ModernColorPicker
                                        label="Text Color"
                                        value={preview.text_color}
                                        onChange={(val) => setValue('text_color', val)}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'buttons' && (
                            <div className="space-y-8 animate-fadeIn pt-2">
                                {/* Inline Button Preview */}
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center gap-4 justify-center relative group">
                                    <span className="absolute top-2 left-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Button Preview</span>
                                    <div className="flex gap-4">
                                        <button
                                            className="px-6 py-2.5 text-white font-medium text-sm transition-all shadow-lg shadow-primary-500/20 whitespace-nowrap"
                                            style={{
                                                backgroundColor: preview.primary_color,
                                                borderRadius: preview.button_radius,
                                                backgroundImage: preview.button_gradient ? `linear-gradient(135deg, ${preview.primary_color}, ${preview.button_gradient_color2})` : 'none',
                                                boxShadow: `${preview.button_shadow_x}px ${preview.button_shadow_y}px ${preview.button_shadow_blur}px ${preview.button_shadow_spread}px ${hexToRgba(preview.button_shadow_color, preview.button_shadow_opacity)}`
                                            }}
                                        >
                                            Primary Button
                                        </button>
                                        <button
                                            className="px-6 py-2.5 font-medium text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 whitespace-nowrap"
                                            style={{
                                                borderRadius: preview.button_radius,
                                            }}
                                        >
                                            Secondary
                                        </button>
                                    </div>
                                </div>

                                <ModernCornerRadiusInput
                                    label="Button Corner Radius"
                                    value={preview.button_radius}
                                    onChange={(val) => setValue('button_radius', val)}
                                />
                                <ModernSwitch
                                    label="Enable Gradient"
                                    description="Use gradient background for primary buttons"
                                    checked={!!preview.button_gradient}
                                    onChange={(checked) => setValue('button_gradient', checked)}
                                />

                                {!!preview.button_gradient && (
                                    <ModernColorPicker
                                        label="Gradient End Color"
                                        value={preview.button_gradient_color2}
                                        onChange={(val) => setValue('button_gradient_color2', val)}
                                    />
                                )}
                                <ModernShadowPicker
                                    label="Button Shadow"
                                    x={preview.button_shadow_x}
                                    y={preview.button_shadow_y}
                                    blur={preview.button_shadow_blur}
                                    spread={preview.button_shadow_spread}
                                    color={preview.button_shadow_color}
                                    opacity={preview.button_shadow_opacity}
                                    onChange={(vals) => Object.entries(vals).forEach(([k, v]) => setValue(`button_shadow_${k}`, v))}
                                />
                            </div>
                        )}

                        {activeTab === 'cards' && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Inline Card Preview */}
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 flex justify-center relative">
                                    <span className="absolute top-2 left-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Card Preview</span>
                                    <div
                                        className="w-full max-w-[200px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 overflow-hidden"
                                        style={{
                                            borderRadius: preview.card_radius,
                                            boxShadow: `${preview.shadow_x}px ${preview.shadow_y}px ${preview.shadow_blur}px ${preview.shadow_spread}px ${hexToRgba(preview.shadow_color, preview.shadow_opacity)}`
                                        }}
                                    >
                                        <div className="h-24 bg-gray-200 dark:bg-gray-700 relative">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-secondary-500/20" />
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-700 rounded-md" />
                                            <div className="h-3 w-1/2 bg-gray-50 dark:bg-gray-800 rounded-md" />
                                        </div>
                                    </div>
                                </div>

                                <ModernCornerRadiusInput
                                    label="Card Corner Radius"
                                    value={preview.card_radius}
                                    onChange={(val) => setValue('card_radius', val)}
                                />
                                <ModernShadowPicker
                                    label="Card Shadow"
                                    x={preview.shadow_x}
                                    y={preview.shadow_y}
                                    blur={preview.shadow_blur}
                                    spread={preview.shadow_spread}
                                    color={preview.shadow_color}
                                    opacity={preview.shadow_opacity}
                                    onChange={(vals) => Object.entries(vals).forEach(([k, v]) => setValue(`shadow_${k}`, v))}
                                />
                            </div>
                        )}

                        {activeTab === 'menus' && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Mega Menu Preview */}
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 flex justify-center relative overflow-hidden">
                                    <span className="absolute top-2 left-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Mega Menu Layout Preview</span>
                                    <div
                                        className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 p-8 shadow-2xl transition-all duration-300 border border-gray-100 dark:border-white/10"
                                        style={{
                                            borderRadius: preview.menu_radius,
                                            backgroundColor: preview.menu_background_color,
                                            color: preview.text_color
                                        }}
                                    >
                                        {/* Column 1: Browse Properties Skeletons */}
                                        <div className="space-y-6">
                                            <div className="h-2 w-20 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse opacity-50" />
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <div className="h-3 w-24 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
                                                    <div className="h-2 w-32 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
                                                    <div className="h-2 w-28 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
                                                    <div className="h-2 w-36 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Column 2: Quick Filters Skeletons */}
                                        <div className="space-y-6">
                                            <div className="h-2 w-20 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse opacity-50" />
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <div className="h-2 w-24 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse opacity-60" />
                                                    <div className="h-10 w-full bg-gray-50/50 dark:bg-white/5 border border-gray-100/50 dark:border-white/10 rounded-xl animate-pulse" />
                                                </div>
                                                <div className="p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-100/50 dark:border-white/10 rounded-2xl flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
                                                        <div className="space-y-2">
                                                            <div className="h-2 w-20 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
                                                            <div className="h-1.5 w-24 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
                                                        </div>
                                                    </div>
                                                    <div className="w-10 h-5 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Column 3: Featured Section Skeletons */}
                                        <div className="space-y-4">
                                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-100/50 dark:border-white/10 animate-pulse">
                                                <div className="absolute inset-0 bg-gradient-to-t from-gray-200/50 dark:from-white/10 to-transparent" />
                                                <div className="absolute top-4 left-4 h-4 w-16 bg-primary-500/20 rounded-full" />
                                                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                                                    <div className="h-3 w-3/4 bg-gray-300 dark:bg-white/20 rounded-full" />
                                                    <div className="h-2 w-full bg-gray-200 dark:bg-white/10 rounded-full" />
                                                </div>
                                            </div>
                                            <div className="h-11 w-full bg-primary-500/20 rounded-xl animate-pulse flex items-center justify-center">
                                                <div className="h-2 w-24 bg-primary-500/40 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <ModernCornerRadiusInput
                                            label="Menu Corner Radius"
                                            value={preview.menu_radius}
                                            onChange={(val) => setValue('menu_radius', val)}
                                        />
                                        <ModernColorPicker
                                            label="Menu Background Color"
                                            value={preview.menu_background_color}
                                            onChange={(val) => setValue('menu_background_color', val)}
                                        />
                                    </div>
                                    <div className="p-4 bg-blue-50/50 dark:bg-primary-900/10 rounded-xl border border-blue-100/50 dark:border-primary-500/10">
                                        <div className="flex gap-3">
                                            <SparklesIcon className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-primary-900 dark:text-primary-100">Mega Menu Preview</h4>
                                                <p className="text-[10px] text-primary-800/60 dark:text-primary-200/40 leading-relaxed">
                                                    This preview shows how your site's navigation dropdowns will look. Adjust the radius and background color to match your brand's aesthetic.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Tabs - Right Side - Text Version */}
                    <div className="w-56 border-l border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm flex flex-col py-4 z-20">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full px-6 py-4 flex flex-row items-center justify-start transition-all relative group ${activeTab === tab.id
                                    ? 'text-primary-600 dark:text-primary-400 bg-white dark:bg-white/5'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5'
                                    }`}
                            >
                                <span className={`text-[10px] font-extrabold uppercase tracking-widest transition-colors ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400'}`}>
                                    {tab.label}
                                </span>

                                {activeTab === tab.id && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary-500 rounded-r-full shadow-[0_0_10px_rgba(38,99,235,0.5)]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeSettings;
