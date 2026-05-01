import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { agentApi, PHOTO_ROOM_TYPES } from '../../services/api';
import toast from 'react-hot-toast';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import {
    PlusIcon,
    PencilIcon,
    PencilSquareIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
    BuildingOfficeIcon,
    BuildingOffice2Icon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    InboxIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { getMediaUrl } from '../../utils/media';
import StyledSelect from '../../components/Form/StyledSelect';
import EmptyState from '../../components/Common/EmptyState';
import AddToCollectionModal from '../../components/Listings/AddToCollectionModal';
import CreateCollectionModal from '../../components/Listings/CreateCollectionModal';
import {
    FolderPlusIcon,
    Bars3Icon,
    FolderIcon as FolderIconSolid
} from '@heroicons/react/24/solid';
import { collectionApi } from '../../services/api';
import { FolderIcon } from '@heroicons/react/24/outline';

import { format, startOfDay, endOfDay, isSameDay, setMonth, setYear, getMonth, getYear, addMonths, subMonths, isWithinInterval, parseISO, subDays, startOfMonth } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import { useSessionState, useScrollRestoration } from '../../hooks/usePersistentState';

const AgentListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useSessionState('listings_globalFilter', '');
    const [statusFilter, setStatusFilter] = useSessionState('listings_statusFilter', 'all');
    const [sorting, setSorting] = useSessionState('listings_sorting', []);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [addToCollectionId, setAddToCollectionId] = useState(null);
    const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
    const [collectionRefreshTrigger, setCollectionRefreshTrigger] = useState(0);

    // Use scroll restoration
    useScrollRestoration('AgentListings', !loading && listings.length > 0);

    const datePickerRef = useRef(null);

    // Date Filter State
    const [dateRange, setDateRange] = useSessionState('listings_dateRange', [
        {
            startDate: startOfDay(new Date()).toISOString(),
            endDate: endOfDay(new Date()).toISOString(),
            key: 'selection'
        }
    ]);

    // Helper to get Date objects from possibly stringified state
    const parsedDateRange = useMemo(() => {
        return dateRange.map(range => ({
            ...range,
            startDate: range.startDate instanceof Date ? range.startDate : new Date(range.startDate),
            endDate: range.endDate instanceof Date ? range.endDate : new Date(range.endDate)
        }));
    }, [dateRange]);

    const [datePreset, setDatePreset] = useSessionState('listings_datePreset', 'today');
    const [isDateFiltered, setIsDateFiltered] = useSessionState('listings_isDateFiltered', true); // Default: Filter by Today
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [shownDate, setShownDate] = useState(new Date());

    // Page Size State (default 10)
    const [pagination, setPagination] = useSessionState('listings_pagination', {
        pageIndex: 0,
        pageSize: 10,
    });

    // Close datepicker when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setShowDatePicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchListings = async () => {
        setLoading(true);
        try {
            if (selectedCollection) {
                const response = await collectionApi.getCollection(selectedCollection.id);
                setListings(response.data.listings || []);
            } else {
                const response = await agentApi.getListings({});
                const data = Array.isArray(response.data) ? response.data : (response.data.listings || []);
                setListings(data);
            }
        } catch (error) {
            console.error('Failed to fetch listings:', error);
            toast.error('Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [selectedCollection]);

    const handlePublish = async (id, isPublished) => {
        try {
            if (isPublished) {
                await agentApi.unpublishListing(id);
                toast.success('Listing unpublished');
            } else {
                await agentApi.publishListing(id);
                toast.success('Listing published');
            }
            fetchListings();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleToggleViewing = async (id, currentStatus) => {
        try {
            await agentApi.toggleViewingRequests(id);
            toast.success(currentStatus ? 'Viewing requests disabled' : 'Viewing requests enabled');
            fetchListings();
        } catch (error) {
            toast.error('Failed to update viewing status');
        }
    };

    const handleRepost = async (id) => {
        try {
            await agentApi.repostListing(id);
            toast.success('Listing reposted to top!');
            fetchListings();
        } catch (error) {
            toast.error('Failed to repost listing');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;

        try {
            await agentApi.deleteListing(id);
            toast.success('Listing deleted');
            fetchListings();
        } catch (error) {
            toast.error('Failed to delete listing');
        }
    };

    const handleDatePresetChange = (preset) => {
        setDatePreset(preset);
        const today = new Date();

        switch (preset) {
            case 'today':
                setDateRange([{
                    startDate: startOfDay(today).toISOString(),
                    endDate: endOfDay(today).toISOString(),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                setShowDatePicker(false);
                break;
            case 'yesterday':
                const yesterday = subDays(today, 1);
                setDateRange([{
                    startDate: startOfDay(yesterday).toISOString(),
                    endDate: endOfDay(yesterday).toISOString(),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                setShowDatePicker(false);
                break;
            case 'last7days':
                setDateRange([{
                    startDate: startOfDay(subDays(today, 6)).toISOString(),
                    endDate: endOfDay(today).toISOString(),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                setShowDatePicker(false);
                break;
            case 'thismonth':
                setDateRange([{
                    startDate: startOfMonth(today).toISOString(),
                    endDate: endOfDay(today).toISOString(),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                setShowDatePicker(false);
                break;
            case 'alltime':
                setIsDateFiltered(false);
                setShowDatePicker(false);
                break;
            case 'custom':
                setShowDatePicker(true);
                break;
            default:
                break;
        }
    };

    // Filter Logic
    const filteredListings = useMemo(() => {
        return listings.filter(listing => {
            // Status Filter
            const matchesStatus = statusFilter === 'all'
                ? true
                : statusFilter === 'published' ? listing.is_published : !listing.is_published;

            // Global Filter (Search)
            const matchesSearch = globalFilter
                ? (listing.title?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                    listing.address?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                    listing.district?.toLowerCase().includes(globalFilter.toLowerCase()))
                : true;

            // Date Filter
            let matchesDate = true;
            if (isDateFiltered && parsedDateRange[0].startDate && parsedDateRange[0].endDate) {
                if (!listing.created_at) {
                    matchesDate = false;
                } else {
                    const listingDate = parseISO(listing.created_at);
                    if (isNaN(listingDate.getTime())) {
                        matchesDate = false;
                    } else {
                        matchesDate = isWithinInterval(listingDate, {
                            start: startOfDay(parsedDateRange[0].startDate),
                            end: endOfDay(parsedDateRange[0].endDate)
                        });
                    }
                }
            }

            return matchesStatus && matchesSearch && matchesDate;
        });
    }, [listings, statusFilter, globalFilter, isDateFiltered, parsedDateRange]);

    // Columns
    const columns = useMemo(() => [
        {
            header: 'Property',
            accessorKey: 'title',
            cell: ({ row }) => {
                const listing = row.original;
                const bedroomImage = listing.media?.find(m => 
                    m.room_type === PHOTO_ROOM_TYPES[0] ||
                    m.room_type?.toLowerCase() === 'bedroom' || 
                    m.room_type?.toLowerCase() === 'bed room'
                )?.url;
                const displayImage = bedroomImage || listing.media?.find(m => m.type === 'image')?.url || listing.media?.[0]?.url;

                return (
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                            {displayImage ? (
                                <img
                                    src={getMediaUrl(displayImage)}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/placeholder-property.jpg'; // Ensure a fallback exists
                                    }}
                                />
                            ) : (
                                <BuildingOffice2Icon className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <div className="font-medium text-gray-900 dark:text-white line-clamp-1">{listing.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{listing.station_name || listing.district}</div>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Price',
            accessorKey: 'price',
            cell: ({ row }) => {
                const listing = row.original;
                return (
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                            {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(listing.price)}
                        </div>
                        {listing.listing_type === 'rent' && <div className="text-sm text-gray-500 dark:text-gray-400">/month</div>}
                    </div>
                );
            }
        },
        {
            header: 'Type',
            accessorKey: 'property_type',
            cell: ({ getValue }) => <span className="capitalize text-gray-700 dark:text-gray-300">{getValue()}</span>
        },
        {
            header: 'Status',
            accessorKey: 'is_published',
            cell: ({ getValue }) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getValue() ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                    {getValue() ? 'Published' : 'Draft'}
                </span>
            )
        },
        {
            header: 'Date',
            accessorKey: 'created_at',
            cell: ({ getValue }) => {
                const value = getValue();
                return (
                    <span className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                        {value ? format(parseISO(value), 'MMM dd, yyyy') : '-'}
                    </span>
                );
            }
        },
        {
            header: 'Views',
            accessorKey: 'view_count',
            cell: ({ getValue }) => <span className="text-gray-600 dark:text-gray-400">{getValue() || 0}</span>
        },
        {
            header: 'Book Viewing',
            accessorKey: 'allow_viewing_requests',
            cell: ({ row }) => {
                const listing = row.original;
                const checked = listing.allow_viewing_requests;
                return (
                    <button
                        type="button"
                        role="switch"
                        aria-checked={checked}
                        onClick={() => handleToggleViewing(listing.id, checked)}
                        className={`
                            relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-0
                            ${checked ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-200 dark:bg-zinc-600'}
                        `}
                    >
                        <span
                            aria-hidden="true"
                            className={`
                                pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                ${checked ? 'translate-x-4' : 'translate-x-0'}
                            `}
                        />
                    </button>
                );
            }
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }) => {
                const listing = row.original;
                return (
                    <div className="flex items-center justify-end gap-2.5">
                        <button
                            onClick={() => setAddToCollectionId(listing.id)}
                            className="p-2.5 text-blue-600 bg-blue-50/50 hover:bg-blue-100/50 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-xl transition-all border border-blue-100/20 dark:border-blue-500/20 shadow-sm flex items-center justify-center"
                            title="Add to Collection"
                        >
                            <FolderPlusIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handlePublish(listing.id, listing.is_published)}
                            className={`p-2.5 rounded-xl transition-all border shadow-sm flex items-center justify-center ${listing.is_published
                                ? 'text-amber-600 bg-amber-50/50 hover:bg-amber-100/50 border-amber-100/20 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 dark:hover:bg-amber-500/20'
                                : 'text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100/50 border-emerald-100/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-emerald-500/20'
                                }`}
                            title={listing.is_published ? 'Unpublish' : 'Publish'}
                        >
                            {listing.is_published ? (
                                <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                                <EyeIcon className="w-5 h-5" />
                            )}
                        </button>
                        <button
                            onClick={() => handleRepost(listing.id)}
                            className="p-2.5 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100/50 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 rounded-xl transition-all border border-indigo-100/20 dark:border-indigo-500/20 shadow-sm flex items-center justify-center"
                            title="Repost to Top"
                        >
                            <ArrowPathIcon className="w-5 h-5" />
                        </button>
                        <Link
                            to={`/dashboard/listings/${listing.id}/edit`}
                            className="p-2.5 text-primary-600 bg-primary-50/50 hover:bg-primary-100/50 dark:bg-primary-500/10 dark:text-primary-400 dark:hover:bg-primary-500/20 rounded-xl transition-all border border-primary-100/20 dark:border-primary-500/20 shadow-sm flex items-center justify-center"
                            title="Edit"
                        >
                            <PencilSquareIcon className="w-5 h-5" />
                        </Link>
                        <button
                            onClick={() => handleDelete(listing.id)}
                            className="p-2.5 text-red-600 bg-red-50/50 hover:bg-red-100/50 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-xl transition-all border border-red-100/20 dark:border-red-500/20 shadow-sm flex items-center justify-center"
                            title="Delete"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                );
            }
        }
    ], []);

    const table = useReactTable({
        data: filteredListings,
        columns,
        state: {
            sorting,
            pagination
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 pb-2">
                <div className="lg:min-w-[280px]">
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-600/10 rounded-xl flex items-center justify-center shadow-sm">
                            <BuildingOffice2Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        {selectedCollection ? `${selectedCollection.name}` : 'All Listings'}
                    </h1>
                </div>



                <div className="hidden lg:block lg:min-w-[280px]"></div>
            </div>

            {/* Toolbar: Actions & Filters */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">

                {/* LEFT: Page Size */}
                <div className="flex items-center space-x-2 h-[34px] w-full lg:w-auto">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Show</span>
                    <div className="w-16">
                        <StyledSelect
                            options={[
                                { value: 5, label: '5' },
                                { value: 10, label: '10' },
                                { value: 20, label: '20' },
                                { value: 50, label: '50' },
                            ]}
                            value={pagination.pageSize}
                            onChange={(val) => table.setPageSize(Number(val))}
                            isSearchable={false}
                            components={{
                                DropdownIndicator: () => null,
                                IndicatorSeparator: () => null
                            }}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                }),
                                valueContainer: (base) => ({
                                    ...base,
                                    justifyContent: 'center',
                                    padding: '0'
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    margin: '0',
                                    textAlign: 'center',
                                    width: '100%'
                                })
                            }}
                        />
                    </div>
                </div>

                {/* CENTER: Core Filters (Status, Date) */}
                <div className="flex flex-wrap items-center lg:justify-center gap-3 flex-1 w-full">
                    {/* Status Filter */}
                    <div className="w-full sm:w-44">
                        <StyledSelect
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'published', label: 'Published' },
                                { value: 'draft', label: 'Draft' },
                            ]}
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val)}
                            isSearchable={false}
                            placeholder="Status"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                }),
                                valueContainer: (base) => ({
                                    ...base,
                                    padding: '0 8px'
                                })
                            }}
                        />
                    </div>

                    {/* Date Filters */}
                    <div className="relative flex items-center gap-2" ref={datePickerRef}>
                        <div className="w-full sm:w-56">
                            <StyledSelect
                                options={[
                                    { value: 'today', label: 'Today' },
                                    { value: 'yesterday', label: 'Yesterday' },
                                    { value: 'last7days', label: 'Last 7 Days' },
                                    { value: 'thismonth', label: 'This Month' },
                                    { value: 'alltime', label: 'All Time' },
                                    { value: 'custom', label: 'Custom Range...' },
                                ]}
                                value={datePreset}
                                onChange={(val) => handleDatePresetChange(val)}
                                isSearchable={false}
                                placeholder="Date Range"
                                formatOptionLabel={(option) => {
                                    if (option.value === 'custom' && datePreset === 'custom' && parsedDateRange?.[0]?.startDate && parsedDateRange?.[0]?.endDate) {
                                        try {
                                            const start = parsedDateRange[0].startDate;
                                            const end = parsedDateRange[0].endDate;
                                            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                                                return (
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{format(start, "MMM dd")} - {format(end, "MMM dd")}</span>
                                                    </div>
                                                );
                                            }
                                        } catch (e) {
                                            console.error('Date formatting error:', e);
                                        }
                                    }
                                    return (
                                        <div className="flex items-center justify-between w-full">
                                            <span>{option.label}</span>
                                        </div>
                                    );
                                }}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                    }),
                                    valueContainer: (base) => ({
                                        ...base,
                                        padding: '0 8px'
                                    })
                                }}
                            />
                        </div>

                        {/* Reset Button - only show if customized or not today */}
                        <button
                            onClick={() => handleDatePresetChange('today')}
                            className={`p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors ${datePreset === 'today' ? 'invisible' : ''}`}
                            title="Reset to Today"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                        </button>

                        {showDatePicker && (
                            <div className="absolute top-full left-0 mt-2 z-50 shadow-lg rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-dashboard-card w-[350px]">
                                {/* Custom Header */}
                                <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={() => setShownDate(subMonths(shownDate, 1))}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400"
                                    >
                                        <ChevronLeftIcon className="w-5 h-5" />
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <div className="w-32">
                                            <StyledSelect
                                                value={getMonth(shownDate instanceof Date && !isNaN(shownDate.getTime()) ? shownDate : new Date())}
                                                onChange={(val) => setShownDate(setMonth(shownDate || new Date(), val))}
                                                options={Array.from({ length: 12 }, (_, i) => ({
                                                    value: i,
                                                    label: format(new Date(2000, i, 1), 'MMMM')
                                                }))}
                                                isSearchable={false}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        minHeight: '30px',
                                                        height: '30px',
                                                    }),
                                                    dropdownIndicator: (base) => ({
                                                        ...base,
                                                        padding: '2px'
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="w-28">
                                            <StyledSelect
                                                value={getYear(shownDate instanceof Date && !isNaN(shownDate.getTime()) ? shownDate : new Date())}
                                                onChange={(val) => setShownDate(setYear(shownDate || new Date(), val))}
                                                options={Array.from({ length: 10 }, (_, i) => {
                                                    const year = new Date().getFullYear() - 5 + i;
                                                    return { value: year, label: year.toString() };
                                                })}
                                                isSearchable={false}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        minHeight: '30px',
                                                        height: '30px',
                                                        fontSize: '12px'
                                                    }),
                                                    dropdownIndicator: (base) => ({
                                                        ...base,
                                                        padding: '2px'
                                                    })
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShownDate(addMonths(shownDate, 1))}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400"
                                    >
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <DateRange
                                    locale={enUS}
                                    editableDateInputs={true}
                                    onChange={item => {
                                        setDateRange([{
                                            ...item.selection,
                                            startDate: item.selection.startDate.toISOString(),
                                            endDate: item.selection.endDate.toISOString()
                                        }]);
                                        setIsDateFiltered(true);
                                        setDatePreset('custom');
                                    }}
                                    moveRangeOnFirstSelection={false}
                                    ranges={parsedDateRange}
                                    shownDate={shownDate instanceof Date && !isNaN(shownDate.getTime()) ? shownDate : new Date()}
                                    showMonthAndYearPickers={false}
                                    rangeColors={['#3b82f6']} // primary-500
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Search & Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="relative w-full lg:w-64">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                        <input
                            type="text"
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search listings..."
                            className="input-field pl-10 pr-4 h-[34px] min-h-0 text-[13px]"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setIsCollectionModalOpen(true)}
                            className="btn-secondary flex-1 sm:flex-none h-[34px] px-4 text-[12px] flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <FolderPlusIcon className="w-4 h-4 text-primary-500" />
                            <span className="whitespace-nowrap">New Collection</span>
                        </button>

                        <Link
                            to="/dashboard/listings/new"
                            className="btn-primary flex-1 sm:flex-none h-[34px] px-4 text-[12px] flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <PlusIcon className="w-4 h-4" />
                            <span>Add Listing</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Listings Table Section */}
            <div className="bg-white dark:bg-dashboard-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : listings.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <th
                                                    key={header.id}
                                                    className={`text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 ${header.id === 'actions' ? 'text-right' : ''}`}
                                                >
                                                    {header.isPlaceholder ? null : (
                                                        <div
                                                            className={`flex items-center ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-900 dark:hover:text-white' : ''} ${header.id === 'actions' ? 'justify-end' : ''}`}
                                                            onClick={header.column.getToggleSortingHandler()}
                                                        >
                                                            <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                                                            {header.column.getCanSort() && (
                                                                <span className="ml-1">
                                                                    {{
                                                                        asc: <ChevronUpIcon className="w-4 h-4" />,
                                                                        desc: <ChevronDownIcon className="w-4 h-4" />,
                                                                    }[header.column.getIsSorted()] ?? (
                                                                            <div className="w-4 h-4 opacity-0 group-hover:opacity-50">
                                                                                <ChevronUpIcon className="w-4 h-4" />
                                                                            </div>
                                                                        )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {table.getRowModel().rows.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="px-6 py-4">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {table.getRowModel().rows.length === 0 && (
                                <EmptyState
                                    icon={MagnifyingGlassIcon}
                                    title="No listings found"
                                    description="No listings match your search criteria."
                                    action={
                                        <button
                                            onClick={() => {
                                                setGlobalFilter('');
                                                setStatusFilter('all');
                                            }}
                                            className="btn-secondary text-sm"
                                        >
                                            Clear Filters
                                        </button>
                                    }
                                />
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <div className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                                <span className="text-gray-900 dark:text-white">{table.getFilteredRowModel().rows.length}</span> results
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all text-gray-400"
                                >
                                    <ChevronDoubleLeftIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all text-gray-400"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-2 mx-2">
                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Page</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={table.getPageCount()}
                                        value={table.getState().pagination.pageIndex + 1}
                                        onChange={e => {
                                            const page = e.target.value ? Number(e.target.value) - 1 : 0;
                                            table.setPageIndex(page);
                                        }}
                                        className="w-12 h-9 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-dashboard-input text-center text-[13px] font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                                    />
                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">of {table.getPageCount() || 1}</span>
                                </div>

                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all text-gray-400"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all text-gray-400"
                                >
                                    <ChevronDoubleRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <EmptyState
                        icon={InboxIcon}
                        title="No listings yet"
                        description="Get started by creating your first property listing."
                        action={
                            <Link to="/dashboard/listings/new" className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap px-4 h-[38px] text-sm shadow-sm">
                                <PlusIcon className="w-5 h-5" />
                                <span>Create Listing</span>
                            </Link>
                        }
                    />
                )}
            </div>

            <AddToCollectionModal
                isOpen={!!addToCollectionId}
                onClose={() => setAddToCollectionId(null)}
                listingId={addToCollectionId}
            />

            <CreateCollectionModal
                isOpen={isCollectionModalOpen}
                onClose={() => setIsCollectionModalOpen(false)}
                onSuccess={(newCol) => {
                    setCollectionRefreshTrigger(prev => prev + 1);
                    setSelectedCollection(newCol);
                }}
            />
        </div >
    );
};

export default AgentListings;
