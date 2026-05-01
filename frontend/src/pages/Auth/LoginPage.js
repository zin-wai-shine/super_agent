import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { BuildingOfficeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useTenant } from '../../contexts/TenantContext';
import { getMediaUrl } from '../../utils/media';
import api from '../../services/api';


const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, error: authError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { isMainDomain, agent } = useTenant();

    const from = location.state?.from?.pathname || null;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        const result = await login(data.email, data.password);
        setLoading(false);

        if (result.success) {
            // Redirect based on role
            const role = result.user.role?.toLowerCase().trim();
            if (from) {
                navigate(from, { replace: true });
            } else if (role === 'super_admin') {
                navigate('/admin');
            } else if (role === 'agent' || role === 'sub_agent') {
                const agent = result.user.agent;
                if (agent && agent.subdomain) {
                    const currentHost = window.location.hostname;
                    const mainDomain = process.env.REACT_APP_MAIN_DOMAIN || 'srv1534108.hstgr.cloud';
                    const agentHost = agent.custom_domain || `${agent.subdomain}.${mainDomain}`;

                    if (currentHost !== agentHost) {
                        const protocol = window.location.protocol;
                        const port = window.location.port ? `:${window.location.port}` : '';
                        window.location.href = `${protocol}//${agentHost}${port}/dashboard`;
                        return;
                    }
                }
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        } else {
            console.error('Login failed:', result.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 md:py-12">
            <div className="w-full max-w-md">
                {/* Logo — mobile: slightly larger */}
                <Link to="/" className="flex items-center justify-center mb-2 md:mb-4">
                    {!isMainDomain ? (
                        (agent?.theme?.logo_url || agent?.logo) ? (
                            <img
                                src={getMediaUrl(agent.theme?.logo_url || agent.logo)}
                                alt={agent.agency_name || agent.name || 'Agent Logo'}
                                className="object-contain transition-all duration-300"
                                style={{
                                    height: `${((agent?.theme?.page_logo_height || 100) / 100) * 80}px`,
                                    width: 'auto',
                                }}
                            />
                        ) : (
                            <span className="text-[28px] md:text-2xl font-black text-primary-600 uppercase tracking-tighter">
                                {agent?.subdomain || 'Agent'}
                            </span>
                        )
                    ) : (
                        <>
                            <div className="w-14 h-14 md:w-12 md:h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                                <BuildingOfficeIcon className="w-8 h-8 md:w-7 md:h-7 text-white" />
                            </div>
                            <span className="text-[26px] md:text-2xl font-bold gradient-text ml-3">
                                Super
                            </span>
                        </>
                    )}
                </Link>

                {/* Card — mobile: larger fonts and inputs; md: default */}
                <div className="p-6 md:p-8">
                    <div className="text-center mb-6 md:mb-8">
                        <h1 className="text-[28px] md:text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
                        <p className="text-base md:text-sm text-gray-500">Sign in to your account</p>
                    </div>

                    {authError && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 animate-fade-in text-left">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                            <p className="text-[15px] md:text-sm font-medium text-red-600">{authError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 md:space-y-6">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-base md:text-sm font-medium text-gray-700 mb-2">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                className={`w-full px-4 py-3 md:py-2 text-base md:text-sm min-h-[52px] md:min-h-[44px] bg-white border rounded-full border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                                placeholder="you@example.com"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-base md:text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    className={`w-full px-4 py-3 md:py-2 pr-12 text-base md:text-sm min-h-[52px] md:min-h-[44px] bg-white border rounded-full border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                                    placeholder="••••••••"
                                    {...register('password', {
                                        required: 'Password is required',
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit — no shadow, soft hover only; mobile: taller, larger text */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex items-center justify-center px-4 min-h-[52px] md:min-h-[42px] text-base md:text-sm font-semibold text-white rounded-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-none hover:shadow-none transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign in'
                            )}
                        </button>

                        {/* Social Login Buttons */}
                        <div className="relative my-5 md:my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-3 bg-gray-50 md:bg-white text-base md:text-sm text-gray-500">Or continue with</span>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            {/* 
                            <a
                                href={`${api.defaults.baseURL.startsWith('http') ? api.defaults.baseURL : window.location.origin + api.defaults.baseURL}/auth/facebook?state=${window.location.host}`}
                                className="flex items-center justify-center gap-3 w-full min-h-[52px] md:min-h-[44px] py-3 px-4 text-base md:text-sm rounded-full border border-gray-300 bg-white text-gray-900 font-medium hover:bg-gray-50 transition-colors shadow-none"
                            >
                                <svg className="w-5 h-5 flex-shrink-0 text-[#1877F2]" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                <span>Continue with Facebook</span>
                            </a>
                            */}
                            
                            <a
                                href={`${api.defaults.baseURL.startsWith('http') ? api.defaults.baseURL : window.location.origin + api.defaults.baseURL}/auth/google?state=${window.location.host}`}
                                className="flex items-center justify-center gap-3 w-full min-h-[52px] md:min-h-[44px] py-3 px-4 text-base md:text-sm rounded-full border border-gray-300 bg-white text-gray-900 font-medium hover:bg-gray-50 transition-colors shadow-none"
                            >
                                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden>
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>Continue with Google</span>
                            </a>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-base md:text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
