import React from 'react';
import { BASE_URL } from '../../services/api';

const BrandLoading = ({ agent, isMainDomain, isExiting }) => {
    // Correctly map backend fields: agent.logo and agent.name
    // Use theme primary color if available
    const rawLogo = agent?.logo || agent?.theme?.logo_url;
    const siteTitle = agent?.theme?.header_text || agent?.name || (isMainDomain ? 'Super Real Estate' : 'Real Estate Portal');
    
    // Theme colors: Handle both camelCase and snake_case from backend/theme
    const primaryColor = agent?.theme?.primary_color || agent?.theme?.primaryColor || '#2D8A56';

    // Form the absolute URL for the logo
    let logoUrl = null;
    if (rawLogo) {
        if (rawLogo.startsWith('http')) {
            logoUrl = rawLogo;
        } else {
            // Ensure the slash is handled correctly between BASE_URL and rawLogo
            const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
            const path = rawLogo.startsWith('/') ? rawLogo : `/${rawLogo}`;
            logoUrl = `${base}${path}`;
        }
    }

    return (
        <div className={`fixed inset-0 bg-white z-[9999] flex items-center justify-center ${isExiting ? 'animate-fade-out pointer-events-none' : 'animate-fade-in'}`}>
            <div className="relative flex items-center justify-center">
                {/* Minimalist Logo Display */}
                <div className="relative w-56 h-56 flex items-center justify-center transform transition-all duration-700 animate-logo-pulse">
                    {logoUrl ? (
                        <div className="w-full h-full relative">
                            <img 
                                src={logoUrl} 
                                alt="Logo" 
                                className="w-full h-full object-contain relative z-10"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    const fallback = e.target.parentElement.querySelector('.logo-fallback');
                                    if (fallback) fallback.style.display = 'flex';
                                }}
                            />
                            <div 
                                className="logo-fallback absolute inset-0 hidden items-center justify-center text-white font-black text-4xl tracking-tighter rounded-3xl"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {siteTitle?.charAt(0) || 'S'}
                            </div>
                        </div>
                    ) : (
                        <div 
                            className="w-20 h-20 flex items-center justify-center text-white font-black text-4xl tracking-tighter rounded-3xl shadow-xl"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {siteTitle?.charAt(0) || 'S'}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Branding text below */}
            <div className="absolute bottom-16 left-0 right-0 text-center animate-fade-up">
                <p className="text-[13px] font-bold text-gray-500 uppercase tracking-[0.25em]">
                    {siteTitle}
                </p>
                <div className="mt-3 flex justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, animationDelay: '300ms' }} />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fade-out {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes logo-pulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(1); opacity: 0.8; }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
                .animate-fade-out {
                    animation: fade-out 0.5s ease-out forwards;
                }
                .animate-fade-up {
                    animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
                    opacity: 0;
                }
                .animate-logo-pulse {
                    animation: logo-pulse 2s ease-in-out infinite;
                }
                `
            }} />
        </div>
    );
};

export default BrandLoading;
