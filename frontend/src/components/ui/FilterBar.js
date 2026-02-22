import React from 'react';
import { TbMap2 } from "react-icons/tb";
import {
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    Squares2X2Icon,
    ListBulletIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import Button from './Button';
import Input from './Input';
import Logo from '../Common/Logo';

const FilterBar = ({
    total = 0,
    searchTerm = '',
    onSearchChange,
    onOpenFilters,
    hasActiveFilters = false,
    viewMode = 'grid',
    onViewModeChange,
    isMapViewOpen = false,
    onToggleMapView,
    isMapTransitioning = false,
    navVisible = true,
    isScrolled = false,
    className = "",
    showMapToggle = true,
    showViewToggles = true,
    showInventory = true,
    variant = 'full' // 'full' or 'modal'
}) => {
    const isModalVariant = variant === 'modal';

    return (
        <div className={`w-full sticky z-[100] pointer-events-none transition-all duration-500 ease-in-out ${!isModalVariant && navVisible ? 'top-[4rem]' : 'top-0'} ${className}`}>
            <div className={`w-full transition-all duration-300 ${isModalVariant ? 'lg:pr-40 md:pr-40 pr-2' : ''}`}>
                <div className={`w-full pointer-events-auto transition-all duration-300 h-[84px] flex items-center ${isModalVariant ? 'bg-white/80 backdrop-blur-md' : 'bg-white'} ${!isModalVariant && isScrolled ? 'border-b border-gray-100' : ''}`}>
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-start-4 lg:col-span-9 flex items-center justify-between gap-4 w-full">

                            {/* Search Section */}
                            <div className="flex-1 max-w-full relative group h-[46px] bg-[#F6F7F9] rounded-[3px] border border-gray-100 hover:border-gray-200 focus-within:border-primary-400/50 transition-all duration-300">
                                <div className="absolute inset-y-0 left-0 pl-0 sm:pl-4 flex items-center pointer-events-none z-10">
                                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                </div>

                                <Input
                                    value={searchTerm}
                                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                                    placeholder="Search location, name, neighborhood..."
                                    className="w-full relative z-0"
                                    style={{
                                        height: '46px',
                                        paddingLeft: '48px',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        borderRadius: '3px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        boxShadow: 'none'
                                    }}
                                />
                            </div>

                            {/* Right Side Actions */}
                            <div className="flex items-center gap-3">
                                {showInventory && (
                                    <div className="flex flex-col items-end mr-4 px-4 border-r border-gray-200">
                                        <span className="text-xs uppercase font-black tracking-widest text-gray-400">INVENTORY</span>
                                        <span className="text-base font-bold text-gray-900">{total}</span>
                                    </div>
                                )}

                                {/* Filters Button */}
                                <Button
                                    onClick={onOpenFilters}
                                    className={`relative gap-2 h-10 px-5 rounded-[3px] transition-all duration-300 font-bold border bg-primary-600 text-white border-transparent hover:bg-primary-700`}
                                >
                                    <AdjustmentsHorizontalIcon className="w-4 h-4" />
                                    <span>Filters</span>
                                    {hasActiveFilters && (
                                        <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
                                        </span>
                                    )}
                                </Button>

                                {/* Map View Button */}
                                {showMapToggle && (
                                    <div className="flex items-center ml-2 pl-4 border-l border-gray-200">
                                        <button
                                            onClick={() => onToggleMapView && onToggleMapView(!isMapViewOpen)}
                                            disabled={isMapTransitioning}
                                            className={`flex items-center gap-2 h-10 px-5 rounded-[3px] transition-all duration-300 focus:outline-none pointer-events-auto border font-bold ${isMapViewOpen ? 'bg-white text-primary-600 border-primary-600 hover:bg-gray-50' : 'bg-primary-600 text-white border-transparent hover:bg-primary-700'} ${isMapTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <TbMap2 className={`w-5 h-5 ${isMapTransitioning ? 'animate-pulse' : ''}`} />
                                            <span className="text-xs uppercase tracking-widest mt-0.5">Map View</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
