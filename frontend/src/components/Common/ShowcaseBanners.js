import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bannerApi, publicApi } from '../../services/api';
import { SparklesIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

const ShowcaseBanners = ({ agentId }) => {
    const navigate = useNavigate();
    const [agentBanners, setAgentBanners] = useState([]);
    const [companyBanners, setCompanyBanners] = useState([]);
    const [internalLoading, setInternalLoading] = useState(true);

    const isLoading = internalLoading;

    const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8080';

    useEffect(() => {
        const fetchShowcaseBanners = async () => {
            try {
                const params = { target_role: 'public' };
                if (agentId) params.agent_id = agentId;

                const response = await publicApi.getPublicBanners(params);
                const banners = response.data || [];

                const company = banners.filter(b => b.agent_id == null);
                const agent = banners.filter(b => b.agent_id != null);

                setCompanyBanners(company.slice(0, 1));
                setAgentBanners(agent.slice(0, 1));

            } catch (error) {
                console.error("Failed to fetch showcase banners", error);
            } finally {
                setInternalLoading(false);
            }
        };

        fetchShowcaseBanners();
    }, [agentId]);

    const allBanners = [...agentBanners, ...companyBanners];

    if (isLoading) return (
        <div className="bg-white rounded-[3px] border border-gray-100 shadow-sm overflow-hidden animate-pulse">
            <div className="h-52 bg-gray-200 relative">
                <div className="absolute bottom-4 left-4 space-y-2">
                    <div className="h-3 w-16 bg-gray-300 rounded" />
                    <div className="h-6 w-32 bg-gray-300 rounded" />
                </div>
            </div>
        </div>
    );

    if (allBanners.length === 0) return (
        // Default Placeholder if empty
        <div className="h-52 rounded-[3px] bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex flex-col items-center justify-center p-6 text-center">
            <SparklesIcon className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-[10px] text-gray-400">Agent Showcase</p>
        </div>
    );

    const renderBanner = (banner, idx) => {
        const isAgent = banner.agent_id != null;
        const imageUrl = banner.image_url?.startsWith('http') ? banner.image_url : `${API_URL}${banner.image_url}`;

        return (
            <div
                key={`${banner.id}-${idx}`}
                onClick={() => {
                    if (banner.link_url) window.open(banner.link_url, '_blank');
                    else navigate(`/banners/${banner.id}`);
                }}
                className="w-full flex-shrink-0 relative group h-52 overflow-hidden cursor-pointer border-b border-gray-100 box-border"
            >
                <img
                    src={imageUrl}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${isAgent ? 'from-blue-900/90' : 'from-emerald-900/90'} via-black/20 to-transparent opacity-80`} />

                <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 text-white transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isAgent ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                        <span className="text-[10px] uppercase font-black tracking-[0.15em] opacity-90 drop-shadow-sm">
                            {isAgent ? 'Featured Agent' : 'Spotlight'}
                        </span>
                    </div>
                    <h4 className="text-xl font-black leading-tight line-clamp-2 drop-shadow-md tracking-tight">
                        {banner.title}
                    </h4>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full relative overflow-hidden rounded-[3px] group/slider shadow-sm border border-gray-100">
            <BannerCarousel banners={allBanners} renderBanner={renderBanner} />
        </div>
    );
};

// Sub-component for slide-by-slide Carousel
const BannerCarousel = ({ banners, renderBanner }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [banners.length]);

    if (banners.length <= 1) {
        return <div className="w-full">{renderBanner(banners[0], 0)}</div>;
    }

    return (
        <div className="w-full relative h-52 overflow-hidden">
            {/* Slides Container */}
            <div
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {banners.map((banner, idx) => (
                    <div key={idx} className="w-full flex-shrink-0">
                        {renderBanner(banner, idx)}
                    </div>
                ))}
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-3 right-4 flex gap-1.5 z-20">
                {banners.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex(idx);
                        }}
                        className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-white' : 'w-1 bg-white/40 hover:bg-white/60'
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ShowcaseBanners;
