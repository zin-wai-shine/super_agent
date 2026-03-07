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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500 bg-black/5 backdrop-blur-[2px]">
            <div className="w-full max-w-4xl bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-[24px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 overflow-hidden relative group">
                {/* Accent glow line at top */}
                <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: 'linear-gradient(90deg, transparent, var(--primary-color, #3b82f6), transparent)' }} />

                <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundColor: 'canvas', background: 'rgba(var(--primary-rgb, 59, 130, 246), 0.1)', border: '1px solid rgba(var(--primary-rgb, 59, 130, 246), 0.2)' }}>
                    <HiOutlineShieldCheck className="w-8 h-8 md:w-9 md:h-9" style={{ color: 'var(--primary-color, #3b82f6)' }} />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 font-bold text-2xl md:text-xl mb-2 tracking-tight">Cookie Preferences</h3>
                    <p className="text-gray-500 text-base md:text-[15px] leading-relaxed max-w-2xl font-medium">
                        We use cookies to improve your browsing experience, analyze website traffic, and support our marketing efforts. By clicking "Allow All," you consent to the use of all cookies.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={handleDecline}
                        className="px-6 py-3.5 md:py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all duration-300 border border-gray-200"
                    >
                        Cookie Settings
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-10 py-3.5 md:py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] shadow-lg"
                        style={{
                            backgroundColor: 'var(--primary-color, #3b82f6)',
                            boxShadow: '0 10px 20px -5px rgba(var(--primary-rgb, 59, 130, 246), 0.3)'
                        }}
                    >
                        Allow All
                    </button>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors p-2 bg-gray-50 rounded-full hover:bg-gray-100"
                    aria-label="Close"
                >
                    <IoCloseOutline className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default CookieConsent;
