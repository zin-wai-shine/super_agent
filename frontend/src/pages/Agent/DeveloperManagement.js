import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hasActionPermission } from '../../utils/permissions';
import { developerApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
    BuildingOffice2Icon,
    PlusIcon,
    TrashIcon,
    PencilIcon,
    PencilSquareIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
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
import EmptyState from '../../components/Common/EmptyState';
import { useSessionState, useScrollRestoration } from '../../hooks/usePersistentState';
import ConfirmModal from '../../components/ui/ConfirmModal';

const DeveloperManagement = () => {
    const { user } = useAuth();
    const canCreate = hasActionPermission(user, 'developers:create');
    const canUpdate = hasActionPermission(user, 'developers:update');
    const canDelete = hasActionPermission(user, 'developers:delete');
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingDev, setEditingDev] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [devToDelete, setDevToDelete] = useState(null);
    const [globalFilter, setGlobalFilter] = useSessionState('devman_globalFilter', '');
    const [sorting, setSorting] = useSessionState('devman_sorting', []);
    const [pagination, setPagination] = useSessionState('devman_pagination', { pageIndex: 0, pageSize: 10 });

    // Use scroll restoration
    useScrollRestoration('DeveloperManagement', !loading && developers.length > 0);

    // Form state
    const [formName, setFormName] = useState('');
    const [formWebsite, setFormWebsite] = useState('');
    const [formError, setFormError] = useState('');

    const fetchDevelopers = async () => {
        try {
            const response = await developerApi.getDevelopers();
            setDevelopers(response.data?.developers || []);
        } catch (error) {
            console.error('Failed to fetch developers:', error);
            toast.error('Failed to load developers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDevelopers(); }, []);

    const handleOpenForm = (dev = null) => {
        if (dev) {
            setEditingDev(dev);
            setFormName(dev.name);
            setFormWebsite(dev.website || '');
        } else {
            setEditingDev(null);
            setFormName('');
            setFormWebsite('');
        }
        setFormError('');
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingDev(null);
        setFormName('');
        setFormWebsite('');
        setFormError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formName.trim()) {
            setFormError('Developer name is required');
            return;
        }
        try {
            const data = { name: formName.trim(), website: formWebsite.trim() };
            if (editingDev) {
                await developerApi.updateDeveloper(editingDev.id, data);
                toast.success('Developer updated!');
            } else {
                await developerApi.createDeveloper(data);
                toast.success('Developer created!');
            }
            handleCloseForm();
            fetchDevelopers();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save developer');
        }
    };

    const handleDelete = (id) => {
        setDevToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!devToDelete) return;
        try {
            await developerApi.deleteDeveloper(devToDelete);
            toast.success('Developer deleted');
            fetchDevelopers();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete developer');
        } finally {
            setDeleteConfirmOpen(false);
            setDevToDelete(null);
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Developer Name',
            cell: ({ getValue }) => (
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-[color-mix(in_srgb,var(--primary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--primary-color),transparent_90%)] rounded-admin flex items-center justify-center flex-shrink-0 shadow-sm border border-[color-mix(in_srgb,var(--primary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--primary-color),transparent_80%)]">
                        <BuildingOffice2Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{getValue()}</span>
                </div>
            ),
        },
        {
            accessorKey: 'website',
            header: 'Website',
            cell: ({ getValue }) => (
                <span className="text-gray-500 dark:text-gray-400 text-sm">{getValue() || '—'}</span>
            ),
        },
        {
            id: 'projects_count',
            header: 'Projects',
            cell: ({ row }) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50/50 text-blue-700 dark:bg-blue-600/10 dark:text-blue-400 backdrop-blur-sm">
                    {row.original.projects?.length || 0}
                </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex justify-end space-x-2.5">
                    {canUpdate && (
                        <button
                            onClick={() => handleOpenForm(row.original)}
                            className="p-2.5 text-blue-600 bg-blue-100/40 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-admin transition-all border border-blue-600/20 dark:border-blue-500/20 shadow-sm flex items-center justify-center"
                            title="Edit"
                        >
                            <PencilSquareIcon className="w-5 h-5" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => handleDelete(row.original.id)}
                            className="p-2.5 text-red-600 bg-red-100/40 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-admin transition-all border border-red-600/20 dark:border-red-500/20 shadow-sm flex items-center justify-center"
                            title="Delete"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            ),
        },
    ], [canUpdate, canDelete]);

    const table = useReactTable({
        data: developers,
        columns,
        state: { globalFilter, sorting, pagination },
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
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 pb-2">
                <div className="lg:min-w-[280px]">
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-[color-mix(in_srgb,var(--primary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--primary-color),transparent_90%)] backdrop-blur-md rounded-admin flex items-center justify-center shadow-sm border border-[color-mix(in_srgb,var(--primary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--primary-color),transparent_80%)]">
                            <BuildingOffice2Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        Developers
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage developer partners</p>
                </div>

                {/* Stats - Integrated & Centered */}
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 flex-1">
                    <div className="flex items-center space-x-3 transition-all hover:translate-y-[-2px] duration-300">


                    </div>

                </div>

                {/* Balance Spacer for LG screens */}
                <div className="hidden lg:block lg:min-w-[280px]"></div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center space-x-2 h-[34px] w-full lg:w-auto">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Show</span>
                    <div className="w-16">
                        <StyledSelect
                            options={[{ value: 5, label: '5' }, { value: 10, label: '10' }, { value: 20, label: '20' }, { value: 50, label: '50' }]}
                            value={pagination.pageSize}
                            onChange={(val) => table.setPageSize(Number(val))}
                            isSearchable={false}
                            components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
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
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full lg:w-auto flex-1">
                    <div className="relative w-full lg:w-64">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                        <input
                            type="text"
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search developers..."
                            className="input-field pl-10 pr-4 h-[34px] min-h-0 text-[11px]"
                        />
                    </div>
                    {canCreate && (
                        <button
                            onClick={() => handleOpenForm()}
                            className="btn-primary w-full sm:w-auto px-4 h-[34px] text-[12px] flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Add Developer
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-dashboard-card rounded-admin border-admin overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : developers.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse divide-y divide-gray-100 dark:divide-gray-700">
                                <thead className="bg-[#F9FAFB] dark:bg-gray-800/50">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th key={header.id} className="px-6 py-3 text-[11px] font-bold text-[#6B7280] dark:text-gray-400 tracking-wider">
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
                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3">
                            <div className="text-[11px] text-gray-500 font-bold tracking-normal">
                                <span className="text-gray-900 dark:text-white">{table.getFilteredRowModel().rows.length}</span> results
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 border-admin rounded-admin hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all text-gray-400"
                                >
                                    <ChevronDoubleLeftIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 border-admin rounded-admin hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all text-gray-400"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-2 mx-2">
                                    <span className="text-[11px] font-bold text-gray-500 tracking-normal">Page</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={table.getPageCount()}
                                        value={table.getState().pagination.pageIndex + 1}
                                        onChange={e => {
                                            const page = e.target.value ? Number(e.target.value) - 1 : 0;
                                            table.setPageIndex(page);
                                        }}
                                        className="w-12 h-9 border-admin rounded-admin bg-white dark:bg-dashboard-input text-center text-[13px] font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all no-spinner"
                                    />
                                    <span className="text-[11px] font-bold text-gray-500 tracking-normal whitespace-nowrap">of {table.getPageCount() || 1}</span>
                                </div>

                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border-admin rounded-admin hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all text-gray-400"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border-admin rounded-admin hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all text-gray-400"
                                >
                                    <ChevronDoubleRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <EmptyState
                        icon={BuildingOffice2Icon}
                        title="No developers yet"
                        description="Add property developers to organize your listings by project."
                        action={
                            canCreate && <button onClick={() => handleOpenForm()} className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap px-4 h-[38px] text-sm shadow-sm">
                                <PlusIcon className="w-5 h-5" />
                                <span>Add Developer</span>
                            </button>
                        }
                    />
                )}
            </div>

            {/* Modal */}
            {showForm && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCloseForm} />


                    <div className="relative bg-white dark:bg-dashboard-card rounded-admin shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
                        <div className="flex-none bg-white dark:bg-dashboard-card border-b border-gray-100 dark:border-gray-700 px-8 py-3 flex items-center justify-between z-10 sticky top-0">
                            <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
                                {editingDev ? 'Edit Developer' : 'Add Developer'}
                            </h3>
                            <button onClick={handleCloseForm} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">

                            <div>
                                <label className="input-label">Developer Name *</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className={`input-field ${formError ? 'border-red-300' : ''}`}
                                    placeholder="e.g., Sansiri"
                                />
                                {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}
                            </div>
                            <div>
                                <label className="input-label">Website</label>
                                <input
                                    type="text"
                                    value={formWebsite}
                                    onChange={(e) => setFormWebsite(e.target.value)}
                                    className="input-field"
                                    placeholder="e.g., https://www.sansiri.com"
                                />
                            </div>
                        </form>
                        <div className="flex-none p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-end gap-3">
                            <button type="button" onClick={handleCloseForm} className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Cancel</button>
                            <button 
                                onClick={handleSubmit}
                                className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-admin shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98]"
                            >
                                {editingDev ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}


            <ConfirmModal
                isOpen={deleteConfirmOpen}
                onClose={() => {
                    setDeleteConfirmOpen(false);
                    setDevToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Developer"
                message="Are you sure you want to delete this developer? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isDestructive={true}
            />
        </div>
    );
};

export default DeveloperManagement;
