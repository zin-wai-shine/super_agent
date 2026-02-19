import React from 'react';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
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
        <div className={`w-full sticky z-[60] transition-all duration-300 ${isModalVariant ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'bg-white border-b border-gray-200 shadow-sm'} ${!isModalVariant && navVisible ? 'top-16' : 'top-0'} ${!isModalVariant && isScrolled ? 'mb-4 shadow-md' : 'mb-0'} ${className}`}>
            <div className={`max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 ${isModalVariant ? 'lg:pr-40 md:pr-40 pr-2' : ''}`}>
                <div className="flex items-center justify-between gap-4">

                    {/* Search Section */}
                    <div className="flex-1 max-w-full relative group h-[46px] bg-white rounded-[3px] transition-all duration-300 border border-gray-200 focus-within:border-primary-500 overflow-hidden">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
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
                            variant="outline"
                            onClick={onOpenFilters}
                            className={`gap-2 ${hasActiveFilters ? 'bg-[var(--primary-color)] text-white' : ''}`}
                        >
                            <div className="relative">
                                <FunnelIcon className="w-4 h-4" />
                                {hasActiveFilters && (
                                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                )}
                            </div>
                            <span>Filters</span>
                        </Button>

                        {/* View Toggles */}
                        {showViewToggles && (
                            <div className="flex items-center bg-gray-100 p-1 rounded-[3px] border border-gray-200 ml-2">
                                <button
                                    onClick={() => onViewModeChange && onViewModeChange('grid')}
                                    className={`p-1.5 transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    style={{ borderRadius: 'var(--btn-radius)' }}
                                >
                                    <Squares2X2Icon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onViewModeChange && onViewModeChange('list')}
                                    className={`p-1.5 transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    style={{ borderRadius: 'var(--btn-radius)' }}
                                >
                                    <ListBulletIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Map View Switch */}
                        {showMapToggle && (
                            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
                                <span className={`text-xs font-black uppercase tracking-widest transition-colors ${isMapViewOpen ? 'text-primary-600' : 'text-gray-400'}`}>Map View</span>
                                <button
                                    onClick={() => onToggleMapView && onToggleMapView(!isMapViewOpen)}
                                    disabled={isMapTransitioning}
                                    className={`w-11 h-6 rounded-full relative transition-colors duration-200 ease-in-out focus:outline-none pointer-events-auto ${isMapViewOpen ? 'bg-primary-600' : 'bg-gray-200'} ${isMapTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ease-in-out shadow-sm ${isMapViewOpen ? 'left-6' : 'left-1'} ${isMapTransitioning ? 'animate-pulse' : ''}`} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
