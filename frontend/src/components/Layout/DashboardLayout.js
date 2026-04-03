import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardTheme } from '../../contexts/DashboardThemeContext';
import { useTenant } from '../../contexts/TenantContext';
import NotificationBell from '../Common/NotificationBell';

import Logo from '../Common/Logo';
import { getMediaUrl } from '../../utils/media';
import {
    HomeIcon,
    BuildingOfficeIcon,
    UsersIcon,
    SwatchIcon,
    CreditCardIcon,
    ArrowLeftOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    ChartBarIcon,
    CogIcon,
    BellIcon,
    MegaphoneIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    SunIcon,
    MoonIcon,
    CalendarDaysIcon,
    BuildingOffice2Icon,
    ArrowTopRightOnSquareIcon,
    FolderIcon,
} from '@heroicons/react/24/outline';

const DashboardLayout = () => {
    const { isDarkMode, toggleTheme } = useDashboardTheme();
    const { isMainDomain, agent } = useTenant();
    const { user, logout, isSuperAdmin, isAgent } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Independent Dark Mode logic
    React.useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDarkMode]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const adminNavigation = [
        { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
        { name: 'Agents', href: '/admin/agents', icon: UsersIcon },
        { name: 'Subscription Plans', href: '/admin/plans', icon: CreditCardIcon },
        { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
        { name: 'Banners', href: '/admin/banners', icon: MegaphoneIcon },
    ];

    const agentNavigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Listings', href: '/dashboard/listings', icon: BuildingOfficeIcon },
        { name: 'Developers', href: '/dashboard/developers', icon: BuildingOffice2Icon },
        { name: 'Projects', href: '/dashboard/projects', icon: BuildingOfficeIcon },
        { name: 'Collections', href: '/dashboard/collections', icon: FolderIcon },
        { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarDaysIcon },
        { name: 'Sub-Agents', href: '/dashboard/sub-agents', icon: UsersIcon },
        { name: 'Users', href: '/dashboard/users', icon: UsersIcon },
        { name: 'Theme', href: '/dashboard/theme', icon: SwatchIcon },
        { name: 'Notifications', href: '/dashboard/notifications', icon: BellIcon },
        { name: 'Banners', href: '/dashboard/banners', icon: MegaphoneIcon },
        { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
    ];

    // Safe navigation filter
    const navigation = isSuperAdmin ? adminNavigation : agentNavigation.filter(item => {
        const sub = user?.agent?.subscription || user?.agent?.Subscription;
        if (!sub) return true; // Default to show if no plan info

        switch (item.name) {
            case 'Appointments': return sub.allow_appointments ?? sub.AllowAppointments;
            case 'Sub-Agents': return sub.allow_sub_agents ?? sub.AllowSubAgents;
            case 'Theme': return sub.allow_theme ?? sub.AllowTheme;
            case 'Notifications': return sub.allow_notifications ?? sub.AllowNotifications;
            case 'Banners': return sub.allow_banners ?? sub.AllowBanners;
            default: return true;
        }
    });

    const isActive = (path) => {
        if (path === '/dashboard' || path === '/admin') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="h-screen bg-gray-50 dark:bg-dashboard-dark flex flex-col overflow-hidden transition-colors duration-200">
            {/* Top Navigation Bar */}
            <header className="h-16 flex-none bg-white dark:bg-dashboard-card border-b border-gray-200 dark:border-gray-700 z-30 flex items-center justify-between px-4 relative transition-colors duration-200">
                {/* 1. Mobile Sidebar Toggle (Hidden on Desktop) */}
                <div className="flex items-center lg:hidden z-20">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 -ml-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                    >
                        {sidebarOpen ? (
                            <XMarkIcon className="w-7 h-7" />
                        ) : (
                            <Bars3Icon className="w-7 h-7" />
                        )}
                    </button>
                </div>

                {/* 2. Logo (Centered on Mobile, Left on Desktop) */}
                <Link 
                    to={isSuperAdmin ? '/admin' : '/dashboard'} 
                    className="flex items-center absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 transition-all duration-300 z-10"
                >
                    {isMainDomain ? (
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <Logo className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 dark:text-primary-400" />
                            <span className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800 hidden sm:block dark:from-primary-400 dark:to-primary-200">Super</span>
                        </div>
                    ) : (
                        <div className="flex items-center h-16">
                            {(agent?.theme?.logo_url || agent?.logo) ? (
                                <div className="relative h-16 w-52 sm:w-64 flex items-center justify-center lg:justify-start">
                                    <img
                                        src={getMediaUrl(agent.theme?.logo_url || agent.logo)}
                                        alt={agent.agency_name || agent.name || 'Agent Logo'}
                                        className="h-16 sm:h-32 w-auto max-w-full object-contain flex-shrink-0 transition-all duration-300 drop-shadow-sm scale-110 sm:scale-100"
                                    />
                                </div>
                            ) : (
                                <span className="text-xl sm:text-2xl font-black text-primary-600 dark:text-primary-400 uppercase tracking-tighter">
                                    {agent?.subdomain || 'Agent'}
                                </span>
                            )}
                        </div>
                    )}
                </Link>

                {/* 3. Right Side Actions */}
                <div className="flex items-center space-x-3 sm:space-x-4 lg:ml-auto z-20">
                    {/* View Site Icon Link */}
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 lg:px-3 lg:py-1.5 flex items-center gap-1.5 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 lg:hover:bg-primary-50 dark:lg:hover:bg-primary-900/20 rounded-lg transition-all border border-transparent lg:border-gray-200 dark:lg:border-gray-700 lg:hover:border-primary-100 dark:lg:hover:border-primary-800"
                        title="View Site"
                    >
                        <span className="hidden lg:inline text-xs font-bold">View Site</span>
                        <ArrowTopRightOnSquareIcon className="w-6 h-6 lg:w-4 lg:h-4" />
                    </a>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDarkMode ? (
                            <SunIcon className="w-6 h-6 lg:w-5 lg:h-5" />
                        ) : (
                            <MoonIcon className="w-6 h-6 lg:w-5 lg:h-5" />
                        )}
                    </button>

                    {/* Notification Bell */}
                    <NotificationBell />
                </div>
            </header>

            {/* Main Layout Area */}
            <div className="flex flex-1 min-h-0 relative">
                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div
                        className="absolute inset-0 bg-gray-900/50 z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`
                        absolute inset-y-0 left-0 z-20 bg-white dark:bg-dashboard-card border-r border-gray-200 dark:border-gray-700 
                        transform transition-all duration-300 lg:translate-x-0 
                        lg:static lg:block flex flex-col group
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        ${isCollapsed ? 'w-20' : 'w-64'}
                    `}
                >
                    {/* Toggle Button - Desktop Only */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex absolute -right-5 top-6 z-50 bg-white dark:bg-dashboard-card border border-gray-200 dark:border-gray-700 p-1 rounded-lg text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 shadow-sm transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                    >
                        {isCollapsed ? (
                            <ChevronRightIcon className="w-4 h-4" />
                        ) : (
                            <ChevronLeftIcon className="w-4 h-4" />
                        )}
                    </button>

                    <div className="flex flex-col h-full bg-white dark:bg-dashboard-card overflow-hidden transition-colors duration-200">
                        {/* Navigation */}
                        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                            {/* Mobile-only View Site Link */}
                            <a
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="lg:hidden flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/10 mb-4"
                            >
                                <ArrowTopRightOnSquareIcon className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-bold tracking-tight">View Public Website</span>
                            </a>

                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    title={isCollapsed ? item.name : ''}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-xl transition-all duration-200 ${isActive(item.href)
                                        ? 'bg-primary-50 dark:bg-primary-600/10 text-primary-700 dark:text-primary-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-primary-600/5'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>}
                                </Link>
                            ))}
                        </nav>

                        {/* User section */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-dashboard-card transition-colors duration-200">
                            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-2 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl transition-colors`}>
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                    {user?.first_name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                                            {user?.first_name} {user?.last_name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                                            {user?.role?.replace('_', ' ')}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleLogout}
                                title={isCollapsed ? 'Logout' : ''}
                                className={`mt-3 w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center space-x-2'} px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors`}
                            >
                                <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dashboard-dark p-4 sm:p-6 lg:p-8 relative w-full transition-colors duration-200">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
export default DashboardLayout;
