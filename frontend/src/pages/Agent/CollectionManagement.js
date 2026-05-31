import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { hasActionPermission } from '../../utils/permissions';
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
    ArrowsUpDownIcon,
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import ConfirmModal from '../../components/ui/ConfirmModal';
import CreateCollectionModal from '../../components/Listings/CreateCollectionModal';
import EditCollectionModal from '../../components/Listings/EditCollectionModal';

const SortableItem = ({ id, collection }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: transform ? CSS.Translate.toString({ ...transform, x: 0 }) : undefined,
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-4 p-4 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 transition-all ${
                isDragging ? 'opacity-50 scale-[1.02] ring-4 ring-primary-500/10 shadow-xl border-primary-500/30' : 'hover:border-gray-200 dark:hover:border-white/10'
            }`}
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                <Bars3Icon className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                {collection.media && collection.media[0] ? (
                    <img src={getMediaUrl(collection.media[0].url)} alt="" className="w-full h-full object-cover" />
                ) : (
                    <FolderIcon className={`w-6 h-6 ${collection.is_parent ? 'text-primary-500' : 'text-secondary-500'}`} />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-gray-900 dark:text-white truncate">
                    {collection.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tight">
                        {collection.is_parent ? 'Main Category' : 'Sub-Collection'}
                    </p>
                    {collection.listings_count > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-lg font-black">
                            {collection.listings_count} PROPS
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const ReorderModal = ({ isOpen, onClose, parent, collections, onReordered }) => {
    const [items, setItems] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (parent) {
                // Get children of this parent
                const children = collections.filter(c => c.parent_id === parent.id);
                setItems(children);
            } else {
                // Get all main parents
                const parents = collections.filter(c => c.is_parent);
                setItems(parents);
            }
        }
    }, [isOpen, parent, collections]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await collectionApi.reorderCollections({
                collection_ids: items.map(i => i.id)
            });
            toast.success('Order updated successfully');
            onReordered();
            onClose();
        } catch (error) {
            console.error('Failed to reorder:', error);
            toast.error('Failed to update order');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-xl bg-white dark:bg-dashboard-card rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-3 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-dashboard-card sticky top-0 z-10">
                    <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
                        Adjust {parent ? `"${parent.name}"` : 'Main Categories'} Order
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 py-6 bg-gray-50/30 dark:bg-gray-900/20">
                    <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        {items.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No child collections found</p>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={items.map(i => i.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {items.map((item) => (
                                        <SortableItem key={item.id} id={item.id} collection={item} />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-white dark:bg-dashboard-card border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="h-[38px] px-6 border border-gray-300 dark:border-gray-600 text-[13px] font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || items.length === 0}
                        className="h-[38px] px-8 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl text-[13px] font-bold shadow-sm transition-all flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <span>Save New Order</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const CollectionManagement = () => {
    const { user } = useAuth();
    const canCreate = hasActionPermission(user, 'collections:create');
    const canUpdate = hasActionPermission(user, 'collections:update');
    const canDelete = hasActionPermission(user, 'collections:delete');

    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createModalType, setCreateModalType] = useState('child');
    const [editingCollection, setEditingCollection] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [collectionToDelete, setCollectionToDelete] = useState(null);
    const [showReorderModal, setShowReorderModal] = useState(false);
    const [selectedParentForReorder, setSelectedParentForReorder] = useState(null);
    
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

    const handleDeleteClick = (id) => {
        setCollectionToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!collectionToDelete) return;
        try {
            await collectionApi.deleteCollection(collectionToDelete);
            toast.success('Collection deleted');
            fetchCollections();
        } catch (e) {
            toast.error('Failed to delete');
        } finally {
            setDeleteConfirmOpen(false);
            setCollectionToDelete(null);
        }
    };

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
                const col = info.row.original;
                const isIconType = !!col.icon;
                const hasMedia = col.media && col.media.length > 0;

                return (
                    <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-sm border ${col.isVirtual ? 'bg-primary-50 border-primary-100/50 dark:bg-primary-500/10 dark:border-primary-500/20' : 'bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700'}`}>
                            {isIconType ? (() => {
                                const Icon = MdIcons[col.icon] || 
                                             FaIcons[col.icon] || 
                                             HiIcons[col.icon] || 
                                             BsIcons[col.icon] || 
                                             FolderIcon;
                                             
                                return <Icon className={`w-5 h-5 ${col.isVirtual ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'}`} />;
                            })() : (hasMedia && !col.is_parent) ? (
                                <img src={getMediaUrl(col.media[0].url)} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <FolderIcon className={`w-5 h-5 ${col.is_parent ? 'text-primary-600' : 'text-gray-400'}`} />
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-bold text-gray-900 dark:text-white truncate">
                                {info.getValue()}
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase">Created {new Date(col.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'listings_count',
            header: 'Props',
            cell: ({ getValue }) => (
                <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-[color-mix(in_srgb,var(--primary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--primary-color),transparent_90%)] border border-[color-mix(in_srgb,var(--primary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--primary-color),transparent_80%)] px-1.5 py-0.5 rounded-xl">
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
                        {canUpdate && (
                            <button
                                onClick={() => setEditingCollection(row.original)}
                                className="p-2.5 text-blue-600 bg-blue-100/40 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-xl transition-all border border-blue-600/20 dark:border-blue-500/20 shadow-sm flex items-center justify-center"
                                title="Edit"
                            >
                                <PencilSquareIcon className="w-4 h-4" />
                            </button>
                        )}
                        {!isVirtual && canDelete && (
                            <button
                                onClick={() => handleDeleteClick(row.original.id)}
                                className="p-2.5 text-red-600 bg-red-100/40 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-xl transition-all border border-red-600/20 dark:border-red-500/20 shadow-sm flex items-center justify-center"
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

    const parentColumns = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Collection',
            cell: (info) => {
                const col = info.row.original;
                return (
                    <div className="flex items-center gap-3 py-1">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <FolderIcon className="w-5 h-5 text-secondary-500" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-bold text-gray-900 dark:text-white truncate">
                                {info.getValue()}
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase">Created {new Date(col.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'children_count',
            header: 'Childs',
            cell: ({ getValue }) => (
                <span className="text-[10px] font-bold text-secondary-600 dark:text-secondary-400 bg-[color-mix(in_srgb,var(--secondary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--secondary-color),transparent_90%)] border border-[color-mix(in_srgb,var(--secondary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--secondary-color),transparent_80%)] px-1.5 py-0.5 rounded-xl">
                    {getValue() || 0}
                </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end space-x-2">
                        {canUpdate && (
                            <>
                                <button
                                    onClick={() => {
                                        setSelectedParentForReorder(row.original);
                                        setShowReorderModal(true);
                                    }}
                                    className="p-2.5 text-gray-600 bg-gray-100/40 hover:bg-gray-100 dark:bg-gray-500/10 dark:text-gray-400 dark:hover:bg-gray-500/20 rounded-xl transition-all border border-gray-600/20 dark:border-gray-500/20 shadow-sm flex items-center justify-center"
                                    title="Adjust Order"
                                >
                                    <ArrowsUpDownIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setEditingCollection(row.original)}
                                    className="p-2.5 text-blue-600 bg-blue-100/40 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-xl transition-all border border-blue-600/20 dark:border-blue-500/20 shadow-sm flex items-center justify-center"
                                    title="Edit"
                                >
                                    <PencilSquareIcon className="w-5 h-5" />
                                </button>
                            </>
                        )}
                        {canDelete && (
                            <button
                                onClick={() => handleDeleteClick(row.original.id)}
                                className="p-2.5 text-red-600 bg-red-100/40 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-xl transition-all border border-red-600/20 dark:border-red-500/20 shadow-sm flex items-center justify-center"
                                title="Delete"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                );
            },
        },
    ], [fetchCollections, canUpdate, canDelete]);
    
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
    }, [baseColumns, canUpdate, canDelete]);

    const parentData = useMemo(() => {
        // We only show "Parents" (top-level categories)
        const realParents = collections.filter(c => c.is_parent).map(p => {
            const children = collections.filter(c => c.parent_id === p.id);
            return {
                ...p,
                children_count: children.length
            };
        });
        
        return realParents;
    }, [collections]);

    const parentOptions = useMemo(() => {
        const options = [{ value: 'all', label: 'All Categories' }];
        
        collections.filter(c => c.is_parent).forEach(p => {
            options.push({ value: p.id, label: p.name });
        });
        return options;
    }, [collections]);

    const childData = useMemo(() => {
        let items = collections
            .filter(c => !c.is_parent) // Filter only sub-collections (non-parents)
            .map(c => {
                return { 
                    ...c, 
                    parent: c.parent || { name: 'Unknown' },
                    effectiveParentId: c.parent_id
                };
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold tracking-normal">
                <span className="text-gray-900 dark:text-white">
                    {table.getFilteredRowModel().rows.length}
                </span> results
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
    );

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-[color-mix(in_srgb,var(--primary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--primary-color),transparent_90%)] rounded-2xl flex items-center justify-center shadow-sm border border-[color-mix(in_srgb,var(--primary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--primary-color),transparent_80%)]">
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
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-[color-mix(in_srgb,var(--primary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--primary-color),transparent_90%)] border border-[color-mix(in_srgb,var(--primary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--primary-color),transparent_80%)] text-primary-600 dark:text-primary-400 rounded-xl">
                                {parentData.length}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 z-10" />
                            <input
                                type="text"
                                value={parentFilter}
                                onChange={(e) => setParentFilter(e.target.value)}
                                placeholder="Search collections..."
                                className="input-field pl-9 pr-4 h-[34px] min-h-0 text-[13px]"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            {canUpdate && (
                                <button
                                    onClick={() => {
                                        setSelectedParentForReorder(null);
                                        setShowReorderModal(true);
                                    }}
                                    className="h-[34px] w-[34px] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-400 hover:text-primary-500 rounded-xl transition-all flex items-center justify-center shadow-sm"
                                    title="Reorder Main Categories"
                                >
                                    <ArrowsUpDownIcon className="w-4 h-4" />
                                </button>
                            )}
                            {canCreate && (
                                <button
                                    onClick={() => {
                                        setCreateModalType('parent');
                                        setShowCreateModal(true);
                                    }}
                                    className="h-[34px] px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 whitespace-nowrap"
                                >
                                    <PlusIcon className="w-3.5 h-3.5" />
                                    <span>Add Parent</span>
                                </button>
                            )}
                        </div>
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
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-[color-mix(in_srgb,var(--secondary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--secondary-color),transparent_90%)] border border-[color-mix(in_srgb,var(--secondary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--secondary-color),transparent_80%)] text-secondary-600 dark:text-secondary-400 rounded-xl">
                                {childData.length}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="relative flex-[1.5]">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 z-10" />
                            <input
                                type="text"
                                value={childFilter}
                                onChange={(e) => setChildFilter(e.target.value)}
                                placeholder="Search collections..."
                                className="input-field pl-9 pr-4 h-[34px] min-h-0 text-[13px]"
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
                                    }),
                                    valueContainer: (base) => ({
                                        ...base,
                                        padding: '0 8px'
                                    })
                                }}
                            />
                        </div>

                        {canCreate && (
                            <button
                                onClick={() => {
                                    setCreateModalType('child');
                                    setShowCreateModal(true);
                                }}
                                className="h-[34px] px-4 bg-secondary-600 hover:bg-secondary-700 text-white rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 whitespace-nowrap"
                            >
                                <PlusIcon className="w-3.5 h-3.5" />
                                <span>Add Child</span>
                            </button>
                        )}
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

            <ReorderModal
                isOpen={showReorderModal}
                onClose={() => {
                    setShowReorderModal(false);
                    setSelectedParentForReorder(null);
                }}
                parent={selectedParentForReorder}
                collections={collections}
                onReordered={() => fetchCollections()}
            />

            <ConfirmModal
                isOpen={deleteConfirmOpen}
                onClose={() => {
                    setDeleteConfirmOpen(false);
                    setCollectionToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Collection"
                message="Are you sure you want to delete this collection? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isDestructive={true}
            />
        </div>
    );
};

const TableView = ({ table, loading, emptyTitle, colorTheme = 'primary', pagination }) => {
    return (
        <div className="bg-white dark:bg-dashboard-card rounded-admin border-admin overflow-hidden min-h-[400px] flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
                <div className="flex-1 flex items-center justify-center p-12">
                    <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${colorTheme === 'primary' ? 'border-primary-600' : 'border-secondary-600'}`}></div>
                </div>
            ) : table.getRowModel().rows.length > 0 ? (
                <>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse divide-y divide-gray-100 dark:divide-gray-700">
                            <thead className="bg-[#F9FAFB] dark:bg-gray-800/30">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className={`px-5 py-3 text-[13px] font-medium text-gray-500 dark:text-gray-400 tracking-tight ${header.id === 'actions' ? 'text-right' : ''}`}
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
