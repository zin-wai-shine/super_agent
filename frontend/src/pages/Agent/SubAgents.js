import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { agentApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
    UserPlusIcon,
    TrashIcon,
    UsersIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    XMarkIcon,
    CalendarDaysIcon,
    ArrowPathIcon
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

const SubAgents = () => {
    const [subAgents, setSubAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSubAgent, setEditingSubAgent] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    // Date Filter State
    const [dateRange, setDateRange] = useState([
        {
            startDate: startOfDay(new Date()),
            endDate: endOfDay(new Date()),
            key: 'selection'
        }
    ]);
    const [datePreset, setDatePreset] = useState('all');
    const [isDateFiltered, setIsDateFiltered] = useState(false);
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
                    startDate: startOfDay(today),
                    endDate: endOfDay(today),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                setShowDatePicker(false);
                break;
            case 'yesterday':
                const yesterday = subDays(today, 1);
                setDateRange([{
                    startDate: startOfDay(yesterday),
                    endDate: endOfDay(yesterday),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                setShowDatePicker(false);
                break;
            case 'last7':
                setDateRange([{
                    startDate: startOfDay(subDays(today, 6)),
                    endDate: endOfDay(today),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                setShowDatePicker(false);
                break;
            case 'last30':
                setDateRange([{
                    startDate: startOfDay(subDays(today, 29)),
                    endDate: endOfDay(today),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                setShowDatePicker(false);
                break;
            case 'thisMonth':
                setDateRange([{
                    startDate: startOfMonth(today),
                    endDate: endOfDay(today),
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

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const fetchSubAgents = async () => {
        try {
            const response = await agentApi.getSubAgents();
            setSubAgents(response.data || []);
        } catch (error) {
            console.error('Failed to fetch sub-agents:', error);
            toast.error('Failed to load sub-agents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubAgents();
    }, []);

    const onSubmit = async (data) => {
        try {
            if (editingSubAgent) {
                await agentApi.updateSubAgent(editingSubAgent.id, data);
                toast.success('Sub-agent updated!');
            } else {
                await agentApi.createSubAgent(data);
                toast.success('Sub-agent created!');
            }
            handleCloseForm();
            fetchSubAgents();
        } catch (error) {
            toast.error(error.response?.data?.error || `Failed to ${editingSubAgent ? 'update' : 'create'} sub-agent`);
        }
    };

    const handleEdit = (subAgent) => {
        setEditingSubAgent(subAgent);
        setValue('first_name', subAgent.first_name);
        setValue('last_name', subAgent.last_name);
        setValue('email', subAgent.email);
        setValue('password', ''); // Don't pre-populate password
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingSubAgent(null);
        reset();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this sub-agent?')) return;

        try {
            await agentApi.deleteSubAgent(id);
            toast.success('Sub-agent removed');
            fetchSubAgents();
        } catch (error) {
            toast.error('Failed to remove sub-agent');
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'full_name',
            header: 'Agent',
            cell: ({ row }) => {
                const agent = row.original;
                return (
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-700 dark:text-primary-400 font-bold text-xs">
                                {agent.first_name?.[0]?.toUpperCase()}
                            </span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {agent.first_name} {agent.last_name}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ getValue }) => (
                <span className="text-gray-500 dark:text-gray-400 text-sm">{getValue()}</span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Joined Date',
            cell: ({ getValue }) => (
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {getValue() ? (
                        (() => {
                            const d = new Date(getValue());
                            return !isNaN(d.getTime()) ? format(d, 'MMM dd, yyyy', { locale: enUS }) : '-';
                        })()
                    ) : '-'}
                </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => handleEdit(row.original)}
                        className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                        title="Edit"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.original.id)}
                        className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-lg transition-all duration-200"
                        title="Delete"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ], []);

    const filteredSubAgents = useMemo(() => {
        let data = subAgents;

        if (isDateFiltered && dateRange[0].startDate && dateRange[0].endDate) {
            data = data.filter(agent => {
                if (!agent.created_at) return false;
                try {
                    const date = new Date(agent.created_at);
                    return isWithinInterval(date, {
                        start: startOfDay(dateRange[0].startDate),
                        end: endOfDay(dateRange[0].endDate)
                    });
                } catch (e) {
                    return false;
                }
            });
        }
        return data;
    }, [subAgents, isDateFiltered, dateRange]);

    const table = useReactTable({
        data: filteredSubAgents,
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
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm">
                            <UsersIcon className="w-5 h-5 text-white" />
                        </div>
                        Sub-Agents
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {subAgents.length} active team member{subAgents.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Stats Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-[3px] border border-primary-100 dark:border-primary-900/30 bg-primary-50/50 dark:bg-primary-900/10 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.1em]">Total Agents</span>
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{subAgents.length}</div>
                </div>
            </div>

            {/* Toolbar - Exact Reference Design with Date Filter */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto flex-1">
                    {/* Page Size */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 font-medium">Show</span>
                        <div className="w-20">
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
                                        borderRadius: '3px',
                                        height: '34px',
                                        minHeight: '34px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textAlign: 'center'
                                    })
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Center: Date Filter */}
                <div className="relative flex items-center gap-2 justify-center" ref={datePickerRef}>
                    <div className="w-full sm:w-56">
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
                                    borderRadius: '3px',
                                    height: '34px',
                                    minHeight: '34px',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                })
                            }}
                            formatOptionLabel={(option) => {
                                if (option.value === 'custom' && datePreset === 'custom' && dateRange?.[0]?.startDate && dateRange?.[0]?.endDate) {
                                    try {
                                        const start = dateRange[0].startDate instanceof Date ? dateRange[0].startDate : new Date(dateRange[0].startDate);
                                        const end = dateRange[0].endDate instanceof Date ? dateRange[0].endDate : new Date(dateRange[0].endDate);
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
                    </div>

                    <button
                        onClick={() => handleDatePresetChange('all')}
                        className={`p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-[3px] transition-colors ${!isDateFiltered ? 'invisible' : ''}`}
                        title="Reset Filters"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                    </button>

                    {/* Custom Date Picker Popup - Smooth Version */}
                    {showDatePicker && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[100] bg-white dark:bg-dashboard-card rounded-[3px] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden w-[350px]">
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
                                            styles={{ control: (base) => ({ ...base, minHeight: '30px', height: '30px', fontSize: '12px', borderRadius: '3px' }) }}
                                        />
                                    </div>
                                    <div className="w-24">
                                        <StyledSelect
                                            value={getYear(shownDate instanceof Date && !isNaN(shownDate.getTime()) ? shownDate : new Date())}
                                            onChange={(val) => setShownDate(setYear(shownDate || new Date(), val))}
                                            options={Array.from({ length: 10 }, (_, i) => { const y = new Date().getFullYear() - 5 + i; return { value: y, label: y.toString() }; })}
                                            isSearchable={false}
                                            styles={{ control: (base) => ({ ...base, minHeight: '30px', height: '30px', fontSize: '12px', borderRadius: '3px' }) }}
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
                                    setDateRange([item.selection]);
                                    setIsDateFiltered(true);
                                    setDatePreset('custom');
                                }}
                                moveRangeOnFirstSelection={false}
                                ranges={dateRange && dateRange.length > 0 ? dateRange : [{ startDate: new Date(), endDate: new Date(), key: 'selection' }]}
                                shownDate={shownDate instanceof Date && !isNaN(shownDate.getTime()) ? shownDate : new Date()}
                                showMonthAndYearPickers={false}
                                rangeColors={['#3b82f6']}
                            />
                        </div>
                    )}
                </div>

                {/* Right Actions: Search & Add */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full lg:w-auto flex-1">
                    <div className="relative w-full sm:w-64">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search sub-agents..."
                            className="w-full h-[34px] pl-10 pr-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[3px] text-[12px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white placeholder:text-gray-400"
                        />
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full sm:w-auto px-4 h-[34px] bg-primary-600 hover:bg-primary-700 text-white text-[12px] font-bold rounded-[3px] flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
                    >
                        <UserPlusIcon className="w-4 h-4" />
                        Add Sub-Agent
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white dark:bg-dashboard-card rounded-[3px] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : subAgents.length > 0 ? (
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
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-[3px] hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 outline-none"
                                >
                                    <ChevronDoubleLeftIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-[3px] hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 outline-none"
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
                                        className="w-12 h-8 text-center border border-gray-300 dark:border-gray-600 rounded-[3px] text-xs font-bold bg-white dark:bg-dashboard-card text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">of {table.getPageCount()}</span>
                                </div>

                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-[3px] hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 outline-none"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-[3px] hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 outline-none"
                                >
                                    <ChevronDoubleRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <EmptyState
                        icon={UsersIcon}
                        title="No sub-agents yet"
                        description="Add team members to help manage your listings."
                        action={
                            <button
                                onClick={() => setShowForm(true)}
                                className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap px-4 h-[38px] text-sm shadow-sm"
                            >
                                <UserPlusIcon className="w-5 h-5" />
                                <span>Add Sub-Agent</span>
                            </button>
                        }
                    />
                )}
            </div>

            {/* Modal */}
            {
                showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCloseForm} />
                        <div className="relative bg-white dark:bg-dashboard-card rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
                            <div className="sticky top-0 bg-white dark:bg-dashboard-card border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {editingSubAgent ? 'Edit Sub-Agent' : 'Create Sub-Agent'}
                                </h3>
                                <button onClick={handleCloseForm} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="input-label">First Name *</label>
                                        <input
                                            type="text"
                                            className={`input-field ${errors.first_name ? 'border-red-300' : ''}`}
                                            {...register('first_name', { required: 'Required' })}
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">Last Name *</label>
                                        <input
                                            type="text"
                                            className={`input-field ${errors.last_name ? 'border-red-300' : ''}`}
                                            {...register('last_name', { required: 'Required' })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="input-label">Email *</label>
                                    <input
                                        type="email"
                                        className={`input-field ${errors.email ? 'border-red-300' : ''}`}
                                        {...register('email', { required: 'Required', pattern: /^\S+@\S+$/i })}
                                    />
                                </div>
                                <div>
                                    <label className="input-label">Password {editingSubAgent ? '(optional)' : '*'}</label>
                                    <input
                                        type="password"
                                        className={`input-field ${errors.password ? 'border-red-300' : ''}`}
                                        {...register('password', { required: !editingSubAgent && 'Required', minLength: 8 })}
                                    />
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button type="button" onClick={handleCloseForm} className="btn-secondary">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary px-6">
                                        {editingSubAgent ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default SubAgents;
