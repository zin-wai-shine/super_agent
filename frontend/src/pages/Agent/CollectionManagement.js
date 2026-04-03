import React, { useState, useEffect, useMemo } from 'react';
import { collectionApi, uploadApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
    FolderIcon,
    PlusIcon,
    TrashIcon,
    PencilSquareIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    ChevronUpIcon as ChevronUpIconOutline,
    ChevronDownIcon as ChevronDownIconOutline,
} from '@heroicons/react/24/outline';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
} from '@tanstack/react-table';
import * as BsIcons from 'react-icons/bs';
import * as MdIcons from 'react-icons/md';
import * as FaIcons from 'react-icons/fa';
import * as HiIcons from 'react-icons/hi2';
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
    const [createModalType, setCreateModalType] = useState('child');
    const [editingCollection, setEditingCollection] = useState(null);
    
    // Parent Table States
    const [parentFilter, setParentFilter] = useSessionState('colman_parentFilter', '');
    const [parentSorting, setParentSorting] = useSessionState('colman_parentSorting', []);
    const [parentPagination, setParentPagination] = useSessionState('colman_parentPagination', { pageIndex: 0, pageSize: 10 });
    
    // Child Table States
    const [childFilter, setChildFilter] = useSessionState('colman_childFilter', '');
    const [childParentFilter, setChildParentFilter] = useSessionState('colman_childParentFilter', 'all');
    const [childSorting, setChildSorting] = useSessionState('colman_childSorting', []);
    const [childPagination, setChildPagination] = useSessionState('colman_childPagination', { pageIndex: 0, pageSize: 12 });

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

    const baseColumns = [
        {
            accessorKey: 'name',
            header: 'Collection',
            cell: (info) => {
                return (
                    <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${info.row.original.isVirtual ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            {(() => {
                                const Icon = MdIcons[info.row.original.icon] || 
                                             FaIcons[info.row.original.icon] || 
                                             HiIcons[info.row.original.icon] || 
                                             BsIcons[info.row.original.icon] || 
                                             FolderIcon;
                                             
                                return <Icon className={`w-5 h-5 ${info.row.original.isVirtual ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'}`} />;
                            })()}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-bold text-gray-900 dark:text-white truncate">
                                {info.getValue()}
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase">Created {new Date(info.row.original.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'listings_count',
            header: 'Props',
            cell: ({ getValue }) => (
                <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-1.5 py-0.5 rounded">
                    {getValue() || 0}
                </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const isVirtual = row.original.isVirtual;
                return (
                    <div className="flex justify-end space-x-1.5">
                        <button
                            onClick={() => setEditingCollection(row.original)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                            title="Edit"
                        >
                            <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        {!isVirtual && (
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
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                title="Delete"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                );
            },
        },
    ];

    const parentColumns = useMemo(() => baseColumns, []);
    
    const childColumns = useMemo(() => {
        const cols = [...baseColumns];
        cols.splice(1, 0, {
            accessorKey: 'parent',
            header: 'In Category',
            cell: ({ row }) => {
                const parent = row.original.parent;
                if (!parent) return <span className="text-gray-400 text-[10px]">—</span>;
                return (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[100px] block font-medium">
                        {parent.name}
                    </span>
                );
            },
        });
        return cols;
    }, []);

    const parentData = useMemo(() => {
        // We only show "Parents" (top-level collections created as parents with an icon)
        const realParents = collections.filter(c => !c.parent_id && !!c.icon);
        
        // Count items without parent OR categorized as children
        const popularCount = collections.filter(c => !c.icon).length;

        let popName = 'Popular Collections';
        let popIcon = 'BsStars';
        try {
            const custom = JSON.parse(localStorage.getItem('popular_collection_custom'));
            if (custom) {
                popName = custom.name || popName;
                popIcon = custom.icon || popIcon;
            }
        } catch (e) {}

        return [
            { 
                id: 'virtual-popular', 
                name: popName, 
                listings_count: popularCount, 
                isVirtual: true,
                icon: popIcon,
                created_at: new Date().toISOString()
            },
            ...realParents
        ];
    }, [collections]);

    const parentOptions = useMemo(() => {
        const options = [{ value: 'all', label: 'All Categories' }];

        let popName = 'Popular Collections';
        try {
            const custom = JSON.parse(localStorage.getItem('popular_collection_custom'));
            if (custom) {
                popName = custom.name || popName;
            }
        } catch (e) {}

        options.push({ value: 'virtual-popular', label: popName });
        
        collections.filter(c => !c.parent_id && !!c.icon).forEach(p => {
            options.push({ value: p.id, label: p.name });
        });
        return options;
    }, [collections]);

    const childData = useMemo(() => {
        let popName = 'Popular Collections';
        try {
            const custom = JSON.parse(localStorage.getItem('popular_collection_custom'));
            if (custom) {
                popName = custom.name || popName;
            }
        } catch (e) {}

        let items = collections
            .filter(c => !c.icon) // Filter out actual parent collections
            .map(c => {
                if (!c.parent_id) {
                    return { 
                        ...c, 
                        parent: { name: popName },
                        effectiveParentId: 'virtual-popular'
                    };
                }
                return { ...c, effectiveParentId: c.parent_id };
            });

        if (childParentFilter !== 'all') {
            items = items.filter(i => String(i.effectiveParentId) === String(childParentFilter));
        }

        return items;
    }, [collections, childParentFilter]);

    const parentTable = useReactTable({
        data: parentData,
        columns: parentColumns,
        state: { globalFilter: parentFilter, sorting: parentSorting, pagination: parentPagination },
        onGlobalFilterChange: setParentFilter,
        onSortingChange: setParentSorting,
        onPaginationChange: setParentPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const childTable = useReactTable({
        data: childData,
        columns: childColumns,
        state: { globalFilter: childFilter, sorting: childSorting, pagination: childPagination },
        onGlobalFilterChange: setChildFilter,
        onSortingChange: setChildSorting,
        onPaginationChange: setChildPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const TablePagination = ({ table }) => (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                <span className="font-bold text-gray-900 dark:text-white">
                    {table.getFilteredRowModel().rows.length}
                </span> results
            </div>

            <div className="flex items-center space-x-2">
                <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-[3px] hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 transition-all text-gray-500 dark:text-gray-400"
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                </button>
                
                <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400 px-2">
                    Page <span className="font-bold text-gray-900 dark:text-white">{table.getState().pagination.pageIndex + 1}</span> of {table.getPageCount() || 1}
                </span>

                <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-[3px] hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 transition-all text-gray-500 dark:text-gray-400"
                >
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-500/10 rounded-2xl flex items-center justify-center shadow-sm">
                            <FolderIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        Collections
                    </h1>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Organize your property inventory into hierarchical categories
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* 1. PARENT COLLECTIONS COLUMN */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">
                                Main Collections
                            </h2>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded">
                                {parentData.length}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                value={parentFilter}
                                onChange={(e) => setParentFilter(e.target.value)}
                                placeholder="Search main..."
                                className="w-full pl-9 pr-4 h-[34px] bg-white dark:bg-dashboard-card border border-gray-200 dark:border-gray-700 rounded-[3px] text-[13px] focus:ring-1 focus:ring-primary-500/20 transition-all outline-none font-medium text-gray-700 dark:text-gray-200"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setCreateModalType('parent');
                                setShowCreateModal(true);
                            }}
                            className="h-[34px] px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[3px] text-[13px] font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary-600/10 whitespace-nowrap"
                        >
                            <PlusIcon className="w-3.5 h-3.5" />
                            <span>Add Parent</span>
                        </button>
                    </div>

                    <TableView 
                        table={parentTable} 
                        loading={loading} 
                        emptyTitle="No parent collections"
                        pagination={<TablePagination table={parentTable} />}
                    />
                </div>

                {/* 2. CHILD COLLECTIONS COLUMN */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">
                                Child Collections
                            </h2>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-secondary-50 dark:bg-secondary-500/10 text-secondary-600 dark:text-secondary-400 rounded">
                                {childData.length}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="relative flex-[1.5]">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                value={childFilter}
                                onChange={(e) => setChildFilter(e.target.value)}
                                placeholder="Search child..."
                                className="w-full pl-9 pr-4 h-[34px] bg-white dark:bg-dashboard-card border border-gray-200 dark:border-gray-700 rounded-[3px] text-[13px] focus:ring-1 focus:ring-secondary-500/20 transition-all outline-none font-medium text-gray-700 dark:text-gray-200"
                            />
                        </div>

                        <div className="w-[160px]">
                            <StyledSelect
                                options={parentOptions}
                                value={childParentFilter}
                                onChange={setChildParentFilter}
                                placeholder="Category"
                                isSearchable={false}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        height: '34px',
                                        minHeight: '34px',
                                        borderRadius: '3px',
                                        fontSize: '13px',
                                        backgroundColor: 'white',
                                        borderColor: '#E5E7EB',
                                    }),
                                    valueContainer: (base) => ({
                                        ...base,
                                        padding: '0 8px'
                                    })
                                }}
                            />
                        </div>

                        <button
                            onClick={() => {
                                setCreateModalType('child');
                                setShowCreateModal(true);
                            }}
                            className="h-[34px] px-4 bg-secondary-600 hover:bg-secondary-700 text-white rounded-[3px] text-[13px] font-bold transition-all flex items-center gap-2 shadow-lg shadow-secondary-600/10 whitespace-nowrap"
                        >
                            <PlusIcon className="w-3.5 h-3.5" />
                            <span>Add Child</span>
                        </button>
                    </div>

                    <TableView 
                        table={childTable} 
                        loading={loading} 
                        emptyTitle="No sub-collections yet"
                        colorTheme="secondary"
                        pagination={<TablePagination table={childTable} />}
                    />
                </div>
            </div>

            <CreateCollectionModal 
                isOpen={showCreateModal} 
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => fetchCollections()}
                type={createModalType}
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

const TableView = ({ table, loading, emptyTitle, colorTheme = "primary", pagination }) => {
    return (
        <div className="bg-white dark:bg-dashboard-card rounded-[3px] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[400px] flex flex-col">
            {loading ? (
                <div className="flex-1 flex items-center justify-center p-12">
                    <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${colorTheme === 'primary' ? 'border-primary-600' : 'border-secondary-600'}`}></div>
                </div>
            ) : table.getRowModel().rows.length > 0 ? (
                <>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#F9FAFB] dark:bg-gray-800/30">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className={`px-5 py-3 text-[13px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-tight ${header.id === 'actions' ? 'text-right' : ''}`}
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        className={`flex items-center ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-900 dark:hover:text-white transition-colors' : ''} ${header.id === 'actions' ? 'justify-end' : ''}`}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                                                    </div>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-5 py-3 whitespace-nowrap text-[13px] text-gray-600 dark:text-gray-300">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {pagination}
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-60">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                        <FolderIcon className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400">{emptyTitle}</h3>
                </div>
            )}
        </div>
    );
};

export default CollectionManagement;
