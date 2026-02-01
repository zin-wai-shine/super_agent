import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
} from '@heroicons/react/24/outline';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
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
    ];

    const adminNavigation = [
        { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
        { name: 'Agents', href: '/admin/agents', icon: UsersIcon },
        { name: 'Subscription Plans', href: '/admin/plans', icon: CreditCardIcon },
    ];

    const navigation = isSuperAdmin ? adminNavigation : agentNavigation;

    const isActive = (path) => {
        if (path === '/agent' || path === '/admin') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
                        <Link to="/" className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                                <BuildingOfficeIcon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold gradient-text">Super</span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-100"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.href)
                                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-primary-600' : ''}`} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {user?.first_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <p className="text-xs text-gray-500 truncate capitalize">
                                    {user?.role?.replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="mt-3 w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-72">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                        >
                            <Bars3Icon className="w-6 h-6" />
                        </button>

                        <div className="flex-1 lg:ml-0 ml-4">
                            <h1 className="text-lg font-semibold text-gray-900 capitalize">
                                {location.pathname.split('/').pop() || 'Dashboard'}
                            </h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link
                                to="/"
                                className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                            >
                                View Site
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
