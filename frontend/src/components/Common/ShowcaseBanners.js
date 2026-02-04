import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bannerApi, publicApi } from '../../services/api';
import { SparklesIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

const ShowcaseBanners = ({ agentId, loading: externalLoading }) => {
    const navigate = useNavigate();
    const [agentBanners, setAgentBanners] = useState([]);
    const [companyBanners, setCompanyBanners] = useState([]);
    const [internalLoading, setInternalLoading] = useState(true);

    const isLoading = externalLoading || internalLoading;

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
            <div className="h-48 bg-gray-200 relative">
                <div className="absolute bottom-4 left-4 space-y-2">
                    <div className="h-3 w-16 bg-gray-300 rounded" />
                    <div className="h-6 w-32 bg-gray-300 rounded" />
                </div>
            </div>
        </div>
    );

    if (allBanners.length === 0) return (
        // Default Placeholder if empty
        <div className="h-48 rounded-[3px] bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex flex-col items-center justify-center p-6 text-center">
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
                className="w-full flex-shrink-0 snap-center relative group h-48 rounded-[3px] overflow-hidden cursor-pointer border border-gray-100 box-border"
                style={{ flex: '0 0 100%' }} // Force single item width
            >
                <img
                    src={imageUrl}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${isAgent ? 'from-blue-900/80' : 'from-emerald-900/80'} via-transparent to-transparent opacity-90`} />

                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1 block">
                        {isAgent ? 'Featured Agent' : 'Spotlight'}
                    </span>
                    <h4 className="text-lg font-bold leading-tight line-clamp-1">{banner.title}</h4>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full relative overflow-hidden rounded-[3px] group/slider">
            {/* Slider Track */}
            {/* We use a simple auto-scroll logic wrapper */}
            <InfiniteSlider banners={allBanners} renderBanner={renderBanner} />
        </div>
    );
};

// Sub-component for clean Infinite Slider (CSS Animation)
const InfiniteSlider = ({ banners, renderBanner }) => {
    // If only 1 banner, just show it static
    if (banners.length === 1) {
        return <div className="w-full">{renderBanner(banners[0], 0)}</div>;
    }

    // For infinite scroll, we need a duplicated list
    return (
        <div className="w-full overflow-hidden">
            {/* CSS Scroll Track */}
            {/* We translate X. Total duration based on count. */}
            <div className="flex animate-infinite-scroll hover:pause-scroll">
                {/* Original Set */}
                {banners.map((b, i) => renderBanner(b, i))}
                {/* Duplicate Set for gapless loop */}
                {banners.map((b, i) => renderBanner(b, `dup-${i}`))}
            </div>

            {/* Add Tailwind custom animation style if not exists, or inline style */}
            <style>{`
                @keyframes infinite-scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); } 
                }
                .animate-infinite-scroll {
                    animation: infinite-scroll ${banners.length * 5}s linear infinite;
                    width: 200%; /* accommodate 2 sets */
                }
                .hover\\:pause-scroll:hover {
                    animation-play-state: paused;
                }
             `}</style>
        </div>
    );
};

export default ShowcaseBanners;
