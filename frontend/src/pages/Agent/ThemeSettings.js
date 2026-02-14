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
    CheckCircleIcon,
    SparklesIcon,
    UserCircleIcon,
    ChartBarIcon,
    ArrowRightOnRectangleIcon,
    CalendarDaysIcon
} from '@heroicons/react/24/outline';
import StyledSelect from '../../components/Form/StyledSelect';
import { useAuth } from '../../contexts/AuthContext';
import { getMediaUrl } from '../../utils/media';
import ModernSlider from '../../components/ui/ModernSlider';
import ModernColorPicker from '../../components/ui/ModernColorPicker';
import ModernSwitch from '../../components/ui/ModernSwitch';
import ModernCornerRadiusInput from '../../components/ui/ModernCornerRadiusInput';
import ModernGradientPicker from '../../components/ui/ModernGradientPicker';

const ThemeSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [activeTab, setActiveTab] = useState('brand');
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
        button_gradient: false,
        button_gradient_style: '',
        shadow_style: 'soft'
    };

    // Derived state for live preview (always reflects form state)
    const preview = {
        ...DEFAULT_THEME,
        ...watchAll,
        font_family: watchAll.font_family?.value || watchAll.font_family || DEFAULT_THEME.font_family
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
        register('button_gradient');
        register('button_gradient_style');
        register('shadow_style');
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
                button_radius: theme.button_radius || DEFAULT_THEME.button_radius,
                card_radius: theme.card_radius || DEFAULT_THEME.card_radius,
                menu_radius: theme.menu_radius || DEFAULT_THEME.menu_radius,
                button_gradient: theme.button_gradient || false,
                button_gradient_style: theme.button_gradient_style || '',
                shadow_style: theme.shadow_style || 'soft',
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
        { id: 'cards', label: 'Cards & Menus', icon: PhotoIcon },
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)] min-h-[600px]">
                {/* SETTINGS PANEL (LEFT) - SCROLLABLE */}
                <div className="lg:col-span-4 bg-white dark:bg-dashboard-card rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex relative">
                    {/* Sidebar Tabs - Icon Only Version */}
                    <div className="w-14 sm:w-16 border-r border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm flex flex-col py-4 z-20">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full py-4 flex flex-col items-center justify-center transition-all relative group ${activeTab === tab.id
                                    ? 'text-primary-600 dark:text-primary-400 bg-white dark:bg-white/5'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400'}`} />

                                {/* Tooltip */}
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] shadow-2xl border border-white/10 translate-x-1 group-hover:translate-x-0">
                                    {tab.label}
                                    {/* Arrow */}
                                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45 border-l border-b border-white/10" />
                                </div>

                                {activeTab === tab.id && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary-500 rounded-l-full shadow-[0_0_10px_rgba(38,99,235,0.5)]" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white dark:bg-transparent rounded-r-xl">
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
                                                backgroundImage: preview.button_gradient ? (preview.button_gradient_style || `linear-gradient(135deg, ${preview.primary_color}, ${preview.secondary_color})`) : 'none',
                                                boxShadow: preview.shadow_style === 'hard' ? '4px 4px 0px 0px rgba(0,0,0,1)' : ''
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
                                    <ModernGradientPicker
                                        label="Gradient Style"
                                        value={preview.button_gradient_style || `linear-gradient(135deg, ${preview.primary_color} 0%, ${preview.secondary_color} 100%)`}
                                        onChange={(val) => setValue('button_gradient_style', val)}
                                    />
                                )}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                        Shadow Style
                                    </label>
                                    <StyledSelect
                                        value={preview.shadow_style}
                                        onChange={(e) => setValue('shadow_style', e.target.value)}
                                    >
                                        <option value="none">None</option>
                                        <option value="soft">Soft</option>
                                        <option value="hard">Hard</option>
                                    </StyledSelect>
                                </div>
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
                                            boxShadow: preview.shadow_style === 'hard' ? '4px 4px 0px 0px rgba(0,0,0,1)' : '0 10px 30px -5px rgb(0 0 0 / 0.05)'
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

                                {/* Inline Menu Preview */}
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 flex justify-center relative">
                                    <span className="absolute top-2 left-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Menu Dropdown Preview</span>
                                    <div
                                        className="w-full max-w-[200px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 overflow-hidden shadow-2xl transition-all duration-300"
                                        style={{
                                            borderRadius: preview.menu_radius,
                                        }}
                                    >
                                        {/* Menu Header with User Profile Mockup */}
                                        <div className="p-4 border-b border-gray-50 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                                                style={{ backgroundColor: preview.primary_color }}
                                            >
                                                JD
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="h-2 w-16 bg-gray-900 dark:bg-white/20 rounded-full" />
                                                <div className="h-1.5 w-24 bg-gray-400 dark:bg-white/10 rounded-full" />
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="p-2 space-y-1">
                                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                                                <ChartBarIcon className="w-4 h-4" />
                                                <div className="h-2 w-16 bg-current opacity-50 rounded-full" />
                                            </div>
                                            <div className="flex items-center gap-3 px-3 py-2 text-gray-400 dark:text-white/40">
                                                <CalendarDaysIcon className="w-4 h-4" />
                                                <div className="h-2 w-20 bg-current opacity-20 rounded-full" />
                                            </div>
                                            <div className="h-px bg-gray-50 dark:bg-white/10 my-1 mx-2" />
                                            <div className="flex items-center gap-3 px-3 py-2 text-rose-500">
                                                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                                <div className="h-2 w-14 bg-current opacity-40 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <ModernCornerRadiusInput
                                    label="Card Corner Radius"
                                    value={preview.card_radius}
                                    onChange={(val) => setValue('card_radius', val)}
                                />
                                <ModernCornerRadiusInput
                                    label="Menu/Dropdown Radius"
                                    value={preview.menu_radius}
                                    onChange={(val) => setValue('menu_radius', val)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* LIVE PREVIEW (RIGHT) */}
                <div className="lg:col-span-8 flex flex-col bg-gray-100 dark:bg-[#0A0A0A] rounded-xl overflow-hidden relative shadow-inner">
                    {/* Dot grid background pattern */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}
                    />

                    <div className="flex-1 p-8 flex flex-col relative z-10 overflow-hidden">
                        {/* Browser Window Mockup */}
                        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-t-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col flex-1 overflow-hidden transition-all duration-300">
                            {/* Browser Header */}
                            <div className="h-9 border-b border-gray-100 dark:border-gray-700/50 flex items-center px-4 gap-2 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
                                <div className="flex gap-1.5 opacity-80">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <div className="px-3 py-0.5 rounded-md bg-gray-100/50 dark:bg-gray-700/30 text-[10px] text-gray-400 font-mono flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-green-500/50" />
                                        {preview.domain || 'agent.superrealestate.com'}
                                    </div>
                                </div>
                                <div className="w-10" />
                            </div>

                            {/* Preview Content */}
                            <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0F0F0F] relative">
                                {/* Values injected via inline styles for preview */}
                                <div
                                    style={{
                                        '--primary-color': preview.primary_color,
                                        '--secondary-color': preview.secondary_color,
                                        '--btn-radius': preview.button_radius,
                                        '--card-radius': preview.card_radius,
                                        '--menu-radius': preview.menu_radius,
                                        '--font-family': preview.font_family,
                                        '--btn-gradient': preview.button_gradient ? (preview.button_gradient_style || `linear-gradient(135deg, ${preview.primary_color}, ${preview.secondary_color})`) : 'none',
                                        '--card-shadow': preview.shadow_style === 'hard' ? '4px 4px 0px 0px rgba(0,0,0,1)' : preview.shadow_style === 'none' ? 'none' : '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                    }}
                                    className="min-h-full font-sans text-gray-800 dark:text-gray-200"
                                >
                                    {/* Navbar Mock */}
                                    <nav className="border-b border-gray-100 dark:border-gray-800 p-4 sticky top-0 bg-white/80 dark:bg-[#0F0F0F]/80 backdrop-blur-md z-10 transition-colors">
                                        <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                {preview.logo_url ? (
                                                    <img src={getMediaUrl(preview.logo_url)} alt="Logo" className="h-8 w-auto object-contain" />
                                                ) : (
                                                    <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                                                )}
                                                <span className="font-bold text-lg tracking-tight hidden sm:block">{preview.header_text}</span>
                                            </div>
                                            <div className="hidden md:flex gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                <span className="hover:text-primary-500 cursor-pointer">Home</span>
                                                <span className="hover:text-primary-500 cursor-pointer">Listings</span>
                                                <span className="hover:text-primary-500 cursor-pointer">About</span>
                                                <span className="hover:text-primary-500 cursor-pointer">Contact</span>
                                            </div>
                                            <button
                                                className="px-4 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-md md:hidden"
                                                style={{ borderRadius: preview.button_radius }}
                                            >
                                                Menu
                                            </button>
                                        </div>
                                    </nav>

                                    {/* Hero Section */}
                                    <div className="py-12 md:py-20 px-4 text-center">
                                        <h1 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight dark:text-white leading-tight" style={{ color: preview.text_color, fontFamily: preview.font_family }}>
                                            Find Your <span style={{ color: preview.primary_color }}>Dream Home</span>
                                        </h1>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-10 text-lg leading-relaxed">
                                            Discover luxury properties in prime locations, curated just for you. Experience the difference.
                                        </p>

                                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                                            <button
                                                className="px-8 py-3 text-white font-medium transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-primary-500/20"
                                                style={{
                                                    backgroundColor: preview.primary_color,
                                                    borderRadius: preview.button_radius,
                                                    backgroundImage: preview.button_gradient ? (preview.button_gradient_style || `linear-gradient(135deg, ${preview.primary_color}, ${preview.secondary_color})`) : 'none',
                                                    boxShadow: preview.shadow_style === 'hard' ? '4px 4px 0px 0px rgba(0,0,0,1)' : ''
                                                }}
                                            >
                                                View Listings
                                            </button>
                                            <button
                                                className="px-8 py-3 bg-white dark:bg-gray-800 font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                style={{
                                                    borderRadius: preview.button_radius,
                                                    color: preview.text_color
                                                }}
                                            >
                                                Contact Us
                                            </button>
                                        </div>
                                    </div>

                                    {/* Cards Section */}
                                    <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                                        {[1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 overflow-hidden group hover:border-primary-200 dark:hover:border-primary-900 transition-colors duration-300"
                                                style={{
                                                    borderRadius: preview.card_radius,
                                                    boxShadow: preview.shadow_style === 'hard' ? '4px 4px 0px 0px rgba(0,0,0,1)' : '0 10px 30px -5px rgb(0 0 0 / 0.05)'
                                                }}
                                            >
                                                <div className="h-56 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                                                    <div className="absolute inset-0 bg-gray-300 animate-pulse" /> {/* Placeholder image */}
                                                    <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-black/80 backdrop-blur px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                                        For Sale
                                                    </div>
                                                    <div className="absolute bottom-4 left-4 z-20 text-white font-bold text-xl drop-shadow-md">
                                                        $1,250,000
                                                    </div>
                                                </div>
                                                <div className="p-6">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-xl font-bold dark:text-white group-hover:text-primary-500 transition-colors">Modern Villa {i}</h3>
                                                    </div>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex items-center gap-2">
                                                        <GlobeAltIcon className="w-4 h-4" />
                                                        123 Palm Avenue, Miami FL
                                                    </p>
                                                    <div className="flex gap-4 mb-6 text-xs font-medium text-gray-500 dark:text-gray-400 border-t border-gray-50 dark:border-gray-700/50 pt-4">
                                                        <span>4 Beds</span>
                                                        <span>3 Baths</span>
                                                        <span>2,500 sqft</span>
                                                    </div>
                                                    <button
                                                        className="w-full py-3 text-white text-sm font-semibold tracking-wide transition-opacity hover:opacity-90"
                                                        style={{
                                                            backgroundColor: preview.secondary_color,
                                                            borderRadius: preview.button_radius
                                                        }}
                                                    >
                                                        VIEW DETAILS
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeSettings;
