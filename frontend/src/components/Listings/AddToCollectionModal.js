import React, { useState, useEffect } from 'react';
import { collectionApi } from '../../services/api';
import toast from 'react-hot-toast';
import { 
    XMarkIcon, 
    PlusIcon, 
    MagnifyingGlassIcon,
    FolderIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const AddToCollectionModal = ({ isOpen, onClose, listingId }) => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newCollectionName, setNewCollectionName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

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

    useEffect(() => {
        if (isOpen) {
            fetchCollections();
        }
    }, [isOpen]);

    const handleAddToCollection = async (collectionId) => {
        try {
            await collectionApi.addListing(collectionId, listingId);
            toast.success('Added to collection');
            onClose();
        } catch (error) {
            console.error('Failed to add to collection:', error);
            toast.error('Failed to add to collection');
        }
    };

    const handleCreateCollection = async (e) => {
        e.preventDefault();
        if (!newCollectionName.trim()) return;

        try {
            const response = await collectionApi.createCollection({ name: newCollectionName });
            const newCol = response.data;
            await handleAddToCollection(newCol.id);
        } catch (error) {
            console.error('Failed to create collection:', error);
            toast.error('Failed to create collection');
        }
    };

    const filteredCollections = (collections || []).filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/60">
            <div className="bg-white dark:bg-dashboard-card w-full max-w-md max-h-[85vh] flex flex-col rounded-b-[24px] sm:rounded-[24px] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 mt-10 sm:mt-0">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-6 border-b border-gray-50 dark:border-gray-800">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add to Collection</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Select a folder to organize listings</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {/* Search Section */}
                    <div className="relative mb-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search collection name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dashboard-dark border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Collection List */}
                    <div className="space-y-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <div className="w-8 h-8 border-2 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                            </div>
                        ) : filteredCollections.length > 0 ? (
                            filteredCollections.map((collection) => (
                                <button
                                    key={collection.id}
                                    onClick={() => handleAddToCollection(collection.id)}
                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 group transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700">
                                            <FolderIcon className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div className="text-left">
                                            <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                {collection.name}
                                            </span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                                                Folder
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlusIcon className="w-4 h-4" />
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                                <FolderIcon className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">No collections found</h3>
                                <p className="text-gray-500 text-xs mt-1">Create a new one below</p>
                            </div>
                        )}
                    </div>

                    {/* Create New Flow */}
                    {(!isCreating && (searchTerm || filteredCollections.length === 0)) ? (
                         <button 
                            onClick={() => setIsCreating(true)}
                            className="w-full mt-6 flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-primary-200 text-primary-600 rounded-xl text-sm font-bold hover:bg-primary-50 transition-colors"
                        >
                            <PlusIcon className="w-4 h-4" />
                            <span>Create New Collection</span>
                        </button>
                    ) : null}

                    {isCreating ? (
                        <form onSubmit={handleCreateCollection} className="mt-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">New Collection Name</label>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Enter name..."
                                    value={newCollectionName || searchTerm}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    className="w-full px-4 py-2 text-sm bg-white dark:bg-dashboard-dark border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button 
                                        type="submit"
                                        disabled={!newCollectionName && !searchTerm}
                                        className="flex-1 py-2 bg-primary-600 text-white rounded-lg font-bold text-xs hover:bg-primary-700 transition-colors"
                                    >
                                        Create & Add
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 rounded-lg font-bold text-xs"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default AddToCollectionModal;
