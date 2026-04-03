import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { usePublicDarkTheme } from '../../contexts/PublicDarkThemeContext';
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
    SunIcon,
    MoonIcon,
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
    FiBarChart2,
    FiLogOut,
    FiList,
} from 'react-icons/fi';
import {
    HiOutlineBuildingOffice2,
    HiOutlineHomeModern,
    HiOutlineBuildingStorefront,
    HiOutlineGlobeAsiaAustralia,
} from 'react-icons/hi2';
import { LuTextSearch } from "react-icons/lu";
import { TbSquares, TbListDetails, TbMapSearch } from "react-icons/tb";
import Logo from '../Common/Logo';
import { getMediaUrl } from '../../utils/media';
import { publicApi } from '../../services/api';
import StyledSelect from '../Form/StyledSelect';
import CookieConsent from '../Common/CookieConsent';
import buildingBlock from '../../assets/images/building_block.png';

const PublicLayout = () => {
    const { theme } = useTheme();
    const { isDarkMode, toggleTheme } = usePublicDarkTheme();

    // Independent Dark Mode logic
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDarkMode]);

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
    const isMapView = searchParams.get('view') === 'map' || (!searchParams.get('view') && localStorage.getItem('preferredView') === 'map');
    const isListingsPath = (pathname) =>
        pathname === '/listings' || (!isMainDomain && pathname === '/');
    const isOnListings = isListingsPath(location.pathname);
    const [navButtonVisible, setNavButtonVisible] = React.useState(isListingsPath(location.pathname));
    const [showViewPanel, setShowViewPanel] = React.useState(false);

    // Scroll locking for mobile view panel
    React.useEffect(() => {
        if (showViewPanel && window.innerWidth < 1024) {
            document.body.style.overflow = 'hidden';
            // Also prevent touchmove to be extra sure on iOS
            const preventDefault = (e) => e.preventDefault();
            document.addEventListener('touchmove', preventDefault, { passive: false });
            return () => {
                document.body.style.overflow = '';
                document.removeEventListener('touchmove', preventDefault);
            };
        }
    }, [showViewPanel]);

    const initialHeight = React.useRef(window.visualViewport ? window.visualViewport.height : window.innerHeight);
    const [isKeyboardOpen, setIsKeyboardOpen] = React.useState(false);

    React.useEffect(() => {
        const handleViewportChange = () => {
            const viewport = window.visualViewport;
            if (!viewport) return;

            // Compare current height to the height we started with. 
            // If more than 150px is missing, the keyboard is definitely open.
            const isKeyboardVisible = viewport.height < initialHeight.current - 150;
            setIsKeyboardOpen(isKeyboardVisible);
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportChange);
        } else {
            window.addEventListener('resize', handleViewportChange);
        }

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleViewportChange);
            } else {
                window.removeEventListener('resize', handleViewportChange);
            }
        };
    }, []);

    // Only update button visibility and close panel when the ROUTE changes — never on data re-renders
    React.useEffect(() => {
        setNavButtonVisible(isListingsPath(location.pathname));
        setShowViewPanel(false);
    }, [location.pathname, isMainDomain]);

    const switchView = (toMap) => {
        // Reset scroll position to top when switching views
        window.scrollTo({ top: 0, behavior: 'instant' });

        const next = new URLSearchParams(location.search);
        if (toMap) {
            next.set('view', 'map');
            localStorage.setItem('preferredView', 'map');
        } else {
            next.delete('view');
            localStorage.setItem('preferredView', 'list');
        }
        navigate(`/listings?${next.toString()}`);
        setShowViewPanel(false);
    };

    const navigation = isMainDomain ? [
        { name: 'Features', href: '/#features', icon: BuildingOfficeIcon },
        { name: 'Plans', href: '/#plans', icon: ChartBarIcon },
    ] : [];

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
        if (path === '/listings') return location.pathname === '/' || location.pathname.startsWith('/listings');
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
            localStorage.setItem('preferredView', 'list');
        } else {
            params.set('view', 'map');
            localStorage.setItem('preferredView', 'map');
        }
        navigate(`${location.pathname}?${params.toString()}`);
    };

    // Dropdown Logic
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const [appMenuOpen, setAppMenuOpen] = useState(false);
    const appMenuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
            if (appMenuRef.current && !appMenuRef.current.contains(event.target)) {
                setAppMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Navbar visibility logic (Always visible)
    const [isVisible, setIsVisible] = useState(true);

    // Mobile bottom nav: hide on scroll down, show on scroll up (with animation)
    const [mobileBottomNavVisible, setMobileBottomNavVisible] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const lastScrollYRef = useRef(0);
    const tickingRef = useRef(false);

    const isListingsOrProjects = location.pathname === '/' || location.pathname.startsWith('/listings') || location.pathname.startsWith('/projects');

    React.useEffect(() => {
        const SCROLL_THRESHOLD = 12;
        const TOP_THRESHOLD = 80;
        const SHADOW_SCROLL = 6;

        const handleScroll = () => {
            if (tickingRef.current) return;
            tickingRef.current = true;
            requestAnimationFrame(() => {
                const y = window.scrollY || document.documentElement.scrollTop;
                const prev = lastScrollYRef.current;
                setIsScrolled(y > SHADOW_SCROLL);

                // If on map view, let the ListingsPage handle its own nav visibility via its custom scroll handler
                if (isMapView) {
                    tickingRef.current = false;
                    return;
                }

                if (y <= TOP_THRESHOLD) {
                    setMobileBottomNavVisible(true);
                } else if (y > prev + SCROLL_THRESHOLD) {
                    setMobileBottomNavVisible(false);
                } else if (y < prev - SCROLL_THRESHOLD) {
                    setMobileBottomNavVisible(true);
                }
                lastScrollYRef.current = y;
                tickingRef.current = false;
            });
        };

        // If we are on map and it's not explicitly expanded, we might want to hide it
        // But the scroll handler will still run. Let's make it smarter.
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMapView]); // Re-run when view changes

    const [isNavLoading, setIsNavLoading] = useState(true);
    const [filterBarSlot, setFilterBarSlot] = useState(null);

    React.useEffect(() => {
        // Match the ListingsPage 800ms delay
        const timer = setTimeout(() => setIsNavLoading(false), 800);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    const brandName = theme.headerText || (agent ? (agent.agency_name || agent.name) : 'Super');

    // Mobile bottom nav active states
    const isSearchTabActive =
        location.pathname === '/' ||
        location.pathname.startsWith('/listings') ||
        location.pathname === '/search';
    const isWishlistTabActive = location.pathname.startsWith('/saved-listings');
    const isBookingsTabActive = location.pathname.startsWith('/my-bookings');
    const isProfileTabActive = location.pathname.startsWith('/profile');
    const isLoginPage = location.pathname === '/login';
    const isRegisterPage = location.pathname === '/register';
    const isAuthPage = isLoginPage || isRegisterPage;
    const isLoginTabActive = isLoginPage || isRegisterPage;
    const isSavedPage = location.pathname === '/saved-listings';
    const isProfilePage = location.pathname === '/profile';
    const isBookingsPage = location.pathname === '/my-bookings';
    const hideNavOnPage = isSavedPage || isProfilePage || isBookingsPage || isAuthPage;
    const scrollContainerRef = useRef(null);
    return (
        <div
            id="main-scroll-container"
            ref={scrollContainerRef}
            className="flex flex-col bg-white dark:bg-dashboard-dark min-h-[100dvh]"
            style={{ fontFamily: theme.fontFamily }}
        >
            {/* Navigation Drawer (Mobile + lg when burger is used) */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[250]">
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
                                <Link to={localStorage.getItem('preferredView') === 'map' ? '/?view=map' : '/'} className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                                    <Logo className="w-8 h-8" style={{ color: 'var(--primary-color)' }} />
                                    <span className="text-xl font-bold" style={{ color: 'var(--menu-text-primary)' }}>{brandName}</span>
                                </Link>
                                <div className="flex items-center gap-2">

                                    <button
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="p-2 rounded-full transition-colors hover:bg-white/10"
                                        style={{ color: 'var(--menu-text-secondary)' }}
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Drawer Links — when not logged in (mobile) only Search + Login */}
                            <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                                {!isAuthenticated ? (
                                    <>
                                        <Link
                                            to="/search"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors`}
                                            style={{
                                                color: location.pathname === '/search' ? 'var(--primary-color)' : 'var(--menu-text-primary)',
                                                backgroundColor: location.pathname === '/search' ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent'
                                            }}
                                            onMouseEnter={(e) => location.pathname !== '/search' && (e.currentTarget.style.backgroundColor = 'var(--menu-hover-bg)')}
                                            onMouseLeave={(e) => location.pathname !== '/search' && (e.currentTarget.style.backgroundColor = 'transparent')}
                                        >
                                            <FiSearch className="w-5 h-5" />
                                            <span>Search</span>
                                        </Link>
                                        <Link
                                            to="/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors w-full text-left"
                                            style={{ color: 'var(--menu-text-primary)', backgroundColor: 'transparent' }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--menu-hover-bg)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                        >
                                            <UserCircleIcon className="w-5 h-5" />
                                            <span>Login</span>
                                        </Link>
                                    </>
                                ) : navigation.map((item) => {
                                    if (item.name === 'Projects') {
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

                                                <div className="relative left-0 w-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[60] p-2">
                                                    <div className="backdrop-blur-xl shadow-xl border border-white/10 overflow-hidden p-4" style={{ borderRadius: 'var(--menu-radius)', backgroundColor: 'var(--menu-bg-color)' }}>
                                                        <div className="flex flex-col gap-1 mb-4">
                                                            <Link to="/projects" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors group/link" style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--menu-hover-bg)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                                <span className="font-medium" style={{ color: 'var(--menu-text-primary)' }}>All Projects</span>
                                                                <ArrowRightOnRectangleIcon className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" style={{ color: 'var(--menu-text-primary)' }} />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
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
                                                            <Link to={localStorage.getItem('preferredView') === 'map' ? '/listings?view=map' : '/listings'} onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors group/link" style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--menu-hover-bg)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                                <span className="font-medium" style={{ color: 'var(--menu-text-primary)' }}>All Properties</span>
                                                                <ArrowRightOnRectangleIcon className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" style={{ color: 'var(--menu-text-primary)' }} />
                                                            </Link>
                                                            <Link to={localStorage.getItem('preferredView') === 'map' ? '/listings?type=rent&view=map' : '/listings?type=rent'} onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors group/link" style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--menu-hover-bg)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                                <span className="font-medium" style={{ color: 'var(--menu-text-primary)' }}>To Rent</span>
                                                                <ArrowRightOnRectangleIcon className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" style={{ color: 'var(--menu-text-primary)' }} />
                                                            </Link>
                                                            <Link to={localStorage.getItem('preferredView') === 'map' ? '/listings?type=sale&view=map' : '/listings?type=sale'} onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors group/link" style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--menu-hover-bg)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
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
                                                const role = user?.role?.toLowerCase().trim();
                                                if (role === 'super_admin') return '/admin';
                                                if (role === 'agent' || role === 'sub_agent') {
                                                    const agent = user.agent;
                                                    if (agent && agent.subdomain) {
                                                        const currentHost = window.location.hostname;
                                                        const mainDomain = process.env.REACT_APP_MAIN_DOMAIN || 'srv1534108.hstgr.cloud';
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
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full flex justify-center py-2.5 border font-semibold shadow-sm transition-all"
                                        style={{
                                            borderRadius: 'var(--btn-radius)',
                                            color: 'var(--menu-text-primary)',
                                            borderColor: 'var(--menu-border)',
                                            backgroundColor: 'var(--menu-hover-bg)'
                                        }}
                                    >
                                        Login
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop: nav bar and filter bar — hidden on login/register; on mobile also hidden for Profile/Bookings/Saved via hideNavOnPage */}
            {!isAuthPage && (
                <div className={`hidden md:block sticky top-0 z-[150] bg-white dark:bg-dashboard-dark/80 backdrop-blur-xl transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'} border-b ${isScrolled ? 'border-gray-100 dark:border-white/5' : 'border-transparent'}`}>
                    <nav
                        className={`transition-all duration-300 bg-white/80 dark:bg-transparent backdrop-blur-md ${activeMenu ? 'relative z-[300]' : ''} ${(appMenuOpen || userMenuOpen) ? 'relative z-[200]' : ''}`}
                        onMouseLeave={closeMenu}
                    >
                        <div className="max-w-[2520px] mx-auto px-6 md:px-12 lg:px-20">
                            <div className="flex items-center justify-between h-20 md:h-28">
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
                                            {/* Logo — triple size on desktop only */}
                                            <Link to={localStorage.getItem('preferredView') === 'map' ? '/?view=map' : '/'} className="flex items-center group pr-4 md:pr-8">
                                                <div
                                                    className="w-[55px] h-[51px] md:w-[150px] md:h-[51px] bg-[length:100%_auto] bg-no-repeat bg-left transition-all duration-300"
                                                    style={{
                                                        ...(theme.logoUrl ? { backgroundImage: `url(${getMediaUrl(theme.logoUrl)})` } : {}),
                                                        transformOrigin: 'left',
                                                        transform: `scale(var(--navbar-logo-scale, 1))`
                                                    }}
                                                >
                                                    {!theme.logoUrl && (
                                                        <Logo className="w-full h-full" style={{ color: 'var(--primary-color)' }} />
                                                    )}
                                                </div>
                                            </Link>

                                            <div className="flex items-center space-x-1 lg:hidden xl:flex">
                                            </div>
                                        </div>

                                        {/* Center Slot for Search/Filter — integrated into nav row */}
                                        <div className="flex-1 max-w-6xl mx-auto px-4 hidden md:block">
                                            {(isListingsOrProjects || location.pathname === '/saved-listings' || location.pathname === '/my-bookings') && (
                                                <div ref={(el) => setFilterBarSlot(el)} className="w-full flex justify-center" />
                                            )}
                                        </div>

                                        {/* Auth Buttons */}
                                        <div className="flex items-center space-x-2 md:space-x-4">
                                            {/* Theme Toggle */}

                                            {isAuthenticated ? (
                                                <div className="flex items-center gap-1 sm:gap-2">
                                                    {/* Vertical separator — lg only */}
                                                    <div className="hidden lg:block w-0 h-6 flex-shrink-0" aria-hidden />

                                                    {/* Profile — visible at lg (layout like image) */}
                                                    <div className="relative flex items-center" ref={userMenuRef}>
                                                        <div
                                                            className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg transition-all duration-300 text-white bg-primary-600"
                                                            style={{
                                                                boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.25)',
                                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                            }}
                                                        >
                                                            {user?.first_name?.[0]?.toUpperCase() || <UserCircleIcon className="w-7 h-7" />}
                                                        </div>

                                                        {/* Vertical divider */}
                                                        <div className="mx-1 h-6 w-px bg-gray-200 dark:bg-white/10 hidden lg:block" />
                                                    </div>

                                                    {/* Hamburger — visible on all desktop sizes */}
                                                    <div className="hidden lg:flex items-center flex-shrink-0 relative" ref={appMenuRef}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setAppMenuOpen(!appMenuOpen)}
                                                            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-dashboard-card text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dashboard-hover transition-colors shadow-sm dark:border dark:border-dashboard-border"
                                                            aria-label="Open menu"
                                                            aria-expanded={appMenuOpen}
                                                        >
                                                            <Bars3Icon className="w-6 h-6" strokeWidth={1.5} />
                                                        </button>
                                                        {appMenuOpen && (
                                                            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-dashboard-card rounded-[24px] border border-gray-100 dark:border-dashboard-border shadow-[0_10px_40px_-5px_rgba(0,0,0,0.15)] py-3 focus:outline-none animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden z-[200]">
                                                                {/* User Profile Summary (Since top avatar is static) */}
                                                                <div className="px-5 py-4 border-b border-gray-100 dark:border-dashboard-border bg-gray-50/50 dark:bg-white/5 mb-1">
                                                                    <p className="text-[14px] font-bold text-gray-900 dark:text-white truncate">
                                                                        {user?.first_name} {user?.last_name}
                                                                    </p>
                                                                    <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                                                        {user?.email}
                                                                    </p>
                                                                </div>
                                                                <div className="py-1 px-2">
                                                                    <Link to="/saved-listings" onClick={() => setAppMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[14px] font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                                                                        <FiHeart className="w-5 h-5 text-gray-900 dark:text-white" />
                                                                        Favorites
                                                                    </Link>
                                                                    <Link to="/my-bookings" onClick={() => setAppMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[14px] font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                                                                        <FiCalendar className="w-5 h-5 text-gray-900 dark:text-white" />
                                                                        My Viewing Requests
                                                                    </Link>
                                                                    <Link to="/profile" onClick={() => setAppMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[14px] font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                                                                        <FiUser className="w-5 h-5 text-gray-900 dark:text-white" />
                                                                        Profile
                                                                    </Link>
                                                                    {(user?.role === 'agent' || user?.role === 'sub_agent' || user?.role === 'super_admin') && (
                                                                        <Link
                                                                            to={(() => {
                                                                                const role = user?.role?.toLowerCase().trim();
                                                                                if (role === 'super_admin') return '/admin';
                                                                                if (role === 'agent' || role === 'sub_agent') {
                                                                                    const agent = user.agent;
                                                                                    if (agent && agent.subdomain) {
                                                                                        const currentHost = window.location.hostname;
                                                                                        const mainDomain = process.env.REACT_APP_MAIN_DOMAIN || 'srv1534108.hstgr.cloud';
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
                                                                            className="flex items-center gap-3 px-4 py-3 text-[14px] font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                                                                            onClick={(e) => {
                                                                                const href = e.currentTarget.getAttribute('href');
                                                                                if (href.startsWith('http')) {
                                                                                    e.preventDefault();
                                                                                    window.location.href = href;
                                                                                }
                                                                                setAppMenuOpen(false);
                                                                            }}
                                                                        >
                                                                            <FiBarChart2 className="w-5 h-5 text-gray-900 dark:text-white" />
                                                                            Dashboard
                                                                        </Link>
                                                                    )}
                                                                    <div className="my-1 border-t border-gray-100" />
                                                                    <button type="button" onClick={() => { logout(); setAppMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-[14px] font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                                                                        <FiLogOut className="w-5 h-5 text-rose-600" />
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
                                                        className="text-[14px] font-medium text-gray-900 dark:text-gray-400 hover:text-[var(--primary-color)] transition-colors"
                                                    >
                                                        Sign in
                                                    </Link>
                                                    <Link to="/register" className="bg-gray-950 text-white dark:bg-white dark:text-gray-950 px-6 py-2.5 text-[14px] font-semibold shadow-[0_10px_25px_-5px_rgba(3,7,18,0.2)] hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-95 transition-all rounded-full">
                                                        Get Started
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ===== Expanding Mega Menu Panel — navbar grows on hover; above filter bar (z-[160]) ===== */}
                        {/* Mega Menu container removed */}
                    </nav>
                </div >
            )}

            {/* Main Content
                Add bottom padding on mobile so content isn't hidden behind the mobile bottom nav. */}
            <main className={`${isListingsOrProjects ? 'min-h-[100vh] flex-shrink-0' : 'flex-1'} ${mobileBottomNavVisible && !hideNavOnPage ? 'pb-20' : 'pb-0'} md:pb-0`}>
                <Outlet context={{ navVisible: isVisible, filterBarSlot, isScrolled, mobileBottomNavVisible, setMobileBottomNavVisible }} />
            </main>

            {/* Map/List bottom sheet panel — slides up above the nav on /listings */}
            {isOnListings && (
                <>
                    {showViewPanel && (
                        <div
                            className="md:hidden fixed inset-0 z-[208] bg-black/30 backdrop-blur-[2px]"
                            onClick={() => setShowViewPanel(false)}
                        />
                    )}
                    <div
                        className="md:hidden fixed left-0 right-0 z-[209] bg-white dark:bg-dashboard-card rounded-t-[36px] overflow-y-auto"
                        style={{
                            bottom: '72px',
                            maxHeight: 'calc(80vh - 72px)',
                            transform: showViewPanel ? 'translateY(0)' : 'translateY(calc(100% + 72px))',
                            transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
                            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                        }}
                    >
                        {/* Handle */}
                        <div
                            className="flex justify-center pt-5 pb-4 cursor-pointer"
                            onClick={() => setShowViewPanel(false)}
                        >
                            <div className="w-10 h-1.5 rounded-full bg-gray-200 dark:bg-white/10" />
                        </div>

                        {/* Pill segmented control */}
                        <div className="px-6 pb-6 pt-4 mb-6">
                            <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-full p-1 gap-1 max-w-[240px] mx-auto">
                                {/* List View */}
                                <button
                                    type="button"
                                    onClick={() => switchView(false)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-[13px] transition-all duration-250 active:scale-95 ${!isMapView
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
                                        }`}
                                >
                                    {!isMapView && (
                                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    <span className="font-normal">List View</span>
                                </button>

                                {/* Map View */}
                                <button
                                    type="button"
                                    onClick={() => switchView(true)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-[13px] transition-all duration-250 active:scale-95 ${isMapView
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
                                        }`}
                                >
                                    {isMapView && (
                                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    <span className="font-normal">Map View</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Mobile Bottom Navigation */}
            <div
                className={`fixed inset-x-0 bottom-0 z-[210] md:hidden transition-transform ease-[cubic-bezier(0.32,0.72,0,1)] ${isKeyboardOpen ? 'translate-y-full duration-0' : 'duration-500'}`}
                style={{ transform: (mobileBottomNavVisible && !isKeyboardOpen) ? 'translateY(0)' : 'translateY(100%)' }}
            >
                <div>
                    <nav className="w-full">
                        <div
                            className="bg-white dark:bg-dashboard-card border-t border-gray-200 dark:border-white/5"
                            style={{
                                paddingTop: '0.5rem',
                                paddingBottom: '0.5rem',
                                paddingLeft: 'env(safe-area-inset-left, 0px)',
                                paddingRight: 'env(safe-area-inset-right, 0px)',
                            }}
                        >
                            <div className="flex items-center justify-between min-h-[56px]">
                                <Link
                                    to={localStorage.getItem('preferredView') === 'map' ? '/listings?view=map' : '/listings'}
                                    className="flex-1 flex flex-col items-center justify-center py-2"
                                >
                                    <FiSearch
                                        className={`w-6 h-6 ${isSearchTabActive ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500'}`}
                                    />
                                    <span
                                        className={`mt-0.5 text-[11px] font-semibold ${isSearchTabActive ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                    >
                                        Search
                                    </span>
                                </Link>

                                {isAuthenticated ? (
                                    <>
                                        {/* Favorites */}
                                        <Link
                                            to="/saved-listings"
                                            className="flex-1 flex flex-col items-center justify-center py-2"
                                        >
                                            <FiHeart
                                                className={`w-6 h-6 ${isWishlistTabActive ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500'
                                                    }`}
                                            />
                                            <span
                                                className={`mt-0.5 text-[11px] font-semibold ${isWishlistTabActive ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'
                                                    }`}
                                            >
                                                Favorites
                                            </span>
                                        </Link>

                                        {/* Map/List toggle — shown only on /listings */}
                                        <button
                                            type="button"
                                            onClick={() => setShowViewPanel(p => !p)}
                                            className={`flex flex-col items-center justify-center py-2 relative transition-[width,flex] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${navButtonVisible ? 'flex-1 pointer-events-auto' : 'w-0 flex-none overflow-hidden pointer-events-none'}`}
                                        >
                                            {/* Circle + icons scale together in sync with wrapper */}
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${showViewPanel ? 'bg-primary-600' : 'bg-gray-900 dark:bg-white'} ${navButtonVisible ? 'scale-100 translate-y-0 shadow-lg' : 'scale-0 translate-y-8 shadow-none'}`}>
                                                <LuTextSearch className={`absolute w-6 h-6 shrink-0 transition-all duration-300 ${isMapView ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 -translate-y-4'} ${showViewPanel ? 'text-white' : 'text-white dark:text-gray-900'}`} strokeWidth={2.5} />
                                                <TbMapSearch className={`absolute w-6 h-6 shrink-0 transition-all duration-300 ${!isMapView ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-4'} ${showViewPanel ? 'text-white' : 'text-white dark:text-gray-900'}`} strokeWidth={2.5} />
                                            </div>
                                        </button>

                                        {/* Viewings */}
                                        <Link
                                            to="/my-bookings"
                                            className="flex-1 flex flex-col items-center justify-center py-2"
                                        >
                                            <FiCalendar
                                                className={`w-6 h-6 ${isBookingsTabActive ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500'
                                                    }`}
                                            />
                                            <span
                                                className={`mt-0.5 text-[11px] font-semibold ${isBookingsTabActive ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'
                                                    }`}
                                            >
                                                Viewings
                                            </span>
                                        </Link>

                                        {/* Profile */}
                                        <Link
                                            to="/profile"
                                            className="flex-1 flex flex-col items-center justify-center py-2"
                                        >
                                            <FiUser
                                                className={`w-6 h-6 ${isProfileTabActive ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500'
                                                    }`}
                                            />
                                            <span
                                                className={`mt-0.5 text-[11px] font-semibold ${isProfileTabActive ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'
                                                    }`}
                                            >
                                                Profile
                                            </span>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        {/* Center map/list toggle — unauthenticated */}
                                        <button
                                            type="button"
                                            onClick={() => setShowViewPanel(p => !p)}
                                            className={`flex flex-col items-center justify-center py-2 relative transition-[width,flex] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${navButtonVisible ? 'flex-1 pointer-events-auto' : 'w-0 flex-none overflow-hidden pointer-events-none'}`}
                                        >
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${showViewPanel ? 'bg-primary-600' : 'bg-gray-900 dark:bg-white'} ${navButtonVisible ? 'scale-100 translate-y-0 shadow-lg' : 'scale-0 translate-y-8 shadow-none'}`}>
                                                <LuTextSearch className={`absolute w-6 h-6 shrink-0 transition-all duration-300 ${isMapView ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 -translate-y-4'} ${showViewPanel ? 'text-white' : 'text-white dark:text-gray-900'}`} strokeWidth={2.5} />
                                                <TbMapSearch className={`absolute w-6 h-6 shrink-0 transition-all duration-300 ${!isMapView ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-4'} ${showViewPanel ? 'text-white' : 'text-white dark:text-gray-900'}`} strokeWidth={2.5} />
                                            </div>
                                        </button>

                                        {/* Login */}
                                        <Link
                                            to="/login"
                                            className="flex-1 flex flex-col items-center justify-center py-2"
                                        >
                                            <UserCircleIcon className={`w-6 h-6 ${isLoginTabActive ? 'text-primary-600' : 'text-gray-400'}`} />
                                            <span className={`mt-0.5 text-[11px] font-semibold ${isLoginTabActive ? 'text-primary-600' : 'text-gray-500'}`}>
                                                Login
                                            </span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Footer - shown on all pages except profile, my-bookings, login, register */}
            {
                !hideNavOnPage && (
                    <footer className="hidden md:block text-gray-900 dark:text-white pt-8 pb-6 md:pt-32 md:pb-12 relative overflow-hidden flex-shrink-0">
                        {/* Background Decoration */}
                        <div
                            className="absolute inset-0 pointer-events-none select-none z-0 opacity-[0.07] dark:opacity-[0.03]"
                            style={{
                                backgroundImage: `url(${buildingBlock})`,
                                backgroundSize: '800px',
                                backgroundPosition: 'right bottom',
                                backgroundRepeat: 'no-repeat'
                            }}
                        />
                        <div className="max-w-[2520px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
                            {/* Top Section: Slogan + Links */}
                            <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-8 md:mb-24">
                                <div className="max-w-md">
                                    <h2 className="text-3xl md:text-4xl font-normal md:font-medium tracking-tight leading-[1.1]">
                                        Experience the future of<br />real estate management
                                    </h2>
                                </div>
                            </div>

                            {/* Center Section: Massive Typography */}
                            <div className="mb-8 md:mb-24 overflow-hidden">
                                <h1 className="text-[8vw] sm:text-[7vw] lg:text-[6vw] font-bold tracking-[-0.03em] md:tracking-[-0.04em] leading-[0.9] md:leading-[0.8] text-transparent bg-clip-text bg-gradient-to-br from-primary-600 via-primary-500 to-white/20 select-none uppercase inline-block pr-8 pb-4 w-fit">
                                    {brandName}
                                </h1>
                            </div>

                            {/* Bottom Section: Logo + Legal */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6 md:pt-12">
                                <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-3">
                                    {/* Logo icon — mobile only */}
                                    <div className="md:hidden flex items-center justify-center mb-1">
                                        <div
                                            className="w-40 h-40 bg-[length:100%_auto] bg-no-repeat bg-center flex items-center justify-center"
                                            style={theme.logoUrl ? { backgroundImage: `url(${getMediaUrl(theme.logoUrl)})` } : {}}
                                        >
                                            {!theme.logoUrl && (
                                                <Logo className="w-40 h-40" style={{ color: 'var(--primary-color)' }} />
                                            )}
                                        </div>
                                    </div>
                                    <span className="hidden md:block text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                                        {brandName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-8">
                                    <Link to="/about" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">About {brandName}</Link>
                                    <Link to="/products" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Products</Link>
                                    <Link to="/privacy" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Privacy</Link>
                                    <Link to="/terms" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">Terms</Link>
                                </div>
                                <div className="text-sm font-medium text-gray-400 dark:text-gray-500">
                                    {theme.footerText || `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`}
                                </div>
                            </div>
                        </div>
                    </footer>
                )
            }
            {/* Cookie Consent Banner */}
            <CookieConsent />
        </div >
    );
};

export default PublicLayout;
