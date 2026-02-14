import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden transition-shadow ${className}`}
            style={{
                borderRadius: 'var(--card-radius)',
                boxShadow: 'var(--card-shadow)'
            }}
            {...props}
        >
            {children}
        </div>
    );
};

const Header = ({ children, className = '' }) => (
    <div className={`px-6 py-4 border-b border-gray-100 dark:border-gray-700 ${className}`}>
        {children}
    </div>
);

const Body = ({ children, className = '' }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

const Footer = ({ children, className = '' }) => (
    <div className={`px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 ${className}`}>
        {children}
    </div>
);

Card.Header = Header;
Card.Body = Body;
Card.Footer = Footer;

export default Card;
