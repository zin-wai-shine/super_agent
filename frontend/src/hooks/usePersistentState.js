import { useState, useEffect } from 'react';

/**
 * A hook that syncs state with sessionStorage to persist it across navigations
 * in the same session.
 */
export const useSessionState = (key, initialValue) => {
    const [state, setState] = useState(() => {
        const saved = sessionStorage.getItem(key);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return initialValue;
            }
        }
        return initialValue;
    });

    useEffect(() => {
        sessionStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
};

/**
 * A hook for scroll restoration.
 * Should be called with a 'ready' flag (like !loading) to ensure content is rendered before scrolling.
 */
export const useScrollRestoration = (key, ready) => {
    useEffect(() => {
        const handleScroll = () => {
            sessionStorage.setItem(`scroll_${key}`, window.scrollY.toString());
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [key]);

    useEffect(() => {
        if (ready) {
            const savedScroll = sessionStorage.getItem(`scroll_${key}`);
            if (savedScroll) {
                // Use a short delay to ensure DOM has updated and layout is stable
                const timer = setTimeout(() => {
                    const targetScroll = parseInt(savedScroll);
                    // Only scroll if we're not already there (prevents loops)
                    if (Math.abs(window.scrollY - targetScroll) > 5) {
                        window.scrollTo({
                            top: targetScroll,
                            behavior: 'instant'
                        });
                    }
                }, 100);
                return () => clearTimeout(timer);
            }
        }
    }, [key, ready]);
};
