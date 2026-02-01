import React, { useState, useEffect } from 'react';
import { bannerApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

const BannerDisplay = () => {
    const { isAuthenticated, user } = useAuth();
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                // Fetch Platform Banners targeted at this user role
                // For Dashboard display, we want banners from Super Admin (AgentID is null)
                // Backend defaults to AgentID null if param not provided
                // We filter by target role in backend query param
                const targetRole = user?.role === 'agent' ? 'agent' : 'all';
                const response = await bannerApi.getBanners({ target_role: targetRole });
                setBanners(response.data);
            } catch (error) {
                console.error("Failed to fetch banners", error);
            }
        };

        if (isAuthenticated) {
            fetchBanners();
        }
    }, [isAuthenticated, user]);

    if (!visible || banners.length === 0) return null;

    const currentBanner = banners[currentIndex];

    const nextBanner = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    return (
        <div className="mb-6 relative rounded-xl overflow-hidden shadow-sm bg-white border border-gray-100">
            <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48 md:h-auto bg-gray-200">
                    <img
                        src={currentBanner.image_url}
                        alt={currentBanner.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Announcement' }}
                    />
                </div>
                <div className="p-6 md:w-2/3 flex flex-col justify-center relative">
                    <button
                        onClick={() => setVisible(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{currentBanner.title}</h3>

                    {currentBanner.link_url && (
                        <a
                            href={currentBanner.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700 mt-2"
                        >
                            Learn more &rarr;
                        </a>
                    )}

                    {banners.length > 1 && (
                        <div className="flex items-center space-x-2 mt-4">
                            {banners.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-primary-600' : 'bg-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BannerDisplay;
