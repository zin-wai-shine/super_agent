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
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const inputRef = useRef(null);

    const [isExpanded, setIsExpanded] = useState(false);

    // Handle scroll to expand modal on mobile
    const handleScroll = (e) => {
        if (window.innerWidth < 640) { // Only on mobile
            if (e.target.scrollTop > 10) {
                if (!isExpanded) setIsExpanded(true);
            }
        }
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }
            // Focus input after animation on mobile or desktop search
            if (!isSearchExpanded) {
                setTimeout(() => inputRef.current?.focus(), 300);
            }
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '';
            setSearchTerm('');
            setIsSearchExpanded(false);
            setIsExpanded(false);
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '';
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
        <div className={`fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-6 transition-all duration-500 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-black/60 backdrop-blur-[8px] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal Box */}
            <div 
                role="dialog"
                className={`relative w-full sm:w-[85%] sm:max-w-none flex flex-col transition-all duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] 
                ${isOpen 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-full sm:translate-y-12 sm:scale-95 opacity-0'
                }
            `}>
                
                {/* Desktop Close Button (Floating Above) */}
                <button
                    onClick={onClose}
                    className="hidden sm:flex absolute -top-12 right-0 w-10 h-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/80 text-white shadow-lg transition-all active:scale-95 group z-[2010]"
                >
                    <XMarkIcon className="w-6 h-6 stroke-[2.5] transition-transform group-hover:rotate-90" />
                </button>

                {/* Main Content */}
                <div 
                    className={`relative w-full bg-white dark:bg-dashboard-card rounded-t-[28px] sm:rounded-[28px] overflow-hidden flex flex-col transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-2xl border border-white/10
                        ${isSearchExpanded ? 'h-[92dvh]' : 'h-[75dvh]'} sm:h-[85vh] sm:max-h-[85vh]
                    `}
                >
                    
                    {/* Pull Handle (Mobile) */}
                    <div className="flex justify-center pt-1.5 pb-0 sm:hidden flex-shrink-0">
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full" />
                    </div>

                    <div className="flex-1 flex flex-col sm:flex-row overflow-hidden min-h-0 h-full">
                        
                        {/* Left Column (Desktop Only - Blank as requested) */}
                        <div className="hidden sm:flex sm:w-[70%] sm:min-w-0 relative bg-gray-50/30 dark:bg-white/[0.01] p-0 sm:p-4 sm:pr-2 overflow-hidden">
                            <div className="w-full h-full flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                                {TitleIcon && (React.isValidElement(TitleIcon) ? 
                                    React.cloneElement(TitleIcon, { className: "w-64 h-64" }) : 
                                    <TitleIcon className="w-64 h-64" />
                                )}
                            </div>
                        </div>

                        {/* Right Column (Sidebar Selection) */}
                        <div className="w-full sm:w-[30%] sm:min-w-0 flex flex-col bg-white dark:bg-dashboard-card min-h-0 flex-1 p-0 sm:p-4 sm:pl-2">
                            <div className="flex-1 min-h-0 w-full flex flex-col bg-white dark:bg-dashboard-card sm:rounded-[20px] overflow-hidden sm:border sm:border-gray-900/5 dark:sm:border-white/5 sm:shadow-sm transition-all duration-300">
                                
                                {/* Sidebar Header (Title + Search) */}
                                <div className="px-4 pt-0 pb-2 sm:pt-4 sm:px-4 sm:pb-2 flex-shrink-0 bg-white dark:bg-dashboard-card z-10">
                                    <div className="relative flex items-center min-h-[44px] sm:min-h-[48px] w-full overflow-hidden">
                                        {/* Desktop Unified Title/Search Animation */}
                                        <div className={`hidden sm:flex items-center gap-3 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSearchExpanded ? 'opacity-0 -translate-x-full pointer-events-none' : 'opacity-100 translate-x-0'}`}>
                                            <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shadow-sm">
                                                {TitleIcon ? (
                                                    React.isValidElement(TitleIcon) ? 
                                                        React.cloneElement(TitleIcon, { className: "w-5 h-5 text-primary-600 dark:text-primary-400" }) : 
                                                        <TitleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                                                )}
                                            </div>
                                            <h2 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight whitespace-nowrap">{title}</h2>
                                        </div>

                                        {/* Search Container (Desktop) */}
                                        <div 
                                            className={`hidden sm:flex absolute right-0 h-[48px] items-center rounded-full transition-all duration-600 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-[width,transform,background-color] ${isSearchExpanded ? 'w-full px-4 bg-gray-50/40 dark:bg-white/[0.03] border border-[#222222] dark:border-white/20 shadow-sm' : 'w-12 bg-transparent border-transparent'}`}
                                        >
                                            <button 
                                                onClick={() => !isSearchExpanded && setIsSearchExpanded(true)}
                                                className={`flex items-center justify-center transition-all duration-300 ${isSearchExpanded ? 'text-[#222222] dark:text-white mr-3' : 'w-12 h-12 rounded-full bg-gray-50/50 dark:bg-white/5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-white/10 shadow-sm'}`}
                                            >
                                                <MagnifyingGlassIcon className="w-6 h-6" />
                                            </button>

                                            {isSearchExpanded && (
                                                <div className="flex-1 flex items-center animate-in fade-in duration-300 delay-300">
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        placeholder={placeholder}
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        onBlur={() => !searchTerm && setIsSearchExpanded(false)}
                                                        className="flex-1 h-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-[14px] font-normal placeholder:text-gray-400"
                                                    />
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setIsSearchExpanded(false); setSearchTerm(''); }}
                                                        className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 transition-colors"
                                                    >
                                                        <XMarkIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Mobile Header (Title on left, X + Search on right) */}
                                        <div className="sm:hidden flex flex-col w-full gap-1 mb-1">
                                            <div className="flex items-center justify-between w-full h-10">
                                                <h2 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight truncate pr-4">{title}</h2>
                                                
                                                <div className="flex items-center gap-1.5">
                                                    {/* Search Toggle Button */}
                                                    <button 
                                                        onClick={() => {
                                                            const newState = !isSearchExpanded;
                                                            setIsSearchExpanded(newState);
                                                            if (newState) setTimeout(() => inputRef.current?.focus(), 100);
                                                        }}
                                                        className={`w-9 h-9 flex items-center justify-center rounded-full active:scale-95 transition-all duration-300 ${isSearchExpanded ? 'bg-primary-600 text-white' : 'bg-gray-100/80 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}
                                                    >
                                                        <MagnifyingGlassIcon className="w-5 h-5" />
                                                    </button>

                                                    {/* Right Close Button */}
                                                    <button 
                                                        onClick={onClose}
                                                        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100/80 dark:bg-white/5 text-gray-500 dark:text-gray-400 active:scale-95 transition-all"
                                                        aria-label="Close"
                                                    >
                                                        <XMarkIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Search Input (Reduced height and padding) */}
                                            <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSearchExpanded ? 'max-h-20 opacity-100 mt-0.5' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                                <div className="relative group w-full pb-1.5">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none h-[44px] z-10">
                                                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        ref={inputRef}
                                                        type="text"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        placeholder={placeholder}
                                                        className="block w-full h-[44px] pl-11 pr-11 bg-gray-50/80 dark:bg-white/2 border border-gray-200 dark:border-white/10 focus:border-gray-800 dark:focus:border-white/60 transition-all outline-none rounded-full text-[14px] font-normal text-gray-900 dark:text-white"
                                                    />
                                                    {searchTerm && (
                                                        <button 
                                                            onClick={() => setSearchTerm('')}
                                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors h-[44px] z-20"
                                                        >
                                                            <XMarkIcon className="w-5 h-5 bg-gray-200/50 dark:bg-white/10 rounded-full p-0.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Options/Actions Row (Desktop) */}
                                <div className="hidden sm:flex items-center justify-between px-5 pb-3">
                                    <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">{subtitle ? subtitle : 'Select Item'}</span>
                                </div>

                                {/* List Content */}
                                <div 
                                    onScroll={handleScroll}
                                    className="modal-scrollable flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-5 pb-6"
                                >
                                    <div className="flex flex-col gap-4 mt-2">
                                        <button 
                                            onClick={() => handleSelect('')}
                                            className={`flex items-center gap-4 w-full pl-2 pr-4 py-2.5 rounded-full border border-transparent transition-all duration-300 text-left group min-h-[52px] overflow-hidden ${
                                                !selectedId 
                                                ? 'bg-primary-50/50 dark:bg-primary-900/10' 
                                                : 'bg-transparent hover:bg-gray-50/40 dark:hover:bg-white/[0.02]'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 overflow-hidden backdrop-blur-md ${
                                                !selectedId
                                                ? 'bg-primary-600 text-white border-transparent'
                                                : 'bg-[#222222]/5 dark:bg-white/10 text-[#222222] dark:text-white border-transparent group-hover:bg-primary-600/10 group-hover:text-primary-600'
                                            } border`}>
                                                <span className="text-[12px] font-bold tracking-tighter transition-transform duration-500 group-hover:scale-110">
                                                    All
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0 pr-1">
                                                <div className={`text-[14px] font-medium truncate tracking-tight leading-tight transition-colors duration-300 ${!selectedId ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white group-hover:text-primary-600'}`}>
                                                    {allLabel}
                                                </div>
                                                <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5 font-medium uppercase tracking-wider">
                                                    Showing all available items
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${!selectedId ? 'border-primary-600 scale-100' : 'border-gray-200 dark:border-white/10 scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-90'}`}>
                                                <div className={`w-2.5 h-2.5 rounded-full bg-primary-600 transition-transform duration-500 ${!selectedId ? 'scale-100' : 'scale-0'}`} />
                                            </div>
                                        </button>
                                        {filteredItems.map((item) => (
                                            <button 
                                                key={item.id}
                                                onClick={() => handleSelect(item.id)}
                                                className={`flex items-center gap-4 w-full pl-2 pr-4 py-2.5 rounded-full border border-transparent transition-all duration-300 text-left group min-h-[52px] overflow-hidden ${
                                                    selectedId === item.id 
                                                    ? 'bg-primary-50/50 dark:bg-primary-900/10' 
                                                    : 'bg-transparent hover:bg-gray-50/40 dark:hover:bg-white/[0.02]'
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 overflow-hidden backdrop-blur-md ${
                                                    selectedId === item.id
                                                    ? 'bg-primary-600/10 text-primary-600 dark:text-primary-400 border-transparent'
                                                    : 'bg-[#222222]/5 dark:bg-white/10 text-[#222222] dark:text-white border-transparent group-hover:bg-primary-600/10 group-hover:text-primary-600'
                                                } border`}>
                                                    {item.image ? (
                                                        <img
                                                            src={getMediaUrl(item.image)}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-[12px] font-bold tracking-tighter uppercase transition-transform duration-500 group-hover:scale-110">
                                                            {item.name?.substring(0, 2).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 pr-1">
                                                    <div className={`text-[14px] font-medium truncate tracking-tight leading-tight transition-colors duration-300 ${selectedId === item.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white group-hover:text-primary-600'}`}>
                                                        {item.name}
                                                    </div>
                                                    {item.subtitle && (
                                                        <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5 font-medium uppercase tracking-wider">
                                                            {item.subtitle}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Hidden Radio Indicator (Visual Only) */}
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${selectedId === item.id ? 'border-primary-600 scale-100' : 'border-gray-200 dark:border-white/10 scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-90'}`}>
                                                    <div className={`w-2.5 h-2.5 rounded-full bg-primary-600 transition-transform duration-500 ${selectedId === item.id ? 'scale-100' : 'scale-0'}`} />
                                                </div>
                                            </button>
                                        ))}

                                        {filteredItems.length === 0 && (
                                            <div className="py-20 text-center text-gray-200 dark:text-gray-700">
                                                <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                <p className="text-[14px] font-medium tracking-tight">No results found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default FilterSearchModal;
