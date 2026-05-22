/**
 * Lightweight in-memory API response cache (Airbnb-style).
 * Caches GET responses for a short TTL so navigating back
 * or re-rendering doesn't hit the server again.
 *
 * Usage:
 *   import { cachedGet } from '../utils/apiCache';
 *   const data = await cachedGet('/api/public/listings', params, { ttl: 60000 });
 */

const cache = new Map();
const DEFAULT_TTL = 120_000;  // 2 minutes
const MAX_ENTRIES = 50;

/**
 * Generate a stable cache key from URL + params
 */
const buildKey = (url, params) => {
    const sortedParams = params
        ? Object.keys(params)
            .sort()
            .filter(k => params[k] !== '' && params[k] !== null && params[k] !== undefined)
            .map(k => `${k}=${params[k]}`)
            .join('&')
        : '';
    return `${url}?${sortedParams}`;
};

/**
 * Evict oldest entries when cache exceeds MAX_ENTRIES
 */
const evictOldest = () => {
    if (cache.size <= MAX_ENTRIES) return;
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
};

/**
 * Wrap an axios GET call with caching.
 * @param {Function} apiFn - The API function to call (e.g. publicApi.getListings)
 * @param {Object} params - Query parameters
 * @param {Object} options - { ttl: ms, key: string, force: boolean }
 * @returns {Promise} - Cached or fresh response
 */
export const cachedApiCall = async (apiFn, params = {}, options = {}) => {
    const { ttl = DEFAULT_TTL, key: customKey, force = false } = options;
    const key = customKey || buildKey(apiFn.toString(), params);

    // Return cached if valid
    if (!force && cache.has(key)) {
        const entry = cache.get(key);
        if (Date.now() - entry.timestamp < ttl) {
            return entry.data;
        }
        cache.delete(key);
    }

    // Fetch fresh
    const response = await apiFn(params);
    
    // Cache the response
    cache.set(key, {
        data: response,
        timestamp: Date.now(),
    });
    evictOldest();

    return response;
};

/**
 * Invalidate cache entries matching a prefix
 */
export const invalidateCache = (prefix) => {
    if (!prefix) {
        cache.clear();
        return;
    }
    for (const key of cache.keys()) {
        if (key.includes(prefix)) {
            cache.delete(key);
        }
    }
};

/**
 * Preload an API call into cache (fire-and-forget)
 */
export const preloadApiCall = (apiFn, params = {}, options = {}) => {
    cachedApiCall(apiFn, params, options).catch(() => {});
};

export default { cachedApiCall, invalidateCache, preloadApiCall };
