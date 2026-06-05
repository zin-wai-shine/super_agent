import React, { useState } from 'react';
import { ShareIcon } from '@heroicons/react/24/outline';
import ShareModal from './ShareModal';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';


/**
 * PropertyShare Component
 * 
 * Handles property sharing logic using Web Share API if available, 
 * or falls back to a custom ShareModal.
 * 
 * @param {Object} property - The property data to share
 * @param {string} className - Optional CSS classes for the button
 * @param {boolean} showLabel - Whether to show the "Share" text
 */
const PropertyShare = ({ property, className = "", showLabel = false, labelClassName = "", iconClassName = "" }) => {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleShare = async (e) => {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
            e.stopPropagation();
        }

        // Strip HTML tags and truncate description for better share compatibility
        const cleanDescription = (property.description || "")
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/\s+/g, ' ')    // Normalize whitespace
            .trim()
            .substring(0, 200);      // Truncate to a reasonable length

        const shareData = {
            url: `${window.location.origin}/p/${property.id}`,
        };


        // Rely on Open Graph tags via the URL for the preview image to avoid duplicate attachments
        if (navigator.share) {
            try {
                await navigator.share(shareData);

            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Sharing failed:', err);
                    // Fallback to our custom modal
                    setIsModalOpen(true);
                }
            }
        } else {
            // Fallback to our custom modal if Web Share is not supported
            setIsModalOpen(true);
        }
    };


    return (
        <>
            <button
                onClick={handleShare}
                className={`${className || "p-2 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-gray-100 hover:bg-white transition-all text-gray-700"} group`}
                title="Share Property"
            >
                <div className="flex items-center gap-1.5 md:gap-2">
                    <ShareIcon className={iconClassName || "w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:text-primary-600 transition-colors"} />
                    {showLabel && (
                        <span className={labelClassName || "text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors tracking-wide"}>
                            {t('listing.share')}
                        </span>
                    )}
                </div>
            </button>

            <ShareModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                property={{
                    ...property,
                    url: `${window.location.origin}/listings/${property.id}`
                }}
            />
        </>
    );
};


export default PropertyShare;
