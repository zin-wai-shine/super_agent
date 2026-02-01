import React, { useState, useEffect, useRef } from 'react';
import { publicApi } from '../../services/api';

const TransitMapFilter = ({ onStationClick, selectedStation }) => {
    const [stations, setStations] = useState([]);
    const [hoveredStation, setHoveredStation] = useState(null);
    const [loading, setLoading] = useState(true);
    const svgRef = useRef(null);

    // Fetch stations data
    useEffect(() => {
        const fetchStations = async () => {
            try {
                const response = await publicApi.getStations();
                setStations(response.data.stations || []);
            } catch (error) {
                console.error('Failed to fetch stations:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStations();
    }, []);

    // Line colors mapping
    const lineColors = {
        'BTS Sukhumvit': '#7FBA00',
        'BTS Silom': '#006633',
        'MRT Blue': '#1E50A0',
        'MRT Purple': '#800080',
        'Yellow Line': '#FFD700',
        'Pink Line': '#FF69B4',
        'Gold Line': '#DAA520',
    };

    // Group stations by line
    const stationsByLine = stations.reduce((acc, station) => {
        if (!acc[station.line_name]) {
            acc[station.line_name] = [];
        }
        acc[station.line_name].push(station);
        return acc;
    }, {});

    const handleStationClick = (station) => {
        if (onStationClick) {
            onStationClick(station.id, station.name_en);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Legend */}
            <div className="mb-6 flex flex-wrap gap-4 justify-center">
                {Object.entries(lineColors).map(([line, color]) => (
                    <div key={line} className="flex items-center space-x-2">
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color }}
                        />
                        <span className="text-sm text-gray-600">{line}</span>
                    </div>
                ))}
            </div>

            {/* Interactive Map Container */}
            <div className="relative bg-white rounded-2xl p-4 overflow-x-auto">
                {/* Station Grid - Simplified visual representation */}
                <div className="min-w-[800px]">
                    {Object.entries(stationsByLine).map(([lineName, lineStations]) => (
                        <div key={lineName} className="mb-6">
                            <h4
                                className="text-sm font-semibold mb-3 px-2 py-1 rounded inline-block text-white"
                                style={{ backgroundColor: lineColors[lineName] || '#666' }}
                            >
                                {lineName}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {lineStations.map((station) => (
                                    <button
                                        key={station.id}
                                        onClick={() => handleStationClick(station)}
                                        onMouseEnter={() => setHoveredStation(station.id)}
                                        onMouseLeave={() => setHoveredStation(null)}
                                        className={`relative group px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedStation === station.id
                                                ? 'text-white shadow-lg transform scale-105'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        style={
                                            selectedStation === station.id
                                                ? { backgroundColor: lineColors[lineName] || '#666' }
                                                : {}
                                        }
                                    >
                                        <span className="block text-xs opacity-60">{station.id}</span>
                                        <span className="block">{station.name_en}</span>

                                        {/* Hover tooltip */}
                                        {hoveredStation === station.id && selectedStation !== station.id && (
                                            <div
                                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10 animate-fade-in"
                                            >
                                                <div className="font-medium">{station.name_en}</div>
                                                <div className="text-gray-400">{station.name_th}</div>
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Station Info */}
            {selectedStation && (
                <div className="mt-4 p-4 bg-primary-50 rounded-xl animate-fade-in">
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                        <span className="font-medium text-primary-800">
                            Showing properties near station: {selectedStation}
                        </span>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <p className="text-center text-gray-500 text-sm mt-4">
                Click on any station to find properties nearby
            </p>
        </div>
    );
};

export default TransitMapFilter;
