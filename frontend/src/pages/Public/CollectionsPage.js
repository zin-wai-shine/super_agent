import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collectionApi } from '../../services/api';
import CollectionCard from '../../components/Listings/CollectionCard';
import CollectionSkeleton from '../../components/ui/CollectionSkeleton';
import AllCategoriesModal from '../../components/Listings/AllCategoriesModal';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { FiGrid } from "react-icons/fi";
import { HiOutlineQueueList } from "react-icons/hi2";

let globalCollectionsCache = null;
let globalCategoriesCache = null;

const CollectionsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activeCategoryId = searchParams.get('category');
    
    const [collections, setCollections] = useState(globalCollectionsCache || []);
    const [categories, setCategories] = useState(globalCategoriesCache || []);
    const [loading, setLoading] = useState(!globalCollectionsCache);
    const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeCategoryId]);

    const fetchData = async () => {
        try {
            const response = await collectionApi.getPublicCollections();
            const allData = response.data || [];
            
            // Filter categories (those marked as is_parent)
            const categoriesData = allData.filter(c => c.is_parent);
            setCategories(categoriesData);
            globalCategoriesCache = categoriesData;

            // Filter collections (those that are not parents)
            let collectionsData = allData.filter(c => !c.is_parent);
            
            // If we have an active category filter, filter the collections
            if (activeCategoryId) {
                // Check if the selected ID is actually a CHILD (collection) instead of a PARENT (category)
                const target = allData.find(c => c.id === activeCategoryId);
                if (target && !target.is_parent) {
                    // It's a child, user wants its properties - redirect to detail page
                    navigate(`/collections/${target.id}`, { replace: true });
                    return;
                }
                collectionsData = collectionsData.filter(c => c.parent_id === activeCategoryId);
            } else {
                // If no category selected, show "Popular Properties" children by default
                const popularParent = categoriesData.find(c => c.name === 'Popular Properties');
                if (popularParent) {
                    collectionsData = collectionsData.filter(c => c.parent_id === popularParent.id);
                }
            }
            
            setCollections(collectionsData);
            globalCollectionsCache = collectionsData;

            // Smooth reveal
            if (!globalCollectionsCache || globalCollectionsCache.length === 0) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const activeCategoryName = useMemo(() => {
        // Look in both categories and all collections for the title
        const found = [...categories, ...collections].find(c => c.id === activeCategoryId);
        return found ? found.name : null;
    }, [categories, collections, activeCategoryId]);

    return (
        <div className="bg-white dark:bg-dashboard-dark pb-24 lg:pb-20 min-h-screen">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
                {/* Header Section: Back button, Centered Title, Categories Button */}
                <div className="sticky top-0 z-40 bg-white dark:bg-dashboard-dark py-5 mb-5 sm:static sm:bg-transparent sm:py-5 sm:mb-10 flex items-center justify-between relative min-h-[48px] -mx-6 px-6 md:mx-0 md:px-0 border-b border-gray-50 dark:border-white/5 sm:border-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 active:scale-95 transition-all group"
                        >
                            <ArrowLeftIcon className="w-6 h-6 text-gray-900 dark:text-white group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none text-center min-w-0 px-4">
                        <h1 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight truncate max-w-[40vw] sm:max-w-[50vw]">
                            {activeCategoryName || (() => {
                                let popName = 'Popular Properties';
                                try {
                                    const custom = JSON.parse(localStorage.getItem('popular_collection_custom'));
                                    if (custom) popName = custom.name || popName;
                                } catch (e) { }
                                return popName;
                            })()}
                        </h1>
                    </div>

                    {/* Categories Trigger Button */}
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsCategoriesModalOpen(true)}
                            className="flex items-center justify-center rounded-full transition-all duration-300 active:scale-95 group bg-transparent border-transparent px-2"
                        >
                            <HiOutlineQueueList className="w-7 h-7 text-[#222222] dark:text-white transition-colors duration-300 group-hover:text-primary-600" />
                            <span className="hidden sm:block ml-2 text-[14px] font-medium text-gray-900 dark:text-white group-hover:text-primary-600">Categories</span>
                        </button>
                    </div>
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
                                    {(loading || !collections[i]) && (
                                        <div className="relative transition-opacity duration-500">
                                            <CollectionSkeleton index={i} isExiting={!loading} />
                                        </div>
                                    )}

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

            <AllCategoriesModal 
                isOpen={isCategoriesModalOpen}
                onClose={() => setIsCategoriesModalOpen(false)}
                categories={categories}
                selectedId={activeCategoryId}
            />
        </div>
    );
};

export default CollectionsPage;
