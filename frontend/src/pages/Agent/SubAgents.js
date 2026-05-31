import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

import { useForm } from 'react-hook-form';
import { agentApi } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { hasActionPermission } from '../../utils/permissions';
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
    ArrowPathIcon,
    PlusIcon
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
import ConfirmModal from '../../components/ui/ConfirmModal';

const defaultPermissions = {
    paths: {
        '/dashboard': true,
        '/dashboard/listings': true,
        '/dashboard/facilities': true,
        '/dashboard/developers': true,
        '/dashboard/projects': true,
        '/dashboard/collections': true,
        '/dashboard/appointments': true,
        '/dashboard/users': true,
        '/dashboard/theme': true,
        '/dashboard/notifications': true,
        '/dashboard/banners': true,
        '/dashboard/settings': true,
    },
    actions: {
        'listings:create': true,
        'listings:update': true,
        'listings:delete': true,
        'listings:booking': true,
        'listings:collection': true,
        'listings:repost': true,
        'listings:status': true,
        'listings:views': true,
        'facilities:update': true,
        'facilities:delete': true,
        'developers:create': true,
        'developers:update': true,
        'developers:delete': true,
        'projects:create': true,
        'projects:update': true,
        'projects:delete': true,
        'collections:create': true,
        'collections:update': true,
        'collections:delete': true,
        'appointments:update': true,
        'appointments:delete': true,
        'users:update': true,
        'users:delete': true,
        'theme:update': true,
        'banners:create': true,
        'banners:update': true,
        'banners:delete': true,
        'notifications:create': true,
        'settings:update': true,
    }
};

const MODULES_CONFIG = [
    {
        name: 'Dashboard',
        path: '/dashboard',
        description: 'Access the main performance dashboard and stats',
        actions: []
    },
    {
        name: 'Listings',
        path: '/dashboard/listings',
        description: 'View listing directories and details',
        actions: [
            { key: 'listings:create', name: 'Create' },
            { key: 'listings:update', name: 'Edit' },
            { key: 'listings:delete', name: 'Delete' },
            { key: 'listings:booking', name: 'Book Viewing' },
            { key: 'listings:collection', name: 'Collection' },
            { key: 'listings:repost', name: 'Repost' },
            { key: 'listings:status', name: 'Status' },
            { key: 'listings:views', name: 'Views' }
        ]
    },
    {
        name: 'Facility Images',
        path: '/dashboard/facilities',
        description: 'Manage building and shared facility photos',
        actions: [
            { key: 'facilities:update', name: 'Upload/Edit' },
            { key: 'facilities:delete', name: 'Delete' }
        ]
    },
    {
        name: 'Developers',
        path: '/dashboard/developers',
        description: 'Manage builder and property developer names',
        actions: [
            { key: 'developers:create', name: 'Create' },
            { key: 'developers:update', name: 'Edit' },
            { key: 'developers:delete', name: 'Delete' }
        ]
    },
    {
        name: 'Projects',
        path: '/dashboard/projects',
        description: 'Manage residential and commercial property projects',
        actions: [
            { key: 'projects:create', name: 'Create' },
            { key: 'projects:update', name: 'Edit' },
            { key: 'projects:delete', name: 'Delete' }
        ]
    },
    {
        name: 'Collections',
        path: '/dashboard/collections',
        description: 'Group property listings into public collections',
        actions: [
            { key: 'collections:create', name: 'Create' },
            { key: 'collections:update', name: 'Edit' },
            { key: 'collections:delete', name: 'Delete' }
        ]
    },
    {
        name: 'Appointments',
        path: '/dashboard/appointments',
        description: 'View and manage viewing appointments',
        actions: [
            { key: 'appointments:update', name: 'Status Update' },
            { key: 'appointments:delete', name: 'Delete' }
        ]
    },
    {
        name: 'Users',
        path: '/dashboard/users',
        description: 'View registered clients and public users',
        actions: [
            { key: 'users:update', name: 'Activate/Suspend' },
            { key: 'users:delete', name: 'Delete' }
        ]
    },
    {
        name: 'Theme Settings',
        path: '/dashboard/theme',
        description: 'Customize layout, theme colors, and CSS',
        actions: [
            { key: 'theme:update', name: 'Save Theme' }
        ]
    },
    {
        name: 'Notifications',
        path: '/dashboard/notifications',
        description: 'View inbox and dispatch custom notifications',
        actions: [
            { key: 'notifications:create', name: 'Send' }
        ]
    },
    {
        name: 'Banners',
        path: '/dashboard/banners',
        description: 'Manage homepage slides and advertising banners',
        actions: [
            { key: 'banners:create', name: 'Create' },
            { key: 'banners:update', name: 'Edit' },
            { key: 'banners:delete', name: 'Delete' }
        ]
    },
    {
        name: 'Settings',
        path: '/dashboard/settings',
        description: 'Modify price limits and social contact links',
        actions: [
            { key: 'settings:update', name: 'Save Settings' }
        ]
    }
];

