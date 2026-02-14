import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const UserProfile = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-24 px-4">
            <div className="max-w-md mx-auto space-y-6">

                {/* Profile Card */}
                <Card className="p-8 text-center relative overflow-hidden rounded-3xl">
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
                </Card>

                {/* Account Actions */}
                <div className="space-y-4">
                    {/* Dashboard Access for Agents/Admins */}
                    {/* Dashboard Access for Agents/Admins */}
                    {(user?.role === 'agent' || user?.role === 'super_admin' || user?.role === 'sub_agent') && (
                        <Link to={user?.role === 'super_admin' ? '/admin' : '/agent'}>
                            <Button className="w-full bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg shadow-primary-500/30 text-sm uppercase tracking-wider py-4 rounded-2xl">
                                Go to Dashboard
                            </Button>
                        </Link>
                    )}

                    <Card className="rounded-3xl overflow-hidden">
                        <Button
                            variant="ghost"
                            onClick={logout}
                            className="w-full justify-between p-6 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 h-auto rounded-none"
                        >
                            <span className="font-medium flex items-center gap-3">
                                <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                                Sign Out
                            </span>
                        </Button>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default UserProfile;
