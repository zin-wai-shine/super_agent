import React, { useState, useEffect, useMemo } from 'react';
import { collectionApi, uploadApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
    FolderIcon,
    PlusIcon,
    TrashIcon,
    PencilIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    ChevronDownIcon,
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
import { getMediaUrl } from '../../utils/media';
import CreateCollectionModal from '../../components/Listings/CreateCollectionModal';
import EditCollectionModal from '../../components/Listings/EditCollectionModal';

const CollectionManagement = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);
    const [globalFilter, setGlobalFilter] = useSessionState('colman_globalFilter', '');
    const [sorting, setSorting] = useSessionState('colman_sorting', []);
    const [pagination, setPagination] = useSessionState('colman_pagination', { pageIndex: 0, pageSize: 10 });

    // Use scroll restoration
    useScrollRestoration('CollectionManagement', !loading && collections.length > 0);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const response = await collectionApi.getCollections();
            setCollections(response.data || []);
        } catch (error) {
            console.error('Failed to fetch collections:', error);
            toast.error('Failed to load collections');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCollections(); }, []);

    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Collection Name',
            cell: ({ row }) => {
                const collection = row.original;
                const firstImage = collection.media?.find(m => m.type === 'image')?.url;
                
                return (
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 border dark:border-gray-700">
                            {firstImage ? (
                                <img src={getMediaUrl(firstImage)} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <FolderIcon className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-white text-sm">{collection.name}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Created {new Date(collection.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'listings_count',
            header: 'Properties',
            cell: ({ getValue }) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary-700 dark:bg-primary-600/10 dark:text-primary-400 border border-primary-100 dark:border-primary-800">
                    {getValue() || 0} listings
                </span>
            ),
        },
        {
            id: 'media_count',
            header: 'Photos',
            cell: ({ row }) => (
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                    {row.original.media?.length || 0} items
                </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => setEditingCollection(row.original)}
                        className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                        title="Edit"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={async () => {
                            if (window.confirm('Delete this collection?')) {
                                try {
                                    await collectionApi.deleteCollection(row.original.id);
                                    toast.success('Deleted');
                                    fetchCollections();
                                } catch (e) {
                                    toast.error('Failed to delete');
                                }
                            }
                        }}
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
        data: collections,
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
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-500/10 rounded-xl flex items-center justify-center shadow-sm">
                            <FolderIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        Collections
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {collections.length} collection{collections.length !== 1 ? 's' : ''} to organize your listings
                    </p>
                </div>
            </div>

            {/* Toolbar: Actions & Filters */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
                
                {/* LEFT: Page Size */}
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
                                    borderRadius: '3px',
                                    height: '34px',
                                    minHeight: '34px',
                                    fontSize: '11px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                }),
                                valueContainer: (base) => ({
                                    ...base,
                                    padding: '0',
                                    justifyContent: 'center',
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

                {/* RIGHT: Search & Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="relative w-full lg:w-64">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search collections..."
                            className="input-field pl-10 pr-4 h-[34px] min-h-0 text-[11px]"
                        />
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex-1 sm:flex-none h-[34px] px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[3px] text-xs font-bold shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>New Collection</span>
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white dark:bg-dashboard-card rounded-[3px] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : collections.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
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
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-[3px] hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-500 dark:text-gray-400"
                                >
                                    <ChevronDoubleLeftIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-[3px] hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-500 dark:text-gray-400"
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
                                        className="w-14 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded-[3px] text-sm bg-white dark:bg-dashboard-dark text-gray-900 dark:text-white"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">of {table.getPageCount()}</span>
                                </div>

                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-[3px] hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-500 dark:text-gray-400"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-[3px] hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-500 dark:text-gray-400"
                                >
                                    <ChevronDoubleRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <EmptyState
                        icon={FolderIcon}
                        title="No collections yet"
                        description="Start grouping your properties by project, location, or type."
                        action={
                            <button onClick={() => setShowCreateModal(true)} className="btn-primary px-6 h-[40px] text-sm shadow-sm flex items-center space-x-2">
                                <PlusIcon className="w-5 h-5" />
                                <span>Add First Collection</span>
                            </button>
                        }
                    />
                )}
            </div>

            <CreateCollectionModal 
                isOpen={showCreateModal} 
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => fetchCollections()}
            />

            <EditCollectionModal 
                isOpen={!!editingCollection}
                onClose={() => setEditingCollection(null)}
                onSuccess={() => fetchCollections()}
                collection={editingCollection}
            />
        </div>
    );
};

export default CollectionManagement;
