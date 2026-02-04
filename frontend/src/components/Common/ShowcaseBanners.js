import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bannerApi, publicApi } from '../../services/api';
import { SparklesIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

const ShowcaseBanners = ({ agentId }) => {
    const navigate = useNavigate();
    const [agentBanners, setAgentBanners] = useState([]);
    const [companyBanners, setCompanyBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8080';

    useEffect(() => {
        const fetchShowcaseBanners = async () => {
            try {
                const params = { target_role: 'public' };
                if (agentId) params.agent_id = agentId;

                const response = await publicApi.getPublicBanners(params);
                const banners = response.data || [];

                // Categorize banners: Agent (has agent_id) vs Company (platform, agent_id is null/undefined)
                // Use == null to catch both null and undefined
                const company = banners.filter(b => b.agent_id == null);
                const agent = banners.filter(b => b.agent_id != null);


                setCompanyBanners(company.slice(0, 1));
                setAgentBanners(agent.slice(0, 1));

            } catch (error) {
                console.error("Failed to fetch showcase banners", error);
            } finally {
                setLoading(false);
            }
        };

        fetchShowcaseBanners();
    }, [agentId]); // Re-fetch if agentId changes

    // --- Refactored for Single Row Infinite Scroll (Sidebar Friendly) ---

    // Combine all banners into a single flow
    const allBanners = [...agentBanners, ...companyBanners];

    // We need at least one banner to show something
    // If we have banners, we duplicate them to create a seamless infinite scroll effect
    // [A, B] -> [A, B, A, B] to allow scrolling past B back to A without a jump
    const displayBanners = allBanners.length > 0 ? [...allBanners, ...allBanners, ...allBanners] : [];

    const scrollContainerRef = React.useRef(null);

    // Auto-scroll Logic
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer || allBanners.length <= 1) return; // No scroll needed if 0 or 1 item (though 1 item duplicate handles loop stability, strictly 1 static is better but let's scroll for "infinity" feel if requested, or just toggle)

        // Actually, for "Infinity Scroll", we typically want smooth continuous movement or auto-paging.
        // Let's do a smooth auto-paging interval.

        const scrollWidth = scrollContainer.scrollWidth;
        const itemWidth = scrollContainer.clientWidth; // Assuming 1 item visible at a time

        let scrollPos = 0;

        const interval = setInterval(() => {
            if (!scrollContainer) return;

            // Increment scroll position
            scrollPos += 1;

            // If we've scrolled past the first set (1/3 of total since we tripled it), reset to 0 (or seamless point)
            // Real set width:
            const singleSetWidth = scrollWidth / 3;

            if (scrollContainer.scrollLeft >= singleSetWidth) {
                scrollContainer.scrollLeft = 0; // Snap back to start (which is identical to current view)
            } else {
                scrollContainer.scrollLeft += 1; // Smooth pixel movement
            }

        }, 20); // 20ms update for smooth ticker look? Or use CSS animation?

        // Let's stick to the previous interval-based snap-scroll if preferred, OR a CSS marquee?
        // User asked for "infinity scroll". A gentle constant slide is often what this means in modern UI.
        // BUT, JS-based constant scroll can be jittery. 
        // Let's try a CSS-based approach for the "track".

        return () => clearInterval(interval);

    }, [allBanners.length]);

    // Alternative: CSS Animation Approach for smoother performance
    // tailored for the sidebar width

    if (loading) return (
        <div className="h-48 bg-gray-100 animate-pulse rounded-2xl w-full" />
    );

    if (allBanners.length === 0) return (
        // Default Placeholder if empty
        <div className="h-48 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex flex-col items-center justify-center p-6 text-center">
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
                className="w-full flex-shrink-0 snap-center relative group h-48 rounded-2xl overflow-hidden cursor-pointer border border-gray-100 box-border"
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
        <div className="w-full relative overflow-hidden rounded-2xl group/slider">
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
