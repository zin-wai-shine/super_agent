import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { publicApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

const BannerDisplay = ({ targetRole: customTargetRole }) => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visible, setVisible] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8080';

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                // Determine target role: custom prop > user role > 'all'
                let targetRole = customTargetRole || 'all';
                if (!customTargetRole && isAuthenticated) {
                    targetRole = user?.role === 'agent' ? 'agent' : 'all';
                }

                const response = await publicApi.getPublicBanners({ target_role: targetRole });
                setBanners(response.data);
            } catch (error) {
                console.error("Failed to fetch banners", error);
            }
        };

        fetchBanners();
    }, [isAuthenticated, user, customTargetRole]);

    if (!visible || banners.length === 0) return null;

    const currentBanner = banners[currentIndex];

    const nextBanner = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    const isFullWidth = customTargetRole === 'all'; // For public pages, let's use a bigger style

    return (
        <div className={`mb-6 relative rounded-2xl overflow-hidden shadow-sm bg-white border border-gray-100 ${isFullWidth ? 'min-h-[300px]' : ''}`}>
            <div className={`flex flex-col ${isFullWidth ? 'h-full' : 'md:flex-row'}`}>
                <div className={`${isFullWidth ? 'absolute inset-0 z-0' : 'md:w-1/3 h-48 md:h-auto bg-gray-200'}`}>
                    <img
                        src={currentBanner.image_url.startsWith('http') ? currentBanner.image_url : `${API_URL}${currentBanner.image_url}`}
                        alt={currentBanner.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/1200x400?text=Premium+Real+Estate' }}
                    />
                    {isFullWidth && <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />}
                </div>

                <div className={`p-8 flex flex-col justify-center relative z-10 ${isFullWidth ? 'md:w-1/2 h-full text-gray-900 min-h-[300px]' : 'md:w-2/3'}`}>
                    <button
                        onClick={() => setVisible(false)}
                        className={`absolute top-4 right-4 text-gray-400 hover:text-gray-600`}
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>

                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 w-fit ${isFullWidth ? 'bg-primary-500 text-white' : 'bg-primary-50 text-primary-700'}`}>
                        Featured Announcement
                    </span>

                    <h3 className={`text-2xl md:text-3xl font-extrabold mb-4 text-gray-900`}>{currentBanner.title}</h3>

                    {(currentBanner.description || currentBanner.link_url) && (
                        currentBanner.description ? (
                            <Link
                                to={`/banners/${currentBanner.id}`}
                                className={`inline-flex items-center font-bold transition-all hover:gap-2 ${isFullWidth ? 'text-primary-600 border-b-2 border-primary-100 hover:border-primary-600 w-fit pb-1' : 'text-primary-600 hover:text-primary-700 mt-2'}`}
                            >
                                View Details <span className="ml-1">&rarr;</span>
                            </Link>
                        ) : (
                            <a
                                href={currentBanner.link_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center font-bold transition-all hover:gap-2 ${isFullWidth ? 'text-primary-600 border-b-2 border-primary-100 hover:border-primary-600 w-fit pb-1' : 'text-primary-600 hover:text-primary-700 mt-2'}`}
                            >
                                View Details <span className="ml-1">&rarr;</span>
                            </a>
                        )
                    )}

                    {banners.length > 1 && (
                        <div className="flex items-center space-x-2 mt-8">
                            {banners.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentIndex
                                        ? ('bg-primary-600 w-8')
                                        : (isFullWidth ? 'bg-primary-100' : 'bg-gray-300')
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
