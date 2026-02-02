import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { agentApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
    UserPlusIcon,
    TrashIcon,
    UsersIcon,
    MagnifyingGlassIcon,
    PencilIcon
} from '@heroicons/react/24/outline';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getPaginationRowModel,
    getFilteredRowModel,
} from '@tanstack/react-table';
import StyledSelect from '../../components/Form/StyledSelect';
import { format } from 'date-fns';

const SubAgents = () => {
    const [subAgents, setSubAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSubAgent, setEditingSubAgent] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const fetchSubAgents = async () => {
        try {
            const response = await agentApi.getSubAgents();
            setSubAgents(response.data || []);
        } catch (error) {
            console.error('Failed to fetch sub-agents:', error);
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
            toast.error('Failed to remove');
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
                        <span className="font-medium text-gray-900 dark:text-white text-[13px]">
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
                <span className="text-gray-500 dark:text-gray-400 text-[13px]">{getValue()}</span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Joined Date',
            cell: ({ getValue }) => (
                <span className="text-gray-500 dark:text-gray-400 text-[13px]">
                    {getValue() ? format(new Date(getValue()), 'MMM dd, yyyy') : '-'}
                </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={() => handleEdit(row.original)}
                        className="p-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-100 dark:ring-blue-900/30 hover:ring-blue-200 dark:hover:ring-blue-800 rounded-lg transition-all duration-200 flex items-center shadow-sm"
                        title="Edit Sub-Agent"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.original.id)}
                        className="p-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-100 dark:ring-red-900/30 hover:ring-red-200 dark:hover:ring-red-800 rounded-lg transition-all duration-200 flex items-center shadow-sm"
                        title="Remove Sub-Agent"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ], []);

    const [globalFilter, setGlobalFilter] = useState('');

    const table = useReactTable({
        data: subAgents,
        columns,
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sub-Agents</h1>
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dashboard-card rounded-2xl w-full max-w-lg shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {editingSubAgent ? 'Edit Sub-Agent' : 'Create Sub-Agent'}
                            </h2>
                            <button
                                onClick={handleCloseForm}
                                className="text-gray-400 hover:text-gray-500 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
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
                                <label className="input-label">Password *</label>
                                <input
                                    type="password"
                                    className={`input-field ${errors.password ? 'border-red-300' : ''}`}
                                    {...register('password', { required: 'Required', minLength: 8 })}
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
            )}

            {/* Filters Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* LEFT: Page Size */}
                <div className="flex items-center space-x-2 h-[34px] w-full lg:w-auto">
                    <span className="text-[12px] text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Show</span>
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

                {/* RIGHT: Search & Add Button */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative w-full lg:w-64 h-[34px]">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search sub-agents..."
                            className="input-field pl-9 h-[34px] text-[12px] flex items-center"
                        />
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap px-3 h-[34px] text-[12px] shadow-sm"
                    >
                        <UserPlusIcon className="w-4 h-4" />
                        <span>Add Sub-Agent</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-dashboard-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : subAgents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id} className="border-b border-gray-100 dark:border-gray-700">
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id} className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Showing <span className="font-medium">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to <span className="font-medium">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}</span> of <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> results
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => table.setPageIndex(page - 1)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${table.getState().pagination.pageIndex === page - 1
                                                    ? 'bg-primary-600 text-white shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <UsersIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No sub-agents yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">Add team members to help manage your listings.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubAgents;
