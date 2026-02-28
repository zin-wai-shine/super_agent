import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { BuildingOfficeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useTenant } from '../../contexts/TenantContext';
import { getMediaUrl } from '../../utils/media';


const RegisterPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register: registerUser } = useAuth();
    const { isMainDomain, agent } = useTenant();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const password = watch('password');

    const onSubmit = async (data) => {
        setLoading(true);
        const result = await registerUser({
            email: data.email,
            password: data.password,
            first_name: data.firstName,
            last_name: data.lastName,
        });
        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            console.error('Registration failed:', result.error);
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
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
                        <p className="text-gray-500">Start exploring properties today</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Name fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="input-label">
                                    First name
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    className={`input-field ${errors.firstName ? 'border-red-300' : ''}`}
                                    placeholder="John"
                                    {...register('firstName', { required: 'Required' })}
                                />
                                {errors.firstName && (
                                    <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="lastName" className="input-label">
                                    Last name
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    className={`input-field ${errors.lastName ? 'border-red-300' : ''}`}
                                    placeholder="Doe"
                                    {...register('lastName', { required: 'Required' })}
                                />
                                {errors.lastName && (
                                    <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="input-label">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                className={`input-field ${errors.email ? 'border-red-300' : ''}`}
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
                                    className={`input-field pr-12 ${errors.password ? 'border-red-300' : ''}`}
                                    placeholder="••••••••"
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 8,
                                            message: 'Password must be at least 8 characters',
                                        },
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

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="input-label">
                                Confirm password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className={`input-field ${errors.confirmPassword ? 'border-red-300' : ''}`}
                                placeholder="••••••••"
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: (value) =>
                                        value === password || 'Passwords do not match',
                                })}
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                'Create account'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
