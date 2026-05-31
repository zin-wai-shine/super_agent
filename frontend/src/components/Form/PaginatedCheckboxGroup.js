import React, { useState } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

const PaginatedCheckboxGroup = ({ title, items, register, name, itemsPerPage = 12 }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = Math.ceil(items.length / itemsPerPage);

    const handlePrev = (e) => {
        e.preventDefault();
        setCurrentPage((prev) => Math.max(prev - 1, 0));
    };

    const handleNext = (e) => {
        e.preventDefault();
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    };

    const currentItems = items.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-wider">{title}</h3>
                {totalPages > 1 && (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handlePrev}
                            disabled={currentPage === 0}
                            className={`p-1.5 rounded-full flex items-center justify-center transition-colors ${
                                currentPage === 0 
                                ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            <MdChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages - 1}
                            className={`p-1.5 rounded-full flex items-center justify-center transition-colors ${
                                currentPage === totalPages - 1 
                                ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            <MdChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {currentItems.map((item) => (
                    <label key={item.id} className="flex items-center h-[40px] p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group">
                        <input
                            type="checkbox"
                            value={item.id}
                            {...register(name)}
                            className="w-5 h-5 rounded-xl border-gray-300 text-primary-600 focus:ring-primary-500 shrink-0"
                        />
                        <span className="ml-3 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white flex items-center min-w-0">
                            <span className="mr-2 flex items-center justify-center shrink-0">{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                        </span>
                    </label>
                ))}
            </div>
            
            {/* Pagination Indicators (Dots) optional, can just show text */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-1.5 mt-4">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                idx === currentPage 
                                ? 'w-4 bg-primary-500' 
                                : 'w-1.5 bg-gray-300 dark:bg-gray-700'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PaginatedCheckboxGroup;
