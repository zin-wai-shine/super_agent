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
        <div className="collection-group-section mb-10">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-5 px-6 md:px-0">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-800 hidden md:block"></div>
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 hidden md:block">
                        {groupCollections.length} collections
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handleScroll('left')}
                            disabled={!canScrollLeft}
                            className={`w-9 h-9 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center transition-all ${canScrollLeft ? 'bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'opacity-20 cursor-not-allowed text-gray-400'}`}
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleScroll('right')}
                            disabled={!canScrollRight}
                            className={`w-9 h-9 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center transition-all ${canScrollRight ? 'bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'opacity-20 cursor-not-allowed text-gray-400'}`}
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Horizontal Cards Container */}
            <div className="relative">
                <div 
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide px-6 md:px-0 scroll-smooth"
                >
                    {groupCollections.map((collection, i) => (
                        <div key={collection.id} className="relative flex-shrink-0 w-[160px] md:w-[200px]">
                            <CollectionCard
                                collection={collection}
                                isSelected={selectedId === collection.id}
                                onSelect={onSelectCollection}
                                onEdit={setEditingCollection}
                                readOnly={readOnly}
                                canEdit={canEdit}
                                initialPath={initialPath}
                                animateEntrance={false}
                                index={i}
                                className="relative z-10"
                            />
                        </div>
                    ))}

                    <div 
                        className="flex-shrink-0 w-[160px] md:w-[200px] group cursor-pointer"
                        onClick={() => onNavigate('/collections')}
                    >
                        <div className="relative aspect-[1/1] md:aspect-[4/3] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-[24px] overflow-hidden mb-3 transition-colors group-hover:bg-gray-100 dark:group-hover:bg-white/10">
                            <div className="w-full h-full flex items-center justify-center">
                                <ArrowSmallRightIcon className="w-8 h-8 text-gray-300 group-hover:text-primary-500 transition-colors" />
                            </div>
                        </div>
                        <div className="px-1">
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-0.5">View More</p>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">See all</h3>
                        </div>
                    </div>
                </div>
            </div>
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
    const [isAllCategoriesOpen, setIsAllCategoriesOpen] = useState(false);

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

    const { mainCategories, popularChildren, categorizedChildren } = React.useMemo(() => {
        const main = collections.filter(c => !c.parent_id && !!c.icon);
        const popular = collections.filter(c => !c.icon && !c.parent_id);
        const categorized = collections.filter(c => !c.icon && !!c.parent_id);
        
        return { mainCategories: main, popularChildren: popular, categorizedChildren: categorized };
    }, [collections]);

    const categoriesScrollRef = useRef(null);
    const [canScrollLeftCats, setCanScrollLeftCats] = useState(false);
    const [canScrollRightCats, setCanScrollRightCats] = useState(false);

    const checkCategoriesScroll = () => {
        if (categoriesScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = categoriesScrollRef.current;
            setCanScrollLeftCats(scrollLeft > 1);
            setCanScrollRightCats(scrollLeft + clientWidth < scrollWidth - 1);
        }
    };

    useEffect(() => {
        checkCategoriesScroll();
        const currentRef = categoriesScrollRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', checkCategoriesScroll);
            window.addEventListener('resize', checkCategoriesScroll);
            // Also check after categories might have rendered
            setTimeout(checkCategoriesScroll, 100);
            return () => {
                currentRef.removeEventListener('scroll', checkCategoriesScroll);
                window.removeEventListener('resize', checkCategoriesScroll);
            };
        }
    }, [mainCategories]);

    const scrollCategories = (direction) => {
        if (categoriesScrollRef.current) {
            const scrollAmount = window.innerWidth < 768 ? 300 : 500;
            categoriesScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="collection-section py-2 mb-6 -mx-6 md:mx-0">
            {loading ? (
                <div className="px-6 md:px-0">
                    <div className="h-6 w-48 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse mb-6" />
                    <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide">
                        {[...Array(6)].map((_, i) => (
                            <div key={`pop-skel-${i}`} className="flex-shrink-0 w-[160px] md:w-[200px]">
                                <CollectionSkeleton index={i} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* 1. Popular Collections Section (Standalone children) */}
                    <CollectionGroup
                        title={(() => {
                            let popName = 'Popular Collections';
                            try {
                                const custom = JSON.parse(localStorage.getItem('popular_collection_custom'));
                                if (custom) popName = custom.name || popName;
                            } catch (e) {}
                            return popName;
                        })()}
                        groupCollections={popularChildren}
                        selectedId={selectedId}
                        onSelectCollection={onSelectCollection}
                        setEditingCollection={setEditingCollection}
                        readOnly={readOnly}
                        canEdit={canEdit}
                        initialPath={initialPath}
                        onNavigate={navigate}
                    />

                    {/* 2. Main Categories Section (Icons scroll) */}
                    {mainCategories.length > 0 && (
                        <div className={`${readOnly ? 'mb-0' : 'mb-6'}`}>
                            <div className="flex items-center justify-between mb-5 px-6 md:px-0">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Browse Categories
                                </h2>

                                {/* Scroll Buttons */}
                                <div className="hidden md:flex items-center gap-2">
                                    <button
                                        onClick={() => scrollCategories('left')}
                                        disabled={!canScrollLeftCats}
                                        className={`w-9 h-9 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center transition-all ${canScrollLeftCats ? 'bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-900 dark:text-white shadow-sm active:scale-95' : 'opacity-20 cursor-not-allowed text-gray-400'}`}
                                    >
                                        <ChevronLeftIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => scrollCategories('right')}
                                        disabled={!canScrollRightCats}
                                        className={`w-9 h-9 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center transition-all ${canScrollRightCats ? 'bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-900 dark:text-white shadow-sm active:scale-95' : 'opacity-20 cursor-not-allowed text-gray-400'}`}
                                    >
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div 
                                ref={categoriesScrollRef}
                                className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide px-6 md:px-0 scroll-smooth"
                            >
                                {mainCategories.slice(0, 10).map((category) => {
                                    // Dynamic icon resolver
                                    const Icon = MdIcons[category.icon] || 
                                                 FaIcons[category.icon] || 
                                                 HiIcons[category.icon] || 
                                                 BsIcons[category.icon] || 
                                                 FolderIcon;
                                                 
                                    return (
                                        <div 
                                            key={category.id}
                                            onClick={() => navigate(`/collections?category=${category.id}`)}
                                            className="flex-shrink-0 group cursor-pointer"
                                        >
                                            <div className="h-14 min-w-[max-content] px-4 rounded-xl bg-white dark:bg-dashboard-card border border-gray-100 dark:border-gray-800 flex flex-row items-center gap-3 transition-all hover:border-primary-500/30 hover:shadow-md active:scale-95">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-primary-600 flex-shrink-0 transition-colors">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                                                    {category.name}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {mainCategories.length > 10 && (
                                    <div 
                                        onClick={() => setIsAllCategoriesOpen(true)}
                                        className="flex-shrink-0 group cursor-pointer"
                                    >
                                        <div className="h-14 min-w-[max-content] px-4 rounded-xl bg-gray-900 dark:bg-white flex flex-row items-center gap-3 transition-all hover:bg-black dark:hover:bg-gray-100 active:scale-95">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 dark:bg-black/10 flex items-center justify-center text-white dark:text-gray-900 flex-shrink-0">
                                                <FiGrid className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold text-white dark:text-gray-900 whitespace-nowrap">
                                                All Categories
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
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

            <AllCategoriesModal 
                isOpen={isAllCategoriesOpen}
                onClose={() => setIsAllCategoriesOpen(false)}
                categories={mainCategories}
            />
        </div>
    );
};

export default CollectionBar;
