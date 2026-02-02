import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { agentApi } from '../../services/api';
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
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
    BuildingOfficeIcon,
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
import StyledSelect from '../../components/Form/StyledSelect';
import EmptyState from '../../components/Common/EmptyState';

import { format, startOfDay, endOfDay, isSameDay, setMonth, setYear, getMonth, getYear, addMonths, subMonths, isWithinInterval, parseISO, subDays, startOfMonth } from 'date-fns';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const AgentListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sorting, setSorting] = useState([]);


    const datePickerRef = useRef(null);

    // Date Filter State
    const [dateRange, setDateRange] = useState([
        {
            startDate: startOfDay(new Date()),
            endDate: endOfDay(new Date()),
            key: 'selection'
        }
    ]);
    const [datePreset, setDatePreset] = useState('today');
    const [isDateFiltered, setIsDateFiltered] = useState(true); // Default: Filter by Today
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [shownDate, setShownDate] = useState(new Date());

    // Page Size State (default 10)
    const [pagination, setPagination] = useState({
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
            // Fetch all listings and filter client-side for smoother interaction with TanStack Table
            const response = await agentApi.getListings({});
            const data = Array.isArray(response.data) ? response.data : (response.data.listings || []);
            setListings(data);
        } catch (error) {
            console.error('Failed to fetch listings:', error);
            toast.error('Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

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
        setShowDatePicker(false);
        const today = new Date();

        switch (preset) {
            case 'today':
                setDateRange([{
                    startDate: startOfDay(today),
                    endDate: endOfDay(today),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                break;
            case 'yesterday':
                const yesterday = subDays(today, 1);
                setDateRange([{
                    startDate: startOfDay(yesterday),
                    endDate: endOfDay(yesterday),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                break;
            case 'last7days':
                setDateRange([{
                    startDate: startOfDay(subDays(today, 6)),
                    endDate: endOfDay(today),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                break;
            case 'thismonth':
                setDateRange([{
                    startDate: startOfMonth(today),
                    endDate: endOfDay(today),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                break;
            case 'alltime':
                setIsDateFiltered(false);
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
            if (isDateFiltered && dateRange[0].startDate && dateRange[0].endDate) {
                if (!listing.created_at) {
                    matchesDate = false;
                } else {
                    const listingDate = parseISO(listing.created_at);
                    if (isNaN(listingDate.getTime())) {
                        matchesDate = false;
                    } else {
                        matchesDate = isWithinInterval(listingDate, {
                            start: startOfDay(dateRange[0].startDate),
                            end: endOfDay(dateRange[0].endDate)
                        });
                    }
                }
            }

            return matchesStatus && matchesSearch && matchesDate;
        });
    }, [listings, statusFilter, globalFilter, isDateFiltered, dateRange]);

    // Columns
    const columns = useMemo(() => [
        {
            header: 'Property',
            accessorKey: 'title',
            cell: ({ row }) => {
                const listing = row.original;
                return (
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded-[3px] overflow-hidden flex-shrink-0">
                            {listing.media?.[0]?.url ? (
                                <img
                                    src={listing.media[0].url}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <BuildingOfficeIcon className="w-6 h-6 text-gray-400" />
                                </div>
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
            cell: ({ getValue }) => <span className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">{format(parseISO(getValue()), 'MMM dd, yyyy')}</span>
        },
        {
            header: 'Views',
            accessorKey: 'view_count',
            cell: ({ getValue }) => <span className="text-gray-600 dark:text-gray-400">{getValue() || 0}</span>
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }) => {
                const listing = row.original;
                return (
                    <div className="flex items-center justify-end space-x-2">
                        <button
                            onClick={() => handlePublish(listing.id, listing.is_published)}
                            className={`p-1.5 rounded-lg transition-all duration-200 ${listing.is_published
                                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20'
                                : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'
                                }`}
                            title={listing.is_published ? 'Unpublish' : 'Publish'}
                        >
                            {listing.is_published ? (
                                <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                                <EyeIcon className="w-5 h-5" />
                            )}
                        </button>
                        <Link
                            to={`/agent/listings/${listing.id}/edit`}
                            className="p-1.5 text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-400 dark:hover:bg-primary-500/20 rounded-lg transition-all duration-200"
                            title="Edit"
                        >
                            <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                            onClick={() => handleDelete(listing.id)}
                            className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-lg transition-all duration-200"
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
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="space-y-6">
            {/* Toolbar: Actions & Filters */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">

                {/* LEFT: Page Size */}
                <div className="flex items-center space-x-2 h-[38px] w-full lg:w-auto">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Show</span>
                    <div className="w-16">
                        <StyledSelect
                            options={[
                                { value: 5, label: '5' },
                                { value: 10, label: '10' },
                                { value: 20, label: '20' },
                                { value: 50, label: '50' },
                            ]}
                            value={{
                                value: table.getState().pagination.pageSize,
                                label: `${table.getState().pagination.pageSize}`
                            }}
                            onChange={(val) => table.setPageSize(val)}
                            isSearchable={false}
                            components={{
                                DropdownIndicator: () => null,
                                IndicatorSeparator: () => null
                            }}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    minHeight: '34px',
                                    height: '34px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    fontSize: '12px'
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
                    <div className="w-full sm:w-32">
                        <StyledSelect
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'published', label: 'Published' },
                                { value: 'draft', label: 'Draft' },
                            ]}
                            value={{ value: statusFilter, label: statusFilter === 'all' ? 'All Status' : (statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)) }}
                            onChange={(val) => setStatusFilter(val)}
                            isSearchable={false}
                            placeholder="Status"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    minHeight: '34px',
                                    height: '34px',
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
                                value={{
                                    value: datePreset,
                                    label: datePreset === 'custom'
                                        ? `${format(dateRange[0].startDate, "MMM dd")} - ${format(dateRange[0].endDate, "MMM dd")}`
                                        : datePreset === 'today' ? 'Today'
                                            : datePreset === 'yesterday' ? 'Yesterday'
                                                : datePreset === 'last7days' ? 'Last 7 Days'
                                                    : datePreset === 'thismonth' ? 'This Month'
                                                        : 'All Time'
                                }}
                                onChange={(val) => handleDatePresetChange(val)}
                                isSearchable={false}
                                placeholder="Date Range"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        minHeight: '34px',
                                        height: '34px',
                                        fontSize: '12px'
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
                            className={`p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors ${datePreset === 'today' ? 'invisible' : ''}`}
                            title="Reset to Today"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                        </button>

                        {showDatePicker && (
                            <div className="absolute top-full left-0 mt-2 z-50 shadow-lg rounded-md overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-dashboard-card w-[350px]">
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
                                                value={{
                                                    value: getMonth(shownDate),
                                                    label: format(shownDate, 'MMMM')
                                                }}
                                                onChange={(option) => setShownDate(setMonth(shownDate, option.value))}
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
                                                        fontSize: '0.875rem'
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
                                                value={{
                                                    value: getYear(shownDate),
                                                    label: getYear(shownDate).toString()
                                                }}
                                                onChange={(option) => setShownDate(setYear(shownDate, option.value))}
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
                                                        fontSize: '0.875rem'
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
                                    editableDateInputs={true}
                                    onChange={item => {
                                        setDateRange([item.selection]);
                                        setIsDateFiltered(true);
                                        setDatePreset('custom');
                                    }}
                                    moveRangeOnFirstSelection={false}
                                    ranges={dateRange}
                                    shownDate={shownDate}
                                    showMonthAndYearPickers={false}
                                    rangeColors={['#3b82f6']} // primary-500
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Search & Actions */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative w-full sm:w-56 h-[34px]">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search listings..."
                            className="input-field pl-9 h-[34px] text-[12px] flex items-center"
                        />
                    </div>

                    <Link
                        to="/agent/listings/new"
                        className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap px-3 h-[34px] text-[12px] shadow-sm"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Add Listing</span>
                    </Link>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-dashboard-card rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
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
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing{' '}
                                <span className="font-medium">
                                    {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                                </span>{' '}
                                to{' '}
                                <span className="font-medium">
                                    {Math.min(
                                        (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                        table.getFilteredRowModel().rows.length
                                    )}
                                </span>{' '}
                                of <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> results
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-500 dark:text-gray-400"
                                >
                                    <ChevronDoubleLeftIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-500 dark:text-gray-400"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>

                                <div className="flex items-center space-x-1">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Page</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={table.getPageCount()}
                                        value={table.getState().pagination.pageIndex + 1}
                                        onChange={(e) => {
                                            const page = e.target.value ? Number(e.target.value) - 1 : 0;
                                            table.setPageIndex(page);
                                        }}
                                        className="w-14 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-dashboard-dark text-gray-900 dark:text-white"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">of {table.getPageCount()}</span>
                                </div>

                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-500 dark:text-gray-400"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-500 dark:text-gray-400"
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
                            <Link to="/agent/listings/new" className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap px-4 h-[38px] text-sm shadow-sm">
                                <PlusIcon className="w-5 h-5" />
                                <span>Create Listing</span>
                            </Link>
                        }
                    />
                )}
            </div>
        </div >
    );
};

export default AgentListings;
