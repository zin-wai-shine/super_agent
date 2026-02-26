import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className = '',
    closeOnBackdropClick = true,
    lockScroll = true,
    hideHeader = false,
    headerExtra,
    headerActions
}) => {

    useEffect(() => {
        if (isOpen && lockScroll) {
            // Store original values
            const originalOverflow = document.body.style.overflow;
            const originalHtmlOverflow = document.documentElement.style.overflow;
            const originalOverscroll = document.body.style.overscrollBehavior;
            const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;

            // Apply locks to both body and html for maximum compatibility without jumps
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overscrollBehavior = 'none';
            document.documentElement.style.overscrollBehavior = 'none';

            // Compensaute for scrollbar width to prevent horizontal jump
            document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';

            // Add internal lock style for additional containment
            const style = document.createElement('style');
            style.id = 'modal-internal-lock';
            style.innerHTML = `
                body.modal-open {
                    overflow: hidden !important;
                }
                .overflow-y-auto:not(.modal-scrollable), 
                .overflow-auto:not(.modal-scrollable) {
                    overflow: hidden !important;
                }
            `;
            document.head.appendChild(style);
            document.body.classList.add('modal-open');

            return () => {
                document.body.classList.remove('modal-open');
                document.body.style.overflow = originalOverflow;
                document.documentElement.style.overflow = originalHtmlOverflow;
                document.body.style.overscrollBehavior = originalOverscroll;
                document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;
                document.body.style.paddingRight = '';

                const existing = document.getElementById('modal-internal-lock');
                if (existing) existing.remove();
            };
        }
    }, [isOpen, lockScroll]);



    if (!isOpen) return null;

    const sizes = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-full m-4",
    };

    // Show header if not hidden and we have either a title or extra content
    const hasHeader = !hideHeader && (Boolean(title) || Boolean(headerExtra));

    return createPortal(
        <div
            className="fixed inset-0 z-[1000] overflow-visible flex items-center justify-center pointer-events-none"
        >
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in ${(lockScroll || closeOnBackdropClick) ? 'pointer-events-auto' : 'pointer-events-none'}`}
                onClick={(e) => {
                    if (closeOnBackdropClick) {
                        e.stopPropagation();
                        onClose();
                    }
                }}
            />

            {/* Modal Dialog */}
            <div
                className={`relative transform animate-scale-in w-full flex items-center justify-center p-4 sm:p-0 z-10 pointer-events-auto ${sizes[size]} ${className}`}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
            >
                <div
                    className="bg-white text-left shadow-2xl w-full flex flex-col h-full overflow-hidden rounded-[24px]"
                    style={{
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                >
                    {/* Header - Only render if title is provided */}
                    {hasHeader && (
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0" >
                            <div className="flex items-center gap-3 min-w-0 flex-1" >
                                <h3 className="text-lg font-semibold text-gray-900 truncate" >
                                    {title}
                                </h3>
                                <div id="modal-header-extra" className="flex items-center gap-2 flex-1" >
                                    {headerExtra}
                                </div>
                            </div>

                            <div className="flex items-center gap-4" >
                                <div id="modal-header-actions" className="flex items-center gap-2" >
                                    {headerActions}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    style={{ borderRadius: 'var(--btn-radius)' }}
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-h-0 overflow-hidden flex flex-col" >
                        {children}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
