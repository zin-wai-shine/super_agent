import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    MagnifyingGlassIcon,
    BuildingOfficeIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
    MagnifyingGlassIcon as SearchSolid,
    BuildingOfficeIcon as BuildingSolid,
    UserCircleIcon as UserSolid,
} from '@heroicons/react/24/solid';

const MobileBottomNav = () => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    // Scroll state
    const [isVisible, setIsVisible] = React.useState(true);
    const [lastScrollY, setLastScrollY] = React.useState(0);

    React.useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                const currentScrollY = window.scrollY;

                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    // if scroll down hide the navbar
                    setIsVisible(false);
                } else {
                    // if scroll up show the navbar
                    setIsVisible(true);
                }

                // remember current page location to use in the next move
                setLastScrollY(currentScrollY);
            }
        };

        window.addEventListener('scroll', controlNavbar);

        // cleanup function
        return () => {
            window.removeEventListener('scroll', controlNavbar);
        };
    }, []);
    const isActive = (item) => {
        if (item.path === '/' && location.pathname === '/') return true;

        if (item.name === 'Search') {
            return location.pathname === '/search';
        }

        if (item.name === 'Properties') {
            return location.pathname === '/' || location.pathname.startsWith('/listings');
        }

        // Strict prefix matching for other routes (Profile)
        if (item.path !== '/' && location.pathname.startsWith(item.path)) return true;
        return false;
    };

    const navItems = [
        {
            name: 'Properties',
            path: '/listings',
            icon: BuildingOfficeIcon,
            activeIcon: BuildingSolid
        },
        {
            name: 'Search',
            path: '/search',
            icon: MagnifyingGlassIcon,
            activeIcon: SearchSolid
        },
    ];

    // Profile Item - ALWAYS goes to /profile (if auth), Dashboard access is INSIDE profile page
    const profileItem = {
        name: 'Profile',
        path: !isAuthenticated ? '/login' : '/profile',
        icon: UserCircleIcon,
        activeIcon: UserSolid
    };

    const allItems = [...navItems, profileItem];

    return (
        /* Full Width Bottom Nav - Scroll Aware */
        <div
            className={`md:hidden fixed z-50 bottom-0 left-0 right-0 backdrop-blur-xl bg-white/75 border-t border-gray-200 transition-all duration-500 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full tracking-wider'}`}
            style={{
                paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
                paddingLeft: 'max(2rem, env(safe-area-inset-left, 0px))',
                paddingRight: 'max(2rem, env(safe-area-inset-right, 0px))',
            }}
        >
            <div className="grid grid-cols-4 h-[72px] items-center px-4 min-h-[72px]">
                {allItems.map((item) => {
                    const active = isActive(item);
                    const Icon = active ? item.activeIcon : item.icon;

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className="relative flex flex-col items-center justify-center w-full h-full group outline-none"
                        >
                            {/* Active Indicator Background Pill */}
                            {active && (
                                <div className="absolute inset-x-2 inset-y-3 bg-primary-50/50 rounded-2xl -z-10 animate-in fade-in zoom-in duration-300" />
                            )}

                            {/* Icon */}
                            <div className={`relative z-10 mb-0.5 transition-all duration-300 ${active ? 'scale-110 -translate-y-0.5' : 'scale-100 group-active:scale-90'}`}>
                                <Icon
                                    className={`w-6 h-6 transition-colors duration-300 ${active
                                        ? 'text-primary-600'
                                        : 'text-gray-400 group-hover:text-gray-600'
                                        }`}
                                />
                            </div>

                            {/* Label */}
                            <span className={`text-[10px] font-extrabold tracking-tight transition-all duration-300 ${active
                                ? 'text-primary-600 opacity-100'
                                : 'text-gray-400 opacity-80'
                                }`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileBottomNav;
