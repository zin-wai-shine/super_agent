import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../../services/api';
import TransitMapFilter from '../../components/TransitMap/TransitMapFilter';
import ListingCard from '../../components/Listings/ListingCard';
import {
    BuildingOfficeIcon,
    MapPinIcon,
    SparklesIcon,
    ArrowRightIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const HomePage = () => {
    const [featuredListings, setFeaturedListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStation, setSelectedStation] = useState(null);
    const [stationListings, setStationListings] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchFeaturedListings = async () => {
            try {
                const response = await publicApi.getListings({ limit: 6 });
                setFeaturedListings(response.data.listings || []);
            } catch (error) {
                console.error('Failed to fetch listings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeaturedListings();
    }, []);

    const handleStationClick = async (stationId, stationName) => {
        setSelectedStation({ id: stationId, name: stationName });
        try {
            const response = await publicApi.getListingsByStation(stationId);
            setStationListings(response.data.listings || []);
        } catch (error) {
            console.error('Failed to fetch station listings:', error);
            setStationListings([]);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/listings?search=${encodeURIComponent(searchQuery)}`;
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
                            Find Your Dream Property
                            <span className="block mt-2 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                                Near Transit Stations
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-10 animate-slide-up">
                            Discover properties along Bangkok's BTS and MRT lines.
                            Click on any station to find your perfect home.
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="max-w-2xl mx-auto animate-slide-up">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by location, property type, or keyword..."
                                    className="w-full pl-14 pr-32 py-5 rounded-2xl text-gray-900 placeholder-gray-400 bg-white shadow-2xl shadow-primary-900/30 focus:outline-none focus:ring-4 focus:ring-white/30"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-xl font-medium hover:from-primary-400 hover:to-primary-500 transition-all duration-200"
                                >
                                    Search
                                </button>
                            </div>
                        </form>

                        {/* Quick stats */}
                        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-12">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">500+</div>
                                <div className="text-primary-200 text-sm">Properties</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">100+</div>
                                <div className="text-primary-200 text-sm">Stations</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">50+</div>
                                <div className="text-primary-200 text-sm">Agents</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Transit Map Section */}
            <section className="py-16 lg:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                            <MapPinIcon className="w-4 h-4" />
                            <span>Interactive Map</span>
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Find Properties by Transit Station
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Click on any station on the map to discover properties nearby.
                            Filter by BTS, MRT, and other transit lines.
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-3xl p-4 lg:p-8 shadow-inner">
                        <TransitMapFilter
                            onStationClick={handleStationClick}
                            selectedStation={selectedStation?.id}
                        />
                    </div>

                    {/* Station Results */}
                    {selectedStation && (
                        <div className="mt-12 animate-slide-up">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Properties near {selectedStation.name}
                                </h3>
                                <Link
                                    to={`/listings?station_id=${selectedStation.id}`}
                                    className="text-primary-600 font-medium hover:text-primary-700 flex items-center space-x-1"
                                >
                                    <span>View all</span>
                                    <ArrowRightIcon className="w-4 h-4" />
                                </Link>
                            </div>

                            {stationListings.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {stationListings.slice(0, 3).map((listing) => (
                                        <ListingCard key={listing.id} listing={listing} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-100 rounded-2xl">
                                    <BuildingOfficeIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No properties found near this station yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Listings */}
            <section className="py-16 lg:py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <div className="inline-flex items-center space-x-2 bg-secondary-50 text-secondary-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                                <SparklesIcon className="w-4 h-4" />
                                <span>Featured</span>
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                                Latest Properties
                            </h2>
                        </div>
                        <Link
                            to="/listings"
                            className="btn-secondary hidden sm:flex items-center space-x-2"
                        >
                            <span>View all listings</span>
                            <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
                            ))}
                        </div>
                    ) : featuredListings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredListings.map((listing) => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No listings yet</h3>
                            <p className="text-gray-500">Check back soon for new properties!</p>
                        </div>
                    )}

                    <div className="mt-8 text-center sm:hidden">
                        <Link to="/listings" className="btn-primary">
                            View all listings
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 lg:py-24 bg-gradient-to-r from-primary-600 to-secondary-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Ready to List Your Property?
                    </h2>
                    <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                        Join our platform and reach thousands of potential buyers and renters
                        looking for properties near transit stations.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/register"
                            className="w-full sm:w-auto bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Become an Agent
                        </Link>
                        <Link
                            to="/listings"
                            className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                        >
                            Browse Properties
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
