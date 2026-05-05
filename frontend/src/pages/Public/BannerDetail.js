import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { publicApi } from '../../services/api';
import { ArrowLeftIcon, CalendarIcon, ShareIcon } from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { getMediaUrl } from '../../utils/media';

const BannerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [banner, setBanner] = useState(null);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        fetchBanner();
    }, [id]);

    const fetchBanner = async () => {
        try {
            setLoading(true);
            const response = await publicApi.getPublicBanner(id);
            setBanner(response.data);
        } catch (error) {
            console.error("Failed to fetch banner details", error);
            toast.error("Failed to load banner details");
        } finally {
            setLoading(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dashboard-dark pb-20 animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-white dark:bg-dashboard-card border-b border-gray-100 dark:border-white/10 sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto px-4 h-[76px] flex items-center justify-between">
                        <div className="w-[44px] h-[44px] rounded-full bg-gray-100 dark:bg-white/10" />
                        <div className="w-32 h-5 rounded-full bg-gray-100 dark:bg-white/10" />
                        <div className="w-[44px] h-[44px] rounded-full bg-gray-100 dark:bg-white/10" />
                    </div>
                </div>
                <div className="max-w-4xl mx-auto px-4 mt-8">
                    <div className="bg-white dark:bg-dashboard-card rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-white/10 h-[300px] bg-gray-100 dark:bg-white/5" />
                    <div className="mt-8 bg-white dark:bg-dashboard-card rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-white/10 space-y-4">
                        <div className="h-8 w-2/3 bg-gray-100 dark:bg-white/5 rounded-full" />
                        <div className="h-4 w-full bg-gray-100 dark:bg-white/5 rounded-full" />
                        <div className="h-4 w-full bg-gray-100 dark:bg-white/5 rounded-full" />
                        <div className="h-4 w-3/4 bg-gray-100 dark:bg-white/5 rounded-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!banner) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Banner Not Found</h1>
                <Link to="/" className="btn-primary px-6 py-2 rounded-lg">Return Home</Link>
            </div>
        );
    }

    const imageUrl = getMediaUrl(banner.image_url);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dashboard-dark pb-20">
            {/* Header / Navigation */}
            <div className="bg-white dark:bg-dashboard-card border-b border-gray-100 dark:border-white/10 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-[76px] lg:h-[80px] flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-white dark:bg-dashboard-card border border-gray-200 dark:border-white/10 hover:border-[#222222] dark:hover:border-white/40 hover:shadow-md hover:-translate-y-[1px] transition-all duration-300 active:scale-[0.98]"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-gray-800 dark:text-white" strokeWidth={2} />
                    </button>
                    <button
                        onClick={handleShare}
                        className="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-white dark:bg-dashboard-card border border-gray-200 dark:border-white/10 hover:border-[#222222] dark:hover:border-white/40 hover:shadow-md hover:-translate-y-[1px] transition-all duration-300 active:scale-[0.98]"
                        title="Share"
                    >
                        <ShareIcon className="w-5 h-5 text-gray-800 dark:text-white" />
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-8">
                {/* Banner Graphic */}
                <div className="bg-white dark:bg-dashboard-card rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-white/10">
                    <img
                        src={imageUrl}
                        alt={banner.title}
                        className="w-full h-auto object-cover max-h-[500px]"
                    />
                </div>

                {/* Content */}
                <div className="mt-8 bg-white dark:bg-dashboard-card rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-white/10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-100 dark:border-white/10 pb-6">
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            {banner.title}
                        </h1>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-bold bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-full border border-gray-100 dark:border-white/10 w-fit">
                            <CalendarIcon className="w-4 h-4" />
                            {banner.created_at ? format(parseISO(banner.created_at), 'MMMM dd, yyyy') : '-'}
                        </div>
                    </div>

                    {banner.description ? (
                        <div
                            className="prose dark:prose-invert max-w-none rich-text-content"
                            dangerouslySetInnerHTML={{ __html: banner.description }}
                        />
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">No additional details provided.</p>
                    )}

                    {banner.link_url && (
                        <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/10">
                            <a
                                href={banner.link_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-black px-8 py-4 rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-95 text-lg"
                            >
                                Visit Link
                                <ShareIcon className="w-5 h-5 rotate-45" />
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BannerDetail;
