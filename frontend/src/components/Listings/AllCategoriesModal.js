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
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-0 sm:p-4 bg-black/60">
            {/* Backdrop */}
            <div 
                className="absolute inset-0"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-dashboard-card rounded-t-[24px] sm:rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Explore Categories</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Discover properties across {categories.length} curated filters</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Grid */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
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
                                    className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-white/10 cursor-pointer transition-all flex items-center gap-3 group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-primary-600 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate group-hover:text-primary-600 transition-colors">
                                        {category.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-white/5 border-t border-gray-50 dark:border-gray-800 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-xs transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AllCategoriesModal;
