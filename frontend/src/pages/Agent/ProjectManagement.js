import React, { useState, useEffect, useMemo } from 'react';
import { developerApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
    BuildingOfficeIcon,
    PlusIcon,
    TrashIcon,
    PencilIcon,
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

const ProjectManagement = () => {
    const [projects, setProjects] = useState([]);
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [filterDeveloper, setFilterDeveloper] = useState('');

    // Form state
    const [formName, setFormName] = useState('');
    const [formDeveloperId, setFormDeveloperId] = useState('');
    const [formError, setFormError] = useState('');

    const fetchData = async () => {
        try {
            const [projRes, devRes] = await Promise.all([
                developerApi.getProjects(),
                developerApi.getDevelopers(),
            ]);
            setProjects(projRes.data?.projects || []);
            setDevelopers(devRes.data?.developers || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredProjects = useMemo(() => {
        if (!filterDeveloper) return projects;
        return projects.filter(p => p.developer_id === filterDeveloper);
    }, [projects, filterDeveloper]);

    const developerOptions = useMemo(() =>
        developers.map(d => ({ value: d.id, label: d.name })),
        [developers]
    );

    const handleOpenForm = (project = null) => {
        if (project) {
            setEditingProject(project);
            setFormName(project.name);
            setFormDeveloperId(project.developer_id);
        } else {
            setEditingProject(null);
            setFormName('');
            setFormDeveloperId('');
        }
        setFormError('');
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingProject(null);
        setFormName('');
        setFormDeveloperId('');
        setFormError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formName.trim()) { setFormError('Project name is required'); return; }
        if (!formDeveloperId) { setFormError('Developer is required'); return; }
        try {
            const data = { name: formName.trim(), developer_id: formDeveloperId };
            if (editingProject) {
                await developerApi.updateProject(editingProject.id, data);
                toast.success('Project updated!');
            } else {
                await developerApi.createProject(data);
                toast.success('Project created!');
            }
            handleCloseForm();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save project');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this project? This cannot be undone.')) return;
        try {
            await developerApi.deleteProject(id);
            toast.success('Project deleted');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete project');
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Project Name',
            cell: ({ getValue }) => (
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <BuildingOfficeIcon className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{getValue()}</span>
                </div>
            ),
        },
        {
            id: 'developer',
            header: 'Developer',
            accessorFn: (row) => row.developer?.name || '',
            cell: ({ row }) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                    {row.original.developer?.name || '—'}
                </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => handleOpenForm(row.original)}
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

    const table = useReactTable({
        data: filteredProjects,
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                            <BuildingOfficeIcon className="w-5 h-5 text-white" />
                        </div>
                        Projects
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {projects.length} project{projects.length !== 1 ? 's' : ''} registered
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-[3px] border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.1em]">Total Projects</span>
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{projects.length}</div>
                </div>
                <div className="p-5 rounded-[3px] border border-primary-100 dark:border-primary-900/30 bg-primary-50/50 dark:bg-primary-900/10 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.1em]">Developers</span>
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{developers.length}</div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <span className="text-sm text-gray-500 font-medium">Show</span>
                    <div className="w-20">
                        <StyledSelect
                            options={[{ value: 5, label: '5' }, { value: 10, label: '10' }, { value: 20, label: '20' }, { value: 50, label: '50' }]}
                            value={pagination.pageSize}
                            onChange={(val) => table.setPageSize(Number(val))}
                            isSearchable={false}
                            components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
                            styles={{ control: (base) => ({ ...base, borderRadius: '3px', height: '34px', minHeight: '34px', fontSize: '12px', fontWeight: '600', textAlign: 'center' }) }}
                        />
                    </div>
                    <div className="w-48">
                        <StyledSelect
                            options={[{ value: '', label: 'All Developers' }, ...developerOptions]}
                            value={filterDeveloper}
                            onChange={(val) => setFilterDeveloper(val)}
                            isSearchable={false}
                            styles={{ control: (base) => ({ ...base, borderRadius: '3px', height: '34px', minHeight: '34px', fontSize: '12px', fontWeight: '500' }) }}
                        />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full lg:w-auto flex-1">
                    <div className="relative w-full sm:w-64">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search projects..."
                            className="w-full h-[34px] pl-10 pr-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[3px] text-[12px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white placeholder:text-gray-400"
                        />
                    </div>
                    <button
                        onClick={() => handleOpenForm()}
                        className="w-full sm:w-auto px-4 h-[34px] bg-primary-600 hover:bg-primary-700 text-white text-[12px] font-bold rounded-[3px] flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Project
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-dashboard-card rounded-[3px] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : projects.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#F9FAFB] dark:bg-gray-800/50 border-b dark:border-gray-700">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th key={header.id} className="px-6 py-4 text-[11px] font-bold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider">
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
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-gray-50 dark:border-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing <span className="font-bold text-gray-900 dark:text-white">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{table.getFilteredRowModel().rows.length}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="p-2 border border-gray-300 dark:border-gray-600 rounded-[3px] hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 outline-none">
                                    <ChevronDoubleLeftIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-2 border border-gray-300 dark:border-gray-600 rounded-[3px] hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 outline-none">
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>
                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Page</span>
                                    <input type="number" min={1} max={table.getPageCount()} value={table.getState().pagination.pageIndex + 1} onChange={(e) => table.setPageIndex(e.target.value ? Number(e.target.value) - 1 : 0)} className="w-12 h-8 text-center border border-gray-300 dark:border-gray-600 rounded-[3px] text-xs font-bold bg-white dark:bg-dashboard-card text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-500" />
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">of {table.getPageCount()}</span>
                                </div>
                                <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-2 border border-gray-300 dark:border-gray-600 rounded-[3px] hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 outline-none">
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="p-2 border border-gray-300 dark:border-gray-600 rounded-[3px] hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 outline-none">
                                    <ChevronDoubleRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <EmptyState
                        icon={BuildingOfficeIcon}
                        title="No projects yet"
                        description="Create projects to associate with your property listings."
                        action={
                            <button onClick={() => handleOpenForm()} className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap px-4 h-[38px] text-sm shadow-sm">
                                <PlusIcon className="w-5 h-5" />
                                <span>Add Project</span>
                            </button>
                        }
                    />
                )}
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCloseForm} />
                    <div className="relative bg-white dark:bg-dashboard-card rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
                        <div className="sticky top-0 bg-white dark:bg-dashboard-card border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingProject ? 'Edit Project' : 'Add Project'}
                            </h3>
                            <button onClick={handleCloseForm} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="input-label">Developer *</label>
                                <StyledSelect
                                    options={developerOptions}
                                    value={formDeveloperId}
                                    onChange={(val) => setFormDeveloperId(val)}
                                    placeholder="Select developer..."
                                />
                            </div>
                            <div>
                                <label className="input-label">Project Name *</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className={`input-field ${formError ? 'border-red-300' : ''}`}
                                    placeholder="e.g., Life Asoke"
                                />
                                {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={handleCloseForm} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary px-6">{editingProject ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectManagement;
