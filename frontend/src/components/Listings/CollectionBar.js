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

const CollectionBar = ({ 
    onSelectCollection, 
    selectedId, 
    readOnly = false,
    canEdit = true,
    refreshTrigger = 0,
    initialPath = '/listings'
}) => {
    const navigate = useNavigate();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const scrollRef = useRef(null);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 1);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
        }
    };

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const response = readOnly 
                ? await collectionApi.getPublicCollections()
                : await collectionApi.getCollections();
            setCollections(response.data || []);
            // Check scroll after data loads
            setTimeout(checkScroll, 100);
        } catch (error) {
            console.error('Failed to fetch collections:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, [refreshTrigger, readOnly]);

    useEffect(() => {
        const currentRef = scrollRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            return () => {
                currentRef.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, [collections]);

    const handleScroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = window.innerWidth < 768 ? 300 : 500;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="collection-section py-6 mb-12 -mx-6 md:mx-0">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8 px-6 md:px-1">
                <div className="flex items-center gap-2">
                    <h2 className="text-[18px] md:text-[22px] font-semibold text-[#222222] dark:text-white tracking-tight">
                        Popular Collections
                    </h2>
                    {/* Desktop Arrow Button (next to text) */}
                    <button className="hidden md:flex w-8 h-8 rounded-full bg-[#F7F7F7] dark:bg-gray-800/60 items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <ArrowSmallRightIcon className="w-4 h-4 text-[#222222] dark:text-white stroke-[2.0]" />
                    </button>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* Mobile Arrow Button (at right end) */}
                    <button className="md:hidden w-8 h-8 rounded-full bg-[#F7F7F7] dark:bg-gray-800/60 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <ArrowSmallRightIcon className="w-4 h-4 text-[#222222] dark:text-white stroke-[2.0]" />
                    </button>

                    {/* Scroll Buttons (Desktop only) */}
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
                    {/* Collection Cards */}
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-[180px] md:w-[200px]">
                                <CollectionSkeleton index={i} />
                            </div>
                        ))
                    ) : (
                        <>
                            {collections.slice(0, 10).map((collection, i) => (
                                <div key={collection.id} className="relative flex-shrink-0 w-[180px] md:w-[200px]">
                                    {/* Layer 1: Skeleton background during transition */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        <CollectionSkeleton index={i} isExiting={true} />
                                    </div>
                                    {/* Layer 2: Real card with slide entrance */}
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

                            {/* "See all" Card - Always show if collections exist */}
                            {collections.length > 0 && (
                                <div 
                                    className="flex-shrink-0 w-[180px] md:w-[200px] group cursor-pointer animate-fillIn"
                                    onClick={() => navigate('/collections')}
                                >
                                    <div className="relative aspect-[1/1] md:aspect-[4/3] bg-white dark:bg-dashboard-card border border-gray-100 dark:border-white/10 shadow-sm rounded-[23px] overflow-hidden mb-3 transition-all duration-300 group-hover:shadow-md">
                                        <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                                            {/* Stacked Images Effect */}
                                            <div className="relative w-[75%] h-[75%]">
                                                {/* Back image */}
                                                <div className="absolute top-0 right-0 w-[65%] h-[65%] bg-gray-100 rounded-[14px] rotate-12 -translate-y-2 translate-x-3 border-[3px] border-white dark:border-dashboard-card shadow-md overflow-hidden opacity-40">
                                                    {collections[2]?.media?.find(m => m.type === 'image') && (
                                                        <img src={getMediaUrl(collections[2].media.find(m => m.type === 'image').url)} className="w-full h-full object-cover" alt="" />
                                                    )}
                                                </div>
                                                {/* Middle image */}
                                                <div className="absolute top-0 left-0 w-[70%] h-[70%] bg-gray-200 rounded-[14px] -rotate-6 translate-y-2 -translate-x-3 border-[3px] border-white dark:border-dashboard-card shadow-lg overflow-hidden opacity-70">
                                                    {collections[1]?.media?.find(m => m.type === 'image') && (
                                                        <img src={getMediaUrl(collections[1].media.find(m => m.type === 'image').url)} className="w-full h-full object-cover" alt="" />
                                                    )}
                                                </div>
                                                {/* Front image */}
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] h-[75%] bg-gray-50 rounded-[14px] translate-y-3 border-[3px] border-white dark:border-dashboard-card shadow-xl overflow-hidden">
                                                    {collections[0]?.media?.find(m => m.type === 'image') && (
                                                        <img src={getMediaUrl(collections[0].media.find(m => m.type === 'image').url)} className="w-full h-full object-cover" alt="" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-1">
                                        {/* Spacer to align with other cards that have count text */}
                                        <div className="h-4" /> 
                                        <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white leading-tight">See all</h3>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>


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
