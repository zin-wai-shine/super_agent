import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import Modal from '../ui/Modal';
import { useSearchParams, useLocation } from 'react-router-dom';
import AllPhotosModalContent from './AllPhotosModalContent';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ListingSkeleton from '../ui/ListingSkeleton';

const ListingDetailView = lazy(() => import('../../pages/Public/ListingDetailPage').then(module => ({
    default: module.ListingDetailView
})));

const MODAL_SIZE_CLASS = '!p-0 !m-0 w-full h-[100dvh] sm:h-full sm:w-full !max-w-full overflow-hidden shadow-none rounded-none sm:rounded-none transition-all duration-500';

const ListingDetailModal = () => {
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

    useEffect(() => {
        if (listingId) {
            setGalleryOpen(false);
            setGalleryPayload(null);
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
    };

    if (!isOpen) return null;

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                size="full"
                closeOnBackdropClick={false}
                lockScroll={true}
                fullScreenMobile={true}
                fullBleedDesktop={true}
                title={modalTitle}
                centerTitle={true}
                useBackButton={true}
                hideHeaderOnMobile={true}
                className={MODAL_SIZE_CLASS}
            >
                <div className="h-full relative bg-white dark:bg-dashboard-dark">
                    <div 
                        className="h-full overflow-y-auto modal-scrollable bg-white dark:bg-dashboard-dark"
                        onScroll={(e) => {
                            window.dispatchEvent(new CustomEvent('modalScroll', { detail: { scrollTop: e.target.scrollTop } }));
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
                                onTitleChange={setModalTitle}
                                onHeaderLeadingChange={setHeaderLeading}
                                onClose={handleClose}
                                onOpenGallery={openGallery}
                            />
                        </Suspense>
                    </div>
                </div>
            </Modal>

            {galleryOpen && galleryPayload && (
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
                    overlayZIndex={10050}
                >
                    <AllPhotosModalContent
                        images={galleryPayload.images}
                        initialIndex={galleryPayload.initialIndex}
                        onClose={closeGallery}
                    />
                </Modal>
            )}
        </>
    );
};

export default ListingDetailModal;
