import React from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
    MapPinIcon,
    BookmarkIcon,
    HeartIcon,
    StarIcon,
    ShareIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import {
    BookmarkIcon as BookmarkSolidIcon,
    HeartIcon as HeartSolidIcon,
    StarIcon as StarSolidIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon as MapPinSolidIcon,
    GlobeAltIcon
} from '@heroicons/react/24/solid';
import { SiLine, SiFacebook, SiInstagram, SiLinkedin } from 'react-icons/si';
import Modal from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { getMediaUrl } from '../../utils/media';
import { TbTrain } from "react-icons/tb";

import { saveListing, unsaveListing, checkIfSaved } from '../../services/savedListingsApi';
import { PHOTO_ROOM_TYPES } from '../../services/api';

const ListingCard = ({ listing = {}, viewMode = 'grid', priceFormat = 'short', showSave = true, to, onSaveToggle, initialSaved = false, cardClassName = '', index = 0 }) => {
    if (!listing || Object.keys(listing).length === 0 || !listing.id) return null; // Defensive check for undefined listings
    console.log('--- ListingCard Render ---', { id: listing.id, viewMode });
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
            const i = PHOTO_ROOM_TYPES.indexOf(rt && rt.trim() ? rt.trim() : 'Additional Photos');
            return i >= 0 ? i : PHOTO_ROOM_TYPES.length;
        };
        const sorted = [...images].sort((a, b) => order(a.room_type) - order(b.room_type));
        return sorted.map(m => getMediaUrl(m.url));
    }, [media, featuredImage]);

    const [isSaved, setIsSaved] = React.useState(initialSaved);
    const [savingListing, setSavingListing] = React.useState(false);
    const [isAgentModalOpen, setIsAgentModalOpen] = React.useState(false);
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
        ? `${nearestStationName} (${Number(distance_to_station)}m)`
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
                    className={`bg-white rounded-none overflow-hidden group ${animationClass}`}
                    style={animationStyle}
                >
                    <div className="relative aspect-[5/4.2] md:aspect-[5/4.7] rounded-[23px] overflow-hidden mb-2">
                        <Link to={cardLink}>

                            <img
                                src={listingImages[0]}
                                alt={title}
                                className="h-full w-full object-cover md:group-hover:scale-105 transition-transform duration-700"
                            />
                        </Link>

                        {/* Status Badge (Rent/Sale) — smaller on mobile for Favorites */}
                        <div className="absolute top-3.5 left-3.5">
                            <span className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] md:text-[11px] font-medium text-gray-900 shadow-sm">
                                {listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                            </span>
                        </div>

                        {showSave && (
                            <button
                                onClick={handleToggleSave}
                                disabled={savingListing}
                                className="absolute top-3 right-3 z-10 p-1 active:scale-95"
                            >
                                {isSaved ? (
                                    <HeartSolidIcon className="w-8 h-8 text-rose-500 stroke-white stroke-[2px] drop-shadow-md" />
                                ) : (
                                    <HeartSolidIcon className="w-8 h-8 text-slate-800/40 stroke-white stroke-[2px] drop-shadow-md" />
                                )}
                            </button>
                        )}

                        {/* Agent Profile Overlay - Floating Card Design */}
                        {isMainDomain && listing.agent && (
                            <button
                                onClick={handleAgentClick}
                                className="absolute bottom-[10px] left-[10px] md:bottom-[15px] md:left-[15px] z-10 pointer-events-auto group/agent active:scale-95 transition-all duration-300 group-hover:translate-y-[-3px] group-hover:scale-[1.04]"
                            >
                                <div
                                    className="bg-white/85 backdrop-blur-xl rounded-[10px] shadow-[0_4px_20px_0_rgba(31,38,135,0.12)] flex items-center justify-center border border-white/60 w-[88px] md:w-[112px] h-auto aspect-[3/1] overflow-hidden shimmer-sweep hover:bg-white transition-all duration-300 group-hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.18)]"
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
                                        <span className="text-primary-600 font-bold text-[11px] md:text-xs whitespace-nowrap px-2 truncate w-full text-center">
                                            {listing.agent.name || 'Agent'}
                                        </span>
                                    )}
                                </div>
                            </button>
                        )}
                    </div>

                    <div className="px-1.5 py-2">
                        <Link to={cardLink} className="block group/link">
                            <h3 className="text-[15px] md:text-[13px] font-medium text-slate-900 line-clamp-1 leading-snug md:group-hover:text-primary-600 transition-colors">
                                {title}
                            </h3>
                            <div className="mt-1 flex flex-col gap-0.5">
                                <p className="text-[15px] md:text-[13px] text-gray-500 font-medium">
                                    {bedrooms} Bed · {bathrooms} Bath
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            );
        }



        return (
            <div
                className={`group relative flex flex-col transition-all duration-300 ${cardClassName} animate-in fade-in slide-in-from-bottom-4 duration-500`}
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
                <div className="flex flex-col w-full bg-white rounded-none border-none">
                    <Link
                        to={cardLink}
                        className="relative aspect-[4/3.8] md:aspect-[4/3.5] w-full overflow-hidden rounded-[23px] block"
                    >
                        <img
                            src={listingImages[0]}
                            alt={title}
                            className="h-full w-full object-cover md:group-hover:scale-105 transition-transform duration-700 select-none"
                        />

                        {/* Status Badge */}
                        <div className="absolute top-3.5 left-3.5">
                            <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[15px] md:text-[12px] font-semibold text-gray-900 shadow-sm">
                                {is_featured ? 'Featured' : (listing_type === 'rent' ? 'For Rent' : 'For Sale')}
                            </span>
                        </div>

                        {showSave && (
                            <button
                                onClick={handleToggleSave}
                                disabled={savingListing}
                                className="absolute top-3 right-3 z-10 p-1 active:scale-95"
                            >
                                {isSaved ? (
                                    <HeartSolidIcon className="w-8 h-8 text-rose-500 stroke-white stroke-[2px] drop-shadow-md" />
                                ) : (
                                    <HeartSolidIcon className="w-8 h-8 text-slate-800/40 stroke-white stroke-[2px] drop-shadow-md" />
                                )}
                            </button>
                        )}

                        {/* Agent Profile Overlay - Floating Card Design */}
                        {isMainDomain && listing.agent && (
                            <div className="absolute bottom-[10px] left-[10px] md:bottom-[15px] md:left-[15px] z-10 pointer-events-auto">
                                <div
                                    className="bg-white/80 backdrop-blur-xl rounded-[16px] shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] flex items-center justify-center border border-white/40 w-[98px] md:w-[122px] h-auto aspect-[3/1] overflow-hidden"
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
                            </div>
                        )}



                    </Link>

                    <Link to={cardLink} className="py-3 px-1.5 flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                            <h3 className="text-[15px] md:text-[16px] font-semibold text-slate-900 truncate md:group-hover:text-primary-600 transition-colors">{title}</h3>
                        </div>

                        <div className="text-[15px] md:text-[14px] text-gray-500 flex items-center gap-1.5 mb-0.5">
                            <MapPinIcon className="w-4 h-4 md:w-3.5 md:h-3.5" />
                            <span className="truncate">{district || 'Bangkok'}</span>
                            {nearestStationName && (
                                <>
                                    <span className="text-gray-300">·</span>
                                    <span className="truncate font-medium text-gray-600">{nearestStationName}</span>
                                </>
                            )}
                        </div>

                        <p className="text-[15px] md:text-[14px] text-gray-500">
                            {bedrooms} Bed · {bathrooms} Bath · {area} Sqm
                        </p>

                        {created_at && (
                            <p className="text-[15px] md:text-[14px] text-gray-400 mt-0.5">
                                {new Date(created_at).toLocaleDateString('en-GB')}
                            </p>
                        )}

                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-[15px] md:text-[14.5px] font-semibold text-gray-900">฿{formatPrice(price)}</span>
                            <span className="text-[15px] md:text-[13px] text-gray-500">{listing_type === 'rent' ? '/ mo' : ''}</span>
                        </div>
                    </Link>
                </div>
            </div>
        );
    };

    // List view: horizontal row (image left, content right)
    if (isListView) {
        return (
            <div
                className={`group bg-white rounded-none border-b border-gray-100 flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500 ${cardClassName}`}
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
                <div className="p-4 flex gap-5">
                    <Link to={linkTo} className="relative aspect-[4/3.5] w-40 sm:w-48 overflow-hidden rounded-[23px] flex-shrink-0">

                        <img
                            src={listingImages[0]}
                            alt={title}
                            className="h-full w-full object-cover md:group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-3.5 left-3.5 z-10">
                            <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                                <span className="text-[12px] font-semibold text-gray-900">{listing_type === 'sale' ? 'For Sale' : 'For Rent'}</span>
                            </div>
                        </div>
                        {showSave && (
                            <button
                                onClick={handleToggleSave}
                                disabled={savingListing}
                                className="absolute top-2 right-2 z-10 p-1 active:scale-95"
                            >
                                {isSaved ? (
                                    <HeartSolidIcon className="w-8 h-8 text-rose-500 stroke-white stroke-[2px] drop-shadow-md" />
                                ) : (
                                    <HeartSolidIcon className="w-8 h-8 text-slate-800/40 stroke-white stroke-[2px] drop-shadow-md" />
                                )}
                            </button>
                        )}

                        {/* Agent Profile Overlay - Floating Card Design */}
                        {isMainDomain && listing.agent && (
                            <button
                                onClick={handleAgentClick}
                                className="absolute bottom-[10px] left-[10px] md:bottom-[15px] md:left-[15px] z-10 pointer-events-auto group/agent active:scale-95 transition-all duration-300 group-hover:translate-y-[-3px] group-hover:scale-[1.04]"
                            >
                                <div
                                    className="bg-white/85 backdrop-blur-xl rounded-[10px] shadow-[0_4px_20px_0_rgba(31,38,135,0.12)] flex items-center justify-center border border-white/60 w-[88px] md:w-[112px] h-auto aspect-[3/1] overflow-hidden shimmer-sweep hover:bg-white transition-all duration-300 group-hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.18)]"
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
                    </Link>
                    <div className="flex-1 py-1 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <Link to={linkTo}>
                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 md:hover:text-primary-600 transition-colors">{title}</h3>
                                </Link>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <MapPinIcon className="w-4 h-4" />
                                <span className="truncate">{district || 'Bangkok'}</span>
                                {stationWithDistance && (
                                    <>
                                        <span className="text-gray-300">·</span>
                                        <span className="truncate">{stationWithDistance}</span>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-4 text-sm text-gray-600">
                                <span>{bedrooms} Bed</span>
                                <span>{bathrooms} Bath</span>
                                <span>{area} sqm</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-end">
                            <p className="text-[16px] font-semibold text-gray-900">
                                ฿{formatPrice(price)}
                                <span className="text-sm font-normal text-gray-500">{listing_type === 'rent' ? '/mo' : ''}</span>
                            </p>
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

const AgentProfileModal = ({ isOpen, onClose, agent }) => {
    const logoUrl = getMediaUrl(agent.logo || agent.theme?.logo_url);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="sm"
            title="Agent Profile"
            centerTitle
        >
            <div className="flex flex-col">
                {/* Header Background */}
                <div className="h-24 bg-gradient-to-r from-primary-600/10 to-primary-600/5 relative" />

                <div className="px-6 pb-8 -mt-12 relative z-10 flex flex-col items-center">
                    {/* Logo Ring */}
                    <div className="w-24 h-24 rounded-2xl bg-white shadow-xl flex items-center justify-center p-2 border border-gray-50 mb-4">
                        {logoUrl ? (
                            <img src={logoUrl} alt={agent.name} className="w-full h-full object-contain" />
                        ) : (
                            <div className="w-full h-full bg-primary-100 rounded-xl flex items-center justify-center">
                                <span className="text-primary-600 font-bold text-2xl">
                                    {agent.name?.charAt(0) || 'A'}
                                </span>
                            </div>
                        )}
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 text-center mb-1">{agent.name}</h2>
                    {agent.subdomain && (
                        <p className="text-sm text-primary-600 font-medium mb-4">{agent.subdomain}.haizo.it.com</p>
                    )}

                    {agent.description && (
                        <p className="text-sm text-gray-600 text-center line-clamp-3 mb-6 px-2">
                            {agent.description}
                        </p>
                    )}

                    {/* Contact Grid */}
                    <div className="w-full grid grid-cols-1 gap-3 mb-8">
                        {agent.phone && (
                            <a href={`tel:${agent.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                    <PhoneIcon className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Phone</span>
                                    <span className="text-sm font-semibold text-gray-700">{agent.phone}</span>
                                </div>
                            </a>
                        )}
                        {agent.email && (
                            <a href={`mailto:${agent.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                    <EnvelopeIcon className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email</span>
                                    <span className="text-sm font-semibold text-gray-700 truncate max-w-[200px]">{agent.email}</span>
                                </div>
                            </a>
                        )}
                        {agent.address && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 group">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <MapPinSolidIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Address</span>
                                    <span className="text-sm font-semibold text-gray-700 line-clamp-1">{agent.address}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Social Links */}
                    <div className="w-full border-t border-gray-100 pt-6">
                        <div className="flex justify-center gap-4">
                            {agent.line && (
                                <a href={`https://line.me/ti/p/~${agent.line}`} target="_blank" rel="noreferrer" className="p-3 bg-[#06C755]/10 text-[#06C755] rounded-full hover:scale-110 transition-transform">
                                    <SiLine className="w-6 h-6" />
                                </a>
                            )}
                            {agent.facebook && (
                                <a href={agent.facebook} target="_blank" rel="noreferrer" className="p-3 bg-[#1877F2]/10 text-[#1877F2] rounded-full hover:scale-110 transition-transform">
                                    <SiFacebook className="w-6 h-6" />
                                </a>
                            )}
                            {agent.instagram && (
                                <a href={agent.instagram} target="_blank" rel="noreferrer" className="p-3 bg-[#E4405F]/10 text-[#E4405F] rounded-full hover:scale-110 transition-transform">
                                    <SiInstagram className="w-6 h-6" />
                                </a>
                            )}
                            {agent.linkedin && (
                                <a href={agent.linkedin} target="_blank" rel="noreferrer" className="p-3 bg-[#0A66C2]/10 text-[#0A66C2] rounded-full hover:scale-110 transition-transform">
                                    <SiLinkedin className="w-6 h-6" />
                                </a>
                            )}
                            {agent.custom_domain && (
                                <a href={`https://${agent.custom_domain}`} target="_blank" rel="noreferrer" className="p-3 bg-gray-100 text-gray-600 rounded-full hover:scale-110 transition-transform">
                                    <GlobeAltIcon className="w-6 h-6" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Quote or Mission */}
                {(agent.mission || agent.vision) && (
                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 italic text-center">
                        <p className="text-gray-500 text-sm">
                            "{agent.mission || agent.vision}"
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ListingCard;
