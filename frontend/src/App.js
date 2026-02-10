import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';

// Layouts
import PublicLayout from './components/Layout/PublicLayout';
import DashboardLayout from './components/Layout/DashboardLayout';

// Public Pages
import HomePage from './pages/Public/HomePage';
import ListingsPage from './pages/Public/ListingsPage';
import ListingDetailPage from './pages/Public/ListingDetailPage';
import MobileSearchPage from './pages/Public/MobileSearchPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import BannerDetail from './pages/Public/BannerDetail';
import UserProfile from './pages/Public/UserProfile';
import BookAppointment from './pages/Public/BookAppointment';
import MyBookings from './pages/Public/MyBookings';

// Agent Pages
import AgentDashboard from './pages/Agent/AgentDashboard';
import AgentListings from './pages/Agent/AgentListings';
import CreateListing from './pages/Agent/CreateListing';
import EditListing from './pages/Agent/EditListing';
import SubAgents from './pages/Agent/SubAgents';
import ThemeSettings from './pages/Agent/ThemeSettings';
import AgentSettings from './pages/Agent/AgentSettings';
import AppointmentManagement from './pages/Agent/AppointmentManagement';

// Super Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AgentManagement from './pages/Admin/AgentManagement';
import SubscriptionPlans from './pages/Admin/SubscriptionPlans';
import NotificationCenter from './pages/Admin/NotificationCenter';
import BannerManagement from './pages/Admin/BannerManagement';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth();
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

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <WebSocketProvider>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="listings" element={<ListingsPage />} />
                    <Route path="listings/:id" element={<ListingDetailPage />} />
                    <Route
                        path="listings/:id/book"
                        element={
                            <ProtectedRoute>
                                <BookAppointment />
                            </ProtectedRoute>
                        }
                    />
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
                </Route>

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />


                {/* Agent Dashboard Routes */}
                <Route
                    path="/agent"
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

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </WebSocketProvider>
    );
}

export default App;
