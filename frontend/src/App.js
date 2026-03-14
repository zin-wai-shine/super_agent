import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';

// Layouts
import PublicLayout from './components/Layout/PublicLayout';
import DashboardLayout from './components/Layout/DashboardLayout';

// Public Pages
import HomePage from './pages/Public/HomePage';
import ListingsPage from './pages/Public/ListingsPage';
import ProjectsPage from './pages/Public/ProjectsPage';
import ListingDetailPage from './pages/Public/ListingDetailPage';
import MobileSearchPage from './pages/Public/MobileSearchPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import BannerDetail from './pages/Public/BannerDetail';
import UserProfile from './pages/Public/UserProfile';
import GoogleCallback from './pages/Auth/GoogleCallback';
import BookAppointment from './pages/Public/BookAppointment';
import MyBookings from './pages/Public/MyBookings';
import SavedListingsPage from './pages/Public/SavedListingsPage';

// Agent Pages
import AgentDashboard from './pages/Agent/AgentDashboard';
import AgentListings from './pages/Agent/AgentListings';
import CreateListing from './pages/Agent/CreateListing';
import EditListing from './pages/Agent/EditListing';
import SubAgents from './pages/Agent/SubAgents';
import ThemeSettings from './pages/Agent/ThemeSettings';
import AgentSettings from './pages/Agent/AgentSettings';
import AppointmentManagement from './pages/Agent/AppointmentManagement';
import Users from './pages/Agent/Users';
import DeveloperManagement from './pages/Agent/DeveloperManagement';
import ProjectManagement from './pages/Agent/ProjectManagement';

// Super Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AgentManagement from './pages/Admin/AgentManagement';
import SubscriptionPlans from './pages/Admin/SubscriptionPlans';
import NotificationCenter from './pages/Admin/NotificationCenter';
import BannerManagement from './pages/Admin/BannerManagement';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const { isMainDomain } = useTenant();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role-based access
    const userRole = user?.role?.toLowerCase().trim();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase().trim());

    if (allowedRoles.length > 0 && !normalizedAllowedRoles.includes(userRole)) {
        console.warn('Access denied: Role mismatch', { expected: allowedRoles, got: userRole, path: location.pathname });
        return <Navigate to="/" replace />;
    }

    // Domain-based access (only if we're sure and NOT a super admin)
    if (location.pathname.startsWith('/admin') && !isMainDomain && isMainDomain !== undefined && userRole !== 'super_admin') {
        console.warn('Access denied: Admin path on tenant domain', { isMainDomain, userRole });
        return <Navigate to="/" replace />;
    }

    if (location.pathname.startsWith('/dashboard') && isMainDomain && user?.role === 'super_admin') {
        // Super admin on main domain can access dashboard routes if needed, 
        // or we can keep it restricted. For now, let's allow it if it exists.
    }

    return children;
};

// Guest Route Component (prevent logged in users from visiting login/register)
const GuestRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/Common/ScrollToTop';

function App() {
    return (
        <WebSocketProvider>
            <ScrollToTop />
            <Toaster position="top-center" reverseOrder={false} />
            <AppRoutes />
        </WebSocketProvider>
    );
}

const AppRoutes = () => {
    const { isMainDomain, agent } = useTenant();
    console.log('AppRoutes State:', { isMainDomain, agent });

    // Handle invalid subdomain access
    if (!isMainDomain && !agent) {
        return (
            <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 overflow-hidden">
                {/* Modern Background Decorations */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10 w-full max-w-md animate-fade-up">
                    {/* Branded Logo Header */}
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white shadow-sm">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="font-bold text-gray-900 tracking-tight">Super <span className="text-primary-600">Real Estate</span></span>
                        </div>
                    </div>

                    {/* Main Error Card */}
                    <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center">
                        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-8">
                            <div className="absolute inset-0 bg-primary-100 rounded-3xl rotate-6 opacity-50"></div>
                            <div className="absolute inset-0 bg-primary-500/10 rounded-3xl -rotate-6"></div>
                            <div className="relative bg-white rounded-2xl shadow-sm w-full h-full flex items-center justify-center text-3xl">
                                <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Site Not Found</h1>
                        <p className="text-gray-600 mb-10 leading-relaxed text-sm">
                            The agent portal you requested doesn't exist or might have moved.
                            If you're an agent, check your subdomain settings in the master portal.
                        </p>

                        <div className="space-y-4">
                            <a
                                href={`http://${process.env.REACT_APP_MAIN_DOMAIN || 'haizo.it.com'}`}
                                className="group relative flex items-center justify-center w-full px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all duration-300 shadow-xl shadow-gray-200 hover:shadow-gray-300 transform hover:-translate-y-1 overflow-hidden"
                            >
                                <span className="relative z-10">Back to Platform</span>
                                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/10 opacity-40 group-hover:animate-shimmer" style={{ animation: 'shimmer 1.5s infinite' }}></div>
                            </a>

                            <div className="pt-4">
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Powered by Haizo Enterprise</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer decorative text */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-xs">Error Code: 404_AGENT_TENANT_NOT_FOUND</p>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes shimmer {
                        0% { transform: translateX(-150%) skewX(-12deg); }
                        100% { transform: translateX(250%) skewX(-12deg); }
                    }
                `}} />
            </div>
        );
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
                <Route index element={<ListingsPage />} />
                <Route path="listings" element={<ListingsPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="listings/:id" element={<ListingDetailPage />} />
                <Route path="banners/:id" element={<BannerDetail />} />
                <Route path="search" element={<MobileSearchPage />} />
                <Route
                    path="profile"
                    element={
                        <ProtectedRoute>
                            <UserProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="my-bookings"
                    element={
                        <ProtectedRoute>
                            <MyBookings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="saved-listings"
                    element={
                        <ProtectedRoute>
                            <SavedListingsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="login"
                    element={
                        <GuestRoute>
                            <LoginPage />
                        </GuestRoute>
                    }
                />
                <Route
                    path="register"
                    element={
                        <GuestRoute>
                            <RegisterPage />
                        </GuestRoute>
                    }
                />
                <Route path="auth/google/callback" element={<GoogleCallback />} />
            </Route>

            {/* Agent Dashboard Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['agent', 'sub_agent']}>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<AgentDashboard />} />
                <Route path="listings" element={<AgentListings />} />
                <Route path="listings/new" element={<CreateListing />} />
                <Route path="listings/:id/edit" element={<EditListing />} />
                <Route path="appointments" element={<AppointmentManagement />} />
                <Route path="sub-agents" element={<SubAgents />} />
                <Route path="users" element={<Users />} />
                <Route path="developers" element={<DeveloperManagement />} />
                <Route path="projects" element={<ProjectManagement />} />
                <Route path="theme" element={<ThemeSettings />} />
                <Route path="settings" element={<AgentSettings />} />
                <Route path="notifications" element={<NotificationCenter />} />
                <Route path="banners" element={<BannerManagement />} />
            </Route>

            {/* Super Admin Routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<AdminDashboard />} />
                <Route path="agents" element={<AgentManagement />} />
                <Route path="plans" element={<SubscriptionPlans />} />
                <Route path="notifications" element={<NotificationCenter />} />
                <Route path="banners" element={<BannerManagement />} />
            </Route>

            {/* Legacy redirect and fallback */}
            <Route path="/agent/*" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default App;
