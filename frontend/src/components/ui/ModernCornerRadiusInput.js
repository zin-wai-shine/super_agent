import React, { useState, useEffect } from 'react';
import {
    ArrowsPointingInIcon,
    ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';

const ModernCornerRadiusInput = ({ label, value, onChange }) => {
    // Value can be a simple string "0.5rem" or a complex one "10px 10px 0 0"
    // We need to parse it into 4 values: TL, TR, BR, BL

    const [isExpanded, setIsExpanded] = useState(false);
    const [unifiedValue, setUnifiedValue] = useState('');
    const [corners, setCorners] = useState({ tl: '', tr: '', br: '', bl: '' });

    // Parse initial value
    useEffect(() => {
        if (!value) {
            setUnifiedValue('0');
            setCorners({ tl: '0', tr: '0', br: '0', bl: '0' });
            return;
        }

        const parts = value.split(' ');
        if (parts.length === 1) {
            // Unified value
            const val = parts[0].replace('rem', '').replace('px', ''); // simplified parsing logic for display
            setUnifiedValue(val);
            setCorners({ tl: val, tr: val, br: val, bl: val });
            // If it was already expanded, keep it, otherwise localized state handles it
        } else if (parts.length === 4) {
            // Individual values
            const [tl, tr, br, bl] = parts.map(p => p.replace('rem', '').replace('px', ''));
            setCorners({ tl, tr, br, bl });
            setUnifiedValue(''); // Mixed
            setIsExpanded(true);
        }
    }, [value]);

    const handleUnifiedChange = (e) => {
        const val = e.target.value;
        setUnifiedValue(val);
        setCorners({ tl: val, tr: val, br: val, bl: val });
        // We assume 'rem' for now as per existing system, or just pass raw if it's a number
        // The backend default is '0.5rem', so let's stick to appending 'rem' if it's just a number
        // strictly for this UI, we might want to handle units better, but let's keep it simple for now matches existing
        onChange(val ? `${val}rem` : '0');
    };

    const handleCornerChange = (corner, val) => {
        const newCorners = { ...corners, [corner]: val };
        setCorners(newCorners);

        // Check if all are same
        const allSame = newCorners.tl === newCorners.tr && newCorners.tr === newCorners.br && newCorners.br === newCorners.bl;

        if (allSame) {
            setUnifiedValue(newCorners.tl);
            onChange(newCorners.tl ? `${newCorners.tl}rem` : '0');
        } else {
            setUnifiedValue('Mixed');
            // Standard CSS order: TL TR BR BL
            const cssString = `${newCorners.tl || 0}rem ${newCorners.tr || 0}rem ${newCorners.br || 0}rem ${newCorners.bl || 0}rem`;
            onChange(cssString);
        }
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {label}
                </label>
                <button
                    onClick={toggleExpand}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    title={isExpanded ? "Unified Radius" : "Independent Corners"}
                >
                    {isExpanded ? (
                        <ArrowsPointingInIcon className="w-4 h-4" />
                    ) : (
                        <ArrowsPointingOutIcon className="w-4 h-4" />
                    )}
                </button>
            </div>

            {!isExpanded ? (
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2 M16 4h2a2 2 0 012 2v2 M16 20h2a2 2 0 012-2v-2 M4 16v2a2 2 0 012 2h2" />
                        </svg>
                    </div>
                    <input
                        type="number"
                        value={unifiedValue === 'Mixed' ? '' : unifiedValue}
                        placeholder={unifiedValue === 'Mixed' ? 'Mixed' : '0'}
                        onChange={handleUnifiedChange}
                        className="block w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700/50 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {/* Top Left */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2" />
                            </svg>
                        </div>
                        <input
                            type="number"
                            value={corners.tl}
                            onChange={(e) => handleCornerChange('tl', e.target.value)}
                            className="block w-full pl-7 pr-2 py-1.5 bg-gray-50 dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700/50 rounded-md text-sm dark:text-gray-100 focus:ring-1 focus:ring-primary-500"
                        />
                    </div>

                    {/* Top Right */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4h2a2 2 0 012 2v2" />
                            </svg>
                        </div>
                        <input
                            type="number"
                            value={corners.tr}
                            onChange={(e) => handleCornerChange('tr', e.target.value)}
                            className="block w-full pl-7 pr-2 py-1.5 bg-gray-50 dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700/50 rounded-md text-sm dark:text-gray-100 focus:ring-1 focus:ring-primary-500"
                        />
                    </div>

                    {/* Bottom Right */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 20h2a2 2 0 012-2v-2" />
                            </svg>
                        </div>
                        <input
                            type="number"
                            value={corners.br}
                            onChange={(e) => handleCornerChange('br', e.target.value)}
                            className="block w-full pl-7 pr-2 py-1.5 bg-gray-50 dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700/50 rounded-md text-sm dark:text-gray-100 focus:ring-1 focus:ring-primary-500"
                        />
                    </div>

                    {/* Bottom Left */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 012 2h2" />
                            </svg>
                        </div>
                        <input
                            type="number"
                            value={corners.bl}
                            onChange={(e) => handleCornerChange('bl', e.target.value)}
                            className="block w-full pl-7 pr-2 py-1.5 bg-gray-50 dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700/50 rounded-md text-sm dark:text-gray-100 focus:ring-1 focus:ring-primary-500"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModernCornerRadiusInput;
