import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import Modal from '../ui/Modal';
import { useSearchParams, useLocation } from 'react-router-dom';
import AllPhotosModalContent from './AllPhotosModalContent';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ListingSkeleton from '../ui/ListingSkeleton';
import { FiX } from 'react-icons/fi';
import { usePublicDarkTheme } from '../../contexts/PublicDarkThemeContext';

const ListingDetailView = lazy(() => import('../../pages/Public/ListingDetailPage').then(module => ({
    default: module.ListingDetailView
})));

const MODAL_SIZE_CLASS = '!p-0 !m-0 w-full h-[100dvh] sm:h-full sm:w-full !max-w-full overflow-hidden shadow-none rounded-none sm:rounded-none transition-all duration-500';

const ListingDetailModal = ({ overlayZIndex = 250, isCentered = false, hideRelated = false }) => {
    const { isDarkMode } = usePublicDarkTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const listingId = searchParams.get('detail');
    const bookingId = searchParams.get('bookingId');
    const status = searchParams.get('status') || location.state?.status;
    const isOpen = !!listingId;

    const handleClose = useCallback(() => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.delete('detail');
            return next;
        });
    }, [setSearchParams]);

    const [modalTitle, setModalTitle] = useState(bookingId ? 'Appointment Details' : 'Property Details');
    const [headerLeading, setHeaderLeading] = useState(
        <button
            onClick={handleClose}
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:bg-white/10 dark:hover:bg-white/20 active:scale-95 transition-all -ml-2 group"
        >
            <ArrowLeftIcon className="w-6 h-6 text-gray-900 dark:text-white group-hover:-translate-x-0.5 transition-transform" />
        </button>
    );

    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryPayload, setGalleryPayload] = useState(null);
    const [galleryTitle, setGalleryTitle] = useState('Photo Tour');
    const [focusedImageIndex, setFocusedImageIndex] = useState(null);

    useEffect(() => {
        if (listingId) {
            setGalleryOpen(false);
            setGalleryPayload(null);
            setFocusedImageIndex(null);
            setGalleryTitle('Photo Tour');
        }
    }, [listingId]);

    const openGallery = (payload) => {
        if (payload?.images?.length) {
            setGalleryPayload({
                images: payload.images,
                initialIndex: Math.min(payload.initialIndex ?? 0, payload.images.length - 1)
            });
            setGalleryOpen(true);
        }
    };

    const closeGallery = () => {
        setGalleryOpen(false);
        setGalleryPayload(null);
        setFocusedImageIndex(null);
        setGalleryTitle('Photo Tour');
    };

    const handleHeaderBack = () => {
        if (focusedImageIndex !== null) {
            setFocusedImageIndex(null);
        } else {
            closeGallery();
        }
    };

    if (!isOpen) return null;

    const showInlineGallery = isCentered && galleryOpen;
    const showOverlayGallery = !isCentered && galleryOpen;
    const isPureWhiteBg = isCentered && galleryOpen && focusedImageIndex !== null;

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                size="full"
                closeOnBackdropClick={isCentered ? true : false}
                lockScroll={true}
                fullScreenMobile={isCentered ? false : true}
                fullBleedDesktop={isCentered ? false : true}
                hideHeader={isCentered}
                title={modalTitle}
                centerTitle={isCentered ? false : true}
                useBackButton={isCentered ? false : true}
                hideHeaderOnMobile={isCentered ? false : true}
                className={isCentered ? "!max-w-[1300px] !h-[90vh] rounded-[24px] overflow-hidden" : MODAL_SIZE_CLASS}
                contentClassName={isCentered ? `${
                    isPureWhiteBg
                        ? 'border border-transparent'
                        : 'border border-gray-100 dark:border-white/10'
                } transition-colors duration-300 rounded-[24px] ${
                    isPureWhiteBg
                        ? 'bg-white dark:bg-dashboard-dark'
                        : (galleryOpen && focusedImageIndex !== null)
                            ? (isDarkMode ? 'bg-black' : 'bg-white')
                            : 'bg-white dark:bg-dashboard-dark'
                }` : ""}
                overlayZIndex={overlayZIndex}
            >
                <div className={`h-full relative flex flex-col transition-colors duration-300 rounded-[24px] overflow-hidden ${
                    isPureWhiteBg
                        ? 'bg-white dark:bg-dashboard-dark'
                        : (galleryOpen && focusedImageIndex !== null)
                            ? (isDarkMode ? 'bg-black' : 'bg-white')
                            : 'bg-white dark:bg-dashboard-dark'
                }`}>
                    {isCentered && (
                        <div className={`flex-shrink-0 select-none transition-all duration-300 ${
                            (galleryOpen && focusedImageIndex !== null)
                                ? `${
                                    isPureWhiteBg
                                        ? 'bg-white/80 dark:bg-dashboard-dark/80 text-gray-900 dark:text-white'
                                        : isDarkMode ? 'bg-gradient-to-b from-black/50 to-transparent text-white' : 'bg-gradient-to-b from-white/80 to-transparent text-gray-900'
                                  } absolute top-0 left-0 right-0 z-50 border-transparent`
                                : 'relative bg-white dark:bg-dashboard-dark text-gray-900 dark:text-white'
                        } flex items-center justify-between px-6 py-4`}>
                            <div className="flex items-center gap-3">
                                {galleryOpen && (
                                    <button
                                        onClick={handleHeaderBack}
                                        className={`w-10 h-10 rounded-[12px] border-0 bg-transparent cursor-pointer transition-colors flex items-center justify-center ${
                                            (galleryOpen && focusedImageIndex !== null)
                                                ? (isPureWhiteBg ? 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-white' : (isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-800'))
                                                : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-555 dark:text-white'
                                        }`}
                                    >
                                        <ArrowLeftIcon className="w-5 h-5" />
                                    </button>
                                )}
                                <h3 className={`text-[17px] font-bold transition-colors ${
                                    (galleryOpen && focusedImageIndex !== null)
                                        ? (isPureWhiteBg ? 'text-gray-900 dark:text-white' : (isDarkMode ? 'text-white' : 'text-gray-900'))
                                        : 'text-gray-900 dark:text-white'
                                }`}>
                                    {galleryOpen ? galleryTitle : modalTitle}
                                </h3>
                            </div>
                            <button
                                onClick={handleClose}
                                className={`w-10 h-10 rounded-[12px] border-0 bg-transparent cursor-pointer transition-colors flex items-center justify-center ${
                                    (galleryOpen && focusedImageIndex !== null)
                                        ? (isPureWhiteBg ? 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-650 dark:text-white' : (isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-650'))
                                        : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-650 dark:hover:text-white'
                                }`}
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                    
                    <div className="flex-1 min-h-0 relative overflow-hidden bg-white dark:bg-dashboard-dark">
                        {/* Detail View Wrapper */}
                        <div 
                            className={`absolute inset-0 flex flex-col overflow-y-auto modal-scrollable bg-white dark:bg-dashboard-dark transition-all duration-300 ease-in-out rounded-[24px] overflow-hidden ${
                                showInlineGallery ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
                            }`}
                            onScroll={(e) => {
                                if (!showInlineGallery) {
                                    window.dispatchEvent(new CustomEvent('modalScroll', { detail: { scrollTop: e.target.scrollTop } }));
                                }
                            }}
                        >
                            <Suspense fallback={
                                <div className="h-full bg-white dark:bg-dashboard-dark">
                                    <ListingSkeleton viewMode="detail" status={status} />
                                </div>
                            }>
                                <ListingDetailView
                                    id={listingId}
                                    isModal
                                    hideRelated={hideRelated}
                                    onTitleChange={setModalTitle}
                                    onHeaderLeadingChange={setHeaderLeading}
                                    onClose={handleClose}
                                    onOpenGallery={openGallery}
                                />
                            </Suspense>
                        </div>

                        {/* Inline Gallery View Wrapper */}
                        <div 
                            className={`absolute inset-0 transition-all duration-300 ease-in-out rounded-[24px] overflow-hidden bg-white dark:bg-dashboard-dark ${
                                showInlineGallery ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
                            }`}
                        >
                            {showInlineGallery && galleryPayload && (
                                <AllPhotosModalContent
                                    images={galleryPayload.images}
                                    initialIndex={galleryPayload.initialIndex}
                                    onClose={closeGallery}
                                    isCentered={isCentered}
                                    inline={true}
                                    onTitleChange={setGalleryTitle}
                                    focusedImageIndex={focusedImageIndex}
                                    onFocusedImageIndexChange={setFocusedImageIndex}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </Modal>

            {showOverlayGallery && galleryPayload && (
                <Modal
                    isOpen
                    onClose={closeGallery}
                    size="full"
                    closeOnBackdropClick={false}
                    lockScroll
                    hideHeader
                    fullScreenMobile
                    fullBleedDesktop
                    className="!p-0 !m-0 w-full h-[100dvh] sm:w-full sm:h-full !max-w-full overflow-hidden"
                    style={{ overscrollBehavior: 'contain' }}
                    overlayZIndex={Math.max(10050, overlayZIndex + 50)}
                >
                    <AllPhotosModalContent
                        images={galleryPayload.images}
                        initialIndex={galleryPayload.initialIndex}
                        onClose={closeGallery}
                        isCentered={isCentered}
                    />
                </Modal>
            )}
        </>
    );
};

export default ListingDetailModal;
