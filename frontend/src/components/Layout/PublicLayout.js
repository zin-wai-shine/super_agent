import React, { useState, useRef, useEffect } from 'react';
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
    ChevronDownIcon,
    ArrowRightOnRectangleIcon,
    ChartBarIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import Logo from '../Common/Logo';

const PublicLayout = () => {
    const { theme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const isMapView = searchParams.get('view') === 'map';

    const navigation = [
        { name: 'Home', href: '/', icon: HomeIcon },
        { name: 'Properties', href: '/listings', icon: BuildingOfficeIcon },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    // Dropdown Logic
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Auto-hide navbar logic
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = React.useRef(0);

    React.useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show when scrolling up or at top
            if (currentScrollY < lastScrollY.current || currentScrollY < 10) {
                setIsVisible(true);
            }
            // Hide when scrolling down
            else if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
                setIsVisible(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const [isNavLoading, setIsNavLoading] = useState(true);

    React.useEffect(() => {
        // Match the ListingsPage 800ms delay
        const timer = setTimeout(() => setIsNavLoading(false), 800);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col" style={{ fontFamily: theme.fontFamily }}>
            {/* Mobile Header (Hamburger + Logo) */}
            {!isMapView && (
                <div className={`md:hidden bg-primary-600 border-b border-white/10 sticky top-0 z-50 transition-all duration-300 shadow-md ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
                    <div className="px-4 h-16 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            {theme.logoUrl ? (
                                <img src={theme.logoUrl} alt="Logo" className="w-8 h-8 object-contain brightness-0 invert" />
                            ) : (
                                <Logo className="w-8 h-8 text-white" />
                            )}
                            <span className="text-lg font-bold text-white">
                                {theme.headerText || 'Super Real Estate'}
                            </span>
                        </Link>
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="text-white p-1 -mr-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Bars3Icon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation Drawer (Mobile) */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Drawer Panel */}
                    <div className="absolute inset-y-0 left-0 w-3/4 max-w-xs bg-white shadow-2xl transform transition-transform duration-300 ease-out">
                        <div className="flex flex-col h-full">
                            {/* Drawer Header */}
                            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                                <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                                    <Logo className="w-8 h-8 text-primary-600" />
                                    <span className="text-xl font-bold text-gray-900">Super</span>
                                </Link>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Drawer Links */}
                            <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${isActive(item.href)
                                            ? 'bg-primary-50 text-primary-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                ))}
                                <Link
                                    to="/listings?view=map"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                >
                                    <MapPinIcon className="w-5 h-5" />
                                    Map Search
                                </Link>
                            </div>

                            {/* Drawer Footer (Auth) */}
                            <div className="p-4 border-t border-gray-100 bg-gray-50">
                                {isAuthenticated ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 px-2 mb-2">
                                            <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-lg">
                                                {user?.first_name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
                                                <p className="text-xs text-gray-500">{user?.email}</p>
                                            </div>
                                        </div>
                                        <Link
                                            to={user?.role === 'super_admin' ? '/admin' : '/agent'}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block w-full text-center py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-all"
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="block w-full py-2.5 text-red-600 font-semibold text-sm hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link
                                            to="/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex justify-center py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-all"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex justify-center py-2.5 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-all"
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Navigation */}
            {!isMapView && (
                <nav className={`hidden md:block bg-primary-600 border-b border-white/10 sticky top-0 z-50 transition-all duration-300 shadow-md ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
                    <div className="w-full px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {isNavLoading ? (
                                <div className="flex items-center justify-between w-full animate-pulse">
                                    {/* Logo Skeleton */}
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-white/20 rounded" />
                                        <div className="w-32 h-6 bg-white/20 rounded" />
                                    </div>
                                    {/* Nav Links Skeleton */}
                                    <div className="flex items-center space-x-1">
                                        <div className="w-16 h-8 bg-white/10 rounded-lg mx-1" />
                                        <div className="w-24 h-8 bg-white/10 rounded-lg mx-1" />
                                    </div>
                                    {/* Auth Skeleton */}
                                    <div className="flex items-center space-x-4">
                                        <div className="w-20 h-4 bg-white/10 rounded" />
                                        <div className="w-8 h-8 bg-white/20 rounded-full" />
                                        <div className="w-16 h-4 bg-white/10 rounded" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Logo */}
                                    <Link to="/" className="flex items-center space-x-2 group">
                                        {theme.logoUrl ? (
                                            <img src={theme.logoUrl} alt="Logo" className="w-8 h-8 object-contain brightness-0 invert" />
                                        ) : (
                                            <Logo className="w-8 h-8 text-white" />
                                        )}
                                        <span className="text-xl font-bold text-white group-hover:text-white/90 transition-colors">
                                            {theme.headerText || 'Super Real Estate'}
                                        </span>
                                    </Link>

                                    {/* Desktop Navigation Links */}
                                    <div className="flex items-center space-x-1">
                                        {navigation.map((item) => (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive(item.href)
                                                    ? 'bg-white/15 text-white shadow-sm'
                                                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>

                                    {/* Auth Buttons */}
                                    <div className="flex items-center space-x-4">
                                        {isAuthenticated ? (
                                            <div className="flex items-center space-x-4">
                                                <div className="relative" ref={userMenuRef}>
                                                    <button
                                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                                        className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border transition-all duration-200 ${userMenuOpen
                                                            ? 'bg-white text-primary-600 border-white ring-2 ring-white/20'
                                                            : 'bg-black/20 text-white border-white/10 hover:bg-black/30'
                                                            }`}
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-white text-primary-600 flex items-center justify-center font-bold text-sm shadow-sm">
                                                            {user?.first_name?.[0]?.toUpperCase() || <UserCircleIcon className="w-6 h-6" />}
                                                        </div>
                                                        <div className="flex flex-col items-start mr-1">
                                                            <span className="text-xs font-bold leading-none mb-0.5 opacity-90">Hello,</span>
                                                            <span className="text-sm font-bold leading-none max-w-[80px] truncate">
                                                                {user?.first_name}
                                                            </span>
                                                        </div>
                                                        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''} opacity-70`} />
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {userMenuOpen && (
                                                        <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl shadow-blue-900/10 py-2 ring-1 ring-black/5 focus:outline-none animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
                                                            {/* User Header */}
                                                            <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                                    {user?.first_name} {user?.last_name}
                                                                </p>
                                                                <p className="text-xs text-gray-500 truncate font-medium mt-0.5">
                                                                    {user?.email}
                                                                </p>
                                                            </div>

                                                            <div className="py-2 px-2 space-y-0.5">
                                                                {(user?.role === 'agent' || user?.role === 'super_admin') && (
                                                                    <Link
                                                                        to={user?.role === 'super_admin' ? '/admin' : '/agent'}
                                                                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 font-bold rounded-xl transition-colors group"
                                                                        onClick={() => setUserMenuOpen(false)}
                                                                    >
                                                                        <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                                                                            <ChartBarIcon className="w-5 h-5 text-gray-500 group-hover:text-primary-600" />
                                                                        </div>
                                                                        Dashboard
                                                                    </Link>
                                                                )}
                                                                <Link
                                                                    to="/my-bookings"
                                                                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 font-bold rounded-xl transition-colors group"
                                                                    onClick={() => setUserMenuOpen(false)}
                                                                >
                                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                                                                        <CalendarDaysIcon className="w-5 h-5 text-gray-500 group-hover:text-primary-600" />
                                                                    </div>
                                                                    My Bookings
                                                                </Link>
                                                            </div>

                                                            <div className="py-2 px-2 border-t border-gray-50 mt-1">
                                                                <button
                                                                    onClick={() => {
                                                                        logout();
                                                                        setUserMenuOpen(false);
                                                                    }}
                                                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-bold rounded-xl transition-colors group"
                                                                >
                                                                    <div className="w-8 h-8 rounded-lg bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center transition-colors">
                                                                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                                                    </div>
                                                                    Sign out
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <Link
                                                    to="/login"
                                                    className="text-sm font-semibold text-white/90 hover:text-white transition-colors"
                                                >
                                                    Sign in
                                                </Link>
                                                <Link to="/register" className="bg-white text-primary-600 px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-black/5 hover:bg-gray-50 active:scale-95 transition-all">
                                                    Get Started
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </nav>
            )}

            {/* Main Content */}
            <main className="flex-1">
                <Outlet context={{ navVisible: isVisible }} />
            </main>

            {/* Mobile Bottom Navigation Removed */}
            {/* Footer */}
            {!isMapView && (
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
            )}
        </div >
    );
};

export default PublicLayout;
