import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTenant } from '../../contexts/TenantContext';
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
    PhoneIcon,
    EnvelopeIcon,
    MapIcon,
} from '@heroicons/react/24/outline';
import Logo from '../Common/Logo';
import { getMediaUrl } from '../../utils/media';
import { publicApi } from '../../services/api';
import StyledSelect from '../Form/StyledSelect';

const PublicLayout = () => {
    const { theme } = useTheme();
    const { isMainDomain, agent, loading: tenantLoading } = useTenant();
    console.log('PublicLayout State:', { isMainDomain, agent, tenantLoading });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const isMapView = searchParams.get('view') === 'map';

    const navigation = isMainDomain ? [
        { name: 'Features', href: '/#features', icon: BuildingOfficeIcon },
        { name: 'Plans', href: '/#plans', icon: ChartBarIcon },
    ] : [
        { name: 'Home', href: '/', icon: HomeIcon },
        { name: 'Properties', href: '/listings', icon: BuildingOfficeIcon },
    ];

    const navigate = useNavigate();
    const [stations, setStations] = useState([]);

    // Fetch stations
    useEffect(() => {
        const fetchStations = async () => {
            try {
                const response = await publicApi.getStations();
                setStations(response.data.stations || []);
            } catch (error) {
                console.error('Failed to fetch stations:', error);
            }
        };
        fetchStations();
    }, []);

    const stationOptions = React.useMemo(() => {
        const groups = stations.reduce((acc, station) => {
            const line = station.line_name || 'Other';
            if (!acc[line]) {
                acc[line] = {
                    label: line,
                    options: []
                };
            }
            acc[line].options.push({
                value: station.id,
                label: station.name_en,
                line_name: station.line_name,
                line_color: station.line_color
            });
            return acc;
        }, {});

        return Object.values(groups);
    }, [stations]);

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const handleStationChange = (value) => {
        if (value) {
            // Ensure the value is passed correctly as a string ID
            const stationId = typeof value === 'object' ? value.value : value;
            if (stationId) {
                navigate(`/listings?station_id=${stationId}`);
            }
        }
    };

    const toggleMapView = () => {
        const params = new URLSearchParams(location.search);
        if (isMapView) {
            params.delete('view');
        } else {
            params.set('view', 'map');
        }
        navigate(`/listings?${params.toString()}`);
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
                <div
                    className={`md:hidden border-b border-white/10 sticky top-0 z-50 transition-all duration-300 shadow-md ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
                    style={{ backgroundColor: theme.primaryColor || '#111827' }}
                >
                    <div className="px-4 h-16 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            {theme.logoUrl ? (
                                <img src={getMediaUrl(theme.logoUrl)} alt="Logo" className="w-8 h-8 object-contain brightness-0 invert" />
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
                    <div className="absolute inset-y-0 left-0 w-3/4 max-w-xs bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-out">
                        <div className="flex flex-col h-full">
                            {/* Drawer Header */}
                            <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
                                <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                                    <Logo className="w-8 h-8 text-white" />
                                    <span className="text-xl font-bold text-white">Super</span>
                                </Link>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Drawer Links */}
                            <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                                {navigation.map((item) => {
                                    if (item.name === 'Properties') {
                                        return (
                                            <div key={item.name} className="relative group">
                                                <button
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors w-full text-left ${isActive(item.href)
                                                        ? 'bg-primary-900/30 text-primary-400'
                                                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                >
                                                    <item.icon className="w-5 h-5" />
                                                    <span>{item.name}</span>
                                                    <ChevronDownIcon className="w-4 h-4 ml-auto transition-transform group-hover:rotate-180" />
                                                </button>

                                                {/* Mega Menu Dropdown */}
                                                <div className="relative left-0 w-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[60] p-2">
                                                    <div className="bg-gray-800 backdrop-blur-xl shadow-xl border border-white/10 overflow-hidden p-4" style={{ borderRadius: 'var(--menu-radius)' }}>

                                                        {/* Property Types */}
                                                        <div className="flex flex-col gap-1 mb-4">
                                                            <Link to="/listings" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-gray-200 hover:text-white transition-colors group/link">
                                                                <span className="font-medium">All Properties</span>
                                                                <ArrowRightOnRectangleIcon className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                            </Link>
                                                            <Link to="/listings?type=rent" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-gray-200 hover:text-white transition-colors group/link">
                                                                <span className="font-medium">To Rent</span>
                                                                <ArrowRightOnRectangleIcon className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                            </Link>
                                                            <Link to="/listings?type=sale" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-gray-200 hover:text-white transition-colors group/link">
                                                                <span className="font-medium">To Buy</span>
                                                                <ArrowRightOnRectangleIcon className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                            </Link>
                                                        </div>

                                                        <div className="h-px bg-white/10 my-2" />

                                                        {/* Station Selector */}
                                                        <div className="mb-4">
                                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                                                Station
                                                            </label>
                                                            <div className="relative">
                                                                <StyledSelect
                                                                    options={stationOptions}
                                                                    onChange={handleStationChange}
                                                                    placeholder="Select Station"
                                                                    isSearchable={true}
                                                                    className="w-full text-gray-900"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Map Toggle */}
                                                        <div
                                                            onClick={toggleMapView}
                                                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${isMapView
                                                                ? 'bg-primary-900/30 border-primary-700 shadow-inner'
                                                                : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isMapView ? 'bg-primary-600 text-white' : 'bg-white/10 text-gray-400 border border-white/10'
                                                                    }`}>
                                                                    <MapIcon className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <div className={`font-semibold text-sm ${isMapView ? 'text-primary-400' : 'text-white'}`}>
                                                                        Map View
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {isMapView ? 'Active' : 'Switch to map'}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Toggle Switch UI */}
                                                            <div className={`w-10 h-6 rounded-full transition-colors relative ${isMapView ? 'bg-primary-600' : 'bg-gray-600'
                                                                }`}>
                                                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isMapView ? 'translate-x-4' : 'translate-x-0'
                                                                    }`} />
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${isActive(item.href)
                                                ? 'bg-primary-900/30 text-primary-400'
                                                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Drawer Footer (Auth) */}
                            <div className="p-4 border-t border-white/10 bg-gray-900">
                                {isAuthenticated ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 px-2 mb-2">
                                            <div className="w-10 h-10 bg-primary-900/40 text-primary-400 rounded-full flex items-center justify-center font-bold text-lg">
                                                {user?.first_name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{user?.first_name} {user?.last_name}</p>
                                                <p className="text-xs text-gray-500">{user?.email}</p>
                                            </div>
                                        </div>
                                        <Link
                                            to={(() => {
                                                if (user?.role === 'super_admin') return '/admin';
                                                if (user?.role === 'agent' || user?.role === 'sub_agent') {
                                                    const agent = user.agent;
                                                    if (agent && agent.subdomain) {
                                                        const currentHost = window.location.hostname;
                                                        const mainDomain = process.env.REACT_APP_MAIN_DOMAIN || 'superealestate.test';
                                                        const agentHost = agent.custom_domain || `${agent.subdomain}.${mainDomain}`;
                                                        if (currentHost !== agentHost) {
                                                            const protocol = window.location.protocol;
                                                            const port = window.location.port ? `:${window.location.port}` : '';
                                                            return `${protocol}//${agentHost}${port}/dashboard`;
                                                        }
                                                    }
                                                    return '/dashboard';
                                                }
                                                return '/dashboard';
                                            })()}
                                            onClick={(e) => {
                                                const to = e.currentTarget.getAttribute('href');
                                                if (to.startsWith('http')) {
                                                    e.preventDefault();
                                                    window.location.href = to;
                                                }
                                                setMobileMenuOpen(false);
                                            }}
                                            className="block w-full text-center py-2.5 bg-white/5 border border-white/10 text-gray-200 font-semibold shadow-sm hover:bg-white/10 transition-all"
                                            style={{ borderRadius: 'var(--btn-radius)' }}
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="block w-full py-2.5 text-red-500 font-semibold text-sm hover:bg-red-900/20 transition-colors"
                                            style={{ borderRadius: 'var(--btn-radius)' }}
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link
                                            to="/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex justify-center py-2.5 bg-white/5 border border-white/10 text-gray-200 font-semibold shadow-sm hover:bg-white/10 transition-all"
                                            style={{ borderRadius: 'var(--btn-radius)' }}
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex justify-center py-2.5 bg-primary-600 text-white font-semibold shadow-md hover:bg-primary-700 transition-all"
                                            style={{ borderRadius: 'var(--btn-radius)' }}
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div >
            )}

            {/* Desktop Navigation */}
            {
                !isMapView && (
                    <nav
                        className={`hidden md:block border-b border-white/10 sticky top-0 z-50 transition-all duration-300 shadow-md ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
                        style={{ backgroundColor: theme.primaryColor || '#111827' }}
                    >
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
                                                <img src={getMediaUrl(theme.logoUrl)} alt="Logo" className="w-8 h-8 object-contain brightness-0 invert" />
                                            ) : (
                                                <Logo className="w-8 h-8 text-white" />
                                            )}
                                            <span className="text-xl font-bold text-white group-hover:text-white/90 transition-colors">
                                                {theme.headerText || 'Super Real Estate'}
                                            </span>
                                        </Link>

                                        {/* Desktop Navigation Links */}
                                        <div className="flex items-center space-x-1">
                                            {navigation.map((item) => {
                                                if (item.name === 'Properties') {
                                                    return (
                                                        <div key={item.name} className="relative group px-1">
                                                            <button
                                                                className={`w-auto flex-none px-4 py-2 text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${isActive(item.href)
                                                                    ? 'bg-white/15 text-white shadow-sm'
                                                                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                                    }`}
                                                                style={{ borderRadius: 'var(--menu-radius)' }}
                                                            >
                                                                <span>{item.name}</span>
                                                                <ChevronDownIcon className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform duration-300" />
                                                            </button>

                                                            {/* Mega Menu Dropdown */}
                                                            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[60] w-[900px]">
                                                                <div className="bg-gray-900/95 backdrop-blur-xl shadow-2xl border border-white/10 p-6" style={{ borderRadius: 'var(--menu-radius)' }}>
                                                                    <div className="grid grid-cols-12 gap-8">

                                                                        {/* Column 1: Navigation Links (Span 3) */}
                                                                        <div className="col-span-3 border-r border-white/10 pr-8">
                                                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                                                                                Browse Properties
                                                                            </h3>
                                                                            <div className="flex flex-col gap-2">
                                                                                <Link to="/listings" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/10 text-gray-200 hover:text-white transition-all group/link">
                                                                                    <div className="flex flex-col">
                                                                                        <span className="font-semibold text-base">All Properties</span>
                                                                                        <span className="text-xs text-gray-500 font-normal">Explore our complete inventory</span>
                                                                                    </div>
                                                                                    <ArrowRightOnRectangleIcon className="w-5 h-5 opacity-0 group-hover/link:opacity-100 transition-all transform group-hover/link:translate-x-1" />
                                                                                </Link>
                                                                                <Link to="/listings?type=rent" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/10 text-gray-200 hover:text-white transition-all group/link">
                                                                                    <div className="flex flex-col">
                                                                                        <span className="font-semibold text-base">To Rent</span>
                                                                                        <span className="text-xs text-gray-500 font-normal">Find your next rental home</span>
                                                                                    </div>
                                                                                    <ArrowRightOnRectangleIcon className="w-5 h-5 opacity-0 group-hover/link:opacity-100 transition-all transform group-hover/link:translate-x-1" />
                                                                                </Link>
                                                                                <Link to="/listings?type=sale" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/10 text-gray-200 hover:text-white transition-all group/link">
                                                                                    <div className="flex flex-col">
                                                                                        <span className="font-semibold text-base">To Buy</span>
                                                                                        <span className="text-xs text-gray-500 font-normal">Invest in your dream property</span>
                                                                                    </div>
                                                                                    <ArrowRightOnRectangleIcon className="w-5 h-5 opacity-0 group-hover/link:opacity-100 transition-all transform group-hover/link:translate-x-1" />
                                                                                </Link>
                                                                            </div>
                                                                        </div>

                                                                        {/* Column 2: Filters & Tools (Span 4) */}
                                                                        <div className="col-span-4 border-r border-white/10 pr-8">
                                                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                                                                                Quick Filters
                                                                            </h3>

                                                                            {/* Station Selector */}
                                                                            <div className="mb-6">
                                                                                <label className="text-sm font-semibold text-gray-300 mb-2 block">
                                                                                    Search by Station
                                                                                </label>
                                                                                <StyledSelect
                                                                                    options={stationOptions}
                                                                                    onChange={handleStationChange}
                                                                                    placeholder="Select a BTS/MRT Station"
                                                                                    isSearchable={true}
                                                                                    className="w-full"
                                                                                />
                                                                                <p className="text-xs text-gray-500 mt-2 ml-1">
                                                                                    Find properties near popular transit lines
                                                                                </p>
                                                                            </div>

                                                                            {/* Map Toggle */}
                                                                            <div
                                                                                onClick={toggleMapView}
                                                                                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border group/map ${isMapView
                                                                                    ? 'bg-primary-900/30 border-primary-700 shadow-inner'
                                                                                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:shadow-md'
                                                                                    }`}
                                                                            >
                                                                                <div className="flex items-center gap-4">
                                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isMapView ? 'bg-primary-600 text-white' : 'bg-white/10 text-gray-400 group-hover/map:bg-white/20 group-hover/map:text-white'
                                                                                        }`}>
                                                                                        <MapIcon className="w-5 h-5" />
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className={`font-bold text-sm ${isMapView ? 'text-primary-400' : 'text-white'}`}>
                                                                                            Interactive Map View
                                                                                        </div>
                                                                                        <div className="text-xs text-gray-500">
                                                                                            {isMapView ? 'Currently Active' : 'Switch to explore on map'}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div className={`w-12 h-7 rounded-full transition-colors relative ${isMapView ? 'bg-primary-600' : 'bg-gray-600'
                                                                                    }`}>
                                                                                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${isMapView ? 'translate-x-5' : 'translate-x-0'
                                                                                        }`} />
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Column 3: Featured / Visual (Span 5) */}
                                                                        <div className="col-span-5 pl-4">
                                                                            <div className="relative h-full rounded-2xl overflow-hidden bg-gray-900 group/card">
                                                                                <img
                                                                                    src="https://images.unsplash.com/photo-1600596542815-2495db9a72c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                                                                    alt="Luxury Home"
                                                                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/card:scale-105 transition-transform duration-700"
                                                                                />
                                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                                                                <div className="absolute bottom-0 left-0 p-6">
                                                                                    <span className="inline-block px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full mb-3">
                                                                                        FEATURED
                                                                                    </span>
                                                                                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                                                                                        Discover Your Dream Home
                                                                                    </h3>
                                                                                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                                                                                        Explore our exclusive collection of premium properties across the city.
                                                                                    </p>
                                                                                    <Link to="/listings" className="inline-flex items-center text-white font-semibold hover:text-primary-400 transition-colors">
                                                                                        Start Browsing
                                                                                        <ArrowRightOnRectangleIcon className="w-5 h-5 ml-2" />
                                                                                    </Link>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <Link
                                                        key={item.name}
                                                        to={item.href}
                                                        className={`w-auto flex-none px-4 py-2 text-sm font-semibold transition-all duration-200 ${isActive(item.href)
                                                            ? 'bg-white/15 text-white shadow-sm'
                                                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                            }`}
                                                        style={{ borderRadius: 'var(--btn-radius)' }}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                );
                                            })}

                                            {/* Contact Hover Menu */}
                                            <div className="relative group px-1">
                                                <button
                                                    className="w-auto flex-none px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center gap-1.5"
                                                    style={{ borderRadius: 'var(--menu-radius)' }}
                                                >
                                                    Contact
                                                    <ChevronDownIcon className="w-4 h-4 opacity-50 group-hover:rotate-180 transition-transform duration-300" />
                                                </button>

                                                {/* Contact Dropdown Content */}
                                                <div className="absolute left-1/2 -translate-x-1/2 mt-4 w-[480px] opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-[60]">
                                                    <div className="bg-gray-900/95 backdrop-blur-xl shadow-2xl border border-white/10 overflow-hidden p-1" style={{ borderRadius: 'var(--menu-radius)' }}>
                                                        {/* Contact Header */}
                                                        {/* Contact Header */}
                                                        <div className="px-6 py-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white text-center" style={{ borderRadius: 'calc(var(--menu-radius) - 4px)' }}>
                                                            <h3 className="text-xl font-bold opacity-95 tracking-wide">Get in Touch</h3>
                                                            <p className="text-sm opacity-80 mt-1 font-medium text-white/90">We'd love to hear from you. Connect with us on social media.</p>
                                                            {agent?.phone && (
                                                                <a href={`tel:${agent.phone}`} className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                                                                    <PhoneIcon className="w-4 h-4" />
                                                                    <span className="font-bold tracking-wide">{agent.phone}</span>
                                                                </a>
                                                            )}
                                                        </div>

                                                        {/* Social Media Section */}
                                                        {(agent?.facebook || agent?.instagram || agent?.linkedin || agent?.line) && (
                                                            <div className="p-8">
                                                                <div className="flex items-center justify-center gap-6">
                                                                    {agent?.facebook && (
                                                                        <a href={agent.facebook} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group/icon">
                                                                            <div className="w-14 h-14 rounded-full bg-blue-900/20 border border-blue-500/20 flex items-center justify-center text-[#1877F2] group-hover/icon:bg-[#1877F2] group-hover/icon:text-white transition-all duration-300 shadow-sm group-hover/icon:shadow-md group-hover/icon:scale-110">
                                                                                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                                                            </div>
                                                                            <span className="text-xs font-semibold text-gray-400 group-hover/icon:text-primary-400 transition-colors">Facebook</span>
                                                                        </a>
                                                                    )}
                                                                    {agent?.instagram && (
                                                                        <a href={agent.instagram} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group/icon">
                                                                            <div className="w-14 h-14 rounded-full bg-pink-900/20 border border-pink-500/20 flex items-center justify-center text-[#E4405F] group-hover/icon:bg-gradient-to-tr group-hover/icon:from-[#f9ce34] group-hover/icon:via-[#ee2a7b] group-hover/icon:to-[#6228d7] group-hover/icon:text-white transition-all duration-300 shadow-sm group-hover/icon:shadow-md group-hover/icon:scale-110">
                                                                                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                                                            </div>
                                                                            <span className="text-xs font-semibold text-gray-400 group-hover/icon:text-primary-400 transition-colors">Instagram</span>
                                                                        </a>
                                                                    )}
                                                                    {agent?.linkedin && (
                                                                        <a href={agent.linkedin} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group/icon">
                                                                            <div className="w-14 h-14 rounded-full bg-sky-900/20 border border-sky-500/20 flex items-center justify-center text-[#0A66C2] group-hover/icon:bg-[#0A66C2] group-hover/icon:text-white transition-all duration-300 shadow-sm group-hover/icon:shadow-md group-hover/icon:scale-110">
                                                                                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                                                            </div>
                                                                            <span className="text-xs font-semibold text-gray-400 group-hover/icon:text-primary-400 transition-colors">LinkedIn</span>
                                                                        </a>
                                                                    )}
                                                                    {agent?.line && (
                                                                        <a href={agent.line.startsWith('http') ? agent.line : `https://line.me/ti/p/~${agent.line}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group/icon">
                                                                            <div className="w-14 h-14 rounded-full bg-green-900/20 border border-green-500/20 flex items-center justify-center text-[#06C755] group-hover/icon:bg-[#06C755] group-hover/icon:text-white transition-all duration-300 shadow-sm group-hover/icon:shadow-md group-hover/icon:scale-110">
                                                                                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738s-12 4.369-12 9.738c0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975 1.838-1.956 2.548-3.872 2.548-5.968zm-14.621 4.316h-2.193c-.233 0-.422-.189-.422-.422v-4.322c0-.233.189-.422.422-.422h.211c.233 0 .422.189.422.422v3.689h1.56c.233 0 .422.189.422.422v.211c0 .233-.189.422-.422.422zm3.047 0h-.211c-.233 0-.422-.189-.422-.422v-4.322c0-.233.189-.422.422-.422h.211c.233 0 .422.189.422.422v4.322c0 .233-.189.422-.422.422zm5.54 0h-2.109c-.233 0-.422-.189-.422-.422v-4.322c0-.233.189-.422.422-.422h2.109c.233 0 .422.189.422.422v.211c0 .233-.189.422-.422.422h-1.687v1.178h1.687c.233 0 .422.189.422.422v.211c0 .233-.189.422-.422.422h-1.687v1.256h1.687c.233 0 .422.189.422.422v.211c0 .233-.189.422-.422.422zm-2.822 0h-.211c-.236 0-.437-.179-.422-.422l.149-2.316-1.127-1.859c-.11-.18-.088-.422.137-.422h.252c.162 0 .307.094.382.239l.86 1.481.854-1.481c.075-.145.22-.239.382-.239h.252c.225 0 .247.242.137.422l-1.127 1.859.149 2.316c.015.243-.186.422-.422.422z" /></svg>
                                                                            </div>
                                                                            <span className="text-xs font-semibold text-gray-400 group-hover/icon:text-primary-400 transition-colors">LINE</span>
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Auth Buttons */}
                                        <div className="flex items-center space-x-4">
                                            {isAuthenticated ? (
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        to="/my-bookings"
                                                        className="flex items-center px-5 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg shadow-black/5 active:scale-95"
                                                        style={{ borderRadius: 'var(--btn-radius)' }}
                                                    >
                                                        <span className="text-sm font-black tracking-wide">Bookings</span>
                                                    </Link>

                                                    <div className="relative" ref={userMenuRef}>
                                                        <button
                                                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                                                            className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1 transition-all duration-500 backdrop-blur-md border ${userMenuOpen
                                                                ? 'bg-white text-primary-600 border-white shadow-xl scale-105'
                                                                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                                                }`}
                                                            style={{ borderRadius: 'var(--menu-radius)' }}
                                                        >
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-sm shadow-black/10 transition-colors duration-500 ${userMenuOpen ? 'bg-primary-600 text-white' : 'bg-white text-primary-600'}`}>
                                                                {user?.first_name?.[0]?.toUpperCase() || <UserCircleIcon className="w-5 h-5" />}
                                                            </div>
                                                            <div className="flex flex-col items-start">
                                                                <span className={`text-[10px] font-black leading-none mb-0.5 uppercase tracking-wider opacity-60 ${userMenuOpen ? 'text-primary-400' : 'text-white'}`}>Account</span>
                                                                <span className={`text-sm font-black leading-none max-w-[80px] truncate ${userMenuOpen ? 'text-primary-700' : 'text-white'}`}>
                                                                    {user?.first_name}
                                                                </span>
                                                            </div>
                                                            <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-500 ${userMenuOpen ? 'rotate-180 opacity-100' : 'opacity-40'}`} />
                                                        </button>

                                                        {/* Dropdown Menu */}
                                                        {userMenuOpen && (
                                                            <div className="absolute right-0 mt-3 w-60 bg-white shadow-xl shadow-blue-900/10 py-2 ring-1 ring-black/5 focus:outline-none animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden" style={{ borderRadius: 'var(--menu-radius)' }}>
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
                                                                    {(user?.role === 'agent' || user?.role === 'sub_agent' || user?.role === 'super_admin') && (
                                                                        <Link
                                                                            to={(() => {
                                                                                if (user?.role === 'super_admin') return '/admin';
                                                                                if (user?.role === 'agent' || user?.role === 'sub_agent') {
                                                                                    const agent = user.agent;
                                                                                    if (agent && agent.subdomain) {
                                                                                        const currentHost = window.location.hostname;
                                                                                        const mainDomain = process.env.REACT_APP_MAIN_DOMAIN || 'superealestate.test';
                                                                                        const agentHost = agent.custom_domain || `${agent.subdomain}.${mainDomain}`;
                                                                                        if (currentHost !== agentHost) {
                                                                                            const protocol = window.location.protocol;
                                                                                            const port = window.location.port ? `:${window.location.port}` : '';
                                                                                            return `${protocol}//${agentHost}${port}/dashboard`;
                                                                                        }
                                                                                    }
                                                                                    return '/dashboard';
                                                                                }
                                                                                return '/dashboard';
                                                                            })()}
                                                                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 font-bold rounded-xl transition-colors group"
                                                                            onClick={(e) => {
                                                                                const href = e.currentTarget.getAttribute('href');
                                                                                if (href.startsWith('http')) {
                                                                                    e.preventDefault();
                                                                                    window.location.href = href;
                                                                                }
                                                                                setUserMenuOpen(false);
                                                                            }}
                                                                        >
                                                                            <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                                                                                <ChartBarIcon className="w-5 h-5 text-gray-500 group-hover:text-primary-600" />
                                                                            </div>
                                                                            Dashboard
                                                                        </Link>
                                                                    )}
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
                                                    <Link to="/register" className="bg-white text-primary-600 px-5 py-2 text-sm font-bold shadow-lg shadow-black/5 hover:bg-gray-50 active:scale-95 transition-all" style={{ borderRadius: 'var(--btn-radius)' }}>
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
                )
            }

            {/* Main Content */}
            <main className="flex-1">
                <Outlet context={{ navVisible: isVisible }} />
            </main>

            {/* Mobile Bottom Navigation Removed */}
            {/* Footer */}
            {
                !isMapView && (
                    <footer className="bg-gray-900 text-gray-400">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <div className="col-span-1 md:col-span-2">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Logo className="w-8 h-8 text-white" />
                                        <span className="text-xl font-bold text-white">Super</span>
                                    </div>
                                    <p className="text-sm max-w-md">
                                        Empowering real estate agents with premium digital tools.
                                        Create your own branded property portal in minutes.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-4">Platform</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li><Link to="/#features" className="hover:text-white">Features</Link></li>
                                        <li><Link to="/#plans" className="hover:text-white">Pricing Plans</Link></li>
                                        <li><Link to="/register" className="hover:text-white">Get Started</Link></li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-4">Support</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li><Link to="/login" className="hover:text-white">Agent Login</Link></li>
                                        <li><Link to="/register" className="hover:text-white">Create Account</Link></li>
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
