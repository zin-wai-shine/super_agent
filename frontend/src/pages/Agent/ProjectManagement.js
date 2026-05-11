import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

import { developerApi, uploadApi } from '../../services/api';
import toast from 'react-hot-toast';
import { getMediaUrl } from '../../utils/media';
import {
    BuildingOfficeIcon,
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
    PhotoIcon,
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

const ProjectManagement = () => {
    const [projects, setProjects] = useState([]);
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [globalFilter, setGlobalFilter] = useSessionState('projman_globalFilter', '');
    const [sorting, setSorting] = useSessionState('projman_sorting', []);
    const [pagination, setPagination] = useSessionState('projman_pagination', { pageIndex: 0, pageSize: 10 });
    const [filterDeveloper, setFilterDeveloper] = useSessionState('projman_filterDeveloper', '');

    // Use scroll restoration
    useScrollRestoration('ProjectManagement', !loading && projects.length > 0);

    // Form state
    const [formName, setFormName] = useState('');
    const [formDeveloperId, setFormDeveloperId] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formStatus, setFormStatus] = useState('');
    const [formProjectType, setFormProjectType] = useState('');
    const [formDistrict, setFormDistrict] = useState('');
    const [formStationId, setFormStationId] = useState('');
    const [formCoverImage, setFormCoverImage] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [formError, setFormError] = useState('');

    const fetchProjects = async () => {
        try {
            const res = await developerApi.getProjects();
            setProjects(res.data?.projects || []);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            toast.error('Failed to load projects');
        }
    };

    const fetchDevelopers = async () => {
        try {
            const res = await developerApi.getDevelopers();
            setDevelopers(res.data?.developers || []);
        } catch (error) {
            console.error('Failed to fetch developers:', error);
        }
    };

    useEffect(() => { 
        setLoading(true);
        Promise.all([fetchProjects(), fetchDevelopers()]).finally(() => setLoading(false));
    }, []);

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
            setFormName(project.name || '');
            setFormDeveloperId(project.developer_id || '');
            setFormDescription(project.description || '');
            setFormStatus(project.status || '');
            setFormProjectType(project.project_type || '');
            setFormDistrict(project.district || '');
            setFormStationId(project.station_id || '');
            setFormCoverImage(project.cover_image || '');
        } else {
            setEditingProject(null);
            setFormName('');
            setFormDeveloperId('');
            setFormDescription('');
            setFormStatus('');
            setFormProjectType('');
            setFormDistrict('');
            setFormStationId('');
            setFormCoverImage('');
        }
        setFormError('');
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingProject(null);
        setFormName('');
        setFormDeveloperId('');
        setFormDescription('');
        setFormStatus('');
        setFormProjectType('');
        setFormDistrict('');
        setFormStationId('');
        setFormCoverImage('');
        setFormError('');
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            // Reusing banner upload endpoint which takes a generic image and returns a URL
            const res = await uploadApi.uploadBanner(file);
            setFormCoverImage(res.data.url);
            toast.success('Image uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formName.trim()) { setFormError('Project name is required'); return; }
        if (!formDeveloperId) { setFormError('Developer is required'); return; }
        try {
            const data = {
                name: formName.trim(),
                developer_id: formDeveloperId,
                description: formDescription,
                status: formStatus,
                project_type: formProjectType,
                district: formDistrict,
                station_id: formStationId,
                cover_image: formCoverImage
            };
            if (editingProject) {
                await developerApi.updateProject(editingProject.id, data);
                toast.success('Project updated!');
            } else {
                await developerApi.createProject(data);
                toast.success('Project created!');
            }
            handleCloseForm();
            fetchProjects();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save project');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this project? This cannot be undone.')) return;
        try {
            await developerApi.deleteProject(id);
            toast.success('Project deleted');
            fetchProjects();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete project');
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Project Name',
            cell: ({ getValue }) => (
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-50 dark:bg-primary-500/10 rounded-admin flex items-center justify-center flex-shrink-0 shadow-sm border border-primary-100/50 dark:border-primary-500/20">
                        <BuildingOfficeIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{getValue()}</span>
                </div>
            ),
        },
        {
            id: 'developer',
            header: 'Developer',
            accessorFn: (row) => row.developer?.name || '',
            cell: ({ row }) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50/50 text-primary-700 dark:bg-primary-600/10 dark:text-primary-400 backdrop-blur-sm">
                    {row.original.developer?.name || '—'}
                </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex justify-end space-x-2.5">
                    <button
                        onClick={() => handleOpenForm(row.original)}
                        className="p-2.5 text-primary-600 bg-primary-50/50 hover:bg-primary-100/50 dark:bg-primary-500/10 dark:text-primary-400 dark:hover:bg-primary-500/20 rounded-admin transition-all border border-primary-100/20 dark:border-primary-500/20 shadow-sm flex items-center justify-center"
                        title="Edit"
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.original.id)}
                        className="p-2.5 text-red-600 bg-red-50/50 hover:bg-red-100/50 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-admin transition-all border border-red-100/20 dark:border-red-500/20 shadow-sm flex items-center justify-center"
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
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 pb-2">
                <div className="lg:min-w-[280px]">
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 dark:bg-primary-600/10 backdrop-blur-md rounded-admin flex items-center justify-center shadow-sm">
                            <BuildingOfficeIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        Project Management
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Oversee all development projects</p>
                </div>

                {/* Stats - Integrated & Centered */}
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 flex-1">
                    <div className="flex items-center space-x-3 transition-all hover:translate-y-[-2px] duration-300">

                    </div>
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
                    <div className="w-80">
                        <StyledSelect
                            options={[{ value: '', label: 'All Developers' }, ...developerOptions]}
                            value={filterDeveloper}
                            onChange={(val) => setFilterDeveloper(val)}
                            placeholder="Filter Developer..."
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
                            placeholder="Search projects..."
                            className="input-field pl-10 pr-4 h-[34px] min-h-0 text-[11px]"
                        />
                    </div>
                    <button
                        onClick={() => handleOpenForm()}
                        className="btn-primary w-full sm:w-auto px-4 h-[34px] text-[12px] flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Project
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-dashboard-card rounded-admin border-admin overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : projects.length > 0 ? (
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
            {showForm && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCloseForm} />
                    <div className="relative bg-white dark:bg-dashboard-card rounded-admin shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
                        <div className="flex-none bg-white dark:bg-dashboard-card border-b border-admin px-8 py-3 flex items-center justify-between z-10 sticky top-0">
                            <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
                                {editingProject ? 'Edit Project' : 'Add Project'}
                            </h3>
                            <button onClick={handleCloseForm} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form id="project-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="input-label">Cover Image</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-admin bg-gray-50 dark:bg-gray-800/50 relative overflow-hidden">
                                        {formCoverImage ? (
                                            <div className="relative w-full h-40">
                                                <img src={formCoverImage} alt="Cover" className="w-full h-full object-cover rounded-admin" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormCoverImage('')}
                                                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-1 text-center">
                                                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                                                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-admin font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                                                        <span>Upload a file</span>
                                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500">{uploadingImage ? 'Uploading...' : 'PNG, JPG, WEBP up to 5MB'}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="input-label">Project Name *</label>
                                    <input
                                        type="text"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        className={`input-field ${formError && !formName ? 'border-red-300' : ''}`}
                                        placeholder="e.g., Life Asoke"
                                    />
                                    {formError && !formName && <p className="text-red-500 text-xs mt-1">{formError}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="input-label">Description</label>
                                    <textarea
                                        value={formDescription}
                                        onChange={(e) => setFormDescription(e.target.value)}
                                        className="input-field min-h-[80px]"
                                        placeholder="Brief description about the project..."
                                    />
                                </div>
                                <div>
                                    <label className="input-label">Developer *</label>
                                    <StyledSelect
                                        options={developerOptions}
                                        value={formDeveloperId}
                                        onChange={(val) => setFormDeveloperId(val)}
                                        onMenuOpen={fetchDevelopers}
                                        placeholder="Select developer..."
                                    />
                                    {formError && !formDeveloperId && <p className="text-red-500 text-xs mt-1">{formError}</p>}
                                </div>
                                <div>
                                    <label className="input-label">Project Type</label>
                                    <StyledSelect
                                        options={[
                                            { value: 'condominium', label: 'Condominium' },
                                            { value: 'housing_estate', label: 'Housing Estate' },
                                            { value: 'townhome', label: 'Townhome' },
                                            { value: 'mixed_use', label: 'Mixed-Use' },
                                            { value: 'commercial', label: 'Commercial' },
                                        ]}
                                        value={formProjectType}
                                        onChange={setFormProjectType}
                                        placeholder="e.g., Condominium"
                                    />
                                </div>
                                <div>
                                    <label className="input-label">Status</label>
                                    <StyledSelect
                                        options={[
                                            { value: 'pre_sales', label: 'Pre-Sales' },
                                            { value: 'new_launch', label: 'New Launch' },
                                            { value: 'under_construction', label: 'Under Construction' },
                                            { value: 'ready_to_move', label: 'Ready to Move' },
                                            { value: 'sold_out', label: 'Sold Out' },
                                        ]}
                                        value={formStatus}
                                        onChange={setFormStatus}
                                        placeholder="Current status"
                                    />
                                </div>
                                <div>
                                    <label className="input-label">District / Zone</label>
                                    <input
                                        type="text"
                                        value={formDistrict}
                                        onChange={(e) => setFormDistrict(e.target.value)}
                                        className="input-field"
                                        placeholder="e.g., Sukhumvit, Rama 9"
                                    />
                                </div>
                            </div>
                        </form>
                        <div className="flex-none p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-end gap-3">
                            <button type="button" onClick={handleCloseForm} className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Cancel</button>
                            <button 
                                type="submit"
                                form="project-form"
                                disabled={uploadingImage} 
                                className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-admin shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {editingProject ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}


        </div>
    );
};

export default ProjectManagement;
