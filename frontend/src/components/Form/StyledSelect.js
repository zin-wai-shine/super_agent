import React from 'react';
import Select from 'react-select';

// Custom styles for React-Select matching our Tailwind design system
const getCustomStyles = (isDarkMode) => ({
    control: (base, state) => ({
        ...base,
        minHeight: '38px',
        borderRadius: '3px',
        borderColor: state.isFocused ? 'var(--primary-color)' : (isDarkMode ? '#272E3B' : '#e5e7eb'),
        boxShadow: state.isFocused ? '0 0 0 3px color-mix(in srgb, var(--primary-color), transparent 90%)' : 'none',
        backgroundColor: state.isDisabled ? (isDarkMode ? '#2A3241' : '#f9fafb') : (isDarkMode ? '#111318' : '#f9fafb'),
        '&:hover': {
            borderColor: state.isFocused ? 'var(--primary-color)' : (isDarkMode ? '#A6ADBB' : '#d1d5db'),
        },
        transition: 'all 0.2s ease',
        fontSize: '14px',
        fontWeight: '500',
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '2px 16px',
    }),
    placeholder: (base) => ({
        ...base,
        color: isDarkMode ? '#9ca3af' : '#9ca3af',
        fontSize: '14px',
    }),
    singleValue: (base) => ({
        ...base,
        color: isDarkMode ? '#A6ADBB' : '#111827',
        fontSize: '14px',
    }),
    input: (base) => ({
        ...base,
        color: isDarkMode ? '#A6ADBB' : '#111827',
        fontSize: '14px',
    }),
    menu: (base) => ({
        ...base,
        borderRadius: '3px',
        border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
        backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
        overflow: 'hidden',
        zIndex: 9999,
        padding: '8px',
        animation: 'slideIn 0.2s ease-out',
    }),
    menuList: (base) => ({
        ...base,
        maxHeight: '180px',
        padding: '0',
        backgroundColor: 'transparent',
        '&::-webkit-scrollbar': {
            width: '4px',
        },
        '&::-webkit-scrollbar-track': {
            background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
            background: isDarkMode ? '#374151' : '#E5E7EB',
            borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: isDarkMode ? '#4B5563' : '#D1D5DB',
        },
    }),
    option: (base, state) => {
        const { isDisabled } = state;
        const activeColor = 'var(--primary-color)';

        if (isDisabled) {
            return {
                ...base,
                backgroundColor: 'transparent',
                color: isDarkMode ? '#4b5563' : '#d1d5db',
                cursor: 'not-allowed',
                padding: '10px 14px',
                fontSize: '14px',
                fontWeight: '700',
                textTransform: 'none',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: 0.5,
            };
        }

        return {
            ...base,
            backgroundColor: state.isSelected
                ? 'var(--primary-color)'
                : state.isFocused
                    ? (activeColor + (isDarkMode ? '40' : '20')) // Add transparency
                    : 'transparent',
            color: state.isSelected
                ? '#ffffff'
                : state.isFocused
                    ? (isDarkMode ? '#ffffff' : activeColor)
                    : (isDarkMode ? '#9ca3af' : '#4b5563'),
            borderRadius: '3px',
            padding: '10px 14px',
            fontSize: '14px',
            fontWeight: '700',
            textTransform: 'none',
            cursor: 'pointer',
            marginBottom: '4px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            '&:active': {
                backgroundColor: activeColor,
                color: '#ffffff',
            },
        };
    },
    indicatorSeparator: () => ({
        display: 'none',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: state.isFocused ? 'var(--primary-color)' : '#9ca3af',
        padding: '4px',
        transition: 'transform 0.2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        '&:hover': {
            color: 'var(--primary-color)',
        },
    }),
    clearIndicator: (base) => ({
        ...base,
        color: '#9ca3af',
        padding: '8px',
        '&:hover': {
            color: '#ef4444',
        },
    }),
    multiValue: (base) => ({
        ...base,
        backgroundColor: isDarkMode ? '#2A3241' : '#eff6ff',
        borderRadius: '4px',
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: isDarkMode ? '#93c5fd' : '#1d4ed8',
        fontSize: '14px',
        padding: '2px 6px',
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: isDarkMode ? '#60a5fa' : 'var(--primary-color)',
        borderRadius: '0 4px 4px 0',
        '&:hover': {
            backgroundColor: isDarkMode ? '#383838' : 'color-mix(in srgb, var(--primary-color), white 80%)',
            color: isDarkMode ? '#93c5fd' : 'var(--primary-color)',
        },
    }),
    noOptionsMessage: (base) => ({
        ...base,
        fontSize: '14px',
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        padding: '12px',
    }),
    loadingMessage: (base) => ({
        ...base,
        fontSize: '14px',
        color: isDarkMode ? '#9ca3af' : '#6b7280',
    }),
    groupHeading: (base) => ({
        ...base,
        fontSize: '12px',
        fontWeight: '600',
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        padding: '8px 12px',
    }),
});

