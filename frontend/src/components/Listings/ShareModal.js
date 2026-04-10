import React from 'react';
import Modal from '../ui/Modal';
import {
    LinkIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';


import {
    FaWhatsapp,
    FaFacebookF,
    FaTelegramPlane,
    FaFacebookMessenger
} from 'react-icons/fa';
import { SiLine } from 'react-icons/si';




const ShareModal = ({ isOpen, onClose, property }) => {
    const { title, url } = property;
    const [copied, setCopied] = React.useState(false);

    const copyToClipboard = async () => {
        try {
            // Try modern API first
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(url);
            } else {
                // Fallback for non-secure contexts or when API is missing
                const textArea = document.createElement("textarea");
                textArea.value = url;
                // Ensure textarea is not visible
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (!successful) throw new Error('Fallback copy failed');
            }

            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };




    const shareLinks = [
        {
            name: 'WhatsApp',
            icon: <FaWhatsapp className="w-5 h-5" />,
            color: 'bg-[#25D366]',
            href: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
        },
        {
            name: 'Facebook',
            icon: <FaFacebookF className="w-5 h-5" />,
            color: 'bg-[#1877F2]',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        },
        {
            name: 'Messenger',
            icon: <FaFacebookMessenger className="w-5 h-5" />,
            color: 'bg-[#0084FF]',
            // Note: Messenger web share requires an app_id. We'll use a widely used one or fallback to mobile-only scheme
            href: `fb-messenger://share/?link=${encodeURIComponent(url)}`,
            desktopHref: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(url)}`
        },
        {
            name: 'LINE',
            icon: <SiLine className="w-5 h-5" />,
            color: 'bg-[#00B900]',
            href: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
        },
        {
            name: 'Telegram',
            icon: <FaTelegramPlane className="w-5 h-5" />,
            color: 'bg-[#0088cc]',
            href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        },
    ];


    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Share Property"
            size="sm"
            useBackButton={true}
        >
            <div className="p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                    Share this property with your friends and family.
                </p>

                <div className="grid grid-cols-1 gap-3 mb-6">
                    {shareLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.desktopHref || link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                // If on mobile and has a mobile-specific href (like Messenger)
                                if (link.name === 'Messenger' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                                    e.preventDefault();
                                    window.location.href = link.href;
                                }
                            }}
                            className="flex items-center gap-4 p-2 rounded-full border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                        >
                            <div className={`${link.color} w-10 h-10 flex items-center justify-center text-white rounded-full shadow-sm transition-transform group-hover:scale-105`}>
                                {link.icon}
                            </div>
                            <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Share on {link.name}</span>
                        </a>
                    ))}
                </div>


                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-100 dark:border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-dashboard-card text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider text-[10px]">Or copy link</span>
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-2 p-2 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                    <div className="flex-1 truncate text-xs text-gray-500 dark:text-gray-400 font-medium px-4">
                        {url}
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full shadow-sm border transition-all text-sm font-bold min-w-[100px] justify-center ${copied ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-white/10 border-gray-100 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200'}`}
                    >
                        {copied ? (
                            <>
                                <CheckIcon className="w-4 h-4 text-emerald-600 animate-scale-in" />
                                <span>copied</span>
                            </>
                        ) : (
                            <>
                                <LinkIcon className="w-4 h-4 text-primary-600" />
                                <span>copy</span>
                            </>
                        )}

                    </button>

                </div>
            </div>
        </Modal>
    );
};

export default ShareModal;
