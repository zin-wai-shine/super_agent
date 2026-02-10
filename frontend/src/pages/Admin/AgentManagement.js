import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import StyledSelect from '../../components/Form/StyledSelect';
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
    MagnifyingGlassIcon,
    PauseIcon,
    PlayIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    FunnelIcon,
    LinkIcon,
    UserGroupIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    ClipboardDocumentIcon,
    ArrowPathIcon,
    InboxIcon
} from '@heroicons/react/24/outline';
import EmptyState from '../../components/Common/EmptyState';

import { format, startOfDay, endOfDay, isSameDay, setMonth, setYear, getMonth, getYear, addMonths, subMonths, subDays, startOfMonth, isWithinInterval } from 'date-fns';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const AgentManagement = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAgent, setEditingAgent] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('');

    // New Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [planFilter, setPlanFilter] = useState('all');
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
    const [sorting, setSorting] = useState([]);
    const [plans, setPlans] = useState([]);
    const datePickerRef = useRef(null);

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

    const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm();

    const fetchAgents = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getAgents({});
            const agentData = Array.isArray(response.data) ? response.data : (response.data.agents || []);
            setAgents(agentData);
        } catch (error) {
            console.error('Failed to fetch agents:', error);
            toast.error('Failed to fetch agents');
            setAgents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchPlans = async () => {
        try {
            const r = await adminApi.getPlans();
            setPlans(Array.isArray(r.data) ? r.data : []);
        } catch (_) {
            setPlans([]);
        }
    };
    useEffect(() => {
        if (showModal) fetchPlans();
    }, [showModal]);

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
    const filteredAgents = useMemo(() => {
        return agents.filter(agent => {
            // Status Filter
            // Normalize status to explicit boolean
            const isSuspended = agent.is_suspended === true || agent.is_suspended === 1 || agent.is_active === false || agent.IsActive === false;
            const matchesStatus = statusFilter === 'all'
                ? true
                : statusFilter === 'active' ? !isSuspended : isSuspended;

            // Plan Filter
            const planName = agent.subscription?.plan_name || agent.Subscription?.PlanName || '';
            const matchesPlan = planFilter === 'all'
                ? true
                : planName.toLowerCase().includes(planFilter.toLowerCase());

            // Date Range Filter
            if (!isDateFiltered) return matchesStatus && matchesPlan;

            const dateValue = agent.created_at || agent.CreatedAt || agent.createdAt;
            if (!dateValue) return false;

            const agentDate = new Date(dateValue);
            if (isNaN(agentDate.getTime())) return false;

            const { startDate, endDate } = dateRange[0];

            const matchesDate = isWithinInterval(agentDate, {
                start: startOfDay(new Date(startDate)),
                end: endOfDay(new Date(endDate))
            });

            return matchesStatus && matchesPlan && matchesDate;
        });
    }, [agents, statusFilter, planFilter, dateRange, isDateFiltered]);

    const openModal = (agent = null) => {
        setEditingAgent(agent);
        if (agent) {
            const subId = agent.subscription_id || agent.subscription?.id || '';
            reset({
                name: agent.name,
                email: agent.owner_email,
                subdomain: agent.subdomain,
                domain_type: agent.domain_type || 'subdomain',
                custom_domain: agent.custom_domain || '',
                subscription_id: subId,
            });
        } else {
            reset({ name: '', email: '', password: '', subdomain: '', domain_type: 'subdomain', custom_domain: '', subscription_id: '' });
        }
        setShowModal(true);
    };

    const onSubmit = async (data) => {
        try {
            const subscriptionId = (data.subscription_id?.value ?? data.subscription_id ?? '').toString().trim();
            const payload = {
                ...data,
                domain_type: data.domain_type || 'subdomain',
                subscription_id: subscriptionId || undefined,
            };
            if (!payload.subscription_id) delete payload.subscription_id;

            if (editingAgent) {
                await adminApi.updateAgent(editingAgent.id, payload);
                toast.success('Agent updated!');
            } else {
                await adminApi.createAgent(payload);
                toast.success('Agent created!');
            }
            setShowModal(false);
            fetchAgents();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleSuspend = async (id, isActive) => {
        try {
            if (isActive) {
                await adminApi.suspendAgent(id);
                toast.success('Agent suspended');
            } else {
                await adminApi.reactivateAgent(id);
                toast.success('Agent reactivated');
            }
            fetchAgents();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this agent? This cannot be undone.')) return;
        try {
            await adminApi.deleteAgent(id);
            toast.success('Agent deleted');
            fetchAgents();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };


    // Define table columns
    const columns = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'Agent',
                cell: ({ row }) => (
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-700 font-bold">{row.original.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900 dark:text-white truncate">{row.original.name}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(row.original.id);
                                        toast.success('Agent ID copied!');
                                    }}
                                    className="text-gray-400 hover:text-primary-600 transition-colors"
                                    title="Copy Agent ID"
                                >
                                    <ClipboardDocumentIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{row.original.owner_email}</div>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'subdomain',
                header: 'Domain',
                cell: ({ row }) => (
                    <div>
                        <div className="text-sm text-gray-900 dark:text-white">
                            {row.original.custom_domain || row.original.domain || `${row.original.subdomain}.super.app`}
                        </div>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${row.original.domain_type === 'custom'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                            {row.original.domain_type === 'custom' ? '🔗 Custom' : '🌐 Subdomain'}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'subscription',
                header: 'Plan',
                cell: ({ row }) => (
                    <span className="badge badge-info">
                        {row.original.subscription?.plan_name || row.original.Subscription?.PlanName || 'Free'}
                    </span>
                ),
            },
            {
                accessorKey: 'listing_count',
                header: 'Listings',
                cell: ({ row }) => (
                    <span className="text-gray-600 dark:text-gray-300">{row.original.listing_count || row.original.ListingCount || 0}</span>
                ),
            },
            {
                accessorKey: 'is_active',
                header: 'Status',
                cell: ({ row }) => {
                    const isActive = row.original.is_active ?? row.original.IsActive ?? true;
                    return (
                        <span className={`badge ${isActive ? 'badge-success' : 'badge-error'}`}>
                            {isActive ? 'Active' : 'Suspended'}
                        </span>
                    );
                },
            },
            {
                accessorKey: 'created_at',
                header: 'Created At',
                cell: ({ row }) => {
                    const date = row.original.created_at || row.original.CreatedAt;
                    return (
                        <span className="text-gray-600 dark:text-gray-300 text-sm">
                            {date ? format(new Date(date), 'MMM dd, yyyy') : '-'}
                        </span>
                    );
                },
            },
            {
                id: 'actions',
                header: () => <div className="text-right">Actions</div>,
                cell: ({ row }) => {
                    const agent = row.original;
                    const isActive = agent.is_active ?? agent.IsActive ?? true;
                    return (
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => handleSuspend(agent.id || agent.ID, isActive)}
                                className={`p-1.5 rounded-lg transition-all duration-200 ${isActive
                                    ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20'
                                    : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'
                                    }`}
                                title={isActive ? 'Suspend Agent' : 'Reactivate Agent'}
                            >
                                {isActive ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => openModal(agent)}
                                className="p-1.5 text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-400 dark:hover:bg-primary-500/20 rounded-lg transition-all duration-200"
                                title="Edit Agent"
                            >
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleDelete(agent.id || agent.ID)}
                                className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-lg transition-all duration-200"
                                title="Delete Agent"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    );
                },
            },
        ],
        []
    );

    // Create table instance
    const table = useReactTable({
        data: filteredAgents,
        columns,
        state: {
            globalFilter,
            sorting,
        },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Management</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {agents.length} total agents
                </p>
            </div>

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

                {/* CENTER: Core Filters (Status, Plan, Date) */}
                <div className="flex flex-wrap items-center lg:justify-center gap-3 flex-1 w-full">
                    {/* Status Filter */}
                    <div className="w-full sm:w-32">
                        <StyledSelect
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'active', label: 'Active' },
                                { value: 'suspended', label: 'Suspended' },
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

                    {/* Plan Filter */}
                    <div className="w-full sm:w-32">
                        <StyledSelect
                            options={[
                                { value: 'all', label: 'All Plans' },
                                { value: 'starter', label: 'Starter' },
                                { value: 'professional', label: 'Professional' },
                                { value: 'enterprise', label: 'Enterprise' },
                            ]}
                            value={{ value: planFilter, label: planFilter === 'all' ? 'All Plans' : (planFilter.charAt(0).toUpperCase() + planFilter.slice(1)) }}
                            onChange={(val) => setPlanFilter(val)}
                            isSearchable={false}
                            placeholder="Plan"
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
                                        fontSize: '13px'
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

                {/* RIGHT: Search & Add Button */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    {/* Search - Compact */}
                    <div className="relative w-full lg:w-56 h-[34px]">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search..."
                            className="input-field pl-9 h-[34px] text-[12px] flex items-center"
                        />
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap px-3 h-[34px] text-[12px] shadow-sm"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Add Agent</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-dashboard-card rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : agents.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <th
                                                    key={header.id}
                                                    className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400"
                                                >
                                                    {header.isPlaceholder ? null : (
                                                        <div
                                                            className={`flex items-center space-x-1 ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-900 dark:hover:text-white' : ''
                                                                }`}
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
                                    title="No results found"
                                    description="We couldn't find any agents matching your current filters. Try adjusting your search or filters."
                                    action={
                                        <button
                                            onClick={() => {
                                                setGlobalFilter('');
                                                setStatusFilter('all');
                                                setPlanFilter('all');
                                                setIsDateFiltered(true);
                                                setDateRange([{
                                                    startDate: startOfDay(new Date()),
                                                    endDate: endOfDay(new Date()),
                                                    key: 'selection'
                                                }]);
                                            }}
                                            className="btn-secondary text-sm"
                                        >
                                            Clear All Filters
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
                        title="No agents found"
                        description="Your agent list is currently empty. Start by adding your first agent to the platform."
                        action={
                            <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                                <PlusIcon className="w-5 h-5" />
                                Add First Agent
                            </button>
                        }
                    />
                )}
            </div>

            {/* Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-dashboard-card border dark:border-gray-700 rounded-2xl w-full max-w-lg p-6 animate-scale-in">
                            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                                {editingAgent ? 'Edit Agent' : 'Create Agent'}
                            </h2>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <label className="input-label">Company Name *</label>
                                    <input
                                        type="text"
                                        className={`input-field ${errors.name ? 'border-red-300' : ''}`}
                                        {...register('name', { required: 'Company name is required' })}
                                    />
                                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                                </div>
                                <div>
                                    <label className="input-label">Owner Email *</label>
                                    <input
                                        type="email"
                                        className={`input-field ${errors.email ? 'border-red-300' : ''}`}
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                                        })}
                                    />
                                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                                </div>

                                {!editingAgent && (
                                    <div>
                                        <label className="input-label">Password *</label>
                                        <input
                                            type="password"
                                            className={`input-field ${errors.password ? 'border-red-300' : ''}`}
                                            {...register('password', {
                                                required: 'Password is required',
                                                minLength: { value: 8, message: 'Password must be at least 8 characters' }
                                            })}
                                        />
                                        {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
                                    </div>
                                )}

                                {/* Domain Type — plan is auto-assigned by backend; no plan selection required */}
                                <div>
                                    <label className="input-label">Domain Type *</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className={`relative flex flex-col items-center p-4 border-2 rounded-[3px] cursor-pointer transition-all ${(watch('domain_type') || editingAgent?.domain_type || 'subdomain') === 'subdomain'
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}>
                                            <input
                                                type="radio"
                                                value="subdomain"
                                                {...register('domain_type')}
                                                className="sr-only"
                                            />
                                            <span className="text-2xl mb-2">🌐</span>
                                            <span className="font-medium text-sm text-gray-900 dark:text-white">Subdomain</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">e.g. agent.super.app</span>
                                        </label>
                                        <label className={`relative flex flex-col items-center p-4 border-2 rounded-[3px] cursor-pointer transition-all ${(watch('domain_type') || editingAgent?.domain_type) === 'custom'
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}>
                                            <input
                                                type="radio"
                                                value="custom"
                                                {...register('domain_type')}
                                                className="sr-only"
                                            />
                                            <span className="text-2xl mb-2">🔗</span>
                                            <span className="font-medium text-sm text-gray-900 dark:text-white">Custom Domain</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">e.g. www.yourcompany.com</span>
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Optionally pick a plan below, or leave &quot;Auto&quot; to assign by domain type.</p>
                                </div>

                                <div>
                                    <label className="input-label">Plan</label>
                                    <Controller
                                        name="subscription_id"
                                        control={control}
                                        defaultValue=""
                                        render={({ field }) => {
                                            const planOptions = [
                                                { value: '', label: 'Auto (by domain type)' },
                                                ...(plans || []).map((p) => ({
                                                    value: (p.id != null && typeof p.id === 'string') ? p.id : String(p.id || ''),
                                                    label: `${p.plan_name || 'Plan'} • ${p.domain_type || 'subdomain'} • ฿${p.price != null ? Number(p.price) : 0}/mo`,
                                                })),
                                            ];
                                            const v = (field.value?.value ?? field.value ?? '').toString();
                                            const selected = planOptions.find((o) => o.value === v) || planOptions[0];
                                            return (
                                                <StyledSelect
                                                    options={planOptions}
                                                    value={selected}
                                                    onChange={(sel) => field.onChange(sel?.value ?? sel ?? '')}
                                                    placeholder="Select plan"
                                                />
                                            );
                                        }}
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Use a plan you created in Subscription Plans. &quot;Auto&quot; picks the first matching plan for the chosen domain type.</p>
                                </div>

                                <div>
                                    <label className="input-label">Subdomain *</label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            className={`input-field rounded-r-none ${errors.subdomain ? 'border-red-300' : ''}`}
                                            placeholder="company"
                                            {...register('subdomain', { required: 'Subdomain is required' })}
                                        />
                                        <span className="inline-flex items-center px-4 bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-200 dark:border-gray-600 rounded-r-[3px] text-gray-500 dark:text-gray-400 text-sm">
                                            .super.app
                                        </span>
                                    </div>
                                    {errors.subdomain && <p className="text-sm text-red-500 mt-1">{errors.subdomain.message}</p>}
                                </div>

                                <div>
                                    <label className="input-label">Custom Domain</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="www.yourcompany.com"
                                        {...register('custom_domain')}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Required only if you chose Custom Domain above; otherwise leave blank.
                                    </p>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        {editingAgent ? 'Update' : 'Create'}
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

export default AgentManagement;
