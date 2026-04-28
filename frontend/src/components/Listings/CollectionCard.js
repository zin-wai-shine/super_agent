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

    // Reduced stagger delay (from 100ms to 50ms) to make revealed cards pop in faster
    const delay = `${index * 50}ms`;

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
            <div className={`relative aspect-[1/1] md:aspect-[4/3] rounded-[23px] overflow-hidden mb-3 transition-all duration-300 ${isSelected ? 'ring-1 ring-primary-500/20' : ''}`}>
                {/* Image Section: Slides left-to-right INSIDE the container */}
                {firstImage ? (
                    <div 
                        className={`w-full h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 ${animateEntrance ? 'opacity-0 animate-reveal-left' : ''}`} 
                        style={{ 
                            backgroundImage: `url(${getMediaUrl(firstImage)})`,
                            animationDelay: animateEntrance ? delay : '0ms'
                        }}
                    />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800/50 text-gray-300 ${animateEntrance ? 'opacity-0 animate-fillIn' : ''}`}
                         style={animateEntrance ? { animationDelay: delay } : {}}>
                        <FolderIcon className="w-12 h-12" />
                    </div>
                )}

                {/* Edit Action */}
                {!readOnly && canEdit && (
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onEdit) onEdit(collection);
                            }}
                            className="p-1.5 bg-white/95 backdrop-blur-sm rounded-full text-gray-700 hover:text-primary-600 shadow-md"
                        >
                            <PencilSquareIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Text Content */}
            <div className={`px-1 ${animateEntrance ? 'opacity-0 animate-fillIn' : ''}`}
                 style={animateEntrance ? { animationDelay: delay } : {}}>
                <p className="text-[13px] text-gray-500 font-medium">
                    {collection.listings_count || 0} properties
                </p>
                <h3 className={`text-[14px] font-semibold leading-snug transition-colors ${isSelected ? 'text-primary-600' : 'text-[#222222] dark:text-white'}`}>
                    {collection.name}
                </h3>
            </div>
        </div>
    );
};

export default CollectionCard;
