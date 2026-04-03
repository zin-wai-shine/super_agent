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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dashboard-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add to Collection</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <XMarkIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Search */}
                    <div className="relative mb-6">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search or find collection..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dashboard-dark border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all text-gray-900 dark:text-white placeholder-gray-400"
                        />
                    </div>

                    {/* Collection List */}
                    <div className="space-y-2 max-height-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                        ) : filteredCollections.length > 0 ? (
                            filteredCollections.map((collection) => (
                                <button
                                    key={collection.id}
                                    onClick={() => handleAddToCollection(collection.id)}
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 group transition-all"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                                            <FolderIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 transition-colors" />
                                        </div>
                                        <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-primary-700 dark:group-hover:text-primary-400">
                                            {collection.name}
                                        </span>
                                    </div>
                                    <PlusIcon className="w-5 h-5 text-gray-300 group-hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FolderIcon className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">No collections found</p>
                            </div>
                        )}
                    </div>

                    {/* Create New Toggle */}
                    {!isCreating && filteredCollections.length === 0 && (
                         <button 
                            onClick={() => setIsCreating(true)}
                            className="mt-6 w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:border-primary-500 hover:text-primary-600 transition-all text-sm font-medium"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Create "{searchTerm || 'New'}" Collection</span>
                        </button>
                    )}

                    {isCreating || (searchTerm && filteredCollections.length === 0) ? (
                        <form onSubmit={handleCreateCollection} className="mt-6 animate-in slide-in-from-top-2 duration-300">
                             <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter new collection name..."
                                    value={newCollectionName || searchTerm}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-dashboard-dark border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all text-gray-900 dark:text-white"
                                    autoFocus
                                />
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary-600/20"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default AddToCollectionModal;
