import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    BuildingOfficeIcon,
    MapPinIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import Logo from '../Common/Logo';
import MobileBottomNav from './MobileBottomNav';

const PublicLayout = () => {
    const { theme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Home', href: '/', icon: HomeIcon },
        { name: 'Properties', href: '/listings', icon: BuildingOfficeIcon },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    // Auto-hide navbar logic
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isNavLoading, setIsNavLoading] = useState(true);

    React.useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show if scrolling up or at top
            if (currentScrollY < lastScrollY || currentScrollY < 50) {
                setIsVisible(true);
            }
            // Hide if scrolling down and past threshold
            else if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Match the ListingsPage 800ms delay
        const timer = setTimeout(() => setIsNavLoading(false), 800);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, [lastScrollY]);

    return (
        <div className="min-h-screen flex flex-col" style={{ fontFamily: theme.fontFamily }}>
            {/* Navigation */}
            <nav className={`bg-white border-b border-gray-200 sticky top-0 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
                }`}>
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {isNavLoading ? (
                            <div className="flex items-center justify-between w-full animate-pulse">
                                {/* Logo Skeleton */}
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gray-200 rounded" />
                                    <div className="w-32 h-6 bg-gray-200 rounded" />
                                </div>
                                {/* Nav Links Skeleton */}
                                <div className="hidden md:flex items-center space-x-1">
                                    <div className="w-16 h-8 bg-gray-100 rounded-lg mx-1" />
                                    <div className="w-24 h-8 bg-gray-100 rounded-lg mx-1" />
                                </div>
                                {/* Auth Skeleton */}
                                <div className="hidden md:flex items-center space-x-4">
                                    <div className="w-20 h-4 bg-gray-100 rounded" />
                                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                                    <div className="w-16 h-4 bg-gray-100 rounded" />
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Logo */}
                                <Link to="/" className="flex items-center space-x-2">
                                    {theme.logoUrl ? (
                                        <img src={theme.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                                    ) : (
                                        <Logo className="w-8 h-8" style={{ color: theme.primaryColor }} />
                                    )}
                                    <span className="text-xl font-bold text-gray-900">
                                        {theme.headerText || 'Super Real Estate'}
                                    </span>
                                </Link>

                                {/* Desktop Navigation */}
                                <div className="hidden md:flex items-center space-x-1">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.href)
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>

                                {/* Auth Buttons */}
                                <div className="hidden md:flex items-center space-x-4">
                                    {isAuthenticated ? (
                                        <div className="flex items-center space-x-4">
                                            <Link
                                                to={user?.role === 'super_admin' ? '/admin' : '/agent'}
                                                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                                            >
                                                Dashboard
                                            </Link>
                                            <div className="flex items-center space-x-2">
                                                <UserCircleIcon className="w-8 h-8 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">
                                                    {user?.first_name}
                                                </span>
                                            </div>
                                            <button
                                                onClick={logout}
                                                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Link
                                                to="/login"
                                                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                                            >
                                                Sign in
                                            </Link>
                                            <Link to="/register" className="btn-primary text-sm py-2">
                                                Get Started
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Mobile menu button removed for Bottom Nav */}
                        <div className="md:hidden w-8"></div> {/* Spacer to balance logo */}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1">
                <Outlet context={{ navVisible: isVisible }} />
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />

            {/* Footer */}
            {
                !location.pathname.startsWith('/listings') && (
                    <footer className="bg-gray-900 text-gray-400">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <div className="col-span-1 md:col-span-2">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Logo className="w-8 h-8 text-white" />
                                        <span className="text-xl font-bold text-white">Super</span>
                                    </div>
                                    <p className="text-sm max-w-md">
                                        Find your dream property near Bangkok's transit stations.
                                        We make property search easy with our interactive transit map.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li><Link to="/listings" className="hover:text-white">Browse Properties</Link></li>
                                        <li><Link to="/listings?view=map" className="hover:text-white">Map Search</Link></li>
                                        <li><Link to="/register" className="hover:text-white">List Your Property</Link></li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-4">For Agents</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li><Link to="/register" className="hover:text-white">Become an Agent</Link></li>
                                        <li><Link to="/login" className="hover:text-white">Agent Login</Link></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
                                <p>{theme.footerText || `© ${new Date().getFullYear()} Super Real Estate. All rights reserved.`}</p>
                            </div>
                        </div>
                    </footer>
                )
            }
        </div >
    );
};

export default PublicLayout;
