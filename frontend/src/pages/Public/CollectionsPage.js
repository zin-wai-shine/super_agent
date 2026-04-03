import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { collectionApi } from '../../services/api';
import CollectionCard from '../../components/Listings/CollectionCard';
import CollectionSkeleton from '../../components/ui/CollectionSkeleton';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { FiGrid } from "react-icons/fi";

const CollectionsPage = () => {
    const navigate = useNavigate();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const outletContext = useOutletContext() || {};
    const { navVisible = true } = outletContext;

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        setLoading(true);
        try {
            const response = await collectionApi.getCollections();
            // Artificial delay to allow the staggered skeleton animation 
            // to complete its initial 'discovery' phase as requested.
            await new Promise(resolve => setTimeout(resolve, 800));
            setCollections(response.data || []);
        } catch (error) {
            console.error('Failed to fetch collections:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-dashboard-dark pb-24 lg:pb-20 min-h-screen">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pt-5">
                {/* Header */}
                <div className="mb-10 flex items-center gap-4 relative min-h-[48px]">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 active:scale-95 transition-all group"
                    >
                        <ArrowLeftIcon className="w-6 h-6 text-gray-900 dark:text-white group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <h1 className="text-[24px] font-semibold text-gray-900 dark:text-white tracking-tight">
                        Popular Collections
                    </h1>
                </div>

                {/* Staggered Per-Card Discovery Grid */}
                <div className="relative min-h-[400px]">
                    {collections.length === 0 && !loading ? (
                        <div className="text-center py-24 animate-fadeInUp">
                            <FiGrid className="mx-auto h-20 w-20 text-gray-200" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">No collections found</h2>
                            <button
                                onClick={() => navigate('/listings')}
                                className="mt-8 inline-flex items-center px-8 py-3 rounded-full text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-dashboard-dark dark:hover:bg-gray-200 font-bold transition-all shadow-lg active:scale-95"
                            >
                                Start Browsing
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-12">
                            {[...Array(Math.max(11, collections.length))].map((_, i) => (
                                <div key={collections[i]?.id || `slot-${i}`} className="relative h-full">
                                    {/* Layer 1: Background Layout (Static Skeleton) */}
                                    {/* Skeleton becomes absolute background when real card arrives so it doesn't duplicate height */}
                                    <div className={!loading && collections[i] ? "absolute inset-0 z-0 transition-opacity duration-500" : "relative transition-opacity duration-500"}>
                                        <CollectionSkeleton index={i} isExiting={!loading} />
                                    </div>

                                    {/* Layer 2: Real Data Card (Specific internal animations for image vs text) */}
                                    {!loading && collections[i] && (
                                        <div className="relative z-10 h-full">
                                            <CollectionCard
                                                collection={collections[i]}
                                                readOnly={true}
                                                canEdit={false}
                                                animateEntrance={true}
                                                index={i}
                                                className="!w-auto h-full"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectionsPage;
