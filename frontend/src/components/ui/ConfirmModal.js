import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = true
}) => {
    // Lock scroll when open
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ease-out"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative bg-white dark:bg-dashboard-card w-full max-w-md rounded-admin overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border border-gray-100 dark:border-white/5 p-6 animate-scale-in transform transition-all duration-300">
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center mt-2">
                    {/* Icon Header */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 border ${
                        isDestructive 
                            ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-100 dark:border-red-900/30'
                            : 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-500 border-yellow-100 dark:border-yellow-900/30'
                    }`}>
                        <ExclamationTriangleIcon className="w-7 h-7" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-white leading-6 mb-2">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mb-6">
                        {message}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:order-1 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 rounded-admin transition-all active:scale-[0.98]"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className={`w-full sm:order-2 px-4 py-3 text-sm font-bold text-white rounded-admin shadow-md transition-all active:scale-[0.98] ${
                                isDestructive 
                                    ? 'bg-red-600 hover:bg-red-700 shadow-red-600/10'
                                    : 'bg-primary-600 hover:bg-primary-700 shadow-primary-600/10'
                            }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmModal;
