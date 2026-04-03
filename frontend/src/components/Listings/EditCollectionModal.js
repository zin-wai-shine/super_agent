import React, { useState, useRef, useEffect } from 'react';
import { collectionApi, uploadApi } from '../../services/api';
import { 
    XMarkIcon, 
    PhotoIcon, 
    CloudArrowUpIcon,
    TrashIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { getMediaUrl } from '../../utils/media';

const EditCollectionModal = ({ isOpen, onClose, onSuccess, collection }) => {
    const [name, setName] = useState('');
    const [images, setImages] = useState([]); // Array of { id, url, file, preview, isNew }
    const [loading, setLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && collection) {
            setName(collection.name || '');
            setImages(collection.media?.map(m => ({
                id: m.id,
                url: m.url,
                preview: getMediaUrl(m.url),
                isNew: false
            })) || []);
            setDeleteConfirm(false);
        }
    }, [isOpen, collection]);

    if (!isOpen || !collection) return null;

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            isNew: true
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (index) => {
        setImages(prev => {
            const updated = [...prev];
            if (updated[index].isNew) {
                URL.revokeObjectURL(updated[index].preview);
            }
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            await collectionApi.deleteCollection(collection.id);
            toast.success('Collection deleted');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to delete collection:', error);
            toast.error('Failed to delete collection');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Please enter a collection name');
            return;
        }

        try {
            setLoading(true);

            // 1. Upload new images first
            const finalMedia = [];
            
            // Keep existing media
            images.filter(img => !img.isNew).forEach(img => {
                finalMedia.push({
                    url: img.url,
                    type: 'image'
                });
            });

            // Upload new ones
            const newOnes = images.filter(img => img.isNew);
            if (newOnes.length > 0) {
                const uploadPromises = newOnes.map(img => 
                    uploadApi.uploadCollectionImage(collection.id, img.file)
                );
                const uploadResults = await Promise.all(uploadPromises);
                uploadResults.forEach(res => {
                    finalMedia.push({
                        url: res.data.url,
                        type: 'image'
                    });
                });
            }

            // 2. Update collection
            await collectionApi.updateCollection(collection.id, {
                name,
                media: finalMedia
            });

            toast.success('Collection updated successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update collection:', error);
            toast.error('Failed to update collection');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-dashboard-card w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Collection</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <XMarkIcon className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Collection Name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Luxury Condos"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-dashboard-dark border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-gray-900 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Building & Facilities Photos
                        </label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all group"
                        >
                            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 group-hover:text-primary-500 transition-colors mb-4" />
                            <p className="text-sm font-bold text-gray-900 dark:text-white">Add more images</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP supported</p>
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
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-6">
                                {images.map((img, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border dark:border-gray-800">
                                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                        {img.isNew && (
                                            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-green-500 text-[8px] text-white font-bold rounded uppercase">New</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {loading && !deleteConfirm ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <span>Save Changes</span>
                                )}
                            </button>
                        </div>

                        {!deleteConfirm ? (
                            <button
                                type="button"
                                onClick={() => setDeleteConfirm(true)}
                                className="w-full py-2 text-red-500 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                            >
                                Delete Collection
                            </button>
                        ) : (
                            <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2">
                                <div className="flex items-center space-x-3">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                                    <span className="text-sm font-bold text-red-600 dark:text-red-400">Are you sure?</span>
                                </div>
                                <div className="flex space-x-2">
                                    <button 
                                        type="button"
                                        onClick={() => setDeleteConfirm(false)}
                                        className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all"
                                    >
                                        No, Cancel
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleDelete}
                                        className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-sm"
                                    >
                                        Yes, Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCollectionModal;
