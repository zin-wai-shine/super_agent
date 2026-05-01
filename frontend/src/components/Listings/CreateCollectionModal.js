import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { collectionApi, uploadApi, agentApi } from '../../services/api';
import { 
    XMarkIcon, 
    PhotoIcon, 
    CloudArrowUpIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    FolderIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { getMediaUrl } from '../../utils/media';
import StyledSelect from '../Form/StyledSelect';
import IconPicker from './IconPicker';

const CreateCollectionModal = ({ isOpen, onClose, onSuccess, type = 'child', defaultParentId = '' }) => {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('BsFolder');
    const [parentId, setParentId] = useState('');
    const [collectionType, setCollectionType] = useState('image'); // 'image' or 'icon'
    const [newParentName, setNewParentName] = useState('');
    const [showNewParentInput, setShowNewParentInput] = useState(false);
    const [availableParents, setAvailableParents] = useState([]);
    const [availableListings, setAvailableListings] = useState([]);
    const [selectedListings, setSelectedListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [facilityName, setFacilityName] = useState(null);
    const [facilityGroups, setFacilityGroups] = useState([]);
    const [allFacilityMedia, setAllFacilityMedia] = useState([]);

    const isParentType = type === 'parent';

    useEffect(() => {
        if (isOpen) {
            setName('');
            setIcon('BsFolder');
            setParentId(defaultParentId || '');
            setCollectionType('image');
            setNewParentName('');
            setShowNewParentInput(false);
            setSelectedListings([]);
            setFacilityName(null);
            if (!isParentType) {
                fetchAvailableParents();
                fetchAvailableListings();
                fetchFacilityGroups();
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
            const parents = (response.data || []).filter(c => c.is_parent);
            setAvailableParents(parents.map(p => ({ value: p.id, label: p.name, type: p.type || 'image' })));
        } catch (error) {
            console.error('Failed to fetch parents:', error);
        }
    };

    const fetchFacilityGroups = async () => {
        try {
            const response = await agentApi.getFacilityMedia();
            const media = response.data || [];
            setAllFacilityMedia(media);
            const groups = [...new Set(media.map(m => m.name))].filter(Boolean);
            setFacilityGroups(groups.map(g => ({ value: g, label: g })));
        } catch (error) {
            console.error('Failed to fetch facility groups:', error);
        }
    };

    const handleLinkFacility = (val) => {
        setFacilityName(val);
        if (val) {
            toast.success(`Facility collection set to ${val.value}`);
        }
    };
    // Auto-sync child type with parent type
    useEffect(() => {
        if (!isParentType && parentId) {
            const parent = availableParents.find(p => p.value === parentId);
            if (parent && parent.type) {
                setCollectionType(parent.type);
            }
        }
    }, [parentId, availableParents, isParentType]);

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
                type: isParentType ? collectionType : (availableParents.find(p => p.value === parentId)?.type || 'image'),
                is_parent: isParentType,
                icon: !isParentType && (availableParents.find(p => p.value === parentId)?.type === 'icon') ? icon : '',
                parent_id: isParentType ? null : (finalParentId || null),
                facility_name: facilityName?.value || facilityName || ''
            });



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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px]">
            <div className={`bg-white dark:bg-dashboard-card w-full rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-gray-200 dark:border-gray-800 transition-all ${isParentType ? 'max-w-md' : 'max-w-5xl'}`}>
                
                {/* Header Section */}
                <div className="flex-none flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-[17px] font-bold text-gray-900 dark:text-white">
                        {isParentType ? 'Create Main Category' : 'Create New Collection'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {isParentType ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Category Name</label>
                                    <input
                                        type="text"
                                        placeholder={isParentType ? "e.g. Popular Collections" : "e.g. Luxury Condos"}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-dashboard-dark border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-[14px] transition-all text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Category Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setCollectionType('image')}
                                            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${collectionType === 'image' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 hover:border-gray-300'}`}
                                        >
                                            <PhotoIcon className={`w-5 h-5 ${collectionType === 'image' ? 'text-primary-600' : 'text-gray-400'}`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-tight ${collectionType === 'image' ? 'text-primary-700' : 'text-gray-500'}`}>Image Based</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCollectionType('icon')}
                                            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${collectionType === 'icon' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 hover:border-gray-300'}`}
                                        >
                                            <FolderIcon className={`w-5 h-5 ${collectionType === 'icon' ? 'text-primary-600' : 'text-gray-400'}`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-tight ${collectionType === 'icon' ? 'text-primary-700' : 'text-gray-500'}`}>Icon Based</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Parent Category</label>
                                        <StyledSelect
                                            options={availableParents}
                                            value={parentId}
                                            onChange={setParentId}
                                            placeholder="Select parent category"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Collection Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Luxury Condos in Bangkok"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-2 bg-white dark:bg-dashboard-dark border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-1 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-[13px] transition-all text-gray-900 dark:text-white"
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
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Category Type (Inherited)</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${collectionType === 'image' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/5 opacity-40'}`}>
                                                <PhotoIcon className={`w-5 h-5 ${collectionType === 'image' ? 'text-primary-600' : 'text-gray-400'}`} />
                                                <span className={`text-[10px] font-bold uppercase tracking-tight ${collectionType === 'image' ? 'text-primary-700' : 'text-gray-500'}`}>Image Based</span>
                                            </div>
                                            <div className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${collectionType === 'icon' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/5 opacity-40'}`}>
                                                <CloudArrowUpIcon className={`w-5 h-5 ${collectionType === 'icon' ? 'text-primary-600' : 'text-gray-400'}`} />
                                                <span className={`text-[10px] font-bold uppercase tracking-tight ${collectionType === 'icon' ? 'text-primary-700' : 'text-gray-500'}`}>Icon Based</span>
                                            </div>
                                        </div>
                                    </div>

                                    {collectionType === 'image' ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Media Assets</label>
                                                <div className="w-64">
                                                    <StyledSelect
                                                        options={facilityGroups}
                                                        value={facilityName}
                                                        onChange={(val) => handleLinkFacility(val)}
                                                        placeholder="Add Facility..."
                                                        isClearable
                                                        isSearchable={true}
                                                    />
                                                </div>
                                            </div>
                                            
                                            {/* Facility Images Preview */}
                                            {facilityName && (
                                                <div className="bg-primary-50/30 dark:bg-primary-500/5 p-3 rounded-xl border border-primary-100 dark:border-primary-500/10">
                                                    <p className="text-[9px] font-bold text-primary-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <SparklesIcon className="w-3 h-3" />
                                                        Shared Collection: {facilityName?.value || facilityName} (Display Only)
                                                    </p>
                                                    <div className="grid grid-cols-4 gap-3">
                                                        {allFacilityMedia
                                                            .filter(m => m.name === (facilityName?.value || facilityName))
                                                            .map((item) => (
                                                                <div
                                                                    key={`fac-preview-${item.id}`}
                                                                    className="relative aspect-video rounded-[2px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 opacity-80"
                                                                >
                                                                    <img src={getMediaUrl(item.url)} alt="" className="w-full h-full object-cover" />
                                                                    <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded-[1px] text-[8px] text-white font-bold uppercase tracking-wider">
                                                                        Shared
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Visual Icon</label>
                                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800">
                                                <IconPicker selectedIcon={icon} onSelect={setIcon} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Selected Properties Preview */}
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block px-1">Preview Selection ({selectedListings.length})</label>
                                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-gray-800 min-h-[350px]">
                                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                                            {selectedListings.map(item => {
                                                const l = item.listing;
                                                return (
                                                    <div key={item.value} className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-dashboard-dark border border-gray-100 dark:border-gray-700 shadow-sm">
                                                        <div className="w-12 h-12 rounded-[2px] overflow-hidden flex-shrink-0 bg-gray-100">
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

                    <div className="flex-none px-6 py-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-[12px] hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name}
                            className="px-8 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl font-bold text-[12px] transition-colors shadow-sm"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                <span>{isParentType ? 'Create Category' : 'Create Collection'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default CreateCollectionModal;
