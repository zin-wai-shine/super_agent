import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { publicApi, collectionApi } from '../../services/api';
import ListingCard from '../../components/Listings/ListingCard';
import ListingSkeleton from '../../components/ui/ListingSkeleton';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { FiHome } from "react-icons/fi";

const CollectionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [collection, setCollection] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const outletContext = useOutletContext() || {};
    const { navVisible = true } = outletContext;

    useEffect(() => {
        fetchCollectionData();
    }, [id]);

    const fetchCollectionData = async () => {
        setLoading(true);
        try {
            // Parallel fetch for collection info and its listings
            const [colRes, listRes] = await Promise.all([
                collectionApi.getPublicCollection(id),
                publicApi.getListings({ collection_id: id, limit: 100 })
            ]);
            
            setCollection(colRes.data || null);
            setListings(listRes.data.listings || []);
        } catch (error) {
            console.error('Failed to fetch collection detail:', error);
            // Optionally navigate back if not found
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-dashboard-dark pb-24 lg:pb-20 min-h-screen">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
                {/* Header Section: Back button, Title, Count */}
                <div className="sticky top-0 z-40 bg-white dark:bg-dashboard-dark py-5 mb-5 sm:static sm:bg-transparent sm:py-5 sm:mb-10 flex items-center justify-between relative min-h-[48px] -mx-6 px-6 md:mx-0 md:px-0 border-b border-gray-50 dark:border-white/5 sm:border-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 active:scale-95 transition-all group"
                        >
                            <ArrowLeftIcon className="w-6 h-6 text-gray-900 dark:text-white group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none text-center">
                        <h1 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight truncate max-w-[50vw]">
                            {loading ? '...' : collection?.name}
                        </h1>
                    </div>

                    <div className="text-[14px] text-gray-500 font-medium whitespace-nowrap">
                        {loading ? '...' : `${listings.length} properties`}
                    </div>
                </div>

                {/* Listings Grid */}
                <div className="relative min-h-[400px]">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                            {[...Array(4)].map((_, i) => (
                                <ListingSkeleton key={i} viewMode="grid" />
                            ))}
                        </div>
                    ) : listings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeInUp">
                            {listings.map((listing) => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    viewMode="grid"
                                    showSave={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 animate-fadeInUp">
                            <FiHome className="mx-auto h-20 w-20 text-gray-200" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">This collection is empty</h2>
                            <button
                                onClick={() => navigate('/listings')}
                                className="mt-8 inline-flex items-center px-8 py-3 rounded-full text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-dashboard-dark dark:hover:bg-gray-200 font-bold transition-all shadow-lg active:scale-95"
                            >
                                Browse All properties
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectionDetailPage;
