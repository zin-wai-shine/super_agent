import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import { useAuth } from '../../contexts/AuthContext';
import { publicApi, appointmentApi, PHOTO_ROOM_TYPES } from '../../services/api';
import { saveListing, unsaveListing, checkIfSaved } from '../../services/savedListingsApi';

import {
    MapPinIcon,
    HomeIcon,
    ArrowLeftIcon,
    PhoneIcon,
    EnvelopeIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ShareIcon,
    HeartIcon,
    Square2StackIcon,
    ArrowsPointingOutIcon,
    SparklesIcon,
    CurrencyDollarIcon,
    CubeIcon,
    XMarkIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    ChatBubbleLeftRightIcon,
    DevicePhoneMobileIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    CalendarDaysIcon,
    BuildingOfficeIcon,
    ArrowRightIcon,
    CheckCircleIcon, // Added CheckCircleIcon to outline
    ClockIcon, // Moved ClockIcon to outline
} from '@heroicons/react/24/outline';
import {
    HeartIcon as HeartSolidIcon,
    CheckBadgeIcon,
    StarIcon,
    CalendarIcon,
    XCircleIcon,
    CheckCircleIcon as SolidCheckCircleIcon, // Kept SolidCheckCircleIcon for success message
} from '@heroicons/react/24/solid';
import { getMediaUrl } from '../../utils/media';
import ListingCard from '../../components/Listings/ListingCard';
import PropertyShare from '../../components/Listings/PropertyShare';
import GoogleMapComponent from '../../components/Listings/GoogleMap';
import Button from '../../components/ui/Button';

import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import AllPhotosModalContent from '../../components/Listings/AllPhotosModalContent';
import FilterBar from '../../components/ui/FilterBar';
import { TbTrain, TbCurrencyBaht } from "react-icons/tb";
import { LiaBedSolid } from "react-icons/lia";
import { PiBathtub, PiWavesLight } from "react-icons/pi";
import { RiStairsLine } from "react-icons/ri";
import { LuSofa, LuWind } from "react-icons/lu";
import { LuCalendarCheck2 } from "react-icons/lu";
import { FiHeart } from "react-icons/fi";
import {
    HiOutlineTv,
} from "react-icons/hi2";
import {
    MdOutlineKitchen,
    MdOutlineLocalParking,
    MdOutlinePool,
    MdOutlineFitnessCenter,
    MdOutlineHotTub,
    MdOutlinePark,
    MdOutlineChildCare,
    MdOutlineComputer,
    MdOutlineMicrowave,
    MdOutlineLocalLaundryService,
    MdOutlineSecurity,
    MdOutlineSoupKitchen,
    MdOutlineElevator,
    MdOutlineSupportAgent,
    MdOutlineRestaurant,
    MdOutlineStorefront,
    MdOutlineDirectionsBus,
    MdOutlineSpa,
    MdOutlineLaptop,
    MdOutlineMeetingRoom,
    MdOutlineGarage
} from "react-icons/md";
import { BiSolidFridge } from "react-icons/bi";
import { IoWaterOutline } from "react-icons/io5";
import { TransitMapSVG } from '../../components/TransitMap/transit_map.svg.js';
import StyledSelect from '../../components/Form/StyledSelect';

// Custom Icons for "cool" look
const BedIcon = (props) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 20h20M5 20v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7M2 13h20" />
    </svg>
);
// Re-defining BedIcon nicely
const CustomBedIcon = (props) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 17h18M3 7v10M21 7v10M3 11h3a2 2 0 0 1 2 2v4M12 11h9" />
        {/* Simple Bed Side View */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 19h20M4 19v-9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9M2 14h2M20 14h2" />
    </svg>
);
// Actually using standard paths manually
const BedIconCool = (props) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18H4V8h2m14 10h-2V8h2m-6 3h-2v2h2v-2zM4 14h16" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 18h20" />
    </svg>
);

const BathIconCool = (props) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        {/* Shower Head */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4h6v2H9zM12 2v2M12 12V6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 14a4 4 0 1 0 8 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 16v1m4-1v1m-2 1v1" />
    </svg>
);
const BathIconCool2 = (props) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8a2 2 0 0 1 2-2h3.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 10a2 2 0 1 1-2.83 2.83" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5" />
    </svg>
);
// Sofa
const SofaIconCool = (props) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12V8H4v4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20v8H2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12v-2M18 12v-2" />
    </svg>
);

// Stairs
const StairsIconCool = (props) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 5h-4V9h-4v4H7v4H3" />
    </svg>
);

// Train
const TrainIconCool = (props) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 21l-2-3M16 21l2-3M4 11h16M9 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm10 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
    </svg>
);

