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
    ChevronRightIcon,
    BookmarkIcon,
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
import { BsBookmark } from "react-icons/bs";
import { CiBookmark, CiCalendar } from "react-icons/ci";
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
import CookieConsent from '../Common/CookieConsent';
import buildingBlock from '../../assets/images/building_block.png';

const PublicLayout = () => {
    const { theme } = useTheme();
    const { isMainDomain, agent, loading: tenantLoading } = useTenant();
    console.log('PublicLayout State:', { isMainDomain, agent, tenantLoading });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const closeTimeoutRef = useRef(null);
    const openMenu = (name) => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current); setActiveMenu(name); };
    const closeMenu = () => { closeTimeoutRef.current = setTimeout(() => setActiveMenu(null), 120); };
    const keepMenu = () => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current); };
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

    const brandName = theme.headerText || (agent ? (agent.agency_name || agent.name) : 'Super');

    return (
        <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: theme.fontFamily }}>
            {/* Mobile Header (Hamburger + Logo) */}
            <div
                className={`md:hidden sticky top-0 z-[200] transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
                style={{ backgroundColor: '#ffffff' }}
            >
                <div className="px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        {theme.logoUrl ? (
                            <img src={getMediaUrl(theme.logoUrl)} alt="Logo" className="w-[50px] h-[50px] object-contain" />
                        ) : (
                            <Logo className="w-[50px] h-[50px]" style={{ color: 'var(--primary-color)' }} />
                        )}
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="text-gray-900 p-1 -mr-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Navigation Drawer (Mobile) */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[250] md:hidden">
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
            <nav
                className={`hidden md:block sticky top-0 z-[150] transition-all duration-300 bg-white/80 backdrop-blur-md ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
                style={{ backgroundColor: '#ffffff' }}
                onMouseLeave={closeMenu}
            >
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                    <div className="flex items-center justify-between h-16">
                        {isNavLoading ? (
                            <div className="flex items-center justify-between w-full animate-pulse">
                                <div className="flex items-center xl:gap-8 lg:gap-6 md:gap-4">
                                    {/* Logo Skeleton */}
                                    <div className="flex items-center space-x-2 pr-4 md:pr-8">
                                        <div className="w-8 h-8 bg-white/20 rounded" />
                                        <div className="w-32 h-6 bg-white/20 rounded" />
                                    </div>
                                    {/* Nav Links Skeleton */}
                                    <div className="flex items-center space-x-1">
                                        <div className="w-16 h-8 bg-white/10 rounded-lg mx-1" />
                                        <div className="w-24 h-8 bg-white/10 rounded-lg mx-1" />
                                    </div>
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
                                <div className="flex items-center xl:gap-8 lg:gap-6 md:gap-4">
                                    {/* Logo */}
                                    <Link to="/" className="flex items-center space-x-3 group pr-4 md:pr-8">
                                        {theme.logoUrl ? (
                                            <img src={getMediaUrl(theme.logoUrl)} alt="Logo" className="w-[50px] h-[50px] object-contain" />
                                        ) : (
                                            <Logo className="w-[50px] h-[50px]" style={{ color: 'var(--primary-color)' }} />
                                        )}
                                    </Link>

                                    {/* Desktop Navigation Links */}
                                    <div className="flex items-center space-x-1">
                                        {navigation.map((item) => {
                                            if (item.name === 'Properties') {
                                                return (
                                                    <div key={item.name} className="relative group px-1">
                                                        <button
                                                            className={`w-auto flex-none px-4 py-2 text-[14px] font-medium text-gray-700 transition-all duration-200 flex items-center gap-1.5 hover:text-[var(--primary-color)]`}
                                                            style={{
                                                                borderRadius: 'var(--btn-radius)',
                                                                backgroundColor: 'transparent'
                                                            }}
                                                            onMouseEnter={() => openMenu('properties')}
                                                            onMouseLeave={closeMenu}
                                                        >
                                                            <span>{item.name}</span>
                                                            <ChevronDownIcon className={`w-4 h-4 opacity-70 transition-transform duration-300 ${activeMenu === 'properties' ? 'rotate-180' : ''}`} />
                                                        </button>

                                                        {/* Properties mega menu content rendered in expanding section below */}
                                                        <div className={`hidden`}
                                                            style={{ borderTop: '1px solid var(--menu-divider)' }}
                                                        >
                                                            <div className="relative backdrop-blur-3xl" style={{ backgroundColor: 'var(--menu-bg-color)' }}>
                                                                {/* Decorative bg image - right-aligned, reduced opacity */}
                                                                <div className="absolute top-0 right-0 h-full w-full pointer-events-none opacity-[0.15]"
                                                                    style={{ backgroundImage: 'url(/images/train_bg.png)', backgroundSize: 'contain', backgroundPosition: '120% 80%', backgroundRepeat: 'no-repeat' }}
                                                                />
                                                                <div className="w-full px-12 py-10">
                                                                    <div className="grid grid-cols-4 gap-12 relative w-full px-12 items-center">

                                                                        {/* Column 1: Promo Card (Redesigned) */}
                                                                        <div className="relative group/promo h-full min-h-[250px] flex flex-col justify-center pr-6" style={{ borderColor: 'var(--menu-divider)' }}>
                                                                            <div className="h-full rounded-[3px] p-0 flex flex-col justify-center items-start text-left">
                                                                                {/* Icon Container (Optional, based on ref image 2 which has text only, but image 1 had icon. User said 'make it like second image design'. Image 2 has no icon above text.) */}
                                                                                {/* Leaving out icon for cleaner look matching Image 2 */}
                                                                                <h3 className="text-3xl font-semibold mb-4 leading-tight text-gray-900">
                                                                                    Elevate Your Living<br />with Super Real Estate
                                                                                </h3>
                                                                                <p className="text-lg mb-8 font-medium leading-tight text-gray-600">
                                                                                    Experience unparalleled luxury with our elite collection of prime real estate.
                                                                                </p>
                                                                                <Link to="/listings" className="inline-flex items-center justify-center px-6 py-2 bg-gray-100 text-gray-900 font-medium text-[14px] rounded-full transition-all hover:bg-gray-200">
                                                                                    Explore Now
                                                                                </Link>
                                                                            </div>
                                                                        </div>

                                                                        {/* Column 2: Browse Properties */}
                                                                        <div className="space-y-8 pr-6 flex flex-col items-start text-left" style={{ borderColor: 'var(--menu-divider)' }}>
                                                                            <div className="flex items-center px-4 mb-2">
                                                                                <FiSearch className="w-5 h-5 text-gray-400 mr-6" />
                                                                                <h3 className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--menu-text-muted)' }}>Browse</h3>
                                                                            </div>
                                                                            <div className="flex flex-col gap-1 items-start">
                                                                                {[
                                                                                    { name: 'All Properties', href: '/listings', icon: BuildingOfficeIcon },
                                                                                    { name: 'Properties for Rent', href: '/listings?type=rent', icon: FiKey },
                                                                                    { name: 'Properties for Sale', href: '/listings?type=sale', icon: FiDollarSign },
                                                                                    { name: 'New Listings', href: '/listings?sort=newest', icon: FiPlusCircle },
                                                                                    { name: 'Featured Properties', href: '/listings?featured=true', icon: FiStar },
                                                                                    { name: 'Ready to Move', href: '/listings?status=ready', icon: FiClock },
                                                                                ].map((link, index) => (
                                                                                    <Link
                                                                                        key={link.name}
                                                                                        to={link.href}
                                                                                        className="group/link flex items-center px-4 py-3 rounded-xl transition-all animate-slide-in-right opacity-0 min-w-[280px]"
                                                                                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                                                                                    >
                                                                                        <link.icon className="w-[18px] h-[18px] text-gray-700 group-hover/link:text-[var(--primary-color)] transition-all mr-5 stroke-[1.5]" />
                                                                                        <span className="text-[13px] font-semibold text-gray-800 group-hover/link:text-[var(--primary-color)] transition-all mr-2">{link.name}</span>
                                                                                        <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 group-hover/link:text-[var(--primary-color)] group-hover/link:translate-x-2 transition-all duration-300" />
                                                                                    </Link>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        {/* Column 2: Property Types */}
                                                                        <div className="space-y-8 pr-6 flex flex-col items-start text-left" style={{ borderColor: 'var(--menu-divider)' }}>
                                                                            <div className="flex items-center px-4 mb-2">
                                                                                <HiOutlineHomeModern className="w-5 h-5 text-gray-400 mr-6" />
                                                                                <h3 className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--menu-text-muted)' }}>Types</h3>
                                                                            </div>
                                                                            <div className="flex flex-col gap-1 items-start">
                                                                                {[
                                                                                    { name: 'Condo', href: '/listings?property_type=condo', icon: BuildingOfficeIcon },
                                                                                    { name: 'Apartment', href: '/listings?property_type=apartment', icon: HiOutlineBuildingOffice2 },
                                                                                    { name: 'House', href: '/listings?property_type=house', icon: HomeIcon },
                                                                                    { name: 'Townhome', href: '/listings?property_type=townhome', icon: HiOutlineHomeModern },
                                                                                    { name: 'Commercial', href: '/listings?property_type=commercial', icon: HiOutlineBuildingStorefront },
                                                                                    { name: 'Land', href: '/listings?property_type=land', icon: HiOutlineGlobeAsiaAustralia },
                                                                                ].map((link, index) => (
                                                                                    <Link
                                                                                        key={link.name}
                                                                                        to={link.href}
                                                                                        className="group/link flex items-center px-4 py-3 rounded-xl transition-all animate-slide-in-right opacity-0 min-w-[280px]"
                                                                                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                                                                                    >
                                                                                        <link.icon className="w-[18px] h-[18px] text-gray-700 group-hover/link:text-[var(--primary-color)] transition-all mr-5 stroke-[1.5]" />
                                                                                        <span className="text-[13px] font-semibold text-gray-800 group-hover/link:text-[var(--primary-color)] transition-all mr-2">{link.name}</span>
                                                                                        <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 group-hover/link:text-[var(--primary-color)] group-hover/link:translate-x-2 transition-all duration-300" />
                                                                                    </Link>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        {/* Column 3: Locations */}
                                                                        <div className="space-y-8 pr-6 flex flex-col items-start text-left" style={{ borderColor: 'var(--menu-divider)' }}>
                                                                            <div className="flex items-center px-4 mb-2">
                                                                                <FiMapPin className="w-5 h-5 text-gray-400 mr-6" />
                                                                                <h3 className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--menu-text-muted)' }}>Locations</h3>
                                                                            </div>
                                                                            <div className="flex flex-col gap-1 items-start">
                                                                                {[
                                                                                    { name: 'Sukhumvit Area', href: '/listings?district=sukhumvit', icon: MapPinIcon },
                                                                                    { name: 'Rama 9 Area', href: '/listings?district=rama9', icon: MapPinIcon },
                                                                                    { name: 'Silom / Sathorn', href: '/listings?district=silom', icon: MapPinIcon },
                                                                                    { name: 'Ladprao / Bangna', href: '/listings?district=ladprao', icon: MapPinIcon },
                                                                                    { name: 'Near BTS Stations', href: '/listings?near=bts', icon: MapPinIcon },
                                                                                    { name: 'Near MRT Stations', href: '/listings?near=mrt', icon: MapPinIcon },
                                                                                ].map((link, index) => (
                                                                                    <Link
                                                                                        key={link.name}
                                                                                        to={link.href}
                                                                                        className="group/link flex items-center px-4 py-3 rounded-xl transition-all animate-slide-in-right opacity-0 min-w-[280px]"
                                                                                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                                                                                    >
                                                                                        <link.icon className="w-[18px] h-[18px] text-gray-700 group-hover/link:text-[var(--primary-color)] transition-all mr-5 stroke-[1.5]" />
                                                                                        <span className="text-[13px] font-semibold text-gray-800 group-hover/link:text-[var(--primary-color)] transition-all mr-2">{link.name}</span>
                                                                                        <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 group-hover/link:text-[var(--primary-color)] group-hover/link:translate-x-2 transition-all duration-300" />
                                                                                    </Link>
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
                                            if (item.name === 'Services') {
                                                return (
                                                    <div key={item.name} className="px-1">
                                                        <button
                                                            className={`w-auto flex-none px-4 py-2 text-[14px] font-medium text-gray-700 transition-all duration-200 flex items-center gap-1.5 hover:text-[var(--primary-color)]`}
                                                            style={{
                                                                borderRadius: 'var(--btn-radius)',
                                                                backgroundColor: 'transparent'
                                                            }}
                                                            onMouseEnter={() => openMenu('services')}
                                                            onMouseLeave={closeMenu}
                                                        >
                                                            <span>{item.name}</span>
                                                            <ChevronDownIcon className={`w-4 h-4 opacity-70 transition-transform duration-300 ${activeMenu === 'services' ? 'rotate-180' : ''}`} />
                                                        </button>

                                                        {/* Services Mega Menu Dropdown */}
                                                        <div className={`hidden`}
                                                            style={{ borderTop: '1px solid var(--menu-divider)' }}
                                                        >
                                                            <div className="backdrop-blur-3xl" style={{ backgroundColor: 'var(--menu-bg-color)' }}>
                                                                <div className="w-full px-12 py-10">
                                                                    <div className="grid grid-cols-4 gap-12 relative w-full px-12 items-center">
                                                                        {/* Column 0: Brand Content */}
                                                                        <div className="relative group/promo h-full min-h-[250px] flex flex-col justify-center pr-6" style={{ borderColor: 'var(--menu-divider)' }}>
                                                                            <div className="h-full rounded-[3px] p-0 flex flex-col justify-center items-start text-left">
                                                                                <h3 className="text-3xl font-semibold mb-4 leading-tight text-gray-900">
                                                                                    Expert Services for Your<br />Property Journey
                                                                                </h3>
                                                                                <p className="text-lg mb-8 font-medium leading-tight text-gray-600">
                                                                                    From expert property management to strategic investment advice, we provide the support you need.
                                                                                </p>
                                                                                <Link to="/contact" className="inline-flex items-center justify-center px-6 py-2 bg-gray-100 text-gray-900 font-medium text-[14px] rounded-full transition-all hover:bg-gray-200">
                                                                                    Learn More
                                                                                </Link>
                                                                            </div>
                                                                        </div>

                                                                        {/* Column 1: Find Your Property */}
                                                                        <div className="flex flex-col items-start text-left">
                                                                            <div className="flex items-center px-4 mb-6">
                                                                                <FiSearch className="w-5 h-5 text-gray-400 mr-6" />
                                                                                <h3 className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--menu-text-muted)' }}>Find Property</h3>
                                                                            </div>
                                                                            <div className="flex flex-col gap-1 items-start">
                                                                                {[
                                                                                    { title: 'Find a Rental Home', icon: FiHome },
                                                                                    { title: 'Buy a Property', icon: FiSearch },
                                                                                    { title: 'Schedule a Viewing', icon: FiCalendar },
                                                                                ].map((service, idx) => (
                                                                                    <div
                                                                                        key={idx}
                                                                                        className="group/item flex items-center px-4 py-3 rounded-xl transition-all cursor-pointer animate-slide-in-right opacity-0 min-w-[280px]"
                                                                                        style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'forwards' }}
                                                                                    >
                                                                                        <service.icon className="w-[18px] h-[18px] text-gray-700 group-hover/item:text-[var(--primary-color)] transition-all mr-5 stroke-[1.5]" />
                                                                                        <span className="text-[13px] font-semibold text-gray-800 group-hover/item:text-[var(--primary-color)] transition-all mr-2">{service.title}</span>
                                                                                        <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[var(--primary-color)] group-hover/item:translate-x-2 transition-all duration-300" />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        {/* Column 2: Owners & Investment */}
                                                                        <div className="flex flex-col items-start text-left">
                                                                            <div className="flex items-center px-4 mb-6">
                                                                                <FiBriefcase className="w-5 h-5 text-gray-400 mr-6" />
                                                                                <h3 className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--menu-text-muted)' }}>Owners & Investors</h3>
                                                                            </div>
                                                                            <div className="flex flex-col gap-1 items-start">
                                                                                {[
                                                                                    { title: 'List Your Property', icon: FiPlusCircle },
                                                                                    { title: 'Property Management', icon: FiSettings },
                                                                                    { title: 'Investment Consultation', icon: FiDollarSign },
                                                                                ].map((service, idx) => (
                                                                                    <div
                                                                                        key={idx}
                                                                                        className="group/item flex items-center px-4 py-3 rounded-xl transition-all cursor-pointer animate-slide-in-right opacity-0 min-w-[280px]"
                                                                                        style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'forwards' }}
                                                                                    >
                                                                                        <service.icon className="w-[18px] h-[18px] text-gray-700 group-hover/item:text-[var(--primary-color)] transition-all mr-5 stroke-[1.5]" />
                                                                                        <span className="text-[13px] font-semibold text-gray-800 group-hover/item:text-[var(--primary-color)] transition-all mr-2">{service.title}</span>
                                                                                        <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[var(--primary-color)] group-hover/item:translate-x-2 transition-all duration-300" />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        {/* Column 3: Extra Support */}
                                                                        <div className="flex flex-col items-start text-left">
                                                                            <div className="flex items-center px-4 mb-6">
                                                                                <FiTruck className="w-5 h-5 text-gray-400 mr-6" />
                                                                                <h3 className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--menu-text-muted)' }}>Assistance</h3>
                                                                            </div>
                                                                            <div className="flex flex-col gap-1 items-start">
                                                                                {[
                                                                                    { title: 'Relocation Support', icon: FiTruck },
                                                                                    { title: 'Area Recommendations', icon: FiMapPin },
                                                                                    { title: 'Legal & Contract Support', icon: FiFileText },
                                                                                ].map((service, idx) => (
                                                                                    <div
                                                                                        key={idx}
                                                                                        className="group/item flex items-center px-4 py-3 rounded-xl transition-all cursor-pointer animate-slide-in-right opacity-0 min-w-[280px]"
                                                                                        style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'forwards' }}
                                                                                    >
                                                                                        <service.icon className="w-[18px] h-[18px] text-gray-700 group-hover/item:text-[var(--primary-color)] transition-all mr-5 stroke-[1.5]" />
                                                                                        <span className="text-[13px] font-semibold text-gray-800 group-hover/item:text-[var(--primary-color)] transition-all mr-2">{service.title}</span>
                                                                                        <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[var(--primary-color)] group-hover/item:translate-x-2 transition-all duration-300" />
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
                                                    className={`w-auto flex-none px-4 py-2 text-[14px] font-medium text-gray-700 hover:text-[var(--primary-color)] transition-all duration-200`}
                                                    style={{
                                                        borderRadius: 'var(--btn-radius)',
                                                        backgroundColor: 'transparent'
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                                >
                                                    {item.name}
                                                </Link>
                                            );
                                        })}

                                        {/* Contact Hover Menu */}
                                        <div className="px-1">
                                            <button
                                                className="w-auto flex-none px-4 py-2 text-[14px] font-medium text-gray-700 hover:text-[var(--primary-color)] transition-all duration-200 flex items-center gap-1.5"
                                                style={{
                                                    borderRadius: 'var(--btn-radius)',
                                                    backgroundColor: 'transparent'
                                                }}
                                                onMouseEnter={() => openMenu('contact')}
                                                onMouseLeave={closeMenu}
                                            >
                                                Contact
                                                <ChevronDownIcon className={`w-4 h-4 opacity-50 transition-transform duration-300 ${activeMenu === 'contact' ? 'rotate-180' : ''}`} />
                                            </button>

                                            {/* Contact Dropdown Content */}
                                            <div className={`hidden`}
                                                style={{ borderTop: '1px solid var(--menu-divider)' }}
                                            >
                                                <div className="backdrop-blur-3xl" style={{ backgroundColor: 'var(--menu-bg-color)' }}>
                                                    <div className="w-full px-12 py-10">
                                                        <div className="grid grid-cols-4 gap-12 relative w-full px-12 items-center">
                                                            {/* Column 0: Promo Content */}
                                                            <div className="relative group/promo h-full min-h-[250px] flex flex-col justify-center pr-6" style={{ borderColor: 'var(--menu-divider)' }}>
                                                                <div className="h-full rounded-[3px] p-0 flex flex-col justify-center items-start text-left">
                                                                    <h3 className="text-3xl font-semibold mb-4 leading-tight text-gray-900">
                                                                        Talk to Our Team
                                                                    </h3>
                                                                    <p className="text-lg mb-8 font-medium leading-tight text-gray-600">
                                                                        Our property consultants are ready to help you find the perfect home or investment.
                                                                    </p>
                                                                    <Link to="/contact" className="inline-flex items-center justify-center px-6 py-2 bg-gray-100 text-gray-900 font-medium text-[14px] rounded-full transition-all hover:bg-gray-200">
                                                                        Get in Touch
                                                                    </Link>
                                                                </div>
                                                            </div>

                                                            {/* Column 1: Contact Links */}
                                                            <div className="flex flex-col items-start text-left">
                                                                <div className="flex items-center px-4 mb-6">
                                                                    <PhoneIcon className="w-5 h-5 text-gray-400 mr-6" />
                                                                    <h3 className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--menu-text-muted)' }}>Contact Methods</h3>
                                                                </div>
                                                                <div className="flex flex-col gap-1 items-start">
                                                                    {[
                                                                        {
                                                                            title: agent?.phone || '062-718-8699',
                                                                            label: 'Phone',
                                                                            icon: PhoneIcon,
                                                                            href: `tel:${agent?.phone || '062-718-8699'}`
                                                                        },
                                                                        {
                                                                            title: 'Available for instant chat',
                                                                            label: 'LINE',
                                                                            icon: FiMessageCircle,
                                                                            href: agent?.line?.startsWith('http') ? agent.line : agent?.line ? `https://line.me/ti/p/~${agent.line}` : "https://line.me/ti/p/~@superagent"
                                                                        },
                                                                        {
                                                                            title: 'Message us anytime',
                                                                            label: 'Facebook',
                                                                            icon: FiFacebook,
                                                                            href: agent?.facebook || "https://facebook.com/superagent"
                                                                        },
                                                                    ].map((item, idx) => (
                                                                        <a
                                                                            key={idx}
                                                                            href={item.href}
                                                                            target={item.href.startsWith('http') ? "_blank" : undefined}
                                                                            rel={item.href.startsWith('http') ? "noopener noreferrer" : undefined}
                                                                            className="group/item flex items-center px-4 py-3 rounded-xl transition-all cursor-pointer animate-slide-in-right opacity-0 min-w-[320px]"
                                                                            style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'forwards' }}
                                                                        >
                                                                            <item.icon className="w-[18px] h-[18px] text-gray-700 group-hover/item:text-[var(--primary-color)] transition-all mr-5 stroke-[1.5]" />
                                                                            <div className="flex flex-col mr-2">
                                                                                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-0.5">{item.label}</span>
                                                                                <span className="text-[13px] font-semibold text-gray-800 group-hover/item:text-[var(--primary-color)] transition-all">{item.title}</span>
                                                                            </div>
                                                                            <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[var(--primary-color)] group-hover/item:translate-x-2 transition-all duration-300" />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Column 2: Empty for spacing */}
                                                            <div className="flex flex-col items-start text-left"></div>

                                                            {/* Column 3: Empty for spacing */}
                                                            <div className="flex flex-col items-start text-left"></div>
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
                                                className="group flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[var(--primary-color)] transition-all duration-300"
                                            >
                                                <CiCalendar className="w-5 h-5 text-gray-500 group-hover:text-[var(--primary-color)] transition-colors stroke-[0.5]" />
                                                <span className="text-[14px] font-medium">Bookings</span>
                                            </Link>

                                            <Link
                                                to="/saved-listings"
                                                className="group flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[var(--primary-color)] transition-all duration-300"
                                            >
                                                <CiBookmark className="w-5 h-5 text-gray-500 group-hover:text-[var(--primary-color)] transition-colors stroke-[0.5]" />
                                                <span className="text-[14px] font-medium">Saved</span>
                                            </Link>

                                            <div className="relative" ref={userMenuRef}>
                                                <button
                                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                                    className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1 transition-all duration-300 text-gray-700 hover:text-[var(--primary-color)] group`}
                                                    style={{ borderRadius: 'var(--btn-radius)' }}
                                                >
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-base transition-all duration-300 text-white bg-primary-600`}
                                                        style={{
                                                            boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.25)',
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'scale(1.1)';
                                                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(var(--primary-rgb), 0.4)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--primary-rgb), 0.25)';
                                                        }}
                                                    >
                                                        {user?.first_name?.[0]?.toUpperCase() || <UserCircleIcon className="w-6 h-6" />}
                                                    </div>
                                                    <div className="flex flex-col items-start translate-x-1">
                                                        <span className={`text-[10px] font-black leading-none mb-0.5 uppercase tracking-wider opacity-60 text-gray-400`}>Account</span>
                                                        <span className={`text-sm font-black leading-none max-w-[80px] truncate transition-colors text-primary-600`}>
                                                            {user?.first_name}
                                                        </span>
                                                    </div>
                                                    <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-500 group-hover:text-[var(--primary-color)] ${userMenuOpen ? 'rotate-180 opacity-100' : 'opacity-40'}`} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {userMenuOpen && (
                                                    <div className="absolute right-0 mt-0 w-60 shadow-xl py-2 focus:outline-none animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden" style={{ borderRadius: 'var(--menu-radius)', backgroundColor: 'var(--menu-bg-color)' }}>
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
                                                                    className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-primary-50 hover:text-[var(--primary-color)] font-bold rounded-xl transition-colors group"
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

                                                        <div className="py-2 px-2 mt-1" style={{ borderColor: 'var(--menu-divider)' }}>
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
                                                className="text-[14px] font-medium text-gray-600 hover:text-[var(--primary-color)] transition-colors"
                                            >
                                                Sign in
                                            </Link>
                                            <Link to="/register" className="bg-gray-950 text-white px-5 py-2 text-[14px] font-medium shadow-[0_10px_25px_-5px_rgba(3,7,18,0.2)] hover:bg-gray-800 active:scale-95 transition-all" style={{ borderRadius: 'var(--btn-radius)' }}>
                                                Get Started
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ===== Expanding Mega Menu Panel — navbar grows on hover ===== */}
                <div
                    style={{ maxHeight: activeMenu ? '600px' : '0px', overflow: 'hidden', transition: 'max-height 0.45s cubic-bezier(0.4,0,0.2,1)' }}
                    onMouseEnter={keepMenu}
                    onMouseLeave={closeMenu}
                >
                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        {/* Properties */}
                        {activeMenu === 'properties' && (
                            <div className="relative" style={{ backgroundColor: 'var(--menu-bg-color)' }}>
                                <div className="absolute top-0 right-0 h-full w-full pointer-events-none opacity-[0.15]" style={{ backgroundImage:'url(/images/train_bg.png)', backgroundSize:'contain', backgroundPosition:'120% 80%', backgroundRepeat:'no-repeat' }} />
                                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10">
                                    <div className="grid grid-cols-4 gap-12 relative w-full px-12 items-center">
                                        <div className="h-full min-h-[250px] flex flex-col justify-center pr-6">
                                            <h3 className="text-3xl font-semibold mb-4 leading-tight text-gray-900">Elevate Your Living<br/>with Super Real Estate</h3>
                                            <p className="text-lg mb-8 font-medium leading-tight text-gray-600">Experience unparalleled luxury with our elite collection of prime real estate.</p>
                                            <Link to="/listings" className="inline-flex items-center justify-center px-6 py-2 bg-gray-100 text-gray-900 font-medium text-[14px] rounded-full transition-all hover:bg-gray-200">Explore Now</Link>
                                        </div>
                                        <div className="flex flex-col items-start text-left">
                                            <div className="flex items-center px-4 mb-4"><FiSearch className="w-5 h-5 text-gray-400 mr-6" /><h3 className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color:'var(--menu-text-muted)' }}>Browse</h3></div>
                                            <div className="flex flex-col gap-1 items-start">
                                                {[{name:'All Properties',href:'/listings',icon:BuildingOfficeIcon},{name:'Properties for Rent',href:'/listings?type=rent',icon:FiKey},{name:'Properties for Sale',href:'/listings?type=sale',icon:FiDollarSign},{name:'New Listings',href:'/listings?sort=newest',icon:FiPlusCircle},{name:'Featured Properties',href:'/listings?featured=true',icon:FiStar},{name:'Ready to Move',href:'/listings?status=ready',icon:FiClock}].map((link,i)=>(
                                                    <Link key={link.name} to={link.href} className="group/link flex items-center px-4 py-3 rounded-xl transition-all min-w-[280px]">
                                                        <link.icon className="w-[18px] h-[18px] text-gray-700 group-hover/link:text-[var(--primary-color)] transition-all mr-5 stroke-[1.5]" />
                                                        <span className="text-[13px] font-semibold text-gray-800 group-hover/link:text-[var(--primary-color)] transition-all mr-2">{link.name}</span>
                                                        <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 group-hover/link:text-[var(--primary-color)] group-hover/link:translate-x-2 transition-all duration-300" />
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-start text-left">
                                            <div className="flex items-center px-4 mb-4"><HiOutlineHomeModern className="w-5 h-5 text-gray-400 mr-6" /><h3 className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color:'var(--menu-text-muted)' }}>Types</h3></div>
                                            <div className="flex flex-col gap-1 items-start">
                                                {[{name:'Condo',href:'/listings?property_type=condo',icon:BuildingOfficeIcon},{name:'Apartment',href:'/listings?property_type=apartment',icon:HiOutlineBuildingOffice2},{name:'House',href:'/listings?property_type=house',icon:HomeIcon},{name:'Townhome',href:'/listings?property_type=townhome',icon:HiOutlineHomeModern},{name:'Commercial',href:'/listings?property_type=commercial',icon:HiOutlineBuildingStorefront},{name:'Land',href:'/listings?property_type=land',icon:HiOutlineGlobeAsiaAustralia}].map((link,i)=>(
                                                    <Link key={link.name} to={link.href} className="group/link flex items-center px-4 py-3 rounded-xl transition-all min-w-[280px]">
                                                        <link.icon className="w-[18px] h-[18px] text-gray-700 group-hover/link:text-[var(--primary-color)] transition-all mr-5 stroke-[1.5]" />
                                                        <span className="text-[13px] font-semibold text-gray-800 group-hover/link:text-[var(--primary-color)] transition-all mr-2">{link.name}</span>
                                                        <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 group-hover/link:text-[var(--primary-color)] group-hover/link:translate-x-2 transition-all duration-300" />
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-start text-left">
                                            <div className="flex items-center px-4 mb-4"><FiMapPin className="w-5 h-5 text-gray-400 mr-6" /><h3 className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color:'var(--menu-text-muted)' }}>Locations</h3></div>
                                            <div className="flex flex-col gap-1 items-start">
                                                {[{name:'Sukhumvit Area',href:'/listings?district=sukhumvit',icon:MapPinIcon},{name:'Rama 9 Area',href:'/listings?district=rama9',icon:MapPinIcon},{name:'Silom / Sathorn',href:'/listings?district=silom',icon:MapPinIcon},{name:'Ladprao / Bangna',href:'/listings?district=ladprao',icon:MapPinIcon},{name:'Near BTS Stations',href:'/listings?near=bts',icon:MapPinIcon},{name:'Near MRT Stations',href:'/listings?near=mrt',icon:MapPinIcon}].map((link,i)=>(
                                                    <Link key={link.name} to={link.href} className="group/link flex items-center px-4 py-3 rounded-xl transition-all min-w-[280px]">
                                                        <link.icon className="w-[18px] h-[18px] text-gray-700 group-hover/link:text-[var(--primary-color)] transition-all mr-5 stroke-[1.5]" />
                                                        <span className="text-[13px] font-semibold text-gray-800 group-hover/link:text-[var(--primary-color)] transition-all mr-2">{link.name}</span>
                                                        <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 group-hover/link:text-[var(--primary-color)] group-hover/link:translate-x-2 transition-all duration-300" />
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Services */}
                        {activeMenu === 'services' && (
                            <div style={{ backgroundColor:'var(--menu-bg-color)' }}>
                                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10">
                                    <div className="grid grid-cols-4 gap-12 relative w-full px-12 items-center">
                                        <div className="h-full min-h-[250px] flex flex-col justify-center pr-6">
                                            <h3 className="text-3xl font-semibold mb-4 leading-tight text-gray-900">Expert Services for Your<br/>Property Journey</h3>
                                            <p className="text-lg mb-8 font-medium leading-tight text-gray-600">From expert property management to strategic investment advice, we provide the support you need.</p>
                                            <Link to="/contact" className="inline-flex items-center justify-center px-6 py-2 bg-gray-100 text-gray-900 font-medium text-[14px] rounded-full transition-all hover:bg-gray-200">Learn More</Link>
                                        </div>
                                        <div className="flex flex-col items-start text-left">
                                            <div className="flex items-center px-4 mb-6"><FiSearch className="w-5 h-5 text-gray-400 mr-6" /><h3 className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color:'var(--menu-text-muted)' }}>Find Property</h3></div>
                                            <div className="flex flex-col gap-1 items-start">
                                                {[{title:'Find a Rental Home',icon:FiHome},{title:'Buy a Property',icon:FiSearch},{title:'Schedule a Viewing',icon:FiCalendar}].map((s,idx)=>(
                                                    <div key={idx} className="group/item flex items-center px-4 py-3 rounded-xl transition-all cursor-pointer min-w-[280px]"><s.icon className="w-[18px] h-[18px] text-gray-700 group-hover/item:text-[var(--primary-color)] transition-all mr-5 stroke-[1.5]" /><span className="text-[13px] font-semibold text-gray-800 group-hover/item:text-[var(--primary-color)] transition-all mr-2">{s.title}</span><ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[var(--primary-color)] group-hover/item:translate-x-2 transition-all duration-300" /></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-start text-left">
                                            <div className="flex items-center px-4 mb-6"><FiBriefcase className="w-5 h-5 text-gray-400 mr-6" /><h3 className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color:'var(--menu-text-muted)' }}>Owners &amp; Investors</h3></div>
                                            <div className="flex flex-col gap-1 items-start">
                                                {[{title:'List Your Property',icon:FiPlusCircle},{title:'Property Management',icon:FiSettings},{title:'Investment Consultation',icon:FiDollarSign}].map((s,idx)=>(
                                                    <div key={idx} className="group/item flex items-center px-4 py-3 rounded-xl transition-all cursor-pointer min-w-[280px]"><s.icon className="w-[18px] h-[18px] text-gray-700 group-hover/item:text-[var(--primary-color)] transition-all mr-5 stroke-[1.5]" /><span className="text-[13px] font-semibold text-gray-800 group-hover/item:text-[var(--primary-color)] transition-all mr-2">{s.title}</span><ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[var(--primary-color)] group-hover/item:translate-x-2 transition-all duration-300" /></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-start text-left">
                                            <div className="flex items-center px-4 mb-6"><FiTruck className="w-5 h-5 text-gray-400 mr-6" /><h3 className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color:'var(--menu-text-muted)' }}>Assistance</h3></div>
                                            <div className="flex flex-col gap-1 items-start">
                                                {[{title:'Relocation Support',icon:FiTruck},{title:'Area Recommendations',icon:FiMapPin},{title:'Legal & Contract Support',icon:FiFileText}].map((s,idx)=>(
                                                    <div key={idx} className="group/item flex items-center px-4 py-3 rounded-xl transition-all cursor-pointer min-w-[280px]"><s.icon className="w-[18px] h-[18px] text-gray-700 group-hover/item:text-[var(--primary-color)] transition-all mr-5 stroke-[1.5]" /><span className="text-[13px] font-semibold text-gray-800 group-hover/item:text-[var(--primary-color)] transition-all mr-2">{s.title}</span><ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[var(--primary-color)] group-hover/item:translate-x-2 transition-all duration-300" /></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Contact */}
                        {activeMenu === 'contact' && (
                            <div style={{ backgroundColor:'var(--menu-bg-color)' }}>
                                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10">
                                    <div className="grid grid-cols-4 gap-12 relative w-full px-12 items-center">
                                        <div className="h-full min-h-[250px] flex flex-col justify-center pr-6">
                                            <h3 className="text-3xl font-semibold mb-4 leading-tight text-gray-900">Talk to Our Team</h3>
                                            <p className="text-lg mb-8 font-medium leading-tight text-gray-600">Our property consultants are ready to help you find the perfect home or investment.</p>
                                            <Link to="/contact" className="inline-flex items-center justify-center px-6 py-2 bg-gray-100 text-gray-900 font-medium text-[14px] rounded-full transition-all hover:bg-gray-200">Get in Touch</Link>
                                        </div>
                                        <div className="flex flex-col items-start text-left">
                                            <div className="flex items-center px-4 mb-6"><PhoneIcon className="w-5 h-5 text-gray-400 mr-6" /><h3 className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color:'var(--menu-text-muted)' }}>Contact Methods</h3></div>
                                            <div className="flex flex-col gap-1 items-start">
                                                <button type="button" className="group/item flex items-center w-full px-4 py-3 rounded-xl transition-all cursor-pointer min-w-[280px]"><PhoneIcon className="w-[18px] h-[18px] text-gray-700 group-hover/item:text-[var(--primary-color)] transition-all mr-5 stroke-[1.5]" /><span className="text-[13px] font-semibold text-gray-800 group-hover/item:text-[var(--primary-color)] transition-all">{agent?.phone || '062-718-8699'}</span></button>
                                                <button type="button" className="group/item flex items-center w-full px-4 py-3 rounded-xl transition-all cursor-pointer min-w-[280px]"><EnvelopeIcon className="w-[18px] h-[18px] text-gray-700 group-hover/item:text-[var(--primary-color)] transition-all mr-5 stroke-[1.5]" /><span className="text-[13px] font-semibold text-gray-800 group-hover/item:text-[var(--primary-color)] transition-all">{agent?.email || 'hello@superrealestate.com'}</span></button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-start text-left">
                                            <div className="flex items-center px-4 mb-6"><MapIcon className="w-5 h-5 text-gray-400 mr-6" /><h3 className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color:'var(--menu-text-muted)' }}>Visit Us</h3></div>
                                            <div className="flex flex-col gap-1 items-start">
                                                <Link to="/contact" className="group/item flex items-center px-4 py-3 rounded-xl transition-all cursor-pointer min-w-[280px]"><MapPinIcon className="w-[18px] h-[18px] text-gray-700 group-hover/item:text-[var(--primary-color)] transition-all mr-5 stroke-[1.5]" /><span className="text-[13px] font-semibold text-gray-800 group-hover/item:text-[var(--primary-color)] transition-all mr-2">View Office Location</span><ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[var(--primary-color)] group-hover/item:translate-x-2 transition-all duration-300" /></Link>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-start text-left">
                                            <div className="flex items-center px-4 mb-6"><HeartIcon className="w-5 h-5 text-gray-400 mr-6" /><h3 className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color:'var(--menu-text-muted)' }}>Quick Links</h3></div>
                                            <div className="flex flex-col gap-1 items-start">
                                                {[{name:'About Us',href:'/about'},{name:'Join Our Team',href:'/careers'},{name:'Customer Reviews',href:'/reviews'}].map((l)=>(
                                                    <Link key={l.name} to={l.href} className="group/item flex items-center px-4 py-3 rounded-xl transition-all min-w-[280px]"><ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[var(--primary-color)] group-hover/item:translate-x-2 transition-all duration-300 mr-4" /><span className="text-[13px] font-semibold text-gray-800 group-hover/item:text-[var(--primary-color)] transition-all">{l.name}</span></Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav >

            {/* Main Content */}
            <main className="flex-1">
                <Outlet context={{ navVisible: isVisible }} />
            </main>

            {/* Mobile Bottom Navigation Removed */}
            {/* Footer */}
            <footer className="bg-white text-gray-900 pt-32 pb-12 relative overflow-hidden">
                {/* Background Decoration */}
                <div
                    className="absolute inset-0 pointer-events-none select-none z-0 opacity-[0.07]"
                    style={{
                        backgroundImage: `url(${buildingBlock})`,
                        backgroundSize: '800px',
                        backgroundPosition: 'right bottom',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
                    {/* Top Section: Slogan + Links */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
                        <div className="max-w-md">
                            <h2 className="text-4xl font-medium tracking-tight leading-[1.1]">
                                Experience the future of<br />real estate management
                            </h2>
                        </div>
                        <div className="flex gap-24 lg:gap-32 pr-4 lg:pr-12">
                            <div>
                                <h4 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-6">Platform</h4>
                                <ul className="space-y-4">
                                    <li><Link to="/#features" className="text-base font-medium hover:text-primary-600 transition-colors">Features</Link></li>
                                    <li><Link to="/#plans" className="text-base font-medium hover:text-primary-600 transition-colors">Pricing Plans</Link></li>
                                    <li><Link to="/services" className="text-base font-medium hover:text-primary-600 transition-colors">Services</Link></li>
                                    <li><Link to="/register" className="text-base font-medium hover:text-primary-600 transition-colors">Get Started</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-6">Support</h4>
                                <ul className="space-y-4">
                                    <li><Link to="/login" className="text-base font-medium hover:text-primary-600 transition-colors">Agent Login</Link></li>
                                    <li><Link to="/register" className="text-base font-medium hover:text-primary-600 transition-colors">Create Account</Link></li>
                                    <li><Link to="/contact" className="text-base font-medium hover:text-primary-600 transition-colors">Help Center</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Center Section: Massive Typography */}
                    <div className="mb-24 overflow-hidden">
                        <h1 className="text-[11vw] lg:text-[9vw] font-bold tracking-[-0.04em] leading-[0.8] text-transparent bg-clip-text bg-gradient-to-br from-gray-950 via-gray-900 to-primary-500 select-none uppercase inline-block pr-8 pb-4 w-fit">
                            {brandName}
                        </h1>
                    </div>

                    {/* Bottom Section: Logo + Legal */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12">
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-gray-900 tracking-tight">
                                Super
                            </span>
                        </div>
                        <div className="flex items-center gap-8">
                            <Link to="/about" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">About Super</Link>
                            <Link to="/products" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Products</Link>
                            <Link to="/privacy" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Privacy</Link>
                            <Link to="/terms" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Terms</Link>
                        </div>
                        <div className="text-sm font-medium text-gray-400">
                            {theme.footerText || `© ${new Date().getFullYear()} Super Real Estate. All rights reserved.`}
                        </div>
                    </div>
                </div>
            </footer>
            {/* Cookie Consent Banner */}
            <CookieConsent />
        </div >
    );
};

export default PublicLayout;
