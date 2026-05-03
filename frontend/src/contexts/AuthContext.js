import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (err) {
            console.error('Error parsing user from localStorage:', err);
            return null;
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [savedListingIds, setSavedListingIds] = useState([]);

    // Helper to fetch saved listings
    const fetchSavedListings = useCallback(async () => {
        try {
            const response = await api.get('/saved-listings');
            setSavedListingIds((response.data || []).map(l => String(l.id)));
        } catch (err) {
            console.error('Failed to fetch global saved listings', err);
        }
    }, []);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            const startTime = Date.now();
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await api.get('/me');
                    const userData = response.data;
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                    await fetchSavedListings();
                } catch (err) {
                    // Only clear session if the error is 401 (Unauthorized)
                    if (err.response?.status === 401) {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        localStorage.removeItem('google_picture');
                        localStorage.removeItem('user');
                        setUser(null);
                        setSavedListingIds([]);
                    }
                }
            } else {
                setUser(null);
                setSavedListingIds([]);
                localStorage.removeItem('user');
            }
            
            setLoading(false);
        };
        initAuth();
    }, [fetchSavedListings]);

    const login = useCallback(async (email, password) => {
        try {
            setError(null);
            const response = await api.post('/auth/login', { email, password });
            const { access_token, refresh_token, user } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            await fetchSavedListings();

            return { success: true, user };
        } catch (err) {
            const message = err.response?.data?.error || 'Login failed';
            setError(message);
            return { success: false, error: message };
        }
    }, [fetchSavedListings]);

    const register = useCallback(async (userData) => {
        try {
            setError(null);
            const response = await api.post('/auth/register', userData);
            const { access_token, refresh_token, user } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            await fetchSavedListings();

            return { success: true, user };
        } catch (err) {
            const message = err.response?.data?.error || 'Registration failed';
            setError(message);
            return { success: false, error: message };
        }
    }, [fetchSavedListings]);

    const loginWithToken = useCallback((userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        fetchSavedListings();
    }, [fetchSavedListings]);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('google_picture');
        localStorage.removeItem('user');
        setUser(null);
        setSavedListingIds([]);
    }, []);

    const updateProfile = useCallback(async (data) => {
        try {
            const response = await api.put('/me', data);
            const userData = response.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Update failed' };
        }
    }, []);

    const changePassword = useCallback(async (currentPassword, newPassword) => {
        try {
            await api.put('/me/password', { current_password: currentPassword, new_password: newPassword });
            const response = await api.get('/me');
            const userData = response.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Password change failed' };
        }
    }, []);

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === 'super_admin',
        isAgent: user?.role === 'agent',
        isSubAgent: user?.role === 'sub_agent',
        savedListingIds,
        setSavedListingIds,
        login,
        loginWithToken,
        register,
        logout,
        updateProfile,
        changePassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
