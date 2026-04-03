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
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-dashboard-card rounded-[32px] shadow-2xl overflow-hidden animate-slide-up border border-white/20 dark:border-white/5">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-white/5 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Explore All Categories</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Discover properties across all {categories.length} search filters</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all active:scale-90"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Grid */}
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categories.map((category) => {
                            // Comprehensive icon resolver to match the new IconPicker logic
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
                                    className="p-2 pr-4 rounded-full bg-gray-50 dark:bg-white/5 border border-transparent hover:border-primary-500/30 hover:bg-primary-50/20 dark:hover:bg-primary-500/10 cursor-pointer transition-all flex items-center gap-3 active:scale-[0.97] group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 transition-colors group-hover:bg-primary-100 dark:group-hover:bg-primary-900/60 flex-shrink-0">
                                        <Icon className="w-5 h-5 pointer-events-none" />
                                    </div>
                                    <span className="text-[14px] font-medium text-gray-900 dark:text-white truncate">
                                        {category.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm hover:opacity-90 transition-all shadow-xl active:scale-95"
                    >
                        Close Exploration
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AllCategoriesModal;
