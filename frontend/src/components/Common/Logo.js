import React from 'react';

const Logo = ({ className = "w-8 h-8", ...props }) => {
    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            {/* Abstract 'S' / Building Shape */}
            <path
                d="M16 2L4 9.5V26C4 27.6569 5.34315 29 7 29H25C26.6569 29 28 27.6569 28 26V9.5L16 2Z"
                className="fill-primary-100 dark:fill-primary-900/30"
                fillOpacity="0.5"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16 4.5L7 10.125V25C7 25.5523 7.44772 26 8 26H14V17H18V26H24C24.5523 26 25 25.5523 25 25V10.125L16 4.5ZM16 7.5L22 11.25V23H19V16H13V23H10V11.25L16 7.5Z"
                className="fill-current"
            />
            {/* Accent mark for 'S' style */}
            <path
                d="M13 13H19V14H13V13Z"
                className="fill-current opacity-70"
            />
        </svg>
    );
};

export default Logo;
