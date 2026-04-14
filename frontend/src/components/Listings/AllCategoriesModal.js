import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import * as BsIcons from 'react-icons/bs';
import * as MdIcons from 'react-icons/md';
import * as FaIcons from 'react-icons/fa';
import * as HiIcons from 'react-icons/hi2';
import * as Fa6Icons from 'react-icons/fa6';
import * as IoIcons from 'react-icons/io';
import * as Io5Icons from 'react-icons/io5';
import * as RiIcons from 'react-icons/ri';
import * as TbIcons from 'react-icons/tb';
import * as PiIcons from 'react-icons/pi';
import * as FiIcons from 'react-icons/fi';
import * as LuIcons from 'react-icons/lu';
import { FolderIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const AllCategoriesModal = ({ isOpen, onClose, categories }) => {
    const navigate = useNavigate();

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [isOpen]);

    // Don't return null here; instead, control visibility via classes for smooth transitions
    return (
        <div className={`fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden transition-all duration-500 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            {/* Soft Black Layer (Backdrop) */}
            <div 
                className={`absolute inset-0 bg-black/60 backdrop-blur-[4px] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Bottom Sheet Box (Mobile) / Modal (Desktop) */}
            <div className={`relative w-full sm:w-[70%] sm:max-w-none flex flex-col transition-all duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] will-change-transform
                ${isOpen 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-full sm:translate-y-4 sm:scale-95 opacity-0 sm:opacity-0'
                }
            `}>
                {/* Decorative Stacked Layers (Primary Color) - Extended down for depth */}
                <div className="absolute -top-10 inset-x-0 bottom-0 bg-primary-600/30 rounded-t-[24px] sm:hidden -z-10 blur-[1px]" />
                <div className="absolute -top-8 inset-x-0 bottom-0 bg-primary-600 rounded-t-[20px] sm:hidden -z-10 flex flex-col items-center shadow-[0_-8px_30px_rgba(0,0,0,0.1)]">
                    {/* Top Centered Header Area */}
                    <div className="h-8 w-full flex flex-col items-center justify-center">
                        <h2 className="text-[14px] font-bold text-white tracking-[0.05em] leading-none">Explore Categories</h2>
                    </div>

                </div>





                {/* Main Content Box */}
                <div className="relative w-full bg-white dark:bg-dashboard-card rounded-t-[20px] sm:rounded-[28px] shadow-2xl overflow-hidden flex flex-col h-[70vh] sm:h-[70vh] max-h-[90vh] sm:max-h-[70vh] border border-black/[0.03] dark:border-white/5">
                
                {/* Pull Handle (Mobile Only) */}
                <div className="flex justify-center pt-5 pb-2 sm:hidden flex-shrink-0">
                    <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full" />
                </div>

                {/* Header (Desktop only or for Close button) */}
                <div className="p-5 sm:p-4 sm:border-b sm:border-gray-100 sm:dark:border-white/5 flex-shrink-0 flex items-center justify-between">
                    <div className="flex flex-col sm:flex">
                        <h2 className="hidden sm:block text-[17px] font-semibold text-gray-900 dark:text-white tracking-[0.05em]">Explore Categories</h2>
                    </div>

                    {/* Close button only visible on Desktop */}
                    <button 
                        onClick={onClose}
                        className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>


                {/* Grid */}
                <div className="pt-6 px-6 sm:pt-6 sm:px-12 pb-10 overflow-y-auto scrollbar-hide flex-1">

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categories.map((category) => {
                            // Comprehensive icon resolver
                            const Icon = MdIcons[category.icon] || 
                                         FaIcons[category.icon] || 
                                         Fa6Icons[category.icon] ||
                                         HiIcons[category.icon] || 
                                         IoIcons[category.icon] ||
                                         Io5Icons[category.icon] ||
                                         RiIcons[category.icon] ||
                                         TbIcons[category.icon] ||
                                         PiIcons[category.icon] ||
                                         FiIcons[category.icon] ||
                                         LuIcons[category.icon] ||
                                         BsIcons[category.icon] || 
                                         FolderIcon;

                            return (
                                <div 
                                    key={category.id}
                                    onClick={() => {
                                        navigate(`/collections?category=${category.id}`);
                                        onClose();
                                    }}
                                    className="h-14 px-2.5 rounded-full bg-gray-50/80 dark:bg-white/5 border border-transparent hover:bg-gray-100/80 dark:hover:bg-white/10 cursor-pointer transition-all duration-300 flex items-center gap-3 group group-active:scale-[0.98]"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-gray-500 group-hover:text-primary-600 transition-colors">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[14px] font-medium text-[#222222] dark:text-gray-200 truncate group-hover:text-primary-600 transition-colors">
                                        {category.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
};

export default AllCategoriesModal;

