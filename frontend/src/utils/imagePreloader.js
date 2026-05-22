/**
 * Image preloader utility (Airbnb-style).
 * Prefetches images that are about to enter the viewport,
 * so they appear instantly when the user scrolls.
 */

const preloadedUrls = new Set();
const MAX_PRELOADED = 100;

/**
 * Preload a single image URL into browser cache
 */
export const preloadImage = (url) => {
    if (!url || preloadedUrls.has(url)) return;
    
    // Evict oldest if too many
    if (preloadedUrls.size >= MAX_PRELOADED) {
        const first = preloadedUrls.values().next().value;
        preloadedUrls.delete(first);
    }

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
    preloadedUrls.add(url);

    // Clean up the link tag after 30s (image is in browser cache by then)
    setTimeout(() => {
        try { document.head.removeChild(link); } catch (e) {}
    }, 30000);
};

/**
 * Preload first images of upcoming listings.
 * Call this after fetching a page of listings.
 * @param {Array} listings - Array of listing objects with media arrays
 * @param {Function} getMediaUrl - The getMediaUrl utility function
 * @param {number} count - How many listings to preload (default: 6)
 */
export const preloadListingImages = (listings, getMediaUrl, count = 6) => {
    if (!listings || !Array.isArray(listings)) return;
    
    const toPreload = listings.slice(0, count);
    toPreload.forEach(listing => {
        const media = listing.media || [];
        const firstImage = media.find(m => m.type === 'image');
        if (firstImage?.url) {
            preloadImage(getMediaUrl(firstImage.url));
        }
    });
};

export default { preloadImage, preloadListingImages };
