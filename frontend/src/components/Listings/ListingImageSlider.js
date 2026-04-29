import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const ListingImageSlider = React.memo(({ images, title, cardLink, disableLink = false }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const scrollRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleScroll = useCallback(() => {
        if (scrollRef.current) {
            const width = scrollRef.current.offsetWidth;
            const newIndex = Math.round(scrollRef.current.scrollLeft / width);
            if (newIndex !== currentIndex) {
                setCurrentIndex(newIndex);
            }
        }
    }, [currentIndex]);

    const scrollTo = (index) => {
        if (scrollRef.current) {
            const width = scrollRef.current.offsetWidth;
            scrollRef.current.scrollTo({
                left: index * width,
                behavior: 'smooth'
            });
        }
    };

    const nextImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentIndex < images.length - 1) {
            scrollTo(currentIndex + 1);
        }
    };

    const prevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentIndex > 0) {
            scrollTo(currentIndex - 1);
        }
    };

    const Content = (
        <div 
            className="relative w-full h-full group/slider"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain no-scrollbar"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {images.map((img, i) => (
                    <div key={i} className="w-full h-full flex-shrink-0 snap-start">
                        <img
                            src={img}
                            alt={`${title} - ${i + 1}`}
                            className="w-full h-full object-cover select-none pointer-events-none"
                            loading={i === 0 ? "eager" : "lazy"}
                        />
                    </div>
                ))}
            </div>

            {/* Pagination Dots */}
            {images.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                    {images.slice(0, 5).map((_, i) => (
                        <div 
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                i === currentIndex % 5 
                                    ? 'bg-white scale-110 shadow-sm' 
                                    : 'bg-white/50'
                            }`}
                        />
                    ))}
                </div>
            )}

            {/* Desktop Navigation Arrows */}
            {!isMobile && images.length > 1 && (
                <>
                    <button
                        onClick={prevImage}
                        className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center transition-all duration-300 ${
                            isHovered && currentIndex > 0 ? 'opacity-100' : 'opacity-0'
                        } hover:bg-white active:scale-90`}
                    >
                        <ChevronLeftIcon className="w-5 h-5 text-gray-800" />
                    </button>
                    <button
                        onClick={nextImage}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center transition-all duration-300 ${
                            isHovered && currentIndex < images.length - 1 ? 'opacity-100' : 'opacity-0'
                        } hover:bg-white active:scale-90`}
                    >
                        <ChevronRightIcon className="w-5 h-5 text-gray-800" />
                    </button>
                </>
            )}
        </div>
    );

    if (disableLink) return Content;

    return (
        <Link to={cardLink} className="block w-full h-full">
            {Content}
        </Link>
    );
});

ListingImageSlider.displayName = 'ListingImageSlider';

export default ListingImageSlider;
