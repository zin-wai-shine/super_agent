import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { publicApi, collectionApi } from '../../services/api';
import ListingCard, { ListingImageSlider } from '../../components/Listings/ListingCard';
import ListingSkeleton from '../../components/ui/ListingSkeleton';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { FiHome } from "react-icons/fi";
import { getMediaUrl } from '../../utils/media';

const CollectionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [collection, setCollection] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const outletContext = useOutletContext() || {};
    const { navVisible = true } = outletContext;
    const [scrolled, setScrolled] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(3);
    const observerTarget = React.useRef(null);

    useEffect(() => {
        fetchCollectionData();

        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [id]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loading && visibleCount < listings.length) {
                    // Simulate a small delay for "lazy loading" feel as requested
                    setTimeout(() => {
                        setVisibleCount(prev => prev + 3);
                    }, 800);
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
                new Promise(resolve => setTimeout(resolve, 1000)) // Force skeleton visibility for 1s
            ]);
            
            setCollection(colRes.data || null);
            setListings(listRes.data.listings || []);
        } catch (error) {
            console.error('Failed to fetch collection detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const heroImages = React.useMemo(() => {
        if (!collection?.media) return [];
        return collection.media.filter(m => m.type === 'image').map(m => getMediaUrl(m.url));
    }, [collection]);

    const openGallery = (index) => {
        setGalleryIndex(index);
        setGalleryOpen(true);
    };

    return (
        <div className="bg-[#F7F7F7] dark:bg-dashboard-dark min-h-screen">
            {/* --- MOBILE ONLY: Immersive UX --- */}
            <div className="lg:hidden">
                {/* 1. Fixed Hero Header (Background) */}
                <div className="fixed top-0 left-0 right-0 w-full h-[55vh] md:h-[60vh] overflow-hidden bg-gray-200 dark:bg-gray-800 z-0">
                    {!loading && heroImages.length > 0 ? (
                        <div className="w-full h-full">
                            <ListingImageSlider 
                                images={heroImages} 
                                title={collection?.name} 
                                cardLink="#" 
                                arrowPadding="6"
                                onImageClick={openGallery}
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <FiHome className="w-12 h-12 text-gray-300 animate-pulse" />
                        </div>
                    )}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 to-transparent z-40 pointer-events-none" />
                </div>

                {/* 2. Floating Header (Fixed at Top) */}
                <div className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-500 border-b ${scrolled ? 'bg-white/95 dark:bg-dashboard-dark/95 backdrop-blur-xl border-gray-100 dark:border-white/10 shadow-sm' : 'bg-transparent border-transparent pointer-events-none'}`}>
                    <div className="flex items-center gap-4 pointer-events-auto">
                        <button
                            onClick={() => navigate(-1)}
                            disabled={loading}
                            className={`w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 ${loading ? 'bg-white dark:bg-white/20 shadow-sm animate-pulse' : scrolled ? 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white shadow-none active:scale-95' : 'bg-white text-gray-900 hover:bg-gray-50 shadow-sm active:scale-95'}`}
                        >
                            {loading ? (
                                <div className={`w-5 h-0.5 rounded-full ${scrolled ? 'bg-gray-300' : 'bg-gray-200 dark:bg-white/10'}`} />
                            ) : (
                                <ArrowLeftIcon className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
                            )}
                        </button>
                    </div>

                    <div className="flex flex-col items-center pointer-events-none text-center">
                        <h1 className={`text-[17px] font-bold tracking-tight truncate max-w-[50vw] transition-all duration-300 ${scrolled ? 'text-gray-900 dark:text-white opacity-100' : 'text-white drop-shadow-md'}`}>
                            {loading ? (
                                <div className={`h-5 w-32 rounded-[100px] animate-pulse backdrop-blur-sm ${scrolled ? 'bg-gray-200 dark:bg-white/10' : 'bg-white/30'}`} />
                            ) : (
                                collection?.name
                            )}
                        </h1>
                    </div>

                    <div className={`transition-all duration-300 px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap pointer-events-auto flex items-center justify-center min-h-[36px] ${loading ? 'bg-white dark:bg-white/20 shadow-sm animate-pulse' : scrolled ? 'bg-[#222222] text-white shadow-none' : 'bg-white text-gray-900 border border-gray-100 shadow-sm'}`}>
                        {loading ? (
                            <div className={`h-1.5 w-16 rounded-[100px] ${scrolled ? 'bg-gray-700' : 'bg-gray-200 dark:bg-white/10'}`} />
                        ) : (
                            `${listings.length} properties`
                        )}
                    </div>
                </div>

                {/* 3. Overlapping Content Container */}
                <div className="relative z-10 pointer-events-none">
                    <div className="h-[55vh] md:h-[60vh] w-full" />
                    <div className="relative z-40 -mt-12 bg-[#F7F7F7] dark:bg-dashboard-dark rounded-t-[40px] px-6 pt-2 pb-32 shadow-[0_-12px_40px_-15px_rgba(0,0,0,0.25)] min-h-screen pointer-events-auto">
                        <div className="w-12 h-1.5 bg-gray-300 dark:bg-white/10 rounded-full mx-auto mb-2 opacity-50 mt-1" />
                        <div className="relative min-h-[400px]">
                            <ListingsGrid 
                                loading={loading} 
                                listings={listings} 
                                visibleCount={visibleCount}
                                navigate={navigate} 
                                observerTarget={observerTarget}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- DESKTOP ONLY: Classic Design --- */}
            <div className="hidden lg:block">
                {/* Desktop Hero (Relative) */}
                <div className="relative w-full h-[400px] overflow-hidden">
                    {!loading && heroImages.length > 0 ? (
                        <ListingImageSlider 
                            images={heroImages} 
                            title={collection?.name} 
                            cardLink="#" 
                            arrowPadding="12"
                            onImageClick={openGallery}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                            <FiHome className="w-16 h-16 text-gray-200" />
                        </div>
                    )}
                    
                    {/* Header Overlay Content */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 flex flex-col justify-end p-12">
                        <div className="max-w-[1440px] mx-auto w-full">
                            <div className="flex items-end justify-between">
                                <div className="text-white">
                                    <h1 className="text-4xl font-black tracking-tight mb-2">
                                        {loading ? '...' : collection?.name}
                                    </h1>
                                    <p className="text-lg opacity-90 font-medium">
                                        {loading ? '...' : `${listings.length} Exclusive Properties`}
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="px-6 py-3 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-50 transition-all active:scale-95 shadow-xl flex items-center gap-2"
                                >
                                    <ArrowLeftIcon className="w-5 h-5" />
                                    Back to Collections
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Content Grid */}
                <div className="max-w-[1440px] mx-auto px-12 py-16">
                    <ListingsGrid 
                        loading={loading} 
                        listings={listings} 
                        visibleCount={visibleCount}
                        navigate={navigate} 
                        observerTarget={observerTarget}
                    />
                </div>
            </div>

            {/* Shared Gallery Modal */}
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

// Sub-components for cleaner code
const ListingsGrid = ({ loading, listings, visibleCount, navigate, observerTarget }) => {
    const visibleListings = listings.slice(0, visibleCount);
    const hasMore = visibleCount < listings.length;

    return (
        <div className="relative min-h-[400px]">
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                    {[...Array(3)].map((_, i) => (
                        <ListingSkeleton key={i} viewMode="grid" index={i} />
                    ))}
                </div>
            ) : listings.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                        {visibleListings.map((listing, idx) => (
                            <div key={listing.id} className="animate-fadeInUp" style={{ animationDelay: `${(idx % 3) * 100}ms` }}>
                                <ListingCard
                                    listing={listing}
                                    viewMode="grid"
                                    showSave={true}
                                />
                            </div>
                        ))}
                        
                        {/* Loading Skeletons for additional cards while scrolling */}
                        {hasMore && (
                            [...Array(3)].map((_, i) => (
                                <div key={`skeleton-${i}`} ref={i === 0 ? observerTarget : null}>
                                    <ListingSkeleton viewMode="grid" index={i} />
                                </div>
                            ))
                        )}
                    </div>
                    {/* Intersection Observer Target */}
                    {!hasMore && <div className="h-20" />}
                </>
            ) : (
                <div className="text-center py-24 animate-fadeInUp">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiHome className="h-10 w-10 text-gray-300" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">This collection is empty</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">No properties have been added to this group yet.</p>
                    <button
                        onClick={() => navigate('/listings')}
                        className="mt-8 inline-flex items-center px-10 py-4 rounded-full text-white bg-[#222222] dark:bg-white dark:text-dashboard-dark hover:scale-[1.02] active:scale-95 font-bold transition-all shadow-xl"
                    >
                        Browse All properties
                    </button>
                </div>
            )}
        </div>
    );
};

