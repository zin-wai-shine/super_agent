import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import TransitMapFilter from '../../components/TransitMap/TransitMapFilter';
import StyledSelect from '../../components/Form/StyledSelect';
import { useTranslation } from 'react-i18next';
import { publicApi } from '../../services/api';
import { getMediaUrl } from '../../utils/media';

const MobileSearchPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Initialize state from URL params
    const [activeTab, setActiveTab] = useState('keywords');
    const [filters, setFilters] = useState({
        type: searchParams.get('type') || '',
        listing_type: searchParams.get('listing_type') || '',
        min_price: searchParams.get('min_price') || '',
        max_price: searchParams.get('max_price') || '',
        bedrooms: searchParams.get('bedrooms') || '',
        station_id: searchParams.get('station_id') || '',
        search: searchParams.get('search') || '',
    });

    const [priceLimits] = useState({ min: 0, max: 0 }); // Could fetch from API if needed, simpler for now

    // State for live search results as user types
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debounced search trigger for mobile
    useEffect(() => {
        const searchVal = filters.search || '';
        if (!searchVal.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(async () => {
            try {
                const response = await publicApi.getListings({ search: searchVal, limit: 10 });
                setSearchResults(response.data?.listings || []);
            } catch (error) {
                console.error('Error fetching mobile search results:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [filters.search]);

    const formatPrice = (p) => p ? parseInt(p).toLocaleString() : '';

    // Options (Duplicated from ListingsPage for now, ideally shared config)
    const propertyTypeOptions = [
        { value: '', label: `🏘️ ${t('filters.allTypes')}` },
        { value: 'condo', label: `🏢 ${t('filters.condo')}` },
        { value: 'house', label: `🏠 ${t('filters.house')}` },
        { value: 'townhouse', label: `🏘️ ${t('filters.townhouse')}` },
        { value: 'apartment', label: `🏬 ${t('filters.apartment')}` },
        { value: 'land', label: `🌳 ${t('filters.land')}` },
    ];

    const listingTypeOptions = [
        { value: '', label: `🔄 ${t('filters.saleAndRent')}` },
        { value: 'sale', label: `💰 ${t('filters.forSale')}` },
        { value: 'rent', label: `🔑 ${t('filters.forRent')}` },
    ];

    const bedroomOptions = [
        { value: '', label: `🛏️ ${t('filters.any')}` },
        { value: '0', label: `🛏️ ${t('listing.studio')}` },
        { value: '1', label: `1+ ${t('filters.bedrooms')}` },
        { value: '2', label: `2+ ${t('filters.bedrooms')}` },
        { value: '3', label: `3+ ${t('filters.bedrooms')}` },
        { value: '4', label: `4+ ${t('filters.bedrooms')}` },
        { value: '5', label: `5+ ${t('filters.bedrooms')}` },
    ];

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSelectChange = (key, option) => {
        handleFilterChange(key, option?.value || '');
    };

    // Helper for StyledSelect
    const getSelectedOption = (options, value) =>
        options.find(opt => opt.value === value) || null;

    const handleApplyFilters = () => {
        // Construct query params
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        navigate({ pathname: '/listings', search: params.toString() });
    };

    return (
        <div className="h-[100dvh] bg-white dark:bg-dashboard-dark flex flex-col pb-safe overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white dark:bg-dashboard-card z-10">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('filters.searchProperties')}</h1>
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
            </div>

            {/* Tabs */}
            <div className="px-4 border-b border-gray-100 dark:border-white/10 flex gap-8">
                <button
                    onClick={() => setActiveTab('keywords')}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'keywords'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    {t('filters.keywords').toUpperCase()}
                </button>
                <button
                    onClick={() => setActiveTab('map')}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'map'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    {t('filters.transitMap').toUpperCase()}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
                {activeTab === 'keywords' ? (
                    <>
                        {/* Search Input */}
                        <div>
                            <label className="text-xs font-bold mb-2 block" style={{ color: '#222222' }}>{t('filters.keywords')}</label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder={t('filters.keywordLocationPlaceholder')}
                                className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                            />
                        </div>

                        {/* Dynamic Search Results */}
                        {filters.search && filters.search.trim() !== '' && (
                            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar border border-gray-100/30 dark:border-white/10">
                                <h3 className="text-xs font-bold text-gray-500 mb-2">{t('filters.matchingProperties')}</h3>
                                {isSearching ? (
                                    // Skeletons
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <div key={index} className="flex items-center gap-3 py-2 animate-pulse">
                                            <div className="w-12 h-12 rounded-md bg-gray-200/60 dark:bg-white/10 flex-shrink-0" />
                                            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                                <div className="h-3.5 bg-gray-200/60 dark:bg-white/10 rounded-md w-3/4" />
                                                <div className="h-2.5 bg-gray-200/60 dark:bg-white/10 rounded-md w-1/3" />
                                            </div>
                                        </div>
                                    ))
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(listing => {
                                        const safeMedia = listing.media || [];
                                        const featuredImage = getMediaUrl(safeMedia.find((m) => m.type === 'image')?.url);
                                        return (
                                            <div 
                                                key={listing.id}
                                                onClick={() => navigate(`/listings/${listing.id}`)}
                                                className="flex items-center gap-3 py-2 border-b border-gray-100/50 dark:border-white/5 last:border-none active:bg-gray-100 dark:active:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-200/50 dark:bg-white/10">
                                                    <img 
                                                        src={featuredImage || '/placeholder.jpg'} 
                                                        alt={listing.title} 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">
                                                        {listing.title}
                                                    </h4>
                                                    <p className="text-[12px] text-gray-600 dark:text-gray-400 font-medium">
                                                        ฿{formatPrice(listing.price)}{listing.listing_type === 'rent' ? ` ${t('listing.rentUnit')}` : ''}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                                                        <span>{listing.bedrooms === 0 ? t('listing.studio') : t('listing.beds', { count: listing.bedrooms })}</span>
                                                        <span>·</span>
                                                        <span>{t('listing.baths', { count: listing.bathrooms })}</span>
                                                        <span>·</span>
                                                        <span>{listing.area || '-'} Sqm</span>
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-xs text-gray-500 text-center py-4">{t('filters.noProperties')}</p>
                                )}
                            </div>
                        )}

                        {/* Filters Grid */}
                        <div>
                            <label className="text-xs font-bold mb-2 block" style={{ color: '#222222' }}>{t('filters.propertyType')}</label>
                            <StyledSelect
                                options={propertyTypeOptions}
                                value={getSelectedOption(propertyTypeOptions, filters.type)}
                                onChange={(opt) => handleSelectChange('type', opt)}
                                placeholder={t('filters.allTypes')}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold mb-2 block" style={{ color: '#222222' }}>{t('filters.listingType')}</label>
                                <StyledSelect
                                    options={listingTypeOptions}
                                    value={getSelectedOption(listingTypeOptions, filters.listing_type)}
                                    onChange={(opt) => handleSelectChange('listing_type', opt)}
                                    placeholder={t('filters.saleAndRent')}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold mb-2 block" style={{ color: '#222222' }}>{t('filters.bedrooms')}</label>
                                <StyledSelect
                                    options={bedroomOptions}
                                    value={getSelectedOption(bedroomOptions, filters.bedrooms)}
                                    onChange={(opt) => handleSelectChange('bedrooms', opt)}
                                    placeholder={t('filters.any')}
                                />
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="text-xs font-bold mb-2 block" style={{ color: '#222222' }}>{t('filters.priceRange')}</label>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    placeholder={t('filters.minimum')}
                                    value={filters.min_price}
                                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                                />
                                <input
                                    type="number"
                                    placeholder={t('filters.maximum')}
                                    value={filters.max_price}
                                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    /* Transit Map */
                    <div className="h-full flex flex-col">
                        <label className="text-xs font-bold mb-2 block flex items-center gap-2" style={{ color: '#222222' }}>
                            <MapPinIcon className="w-4 h-4" />
                            {t('filters.searchByLocation')}
                        </label>
                        {filters.station_id && (
                            <div className="mb-2 text-sm text-primary-600 font-medium bg-primary-50 px-3 py-1 rounded-lg inline-block w-fit">
                                {t('filters.selected')}: {filters.station_id}
                            </div>
                        )}
                        <div className="bg-gray-50 dark:bg-white/5 rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 flex-1 min-h-[400px]">
                            <TransitMapFilter
                                onStationClick={(stationId) => handleFilterChange('station_id', stationId)}
                                selectedStation={filters.station_id}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Action - Static Flex Child */}
            <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-dashboard-card z-20">
                <button
                    onClick={handleApplyFilters}
                    className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-200 active:scale-[0.98] transition-transform"
                >
                    {t('filters.showResults')}
                </button>
            </div>
        </div>
    );
};

export default MobileSearchPage;
