import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getSavedListings } from '../../services/savedListingsApi';
import ListingCard from '../../components/Listings/ListingCard';
import ListingDetailModal from '../../components/Listings/ListingDetailModal';
import ListingSkeleton from '../../components/ui/ListingSkeleton';
import FilterBar from '../../components/ui/FilterBar';
import { FiHeart } from "react-icons/fi";
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
            className="flex flex-col gap-2 cursor-pointer group animate-fadeInUp"
        >
            <div className="w-full aspect-square bg-white border border-gray-100 shadow-sm rounded-[20px] overflow-hidden p-1.5">
                <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-[4px] rounded-[14px] overflow-hidden">
                    {/* Slot 1: First image */}
                    {images[0] ? (
                        <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${images[0]})` }} />
                    ) : (
                        <div className="w-full h-full bg-gray-100" />
                    )}

                    {/* Slot 2: Second image */}
                    {images[1] ? (
                        <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${images[1]})` }} />
                    ) : (
                        <div className="w-full h-full bg-gray-50" />
                    )}

                    {/* Slot 3: Third image */}
                    {images[2] ? (
                        <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${images[2]})` }} />
                    ) : (
                        <div className="w-full h-full bg-gray-50" />
                    )}

                    {/* Slot 4: Count or Fourth image */}
                    {remainingCount > 0 ? (
                        <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-500 relative overflow-hidden group-hover:bg-gray-200 transition-colors">
                            <span className="text-[18px] font-bold text-gray-700">+{remainingCount}</span>
                        </div>
                    ) : images[3] ? (
                        <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${images[3]})` }} />
                    ) : (
                        <div className="w-full h-full bg-gray-50" />
                    )}
                </div>
            </div>
            <div className="px-1 relative">
                <h3 className="text-[17px] font-bold text-gray-900 leading-tight truncate">{label}</h3>
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
    const [skeletonCount, setSkeletonCount] = useState(2);
    const [removingId, setRemovingId] = useState(null);
    const [isDesktop, setIsDesktop] = useState(false);
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
            const date = new Date(listing.created_at || new Date());
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

    const fetchSavedListings = async () => {
        setLoading(true);
        setInitialLoading(true);
        setIsExiting(false);
        setSkeletonCount(2);

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
        await new Promise(resolve => setTimeout(resolve, 350));
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
        <div className="min-h-screen bg-white pt-10 pb-20">
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
                        isGoogleMapOpen={false}
                        onToggleMapView={() => navigate('/listings?view=map')}
                        navVisible={navVisible}
                        isScrolled={layoutScrolled}
                        onClearSearch={() => setFavoritesSearchTerm('')}
                    />
                </div>,
                filterBarSlot
            )}
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
                {/* Header - Simplified for app-like look when navbar is hidden */}
                <div className="mb-0 flex flex-col items-start px-0">
                    <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
                        Favorites
                    </h1>
                </div>

                {/* Content Area */}
                <div className="relative min-h-[400px] mt-6">
                    {initialLoading && !currentGroup ? (
                        /* Skeletons for main grid view */
                        <div className={`grid ${isDesktop ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-2'} gap-4 pointer-events-none`}>
                            {[...Array(6)].map((_, index) => (
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
                    ) : (listings.length > 0 || currentGroup) ? (
                        /* Content */
                        <>
                            {currentGroup && (
                                <div className="fixed inset-0 z-[200] bg-white flex flex-col h-[100dvh]">
                                    {/* Sticky Header */}
                                    <div className="sticky flex-shrink-0 top-0 left-0 right-0 py-3 lg:py-4 bg-white/90 backdrop-blur-md border-b border-gray-100 z-20" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}>
                                        <div className="max-w-[1440px] mx-auto h-full px-6 md:px-12 lg:px-20 flex items-center justify-between relative">
                                            <button
                                                onClick={() => {
                                                    const newParams = new URLSearchParams(searchParams);
                                                    newParams.delete('group');
                                                    setSearchParams(newParams);
                                                }}
                                                className="flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 text-gray-900 hover:text-gray-700 py-3 px-3 md:py-2 md:px-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-200"
                                            >
                                                <ArrowLeftIcon className="w-7 h-7 md:w-6 md:h-6 text-gray-900" />
                                            </button>
                                            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                                                <h2 className="text-lg md:text-base font-semibold text-gray-900 truncate max-w-[50vw] leading-none">{currentGroup}</h2>
                                            </div>
                                            <div className="text-[14px] font-semibold text-gray-500 min-w-[60px] flex justify-end">
                                                {activeGroup ? (
                                                    `${activeGroup.items.length} places`
                                                ) : (
                                                    <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Scrollable Listings */}
                                    <div className="flex-1 overflow-y-auto">
                                        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pt-6 pb-24">
                                            {initialLoading || !activeGroup ? (
                                                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                                    {[...Array(6)].map((_, i) => (
                                                        <ListingSkeleton key={`group-skel-${i}`} viewMode="saved-grid" />
                                                    ))}
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                                                                    onSaveToggle={(id, saved) => {
                                                                        if (!saved) {
                                                                            handleUnsave(id);
                                                                        }
                                                                    }}
                                                                    to={isDesktop ? `?detail=${listing.id}` : undefined}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {activeGroup.items.length === 0 && (
                                                        <div className="text-center py-10">
                                                            <p className="text-gray-500">No properties left in this group.</p>
                                                            <button
                                                                onClick={() => {
                                                                    const newParams = new URLSearchParams(searchParams);
                                                                    newParams.delete('group');
                                                                    setSearchParams(newParams);
                                                                }}
                                                                className="mt-4 text-primary-600 font-bold"
                                                            >
                                                                Go back
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Main Listings View (Grouped Date Cards) */}
                            <div className={`space-y-10 ${currentGroup ? 'hidden' : 'block'}`}>
                                {(() => {
                                    // Grouping logic
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
                                        const date = new Date(listing.created_at || new Date());
                                        date.setHours(0, 0, 0, 0);

                                        if (date.getTime() === today.getTime()) {
                                            groups.Today.push(listing);
                                        } else if (date.getTime() === yesterday.getTime()) {
                                            groups.Yesterday.push(listing);
                                        } else {
                                            groups.Earlier.push(listing);
                                        }
                                    });

                                    // Always render as grouped cards
                                    return (
                                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
                                            {Object.entries(groups).map(([label, items]) => {
                                                if (items.length === 0) return null;
                                                return (
                                                    <GroupedSavedCard
                                                        key={label}
                                                        label={label}
                                                        items={items}
                                                        onClick={() => handleGroupClick(label)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>
                        </>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-16 animate-fadeInUp">
                            <FiHeart className="mx-auto h-20 w-20 text-gray-300" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No favorites listings</h3>
                            <p className="mt-2 text-gray-500">
                                Start favoriting properties you're interested in to view them here.
                            </p>
                            <button
                                onClick={() => navigate('/listings')}
                                className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                            >
                                Browse Listings
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
