import React, { useState, useMemo, useEffect, useRef } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { getMediaUrl } from '../../utils/media';

const FilterSearchModal = ({ 
    isOpen, 
    onClose, 
    title, 
    subtitle,
    items = [], 
    selectedId, 
    onSelect, 
    placeholder = 'Search...',
    allLabel = 'All',
    icon: TitleIcon
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef(null);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
            // Focus input after animation
            setTimeout(() => inputRef.current?.focus(), 300);
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
            setSearchTerm('');
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [isOpen]);

    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return items;
        const q = searchTerm.toLowerCase();
        return items.filter(item =>
            item.name?.toLowerCase().includes(q) ||
            item.subtitle?.toLowerCase().includes(q)
        );
    }, [items, searchTerm]);

    const handleSelect = (id) => {
        onSelect(id);
        onClose();
    };

    return (
        <div className={`fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden transition-all duration-500 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-black/60 backdrop-blur-[8px] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className={`relative w-full sm:max-w-[70vw] flex flex-col transition-all duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] aria-hidden:hidden
                ${isOpen 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-full sm:translate-y-12 sm:scale-95 opacity-0'
                }
            `}>
                {/* Mobile Decorative Header */}
                <div className="absolute -top-10 inset-x-0 bottom-0 bg-primary-600/30 rounded-t-[24px] sm:hidden -z-10 blur-[1px]" />
                <div className="absolute -top-8 inset-x-0 bottom-0 bg-primary-600 rounded-t-[20px] sm:hidden -z-10 flex flex-col items-center shadow-[0_-8px_30px_rgba(0,0,0,0.1)]">
                    <div className="h-8 w-full flex flex-col items-center justify-center">
                        <h2 className="text-[14px] font-bold text-white tracking-[0.05em] leading-none">{title}</h2>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative w-full bg-white dark:bg-dashboard-card rounded-t-[24px] sm:rounded-[32px] shadow-[0_32px_128px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-[70vh] sm:h-auto max-h-[70vh] sm:max-h-[85vh] border border-black/[0.03] dark:border-white/5">
                    
                    {/* Pull Handle (Mobile) */}
                    <div className="flex justify-center pt-5 pb-1 sm:hidden flex-shrink-0">
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="px-6 pt-6 pb-6 sm:px-12 sm:pt-12 sm:pb-8 flex-shrink-0">
                        {/* Search Input - Matching Image 1/2 Design */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={placeholder}
                                className="block w-full pl-16 pr-12 py-4 bg-white dark:bg-dashboard-card border border-gray-200 dark:border-white/20 focus:border-primary-500 transition-all outline-none rounded-full text-[16px] font-normal text-gray-900 dark:text-white placeholder-gray-400"
                            />
                            <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                                <ChevronUpIcon className="h-5 w-5 text-gray-300" />
                            </div>
                        </div>
                    </div>

                    {/* Content List */}
                    <div className="px-6 sm:px-12 pb-12 overflow-y-auto custom-scrollbar-thin flex-1 scroll-smooth">
                        <div className="flex flex-col gap-4">
                            {/* All Option */}
                            <button
                                onClick={() => handleSelect('')}
                                className={`flex items-center w-full px-8 py-4 rounded-full border transition-all duration-300 text-left ${!selectedId 
                                    ? 'bg-white dark:bg-white/5 border-primary-500/30 text-primary-600 dark:text-primary-400 font-medium' 
                                    : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 text-gray-600 dark:text-gray-400 font-normal'
                                }`}
                            >
                                <span className="text-[15px] font-normal">{allLabel}</span>
                            </button>

                            {/* Item Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 mt-2">
                                {filteredItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleSelect(item.id)}
                                        className={`flex items-center gap-4 sm:gap-5 w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-full border transition-all duration-300 text-left group ${selectedId === item.id 
                                            ? 'bg-gray-50/50 dark:bg-white/2 border-primary-500/20' 
                                            : 'bg-gray-50/50 dark:bg-white/2 border-transparent hover:bg-white dark:hover:bg-white/5 hover:border-gray-200 dark:hover:border-white/10 hover:shadow-xl'
                                        }`}
                                    >
                                        <div className="flex-shrink-0 relative">
                                            {item.image ? (
                                                <img
                                                    src={getMediaUrl(item.image)}
                                                    alt=""
                                                    className={`w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-full border-2 ${selectedId === item.id ? 'border-primary-500' : 'border-white dark:border-white/10'} shadow-md group-hover:scale-110 transition-transform duration-500`}
                                                />
                                            ) : (
                                                <div className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shadow-inner transition-colors rounded-full ${selectedId === item.id 
                                                    ? 'bg-primary-500 text-white' 
                                                    : 'bg-white dark:bg-white/10 text-gray-400 group-hover:text-primary-600'
                                                }`}>
                                                    <span className="text-[13px] sm:text-[14px] font-normal tracking-tighter">{item.name?.substring(0, 2)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-[15px] sm:text-[16px] font-normal tracking-tight leading-snug ${selectedId === item.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                                                {item.name}
                                            </div>
                                            {item.subtitle && (
                                                <div className="text-[12px] text-gray-400 dark:text-gray-500 truncate font-normal mt-0.5">
                                                    {item.subtitle}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {filteredItems.length === 0 && (
                                <div className="py-20 text-center text-gray-300 dark:text-gray-600">
                                    <MagnifyingGlassIcon className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                    <p className="text-[16px] font-normal tracking-widest">No matching results</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterSearchModal;
