import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { BuildingOfficeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useTenant } from '../../contexts/TenantContext';
import { getMediaUrl } from '../../utils/media';


const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
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
            if (from) {
                navigate(from, { replace: true });
            } else if (result.user.role === 'super_admin') {
                navigate('/admin');
            } else if (result.user.role === 'agent' || result.user.role === 'sub_agent') {
                const agent = result.user.agent;
                if (agent && agent.subdomain) {
                    const currentHost = window.location.hostname;
                    const mainDomain = process.env.REACT_APP_MAIN_DOMAIN || 'superealestate.localhost';
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center space-x-3 mb-8">
                    {!isMainDomain && agent?.logo ? (
                        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-primary-500/25">
                            <img
                                src={getMediaUrl(agent.logo)}
                                alt={agent.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                                <BuildingOfficeIcon className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-2xl font-bold gradient-text">
                                Super
                            </span>
                        </>
                    )}
                </Link>

                {/* Card */}
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
                        <p className="text-gray-500">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="input-label">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                className={`input-field ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
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
                            <label htmlFor="password" className="input-label">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    className={`input-field pr-12 ${errors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
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

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
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
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Demo credentials */}
                <div className="mt-6 p-4 bg-gray-100 rounded-[3px] text-center text-sm text-gray-600">
                    <p className="font-medium mb-1">Demo Account</p>
                    <p>Email: admin@super-realestate.com</p>
                    <p>Password: superadmin123</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
