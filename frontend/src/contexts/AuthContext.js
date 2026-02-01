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
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await api.get('/me');
                    setUser(response.data);
                } catch (err) {
                    // Token expired or invalid
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            setError(null);
            const response = await api.post('/auth/login', { email, password });
            const { access_token, refresh_token, user } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            setUser(user);

            return { success: true, user };
        } catch (err) {
            const message = err.response?.data?.error || 'Login failed';
            setError(message);
            return { success: false, error: message };
        }
    }, []);

    const register = useCallback(async (userData) => {
        try {
            setError(null);
            const response = await api.post('/auth/register', userData);
            const { access_token, refresh_token, user } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            setUser(user);

            return { success: true, user };
        } catch (err) {
            const message = err.response?.data?.error || 'Registration failed';
            setError(message);
            return { success: false, error: message };
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    }, []);

    const updateProfile = useCallback(async (data) => {
        try {
            const response = await api.put('/me', data);
            setUser(response.data);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Update failed' };
        }
    }, []);

    const changePassword = useCallback(async (currentPassword, newPassword) => {
        try {
            await api.put('/me/password', { current_password: currentPassword, new_password: newPassword });
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
        login,
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
