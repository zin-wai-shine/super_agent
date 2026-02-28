import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getSavedListings } from '../../services/savedListingsApi';
import ListingCard from '../../components/Listings/ListingCard';
import ListingDetailModal from '../../components/Listings/ListingDetailModal';
import ListingSkeleton from '../../components/ui/ListingSkeleton';
import { FiHeart } from "react-icons/fi";


const SavedListingsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const [skeletonCount, setSkeletonCount] = useState(1);
    const [removingId, setRemovingId] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchSavedListings();
    }, [user, navigate]);

    const fetchSavedListings = async () => {
        setLoading(true);
        setInitialLoading(true);
        setIsExiting(false);
        setSkeletonCount(1);

        // Sequential skeleton increase (1 to 4)
        const skeletonInterval = setInterval(() => {
            setSkeletonCount(prev => {
                if (prev >= 4) {
                    clearInterval(skeletonInterval);
                    return 4;
                }
                return prev + 1;
            });
        }, 200);

        try {
            // Use Promise.all to ensure minimum visibility of the loading state
            const [response] = await Promise.all([
                getSavedListings(),
                new Promise(resolve => setTimeout(resolve, 1500))
            ]);

            clearInterval(skeletonInterval);
            setSkeletonCount(4); // Ensure it reaches 4 before exiting

            // Trigger exit animation for skeletons
            setIsExiting(true);
            // Wait for animation duration (longest delay ~240ms + 600ms = 840ms)
            await new Promise(resolve => setTimeout(resolve, 900));

            setListings(response.data || []);
            setInitialLoading(false);
            setIsExiting(false);
        } catch (error) {
            console.error('Error fetching saved listings:', error);
            setInitialLoading(false);
        } finally {
            setLoading(false);
            clearInterval(skeletonInterval);
        }
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
            <div className="max-w-[1440px] mx-auto px-4 lg:px-12">
                {/* Header - Simplified for app-like look when navbar is hidden */}
                <div className="mb-0 flex flex-col items-start px-0">
                    <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
                        Favorites
                    </h1>
                </div>

                {/* Content Area */}
                <div className="relative min-h-[400px] mt-6">
                    {initialLoading ? (
                        /* Skeletons — grid: 2 columns on mobile */
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pointer-events-none">
                            {[...Array(Math.min(skeletonCount, 6))].map((_, index) => (
                                <div key={`skeleton-wrapper-${index}`} className="min-w-0">
                                    <ListingSkeleton
                                        key={`skeleton-${index}`}
                                        index={index}
                                        viewMode="saved-grid"
                                        isExiting={isExiting}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : listings.length > 0 ? (
                        /* Listings Grouped by Date */
                        <div className="space-y-10">
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

                                return Object.entries(groups).map(([label, items]) => {
                                    if (items.length === 0) return null;
                                    return (
                                        <div key={label} className="space-y-4">
                                            <h3 className="text-xl font-bold text-gray-900 px-0">{label}</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {items.map((listing) => (
                                                    <div
                                                        key={listing.id}
                                                        className={`min-w-0 transition-all duration-500 ${removingId === listing.id ? 'animate-fadeOutDown pointer-events-none' : 'animate-fadeInUp'}`}
                                                    >
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
                                        </div>
                                    );
                                });
                            })()}
                        </div>
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
