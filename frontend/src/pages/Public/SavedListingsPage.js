import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getSavedListings } from '../../services/savedListingsApi';
import ListingCard from '../../components/Listings/ListingCard';
import ListingDetailModal from '../../components/Listings/ListingDetailModal';
import { BsBookmark, BsBookmarks } from "react-icons/bs";


const SavedListingsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchSavedListings();
    }, [user, navigate]);

    const fetchSavedListings = async () => {
        setLoading(true);
        try {
            const response = await getSavedListings();
            setListings(response.data || []);
        } catch (error) {
            console.error('Error fetching saved listings:', error);
        } finally {
            setLoading(false);
        }
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

    if (loading) {
        return (
            <div className="min-h-screen bg-white py-12">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        <p className="mt-4 text-gray-600">Loading saved listings...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-12">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <BsBookmarks className="w-9 h-9 text-primary-600" />
                        Saved Listings
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {listings.length} {listings.length === 1 ? 'property' : 'properties'} saved
                    </p>
                </div>

                {/* Listings Grid */}
                {listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {listings.map((listing) => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                showSave={false}
                                to={`?detail=${listing.id}`}
                            />
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-16">
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



            {/* Detail Modal */}
            <ListingDetailModal />
        </div>
    );
};

export default SavedListingsPage;
