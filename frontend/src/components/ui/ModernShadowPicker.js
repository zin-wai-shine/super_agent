import React from 'react';

const ModernShadowPicker = ({ label, x, y, blur, spread, color, opacity, onChange }) => {
    return (
        <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm transition-all hover:border-primary-500/30">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">{label}</label>

            <div className="grid grid-cols-2 gap-4">
                {/* Position and Blur */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">X Offset</label>
                            <input
                                type="number"
                                value={x}
                                onChange={(e) => onChange({ x: parseInt(e.target.value) || 0 })}
                                className="w-full h-9 px-2 text-xs bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-primary-500 text-center"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Y Offset</label>
                            <input
                                type="number"
                                value={y}
                                onChange={(e) => onChange({ y: parseInt(e.target.value) || 0 })}
                                className="w-full h-9 px-2 text-xs bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-primary-500 text-center"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Blur</label>
                            <input
                                type="number"
                                min="0"
                                value={blur}
                                onChange={(e) => onChange({ blur: parseInt(e.target.value) || 0 })}
                                className="w-full h-9 px-2 text-xs bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-primary-500 text-center"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Spread</label>
                            <input
                                type="number"
                                value={spread}
                                onChange={(e) => onChange({ spread: parseInt(e.target.value) || 0 })}
                                className="w-full h-9 px-2 text-xs bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-primary-500 text-center"
                            />
                        </div>
                    </div>
                </div>

                {/* Color and Opacity */}
                <div className="space-y-3">
                    <div>
                        <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Color</label>
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded px-2 h-9">
                            <div className="relative w-5 h-5 flex-shrink-0">
                                <div
                                    className="w-full h-full rounded border border-gray-200 dark:border-gray-600 shadow-sm"
                                    style={{ backgroundColor: color }}
                                />
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => onChange({ color: e.target.value })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            <input
                                type="text"
                                value={color}
                                onChange={(e) => onChange({ color: e.target.value })}
                                className="flex-1 bg-transparent border-none p-0 text-[11px] text-gray-700 dark:text-gray-200 focus:ring-0 uppercase"
                                spellCheck={false}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Opacity</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={opacity}
                                onChange={(e) => onChange({ opacity: parseInt(e.target.value) || 0 })}
                                className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                            />
                            <span className="text-[11px] text-gray-500 dark:text-gray-400 w-8 text-right">{opacity}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModernShadowPicker;
