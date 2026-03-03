import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import { createPortal } from 'react-dom';
import { useSearchParams, useOutletContext, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { publicApi } from '../../services/api';
import ProjectCard from '../../components/Listings/ProjectCard';
import GoogleMap from '../../components/Listings/GoogleMap';
import TransitMapFilter from '../../components/TransitMap/TransitMapFilter';
import TransitFilterModal from '../../components/TransitMap/TransitFilterModal';
import StyledSelect from '../../components/Form/StyledSelect';
import ShowcaseBanners from '../../components/Common/ShowcaseBanners';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ListingDetailModal from '../../components/Listings/ListingDetailModal';
import FilterBar from '../../components/ui/FilterBar';
import ListingSkeleton from '../../components/ui/ListingSkeleton';
import PriceRangeSlider from '../../components/ui/PriceRangeSlider';
import FilterCard from '../../components/ui/FilterCard';
import FilterPill from '../../components/ui/FilterPill';
import { FilterIcons } from '../../utils/IconMap';
import ScrollableFilterList from '../../components/ui/ScrollableFilterList';

import {
    AdjustmentsHorizontalIcon,
    Squares2X2Icon,
    ListBulletIcon,
    MapIcon,
    MapPinIcon,
    XMarkIcon,
    BuildingOfficeIcon,
    MagnifyingGlassIcon,
    GlobeAltIcon,
    SparklesIcon,
    ArrowUpIcon,
    TagIcon,
} from '@heroicons/react/24/outline';

import {
    CheckCircleIcon
} from '@heroicons/react/24/solid';
import Logo from '../../components/Common/Logo';

const projectTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'condominium', label: 'Condominium' },
    { value: 'housing_estate', label: 'Housing Estate' },
    { value: 'townhome', label: 'Townhome' },
    { value: 'mixed_use', label: 'Mixed-Use' },
    { value: 'commercial', label: 'Commercial' },
];

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pre_sales', label: 'Pre-Sales' },
    { value: 'new_launch', label: 'New Launch' },
    { value: 'under_construction', label: 'Under Construction' },
    { value: 'ready_to_move', label: 'Ready to Move' },
    { value: 'sold_out', label: 'Sold Out' },
];

const getSelectedOption = (options, value) => {
    if (!options || !value) return null;
    return options.find(opt => opt.value === value) || null;
};

const MapTransitionOverlay = ({ active, switchActive }) => {
    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-700 ease-in-out ${active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Background: Glassmorphism + Map Blur Effect */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-2xl" />

            {/* Subtle Gradient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] animate-pulse" />

            {/* Content Container */}
            <div className="relative flex flex-col items-center gap-8">
                {/* Globe Icon Container */}
                <div className="w-20 h-20 bg-white/80 backdrop-blur-lg rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 flex items-center justify-center animate-bounce-subtle">
                    <GlobeAltIcon className="w-10 h-10 text-gray-400" />
                </div>

                {/* Visual Dot */}
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />

                {/* Animated Toggle Icon (Shuttle style) */}
                <div className="relative w-16 h-8 bg-gray-200/50 rounded-full border border-gray-200/50 p-1 backdrop-blur-sm">
                    <div className={`w-6 h-6 bg-black rounded-full shadow-lg flex items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${switchActive ? 'translate-x-8' : 'translate-x-0'}`}>
                        <MapIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                </div>

                {/* Text Group */}
                <div className="flex flex-col items-center gap-3">
                    <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-gray-900 animate-fade-in-up">
                        Activating Map
                    </h2>
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                        <span className="flex gap-1">
                            <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0s' }} />
                            <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </span>
                        Generating View
                    </div>
                </div>
            </div>
        </div>
    );
};


