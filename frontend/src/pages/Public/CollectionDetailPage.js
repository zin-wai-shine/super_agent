import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { publicApi, collectionApi } from '../../services/api';
import ListingCard, { ListingImageSlider } from '../../components/Listings/ListingCard';
import ListingSkeleton from '../../components/ui/ListingSkeleton';
import { ArrowLeftIcon, Square2StackIcon } from '@heroicons/react/24/outline';
import { FiHome, FiImage } from "react-icons/fi";
import { getMediaUrl } from '../../utils/media';

const CollectionDetailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [collection, setCollection] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get immediate loading hint from navigation state
    const loadingType = location.state?.loadingType || (collection?.type === 'icon' ? 'icon' : null);
    
    const { theme } = useTheme();
    const outletContext = useOutletContext() || {};
    const { navVisible = true } = outletContext;
    const [scrolled, setScrolled] = useState(false);
    const [headerSticky, setHeaderSticky] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(12);
    const observerTarget = React.useRef(null);

    useEffect(() => {
        fetchCollectionData();

        const handleScroll = () => {
            const scrollPos = window.scrollY;
            setScrolled(scrollPos > 50);
            setHeaderSticky(scrollPos >= (window.innerWidth < 1024 ? window.innerHeight * 0.5 : 400));
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [id]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loading && visibleCount < listings.length) {
                    setTimeout(() => {
                        setVisibleCount(prev => prev + 12);
                    }, 500);
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => { if (observerTarget.current) observer.unobserve(observerTarget.current); };
    }, [loading, listings.length, visibleCount]);

    const fetchCollectionData = async () => {
        setLoading(true);
        try {
            const [colRes, listRes] = await Promise.all([
                collectionApi.getPublicCollection(id),
                publicApi.getListings({ collection_id: id, limit: 100 }),
                new Promise(resolve => setTimeout(resolve, 800)) // Artificial delay to show skeleton
            ]);
            
            setCollection(colRes.data || null);
            setListings(listRes.data.listings || []);
        } catch (error) {
            console.error('Failed to fetch collection detail:', error);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    };

    const heroImages = React.useMemo(() => {
        if (!collection?.media) return [];
        return collection.media.filter(m => m.type === 'image').map(m => getMediaUrl(m.url));
    }, [collection]);

    const openGallery = (index = 0) => {
        setGalleryIndex(index);
        setGalleryOpen(true);
    };

    const isIconType = collection?.type === 'icon';

    if (initialLoading) return <CollectionDetailSkeleton isIconType={loadingType === 'icon'} />;

    return (
        <div className="bg-white dark:bg-dashboard-dark min-h-screen pb-20">
            {isIconType ? (
                /* --- ICON TYPE --- */
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
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
                            <div className="flex flex-col">
                                <h1 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight truncate max-w-[40vw] sm:max-w-[50vw]">
                                    {collection?.name}
                                </h1>
                                <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                                    {listings.length} properties
                                </span>
                            </div>
                        </div>
                        <div className="w-10" />
                    </div>

                    <ListingsGrid 
                        listings={listings} 
                        visibleCount={visibleCount}
                        navigate={navigate} 
                        observerTarget={observerTarget}
                    />
                </div>
            ) : (
                /* --- CARD TYPE --- */
                <div className="relative">
                    {/* Hero Section */}
                    <div 
                        className="fixed top-0 left-0 right-0 w-full h-[65vh] lg:h-[500px] overflow-hidden bg-gray-100 dark:bg-gray-800 z-0 cursor-pointer"
                        onClick={() => openGallery(0)}
                    >
                        {heroImages.length > 0 ? (
                            <ListingImageSlider 
                                images={heroImages} 
                                title={collection?.name} 
                                cardLink="#" 
                                onImageClick={openGallery}
                                showArrows={true}
                                showDots={true}
                                className="w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <FiImage className="w-16 h-16 text-gray-300" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none" />
                        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black/60 via-black/20 to-transparent z-20 pointer-events-none" />
                    </div>

                    {/* Nav Header */}
                    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || headerSticky ? 'bg-white/95 dark:bg-dashboard-dark/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-white/10' : 'bg-transparent'}`}>
                        <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-4 flex items-center justify-between relative">
                            <button
                                onClick={() => navigate(-1)}
                                className={`w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 ${scrolled || headerSticky ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'bg-white text-gray-900 shadow-md'}`}
                            >
                                <ArrowLeftIcon className="w-6 h-6" />
                            </button>

                            <div className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-300 ${scrolled || headerSticky ? 'opacity-100 translate-y-0' : 'opacity-100 lg:opacity-0 translate-y-0 lg:-translate-y-2 pointer-events-none'}`}>
                                <h1 className={`text-[16px] lg:text-[18px] font-bold truncate max-w-[50vw] transition-colors ${scrolled || headerSticky ? 'text-gray-900 dark:text-white' : 'text-white drop-shadow-md'}`}>
                                    {collection?.name}
                                </h1>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className={`lg:hidden h-10 px-4 flex items-center justify-center rounded-full font-bold text-[13px] transition-all duration-300 ${scrolled || headerSticky ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'bg-white text-gray-900 shadow-md'}`}>
                                    {listings.length} properties
                                </div>
                                <button onClick={() => openGallery(0)} className={`hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${scrolled || headerSticky ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 shadow-lg'}`}>
                                    <FiImage className="w-4 h-4" />
                                    <span className="text-[13px] font-bold">View Images</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Center Title Overlay */}
                    <div className={`hidden lg:flex fixed top-[200px] left-0 right-0 z-20 flex-col items-center pointer-events-none transition-all duration-500 ${scrolled || headerSticky ? 'opacity-0 scale-95 translate-y-10' : 'opacity-100 scale-100 translate-y-0'}`}>
                        <h2 className="text-5xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] tracking-tight text-center">
                            {collection?.name}
                        </h2>
                        <p className="mt-4 text-[15px] font-bold text-white/90 uppercase tracking-[0.2em] drop-shadow-md">
                            {listings.length} Exclusive Properties
                        </p>
                    </div>

                    {/* Content Section */}
                    <div className="relative z-30">
                        {/* High-Overlap Content Container */}
                        <div className="h-[60vh] lg:h-[420px]" /> {/* Spacer */}
                        
                        <div className="bg-[#F7F7F7] dark:bg-dashboard-dark rounded-t-[44px] shadow-[0_-25px_60px_rgba(0,0,0,0.2)] min-h-screen relative -mt-32 lg:-mt-20 overflow-hidden">
                            {/* Mobile Drag Handle Area */}
                            <div className="lg:hidden flex flex-col items-center pt-2.5">
                                <div className="w-16 h-1 bg-gray-200 dark:bg-white/10 rounded-full" />
                            </div>
                            
                            <div className="max-w-[1440px] mx-auto px-5 lg:px-20 pt-1 lg:pt-6 pb-20">
                                <ListingsGrid 
                                    listings={listings} 
                                    visibleCount={visibleCount}
                                    navigate={navigate} 
                                    observerTarget={observerTarget}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Gallery Modal */}
            <GalleryModal 
                galleryOpen={galleryOpen} 
                setGalleryOpen={setGalleryOpen} 
                heroImages={heroImages} 
                collection={collection} 
                galleryIndex={galleryIndex} 
            />
        </div>
    );
};

const CollectionDetailSkeleton = ({ isIconType }) => {
    if (isIconType) {
        return (
            <div className="bg-white dark:bg-dashboard-dark min-h-screen animate-pulse">
                {/* Minimal Header Skeleton */}
                <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-dashboard-dark/90 backdrop-blur-md border-b border-gray-100 dark:border-white/10">
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-4 flex items-center justify-between relative">
                        <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-white/10" />
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-4 w-32 bg-gray-100 dark:bg-white/10 rounded-full" />
                            <div className="h-3 w-20 bg-gray-50 dark:bg-white/5 rounded-full" />
                        </div>
                        <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-white/10 lg:w-24 lg:h-10 lg:rounded-full" />
                    </div>
                </div>
                
                {/* Content Area */}
                <div className="pt-24 max-w-[1440px] mx-auto px-5 lg:px-20 pb-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
                        {[...Array(8)].map((_, i) => (
                            <ListingSkeleton key={i} viewMode="grid" index={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-dashboard-dark min-h-screen animate-pulse">
            {/* Hero Skeleton */}
            <div className="fixed top-0 left-0 right-0 w-full h-[65vh] lg:h-[500px] bg-gray-100 dark:bg-white/5 flex items-center justify-center z-0">
                <FiImage className="w-16 h-16 text-gray-200 dark:text-white/10" />
            </div>

            {/* Header Skeleton */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-4 flex items-center justify-between relative">
                    <div className="w-11 h-11 rounded-full bg-white dark:bg-white/10 shadow-sm" />
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-4 w-32 bg-white/20 rounded-full" />
                        <div className="h-3 w-20 bg-white/10 rounded-full" />
                    </div>
                    <div className="w-24 h-10 rounded-full bg-white dark:bg-white/10 shadow-sm" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="relative z-30">
                <div className="h-[60vh] lg:h-[420px]" />
                <div className="bg-white dark:bg-dashboard-dark rounded-t-[44px] shadow-[0_-25px_60px_rgba(0,0,0,0.1)] min-h-screen relative -mt-32 lg:-mt-20 overflow-hidden">
                    <div className="lg:hidden flex flex-col items-center pt-2.5 mb-6">
                        <div className="w-16 h-1 bg-gray-100 dark:bg-white/5 rounded-full" />
                    </div>
                    
                    <div className="max-w-[1440px] mx-auto px-5 lg:px-20 pt-1 lg:pt-6 pb-20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
                            {[...Array(8)].map((_, i) => (
                                <ListingSkeleton key={i} viewMode="grid" index={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ListingsGrid = ({ listings, visibleCount, navigate, observerTarget }) => {
    const visibleListings = listings.slice(0, visibleCount);
    const hasMore = visibleCount < listings.length;

    return (
        <div className="relative min-h-[400px]">
            {listings.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
                        {visibleListings.map((listing, idx) => (
                            <div key={listing.id} className="animate-fadeInUp" style={{ animationDelay: `${(idx % 4) * 100}ms` }}>
                                <ListingCard listing={listing} viewMode="grid" showSave={true} />
                            </div>
                        ))}
                        
                        {hasMore && (
                            [...Array(4)].map((_, i) => (
                                <div key={`skeleton-${i}`} ref={i === 0 ? observerTarget : null}>
                                    <ListingSkeleton viewMode="grid" index={i} />
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                <div className="text-center py-24 animate-fadeInUp">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiHome className="h-10 w-10 text-gray-300" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">This collection is empty</h2>
                    <button onClick={() => navigate('/listings')} className="mt-8 inline-flex items-center px-10 py-4 rounded-full text-white bg-gray-900 dark:bg-white dark:text-dashboard-dark font-bold transition-all shadow-xl">
                        Browse Properties
                    </button>
                </div>
            )}
        </div>
    );
};

const GalleryModal = ({ galleryOpen, setGalleryOpen, heroImages, collection, galleryIndex }) => {
    if (!galleryOpen) return null;
    return (
        <div className="fixed inset-0 z-[10000] bg-black flex flex-col animate-fadeIn overflow-hidden">
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
                <div className="w-full h-full max-w-[1440px] mx-auto">
                    <ListingImageSlider 
                        images={heroImages} 
                        title={collection?.name} 
                        cardLink="#" 
                        initialIndex={galleryIndex}
                        isGalleryMode={true}
                    />
                </div>
            </div>
            <div className="relative z-10 border-b border-white/5 bg-black/60 backdrop-blur-xl">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-3 flex items-center justify-between">
                    <button onClick={() => setGalleryOpen(false)} className="w-10 h-10 flex items-center justify-center text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <span className="text-white font-semibold">{collection?.name} Gallery</span>
                    <div className="w-10" />
                </div>
            </div>
        </div>
    );
};

export default CollectionDetailPage;
