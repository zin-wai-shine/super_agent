import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { ArrowLeftIcon, ShareIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getMediaUrl } from '../../utils/media';
import { PHOTO_ROOM_TYPES } from '../../services/api';

// Group images by room_type; treat empty as "Additional Photos". Order by PHOTO_ROOM_TYPES.
function groupImagesByRoomType(images) {
    const grouped = {};
    (images || []).forEach((img) => {
        const roomType = (img.room_type && img.room_type.trim()) ? img.room_type.trim() : 'Additional Photos';
        if (!grouped[roomType]) grouped[roomType] = [];
        grouped[roomType].push(img);
    });
    const sections = PHOTO_ROOM_TYPES.filter((t) => grouped[t]?.length).map((t) => ({ title: t, images: grouped[t] }));
    const flatImages = sections.flatMap((s) => s.images);
    return { sections, flatImages };
}

// Layer card: stacked overlapping thumbnails for a section (first 2–3 images)
function LayerCard({ section, onTap, firstFlatIndex }) {
    const previews = section.images.slice(0, 3);
    const count = section.images.length;
    return (
        <button
            type="button"
            onClick={() => onTap(firstFlatIndex)}
            className="flex-shrink-0 w-[140px] md:w-[200px] flex flex-col items-center text-left rounded-xl"
        >
            <div className="relative w-full rounded-[12px] h-[100px] md:h-[150px]">
                {previews.map((img, i) => {
                    const isSingle = previews.length === 1;
                    return (
                        <div
                            key={img.id || i}
                            className="absolute rounded-[10px] overflow-hidden bg-gray-100 shadow-md border-2 border-white w-[82%] h-[78px] md:h-[117px]"
                            style={{
                                left: isSingle ? '50%' : i * 14,
                                top: isSingle ? 10 : i * 10,
                                transform: isSingle ? 'translateX(-50%)' : undefined,
                                zIndex: previews.length - i,
                            }}
                        >
                            <img
                                src={getMediaUrl(img.url)}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        </div>
                    );
                })}
            </div>
            <span className="text-sm md:text-base md:font-semibold text-gray-900 mt-2 block w-full truncate text-center">{section.title}</span>
            <span className="text-xs md:text-sm text-gray-500">{count} photo{count !== 1 ? 's' : ''}</span>
        </button>
    );
}

// Section title for a flat image index (from room_type)
function getSectionTitleForImage(img) {
    const rt = img?.room_type?.trim();
    return rt || 'Additional Photos';
}

