/**
 * Formats distance in meters to a human-readable string (m or km)
 * @param {number|string} meters - The distance in meters
 * @returns {string} - Formatted distance string
 */
export const formatDistance = (meters) => {
    if (meters === null || meters === undefined || meters === '' || isNaN(meters)) return '';
    
    const m = Number(meters);
    if (m >= 1000) {
        const km = m / 1000;
        // Check if it's a whole number, if so don't show decimal
        if (km % 1 === 0) {
            return `${km} km`;
        }
        return `${km.toFixed(1)} km`;
    }
    return `${m}m`;
};

/**
 * Formats bedroom count to a human-readable string (Studio or N Bed)
 * @param {number|string} count - The number of bedrooms
 * @returns {string} - Formatted bedroom string
 */
export const formatBedrooms = (count) => {
    const n = Number(count);
    if (isNaN(n) || n <= 0) return 'Studio';
    return `${n} Bed`;
};
