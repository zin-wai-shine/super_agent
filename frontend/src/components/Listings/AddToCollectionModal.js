import React, { useState, useEffect } from 'react';
import { collectionApi, BASE_URL } from '../../services/api';
import toast from 'react-hot-toast';
import { 
    XMarkIcon, 
    PlusIcon, 
    MagnifyingGlassIcon,
    FolderIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import * as BsIcons from 'react-icons/bs';
import * as MdIcons from 'react-icons/md';
import * as FaIcons from 'react-icons/fa';
import * as HiIcons from 'react-icons/hi2';

const AddToCollectionModal = ({ isOpen, onClose, listingId }) => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newCollectionName, setNewCollectionName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const response = await collectionApi.getCollections({ listing_id: listingId });
            setCollections(response.data || []);
        } catch (error) {
            console.error('Failed to fetch collections:', error);
            toast.error('Failed to load collections');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCollections();
        }
    }, [isOpen]);

    const handleToggleCollection = async (collectionId, isCurrentlySelected) => {
        try {
            if (isCurrentlySelected) {
                await collectionApi.removeListing(collectionId, listingId);
                toast.success('Removed from collection');
            } else {
                await collectionApi.addListing(collectionId, listingId);
                toast.success('Added to collection');
            }
            fetchCollections();
        } catch (error) {
            console.error('Failed to update collection:', error);
            toast.error('Failed to update collection');
        }
    };

    const handleCreateCollection = async (e) => {
        e.preventDefault();
        if (!newCollectionName.trim()) return;

        try {
            const response = await collectionApi.createCollection({ name: newCollectionName });
            const newCol = response.data;
            await handleToggleCollection(newCol.id, false);
        } catch (error) {
            console.error('Failed to create collection:', error);
            toast.error('Failed to create collection');
        }
    };

    const [activeTab, setActiveTab] = useState('image'); // 'image' or 'icon'

    const currentList = collections
        .filter(c => !c.is_parent) // Only show child collections
        .filter(c => {
            const matchesTab = activeTab === 'image' ? (c.media && c.media.length > 0) : (!c.media || c.media.length === 0);
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesTab && matchesSearch;
        });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px]">
            <div className="bg-white dark:bg-dashboard-card w-full max-w-4xl h-[650px] flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all animate-in fade-in zoom-in duration-300">
                
                {/* Header Section */}
                <div className="flex-none flex items-center justify-between px-8 py-3 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white">
                        Add to Collection
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                        <XMarkIcon className="w-5.5 h-5.5" />
                    </button>
                </div>

                {/* Sub-Header / Navigation - Matching The Perfect Button Radius */}
                <div className="px-8 py-3 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveTab('image')}
                            className={`px-6 h-10 rounded-full text-[13px] font-bold transition-all border ${
                                activeTab === 'image' 
                                ? 'bg-[color-mix(in_srgb,var(--primary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--primary-color),transparent_90%)] border-[color-mix(in_srgb,var(--primary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--primary-color),transparent_80%)] text-primary-600 shadow-sm' 
                                : 'bg-white dark:bg-white/5 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/10'
                            }`}
                        >
                            Image Base
                        </button>
                        <button
                            onClick={() => setActiveTab('icon')}
                            className={`px-6 h-10 rounded-full text-[13px] font-bold transition-all border ${
                                activeTab === 'icon' 
                                ? 'bg-[color-mix(in_srgb,var(--primary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--primary-color),transparent_90%)] border-[color-mix(in_srgb,var(--primary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--primary-color),transparent_80%)] text-primary-600 shadow-sm' 
                                : 'bg-white dark:bg-white/5 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/10'
                            }`}
                        >
                            Icon Base
                        </button>
                    </div>

                    <div className="flex items-center gap-3 flex-1 max-w-xl">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search collections..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 h-11 bg-white dark:bg-dashboard-dark border border-gray-200 dark:border-gray-700 rounded-3xl outline-none text-[13px] font-medium transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    {/* Collection Grid */}
                    <div className={`grid gap-4 ${
                        activeTab === 'image' 
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    }`}>
                        {loading ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                                <p className="mt-4 text-xs font-bold text-gray-400 tracking-tight">Syncing...</p>
                            </div>
                        ) : currentList.length > 0 ? (
                            currentList.map((collection) => {
                                const isSelected = collection.is_selected;
                                const hasMedia = collection.media && collection.media.length > 0;
                                
                                if (activeTab === 'icon') {
                                    const SavedIcon = MdIcons[collection.icon] || 
                                                     FaIcons[collection.icon] || 
                                                     HiIcons[collection.icon] || 
                                                     BsIcons[collection.icon] || 
                                                     FolderIcon;

                                    return (
                                        <button
                                            key={collection.id}
                                            onClick={() => handleToggleCollection(collection.id, isSelected)}
                                            className={`flex items-center gap-4 p-3 rounded-[1.5rem] bg-gray-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800 group relative`}
                                        >
                                            <div className="w-14 h-14 flex-none rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-sm">
                                                <SavedIcon className={`w-7 h-7 transition-colors ${isSelected ? 'text-emerald-500' : 'text-gray-400 group-hover:text-primary-500'}`} />
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <span className="block text-[14px] font-bold text-gray-900 dark:text-white truncate">
                                                    {collection.name}
                                                </span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-primary-500'}`}></span>
                                                    <span className="text-[11px] text-gray-400 font-bold">Folders</span>
                                                </div>
                                            </div>
                                            {/* Action Hint */}
                                            <div className={`w-8 h-8 flex-none rounded-full text-white flex items-center justify-center transition-all shadow-lg ${
                                                isSelected 
                                                ? 'bg-emerald-500 group-hover:bg-red-500 opacity-100' 
                                                : 'bg-primary-600 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'
                                            } pointer-events-none`}>
                                                {isSelected ? (
                                                    <div className="relative w-full h-full flex items-center justify-center">
                                                        <CheckCircleIcon className="w-4 h-4 transition-opacity group-hover:opacity-0" />
                                                        <XMarkIcon className="w-4 h-4 absolute opacity-0 group-hover:opacity-100" />
                                                    </div>
                                                ) : <PlusIcon className="w-4 h-4" />}
                                            </div>
                                        </button>
                                    );
                                }

                                const FallbackIcon = MdIcons[collection.icon] || 
                                                    FaIcons[collection.icon] || 
                                                    HiIcons[collection.icon] || 
                                                    BsIcons[collection.icon] || 
                                                    FolderIcon;

                                return (
                                    <button
                                        key={collection.id}
                                        onClick={() => handleToggleCollection(collection.id, isSelected)}
                                        className={`relative group flex flex-col p-2 transition-all overflow-hidden`}
                                    >
                                        <div className="w-full aspect-square rounded-[1.8rem] bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                                            {hasMedia ? (
                                                <img 
                                                    src={collection.media[0].url.startsWith('http') ? collection.media[0].url : `${BASE_URL}${collection.media[0].url}`} 
                                                    alt="" 
                                                    className={`w-full h-full object-cover ${isSelected ? 'opacity-70 grayscale-[0.3]' : ''}`} 
                                                />
                                            ) : (
                                                <FallbackIcon className={`w-12 h-12 transition-colors ${isSelected ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600 group-hover:text-primary-500'}`} />
                                            )}
                                        </div>
                                        
                                        <div className="mt-4 px-3 pb-2 text-left">
                                            <span className="block text-[14px] font-bold text-gray-900 dark:text-white truncate">
                                                {collection.name}
                                            </span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-500' : (hasMedia ? 'bg-emerald-500' : 'bg-primary-500')}`}></span>
                                                <span className="text-[11px] text-gray-400 dark:text-gray-500 font-bold">
                                                    {hasMedia ? 'Galleries' : 'Folders'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Hint */}
                                        <div className={`absolute top-4 right-4 w-9 h-9 rounded-full text-white flex items-center justify-center transition-all shadow-xl ${
                                            isSelected 
                                            ? 'bg-emerald-500 group-hover:bg-red-500 opacity-100' 
                                            : 'bg-primary-600 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'
                                        } pointer-events-none`}>
                                            {isSelected ? (
                                                <div className="relative w-full h-full flex items-center justify-center">
                                                    <CheckCircleIcon className="w-5 h-5 transition-opacity group-hover:opacity-0" />
                                                    <XMarkIcon className="w-5 h-5 absolute opacity-0 group-hover:opacity-100" />
                                                </div>
                                            ) : <PlusIcon className="w-5 h-5" />}
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2.5rem] bg-gray-50/50">
                                <FolderIcon className="w-12 h-12 text-gray-200 dark:text-gray-700 mb-4" />
                                <h3 className="text-sm font-bold text-gray-400 tracking-tight">No matching workspace</h3>
                            </div>
                        )}
                    </div>

                    {/* Create New Flow Overlay */}
                    {isCreating && (
                        <div className="mt-10 p-8 bg-primary-50/50 dark:bg-primary-500/5 rounded-[2.5rem] border border-primary-100 dark:border-primary-500/10 animate-in slide-in-from-bottom-4 duration-300">
                            <label className="text-[12px] font-bold text-primary-600 tracking-tight mb-4 block ml-1">Establish New Container</label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="text"
                                    placeholder="Enter collection name..."
                                    value={newCollectionName || searchTerm}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    className="flex-1 px-6 h-12 bg-white dark:bg-dashboard-dark border border-gray-200 dark:border-gray-700 rounded-3xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium"
                                    autoFocus
                                />
                                <div className="flex gap-3">
                                    <button 
                                        type="submit"
                                        disabled={!newCollectionName && !searchTerm}
                                        className="px-8 h-12 bg-primary-600 text-white rounded-3xl font-bold text-[13px] tracking-tight hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95 disabled:opacity-50"
                                    >
                                        Establish
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="px-6 h-12 bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-3xl font-bold text-[13px] tracking-tight border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddToCollectionModal;
