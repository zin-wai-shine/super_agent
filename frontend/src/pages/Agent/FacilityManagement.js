import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hasActionPermission } from '../../utils/permissions';

import { agentApi, uploadApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
    PlusIcon,
    TrashIcon,
    ArrowUpTrayIcon,
    PhotoIcon,
    XMarkIcon,
    ArrowsPointingOutIcon,
    CheckIcon,
    InboxIcon,
} from '@heroicons/react/24/outline';
import { TbEdit } from "react-icons/tb";
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
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getMediaUrl } from '../../utils/media';
import EmptyState from '../../components/Common/EmptyState';
import StyledSelect from '../../components/Form/StyledSelect';
import { 
    MagnifyingGlassIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import ConfirmModal from '../../components/ui/ConfirmModal';

const SortableTableRow = ({ group, onDelete, onEdit, canUpdate, canDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: group.name, disabled: !canUpdate });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.8 : 1,
        background: isDragging ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={`group border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/40 dark:hover:bg-gray-700/30 transition-colors ${isDragging ? 'shadow-2xl' : ''}`}
        >
            <td className="py-5 pl-6 min-w-[300px]">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-[color-mix(in_srgb,var(--primary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--primary-color),transparent_90%)] rounded-admin flex items-center justify-center flex-shrink-0 shadow-sm border border-[color-mix(in_srgb,var(--primary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--primary-color),transparent_80%)]">
                        <BuildingOfficeIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex flex-col">
                        <button
                            onClick={() => onEdit(group)}
                            className="text-sm font-bold text-gray-900 dark:text-white hover:text-primary-600 transition-colors text-left group/name flex items-center gap-2"
                        >
                            {group.name}
                        </button>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-bold">
                            Facility Collection
                        </span>
                    </div>
                </div>
            </td>
            <td className="py-5 px-4">
                <div className="inline-flex items-center px-4 py-1.5 bg-[color-mix(in_srgb,var(--primary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--primary-color),transparent_90%)] text-primary-600 dark:text-primary-400 rounded-admin text-[10px] font-black uppercase tracking-wider border border-[color-mix(in_srgb,var(--primary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--primary-color),transparent_80%)]">
                    <PhotoIcon className="w-3.5 h-3.5 mr-2" />
                    {group.items.length} {group.items.length === 1 ? 'Image' : 'Images'}
                </div>
            </td>
            <td className="py-5 pr-6 text-right">
                <div className="flex items-center justify-end gap-2.5">
                    <button
                        onClick={() => onEdit(group)}
                        className="p-2.5 text-blue-600 bg-blue-100/40 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-admin border border-blue-600/20 dark:border-blue-500/20 transition-all shadow-sm flex items-center justify-center"
                        title={canUpdate ? "Edit Collection" : "View Collection"}
                    >
                        <TbEdit className="w-5 h-5" />
                    </button>
                    {canDelete && (
                        <button
                            onClick={() => onDelete(group)}
                            className="p-2.5 text-red-600 bg-red-100/40 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-admin border border-red-600/20 dark:border-red-500/20 transition-all shadow-sm flex items-center justify-center"
                            title="Delete Collection"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};





const SortablePreviewItem = ({ id, url, index, onRemove, canUpdate, showDelete = true }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: id || url, disabled: !canUpdate });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative aspect-square rounded-admin overflow-hidden group border border-gray-100 dark:border-gray-800 shadow-sm transition-all"
        >
            <img src={url} alt="Preview" className="w-full h-full object-cover" />
            
            {/* Drag Handle Overlay */}
            {canUpdate && (
                <div 
                    {...attributes} 
                    {...listeners}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing bg-black/0 hover:bg-black/10 transition-colors"
                />
            )}

            {showDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(index);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-admin opacity-0 group-hover:opacity-100 transition-all shadow-lg backdrop-blur-sm z-10"
                >
                    <XMarkIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

const FacilityManagement = () => {
    const { user } = useAuth();
    const canUpdate = hasActionPermission(user, 'facilities:update');
    const canDelete = hasActionPermission(user, 'facilities:delete');

    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editName, setEditName] = useState('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteType, setDeleteType] = useState('group'); // 'group', 'single', or 'edit_single'
    const [itemToDelete, setItemToDelete] = useState(null);
    
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploadName, setUploadName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [pageIndex, setPageIndex] = useState(0);

    const fileInputRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const response = await agentApi.getFacilityMedia();
            setMedia(response.data);
        } catch (error) {
            toast.error('Failed to load facility images');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setSelectedFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeSelectedFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const groupedMedia = React.useMemo(() => {
        const groups = [];
        const map = new Map();

        media.forEach(item => {
            // Strip trailing numbers (e.g., "Lobby 1" -> "Lobby") to group legacy auto-numbered items
            const name = (item.name || 'Unnamed').replace(/\s+\d+$/, '');
            if (!map.has(name)) {
                const group = {
                    name: name,
                    items: [],
                    created_at: item.created_at
                };
                map.set(name, group);
                groups.push(group);
            }
            map.get(name).items.push(item);
        });
        return groups;
    }, [media]);

    const filteredGroups = React.useMemo(() => {
        if (!searchTerm) return groupedMedia;
        const lowSearch = searchTerm.toLowerCase();
        return groupedMedia.filter(g => g.name.toLowerCase().includes(lowSearch));
    }, [groupedMedia, searchTerm]);

    const paginatedGroups = React.useMemo(() => {
        const start = pageIndex * pageSize;
        return filteredGroups.slice(start, start + pageSize);
    }, [filteredGroups, pageIndex, pageSize]);

    const pageCount = Math.ceil(filteredGroups.length / pageSize);

    // Reset to first page when search term or page size changes
    useEffect(() => {
        setPageIndex(0);
    }, [searchTerm, pageSize]);


    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        try {
            setUploading(true);
            const uploadPromises = selectedFiles.map((file) => {
                // If it's a bulk upload, all images get the same name to be grouped together
                const name = uploadName || file.name.split('.')[0];
                return uploadApi.uploadFacilityImage(file, name);
            });

            await Promise.all(uploadPromises);
            toast.success(`Successfully uploaded ${selectedFiles.length} images`);
            setIsUploadModalOpen(false);
            resetUploadState();
            fetchMedia();
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload some images');
        } finally {
            setUploading(false);
        }
    };


    const resetUploadState = () => {
        setSelectedFiles([]);
        previews.forEach(url => URL.revokeObjectURL(url));
        setPreviews([]);
        setUploadName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setDeleteType(item.items ? 'group' : 'single');
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            if (deleteType === 'group') {
                const deletePromises = itemToDelete.items.map(img => agentApi.deleteFacilityMedia(img.id));
                await Promise.all(deletePromises);
                setMedia(prev => prev.filter(m => m.name !== itemToDelete.name));
                toast.success('Collection deleted');
            } else if (deleteType === 'single') {
                await agentApi.deleteFacilityMedia(itemToDelete.id);
                setMedia(prev => prev.filter(m => m.id !== itemToDelete.id));
                toast.success('Image deleted');
            } else if (deleteType === 'edit_single') {
                setEditingItem(prev => ({
                    ...prev,
                    items: prev.items.filter(i => i.id !== itemToDelete.id)
                }));
                await agentApi.deleteFacilityMedia(itemToDelete.id);
                setMedia(prev => prev.filter(m => m.id !== itemToDelete.id));
                toast.success('Image deleted');
            }
        } catch (error) {
            toast.error('Failed to delete');
        } finally {
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
        }
    };


    const handleUpdate = async (id, data) => {
        await agentApi.updateFacilityMedia(id, data);
        setMedia(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
    };

    const handlePreviewDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = previews.indexOf(active.id);
            const newIndex = previews.indexOf(over.id);

            setPreviews(prev => arrayMove(prev, oldIndex, newIndex));
            setSelectedFiles(prev => arrayMove(prev, oldIndex, newIndex));
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            // Find all items belonging to these groups
            const activeGroupItems = groupedMedia.find(g => g.name === active.id)?.items || [];
            const overGroupItems = groupedMedia.find(g => g.name === over.id)?.items || [];
            
            if (activeGroupItems.length === 0 || overGroupItems.length === 0) return;

            // Move the entire active group relative to the over group
            // This is complex with a flat list, but we can do it by finding indices
            const oldIndex = media.findIndex(m => m.id === activeGroupItems[0].id);
            const newIndex = media.findIndex(m => m.id === overGroupItems[0].id);

            const newArray = arrayMove(media, oldIndex, newIndex);
            setMedia(newArray);

            try {
                const reorderData = newArray.map((item, index) => ({
                    id: item.id,
                    sort_order: index
                }));
                await agentApi.reorderFacilityMedia(reorderData);
            } catch (error) {
                toast.error('Failed to save order');
                fetchMedia();
            }
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 pb-2">
                <div className="lg:min-w-[280px]">
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-[color-mix(in_srgb,var(--primary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--primary-color),transparent_90%)] backdrop-blur-md rounded-admin flex items-center justify-center shadow-sm border border-[color-mix(in_srgb,var(--primary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--primary-color),transparent_80%)]">
                            <PhotoIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        Facility & Building Images
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage general images for buildings and property facilities.</p>
                </div>
                {/* Stats / Spacer */}
                <div className="flex-1"></div>
                <div className="hidden lg:block lg:min-w-[280px]"></div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center space-x-2 h-[34px] w-full lg:w-auto">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Show</span>
                    <div className="w-16">
                        <StyledSelect
                            options={[{ value: 5, label: '5' }, { value: 10, label: '10' }, { value: 20, label: '20' }, { value: 50, label: '50' }]}
                            value={pageSize}
                            onChange={(val) => setPageSize(Number(val))}
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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search collections..."
                            className="input-field pl-10 pr-4 h-[34px] min-h-0 text-[11px]"
                        />
                    </div>
                    {canUpdate && (
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="btn-primary w-full sm:w-auto px-4 h-[34px] text-[12px] flex items-center justify-center gap-2 whitespace-nowrap transition-all active:scale-95 shadow-sm"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Upload New Images
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            {media.length === 0 ? (
                <EmptyState
                    icon={PhotoIcon}
                    title="No Facility Images"
                    description="Start by uploading images of your building, gym, pool, or other facilities."
                    actionText={canUpdate ? "Upload Images" : undefined}
                    onAction={canUpdate ? () => setIsUploadModalOpen(true) : undefined}
                />
            ) : (
                <div className="bg-white dark:bg-dashboard-card rounded-admin border-admin overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse divide-y divide-gray-100 dark:divide-gray-700">
                                <thead>
                                    <tr className="bg-[#F9FAFB] dark:bg-gray-800/50">
                                        <th className="px-6 py-3 text-[11px] font-bold text-[#6B7280] dark:text-gray-400 tracking-wider whitespace-nowrap">Unit Name</th>
                                        <th className="px-6 py-3 text-[11px] font-bold text-[#6B7280] dark:text-gray-400 tracking-wider whitespace-nowrap">Image Count</th>
                                        <th className="px-6 py-3 text-right text-[11px] font-bold text-[#6B7280] dark:text-gray-400 tracking-wider whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <SortableContext
                                    items={paginatedGroups.map(i => i.name)}
                                    strategy={rectSortingStrategy}
                                >
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {paginatedGroups.map((group) => (
                                            <SortableTableRow
                                                key={group.name}
                                                group={group}
                                                onDelete={handleDelete}
                                                onEdit={(group) => {
                                                    setEditingItem(group);
                                                    setEditName(group.name);
                                                    setIsEditModalOpen(true);
                                                }}
                                                canUpdate={canUpdate}
                                                canDelete={canDelete}
                                            />
                                        ))}
                                    </tbody>
                                </SortableContext>
                            </table>
                        </div>
                    </DndContext>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing <span className="font-bold text-gray-900 dark:text-white">{pageIndex * pageSize + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min((pageIndex + 1) * pageSize, filteredGroups.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{filteredGroups.length}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setPageIndex(0)} disabled={pageIndex === 0} className="p-2 border-admin rounded-admin hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all text-gray-400 outline-none">
                                <ChevronDoubleLeftIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => setPageIndex(prev => Math.max(0, prev - 1))} disabled={pageIndex === 0} className="p-2 border-admin rounded-admin hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all text-gray-400 outline-none">
                                <ChevronLeftIcon className="w-4 h-4" />
                            </button>
                            <div className="flex items-center space-x-2">
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold tracking-wider">Page</span>
                                <input 
                                    type="number" 
                                    min={1} 
                                    max={pageCount} 
                                    value={pageIndex + 1} 
                                    onChange={(e) => {
                                        const val = e.target.value ? Number(e.target.value) - 1 : 0;
                                        setPageIndex(Math.max(0, Math.min(val, pageCount - 1)));
                                    }} 
                                    className="w-12 h-9 border-admin rounded-admin bg-white dark:bg-dashboard-input text-center text-[13px] font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all no-spinner" 
                                />
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">of {pageCount || 1}</span>
                            </div>
                            <button onClick={() => setPageIndex(prev => Math.min(pageCount - 1, prev + 1))} disabled={pageIndex >= pageCount - 1} className="p-2 border-admin rounded-admin hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all text-gray-400 outline-none">
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => setPageIndex(pageCount - 1)} disabled={pageIndex >= pageCount - 1} className="p-2 border-admin rounded-admin hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all text-gray-400 outline-none">
                                <ChevronDoubleRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>


            )}

            {/* Edit Modal (Collection Manager) */}
            {isEditModalOpen && editingItem && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsEditModalOpen(false)}
                    />
                    <div className="relative bg-white dark:bg-dashboard-card w-full max-w-5xl h-[90vh] flex flex-col rounded-admin shadow-2xl overflow-hidden animate-scale-in">
                        {/* Header */}
                        <div className="flex-none px-8 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-dashboard-card z-10 sticky top-0">
                            <div>
                                <h3 className="text-[16px] font-bold text-gray-900 dark:text-white leading-tight">{canUpdate ? "Edit Collection" : "View Collection"}</h3>
                                <p className="text-[10px] text-gray-500 mt-0.5">Managing: <span className="text-primary-600 font-bold">{editingItem.name}</span></p>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body - Identical to Upload Modal Layout */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                {/* Left Column: Info & Name */}
                                <div className="md:col-span-4 space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Collection Details</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {canUpdate 
                                                ? "Update the unit name for this collection. This will apply to all images within this group."
                                                : "View the details of this collection, including images and unit name."
                                            }
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">
                                            Unit name
                                        </label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="e.g. Unit 101, Lobby, Swimming Pool"
                                            className="input-field px-4 py-3 rounded-admin disabled:opacity-60 disabled:cursor-not-allowed"
                                            disabled={!canUpdate}
                                        />
                                    </div>

                                    {canUpdate && (
                                        <div className="p-4 bg-[color-mix(in_srgb,var(--primary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--primary-color),transparent_90%)] rounded-admin border border-[color-mix(in_srgb,var(--primary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--primary-color),transparent_80%)]">
                                            <p className="text-xs text-primary-700 dark:text-primary-400 leading-relaxed">
                                                <strong>Tip:</strong> Drag and drop images to change their display order. Changes are saved when you click Update.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Images Grid */}
                                <div className="md:col-span-8 space-y-4">
                                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">
                                        Collection Images ({editingItem.items.length + selectedFiles.length})
                                    </label>
                                    
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={(event) => {
                                            if (!canUpdate) return;
                                            const { active, over } = event;
                                            if (active.id !== over.id) {
                                                const oldIndex = editingItem.items.findIndex(i => i.url === active.id);
                                                const newIndex = editingItem.items.findIndex(i => i.url === over.id);
                                                if (oldIndex !== -1 && newIndex !== -1) {
                                                    const newItems = arrayMove(editingItem.items, oldIndex, newIndex);
                                                    setEditingItem({ ...editingItem, items: newItems });
                                                }
                                            }
                                        }}
                                    >
                                        <SortableContext
                                            items={editingItem.items.map(i => i.url)}
                                            strategy={rectSortingStrategy}
                                        >
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                                {/* Existing Images */}
                                                {editingItem.items.map((img, idx) => (
                                                    <SortablePreviewItem
                                                        key={img.url}
                                                        id={img.url}
                                                        url={getMediaUrl(img.url)}
                                                        index={idx}
                                                        canUpdate={canUpdate}
                                                        showDelete={canDelete}
                                                        onRemove={() => {
                                                            setItemToDelete(img);
                                                            setDeleteType('edit_single');
                                                            setDeleteConfirmOpen(true);
                                                        }}
                                                    />
                                                ))}


                                                {/* New Previews (not uploaded yet) */}
                                                {previews.map((url, index) => (
                                                    <SortablePreviewItem
                                                        key={url}
                                                        id={url}
                                                        url={url}
                                                        index={index}
                                                        canUpdate={canUpdate}
                                                        showDelete={canUpdate}
                                                        onRemove={() => removeSelectedFile(index)}
                                                    />
                                                ))}
                                                
                                                {/* Add Button */}
                                                {canUpdate && (
                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="aspect-square rounded-admin border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:text-primary-500 hover:border-primary-500 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all group"
                                                    >
                                                        <PlusIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                                        <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Add More</span>
                                                    </button>
                                                )}
                                            </div>
                                        </SortableContext>
                                    </DndContext>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex-none p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between gap-4 mt-auto">
                            <button 
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    resetUploadState();
                                }}
                                className="px-8 h-12 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-admin"
                            >
                                {canUpdate ? "Cancel" : "Close"}
                            </button>
                            {canUpdate && (
                                <button
                                    onClick={async () => {
                                        try {
                                            setUploading(true);
                                            // 1. Upload new images if any
                                            if (selectedFiles.length > 0) {
                                                const uploadPromises = selectedFiles.map(file => uploadApi.uploadFacilityImage(file, editName));
                                                await Promise.all(uploadPromises);
                                            }
                                            
                                            // 2. Update names for existing images
                                            const updatePromises = editingItem.items.map(img => agentApi.updateFacilityMedia(img.id, { name: editName }));
                                            await Promise.all(updatePromises);

                                            // 3. Save new order
                                            const reorderData = editingItem.items.map((item, index) => ({
                                                id: item.id,
                                                sort_order: index
                                            }));
                                            if (reorderData.length > 0) {
                                                await agentApi.reorderFacilityMedia(reorderData);
                                            }

                                            toast.success('Collection updated successfully');
                                            setIsEditModalOpen(false);
                                            resetUploadState();
                                            fetchMedia();
                                        } catch (e) {
                                            console.error('Update error:', e);
                                            toast.error('Failed to update collection');
                                        } finally {
                                            setUploading(false);
                                        }
                                    }}
                                    disabled={uploading}
                                    className="px-10 h-12 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-admin shadow-lg shadow-primary-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                                >
                                    {uploading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                                    ) : (
                                        <CheckIcon className="w-5 h-5" />
                                    )}
                                    <span>Update Collection</span>
                                </button>
                            )}

                        </div>
                    </div>
                </div>,
                document.body
            )}





            {/* Upload Modal */}
            {isUploadModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => {
                            setIsUploadModalOpen(false);
                            resetUploadState();
                        }}
                    />
                    <div className="relative bg-white dark:bg-dashboard-card w-full max-w-5xl h-[85vh] flex flex-col rounded-admin shadow-2xl overflow-hidden animate-fade-up">
                        {/* Header */}
                        <div className="flex-none px-8 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-dashboard-card z-10 sticky top-0">
                            <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">Create New Collection</h3>
                            <button
                                onClick={() => {
                                    setIsUploadModalOpen(false);
                                    resetUploadState();
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                {/* Left Column: Info & Name */}
                                <div className="md:col-span-4 space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Image Details</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Provide a unit name for these images. If you upload multiple, they will be automatically numbered.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">
                                            Unit name
                                        </label>
                                        <input
                                            type="text"
                                            value={uploadName}
                                            onChange={(e) => setUploadName(e.target.value)}
                                            placeholder="e.g. Unit 101, Lobby, Swimming Pool"
                                            className="input-field px-4 py-3 rounded-admin"
                                        />
                                    </div>

                                    <div className="p-4 bg-[color-mix(in_srgb,var(--primary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--primary-color),transparent_90%)] rounded-admin border border-[color-mix(in_srgb,var(--primary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--primary-color),transparent_80%)]">
                                        <p className="text-xs text-primary-700 dark:text-primary-400 leading-relaxed">
                                            <strong>Tip:</strong> You can reorder images by dragging them in the main gallery after uploading.
                                        </p>
                                    </div>
                                </div>

                                {/* Right Column: Previews Grid */}
                                <div className="md:col-span-8 space-y-4">
                                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">
                                        Selected Images ({selectedFiles.length})
                                    </label>
                                    
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handlePreviewDragEnd}
                                    >
                                        <SortableContext
                                            items={previews}
                                            strategy={rectSortingStrategy}
                                        >
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">

                                                {previews.map((url, index) => (

                                                    <SortablePreviewItem
                                                        key={url}
                                                        url={url}
                                                        index={index}
                                                        onRemove={removeSelectedFile}
                                                    />
                                                ))}
                                                
                                                {/* Add Button integrated in grid */}
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="aspect-square rounded-admin border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:text-primary-500 hover:border-primary-500 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all group"
                                                >
                                                    <PlusIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                                    <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Add More</span>
                                                </button>
                                            </div>
                                        </SortableContext>
                                    </DndContext>

                                    
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex-none p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between gap-4 mt-auto">

                            <button 
                                onClick={() => {
                                    setIsUploadModalOpen(false);
                                    resetUploadState();
                                }}
                                className="px-8 h-12 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-admin"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={selectedFiles.length === 0 || uploading}
                                className={`
                                    flex-1 sm:flex-none sm:min-w-[240px] h-12 rounded-admin text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2
                                    ${selectedFiles.length === 0 || uploading
                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/20 active:scale-[0.98]'}
                                `}
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <ArrowUpTrayIcon className="w-4 h-4" />
                                        <span>Upload {selectedFiles.length} Images</span>
                                    </>
                                )}
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
                    setItemToDelete(null);
                }}
                onConfirm={confirmDelete}
                title={deleteType === 'group' ? 'Delete Collection' : 'Delete Image'}
                message={deleteType === 'group' 
                    ? "Are you sure you want to delete this entire facility collection? This action cannot be undone."
                    : "Are you sure you want to delete this facility image? This action cannot be undone."
                }
                confirmText="Delete"
                cancelText="Cancel"
                isDestructive={true}
            />
        </div>
    );
};

export default FacilityManagement;
