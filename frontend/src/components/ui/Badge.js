import React from 'react';

const Badge = ({
    children,
    variant = 'neutral',
    size = 'md',
    className = '',
    rounded = false
}) => {
    const variants = {
        neutral: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
        primary: "bg-[var(--primary-color)] text-white",
        success: "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400",
        error: "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400",
    };

    const sizes = {
        sm: "text-[10px] px-2 py-0.5",
        md: "text-xs px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
    };

    const style = {
        borderRadius: rounded ? '9999px' : 'var(--btn-radius)',
    };

    return (
        <span
            className={`inline-flex items-center font-medium ${variants[variant]} ${sizes[size]} ${className}`}
            style={style}
        >
            {children}
        </span>
    );
};

export default Badge;