// Custom theme that matches our design system
const customTheme = (theme) => ({
    ...theme,
    borderRadius: 8,
    colors: {
        ...theme.colors,
        primary: 'var(--primary-color)',
        primary75: 'color-mix(in srgb, var(--primary-color), white 25%)',
        primary50: 'color-mix(in srgb, var(--primary-color), white 50%)',
        primary25: 'color-mix(in srgb, var(--primary-color), white 75%)',
        danger: '#ef4444',
        dangerLight: '#fee2e2',
        neutral0: '#ffffff',
        neutral5: '#f9fafb',
        neutral10: '#f3f4f6',
        neutral20: '#e5e7eb',
        neutral30: '#d1d5db',
        neutral40: '#9ca3af',
        neutral50: '#6b7280',
        neutral60: '#4b5563',
        neutral70: '#374151',
        neutral80: '#1f2937',
        neutral90: '#111827',
    },
});

import { useDashboardTheme } from '../../contexts/DashboardThemeContext';

// Styled Select Component
const StyledSelect = ({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    isSearchable = true,
    isClearable = false,
    isDisabled = false,
    isMulti = false,
    isLoading = false,
    className = '',
    error = false,
    ...props
}) => {
    // Try to get theme context, but don't throw if missing
    let isDarkMode = false;
    try {
        const context = useDashboardTheme();
        isDarkMode = context?.isDarkMode || false;
    } catch (e) {
        // Fallback to light mode if context is missing
        isDarkMode = false;
    }

    const currentStyles = getCustomStyles(isDarkMode);

    const errorStyles = error
        ? {
            control: (base, state) => ({
                ...currentStyles.control(base, state),
                borderColor: state.isFocused ? '#ef4444' : '#fca5a5',
                boxShadow: state.isFocused ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none',
                '&:hover': {
                    borderColor: state.isFocused ? '#ef4444' : '#f87171',
                },
            }),
        }
        : {};

    const mergeStyles = (defaultStyles, overrideStyles) => {
        if (!overrideStyles) return defaultStyles;
        const merged = { ...defaultStyles };

        Object.keys(overrideStyles).forEach(key => {
            if (defaultStyles[key]) {
                const originalFn = defaultStyles[key];
                const overrideFn = overrideStyles[key];
                merged[key] = (base, state) => overrideFn(originalFn(base, state), state);
            } else {
                merged[key] = overrideStyles[key];
            }
        });
        return merged;
    };

    const stylesFromProps = props.styles || {};
    const finalStyles = mergeStyles({ ...currentStyles, ...errorStyles }, stylesFromProps);

    // Remove styles from props to avoid overwriting
    const { styles: _, ...restProps } = props;

    // Support both object and string values
    const selectValue = React.useMemo(() => {
        if (!value) return null;
        if (typeof value === 'object' && !Array.isArray(value)) return value;

        // Flatten options if they are grouped
        const allOptions = Array.isArray(options) ? options.reduce((acc, opt) => {
            if (!opt) return acc;
            if (opt.options && Array.isArray(opt.options)) {
                return [...acc, ...opt.options];
            }
            return [...acc, opt];
        }, []) : [];

        // If it's a string or number, find the matching option
        if (typeof value === 'string' || typeof value === 'number') {
            return allOptions.find(opt => opt.value === value || String(opt.value) === String(value)) || null;
        }

        // For multi-select with array of strings
        if (Array.isArray(value)) {
            return value.map(val =>
                typeof val === 'string'
                    ? allOptions.find(opt => opt.value === val)
                    : val
            ).filter(Boolean);
        }

        return value;
    }, [value, options]);

    return (
        <Select
            options={options}
            value={selectValue}
            onChange={(selected) => {
                // If isMulti, return array of values, otherwise return single value
                if (isMulti) {
                    onChange(selected ? selected.map(s => s.value) : []);
                } else {
                    onChange(selected ? selected.value : null);
                }
            }}
            placeholder={placeholder}
            isSearchable={isSearchable}
            isClearable={isClearable}
            isDisabled={isDisabled}
            isMulti={isMulti}
            isLoading={isLoading}
            styles={{ ...finalStyles, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            menuPlacement="auto"
            theme={customTheme}
            className={className}
            classNamePrefix="react-select"
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            isOptionDisabled={(option) => option.disabled}
            formatOptionLabel={(option, { context }) => (
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        {option.line_name && context === 'menu' && (
                            <span
                                className="px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold text-white uppercase whitespace-nowrap"
                                style={{ backgroundColor: option.line_color || 'var(--primary-color)' }}
                            >
                                {option.line_name}
                            </span>
                        )}
                        <span>{option.label}</span>
                    </div>
                    {context === 'menu' && selectValue && (
                        Array.isArray(selectValue)
                            ? selectValue.some(sv => sv.value === option.value)
                            : selectValue.value === option.value
                    ) && (
                            <span className="ml-2 text-primary-600 font-bold">✓</span>
                        )}
                </div>
            )}
            {...restProps}
        />
    );
};

export default StyledSelect;
