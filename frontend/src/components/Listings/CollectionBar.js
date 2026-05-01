import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collectionApi } from '../../services/api';
import CollectionCard from './CollectionCard';
import { 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    FolderIcon,
    PencilSquareIcon,
    HeartIcon,
    ArrowSmallRightIcon
} from '@heroicons/react/24/outline';
import { getMediaUrl } from '../../utils/media';
import EditCollectionModal from './EditCollectionModal';
import CollectionSkeleton from '../ui/CollectionSkeleton';
import CategorySkeleton from '../ui/CategorySkeleton';
import * as BsIcons from 'react-icons/bs';
import * as MdIcons from 'react-icons/md';
import * as HiIcons from 'react-icons/hi2';
import * as FaIcons from 'react-icons/fa';
import { FiGrid } from "react-icons/fi";
import AllCategoriesModal from './AllCategoriesModal';

const CollectionGroup = ({ 
    title, 
    groupCollections, 
    selectedId, 
    onSelectCollection, 
    setEditingCollection, 
    readOnly, 
    canEdit, 
    initialPath,
    onNavigate 
}) => {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 1);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
        }
    };

    useEffect(() => {
        checkScroll();
        const currentRef = scrollRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            return () => {
                currentRef.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, [groupCollections]);

    const handleScroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = window.innerWidth < 768 ? 300 : 500;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (groupCollections.length === 0) return null;

    return (
        <div className="collection-group-section mb-8">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-4 px-6 md:px-1">
                <div className="flex items-center gap-2">
                    <h2 className="text-[17px] md:text-[17px] font-semibold text-[#222222] dark:text-white tracking-[0.05em]">
                        {title}
                    </h2>
                    <button 
                        onClick={() => onNavigate('/collections')}
                        className="hidden md:flex w-8 h-8 rounded-full bg-[#F7F7F7] dark:bg-gray-800/60 items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowSmallRightIcon className="w-4 h-4 text-[#222222] dark:text-white stroke-[2.0]" />
                    </button>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onNavigate('/collections')}
                        className="md:hidden w-10 h-10 rounded-full bg-[#F7F7F7] dark:bg-gray-800/60 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowSmallRightIcon className="w-5 h-5 text-[#222222] dark:text-white stroke-[2.0]" />
                    </button>

                    <div className="hidden md:flex items-center gap-3">
                        <button 
                            onClick={() => handleScroll('left')}
                            disabled={!canScrollLeft}
                            className={`w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-all ${canScrollLeft ? 'hover:bg-gray-50 dark:hover:bg-gray-800 text-[#222222] dark:text-white shadow-sm cursor-pointer' : 'opacity-20 cursor-not-allowed text-gray-400'}`}
                        >
                            <ChevronLeftIcon className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        <button 
                            onClick={() => handleScroll('right')}
                            disabled={!canScrollRight}
                            className={`w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-all ${canScrollRight ? 'hover:bg-gray-50 dark:hover:bg-gray-800 text-[#222222] dark:text-white shadow-sm cursor-pointer' : 'opacity-20 cursor-not-allowed text-gray-400'}`}
                        >
                            <ChevronRightIcon className="w-4 h-4 stroke-[2.5]" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Horizontal Cards Container */}
            <div className="relative">
                <div 
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-5 md:gap-5 pb-6 scrollbar-hide scroll-smooth px-6 md:px-1 scroll-px-6 md:scroll-px-1"
                >
                    {groupCollections.map((collection, i) => (
                        <div key={collection.id} className="relative flex-shrink-0 w-[180px] md:w-[200px]">
                            <CollectionCard
                                collection={collection}
                                isSelected={selectedId === collection.id}
                                onSelect={onSelectCollection}
                                onEdit={setEditingCollection}
                                readOnly={readOnly}
                                canEdit={canEdit}
                                initialPath={initialPath}
                                animateEntrance={true}
                                index={i}
                                className="relative z-10"
                            />
                        </div>
                    ))}

                    <div 
                        className="flex-shrink-0 w-[180px] md:w-[200px] group cursor-pointer animate-fillIn"
                        onClick={() => onNavigate('/collections')}
                    >
                        <div className="relative aspect-[1/1] md:aspect-[4/3] bg-white dark:bg-dashboard-card border border-gray-100 dark:border-white/10 shadow-sm rounded-[23px] overflow-hidden mb-3 transition-all duration-300 group-hover:shadow-md">
                            <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                                    <div className="relative w-[75%] h-[75%]">
                                        {/* Layer 3 (Back) - 3rd Item */}
                                        <div className="absolute top-0 right-0 w-[65%] h-[65%] bg-gray-100 rounded-[14px] rotate-12 -translate-y-2 translate-x-3 border-[3px] border-white dark:border-dashboard-card shadow-md overflow-hidden opacity-40">
                                            {(() => {
                                                const coll = groupCollections[2] || groupCollections[0];
                                                const imgUrl = coll?.media?.find(m => m.type === 'image')?.url || coll?.image;
                                                return imgUrl ? <img src={getMediaUrl(imgUrl)} className="w-full h-full object-cover" alt="" /> : null;
                                            })()}
                                        </div>
                                        {/* Layer 2 (Middle) - 2nd Item */}
                                        <div className="absolute top-0 left-0 w-[70%] h-[70%] bg-gray-200 rounded-[14px] -rotate-6 translate-y-2 -translate-x-3 border-[3px] border-white dark:border-dashboard-card shadow-lg overflow-hidden opacity-70">
                                            {(() => {
                                                const coll = groupCollections[1] || groupCollections[0];
                                                const imgUrl = coll?.media?.find(m => m.type === 'image')?.url || coll?.image;
                                                return imgUrl ? <img src={getMediaUrl(imgUrl)} className="w-full h-full object-cover" alt="" /> : null;
                                            })()}
                                        </div>
                                        {/* Layer 1 (Front) - 1st Item */}
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] h-[75%] bg-gray-50 rounded-[14px] translate-y-3 border-[3px] border-white dark:border-dashboard-card shadow-xl overflow-hidden">
                                            {(() => {
                                                const coll = groupCollections[0];
                                                const imgUrl = coll?.media?.find(m => m.type === 'image')?.url || coll?.image;
                                                return imgUrl ? <img src={getMediaUrl(imgUrl)} className="w-full h-full object-cover" alt="" /> : null;
                                            })()}
                                        </div>
                                    </div>
                            </div>
                        </div>
                        <div className="px-1">
                            <div className="h-4" /> 
                            <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white leading-tight">See all</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const IconCategoryGroup = ({ title, categories, onNavigate }) => {
    const categoriesScrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [isAllOpen, setIsAllOpen] = useState(false);

    const checkScroll = () => {
        if (categoriesScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = categoriesScrollRef.current;
            setCanScrollLeft(scrollLeft > 1);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
        }
    };

    useEffect(() => {
        checkScroll();
        const currentRef = categoriesScrollRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            setTimeout(checkScroll, 100);
            return () => {
                currentRef.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, [categories]);

    const scrollCategories = (direction) => {
        if (categoriesScrollRef.current) {
            const scrollAmount = window.innerWidth < 768 ? 300 : 500;
            categoriesScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (categories.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4 px-6 md:px-1">
                <div className="flex items-center gap-2">
                    <h2 className="text-[17px] md:text-[17px] font-semibold text-[#222222] dark:text-white tracking-[0.05em]">
                        {title}
                    </h2>
                    <button 
                        onClick={() => setIsAllOpen(true)}
                        className="hidden md:flex w-8 h-8 rounded-full bg-[#F7F7F7] dark:bg-gray-800/60 items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowSmallRightIcon className="w-4 h-4 text-[#222222] dark:text-white stroke-[2.0]" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsAllOpen(true)}
                        className="md:hidden w-10 h-10 rounded-full bg-[#F7F7F7] dark:bg-gray-800/60 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowSmallRightIcon className="w-5 h-5 text-[#222222] dark:text-white stroke-[2.0]" />
                    </button>

                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={() => scrollCategories('left')}
                            disabled={!canScrollLeft}
                            className={`w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-all ${canScrollLeft ? 'hover:bg-gray-50 dark:hover:bg-gray-800 text-[#222222] dark:text-white shadow-sm cursor-pointer' : 'opacity-20 cursor-not-allowed text-gray-400'}`}
                        >
                            <ChevronLeftIcon className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        <button
                            onClick={() => scrollCategories('right')}
                            disabled={!canScrollRight}
                            className={`w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-all ${canScrollRight ? 'hover:bg-gray-50 dark:hover:bg-gray-800 text-[#222222] dark:text-white shadow-sm cursor-pointer' : 'opacity-20 cursor-not-allowed text-gray-400'}`}
                        >
                            <ChevronRightIcon className="w-4 h-4 stroke-[2.5]" />
                        </button>
                    </div>
                </div>
            </div>

            <div 
                ref={categoriesScrollRef}
                className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide px-6 md:px-1 scroll-smooth"
            >
                {categories.slice(0, 10).map((category) => {
                    const Icon = MdIcons[category.icon] || 
                                 FaIcons[category.icon] || 
                                 HiIcons[category.icon] || 
                                 BsIcons[category.icon] || 
                                 FolderIcon;
                                 
                    return (
                        <div 
                            key={category.id}
                            onClick={() => onNavigate(`/collections/${category.id}`, { state: { loadingType: 'icon' } })}
                            className="flex-shrink-0 group cursor-pointer"
                        >
                            <div className="h-14 min-w-[max-content] p-2 pr-6 rounded-full bg-white/80 dark:bg-dashboard-card/80 backdrop-blur-md border border-[#222222]/10 dark:border-white/5 flex flex-row items-center gap-3 transition-all duration-300 hover:bg-gray-50/80 dark:hover:bg-white/5 group-active:scale-95">
                                <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-[14px] font-medium text-[#222222] dark:text-white whitespace-nowrap">
                                    {category.name}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {categories.length > 10 && (
                    <div 
                        onClick={() => setIsAllOpen(true)}
                        className="flex-shrink-0 group cursor-pointer"
                    >
                        <div className="h-14 min-w-[max-content] p-2 pr-6 rounded-full bg-primary-600 dark:bg-white border border-transparent flex flex-row items-center gap-3 transition-all duration-300 hover:opacity-90 group-active:scale-95 shadow-none">
                            <div className="w-10 h-10 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center text-white dark:text-gray-900 flex-shrink-0">
                                <FiGrid className="w-5 h-5" />
                            </div>
                            <span className="text-[14px] font-semibold text-white dark:text-gray-900 whitespace-nowrap">
                                See all
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <AllCategoriesModal 
                isOpen={isAllOpen}
                onClose={() => setIsAllOpen(false)}
                categories={categories}
            />
        </div>
    );
};

let globalCollectionsCache = null;

const CollectionBar = ({ 
    onSelectCollection, 
    selectedId, 
    readOnly = false,
    canEdit = true,
    refreshTrigger = 0,
    initialPath = '/listings'
}) => {
    const navigate = useNavigate();
    
    // Quick-mount sync cache check
    const [collections, setCollections] = useState(() => {
        if (globalCollectionsCache) return globalCollectionsCache;
        return [];
    });
    
    const [loading, setLoading] = useState(() => {
        if (globalCollectionsCache) return false;
        return true;
    });
    const [editingCollection, setEditingCollection] = useState(null);

    const fetchCollections = async () => {
        try {
            // If we have cached data, don't show loading on subsequent background refreshes
            if (!globalCollectionsCache) setLoading(true);
            
            const response = readOnly 
                ? await collectionApi.getPublicCollections()
                : await collectionApi.getCollections();
            
            const data = response.data || [];
            setCollections(data);
            globalCollectionsCache = data;
        } catch (error) {
            console.error('Failed to fetch collections:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, [refreshTrigger, readOnly]);

    const parentsWithChildren = React.useMemo(() => {
        const parents = collections.filter(c => c.is_parent);
        return parents.map(parent => ({
            parent,
            children: collections.filter(c => c.parent_id === parent.id)
        }));
    }, [collections]);

    return (
        <div className="collection-section pt-4 pb-0 mb-2 -mx-6 md:mx-0">
            {loading ? (
                <div className="px-6 md:px-1 overflow-hidden">
                    {/* A. Popular Collections Skeleton Section */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 w-48 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
                        <div className="hidden md:flex w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 animate-pulse" />
                    </div>
                    
                    <div className="flex gap-5 overflow-x-auto pb-10 scrollbar-hide">
                        {[...Array(6)].map((_, i) => (
                            <div key={`pop-skel-${i}`} className="flex-shrink-0 w-[180px] md:w-[200px]">
                                <CollectionSkeleton index={i} />
                            </div>
                        ))}
                    </div>

                    {/* B. Explore Categories Skeleton Section */}
                    <div className="flex items-center gap-2 mb-4 mt-4">
                        <div className="h-6 w-48 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
                        <div className="hidden md:flex w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 animate-pulse" />
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                        {[...Array(10)].map((_, i) => (
                            <CategorySkeleton key={`cat-skel-${i}`} index={i} />
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {parentsWithChildren.map(({ parent, children }) => {
                        if (parent.type === 'icon') {
                            return (
                                <IconCategoryGroup
                                    key={parent.id}
                                    title={parent.name}
                                    categories={children}
                                    onNavigate={navigate}
                                />
                            );
                        } else {
                            return (
                                <CollectionGroup
                                    key={parent.id}
                                    title={parent.name}
                                    groupCollections={children}
                                    selectedId={selectedId}
                                    onSelectCollection={onSelectCollection}
                                    setEditingCollection={setEditingCollection}
                                    readOnly={readOnly}
                                    canEdit={canEdit}
                                    initialPath={initialPath}
                                    onNavigate={navigate}
                                />
                            );
                        }
                    })}
                </>
            )}

            <EditCollectionModal 
                isOpen={!!editingCollection}
                onClose={() => setEditingCollection(null)}
                onSuccess={() => {
                    fetchCollections();
                    if (editingCollection && selectedId === editingCollection.id) {
                        onSelectCollection(null);
                    }
                }}
                collection={editingCollection}
            />
        </div>
    );
};

export default CollectionBar;
