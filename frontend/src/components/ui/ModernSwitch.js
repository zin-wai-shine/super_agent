import React from 'react';

const ModernSwitch = ({ label, checked, onChange, description }) => {
    return (
        <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-[#2C2C2C] rounded-lg border border-gray-200 dark:border-gray-700/50">
            <div className="pr-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200">{label}</h3>
                {description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
                )}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-0
                    ${checked ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-200 dark:bg-zinc-600'}
                `}
            >
                <span
                    aria-hidden="true"
                    className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                        ${checked ? 'translate-x-5' : 'translate-x-0'}
                    `}
                />
            </button>
        </div>
    );
};

export default ModernSwitch;
