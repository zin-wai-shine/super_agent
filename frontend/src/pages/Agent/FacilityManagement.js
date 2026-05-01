import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { agentApi, uploadApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
    PlusIcon,
    TrashIcon,
    ArrowUpTrayIcon,
    PhotoIcon,
    XMarkIcon,
    ArrowsPointingOutIcon,
    PencilSquareIcon,
    CheckIcon,
    InboxIcon,
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
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getMediaUrl } from '../../utils/media';
import EmptyState from '../../components/Common/EmptyState';

const SortableTableRow = ({ group, onDelete, onEdit }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: group.name });

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
            className={`group border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${isDragging ? 'shadow-2xl' : ''}`}
        >
            <td className="py-4 pl-6 w-10">
                <div 
                    {...attributes} 
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-2 text-gray-300 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                >
                    <ArrowsPointingOutIcon className="w-5 h-5" />
                </div>
            </td>
            <td className="py-4 px-4 min-w-[300px]">
                <div className="flex flex-col">
                    <button
                        onClick={() => onEdit(group)}
                        className="text-base font-bold text-gray-900 dark:text-white hover:text-primary-600 transition-colors text-left group/name flex items-center gap-2"
                    >
                        {group.name}
                        <PencilSquareIcon className="w-4 h-4 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                    </button>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-medium">
                        Facility Collection
                    </span>
                </div>
            </td>
            <td className="py-4 px-4">
                <div className="inline-flex items-center px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full text-xs font-black uppercase tracking-tighter">
                    <PhotoIcon className="w-3.5 h-3.5 mr-1.5" />
                    {group.items.length} {group.items.length === 1 ? 'Image' : 'Images'}
                </div>
            </td>
            <td className="py-4 pr-6 text-right">
                <div className="flex items-center justify-end space-x-2">
                    <button
                        onClick={() => onEdit(group)}
                        className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all"
                        title="Edit Collection"
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onDelete(group)}
                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        title="Delete Collection"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </td>
        </tr>
    );
};





const SortablePreviewItem = ({ id, url, index, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: id || url });

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
            className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100 dark:border-gray-800 shadow-sm transition-all"
        >
            <img src={url} alt="Preview" className="w-full h-full object-cover" />
            
            {/* Drag Handle Overlay */}
            <div 
                {...attributes} 
                {...listeners}
                className="absolute inset-0 cursor-grab active:cursor-grabbing bg-black/0 hover:bg-black/10 transition-colors"
            />

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index);
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg backdrop-blur-sm z-10"
            >
                <XMarkIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

const FacilityManagement = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editName, setEditName] = useState('');
    
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploadName, setUploadName] = useState('');

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

    const handleDelete = async (item) => {
        if (!window.confirm('Are you sure you want to delete this?')) return;

        try {
            // If it's a group delete
            if (item.items) {
                const deletePromises = item.items.map(img => agentApi.deleteFacilityMedia(img.id));
                await Promise.all(deletePromises);
                setMedia(prev => prev.filter(m => m.name !== item.name));
                toast.success('Collection deleted');
            } else {
                // Single image delete
                await agentApi.deleteFacilityMedia(item.id);
                setMedia(prev => prev.filter(m => m.id !== item.id));
                toast.success('Image deleted');
            }
        } catch (error) {
            toast.error('Failed to delete');
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
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Facility & Building Images</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage general images for buildings and property facilities.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary-500/25 active:scale-95 space-x-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Upload New Images</span>
                </button>
            </div>

            {/* Content Area */}
            {media.length === 0 ? (
                <EmptyState
                    icon={PhotoIcon}
                    title="No Facility Images"
                    description="Start by uploading images of your building, gym, pool, or other facilities."
                    actionText="Upload Images"
                    onAction={() => setIsUploadModalOpen(true)}
                />
            ) : (
                <div className="bg-white dark:bg-dashboard-card rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                    <th className="py-4 pl-6 w-10"></th>
                                    <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit Name</th>
                                    <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Image Count</th>
                                    <th className="py-4 pr-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>

                            </thead>
                            <SortableContext
                                items={groupedMedia.map(i => i.name)}
                                strategy={rectSortingStrategy}
                            >
                                <tbody>
                                    {groupedMedia.map((group) => (
                                        <SortableTableRow
                                            key={group.name}
                                            group={group}
                                            onDelete={handleDelete}
                                            onEdit={(group) => {
                                                setEditingItem(group);
                                                setEditName(group.name);
                                                setIsEditModalOpen(true);
                                            }}
                                        />
                                    ))}
                                </tbody>
                            </SortableContext>
                        </table>
                    </DndContext>
                </div>


            )}

            {/* Edit Modal (Collection Manager) */}
            {isEditModalOpen && editingItem && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsEditModalOpen(false)}
                    />
                    <div className="relative bg-white dark:bg-dashboard-card w-full max-w-5xl h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                        {/* Header */}
                        <div className="flex-none px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-dashboard-card z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Collection</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Managing: <span className="text-primary-600 font-bold">{editingItem.name}</span></p>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
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
                                            Update the unit name for this collection. This will apply to all images within this group.
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
                                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/30">
                                        <p className="text-xs text-primary-700 dark:text-primary-400 leading-relaxed">
                                            <strong>Tip:</strong> Drag and drop images to change their display order. Changes are saved when you click Update.
                                        </p>
                                    </div>
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
                                                        onRemove={() => {
                                                            if (window.confirm('Delete this image?')) {
                                                                setEditingItem(prev => ({
                                                                    ...prev,
                                                                    items: prev.items.filter(i => i.id !== img.id)
                                                                }));
                                                                agentApi.deleteFacilityMedia(img.id);
                                                                setMedia(prev => prev.filter(m => m.id !== img.id));
                                                            }
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
                                                        onRemove={() => removeSelectedFile(index)}
                                                    />
                                                ))}
                                                
                                                {/* Add Button */}
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:text-primary-500 hover:border-primary-500 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all group"
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
                                    setIsEditModalOpen(false);
                                    resetUploadState();
                                }}
                                className="px-8 h-12 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
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
                                className="px-10 h-12 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                            >
                                {uploading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                                ) : (
                                    <CheckIcon className="w-5 h-5" />
                                )}
                                <span>Update Collection</span>
                            </button>

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
                    <div className="relative bg-white dark:bg-dashboard-card w-full max-w-5xl h-[85vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden animate-fade-up">
                        {/* Header */}
                        <div className="flex-none px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-dashboard-card z-10">



                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Collection</h3>
                            <button
                                onClick={() => {
                                    setIsUploadModalOpen(false);
                                    resetUploadState();
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
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
                                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/30">
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
                                                    className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:text-primary-500 hover:border-primary-500 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all group"
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
                                className="px-8 h-12 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={selectedFiles.length === 0 || uploading}
                                className={`
                                    flex-1 sm:flex-none sm:min-w-[240px] h-12 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2
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

        </div>
    );
};

export default FacilityManagement;
