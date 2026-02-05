const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
// Extract base URL (e.g., http://localhost:8080)
const BASE_URL = API_URL.replace('/api', '');

/**
 * Resolves a media URL from the backend.
 * If the URL is already absolute (starts with http), it's returned as is.
 * Otherwise, it prepends the backend base URL.
 */
export const getMediaUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop';
    if (url.startsWith('http')) return url;

    // Ensure the URL starts with a slash
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    return `${BASE_URL}${normalizedUrl}`;
};
