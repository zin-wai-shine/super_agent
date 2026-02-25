import React, { useState, useMemo } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { getMediaUrl } from '../../utils/media';

/**
 * A custom scrollable filter list component for the sidebar.
 * Features a search bar, a selection indicator pill, and a smooth scrollable list.
 * 
 * @param {string} title - The title of the filter (e.g., "Developer", "Project")
 * @param {Array} items - The list of items to display [{ id, name, subtitle, image, icon }]
 * @param {string} selectedId - The ID of the currently selected item
 * @param {function} onSelect - Callback when an item is selected
 * @param {string} placeholder - Placeholder for the search bar
 * @param {string} allLabel - Label for the "All" option (e.g., "All Developers")
 */
const ScrollableFilterList = ({
    title,
    items = [],
    selectedId = '',
    onSelect,
    placeholder = 'Search...',
    allLabel = 'All',
    defaultExpanded = false,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        return items.filter(item =>
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);

    const selectedItem = useMemo(() => {
        if (!selectedId) return null;
        return items.find(item => item.id === selectedId);
    }, [items, selectedId]);

    return (
        <div className="flex flex-col gap-3">
            {/* Selection Pill / Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-[10px] border transition-all duration-300 ${selectedId
                    ? 'border-primary-600 bg-primary-50/50'
                    : 'border-primary-600 bg-white hover:bg-primary-50/30'
                    }`}
            >
                <span className="text-sm font-bold text-gray-900 truncate">
                    {selectedItem ? selectedItem.name : allLabel}
                </span>
                {isExpanded ? (
                    <ChevronUpIcon className="w-4 h-4 text-gray-900 stroke-[2.5]" />
                ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-900 stroke-[2.5]" />
                )}
            </button>

            {isExpanded && (
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={placeholder}
                            className="block w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl text-[14px] font-medium text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all outline-none"
                        />
                    </div>

                    {/* Scrollable List */}
                    <div className="flex flex-col max-h-[320px] overflow-y-auto custom-scrollbar-thin pr-1 py-1 gap-1">
                        {/* All Option */}
                        <button
                            onClick={() => onSelect('')}
                            className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-all text-left ${!selectedId ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-600'
                                }`}
                        >
                            <span className="text-sm font-bold">{allLabel}</span>
                        </button>

                        {filteredItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onSelect(item.id)}
                                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all text-left group ${selectedId === item.id ? 'bg-primary-50' : 'hover:bg-gray-50'
                                    }`}
                            >
                                {/* Left Content: Image or Icon */}
                                <div className="flex-shrink-0">
                                    {item.image ? (
                                        <img
                                            src={getMediaUrl(item.image)}
                                            alt=""
                                            className={`w-10 h-10 object-cover ${item.isAvatar ? 'rounded-full' : 'rounded-lg'} border border-gray-100`}
                                        />
                                    ) : item.icon ? (
                                        <div className={`w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-500 ${item.isAvatar ? 'rounded-full' : 'rounded-lg'}`}>
                                            {item.icon}
                                        </div>
                                    ) : (
                                        <div className={`w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-400 ${item.isAvatar ? 'rounded-full' : 'rounded-lg'}`}>
                                            <span className="text-xs font-bold uppercase tracking-tighter">{item.name?.substring(0, 2)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Main Content: Name */}
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-bold truncate ${selectedId === item.id ? 'text-primary-700' : 'text-gray-900 group-hover:text-primary-600'}`}>
                                        {item.name}
                                    </div>
                                </div>
                            </button>
                        ))}

                        {filteredItems.length === 0 && (
                            <div className="py-8 text-center text-gray-400 text-[13px] italic">
                                No results found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScrollableFilterList;
