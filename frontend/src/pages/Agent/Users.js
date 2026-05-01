import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { agentApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
    UsersIcon,
    MagnifyingGlassIcon,
    TrashIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    PlusIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
} from '@tanstack/react-table';
import StyledSelect from '../../components/Form/StyledSelect';
import { format, startOfDay, endOfDay, subDays, startOfMonth, subMonths, addMonths, getMonth, getYear, setMonth, setYear, isWithinInterval } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import EmptyState from '../../components/Common/EmptyState';
import { useSessionState, useScrollRestoration } from '../../hooks/usePersistentState';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useSessionState('users_globalFilter', '');
    const [statusFilter, setStatusFilter] = useSessionState('users_statusFilter', 'all');
    const [sorting, setSorting] = useSessionState('users_sorting', []);
    const [pagination, setPagination] = useSessionState('users_pagination', {
        pageIndex: 0,
        pageSize: 10,
    });

    // Use scroll restoration
    useScrollRestoration('Users', !loading && users.length > 0);

    // Date Filter State
    const [dateRange, setDateRange] = useSessionState('users_dateRange', [
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

    const [datePreset, setDatePreset] = useSessionState('users_datePreset', 'all');
    const [isDateFiltered, setIsDateFiltered] = useSessionState('users_isDateFiltered', false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [shownDate, setShownDate] = useState(new Date());
    const datePickerRef = React.useRef(null);

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

    const handleDatePresetChange = (preset) => {
        setDatePreset(preset);
        const today = new Date();

        switch (preset) {
            case 'all':
                setIsDateFiltered(false);
                setShowDatePicker(false);
                break;
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
            case 'last7':
                setDateRange([{
                    startDate: startOfDay(subDays(today, 6)).toISOString(),
                    endDate: endOfDay(today).toISOString(),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                setShowDatePicker(false);
                break;
            case 'last30':
                setDateRange([{
                    startDate: startOfDay(subDays(today, 29)).toISOString(),
                    endDate: endOfDay(today).toISOString(),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                setShowDatePicker(false);
                break;
            case 'thisMonth':
                setDateRange([{
                    startDate: startOfMonth(today).toISOString(),
                    endDate: endOfDay(today).toISOString(),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                setShowDatePicker(false);
                break;
            case 'custom':
                setShowDatePicker(true);
                break;
            default:
                break;
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await agentApi.getUsers();
            setUsers(response.data || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleStatus = async (id) => {
        try {
            await agentApi.toggleUserStatus(id);
            toast.success('User status updated');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            await agentApi.deleteUser(id);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const filteredUsers = useMemo(() => {
        let data = users;
        if (statusFilter !== 'all') {
            data = data.filter(u => {
                if (statusFilter === 'active') return u.is_active;
                if (statusFilter === 'inactive') return !u.is_active;
                return true;
            });
        }

        if (isDateFiltered && parsedDateRange[0].startDate && parsedDateRange[0].endDate) {
            data = data.filter(u => {
                if (!u.created_at) return false;
                try {
                    const date = new Date(u.created_at);
                    return isWithinInterval(date, {
                        start: startOfDay(parsedDateRange[0].startDate),
                        end: endOfDay(parsedDateRange[0].endDate)
                    });
                } catch (e) {
                    return false;
                }
            });
        }

        return data;
    }, [users, statusFilter, isDateFiltered, dateRange]);

    const columns = useMemo(() => [
        {
            accessorKey: 'full_name',
            header: 'VISITOR',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center space-x-3 py-1">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-blue-600/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-700 dark:text-blue-400 font-bold text-xs">
                                {user.first_name?.[0]?.toUpperCase()}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 dark:text-white text-sm">
                                    {user.first_name} {user.last_name}
                                </span>
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-600/10 text-[#3B82F6] dark:text-blue-400 text-[10px] font-bold border border-blue-100 dark:border-blue-800">
                                    <CheckCircleIcon className="w-3 h-3" />
                                    <span>Site User</span>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 font-medium mt-0.5">
                                {user.email}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'late_cancellation_count',
            header: 'CANCELLATIONS',
            cell: ({ getValue }) => {
                const count = getValue() || 0;
                return (
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${count >= 3 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                            {count}
                        </span>
                        {count >= 3 && (
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-500 animate-pulse" />
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: 'created_at',
            header: 'REGISTERED',
            cell: ({ getValue }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {getValue() ? (
                            (() => {
                                const d = new Date(getValue());
                                return !isNaN(d.getTime()) ? format(d, 'MMM dd, yyyy', { locale: enUS }) : '-';
                            })()
                        ) : '-'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                        {getValue() ? (
                            (() => {
                                const d = new Date(getValue());
                                return !isNaN(d.getTime()) ? format(d, 'hh:mm a', { locale: enUS }) : '';
                            })()
                        ) : ''}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'STATUS',
            cell: ({ row }) => {
                const isActive = row.original.is_active;
                return (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isActive
                        ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                        {isActive ? 'Active' : 'Suspended'}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'ACTIONS',
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => {/* View Details */ }}
                        className="p-1.5 text-[#3B82F6] bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100/50 backdrop-blur-sm rounded-xl transition-all"
                        title="View Details"
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.original.id)}
                        className="p-1.5 text-red-600 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100/50 backdrop-blur-sm rounded-xl transition-all"
                        title="Delete"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ], [users]);

    const table = useReactTable({
        data: filteredUsers,
        columns,
        state: {
            globalFilter,
            sorting,
            pagination
        },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 pb-2">
                <div className="lg:min-w-[280px]">
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-600/10 rounded-xl flex items-center justify-center shadow-sm">
                            <UsersIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        Registered Users
                    </h1>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 flex-1">
                    <div className="flex items-center space-x-3 transition-all hover:translate-y-[-2px] duration-300">

                    </div>
                </div>

                <div className="hidden lg:block lg:min-w-[280px]"></div>
            </div>



            {/* Toolbar - Aligned with Appointment Design */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
                {/* Left: Page Size */}
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
                                    cursor: 'pointer'
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

                {/* Center: Filters */}
                <div className="flex flex-wrap items-center justify-center gap-4 flex-1">
                    {/* Status Filter */}
                    <div className="w-full sm:w-44">
                        <StyledSelect
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Suspended' },
                            ]}
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val)}
                            isSearchable={false}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    textAlign: 'center'
                                }),
                                valueContainer: (base) => ({
                                    ...base,
                                    justifyContent: 'center'
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    width: '100%',
                                    textAlign: 'center'
                                })
                            }}
                        />
                    </div>

                    {/* Date Filter */}
                    <div className="relative w-full sm:w-56" ref={datePickerRef}>
                        <StyledSelect
                            options={[
                                { value: 'all', label: 'All Time' },
                                { value: 'today', label: 'Today' },
                                { value: 'yesterday', label: 'Yesterday' },
                                { value: 'last7', label: 'Last 7 Days' },
                                { value: 'last30', label: 'Last 30 Days' },
                                { value: 'thisMonth', label: 'This Month' },
                                { value: 'custom', label: 'Custom Range...' },
                            ]}
                            value={datePreset}
                            onChange={handleDatePresetChange}
                            isSearchable={false}
                            icon={CalendarDaysIcon}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                })
                            }}
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
                        />

                        {/* Custom Date Picker Popup - Ported from Appointments for Smoothness */}
                        {showDatePicker && (
                            <div className="absolute top-full left-0 lg:left-auto lg:right-0 mt-2 z-[100] bg-white dark:bg-dashboard-card rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden w-[350px]">
                                <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
                                    <button onClick={() => setShownDate(subMonths(shownDate, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400">
                                        <ChevronLeftIcon className="w-5 h-5" />
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32">
                                            <StyledSelect
                                                value={getMonth(shownDate instanceof Date && !isNaN(shownDate.getTime()) ? shownDate : new Date())}
                                                onChange={(val) => setShownDate(setMonth(shownDate || new Date(), val))}
                                                options={Array.from({ length: 12 }, (_, i) => ({ value: i, label: format(new Date(2000, i, 1), 'MMMM') }))}
                                                isSearchable={false}
                                                styles={{ control: (base) => ({ ...base, minHeight: '30px', height: '30px', fontSize: '12px' }) }}
                                            />
                                        </div>
                                        <div className="w-24">
                                            <StyledSelect
                                                value={getYear(shownDate instanceof Date && !isNaN(shownDate.getTime()) ? shownDate : new Date())}
                                                onChange={(val) => setShownDate(setYear(shownDate || new Date(), val))}
                                                options={Array.from({ length: 10 }, (_, i) => { const y = new Date().getFullYear() - 5 + i; return { value: y, label: y.toString() }; })}
                                                isSearchable={false}
                                                styles={{ control: (base) => ({ ...base, minHeight: '30px', height: '30px' }) }}
                                            />
                                        </div>
                                    </div>
                                    <button onClick={() => setShownDate(addMonths(shownDate, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400">
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <DateRange
                                    locale={enUS}
                                    editableDateInputs={false}
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
                                    rangeColors={['#3b82f6']}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Search */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="relative w-full lg:w-64">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                        <input
                            type="text"
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search users..."
                            className="input-field pl-10 pr-4 h-[34px] min-h-0 text-[11px]"
                        />
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white dark:bg-dashboard-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#F9FAFB] dark:bg-gray-800/50 border-b dark:border-gray-700">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th
                                                    key={header.id}
                                                    className="px-6 py-4 text-[11px] font-bold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider"
                                                >
                                                    <div
                                                        className={`flex items-center gap-2 ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                                                        {header.column.getCanSort() && (
                                                            <div className="flex flex-col opacity-30">
                                                                <ChevronUpIcon className={`w-2.5 h-2.5 -mb-1 ${header.column.getIsSorted() === 'asc' ? 'text-primary-500 opacity-100' : ''}`} />
                                                                <ChevronDownIcon className={`w-2.5 h-2.5 ${header.column.getIsSorted() === 'desc' ? 'text-primary-500 opacity-100' : ''}`} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {table.getRowModel().rows.map(row => (
                                        <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Area - Exact Reference Design */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-gray-50 dark:border-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing <span className="font-bold text-gray-900 dark:text-white">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{table.getFilteredRowModel().rows.length}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500"
                                >
                                    <ChevronDoubleLeftIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>

                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Page</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={table.getPageCount()}
                                        value={table.getState().pagination.pageIndex + 1}
                                        onChange={(e) => {
                                            const page = e.target.value ? Number(e.target.value) - 1 : 0;
                                            table.setPageIndex(page);
                                        }}
                                        className="w-12 h-8 text-center border border-gray-300 dark:border-gray-600 rounded-xl text-xs font-bold bg-white dark:bg-dashboard-card text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">of {table.getPageCount()}</span>
                                </div>

                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500"
                                >
                                    <ChevronDoubleRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <EmptyState
                        icon={UsersIcon}
                        title="No users found"
                        description="Visitors who register on your site will appear here."
                    />
                )}
            </div>
        </div>
    );
};

export default Users;
