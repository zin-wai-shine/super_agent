import React from 'react';
import Select from 'react-select';

// Custom styles for React-Select matching our Tailwind design system
const getCustomStyles = (isDarkMode) => ({
    control: (base, state) => ({
        ...base,
        minHeight: '38px',
        borderRadius: '3px',
        borderColor: state.isFocused ? '#3b82f6' : (isDarkMode ? '#272E3B' : '#e5e7eb'),
        boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
        backgroundColor: state.isDisabled ? (isDarkMode ? '#2A3241' : '#f9fafb') : (isDarkMode ? '#111318' : '#ffffff'),
        '&:hover': {
            borderColor: state.isFocused ? '#3b82f6' : (isDarkMode ? '#A6ADBB' : '#d1d5db'),
        },
        transition: 'all 0.2s ease',
        fontSize: '13px',
        fontWeight: '500',
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '2px 16px',
    }),
    placeholder: (base) => ({
        ...base,
        color: isDarkMode ? '#9ca3af' : '#9ca3af',
        fontSize: '13px',
    }),
    singleValue: (base) => ({
        ...base,
        color: isDarkMode ? '#A6ADBB' : '#111827',
        fontSize: '13px',
    }),
    input: (base) => ({
        ...base,
        color: isDarkMode ? '#A6ADBB' : '#111827',
        fontSize: '13px',
    }),
    menu: (base) => ({
        ...base,
        borderRadius: '3px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
        border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        overflow: 'hidden',
        zIndex: 100,
        padding: '8px',
        animation: 'slideIn 0.2s ease-out',
    }),
    menuList: (base) => ({
        ...base,
        padding: '0',
        backgroundColor: 'transparent',
    }),
    option: (base, state) => {
        const { data } = state;
        let activeColor = '#3b82f6'; // Default Blue

        if (data.value === 'pending') activeColor = '#f59e0b'; // Amber/Yellow
        if (data.value === 'confirmed') activeColor = '#3b82f6'; // Blue
        if (data.value === 'completed') activeColor = '#10b981'; // Green
        if (data.value === 'cancelled') activeColor = '#ef4444'; // Red

        return {
            ...base,
            backgroundColor: state.isSelected
                ? (isDarkMode ? '#2563eb' : '#3b82f6')
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
            fontSize: '12px',
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
        color: state.isFocused ? '#3b82f6' : '#9ca3af',
        padding: '4px',
        transition: 'transform 0.2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        '&:hover': {
            color: '#3b82f6',
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
        fontSize: '13px',
        padding: '2px 6px',
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: isDarkMode ? '#60a5fa' : '#3b82f6',
        borderRadius: '0 4px 4px 0',
        '&:hover': {
            backgroundColor: isDarkMode ? '#383838' : '#dbeafe',
            color: isDarkMode ? '#93c5fd' : '#1d4ed8',
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
        primary: '#3b82f6',
        primary75: '#60a5fa',
        primary50: '#93c5fd',
        primary25: '#eff6ff',
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
    const { isDarkMode } = useDashboardTheme();

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
        const allOptions = options?.reduce((acc, opt) => {
            if (opt.options) {
                return [...acc, ...opt.options];
            }
            return [...acc, opt];
        }, []) || [];

        // If it's a string, find the matching option
        if (typeof value === 'string') {
            return allOptions.find(opt => opt.value === value) || null;
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
            styles={finalStyles}
            theme={customTheme}
            className={className}
            classNamePrefix="react-select"
            formatOptionLabel={(option, { context }) => (
                <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {context === 'menu' && selectValue && (
                        Array.isArray(selectValue)
                            ? selectValue.some(sv => sv.value === option.value)
                            : selectValue.value === option.value
                    ) && (
                            <span className="ml-2 text-white">✓</span>
                        )}
                </div>
            )}
            {...restProps}
        />
    );
};

export default StyledSelect;
