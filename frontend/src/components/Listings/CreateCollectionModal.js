import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { collectionApi, uploadApi, agentApi } from '../../services/api';
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
    const [availableListings, setAvailableListings] = useState([]);
    const [selectedListings, setSelectedListings] = useState([]);
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
            setSelectedListings([]);
            if (!isParentType) {
                fetchAvailableParents();
                fetchAvailableListings();
            }
        }
    }, [isOpen, defaultParentId, isParentType]);

    const fetchAvailableListings = async (search = '') => {
        try {
            const listingsRes = await agentApi.getListings({ search, limit: search ? 50 : 10 });
            const listingsArray = Array.isArray(listingsRes.data) ? listingsRes.data : (listingsRes.data?.listings || []);
            const allOptions = listingsArray.map(l => ({
                value: String(l.id),
                label: l.title || `Property #${l.id}`,
                listing: l
            }));
            setAvailableListings(allOptions);
        } catch (error) {
            console.error('Failed to fetch available listings:', error);
        }
    };

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

            if (!isParentType && selectedListings.length > 0) {
                await Promise.all(
                    selectedListings.map(item => collectionApi.addListing(collection.id, item.value))
                );
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

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`bg-white dark:bg-dashboard-card w-full rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] ${isParentType ? 'max-w-lg' : 'max-w-5xl'}`}>
                <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {isParentType ? 'Create Main Category' : 'Create New Collection'}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto p-6">
                        {isParentType ? (
                            /* Single-column layout for Main Category */
                            <div className="space-y-6">
                    {!isParentType && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Parent Collection (Optional)
                            </label>
                            <StyledSelect
                                options={[
                                    { value: 'virtual-popular', label: (() => {
                                        let popName = 'Popular Collections';
                                        try {
                                            const custom = JSON.parse(localStorage.getItem('popular_collection_custom'));
                                            if (custom) popName = custom.name || popName;
                                        } catch (e) {}
                                        return popName;
                                    })() },
                                    ...availableParents
                                ]}
                                value={parentId || 'virtual-popular'}
                                onChange={setParentId}
                                placeholder="Select main category"
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
                            </div>
                        ) : (
                            /* Two-column layout for child collections */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                    {!isParentType && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Parent Collection (Optional)
                            </label>
                            <StyledSelect
                                options={[
                                    { value: 'virtual-popular', label: (() => {
                                        let popName = 'Popular Collections';
                                        try {
                                            const custom = JSON.parse(localStorage.getItem('popular_collection_custom'));
                                            if (custom) popName = custom.name || popName;
                                        } catch (e) {}
                                        return popName;
                                    })() },
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

                    {!isParentType && (
                        <div className="z-50 relative">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Assigned Properties
                            </label>
                            <StyledSelect
                                isMulti={true}
                                options={availableListings}
                                value={selectedListings}
                                onChange={setSelectedListings}
                                returnObjects={true}
                                controlShouldRenderValue={false}
                                onInputChange={(val, { action }) => {
                                    if (action === 'input-change') fetchAvailableListings(val);
                                }}
                                placeholder="Search & select properties..."
                            />
                        </div>
                    )}

                    {!isParentType && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Building &amp; Facilities Photos
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
                                </div> {/* End Left Column */}

                                {/* Right Column: Selected Properties Preview */}
                                {!isParentType && (
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold" style={{ color: '#222222' }}>
                                            Selected Properties ({selectedListings.length})
                                        </label>
                                        <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto scrollbar-hide">
                                            {selectedListings.map(item => {
                                                const l = item.listing;
                                                return (
                                                    <div key={item.value} className="flex items-center gap-3 py-3">
                                                        {/* Rounded image */}
                                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                                            {l?.media?.[0]?.url ? (
                                                                <img src={getMediaUrl(l.media[0].url)} alt="preview" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <span className="text-[10px] text-gray-400">No Img</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Text */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold truncate" style={{ color: '#222222' }}>
                                                                {item.label}
                                                            </p>
                                                            <div className="text-[11px] mt-0.5 flex flex-wrap gap-x-2" style={{ color: '#222222' }}>
                                                                {l?.bedrooms > 0 && <span>{l.bedrooms} Beds</span>}
                                                                {l?.bathrooms > 0 && <span>{l.bathrooms} Baths</span>}
                                                                {l?.unit_size > 0 && <span>{l.unit_size} Sqm</span>}
                                                            </div>
                                                            <p className="text-[11px] font-medium mt-0.5" style={{ color: '#222222' }}>
                                                                {l?.price ? `$${l.price.toLocaleString()}` : ''}
                                                            </p>
                                                        </div>
                                                        {/* Remove button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedListings(prev => prev.filter(s => s.value !== item.value))}
                                                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-red-500"
                                                        >
                                                            <XMarkIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                            {selectedListings.length === 0 && (
                                                <div className="text-sm text-gray-400 text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                                    No properties selected yet.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-none px-6 py-4 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-dashboard-card">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary px-6 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Collection'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default CreateCollectionModal;
