import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/Common/Logo';
import {
    ArrowLeftOnRectangleIcon,
    ChevronRightIcon,
    Squares2X2Icon,
    BuildingOfficeIcon,
    InformationCircleIcon,
    PhoneIcon,
    ArrowLeftIcon,
    CheckIcon,
    CameraIcon,
} from '@heroicons/react/24/outline';
import { PiUser } from 'react-icons/pi';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTenant } from '../../contexts/TenantContext';
import { getMediaUrl } from '../../utils/media';
import { uploadApi } from '../../services/api';
import toast from 'react-hot-toast';

/* ── Social platform icon helper ─────────────────────────────── */
const SocialIcon = ({ platform, className = 'w-5 h-5' }) => {
    const p = (platform || '').toLowerCase();
    if (p === 'facebook') return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
    );
    if (p === 'instagram') return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
    );
    if (p === 'line') return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.064-.023.134-.034.2-.034.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
    );
    if (p === 'whatsapp') return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
    );
    if (p === 'linkedin') return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
    );
    if (p === 'viber') return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.294 4.187.541 6.793.46 10.035c-.081 3.242-.19 9.32 5.7 11.078l.007.005v2.588s-.041.99.616 1.194c.779.244 1.236-.502 1.981-1.302.407-.44.97-1.086 1.397-1.58 3.846.322 6.805-.417 7.141-.529.775-.257 5.156-.814 5.87-6.637.738-6.003-.354-9.792-2.345-11.505l-.002-.004c-.563-.521-2.797-2.272-8.064-2.347 0 0-.375-.01-.868-.004h-.497zm.463 1.947h.007c.415-.007.748.002.748.002 4.346.06 6.236 1.4 6.71 1.828 1.672 1.432 2.543 4.774 1.904 9.746-.585 4.794-4.162 5.106-4.823 5.326-.278.093-2.834.708-5.998.514 0 0-2.375 2.872-3.118 3.619-.116.116-.266.157-.362.133-.133-.034-.17-.194-.168-.427.002-.163.01-4.158.01-4.158-5.012-1.492-4.715-6.563-4.648-9.328.065-2.765.653-4.988 2.115-6.427 1.93-1.766 5.607-2.045 7.23-2.072.122-.003.249-.004.382-.004l.011.248z" /></svg>
    );
    if (p === 'tiktok') return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
    );
    if (p === 'youtube') return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
    );
    if (p === 'website') return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z" /></svg>
    );
    // Default / Other
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
    );
};

/* ── Build social link URL ──────────────────────────────────── */
const getSocialUrl = (platform, value) => {
    if (!value) return null;
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    const p = (platform || '').toLowerCase();
    if (p === 'facebook') return `https://facebook.com/${value}`;
    if (p === 'instagram') return `https://instagram.com/${value}`;
    if (p === 'linkedin') return `https://linkedin.com/in/${value}`;
    if (p === 'tiktok') return `https://tiktok.com/@${value}`;
    if (p === 'youtube') return `https://youtube.com/@${value}`;
    if (p === 'line') return `https://line.me/ti/p/~${value}`;
    if (p === 'whatsapp') return `https://wa.me/${value.replace(/\D/g, '')}`;
    if (p === 'viber') return `viber://chat?number=${value.replace(/\D/g, '')}`;
    return value;
};

