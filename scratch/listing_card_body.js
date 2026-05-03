const ListingCard = ({ listing = {}, viewMode = 'grid', priceFormat = 'short', showSave = true, to, onSaveToggle, initialSaved = false, cardClassName = '', index = 0 }) => {
    if (!listing || Object.keys(listing).length === 0 || !listing.id) return null; // Defensive check for undefined listings
    const {
        id,
        title,
        price,
        price_unit = 'THB',
        property_type,
        listing_type,
        bedrooms,
        bathrooms,
        area,
        station_id,
        station_name,
        distance_to_station,
        district,
        road,
        line_color,
        line_name,
        station,
        media = [],
        is_featured,
        created_at,
        agent,
    } = listing;

    // Get first image or placeholder
    const featuredImage = getMediaUrl(media.find((m) => m.type === 'image')?.url);

    // Order images by session: Bedroom first, then Living Room, then rest (same as detail page)
    const listingImages = React.useMemo(() => {
        const images = media.filter(m => m.type === 'image');
        if (!images.length) return featuredImage ? [featuredImage] : [];
        const order = (rt) => {
            if (!rt) return PHOTO_ROOM_TYPES.length;
            const normalized = rt.trim().toLowerCase();
            const index = PHOTO_ROOM_TYPES.findIndex(type => 
                type.toLowerCase() === normalized || 
                (normalized === 'bed room' && type.toLowerCase() === 'bedroom')
            );
            return index >= 0 ? index : PHOTO_ROOM_TYPES.length;
        };
        const sorted = [...images].sort((a, b) => order(a.room_type) - order(b.room_type));
        return sorted.map(m => getMediaUrl(m.url));
    }, [media, featuredImage]);

    const [isSaved, setIsSaved] = React.useState(initialSaved);
    const [savingListing, setSavingListing] = React.useState(false);
    const [isAgentModalOpen, setIsAgentModalOpen] = React.useState(false);
    
    // Performance Optimization: Ready states for lazy loading
    const [isInView, setIsInView] = React.useState(false);
    const [isFirstImageReady, setIsFirstImageReady] = React.useState(false);
    const cardRef = React.useRef(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' } // Load slightly before coming into view
        );
        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, []);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const { isMainDomain } = useTenant();

    // Check if listing is saved on mount
    React.useEffect(() => {
        const checkSavedStatus = async () => {
            if (initialSaved) return; // Skip if explicitly provided

            if (isAuthenticated && user) {
                try {
                    const response = await checkIfSaved(id);
                    // Backend returns { saved: true/false }
                    setIsSaved(response.saved);
                } catch (error) {
                    console.error('Error checking saved status:', error);
                }
            }
        };
        checkSavedStatus();
    }, [id, isAuthenticated, user, initialSaved]);

    // Listen for global save status changes to sync across components
    React.useEffect(() => {
        const handleStatusChange = (event) => {
            const { listingId, saved } = event.detail;
            if (String(listingId) === String(id)) {
                setIsSaved(saved);
            }
        };

        window.addEventListener('listing:saved-status-changed', handleStatusChange);
        return () => window.removeEventListener('listing:saved-status-changed', handleStatusChange);
    }, [id]);



    const handleToggleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (savingListing) return;

        if (!isAuthenticated) {
            navigate('/login', { state: { from: location } });
            return;
        }

        setSavingListing(true);
        try {
            if (isSaved) {
                await unsaveListing(id);
                setIsSaved(false);
                // Dispatch event to sync other cards
                window.dispatchEvent(new CustomEvent('listing:saved-status-changed', {
                    detail: { listingId: id, saved: false }
                }));
            } else {
                await saveListing(id);
                setIsSaved(true);
                // Dispatch event to sync other cards
                window.dispatchEvent(new CustomEvent('listing:saved-status-changed', {
                    detail: { listingId: id, saved: true }
                }));
            }
            if (onSaveToggle) onSaveToggle(!isSaved);
        } catch (error) {
            console.error('Error toggling save:', error);
        } finally {
            setSavingListing(false);
        }
    };

    const handleAgentClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsAgentModalOpen(true);
    };

    const handleBookClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const bookingUrl = `/listings/${id}/book`;

        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: bookingUrl } } });
        } else {
            navigate(bookingUrl);
        }
    };

    const nearestStationName = (station?.name_en || station_name || '').split('(')[0].trim() || '';
    const stationWithDistance = nearestStationName && (distance_to_station != null && distance_to_station !== '' && Number(distance_to_station) >= 0)
        ? `${nearestStationName} (${formatDistance(distance_to_station)})`
        : nearestStationName;



    // Format price
    const formatPrice = (price) => {
        if (!price) return 'N/A';
        // Always use full locale string as requested in the design
        return price.toLocaleString();
    };

    const formatRelativeTime = (dateStr) => {
        if (!dateStr) return '';
        const now = new Date();
        const date = new Date(dateStr);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? 'min' : 'mins'} ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Property type badge colors
    const typeColors = {
        condo: 'bg-blue-100 text-blue-800',
        house: 'bg-green-100 text-green-800',
        land: 'bg-yellow-100 text-yellow-800',
        townhouse: 'bg-purple-100 text-purple-800',
        townhome: 'bg-purple-100 text-purple-800',
        apartment: 'bg-pink-100 text-pink-800',
    };

    const isListView = viewMode === 'list';
    const isMapListView = viewMode === 'map-list';
    const linkTo = to || `/listings/${id}`;

    // --- RENDER LOGIC ---
    const renderUnifiedCard = (cardLink) => {
        const isSavedMode = viewMode === 'saved-grid';

        const animationStyle = { animationDelay: `${index * 50}ms`, animationFillMode: 'both' };
        const animationClass = 'animate-in fade-in slide-in-from-bottom-4 duration-500';

        if (isSavedMode || isListView) {
            return (
                <div
                    ref={cardRef}
                    className={`relative bg-transparent rounded-none group transition-all duration-700`}
                >
                    {!isFirstImageReady && <ListingCardSkeleton viewMode={viewMode} />}
                    <div className={`transition-all duration-700 ${isFirstImageReady ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
                        <div className="relative">
                            <div className="relative aspect-[5/4.5] md:aspect-[5/5.0] rounded-[23px] overflow-hidden mb-2">
                                <ListingImageSlider 
                                    images={listingImages} 
                                    title={title} 
                                    cardLink={cardLink} 
                                    shouldLoadFirst={isInView}
                                    onFirstImageReady={() => setIsFirstImageReady(true)}
                                />
                                {/* ... agent overlay ... */}

                             {/* Agent Profile Overlay - Floating Card Design */}
                             {isMainDomain && listing.agent && (
                                 <button
                                     onClick={handleAgentClick}
                                     className="absolute bottom-[10px] left-[10px] md:bottom-[15px] md:left-[15px] z-10 pointer-events-auto active:scale-95 transition-all duration-300"
                                 >
                                     <div
                                         className="bg-white/90 dark:bg-dashboard-card/90 backdrop-blur-xl rounded-lg shadow-lg flex items-center justify-center border border-white/60 dark:border-white/10 w-[88px] md:w-[112px] aspect-[2.8/1] overflow-hidden hover:bg-white dark:hover:bg-dashboard-hover transition-all duration-300"
                                         style={
                                             (listing.agent.logo || listing.agent.theme?.logo_url) ? {
                                                 backgroundImage: `url('${getMediaUrl(listing.agent.logo || listing.agent.theme?.logo_url)}')`,
                                                 backgroundSize: '75%',
                                                 backgroundRepeat: 'no-repeat',
                                                 backgroundPosition: 'center'
                                             } : {}
                                         }
                                     >
                                         {!(listing.agent.logo || listing.agent.theme?.logo_url) && (
                                             <span className="text-primary-600 font-bold text-[11px] md:text-xs whitespace-nowrap px-2 truncate w-full text-center">
                                                 {listing.agent.name || 'Agent'}
                                             </span>
                                         )}
                                     </div>
                                 </button>
                             )}
                        </div>

                        {/* Status Badge Group */}
                        <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-50 pointer-events-none">
                            <span className="bg-[#f0f0f0]/95 backdrop-blur-md border border-white/40 px-7 py-2.5 md:px-5 md:py-1.5 rounded-full text-[12px] md:text-[13px] font-bold text-gray-900 shadow-sm">
                                {listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                            </span>
                        </div>

                        {/* Favorite Button - Top Right Corner */}
                        {showSave && (
                                <div className="absolute top-2 right-3.5 z-50 pointer-events-none">
                                    <HeartButton
                                        isSaved={isSaved}
                                        onClick={handleToggleSave}
                                        disabled={savingListing}
                                        className="pointer-events-auto w-12 h-12 flex items-center justify-center"
                                    />
                                </div>
                        )}
                    </div>

                    <div className="px-1.5 py-2">
                        <Link to={cardLink} className="block group/link">
                            <h3 className="text-[16px] md:text-[13px] font-semibold text-[#222222] dark:text-white line-clamp-1 leading-snug md:group-hover:text-primary-600 transition-colors">
                                {title}
                            </h3>
                            <div className="mt-1 flex flex-col gap-0.5">
                                <p className="text-[16px] md:text-[13px] text-[#222222]/70 dark:text-gray-300 font-medium">
                                    {formatBedrooms(bedrooms)} · {bathrooms} Bath
                                </p>
                            </div>
                        </Link>
                    </div>
                    </div>
                </div>
            );
        }



        return (
            <div
                ref={cardRef}
                className={`group relative flex flex-col transition-all duration-700 ${cardClassName}`}
            >
                {!isFirstImageReady && <ListingCardSkeleton viewMode="grid" />}
                <div className={`flex flex-col w-full bg-transparent rounded-none border-none transition-all duration-700 ${isFirstImageReady ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98] absolute inset-0 pointer-events-none'}`}>
                        <div className="relative">
                            <div className="relative aspect-[4/4] md:aspect-[4/3.7] w-full overflow-hidden rounded-[32px] md:rounded-[23px] block animate-fill-fast">
                                <ListingImageSlider 
                                    images={listingImages} 
                                    title={title} 
                                    cardLink={cardLink} 
                                    shouldLoadFirst={isInView}
                                    onFirstImageReady={() => setIsFirstImageReady(true)}
                                />

                                {/* Agent Profile Overlay - Floating Card Design */}
                                {isMainDomain && listing.agent && (
                                    <button
                                        onClick={handleAgentClick}
                                        className="absolute bottom-[10px] left-[10px] md:bottom-[15px] md:left-[15px] z-10 pointer-events-auto group/agent active:scale-95 transition-all duration-300 group-hover:translate-y-[-3px] group-hover:scale-[1.04]"
                                    >
                                        <div
                                            className="bg-white/85 backdrop-blur-xl rounded-[4px] shadow-[0_4px_20px_0_rgba(31,38,135,0.12)] flex items-center justify-center border border-white/60 w-[88px] md:w-[112px] h-auto aspect-[3/1] overflow-hidden shimmer-sweep hover:bg-white transition-all duration-300 group-hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.18)]"
                                            style={
                                                (listing.agent.logo || listing.agent.theme?.logo_url) ? {
                                                    backgroundImage: `url('${getMediaUrl(listing.agent.logo || listing.agent.theme?.logo_url)}')`,
                                                    backgroundSize: '78%',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'center',
                                                    padding: '0px'
                                                } : {}
                                            }
                                        >
                                            {!(listing.agent.logo || listing.agent.theme?.logo_url) && (
                                                <span className="text-primary-600 font-bold text-xs md:text-sm whitespace-nowrap px-2 truncate w-full text-center">
                                                    {listing.agent.name || 'Agent'}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                )}
                            </div>

                            {/* Status Badge */}
                            <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-50 pointer-events-none animate-fill-med">
                                <span className="bg-[#f0f0f0]/95 backdrop-blur-md border border-white/40 px-7 py-2.5 md:px-5 md:py-1.5 rounded-full text-[14px] md:text-[13px] font-bold text-gray-900 shadow-sm">
                                    {is_featured ? 'Featured' : (listing_type === 'rent' ? 'For Rent' : 'For Sale')}
                                </span>
                            </div>

                            {/* Favorite Button - Top Right Corner */}
                            {showSave && (
                                <div className="absolute top-2 right-3.5 z-50 pointer-events-none">
                                    <HeartButton
                                        isSaved={isSaved}
                                        onClick={handleToggleSave}
                                        disabled={savingListing}
                                        className="pointer-events-auto w-12 h-12 flex items-center justify-center"
                                    />
                                </div>
                            )}
                        </div>
                </div>

                <Link to={cardLink} className="py-3 px-1.5 flex flex-col gap-1">
                    <div className="flex justify-between items-start animate-fill-med">
                        <h3 className="text-[16px] md:text-[16px] font-semibold text-[#222222] dark:text-white truncate md:group-hover:text-primary-600 transition-colors">{title}</h3>
                    </div>

                    {stationWithDistance && (
                        <div className="text-[17px] md:text-[14px] flex items-center gap-2 mb-1.5 animate-fill-med mt-0.5 font-sans">
                            <div 
                                className="w-[34px] h-[26px] md:w-[30px] md:h-[22px] rounded-[6px] flex items-center justify-center p-1 flex-shrink-0 shadow-sm"
                                style={{ backgroundColor: station?.line_color || line_color || '#222222' }}
                            >
                                <MdOutlineDirectionsTransit className="w-full h-full text-white" />
                            </div>
                            <span className="truncate font-medium text-[#646464] dark:text-gray-300">{stationWithDistance}</span>
                        </div>
                    )}

                    <p className="text-[16px] md:text-[14px] text-[#222222]/70 dark:text-gray-300 animate-fill-slow">
                        {formatBedrooms(bedrooms)} · {bathrooms} Bath · {area} Sqm
                    </p>

                    <div className="mt-2 flex items-baseline gap-1 animate-fill-slow">
                        <span className="text-[16.5px] md:text-[14.5px] font-semibold text-[#222222] dark:text-white">฿{formatPrice(price)}</span>
                        <span className="text-[14.5px] md:text-[13px] text-[#222222]/60 dark:text-gray-400">{listing_type === 'rent' ? '/ month' : ''}</span>
                    </div>
                </Link>
            </div>
        );
    };

    // List view: horizontal row (image left, content right)
    if (isListView) {
        return (
            <div
                ref={cardRef}
                className={`group bg-transparent rounded-none border-b border-gray-100 dark:border-white/10 flex flex-col transition-all duration-700 animate-in fade-in duration-500 ${cardClassName}`}
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
                {!isFirstImageReady && <ListingCardSkeleton viewMode="list" />}
                <div className={`transition-all duration-700 ${isFirstImageReady ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
                    <div className="p-4 flex gap-5 relative">
                    <div className="relative aspect-[4/3.8] w-40 sm:w-48 overflow-hidden rounded-[23px] flex-shrink-0">
                        <ListingImageSlider 
                            images={listingImages} 
                            title={title} 
                            cardLink={linkTo} 
                            shouldLoadFirst={isInView}
                            onFirstImageReady={() => setIsFirstImageReady(true)}
                        />
                                <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2 pointer-events-none">
                                    <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                                        <span className="text-[12px] font-semibold text-gray-900">{listing_type === 'sale' ? 'For Sale' : 'For Rent'}</span>
                                    </div>
                                </div>

                                {/* Favorite Button - Top Right Corner */}
                                {showSave && (
                                    <div className="absolute top-2 right-3.5 z-10 pointer-events-none">
                                        <HeartButton
                                            isSaved={isSaved}
                                            onClick={handleToggleSave}
                                            disabled={savingListing}
                                            className="pointer-events-auto w-12 h-12 flex items-center justify-center"
                                        />
                                    </div>
                                )}

                                {/* Agent Profile Overlay - Floating Card Design */}
                                {isMainDomain && listing.agent && (
                                    <button
                                        onClick={handleAgentClick}
                                        className="absolute bottom-[10px] left-[10px] md:bottom-[15px] md:left-[15px] z-10 pointer-events-auto group/agent active:scale-95 transition-all duration-300 group-hover:translate-y-[-3px] group-hover:scale-[1.04]"
                                    >
                                        <div
                                            className="bg-white/85 backdrop-blur-xl rounded-[4px] shadow-[0_4px_20px_0_rgba(31,38,135,0.12)] flex items-center justify-center border border-white/60 w-[88px] md:w-[112px] h-auto aspect-[3/1] overflow-hidden shimmer-sweep hover:bg-white transition-all duration-300 group-hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.18)]"
                                            style={
                                                (listing.agent.logo || listing.agent.theme?.logo_url) ? {
                                                    backgroundImage: `url('${getMediaUrl(listing.agent.logo || listing.agent.theme?.logo_url)}')`,
                                                    backgroundSize: '78%',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'center',
                                                    padding: '0px'
                                                } : {}
                                            }
                                        >
                                            {!(listing.agent.logo || listing.agent.theme?.logo_url) && (
                                                <span className="text-primary-600 font-bold text-xs md:text-sm whitespace-nowrap px-2 truncate w-full text-center">
                                                    {listing.agent.name || 'Agent'}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                )}
                            </div>
                    <div className="flex-1 py-1 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <Link to={linkTo}>
                                    <h3 className="text-[16px] sm:text-lg font-semibold text-[#222222] dark:text-white line-clamp-1 md:hover:text-primary-600 transition-colors">{title}</h3>
                                </Link>
                            </div>
                            {stationWithDistance && (
                                <div className="flex items-center gap-2 text-[17px] sm:text-sm mb-1.5 mt-0.5 font-sans">
                                    <div 
                                        className="w-[34px] h-[26px] sm:w-[30px] sm:h-[22px] rounded-[6px] flex items-center justify-center p-1 flex-shrink-0 shadow-sm"
                                        style={{ backgroundColor: station?.line_color || line_color || '#222222' }}
                                    >
                                        <MdOutlineDirectionsTransit className="w-full h-full text-white" />
                                    </div>
                                    <span className="truncate font-medium text-[#646464] dark:text-gray-300">{stationWithDistance}</span>
                                </div>
                            )}
                            <div className="flex gap-4 text-[16px] sm:text-sm text-[#222222]/70 dark:text-gray-300">
                                <span>{formatBedrooms(bedrooms)}</span>
                                <span>{bathrooms} Bath</span>
                                <span>{area} sqm</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-end">
                            <p className="text-[16.5px] font-semibold text-[#222222] dark:text-white">
                                ฿{formatPrice(price)}
                                <span className="text-[14.5px] font-normal text-[#222222]/60 dark:text-gray-400">{listing_type === 'rent' ? '/ month' : ''}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

    // Map view and grid: same card design as list page (image on top, details below)
    return (
        <>
            {renderUnifiedCard(linkTo)}
            {isAgentModalOpen && listing.agent && (
                <AgentProfileModal
                    isOpen={isAgentModalOpen}
                    onClose={() => setIsAgentModalOpen(false)}
                    agent={listing.agent}
                />
            )}
        </>
    );
};
