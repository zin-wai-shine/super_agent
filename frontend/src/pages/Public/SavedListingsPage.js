import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getSavedListings } from '../../services/savedListingsApi';
import ListingCard from '../../components/Listings/ListingCard';
import ListingDetailModal from '../../components/Listings/ListingDetailModal';
import ListingSkeleton from '../../components/ui/ListingSkeleton';
import { BsBookmark, BsBookmarks } from "react-icons/bs";


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
        <div className="min-h-screen bg-white pt-24 pb-20">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                {/* Header */}
                <div className="mb-16 flex flex-col items-center text-center">
                    <h1 className="text-4xl font-medium text-slate-900 tracking-tight leading-tight">
                        Saved Listings
                    </h1>
                    {!initialLoading && (
                        <p className="mt-2 text-slate-500 font-medium text-lg animate-fadeInUp">
                            {listings.length} {listings.length === 1 ? 'property' : 'properties'} saved
                        </p>
                    )}
                </div>

                {/* Content Area */}
                <div className="relative min-h-[400px]">
                    {initialLoading ? (
                        /* Skeletons Grid with sequential loading feel */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pointer-events-none">
                            {[...Array(skeletonCount)].map((_, index) => (
                                <ListingSkeleton
                                    key={`skeleton-${index}`}
                                    index={index}
                                    isExiting={isExiting}
                                />
                            ))}
                        </div>
                    ) : listings.length > 0 ? (
                        /* Listings Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {listings.map((listing) => (
                                <div
                                    key={listing.id}
                                    className={`transition-all duration-500 ${removingId === listing.id ? 'animate-fadeOutDown pointer-events-none' : 'animate-fadeInUp'}`}
                                >
                                    <ListingCard
                                        listing={listing}
                                        showSave={true}
                                        initialSaved={true}
                                        onSaveToggle={(id, saved) => !saved && handleUnsave(id)}
                                        to={`?detail=${listing.id}`}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-16 animate-fadeInUp">
                            <BsBookmarks className="mx-auto h-20 w-20 text-gray-300" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No saved listings</h3>
                            <p className="mt-2 text-gray-500">
                                Start saving properties you're interested in to view them here.
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