const SubAgents = () => {
    const { user } = useAuth();
    const canCreate = hasActionPermission(user, 'settings:update');
    const canUpdate = hasActionPermission(user, 'settings:update');
    const canDelete = hasActionPermission(user, 'settings:update');
    const [subAgents, setSubAgents] = useState([]);
    const [permissions, setPermissions] = useState(defaultPermissions);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSubAgent, setEditingSubAgent] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [subAgentToDelete, setSubAgentToDelete] = useState(null);
    const [globalFilter, setGlobalFilter] = useSessionState('subagents_globalFilter', '');
    const [sorting, setSorting] = useSessionState('subagents_sorting', []);
    const [pagination, setPagination] = useSessionState('subagents_pagination', {
        pageIndex: 0,
        pageSize: 10,
    });

    // Use scroll restoration
    useScrollRestoration('SubAgents', !loading && subAgents.length > 0);

    // Date Filter State
    const [dateRange, setDateRange] = useSessionState('subagents_dateRange', [
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

    const [datePreset, setDatePreset] = useSessionState('subagents_datePreset', 'all');
    const [isDateFiltered, setIsDateFiltered] = useSessionState('subagents_isDateFiltered', false);
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
            const payload = {
                ...data,
                permissions: JSON.stringify(permissions)
            };
            if (editingSubAgent) {
                await agentApi.updateSubAgent(editingSubAgent.id, payload);
                toast.success('Sub-agent updated!');
            } else {
                await agentApi.createSubAgent(payload);
                toast.success('Sub-agent created!');
            }
            handleCloseForm();
            fetchSubAgents();
        } catch (error) {
            toast.error(error.response?.data?.error || `Failed to ${editingSubAgent ? 'update' : 'create'} sub-agent`);
        }
    };

    const handleOpenForm = () => {
        setPermissions(defaultPermissions);
        setShowForm(true);
    };

    const handleEdit = (subAgent) => {
        setEditingSubAgent(subAgent);
        setValue('first_name', subAgent.first_name);
        setValue('last_name', subAgent.last_name);
        setValue('email', subAgent.email);
        setValue('password', ''); // Don't pre-populate password
        
        if (subAgent.permissions) {
            try {
                const parsed = typeof subAgent.permissions === 'string' ? JSON.parse(subAgent.permissions) : subAgent.permissions;
                setPermissions({
                    paths: { ...defaultPermissions.paths, ...parsed?.paths },
                    actions: { ...defaultPermissions.actions, ...parsed?.actions }
                });
            } catch (e) {
                setPermissions(defaultPermissions);
            }
        } else {
            setPermissions(defaultPermissions);
        }
        
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingSubAgent(null);
        setPermissions(defaultPermissions);
        reset();
    };

    const handlePathToggle = (path, checked) => {
        setPermissions(prev => {
            const nextPaths = { ...prev.paths, [path]: checked };
            const nextActions = { ...prev.actions };

            const config = MODULES_CONFIG.find(m => m.path === path);
            if (config) {
                config.actions.forEach(act => {
                    nextActions[act.key] = checked;
                });
            }

            return { paths: nextPaths, actions: nextActions };
        });
    };

    const handleActionToggle = (actionKey, checked) => {
        setPermissions(prev => ({
            ...prev,
            actions: { ...prev.actions, [actionKey]: checked }
        }));
    };

    const handleDelete = (id) => {
        setSubAgentToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!subAgentToDelete) return;
        try {
            await agentApi.deleteSubAgent(subAgentToDelete);
            toast.success('Sub-agent removed');
            fetchSubAgents();
        } catch (error) {
            toast.error('Failed to remove sub-agent');
        } finally {
            setDeleteConfirmOpen(false);
            setSubAgentToDelete(null);
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
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-600/10 rounded-full flex items-center justify-center flex-shrink-0">
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
                    {canUpdate && (
                    <button
                        onClick={() => handleEdit(row.original)}
                        className="p-2.5 text-blue-600 bg-blue-100/40 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 border border-blue-600/20 dark:border-blue-500/20 backdrop-blur-sm rounded-admin transition-all duration-200 shadow-sm flex items-center justify-center"
                        title="Edit"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    )}
                    {canDelete && (
                    <button
                        onClick={() => handleDelete(row.original.id)}
                        className="p-2.5 text-red-600 bg-red-100/40 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border border-red-600/20 dark:border-red-500/20 backdrop-blur-sm rounded-admin transition-all duration-200 shadow-sm flex items-center justify-center"
                        title="Delete"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                    )}
                </div>
            ),
        },
    ], [canUpdate, canDelete]);

    const filteredSubAgents = useMemo(() => {
        let data = subAgents;

        if (isDateFiltered && parsedDateRange[0].startDate && parsedDateRange[0].endDate) {
            data = data.filter(agent => {
                if (!agent.created_at) return false;
                try {
                    const date = new Date(agent.created_at);
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
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 pb-2">
                <div className="lg:min-w-[280px]">
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-[color-mix(in_srgb,var(--primary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--primary-color),transparent_90%)] rounded-admin flex items-center justify-center shadow-sm border border-[color-mix(in_srgb,var(--primary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--primary-color),transparent_80%)]">
                            <UsersIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        Sub-Agents
                    </h1>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 flex-1">
                    <div className="flex items-center space-x-3 transition-all hover:translate-y-[-2px] duration-300">

                    </div>
                </div>

                <div className="hidden lg:block lg:min-w-[280px]"></div>
            </div>



            {/* Toolbar - Exact Reference Design with Date Filter */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
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
                    </div>

                    <button
                        onClick={() => handleDatePresetChange('all')}
                        className={`p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-admin transition-colors ${!isDateFiltered ? 'invisible' : ''}`}
                        title="Reset Filters"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                    </button>

                    {/* Custom Date Picker Popup - Smooth Version */}
                    {showDatePicker && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[100] bg-white dark:bg-dashboard-card rounded-admin shadow-xl border-admin overflow-hidden w-[350px]">
                            <div className="flex items-center justify-between p-3 border-b border-admin">
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
                                            styles={{ control: (base) => ({ ...base, minHeight: '30px', height: '30px' }) }}
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

                {/* Right Actions: Search & Add */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full lg:w-auto flex-1">
                    <div className="relative w-full lg:w-64">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                        <input
                            type="text"
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search sub-agents..."
                            className="input-field pl-10 pr-4 h-[34px] min-h-0 text-[11px]"
                        />
                    </div>
                    {canCreate && (
                    <button
                        onClick={() => handleOpenForm()}
                        className="btn-primary w-full sm:w-auto px-4 h-[34px] text-[12px] flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Sub Agent
                    </button>
                    )}
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white dark:bg-dashboard-card rounded-admin border-admin overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : subAgents.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse divide-y divide-gray-100 dark:divide-gray-700">
                                <thead className="bg-[#F9FAFB] dark:bg-gray-800/50">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th
                                                    key={header.id}
                                                    className="px-6 py-3 text-[11px] font-bold text-[#6B7280] dark:text-gray-400 tracking-wider whitespace-nowrap"
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
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing <span className="font-bold text-gray-900 dark:text-white">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{table.getFilteredRowModel().rows.length}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 border-admin rounded-admin hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 outline-none"
                                >
                                    <ChevronDoubleLeftIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 border-admin rounded-admin hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 outline-none"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>

                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold tracking-wider">Page</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={table.getPageCount()}
                                        value={table.getState().pagination.pageIndex + 1}
                                        onChange={(e) => {
                                            const page = e.target.value ? Number(e.target.value) - 1 : 0;
                                            table.setPageIndex(page);
                                        }}
                                        className="w-12 h-9 border-admin rounded-admin bg-white dark:bg-dashboard-input text-center text-[13px] font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all no-spinner"
                                    />
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold tracking-wider">of {table.getPageCount()}</span>
                                </div>

                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border-admin rounded-admin hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 outline-none"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border-admin rounded-admin hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 outline-none"
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
                        action={canCreate ? (
                            <button
                                onClick={() => setShowForm(true)}
                                className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap px-4 h-[38px] text-sm shadow-sm"
                            >
                                <UserPlusIcon className="w-5 h-5" />
                                <span>Add Sub-Agent</span>
                            </button>
                        ) : null}
                    />
                )}
            </div>

            {/* Modal */}
            {
                showForm && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCloseForm} />


                        <div className="relative bg-white dark:bg-dashboard-card rounded-admin shadow-2xl border-admin max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
                            <div className="flex-none bg-white dark:bg-dashboard-card border-b border-admin px-8 py-3 flex items-center justify-between z-10 sticky top-0">
                                <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
                                    {editingSubAgent ? 'Edit Sub-Agent' : 'Create Sub-Agent'}
                                </h3>
                                <button onClick={handleCloseForm} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">

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

                                <div className="border-t border-gray-150 dark:border-gray-800 pt-5 mt-5">
                                    <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mb-1 uppercase tracking-wider text-xs">
                                        Permissions Management
                                    </h4>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4">
                                        Configure which sections and specific buttons this sub-agent can access.
                                    </p>
                                    <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                        {MODULES_CONFIG.map(mod => {
                                            const hasPath = permissions.paths[mod.path];
                                            return (
                                                <div 
                                                    key={mod.path} 
                                                    className={`border rounded-xl p-4 transition-all duration-300 ${
                                                        hasPath 
                                                            ? 'border-primary-500/30 bg-primary-50/10 dark:bg-primary-950/5' 
                                                            : 'border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/10'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 pr-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-gray-900 dark:text-white text-xs">
                                                                    {mod.name}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                                                                {mod.description}
                                                            </p>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!hasPath}
                                                                onChange={(e) => handlePathToggle(mod.path, e.target.checked)}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                                        </label>
                                                    </div>

                                                    {hasPath && mod.actions.length > 0 && (
                                                        <div className="mt-3.5 pt-3.5 border-t border-dashed border-gray-200 dark:border-gray-800">
                                                            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">
                                                                Allowed Actions / Buttons
                                                            </span>
                                                            <div className="flex flex-wrap gap-x-5 gap-y-2">
                                                                {mod.actions.map(act => (
                                                                    <label 
                                                                        key={act.key} 
                                                                        className="flex items-center space-x-2 cursor-pointer select-none text-[11px] font-medium text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!permissions.actions[act.key]}
                                                                            onChange={(e) => handleActionToggle(act.key, e.target.checked)}
                                                                            className="w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
                                                                        />
                                                                        <span>{act.name}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </form>
                            <div className="flex-none p-6 border-t border-admin bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-end gap-3">
                                <button type="button" onClick={handleCloseForm} className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" onClick={handleSubmit(onSubmit)} className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-admin shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98]">
                                    {editingSubAgent ? 'Update' : 'Create'}
                                </button>
                            </div>

                        </div>
                    </div>,
                    document.body
                )
            }

            <ConfirmModal
                isOpen={deleteConfirmOpen}
                onClose={() => {
                    setDeleteConfirmOpen(false);
                    setSubAgentToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Remove Sub-Agent"
                message="Are you sure you want to remove this sub-agent? They will no longer have access to the agent dashboard."
                confirmText="Remove"
                cancelText="Cancel"
                isDestructive={true}
            />
        </div >
    );
};

export default SubAgents;
