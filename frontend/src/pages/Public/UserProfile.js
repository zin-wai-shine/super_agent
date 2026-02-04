import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const UserProfile = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-24 px-4">
            <div className="max-w-md mx-auto space-y-6">

                {/* Profile Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary-100 to-indigo-100 dark:from-primary-900/40 dark:to-indigo-900/40" />

                    <div className="relative">
                        <div className="w-24 h-24 mx-auto bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-lg mb-4">
                            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                {user?.first_name?.[0]?.toUpperCase() || <UserCircleIcon className="w-12 h-12" />}
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                            {user?.first_name} {user?.last_name}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium capitalize mt-1">
                            {user?.role?.replace('_', ' ')}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="space-y-4">
                    {/* Dashboard Access for Agents/Admins */}
                    {(user?.role === 'agent' || user?.role === 'super_admin' || user?.role === 'sub_agent') && (
                        <a
                            href={user?.role === 'super_admin' ? '/admin' : '/agent'}
                            className="block w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-2xl shadow-lg shadow-primary-500/30 text-center font-bold text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Go to Dashboard
                        </a>
                    )}

                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-between p-6 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                            <span className="font-medium flex items-center gap-3">
                                <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                                Sign Out
                            </span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserProfile;
