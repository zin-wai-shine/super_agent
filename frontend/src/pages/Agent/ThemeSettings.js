import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { agentApi } from '../../services/api';
import toast from 'react-hot-toast';
import { SwatchIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import StyledSelect from '../../components/Form/StyledSelect';

const ThemeSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState({});

    const { register, control, handleSubmit, reset, watch, setValue } = useForm();
    const watchAll = watch();

    // Font options with preview styling
    const fontOptions = [
        { value: 'Inter', label: 'Inter', style: { fontFamily: 'Inter' } },
        { value: 'Roboto', label: 'Roboto', style: { fontFamily: 'Roboto' } },
        { value: 'Open Sans', label: 'Open Sans', style: { fontFamily: 'Open Sans' } },
        { value: 'Lato', label: 'Lato', style: { fontFamily: 'Lato' } },
        { value: 'Montserrat', label: 'Montserrat', style: { fontFamily: 'Montserrat' } },
        { value: 'Poppins', label: 'Poppins', style: { fontFamily: 'Poppins' } },
        { value: 'Playfair Display', label: 'Playfair Display', style: { fontFamily: 'Playfair Display' } },
        { value: 'Source Sans Pro', label: 'Source Sans Pro', style: { fontFamily: 'Source Sans Pro' } },
    ];

    useEffect(() => {
        const fetchTheme = async () => {
            try {
                const response = await agentApi.getTheme();
                const theme = response.data;
                reset({
                    background_color: theme.background_color || '#f5f5f5',
                    primary_color: theme.primary_color || '#1a73e8',
                    secondary_color: theme.secondary_color || '#34a853',
                    text_color: theme.text_color || '#202124',
                    logo_url: theme.logo_url || '',
                    header_text: theme.header_text || '',
                    footer_text: theme.footer_text || '',
                });
                // Set font with select option format
                const fontOption = fontOptions.find(f => f.value === (theme.font_family || 'Inter'));
                setValue('font_family', fontOption || fontOptions[0]);
                setPreview({ ...theme, font_family: theme.font_family || 'Inter' });
            } catch (error) {
                console.error('Failed to fetch theme:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTheme();
    }, [reset, setValue]);

    useEffect(() => {
        setPreview({
            ...watchAll,
            font_family: watchAll.font_family?.value || watchAll.font_family || 'Inter',
        });
    }, [watchAll]);

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            await agentApi.updateTheme({
                ...data,
                font_family: data.font_family?.value || data.font_family,
            });
            toast.success('Theme updated!');
        } catch (error) {
            toast.error('Failed to update theme');
        } finally {
            setSaving(false);
        }
    };

    const resetToDefaults = () => {
        reset({
            background_color: '#f5f5f5',
            primary_color: '#1a73e8',
            secondary_color: '#34a853',
            text_color: '#202124',
            logo_url: '',
            header_text: '',
            footer_text: '',
        });
        setValue('font_family', fontOptions[0]);
    };

    // Custom option renderer for fonts
    const formatFontOption = ({ label, style }) => (
        <span style={style} className="text-base">
            {label}
        </span>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">🎨 Theme Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Customize the look and feel of your agent site</p>
                </div>
                <button onClick={resetToDefaults} className="btn-secondary flex items-center space-x-2">
                    <ArrowPathIcon className="w-5 h-5" />
                    <span>Reset to Defaults</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Settings Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Colors */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-6 flex items-center space-x-2">
                            <SwatchIcon className="w-5 h-5 text-primary-600" />
                            <span>Colors</span>
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="input-label">🖼️ Background</label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="color"
                                        className="w-12 h-12 rounded-lg cursor-pointer border-0 shadow-sm"
                                        {...register('background_color')}
                                    />
                                    <input
                                        type="text"
                                        className="input-field flex-1 font-mono text-sm"
                                        {...register('background_color')}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="input-label">🔵 Primary</label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="color"
                                        className="w-12 h-12 rounded-lg cursor-pointer border-0 shadow-sm"
                                        {...register('primary_color')}
                                    />
                                    <input
                                        type="text"
                                        className="input-field flex-1 font-mono text-sm"
                                        {...register('primary_color')}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="input-label">🟢 Secondary</label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="color"
                                        className="w-12 h-12 rounded-lg cursor-pointer border-0 shadow-sm"
                                        {...register('secondary_color')}
                                    />
                                    <input
                                        type="text"
                                        className="input-field flex-1 font-mono text-sm"
                                        {...register('secondary_color')}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="input-label">📝 Text</label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="color"
                                        className="w-12 h-12 rounded-lg cursor-pointer border-0 shadow-sm"
                                        {...register('text_color')}
                                    />
                                    <input
                                        type="text"
                                        className="input-field flex-1 font-mono text-sm"
                                        {...register('text_color')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Typography */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-6">✏️ Typography</h2>
                        <div>
                            <label className="input-label">Font Family</label>
                            <Controller
                                name="font_family"
                                control={control}
                                render={({ field }) => (
                                    <StyledSelect
                                        {...field}
                                        options={fontOptions}
                                        placeholder="Select a font..."
                                        formatOptionLabel={formatFontOption}
                                        isSearchable
                                    />
                                )}
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                Choose a font that matches your brand identity
                            </p>
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-6">🏷️ Branding</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="input-label">Logo URL</label>
                                <input
                                    type="url"
                                    className="input-field"
                                    placeholder="https://example.com/logo.png"
                                    {...register('logo_url')}
                                />
                            </div>
                            <div>
                                <label className="input-label">Header Text</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Welcome to our property site"
                                    {...register('header_text')}
                                />
                            </div>
                            <div>
                                <label className="input-label">Footer Text</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="© 2024 Your Company"
                                    {...register('footer_text')}
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={saving} className="btn-primary w-full">
                        {saving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </form>

                {/* Preview */}
                <div className="bg-white rounded-2xl p-6 shadow-sm h-fit sticky top-24">
                    <h2 className="text-lg font-semibold mb-6">👁️ Live Preview</h2>
                    <div
                        className="rounded-xl overflow-hidden border border-gray-200 shadow-lg"
                        style={{
                            backgroundColor: preview.background_color || '#f5f5f5',
                            fontFamily: preview.font_family || 'Inter',
                            color: preview.text_color || '#202124',
                        }}
                    >
                        {/* Header */}
                        <div
                            className="p-4"
                            style={{ backgroundColor: preview.primary_color || '#1a73e8' }}
                        >
                            <div className="text-white font-bold text-lg">
                                {preview.header_text || 'Your Site Header'}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                                <h3 className="text-xl font-bold mb-2">Sample Property</h3>
                                <p className="text-sm opacity-70 mb-4">
                                    This is how your listings will appear to visitors.
                                </p>
                                <div className="flex items-center space-x-4">
                                    <span className="text-lg font-bold" style={{ color: preview.primary_color || '#1a73e8' }}>
                                        ฿25,000/mo
                                    </span>
                                    <span className="text-sm opacity-60">2 beds • 2 baths</span>
                                </div>
                            </div>
                            <button
                                className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-transform hover:scale-105"
                                style={{ backgroundColor: preview.secondary_color || '#34a853' }}
                            >
                                Contact Agent
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t text-sm opacity-60">
                            {preview.footer_text || '© Your Company'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeSettings;
