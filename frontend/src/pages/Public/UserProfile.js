import { Link, useNavigate } from 'react-router-dom';
import {
    UserCircleIcon,
    ArrowLeftOnRectangleIcon,
    ChevronRightIcon,
    Squares2X2Icon,
    UserIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isAgent = user?.role === 'agent' || user?.role === 'sub_agent' || user?.role === 'super_admin';

    const menuItemClass = 'flex items-center justify-between w-full py-4 px-4 sm:py-5 sm:px-5 lg:py-6 lg:px-6 text-left text-gray-600 font-medium text-base sm:text-lg rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors';
    const iconClass = 'w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-gray-800 flex-shrink-0';

    return (
        <div className="min-h-screen bg-gray-50 pt-4 pb-28 px-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8 xl:px-10 xl:pt-10 2xl:px-12 2xl:pt-12 md:max-w-lg lg:max-w-xl xl:max-w-2xl md:mx-auto animate-profile-enter">
            {/* Header — responsive title (small to huge) */}
            <h1 className="text-[28px] sm:text-3xl lg:text-4xl xl:text-[2.5rem] font-bold text-slate-900 tracking-tight leading-tight mb-4 sm:mb-6 lg:mb-8">Profile</h1>

            {/* Profile card — responsive padding and avatar (small to huge) */}
            <div
                className="bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8 lg:mb-10"
                style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.04), 0 0 28px rgba(0,0,0,0.08)' }}
            >
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-primary-100 flex items-center justify-center mb-3 sm:mb-4">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-700">
                            {user?.first_name?.[0]?.toUpperCase() || '?'}
                        </span>
                        {!user?.first_name && (
                            <UserCircleIcon className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-primary-500" />
                        )}
                    </div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        {user?.first_name} {user?.last_name}
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-500 font-medium capitalize mt-0.5 sm:mt-1">
                        {user?.role === 'super_admin' ? 'Admin' : user?.role?.replace('_', ' ') || 'Guest'}
                    </p>
                </div>
            </div>

            {/* Menu list — responsive (small to huge) */}
            <div className="overflow-hidden">
                {/* Agent: Dashboard and View profile */}
                {isAgent && (
                    <>
                        <Link
                            to={user?.role === 'super_admin' ? '/admin' : '/agent'}
                            className={`${menuItemClass} border-b border-gray-100`}
                        >
                            <span className="flex items-center gap-3">
                                <Squares2X2Icon className={iconClass} />
                                Dashboard
                            </span>
                            <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
                        </Link>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className={menuItemClass}
                        >
                            <span className="flex items-center gap-3">
                                <UserIcon className={iconClass} />
                                View profile
                            </span>
                            <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
                        </button>
                    </>
                )}

                {/* Log out — for all users */}
                <button
                    type="button"
                    onClick={logout}
                    className={`${menuItemClass} ${isAgent ? 'border-t border-gray-100' : ''} text-red-600 hover:bg-red-50 active:bg-red-100`}
                >
                    <span className="flex items-center gap-3">
                        <ArrowLeftOnRectangleIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-red-600 flex-shrink-0" />
                        Log out
                    </span>
                    <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0" />
                </button>
            </div>
        </div>
    );
};

export default UserProfile;
