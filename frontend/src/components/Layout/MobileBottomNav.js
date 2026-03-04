import React from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    MagnifyingGlassIcon,
    BuildingOfficeIcon,
    UserCircleIcon,
    MapIcon,
    ListBulletIcon,
    XMarkIcon,
    HeartIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';
import {
    MagnifyingGlassIcon as SearchSolid,
    BuildingOfficeIcon as BuildingSolid,
    UserCircleIcon as UserSolid,
    MapIcon as MapSolid,
    ListBulletIcon as ListSolid,
    HeartIcon as HeartSolid,
    CalendarIcon as CalendarSolid,
} from '@heroicons/react/24/solid';

const MobileBottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isAuthenticated } = useAuth();

    const [isVisible, setIsVisible] = React.useState(true);
    const [lastScrollY, setLastScrollY] = React.useState(0);
    const [showPanel, setShowPanel] = React.useState(false);

    React.useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                const currentScrollY = window.scrollY;
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    setIsVisible(false);
                } else {
                    setIsVisible(true);
                }
                setLastScrollY(currentScrollY);
            }
        };
        window.addEventListener('scroll', controlNavbar);
        return () => window.removeEventListener('scroll', controlNavbar);
    }, [lastScrollY]);

    const isOnListings = location.pathname.startsWith('/listings');
    const isMapView = searchParams.get('view') === 'map';

    const switchView = (toMap) => {
        const next = new URLSearchParams(searchParams);
        if (toMap) {
            next.set('view', 'map');
        } else {
            next.delete('view');
        }
        setSearchParams(next, { replace: true });
        setShowPanel(false);
    };

    const isActive = (item) => {
        if (item.name === 'Search') return location.pathname === '/search';
        if (item.name === 'Properties') return location.pathname === '/' || location.pathname.startsWith('/listings');
        if (item.path !== '/' && location.pathname.startsWith(item.path)) return true;
        return false;
    };

    const navItems = isAuthenticated ? [
        { name: 'Search', path: '/search', icon: MagnifyingGlassIcon, activeIcon: SearchSolid },
        { name: 'Favorites', path: '/saved-listings', icon: HeartIcon, activeIcon: HeartSolid },
        { name: 'Viewings', path: '/my-bookings', icon: CalendarIcon, activeIcon: CalendarSolid },
        { name: 'Profile', path: '/profile', icon: UserCircleIcon, activeIcon: UserSolid },
    ] : [
        { name: 'Search', path: '/search', icon: MagnifyingGlassIcon, activeIcon: SearchSolid },
        { name: 'Login', path: '/login', icon: UserCircleIcon, activeIcon: UserSolid },
    ];

    const isSearchActive = location.pathname.startsWith('/search') || location.pathname.startsWith('/listings') || location.pathname === '/';
    const showToggleButton = isSearchActive;

    const gridCols = isAuthenticated ? 'grid-cols-5' : 'grid-cols-3';

    const renderNavItems = () => {
        if (!isAuthenticated) {
            return (
                <>
                    <NavLink item={navItems[0]} />
                    <div className="w-full h-full pointer-events-none" /> {/* Empty spacing for center button */}
                    <NavLink item={navItems[1]} />
                </>
            );
        }
        return (
            <>
                <NavLink item={navItems[0]} />
                <NavLink item={navItems[1]} />
                <div className="w-full h-full pointer-events-none" /> {/* Empty spacing for center button */}
                <NavLink item={navItems[2]} />
                <NavLink item={navItems[3]} />
            </>
        );
    };

    const NavLink = ({ item }) => {
        const active = isActive(item);
        const Icon = active ? item.activeIcon : item.icon;
        return (
            <Link
                to={item.path}
                onClick={() => setShowPanel(false)}
                className="relative flex flex-col items-center justify-center w-full h-full group outline-none"
            >
                {active && (
                    <div className="absolute inset-x-2 inset-y-3 bg-primary-50/50 rounded-2xl -z-10 animate-in fade-in zoom-in duration-300" />
                )}
                <div className={`relative z-10 mb-0.5 transition-all duration-300 ${active ? 'scale-110 -translate-y-0.5' : 'scale-100 group-active:scale-90'}`}>
                    <Icon className={`w-6 h-6 transition-colors duration-300 ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                </div>
                <span className={`text-[10px] font-extrabold tracking-tight transition-all duration-300 ${active ? 'text-primary-600 opacity-100' : 'text-gray-400 opacity-80'}`}>
                    {item.name}
                </span>
            </Link>
        );
    };

    return (
        <>
            {/* ── Bottom sheet panel ── */}
            {isOnListings && (
                <>
                    {/* Backdrop */}
                    {showPanel && (
                        <div
                            className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
                            onClick={() => setShowPanel(false)}
                        />
                    )}

                    {/* Panel — slides up from bottom, full-width edge-to-edge */}
                    <div
                        className={`md:hidden fixed left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl`}
                        style={{
                            bottom: 0,
                            transform: showPanel ? 'translateY(0)' : 'translateY(100%)',
                            transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
                            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
                        }}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-gray-300" />
                        </div>

                        <div className="px-6 pt-3 pb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-base font-bold text-gray-900">View mode</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowPanel(false)}
                                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Toggle buttons */}
                            <div className="flex gap-3">
                                {/* List mode */}
                                <button
                                    type="button"
                                    onClick={() => switchView(false)}
                                    className={`flex-1 flex flex-col items-center gap-3 py-5 rounded-2xl border-2 transition-all duration-200
                                        ${!isMapView
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    {!isMapView
                                        ? <ListSolid className="w-7 h-7" />
                                        : <ListBulletIcon className="w-7 h-7" />
                                    }
                                    <span className="text-sm font-bold">List</span>
                                </button>

                                {/* Map mode */}
                                <button
                                    type="button"
                                    onClick={() => switchView(true)}
                                    className={`flex-1 flex flex-col items-center gap-3 py-5 rounded-2xl border-2 transition-all duration-200
                                        ${isMapView
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    {isMapView
                                        ? <MapSolid className="w-7 h-7" />
                                        : <MapIcon className="w-7 h-7" />
                                    }
                                    <span className="text-sm font-bold">Map</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── Bottom Nav Bar ── */}
            <div
                className={`md:hidden fixed z-[60] bottom-0 left-0 right-0 backdrop-blur-xl bg-white/80 border-t border-gray-200 transition-all duration-500 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
                style={{
                    paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
                    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
                    paddingLeft: 'max(2rem, env(safe-area-inset-left, 0px))',
                    paddingRight: 'max(2rem, env(safe-area-inset-right, 0px))',
                }}
            >
                {/* Floating Map/List Toggle Button */}
                <div
                    className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-10 pointer-events-none ${showToggleButton
                        ? 'translate-y-[-24px] opacity-100 scale-100'
                        : 'translate-y-[40px] opacity-0 scale-50'
                        }`}
                >
                    <button
                        type="button"
                        onClick={() => {
                            if (isOnListings) {
                                setShowPanel(p => !p);
                            } else {
                                navigate('/listings');
                            }
                        }}
                        className={`pointer-events-auto bg-slate-900 text-white rounded-full w-[56px] h-[56px] shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex items-center justify-center outline-none ring-[6px] ring-white transition-all duration-300 active:scale-95`}
                    >
                        <div className="relative flex items-center justify-center">
                            <MapSolid className="w-6 h-6 text-white" />
                            <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-[2px]">
                                <SearchSolid className="w-3 h-3 text-white" strokeWidth={4} />
                            </div>
                        </div>
                    </button>
                </div>

                <div className={`grid ${gridCols} h-[72px] items-center px-4 min-h-[72px] gap-2 relative`}>
                    {renderNavItems()}
                </div>
            </div>
        </>
    );
};

export default MobileBottomNav;
