import React from 'react';

const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    className = ''
}) => {
    return (
        <div className={`p-12 text-center flex flex-col items-center justify-center ${className}`}>
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4 text-gray-300 dark:text-gray-600">
                {Icon && <Icon className="w-10 h-10" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6 text-sm leading-relaxed">
                {description}
            </p>
            {action && (
                <div className="flex justify-center">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
