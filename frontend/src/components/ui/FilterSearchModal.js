import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

    return createPortal(
        <div className={`fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden transition-all duration-500 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-black/60 backdrop-blur-[8px] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className={`relative w-full sm:w-[70%] sm:max-w-none flex flex-col transition-all duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] aria-hidden:hidden
                ${isOpen 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-full sm:translate-y-12 sm:scale-95 opacity-0'
                }
            `}>
                {/* Mobile Decorative Header */}
                <div className="absolute -top-10 inset-x-0 bottom-0 bg-primary-600/30 rounded-t-[24px] sm:hidden -z-10 blur-[1px]" />
                <div className="absolute -top-8 inset-x-0 bottom-0 bg-primary-600 rounded-t-[20px] sm:hidden -z-10 flex flex-col items-center shadow-[0_-8px_30px_rgba(0,0,0,0.1)]">
                    <div className="h-8 w-full flex flex-col items-center justify-center">
                        <h2 className="text-[14px] font-bold text-white tracking-[0.05em] leading-none uppercase">{title}</h2>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative w-full bg-white dark:bg-dashboard-card rounded-t-[24px] sm:rounded-[28px] shadow-[0_32px_128px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-[85vh] sm:h-[70vh] max-h-[85vh] sm:max-h-[70vh] border border-black/[0.03] dark:border-white/5">
                    
                    {/* Pull Handle (Mobile) */}
                    <div className="flex justify-center pt-5 pb-1 sm:hidden flex-shrink-0">
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="p-5 sm:p-4 flex-shrink-0 border-b border-black/[0.03] dark:border-white/5">
                        <div className="flex flex-col sm:grid sm:grid-cols-3 sm:items-center gap-4">
                            {/* Left: Title (Desktop) */}
                            <div className="hidden sm:block">
                                <h2 className="text-[17px] font-semibold text-gray-900 dark:text-white tracking-[0.05em] leading-none">{title}</h2>
                            </div>

                            {/* Center: Search & Action (Desktop centered) / Right on Mobile */}
                            <div className="flex items-center gap-2 sm:justify-center">
                                {/* Search Input */}
                                <div className="relative group w-full sm:w-[420px]">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" />
                                    </div>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder={placeholder}
                                        className="block w-full h-[58px] sm:h-[42px] pl-12 pr-10 bg-gray-50/50 dark:bg-white/2 border border-gray-200/50 dark:border-white/10 focus:border-gray-800 dark:focus:border-white/30 transition-all outline-none rounded-full text-[15px] sm:text-[13px] font-normal text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    />
                                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                                        <ChevronUpIcon className="h-4 w-4 text-gray-300" />
                                    </div>
                                </div>

                                {/* All Option */}
                                <button
                                    onClick={() => handleSelect('')}
                                    className={`flex-shrink-0 flex items-center justify-center w-[58px] h-[58px] sm:w-[42px] sm:h-[42px] rounded-full border transition-all duration-300 text-center whitespace-nowrap text-[14px] sm:text-[13px] ${!selectedId 
                                        ? 'bg-primary-600 border-primary-600 text-white font-semibold shadow-lg shadow-primary-600/20' 
                                        : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-600 dark:text-gray-400 font-normal'
                                    }`}
                                >
                                    <span>{allLabel}</span>
                                </button>
                            </div>

                            {/* Right: Close Button (Desktop Only) */}
                            <div className="hidden sm:flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content List */}
                    <div className="pt-6 px-6 sm:pt-6 sm:px-12 pb-12 overflow-y-auto custom-scrollbar-thin flex-1 scroll-smooth">
                        <div className="flex flex-col gap-4">
                            {/* Item Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mt-2">
                                {filteredItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleSelect(item.id)}
                                        className={`flex items-center gap-3 w-full pl-2 pr-5 py-2 rounded-full border transition-all duration-300 text-left group ${selectedId === item.id 
                                            ? 'bg-gray-50 dark:bg-white/5 border-transparent shadow-sm' 
                                            : 'bg-gray-50/80 dark:bg-white/[0.03] border-transparent hover:bg-gray-50 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        {/* Icon Container - Matching Category style */}
                                        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 overflow-hidden shadow-sm bg-white dark:bg-white/10 ${
                                            selectedId === item.id ? ' ring-2 ring-primary-600/10' : ''
                                        }`}>
                                            {item.image ? (
                                                <img
                                                    src={getMediaUrl(item.image)}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className={`text-[13px] font-medium tracking-tight transition-colors duration-300 ${selectedId === item.id ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600'}`}>
                                                    {item.name?.substring(0, 2)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className={`text-[14px] sm:text-[15px] font-medium truncate tracking-tight leading-tight transition-colors duration-300 ${selectedId === item.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white group-hover:text-primary-600'}`}>
                                                {item.name}
                                            </div>
                                            {item.subtitle && (
                                                <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate font-normal mt-0.5">
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
        </div>,
        document.body
    );
};

export default FilterSearchModal;