const GalleryModal = ({ galleryOpen, setGalleryOpen, heroImages, collection, galleryIndex }) => {
    if (!galleryOpen) return null;
    return (
        <div className="fixed inset-0 z-[10000] bg-black flex flex-col animate-fadeIn overflow-hidden border-none outline-none">
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-black border-none">
                <div className="w-full h-full max-w-[1440px] mx-auto border-none">
                    <ListingImageSlider 
                        images={heroImages} 
                        title={collection?.name} 
                        cardLink="#" 
                        initialIndex={galleryIndex}
                        isGalleryMode={true}
                    />
                </div>
            </div>
            <div className="relative flex items-center justify-between px-4 py-3 z-10 border-b border-white/5 bg-black/60 backdrop-blur-xl">
                <button
                    onClick={() => setGalleryOpen(false)}
                    className="w-10 h-10 flex items-center justify-center text-white hover:opacity-70 active:scale-95 transition-all"
                >
                    <ArrowLeftIcon className="w-7 h-7 md:w-6 md:h-6 transition-transform" />
                </button>
                <span className="absolute left-1/2 -translate-x-1/2 text-white font-semibold text-lg truncate max-w-[50vw] pointer-events-none">
                    {collection?.name || 'Photo Gallery'}
                </span>
                <div className="w-10" />
            </div>
        </div>
    );
};

export default CollectionDetailPage;
