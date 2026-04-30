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

const AllCategoriesModal = ({ isOpen, onClose, categories, selectedId }) => {
    const navigate = useNavigate();

    const [isExpanded, setIsExpanded] = React.useState(false);
    const scrollContainerRef = React.useRef(null);

    // Handle scroll to expand modal on mobile
    const handleScroll = (e) => {
        if (window.innerWidth < 640) { // Only on mobile
            if (e.target.scrollTop > 10) {
                if (!isExpanded) setIsExpanded(true);
            } else if (e.target.scrollTop === 0) {
                // Optional: contract if scrolled back to top
                // setIsExpanded(false);
            }
        }
    };

    // Reset expansion state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setIsExpanded(false);
        }
    }, [isOpen]);

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
                {/* Desktop Close Button (Floating Above) */}
                <button
                    onClick={onClose}
                    className="hidden sm:flex absolute -top-12 right-0 w-10 h-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/80 text-white shadow-lg transition-all active:scale-95 group z-[2010]"
                >
                    <XMarkIcon className="w-6 h-6 stroke-[2.5] transition-transform group-hover:rotate-90" />
                </button>

                {/* Main Content Box */}
                <div className={`relative w-full bg-white dark:bg-dashboard-card rounded-t-[20px] sm:rounded-[28px] shadow-[0_32px_128px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col transition-all duration-500 ease-in-out border border-black/[0.03] dark:border-white/5
                    ${isExpanded ? 'h-[90vh]' : 'h-[65vh]'} sm:h-[80vh] max-h-[90vh]
                `}>
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="sm:hidden absolute top-4 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/80 dark:bg-white/10 text-gray-500 dark:text-gray-400 active:scale-95 transition-all z-[30]"
                        aria-label="Close"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                
                    {/* Pull Handle (Mobile Only) */}
                    <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full" />
                    </div>

                    <div className="flex-1 flex flex-col sm:flex-row overflow-hidden min-h-0 h-full">
                        
                        {/* Left Column (Desktop Only - Blank) */}
                        <div className="hidden sm:flex sm:w-[55%] sm:min-w-0 relative bg-gray-50/30 dark:bg-white/[0.01] p-0 sm:p-4 sm:pr-2 overflow-hidden">
                            <div className="w-full h-full flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                                <FolderIcon className="w-64 h-64" />
                            </div>
                        </div>

                        {/* Right Column (Category Selection Sidebar) */}
                        <div className="w-full sm:w-[45%] sm:min-w-0 flex flex-col bg-white dark:bg-dashboard-card min-h-0 flex-1 p-0 sm:p-4 sm:pl-2">
                            <div className="flex-1 min-h-0 w-full flex flex-col bg-white dark:bg-dashboard-card sm:rounded-[20px] overflow-hidden sm:border sm:border-gray-900/5 dark:sm:border-white/5 sm:shadow-sm transition-all duration-300">
                                
                                {/* Sidebar Header */}
                                <div className="p-4 sm:pt-4 sm:px-4 sm:pb-2 flex-shrink-0 bg-white dark:bg-dashboard-card z-10">
                                    <div className="relative flex items-center min-h-[48px] w-full overflow-hidden">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shadow-sm">
                                                <FolderIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <h2 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight whitespace-nowrap">Explore Categories</h2>
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden sm:block px-5 pb-3">
                                    <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Select Category</span>
                                </div>

                                {/* List Content */}
                                <div 
                                    onScroll={handleScroll}
                                    className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-5 pb-6 pt-2 sm:pt-0"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {categories.map((category) => {
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

                                            const isActive = selectedId === category.id;

                                            return (
                                                <button 
                                                    key={category.id}
                                                    onClick={() => {
                                                        navigate(`/collections/${category.id}`, { state: { loadingType: 'icon' } });
                                                        onClose();
                                                    }}
                                                    className={`flex items-center gap-3 w-full pl-2 pr-4 py-2 rounded-full border transition-all duration-300 text-left group min-h-[48px] overflow-hidden ${
                                                        isActive 
                                                        ? 'bg-primary-50/80 dark:bg-primary-900/10 border-primary-600/30 dark:border-primary-500/30 shadow-sm' 
                                                        : 'bg-gray-50/50 dark:bg-white/[0.02] border-transparent hover:bg-gray-100/80 dark:hover:bg-white/5'
                                                    }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 overflow-hidden shadow-sm ${
                                                        isActive
                                                        ? 'bg-white dark:bg-primary-800 border-primary-600 text-primary-600 dark:text-primary-400'
                                                        : 'bg-white dark:bg-white/5 border-transparent text-gray-500 group-hover:border-primary-600 group-hover:text-primary-600'
                                                    } border`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <span className={`text-[14px] font-medium truncate transition-colors ${
                                                        isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white group-hover:text-primary-600'
                                                    }`}>
                                                        {category.name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllCategoriesModal;