const ProjectsPage = () => {
    const { user } = useAuth();
    const { agent, actual_min_price, actual_max_price } = useTenant();
    const outletContext = useOutletContext() || {};
    const { navVisible, filterBarSlot, isScrolled: layoutScrolled } = outletContext;
    const [searchParams, setSearchParams] = useSearchParams();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const observerTarget = useRef(null);

    // Modal States

    const [isGoogleMapOpen, setIsGoogleMapOpen] = useState(searchParams.get('view') === 'map');
    const [isMapTransitioning, setIsMapTransitioning] = useState(false);
    const [overlaySwitchActive, setOverlaySwitchActive] = useState(false);
    const [isTransitModalOpen, setIsTransitModalOpen] = useState(false);


    // Update local state when searchParams change, except during transition
    useEffect(() => {
        if (!isMapTransitioning) {
            setIsGoogleMapOpen(searchParams.get('view') === 'map');
        }
    }, [searchParams, isMapTransitioning]);

    // Effect for MapTransitionOverlay switch animation
    useEffect(() => {
        if (isMapTransitioning) {
            const timer = setTimeout(() => {
                setOverlaySwitchActive(true);
            }, 50);
            return () => clearTimeout(timer);
        } else {
            setOverlaySwitchActive(false);
        }
    }, [isMapTransitioning]);

    const [developers, setDevelopers] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state for Map View
    const [isSidebarClosing, setIsSidebarClosing] = useState(false); // For close animation
    const [sidebarAnimateIn, setSidebarAnimateIn] = useState(false); // Start off-screen for open animation
    const [exitingChipKeys, setExitingChipKeys] = useState(new Set());
    const [isMapSidebarOpen, setIsMapSidebarOpen] = useState(false); // Sidebar state for Map Overlay

    const [viewMode, setViewMode] = useState(() => localStorage.getItem('projects_view_mode') || 'grid');
    const [priceLimits, setPriceLimits] = useState({ min: 0, max: 0 });
    const [priceFormat, setPriceFormat] = useState('short');
    const [agentId, setAgentId] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mapBounds, setMapBounds] = useState(null); // Map bounds for geographic filtering

    // Open sidebar filters when triggered from mobile nav search pill
    useEffect(() => {
        const mobileFilters = searchParams.get('mobile_filters');
        if (mobileFilters === '1') {
            setIsSidebarOpen(true);
            setSidebarAnimateIn(true);
            const next = new URLSearchParams(searchParams);
            next.delete('mobile_filters');
            setSearchParams(next);
        }
    }, [searchParams, setSearchParams]);

    // Start open animation (slide in from right) on next frame
    useEffect(() => {
        if (isSidebarOpen && sidebarAnimateIn) {
            const t = requestAnimationFrame(() => {
                requestAnimationFrame(() => setSidebarAnimateIn(false));
            });
            return () => cancelAnimationFrame(t);
        }
    }, [isSidebarOpen, sidebarAnimateIn]);

    // Filter sidebar close animation: slide out then unmount
    const closeFilterSidebar = useCallback(() => setIsSidebarClosing(true), []);
    useEffect(() => {
        if (!isSidebarClosing) return;
        const t = setTimeout(() => {
            setIsSidebarOpen(false);
            setIsSidebarClosing(false);
        }, 300);
        return () => clearTimeout(t);
    }, [isSidebarClosing]);

    // Use a ref to track bounds to avoid redundant state updates in onBoundsChanged
    const lastBoundsRef = useRef(null);

    const handleMapBoundsChanged = React.useCallback((bounds) => {
        // Simple comparison to prevent identical bounds from triggering a reload
        const isSame = lastBoundsRef.current &&
            lastBoundsRef.current.min_lat === bounds.min_lat &&
            lastBoundsRef.current.max_lat === bounds.max_lat &&
            lastBoundsRef.current.min_lng === bounds.min_lng &&
            lastBoundsRef.current.max_lng === bounds.max_lng;

        if (!isSame) {
            lastBoundsRef.current = bounds;
            setMapBounds(bounds);
            setPage(1);
        }
    }, []);

    // Scroll listener for filter bar margin
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Save view mode selection
    useEffect(() => {
        localStorage.setItem('projects_view_mode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        localStorage.setItem('show_google_map', isGoogleMapOpen);
        document.body.style.overflow = (isGoogleMapOpen || isSidebarOpen) ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isGoogleMapOpen, isSidebarOpen]);

    const toggleMapView = (isOpen) => {
        if (isOpen === isGoogleMapOpen || isMapTransitioning) return;

        setIsMapTransitioning(true);

        // Update URL immediately so map/list starts loading in background
        const newParams = new URLSearchParams(searchParams);
        if (isOpen) newParams.set('view', 'map');
        else newParams.delete('view');
        setSearchParams(newParams);

        // Premium transition delay
        setTimeout(() => {
            setIsMapTransitioning(false);
        }, 1200);
    };

    const [stations, setStations] = useState([]);
    const [flatStations, setFlatStations] = useState([]); // Flat options for StyledSelect
    const [stationsLoaded, setStationsLoaded] = useState(false);
    const [transitSearchTerm, setTransitSearchTerm] = useState('');
    const [showTransitResults, setShowTransitResults] = useState(false);
    const transitSearchRef = useRef(null);

    // Unified Data Fetching
    useEffect(() => {
        const fetchAgentInfo = async () => {
            try {
                let urlAgentId = searchParams.get('agent_id') || searchParams.get('agent');
                if (!urlAgentId && window.location.hostname.includes('localhost') && user?.agent_id) {
                    urlAgentId = user.agent_id;
                }
                const response = await publicApi.getAgentInfo(urlAgentId ? { agent_id: urlAgentId } : {});
                setPriceLimits({
                    min: parseFloat(response.data.min_price_limit) || 0,
                    max: parseFloat(response.data.max_price_limit) || 0
                });
                if (response.data.price_format) setPriceFormat(response.data.price_format);
                setAgentId(urlAgentId || response.data.id);
            } catch (error) {
                console.error('Failed to fetch agent info:', error);
            }
        };

        fetchAgentInfo();
    }, [searchParams, user]);

    // Fetch developers once on mount
    useEffect(() => {
        const fetchDevelopersData = async () => {
            try {
                const response = await publicApi.getDevelopers();
                const fetchedDevelopers = response.data?.developers || response.data || [];
                setDevelopers(Array.isArray(fetchedDevelopers) ? fetchedDevelopers : []);
            } catch (error) {
                console.error('Failed to fetch developers:', error);
            }
        };
        fetchDevelopersData();
    }, []);

    // Fetch stations once on mount (stations don't change based on URL params)
    useEffect(() => {
        const fetchStationsData = async () => {
            try {
                const response = await publicApi.getStations();
                const fetchedStations = response.data.stations || [];
                setStations(fetchedStations); // Flat list for header search

                // Flat options for StyledSelect (avoids react-select grouped options crash)
                const flat = (fetchedStations || []).map(station => ({
                    value: station.id,
                    label: station.name_en,
                    line_name: station.line_name,
                    line_color: station.line_color
                }));
                setFlatStations(flat);
                setStationsLoaded(true);
            } catch (error) {
                console.error('Failed to fetch stations:', error);
            }
        };
        fetchStationsData();
    }, []); // Fetch stations only once on mount

    // Close search results on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (transitSearchRef.current && !transitSearchRef.current.contains(event.target)) {
                setShowTransitResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [showScrollTop, setShowScrollTop] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Filter states
    const [filters, setFilters] = useState(() => {
        const saved = JSON.parse(localStorage.getItem('project_filters') || '{}');
        return {
            project_type: searchParams.get('project_type') || saved.project_type || '',
            status: searchParams.get('status') || saved.status || '',
            station_id: searchParams.get('station_id') || saved.station_id || '',
            search: searchParams.get('search') || saved.search || '',
            developer_id: searchParams.get('developer_id') || saved.developer_id || '',
        };
    });

    const [searchTerm, setSearchTerm] = useState(filters.search);


    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== filters.search) {
                // Pass false for shouldScroll to keep focus/position while typing
                handleFilterChange('search', searchTerm, false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);
    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    // Sync filters with URL search params
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        const newFilters = {
            project_type: params.get('project_type') || '',
            status: params.get('status') || '',
            station_id: params.get('station_id') || '',
            search: params.get('search') || '',
            developer_id: params.get('developer_id') || '',
        };

        // Only update if filters have actually changed to avoid infinite loops
        const hasChanged = Object.keys(newFilters).some(key => newFilters[key] !== filters[key]);
        if (hasChanged) {
            setFilters(newFilters);
            setPage(1);
        }
    }, [searchParams]);


    useEffect(() => {
        const controller = new AbortController();
        const fetchListings = async () => {
            // Optimistic loading: If map is open but bounds aren't ready, wait.
            // This prevents "showing all properties" flash on reload in Map View.
            if (isGoogleMapOpen && !mapBounds) {
                if (initialLoading) setLoading(true);
                return;
            }

            // Only show initial skeletons if we are on page 1
            if (page === 1) {
                // Avoid "flash" in map view OR during typing search.
                // If map is open OR filters.search is changing, we don't clear results.
                const isMapBoundsUpdate = isGoogleMapOpen && projects.length > 0;
                const isSearchTyped = searchTerm !== filters.search && projects.length > 0;

                if (!isMapBoundsUpdate && !isSearchTyped) {
                    setInitialLoading(true);
                    setProjects([]); // Clear projects for fresh fetch on page 1
                } else if (isBoundsTriggeredFetch) {
                    // For map boundary fetches, we intentionally switch to loading state
                    // to show the skeletons spinning down during the artificial delay.
                    setInitialLoading(true);
                }
            }
            setLoading(true);

            try {
                const params = { ...filters, page, limit: 12 };
                // Add map bounds to params if available and map is open
                if (mapBounds && isGoogleMapOpen) {
                    params.min_lat = mapBounds.min_lat;
                    params.max_lat = mapBounds.max_lat;
                    params.min_lng = mapBounds.min_lng;
                    params.max_lng = mapBounds.max_lng;
                }
                if (window.location.hostname.includes('localhost') && user?.agent_id && !params.agent_id) {
                    params.agent_id = user.agent_id;
                }

                // Call API and artificial delay in parallel for premium "serial" loading feel
                const response = isBoundsTriggeredFetch
                    ? (await Promise.all([
                        publicApi.getProjects(params, { signal: controller.signal }),
                        new Promise(resolve => setTimeout(resolve, 800))
                    ]))[0]
                    : (await Promise.all([
                        publicApi.getProjects(params, { signal: controller.signal }),
                        new Promise(resolve => setTimeout(resolve, 200)) // No delay for map pans
                    ]))[0];

                const data = response.data;

                if (page === 1 && initialLoading) {
                    // Trigger exit animation
                    setIsExiting(true);
                    await new Promise(resolve => setTimeout(resolve, 600)); // matches CSS exit duration
                    setProjects(data.projects);
                    setIsExiting(false);
                    setInitialLoading(false);
                } else {
                    setProjects(prev => page === 1 ? data.projects : [...prev, ...data.projects]);
                }

                setTotal(data.total || 0);
            } catch (error) {
                if (axios.isCancel(error)) return;
                console.error('Failed to fetch projects', error);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                    // Only set initialLoading false here if it wasn't handled by the animation block
                    if (page !== 1) setInitialLoading(false);
                }
            }
        };
        fetchListings();
        return () => controller.abort();
    }, [filters, page, user, mapBounds, isGoogleMapOpen]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loading && projects.length < total) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 0.1 }
        );
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => { if (observerTarget.current) observer.unobserve(observerTarget.current); };
    }, [loading, projects.length, total]);

    const handleFilterChange = (key, value, shouldScroll = true) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        localStorage.setItem('project_filters', JSON.stringify(newFilters));
        setPage(1);

        if (shouldScroll) {
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to prevent jump
            const newParams = new URLSearchParams(searchParams);
            if (value) newParams.set(key, value);
            else newParams.delete(key);
            setSearchParams(newParams);
        }
    };

    const handleSelectChange = (key, option) => {
        const val = (option && typeof option === 'object') ? option.value : option;
        handleFilterChange(key, val || '');
    };

    const handleStationSelect = (stationIds) => {
        const value = Array.isArray(stationIds) ? stationIds.join(',') : stationIds;
        handleFilterChange('station_id', value);
    };

    const applyFilters = (override) => {
        const next = override ? { ...filters, ...override } : { ...filters };
        setFilters(next);
        const newParams = new URLSearchParams(searchParams);
        const view = searchParams.get('view');
        ['project_type', 'status', 'station_id', 'developer_id', 'search'].forEach(key => {
            const v = next[key];
            if (v) newParams.set(key, v);
            else newParams.delete(key);
        });
        if (view) newParams.set('view', view);
        setSearchParams(newParams);
        setPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsSidebarClosing(true);
    };

    const clearFilters = () => {
        setFilters({
            project_type: '',
            status: '',
            station_id: '',
            developer_id: '',
            search: '',
        });

        localStorage.removeItem('project_filters');
        setSearchTerm('');
        setPage(1); // Reset page
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        // Preserve 'view' parameter if it exists
        const newParams = new URLSearchParams();
        const currentView = searchParams.get('view');
        if (currentView) newParams.set('view', currentView);
        setSearchParams(newParams);
    };

    // Generate active filters list (memoized or simple var)
    const activeFiltersList = [];
    if (filters.search) activeFiltersList.push({ label: `"${filters.search}"`, key: 'search' });
    if (filters.project_type) {
        const opt = projectTypeOptions.find(o => o.value === filters.project_type);
        if (opt) activeFiltersList.push({ label: opt.label, key: 'project_type' });
    }
    if (filters.status) {
        const opt = statusOptions.find(o => o.value === filters.status);
        if (opt) activeFiltersList.push({ label: opt.label, key: 'status' });
    }
    if (filters.station_id) {
        // Use flatStations (already flat option objects) to find the label
        const station = flatStations.find(s => s && s.value === filters.station_id);
        if (station) activeFiltersList.push({ label: `Station: ${station.label}`, key: 'station_id' });
    }
    if (filters.developer_id) {
        const developer = developers.find(d => d.id === filters.developer_id);
        if (developer) activeFiltersList.push({ label: `Dev: ${developer.name}`, key: 'developer_id' });
    }

    // --- Render Helper: Compact Filter Content (Reusable for Sidebar/Modal) ---
    const renderFilterContent = () => {
        return (
            <div className="space-y-6 [&>*:first-child]:mt-0">
                {/* Selected filters — chips with × to remove */}
                {activeFiltersList.length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-[15px] md:text-[13px] font-medium md:font-normal text-gray-900">Selected</h2>
                        <div className="flex flex-wrap gap-2">
                            {activeFiltersList.map(({ label, key }) => {
                                const isExiting = exitingChipKeys.has(key);
                                const handleRemove = () => {
                                    setExitingChipKeys(prev => new Set(prev).add(key));
                                    setTimeout(() => {
                                        handleFilterChange(key, '');
                                        setExitingChipKeys(prev => { const n = new Set(prev); n.delete(key); return n; });
                                    }, 200);
                                };
                                return (
                                    <span
                                        key={key}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-800 bg-white text-gray-900 text-[13px] font-medium transition-all duration-200 ease-out animate-fade-in ${isExiting ? 'opacity-0 scale-90 pointer-events-none' : ''
                                            }`}
                                        style={isExiting ? { minWidth: 0, overflow: 'hidden' } : undefined}
                                    >
                                        <span className="break-words max-w-[140px] min-w-0">{label}</span>
                                        <button
                                            type="button"
                                            onClick={handleRemove}
                                            className="flex-shrink-0 p-0.5 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
                                            aria-label={`Remove ${label}`}
                                        >
                                            <XMarkIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Filter Sections */}
                <div className="space-y-10">


                    {/* PROJECT TYPE - Pill Select */}
                    <FilterCard
                        title="Project Type"
                        icon={FilterIcons.propertyType}
                    >
                        <div className="flex flex-wrap gap-2.5">
                            {/* All option */}
                            <FilterPill
                                label="All Types"
                                isActive={!filters.project_type}
                                onClick={() => handleFilterChange('project_type', '')}
                            />
                            {projectTypeOptions.filter(o => o.value !== '').map(opt => {
                                const selected = filters.project_type ? filters.project_type.split(',') : [];
                                const isActive = selected.includes(opt.value);
                                const toggle = () => {
                                    let newSelected;
                                    if (isActive) {
                                        newSelected = selected.filter(v => v !== opt.value);
                                    } else {
                                        newSelected = [...selected, opt.value];
                                    }
                                    handleFilterChange('project_type', newSelected.join(','));
                                };
                                return (
                                    <FilterPill
                                        key={opt.value}
                                        label={opt.label}
                                        isActive={isActive}
                                        onClick={toggle}
                                    />
                                );
                            })}
                        </div>
                    </FilterCard>


                    {/* PROJECT STATUS - Pill Select */}
                    <FilterCard
                        title="Project Status"
                        icon={FilterIcons.projectStatus}
                    >
                        <div className="flex flex-wrap gap-2.5">
                            {/* All option */}
                            <FilterPill
                                label="All Statuses"
                                isActive={!filters.status}
                                onClick={() => handleFilterChange('status', '')}
                            />
                            {statusOptions.filter(o => o.value !== '').map(opt => {
                                const selected = filters.status ? filters.status.split(',') : [];
                                const isActive = selected.includes(opt.value);
                                const toggle = () => {
                                    let newSelected;
                                    if (isActive) {
                                        newSelected = selected.filter(v => v !== opt.value);
                                    } else {
                                        newSelected = [...selected, opt.value];
                                    }
                                    handleFilterChange('status', newSelected.join(','));
                                };
                                return (
                                    <FilterPill
                                        key={opt.value}
                                        label={opt.label}
                                        isActive={isActive}
                                        onClick={toggle}
                                    />
                                );
                            })}
                        </div>
                    </FilterCard>

                    {/* TRANSIT STATION - Modal Trigger */}
                    <FilterCard
                        title="Transit Station"
                        icon={FilterIcons.transit}
                    >
                        <div className="space-y-3">
                            <button
                                onClick={() => setIsTransitModalOpen(true)}
                                className="w-full flex items-center justify-between pl-4 pr-1.5 py-1.5 bg-white border border-gray-200 rounded-full transition-all group hover:border-gray-400"
                            >
                                <div className="flex items-center gap-3">
                                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
                                    <span className="text-[13px] font-normal text-gray-500 group-hover:text-gray-700">Search transit station...</span>
                                </div>
                                <div className="bg-white border border-gray-800 p-2 rounded-full active:scale-95 transition-all flex items-center justify-center">
                                    <MapIcon className="w-5 h-5 text-gray-800" strokeWidth={2} />
                                </div>
                            </button>

                            {/* Selection Pills */}
                            {(filters.station_id || '').split(',').filter(Boolean).map(id => {
                                const station = flatStations.find(s => s.value === id);
                                return (
                                    <button
                                        key={id}
                                        onClick={() => {
                                            const currentIds = filters.station_id.split(',');
                                            const newIds = currentIds.filter(i => i !== id);
                                            handleFilterChange('station_id', newIds.join(','));
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-800 hover:border-gray-600 rounded-full transition-colors group"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-gray-800" />
                                        <span className="text-[13px] font-normal text-gray-900">
                                            {station ? station.label : id}
                                        </span>
                                        <XMarkIcon className="w-4 h-4 text-gray-600 group-hover:text-gray-800" strokeWidth={2.5} />
                                    </button>
                                );
                            })}
                        </div>
                    </FilterCard>

                    {/* PRICE RANGE */}
                    <FilterCard
                        title="Price Range"
                        icon={FilterIcons.price}
                    >
                        <PriceRangeSlider
                            min={actual_min_price}
                            max={actual_max_price}
                            step={Math.max(10000, Math.round(((actual_max_price) - (actual_min_price)) / 100))}
                            initialMin={Number(filters.min_price) || actual_min_price}
                            initialMax={Number(filters.max_price) || actual_max_price}
                            onChange={({ min, max }) => {
                                handleFilterChange('min_price', min > actual_min_price ? min : '');
                                handleFilterChange('max_price', max < actual_max_price ? max : '');
                            }}
                        />
                    </FilterCard>


                    {/* DEVELOPER FILTER */}
                    <FilterCard
                        title="Developer"
                        icon={FilterIcons.developer}
                    >
                        <ScrollableFilterList
                            items={(developers || []).map(d => ({
                                id: d.id,
                                name: d.name,
                                subtitle: d.company || 'Real Estate Developer',
                                image: d.logo || d.image,
                                isAvatar: true
                            }))}
                            selectedId={filters.developer_id}
                            onSelect={id => handleSelectChange('developer_id', id)}
                            placeholder="Search developer..."
                            allLabel="All Developers"
                        />
                    </FilterCard>
                    {/* Spacer for bottom of sidebar */}
                    <div className="h-12 pointer-events-none" />
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-inter">
            {/* Map Transition Loading Overlay */}
            {isMapTransitioning && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-all duration-300 animate-in fade-in">
                    <div className="flex flex-col items-center gap-8">
                        {/* Map Logo Design */}
                        <div className="flex flex-col items-center gap-4 mb-2 animate-in fade-in zoom-in duration-700">
                            <div className="w-20 h-20 bg-primary-50 rounded-[24px] flex items-center justify-center shadow-sm border border-primary-100">
                                <GlobeAltIcon className="w-12 h-12 text-primary-600 animate-pulse" />
                            </div>
                            <div className="w-1.5 h-1.5 bg-primary-600 rounded-full opacity-50" />
                        </div>

                        {/* Custom Animated Switch Logo */}
                        <div className="relative w-32 h-16 bg-gray-100 rounded-full p-2 border-2 border-gray-200 shadow-[inner_0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden">
                            <div
                                className="absolute top-2 w-12 h-12 bg-primary-600 rounded-full shadow-lg transition-all duration-700 ease-in-out flex items-center justify-center text-white"
                                style={{
                                    left: overlaySwitchActive
                                        ? (!isGoogleMapOpen ? 'calc(100% - 3.5rem)' : '0.5rem')
                                        : (!isGoogleMapOpen ? '0.5rem' : 'calc(100% - 3.5rem)')
                                }}
                            >
                                {overlaySwitchActive
                                    ? (!isGoogleMapOpen ? <MapIcon className="w-7 h-7" /> : <ListBulletIcon className="w-7 h-7" />)
                                    : (!isGoogleMapOpen ? <ListBulletIcon className="w-7 h-7" /> : <MapIcon className="w-7 h-7" />)
                                }
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-2 text-center">
                            <h3 className="text-xl font-black uppercase tracking-[0.2em] text-primary-600">
                                {!isGoogleMapOpen ? 'Activating Map' : 'Returning to List'}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest pl-1">
                                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                <span>Generating View</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* --- FILTER SIDEBAR (slide-in from right when Filters clicked) --- */}
            {(isSidebarOpen || isSidebarClosing) && (
                <>
                    <div
                        className={`fixed inset-0 z-[260] bg-black/25 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${isSidebarClosing ? 'opacity-0' : 'opacity-100'}`}
                        onClick={closeFilterSidebar}
                        aria-hidden
                    />
                    <aside
                        className={`fixed right-0 top-0 h-full w-full sm:w-[360px] sm:max-w-[85vw] z-[261] bg-white shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-out ${(isSidebarClosing || sidebarAnimateIn) ? 'translate-x-full' : 'translate-x-0'}`}
                        role="dialog"
                        aria-label="Filter settings"
                    >
                        {/* Sidebar header */}
                        <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-200 md:border-gray-100 bg-white">
                            <h3 className="text-[15px] md:text-[13px] font-bold text-gray-900">Filter Settings</h3>
                            <button
                                type="button"
                                onClick={closeFilterSidebar}
                                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                aria-label="Close filters"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Filter box content */}
                        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 custom-scrollbar modal-scrollable">
                            {renderFilterContent()}
                        </div>
                        {/* Sidebar footer (mobile-first): slimmer height, Clear on left, Search on right; iPhone safe area */}
                        <div
                            className="flex-shrink-0 py-4 lg:px-6 lg:pb-6 border-t border-gray-200 md:border-gray-100 bg-white md:bg-white flex flex-row flex-nowrap items-center justify-between gap-3 pt-4 pb-5"
                            style={{
                                paddingTop: 'max(1.25rem, env(safe-area-inset-top, 0px))',
                                paddingBottom: 'max(2rem, calc(1.75rem + env(safe-area-inset-bottom, 0px)))',
                                paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
                                paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
                            }}
                        >
                            <button
                                onClick={clearFilters}
                                disabled={!hasActiveFilters}
                                className={`order-1 px-2.5 py-2 md:px-3 md:py-2 rounded text-[13px] font-normal transition-all duration-300 ${hasActiveFilters
                                    ? 'bg-transparent border-none text-red-600 hover:text-red-700'
                                    : 'bg-transparent border-none text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Clear all
                            </button>
                            <button
                                onClick={applyFilters}
                                className="order-2 inline-flex items-center justify-center px-8 py-3.5 md:px-5 md:py-2.5 rounded-full text-[13px] md:text-[12px] font-normal transition-all duration-300 bg-gray-900 hover:bg-gray-800 text-white border border-gray-900 hover:border-gray-800 min-h-[48px] md:min-h-[40px]"
                            >
                                <span>Show {total} {total === 1 ? 'project' : 'projects'}</span>
                            </button>
                        </div>
                    </aside>
                </>
            )}



            {/* --- STANDARD GRID LAYOUT --- */}
            <div className="w-full bg-white min-h-screen relative">
                {/* Mobile search bar: real input + filter icon outside; shadow only when scrolled */}
                <div className={`lg:hidden sticky top-0 z-[100] bg-white py-4 px-4 transition-shadow duration-200 ${layoutScrolled ? 'shadow-[0_4px_12px_-2px_rgba(0,0,0,0.1)]' : ''}`}>
                    <div className="flex items-center gap-3 w-full">
                        <div className="flex-1 min-w-0 flex items-center gap-2 min-h-[52px] pl-4 pr-4 py-2 rounded-full bg-white border border-gray-200">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                                placeholder="Search projects & filters"
                                className="flex-1 min-w-0 py-2.5 text-[14px] font-medium text-gray-900 placeholder:text-gray-500 bg-transparent border-none focus:outline-none focus:ring-0"
                                aria-label="Search projects"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => { setIsSidebarOpen(true); setSidebarAnimateIn(true); }}
                            className={`flex-shrink-0 relative w-11 h-11 rounded-full flex items-center justify-center text-gray-800 hover:text-gray-900 active:scale-95 transition-all ${activeFiltersList.length > 0 ? 'border-2 border-gray-800 bg-white hover:border-gray-700' : 'bg-white'}`}
                            aria-label="Open filters"
                        >
                            <AdjustmentsHorizontalIcon className={`${activeFiltersList.length > 0 ? 'w-5 h-5' : 'w-8 h-8'}`} />
                            {activeFiltersList.length > 0 && (
                                <span className="absolute -top-[4px] -right-[4px] min-w-[16px] h-[16px] px-0.5 flex items-center justify-center rounded-full bg-gray-800 text-white text-[10px] font-semibold border border-white leading-none">
                                    {activeFiltersList.length > 99 ? '99+' : activeFiltersList.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
                {/* Header Mobile */}


                {/* Filter bar is portaled into layout (same container as nav) */}
                {filterBarSlot && createPortal(
                    <FilterBar
                        className=""
                        total={total}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        onOpenFilters={() => { setIsSidebarOpen(true); setSidebarAnimateIn(true); }}
                        hasActiveFilters={hasActiveFilters}
                        activeFilterCount={activeFiltersList.length}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        isGoogleMapOpen={isGoogleMapOpen}
                        onToggleMapView={toggleMapView}
                        isMapTransitioning={isMapTransitioning}
                        navVisible={navVisible}
                        isScrolled={layoutScrolled}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />,
                    filterBarSlot
                )}

                {/* Main Content Grid — same width as nav: max-w-[1440px] + px-6 lg:px-12 */}
                <div className="max-w-[1600px] mx-auto w-full px-6 md:px-12 lg:px-20 mt-2 lg:mt-3">
                    {/* Main Content Grid — no container padding */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar */}
                        <div className={`lg:col-span-3 hidden lg:block transition-all duration-500 ${isGoogleMapOpen ? '!hidden' : ''}`}>
                            <div className={`sticky transition-all duration-500 ease-in-out ${navVisible ? 'top-[112px] lg:top-[128px] h-[calc(100vh-112px)] lg:h-[calc(100vh-128px)]' : 'top-[48px] h-[calc(100vh-48px)]'} flex flex-col bg-white border-r border-gray-100/50`}>
                                <div className="flex-1 overflow-y-auto custom-scrollbar-hover scroll-smooth pr-4 overscroll-contain group">
                                    {renderFilterContent()}
                                </div>

                                {/* Desktop Sidebar Fixed Footer */}
                                <div className="flex-shrink-0 p-6 border-t border-gray-50 bg-white flex flex-row flex-nowrap items-center justify-center gap-3">
                                    <button
                                        onClick={applyFilters}
                                        className="px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 bg-gray-900 hover:bg-gray-800 text-white border border-gray-900 hover:border-gray-800 shadow-sm hover:shadow-md min-h-[40px]"
                                    >
                                        Show {total} {total === 1 ? 'project' : 'projects'}
                                    </button>
                                    <button
                                        onClick={clearFilters}
                                        disabled={!hasActiveFilters}
                                        className={`px-3 py-2 rounded text-[13px] font-bold transition-all duration-300 ${hasActiveFilters
                                            ? 'bg-transparent border-none text-red-600 hover:text-red-700'
                                            : 'bg-transparent border-none text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Clear all
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Listings Grid or Map */}
                        <div className={`${isGoogleMapOpen ? 'lg:col-span-12 min-h-0' : 'lg:col-span-9'} transition-all duration-500 relative`}>
                            <div
                                className={`flex flex-col lg:flex-row gap-6 lg:gap-8 ${isGoogleMapOpen ? 'min-h-0 h-full pt-0.5' : 'min-h-[70vh]'}`}
                                style={isGoogleMapOpen ? { height: `calc(100vh - ${navVisible ? 124 : 92}px)`, minHeight: 0 } : undefined}
                            >
                                {/* Left Side: Project List (map view: scrollable, fills height) */}
                                <div className={`w-full flex flex-col ${isGoogleMapOpen ? 'hidden lg:block lg:w-[45%] min-h-0 h-full overflow-y-auto custom-scrollbar p-0' : ''}`}>
                                    {/* Header: Results Count */}
                                    <div className="mb-4 mt-1 flex justify-end">
                                        {initialLoading ? (
                                            <div className={`h-7 w-32 bg-gray-100 rounded animate-pulse ${isExiting ? 'animate-fadeOutDown' : ''}`} />
                                        ) : (projects || []).length > 0 ? (
                                            <h2 className="text-[15px] font-bold text-gray-900 animate-fadeInUp">
                                                {total} {total === 1 ? 'project' : 'projects'}
                                            </h2>
                                        ) : null}
                                    </div>

                                    {initialLoading ? (
                                        <div className={`grid gap-4 ${isGoogleMapOpen ? 'grid-cols-1' : (viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}`}>
                                            {[...Array(isGoogleMapOpen ? 6 : 12)].map((_, i) => <ListingSkeleton key={i} index={i} viewMode={isGoogleMapOpen ? 'map-list' : viewMode} isExiting={isExiting} />)}
                                        </div>
                                    ) : (projects || []).length > 0 ? (
                                        <>
                                            <div className={`grid gap-4 ${isGoogleMapOpen ? 'grid-cols-1' : (viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}`}>
                                                {(projects || []).map((l, i) => (
                                                    <div key={l.id}>
                                                        <ProjectCard index={i} project={l} viewMode={isGoogleMapOpen ? 'map-list' : viewMode} priceFormat={priceFormat} />
                                                    </div>
                                                ))}
                                                {loading && !initialLoading && (
                                                    <div className="contents">
                                                        {[...Array(viewMode === 'grid' ? (isGoogleMapOpen ? 3 : 6) : 3)].map((_, i) => <ListingSkeleton key={`more-${i}`} index={i} viewMode={isGoogleMapOpen ? 'map-list' : viewMode} />)}
                                                    </div>
                                                )}
                                            </div>
                                            <div ref={observerTarget} className="h-20" />
                                        </>
                                    ) : (
                                        <div className={`flex flex-col items-center justify-center py-24 px-4 bg-gray-50/50 border border-dashed border-gray-200 rounded-[24px] animate-fadeInUp text-center flex-1 ${isGoogleMapOpen ? 'h-full min-h-[50vh]' : 'min-h-[50vh]'}`}>
                                            <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-5">
                                                <SparklesIcon className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-[17px] font-bold text-gray-900">No projects found</h3>
                                            <p className="text-[14px] text-gray-500 mt-1 max-w-[260px] text-center leading-relaxed">
                                                Try adjusting your search or filters to discover more matching results.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Map (Desktop/Tablet) */}
                                {((isGoogleMapOpen || (isMapTransitioning && searchParams.get('view') === 'map'))) && (
                                    <div className="hidden lg:flex lg:flex-col lg:flex-shrink-0 lg:min-h-0 w-[55%] h-full relative">
                                        <div className="map-overlays-rounded relative w-full h-full rounded-[24px] overflow-hidden shadow-sm border border-gray-200">
                                            <GoogleMap
                                                projects={projects}
                                                onMarkerClick={(property) => {
                                                    const newParams = new URLSearchParams(searchParams);
                                                    newParams.set('detail', property.id);
                                                    setSearchParams(newParams);
                                                }}
                                                onBoundsChanged={handleMapBoundsChanged}
                                                isVisible={isGoogleMapOpen || (isMapTransitioning && searchParams.get('view') === 'map')}
                                            />
                                            {/* Map Overlays */}
                                            <div className="absolute top-4 right-4 z-10 pointer-events-none">
                                                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50 flex items-center gap-3">
                                                    <div className="bg-primary-50 p-2 rounded-full">
                                                        <GlobeAltIcon className="w-5 h-5 text-primary-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Map Mode</p>
                                                        <p className="text-sm font-bold text-gray-900">{total} Projects</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>




            {/* Modals */}




            {/* Scroll to top */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-28 right-6 md:bottom-8 md:right-8 bg-primary-600 text-white p-3 rounded-full shadow-lg transition-all z-[100] ${showScrollTop && !isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                <ArrowUpIcon className="w-6 h-6" />
            </button>

            {/* Mobile Floating Action Button - Filters */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] safe-area-bottom pointer-events-none flex items-center gap-3 shadow-2xl rounded-full">
                <button
                    onClick={() => toggleMapView()}
                    className="pointer-events-auto flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-3.5 rounded-full shadow-xl hover:shadow-2xl active:scale-95 transition-all border border-gray-700"
                >
                    {isGoogleMapOpen ? <ListBulletIcon className="w-5 h-5 stroke-[2]" /> : <MapIcon className="w-5 h-5 stroke-[2]" />}
                    <span className="text-sm font-bold tracking-wide">{isGoogleMapOpen ? 'List' : 'Map'}</span>
                </button>
                <div className="w-px h-6 bg-gray-700 pointer-events-none" />
                <button
                    onClick={() => { setIsSidebarOpen(true); setSidebarAnimateIn(true); }}
                    className="pointer-events-auto relative flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-3.5 rounded-full shadow-xl hover:shadow-2xl active:scale-95 transition-all border border-gray-700"
                >
                    <AdjustmentsHorizontalIcon className="w-5 h-5 text-white stroke-[2]" />
                    <span className="text-sm font-bold tracking-wide">Filters</span>
                    {activeFiltersList.length > 0 && (
                        <span className="absolute -top-[4px] -right-[4px] min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full bg-white text-gray-900 text-[11px] font-semibold border-2 border-gray-900 shadow-sm leading-none">
                            {activeFiltersList.length > 99 ? '99+' : activeFiltersList.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Google Maps Modal (Mobile Only) */}
            {
                (isGoogleMapOpen || (isMapTransitioning && searchParams.get('view') === 'map')) && (
                    <div className="fixed inset-0 z-[120] bg-white flex flex-col items-center lg:!hidden pointer-events-auto lg:pointer-events-none lg:opacity-0">
                        <div className="w-full bg-white border-b px-4 py-4 flex items-center justify-between shadow-sm z-10 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary-50 w-12 h-12 rounded-[20px] shadow-sm flex items-center justify-center">
                                    <GlobeAltIcon className="w-6 h-6 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 leading-none">Map Explorer</h2>
                                    <p className="text-[10px] font-bold text-gray-500 mt-1.5 uppercase tracking-tighter">Found {total} locations</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleMapView(false)}
                                className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all flex items-center justify-center"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 w-full relative">
                            <GoogleMap
                                projects={projects}
                                onMarkerClick={(property) => {
                                    const newParams = new URLSearchParams(searchParams);
                                    newParams.set('detail', property.id);
                                    setSearchParams(newParams);
                                }}
                                onBoundsChanged={(bounds) => { setMapBounds(bounds); setPage(1); }}
                                isVisible={isGoogleMapOpen || (isMapTransitioning && searchParams.get('view') === 'map')}
                            />

                            {/* Mobile Legend Overlay - Theme Card Style */}
                            <div className="absolute top-4 left-4 right-4 z-10">
                                <div className="bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-full shadow-xl border border-white/50 flex items-center justify-center gap-8 animate-slide-up">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3.5 h-3.5 rounded-full bg-primary-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Rent</span>
                                    </div>
                                    <div className="w-px h-4 bg-gray-200" />
                                    <div className="flex items-center gap-3">
                                        <div className="w-3.5 h-3.5 rounded-full bg-orange-600 shadow-[0_0_10px_rgba(234,88,12,0.4)]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Sale</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Action Footer */}
                        <div className="w-full p-4 bg-white border-t flex flex-col gap-4 safe-area-bottom">
                            <button
                                onClick={() => toggleMapView(false)}
                                className="w-full bg-primary-600 text-white py-4.5 rounded-[20px] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-200 active:scale-95 transition-all text-center flex items-center justify-center h-14"
                            >
                                Back to List
                            </button>
                        </div>
                    </div>
                )
            }
            {/* Status Overlays */}
            <MapTransitionOverlay active={isMapTransitioning} switchActive={overlaySwitchActive} />

            <TransitFilterModal
                isOpen={isTransitModalOpen}
                onClose={() => setIsTransitModalOpen(false)}
                initialSelected={filters.station_id ? filters.station_id.split(',') : []}
                onApply={handleStationSelect}
            />

        </div >
    );
};

export default ProjectsPage;
