import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { publicApi, collectionApi } from '../../services/api';
import ListingCard, { ListingImageSlider } from '../../components/Listings/ListingCard';
import ListingSkeleton from '../../components/ui/ListingSkeleton';
import { ArrowLeftIcon, Square2StackIcon, ShareIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { FiHome, FiImage } from "react-icons/fi";
import { IoImagesOutline } from "react-icons/io5";
import { TbSmartHome } from "react-icons/tb";
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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    const scrollContainerRef = useRef(null);
    const resultsRef = useRef(null);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Use a small timeout to ensure the DOM has updated before scrolling
        setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            // Fallback for some browsers/layouts
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 10);
    };

    useEffect(() => {
        fetchCollectionData();

        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollPos = window.scrollY;
                    setScrolled(scrollPos > 50);
                    setHeaderSticky(scrollPos >= (window.innerWidth < 1024 ? window.innerHeight * 0.5 : 400));
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [id]);

    useEffect(() => {
        if (galleryOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
        }
        return () => { 
            document.body.style.overflow = 'unset'; 
            document.documentElement.style.overflow = 'unset';
        };
    }, [galleryOpen]);

    // Reset to page 1 when id changes
    useEffect(() => {
        setCurrentPage(1);
    }, [id]);

    const fetchCollectionData = async () => {
        setLoading(true);
        try {
            const [colRes, listRes] = await Promise.all([
                collectionApi.getPublicCollection(id),
                publicApi.getListings({ collection_id: id, limit: 100 }),
                new Promise(resolve => setTimeout(resolve, 200)) // Artificial delay to show skeleton
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
        let urls = [];
        // 1. Check collection's own media
        if (collection?.media && collection.media.length > 0) {
            urls = collection.media.filter(m => m.type === 'image').map(m => getMediaUrl(m.url));
        } else if (collection?.image) {
            urls = [getMediaUrl(collection.image)];
        }
        
        // 2. Fallback to images from the first few listings if collection has no media
        if (urls.length === 0 && listings.length > 0) {
            // Get images from the first 5 listings to populate a decent gallery
            listings.slice(0, 5).forEach(listing => {
                if (listing.media && listing.media.length > 0) {
                    const listingImages = listing.media
                        .filter(m => m.type === 'image')
                        .map(m => getMediaUrl(m.url));
                    urls = [...urls, ...listingImages];
                }
            });
        }
        
        // Deduplicate
        return [...new Set(urls)];
    }, [collection, listings]);

    const openGallery = (index = 0) => {
        setGalleryIndex(index);
        setGalleryOpen(true);
    };

    const isIconType = collection?.type === 'icon';

    if (initialLoading) return <CollectionDetailSkeleton isIconType={loadingType === 'icon'} />;

    return (
        <div className="bg-white dark:bg-dashboard-dark min-h-screen pb-20 no-scrollbar">
            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar,
                body::-webkit-scrollbar,
                html::-webkit-scrollbar,
                *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
                
                .no-scrollbar, body, html, * { 
                    -ms-overflow-style: none !important; 
                    scrollbar-width: none !important; 
                }
            ` }} />
            {isIconType ? (
                /* --- ICON TYPE --- */
                <div className="max-w-[2520px] mx-auto px-6 md:px-12 lg:px-20">
                    <div className={`sticky top-0 z-40 bg-white/95 dark:bg-dashboard-dark/95 backdrop-blur-md h-[76px] lg:h-[80px] flex items-center justify-between relative -mx-6 px-6 md:mx-0 md:px-0 transition-all duration-300 border-b border-gray-50 dark:border-white/5`}>
                        {/* Mobile Left Section: Back + Title */}
                        <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                            <button
                                onClick={() => navigate(-1)}
                                className="w-[44px] h-[44px] flex-shrink-0 flex items-center justify-center rounded-full bg-white dark:bg-dashboard-card border border-gray-200 dark:border-white/10 hover:border-[#222222] dark:hover:border-white/40 hover:shadow-md hover:-translate-y-[1px] transition-all duration-300 active:scale-[0.98]"
                            >
                                <ArrowLeftIcon className="w-5 h-5 text-gray-800 dark:text-white" strokeWidth={2} />
                            </button>
                            
                            {/* Mobile Title: Left-aligned */}
                            <div className="lg:hidden truncate">
                                <h1 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight truncate">
                                    {collection?.name}
                                </h1>
                            </div>
                        </div>

                        {/* Desktop Center Title */}
                        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-baseline gap-2 text-center pointer-events-none min-w-0 px-4">
                            <h1 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight truncate max-w-[40vw] sm:max-w-[50vw]">
                                {collection?.name}
                            </h1>
                            <span className="text-[12px] text-gray-400 font-medium tracking-wide whitespace-nowrap">
                                ({listings?.length} {listings?.length === 1 ? 'property' : 'properties'})
                            </span>
                        </div>

                        {/* Right Section: Mobile Property Count Pill */}
                        <div className="flex items-center gap-2">
                            <div className="lg:hidden flex items-center px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                                <span className="text-[13px] font-semibold">{listings?.length} properties</span>
                            </div>
                            <div className="hidden lg:block w-[44px]" />
                        </div>
                    </div>

                    <div ref={resultsRef} className="mt-5 md:mt-10">
                        <ListingsGrid 
                            listings={listings} 
                            currentPage={currentPage}
                            itemsPerPage={itemsPerPage}
                            setCurrentPage={handlePageChange}
                            navigate={navigate} 
                        />
                    </div>
                </div>
            ) : (
                /* --- CARD TYPE --- */
                <div className="relative">
                    {/* Hero Section */}
                    <div 
                        className="fixed lg:static top-0 left-0 right-0 w-full h-[65vh] lg:h-[450px] overflow-hidden bg-gray-100 dark:bg-gray-800 z-0 cursor-pointer"
                        style={{ overflowX: 'hidden' }}
                        onClick={() => openGallery(0)}
                    >
                        {heroImages.length > 0 ? (
                            <img 
                                src={heroImages[0]} 
                                alt={collection?.name}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <FiImage className="w-16 h-16 text-gray-300" />
                            </div>
                        )}
                        {/* Overlays - Hidden on desktop as per user request */}
                        <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none lg:hidden" />
                        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black/60 via-black/20 to-transparent z-20 pointer-events-none lg:hidden" />

                        {/* Cinematic 'Shuttle' Blend Gradient (Desktop Only) */}
                        <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#F7F7F7] via-[#F7F7F7]/60 dark:from-dashboard-dark dark:via-dashboard-dark/60 to-transparent z-10 pointer-events-none" />
                    </div>

                    {/* Nav Header */}
                    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || headerSticky ? 'bg-white/95 dark:bg-dashboard-dark/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-white/10' : 'bg-transparent'}`}>
                        <div className="max-w-[2520px] mx-auto px-6 md:px-12 lg:px-20 h-[76px] lg:h-[80px] flex items-center justify-between relative overflow-visible">
                            {/* Mobile Left Section: Back + Title */}
                            <div className="flex items-center gap-3 lg:gap-4 overflow-visible flex-1">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigate(-1)}
                                        className={`w-[44px] h-[44px] flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300 active:scale-[0.98] group ${scrolled || headerSticky ? 'bg-white dark:bg-dashboard-card border border-gray-200 dark:border-white/10 hover:border-[#222222] dark:hover:border-white/40 hover:shadow-md hover:-translate-y-[1px]' : 'bg-white text-gray-900 shadow-md border border-transparent hover:-translate-y-[1px]'}`}
                                    >
                                        <ArrowLeftIcon className={`w-5 h-5 transition-transform ${scrolled || headerSticky ? 'text-gray-800 dark:text-white' : 'text-gray-900'}`} strokeWidth={2} />
                                    </button>
                                    <button
                                        onClick={() => navigate('/')}
                                        className={`hidden lg:flex px-5 h-[44px] flex-shrink-0 items-center justify-center gap-2 rounded-full transition-all duration-300 active:scale-[0.98] group ${scrolled || headerSticky ? 'bg-white dark:bg-dashboard-card border border-gray-200 dark:border-white/10 hover:border-[#222222] dark:hover:border-white/40 hover:shadow-md hover:-translate-y-[1px]' : 'bg-white text-gray-900 shadow-md border border-transparent hover:-translate-y-[1px]'}`}
                                        title="Go to Home"
                                    >
                                        <TbSmartHome className={`w-[22px] h-[22px] transition-transform ${scrolled || headerSticky ? 'text-gray-800 dark:text-white' : 'text-gray-900'}`} />
                                        <span className={`text-[13px] font-bold tracking-tight ${scrolled || headerSticky ? 'text-gray-800 dark:text-white' : 'text-gray-900'}`}>Go to Home</span>
                                    </button>
                                </div>
                                
                                {/* Mobile Title: Left-aligned, bold white when not scrolled */}
                                <div className="lg:hidden truncate">
                                    <h1 className={`text-[17px] font-bold tracking-tight truncate ${scrolled || headerSticky ? 'text-gray-900 dark:text-white' : 'text-white drop-shadow-sm'}`}>
                                        {collection?.name}
                                    </h1>
                                </div>
                            </div>

                            {/* Desktop Center Title (Shows when scrolled) */}
                            <div className={`hidden lg:flex absolute left-1/2 -translate-x-1/2 items-baseline gap-2 text-center transition-all duration-300 ${scrolled || headerSticky ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                                <h1 className="text-[17px] lg:text-[18px] font-bold text-gray-900 dark:text-white tracking-tight truncate max-w-[40vw] sm:max-w-[50vw]">
                                    {collection?.name}
                                </h1>
                                <span className="text-[12px] text-gray-400 font-medium tracking-wide whitespace-nowrap">
                                    ({listings?.length} {listings?.length === 1 ? 'property' : 'properties'})
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Mobile Properties Pill: Right-aligned, solid white pill when not scrolled */}
                                <div className={`lg:hidden flex items-center px-4 py-2 rounded-full transition-all duration-300 ${scrolled || headerSticky ? 'bg-gray-50/50 dark:bg-white/5 text-gray-600 dark:text-gray-400' : 'bg-white text-gray-900 font-bold shadow-md'}`}>
                                    <span className="text-[13px] font-bold tracking-tight">{listings?.length} properties</span>
                                </div>

                                <button 
                                    onClick={() => openGallery(0)} 
                                    className={`hidden lg:flex items-center justify-center gap-2 px-6 h-[44px] rounded-full transition-all duration-300 active:scale-[0.98] group ${scrolled || headerSticky ? 'bg-[#1A1A1A] text-white border border-transparent hover:shadow-md hover:-translate-y-[1px]' : 'bg-white text-gray-900 shadow-md border border-transparent hover:-translate-y-[1px]'}`}
                                >
                                    <IoImagesOutline className="w-[22px] h-[22px]" />
                                    <span className="text-[13px] font-bold tracking-tight">View Images</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Center Title Overlay */}
                    <div className={`hidden lg:flex absolute top-[180px] left-0 right-0 z-20 flex-col items-center pointer-events-none transition-all duration-500 ${scrolled || headerSticky ? 'opacity-0 scale-95 translate-y-10' : 'opacity-100 scale-100 translate-y-0'}`}>
                        <h2 className="text-5xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] tracking-tight text-center">
                            {collection?.name}
                        </h2>
                        <p className="mt-4 text-[15px] font-bold text-white/90 tracking-wide drop-shadow-md">
                            {listings.length} Exclusive Properties
                        </p>
                    </div>

                    {/* Content Section */}
                    <div className="relative z-30 pointer-events-none lg:pointer-events-auto">
                        {/* High-Overlap Content Container - Reduced on desktop since hero is not fixed */}
                        <div className="h-[60vh] lg:hidden" /> 
                        
                        <div className="bg-[#F7F7F7] dark:bg-dashboard-dark rounded-t-[28px] lg:rounded-none shadow-[0_-25px_60px_rgba(0,0,0,0.2)] lg:shadow-none min-h-screen relative -mt-16 lg:mt-0 overflow-hidden pointer-events-auto">
                            {/* Mobile Drag Handle Area */}
                            <div className="lg:hidden flex flex-col items-center pt-4 pb-2">
                                <div className="w-12 h-1.5 bg-gray-200/80 dark:bg-white/10 rounded-full" />
                            </div>
                            
                            <div ref={resultsRef} className="max-w-[2520px] mx-auto px-6 md:px-12 lg:px-20 pt-2 lg:pt-12 pb-20">
                                <ListingsGrid 
                                    listings={listings} 
                                    currentPage={currentPage}
                                    itemsPerPage={itemsPerPage}
                                    setCurrentPage={handlePageChange}
                                    navigate={navigate} 
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
                    <div className="max-w-[2520px] mx-auto px-6 md:px-12 lg:px-20 h-[76px] lg:h-[80px] flex items-center justify-between relative">
                        <div className="w-[44px] h-[44px] rounded-full bg-gray-100 dark:bg-white/10 animate-pulse" />
                        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                            <div className="h-5 w-32 bg-gray-100 dark:bg-white/10 rounded-full animate-pulse" />
                        </div>
                        <div className="hidden lg:block w-[44px] h-[44px] rounded-full bg-gray-100 dark:bg-white/10 animate-pulse" />
                    </div>
                </div>
                
                {/* Content Area */}
                <div className="pt-[100px] max-w-[2520px] mx-auto px-6 md:px-12 lg:px-20 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
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
            <div className={`fixed top-0 left-0 right-0 z-50`}>
                <div className="max-w-[2520px] mx-auto px-6 md:px-12 lg:px-20 h-[76px] lg:h-[80px] flex items-center justify-between relative">
                    <div className="w-[44px] h-[44px] rounded-full bg-white dark:bg-white/10 shadow-sm animate-pulse" />
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                        <div className="h-5 w-32 bg-white/20 rounded-full animate-pulse" />
                    </div>
                    <div className="hidden lg:block w-[44px] h-[44px] rounded-full bg-white dark:bg-white/10 shadow-sm animate-pulse" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="relative z-30">
                <div className="h-[60vh] lg:h-[420px]" />
                <div className="bg-white dark:bg-dashboard-dark rounded-t-[44px] shadow-[0_-25px_60px_rgba(0,0,0,0.1)] min-h-screen relative -mt-16 lg:-mt-10 overflow-hidden">
                    <div className="lg:hidden flex flex-col items-center pt-2.5 mb-6">
                        <div className="w-16 h-1 bg-gray-100 dark:bg-white/5 rounded-full" />
                    </div>
                    
                    <div className="max-w-[2520px] mx-auto px-6 md:px-12 lg:px-20 pt-1 lg:pt-6 pb-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
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

const ListingsGrid = ({ listings, currentPage, itemsPerPage, setCurrentPage, navigate }) => {
    const totalPages = Math.ceil(listings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const visibleListings = listings.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="relative min-h-[400px]">
            {listings.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
                        {visibleListings.map((listing, idx) => (
                            <div key={listing.id} className="animate-fadeInUp" style={{ animationDelay: `${(idx % 4) * 100}ms` }}>
                                <ListingCard listing={listing} viewMode="grid" showSave={true} />
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <>
                            <div className="mt-16 flex items-center justify-center gap-8">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 border ${
                                        currentPage === 1 
                                        ? 'bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-300 cursor-not-allowed' 
                                        : 'bg-[#222222] dark:bg-white border-transparent dark:border-transparent text-white dark:text-[#222222] hover:bg-black dark:hover:bg-gray-100 hover:shadow-md active:scale-95'
                                    }`}
                                >
                                    <ChevronLeftIcon className="w-5 h-5" strokeWidth={2.5} />
                                </button>

                                <div className="flex flex-col items-center">
                                    <span className="text-[15px] font-semibold text-gray-900 dark:text-white">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 border ${
                                        currentPage === totalPages 
                                        ? 'bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-300 cursor-not-allowed' 
                                        : 'bg-[#222222] dark:bg-white border-transparent dark:border-transparent text-white dark:text-[#222222] hover:bg-black dark:hover:bg-gray-100 hover:shadow-md active:scale-95'
                                    }`}
                                >
                                    <ChevronRightIcon className="w-5 h-5" strokeWidth={2.5} />
                                </button>
                            </div>
                            {/* Mobile-only spacer so the bottom nav bar never overlaps the pagination */}
                            <div className="block lg:hidden h-24" />
                        </>
                    )}
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
    const [currentIdx, setCurrentIdx] = useState(galleryIndex ?? 0);
    const total = heroImages?.length ?? 0;
    const touchStartX = useRef(0);

    // Sync initial index when opened
    useEffect(() => {
        if (galleryOpen) setCurrentIdx(galleryIndex ?? 0);
    }, [galleryOpen, galleryIndex]);

    const scrollTo = useCallback((idx) => {
        if (idx >= 0 && idx < total) {
            setCurrentIdx(idx);
        }
    }, [total]);

    const goPrev = useCallback(() => {
        if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
    }, [currentIdx]);

    const goNext = useCallback(() => {
        if (currentIdx < total - 1) setCurrentIdx(currentIdx + 1);
    }, [currentIdx, total]);

    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback((e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const deltaX = touchEndX - touchStartX.current;
        if (deltaX > 50) {
            goPrev();
        } else if (deltaX < -50) {
            goNext();
        }
    }, [goPrev, goNext]);

    // Keyboard navigation
    useEffect(() => {
        if (!galleryOpen || total <= 1) return;
        const onKey = (e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
            else if (e.key === 'Escape') setGalleryOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [galleryOpen, goPrev, goNext, total, setGalleryOpen]);

    if (!galleryOpen || !heroImages?.length) return null;

    const currentUrl = heroImages[currentIdx] ?? heroImages[0];

    return (
        <div className="fixed inset-0 z-[10000] flex flex-col overflow-hidden" style={{ background: '#000' }}>
            <style dangerouslySetInnerHTML={{ __html: `
                .gallery-no-scroll::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
                .gallery-no-scroll { -ms-overflow-style: none !important; scrollbar-width: none !important; }
            ` }} />
            {/* Blurred background from current image */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <img
                    key={currentIdx}
                    src={currentUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
                    style={{ filter: 'blur(28px) brightness(0.35) saturate(1.2)', transform: 'scale(1.1)' }}
                    draggable={false}
                />
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Header — standard size */}
            <header className="absolute top-0 left-0 right-0 z-50 h-[76px] lg:h-[80px] bg-gradient-to-b from-black/40 to-transparent">
                <div className="max-w-[2520px] mx-auto w-full h-full flex items-center justify-between px-4 md:px-6 lg:px-20">
                    <button
                        onClick={() => setGalleryOpen(false)}
                        className="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all group"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-white stroke-[2] group-hover:-translate-x-0.5 transition-transform" />
                    </button>

                    <span className="absolute left-1/2 -translate-x-1/2 text-[17px] font-bold text-white truncate max-w-[50vw] pointer-events-none">
                        {collection?.name}
                    </span>

                    <div className="w-[44px]" />
                </div>
            </header>

            {/* Image area */}
            <div className="relative flex-1 min-h-0 flex items-center justify-center z-10">
                <div className="w-full h-full relative overflow-hidden">
                    <div
                        className="w-full h-full mx-auto relative overflow-hidden flex items-center justify-center"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {heroImages.map((img, i) => {
                            const isActive = i === currentIdx;
                            return (
                                <div
                                    key={i}
                                    className={`absolute inset-0 flex items-center justify-center p-4 select-none transition-all duration-500 ease-out ${
                                        isActive 
                                            ? 'opacity-100 scale-100 z-10 pointer-events-auto' 
                                            : 'opacity-0 scale-[0.97] z-0 pointer-events-none'
                                    }`}
                                >
                                    <img
                                        src={img}
                                        alt=""
                                        className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-2xl pointer-events-none rounded-2xl md:rounded-[23px]"
                                        draggable={false}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {total > 1 && (
                        <>
                            {currentIdx > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); goPrev(); }}
                                    className="hidden md:flex absolute left-4 md:left-8 lg:left-20 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center active:scale-95 transition-all group"
                                >
                                    <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2} />
                                </button>
                            )}
                            {currentIdx < total - 1 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); goNext(); }}
                                    className="hidden md:flex absolute right-4 md:right-8 lg:left-auto lg:right-20 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center active:scale-95 transition-all group"
                                >
                                    <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
            {/* Dots */}
            {total > 1 && (
                <div className="flex-none min-h-[72px] pt-2 pb-4 flex flex-col justify-center items-center z-10">
                    <div className="flex items-center justify-center gap-2 mb-4 px-4 overflow-x-auto max-w-full" style={{ scrollbarWidth: 'none' }}>
                        {(() => {
                            const maxDots = 5;
                            let startIndex = 0;
                            if (total > maxDots) {
                                startIndex = Math.max(0, Math.min(currentIdx - 2, total - maxDots));
                            }
                            return heroImages.slice(startIndex, startIndex + maxDots).map((_, i) => {
                                const actualIndex = startIndex + i;
                                const isActive = actualIndex === currentIdx;
                                return (
                                    <button
                                        key={actualIndex}
                                        onClick={() => scrollTo(actualIndex)}
                                        className={`h-1.5 rounded-full flex-shrink-0 transition-all duration-300 ease-out ${
                                            isActive 
                                                ? 'w-5 bg-white shadow-sm' 
                                                : 'w-1.5 bg-white/40'
                                        }`}
                                    />
                                );
                            });
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollectionDetailPage;
