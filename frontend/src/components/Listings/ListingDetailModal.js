import React, { useState, useEffect, Suspense, lazy } from 'react';
import Modal from '../ui/Modal';
import { useSearchParams } from 'react-router-dom';
import AllPhotosModalContent from './AllPhotosModalContent';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ListingDetailView = lazy(() => import('../../pages/Public/ListingDetailPage').then(module => ({
    default: module.ListingDetailView
})));

const MODAL_SIZE_CLASS = '!p-0 !m-0 w-full h-[100dvh] sm:h-full sm:w-full !max-w-full overflow-hidden shadow-none rounded-none sm:rounded-none transition-all duration-500';

const ListingDetailModal = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const listingId = searchParams.get('detail');
    const bookingId = searchParams.get('bookingId');
    const isOpen = !!listingId;

    const handleClose = () => {
        const next = new URLSearchParams(searchParams);
        next.delete('detail');
        setSearchParams(next);
    };

    const [modalTitle, setModalTitle] = useState(bookingId ? 'Appointment Details' : 'Property Details');
    const [headerLeading, setHeaderLeading] = useState(
        <button
            onClick={handleClose}
            className="hidden lg:flex items-center justify-center text-gray-900 hover:text-gray-700 transition-all p-2 rounded-full hover:bg-gray-100 active:scale-95 -ml-2"
        >
            <ArrowLeftIcon className="w-6 h-6" />
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
                lockScroll
                hideHeader={false}
                hideHeaderOnMobile={true}
                hideCloseButton={true}
                fullScreenMobile
                fullBleedDesktop
                className={MODAL_SIZE_CLASS}
                style={{ overscrollBehavior: 'contain' }}
                title={modalTitle}
                headerLeading={headerLeading}
                centerTitle={true}
            >
                <div className="h-full relative bg-white">
                    <div className="h-full overflow-y-auto modal-scrollable">
                        <Suspense fallback={
                            <div className="h-full flex items-center justify-center bg-gray-50">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
                                    <p className="text-gray-400 font-bold text-sm">Loading property details...</p>
                                </div>
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
