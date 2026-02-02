import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bannerApi, publicApi } from '../../services/api';
import { SparklesIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

const ShowcaseBanners = () => {
    const navigate = useNavigate();
    const [agentBanners, setAgentBanners] = useState([]);
    const [companyBanners, setCompanyBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8080';

    useEffect(() => {
        const fetchShowcaseBanners = async () => {
            try {
                // Fetch Agent Banners (where agent_id is NOT null - handled by backend when agent_id is passed or implicitly)
                // Note: The backend GetBanners logic currently filters by agent_id or Platform (agent_id IS NULL)
                // We'll fetch platform ones as "Company" and we might need to adjust backend or fetch all if possible.
                // For now, let's fetch platform banners as company and a sample "agent" banner if we can.

                const companyPromise = publicApi.getPublicBanners({ target_role: 'public' });
                // We might need a way to specifically get banners created by agents for public view.
                // Assuming target_role 'public' or 'all' with agent_id != null on backend.
                // For now, let's get what's available and categorize.

                const [companyRes] = await Promise.all([companyPromise]);

                const banners = companyRes.data || [];
                // Split into Agent (creator has agent role/agentID) and Company (platform)
                setCompanyBanners(banners.filter(b => b.agent_id === null).slice(0, 1));
                setAgentBanners(banners.filter(b => b.agent_id !== null).slice(0, 1));

            } catch (error) {
                console.error("Failed to fetch showcase banners", error);
            } finally {
                setLoading(false);
            }
        };

        fetchShowcaseBanners();
    }, []);

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[1, 2].map(i => (
                <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl" />
            ))}
        </div>
    );

    if (agentBanners.length === 0 && companyBanners.length === 0) return null;

    const renderBanner = (banner, type) => {
        const isAgent = type === 'agent';
        const hasRichContent = !!banner.description;

        const imageUrl = banner.image_url.startsWith('http')
            ? banner.image_url
            : `${API_URL}${banner.image_url}`;

        const handleClick = () => {
            if (hasRichContent) {
                navigate(`/banners/${banner.id}`);
            } else if (banner.link_url) {
                window.open(banner.link_url, '_blank');
            }
        };

        return (
            <div
                className="relative group h-48 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100"
                onClick={handleClick}
            >
                {/* Background Image */}
                <img
                    src={imageUrl}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
                />

                {/* Overlay Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${isAgent
                    ? 'from-blue-600/80 via-blue-600/40 to-transparent opacity-90 group-hover:opacity-100'
                    : 'from-emerald-600/80 via-emerald-600/40 to-transparent opacity-90 group-hover:opacity-100'
                    }`} />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                    <div className="flex items-center gap-2 mb-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit">
                        {isAgent ? <SparklesIcon className="w-4 h-4" /> : <BuildingOffice2Icon className="w-4 h-4" />}
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                            {isAgent ? 'Agent Showcase' : 'Company Spotlight'}
                        </span>
                    </div>
                    <h4 className="text-xl font-bold mb-1 line-clamp-1 group-hover:translate-x-1 transition-transform">{banner.title}</h4>
                    <p className="text-xs text-white/80 line-clamp-2">Premium listing exclusive</p>

                    {/* Glass Button Reveal */}
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-xs font-bold border-b-2 border-white pb-1">Learn More &rarr;</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 overflow-hidden px-1">
            {agentBanners.length > 0 ? renderBanner(agentBanners[0], 'agent') : (
                <div className="relative group h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex flex-col items-center justify-center p-6 text-center">
                    <SparklesIcon className="w-8 h-8 text-gray-300 mb-2" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Agent Showcase</span>
                    <p className="text-[10px] text-gray-400 mt-1">Contact us to feature your listing here</p>
                </div>
            )}
            {companyBanners.length > 0 ? renderBanner(companyBanners[0], 'company') : (
                <div className="relative group h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex flex-col items-center justify-center p-6 text-center">
                    <BuildingOffice2Icon className="w-8 h-8 text-gray-300 mb-2" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Company Spotlight</span>
                    <p className="text-[10px] text-gray-400 mt-1">Partner with the best in Bangkok</p>
                </div>
            )}
        </div>
    );
};

export default ShowcaseBanners;
