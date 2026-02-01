import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../Common/NotificationBell';
import BannerDisplay from '../Common/BannerDisplay';
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
} from '@heroicons/react/24/outline';

const DashboardLayout = () => {
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(false); // Mobile toggle
    const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse

    // Separate mobile open state from logic to avoid naming conflicts with previous code if any
    const sidebarOpen = leftSidebarOpen;
    const setSidebarOpen = setLeftSidebarOpen;

    const { user, logout, isSuperAdmin, isAgent } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Navigation items based on role
    const agentNavigation = [
        { name: 'Dashboard', href: '/agent', icon: HomeIcon },
        { name: 'Listings', href: '/agent/listings', icon: BuildingOfficeIcon },
        { name: 'Sub-Agents', href: '/agent/sub-agents', icon: UsersIcon },
        { name: 'Theme', href: '/agent/theme', icon: SwatchIcon },
        { name: 'Notifications', href: '/agent/notifications', icon: BellIcon },
        { name: 'Banners', href: '/agent/banners', icon: MegaphoneIcon },
    ];

    const adminNavigation = [
        { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
        { name: 'Agents', href: '/admin/agents', icon: UsersIcon },
        { name: 'Subscription Plans', href: '/admin/plans', icon: CreditCardIcon },
        { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
        { name: 'Banners', href: '/admin/banners', icon: MegaphoneIcon },
    ];

    const navigation = isSuperAdmin ? adminNavigation : agentNavigation;

    const isActive = (path) => {
        if (path === '/agent' || path === '/admin') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            {/* Top Navigation Bar */}
            <header className="h-16 flex-none bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4 relative">
                <div className="flex items-center space-x-4">
                    {/* Mobile Sidebar Toggle */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                    >
                        {sidebarOpen ? (
                            <XMarkIcon className="w-6 h-6" />
                        ) : (
                            <Bars3Icon className="w-6 h-6" />
                        )}
                    </button>

                    {/* Logo (Moved to Header) */}
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                            <BuildingOfficeIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text hidden sm:block">Super</span>
                    </Link>

                    {/* Divider */}

                </div>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-4">
                    <Link
                        to="/"
                        className="text-sm text-gray-500 hover:text-primary-600 transition-colors hidden sm:block"
                    >
                        View Site
                    </Link>

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
                        absolute inset-y-0 left-0 z-20 bg-white border-r border-gray-200 
                        transform transition-all duration-300 lg:translate-x-0 
                        lg:static lg:block flex flex-col group
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        ${isCollapsed ? 'w-20' : 'w-64'}
                    `}
                >
                    {/* Toggle Button - Desktop Only */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex absolute -right-5 top-6 z-50 bg-white border border-gray-200 p-1 rounded-lg text-gray-500 hover:text-primary-600 shadow-sm transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                    >
                        {isCollapsed ? (
                            <ChevronRightIcon className="w-4 h-4" />
                        ) : (
                            <ChevronLeftIcon className="w-4 h-4" />
                        )}
                    </button>

                    <div className="flex flex-col h-full bg-white overflow-hidden">
                        {/* Navigation */}
                        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    title={isCollapsed ? item.name : ''}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-xl transition-all duration-200 ${isActive(item.href)
                                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.name}</span>}
                                </Link>
                            ))}
                        </nav>

                        {/* User section */}
                        <div className="p-4 border-t border-gray-100 bg-white">
                            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-2 py-2 bg-gray-50 rounded-xl`}>
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                    {user?.first_name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {user?.first_name} {user?.last_name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate capitalize">
                                            {user?.role?.replace('_', ' ')}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleLogout}
                                title={isCollapsed ? 'Logout' : ''}
                                className={`mt-3 w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center space-x-2'} px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors`}
                            >
                                <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span className="font-medium">Logout</span>}
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8 relative w-full">
                    <BannerDisplay />
                    <Outlet />
                </main>
            </div>
        </div>
    );

};
export default DashboardLayout;