/* ─── Skeleton ─────────────────────────────────────────────── */
const ProfileSkeleton = () => (
    <div className="min-h-screen bg-white dark:bg-dashboard-dark flex flex-col">
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
                <div className="bg-white dark:bg-dashboard-card border border-gray-100 dark:border-white/10 rounded-[24px] p-6 flex items-center gap-6 mb-8"
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
    const { isMainDomain, agent } = useTenant();
    const navigate = useNavigate();
    const isAgent = user?.role === 'agent' || user?.role === 'sub_agent' || user?.role === 'super_admin';
    const [loading, setLoading] = useState(true);

    // activeSection is used for DESKTOP sidebar switching
    const [activeSection, setActiveSection] = useState('about');

    // mobileView handles the "page" transitions on MOBILE
    // states: 'menu', 'about', 'contact'
    const [mobileView, setMobileView] = useState('menu');

    const { updateProfile } = useAuth();
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone: user?.phone || '',
        line: user?.line || '',
        whatsapp: user?.whatsapp || '',
        viber: user?.viber || '',
        avatar: user?.avatar || ''
    });

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        const { success, error } = await updateProfile(profileForm);
        setIsSavingProfile(false);
        if (success) {
            toast.success('Profile updated successfully');
        } else {
            toast.error(error || 'Failed to update profile');
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            toast.loading('Uploading avatar...', { id: 'avatarUpload' });
            const response = await uploadApi.uploadAvatar(file);
            const avatarUrl = response.data.url;
            setProfileForm(prev => ({ ...prev, avatar: avatarUrl }));
            // Also immediately save
            await updateProfile({ ...profileForm, avatar: avatarUrl });
            toast.success('Avatar updated', { id: 'avatarUpload' });
        } catch (err) {
            toast.error('Failed to upload avatar', { id: 'avatarUpload' });
        }
    };

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 350);
        return () => clearTimeout(t);
    }, []);

    if (loading) return <ProfileSkeleton />;

    const roleLabel = user?.role === 'super_admin' ? 'Admin' : user?.role?.replace('_', ' ') || 'Guest';
    const initial = user?.first_name?.[0]?.toUpperCase() || '?';
    const googlePicture = localStorage.getItem('google_picture');

    // Parse social links
    let socialLinks = [];
    if (agent?.social_links) {
        try {
            const parsed = JSON.parse(agent.social_links);
            socialLinks = Array.isArray(parsed) ? parsed.filter(l => l.value && l.value.trim()) : [];
        } catch (e) {
            socialLinks = [];
        }
    }

    // Desktop sidebar nav
    const navItems = [
        { id: 'profile', label: 'Profile', icon: <PiUser className="w-5 h-5" /> },
        { id: 'about', label: 'About', icon: <InformationCircleIcon className="w-5 h-5" /> },
        { id: 'contact', label: 'Contact', icon: <PhoneIcon className="w-5 h-5" /> },
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

    // Shared icon-only hover button style for internal menu rows
    const menuRowClass = 'flex items-center gap-3 group py-3 px-2 rounded-xl transition-colors duration-200 w-full';

    /* ── Render Profile Content ──────────────────────────────── */
    const renderProfile = (isMobile = false) => (
        <div className="animate-fade-in-up">
            {isMobile && (
                <div className="sticky top-0 bg-white/95 dark:bg-dashboard-card/95 backdrop-blur-md border-b border-gray-100 dark:border-white/10 z-20 -mx-6 mb-6 px-4 py-2">
                    <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between relative">
                        <button
                            onClick={() => setMobileView('menu')}
                            className="flex items-center justify-center min-w-[40px] min-h-[40px] -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all"
                        >
                            <ArrowLeftIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                        </button>
                        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                            <h2 className="text-[17px] font-bold text-gray-900 dark:text-white">Profile</h2>
                        </div>
                        <div className="min-w-[40px]" />
                    </div>
                </div>
            )}

            <div className="relative mb-12">
                <div className="relative">
                    <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">PERSONAL INFORMATION</h4>
                    <div className="space-y-6 bg-slate-50/50 dark:bg-white/5 rounded-2xl p-6 border border-slate-100/50 dark:border-white/10">
                         <div>
                             <p className="text-[12px] text-slate-400 font-medium mb-1">First Name</p>
                             <p className="text-[16px] font-semibold text-slate-900 dark:text-white">{user?.first_name}</p>
                         </div>
                         <div>
                             <p className="text-[12px] text-slate-400 font-medium mb-1">Last Name</p>
                             <p className="text-[16px] font-semibold text-slate-900 dark:text-white">{user?.last_name}</p>
                         </div>
                         <div>
                             <p className="text-[12px] text-slate-400 font-medium mb-1">Email Address</p>
                             <p className="text-[16px] font-semibold text-slate-900 dark:text-white">{user?.email}</p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );

    /* ── Render About Content ────────────────────────────────── */
    const renderAbout = (isMobile = false) => (
        <div className="animate-fade-in-up">
            {/* Mobile Header with Back Button */}
            {isMobile && (
                <div className="sticky top-0 bg-white/95 dark:bg-dashboard-card/95 backdrop-blur-md border-b border-gray-100 dark:border-white/10 z-20 -mx-6 mb-6 px-4 py-2">
                    <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between relative">
                        <button
                            onClick={() => setMobileView('menu')}
                            className="flex items-center justify-center min-w-[40px] min-h-[40px] -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all"
                        >
                            <ArrowLeftIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                        </button>
                        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                            <h2 className="text-[17px] font-bold text-gray-900 dark:text-white">About</h2>
                        </div>
                        <div className="min-w-[40px]" />
                    </div>
                </div>
            )}

            <div className="relative mb-12">
                <div className="relative">
                    <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">ABOUT OUR BIO</h4>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                        {agent?.agency_name || agent?.name || 'Authorized Agent'}
                    </h1>
                    <div className="mb-4">
                        <svg width="28" height="22" viewBox="0 0 28 22" fill="currentColor" className="text-slate-300">
                            <path d="M6.2 0C10.2 0 12.4 3.5 12.4 6.5C12.4 11.5 8.2 21.5 6.2 21.5C4.2 21.5 0 11.5 0 6.5C0 3.5 2.2 0 6.2 0ZM21.8 0C25.8 0 28 3.5 28 6.5C28 11.5 23.8 21.5 21.8 21.5C19.8 21.5 15.6 11.5 15.6 6.5C15.6 3.5 17.8 0 21.8 0Z" />
                        </svg>
                    </div>
                    {agent?.description ? (
                        <div className="space-y-6">
                            <p className="text-[16px] sm:text-[17px] text-slate-600 dark:text-gray-400 leading-relaxed italic font-medium whitespace-pre-line">
                                {agent.description}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">No bio information available.</p>
                    )}
                </div>
            </div>

            {(agent?.vision || agent?.mission) && (
                <div className="space-y-6">
                    {agent?.vision && (
                        <div className="relative mb-12">
                            <div className="relative">
                                <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">ABOUT OUR VISION</h4>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                                    {agent?.agency_name || agent?.name || 'Authorized Agent'}
                                </h1>
                                <div className="mb-4">
                                    <svg width="28" height="22" viewBox="0 0 28 22" fill="currentColor" className="text-slate-300">
                                        <path d="M6.2 0C10.2 0 12.4 3.5 12.4 6.5C12.4 11.5 8.2 21.5 6.2 21.5C4.2 21.5 0 11.5 0 6.5C0 3.5 2.2 0 6.2 0ZM21.8 0C25.8 0 28 3.5 28 6.5C28 11.5 23.8 21.5 21.8 21.5C19.8 21.5 15.6 11.5 15.6 6.5C15.6 3.5 17.8 0 21.8 0Z" />
                                    </svg>
                                </div>
                                <p className="text-[18px] text-slate-600 dark:text-gray-400 leading-relaxed italic font-medium">
                                    "{agent.vision}"
                                </p>
                            </div>
                        </div>
                    )}
                    {agent?.mission && (
                        <div className="relative mb-12">
                            <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">ABOUT OUR MISSION</h4>
                            <p className="text-[16px] text-slate-700 dark:text-gray-300 leading-relaxed pl-2 font-medium">{agent.mission}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Official Agent Logo Container */}
            <div className="flex flex-col items-center justify-center mt-8 mb-12">
                <div
                    className="w-64 sm:w-72 h-28 sm:h-32 opacity-[0.12] grayscale pointer-events-none select-none"
                    style={{
                        backgroundImage: `url(${getMediaUrl(theme?.logoUrl || agent?.logo)})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
            </div>
        </div>
    );

    /* ── Render Contact Content ──────────────────────────────── */
    const renderContact = (isMobile = false) => (
        <div className="animate-fade-in-up">
            {/* Mobile Header with Back Button */}
            {isMobile && (
                <div className="sticky top-0 bg-white/95 dark:bg-dashboard-card/95 backdrop-blur-md border-b border-gray-100 dark:border-white/10 z-20 -mx-6 mb-6 px-4 py-2">
                    <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between relative">
                        <button
                            onClick={() => setMobileView('menu')}
                            className="flex items-center justify-center min-w-[40px] min-h-[40px] -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all"
                        >
                            <ArrowLeftIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                        </button>
                        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                            <h2 className="text-[17px] font-medium text-gray-900 dark:text-white">Contact</h2>
                        </div>
                        <div className="min-w-[40px]" />
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Phone & Email card */}
                {(agent?.phone || agent?.email) && (
                    <div className="relative">
                        <h4 className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.1em] mb-6">Contact Information</h4>
                        <div className="space-y-6">
                            {agent?.phone && (
                                <a href={`tel:${agent.phone}`} className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-full bg-orange-50/80 flex items-center justify-center shrink-0">
                                        <PhoneIcon className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] sm:text-[12px] text-slate-400 mb-0.5 font-medium">Direct Line</p>
                                        <p className="text-[15px] sm:text-[16px] font-medium text-slate-900 dark:text-white">{agent.phone}</p>
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Social Media Links */}
                {socialLinks.length > 0 && (
                    <div className="relative mt-8">
                        <h4 className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.1em] mb-6">Social Media</h4>
                        <div className="flex flex-col">
                            {socialLinks.map((link, idx) => {
                                const url = getSocialUrl(link.platform, link.value);
                                return (
                                    <a
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 py-4 border-b border-gray-50/50 dark:border-white/5 last:border-0 group hover:bg-slate-50/30 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                                            <SocialIcon platform={link.platform} className="w-5 h-5 text-slate-700 dark:text-gray-300" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[14px] sm:text-[15px] font-medium text-slate-900 dark:text-white mb-0.5">{link.platform}</p>
                                            <p className="text-[12px] sm:text-[13px] text-slate-400 truncate">{link.value}</p>
                                        </div>
                                        <ChevronRightIcon className="w-4 h-4 text-slate-300" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}

                {!agent?.phone && !agent?.email && socialLinks.length === 0 && (
                    <div className="bg-slate-50/50 dark:bg-white/5 rounded-[32px] p-12 text-center border border-slate-100/50 dark:border-white/10">
                        <p className="text-[15px] text-slate-400 italic font-medium">No contact information available.</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-dashboard-dark flex flex-col w-full overflow-x-hidden">
            <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-12 lg:px-20 pt-0 lg:pt-10 pb-24 lg:pb-6 flex flex-col lg:flex-row lg:gap-16 overflow-x-hidden">

                {/* ── Desktop sidebar ── */}
                <div className="hidden lg:block lg:w-[260px] lg:flex-shrink-0">
                    <h1 className="text-[24px] font-semibold text-slate-900 dark:text-white tracking-tight mb-8">Account</h1>
                    <nav className="space-y-1">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleNavClick(item.id)}
                                className={`flex items-center gap-3 group w-full py-3 px-3 rounded-xl text-left text-[15px] font-medium transition-colors duration-200
                                    ${activeSection === item.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                            >
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200
                                    ${activeSection === item.id
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-dashboard-dark'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 group-hover:bg-slate-900 group-hover:dark:bg-white/10 group-hover:text-white group-hover:dark:text-white'}`}>
                                    {item.icon}
                                </div>
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="hidden lg:block w-px bg-gray-100 self-stretch flex-shrink-0" />

                {/* ── Main Content Area ── */}
                <div className="flex-1 min-w-0">
                    {/* Desktop Content */}
                    <div className="hidden lg:block">
                        <div className="flex items-center mb-8">
                            <h2 className="text-[20px] font-semibold text-slate-900 dark:text-white capitalize">{activeSection}</h2>
                        </div>
                        {activeSection === 'profile' && renderProfile()}
                        {activeSection === 'about' && renderAbout()}
                        {activeSection === 'contact' && renderContact()}
                    </div>

                    {/* Mobile Content */}
                    <div className="lg:hidden">
                        {mobileView === 'menu' && (
                            <div className="animate-fade-in-up pt-10">
                                <h1 className="text-[24px] font-semibold text-slate-900 dark:text-white tracking-tight mb-8">Account</h1>

                                {/* Profile Header */}
                                <div className="flex flex-col items-center mb-10 pt-4 relative">
                                    {/* Avatar */}
                                    <div className="w-28 h-28 rounded-full bg-primary-50 dark:bg-primary-900/30 border-4 border-white dark:border-dashboard-card flex items-center justify-center flex-shrink-0 overflow-hidden mb-5">
                                        {googlePicture ? (
                                            <img src={googlePicture} alt="Profile" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                                        ) : (
                                            <span className="text-[44px] font-bold text-primary-600">{initial}</span>
                                        )}
                                    </div>
                                    {/* Text */}
                                    <div className="flex flex-col items-center text-center px-4 w-full">
                                        <h3 className="text-[18px] font-semibold text-slate-900 dark:text-white leading-tight truncate w-full">
                                            {user?.first_name} {user?.last_name}
                                        </h3>
                                    </div>
                                </div>

                                {/* Menu List */}
                                <div className="space-y-4">
                                    {/* Profile Row */}
                                    <button onClick={() => setMobileView('profile')} className={menuRowClass}>
                                        <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:bg-slate-900 group-hover:dark:bg-white/10">
                                            <PiUser className="w-5 h-5 text-slate-600 group-hover:text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-[15px] leading-tight text-gray-900 dark:text-white">Profile</p>
                                        </div>
                                        <ChevronRightIcon className="w-4 h-4 text-gray-300 ml-auto group-hover:translate-x-0.5 transition-transform" />
                                    </button>

                                    {/* About Row */}
                                    <button onClick={() => setMobileView('about')} className={menuRowClass}>
                                        <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:bg-slate-900 group-hover:dark:bg-white/10">
                                            <InformationCircleIcon className="w-5 h-5 text-slate-600 group-hover:text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-[15px] leading-tight text-gray-900 dark:text-white">About</p>
                                        </div>
                                        <ChevronRightIcon className="w-4 h-4 text-gray-300 ml-auto group-hover:translate-x-0.5 transition-transform" />
                                    </button>

                                    {/* Contact Row */}
                                    <button onClick={() => setMobileView('contact')} className={menuRowClass}>
                                        <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:bg-slate-900 group-hover:dark:bg-white/10">
                                            <PhoneIcon className="w-5 h-5 text-slate-600 group-hover:text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-[15px] leading-tight text-gray-900 dark:text-white">Contact</p>
                                        </div>
                                        <ChevronRightIcon className="w-4 h-4 text-gray-300 ml-auto group-hover:translate-x-0.5 transition-transform" />
                                    </button>

                                    {/* Dashboard Row */}
                                    {isAgent && (
                                        <div className="pt-2">
                                            <button
                                                onClick={() => navigate(user?.role === 'super_admin' ? '/admin' : '/agent')}
                                                className={menuRowClass}
                                            >
                                                <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:bg-slate-900">
                                                    <Squares2X2Icon className="w-5 h-5 text-slate-600 group-hover:text-white" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-semibold text-[15px] leading-tight text-gray-900 dark:text-white">Dashboard</p>
                                                </div>
                                                <ChevronRightIcon className="w-4 h-4 text-gray-300 ml-auto group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Logout */}
                                    <div className="border-t border-gray-100 dark:border-white/10 pt-5 mt-2">
                                        <button onClick={logout} className={`${menuRowClass} text-rose-600`}>
                                            <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:bg-rose-600">
                                                <ArrowLeftOnRectangleIcon className="w-5 h-5 text-rose-500 group-hover:text-white" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-[15px] leading-tight">Log out</p>
                                            </div>
                                            <ChevronRightIcon className="w-4 h-4 text-rose-300 ml-auto group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {mobileView === 'profile' && renderProfile(true)}
                        {mobileView === 'about' && renderAbout(true)}
                        {mobileView === 'contact' && renderContact(true)}
                    </div>

                    {/* Footer Logo */}
                    {isMainDomain && mobileView === 'menu' && (
                        <div className="lg:hidden flex flex-col items-center justify-center pt-20 pb-4 opacity-10">
                            <Link to="/" className="flex flex-col items-center gap-3">
                                <div
                                    className="w-56 h-56 bg-[length:100%_auto] bg-no-repeat bg-center flex items-center justify-center"
                                    style={theme?.logoUrl ? { backgroundImage: `url(${getMediaUrl(theme.logoUrl)})` } : {}}
                                >
                                    {!theme?.logoUrl && <Logo className="w-56 h-56" style={{ color: 'var(--primary-color)' }} />}
                                </div>
                                {!theme?.logoUrl && <span className="text-lg font-bold text-gray-700 tracking-tight">StayNest</span>}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
