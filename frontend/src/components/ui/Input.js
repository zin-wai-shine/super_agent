import React, { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    error,
    helperText,
    className = '',
    fullWidth = false,
    ...props
}, ref) => {

    return (
        <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={`
                    block w-full px-4 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 
                    border border-gray-200 dark:border-gray-700 
                    focus:outline-none focus:ring-2 focus:ring-opacity-50
                    disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500
                    transition-colors
                    ${error
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]'
                    }
                `}
                style={{ borderRadius: 'var(--btn-radius)' }}
                {...props}
            />
            {error && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
