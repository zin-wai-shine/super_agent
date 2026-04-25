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
            <span className="text-sm md:text-base md:font-semibold text-gray-900 dark:text-white mt-2 block w-full truncate text-center">{section.title}</span>
            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{count} photo{count !== 1 ? 's' : ''}</span>
        </button>
    );
}

// Skeleton Components for AllPhotos
function AllPhotosSkeleton({ isDesktop }) {
    return (
        <div className="flex flex-col gap-8 pb-8 animate-in fade-in duration-500">
            {/* Category Strip Skeleton */}
            <div className="md:flex-shrink-0 md:min-h-[30%]">
                <div className="px-4 md:px-8 lg:px-20 pt-5 pb-5 flex items-center justify-between">
                    <div className="h-8 md:h-10 w-48 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
                </div>
                <div className="flex gap-4 overflow-x-auto px-4 md:px-8 lg:px-20 pb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex-shrink-0 w-[140px] md:w-[200px] flex flex-col items-center gap-3">
                            <div className="w-full h-[100px] md:h-[150px] bg-gray-100 dark:bg-white/5 rounded-[12px] animate-pulse" />
                            <div className="h-4 w-24 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
                            <div className="h-3 w-16 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse opacity-60" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Sections Skeleton */}
            <div className="flex flex-col gap-12 px-4 md:px-8 lg:px-20">
                {[1, 2].map((s) => (
                    <div key={s} className="flex flex-col gap-6">
                        <div className="h-8 w-32 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
                        <div className="flex flex-col gap-4">
                            <div className="w-full aspect-[4/3] bg-gray-100 dark:bg-white/5 md:rounded-[24px] animate-pulse" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="aspect-[4/3] bg-gray-100 dark:bg-white/5 md:rounded-[24px] animate-pulse" />
                                <div className="aspect-[4/3] bg-gray-100 dark:bg-white/5 md:rounded-[24px] animate-pulse" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
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
    const [isLoading, setIsLoading] = useState(true);
    const { theme } = useTheme();
    const { isMainDomain } = useTenant();
    const [focusedImageIndex, setFocusedImageIndex] = useState(null); // null = list view, number = single full-screen image
    const { sections, flatImages } = useMemo(() => groupImagesByRoomType(images), [images]);
    const focusedScrollRef = useRef(null);
    const isManualScrolling = useRef(false);
    const lastTapTimeRef = useRef(0);
    const lastTapXRef = useRef(0);
    const DOUBLE_TAP_MS = 350;

    useEffect(() => {
        // Show skeleton briefly for smooth transition
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const scrollToImage = useCallback((index, smooth = true) => {
        if (!focusedScrollRef.current) return;
        isManualScrolling.current = true;
        const width = focusedScrollRef.current.offsetWidth;
        focusedScrollRef.current.scrollTo({
            left: index * width,
            behavior: smooth ? 'smooth' : 'auto'
        });
        setFocusedImageIndex(index);
        setTimeout(() => { isManualScrolling.current = false; }, 500);
    }, []);

    const goPrevImage = useCallback(() => {
        if (focusedImageIndex === null) return;
        const prevIdx = (focusedImageIndex - 1 + flatImages.length) % flatImages.length;
        scrollToImage(prevIdx);
    }, [focusedImageIndex, flatImages.length, scrollToImage]);

    const goNextImage = useCallback(() => {
        if (focusedImageIndex === null) return;
        const nextIdx = (focusedImageIndex + 1) % flatImages.length;
        scrollToImage(nextIdx);
    }, [focusedImageIndex, flatImages.length, scrollToImage]);

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

    // When entering focused view: scroll to initial index
    useEffect(() => {
        if (focusedImageIndex !== null && focusedScrollRef.current) {
            // Delay slightly to ensure layout is ready
            const timeout = setTimeout(() => {
                scrollToImage(focusedImageIndex, false);
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [focusedImageIndex === null]); // Only run when opening focused view

    const handleFocusedScroll = () => {
        if (!focusedScrollRef.current || isManualScrolling.current) return;
        const scrollLeft = focusedScrollRef.current.scrollLeft;
        const width = focusedScrollRef.current.offsetWidth;
        const newIndex = Math.round(scrollLeft / width);
        if (newIndex !== focusedImageIndex && newIndex >= 0 && newIndex < flatImages.length) {
            setFocusedImageIndex(newIndex);
        }
    };

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

    const renderFocusedView = () => {
        const currentIdx = focusedImageIndex ?? 0;
        const total = flatImages.length;

        const handleDoubleClick = (e) => {
            if (total <= 1) return;
            const width = window.innerWidth;
            const x = e.clientX || (e.touches && e.touches[0].clientX);
            if (!x) return;

            const now = Date.now();
            if (now - lastTapTimeRef.current < DOUBLE_TAP_MS) {
                if (x < width / 2) goPrevImage();
                else goNextImage();
                lastTapTimeRef.current = 0;
            } else {
                lastTapTimeRef.current = now;
            }
        };

        const focusedViewContent = (
            <div className="h-full min-h-0 flex flex-col bg-black overflow-hidden relative">
                {/* Header */}
                <header className="relative flex-none border-b border-white/10 z-10 bg-black">
                    <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between px-4 py-3 md:px-8 md:py-4 lg:px-20">
                        <button
                            type="button"
                            onClick={() => setFocusedImageIndex(null)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent dark:bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all group"
                        >
                            <ArrowLeftIcon className={`${isDesktop ? 'w-5 h-5' : 'w-7 h-7 md:w-6 md:h-6'} text-current stroke-[2] group-hover:-translate-x-0.5 transition-transform`} />
                        </button>

                        <span className={`absolute left-1/2 -translate-x-1/2 ${isDesktop ? 'text-base font-normal' : 'text-lg md:text-base font-semibold'} text-white truncate max-w-[50vw] pointer-events-none`}>
                            {focusedSectionTitle}
                        </span>

                        <button
                            type="button"
                            onClick={handleShare}
                            className="flex items-center justify-center w-10 h-10 text-white bg-transparent dark:bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
                        >
                            <ShareIcon className={`${isDesktop ? 'w-5 h-5' : 'w-7 h-7 md:w-6 md:h-6'} text-current stroke-[2]`} />
                        </button>
                    </div>
                </header>

                <div className="relative flex-1 min-h-0 flex items-center justify-center p-0">
                    <div className="w-full h-full mx-auto relative overflow-hidden">
                        <div
                            ref={focusedScrollRef}
                            onScroll={handleFocusedScroll}
                            className="w-full h-full flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain select-none no-scrollbar"
                            style={{ WebkitOverflowScrolling: 'touch' }}
                        >
                            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
                            {flatImages.map((img, i) => (
                                <div
                                    key={i}
                                    className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center p-4"
                                    onClick={handleDoubleClick}
                                >
                                    <img
                                        src={getMediaUrl(img.url)}
                                        alt=""
                                        className="max-w-full max-h-full w-auto h-auto object-contain pointer-events-none"
                                        draggable={false}
                                    />
                                </div>
                            ))}
                        </div>
                        {total > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); goPrevImage(); }}
                                    className="hidden md:flex absolute left-4 lg:left-20 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg border border-gray-200/80 items-center justify-center active:scale-95 transition-all"
                                >
                                    <ChevronLeftIcon className="w-6 h-6" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); goNextImage(); }}
                                    className="hidden md:flex absolute right-4 lg:right-20 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg border border-gray-200/80 items-center justify-center active:scale-95 transition-all"
                                >
                                    <ChevronRightIcon className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {total > 1 && (
                    <div className="flex-none min-h-[72px] pt-2 pb-4 flex flex-col justify-center items-center pointer-events-none bg-black">
                        <div className="flex items-center justify-center gap-2 mb-4 px-4 overflow-x-auto max-w-full no-scrollbar">
                            {Array.from({ length: total }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => scrollToImage(i, e)}
                                    className={`h-1.5 rounded-full flex-shrink-0 transition-all duration-300 ease-out pointer-events-auto ${i === currentIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );

        if (isDesktop) {
            return (
                <Modal isOpen onClose={() => setFocusedImageIndex(null)} size="full" hideHeader fullBleedDesktop contentClassName="bg-black" overlayZIndex={11000}>
                    {focusedViewContent}
                </Modal>
            );
        }
        return focusedViewContent;
    };

    if (isFocusedView && focusedImage) return renderFocusedView();

    let globalIndex = 0;

    return (
        <div className={`flex flex-col bg-white dark:bg-dashboard-dark ${isDesktop ? '' : 'h-full overflow-hidden'}`}>
            {!isDesktop && (
                <header className="relative flex-none border-b border-gray-100 dark:border-white/10 bg-white dark:bg-dashboard-dark shrink-0 z-20">
                    <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between px-4 md:px-8 lg:px-20 py-3 lg:py-4">
                        <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-transparent dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 rounded-full group">
                            <ArrowLeftIcon className="w-7 h-7 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <span className="absolute left-1/2 -translate-x-1/2 text-lg md:text-base font-semibold text-gray-900 dark:text-white truncate max-w-[50vw] pointer-events-none">
                            {activeSectionTitle || 'Photo tour'}
                        </span>
                        <button type="button" onClick={handleShare} className="flex items-center justify-center w-10 h-10 rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20">
                            <ShareIcon className="w-7 h-7 md:w-6 md:h-6" />
                        </button>
                    </div>
                </header>
            )}

            <div ref={scrollRef} className={`flex-1 min-h-0 ${isDesktop ? '' : 'overflow-y-scroll overflow-x-hidden overscroll-y-contain'}`} style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="mx-auto w-full max-w-[1440px] md:pb-8 md:pt-0">
                    {isLoading ? (
                        <AllPhotosSkeleton isDesktop={isDesktop} />
                    ) : (
                        <div className="min-h-full md:flex md:flex-col">
                            <div className="md:flex-shrink-0 md:min-h-[30%]">
                                <div className="px-4 md:px-8 lg:px-20 pt-5 pb-5 flex items-center justify-between relative">
                                    {isDesktop && (
                                        <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 group">
                                            <ArrowLeftIcon className="w-6 h-6 text-gray-900 dark:text-white group-hover:-translate-x-0.5 transition-transform" />
                                        </button>
                                    )}
                                    {!isDesktop && <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Photo tour</h1>}
                                    {isDesktop && (
                                        <button type="button" onClick={handleShare} className="flex items-center justify-center w-10 h-10 rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20">
                                            <ShareIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                                        </button>
                                    )}
                                </div>
                                <div className="pb-4 md:py-4">
                                    <div className="flex gap-4 overflow-x-auto px-4 md:px-8 lg:px-20 pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
                                        {sections.map((section) => {
                                            const firstIdx = flatImages.findIndex(im => im === section.images[0] || (im.id && im.id === section.images[0]?.id));
                                            return <LayerCard key={section.title} section={section} firstFlatIndex={firstIdx >= 0 ? firstIdx : 0} onTap={scrollToIndex} />;
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-8 pb-8 md:flex-1 md:min-h-0">
                                {sections.map((section) => {
                                    const firstFlatIndex = flatImages.findIndex(im => im === section.images[0] || (im.id && im.id === section.images[0]?.id));
                                    const firstIdx = firstFlatIndex >= 0 ? firstFlatIndex : 0;
                                    return (
                                        <div key={section.title} ref={el => { sectionRefs.current[section.title] = el; }} className="shrink-0 flex flex-col md:flex-row md:items-start md:gap-6 px-0 md:px-8 lg:px-20">
                                            <div className="flex-1 min-w-0 md:w-[70%] order-2 md:order-1">
                                                <div className="flex flex-col gap-4">
                                                    {(() => {
                                                        const rows = [];
                                                        let i = 0;
                                                        while (i < section.images.length) {
                                                            const img1 = section.images[i];
                                                            const idx1 = globalIndex++;
                                                            rows.push(
                                                                <div key={img1.id || idx1} role="button" tabIndex={0} data-photo-index={idx1} className="shrink-0 cursor-pointer" onClick={() => openFocusedView(idx1)}>
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
                                                                        <div role="button" tabIndex={0} data-photo-index={idx2} className="aspect-[4/3] bg-gray-100 overflow-hidden cursor-pointer md:rounded-[24px]" onClick={() => openFocusedView(idx2)}>
                                                                            <img src={getMediaUrl(img2.url)} alt="" className="w-full h-full object-cover block" />
                                                                        </div>
                                                                        {img3 ? (
                                                                            <div role="button" tabIndex={0} data-photo-index={idx3} className="aspect-[4/3] bg-gray-100 overflow-hidden cursor-pointer md:rounded-[24px]" onClick={() => openFocusedView(idx3)}>
                                                                                <img src={getMediaUrl(img3.url)} alt="" className="w-full h-full object-cover block" />
                                                                            </div>
                                                                        ) : <div className="aspect-[4/3] bg-gray-100 md:rounded-[24px]" />}
                                                                    </div>
                                                                );
                                                            }
                                                            i += 3;
                                                        }
                                                        return rows;
                                                    })()}
                                                </div>
                                            </div>
                                            <div className="md:w-[30%] md:flex-shrink-0 px-4 mb-3 md:mb-0 md:pt-1 md:px-0 order-1 md:order-2 text-left md:sticky md:top-32 self-start">
                                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {isMainDomain && (
                                <div className="flex flex-col items-center justify-center pt-0 pb-2 opacity-[0.08] pointer-events-none">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-56 h-56 bg-[length:100%_auto] bg-no-repeat bg-center flex items-center justify-center" style={theme?.logoUrl ? { backgroundImage: `url(${getMediaUrl(theme.logoUrl)})` } : {}}>
                                            {!theme?.logoUrl && <Logo className="w-56 h-56 text-primary-500" />}
                                        </div>
                                        {!theme?.logoUrl && <span className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">StayNest</span>}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
