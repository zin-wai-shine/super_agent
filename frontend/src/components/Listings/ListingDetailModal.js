import React, { useState, Suspense, lazy } from 'react';
import Modal from '../ui/Modal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Lazy load the detail view to keep the initial listings bundle small
const ListingDetailView = lazy(() => import('../../pages/Public/ListingDetailPage').then(module => ({
    default: module.ListingDetailView
})));

const ListingDetailModal = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const listingId = searchParams.get('detail');
    const bookingId = searchParams.get('bookingId');
    const isOpen = !!listingId;
    const [modalTitle, setModalTitle] = useState(bookingId ? "Appointment Details" : "Property Details");

    const handleClose = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('detail');
        setSearchParams(newParams);
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="full"
            closeOnBackdropClick={true}
            lockScroll={true}
            hideHeader={false}
            className="!p-0 w-[94vw] h-[94vh] !max-w-[94vw] overflow-hidden shadow-2xl transition-all duration-500"
            style={{ overscrollBehavior: 'contain' }}
            title={modalTitle}

        >
            <div className="h-full relative bg-white">

                <div className="h-full overflow-y-auto modal-scrollable">
                    <Suspense fallback={
                        <div className="h-full flex items-center justify-center bg-gray-50">
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                                <p className="text-gray-400 font-bold text-sm">Loading property details...</p>
                            </div>
                        </div>
                    }>
                        <ListingDetailView id={listingId} isModal={true} onTitleChange={setModalTitle} />
                    </Suspense>
                </div>
            </div>
        </Modal>
    );
};

export default ListingDetailModal;
