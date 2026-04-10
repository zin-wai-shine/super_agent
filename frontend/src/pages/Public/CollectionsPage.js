import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { collectionApi } from '../../services/api';
import CollectionCard from '../../components/Listings/CollectionCard';
import CollectionSkeleton from '../../components/ui/CollectionSkeleton';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { FiGrid } from "react-icons/fi";

let globalGalleryCache = null;

const CollectionsPage = () => {
    const navigate = useNavigate();
    const [collections, setCollections] = useState(() => {
        if (globalGalleryCache) return globalGalleryCache;
        return [];
    });
    const [loading, setLoading] = useState(() => {
        if (globalGalleryCache) return false;
        return true;
    });

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            // Use public endpoint so non-logged-in viewers can still see the gallery
            const response = await collectionApi.getPublicCollections();
            // Filter only child collections (those without an icon are "collections", those with icon are "main categories")
            const data = (response.data || []).filter(c => !c.icon);
            
            // Set collections immediately so React instantly shrinks the skeletal grid 
            // from 11 cards to the EXACT data count (preventing overflow loading cards).
            setCollections(data);
            globalGalleryCache = data;

            // Delayed loading state for smooth reveal only on initial load
            if (!globalGalleryCache || globalGalleryCache.length === 0) {
                // Reduced delay to make content reveal snappier (from 800ms to 300ms)
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        } catch (error) {
            console.error('Failed to fetch collections:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-dashboard-dark pb-24 lg:pb-20 min-h-screen">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
                {/* Header Section: Back button, Centered Title */}
                <div className="sticky top-0 z-40 bg-white dark:bg-dashboard-dark py-5 mb-5 sm:static sm:bg-transparent sm:py-5 sm:mb-10 flex items-center justify-between relative min-h-[48px] -mx-6 px-6 md:mx-0 md:px-0 border-b border-gray-50 dark:border-white/5 sm:border-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 active:scale-95 transition-all group"
                        >
                            <ArrowLeftIcon className="w-6 h-6 text-gray-900 dark:text-white group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none text-center">
                        <h1 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight truncate max-w-[50vw]">
                            {(() => {
                                let popName = 'Popular Collections';
                                try {
                                    const custom = JSON.parse(localStorage.getItem('popular_collection_custom'));
                                    if (custom) popName = custom.name || popName;
                                } catch (e) { }
                                return popName;
                            })()}
                        </h1>
                    </div>

                    {/* Empty div for spacing/balance */}
                    <div className="w-10 h-10 invisible" />
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-12">
                            {[...Array(loading && collections.length === 0 ? 6 : collections.length)].map((_, i) => (
                                <div key={collections[i]?.id || `slot-${i}`} className="relative h-full">
                                    {/* Layer 1: Background Layout (Static Skeleton) */}
                                    {(loading || !collections[i]) && (
                                        <div className="relative transition-opacity duration-500">
                                            <CollectionSkeleton index={i} isExiting={!loading} />
                                        </div>
                                    )}

                                    {/* Layer 2: Real Data Card (Specific internal animations for image vs text) */}
                                    {!loading && collections[i] && (
                                        <div className="relative z-10 h-full">
                                            <CollectionCard
                                                collection={collections[i]}
                                                readOnly={true}
                                                canEdit={false}
                                                animateEntrance={true}
                                                index={i}
                                                className="w-full h-full"
                                                animateEntranceDelay={true}
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
