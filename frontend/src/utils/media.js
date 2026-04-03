import { BASE_URL } from '../services/api';

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