export default function AllPhotosModalContent({ images, initialIndex, onClose }) {
    const scrollRef = useRef(null);
    const sectionRefs = useRef({});
    const [activeSectionTitle, setActiveSectionTitle] = useState('');
    const [focusedImageIndex, setFocusedImageIndex] = useState(null); // null = list view, number = single full-screen image
    const { sections, flatImages } = useMemo(() => groupImagesByRoomType(images), [images]);
    const swipeStartX = useRef(0);
    const focusedMouseStart = useRef({ x: 0, down: false });
    const focusedContainerRef = useRef(null);
    const lastTapTimeRef = useRef(0);
    const lastTapXRef = useRef(0);
    const SWIPE_THRESHOLD = 40;
    const DOUBLE_TAP_MS = 350;

    const goPrevImage = useCallback(() => {
        setFocusedImageIndex((i) => (i == null ? 0 : (i - 1 + flatImages.length) % flatImages.length));
    }, [flatImages.length]);

    const goNextImage = useCallback(() => {
        setFocusedImageIndex((i) => (i == null ? 0 : (i + 1) % flatImages.length));
    }, [flatImages.length]);

    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)');
        const handle = () => setIsMobile(mq.matches);
        mq.addEventListener('change', handle);
        return () => mq.removeEventListener('change', handle);
    }, []);

    // Keyboard: Arrow Left/Right when in single-image view
    useEffect(() => {
        if (focusedImageIndex == null || flatImages.length <= 1) return;
        const onKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goPrevImage();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                goNextImage();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [focusedImageIndex, flatImages.length, goPrevImage, goNextImage]);

    // Show section title in nav bar center based on scroll position (list view only)
    useEffect(() => {
        const container = scrollRef.current;
        if (!container || !sections.length || focusedImageIndex !== null) return;
        const updateActiveSection = () => {
            const scrollTop = container.scrollTop;
            const offset = 120;
            let active = sections[0]?.title ?? '';
            for (const section of sections) {
                const el = sectionRefs.current[section.title];
                if (el && el.offsetTop <= scrollTop + offset) active = section.title;
            }
            setActiveSectionTitle(active);
        };
        updateActiveSection();
        container.addEventListener('scroll', updateActiveSection, { passive: true });
        return () => container.removeEventListener('scroll', updateActiveSection);
    }, [sections, focusedImageIndex]);

    // When clicking a category card in the strip: scroll to that section (do not open big view)
    const scrollToIndex = (flatIndex) => {
        const el = scrollRef.current?.querySelector(`[data-photo-index="${flatIndex}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // When clicking an image in the list: open single full-screen view
    const openFocusedView = (flatIndex) => {
        setFocusedImageIndex(flatIndex);
    };

    const handleShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: 'Property photos',
                    url: window.location.href,
                    text: 'Check out these property photos'
                });
            } catch (e) {
                if (e.name !== 'AbortError') {
                    if (typeof window !== 'undefined' && window.navigator.clipboard) {
                        window.navigator.clipboard.writeText(window.location.href);
                    }
                }
            }
        } else if (typeof window !== 'undefined' && window.navigator.clipboard) {
            window.navigator.clipboard.writeText(window.location.href);
        }
    };

    if (!flatImages.length) return null;

    const isFocusedView = focusedImageIndex !== null;
    const focusedImage = flatImages[focusedImageIndex ?? 0];
    const focusedSectionTitle = focusedImage ? getSectionTitleForImage(focusedImage) : '';

    // Single full-screen image view: count, drag left/right to change image (title updates with section)
    if (isFocusedView && focusedImage) {
        const currentIdx = focusedImageIndex ?? 0;
        const total = flatImages.length;
        const handleTouchStart = (e) => {
            swipeStartX.current = e.touches[0].clientX;
        };
        const tryDoubleTap = (clientX) => {
            const el = focusedContainerRef.current;
            if (!el || total <= 1) return;
            const rect = el.getBoundingClientRect();
            const mid = rect.left + rect.width / 2;
            const now = Date.now();
            const sameSide = (clientX < mid && lastTapXRef.current < mid) || (clientX >= mid && lastTapXRef.current >= mid);
            if (now - lastTapTimeRef.current < DOUBLE_TAP_MS && sameSide) {
                if (clientX < mid) goPrevImage();
                else goNextImage();
                lastTapTimeRef.current = 0;
            } else {
                lastTapTimeRef.current = now;
                lastTapXRef.current = clientX;
            }
        };
        const handleTouchEnd = (e) => {
            const touch = e.changedTouches[0];
            const dx = touch.clientX - swipeStartX.current;
            if (dx > SWIPE_THRESHOLD && total > 1) goPrevImage();
            else if (dx < -SWIPE_THRESHOLD && total > 1) goNextImage();
            else if (Math.abs(dx) <= SWIPE_THRESHOLD) tryDoubleTap(touch.clientX);
        };
        const handleMouseDown = (e) => {
            focusedMouseStart.current = { x: e.clientX, down: true };
        };
        const handleMouseMove = (e) => {
            if (!focusedMouseStart.current.down || total <= 1) return;
            const dx = e.clientX - focusedMouseStart.current.x;
            if (dx > SWIPE_THRESHOLD) {
                goPrevImage();
                focusedMouseStart.current.down = false;
            } else if (dx < -SWIPE_THRESHOLD) {
                goNextImage();
                focusedMouseStart.current.down = false;
            }
        };
        const handleMouseUp = (e) => {
            if (focusedMouseStart.current.down && total > 1) tryDoubleTap(e.clientX);
            focusedMouseStart.current.down = false;
        };

        return (
            <div className="h-full min-h-0 flex flex-col bg-black overflow-hidden">
                <header className="relative flex-none flex items-center justify-between px-4 py-3 shrink-0 z-10">
                    <button
                        type="button"
                        onClick={() => setFocusedImageIndex(null)}
                        className="flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 text-white hover:text-gray-200 py-3 px-3 md:py-2 md:px-2 -ml-2 rounded-full hover:bg-white/10 active:scale-95 transition-colors duration-200"
                    >
                        <ArrowLeftIcon className="w-7 h-7 md:w-6 md:h-6" />
                    </button>
                    <span className="absolute left-1/2 -translate-x-1/2 text-lg md:text-base font-semibold text-white truncate max-w-[50vw] pointer-events-none">
                        {focusedSectionTitle}
                    </span>
                    <button
                        type="button"
                        onClick={handleShare}
                        className="flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 p-3 md:p-2 rounded-full text-white hover:bg-white/10 active:scale-95 transition-colors duration-200"
                        aria-label="Share"
                    >
                        <ShareIcon className="w-7 h-7 md:w-6 md:h-6" />
                    </button>
                </header>
                <div className="relative flex-1 min-h-0 flex items-center justify-center p-0 overflow-hidden">
                    <div
                        ref={focusedContainerRef}
                        className="absolute inset-0 flex items-center justify-center select-none cursor-grab active:cursor-grabbing overflow-hidden"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <div className="flex items-center justify-center w-full h-full min-w-0 min-h-0 p-4">
                            <div key={currentIdx} className="flex items-center justify-center w-full h-full animate-fade-in">
                                <img
                                    src={getMediaUrl(flatImages[currentIdx].url)}
                                    alt=""
                                    className="max-w-full max-h-full w-auto h-auto object-contain pointer-events-none"
                                    style={{ maxHeight: '100%' }}
                                    draggable={false}
                                />
                            </div>
                        </div>
                    </div>
                    {total > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); goPrevImage(); }}
                                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg border border-gray-200/80 items-center justify-center active:scale-95 transition-all"
                                aria-label="Previous image"
                            >
                                <ChevronLeftIcon className="w-6 h-6" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); goNextImage(); }}
                                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg border border-gray-200/80 items-center justify-center active:scale-95 transition-all"
                                aria-label="Next image"
                            >
                                <ChevronRightIcon className="w-6 h-6" />
                            </button>
                        </>
                    )}
                </div>
                {total > 1 && (
                    <div className="flex-none py-3 flex justify-center items-center pointer-events-none">
                        <div className="flex items-center justify-center gap-1.5" style={{ width: 5 * 14 }}>
                            {[0, 1, 2, 3, 4].map((i) => {
                                const imageIndex = currentIdx - 2 + i;
                                const inRange = imageIndex >= 0 && imageIndex < total;
                                const isCenter = i === 2;
                                return (
                                    <div
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full transition-all flex-shrink-0 ${
                                            isCenter ? 'bg-white scale-110' : inRange ? 'bg-white/60' : 'bg-white/30'
                                        }`}
                                        aria-hidden
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    let globalIndex = 0;

    return (
        <div className="h-full min-h-0 flex flex-col bg-white overflow-hidden">
            <header className="relative flex-none flex items-center justify-between px-4 py-3 md:px-8 lg:px-10 border-b border-gray-100 shrink-0">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 text-gray-900 hover:text-gray-700 py-3 px-3 md:py-2 md:px-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-colors duration-200"
                >
                    <ArrowLeftIcon className="w-7 h-7 md:w-6 md:h-6" />
                </button>
                <span className="absolute left-1/2 -translate-x-1/2 text-lg md:text-base font-semibold text-gray-900 truncate max-w-[50vw] pointer-events-none">
                    {activeSectionTitle || 'Photo tour'}
                </span>
                <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 p-3 md:p-2 rounded-full text-gray-900 hover:bg-gray-100 active:scale-95 transition-colors duration-200"
                    aria-label="Share"
                >
                    <ShareIcon className="w-7 h-7 md:w-6 md:h-6" />
                </button>
            </header>

            <div
                ref={scrollRef}
                className="flex-1 min-h-0 overflow-y-scroll overflow-x-hidden overscroll-y-contain"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {/* Desktop: 30% top block (Photo tour + strip), 70% sections below */}
                <div className="min-h-full md:flex md:flex-col">
                    <div className="md:flex-shrink-0 md:min-h-[30%]">
                        <div className="pl-4 pr-4 pt-5 pb-2 md:px-8 lg:px-10">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Photo tour</h1>
                        </div>

                        {/* Horizontal strip: one layer card per section (not per image) */}
                        <div className="pb-4">
                            <div
                                className="flex gap-4 overflow-x-auto pl-4 pr-4 pb-2 md:pl-8 md:pr-8 lg:pl-10 lg:pr-10 -mr-4"
                                style={{ WebkitOverflowScrolling: 'touch' }}
                            >
                                {sections.map((section) => {
                                    const firstIdx = flatImages.findIndex(
                                        (im) => im === section.images[0] || (im.id && im.id === section.images[0]?.id)
                                    );
                                    return (
                                        <LayerCard
                                            key={section.title}
                                            section={section}
                                            firstFlatIndex={firstIdx >= 0 ? firstIdx : 0}
                                            onTap={scrollToIndex}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main content: 70% on desktop */}
                    <div className="flex flex-col gap-8 pb-8 md:flex-1 md:min-h-0">
                    {sections.map((section) => {
                        const firstFlatIndex = flatImages.findIndex(
                            (im) => im === section.images[0] || (im.id && im.id === section.images[0]?.id)
                        );
                        const firstIdx = firstFlatIndex >= 0 ? firstFlatIndex : 0;
                        return (
                            <div
                                key={section.title}
                                ref={(el) => { sectionRefs.current[section.title] = el; }}
                                className="shrink-0 flex flex-col md:flex-row md:items-start md:gap-6 px-0 md:px-8 lg:px-10"
                            >
                                {/* First column (desktop): images — 70% (left); on mobile appears below title via order */}
                                <div className="flex-1 min-w-0 md:w-[70%] order-2 md:order-1">
                                {/* One big, two small, one big, two small… */}
                                <div className="flex flex-col gap-4">
                                    {(() => {
                                        const rows = [];
                                        let i = 0;
                                        while (i < section.images.length) {
                                            const img1 = section.images[i];
                                            const idx1 = globalIndex++;
                                            rows.push(
                                                <div
                                                    key={img1.id || idx1}
                                                    role="button"
                                                    tabIndex={0}
                                                    data-photo-index={idx1}
                                                    className="shrink-0 cursor-pointer"
                                                    onClick={() => openFocusedView(idx1)}
                                                    onKeyDown={(e) => e.key === 'Enter' && openFocusedView(idx1)}
                                                >
                                                    <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden md:rounded-[24px]">
                                                        <img src={getMediaUrl(img1.url)} alt="" className="w-full h-full object-cover block" />
                                                    </div>
                                                </div>
                                            );
                                            if (i + 1 < section.images.length) {
                                                const img2 = section.images[i + 1];
                                                const img3 = section.images[i + 2];
                                                const idx2 = globalIndex++;
                                                const idx3 = img3 ? globalIndex++ : null;
                                                rows.push(
                                                    <div key={img2.id || `row-${idx2}`} className="grid grid-cols-2 gap-3 shrink-0">
                                                        <div
                                                            role="button"
                                                            tabIndex={0}
                                                            data-photo-index={idx2}
                                                            className="aspect-[4/3] bg-gray-100 overflow-hidden cursor-pointer md:rounded-[24px]"
                                                            onClick={() => openFocusedView(idx2)}
                                                            onKeyDown={(e) => e.key === 'Enter' && openFocusedView(idx2)}
                                                        >
                                                            <img src={getMediaUrl(img2.url)} alt="" className="w-full h-full object-cover block" />
                                                        </div>
                                                        {img3 ? (
                                                            <div
                                                                role="button"
                                                                tabIndex={0}
                                                                data-photo-index={idx3}
                                                                className="aspect-[4/3] bg-gray-100 overflow-hidden cursor-pointer md:rounded-[24px]"
                                                                onClick={() => openFocusedView(idx3)}
                                                                onKeyDown={(e) => e.key === 'Enter' && openFocusedView(idx3)}
                                                            >
                                                                <img src={getMediaUrl(img3.url)} alt="" className="w-full h-full object-cover block" />
                                                            </div>
                                                        ) : (
                                                            <div className="aspect-[4/3] bg-gray-100 md:rounded-[24px]" />
                                                        )}
                                                    </div>
                                                );
                                            }
                                            i += 3;
                                        }
                                        return rows;
                                    })()}
                                </div>
                                </div>
                                {/* Second column (desktop): section title only — 30% (right); on mobile appears first via order; text left-aligned */}
                                <div className="md:w-[30%] md:flex-shrink-0 px-4 mb-3 md:mb-0 md:pt-1 md:px-0 order-1 md:order-2 text-left">
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{section.title}</h2>
                                </div>
                            </div>
                        );
                    })}
                </div>
                </div>
            </div>
        </div>
    );
}
