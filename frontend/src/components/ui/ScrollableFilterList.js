import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { getMediaUrl } from '../../utils/media';

/**
 * Combobox: one dropdown box that shows selected value when collapsed and acts as search when expanded.
 * No separate search field — type in the dropdown to filter the list. Selecting an item closes only the dropdown.
 *
 * @param {Array} items - The list of items to display [{ id, name, subtitle, image, icon }]
 * @param {string} selectedId - The ID of the currently selected item
 * @param {function} onSelect - Callback when an item is selected (does not close filter sidebar)
 * @param {string} placeholder - Placeholder when expanded (e.g. "Search developer...")
 * @param {string} allLabel - Label for the "All" option (e.g., "All Developers")
 */
const ScrollableFilterList = ({
    items = [],
    selectedId = '',
    onSelect,
    placeholder = 'Search...',
    allLabel = 'All',
    defaultExpanded = false,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const inputRef = useRef(null);

    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return items;
        const q = searchTerm.toLowerCase();
        return items.filter(item =>
            item.name?.toLowerCase().includes(q) ||
            item.subtitle?.toLowerCase().includes(q)
        );
    }, [items, searchTerm]);

    const selectedItem = useMemo(() => {
        if (!selectedId) return null;
        return items.find(item => item.id === selectedId);
    }, [items, selectedId]);

    const displayLabel = selectedItem ? selectedItem.name : (allLabel.charAt(0) + allLabel.slice(1).toLowerCase());

    // When expanded, focus the search input
    useEffect(() => {
        if (isExpanded) {
            setSearchTerm('');
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [isExpanded]);

    const handleSelect = (id) => {
        onSelect(id);
        setIsExpanded(false);
    };

    const handleToggle = () => {
        if (isExpanded) setIsExpanded(false);
        else setIsExpanded(true);
    };

    return (
        <div className="flex flex-col gap-2">
            {!isExpanded ? (
                /* Collapsed: show selected value, click to open */
                <button
                    type="button"
                    onClick={handleToggle}
                    className={`w-full flex items-center justify-between min-h-[48px] px-4 py-3 rounded-full border transition-all duration-300 ${selectedId
                        ? 'border-gray-800 dark:border-white/30 bg-white dark:bg-dashboard-card'
                        : 'border-gray-200 dark:border-white/10 bg-white dark:bg-dashboard-card hover:border-gray-400 dark:hover:border-white/30'
                    }`}
                >
                    <span className="text-[13px] font-normal text-gray-900 dark:text-white truncate">{displayLabel}</span>
                    <ChevronDownIcon className="w-4 h-4 text-gray-700 dark:text-gray-300 stroke-[2] flex-shrink-0" />
                </button>
            ) : (
                /* Expanded: same box is the search input, then list below */
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="relative group flex items-center min-h-[48px] rounded-full border border-gray-800 dark:border-white/30 bg-white dark:bg-dashboard-card px-4">
                        <MagnifyingGlassIcon className="h-4 w-4 text-gray-500 flex-shrink-0 mr-2" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={placeholder}
                            className="flex-1 min-w-0 py-2.5 text-[13px] font-normal text-gray-900 dark:text-white placeholder-gray-500 bg-transparent border-none focus:outline-none focus:ring-0"
                            aria-label="Search"
                        />
                        <button
                            type="button"
                            onClick={handleToggle}
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 flex-shrink-0"
                            aria-label="Close dropdown"
                        >
                            <ChevronUpIcon className="w-4 h-4 stroke-[2]" />
                        </button>
                    </div>

                    <div className="flex flex-col max-h-[280px] overflow-y-auto custom-scrollbar-thin pr-1 py-1 gap-1">
                        <button
                            type="button"
                            onClick={() => handleSelect('')}
                            className={`flex items-center w-full px-3 py-2.5 rounded-full border transition-all text-left ${!selectedId ? 'bg-white dark:bg-dashboard-card border-gray-800 dark:border-white/30 text-gray-900 dark:text-white' : 'bg-white dark:bg-dashboard-card border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            <span className="text-[13px] font-normal">{allLabel.charAt(0) + allLabel.slice(1).toLowerCase()}</span>
                        </button>

                        {filteredItems.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleSelect(item.id)}
                                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-full border transition-all text-left group ${selectedId === item.id ? 'bg-white dark:bg-dashboard-card border-gray-800 dark:border-white/30' : 'bg-white dark:bg-dashboard-card border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30'
                                    }`}
                            >
                                <div className="flex-shrink-0">
                                    {item.image ? (
                                        <img
                                            src={getMediaUrl(item.image)}
                                            alt=""
                                            className={`w-9 h-9 object-cover ${item.isAvatar ? 'rounded-full' : 'rounded-lg'} border border-gray-200 dark:border-white/10`}
                                        />
                                    ) : item.icon ? (
                                        <div className={`w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 ${item.isAvatar ? 'rounded-full' : 'rounded-lg'}`}>
                                            {item.icon}
                                        </div>
                                    ) : (
                                        <div className={`w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 ${item.isAvatar ? 'rounded-full' : 'rounded-lg'}`}>
                                            <span className="text-[11px] font-normal">{item.name?.substring(0, 2)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`text-[13px] font-normal truncate ${selectedId === item.id ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                                        {item.name}
                                    </div>
                                </div>
                            </button>
                        ))}

                        {filteredItems.length === 0 && (
                            <div className="py-6 text-center text-gray-400 text-[13px] italic">
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
