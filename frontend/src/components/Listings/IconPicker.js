import React, { useState, useMemo } from 'react';
import * as BsIcons from 'react-icons/bs';
import * as MdIcons from 'react-icons/md';
import * as FaIcons from 'react-icons/fa';
import * as Fa6Icons from 'react-icons/fa6';
import * as HiIcons from 'react-icons/hi2';
import * as IoIcons from 'react-icons/io';
import * as Io5Icons from 'react-icons/io5';
import * as RiIcons from 'react-icons/ri';
import * as TbIcons from 'react-icons/tb';
import * as PiIcons from 'react-icons/pi';
import * as FiIcons from 'react-icons/fi';
import * as LuIcons from 'react-icons/lu';
import * as CiIcons from 'react-icons/ci';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const ICON_LIBRARIES = {
    Bs: BsIcons,
    Md: MdIcons,
    Fa: FaIcons,
    Fa6: Fa6Icons,
    Hi: HiIcons,
    Io: IoIcons,
    Io5: Io5Icons,
    Ri: RiIcons,
    Tb: TbIcons,
    Pi: PiIcons,
    Fi: FiIcons,
    Lu: LuIcons,
    Ci: CiIcons
};

// Curated list for the default view (mix of libraries)
const DEFAULT_ICONS = [
    'BsHouse', 'MdPets', 'FaCar', 'BsBuilding', 'HiHeart', 
    'MdFastfood', 'FaLeaf', 'BsTree', 'HiSparkles', 'MdShoppingBag',
    'FaPizzaSlice', 'BsKey', 'MdWork', 'HiMapPin', 'MdWaves'
];

const IconPicker = ({ selectedIcon, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const allIcons = useMemo(() => {
        let results = [];
        const term = searchTerm.toLowerCase();

        if (!searchTerm) {
            // Include common ones if no search
            results = DEFAULT_ICONS;
        } else {
            // Search across ALL libraries
            Object.entries(ICON_LIBRARIES).forEach(([prefix, lib]) => {
                const matches = Object.keys(lib).filter(key => 
                    key.toLowerCase().includes(term)
                ).slice(0, 100); // 100 per library to be very comprehensive
                results = [...results, ...matches];
            });
        }
        return Array.from(new Set(results)).slice(0, 400); // Increase final limit to 400 total
    }, [searchTerm]);

    const getIconComponent = (name) => {
        for (const lib of Object.values(ICON_LIBRARIES)) {
            if (lib[name]) return lib[name];
        }
        return null;
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search icons (e.g. house, building, star...)"
                    className="w-full pl-10 pr-4 h-10 bg-gray-50 dark:bg-dashboard-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 max-h-[250px] overflow-y-auto p-2 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-dashboard-card custom-scrollbar">
                {allIcons.map((iconName) => {
                    const Icon = getIconComponent(iconName);
                    if (!Icon) return null;
                    const isActive = selectedIcon === iconName;
                    
                    return (
                        <button
                            key={iconName}
                            type="button"
                            onClick={() => onSelect(iconName)}
                            title={iconName}
                            className={`aspect-square flex items-center justify-center rounded-xl transition-all ${
                                isActive 
                                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400' 
                                    : 'bg-gray-50 dark:bg-dashboard-dark text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                        </button>
                    );
                })}
                {allIcons.length === 0 && (
                    <div className="col-span-full py-8 text-center text-gray-400 text-sm italic">
                        No icons found for "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
};

export default IconPicker;