export const ListingDetailView = ({ id: propId, isModal = false, onTitleChange, onClose, onOpenGallery }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: routeId } = useParams();
    const id = propId || routeId;
    const { user, isAuthenticated } = useAuth();
    const [listing, setListing] = useState(null);
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const isMapView = searchParams.get('view') === 'map';
    const [viewedBooking, setViewedBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageSlideDir, setImageSlideDir] = useState(null); // 'next' | 'prev' | null – for transition
    const [imageTransitionStep, setImageTransitionStep] = useState(0); // 0 = start, 1 = end (triggers CSS transition)
    const [isFavorite, setIsFavorite] = useState(false);
    const [relatedListings, setRelatedListings] = useState([]);
    const [activeMapTab, setActiveMapTab] = useState('google');
    const [mapState, setMapState] = useState({
        zoom: 0.8,
        pan: { x: -200, y: -200 },
        markerPos: null
    });
    const transitMapRef = useRef(null);
    const transitWrapperRef = useRef(null);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [showAllFacilities, setShowAllFacilities] = useState(false);


    // 2. Optimized Map Props (Hooks)
    const mapCenter = useMemo(() => {
        if (!listing?.latitude || !listing?.longitude) return undefined;
        return {
            lat: parseFloat(listing.latitude),
            lng: parseFloat(listing.longitude)
        };
    }, [listing?.id]); // Only re-calculate when the listing actually changes

    const mapOptions = useMemo(() => ({
        gestureHandling: 'cooperative',
        disableDefaultUI: false,
        styles: [], // Remove custom grey map styles for detail page
        mapId: 'DEMO_MAP_ID'
    }), []);

    const [isContactOverlayOpen, setIsContactOverlayOpen] = useState(false);
    const [isBookingOverlayOpen, setIsBookingOverlayOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [savingListing, setSavingListing] = useState(false);
    const [activeBooking, setActiveBooking] = useState(null); // Tracks if the user already booked this property
    const [showStickyHeader, setShowStickyHeader] = useState(false);
    const bookingBarRef = useRef(null);
    const touchStartRef = useRef({ x: 0, y: 0 });
    const mouseStartRef = useRef({ x: 0, down: false });
    const didSwipeRef = useRef(false);
    const bookingDateRef = useRef(null);
    const bookingTimeRef = useRef(null);
    const bookingFullNameRef = useRef(null);
    const bookingPhoneRef = useRef(null);
    const bookingEmailRef = useRef(null);
    const bookingConfirmRef = useRef(null);

    // Booking states (from BookAppointment.js)
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [bookedAppointment, setBookedAppointment] = useState(null);
    const [bookingErrors, setBookingErrors] = useState({});
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [bookingForm, setBookingForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        preferred_date: '',
        preferred_time: '',
        purpose: 'rent',
        message: '',
    });

    // Advanced booking states
    const [availableSlots, setAvailableSlots] = useState([]);
    const [lockId, setLockId] = useState(null);
    const [confirmedDateTime, setConfirmedDateTime] = useState(false);
    const [expiresAt, setExpiresAt] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [fetchingSlots, setFetchingSlots] = useState(false);

    const rawImages = listing?.media?.filter((m) => m.type === 'image') || [];
    // Order by room type: Bedroom first, then Living Room, then rest — so count 1, 2, 3… starts from Bedroom
    const images = useMemo(() => {
        if (!rawImages.length) return [];
        const order = (rt) => {
            const i = PHOTO_ROOM_TYPES.indexOf(rt && rt.trim() ? rt.trim() : 'Additional Photos');
            return i >= 0 ? i : PHOTO_ROOM_TYPES.length;
        };
        return [...rawImages].sort((a, b) => order(a.room_type) - order(b.room_type));
    }, [listing?.media]);

    // Detail hero starts at first image (Bedroom first after sort)
    useEffect(() => {
        if (!images.length) return;
        setCurrentImageIndex(0);
    }, [listing?.id, images.length]);

    // Trigger slide animation after paint (transitionStep 0 → 1)
    useEffect(() => {
        if (imageSlideDir == null) return;
        const id = requestAnimationFrame(() => setImageTransitionStep(1));
        return () => cancelAnimationFrame(id);
    }, [imageSlideDir, currentImageIndex]);

    // Reset slide direction after transition ends
    useEffect(() => {
        if (imageSlideDir == null) return;
        const t = setTimeout(() => {
            setImageSlideDir(null);
            setImageTransitionStep(0);
        }, 320);
        return () => clearTimeout(t);
    }, [imageSlideDir, currentImageIndex]);

    const openGallery = (index) => {
        if (isModal && onOpenGallery && images?.length) {
            onOpenGallery({ images, initialIndex: Math.min(index, images.length - 1) });
        }
    };

    // Intersection Observer for Sticky Header
    useEffect(() => {
        if (!bookingId || !bookingBarRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowStickyHeader(!entry.isIntersecting);
            },
            { threshold: 0 }
        );

        observer.observe(bookingBarRef.current);
        return () => observer.disconnect();
    }, [bookingId]);

    // Update Modal Title & Header Extra (including gallery header when image viewer is open)
    useEffect(() => {
        if (isModal && onTitleChange) {
            if (isBookingOverlayOpen) {
                onTitleChange(
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsBookingOverlayOpen(false)}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-all py-1.5 px-3 rounded-lg hover:bg-gray-100/50 active:scale-95 group"
                        >
                            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            <span className="text-sm font-bold">Back</span>
                        </button>
                        <span className="text-lg font-bold text-gray-900">Appointment Details</span>
                    </div>
                );
            } else if (isContactOverlayOpen) {
                onTitleChange(
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsContactOverlayOpen(false)}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-all py-1.5 px-3 rounded-lg hover:bg-gray-100/50 active:scale-95 group"
                        >
                            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            <span className="text-sm font-bold">Back</span>
                        </button>
                        <span className="text-lg font-bold text-gray-900">Let's Connect</span>
                    </div>
                );
            } else {
                onTitleChange(bookingId ? "Appointment Details" : "Property Details");
            }
        }
    }, [isModal, onTitleChange, isBookingOverlayOpen, isContactOverlayOpen, bookingId]);

    // Lock background scroll when modals or overlays are open
    useEffect(() => {
        if (isContactOverlayOpen || isBookingOverlayOpen) {
            document.body.style.overflow = 'hidden';

            // Also lock the inner modal scrollable if we're in modal mode
            if (isModal) {
                const containers = document.querySelectorAll('.modal-scrollable');
                containers.forEach(container => {
                    // Lock anything that isn't the active overlay itself
                    if (!container.classList.contains('z-[60]')) {
                        container.style.setProperty('overflow', 'hidden', 'important');
                    }
                });
            }
        } else {
            document.body.style.overflow = 'unset';
            if (isModal) {
                const containers = document.querySelectorAll('.modal-scrollable');
                containers.forEach(container => {
                    container.style.overflow = '';
                });
            }
        }
        return () => {
            document.body.style.overflow = 'unset';
            const containers = document.querySelectorAll('.modal-scrollable');
            containers.forEach(container => {
                container.style.overflow = '';
            });
        };
    }, [isContactOverlayOpen, isBookingOverlayOpen, isModal]);

    // Scroll Contact modal to top when it opens
    useEffect(() => {
        if (isContactOverlayOpen) {
            // Find the contact modal container and scroll it to top
            setTimeout(() => {
                const contactModal = document.querySelector('.contact-modal-scrollable');
                if (contactModal) {
                    contactModal.scrollTop = 0;

                    // Also reset the parent modal-scrollable container
                    let parent = contactModal.parentElement;
                    while (parent) {
                        if (parent.classList.contains('modal-scrollable') && parent !== contactModal) {
                            parent.scrollTop = 0;
                            break;
                        }
                        parent = parent.parentElement;
                    }
                }
            }, 50);
        }
    }, [isContactOverlayOpen]);

    // Check if listing is saved on load
    useEffect(() => {
        const checkSavedStatus = async () => {
            if (listing && user) {
                try {
                    const response = await checkIfSaved(listing.id);
                    setIsSaved(response.saved);
                } catch (error) {
                    // User not logged in or error - not saved
                    setIsSaved(false);
                }
            }
        };
        checkSavedStatus();
    }, [listing, user]);

    // Listen for global save status changes to sync across components
    useEffect(() => {
        const handleStatusChange = (event) => {
            const { listingId, saved } = event.detail;
            if (listing && String(listingId) === String(listing.id)) {
                setIsSaved(saved);
            }
        };

        window.addEventListener('listing:saved-status-changed', handleStatusChange);
        return () => window.removeEventListener('listing:saved-status-changed', handleStatusChange);
    }, [listing]);

    // Handle save/unsave listing
    const handleToggleSave = async () => {
        if (!user) {
            navigate('/login', { state: { from: { pathname: location.pathname + location.search } } });
            return;
        }

        setSavingListing(true);
        try {
            if (isSaved) {
                await unsaveListing(listing.id);
                setIsSaved(false);

                // Dispatch global event for real-time synchronization
                window.dispatchEvent(new CustomEvent('listing:saved-status-changed', {
                    detail: { listingId: listing.id, saved: false }
                }));
            } else {
                await saveListing(listing.id);
                setIsSaved(true);

                // Dispatch global event for real-time synchronization
                window.dispatchEvent(new CustomEvent('listing:saved-status-changed', {
                    detail: { listingId: listing.id, saved: true }
                }));
            }
        } catch (error) {
            console.error('Save listing error:', error);

            // Handle authentication errors
            if (error.error === 'Unauthorized' || error.message?.includes('token')) {
                // Clear invalid tokens
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                navigate('/login');
            }
        } finally {
            setSavingListing(false);
        }
    };

    // Handle booking click with authentication check
    const handleBookingClick = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!user) {
            navigate('/login', { state: { from: { pathname: location.pathname + location.search } } });
            return;
        }

        setIsBookingOverlayOpen(!isBookingOverlayOpen);
    };


    // Map Constants
    const MAP_WIDTH = 1368;
    const MAP_HEIGHT = 1340;

    const constrainPan = (newPan, currentZoom) => {
        if (!transitWrapperRef.current) return newPan;

        const containerWidth = transitWrapperRef.current.clientWidth;
        const containerHeight = transitWrapperRef.current.clientHeight;

        const scaledWidth = MAP_WIDTH * currentZoom;
        const scaledHeight = MAP_HEIGHT * currentZoom;

        let minX, maxX, minY, maxY;

        if (scaledWidth > containerWidth) {
            minX = containerWidth - scaledWidth;
            maxX = 0;
        } else {
            minX = (containerWidth - scaledWidth) / 2;
            maxX = minX;
        }

        if (scaledHeight > containerHeight) {
            minY = containerHeight - scaledHeight;
            maxY = 0;
        } else {
            minY = (containerHeight - scaledHeight) / 2;
            maxY = minY;
        }

        return {
            x: Math.min(Math.max(newPan.x, minX), maxX),
            y: Math.min(Math.max(newPan.y, minY), maxY)
        };
    };

    const getMinZoom = () => {
        if (!transitWrapperRef.current) return 0.4;
        const containerWidth = transitWrapperRef.current.clientWidth;
        const containerHeight = transitWrapperRef.current.clientHeight;
        return Math.max(containerWidth / MAP_WIDTH, containerHeight / MAP_HEIGHT);
    };

    useEffect(() => {
        if (activeMapTab === 'transit' && listing?.station_id && transitMapRef.current) {
            // Wait for SVG to be rendered in the next tick
            setTimeout(() => {
                const stationEl = transitMapRef.current.querySelector(`[data-station-id="${listing.station_id}"]`);
                if (stationEl) {
                    const circle = stationEl.querySelector('circle') || stationEl.querySelector('rect') || stationEl;
                    const x = parseFloat(circle.getAttribute('cx') || circle.getAttribute('x') || 0);
                    const y = parseFloat(circle.getAttribute('cy') || circle.getAttribute('y') || 0);

                    if (x && y) {
                        setMapState(prev => ({
                            ...prev,
                            markerPos: { x, y },
                            pan: {
                                x: -(x * prev.zoom) + 250, // Center in 500px height container
                                y: -(y * prev.zoom) + 250
                            }
                        }));
                    }
                }
            }, 100);
        }
    }, [activeMapTab, listing?.station_id]);

    useEffect(() => {
        // Smooth scroll to top when changing listings - only if not in a modal
        if (!isModal) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setLoading(true);


        const fetchListingAndStatus = async () => {
            if (!id) return;
            try {
                // Fetch basic listing details
                const params = {};
                // If on localhost and user has agent_id, use it to simulate domain
                if (window.location.hostname.includes('localhost') && user?.agent_id) {
                    params.agent_id = user.agent_id;
                }
                const response = await publicApi.getListing(id, params);
                setListing(response.data);

                // Fetch user-specific stuff if logged in
                if (isAuthenticated) {
                    try {
                        const savedResponse = await checkIfSaved(id);
                        setIsSaved(savedResponse.saved);
                    } catch (error) {
                        console.error('Failed to check saved status:', error);
                        setIsSaved(false);
                    }

                    // Fetch user bookings and see if there's an active one for this property
                    try {
                        const bookingsRes = await appointmentApi.getMyAppointments();
                        const userBookings = bookingsRes.data.appointments || [];
                        const active = userBookings.find(
                            app => String(app.listing_id) === String(id) &&
                                (app.status === 'pending' || app.status === 'confirmed')
                        );
                        setActiveBooking(active || null);

                        // If we're looking for a specific booking ID
                        if (bookingId) {
                            const specific = userBookings.find(app => String(app.id) === String(bookingId));
                            setViewedBooking(specific || null);
                        }
                    } catch (bookingErr) {
                        console.error('Failed to fetch user bookings for status check:', bookingErr);
                    }
                }

                // Fetch related listings
                if (response.data) {
                    const relatedParams = {
                        limit: 12, // Fetch more to allow random suggestions from recent pool
                        exclude_id: id,
                        listing_type: response.data.listing_type, // "Currency filter" - match Sale/Rent
                    };

                    if (response.data.station_id) {
                        relatedParams.station_id = response.data.station_id;
                    } else if (response.data.district) {
                        relatedParams.district = response.data.district;
                    }

                    // Add agent_id for localhost dev if needed
                    if (window.location.hostname.includes('localhost') && user?.agent_id) {
                        relatedParams.agent_id = user.agent_id;
                    }

                    try {
                        const relatedResponse = await publicApi.getListings(relatedParams);
                        const allRelated = relatedResponse.data.listings || [];

                        // Defensive Filter: Ensure current ID is absolutely excluded even if backend fails
                        const filteredRelated = allRelated.filter(item => String(item.id) !== String(id));

                        // "Random and Recent": Shuffle the top recent results and pick 4
                        const shuffled = filteredRelated.sort(() => 0.5 - Math.random()).slice(0, 4);
                        setRelatedListings(shuffled);
                    } catch (err) {
                        console.error('Failed to fetch related listings:', err);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch listing:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchListingAndStatus();
    }, [id, isAuthenticated, user]);

    // Pre-fill form for logged-in users
    useEffect(() => {
        if (user) {
            setBookingForm(prev => ({
                ...prev,
                full_name: `${user.first_name} ${user.last_name}`.trim(),
                email: user.email,
                phone: user.phone || '',
            }));
        }
    }, [user]);

    // Update purpose based on listing type
    useEffect(() => {
        if (listing) {
            if (listing.listing_type === 'rent') {
                setBookingForm(prev => ({ ...prev, purpose: 'rent' }));
            } else if (listing.listing_type === 'sale') {
                setBookingForm(prev => ({ ...prev, purpose: 'buy' }));
            }
        }
    }, [listing]);

    // Booking Logic Helpers
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const generateCalendarGrid = () => {
        const { days, firstDay } = getDaysInMonth(calendarMonth);
        const grid = [];
        for (let i = 0; i < firstDay; i++) grid.push(null);
        for (let i = 1; i <= days; i++) grid.push(i);
        return grid;
    };

    const handleDateSelect = (day) => {
        if (!day) return;
        const selectedDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
        const offset = selectedDate.getTimezoneOffset();
        const adjustedDate = new Date(selectedDate.getTime() - (offset * 60 * 1000));
        const formatted = adjustedDate.toISOString().split('T')[0];
        setBookingForm(prev => ({ ...prev, preferred_date: formatted, preferred_time: '' }));
        setLockId(null);
        setExpiresAt(null);
        setTimeLeft(null);
        setConfirmedDateTime(false);
        setBookingErrors({});
    };

    // --- Slot Management ---
    useEffect(() => {
        if (bookingForm.preferred_date && listing) {
            const fetchSlots = async () => {
                setFetchingSlots(true);
                try {
                    const response = await appointmentApi.getAvailableSlots({
                        listing_id: id,
                        date: bookingForm.preferred_date
                    });
                    setAvailableSlots(response.data.slots || []);
                } catch (error) {
                    console.error('Failed to fetch slots:', error);
                } finally {
                    setFetchingSlots(false);
                }
            };
            fetchSlots();
        }
    }, [bookingForm.preferred_date, listing, id]);

    const handleTimeSelect = async (time) => {
        if (bookingForm.preferred_time === time) return;

        setConfirmedDateTime(false);
        setBookingForm(prev => ({ ...prev, preferred_time: time }));
        setBookingErrors(prev => ({ ...prev, submit: null, preferred_time: null }));

        try {
            const response = await appointmentApi.softLockSlot({
                lock_id: lockId,
                listing_id: id,
                preferred_date: bookingForm.preferred_date,
                preferred_time: time
            });
            setLockId(response.data.lock_id);
            setExpiresAt(new Date(response.data.expires_at));
        } catch (error) {
            setBookingErrors({ submit: error.response?.data?.error || 'Slot is no longer available' });
            setBookingForm(prev => ({ ...prev, preferred_time: '' }));
            // Refresh slots
            if (bookingForm.preferred_date) {
                const resp = await appointmentApi.getAvailableSlots({ listing_id: id, date: bookingForm.preferred_date });
                setAvailableSlots(resp.data.slots || []);
            }
        }
    };

    // --- Timer logic ---
    useEffect(() => {
        if (!expiresAt) return;

        const interval = setInterval(() => {
            const diff = expiresAt.getTime() - new Date().getTime();
            if (diff <= 0) {
                setLockId(null);
                setExpiresAt(null);
                setTimeLeft(null);
                setBookingForm(prev => ({ ...prev, preferred_time: '' }));
                setBookingErrors({ submit: 'Your session has expired. Please select a time slot again.' });
                clearInterval(interval);
            } else {
                const mins = Math.floor(diff / 1000 / 60);
                const secs = Math.floor((diff / 1000) % 60);
                setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    const morningSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
    const afternoonSlots = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

    // When selected date is today, disable time slots that are already in the past
    const isSelectedDateToday = () => {
        if (!bookingForm.preferred_date) return false;
        const selected = new Date(bookingForm.preferred_date);
        const today = new Date();
        return selected.getFullYear() === today.getFullYear() &&
            selected.getMonth() === today.getMonth() &&
            selected.getDate() === today.getDate();
    };
    const isTimeSlotInPast = (timeStr) => {
        if (!isSelectedDateToday()) return false;
        const [hours, mins] = timeStr.split(':').map(Number);
        const slotMinutes = hours * 60 + mins;
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        return slotMinutes < nowMinutes;
    };

    const validateBookingForm = () => {
        const newErrors = {};
        if (!bookingForm.full_name.trim()) newErrors.full_name = 'Required';
        if (!bookingForm.email.trim()) newErrors.email = 'Required';
        if (!bookingForm.phone.trim()) newErrors.phone = 'Required';
        if (!bookingForm.preferred_date) newErrors.preferred_date = 'Required';
        if (!bookingForm.preferred_time) newErrors.preferred_time = 'Required';
        if (bookingForm.preferred_date && bookingForm.preferred_time && isTimeSlotInPast(bookingForm.preferred_time)) {
            newErrors.preferred_time = 'This time has passed. Please select a later time.';
        }
        if (!confirmedDateTime) {
            newErrors.confirm = 'Please confirm the date and time information above.';
        }
        setBookingErrors(newErrors);
        return newErrors;
    };

    const scrollToFirstBookingError = (errors) => {
        const order = ['preferred_date', 'preferred_time', 'full_name', 'phone', 'email', 'confirm'];
        const firstKey = order.find((k) => errors[k]);
        const refMap = {
            preferred_date: bookingDateRef,
            preferred_time: bookingTimeRef,
            full_name: bookingFullNameRef,
            phone: bookingPhoneRef,
            email: bookingEmailRef,
            confirm: bookingConfirmRef
        };
        const ref = firstKey && refMap[firstKey];
        if (ref?.current) {
            setTimeout(() => {
                ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    };

    const handleBookingSubmit = async () => {
        const errors = validateBookingForm();
        if (Object.keys(errors).length > 0) {
            scrollToFirstBookingError(errors);
            return;
        }
        setSubmitting(true);
        try {
            const response = await appointmentApi.createAppointment({
                id: lockId,
                listing_id: id,
                ...bookingForm,
            });
            setBookedAppointment(response.data.appointment);
            setSuccess(true);
        } catch (error) {
            setBookingErrors({ submit: error.response?.data?.error || 'Failed to book' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Property not found</h2>
                    <p className="text-gray-500 mb-4">This property may have been removed or is unavailable.</p>
                    <Link to="/listings">
                        <Button>Browse Listings</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const videos = listing.media?.filter((m) => m.type === 'video') || [];
    const hasImages = images.length > 0;

    const nextImage = () => {
        setImageSlideDir('next');
        setImageTransitionStep(0);
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setImageSlideDir('prev');
        setImageTransitionStep(0);
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const SWIPE_THRESHOLD = 40;

    const handleImageTouchStart = (e) => {
        if (!hasImages || images.length < 2) return;
        didSwipeRef.current = false;
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleImageTouchEnd = (e) => {
        if (!hasImages || images.length < 2) return;
        const x = e.changedTouches[0].clientX;
        const dx = x - touchStartRef.current.x;
        if (dx > SWIPE_THRESHOLD) {
            prevImage();
            didSwipeRef.current = true;
        } else if (dx < -SWIPE_THRESHOLD) {
            nextImage();
            didSwipeRef.current = true;
        }
        if (didSwipeRef.current) setTimeout(() => { didSwipeRef.current = false; }, 300);
    };

    const handleImageMouseDown = (e) => {
        if (!hasImages || images.length < 2) return;
        mouseStartRef.current = { x: e.clientX, down: true };
    };

    const handleImageMouseMove = (e) => {
        if (!mouseStartRef.current.down) return;
        const dx = e.clientX - mouseStartRef.current.x;
        if (dx > SWIPE_THRESHOLD) {
            prevImage();
            didSwipeRef.current = true;
            setTimeout(() => { didSwipeRef.current = false; }, 300);
            mouseStartRef.current.down = false;
        } else if (dx < -SWIPE_THRESHOLD) {
            nextImage();
            didSwipeRef.current = true;
            setTimeout(() => { didSwipeRef.current = false; }, 300);
            mouseStartRef.current.down = false;
        }
    };

    const handleImageMouseUp = () => {
        mouseStartRef.current.down = false;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: listing.price_unit || 'THB',
            maximumFractionDigits: 0,
        }).format(price);
    };

    // Portal for badges into modal header
    // Badge Relocation Tasks:
    // - [x] Move Badges to Modal Header
    // - [x] Add `modal-header-extra` portal target to `Modal.js`
    // - [x] Implement badge portal logic in `ListingDetailPage.js`
    // - [x] Remove badges from the content area
    // - [x] Fix component syntax and nesting issues
    const renderBadges = () => {
        const badgesContainer = document.getElementById('modal-header-extra');
        if (!isModal || !badgesContainer || !listing || isBookingOverlayOpen || isContactOverlayOpen || bookingId) return null;

        return createPortal(
            <div className="hidden lg:flex items-center gap-2">
                <div
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md border animate-in fade-in slide-in-from-left-2 duration-500 ${listing.listing_type === 'sale'
                        ? 'bg-primary-500/10 border-primary-500/20 text-primary-700'
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-700'
                        }`}
                >
                    {listing.listing_type === 'sale' ? 'FOR SALE' : 'FOR RENT'}
                </div>
                {listing.is_featured && (
                    <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md border bg-amber-400/10 border-amber-400/20 text-amber-700 flex items-center gap-1 animate-in fade-in slide-in-from-left-4 duration-700">
                        <SparklesIcon className="w-3 h-3 text-amber-500" />
                        FEATURED
                    </div>
                )}
            </div>,
            badgesContainer
        );
    };

    // Render Actions for Modal Header (Contact, Booking, Saved, Share — gallery is in separate modal)
    const renderHeaderActions = () => {
        const actionsContainer = document.getElementById('modal-header-actions');
        if (!isModal || !actionsContainer) return null;
        if (isBookingOverlayOpen || isContactOverlayOpen || bookingId) return null;

        return createPortal(
            <div className="hidden lg:flex items-center gap-6">
                {/* Group 1: Contact & Booking — text + icon */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsContactOverlayOpen(!isContactOverlayOpen)}
                        className="flex items-center justify-center gap-1.5 w-[90px] py-2 rounded-lg transition-all duration-300 active:scale-95 group"
                    >
                        <PhoneIcon className="w-[18px] h-[18px] text-gray-700 group-hover:text-gray-900 group-hover:scale-110 transition-all duration-300" />
                        <span className="text-[13px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">Contact</span>
                    </button>
                    {activeBooking ? (
                        <button
                            disabled
                            className="flex items-center justify-center gap-1.5 w-[90px] py-2 cursor-not-allowed transition-all duration-300"
                        >
                            <LuCalendarCheck2 className="w-[18px] h-[18px] text-emerald-600" />
                            <span className="text-[13px] font-semibold text-emerald-700">Booked</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleBookingClick}
                            className="flex items-center justify-center gap-1.5 w-[90px] py-2 rounded-lg transition-all duration-300 active:scale-95 group"
                        >
                            <CalendarDaysIcon className="w-[18px] h-[18px] text-gray-700 group-hover:text-gray-900 group-hover:scale-110 transition-all duration-300" />
                            <span className="text-[13px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">Booking</span>
                        </button>
                    )}
                </div>

                {/* Group 2: Saved, Share — text + icon */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleToggleSave}
                        disabled={savingListing}
                        className="flex items-center justify-center gap-1.5 w-[80px] py-2 rounded-lg transition-all duration-300 active:scale-95 group disabled:opacity-50"
                    >
                        <div className={`transition-all duration-500 ease-spring ${isSaved ? 'scale-110' : 'group-hover:scale-110'}`}>
                            {isSaved ? (
                                <HeartSolidIcon className="w-[18px] h-[18px] text-rose-500" />
                            ) : (
                                <HeartIcon className="w-[18px] h-[18px] text-gray-700 group-hover:text-gray-900 opacity-60" />
                            )}
                        </div>
                        <span className={`text-[13px] font-semibold transition-all duration-300 ${isSaved ? 'text-rose-600' : 'text-gray-700 group-hover:text-gray-900'}`}>
                            {isSaved ? 'Saved' : 'Save'}
                        </span>
                    </button>
                    <PropertyShare
                        property={{
                            id,
                            title: listing?.title,
                            description: listing?.description || `${listing?.bedrooms} Bed, ${listing?.bathrooms} Bath property in ${listing?.district || 'Bangkok'}`,
                            image: getMediaUrl(listing?.media?.find(m => m.type === 'image')?.url),
                            url: window.location.href
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-300 active:scale-95 group"
                        showLabel={true}
                        labelClassName="text-[13px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300"
                        iconClassName="w-4 h-4 text-gray-700 group-hover:text-gray-900 group-hover:scale-110 transition-all duration-300"
                    />
                </div>

            </div>,
            actionsContainer
        );
    };

    // Booking: open in its own modal (new modal, not inside existing view)
    const renderBookingOverlay = () => {
        if (!isBookingOverlayOpen) return null;

        const monthYear = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        return (
            <Modal
                isOpen
                onClose={() => setIsBookingOverlayOpen(false)}
                size="full"
                closeOnBackdropClick={false}
                lockScroll
                hideHeader
                fullScreenMobile
                className="!p-0 !m-0 sm:!m-4 w-full h-[100dvh] sm:w-[94vw] sm:h-[94vh] !max-w-full sm:!max-w-[94vw] overflow-hidden shadow-none sm:shadow-2xl transition-all duration-500"
                overlayZIndex={10040}
            >
                <div
                    className="h-full flex flex-col overflow-hidden bg-white"
                    style={{ backgroundColor: 'var(--menu-bg-color, #fff)' }}
                >
                    {/* Header - Hide on success; mobile: compact padding */}
                    {!success && (
                        <div
                            className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4 border-b shrink-0"
                            style={{
                                backgroundColor: 'var(--menu-bg-color)',
                                borderBottomColor: 'var(--menu-divider)'
                            }}
                        >
                            <button
                                onClick={() => setIsBookingOverlayOpen(false)}
                                className="flex items-center gap-1.5 text-gray-900 hover:text-gray-700 py-2 px-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-colors duration-200"
                            >
                                <ArrowLeftIcon className="w-6 h-6" />
                            </button>
                            <span
                                className="text-lg font-semibold ml-auto"
                                style={{ color: 'var(--menu-text-primary)' }}
                            >
                                Request a Viewing
                            </span>
                        </div>
                    )}

                    {/* Content Area - mobile: full-width padding; desktop: centered; z-[60] so scroll lock skips this container */}
                    <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden modal-scrollable z-[60] ${success ? 'flex items-center justify-center' : ''}`} style={{ WebkitOverflowScrolling: 'touch' }}>
                        <div className={`max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-12 ${success ? 'h-full w-full flex items-center justify-center' : ''}`}>
                            {success ? (
                                <div className="h-full w-full flex items-center justify-center p-6">
                                    <div
                                        className="max-w-md w-full text-center px-8 py-12 flex flex-col items-center transition-all animate-in zoom-in-95 duration-300"
                                    >
                                        <div
                                            className="w-20 h-20 rounded-full flex items-center justify-center mb-8 relative"
                                            style={{ backgroundColor: 'color-mix(in srgb, var(--primary-color) 10%, transparent)' }}
                                        >
                                            <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: 'var(--primary-color)' }}></div>
                                            <SolidCheckCircleIcon className="w-10 h-10 relative z-10" style={{ color: 'var(--primary-color)' }} />
                                        </div>
                                        <h2
                                            className="text-3xl font-bold mb-3 tracking-tight text-center"
                                            style={{ color: 'var(--menu-text-primary)' }}
                                        >
                                            Appointment Confirmed!
                                        </h2>
                                        <p
                                            className="text-base mb-12 max-w-sm mx-auto text-center font-medium leading-relaxed flex flex-wrap items-center justify-center gap-1.5"
                                            style={{ color: 'var(--menu-text-muted)' }}
                                        >
                                            You can check your booking information and status at
                                            <span
                                                className="group inline-flex items-center gap-1 font-bold cursor-pointer transition-all duration-300 text-base"
                                                onClick={() => {
                                                    setIsBookingOverlayOpen(false);
                                                    setSuccess(false);
                                                    window.location.href = '/my-bookings';
                                                }}
                                            >
                                                <span className="group-hover:text-[var(--primary-color)] transition-colors duration-300" style={{ color: 'var(--menu-text-primary)' }}>Bookings</span>
                                                <ArrowRightIcon
                                                    className="w-5 h-5 transition-all duration-300 transform group-hover:translate-x-1"
                                                    style={{ color: 'var(--primary-color)' }}
                                                />
                                            </span>
                                        </p>
                                        <div className="flex items-center justify-center w-full">
                                            <Button
                                                onClick={() => {
                                                    setIsBookingOverlayOpen(false);
                                                    setSuccess(false);
                                                }}
                                                className="min-w-[180px] font-black py-4 tracking-[0.2em] text-lg text-white border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-95"
                                                style={{
                                                    borderRadius: 'var(--btn-radius)',
                                                    background: 'var(--primary-color)'
                                                }}
                                            >
                                                Done
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6 lg:gap-12 xl:gap-16 pb-8 lg:pb-12">
                                    {/* Column 1: Purpose, Date & Time */}
                                    <div className="space-y-10">
                                        {/* Purpose - show only the option matching listing type (rent → For Rent, sale → For Buy), auto-selected */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">I want to</h3>
                                            {(() => {
                                                const purposeOptions = listing?.listing_type === 'sale'
                                                    ? [{ value: 'buy', label: 'For Buy' }]
                                                    : [{ value: 'rent', label: 'For Rent' }];
                                                return (
                                                    <div className="flex flex-wrap gap-2">
                                                        {purposeOptions.map((opt) => (
                                                            <button
                                                                key={opt.value}
                                                                type="button"
                                                                className="py-2.5 px-5 rounded-full text-sm font-bold transition-all border-2 border-primary-600 bg-primary-50 text-primary-700"
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Calendar - half width on lg/xl */}
                                        <div ref={bookingDateRef} className="w-full lg:max-w-[50%]">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Select Date</h3>
                                            {bookingErrors.preferred_date && (
                                                <p className="text-sm text-red-600 font-medium mb-2">{bookingErrors.preferred_date}</p>
                                            )}
                                            <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
                                                <div className="flex items-center justify-between mb-6 px-2">
                                                    <button onClick={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth() - 1)))} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                                        <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
                                                    </button>
                                                    <h4 className="font-semibold text-gray-900 text-lg">{monthYear}</h4>
                                                    <button onClick={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth() + 1)))} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-base font-semibold text-gray-900 py-1">{d}</div>)}
                                                </div>
                                                <div className="grid grid-cols-7 gap-1">
                                                    {generateCalendarGrid().map((day, i) => {
                                                        if (!day) return <div key={i} />;
                                                        const currentDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                                                        const today = new Date();
                                                        today.setHours(0, 0, 0, 0);

                                                        const isPast = currentDay < today;
                                                        const horizon = new Date(today);
                                                        horizon.setDate(today.getDate() + 14);
                                                        horizon.setHours(23, 59, 59, 999);
                                                        const isOutsideHorizon = currentDay > horizon;
                                                        const isDisabled = isPast || isOutsideHorizon;

                                                        const isSelected = bookingForm.preferred_date &&
                                                            new Date(bookingForm.preferred_date).getDate() === day &&
                                                            new Date(bookingForm.preferred_date).getMonth() === calendarMonth.getMonth() &&
                                                            new Date(bookingForm.preferred_date).getFullYear() === calendarMonth.getFullYear();

                                                        return (
                                                            <button
                                                                key={i}
                                                                disabled={isDisabled}
                                                                onClick={() => handleDateSelect(day)}
                                                                className={`w-10 h-10 mx-auto rounded-full text-sm font-bold flex items-center justify-center transition-all ${isSelected ? 'bg-[var(--primary-color)] text-white shadow-lg shadow-gray-200 scale-110' : isDisabled ? 'text-gray-200 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                                            >
                                                                {day}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Time Selection - button grid for all screen sizes */}
                                        <div ref={bookingTimeRef}>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Select Time</h3>
                                            {bookingErrors.preferred_time && (
                                                <p className="text-sm text-red-600 font-medium mb-2">{bookingErrors.preferred_time}</p>
                                            )}
                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                                        Morning
                                                        {fetchingSlots && <span className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin ml-1" />}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {morningSlots.map((time) => {
                                                            const slotData = (availableSlots || []).find(s => s.time === time);
                                                            const isAvailable = slotData && slotData.status === 'available';
                                                            const isLocked = slotData && slotData.status === 'locked';
                                                            const isPast = isTimeSlotInPast(time);
                                                            const disabled = (!isAvailable && !isLocked) || isLocked || fetchingSlots || isPast;
                                                            const isSelected = bookingForm.preferred_time === time;
                                                            return (
                                                                <button
                                                                    key={time}
                                                                    type="button"
                                                                    disabled={disabled}
                                                                    onClick={() => !disabled && handleTimeSelect(time)}
                                                                    className={`py-2.5 px-4 rounded-full text-base font-semibold transition-all border ${
                                                                        isSelected
                                                                            ? 'border-primary-600 bg-primary-50 text-primary-600'
                                                                            : disabled
                                                                                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                                                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
                                                                    }`}
                                                                >
                                                                    {time}{isLocked ? ' (Unavailable)' : ''}{isPast ? ' (Past)' : ''}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                        Afternoon
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {afternoonSlots.map((time) => {
                                                            const slotData = (availableSlots || []).find(s => s.time === time);
                                                            const isAvailable = slotData && slotData.status === 'available';
                                                            const isLocked = slotData && slotData.status === 'locked';
                                                            const isPast = isTimeSlotInPast(time);
                                                            const disabled = (!isAvailable && !isLocked) || isLocked || fetchingSlots || isPast;
                                                            const isSelected = bookingForm.preferred_time === time;
                                                            return (
                                                                <button
                                                                    key={time}
                                                                    type="button"
                                                                    disabled={disabled}
                                                                    onClick={() => !disabled && handleTimeSelect(time)}
                                                                    className={`py-2.5 px-4 rounded-full text-base font-semibold transition-all border ${
                                                                        isSelected
                                                                            ? 'border-primary-600 bg-primary-50 text-primary-600'
                                                                            : disabled
                                                                                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                                                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
                                                                    }`}
                                                                >
                                                                    {time}{isLocked ? ' (Unavailable)' : ''}{isPast ? ' (Past)' : ''}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Details & Message - half width on lg/xl */}
                                    <div className="space-y-10 w-full lg:max-w-[50%]">
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900">Your Details</h3>
                                            <div className="space-y-4">
                                                <div ref={bookingFullNameRef}>
                                                    <label className="block text-base font-semibold text-gray-900 mb-1.5 ml-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={bookingForm.full_name}
                                                        onChange={e => { setBookingForm({ ...bookingForm, full_name: e.target.value }); if (bookingErrors.full_name) setBookingErrors(prev => ({ ...prev, full_name: null })); }}
                                                        className={`w-full px-5 py-2.5 bg-gray-50 border focus:bg-white focus:ring-1 transition-all font-bold text-gray-900 text-base ${bookingErrors.full_name ? 'border-red-400' : 'border-gray-100 focus:ring-gray-200'}`}
                                                        style={{ borderRadius: 'var(--card-radius)' }}
                                                        placeholder="John Doe"
                                                    />
                                                    {bookingErrors.full_name && <p className="text-sm text-red-600 font-medium mt-1.5 ml-1">{bookingErrors.full_name}</p>}
                                                </div>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div ref={bookingPhoneRef}>
                                                        <label className="block text-base font-semibold text-gray-900 mb-1.5 ml-1">Phone Number</label>
                                                        <input
                                                            type="text"
                                                            value={bookingForm.phone}
                                                            onChange={e => { setBookingForm({ ...bookingForm, phone: e.target.value }); if (bookingErrors.phone) setBookingErrors(prev => ({ ...prev, phone: null })); }}
                                                            className={`w-full px-5 py-2.5 bg-gray-50 border focus:bg-white focus:ring-1 transition-all font-bold text-gray-900 text-base ${bookingErrors.phone ? 'border-red-400' : 'border-gray-100 focus:ring-gray-200'}`}
                                                            style={{ borderRadius: 'var(--card-radius)' }}
                                                            placeholder="+66..."
                                                        />
                                                        {bookingErrors.phone && <p className="text-sm text-red-600 font-medium mt-1.5 ml-1">{bookingErrors.phone}</p>}
                                                    </div>
                                                    <div ref={bookingEmailRef}>
                                                        <label className="block text-base font-semibold text-gray-900 mb-1.5 ml-1">Email Address</label>
                                                        <input
                                                            type="text"
                                                            value={bookingForm.email}
                                                            onChange={e => { setBookingForm({ ...bookingForm, email: e.target.value }); if (bookingErrors.email) setBookingErrors(prev => ({ ...prev, email: null })); }}
                                                            className={`w-full px-5 py-2.5 bg-gray-50 border focus:bg-white focus:ring-1 transition-all font-bold text-gray-900 text-base ${bookingErrors.email ? 'border-red-400' : 'border-gray-100 focus:ring-gray-200'}`}
                                                            style={{ borderRadius: 'var(--card-radius)' }}
                                                            placeholder="john@example.com"
                                                        />
                                                        {bookingErrors.email && <p className="text-sm text-red-600 font-medium mt-1.5 ml-1">{bookingErrors.email}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900">Additional Message</h3>
                                            <textarea
                                                value={bookingForm.message}
                                                onChange={e => setBookingForm({ ...bookingForm, message: e.target.value })}
                                                rows={5}
                                                className="w-full px-5 py-2.5 bg-gray-50 border border-gray-100 focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all font-bold text-gray-900 text-base resize-none"
                                                style={{ borderRadius: 'var(--card-radius)' }}
                                                placeholder="I would like to know more about..."
                                            />
                                        </div>
                                        {bookingErrors.submit && (
                                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium flex items-center" style={{ borderRadius: 'var(--card-radius)' }}>
                                                <span className="mr-2">⚠️</span> {bookingErrors.submit}
                                            </div>
                                        )}
                                    </div>

                                    {/* Column 3: Summary & Preview */}
                                    <div className="space-y-10">
                                        <div className="space-y-8">
                                            <div>
                                                <h4
                                                    className="text-lg font-semibold text-gray-900 mb-8 flex items-center justify-between"
                                                >
                                                    <span>Booking Summary</span>
                                                    {timeLeft && (
                                                        <span className="inline-flex flex-row items-center gap-2 pl-4 pr-4 py-2 rounded-full bg-rose-500 text-white text-sm font-semibold">
                                                            <span className="w-12 shrink-0 text-left">Locked:</span>
                                                            <span className="min-w-[2.25rem] text-left">{timeLeft}</span>
                                                        </span>
                                                    )}
                                                </h4>
                                                <div
                                                    className="space-y-8 px-4"
                                                >
                                                    <div
                                                        className="border-b pb-8"
                                                        style={{ borderBottomColor: 'var(--menu-divider)' }}
                                                    >
                                                        <div className="text-base font-semibold text-gray-900 mb-1">
                                                            {listing.district}
                                                        </div>
                                                        <div className="font-bold text-lg leading-tight mb-2 truncate text-gray-900">
                                                            {listing.title}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-base text-gray-700">
                                                            <MapPinIcon className="w-4 h-4" />
                                                            {listing.location || 'Bangkok'}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-8">
                                                        <div>
                                                            <div className="text-base font-semibold text-gray-900 mb-2">
                                                                Preferred Date
                                                            </div>
                                                            <div className="font-semibold text-base text-gray-900">
                                                                {bookingForm.preferred_date ? new Date(bookingForm.preferred_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '---'}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-base font-semibold text-gray-900 mb-2">
                                                                Preferred Time
                                                            </div>
                                                            <div className="font-semibold text-base text-gray-900">
                                                                {bookingForm.preferred_time || '---'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {bookingForm.message && (
                                                        <div
                                                            className="pt-4 border-t"
                                                            style={{ borderTopColor: 'var(--menu-divider)' }}
                                                        >
                                                            <div className="text-base font-semibold text-gray-900 mb-3">
                                                                Your Message
                                                            </div>
                                                            <div
                                                                className="text-base italic leading-relaxed line-clamp-2 pl-4 border-l-2 text-gray-900"
                                                                style={{ borderLeftColor: 'var(--menu-divider)' }}
                                                            >
                                                                "{bookingForm.message}"
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Persistent Footer - Confirm checkbox + Send Request; only when not success */}
                    {!success && (
                        <div ref={bookingConfirmRef} className="p-4 lg:p-6 z-[70] flex flex-col gap-4 shrink-0 border-t border-gray-100 bg-white/95 backdrop-blur-sm">
                            <div className="max-w-[1400px] w-full flex flex-col items-center gap-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={confirmedDateTime}
                                        onChange={(e) => {
                                            setConfirmedDateTime(e.target.checked);
                                            if (bookingErrors.confirm) setBookingErrors(prev => ({ ...prev, confirm: null }));
                                        }}
                                        className="w-5 h-5 rounded border-2 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                                    />
                                    <span className="text-base text-gray-900 font-medium select-none group-hover:text-gray-700">
                                        I confirm the date and time selected above
                                    </span>
                                </label>
                                {bookingErrors.confirm && (
                                    <p className="text-sm text-red-600 font-medium">{bookingErrors.confirm}</p>
                                )}
                                <Button
                                    onClick={handleBookingSubmit}
                                    isLoading={submitting}
                                    disabled={!confirmedDateTime}
                                    variant="primary"
                                    size="lg"
                                    className={`w-auto max-w-[240px] font-semibold py-3 px-6 rounded-full transition-all hover:translate-y-[-2px] active:scale-[0.98] !text-lg ${!confirmedDateTime ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    Send Request
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        );
    };

    return (
        <div key={id} className={`min-h-screen bg-white ${!isModal ? 'animate-in fade-in duration-500 relative' : 'relative'} pb-24 lg:pb-0`}>
            {renderBookingOverlay()}
            {/* Mobile Header (White Nav & Image Carousel) - Visible only on mobile/tablet */}
            <div className="lg:hidden w-full flex flex-col relative">
                {/* Float Top Nav for Mobile - Buttons over image */}
                <div className="absolute top-0 left-0 right-0 w-full flex justify-between items-center px-4 pt-6 z-[60] bg-transparent pointer-events-none">
                    <button
                        onClick={() => onClose ? onClose() : navigate(-1)}
                        className="w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-900 active:scale-90 transition-all pointer-events-auto ring-1 ring-black/5"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 pr-1 pointer-events-auto">
                        <PropertyShare
                            property={{
                                id,
                                title: listing?.title,
                                description: listing?.description || `${listing?.bedrooms} Bed, ${listing?.bathrooms} Bath property in ${listing?.district || 'Bangkok'}`,
                                image: getMediaUrl(listing?.media?.find(m => m.type === 'image')?.url),
                                url: window.location.href
                            }}
                            className="w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-900 hover:text-gray-600 active:scale-90 transition-all ring-1 ring-black/5"
                            showLabel={false}
                            iconClassName="w-5 h-5 text-gray-900"
                        />
                        <button
                            onClick={handleToggleSave}
                            disabled={savingListing}
                            className="w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-900 active:scale-90 transition-all ring-1 ring-black/5"
                        >
                            {isSaved ? (
                                <HeartSolidIcon className="w-5 h-5 text-rose-500" />
                            ) : (
                                <HeartIcon className="w-5 h-5 text-gray-900" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Image Carousel - drag/swipe horizontally to change image */}
                <div
                    className="relative w-full h-[45vh] min-h-[350px] touch-pan-y select-none overflow-hidden"
                    onTouchStart={handleImageTouchStart}
                    onTouchEnd={handleImageTouchEnd}
                    onMouseDown={handleImageMouseDown}
                    onMouseMove={handleImageMouseMove}
                    onMouseUp={handleImageMouseUp}
                    onMouseLeave={handleImageMouseUp}
                >
                    {hasImages && images.length > 1 && imageSlideDir ? (
                        <>
                            {/* Leaving image */}
                            <img
                                key={`leave-${imageSlideDir === 'next' ? (currentImageIndex - 1 + images.length) % images.length : (currentImageIndex + 1) % images.length}`}
                                src={getMediaUrl(images[imageSlideDir === 'next' ? (currentImageIndex - 1 + images.length) % images.length : (currentImageIndex + 1) % images.length].url)}
                                alt=""
                                className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-300 ease-out ${
                                    imageTransitionStep === 1
                                        ? imageSlideDir === 'next'
                                            ? '-translate-x-full'
                                            : 'translate-x-full'
                                        : 'translate-x-0'
                                }`}
                                draggable={false}
                            />
                            {/* Entering image */}
                            <img
                                key={`enter-${currentImageIndex}`}
                                src={getMediaUrl(images[currentImageIndex].url)}
                                alt={listing.title}
                                className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-300 ease-out ${
                                    imageTransitionStep === 1 ? 'translate-x-0' : imageSlideDir === 'next' ? 'translate-x-full' : '-translate-x-full'
                                }`}
                                draggable={false}
                            />
                        </>
                    ) : (
                        <img
                            src={
                                hasImages
                                    ? getMediaUrl(images[currentImageIndex].url)
                                    : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
                            }
                            alt={listing.title}
                            className="w-full h-full object-cover pointer-events-none"
                            draggable={false}
                        />
                    )}
                    <div
                        className="absolute inset-0 cursor-grab active:cursor-grabbing"
                        onClick={() => {
                            if (!hasImages || didSwipeRef.current) return;
                            openGallery(currentImageIndex);
                        }}
                        aria-label="View photo tour"
                    />

                    {/* Image counter */}
                    {hasImages && images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[12px] font-bold tracking-widest z-[40] pointer-events-none">
                            {currentImageIndex + 1} / {images.length}
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop Back button */}
            {!isModal && (
                <div className="hidden lg:block sticky top-0 z-[45] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pointer-events-none">
                    <button
                        onClick={() => navigate(-1)}
                        className="pointer-events-auto text-gray-400 hover:text-gray-900 transition-all py-2 px-4 rounded-lg hover:bg-gray-100/50 active:scale-95 group flex items-center"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-sm">Back</span>
                    </button>
                </div>
            )}

            <div className={`max-w-[1600px] mx-auto ${isModal ? 'px-0 sm:px-6' : 'px-0 lg:px-8'} ${isModal ? 'py-0 sm:py-12' : 'py-0 lg:py-6'}`}>
                <div className="flex justify-center">
                    <div className={`w-full ${isModal ? 'max-w-none' : 'max-w-7xl'} space-y-0 lg:space-y-6`}>
                        {/* Details - Header Section (card radius) */}
                        <div className="bg-white rounded-t-[32px] lg:rounded-[24px] overflow-hidden lg:border lg:border-gray-100 shadow-none lg:shadow-sm px-0 py-8 lg:px-8 lg:p-8 relative z-10 -mt-8 lg:mt-0">
                            {/* Booking Information Bar */}
                            {bookingId && (
                                <div ref={bookingBarRef} className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                                        {/* Left Side: ID & Status */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="px-2 py-1 bg-gray-50 border border-gray-100 rounded text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    ID: {viewedBooking?.id?.toUpperCase() || bookingId.slice(0, 8).toUpperCase()}
                                                </div>
                                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${viewedBooking?.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    viewedBooking?.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${viewedBooking?.status === 'confirmed' ? 'bg-emerald-500' :
                                                        viewedBooking?.status === 'cancelled' ? 'bg-rose-500' :
                                                            'bg-amber-500'
                                                        }`} />
                                                    {viewedBooking?.status || 'Pending'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
                                                    {listing.title}
                                                </h1>
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <MapPinIcon className="w-4 h-4" />
                                                    <span className="text-base font-semibold">{listing.district}, {listing.city}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Date & Time */}
                                        <div className="flex items-center gap-8 md:text-right">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Date</span>
                                                <span className="text-lg font-black text-gray-900">
                                                    {viewedBooking?.preferred_date ? new Date(viewedBooking.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Loading...'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Time</span>
                                                <span className="text-lg font-black text-gray-900">
                                                    {viewedBooking?.preferred_time || 'Loading...'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Title & Info - Airbnb Layout */}
                            {!bookingId && (
                                <div className="px-5 lg:px-0 flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-1 pt-6 lg:pt-0">
                                    <div className="flex-1 min-w-0 w-full">
                                        <h1 className="text-[22px] lg:text-3xl font-semibold text-gray-900 leading-[1.2] mb-2 tracking-tight">
                                            {listing.title}
                                        </h1>

                                        <div className="flex items-center text-gray-800 text-[15px] pb-6">
                                            <span>{listing.bedrooms || 0} bedroom{listing.bedrooms > 1 || !listing.bedrooms ? 's' : ''}</span>
                                            <span className="mx-1.5 font-bold">·</span>
                                            <span>{listing.bathrooms || 0} bath{listing.bathrooms > 1 || !listing.bathrooms ? 's' : ''}</span>
                                            <span className="mx-1.5 font-bold">·</span>
                                            <span>{listing.area ? `${listing.area} m²` : 'Spacious'}</span>
                                        </div>
                                    </div>

                                    <div className="hidden lg:flex flex-wrap items-center gap-2">
                                        <Badge variant="neutral" className="border border-gray-100 px-2 py-1 rounded-lg">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Property</span>
                                            <span className="text-xs font-black text-gray-900">{listing.id?.toUpperCase() || ''}</span>
                                        </Badge>
                                    </div>
                                </div>
                            )}


                            {!bookingId && (
                                <div className="px-5 lg:px-0 flex gap-4 mb-8">
                                    <div className="mt-0.5">
                                        <CheckBadgeIcon className="w-6 h-6 text-gray-900" />
                                    </div>
                                    <div>
                                        <h3 className="text-[16px] font-semibold text-gray-900 leading-tight mb-1">Confirmed available</h3>
                                        <p className="text-[14px] text-gray-500 leading-snug">This property recently verified its status and is available today.</p>
                                    </div>
                                </div>
                            )}

                            {/* Price for Mobile (Fixed styling) */}
                            <div className="px-5 lg:px-0 text-[22px] lg:text-3xl font-bold text-gray-900 mb-2 flex items-baseline">
                                {formatPrice(listing.price)}
                                {listing.listing_type === 'rent' && (
                                    <span className="text-gray-900 text-sm lg:text-xl font-normal ml-1 border-b border-gray-400 border-dashed pb-0.5">/month</span>
                                )}
                            </div>
                        </div>

                        {/* Image Gallery - Desktop Bento Grid */}
                        <div className="hidden lg:block rounded-[24px] overflow-hidden shadow-sm bg-white mt-6">

                            {/* Desktop Bento Grid (Visible on lg screens) */}
                            <div className="hidden lg:grid grid-cols-4 gap-2 h-[400px] cursor-pointer">
                                {/* Main Image (Large, Left) */}
                                <div
                                    className="col-span-2 row-span-2 relative overflow-hidden group cursor-pointer"
                                    onClick={() => openGallery(0)}
                                >
                                    <img
                                        src={hasImages ? getMediaUrl(images[0].url) : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'}
                                        alt={listing.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>

                                {/* Second Image (Top Right Center) */}
                                <div
                                    className="col-span-1 row-span-1 relative overflow-hidden group cursor-pointer"
                                    onClick={() => openGallery(1)}
                                >
                                    {images[1] && (
                                        <>
                                            <img
                                                src={getMediaUrl(images[1].url)}
                                                alt="Gallery 2"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </>
                                    )}
                                </div>

                                {/* Third Image (Top Right) */}
                                <div
                                    className="col-span-1 row-span-1 relative overflow-hidden group rounded-tr-[24px] cursor-pointer"
                                    onClick={() => openGallery(2)}
                                >
                                    {images[2] && (
                                        <>
                                            <img
                                                src={getMediaUrl(images[2].url)}
                                                alt="Gallery 3"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </>
                                    )}
                                </div>

                                {/* Fourth Image (Bottom Right Center) */}
                                <div
                                    className="col-span-1 row-span-1 relative overflow-hidden group cursor-pointer"
                                    onClick={() => openGallery(3)}
                                >
                                    {images[3] && (
                                        <>
                                            <img
                                                src={getMediaUrl(images[3].url)}
                                                alt="Gallery 4"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </>
                                    )}
                                </div>

                                {/* Fifth Image / Show All Button (Bottom Right) */}
                                <div
                                    className="col-span-1 row-span-1 relative overflow-hidden group rounded-br-[24px] cursor-pointer"
                                    onClick={() => openGallery(images[4] ? 4 : 0)}
                                >
                                    {images[4] ? (
                                        <>
                                            <img
                                                src={getMediaUrl(images[4].url)}
                                                alt="Gallery 5"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors pointer-events-none">
                                                <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2 w-fit">
                                                    <Square2StackIcon className="w-5 h-5" />
                                                    Show all photos
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm shadow-sm border border-gray-200 flex items-center gap-2 pointer-events-none">
                                                <Square2StackIcon className="w-5 h-5" />
                                                Show all {images.length} photos
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {renderBadges()}
                        {renderHeaderActions()}

                        {/* Details - Features & Description */}
                        <div className="px-5 lg:px-0">
                            {/* Features */}
                            {/* Features Grid */}
                            <Card className="rounded-[24px] overflow-hidden mb-8 mt-8 border-gray-200" style={{ boxShadow: 'none' }}>
                                <div className="grid grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                    {/* Row 1 */}
                                    <div className="p-4 md:p-6 flex items-center space-x-3 md:space-x-4 hover:bg-gray-50 transition-colors">
                                        <LiaBedSolid className="w-6 h-6 md:w-8 md:h-8 text-gray-900 flex-shrink-0" />
                                        <div>
                                            <div className="text-base md:text-lg font-medium text-gray-700 leading-tight">{listing.bedrooms || 0} Bedrooms</div>
                                        </div>
                                    </div>
                                    <div className="p-4 md:p-6 flex items-center space-x-3 md:space-x-4 hover:bg-gray-50 transition-colors border-t md:border-t-0">
                                        <PiBathtub className="w-6 h-6 md:w-8 md:h-8 text-gray-900 flex-shrink-0" />
                                        <div>
                                            <div className="text-base md:text-lg font-medium text-gray-700 leading-tight">{listing.bathrooms || 0} Bathrooms</div>
                                        </div>
                                    </div>
                                    <div className="p-4 md:p-6 flex items-center space-x-3 md:space-x-4 hover:bg-gray-50 transition-colors border-t lg:border-t-0">
                                        <ArrowsPointingOutIcon className="w-6 h-6 md:w-8 md:h-8 text-gray-900 flex-shrink-0" />
                                        <div>
                                            <div className="text-base md:text-lg font-medium text-gray-700 leading-tight">{listing.area || 0} m²</div>
                                        </div>
                                    </div>
                                    <div className="p-4 md:p-6 flex items-center space-x-3 md:space-x-4 hover:bg-gray-50 transition-colors border-t lg:border-t-0">
                                        <RiStairsLine className="w-6 h-6 md:w-8 md:h-8 text-gray-900 flex-shrink-0" />
                                        <div>
                                            <div className="text-base md:text-lg font-medium text-gray-700 leading-tight">{listing.floor ? `${listing.floor} floor` : '-'}</div>
                                        </div>
                                    </div>

                                    {/* Additional Highlights */}
                                    {listing.year_built > 0 && (
                                        <div className="p-4 md:p-6 flex items-center space-x-3 md:space-x-4 hover:bg-gray-50 transition-colors border-t">
                                            <div className="text-xl md:text-2xl flex-shrink-0">🏗️</div>
                                            <div>
                                                <div className="text-base md:text-lg font-medium text-gray-700 leading-tight">Built in {listing.year_built}</div>
                                            </div>
                                        </div>
                                    )}

                                    {listing.listing_type === 'sale' && (
                                        <div className="p-4 md:p-6 flex items-center space-x-3 md:space-x-4 hover:bg-gray-50 transition-colors border-t">
                                            <TbCurrencyBaht className="w-6 h-6 md:w-8 md:h-8 text-gray-900 flex-shrink-0" />
                                            <div>
                                                <div className="text-base md:text-lg font-medium text-gray-700 leading-tight">
                                                    {listing.price && listing.area
                                                        ? `฿${Math.round(listing.price / listing.area).toLocaleString()}/sqm`
                                                        : '-'}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4 md:p-6 flex items-center space-x-3 md:space-x-4 hover:bg-gray-50 transition-colors border-t col-span-1 md:col-span-2">
                                        <TbTrain className="w-6 h-6 md:w-8 md:h-8 text-gray-900 flex-shrink-0" />
                                        <div>
                                            <div className="text-base md:text-lg font-medium text-gray-700 truncate leading-tight">
                                                {(listing.station_id || listing.station_name)
                                                    ? `${listing.distance_to_station || 0}m to ${listing.station_name || listing.station?.name_en || 'Station'}`
                                                    : 'Near Transit'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>


                            {/* Features & Amenities Section */}
                            {listing.features && (
                                <div className="mb-12">
                                    <h3 className="text-2xl font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-4">Amenities & Features</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-8">
                                        {(() => {
                                            try {
                                                const featureList = JSON.parse(listing.features || '[]');
                                                const featureMap = {
                                                    'refrigerator': { label: 'Refrigerator', icon: <BiSolidFridge className="w-6 h-6 text-blue-500" /> },
                                                    'bathtub': { label: 'Bathtub', icon: <PiBathtub className="w-6 h-6 text-blue-400" /> },
                                                    'tv': { label: 'TV', icon: <HiOutlineTv className="w-6 h-6 text-gray-700" /> },
                                                    'ac': { label: 'Air Conditioning', icon: <LuWind className="w-6 h-6 text-blue-300" /> },
                                                    'microwave': { label: 'Microwave', icon: <MdOutlineMicrowave className="w-6 h-6 text-orange-600" /> },
                                                    'washing_machine': { label: 'Washing Machine', icon: <MdOutlineLocalLaundryService className="w-6 h-6 text-blue-600" /> },
                                                    'water_heater': { label: 'Water Heater', icon: <IoWaterOutline className="w-6 h-6 text-orange-400" /> },
                                                    'kitchen': { label: 'Kitchen / Stove', icon: <MdOutlineSoupKitchen className="w-6 h-6 text-gray-600" /> },
                                                    'parking': { label: 'Covered Car Park', icon: <MdOutlineLocalParking className="w-6 h-6 text-blue-700" /> },
                                                    'pool': { label: 'Swimming Pool', icon: <MdOutlinePool className="w-6 h-6 text-cyan-500" /> },
                                                    'gym': { label: 'Fitness / Gym', icon: <MdOutlineFitnessCenter className="w-6 h-6 text-gray-800" /> },
                                                    'security': { label: '24h Security', icon: <MdOutlineSecurity className="w-6 h-6 text-red-600" /> },
                                                    'sauna': { label: 'Sauna', icon: <MdOutlineHotTub className="w-6 h-6 text-orange-300" /> },
                                                    'garden': { label: 'Garden / BBQ', icon: <MdOutlinePark className="w-6 h-6 text-green-600" /> },
                                                    'playground': { label: 'Playground', icon: <MdOutlineChildCare className="w-6 h-6 text-yellow-500" /> },
                                                    'coworking': { label: 'Co-working Space', icon: <MdOutlineComputer className="w-6 h-6 text-indigo-500" /> },
                                                    'communal_elevator': { label: 'Communal Elevator', icon: <MdOutlineElevator className="w-6 h-6 text-gray-600" /> },
                                                    'communal_reception': { label: 'Communal Reception', icon: <MdOutlineSupportAgent className="w-6 h-6 text-blue-500" /> },
                                                    'communal_restaurant': { label: 'Communal Restaurant On Premises', icon: <MdOutlineRestaurant className="w-6 h-6 text-orange-500" /> },
                                                    'communal_shop': { label: 'Communal Shop On Premises', icon: <MdOutlineStorefront className="w-6 h-6 text-orange-600" /> },
                                                    'communal_shuttle': { label: 'Communal Shuttle Service', icon: <MdOutlineDirectionsBus className="w-6 h-6 text-blue-400" /> },
                                                    'communal_spa': { label: 'Communal Spa', icon: <MdOutlineSpa className="w-6 h-6 text-pink-500" /> },
                                                    'communal_coworking': { label: 'Communal Coworking Space', icon: <MdOutlineLaptop className="w-6 h-6 text-indigo-500" /> },
                                                    'communal_security_24': { label: 'Communal Security 24 hours', icon: <MdOutlineSecurity className="w-6 h-6 text-red-600" /> },
                                                    'communal_parking': { label: 'Communal Car Park', icon: <MdOutlineLocalParking className="w-6 h-6 text-blue-600" /> },
                                                    'communal_covered_parking': { label: 'Communal Covered Car Park', icon: <MdOutlineGarage className="w-6 h-6 text-gray-700" /> },
                                                    'communal_function_room': { label: 'Communal Function Room', icon: <MdOutlineMeetingRoom className="w-6 h-6 text-gray-800" /> },
                                                };

                                                const unitBuildingIds = ['refrigerator', 'bathtub', 'tv', 'ac', 'microwave', 'washing_machine', 'water_heater', 'kitchen', 'parking', 'pool', 'gym', 'security', 'sauna', 'garden', 'playground', 'coworking'];
                                                const projectFacilityIds = ['communal_elevator', 'communal_reception', 'communal_restaurant', 'communal_shop', 'communal_shuttle', 'communal_spa', 'communal_coworking', 'communal_security_24', 'communal_parking', 'communal_covered_parking', 'communal_function_room'];

                                                const amenities = featureList.filter(id => unitBuildingIds.includes(id));
                                                const facilities = featureList.filter(id => projectFacilityIds.includes(id));

                                                if (!featureList.length) return <p className="text-gray-500 italic">No specific amenities listed.</p>;

                                                return (
                                                    <div className="space-y-12 w-full col-span-1 md:col-span-2 lg:col-span-4">
                                                        {amenities.length > 0 && (
                                                            <div>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-8">
                                                                    {(showAllAmenities ? amenities : amenities.slice(0, 4)).map(featureId => {
                                                                        const item = featureMap[featureId] || { label: featureId, icon: <SparklesIcon className="w-6 h-6 text-yellow-400" /> };
                                                                        return (
                                                                            <div key={featureId} className="flex items-center space-x-4 py-1 group">
                                                                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-100">
                                                                                    {item.icon}
                                                                                </div>
                                                                                <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors tracking-tight text-[14px]">{item.label}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                {amenities.length > 4 && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        onClick={() => setShowAllAmenities(!showAllAmenities)}
                                                                        className="mt-6 flex items-center text-primary-600 font-bold text-[14px] hover:text-primary-700 transition-colors group p-0 hover:bg-transparent !focus:ring-0 !focus:ring-offset-0 !outline-none border-none"
                                                                    >
                                                                        {showAllAmenities ? (
                                                                            <>
                                                                                See less <ChevronUpIcon className="w-4 h-4 ml-1 group-hover:-translate-y-0.5 transition-transform" />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                See more ({amenities.length - 4} more) <ChevronDownIcon className="w-4 h-4 ml-1 group-hover:translate-y-0.5 transition-transform" />
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )}

                                                        {facilities.length > 0 && (
                                                            <div>
                                                                <h3 className="text-2xl font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-4">Project Facilities</h3>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-8">
                                                                    {(showAllFacilities ? facilities : facilities.slice(0, 4)).map(featureId => {
                                                                        const item = featureMap[featureId] || { label: featureId, icon: <SparklesIcon className="w-6 h-6 text-yellow-400" /> };
                                                                        return (
                                                                            <div key={featureId} className="flex items-center space-x-4 py-1 group">
                                                                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-100">
                                                                                    {item.icon}
                                                                                </div>
                                                                                <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors tracking-tight text-[14px]">{item.label}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                {facilities.length > 4 && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        onClick={() => setShowAllFacilities(!showAllFacilities)}
                                                                        className="mt-6 flex items-center text-primary-600 font-bold text-[14px] hover:text-primary-700 transition-colors group p-0 hover:bg-transparent !focus:ring-0 !focus:ring-offset-0 !outline-none border-none"
                                                                    >
                                                                        {showAllFacilities ? (
                                                                            <>
                                                                                See less <ChevronUpIcon className="w-4 h-4 ml-1 group-hover:-translate-y-0.5 transition-transform" />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                See more ({facilities.length - 4} more) <ChevronDownIcon className="w-4 h-4 ml-1 group-hover:translate-y-0.5 transition-transform" />
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            } catch (e) {
                                                return null;
                                            }
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <h3 className="text-3xl font-extrabold text-gray-900 mb-6">About this listing</h3>
                                {listing.description ? (
                                    <div
                                        className="text-gray-700 text-[15px] [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-3 [&>h1]:text-gray-900
                                                   [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3 [&>h2]:text-gray-900
                                                   [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mb-2 [&>h3]:text-gray-900
                                                   [&>p]:mb-5 [&>p]:leading-[1.8]
                                                   [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-5 [&>ul]:leading-[1.8]
                                                   [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-5 [&>ol]:leading-[1.8]
                                                   [&>li]:mb-2
                                                   [&>strong]:font-semibold [&>strong]:text-gray-900
                                                   [&>a]:text-primary-600 [&>a]:underline"
                                        dangerouslySetInnerHTML={{ __html: listing.description }}
                                    />
                                ) : (
                                    <p className="text-gray-600">No description provided.</p>
                                )}
                            </div>

                            {/* Map Section - Tabbed Selector */}
                            {(listing.map_url || (listing.latitude && listing.longitude) || listing.station_id) && (
                                <>
                                    <div className="mt-12">
                                        {/* Tabs Header */}
                                        <div className="border-b border-gray-100 mb-8">
                                            <nav className="-mb-px flex space-x-10">
                                                <button
                                                    onClick={() => setActiveMapTab('google')}
                                                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-[16px] transition-all ${activeMapTab === 'google'
                                                        ? 'border-primary-500 text-primary-600'
                                                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
                                                        }`}
                                                >
                                                    Google Map
                                                </button>
                                                <button
                                                    onClick={() => setActiveMapTab('transit')}
                                                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-[16px] transition-all ${activeMapTab === 'transit'
                                                        ? 'border-primary-500 text-primary-600'
                                                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
                                                        }`}
                                                >
                                                    Transit Map
                                                </button>
                                            </nav>
                                        </div>

                                        {/* Map Content */}
                                        <div className="relative w-full h-[500px] rounded-[24px] overflow-hidden shadow-sm border border-gray-100 bg-gray-50 group">
                                            {activeMapTab === 'google' ? (
                                                <div className="w-full h-full animate-in fade-in duration-700">
                                                    <GoogleMapComponent
                                                        listings={[listing]}
                                                        center={mapCenter}
                                                        zoom={17}
                                                        onMarkerClick={() => { }}
                                                        options={mapOptions}
                                                        useDefaultMarkers={true}
                                                        isVisible={true}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="relative w-full h-full bg-slate-50 flex flex-col animate-in fade-in duration-700">
                                                    {/* Legend Overlay */}
                                                    <div className="absolute top-4 left-4 z-40 hidden md:flex flex-wrap gap-1.5 max-w-[300px]">
                                                        {[
                                                            { name: 'BTS Sukhumvit', color: '#7FBA00' },
                                                            { name: 'BTS Silom', color: '#006633' },
                                                            { name: 'MRT Blue', color: '#1E50A0' },
                                                        ].map((line) => (
                                                            <div key={line.name} className="flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm">
                                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: line.color }} />
                                                                <span className="text-[14px] font-bold text-gray-700">{line.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Zoom Controls Overlay */}
                                                    <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
                                                        <div className="flex flex-col bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-lg p-1">
                                                            <button
                                                                onClick={() => {
                                                                    const nextZoom = Math.min(mapState.zoom + 0.1, 2.0);
                                                                    setMapState(prev => ({
                                                                        ...prev,
                                                                        zoom: nextZoom,
                                                                        pan: constrainPan(prev.pan, nextZoom)
                                                                    }));
                                                                }}
                                                                className="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-primary-600 hover:bg-white rounded-lg transition-all"
                                                            >
                                                                <span className="text-xl font-bold">+</span>
                                                            </button>
                                                            <div className="h-px bg-gray-100 mx-1.5" />
                                                            <button
                                                                onClick={() => {
                                                                    const minZoom = getMinZoom();
                                                                    const nextZoom = Math.max(mapState.zoom - 0.1, minZoom);
                                                                    setMapState(prev => ({
                                                                        ...prev,
                                                                        zoom: nextZoom,
                                                                        pan: constrainPan(prev.pan, nextZoom)
                                                                    }));
                                                                }}
                                                                className="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-primary-600 hover:bg-white rounded-lg transition-all"
                                                            >
                                                                <span className="text-xl font-bold">−</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Map Component */}
                                                    <div
                                                        ref={transitWrapperRef}
                                                        className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing"
                                                        onMouseDown={(e) => {
                                                            const startX = e.pageX - mapState.pan.x;
                                                            const startY = e.pageY - mapState.pan.y;
                                                            const handleMouseMove = (mm) => {
                                                                const newPan = { x: mm.pageX - startX, y: mm.pageY - startY };
                                                                setMapState(prev => ({
                                                                    ...prev,
                                                                    pan: constrainPan(newPan, prev.zoom)
                                                                }));
                                                            };
                                                            const handleMouseUp = () => {
                                                                window.removeEventListener('mousemove', handleMouseMove);
                                                                window.removeEventListener('mouseup', handleMouseUp);
                                                            };
                                                            window.addEventListener('mousemove', handleMouseMove);
                                                            window.addEventListener('mouseup', handleMouseUp);
                                                        }}
                                                        onWheel={(e) => {
                                                            if (activeMapTab !== 'transit') return;
                                                            const delta = e.deltaY > 0 ? -0.05 : 0.05;
                                                            const minZoom = getMinZoom();
                                                            const nextZoom = Math.max(minZoom, Math.min(2.0, mapState.zoom + delta));
                                                            setMapState(prev => ({
                                                                ...prev,
                                                                zoom: nextZoom,
                                                                pan: constrainPan(prev.pan, nextZoom)
                                                            }));
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: '1368px',
                                                                height: '1340px',
                                                                transform: `translate(${mapState.pan.x}px, ${mapState.pan.y}px) scale(${mapState.zoom})`,
                                                                transformOrigin: '0 0',
                                                                transition: 'transform 0.1s ease-out'
                                                            }}
                                                        >
                                                            <div
                                                                ref={transitMapRef}
                                                                className="w-full h-full"
                                                            >
                                                                <TransitMapSVG />
                                                            </div>

                                                            {/* Station Marker */}
                                                            {mapState.markerPos && (
                                                                <div
                                                                    className="absolute pointer-events-none z-50"
                                                                    style={{
                                                                        left: `${mapState.markerPos.x}px`,
                                                                        top: `${mapState.markerPos.y}px`,
                                                                        transform: 'translate(-50%, -50%)'
                                                                    }}
                                                                >
                                                                    <div className="relative flex items-center justify-center">
                                                                        <div className="w-10 h-10 bg-primary-500/30 rounded-full animate-ping absolute" />
                                                                        <div className="w-5 h-5 bg-primary-600 rounded-full shadow-lg border-4 border-white relative z-10" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Map Utilities */}
                                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center text-[14px] text-gray-500">
                                                    <MapPinIcon className="w-5 h-5 mr-2 text-primary-500" />
                                                    <span className="font-medium text-gray-700">
                                                        {listing.latitude && listing.longitude
                                                            ? `Coordinates: ${listing.latitude}, ${listing.longitude}`
                                                            : listing.address || 'Location Verified'}
                                                    </span>
                                                </div>
                                                {listing.station_name && (
                                                    <div className="flex items-center text-[14px] text-gray-500 border-l border-gray-100 pl-6">
                                                        <TbTrain className="w-5 h-5 mr-2 text-primary-600" />
                                                        <span className="font-bold text-primary-900">{listing.station_name}</span>
                                                        <span className="ml-2 font-medium text-gray-400">({listing.distance_to_station}m)</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <a
                                                    href={listing.map_url || `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-5 py-2.5 rounded-full bg-gray-50 text-gray-900 font-bold text-[14px] flex items-center hover:bg-gray-100 transition-all border border-gray-100"
                                                >
                                                    View on Google Maps
                                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                        </div>

                        {/* Sticky Header Portal */}
                        {isModal && bookingId && showStickyHeader && createPortal(
                            <div className="flex items-center gap-8 ml-auto animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex flex-col gap-0.5 items-end">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Date</span>
                                    <span className="text-xs font-black text-gray-900 leading-none">
                                        {viewedBooking?.preferred_date ? new Date(viewedBooking.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '...'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0.5 items-end">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Time</span>
                                    <span className="text-xs font-black text-gray-900 leading-none">
                                        {viewedBooking?.preferred_time || '...'}
                                    </span>
                                </div>
                            </div>,
                            document.getElementById('modal-header-extra')
                        )}

                        {/* Related Listings Section */}
                        {!bookingId && relatedListings.length > 0 && (
                            <div className={`max-w-[1600px] mx-auto ${isModal ? 'px-4 sm:px-6' : 'px-6 sm:px-12 lg:px-20'} py-12 border-t border-gray-100`}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-8">You might also like</h2>
                                <div className={`grid grid-cols-1 ${isMapView ? 'lg:grid-cols-2 gap-x-12 gap-y-6' : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}`}>
                                    {relatedListings.map((related) => (
                                        <ListingCard
                                            key={related.id}
                                            listing={related}
                                            viewMode={isMapView ? 'map-list' : 'grid'}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-white overflow-hidden relative min-h-[400px] flex flex-col justify-center">

                            <div className={`max-w-[1600px] w-full mx-auto ${isModal ? 'px-8 sm:px-12' : 'px-8 sm:px-20 lg:px-32'} py-24 relative z-10`}>
                                {/* Top Row: Intro & Menus */}
                                <div className="flex flex-col lg:flex-row justify-between gap-16 mb-24">
                                    {/* Intro Text */}
                                    <div className="max-w-md">
                                        <p className="text-[18px] sm:text-[22px] font-medium text-slate-800 leading-tight tracking-tight">
                                            Your journey to the perfect property doesn’t end here.
                                        </p>
                                    </div>

                                    {/* Menu Columns */}
                                    <div className="flex gap-12 sm:gap-24">
                                        {/* EXPLORE Column */}
                                        <div className="flex flex-col gap-6">
                                            <h4 className="text-[11px] font-black text-slate-400 tracking-[0.2em] uppercase">EXPLORE</h4>
                                            <ul className="flex flex-col gap-3">
                                                {['Search Map', 'Saved Properties', 'Neighborhood Guides', 'Market Insights'].map(item => (
                                                    <li key={item}>
                                                        <a href="#" className="text-[15px] font-semibold text-slate-700 hover:text-primary-600 transition-colors">{item}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* SERVICES Column */}
                                        <div className="flex flex-col gap-6">
                                            <h4 className="text-[11px] font-black text-slate-400 tracking-[0.2em] uppercase">SERVICES</h4>
                                            <ul className="flex flex-col gap-3">
                                                {['Private Viewings', 'Buyer Representation', 'Concierge Support'].map(item => (
                                                    <li key={item}>
                                                        <a href="#" className="text-[15px] font-semibold text-slate-700 hover:text-primary-600 transition-colors">{item}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Row: Giant Bold Text */}
                                <div className="flex justify-start">
                                    <h2 className="text-[60px] sm:text-[100px] lg:text-[140px] font-black text-slate-900 leading-[0.8] tracking-[-0.04em] uppercase">
                                        DISCOVER<br />WHAT'S NEXT
                                    </h2>
                                </div>
                            </div>
                        </div>

                        {
                            isContactOverlayOpen && (
                                <>
                                    {/* Local Backdrop */}
                                    <div
                                        className="absolute inset-x-0 bottom-0 top-0 bg-black/40 backdrop-blur-[2px] z-[55] animate-in fade-in duration-300"
                                        onClick={() => setIsContactOverlayOpen(false)}
                                    />

                                    <div
                                        className="absolute top-0 left-0 right-0 bottom-0 z-[60] backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-b animate-in slide-in-from-top-2 duration-300 overflow-y-auto modal-scrollable contact-modal-scrollable"
                                        style={{ backgroundColor: 'var(--menu-bg-color, rgba(255, 255, 255, 0.95))', borderColor: 'var(--menu-border, #f3f4f6)' }}
                                    >
                                        <div className="max-w-2xl mx-auto p-8 relative flex flex-col items-center text-center">

                                            {/* Header */}
                                            <div className="mb-12 w-full">
                                                <h3 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Let's Connect</h3>
                                                <p className="text-gray-600 text-lg font-medium">Choose your preferred way to reach out</p>
                                            </div>

                                            {/* Contact Options Grid */}
                                            <div className="w-full grid grid-cols-2 gap-6 max-w-xl">
                                                {/* Line */}
                                                <a
                                                    href="https://line.me/ti/p/~kiki33467"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group flex flex-col items-center justify-center p-8 rounded-3xl transition-all duration-300 hover:scale-105 active:scale-95"
                                                    style={{
                                                        background: 'linear-gradient(135deg, rgba(6, 199, 85, 0.15) 0%, rgba(6, 199, 85, 0.05) 100%)',
                                                        backdropFilter: 'blur(10px)',
                                                        WebkitBackdropFilter: 'blur(10px)',
                                                        border: '1.5px solid rgba(6, 199, 85, 0.2)',
                                                        boxShadow: '0 4px 12px rgba(6, 199, 85, 0.1)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(6, 199, 85, 0.2)';
                                                        e.currentTarget.style.border = '1.5px solid rgba(6, 199, 85, 0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 199, 85, 0.1)';
                                                        e.currentTarget.style.border = '1.5px solid rgba(6, 199, 85, 0.2)';
                                                    }}
                                                >
                                                    <div
                                                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                                                        style={{
                                                            backgroundColor: '#06C755',
                                                            boxShadow: '0 4px 12px rgba(6, 199, 85, 0.3)'
                                                        }}
                                                    >
                                                        <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8 text-white" />
                                                    </div>
                                                    <span className="text-xl font-black text-gray-900">Line</span>
                                                </a>

                                                {/* Call */}
                                                <a
                                                    href="tel:0951953607"
                                                    className="group flex flex-col items-center justify-center p-8 rounded-3xl transition-all duration-300 hover:scale-105 active:scale-95"
                                                    style={{
                                                        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.15) 0%, rgba(17, 24, 39, 0.05) 100%)',
                                                        backdropFilter: 'blur(10px)',
                                                        WebkitBackdropFilter: 'blur(10px)',
                                                        border: '1.5px solid rgba(17, 24, 39, 0.2)',
                                                        boxShadow: '0 4px 12px rgba(17, 24, 39, 0.1)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(17, 24, 39, 0.2)';
                                                        e.currentTarget.style.border = '1.5px solid rgba(17, 24, 39, 0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(17, 24, 39, 0.1)';
                                                        e.currentTarget.style.border = '1.5px solid rgba(17, 24, 39, 0.2)';
                                                    }}
                                                >
                                                    <div
                                                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                                                        style={{
                                                            backgroundColor: '#111827',
                                                            boxShadow: '0 4px 12px rgba(17, 24, 39, 0.3)'
                                                        }}
                                                    >
                                                        <PhoneIcon className="w-8 h-8 text-white" />
                                                    </div>
                                                    <span className="text-xl font-black text-gray-900">Call</span>
                                                </a>

                                                {/* Viber */}
                                                <a
                                                    href="viber://chat?number=%2B66951953607"
                                                    className="group flex flex-col items-center justify-center p-8 rounded-3xl transition-all duration-300 hover:scale-105 active:scale-95"
                                                    style={{
                                                        background: 'linear-gradient(135deg, rgba(115, 96, 242, 0.15) 0%, rgba(115, 96, 242, 0.05) 100%)',
                                                        backdropFilter: 'blur(10px)',
                                                        WebkitBackdropFilter: 'blur(10px)',
                                                        border: '1.5px solid rgba(115, 96, 242, 0.2)',
                                                        boxShadow: '0 4px 12px rgba(115, 96, 242, 0.1)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(115, 96, 242, 0.2)';
                                                        e.currentTarget.style.border = '1.5px solid rgba(115, 96, 242, 0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(115, 96, 242, 0.1)';
                                                        e.currentTarget.style.border = '1.5px solid rgba(115, 96, 242, 0.2)';
                                                    }}
                                                >
                                                    <div
                                                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                                                        style={{
                                                            backgroundColor: '#7360f2',
                                                            boxShadow: '0 4px 12px rgba(115, 96, 242, 0.3)'
                                                        }}
                                                    >
                                                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
                                                    </div>
                                                    <span className="text-xl font-black text-gray-900">Viber</span>
                                                </a>

                                                {/* WhatsApp */}
                                                <a
                                                    href="https://wa.me/66951953607"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group flex flex-col items-center justify-center p-8 rounded-3xl transition-all duration-300 hover:scale-105 active:scale-95"
                                                    style={{
                                                        background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.15) 0%, rgba(37, 211, 102, 0.05) 100%)',
                                                        backdropFilter: 'blur(10px)',
                                                        WebkitBackdropFilter: 'blur(10px)',
                                                        border: '1.5px solid rgba(37, 211, 102, 0.2)',
                                                        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.1)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 211, 102, 0.2)';
                                                        e.currentTarget.style.border = '1.5px solid rgba(37, 211, 102, 0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.1)';
                                                        e.currentTarget.style.border = '1.5px solid rgba(37, 211, 102, 0.2)';
                                                    }}
                                                >
                                                    <div
                                                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                                                        style={{
                                                            backgroundColor: '#25D366',
                                                            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
                                                        }}
                                                    >
                                                        <DevicePhoneMobileIcon className="w-8 h-8 text-white" />
                                                    </div>
                                                    <span className="text-xl font-black text-gray-900">WhatsApp</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )
                        }

                        {/* Floating Contact FAB removed as it is now in the nav bar */}


                    </div>
                </div>
            </div>

            {/* Sticky Mobile Footer */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 px-6 pt-4 z-[90] flex items-center justify-between pointer-events-auto" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                    <div className="flex flex-col">
                        <div className="flex items-baseline">
                            <span className="text-[18px] font-extrabold text-gray-900 leading-tight">{formatPrice(listing.price)}</span>
                            {listing.listing_type === 'rent' && (
                                <span className="text-gray-900 text-[13px] font-normal ml-1">/month</span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleBookingClick}
                        className="bg-primary-600 active:bg-primary-700 active:scale-[0.98] transition-all text-white font-bold text-[15px] px-8 py-3 rounded-full"
                    >
                        Request a Viewing
                    </button>
                </div>
        </div >
    );
};

const MODAL_SIZE_CLASS = '!p-0 !m-0 sm:!m-4 w-full h-[100dvh] sm:w-[94vw] sm:h-[94vh] !max-w-full sm:!max-w-[94vw] overflow-hidden shadow-none sm:shadow-2xl transition-all duration-500';

const ListingDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const [modalTitle, setModalTitle] = useState(bookingId ? 'Appointment Details' : 'Property Details');
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryPayload, setGalleryPayload] = useState(null);

    useEffect(() => {
        setModalTitle(bookingId ? 'Appointment Details' : 'Property Details');
    }, [bookingId]);

    const openGallery = (payload) => {
        if (payload?.images?.length) {
            setGalleryPayload({
                images: payload.images,
                initialIndex: Math.min(payload.initialIndex ?? 0, payload.images.length - 1)
            });
            setGalleryOpen(true);
        }
    };

    const closeGallery = () => {
        setGalleryOpen(false);
        setGalleryPayload(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Modal
                isOpen={true}
                onClose={() => navigate(-1)}
                size="full"
                title={modalTitle}
                hideHeaderOnMobile={true}
                fullScreenMobile={true}
                className={MODAL_SIZE_CLASS}
            >
                <div className="h-full overflow-y-auto modal-scrollable bg-white">
                    <ListingDetailView
                        id={id}
                        isModal={true}
                        onTitleChange={setModalTitle}
                        onClose={() => navigate(-1)}
                        onOpenGallery={openGallery}
                    />
                </div>
            </Modal>
            {galleryOpen && galleryPayload && (
                <Modal
                    isOpen
                    onClose={closeGallery}
                    size="full"
                    closeOnBackdropClick={false}
                    lockScroll
                    hideHeader
                    fullScreenMobile
                    className={MODAL_SIZE_CLASS}
                    style={{ overscrollBehavior: 'contain' }}
                    overlayZIndex={10050}
                >
                    <AllPhotosModalContent
                        images={galleryPayload.images}
                        initialIndex={galleryPayload.initialIndex}
                        onClose={closeGallery}
                    />
                </Modal>
            )}
        </div>
    );
};

export default ListingDetailPage;
