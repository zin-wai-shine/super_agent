import React, { useState, useRef, useEffect } from 'react';
import { collectionApi, uploadApi } from '../../services/api';
import { 
    XMarkIcon, 
    PhotoIcon, 
    CloudArrowUpIcon,
    TrashIcon
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
} from '@dnd-kit/sortable';
import toast from 'react-hot-toast';
import { getMediaUrl } from '../../utils/media';
import StyledSelect from '../Form/StyledSelect';
import IconPicker from './IconPicker';
import SortableImage from './SortableImage';

const CreateCollectionModal = ({ isOpen, onClose, onSuccess, type = 'child', defaultParentId = '' }) => {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('BsFolder');
    const [parentId, setParentId] = useState('');
    const [newParentName, setNewParentName] = useState('');
    const [showNewParentInput, setShowNewParentInput] = useState(false);
    const [availableParents, setAvailableParents] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const isParentType = type === 'parent';

    useEffect(() => {
        if (isOpen) {
            setName('');
            setIcon('BsFolder');
            setParentId(defaultParentId || '');
            setNewParentName('');
            setShowNewParentInput(false);
            setImages([]);
            if (!isParentType) {
                fetchAvailableParents();
            }
        }
    }, [isOpen, defaultParentId, isParentType]);

    const fetchAvailableParents = async () => {
        try {
            const response = await collectionApi.getCollections();
            const parents = (response.data || []).filter(c => !c.parent_id && !!c.icon);
            setAvailableParents(parents.map(p => ({ value: p.id, label: p.name })));
        } catch (error) {
            console.error('Failed to fetch parents:', error);
        }
    };



    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            id: `new-${Date.now()}-${Math.random()}`,
            file,
            preview: URL.createObjectURL(file),
            isNew: true
        }));
        setImages(prev => [...prev, ...newImages]);
    };

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

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setImages((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const removeImage = (id) => {
        setImages(prev => {
            const img = prev.find(i => i.id === id);
            if (img?.preview && img.isNew) {
                URL.revokeObjectURL(img.preview);
            }
            return prev.filter(i => i.id !== id);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Please enter a collection name');
            return;
        }

        try {
            setLoading(true);
            
            let finalParentId = parentId;

            if (showNewParentInput && newParentName.trim()) {
                const { data: newParent } = await collectionApi.createCollection({ 
                    name: newParentName.trim(),
                    parent_id: null 
                });
                finalParentId = newParent.id;
            }

            const { data: collection } = await collectionApi.createCollection({ 
                name,
                icon: isParentType ? icon : '',
                parent_id: isParentType ? null : (finalParentId === 'virtual-popular' ? null : (finalParentId || null))
            });

            if (!isParentType && images.length > 0) {
                const uploadPromises = images.map(img => 
                    uploadApi.uploadCollectionImage(collection.id, img.file)
                );
                await Promise.all(uploadPromises);
            }

            toast.success('Collection created successfully!');
            onSuccess(collection);
            onClose();
        } catch (error) {
            console.error('Failed to create collection:', error);
            toast.error('Failed to create collection');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-dashboard-card w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {isParentType ? 'Create Main Category' : 'Create New Collection'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <XMarkIcon className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {!isParentType && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Parent Collection (Optional)
                            </label>
                            <StyledSelect
                                options={[
                                    { value: 'virtual-popular', label: 'Popular Collections' },
                                    ...availableParents
                                ]}
                                value={parentId || 'virtual-popular'}
                                onChange={setParentId}
                                placeholder="Select main category"
                            />
                        </div>
                    )}

                    {showNewParentInput && !isParentType && (
                        <div className="animate-in slide-in-from-top-2 duration-200">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                New Parent Collection Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Popular Collections, Budget Friendly"
                                value={newParentName}
                                onChange={(e) => setNewParentName(e.target.value)}
                                className="w-full px-4 py-3 bg-primary-50/30 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-gray-900 dark:text-white"
                                required={showNewParentInput}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            {isParentType ? 'Main Category Name' : 'Collection Name'}
                        </label>
                        <input
                            type="text"
                            placeholder={isParentType ? "e.g. Popular Collections" : "e.g. Luxury Condos"}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-dashboard-dark border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-[15px] font-medium text-gray-900 dark:text-white"
                            required
                        />
                    </div>

                    {isParentType && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Select Icon
                            </label>
                            <IconPicker selectedIcon={icon} onSelect={setIcon} />
                        </div>
                    )}

                    {!isParentType && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Building & Facilities Photos
                            </label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all group"
                            >
                                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 group-hover:text-primary-500 transition-colors mb-4" />
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Click to upload images</p>
                                <p className="text-xs text-gray-500 mt-1">Multi-upload supported (PNG, JPG, WebP)</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>

                            {images.length > 0 && (
                                <DndContext 
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <div className="mt-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Order Photos (Drag to reorder)
                                            </label>
                                            <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500 italic">
                                                First image is cover
                                            </span>
                                        </div>
                                        <SortableContext 
                                            items={images.map(img => img.id)}
                                            strategy={rectSortingStrategy}
                                        >
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                                {images.map((img) => (
                                                    <SortableImage 
                                                        key={img.id} 
                                                        id={img.id} 
                                                        img={img} 
                                                        onRemove={() => removeImage(img.id)} 
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </div>
                                </DndContext>
                            )}
                        </div>
                    )}

                    <div className="flex space-x-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-[34px] border border-gray-200 dark:border-gray-700 rounded-[3px] text-gray-700 dark:text-gray-300 text-[13px] font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] h-[34px] bg-primary-600 hover:bg-primary-700 text-white rounded-[3px] text-[13px] font-bold shadow-lg shadow-primary-600/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <span>Create Collection</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCollectionModal;
