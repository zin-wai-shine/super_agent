import React, { useState, useEffect } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { HiOutlineShieldCheck } from 'react-icons/hi2';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Modal from '../ui/Modal';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasConsented, setHasConsented] = useState(true);
    const [isCelebrating, setIsCelebrating] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [preferences, setPreferences] = useState(() => {
        try {
            const consent = localStorage.getItem('cookie-consent');
            if (consent === 'all') return { analytics: true, marketing: true };
            if (consent) {
                const parsed = JSON.parse(consent);
                return {
                    analytics: parsed.analytics !== false,
                    marketing: parsed.marketing !== false
                };
            }
        } catch (e) {}
        return { analytics: true, marketing: true };
    });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setHasConsented(false);
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 500);
            return () => clearTimeout(timer);
        }

        const handleOpenSettings = () => {
            setHasConsented(false);
            setIsVisible(true);
            setShowSettings(true);
        };
        window.addEventListener('open-cookie-settings', handleOpenSettings);
        return () => window.removeEventListener('open-cookie-settings', handleOpenSettings);
    }, []);

    const handleAccept = () => {
        setIsCelebrating(true);
        setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                localStorage.setItem('cookie-consent', 'all');
                setHasConsented(true);
                setIsCelebrating(false);
            }, 1000);
        }, 850);
    };

    const handleSaveSettings = () => {
        setIsCelebrating(true);
        setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                localStorage.setItem('cookie-consent', JSON.stringify({ essential: true, ...preferences }));
                setHasConsented(true);
                setShowSettings(false);
                setIsCelebrating(false);
            }, 1000);
        }, 850);
    };

    useEffect(() => {
        if (isVisible || showSettings) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
            
            // Prevent touchmove on mobile to lock background scroll completely
            const preventDefault = (e) => e.preventDefault();
            document.addEventListener('touchmove', preventDefault, { passive: false });
            
            return () => {
                document.body.style.overflow = 'unset';
                document.body.style.paddingRight = '0px';
                document.removeEventListener('touchmove', preventDefault);
            };
        }
    }, [isVisible, showSettings]);

    if (hasConsented && !isVisible) return null;
    const closeBanner = () => {
        setIsVisible(false);
        setTimeout(() => setHasConsented(true), 1000);
    };

    const renderSettingsContent = (isMobile = false) => (
        <div className={isMobile ? "p-8 pt-4 pb-14" : "p-6 md:p-8"}>
            <p className="text-gray-500 dark:text-gray-400 text-[15px] md:text-[16px] leading-[1.6] mb-8 font-medium">
                Manage your cookie preferences. Essential cookies are always enabled as they are necessary for the website to function properly.
            </p>
            
            <div className="space-y-4 mb-10">
                <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/10">
                    <div className="pr-4">
                        <h4 className="font-bold text-gray-900 dark:text-white text-[15px]">Essential Cookies</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-[13px] mt-1 font-medium">Required for basic site functionality and security.</p>
                    </div>
                    <div className="w-11 h-6 bg-primary-500/50 rounded-full relative cursor-not-allowed opacity-70 flex-shrink-0" style={{ backgroundColor: 'var(--primary-color, #3b82f6)' }}>
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/10">
                    <div className="pr-4">
                        <h4 className="font-bold text-gray-900 dark:text-white text-[15px]">Analytics Cookies</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-[13px] mt-1 font-medium">Help us improve the website by tracking usage and performance.</p>
                    </div>
                    <button 
                        onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                        className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-300 flex-shrink-0 ${preferences.analytics ? '' : 'bg-gray-200 dark:bg-white/10'}`}
                        style={preferences.analytics ? { backgroundColor: 'var(--primary-color, #3b82f6)' } : {}}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${preferences.analytics ? 'right-1' : 'left-1'}`}></div>
                    </button>
                </div>

                <div className="flex items-center justify-between py-4">
                    <div className="pr-4">
                        <h4 className="font-bold text-gray-900 dark:text-white text-[15px]">Marketing Cookies</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-[13px] mt-1 font-medium">Used for targeted advertising and personalization.</p>
                    </div>
                    <button 
                        onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                        className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-300 flex-shrink-0 ${preferences.marketing ? '' : 'bg-gray-200 dark:bg-white/10'}`}
                        style={preferences.marketing ? { backgroundColor: 'var(--primary-color, #3b82f6)' } : {}}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${preferences.marketing ? 'right-1' : 'left-1'}`}></div>
                    </button>
                </div>
            </div>
            
            <div className="flex flex-row gap-3">
                <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-3.5 rounded-full text-[14px] font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 active:scale-[0.98] transition-all hover:bg-gray-50 dark:hover:bg-white/10 text-center"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSaveSettings}
                    className="flex-1 relative px-4 py-3.5 rounded-full text-[14px] font-bold text-white transition-all active:scale-[0.98] hover:opacity-90 text-center"
                    style={{ backgroundColor: 'var(--primary-color, #3b82f6)' }}
                >
                    {isCelebrating && (
                        <div className="absolute inset-0 pointer-events-none">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={`dot-${i}`} className={`heart-particle heart-dot-active-${i} ${i % 2 === 0 ? 'bg-red-500' : 'bg-pink-400'}`} />
                            ))}
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={`sparkle-${i}`} className={`heart-particle heart-sparkle heart-sparkle-active-${i} ${i % 2 === 0 ? 'bg-red-400' : 'bg-white'}`} />
                            ))}
                        </div>
                    )}
                    Save
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Backdrop for Banner */}
            <div 
                className={`fixed inset-0 z-[450] md:hidden bg-black/60 backdrop-blur-[4px] transition-opacity duration-700 ${isVisible && !showSettings ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                onClick={closeBanner}
            />

            <div className={`fixed bottom-0 left-0 right-0 z-[500] p-0 md:p-6 lg:p-8 flex items-end justify-center pointer-events-none transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${isVisible && !showSettings ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                
                {/* Mobile Bottom Sheet Design - Primary Banner */}
                <div className="md:hidden pointer-events-auto w-full bg-white dark:bg-dashboard-card rounded-t-[32px] shadow-[0_-12px_50px_rgba(0,0,0,0.18)] p-8 pt-4 pb-14 flex flex-col gap-6 relative overflow-hidden transition-colors duration-500">
                    {/* Drag Handle Decoration */}
                    <div className="w-14 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto my-1" />
                    
                    {/* Close Button (X) */}
                    <button
                        onClick={closeBanner}
                        className="absolute top-6 right-6 p-2.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90"
                        aria-label="Close"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-5">
                        <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20">
                            <HiOutlineShieldCheck className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 className="text-gray-900 dark:text-white font-black text-2xl tracking-tight">Cookie Preferences</h3>
                    </div>

                    <p className="text-gray-500 dark:text-gray-400 text-[16px] leading-[1.6] font-medium pr-2">
                        We use cookies to improve your browsing experience, analyze website traffic, and support our marketing efforts. By clicking "Allow All," you consent to the use of all cookies.
                    </p>

                    <div className="flex flex-row gap-3 mt-2">
                        <button
                            onClick={() => setShowSettings(true)}
                            className="flex-1 px-4 py-3.5 rounded-full text-[14px] font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 active:scale-[0.98] transition-all hover:bg-gray-50 dark:hover:bg-white/10 tracking-tight text-center"
                        >
                            Settings
                        </button>
                        <button
                            onClick={handleAccept}
                            className="flex-1 relative px-4 py-3.5 rounded-full text-[14px] font-bold text-white transition-all active:scale-[0.98] hover:opacity-90 tracking-tight text-center"
                            style={{ backgroundColor: 'var(--primary-color, #3b82f6)' }}
                        >
                            {isCelebrating && (
                                <div className="absolute inset-0 pointer-events-none">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <div key={`dot-${i}`} className={`heart-particle heart-dot-active-${i} ${i % 2 === 0 ? 'bg-red-500' : 'bg-pink-400'}`} />
                                    ))}
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <div key={`sparkle-${i}`} className={`heart-particle heart-sparkle heart-sparkle-active-${i} ${i % 2 === 0 ? 'bg-red-400' : 'bg-white'}`} />
                                    ))}
                                </div>
                            )}
                            Allow All
                        </button>
                    </div>
                </div>

                {/* Desktop Floating Card Design */}
                <div className="hidden md:flex pointer-events-auto w-full max-w-5xl bg-white dark:bg-dashboard-card border border-gray-100 dark:border-white/10 rounded-[20px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-4 md:p-5 flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 relative group transition-all duration-500">
                    <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-inner" style={{ background: 'rgba(var(--primary-rgb, 59, 130, 246), 0.08)', border: '1px solid rgba(var(--primary-rgb, 59, 130, 246), 0.15)' }}>
                        <HiOutlineShieldCheck className="w-6 h-6 md:w-7 md:h-7" style={{ color: 'var(--primary-color, #3b82f6)' }} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 dark:text-white font-bold text-xl md:text-xl mb-1.5 tracking-tight flex items-center gap-2">
                            Cookie Preferences
                            <span className="hidden md:inline-flex px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">Privacy</span>
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-[15px] leading-relaxed max-w-3xl font-medium">
                            We use cookies to improve your browsing experience, analyze website traffic, and support our marketing efforts. By clicking "Allow All," you consent to the use of all cookies.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto mt-2 md:mt-0">
                        <button
                            onClick={() => setShowSettings(true)}
                            className="px-5 py-2.5 rounded-full text-[13px] font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200 border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent w-full sm:w-auto text-center"
                        >
                            Settings
                        </button>
                        <button
                            onClick={handleAccept}
                            className="relative px-6 py-2.5 rounded-full text-[13px] font-semibold text-white transition-colors duration-200 w-full sm:w-auto text-center hover:opacity-90"
                            style={{ backgroundColor: 'var(--primary-color, #3b82f6)' }}
                        >
                            {isCelebrating && (
                                <div className="absolute inset-0 pointer-events-none">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <div key={`dot-${i}`} className={`heart-particle heart-dot-active-${i} ${i % 2 === 0 ? 'bg-red-500' : 'bg-pink-400'}`} />
                                    ))}
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <div key={`sparkle-${i}`} className={`heart-particle heart-sparkle heart-sparkle-active-${i} ${i % 2 === 0 ? 'bg-red-400' : 'bg-white'}`} />
                                    ))}
                                </div>
                            )}
                            Allow All
                        </button>
                    </div>

                    <button
                        onClick={closeBanner}
                        className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-white transition-colors p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                        aria-label="Close"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Cookie Settings - Mobile Bottom Sheet Variant */}
            <div 
                className={`fixed inset-0 z-[550] md:hidden bg-black/60 backdrop-blur-[4px] transition-opacity duration-700 ${showSettings ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                onClick={() => setShowSettings(false)}
            />
            <div className={`fixed bottom-0 left-0 right-0 z-[600] md:hidden p-0 flex items-end justify-center pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${showSettings ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                <div className="pointer-events-auto w-full bg-white dark:bg-dashboard-card rounded-t-[32px] shadow-[0_-12px_50px_rgba(0,0,0,0.18)] flex flex-col relative overflow-hidden transition-colors duration-500">
                    <div className="w-14 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto my-4 flex-shrink-0" />
                    
                    <button
                        onClick={() => setShowSettings(false)}
                        className="absolute top-6 right-6 p-2.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90"
                        aria-label="Close"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    <div className="px-8 flex items-center gap-5">
                        <h3 className="text-gray-900 dark:text-white font-black text-2xl tracking-tight">Cookie Settings</h3>
                    </div>

                    {renderSettingsContent(true)}
                </div>
            </div>

            {/* Cookie Settings Modal - Desktop Only */}
            {showSettings && !isMobile && (
                <Modal
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                    title="Cookie Settings"
                    size="md"
                >
                    {renderSettingsContent(false)}
                </Modal>
            )}
        </>
    );
};

export default CookieConsent;
