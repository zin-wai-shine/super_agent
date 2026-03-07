import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { agentApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
    SwatchIcon,
    ArrowPathIcon,
    PhotoIcon,
    DocumentTextIcon,
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
    const [uploadingSharePreview, setUploadingSharePreview] = useState(false);
    const [activeTab, setActiveTab] = useState('brand');
    const logoInputRef = useRef(null);
    const sharePreviewInputRef = useRef(null);

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
        share_preview_image: '',
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
        navbar_logo_height: 100,
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
        register('share_preview_image');
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
        register('navbar_logo_height');
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
                share_preview_image: theme.share_preview_image || '',
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
                navbar_logo_height: theme.navbar_logo_height ?? DEFAULT_THEME.navbar_logo_height,
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

    const resetField = (fieldName) => {
        setValue(fieldName, DEFAULT_THEME[fieldName]);
        toast.success(`${fieldName.replace('_', ' ')} reset to default`);
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

    const handleSharePreviewUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Preview image must be smaller than 2MB');
            return;
        }

        setUploadingSharePreview(true);
        try {
            const response = await agentApi.uploadLogo(file);
            setValue('share_preview_image', response.data.url);
            toast.success('Share preview image uploaded!');
        } catch (error) {
            toast.error('Failed to upload share preview image');
        } finally {
            setUploadingSharePreview(false);
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

            <div className="h-[calc(100vh-200px)] min-h-[600px] w-full bg-white dark:bg-dashboard-card rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
                {/* Header Tabs Navigation */}
                <div className="flex border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm z-20">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-8 py-5 flex items-center gap-2 transition-all relative group h-full ${activeTab === tab.id
                                ? 'text-primary-600 dark:text-primary-400 bg-white dark:bg-white/5'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5'
                                }`}
                        >
                            <span className={`text-[10px] font-extrabold uppercase tracking-widest transition-colors ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400'}`}>
                                {tab.label}
                            </span>

                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 shadow-[0_-2px_10px_rgba(38,99,235,0.3)]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-white dark:bg-transparent">
                    {/* Section Label Header */}
                    <div className="mb-6 pb-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
                        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                            <div className="p-2 bg-primary-500/10 rounded-lg">
                                {React.createElement(tabs.find(t => t.id === activeTab).icon, { className: "w-5 h-5 text-primary-500" })}
                            </div>
                            {tabs.find(t => t.id === activeTab).label}
                        </h2>
                    </div>

                    {activeTab === 'brand' && (
                        <div className="space-y-8 animate-fadeIn">
                            {/* Navbar Preview Section */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Website Navbar Preview</label>
                                        <p className="text-[11px] text-gray-400">Preview of your public header.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => logoInputRef.current?.click()}
                                            className="text-[10px] font-bold text-primary-500 uppercase tracking-widest hover:text-primary-600 transition-colors"
                                        >
                                            {watchAll.logo_url ? 'Change Logo' : 'Upload Logo'}
                                        </button>
                                        {watchAll.logo_url && (
                                            <button
                                                type="button"
                                                onClick={() => resetField('logo_url')}
                                                className="p-1 text-gray-400 hover:text-primary-500 transition-colors"
                                                title="Reset Logo"
                                            >
                                                <ArrowPathIcon className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="relative bg-white dark:bg-gray-950 border border-gray-100 dark:border-white/5 rounded-[5px] overflow-hidden">
                                    <div className="h-20 md:h-28 flex items-center px-6 md:px-12 justify-between">
                                        <div className="flex items-center">
                                            <div
                                                className="w-[55px] h-[51px] md:w-[150px] md:h-[51px] bg-[length:100%_auto] bg-no-repeat bg-left transition-all duration-300"
                                                style={{
                                                    backgroundImage: `url(${getMediaUrl(watchAll.logo_url || '/default_logo.png')})`,
                                                    transformOrigin: 'left',
                                                    transform: `scale(${preview.navbar_logo_height / 100})`
                                                }}
                                            />
                                        </div>
                                        <div className="hidden md:flex items-center gap-6 opacity-30 pointer-events-none">
                                            <div className="h-2 w-16 bg-gray-300 rounded-full" />
                                            <div className="h-2 w-16 bg-gray-200 rounded-full" />
                                            <div className="h-2 w-16 bg-gray-200 rounded-full" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
                                                <Bars3Icon className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Logo Scale Adjustment - Positioned directly under nav bar, no container */}
                                <div className="px-1 pt-2 max-w-2xl">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <ModernSlider
                                                label="Logo Display Scale"
                                                value={preview.navbar_logo_height}
                                                min={50}
                                                max={200}
                                                step={1}
                                                unit="%"
                                                onChange={(val) => setValue('navbar_logo_height', val)}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => resetField('navbar_logo_height')}
                                            className="mt-6 p-2 text-gray-400 hover:text-primary-500 transition-colors bg-gray-50 dark:bg-white/5 rounded-lg"
                                            title="Reset Scale"
                                        >
                                            <ArrowPathIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="mt-2 text-[10px] text-gray-400 italic">Adjust your logo size for the public website header.</p>
                                </div>
                            </div>

                            {/* Main Branding Grid: Site Info + Social Share (Col 6) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-gray-100 dark:border-white/5">
                                {/* Left Col: Site Attributes */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Header Site Title</label>
                                            <button
                                                type="button"
                                                onClick={() => resetField('header_text')}
                                                className="text-gray-400 hover:text-primary-500 transition-colors"
                                                title="Reset Title"
                                            >
                                                <ArrowPathIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            className="input-field bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl h-12 text-sm"
                                            placeholder="Super Real Estate"
                                            {...register('header_text')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Footer Attribution</label>
                                            <button
                                                type="button"
                                                onClick={() => resetField('footer_text')}
                                                className="text-gray-400 hover:text-primary-500 transition-colors"
                                                title="Reset Footer"
                                            >
                                                <ArrowPathIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            className="input-field bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl h-12 text-sm"
                                            placeholder="© 2024 Your Name"
                                            {...register('footer_text')}
                                        />
                                    </div>
                                </div>

                                {/* Right Col: Social Share Preview (Col 6) */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Social Share Preview</label>
                                        {watchAll.share_preview_image && (
                                            <button
                                                type="button"
                                                onClick={() => resetField('share_preview_image')}
                                                className="text-gray-400 hover:text-primary-500 transition-colors"
                                                title="Reset Share Image"
                                            >
                                                <ArrowPathIcon className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    <div
                                        onClick={() => sharePreviewInputRef.current?.click()}
                                        className="flex justify-center px-4 pt-4 pb-4 border-2 border-gray-100 dark:border-white/5 border-dashed rounded-xl hover:border-primary-400 dark:hover:border-primary-500 transition-all cursor-pointer group bg-gray-50/20 dark:bg-gray-900/10 min-h-[220px] flex-col items-center overflow-hidden"
                                    >
                                        <div className="w-full text-center">
                                            {watchAll.share_preview_image ? (
                                                <div className="relative w-full group-hover:scale-[1.01] transition-transform duration-300">
                                                    <img src={getMediaUrl(watchAll.share_preview_image)} alt="Preview" className="w-full h-auto object-cover rounded-lg shadow-sm" />
                                                    <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-primary-500">Change Image</div>
                                                </div>
                                            ) : (
                                                <div className="py-8">
                                                    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center mb-3 mx-auto">
                                                        <PhotoIcon className="h-6 w-6 text-primary-400" />
                                                    </div>
                                                    <div className="text-[11px] font-bold text-primary-600 uppercase tracking-widest">Add Share Image</div>
                                                    <p className="text-[10px] text-gray-400 mt-2">1200x630px recommended</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <input
                                type="file"
                                ref={logoInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleLogoUpload}
                            />
                            <input
                                type="file"
                                ref={sharePreviewInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleSharePreviewUpload}
                            />
                        </div>
                    )}

                    {activeTab === 'colors' && (
                        <div className="space-y-8 animate-fadeIn max-w-2xl">
                            <div className="space-y-4">
                                <label className="input-label uppercase tracking-widest text-[10px] font-bold text-gray-400">Typography</label>
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

                            <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-white/5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Color Palette</label>
                                <ModernColorPicker
                                    label="Primary Theme Color"
                                    value={preview.primary_color}
                                    onChange={(val) => setValue('primary_color', val)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThemeSettings;
