import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    const navType = useNavigationType();

    useEffect(() => {
        // If it's a 'POP' action (browser back/forward or navigate(-1)), 
        // we don't force scroll to top. This allows the page to either keep 
        // its browser-restored scroll or use its internal restoration logic (like in ListingsPage.js).
        if (navType === 'POP') return;

        // Immediate scroll
        const doScroll = () => {
            window.scrollTo(0, 0);
            const mainContainer = document.getElementById('main-scroll-container');
            if (mainContainer) {
                mainContainer.scrollTo(0, 0);
            }
            
            // Also handle any modal containers
            const modalContainers = document.querySelectorAll('.modal-scrollable');
            modalContainers.forEach(container => {
                container.scrollTo(0, 0);
            });
        };

        doScroll();
        
        // Backup scroll with a very slight delay for pages that might have height issues on mount
        const timeoutId = setTimeout(doScroll, 5);
        
        return () => clearTimeout(timeoutId);
    }, [pathname, navType]);

    return null;
};

export default ScrollToTop;
