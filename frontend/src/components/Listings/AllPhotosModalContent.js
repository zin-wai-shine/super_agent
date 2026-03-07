import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { ArrowLeftIcon, ShareIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Logo from '../Common/Logo';
import { useTheme } from '../../contexts/ThemeContext';
import { useTenant } from '../../contexts/TenantContext';
import Modal from '../ui/Modal';
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

export default function AllPhotosModalContent({ images, initialIndex, onClose, isDesktop = false }) {
    const scrollRef = useRef(null);
    const sectionRefs = useRef({});
    const [activeSectionTitle, setActiveSectionTitle] = useState('');
    const { theme } = useTheme();
    const { isMainDomain } = useTenant();
    const [focusedImageIndex, setFocusedImageIndex] = useState(null); // null = list view, number = single full-screen image
    const { sections, flatImages } = useMemo(() => groupImagesByRoomType(images), [images]);
    const swipeStartX = useRef(0);
    const swipeEndX = useRef(0); // for two-finger: last touch center X when fingers move
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
        const getTouchCenterX = (touchList) => {
            if (!touchList?.length) return 0;
            let sum = 0;
            for (let i = 0; i < touchList.length; i++) sum += touchList[i].clientX;
            return sum / touchList.length;
        };
        const handleTouchStart = (e) => {
            swipeStartX.current = getTouchCenterX(e.touches);
            swipeEndX.current = swipeStartX.current;
        };
        const handleTouchMove = (e) => {
            if (e.touches.length > 0) swipeEndX.current = getTouchCenterX(e.touches);
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
            // Use center of all touches (supports two-finger swipe); fallback to lifted finger position
            const endX = e.touches.length > 0 ? getTouchCenterX(e.touches) : swipeEndX.current;
            const dx = endX - swipeStartX.current;
            if (dx > SWIPE_THRESHOLD && total > 1) goPrevImage();
            else if (dx < -SWIPE_THRESHOLD && total > 1) goNextImage();
            else if (Math.abs(dx) <= SWIPE_THRESHOLD) tryDoubleTap(touch?.clientX ?? endX);
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

        const focusedViewContent = (
            <div className="h-full min-h-0 flex flex-col bg-black overflow-hidden relative">
                {/* Header: Desktop has "Back to list" and "Share" text buttons; Mobile remains as-is */}
                <header className="relative flex-none border-b border-white/10 z-10 bg-black">
                    <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between px-4 py-3 md:px-8 md:py-4 lg:px-20">
                        {isDesktop ? (
                            <button
                                type="button"
                                onClick={() => setFocusedImageIndex(null)}
                                className="flex items-center justify-center min-w-[44px] min-h-[44px] text-white hover:text-gray-300 hover:bg-white/10 rounded-full transition-all duration-200"
                                aria-label="Back to list"
                            >
                                <ArrowLeftIcon className="w-5 h-5 text-current stroke-[2]" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setFocusedImageIndex(null)}
                                className="flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 text-white hover:text-gray-200 py-3 px-3 md:py-2 md:px-2 -ml-2 rounded-full hover:bg-white/10 active:scale-95 transition-colors duration-200"
                            >
                                <ArrowLeftIcon className="w-7 h-7 md:w-6 md:h-6" />
                            </button>
                        )}

                        <span className={`absolute left-1/2 -translate-x-1/2 ${isDesktop ? 'text-base font-normal' : 'text-lg md:text-base font-semibold'} text-white truncate max-w-[50vw] pointer-events-none`}>
                            {focusedSectionTitle}
                        </span>

                        {isDesktop ? (
                            <button
                                type="button"
                                onClick={handleShare}
                                className="flex items-center justify-center min-w-[44px] min-h-[44px] text-white hover:text-gray-300 hover:bg-white/10 rounded-full transition-all duration-200"
                                aria-label="Share"
                            >
                                <ShareIcon className="w-5 h-5 text-current stroke-[2]" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleShare}
                                className="flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 p-3 md:p-2 rounded-full text-white hover:bg-white/10 active:scale-95 transition-colors duration-200"
                                aria-label="Share"
                            >
                                <ShareIcon className="w-7 h-7 md:w-6 md:h-6" />
                            </button>
                        )}
                    </div>
                </header>
                <div className="relative flex-1 min-h-0 flex items-center justify-center p-0 overflow-hidden">
                    <div className="w-full max-w-[1440px] h-full mx-auto relative flex items-center justify-center px-4 md:px-8 lg:px-20">
                        <div
                            ref={focusedContainerRef}
                            className="absolute inset-0 flex items-center justify-center select-none cursor-grab active:cursor-grabbing overflow-hidden"
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
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
                                    className="hidden md:flex absolute left-4 lg:left-20 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg border border-gray-200/80 items-center justify-center active:scale-95 transition-all"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeftIcon className="w-6 h-6" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); goNextImage(); }}
                                    className="hidden md:flex absolute right-4 lg:right-20 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg border border-gray-200/80 items-center justify-center active:scale-95 transition-all"
                                    aria-label="Next image"
                                >
                                    <ChevronRightIcon className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
                {total > 1 && (
                    <div className="flex-none min-h-[72px] pt-2 pb-4 flex flex-col justify-center items-center pointer-events-none bg-black">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            {Array.from({ length: total }, (_, i) => {
                                const isActive = i === currentIdx;
                                return (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full flex-shrink-0 transition-all duration-300 ease-out ${isActive ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
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

        if (isDesktop) {
            return (
                <Modal
                    isOpen={true}
                    onClose={() => setFocusedImageIndex(null)}
                    size="full"
                    hideHeader
                    fullBleedDesktop={true}
                    contentClassName="bg-black"
                    overlayZIndex={11000}
                >
                    {focusedViewContent}
                </Modal>
            );
        }
        return focusedViewContent;
    }

    let globalIndex = 0;

    return (
        <div className={`flex flex-col bg-white ${isDesktop ? '' : 'h-full overflow-hidden'}`}>
            {!isDesktop && (
                <header className="relative flex-none border-b border-gray-100 bg-white shrink-0 z-20">
                    <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between px-4 md:px-8 lg:px-20 py-3 lg:py-4">
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
                    </div>
                </header>
            )}

            <div
                ref={scrollRef}
                className={`flex-1 min-h-0 ${isDesktop ? '' : 'overflow-y-scroll overflow-x-hidden overscroll-y-contain'}`}
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                <div className="mx-auto w-full max-w-[1440px] md:py-8">
                    {/* Desktop: 30% top block (Photo tour + strip), 70% sections below */}
                    <div className="min-h-full md:flex md:flex-col">
                        <div className="md:flex-shrink-0 md:min-h-[30%]">
                            <div className="px-4 md:px-8 lg:px-20 pt-5 pb-5 flex items-center justify-between relative">
                                {isDesktop && (
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-100 transition-colors z-10"
                                    >
                                        <ArrowLeftIcon className="w-6 h-6 text-gray-900" />
                                    </button>
                                )}
                                {!isDesktop && (
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                        Photo tour
                                    </h1>
                                )}
                                {isDesktop && (
                                    <button
                                        type="button"
                                        onClick={handleShare}
                                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors z-10"
                                    >
                                        <ShareIcon className="w-6 h-6 text-gray-900" />
                                    </button>
                                )}
                            </div>

                            {/* Horizontal strip: one layer card per section (not per image) */}
                            <div className="pb-4 md:py-4">
                                <div
                                    className="flex gap-4 overflow-x-auto px-4 md:px-8 lg:px-20 pb-2"
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
                                        className="shrink-0 flex flex-col md:flex-row md:items-start md:gap-6 px-0 md:px-8 lg:px-20"
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
                                        <div className="md:w-[30%] md:flex-shrink-0 px-4 mb-3 md:mb-0 md:pt-1 md:px-0 order-1 md:order-2 text-left md:sticky md:top-32 self-start">
                                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{section.title}</h2>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Subdomain-style watermark logo — centered, low opacity */}
                        {isMainDomain && (
                            <div className="flex flex-col items-center justify-center pt-0 pb-2 opacity-[0.08] pointer-events-none">
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        className="w-56 h-56 bg-[length:100%_auto] bg-no-repeat bg-center flex items-center justify-center"
                                        style={theme?.logoUrl ? { backgroundImage: `url(${getMediaUrl(theme.logoUrl)})` } : {}}
                                    >
                                        {!theme?.logoUrl && (
                                            <Logo className="w-56 h-56 text-primary-500" />
                                        )}
                                    </div>
                                    {!theme?.logoUrl && (
                                        <span className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">StayNest</span>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
