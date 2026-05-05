import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getSavedListings } from '../../services/savedListingsApi';
import ListingCard from '../../components/Listings/ListingCard';
import ListingDetailModal from '../../components/Listings/ListingDetailModal';
import ListingSkeleton from '../../components/ui/ListingSkeleton';
import FilterBar from '../../components/ui/FilterBar';
import { BsHeart, BsFillHeartFill } from 'react-icons/bs';
import { HiOutlineHeart } from 'react-icons/hi';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getMediaUrl } from '../../utils/media';
import { PHOTO_ROOM_TYPES } from '../../services/api';

const GroupedSavedCard = ({ label, items, onClick }) => {
    if (!items || items.length === 0) return null;

    // Get first image for each item for the collage (Bedroom first priority)
    const images = items.slice(0, 4).map(item => {
        const media = (item.media || []).filter(m => m.type === 'image');
        if (media.length === 0) return getMediaUrl(null);

        // Sort by room type same as ListingCard
        const order = (rt) => {
            const i = PHOTO_ROOM_TYPES.indexOf(rt && rt.trim() ? rt.trim() : 'Additional Photos');
            return i >= 0 ? i : PHOTO_ROOM_TYPES.length;
        };
        const sorted = [...media].sort((a, b) => order(a.room_type) - order(b.room_type));

        return getMediaUrl(sorted[0]?.url);
    });

    const totalPlaces = items.length;
    const remainingCount = totalPlaces > 4 ? totalPlaces - 3 : 0;

    return (
        <div
            onClick={onClick}
            className="flex flex-col gap-2 cursor-pointer group animate-fill-med"
        >
            <div className="w-full aspect-square bg-white dark:bg-dashboard-card border border-gray-100 dark:border-white/10 shadow-sm rounded-[20px] overflow-hidden p-1.5">
                <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-[4px] rounded-[14px] overflow-hidden">
                    {/* Slot 1: First image */}
                    <div className="w-full h-full overflow-hidden relative bg-gray-100 dark:bg-white/5">
                        {images[0] ? (
                            <div
                                className="w-full h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                                style={{ backgroundImage: `url(${images[0]})` }}
                            />
                        ) : null}
                    </div>

                    {/* Slot 2: Second image */}
                    <div className="w-full h-full overflow-hidden relative bg-gray-50 dark:bg-white/5">
                        {images[1] ? (
                            <div
                                className="w-full h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                                style={{ backgroundImage: `url(${images[1]})` }}
                            />
                        ) : null}
                    </div>

                    {/* Slot 3: Third image */}
                    <div className="w-full h-full overflow-hidden relative bg-gray-50 dark:bg-white/5">
                        {images[2] ? (
                            <div
                                className="w-full h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                                style={{ backgroundImage: `url(${images[2]})` }}
                            />
                        ) : null}
                    </div>

                    {/* Slot 4: Count or Fourth image */}
                    <div className="w-full h-full overflow-hidden relative bg-gray-50 dark:bg-white/5">
                        {remainingCount > 0 ? (
                            <div className="w-full h-full bg-gray-100 dark:bg-white/5 flex flex-col items-center justify-center text-gray-500 transition-colors group-hover:bg-gray-200 dark:group-hover:bg-white/10">
                                <span className="text-[18px] font-bold text-gray-700">+{remainingCount}</span>
                            </div>
                        ) : images[3] ? (
                            <div
                                className="w-full h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                                style={{ backgroundImage: `url(${images[3]})` }}
                            />
                        ) : null}
                    </div>
                </div>
            </div>
            <div className="px-1 relative">
                <h3 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight truncate">{label}</h3>
                <p className="text-[14px] text-gray-500 font-medium">
                    {items.length} {items.length === 1 ? 'place' : 'places'}
                </p>
            </div>
        </div>
    );
};


const SavedListingsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const outletContext = useOutletContext() || {};
    const { filterBarSlot, navVisible = true, isScrolled: layoutScrolled = false } = outletContext;
    const [listings, setListings] = useState([]);
    const [favoritesSearchTerm, setFavoritesSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const [skeletonCount, setSkeletonCount] = useState(() => {
        const saved = localStorage.getItem('fav_group_counts');
        if (saved) {
            const counts = JSON.parse(saved);
            const params = new URLSearchParams(window.location.search);
            const group = params.get('group');
            if (group) return counts[group] || 1;
            return counts.folders || 1;
        }
        return 1;
    });
    const [removingId, setRemovingId] = useState(null);
    const [isDesktop, setIsDesktop] = useState(false);
    const [mobileScrolled, setMobileScrolled] = useState(false);
    
    // Persistent group counts to prevent skeleton flicker on navigation/reload
    const [cachedCounts] = useState(() => {
        const saved = localStorage.getItem('fav_group_counts');
        return saved ? JSON.parse(saved) : { Today: 1, Yesterday: 1, Earlier: 1, folders: 1 };
    });

    const currentGroup = searchParams.get('group');

    // Derived active group from listings and search param
    const activeGroup = useMemo(() => {
        if (!currentGroup || listings.length === 0) return null;

        const groups = {
            Today: [],
            Yesterday: [],
            Earlier: []
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        listings.forEach(listing => {
            const date = new Date(listing.saved_at || listing.created_at || new Date());
            date.setHours(0, 0, 0, 0);

            if (date.getTime() === today.getTime()) {
                groups.Today.push(listing);
            } else if (date.getTime() === yesterday.getTime()) {
                groups.Yesterday.push(listing);
            } else {
                groups.Earlier.push(listing);
            }
        });

        const items = groups[currentGroup] || [];
        return items.length > 0 ? { label: currentGroup, items } : null;
    }, [currentGroup, listings]);

    // Calculate exact count for skeletons if navigating within the app
    const getSkeletonCount = () => {
        if (activeGroup) return activeGroup.items.length;
        if (currentGroup) return cachedCounts[currentGroup] || 1;
        return cachedCounts.folders || 1;
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchSavedListings();
    }, [user, navigate]);

    // Detect desktop vs mobile so Favorites cards behave like detail page on mobile
    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return;

        const mq = window.matchMedia('(min-width: 1024px)');
        const handleChange = (e) => setIsDesktop(e.matches);

        setIsDesktop(mq.matches);
        mq.addEventListener('change', handleChange);

        return () => mq.removeEventListener('change', handleChange);
    }, []);

    // Ensure scroll is at top on reload or group change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentGroup]);

    useEffect(() => {
        if (initialLoading || listings.length === 0) return;

        const counts = { Today: 0, Yesterday: 0, Earlier: 0, folders: 0 };
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

        const folderSet = new Set();
        listings.forEach(l => {
            const d = new Date(l.saved_at || l.created_at || new Date());
            d.setHours(0, 0, 0, 0);
            if (d.getTime() === today.getTime()) { counts.Today++; folderSet.add('Today'); }
            else if (d.getTime() === yesterday.getTime()) { counts.Yesterday++; folderSet.add('Yesterday'); }
            else { counts.Earlier++; folderSet.add('Earlier'); }
        });
        counts.folders = folderSet.size;
        localStorage.setItem('fav_group_counts', JSON.stringify(counts));
    }, [listings, initialLoading]);

    const fetchSavedListings = async () => {
        setLoading(true);
        setInitialLoading(true);
        setIsExiting(false);
        setSkeletonCount(getSkeletonCount());

        try {
            const [response] = await Promise.all([
                getSavedListings(),
                new Promise(resolve => setTimeout(resolve, 200))
            ]);

            // Trigger exit animation for skeletons (match Listings page)
            setIsExiting(true);
            await new Promise(resolve => setTimeout(resolve, 200));

            setListings(response.data || []);
            setInitialLoading(false);
            setIsExiting(false);
        } catch (error) {
            console.error('Error fetching saved listings:', error);
            setInitialLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handleGroupClick = async (label) => {
        // Trigger brief "premium" loading skeleton even if data is cached
        setInitialLoading(true);

        const newParams = new URLSearchParams(searchParams);
        newParams.set('group', label);
        setSearchParams(newParams);

        // Standard reveal delay
        await new Promise(resolve => setTimeout(resolve, 200));
        setInitialLoading(false);
    };

    const handleUnsave = (id) => {
        setRemovingId(id);
        // Wait for animation duration (match animate-fadeOutDown)
        setTimeout(() => {
            setListings(prev => prev.filter(item => item.id !== id));
            setRemovingId(null);
        }, 600);
    };

    // Refresh listings when returning from detail page
    useEffect(() => {
        const handleFocus = () => {
            if (user) {
                fetchSavedListings();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [user]);

    return (
        <div className="bg-white dark:bg-dashboard-dark pb-24 lg:pb-20 min-h-screen">
            {/* Filter bar (desktop only): same as list page; search/filters navigate to list page */}
            {/* Filter bar (desktop only): same as list page; search/filters navigate to list page */}
            {filterBarSlot && createPortal(
                <div className="hidden lg:block w-full">
                    <FilterBar
                        total={listings.length}
                        searchTerm={favoritesSearchTerm}
                        onSearchChange={setFavoritesSearchTerm}
                        onSearchSubmit={(value) => navigate(`/listings${value ? `?search=${encodeURIComponent(value)}` : ''}`)}
                        onOpenFilters={() => navigate('/listings?open_filters=1')}
                        hasActiveFilters={false}
                        activeFilterCount={0}
                        viewMode="grid"
                        onViewModeChange={() => { }}
                        isGoogleMapOpen={localStorage.getItem('preferredView') === 'map'}
                        onToggleMapView={() => {
                            const newPreference = localStorage.getItem('preferredView') === 'map' ? 'list' : 'map';
                            localStorage.setItem('preferredView', newPreference);
                            navigate(`/listings?view=${newPreference}`);
                        }}
                        navVisible={navVisible}
                        isScrolled={layoutScrolled}
                        onClearSearch={() => setFavoritesSearchTerm('')}
                    />
                </div>,
                filterBarSlot
            )}
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pt-5">
                {/* Content Area */}
                <div className="relative min-h-[400px]">
                    {initialLoading && !currentGroup ? (
                        /* Skeletons for main grid view */
                        <div className="animate-fill-fast">
                            <div className="mb-10">
                                <h1 className="text-[24px] font-semibold text-gray-900 dark:text-white tracking-tight">Favorites</h1>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pointer-events-none">
                                {[...Array(getSkeletonCount())].map((_, index) => (
                                    <div key={`skeleton-wrapper-${index}`} className="min-w-0">
                                        <ListingSkeleton
                                            key={`skeleton-${index}`}
                                            index={index}
                                            viewMode="grouped-saved-category"
                                            isExiting={isExiting}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (listings.length > 0 || currentGroup) ? (
                        /* Content */
                        <>
                            {currentGroup && !isDesktop && (
                                <div className="fixed inset-0 z-[200] bg-white dark:bg-dashboard-dark flex flex-col h-[100dvh]">
                                    {/* App-style Mobile Header */}
                                    <div className={`flex-shrink-0 sticky top-0 bg-white/95 dark:bg-dashboard-dark/95 backdrop-blur-md border-b transition-colors duration-300 ${mobileScrolled ? 'border-gray-100 dark:border-white/10' : 'border-transparent'} z-20`}>
                                        <div className="max-w-[1440px] mx-auto w-full h-[76px] flex items-center justify-between px-4 relative">
                                            {/* Back Button */}
                                            <button
                                                onClick={() => {
                                                    const newParams = new URLSearchParams(searchParams);
                                                    newParams.delete('group');
                                                    setSearchParams(newParams);
                                                }}
                                                disabled={initialLoading}
                                                className={`w-[44px] h-[44px] flex-shrink-0 flex items-center justify-center rounded-full border transition-all duration-300 active:scale-[0.98] ${initialLoading || !activeGroup ? 'bg-gray-100 dark:bg-white/10 border-transparent animate-pulse' : 'bg-white dark:bg-dashboard-card border-gray-200 dark:border-white/10 hover:border-[#222222] dark:hover:border-white/40 hover:shadow-md hover:-translate-y-[1px]'}`}
                                            >
                                                {!(initialLoading || !activeGroup) && (
                                                    <ArrowLeftIcon className="w-5 h-5 text-gray-800 dark:text-white" strokeWidth={2} />
                                                )}
                                            </button>

                                            {/* Centered Title */}
                                            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                                                {initialLoading || !activeGroup ? (
                                                    <div className="h-5 w-24 bg-gray-100 dark:bg-white/10 rounded-full animate-pulse" />
                                                ) : (
                                                    <h2 className="text-[17px] font-bold text-gray-900 dark:text-white truncate max-w-[50vw]">{currentGroup}</h2>
                                                )}
                                            </div>

                                            {/* Right: Count */}
                                            <div className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {initialLoading || !activeGroup ? (
                                                    <div className="h-4 w-14 bg-gray-100 dark:bg-white/10 rounded-full animate-pulse" />
                                                ) : (
                                                    <>{activeGroup?.items.length || 0} places</>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Scrollable Content */}
                                    <div
                                        className="flex-1 overflow-y-auto"
                                        onScroll={(e) => setMobileScrolled(e.currentTarget.scrollTop > 10)}
                                    >
                                        <div className="px-5 pt-6 pb-24">
                                            {initialLoading || !activeGroup ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fill-fast">
                                                    {[...Array(getSkeletonCount())].map((_, i) => (
                                                        <ListingSkeleton key={`mob-skel-${i}`} viewMode="grid" />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {activeGroup.items.map((listing) => (
                                                        <div key={listing.id} className={removingId === listing.id ? 'animate-fadeOutDown' : ''}>
                                                            <ListingCard
                                                                listing={listing}
                                                                viewMode="saved-grid"
                                                                showSave={true}
                                                                initialSaved={true}
                                                                onSaveToggle={(id, saved) => !saved && handleUnsave(id)}
                                                                to={`?detail=${listing.id}`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentGroup && isDesktop ? (
                                <div className="flex flex-col animate-fill-fast">
                                    {/* Desktop Sub-header: Centered title, Right count */}
                                    <div className={`hidden lg:flex items-center justify-between px-4 md:px-0 lg:px-20 py-6 sticky top-0 z-[100] bg-white/95 dark:bg-dashboard-dark/95 backdrop-blur-md -mx-4 md:-mx-8 lg:-mx-20 transition-all duration-300 ${layoutScrolled ? 'border-b border-gray-100 dark:border-white/5' : 'border-b border-transparent'}`}>
                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={() => {
                                                    const newParams = new URLSearchParams(searchParams);
                                                    newParams.delete('group');
                                                    setSearchParams(newParams);
                                                }}
                                                className="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-white dark:bg-dashboard-card border border-gray-200 dark:border-white/10 hover:border-[#222222] dark:hover:border-white/40 hover:shadow-md hover:-translate-y-[1px] transition-all duration-300 active:scale-[0.98] z-10 group"
                                            >
                                                <ArrowLeftIcon className="w-[22px] h-[22px] text-gray-800 dark:text-white group-hover:-translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>

                                        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                                            <h1 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">{currentGroup}</h1>
                                        </div>

                                        <div className="text-[14px] text-gray-500 font-medium z-10">
                                            {activeGroup?.items.length || 0} listing{activeGroup?.items.length !== 1 ? 's' : ''} saved
                                        </div>
                                    </div>

                                    {/* Add some top padding to content so it doesn't jump under sticky header */}
                                    <div className="pt-8">
                                        {/* Desktop Listings Grid */}
                                    {initialLoading || !activeGroup ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fill-fast">
                                            {[...Array(getSkeletonCount())].map((_, i) => (
                                                <ListingSkeleton key={`group-skel-${i}`} viewMode="grid" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {activeGroup.items.map((listing) => (
                                                <div
                                                    key={listing.id}
                                                    className={`min-w-0 transition-all duration-500 ${removingId === listing.id ? 'animate-fadeOutDown pointer-events-none' : ''}`}
                                                >
                                                    <ListingCard
                                                        listing={listing}
                                                        viewMode="saved-grid"
                                                        showSave={true}
                                                        initialSaved={true}
                                                        onSaveToggle={(id, saved) => !saved && handleUnsave(id)}
                                                        to={window.innerWidth >= 1024 ? `/listings/${listing.id}` : `?detail=${listing.id}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    </div>
                                </div>
                            ) : !currentGroup && (
                                /* Main Grouped View (Grid of Today/Yesterday/Earlier Categories) */
                                <div className="animate-fill-fast">
                                    <div className="sticky top-0 z-40 bg-white dark:bg-dashboard-dark py-5 mb-5 sm:static sm:bg-transparent sm:py-0 sm:mb-10 -mx-6 px-6 md:mx-0 md:px-0 border-b border-gray-50 dark:border-white/5 sm:border-0">
                                        <h1 className="text-[24px] font-bold text-gray-900 dark:text-white tracking-tight">Favorites</h1>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-20">
                                        {(() => {
                                            const groups = { Today: [], Yesterday: [], Earlier: [] };
                                            const today = new Date(); today.setHours(0, 0, 0, 0);
                                            const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

                                            listings.forEach(listing => {
                                                const date = new Date(listing.saved_at || listing.created_at || new Date());
                                                date.setHours(0, 0, 0, 0);
                                                if (date.getTime() === today.getTime()) groups.Today.push(listing);
                                                else if (date.getTime() === yesterday.getTime()) groups.Yesterday.push(listing);
                                                else groups.Earlier.push(listing);
                                            });

                                            return Object.entries(groups).map(([label, items]) => {
                                                if (items.length === 0) return null;
                                                return (
                                                    <GroupedSavedCard
                                                        key={label}
                                                        label={label}
                                                        items={items}
                                                        onClick={() => handleGroupClick(label)}
                                                    />
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-24 animate-fadeInUp">
                            <HiOutlineHeart className="mx-auto h-20 w-20 text-gray-200 dark:text-white/10" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">No favorites yet</h2>
                            <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                                Save properties you like by clicking the heart icon, and they'll show up here.
                            </p>
                            <button
                                onClick={() => navigate('/listings')}
                                className="mt-8 inline-flex items-center px-8 py-3 rounded-full text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-dashboard-dark dark:hover:bg-gray-200 font-bold transition-all shadow-lg active:scale-95"
                            >
                                Start Browsing
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            <ListingDetailModal />
        </div>
    );
};

export default SavedListingsPage;
