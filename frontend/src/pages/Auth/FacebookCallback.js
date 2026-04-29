import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const FacebookCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const params = new URLSearchParams(location.search);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            const picture = params.get('picture');

            if (accessToken && refreshToken) {
                // Save tokens to localStorage
                localStorage.setItem('access_token', accessToken);
                localStorage.setItem('refresh_token', refreshToken);
                // Save facebook picture if present
                if (picture) {
                    localStorage.setItem('google_picture', picture);
                } else {
                    localStorage.removeItem('google_picture');
                }

                try {
                    // Fetch user info using the new token
                    const response = await api.get('/me');
                    const user = response.data;

                    // Update AuthContext state
                    if (loginWithToken) {
                        loginWithToken(user);
                    }

                    // Redirect based on role
                    if (user.role === 'super_admin') {
                        navigate('/admin');
                    } else if (user.role === 'agent' || user.role === 'sub_agent') {
                        navigate('/dashboard');
                    } else {
                        navigate('/');
                    }
                } catch (error) {
                    console.error('Failed to fetch user profile after Facebook login:', error);
                    navigate('/login?error=facebook_auth_failed');
                }
            } else {
                console.error('No tokens found in Facebook callback');
                navigate('/login?error=no_tokens');
            }
        };

        handleCallback();
    }, [location, navigate, loginWithToken]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900">Completing sign in...</h2>
                <p className="text-gray-500 mt-2">Please wait while we set up your session.</p>
            </div>
        </div>
    );
};

export default FacebookCallback;
