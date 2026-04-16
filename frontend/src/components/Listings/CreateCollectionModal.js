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
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/60">
            <div className="relative w-full sm:w-auto h-full sm:h-auto flex flex-col justify-start sm:justify-center items-center">
                {/* Desktop Close Button (Floating Above) */}
                <button
                    onClick={onClose}
                    className="hidden sm:flex absolute -top-12 right-0 w-10 h-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/80 text-white shadow-lg transition-all active:scale-95 group z-[2010]"
                >
                    <XMarkIcon className="w-6 h-6 stroke-[2.5] transition-transform group-hover:rotate-90" />
                </button>

                <div className={`bg-white dark:bg-dashboard-card w-full rounded-b-[24px] sm:rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800 ${isParentType ? 'max-w-lg mt-10 sm:mt-0' : 'max-w-5xl md:w-[90vw] lg:w-[80vw]'}`}>
                
                <div className="flex-none flex items-center justify-between px-8 py-6 border-b border-gray-50 dark:border-gray-800">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {isParentType ? 'Create Main Category' : 'Create New Collection'}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {isParentType ? 'Add a top-level organization unit' : 'Group specific properties together'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                        {isParentType ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Category Name</label>
                                    <input
                                        type="text"
                                        placeholder={isParentType ? "e.g. Popular Collections" : "e.g. Luxury Condos"}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-dashboard-dark border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-[15px] transition-all text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>

                                {isParentType && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Visual Icon</label>
                                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <IconPicker selectedIcon={icon} onSelect={setIcon} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Parent Category</label>
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
                                            placeholder="Select parent category"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Collection Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Luxury Condos in Bangkok"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-dashboard-dark border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-[15px] transition-all text-gray-900 dark:text-white"
                                            required
                                        />
                                    </div>

                                    <div className="z-50 relative space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Link Properties</label>
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
                                            placeholder="Search properties to link..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Media Assets</label>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/10 transition-all group"
                                        >
                                            <CloudArrowUpIcon className="w-8 h-8 text-gray-400 group-hover:text-primary-500 mb-2 transition-colors" />
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Click to Upload</p>
                                            <p className="text-[10px] text-gray-500 mt-1">PNG, JPG, WebP supported</p>
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
                                                <div className="mt-6 space-y-3">
                                                    <label className="text-[10px] font-bold text-primary-600 uppercase tracking-widest block px-1">
                                                        Images ({images.length}) - Drag to Sort
                                                    </label>
                                                    <SortableContext
                                                        items={images.map(img => img.id)}
                                                        strategy={rectSortingStrategy}
                                                    >
                                                        <div className="grid grid-cols-4 gap-3">
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
                                </div>

                                {/* Right Column: Selected Properties Preview */}
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block px-1">Preview Selection ({selectedListings.length})</label>
                                    <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 min-h-[350px]">
                                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                                            {selectedListings.map(item => {
                                                const l = item.listing;
                                                return (
                                                    <div key={item.value} className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-dashboard-dark border border-gray-100 dark:border-gray-700 shadow-sm">
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                            {l?.media?.[0]?.url ? (
                                                                <img src={getMediaUrl(l.media[0].url)} alt="preview" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <FolderIcon className="w-5 h-5 text-gray-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                                                                {item.label}
                                                            </p>
                                                            <p className="text-[10px] text-primary-600 font-bold mt-0.5">
                                                                {l?.price ? `$${l.price.toLocaleString()}` : 'Contact for Price'}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedListings(prev => prev.filter(s => s.value !== item.value))}
                                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <XMarkIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                            {selectedListings.length === 0 && (
                                                <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                                                    <MagnifyingGlassIcon className="w-10 h-10 mb-2 opacity-20" />
                                                    <p className="text-xs font-medium">No properties linked yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-none px-8 py-4 flex justify-end gap-3 border-t border-gray-50 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name}
                            className="flex items-center gap-2 px-8 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-colors shadow-lg shadow-primary-500/20"
                        >
                            {loading ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
    </div>
);

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default CreateCollectionModal;
