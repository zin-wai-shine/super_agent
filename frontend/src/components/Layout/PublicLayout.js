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
    HeartIcon,
} from '@heroicons/react/24/outline';
import {
    FiSearch,
    FiHome,
    FiKey,
    FiDollarSign,
    FiPlusCircle,
    FiStar,
    FiClock,
    FiMapPin,
    FiHeart,
    FiUsers,
    FiBookOpen,
    FiBriefcase,
    FiZap,
    FiMessageCircle,
    FiFacebook,
    FiCalendar,
    FiUser,
    FiShield,
    FiFileText,
    FiTruck,
    FiSettings,
} from 'react-icons/fi';
import { CiBookmark } from 'react-icons/ci';
import {
    HiOutlineBuildingOffice2,
    HiOutlineHomeModern,
    HiOutlineBuildingStorefront,
    HiOutlineGlobeAsiaAustralia,
} from 'react-icons/hi2';
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
        { name: 'Services', href: '/services', icon: FiBriefcase },
    ] : [
        { name: 'Home', href: '/', icon: HomeIcon },
        { name: 'Properties', href: '/listings', icon: BuildingOfficeIcon },
        { name: 'Services', href: '/services', icon: FiBriefcase },
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
                    <div className="absolute inset-y-0 left-0 w-3/4 max-w-xs shadow-2xl transform transition-transform duration-300 ease-out border-r" style={{ backgroundColor: 'var(--menu-bg-color)', borderColor: 'var(--menu-border)' }}>
                        <div className="flex flex-col h-full">
                            {/* Drawer Header */}
                            <div className="h-16 flex items-center justify-between px-4 border-b" style={{ borderColor: 'var(--menu-border)' }}>
                                <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                                    <Logo className="w-8 h-8" style={{ color: 'var(--primary-color)' }} />
                                    <span className="text-xl font-bold" style={{ color: 'var(--menu-text-primary)' }}>Super</span>
                                </Link>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 transition-colors rounded-lg"
                                    style={{ color: 'var(--menu-text-secondary)', hoverBg: 'var(--menu-hover-bg)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--menu-hover-bg)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                                                    <div className="backdrop-blur-xl shadow-xl border border-white/10 overflow-hidden p-4" style={{ borderRadius: 'var(--menu-radius)', backgroundColor: 'var(--menu-bg-color)' }}>

                                                        {/* Property Types */}
                                                        <div className="flex flex-col gap-1 mb-4">
                                                            <Link to="/listings" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors group/link" style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--menu-hover-bg)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                                <span className="font-medium" style={{ color: 'var(--menu-text-primary)' }}>All Properties</span>
                                                                <ArrowRightOnRectangleIcon className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" style={{ color: 'var(--menu-text-primary)' }} />
                                                            </Link>
                                                            <Link to="/listings?type=rent" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors group/link" style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--menu-hover-bg)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                                <span className="font-medium" style={{ color: 'var(--menu-text-primary)' }}>To Rent</span>
                                                                <ArrowRightOnRectangleIcon className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" style={{ color: 'var(--menu-text-primary)' }} />
                                                            </Link>
                                                            <Link to="/listings?type=sale" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors group/link" style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--menu-hover-bg)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                                <span className="font-medium" style={{ color: 'var(--menu-text-primary)' }}>To Buy</span>
                                                                <ArrowRightOnRectangleIcon className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" style={{ color: 'var(--menu-text-primary)' }} />
                                                            </Link>
                                                        </div>

                                                        <div className="h-px bg-white/10 my-2" />

                                                        {/* Station Selector */}
                                                        <div className="mb-4">
                                                            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--menu-text-muted)' }}>
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
                                                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border`}
                                                            style={{
                                                                backgroundColor: isMapView ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--menu-hover-bg)',
                                                                borderColor: isMapView ? 'var(--primary-color)' : 'var(--menu-border)'
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isMapView ? 'bg-primary-600 text-white' : 'bg-white/10 text-gray-400 border border-white/10'
                                                                    }`}>
                                                                    <MapIcon className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-sm" style={{ color: isMapView ? 'var(--primary-color)' : 'var(--menu-text-primary)' }}>
                                                                        Map View
                                                                    </div>
                                                                    <div className="text-xs" style={{ color: 'var(--menu-text-secondary)' }}>
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
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors`}
                                            style={{
                                                color: isActive(item.href) ? 'var(--primary-color)' : 'var(--menu-text-primary)',
                                                backgroundColor: isActive(item.href) ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent'
                                            }}
                                            onMouseEnter={(e) => !isActive(item.href) && (e.currentTarget.style.backgroundColor = 'var(--menu-hover-bg)')}
                                            onMouseLeave={(e) => !isActive(item.href) && (e.currentTarget.style.backgroundColor = 'transparent')}
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
                                            className="block w-full text-center py-2.5 bg-white/5 border font-semibold shadow-sm transition-all"
                                            style={{
                                                borderRadius: 'var(--btn-radius)',
                                                color: 'var(--menu-text-primary)',
                                                borderColor: 'var(--menu-border)',
                                                backgroundColor: 'var(--menu-hover-bg)'
                                            }}
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
                                            className="flex justify-center py-2.5 border font-semibold shadow-sm transition-all"
                                            style={{
                                                borderRadius: 'var(--btn-radius)',
                                                color: 'var(--menu-text-primary)',
                                                borderColor: 'var(--menu-border)',
                                                backgroundColor: 'var(--menu-hover-bg)'
                                            }}
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
                        className={`hidden md:block border-b sticky top-0 z-50 transition-all duration-300 shadow-md ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
                        style={{
                            backgroundColor: theme.primaryColor || '#111827',
                            borderColor: 'var(--nav-border)'
                        }}
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
                                        <Link to="/" className="flex items-center space-x-3 group">
                                            {theme.logoUrl ? (
                                                <img src={getMediaUrl(theme.logoUrl)} alt="Logo" className="w-8 h-8 object-contain" />
                                            ) : (
                                                <Logo className="w-8 h-8" style={{ color: 'var(--nav-text)' }} />
                                            )}
                                            <span className="text-xl font-bold group-hover:opacity-90 transition-opacity" style={{ color: 'var(--nav-text)' }}>
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
                                                                className={`w-auto flex-none px-4 py-2 text-sm font-semibold transition-all duration-200 flex items-center gap-1.5`}
                                                                style={{
                                                                    borderRadius: 'var(--btn-radius)',
                                                                    color: 'var(--nav-text)',
                                                                    backgroundColor: 'transparent'
                                                                }}
                                                                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                                                                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                                            >
                                                                <span>{item.name}</span>
                                                                <ChevronDownIcon className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform duration-300" />
                                                            </button>

                                                            {/* Mega Menu Dropdown */}
                                                            <div className="fixed left-0 right-0 top-16 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-[60] w-full">
                                                                <div className="backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-b" style={{ backgroundColor: 'var(--menu-bg-color)', borderColor: 'var(--menu-border)' }}>
                                                                    <div className="w-full px-12 py-10">
                                                                        <div className="grid grid-cols-5 gap-12 relative">

                                                                            {/* Column 1: Browse Properties */}
                                                                            <div className="space-y-8 pr-6 border-r" style={{ borderColor: 'var(--menu-divider)' }}>
                                                                                <div className="flex items-center gap-2 mb-2">
                                                                                    <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center">
                                                                                        <FiSearch className="w-4 h-4 text-primary-500" />
                                                                                    </div>
                                                                                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] ml-1" style={{ color: 'var(--menu-text-muted)' }}>Browse</h3>
                                                                                </div>
                                                                                <div className="flex flex-col gap-1">
                                                                                    {[
                                                                                        { name: 'All Properties', href: '/listings', icon: FiSearch },
                                                                                        { name: 'Properties for Rent', href: '/listings?type=rent', icon: FiKey },
                                                                                        { name: 'Properties for Sale', href: '/listings?type=sale', icon: FiDollarSign },
                                                                                        { name: 'New Listings', href: '/listings?sort=newest', icon: FiPlusCircle },
                                                                                        { name: 'Featured Properties', href: '/listings?featured=true', icon: FiStar },
                                                                                        { name: 'Ready to Move', href: '/listings', icon: FiClock },
                                                                                    ].map((link) => (
                                                                                        <Link
                                                                                            key={link.name}
                                                                                            to={link.href}
                                                                                            className="group/link flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-[var(--menu-hover-bg)]"
                                                                                        >
                                                                                            <link.icon className="w-4 h-4 transition-all" style={{ color: 'var(--menu-text-muted)' }} />
                                                                                            <span className="text-[13px] font-bold group-hover/link:translate-x-1 transition-all" style={{ color: 'var(--menu-text-primary)' }}>{link.name}</span>
                                                                                        </Link>
                                                                                    ))}
                                                                                </div>
                                                                            </div>

                                                                            {/* Column 2: Property Types */}
                                                                            <div className="space-y-8 pr-6 border-r" style={{ borderColor: 'var(--menu-divider)' }}>
                                                                                <div className="flex items-center gap-2 mb-2">
                                                                                    <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
                                                                                        <HiOutlineHomeModern className="w-4 h-4 text-purple-500" />
                                                                                    </div>
                                                                                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] ml-1" style={{ color: 'var(--menu-text-muted)' }}>Types</h3>
                                                                                </div>
                                                                                <div className="flex flex-col gap-1">
                                                                                    {[
                                                                                        { name: 'Condo', href: '/listings?category=Condo', icon: HiOutlineBuildingOffice2 },
                                                                                        { name: 'Apartment', href: '/listings?category=Apartment', icon: HiOutlineHomeModern },
                                                                                        { name: 'House', href: '/listings?category=House', icon: FiHome },
                                                                                        { name: 'Townhome', href: '/listings?category=Townhouse', icon: HiOutlineBuildingStorefront },
                                                                                        { name: 'Commercial', href: '/listings?category=Commercial', icon: FiBriefcase },
                                                                                        { name: 'Land', href: '/listings?category=Land', icon: HiOutlineGlobeAsiaAustralia },
                                                                                    ].map((link) => (
                                                                                        <Link
                                                                                            key={link.name}
                                                                                            to={link.href}
                                                                                            className="group/link flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-[var(--menu-hover-bg)]"
                                                                                        >
                                                                                            <link.icon className="w-4 h-4 transition-all" style={{ color: 'var(--menu-text-muted)' }} />
                                                                                            <span className="text-[13px] font-bold group-hover/link:translate-x-1 transition-all" style={{ color: 'var(--menu-text-primary)' }}>{link.name}</span>
                                                                                        </Link>
                                                                                    ))}
                                                                                </div>
                                                                            </div>

                                                                            {/* Column 3: Locations */}
                                                                            <div className="space-y-8 pr-6 border-r" style={{ borderColor: 'var(--menu-divider)' }}>
                                                                                <div className="flex items-center gap-2 mb-2">
                                                                                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                                                                                        <FiMapPin className="w-4 h-4 text-blue-500" />
                                                                                    </div>
                                                                                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] ml-1" style={{ color: 'var(--menu-text-muted)' }}>Locations</h3>
                                                                                </div>
                                                                                <div className="flex flex-col gap-1">
                                                                                    {[
                                                                                        { name: 'Sukhumvit Area', href: '/listings?search=Sukhumvit' },
                                                                                        { name: 'Rama 9 Area', href: '/listings?search=Rama 9' },
                                                                                        { name: 'Silom / Sathorn', href: '/listings?search=Silom' },
                                                                                        { name: 'Ladprao / Bangna', href: '/listings?search=Ladprao' },
                                                                                        { name: 'Near BTS Stations', href: '/listings?transport=bts' },
                                                                                        { name: 'Near MRT Stations', href: '/listings?transport=mrt' },
                                                                                    ].map((link) => (
                                                                                        <Link
                                                                                            key={link.name}
                                                                                            to={link.href}
                                                                                            className="group/link flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-[var(--menu-hover-bg)]"
                                                                                        >
                                                                                            <FiMapPin className="w-4 h-4 transition-all" style={{ color: 'var(--menu-text-muted)' }} />
                                                                                            <span className="text-[13px] font-bold group-hover/link:translate-x-1 transition-all" style={{ color: 'var(--menu-text-primary)' }}>{link.name}</span>
                                                                                        </Link>
                                                                                    ))}
                                                                                </div>
                                                                            </div>

                                                                            {/* Column 4: Needs */}
                                                                            <div className="space-y-8 pr-6">
                                                                                <div className="flex items-center gap-2 mb-2">
                                                                                    <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                                                                                        <FiZap className="w-4 h-4 text-emerald-500" />
                                                                                    </div>
                                                                                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] ml-1" style={{ color: 'var(--menu-text-muted)' }}>Featured</h3>
                                                                                </div>
                                                                                <div className="flex flex-col gap-1">
                                                                                    {[
                                                                                        { name: 'Luxury Properties', href: '/listings?min_price=100000', icon: FiHeart },
                                                                                        { name: 'Pet-Friendly Homes', href: '/listings?tags=pet-friendly', icon: FiZap },
                                                                                        { name: 'Family Homes', href: '/listings?tags=family', icon: FiUsers },
                                                                                        { name: 'Students & Faculty', href: '/listings?near=university', icon: FiBookOpen },
                                                                                        { name: 'Business Centric', href: '/listings?near=business', icon: FiBriefcase },
                                                                                        { name: 'Budget Friendly', href: '/listings?max_price=20000', icon: FiDollarSign },
                                                                                    ].map((link) => (
                                                                                        <Link
                                                                                            key={link.name}
                                                                                            to={link.href}
                                                                                            className="group/link flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-[var(--menu-hover-bg)]"
                                                                                        >
                                                                                            <link.icon className="w-4 h-4 transition-all" style={{ color: 'var(--menu-text-muted)' }} />
                                                                                            <span className="text-[13px] font-bold group-hover/link:translate-x-1 transition-all" style={{ color: 'var(--menu-text-primary)' }}>{link.name}</span>
                                                                                        </Link>
                                                                                    ))}
                                                                                </div>
                                                                            </div>

                                                                            {/* Column 5: Promo Card */}
                                                                            <div className="relative group/promo h-full min-h-[250px] flex flex-col justify-end">
                                                                                <div className="h-full rounded-[3px] p-8 backdrop-blur-3xl border shadow-md transition-all duration-500 hover:shadow-lg flex flex-col justify-center items-center text-center group-hover/promo:-translate-y-1" style={{ backgroundColor: 'var(--menu-bg-color)', borderColor: 'var(--menu-border)' }}>
                                                                                    <div className="mb-6 p-4 rounded-[3px] bg-primary-500/10 border border-primary-500/20 group-hover/promo:scale-110 transition-transform duration-500">
                                                                                        <FiZap className="w-8 h-8 text-primary-500" />
                                                                                    </div>
                                                                                    <h3 className="text-xl font-black mb-2 leading-tight" style={{ color: 'var(--menu-text-primary)' }}>Elevate Your Living</h3>
                                                                                    <p className="text-[12px] mb-6 font-medium leading-relaxed" style={{ color: 'var(--menu-text-secondary)' }}>
                                                                                        Experience unparalleled luxury with our elite collection of prime real estate.
                                                                                    </p>
                                                                                    <Link to="/listings" className="group/btn relative inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-black text-[11px] uppercase tracking-widest rounded-[3px] overflow-hidden transition-all hover:pr-10 active:scale-95 shadow-lg shadow-primary-600/20">
                                                                                        <span className="relative z-10">Explore Now</span>
                                                                                        <FiZap className="w-4 h-4 relative z-10" />
                                                                                        <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
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
                                                if (item.name === 'Services') {
                                                    return (
                                                        <div key={item.name} className="relative group px-1">
                                                            <button
                                                                className={`w-auto flex-none px-4 py-2 text-sm font-semibold transition-all duration-200 flex items-center gap-1.5`}
                                                                style={{
                                                                    borderRadius: 'var(--btn-radius)',
                                                                    color: 'var(--nav-text)',
                                                                    backgroundColor: 'transparent'
                                                                }}
                                                                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                                                                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                                            >
                                                                <span>{item.name}</span>
                                                                <ChevronDownIcon className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform duration-300" />
                                                            </button>

                                                            {/* Services Mega Menu Dropdown */}
                                                            <div className="fixed left-0 right-0 top-16 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-[60] w-full">
                                                                <div className="backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-b" style={{ backgroundColor: 'var(--menu-bg-color)', borderColor: 'var(--menu-border)' }}>
                                                                    <div className="w-full px-12 py-10">
                                                                        <div className="grid grid-cols-3 gap-16 max-w-7xl mx-auto">
                                                                            {/* Column 1: Find Your Property */}
                                                                            <div className="flex flex-col">
                                                                                <div className="flex items-center gap-2 mb-6">
                                                                                    <FiSearch className="w-5 h-5 text-primary-500 ml-1" />
                                                                                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] ml-1" style={{ color: 'var(--menu-text-muted)' }}>Find Property</h3>
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    {[
                                                                                        { title: 'Find a Rental Home', desc: 'Verified listings based on your budget and lifestyle.', icon: FiHome },
                                                                                        { title: 'Buy a Property', desc: 'Expert guidance and negotiation support for purchases.', icon: FiSearch },
                                                                                        { title: 'Schedule a Viewing', desc: 'Book property tours quickly at your convenience.', icon: FiCalendar },
                                                                                    ].map((service, idx) => (
                                                                                        <div key={idx} className="group/item flex gap-4 p-3 rounded-2xl transition-all hover:bg-[var(--menu-hover-bg)]">
                                                                                            <div className="w-6 h-6 flex-none flex items-center justify-center text-primary-500 group-hover/item:scale-110 transition-all duration-300 mt-0.5">
                                                                                                <service.icon className="w-full h-full" />
                                                                                            </div>
                                                                                            <div className="flex flex-col justify-center">
                                                                                                <h4 className="text-[14px] font-black mb-0.5 transition-colors group-hover/item:text-primary-600" style={{ color: 'var(--menu-text-primary)' }}>{service.title}</h4>
                                                                                                <p className="text-[12px] font-medium leading-tight" style={{ color: 'var(--menu-text-secondary)' }}>{service.desc}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>

                                                                            {/* Column 2: Owners & Investment */}
                                                                            <div className="flex flex-col">
                                                                                <div className="flex items-center gap-2 mb-6">
                                                                                    <FiBriefcase className="w-5 h-5 text-purple-500 ml-1" />
                                                                                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] ml-1" style={{ color: 'var(--menu-text-muted)' }}>Owners & Investors</h3>
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    {[
                                                                                        { title: 'List Your Property', desc: 'Promote your property to qualified tenants and buyers.', icon: FiPlusCircle },
                                                                                        { title: 'Property Management', desc: 'Rent collection and maintenance coordination.', icon: FiSettings },
                                                                                        { title: 'Investment Consultation', desc: 'Advice on high-yield locations and rental demand.', icon: FiDollarSign },
                                                                                    ].map((service, idx) => (
                                                                                        <div key={idx} className="group/item flex gap-4 p-3 rounded-2xl transition-all hover:bg-[var(--menu-hover-bg)]">
                                                                                            <div className="w-6 h-6 flex-none flex items-center justify-center text-purple-500 group-hover/item:scale-110 transition-all duration-300 mt-0.5">
                                                                                                <service.icon className="w-full h-full" />
                                                                                            </div>
                                                                                            <div className="flex flex-col justify-center">
                                                                                                <h4 className="text-[14px] font-black mb-0.5 transition-colors group-hover/item:text-purple-600" style={{ color: 'var(--menu-text-primary)' }}>{service.title}</h4>
                                                                                                <p className="text-[12px] font-medium leading-tight" style={{ color: 'var(--menu-text-secondary)' }}>{service.desc}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>

                                                                            {/* Column 3: Extra Support */}
                                                                            <div className="flex flex-col">
                                                                                <div className="flex items-center gap-2 mb-6">
                                                                                    <FiTruck className="w-5 h-5 text-blue-500 ml-1" />
                                                                                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] ml-1" style={{ color: 'var(--menu-text-muted)' }}>Assistance</h3>
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    {[
                                                                                        { title: 'Relocation Support', desc: 'Helping expats find homes near BTS and schools.', icon: FiTruck },
                                                                                        { title: 'Area Recommendations', desc: 'Neighborhood suggestions based on your budget.', icon: FiMapPin },
                                                                                        { title: 'Legal & Contract Support', desc: 'Rental agreements and property paperwork assistance.', icon: FiFileText },
                                                                                    ].map((service, idx) => (
                                                                                        <div key={idx} className="group/item flex gap-4 p-3 rounded-2xl transition-all hover:bg-[var(--menu-hover-bg)]">
                                                                                            <div className="w-6 h-6 flex-none flex items-center justify-center text-blue-500 group-hover/item:scale-110 transition-all duration-300 mt-0.5">
                                                                                                <service.icon className="w-full h-full" />
                                                                                            </div>
                                                                                            <div className="flex flex-col justify-center">
                                                                                                <h4 className="text-[14px] font-black mb-0.5 transition-colors group-hover/item:text-blue-600" style={{ color: 'var(--menu-text-primary)' }}>{service.title}</h4>
                                                                                                <p className="text-[12px] font-medium leading-tight" style={{ color: 'var(--menu-text-secondary)' }}>{service.desc}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
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
                                                        className={`w-auto flex-none px-4 py-2 text-sm font-semibold transition-all duration-200`}
                                                        style={{
                                                            borderRadius: 'var(--btn-radius)',
                                                            color: 'var(--nav-text)',
                                                            backgroundColor: 'transparent'
                                                        }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                                                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                );
                                            })}

                                            {/* Contact Hover Menu */}
                                            <div className="relative group px-1">
                                                <button
                                                    className="w-auto flex-none px-4 py-2 text-sm font-semibold transition-all duration-200 flex items-center gap-1.5"
                                                    style={{
                                                        borderRadius: 'var(--btn-radius)',
                                                        color: 'var(--nav-text)',
                                                        backgroundColor: 'transparent'
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                                >
                                                    Contact
                                                    <ChevronDownIcon className="w-4 h-4 opacity-50 group-hover:rotate-180 transition-transform duration-300" />
                                                </button>

                                                {/* Contact Dropdown Content */}
                                                <div className="fixed left-0 right-0 top-16 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-[60] w-full">
                                                    <div className="backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-b" style={{ backgroundColor: 'var(--menu-bg-color)', borderColor: 'var(--menu-border)' }}>
                                                        <div className="w-full px-12 py-10">
                                                            <div className="grid grid-cols-2 gap-32 max-w-5xl mx-auto">
                                                                {/* Column 1: Contact Information */}
                                                                <div className="flex flex-col">
                                                                    <div className="mb-6">
                                                                        <h3 className="text-xl font-black mb-2" style={{ color: 'var(--menu-text-primary)' }}>Talk to Our Team</h3>
                                                                        <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--menu-text-secondary)' }}>
                                                                            Our property consultants are ready to help you find the perfect home or investment.
                                                                        </p>
                                                                    </div>

                                                                    <div className="space-y-4 mb-8">
                                                                        <a href={`tel:${agent?.phone || '062-718-8699'}`} className="flex items-center gap-3 group/item p-3 rounded-2xl transition-all" style={{ backgroundColor: 'var(--menu-hover-bg)' }}>
                                                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-500/10 text-primary-500 group-hover/item:scale-110 transition-transform">
                                                                                <PhoneIcon className="w-5 h-5" />
                                                                            </div>
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[10px] uppercase font-black tracking-widest" style={{ color: 'var(--menu-text-muted)' }}>Phone</span>
                                                                                <span className="text-sm font-bold" style={{ color: 'var(--menu-text-primary)' }}>{agent?.phone || '062-718-8699'}</span>
                                                                            </div>
                                                                        </a>

                                                                        <a href={agent?.line?.startsWith('http') ? agent.line : agent?.line ? `https://line.me/ti/p/~${agent.line}` : "https://line.me/ti/p/~@superagent"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group/item p-3 rounded-2xl transition-all hover:bg-green-500/5">
                                                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/10 text-green-500 group-hover/item:scale-110 transition-transform">
                                                                                <FiMessageCircle className="w-5 h-5" />
                                                                            </div>
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[10px] uppercase font-black tracking-widest" style={{ color: 'var(--menu-text-muted)' }}>LINE</span>
                                                                                <span className="text-sm font-bold" style={{ color: 'var(--menu-text-primary)' }}>Available for instant chat</span>
                                                                            </div>
                                                                        </a>

                                                                        <a href={agent?.facebook || "https://facebook.com/superagent"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group/item p-3 rounded-2xl transition-all hover:bg-blue-600/5">
                                                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-600/10 text-blue-600 group-hover/item:scale-110 transition-transform">
                                                                                <FiFacebook className="w-5 h-5" />
                                                                            </div>
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[10px] uppercase font-black tracking-widest" style={{ color: 'var(--menu-text-muted)' }}>Facebook</span>
                                                                                <span className="text-sm font-bold" style={{ color: 'var(--menu-text-primary)' }}>Message us anytime</span>
                                                                            </div>
                                                                        </a>
                                                                    </div>

                                                                </div>

                                                                {/* Column 2: How We Help You */}
                                                                <div className="flex flex-col pt-2">
                                                                    <div className="mb-6">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <div className="w-1 h-6 bg-primary-500 rounded-full"></div>
                                                                            <h3 className="text-xl font-black" style={{ color: 'var(--menu-text-primary)' }}>Our Services</h3>
                                                                        </div>
                                                                        <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--menu-text-muted)' }}>Tailored Property Solutions</p>
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        {[
                                                                            "Help finding rental homes",
                                                                            "Assistance buying property",
                                                                            "Schedule property viewings",
                                                                            "Recommend areas based on budget",
                                                                            "Support for expats & foreigners"
                                                                        ].map((item, idx) => (
                                                                            <div key={idx} className="flex items-center gap-3 p-3 group/svc rounded-xl transition-all hover:translate-x-1">
                                                                                <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-primary-500/10 text-primary-500 transition-colors group-hover/svc:bg-primary-500 group-hover/svc:text-white">
                                                                                    <FiStar className="w-3.5 h-3.5" />
                                                                                </div>
                                                                                <span className="text-[13px] font-bold transition-colors group-hover/svc:text-primary-600" style={{ color: 'var(--menu-text-primary)' }}>{item}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Auth Buttons */}
                                        <div className="flex items-center space-x-4">
                                            {isAuthenticated ? (
                                                <div className="flex items-center gap-1">
                                                    <Link
                                                        to="/my-bookings"
                                                        className="group flex items-center gap-2 px-4 py-2 text-white transition-all duration-300"
                                                    >
                                                        <CalendarDaysIcon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                                                        <span className="text-sm font-medium">bookings</span>
                                                    </Link>

                                                    <Link
                                                        to="/saved-listings"
                                                        className="group flex items-center gap-2 px-4 py-2 text-white transition-all duration-300"
                                                    >
                                                        <CiBookmark className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                                                        <span className="text-sm font-medium">saved</span>
                                                    </Link>

                                                    <div className="relative" ref={userMenuRef}>
                                                        <button
                                                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                                                            className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1 transition-all duration-300 text-white group`}
                                                            style={{ borderRadius: 'var(--btn-radius)' }}
                                                        >
                                                            <div
                                                                className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 text-white group-hover:scale-110`}
                                                                style={{
                                                                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
                                                                    backdropFilter: 'blur(10px)',
                                                                    WebkitBackdropFilter: 'blur(10px)',
                                                                    border: '1.5px solid rgba(255, 255, 255, 0.3)',
                                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.1)',
                                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2), 0 0 30px rgba(255, 255, 255, 0.2)';
                                                                    e.currentTarget.style.border = '1.5px solid rgba(255, 255, 255, 0.5)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.1)';
                                                                    e.currentTarget.style.border = '1.5px solid rgba(255, 255, 255, 0.3)';
                                                                }}
                                                            >
                                                                {user?.first_name?.[0]?.toUpperCase() || <UserCircleIcon className="w-5 h-5" />}
                                                            </div>
                                                            <div className="flex flex-col items-start">
                                                                <span className={`text-[10px] font-black leading-none mb-0.5 uppercase tracking-wider opacity-60 text-white`}>Account</span>
                                                                <span className={`text-sm font-black leading-none max-w-[80px] truncate text-white`}>
                                                                    {user?.first_name}
                                                                </span>
                                                            </div>
                                                            <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-500 text-white ${userMenuOpen ? 'rotate-180 opacity-100' : 'opacity-40'}`} />
                                                        </button>

                                                        {/* Dropdown Menu */}
                                                        {userMenuOpen && (
                                                            <div className="absolute right-0 mt-3 w-60 shadow-2xl py-2 ring-1 ring-black/5 focus:outline-none animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden border" style={{ borderRadius: 'var(--menu-radius)', backgroundColor: 'var(--menu-bg-color)', borderColor: 'var(--menu-border)' }}>
                                                                {/* User Header */}
                                                                <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--menu-divider)', backgroundColor: 'rgba(var(--primary-rgb), 0.03)' }}>
                                                                    <p className="text-sm font-bold truncate" style={{ color: 'var(--menu-text-primary)' }}>
                                                                        {user?.first_name} {user?.last_name}
                                                                    </p>
                                                                    <p className="text-xs truncate font-medium mt-0.5" style={{ color: 'var(--menu-text-secondary)' }}>
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
                                                                            className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-primary-50 hover:text-primary-700 font-bold rounded-xl transition-colors group"
                                                                            onClick={(e) => {
                                                                                const href = e.currentTarget.getAttribute('href');
                                                                                if (href.startsWith('http')) {
                                                                                    e.preventDefault();
                                                                                    window.location.href = href;
                                                                                }
                                                                                setUserMenuOpen(false);
                                                                            }}
                                                                        >
                                                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--menu-hover-bg)' }}>
                                                                                <ChartBarIcon className="w-5 h-5" style={{ color: 'var(--menu-text-secondary)' }} />
                                                                            </div>
                                                                            <span style={{ color: 'var(--menu-text-primary)' }}>Dashboard</span>
                                                                        </Link>
                                                                    )}
                                                                </div>

                                                                <div className="py-2 px-2 border-t mt-1" style={{ borderColor: 'var(--menu-divider)' }}>
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
