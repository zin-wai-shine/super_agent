import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TrashIcon } from '@heroicons/react/24/outline';

const SortableImage = ({ id, img, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className="relative aspect-square rounded-[3px] overflow-hidden group border dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 touch-none"
        >
            <div 
                {...attributes} 
                {...listeners} 
                className="w-full h-full cursor-grab active:cursor-grabbing"
            >
                <img 
                    src={img.preview} 
                    alt="" 
                    className="w-full h-full object-cover pointer-events-none" 
                />
            </div>
            
            <button
                type="button"
                onClick={() => onRemove()}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 hover:bg-red-600"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
            
            {img.isNew && (
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-green-500 text-[8px] text-white font-bold rounded uppercase pointer-events-none">
                    New
                </div>
            )}
        </div>
    );
};

export default SortableImage;
