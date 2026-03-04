import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/Common/Logo';
import {
    UserCircleIcon,
    ArrowLeftOnRectangleIcon,
    ChevronRightIcon,
    Squares2X2Icon,
    BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getMediaUrl } from '../../utils/media';

/* ─── Skeleton ─────────────────────────────────────────────── */
const ProfileSkeleton = () => (
    <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-12 lg:px-20 pt-10 pb-6 flex flex-col lg:flex-row lg:gap-16">
            {/* Left sidebar skeleton  — desktop only */}
            <div className="hidden lg:block lg:w-[260px] lg:flex-shrink-0">
                <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse mb-8" />
                <div className="space-y-2">
                    {[1, 2].map(i => (
                        <div key={i} className="flex items-center gap-3 py-3 px-3">
                            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                            <div className="h-4 w-24 bg-gray-200 rounded-lg animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block lg:w-px bg-gray-100 self-stretch flex-shrink-0" />

            {/* Right content skeleton */}
            <div className="flex-1">
                <div className="h-7 w-32 bg-gray-200 rounded-lg animate-pulse mb-8" />
                <div className="bg-white border border-gray-100 rounded-[24px] p-6 flex items-center gap-6 mb-8"
                    style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.04), 0 2px 24px rgba(0,0,0,0.06)' }}>
                    <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                    <div className="flex flex-col gap-2">
                        <div className="h-6 w-36 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="h-4 w-20 bg-gray-100 rounded-lg animate-pulse" />
                    </div>
                </div>
                <div className="h-px bg-gray-100 mb-6" />
                <div className="h-4 w-32 bg-gray-100 rounded-lg animate-pulse" />
            </div>
        </div>
    </div>
);

/* ─── Component ─────────────────────────────────────────────── */
const UserProfile = () => {
    const { user, logout } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const isAgent = user?.role === 'agent' || user?.role === 'sub_agent' || user?.role === 'super_admin';
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('about');

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 350);
        return () => clearTimeout(t);
    }, []);

    if (loading) return <ProfileSkeleton />;

    const roleLabel = user?.role === 'super_admin' ? 'Admin' : user?.role?.replace('_', ' ') || 'Guest';
    const initial = user?.first_name?.[0]?.toUpperCase() || '?';

    // Desktop sidebar nav: About + Dashboard for agents (no View profile)
    const navItems = [
        { id: 'about', label: 'About', icon: <UserCircleIcon className="w-5 h-5" /> },
        { id: 'properties', label: 'Properties', icon: <BuildingOfficeIcon className="w-5 h-5" /> },
        ...(isAgent ? [
            { id: 'dashboard', label: 'Dashboard', icon: <Squares2X2Icon className="w-5 h-5" /> },
        ] : []),
    ];

    const handleNavClick = (id) => {
        if (id === 'dashboard') {
            navigate(user?.role === 'super_admin' ? '/admin' : '/agent');
        } else if (id === 'properties') {
            navigate('/list');
        } else {
            setActiveSection(id);
        }
    };

    // Shared icon-only hover button style (no row bg)
    const menuRowClass = 'flex items-center gap-3 group py-3 px-2 rounded-xl transition-colors duration-200 w-full';

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-12 lg:px-20 pt-10 pb-6 flex flex-col lg:flex-row lg:gap-16">

                {/* ── Left sidebar — desktop only ── */}
                <div className="hidden lg:block lg:w-[260px] lg:flex-shrink-0">
                    <h1 className="text-[24px] font-semibold text-slate-900 tracking-tight mb-8">Profile</h1>

                    <nav className="space-y-1">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleNavClick(item.id)}
                                className={`flex items-center gap-3 group w-full py-3 px-3 rounded-xl text-left text-[15px] font-medium transition-colors duration-200
                                    ${activeSection === item.id && item.id === 'about' ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                {/* Icon circle: dark on active/hover, light otherwise */}
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200
                                    ${activeSection === item.id && item.id === 'about'
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-gray-100 text-gray-600 group-hover:bg-slate-900 group-hover:text-white'}`}>
                                    {item.icon}
                                </div>
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* ── Vertical divider — desktop only ── */}
                <div className="hidden lg:block w-px bg-gray-100 self-stretch flex-shrink-0" />

                {/* ── Right content ── */}
                <div className="flex-1 min-w-0">
                    {/* About heading — desktop only */}
                    <div className="hidden lg:flex items-center mb-8">
                        <h2 className="text-[20px] font-semibold text-slate-900">About</h2>
                    </div>
                    {/* Profile title — mobile only */}
                    <h1 className="text-[24px] font-semibold text-slate-900 tracking-tight mb-8 lg:hidden">Profile</h1>

                    {/* Profile card */}
                    <div
                        className="bg-white border border-gray-100 rounded-[24px] p-6 lg:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6"
                        style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.04), 0 2px 24px rgba(0,0,0,0.06)' }}
                    >
                        <div className="w-20 h-20 rounded-full bg-primary-50 border-4 border-primary-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                            {user?.first_name ? (
                                <span className="text-3xl font-bold text-primary-700">{initial}</span>
                            ) : (
                                <UserCircleIcon className="w-12 h-12 text-primary-400" />
                            )}
                        </div>
                        <div className="text-center sm:text-left">
                            <h3 className="text-xl lg:text-[18px] font-bold text-gray-900 leading-tight">
                                {user?.first_name} {user?.last_name}
                            </h3>
                            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold capitalize">
                                {roleLabel}
                            </span>
                            {user?.email && (
                                <p className="mt-3 text-sm text-gray-400 font-medium">{user.email}</p>
                            )}
                        </div>
                    </div>

                    {/* Mobile: Dashboard link (agents only) */}
                    {isAgent && (
                        <Link
                            to={user?.role === 'super_admin' ? '/admin' : '/agent'}
                            className={`${menuRowClass} text-gray-800 lg:hidden mb-2`}
                        >
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:bg-slate-900">
                                <Squares2X2Icon className="w-5 h-5 text-slate-600 transition-colors duration-200 group-hover:text-white" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-[15px] leading-tight">Dashboard</p>
                                <p className="text-xs text-gray-400 mt-0.5">Manage listings and bookings</p>
                            </div>
                            <ChevronRightIcon className="w-4 h-4 text-gray-300 ml-auto group-hover:translate-x-0.5 transition-transform duration-200" />
                        </Link>
                    )}

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-5 mt-2">
                        <button
                            type="button"
                            onClick={logout}
                            className={`${menuRowClass} text-rose-600`}
                        >
                            <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:bg-rose-600">
                                <ArrowLeftOnRectangleIcon className="w-5 h-5 text-rose-500 transition-colors duration-200 group-hover:text-white" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-[15px] leading-tight">Log out</p>
                                <p className="text-xs text-rose-400 mt-0.5">End your current session</p>
                            </div>
                            <ChevronRightIcon className="w-4 h-4 text-rose-300 ml-auto group-hover:translate-x-0.5 transition-transform duration-200" />
                        </button>
                    </div>

                    {/* Mobile-only logo — below logout, centered, larger */}
                    <div className="lg:hidden flex flex-col items-center justify-center pt-16 pb-2 opacity-10">
                        <Link to="/" className="flex flex-col items-center gap-3">
                            <div
                                className="w-56 h-56 bg-[length:100%_auto] bg-no-repeat bg-center flex items-center justify-center"
                                style={theme?.logoUrl ? { backgroundImage: `url(${getMediaUrl(theme.logoUrl)})` } : {}}
                            >
                                {!theme?.logoUrl && (
                                    <Logo className="w-56 h-56" style={{ color: 'var(--primary-color)' }} />
                                )}
                            </div>
                            {!theme?.logoUrl && (
                                <span className="text-lg font-bold text-gray-700 tracking-tight">StayNest</span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default UserProfile;
