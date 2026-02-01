import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
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
} from '@heroicons/react/24/outline';

import { format, startOfDay, endOfDay, isSameDay } from 'date-fns';
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
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const [isDateFiltered, setIsDateFiltered] = useState(true); // Default: Filter by Today
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [sorting, setSorting] = useState([]);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

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

            const agentDate = new Date(agent.created_at || agent.CreatedAt);

            // Invalid date check
            if (isNaN(agentDate.getTime())) return false;

            // Strict Range Comparison
            const { startDate, endDate } = dateRange[0];

            const start = startDate ? startOfDay(new Date(startDate)) : null;
            const end = endDate ? endOfDay(new Date(endDate)) : null;

            // Check boundaries
            const afterStart = start ? agentDate >= start : true;
            const beforeEnd = end ? agentDate <= end : true;

            const matchesDate = afterStart && beforeEnd;

            return matchesStatus && matchesPlan && matchesDate;
        });
    }, [agents, statusFilter, planFilter, dateRange, isDateFiltered]);

    const openModal = (agent = null) => {
        setEditingAgent(agent);
        if (agent) {
            reset({
                name: agent.name,
                email: agent.owner_email,
                subdomain: agent.subdomain,
                domain_type: agent.domain_type || 'subdomain',
                custom_domain: agent.custom_domain,
            });
        } else {
            reset({ name: '', email: '', password: '', subdomain: '', domain_type: 'subdomain', custom_domain: '' });
        }
        setShowModal(true);
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                domain_type: data.domain_type || 'subdomain',
            };

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
                                <span className="font-medium text-gray-900 truncate">{row.original.name}</span>
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
                            <div className="text-sm text-gray-500 truncate">{row.original.owner_email}</div>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'subdomain',
                header: 'Domain',
                cell: ({ row }) => (
                    <div>
                        <div className="text-sm text-gray-900">
                            {row.original.custom_domain || row.original.domain || `${row.original.subdomain}.super.app`}
                        </div>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${row.original.domain_type === 'custom'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
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
                    <span className="text-gray-600">{row.original.listing_count || row.original.ListingCount || 0}</span>
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
                        <span className="text-gray-600 text-sm">
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
                        <div className="flex items-center justify-end space-x-1">
                            <button
                                onClick={() => handleSuspend(agent.id || agent.ID, isActive)}
                                className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                                title={isActive ? 'Suspend' : 'Activate'}
                            >
                                {isActive ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => openModal(agent)}
                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                                title="Edit"
                            >
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleDelete(agent.id || agent.ID)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete"
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
                <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>
                <p className="text-sm text-gray-500 mt-1">
                    {agents.length} total agents
                </p>
            </div>

            {/* Toolbar: Actions & Filters */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">

                {/* LEFT: Add Button & Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <button onClick={() => openModal()} className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap w-full sm:w-auto px-4 h-[38px] text-sm shadow-sm">
                        <PlusIcon className="w-5 h-5" />
                        <span>Add Agent</span>
                    </button>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Status Filter */}
                        <div className="w-full sm:w-36">
                            <StyledSelect
                                options={[
                                    { value: 'all', label: 'All Status' },
                                    { value: 'active', label: 'Active' },
                                    { value: 'suspended', label: 'Suspended' },
                                ]}
                                value={{ value: statusFilter, label: statusFilter === 'all' ? 'All Status' : (statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)) }}
                                onChange={(opt) => setStatusFilter(opt.value)}
                                isSearchable={false}
                                placeholder="Status"
                            />
                        </div>

                        {/* Plan Filter */}
                        <div className="w-full sm:w-36">
                            <StyledSelect
                                options={[
                                    { value: 'all', label: 'All Plans' },
                                    { value: 'starter', label: 'Starter' },
                                    { value: 'professional', label: 'Professional' },
                                    { value: 'enterprise', label: 'Enterprise' },
                                ]}
                                value={{ value: planFilter, label: planFilter === 'all' ? 'All Plans' : (planFilter.charAt(0).toUpperCase() + planFilter.slice(1)) }}
                                onChange={(opt) => setPlanFilter(opt.value)}
                                isSearchable={false}
                                placeholder="Plan"
                            />
                        </div>

                        {/* Date Filters */}
                        <div className="relative flex items-center gap-2">
                            {/* Date Range Button */}
                            <button
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className={`input-field h-[38px] text-sm px-3 flex items-center justify-between gap-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 w-64 ${isDateFiltered ? 'bg-white border-gray-200 text-gray-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="truncate">
                                        {isDateFiltered
                                            ? `${format(dateRange[0].startDate, "MMM dd, yyyy")} - ${format(dateRange[0].endDate, "MMM dd, yyyy")}`
                                            : 'All Time'
                                        }
                                    </span>
                                </div>
                                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                            </button>

                            {/* Reset Button - Only show if not filtering by Today */}
                            {(!isDateFiltered || !isSameDay(dateRange[0].startDate, new Date()) || !isSameDay(dateRange[0].endDate, new Date())) && (
                                <button
                                    onClick={() => {
                                        setDateRange([{
                                            startDate: startOfDay(new Date()),
                                            endDate: new Date(),
                                            key: 'selection'
                                        }]);
                                        setIsDateFiltered(true);
                                    }}
                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                                    title="Reset to Today"
                                >
                                    <ArrowPathIcon className="w-5 h-5" />
                                </button>
                            )}


                            {showDatePicker && (
                                <div className="absolute top-full left-0 mt-2 z-50 shadow-lg rounded-md overflow-hidden border border-gray-100 bg-white">
                                    <DateRange
                                        editableDateInputs={true}
                                        onChange={item => {
                                            setDateRange([item.selection]);
                                            setIsDateFiltered(true);
                                        }}
                                        moveRangeOnFirstSelection={false}
                                        ranges={dateRange}
                                        rangeColors={['#2563eb']} // primary-600
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Search & Page Size */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    {/* Search - Compact */}
                    <div className="relative w-full lg:w-56 h-[38px]">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search..."
                            className="input-field pl-9 h-[38px] text-sm flex items-center"
                        />
                    </div>

                    {/* Page Size - "Show" outside */}
                    <div className="flex items-center space-x-2 h-[38px]">
                        <span className="text-sm text-gray-500 font-medium">Show</span>
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
                                onChange={(opt) => table.setPageSize(opt.value)}
                                isSearchable={false}
                                components={{
                                    DropdownIndicator: () => null,
                                    IndicatorSeparator: () => null
                                }}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        minHeight: '38px',
                                        height: '38px',
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
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : agents.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <th
                                                    key={header.id}
                                                    className="text-left px-6 py-4 text-sm font-medium text-gray-500"
                                                >
                                                    {header.isPlaceholder ? null : (
                                                        <div
                                                            className={`flex items-center space-x-1 ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-900' : ''
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
                                <tbody className="divide-y divide-gray-100">
                                    {table.getRowModel().rows.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="px-6 py-4">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t bg-gray-50">
                            <div className="text-sm text-gray-500">
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
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronDoubleLeftIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>

                                <div className="flex items-center space-x-1">
                                    <span className="text-sm text-gray-600">Page</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={table.getPageCount()}
                                        value={table.getState().pagination.pageIndex + 1}
                                        onChange={(e) => {
                                            const page = e.target.value ? Number(e.target.value) - 1 : 0;
                                            table.setPageIndex(page);
                                        }}
                                        className="w-14 px-2 py-1 text-center border border-gray-300 rounded-lg text-sm"
                                    />
                                    <span className="text-sm text-gray-600">of {table.getPageCount()}</span>
                                </div>

                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronDoubleRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-12 text-center">
                        <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
                        <p className="text-gray-500 mb-4">Get started by creating your first agent.</p>
                        <button onClick={() => openModal()} className="btn-primary">
                            Add First Agent
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-scale-in">
                        <h2 className="text-xl font-bold mb-6">
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

                            {/* Domain Type Selection */}
                            <div>
                                <label className="input-label">Domain Type *</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${!editingAgent?.domain_type || editingAgent?.domain_type === 'subdomain'
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                        <input
                                            type="radio"
                                            value="subdomain"
                                            defaultChecked
                                            {...register('domain_type')}
                                            className="sr-only"
                                        />
                                        <span className="text-2xl mb-2">🌐</span>
                                        <span className="font-medium text-sm">Subdomain</span>
                                        <span className="text-xs text-gray-500 mt-1">Free Plan</span>
                                    </label>
                                    <label className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${editingAgent?.domain_type === 'custom'
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                        <input
                                            type="radio"
                                            value="custom"
                                            {...register('domain_type')}
                                            className="sr-only"
                                        />
                                        <span className="text-2xl mb-2">🔗</span>
                                        <span className="font-medium text-sm">Custom Domain</span>
                                        <span className="text-xs text-gray-500 mt-1">Premium Plan</span>
                                    </label>
                                </div>
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
                                    <span className="inline-flex items-center px-4 bg-gray-100 border border-l-0 rounded-r-xl text-gray-500 text-sm">
                                        .super.app
                                    </span>
                                </div>
                                {errors.subdomain && <p className="text-sm text-red-500 mt-1">{errors.subdomain.message}</p>}
                            </div>

                            <div>
                                <label className="input-label">Custom Domain (for Premium)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="www.yourcompany.com"
                                    {...register('custom_domain')}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Required if selecting Custom Domain type
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
            )}
        </div>
    );
};

export default AgentManagement;
