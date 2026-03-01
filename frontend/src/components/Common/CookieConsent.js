import React, { useState, useEffect } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { HiOutlineShieldCheck } from 'react-icons/hi2';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'all');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'essential');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-4xl backdrop-blur-2xl bg-[#0a0a0b]/80 border border-white/10 rounded-[4px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-12 overflow-hidden relative group">
                {/* Subtle gradient glow */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

                <div className="flex-shrink-0 w-12 h-12 md:w-12 md:h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <HiOutlineShieldCheck className="w-7 h-7 md:w-6 md:h-6 text-blue-400" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-xl md:text-lg mb-2">Cookie Preferences</h3>
                    <p className="text-gray-400 text-base md:text-sm leading-relaxed max-w-2xl">
                        We use cookies to improve your browsing experience, analyze website traffic, and support our marketing efforts. By clicking "Allow All," you consent to the use of all cookies. You can also adjust your preferences through "Cookie Settings."
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={handleDecline}
                        className="px-6 py-3 md:py-2.5 rounded-[4px] text-base md:text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 border border-white/10"
                    >
                        Cookie Settings
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-8 py-3 md:py-2.5 rounded-[4px] text-base md:text-sm font-medium bg-blue-600 hover:bg-blue-50 transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(59,130,246,0.3)] shadow-blue-600/20"
                    >
                        Allow All
                    </button>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-500 hover:text-white transition-colors p-2 md:p-1"
                    aria-label="Close"
                >
                    <IoCloseOutline className="w-6 h-6 md:w-5 md:h-5" />
                </button>
            </div>
        </div>
    );
};

export default CookieConsent;
