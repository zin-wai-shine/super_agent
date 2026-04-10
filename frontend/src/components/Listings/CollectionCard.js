import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getMediaUrl } from '../../utils/media';
import { FolderIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const CollectionCard = ({ 
    collection, 
    isSelected, 
    onSelect, 
    onEdit, 
    readOnly, 
    canEdit, 
    initialPath = '/listings',
    className = "",
    animateEntrance = false,
    index = 0
}) => {
    const navigate = useNavigate();
    const firstImage = collection.media?.find(m => m.type === 'image')?.url;

    // Reduced stagger delay (from 200ms to 100ms) to make revealed cards pop in faster
    const delay = `${index * 100}ms`;

    const handleClick = () => {
        if (onSelect) {
            onSelect(collection);
            navigate(`${initialPath}?collection_id=${collection.id}`);
        } else {
            // New dedicated full-page behavior for Public view
            navigate(`/collections/${collection.id}`);
        }
    };

    return (
        <div 
            className={`flex-shrink-0 group cursor-pointer ${className}`}
            onClick={handleClick}
        >
            <div className={`relative aspect-[1/1] md:aspect-[4/3] rounded-[24px] overflow-hidden mb-3 transition-all ${isSelected ? 'ring-2 ring-primary-500 shadow-lg' : 'border border-gray-100 dark:border-white/5 shadow-sm group-hover:border-primary-500/30'}`}>
                {/* Image Section */}
                {firstImage ? (
                    <div 
                        className={`w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105`} 
                        style={{ 
                            backgroundImage: `url(${getMediaUrl(firstImage)})`,
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-white/5 text-gray-300">
                        <FolderIcon className="w-10 h-10 mb-2 transition-transform group-hover:scale-110" />
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">Empty</span>
                    </div>
                )}

                {/* Edit Action */}
                {!readOnly && canEdit && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onEdit) onEdit(collection);
                            }}
                            className="w-9 h-9 bg-white/95 dark:bg-dashboard-card rounded-xl text-gray-900 dark:text-white hover:bg-primary-600 hover:text-white shadow-md flex items-center justify-center transition-colors"
                        >
                            <PencilSquareIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Text Content */}
            <div className="px-1">
                <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                        {collection.listings_count || 0} items
                    </p>
                </div>
                <h3 className={`text-sm font-bold leading-snug transition-colors group-hover:text-primary-600 ${isSelected ? 'text-primary-600' : 'text-gray-900 dark:text-white'}`}>
                    {collection.name}
                </h3>
            </div>
        </div>
    );
};

export default CollectionCard;
