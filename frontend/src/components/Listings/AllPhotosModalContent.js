import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { ArrowLeftIcon, ShareIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { TbSmartHome } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';
import Logo from '../Common/Logo';
import { useTheme } from '../../contexts/ThemeContext';
import { useTenant } from '../../contexts/TenantContext';
import Modal from '../ui/Modal';
import { getMediaUrl } from '../../utils/media';
import { PHOTO_ROOM_TYPES } from '../../services/api';
import { useTranslation } from 'react-i18next';

// Group images by room_type; treat empty as "Additional Photos". Order by PHOTO_ROOM_TYPES.
function groupImagesByRoomType(images) {
    const grouped = {};
    const seenUrls = new Set();
    
    // Deduplicate images by URL and group by room_type
    (images || []).forEach((img) => {
        if (!img.url || seenUrls.has(img.url)) return;
        seenUrls.add(img.url);

        const roomType = (img.room_type && img.room_type.trim()) ? img.room_type.trim() : 'Additional Photos';
        if (!grouped[roomType]) grouped[roomType] = [];
        grouped[roomType].push(img);
    });

    const sections = PHOTO_ROOM_TYPES.filter((t) => grouped[t]?.length).map((t) => ({ title: t, images: grouped[t] }));
    const flatImages = sections.flatMap((s) => s.images);
    return { sections, flatImages };
}

const getRoomTypeTranslationKey = (title) => {
    const map = {
        'Bedroom': 'gallery.bedroom',
        'Living Room': 'gallery.livingRoom',
        'Dining Area': 'gallery.diningArea',
        'Shared Full Bathroom': 'gallery.sharedFullBathroom',
        'Laundry area': 'gallery.laundryArea',
        'Exterior': 'gallery.exterior',
        'Additional Photos': 'gallery.additionalPhotos'
    };
    return map[title] || title;
};

// Layer card: stacked overlapping thumbnails for a section (first 2–3 images)
function LayerCard({ section, onTap, firstFlatIndex }) {
    const { t } = useTranslation();
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
            <span className="text-sm md:text-base md:font-semibold text-gray-900 dark:text-white mt-2 block w-full truncate text-center">{t(getRoomTypeTranslationKey(section.title))}</span>
            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{count === 1 ? t('gallery.photoCount', { count }) : t('gallery.photoCount_plural', { count })}</span>
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
                <div className="flex gap-4 overflow-x-auto px-4 md:px-8 lg:px-20 pb-6 no-scrollbar">
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
    const { t } = useTranslation();
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const sectionRefs = useRef({});
    const [activeSectionTitle, setActiveSectionTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { theme } = useTheme();
    const { isMainDomain } = useTenant();
    const [focusedImageIndex, setFocusedImageIndex] = useState(null);
    const { sections, flatImages } = useMemo(() => groupImagesByRoomType(images), [images]);
    const touchStartX = useRef(0);
    const lastTapTimeRef = useRef(0);
    const DOUBLE_TAP_MS = 350;

    useEffect(() => {
        // Show skeleton briefly for smooth transition
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const scrollToImage = useCallback((index) => {
        if (index >= 0 && index < flatImages.length) {
            setFocusedImageIndex(index);
        }
    }, [flatImages.length]);

    const goPrevImage = useCallback(() => {
        if (focusedImageIndex === null || focusedImageIndex <= 0) return;
        scrollToImage(focusedImageIndex - 1);
    }, [focusedImageIndex, scrollToImage]);

    const goNextImage = useCallback(() => {
        if (focusedImageIndex === null || focusedImageIndex >= flatImages.length - 1) return;
        scrollToImage(focusedImageIndex + 1);
    }, [focusedImageIndex, flatImages.length, scrollToImage]);

    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback((e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const deltaX = touchEndX - touchStartX.current;
        if (deltaX > 50) {
            goPrevImage();
        } else if (deltaX < -50) {
            goNextImage();
        }
    }, [goPrevImage, goNextImage]);

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

    const [scrolled, setScrolled] = useState(false);

    // Show section title in nav bar center based on scroll position (list view only)
    useEffect(() => {
        const container = scrollRef.current;
        if (!container || !sections.length || focusedImageIndex !== null) return;
        const updateActiveSection = () => {
            const scrollTop = container.scrollTop;
            setScrolled(scrollTop > 20);
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
                    url: window.location.href
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
            <div className="h-full min-h-0 flex flex-col overflow-hidden relative" style={{ background: '#000' }}>
                {/* Blurred background from current image */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
                    aria-hidden="true"
                >
                    <img
                        key={currentIdx}
                        src={getMediaUrl(flatImages[currentIdx]?.url)}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
                        style={{ filter: 'blur(28px) brightness(0.35) saturate(1.2)', transform: 'scale(1.1)' }}
                        draggable={false}
                    />
                    <div className="absolute inset-0 bg-black/50" />
                </div>

                {/* Header — standard size */}
                <header className="absolute top-0 left-0 right-0 z-50 h-[76px] lg:h-[80px] bg-gradient-to-b from-black/40 to-transparent">
                    <div className="max-w-[2520px] mx-auto w-full h-full flex items-center justify-between px-4 md:px-6 lg:px-20">
                        <button
                            type="button"
                            onClick={() => setFocusedImageIndex(null)}
                            className="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all group"
                        >
                            <ArrowLeftIcon className="w-5 h-5 text-white stroke-[2] group-hover:-translate-x-0.5 transition-transform" />
                        </button>

                        <span className="absolute left-1/2 -translate-x-1/2 text-[17px] font-bold text-white truncate max-w-[50vw] pointer-events-none text-center">
                            {t(getRoomTypeTranslationKey(focusedSectionTitle))}
                        </span>

                        <div className="w-[44px]" />
                    </div>
                </header>

                <div className="relative flex-1 min-h-0 flex items-center justify-center p-0 z-10">
                    <div 
                        className="w-full h-full mx-auto relative overflow-hidden flex items-center justify-center"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {flatImages.map((img, i) => {
                            const isActive = i === currentIdx;
                            return (
                                <div
                                    key={i}
                                    className={`absolute inset-0 flex items-center justify-center p-4 select-none transition-all duration-500 ease-out ${
                                        isActive 
                                            ? 'opacity-100 scale-100 z-10 pointer-events-auto' 
                                            : 'opacity-0 scale-[0.97] z-0 pointer-events-none'
                                    }`}
                                    onClick={handleDoubleClick}
                                >
                                    <img
                                        src={getMediaUrl(img.url)}
                                        alt=""
                                        className="max-w-full max-h-full w-auto h-auto object-contain pointer-events-none drop-shadow-2xl rounded-2xl md:rounded-[23px]"
                                        draggable={false}
                                    />
                                </div>
                            );
                        })}
                        {total > 1 && (
                            <>
                                {currentIdx > 0 && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); goPrevImage(); }}
                                        className="hidden md:flex absolute left-4 md:left-8 lg:left-20 top-1/2 -translate-y-1/2 z-20 w-[44px] h-[44px] rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center active:scale-95 transition-all group"
                                    >
                                        <ChevronLeftIcon className="w-5 h-5 transition-transform" strokeWidth={2} />
                                    </button>
                                )}
                                {currentIdx < total - 1 && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); goNextImage(); }}
                                        className="hidden md:flex absolute right-4 md:right-8 lg:left-auto lg:right-20 top-1/2 -translate-y-1/2 z-20 w-[44px] h-[44px] rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center active:scale-95 transition-all group"
                                    >
                                        <ChevronRightIcon className="w-5 h-5 transition-transform" strokeWidth={2} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {total > 1 && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md pointer-events-auto">
                        {(() => {
                            const maxDots = 5;
                            let startIndex = 0;
                            if (total > maxDots) {
                                startIndex = Math.max(0, Math.min(currentIdx - 2, total - maxDots));
                            }
                            return flatImages.slice(startIndex, startIndex + maxDots).map((_, i) => {
                                const actualIndex = startIndex + i;
                                const isActive = actualIndex === currentIdx;
                                return (
                                    <button
                                        key={actualIndex}
                                        onClick={(e) => { e.stopPropagation(); scrollToImage(actualIndex); }}
                                        className={`rounded-full transition-all duration-300 ease-out ${
                                            isActive 
                                                ? 'w-5 h-1.5 bg-white shadow-sm' 
                                                : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
                                        }`}
                                        aria-label={`Go to photo ${actualIndex + 1}`}
                                    />
                                );
                            });
                        })()}
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
            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            ` }} />
            <header className={`sticky top-0 flex-none z-[100] bg-white/95 dark:bg-dashboard-dark/95 backdrop-blur-md transition-all duration-300 border-b ${scrolled ? 'border-gray-100 dark:border-white/5' : 'border-transparent'}`}>
                <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between px-4 md:px-8 lg:px-20 h-[64px] lg:h-[80px]">
                    <div className="flex items-center gap-2">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-white dark:bg-dashboard-card border border-gray-200 dark:border-white/10 hover:border-[#222222] dark:hover:border-white/40 hover:shadow-md hover:-translate-y-[1px] transition-all duration-300 active:scale-[0.98] group"
                        >
                            <ArrowLeftIcon className="w-5 h-5 text-gray-800 dark:text-white transition-transform" strokeWidth={2} />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onClose && onClose();
                                navigate('/');
                            }}
                            className="hidden lg:flex px-5 h-[44px] items-center justify-center gap-2 rounded-full bg-white dark:bg-dashboard-card border border-gray-200 dark:border-white/10 hover:border-[#222222] dark:hover:border-white/40 hover:shadow-md hover:-translate-y-[1px] transition-all duration-300 active:scale-[0.98] group"
                            title={t('listing.goToHome')}
                        >
                            <TbSmartHome className="w-[22px] h-[22px] text-gray-800 dark:text-white transition-transform" />
                            <span className="text-[13px] font-bold tracking-tight text-gray-800 dark:text-white">{t('listing.goToHome')}</span>
                        </button>
                    </div>
                    <span className="absolute left-1/2 -translate-x-1/2 text-[16px] lg:text-[18px] font-bold text-gray-900 dark:text-white truncate max-w-[50vw] pointer-events-none text-center">
                        {activeSectionTitle ? t(getRoomTypeTranslationKey(activeSectionTitle)) : t('gallery.photoTour')}
                    </span>
                    <div className="w-[44px]" />
                </div>
            </header>
 
            <div ref={scrollRef} className={`flex-1 min-h-0 ${isDesktop ? '' : 'overflow-y-scroll overflow-x-hidden overscroll-y-contain'}`} style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="mx-auto w-full max-w-[1440px] md:pb-8 md:pt-0">
                    {isLoading ? (
                        <AllPhotosSkeleton isDesktop={isDesktop} />
                    ) : (
                        <div className="min-h-full md:flex md:flex-col">
                            <div className="md:flex-shrink-0 md:min-h-[30%]">
                                <div className="px-4 md:px-8 lg:px-20 pt-5 pb-5 flex items-center justify-between relative">
                                    {!isDesktop && <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{t('gallery.photoTour')}</h1>}
                                </div>
                                <div className="pb-4 md:py-4">
                                    <div className="flex gap-4 overflow-x-auto px-4 md:px-8 lg:px-20 pb-2 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
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
                                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{t(getRoomTypeTranslationKey(section.title))}</h2>
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
