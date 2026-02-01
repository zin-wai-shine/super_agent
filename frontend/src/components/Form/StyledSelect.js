import React from 'react';
import Select from 'react-select';

// Custom styles for React-Select matching our Tailwind design system
const customStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: '44px',
        borderRadius: '8px',
        borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
        boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
        backgroundColor: state.isDisabled ? '#f9fafb' : '#ffffff',
        '&:hover': {
            borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
        },
        transition: 'all 0.2s ease',
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '4px 12px',
    }),
    placeholder: (base) => ({
        ...base,
        color: '#9ca3af',
        fontSize: '14px',
    }),
    singleValue: (base) => ({
        ...base,
        color: '#111827',
        fontSize: '14px',
    }),
    input: (base) => ({
        ...base,
        color: '#111827',
        fontSize: '14px',
    }),
    menu: (base) => ({
        ...base,
        borderRadius: '8px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        zIndex: 50,
        animation: 'slideIn 0.15s ease-out',
    }),
    menuList: (base) => ({
        ...base,
        padding: '8px',
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? '#3b82f6'
            : state.isFocused
                ? '#eff6ff'
                : 'transparent',
        color: state.isSelected ? '#ffffff' : '#374151',
        borderRadius: '4px',
        padding: '10px 12px',
        fontSize: '14px',
        cursor: 'pointer',
        marginBottom: '2px',
        '&:active': {
            backgroundColor: state.isSelected ? '#2563eb' : '#dbeafe',
        },
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: state.isFocused ? '#3b82f6' : '#9ca3af',
        padding: '8px',
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
        backgroundColor: '#eff6ff',
        borderRadius: '4px',
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: '#1d4ed8',
        fontSize: '13px',
        padding: '2px 6px',
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: '#3b82f6',
        borderRadius: '0 4px 4px 0',
        '&:hover': {
            backgroundColor: '#dbeafe',
            color: '#1d4ed8',
        },
    }),
    noOptionsMessage: (base) => ({
        ...base,
        fontSize: '14px',
        color: '#6b7280',
        padding: '12px',
    }),
    loadingMessage: (base) => ({
        ...base,
        fontSize: '14px',
        color: '#6b7280',
    }),
    groupHeading: (base) => ({
        ...base,
        fontSize: '12px',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        padding: '8px 12px',
    }),
};

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
    const errorStyles = error
        ? {
            control: (base, state) => ({
                ...customStyles.control(base, state),
                borderColor: state.isFocused ? '#ef4444' : '#fca5a5',
                boxShadow: state.isFocused ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none',
                '&:hover': {
                    borderColor: state.isFocused ? '#ef4444' : '#f87171',
                },
            }),
        }
        : {};

    return (
        <Select
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            isSearchable={isSearchable}
            isClearable={isClearable}
            isDisabled={isDisabled}
            isMulti={isMulti}
            isLoading={isLoading}
            styles={{ ...customStyles, ...errorStyles }}
            theme={customTheme}
            className={className}
            classNamePrefix="react-select"
            {...props}
        />
    );
};

export default StyledSelect;
