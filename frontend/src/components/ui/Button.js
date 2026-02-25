import React from 'react';
import { CgSpinner } from 'react-icons/cg';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    disabled = false,
    type = 'button',
    style: customStyle,
    ...props
}) => {

    const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "text-white bg-[var(--primary-color)] hover:brightness-110 active:brightness-90 focus:ring-[var(--primary-color)]",
        secondary: "text-white bg-[var(--secondary-color)] hover:brightness-110 active:brightness-90 focus:ring-[var(--secondary-color)]",
        outline: "border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white focus:ring-[var(--primary-color)]",
        ghost: "text-[var(--text-color)] hover:bg-gray-100 dark:hover:bg-gray-700/50 focus:ring-gray-500",
        danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
        success: "text-white bg-green-600 hover:bg-green-700 focus:ring-green-500",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            style={customStyle}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <CgSpinner className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    );
};

export default Button;
