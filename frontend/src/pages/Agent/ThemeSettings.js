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
    ChartBarIcon,
    ArrowRightOnRectangleIcon,
    CalendarDaysIcon,
    Bars3Icon,
    MagnifyingGlassIcon,
    MapIcon,
    TagIcon,
    ChevronDownIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { PiUser } from 'react-icons/pi';
import StyledSelect from '../../components/Form/StyledSelect';
import { useAuth } from '../../contexts/AuthContext';
import { hasActionPermission } from '../../utils/permissions';
import { getMediaUrl } from '../../utils/media';
import ModernSlider from '../../components/ui/ModernSlider';
import ModernColorPicker from '../../components/ui/ModernColorPicker';
import ModernSwitch from '../../components/ui/ModernSwitch';
import ModernCornerRadiusInput from '../../components/ui/ModernCornerRadiusInput';
import ModernShadowPicker from '../../components/ui/ModernShadowPicker';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import ConfirmModal from '../../components/ui/ConfirmModal';

const ThemeSettings = () => {
    const { user } = useAuth();
    const canUpdate = hasActionPermission(user, 'theme:update');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingFavicon, setUploadingFavicon] = useState(false);
    const [uploadingSharePreview, setUploadingSharePreview] = useState(false);
    const [activeTab, setActiveTab] = useState('brand');
    const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
    const logoInputRef = useRef(null);
    const faviconInputRef = useRef(null);
    const sharePreviewInputRef = useRef(null);

    // Cropper States
    const [tempImage, setTempImage] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropping, setIsCropping] = useState(false);
    const [cropTarget, setCropTarget] = useState(null);

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

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
        favicon_url: '',
        share_preview_image: '',
        share_preview_image_scale: 100,
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
        page_logo_height: 100,
        dashboard_logo_height: 100,
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
        register('favicon_url');
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
        register('page_logo_height');
        register('dashboard_logo_height');
        register('share_preview_image_scale');
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
                favicon_url: theme.favicon_url || '',
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
                page_logo_height: theme.page_logo_height ?? DEFAULT_THEME.page_logo_height,
                dashboard_logo_height: theme.dashboard_logo_height ?? DEFAULT_THEME.dashboard_logo_height,
                share_preview_image_scale: theme.share_preview_image_scale ?? DEFAULT_THEME.share_preview_image_scale,
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

    const openCropper = (e, target) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check if file is PNG
        const isPng = file.type === 'image/png';
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setTempImage(reader.result);
            setCropTarget({ field: target, isPng });
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setIsCropping(true);
        });
        reader.readAsDataURL(file);
        e.target.value = ''; // Reset input
    };

    const handleLogoUpload = (e) => openCropper(e, 'logo_url');
    const handleFaviconUpload = (e) => openCropper(e, 'favicon_url');
    const handleSharePreviewUpload = (e) => openCropper(e, 'share_preview_image');

    const handleCropSave = async () => {
        if (!cropTarget || !tempImage || !croppedAreaPixels) return;
        
        const targetField = cropTarget.field;
        
        try {
            toast.loading('Processing image...', { id: 'imageUpload' });
            
            // Force PNG for favicons to ensure transparent rounded-xl corners are preserved
            const imageType = (cropTarget.isPng || cropTarget.field === 'favicon_url') ? 'image/png' : 'image/jpeg';
            const isFavicon = cropTarget.field === 'favicon_url';
            const croppedImageBlob = await getCroppedImg(tempImage, croppedAreaPixels, imageType, isFavicon);
            
            if (!croppedImageBlob) throw new Error('Failed to crop image');

            if (targetField === 'logo_url') setUploadingLogo(true);
            if (targetField === 'favicon_url') setUploadingFavicon(true);
            if (targetField === 'share_preview_image') setUploadingSharePreview(true);

            const response = await agentApi.uploadLogo(croppedImageBlob);
            setValue(targetField, response.data.url);
            
            setIsCropping(false);
            setTempImage(null);
            setCropTarget(null);
            toast.success('Image uploaded successfully!', { id: 'imageUpload' });
            
            // Auto-save the theme after image upload to ensure persistence
            handleSubmit(onSubmit)();
        } catch (error) {
            console.error('Upload error:', error);
            const errorMsg = error.response?.data?.error || 'Failed to upload image';
            toast.error(errorMsg, { id: 'imageUpload' });
        } finally {
            if (targetField === 'logo_url') setUploadingLogo(false);
            if (targetField === 'favicon_url') setUploadingFavicon(false);
            if (targetField === 'share_preview_image') setUploadingSharePreview(false);
        }
    };

    const resetToDefaults = () => {
        setResetConfirmOpen(true);
    };

    const confirmReset = () => {
        reset(DEFAULT_THEME);
        setValue('font_family', fontOptions[0]);
        toast.success('Reset to defaults');
        setResetConfirmOpen(false);
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
        { id: 'logos', label: 'Logos & Scale', icon: PhotoIcon },
        { id: 'browser', label: 'Browser & Social', icon: GlobeAltIcon },
        { id: 'colors', label: 'Colors & Type', icon: SwatchIcon },
    ];

    return (
        <>
        <div className="space-y-6 pb-20">
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
                {canUpdate && (
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
                            className="btn-primary h-[34px] text-[12px] px-4 flex items-center gap-2 shadow-none hover:shadow-none transform-none"
                        >
                            {saving ? (
                                <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <CheckCircleIcon className="w-4 h-4" />
                            )}
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            <div className="h-[calc(100vh-200px)] min-h-[600px] w-full bg-white dark:bg-dashboard-card rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex overflow-hidden">
                {/* Sidebar Navigation - Compact Style */}
                <div className="w-64 flex-none border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-transparent py-6 flex flex-col">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-3 text-[14px] font-medium transition-colors ${activeTab === tab.id
                                ? 'text-primary-500'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            {React.createElement(tab.icon, { className: "w-4 h-4" })}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white dark:bg-transparent">


                    {activeTab === 'brand' && (
                        <div className="space-y-10 animate-fadeIn max-w-3xl">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Header Site Title</label>
                                    {canUpdate && (
                                        <button
                                            type="button"
                                            onClick={() => resetField('header_text')}
                                            className="p-1.5 rounded-admin border-admin bg-gray-50 dark:bg-dashboard-input text-gray-400 hover:text-primary-500 transition-all active:scale-95"
                                            title="Reset Title"
                                        >
                                            <ArrowPathIcon className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    className="input-field rounded-admin h-12 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                    placeholder="Super Real Estate"
                                    disabled={!canUpdate}
                                    {...register('header_text')}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Footer Attribution</label>
                                    {canUpdate && (
                                        <button
                                            type="button"
                                            onClick={() => resetField('footer_text')}
                                            className="p-1.5 rounded-admin border-admin bg-gray-50 dark:bg-dashboard-input text-gray-400 hover:text-primary-500 transition-all active:scale-95"
                                            title="Reset Footer"
                                        >
                                            <ArrowPathIcon className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    className="input-field rounded-admin h-12 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                    placeholder="© 2024 Your Name"
                                    disabled={!canUpdate}
                                    {...register('footer_text')}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'logos' && (
                        <div className="space-y-10 animate-fadeIn max-w-4xl">
                            {/* Navbar Preview Section */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <div className="space-y-1">
                                        <label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Website Navbar Preview</label>
                                        <p className="text-[12px] text-gray-500 dark:text-gray-400">Adjust how your logo appears in the site header.</p>
                                    </div>
                                    {canUpdate && (
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => logoInputRef.current?.click()}
                                                className="text-[12px] font-medium text-primary-500 hover:text-primary-600 transition-colors"
                                            >
                                                {watchAll.logo_url ? 'Change Logo' : 'Upload Logo'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="relative dark:bg-gray-950 border border-gray-100 dark:border-white/5 rounded-admin overflow-hidden bg-gray-50/50">
                                    <div className="h-28 flex items-center px-12 justify-between">
                                        <div className="flex items-center">
                                            <img
                                                src={getMediaUrl(watchAll.logo_url || '/default_logo.png')}
                                                alt="Logo Preview"
                                                className="h-16 w-auto object-contain transition-all duration-300"
                                                style={{
                                                    transformOrigin: 'left',
                                                    transform: `scale(${preview.navbar_logo_height / 100})`
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-6 opacity-30 pointer-events-none">
                                            <div className="h-2 w-16 bg-gray-300 rounded-full" />
                                            <div className="h-2 w-16 bg-gray-200 rounded-full" />
                                        </div>
                                    </div>
                                </div>

                                <div className="px-1 pt-2">
                                    <ModernSlider
                                        label="Logo Display Scale"
                                        value={preview.navbar_logo_height}
                                        min={10}
                                        max={150}
                                        onChange={(val) => setValue('navbar_logo_height', val)}
                                        unit="%"
                                    />
                                </div>
                            </div>

                            {/* Loading Screen Section */}
                            <div className="space-y-4 pt-10 border-t border-gray-100 dark:border-white/5">
                                <label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Splash Screen Logo</label>
                                <div className="relative bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-white/5 rounded-admin h-48 flex items-center justify-center">
                                    <img
                                        src={getMediaUrl(watchAll.logo_url || '/default_logo.png')}
                                        alt="Splash Logo"
                                        className="h-24 w-auto object-contain"
                                        style={{ transform: `scale(${preview.page_logo_height / 100})` }}
                                    />
                                </div>
                                <ModernSlider
                                    label="Splash Logo Scale"
                                    value={preview.page_logo_height}
                                    min={10}
                                    max={150}
                                    onChange={(val) => setValue('page_logo_height', val)}
                                    unit="%"
                                />
                            </div>

                            {/* Dashboard Sidebar Section */}
                            <div className="space-y-4 pt-10 border-t border-gray-100 dark:border-white/5">
                                <label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Dashboard Sidebar Logo</label>
                                <div className="relative bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-white/5 rounded-admin h-32 flex items-center px-8">
                                    <img
                                        src={getMediaUrl(watchAll.logo_url || '/default_logo.png')}
                                        alt="Dashboard Logo"
                                        className="h-16 w-auto object-contain"
                                        style={{ transformOrigin: 'left', transform: `scale(${preview.dashboard_logo_height / 100})` }}
                                    />
                                </div>
                                <ModernSlider
                                    label="Dashboard Logo Scale"
                                    value={preview.dashboard_logo_height}
                                    min={10}
                                    max={150}
                                    onChange={(val) => setValue('dashboard_logo_height', val)}
                                    unit="%"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'browser' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fadeIn max-w-5xl">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Browser Icon (Favicon)</label>
                                </div>
                                <div
                                    onClick={canUpdate ? () => faviconInputRef.current?.click() : undefined}
                                    className={`flex justify-center p-8 border-2 border-gray-100 dark:border-white/5 border-dashed rounded-admin transition-all bg-gray-50/20 dark:bg-gray-900/10 min-h-[200px] flex-col items-center ${canUpdate ? 'cursor-pointer hover:border-primary-400' : 'opacity-60 cursor-not-allowed'}`}
                                >
                                    {watchAll.favicon_url ? (
                                        <img src={getMediaUrl(watchAll.favicon_url)} alt="Favicon" className="w-16 h-16 object-contain rounded-admin shadow-sm bg-white p-2" />
                                    ) : (
                                        <GlobeAltIcon className="h-10 w-10 text-gray-300" />
                                    )}
                                    {canUpdate && <div className="mt-4 text-[12px] font-medium text-primary-500">Upload Icon</div>}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Social Share Image</label>
                                <div
                                    onClick={canUpdate ? () => sharePreviewInputRef.current?.click() : undefined}
                                    className={`relative flex justify-center p-2 border-2 border-gray-100 dark:border-white/5 border-dashed rounded-admin transition-all bg-gray-50/20 dark:bg-gray-900/10 overflow-hidden group ${canUpdate ? 'cursor-pointer hover:border-primary-400' : 'opacity-60 cursor-not-allowed'}`}
                                >
                                    {watchAll.share_preview_image ? (
                                        <img 
                                            src={getMediaUrl(watchAll.share_preview_image)} 
                                            alt="Preview" 
                                            className="w-full h-auto object-cover rounded-lg shadow-sm"
                                            style={{ transform: `scale(${preview.share_preview_image_scale / 100})` }}
                                        />
                                    ) : (
                                        <div className="py-12 flex flex-col items-center">
                                            <PhotoIcon className="h-10 w-10 text-gray-300 mb-2" />
                                            {canUpdate && <div className="text-[12px] font-medium text-primary-500">Add Preview Image</div>}
                                        </div>
                                    )}
                                </div>
                                <ModernSlider
                                    label="Share Image Preview Scale"
                                    value={preview.share_preview_image_scale}
                                    min={50}
                                    max={150}
                                    onChange={(val) => setValue('share_preview_image_scale', val)}
                                    unit="%"
                                />
                            </div>
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
        
            {/* ── Immersive Cropper Modal ───────────────────────────── */}
            {isCropping && (
                <div className="fixed inset-0 z-[1000] bg-black flex flex-col animate-fade-in">
                    {/* Header */}
                    <div className="p-6 flex items-center justify-between border-b border-white/5 bg-black z-10">
                        <button 
                            onClick={() => setIsCropping(false)}
                            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all lg:hidden"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <h3 className="text-white font-bold text-[15px] flex-1 text-center uppercase tracking-widest">
                            Adjust Image
                        </h3>
                        <div className="w-10 lg:hidden" /> {/* Spacer */}
                    </div>

                    {/* Cropper Area */}
                    <div className="relative flex-1 bg-[#111111]">
                        <Cropper
                            image={tempImage}
                            crop={crop}
                            zoom={zoom}
                            aspect={cropTarget?.field === 'share_preview_image' ? 1200 / 630 : cropTarget?.field === 'favicon_url' ? 1 : undefined}
                            showGrid={false}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            style={{
                                cropAreaStyle: {
                                    borderRadius: cropTarget?.field === 'favicon_url' ? '22%' : '0'
                                }
                            }}
                        />
                    </div>

                    {/* Controls & Footer */}
                    <div className="p-8 pb-12 bg-black border-t border-white/5 z-10">
                        <div className="mb-8 flex justify-center">
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(e.target.value)}
                                className="w-full lg:w-1/2 h-1.5 bg-white/10 rounded-xl appearance-none cursor-pointer accent-white"
                            />
                        </div>
                        
                        <div className="flex justify-center gap-4 items-center">
                            <button 
                                onClick={() => setIsCropping(false)}
                                className="w-fit py-4 px-8 rounded-full bg-white/10 text-white font-bold text-[15px] active:scale-95 transition-all whitespace-nowrap"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCropSave}
                                style={{ backgroundColor: preview.primary_color || '#2D8A56' }}
                                className="w-fit py-4 px-12 rounded-full text-white font-bold text-[15px] active:scale-95 transition-all whitespace-nowrap"
                            >
                                Apply Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModal
                isOpen={resetConfirmOpen}
                onClose={() => setResetConfirmOpen(false)}
                onConfirm={confirmReset}
                title="Reset Theme Settings"
                message="Are you sure you want to reset all theme settings to defaults? This will discard your current customizations."
                confirmText="Reset"
                cancelText="Cancel"
                isDestructive={true}
            />
        </>
    );
};

export default ThemeSettings;
