import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPinIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { LiaBedSolid } from "react-icons/lia";
import { PiBathtub } from "react-icons/pi";
import { MdOutlineDirectionsTransit } from "react-icons/md";
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { getMediaUrl } from '../../utils/media';
import { saveListing, unsaveListing, checkIfSaved } from '../../services/savedListingsApi';
import HeartButton from '../ui/HeartButton';
import ListingImageSlider from './ListingImageSlider';
import AgentProfileModal from '../Agent/AgentProfileModal';
import placeholderImage from '../../assets/images/building_block.png';

const ListingCard = React.memo(({
    listing,
    index,
    viewMode = 'grid',
    showSave = true,
    to,
    cardClassName = ''
}) => {
    const { 
        id, title, price, listing_type, bedrooms, bathrooms, 
        district, area, station_name, station_distance_meters, 
        is_featured, media, station 
    } = listing;
    
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { isMainDomain } = useTenant();
    const [isSaved, setIsSaved] = useState(false);
    const [savingListing, setSavingListing] = useState(false);
    const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

    // Initial check and global sync
    useEffect(() => {
        const checkSaved = async () => {
            if (user) {
                try {
                    const response = await checkIfSaved(id);
                    setIsSaved(response.saved);
                } catch (e) {
                    setIsSaved(false);
                }
            }
        };
        checkSaved();
    }, [id, user]);

    useEffect(() => {
        const handleStatusChange = (e) => {
            if (String(e.detail.listingId) === String(id)) {
                setIsSaved(e.detail.saved);
            }
        };
        window.addEventListener('listing:saved-status-changed', handleStatusChange);
        return () => window.removeEventListener('listing:saved-status-changed', handleStatusChange);
    }, [id]);

    const handleToggleSave = useCallback(async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!user) {
            navigate('/login', { state: { from: location } });
            return;
        }

        setSavingListing(true);
        const nextState = !isSaved;
        setIsSaved(nextState); // Optimistic

        try {
            if (nextState) await saveListing(id);
            else await unsaveListing(id);
            
            window.dispatchEvent(new CustomEvent('listing:saved-status-changed', {
                detail: { listingId: id, saved: nextState }
            }));
        } catch (error) {
            setIsSaved(!nextState); // Rollback
            console.error('Error toggling save:', error);
        } finally {
            setSavingListing(false);
        }
    }, [id, isSaved, user, navigate, location]);

    const handleAgentClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (listing.agent) {
            setIsAgentModalOpen(true);
        }
    }, [listing.agent]);

    const getPriceDisplay = () => {
        if (!price) return 'Contact for Price';
        return `฿${parseInt(price).toLocaleString()}`;
    };

    const listingImages = useMemo(() => {
        if (!media || media.length === 0) return [placeholderImage];
        return media.filter(m => m.type === 'image').map(m => getMediaUrl(m.url));
    }, [media]);

    const stationWithDistance = useMemo(() => {
        const name = (station?.name_en || station_name || '').split('(')[0].trim();
        if (!name) return null;
        if (station_distance_meters != null) {
            return `${name} (${station_distance_meters}m)`;
        }
        return name;
    }, [station, station_name, station_distance_meters]);

    const linkTo = to || `/listings/${id}`;
    const isListView = viewMode === 'list';

    // Shared badge component
    const Badges = () => (
        <>
            <div className="absolute top-3 left-3 flex items-center gap-2 z-10 pointer-events-none">
                <span className="bg-white/90 dark:bg-dashboard-card/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-gray-900 dark:text-white shadow-sm border border-black/5 dark:border-white/5">
                    {listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
                {is_featured && (
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-sm">
                        Featured
                    </span>
                )}
            </div>
            {showSave && (
                <div className="absolute top-3 right-3 z-20">
                    <HeartButton
                        isSaved={isSaved}
                        onClick={handleToggleSave}
                        disabled={savingListing}
                        className="w-10 h-10 flex items-center justify-center bg-white/90 dark:bg-dashboard-card/90 backdrop-blur-md rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all border border-black/5 dark:border-white/5"
                    />
                </div>
            )}
        </>
    );

    if (isListView) {
        return (
            <div className={`group relative bg-transparent border-b border-gray-100 dark:border-white/5 last:border-0 ${cardClassName}`}>
                <div className="p-4 flex gap-5">
                    <div className="relative w-40 sm:w-56 aspect-[4/3] flex-shrink-0 overflow-hidden rounded-[20px]">
                        <ListingImageSlider images={listingImages} title={title} cardLink={linkTo} />
                        <Badges />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between py-1">
                        <Link to={linkTo} className="block">
                            <h3 className="text-[17px] font-bold text-gray-900 dark:text-white line-clamp-1 mb-1.5 group-hover:text-primary-600 transition-colors">
                                {title}
                            </h3>
                            
                            {stationWithDistance && (
                                <div className="flex items-center gap-2 mb-2">
                                    <div 
                                        className="w-6 h-5 rounded-[4px] flex items-center justify-center p-0.5 flex-shrink-0"
                                        style={{ backgroundColor: station?.line_color || '#222222' }}
                                    >
                                        <MdOutlineDirectionsTransit className="w-full h-full text-white" />
                                    </div>
                                    <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400 truncate">{stationWithDistance}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-3 text-[14px] text-gray-500 dark:text-gray-400">
                                <span>{bedrooms} Bed</span>
                                <span>{bathrooms} Bath</span>
                                <span>{area} sqm</span>
                            </div>
                        </Link>

                        <div className="flex items-center justify-between mt-auto">
                            <span className="text-[18px] font-bold text-gray-900 dark:text-white">
                                {getPriceDisplay()}
                                {listing_type === 'rent' && <span className="text-[13px] font-normal text-gray-500 ml-1">/mo</span>}
                            </span>
                            
                            {isMainDomain && listing.agent && (
                                <button onClick={handleAgentClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 dark:border-white/10 bg-gray-50">
                                        {(listing.agent.logo || listing.agent.theme?.logo_url) ? (
                                            <img src={getMediaUrl(listing.agent.logo || listing.agent.theme?.logo_url)} className="w-full h-full object-contain p-1" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary-600">
                                                {listing.agent.name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {isAgentModalOpen && <AgentProfileModal isOpen={isAgentModalOpen} onClose={() => setIsAgentModalOpen(false)} agentId={listing.agent_id} />}
            </div>
        );
    }

    return (
        <div className={`group relative flex flex-col bg-transparent ${cardClassName}`}>
            <div className="relative aspect-[4/3.8] w-full overflow-hidden rounded-[24px] mb-3">
                <ListingImageSlider images={listingImages} title={title} cardLink={linkTo} />
                <Badges />
                
                {isMainDomain && listing.agent && (
                    <button
                        onClick={handleAgentClick}
                        className="absolute bottom-3 left-3 z-10 active:scale-95 transition-all"
                    >
                        <div className="bg-white/90 dark:bg-dashboard-card/90 backdrop-blur-md rounded-lg p-1.5 shadow-lg border border-white/50">
                            {listing.agent.logo || listing.agent.theme?.logo_url ? (
                                <img 
                                    src={getMediaUrl(listing.agent.logo || listing.agent.theme?.logo_url)} 
                                    alt="" 
                                    className="h-6 md:h-7 object-contain"
                                />
                            ) : (
                                <span className="text-[10px] font-bold text-primary-600 px-2">{listing.agent.name}</span>
                            )}
                        </div>
                    </button>
                )}
            </div>

            <Link to={linkTo} className="flex flex-col gap-1 px-1">
                <h3 className="text-[16px] font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">
                    {title}
                </h3>
                
                {stationWithDistance && (
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-6 h-4.5 rounded-[3px] flex items-center justify-center p-0.5 flex-shrink-0"
                            style={{ backgroundColor: station?.line_color || '#222222' }}
                        >
                            <MdOutlineDirectionsTransit className="w-full h-full text-white" />
                        </div>
                        <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400 truncate">{stationWithDistance}</span>
                    </div>
                )}

                <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex items-center gap-1 text-[13px] text-gray-500 dark:text-gray-400">
                        <LiaBedSolid className="w-4 h-4" />
                        <span>{bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[13px] text-gray-500 dark:text-gray-400">
                        <PiBathtub className="w-4 h-4" />
                        <span>{bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[13px] text-gray-500 dark:text-gray-400">
                        <ArrowsPointingOutIcon className="w-3.5 h-3.5" />
                        <span>{area} sqm</span>
                    </div>
                </div>

                <div className="mt-1.5">
                    <span className="text-[17px] font-bold text-gray-900 dark:text-white">{getPriceDisplay()}</span>
                    {listing_type === 'rent' && <span className="text-[13px] text-gray-500 font-normal ml-1">/mo</span>}
                </div>
            </Link>

            {isAgentModalOpen && <AgentProfileModal isOpen={isAgentModalOpen} onClose={() => setIsAgentModalOpen(false)} agentId={listing.agent_id} />}
        </div>
    );
});

ListingCard.displayName = 'ListingCard';

export default ListingCard;
