import { publicApi } from '../services/api';

/**
 * Extracts latitude and longitude from various Google Maps link formats and coordinate strings.
 * @param {string} value - The link or coordinate string to parse.
 * @returns {{lat: string, lng: string} | null} - The extracted coordinates or null if not found.
 */
export const extractCoordinates = (value) => {
    if (!value) return null;

    const patterns = [
        /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/, // @lat,lng
        /q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/, // q=lat,lng
        /!3d(-?\d+(?:\.\d+)?)[^!]*!4d(-?\d+(?:\.\d+)?)/, // !3dlat...!4dlng
        /ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/, // ll=lat,lng
        /(-?\d+(?:\.\d+)?)\s*[,|\s]\s*(-?\d+(?:\.\d+)?)/, // Plain lat, lng or lat lng
    ];

    for (const pattern of patterns) {
        const match = value.match(pattern);
        if (match && match[1] && match[2]) {
            // Basic validation to ensure they look like coordinates
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            
            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                return {
                    lat: match[1],
                    lng: match[2]
                };
            }
        }
    }

    return null;
};

/**
 * Resolves a shortened Google Maps URL to its final destination using the backend.
 * @param {string} shortUrl - The shortened URL to resolve.
 * @returns {Promise<string|null>} - The resolved URL or null on failure.
 */
export const resolveShortLink = async (shortUrl) => {
    if (!shortUrl || (!shortUrl.includes('maps.app.goo.gl') && !shortUrl.includes('goo.gl/maps'))) {
        return null;
    }

    try {
        const response = await publicApi.resolveUrl(shortUrl);
        return response.data.url || null;
    } catch (error) {
        console.error('Failed to resolve short link:', error);
        return null;
    }
};
