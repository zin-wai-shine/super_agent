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
    hideHeaderOnMobile = false,
    hideCloseButton = false,
    headerExtra,
    headerActions,
    headerLeading,
    centerTitle = false,
    rightTitle = false,
    fullScreenMobile = false,
    fullBleedDesktop = false,
    overlayZIndex
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
        full: "max-w-full", // Margin now handled cleanly by the wrapper below
    };

    // Show header if not hidden and we have either a title, extra content or leading element
    const hasHeader = !hideHeader && (Boolean(title) || Boolean(headerExtra) || Boolean(headerLeading));

    return createPortal(
        <div
            className={`fixed inset-0 overflow-visible flex justify-center pointer-events-none ${fullScreenMobile ? 'items-stretch sm:items-center' : 'items-center'} ${fullBleedDesktop ? 'sm:items-stretch' : ''}`}
            style={{ zIndex: overlayZIndex ?? 1000 }}
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
                className={`relative transform animate-scale-in w-full flex items-center justify-center z-10 pointer-events-auto ${sizes[size]} ${className} ${fullScreenMobile ? 'p-0 m-0 h-full sm:h-auto sm:m-4' : 'p-4 sm:p-0'} ${fullBleedDesktop ? 'sm:!m-0 sm:!rounded-none sm:!shadow-none sm:!max-w-none sm:w-full sm:h-full' : ''}`}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
            >
                <div
                    className={`bg-white text-left w-full flex flex-col h-full overflow-hidden ${fullBleedDesktop ? 'shadow-none sm:shadow-none rounded-none sm:rounded-none' : `shadow-2xl ${fullScreenMobile ? 'rounded-none sm:rounded-[24px]' : 'rounded-[24px]'}`}`}
                    style={fullBleedDesktop ? undefined : { boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                >
                    {hasHeader && (
                        <div className={`border-b border-gray-100 flex-shrink-0 ${hideHeaderOnMobile ? 'hidden lg:flex' : 'flex'}`}>
                            <div className="relative flex items-center justify-between px-4 md:px-8 lg:px-20 py-4 w-full max-w-[1600px] mx-auto min-h-[64px]">
                                <div className="flex items-center gap-4 min-w-0 flex-1 z-20">
                                    {headerLeading && (
                                        <div className="flex-shrink-0">
                                            {headerLeading}
                                        </div>
                                    )}
                                    {/* On Desktop: always show title on left (if exists) */}
                                    {/* On Mobile: only show here if NOT centered AND NOT right-aligned */}
                                    {title && (
                                        <h3 className={`text-lg font-bold text-gray-900 truncate flex-shrink-0 ${(centerTitle || rightTitle) ? 'hidden lg:block' : 'block'}`}>
                                            {title}
                                        </h3>
                                    )}
                                    <div id="modal-header-extra" className={`flex items-center gap-2 min-w-0 ${(centerTitle || rightTitle) ? 'hidden lg:flex' : 'flex'}`}>
                                        {headerExtra}
                                    </div>
                                </div>

                                {centerTitle && title && (
                                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center max-w-[50%] z-10 lg:hidden">
                                        <h3 className="text-lg font-semibold text-gray-900 truncate text-center">
                                            {title}
                                        </h3>
                                    </div>
                                )}

                                {rightTitle && title && (
                                    <div className={`absolute ${hideCloseButton ? 'right-4' : 'right-16'} flex items-center justify-center max-w-[50%] z-10 lg:hidden`}>
                                        <h3 className="text-lg font-semibold text-gray-900 truncate text-right">
                                            {title}
                                        </h3>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 z-20">
                                    {(centerTitle || rightTitle) && (
                                        <div id="modal-header-extra" className="hidden lg:flex items-center gap-2 min-w-0">
                                            {/* Re-render headerExtra on right for desktop if title is centered/right on mobile */}
                                            {headerExtra}
                                        </div>
                                    )}
                                    <div id="modal-header-actions" className="flex items-center gap-2">
                                        {headerActions}
                                    </div>
                                    {!hideCloseButton && (
                                        <button
                                            onClick={onClose}
                                            className="text-gray-400 hover:text-gray-500 focus:outline-none p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    )}
                                </div>
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
