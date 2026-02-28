import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { ArrowLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
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
            className="flex-shrink-0 w-[140px] flex flex-col items-center text-left rounded-xl"
        >
            <div className="relative w-full rounded-[12px]" style={{ height: 100 }}>
                {previews.map((img, i) => (
                    <div
                        key={img.id || i}
                        className="absolute rounded-[10px] overflow-hidden bg-gray-100 shadow-md border-2 border-white"
                        style={{
                            width: '82%',
                            height: 78,
                            left: i * 14,
                            top: i * 10,
                            zIndex: previews.length - i,
                        }}
                    >
                        <img
                            src={getMediaUrl(img.url)}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>
            <span className="text-sm font-semibold text-gray-900 mt-2 block w-full truncate text-center">{section.title}</span>
            <span className="text-xs text-gray-500">{count} photo{count !== 1 ? 's' : ''}</span>
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
    const SWIPE_THRESHOLD = 40;

    const goPrevImage = useCallback(() => {
        setFocusedImageIndex((i) => (i == null ? 0 : (i - 1 + flatImages.length) % flatImages.length));
    }, [flatImages.length]);

    const goNextImage = useCallback(() => {
        setFocusedImageIndex((i) => (i == null ? 0 : (i + 1) % flatImages.length));
    }, [flatImages.length]);

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
        const handleTouchEnd = (e) => {
            const dx = e.changedTouches[0].clientX - swipeStartX.current;
            if (dx > SWIPE_THRESHOLD && total > 1) goPrevImage();
            else if (dx < -SWIPE_THRESHOLD && total > 1) goNextImage();
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
        const handleMouseUp = () => {
            focusedMouseStart.current.down = false;
        };

        return (
            <div className="h-full min-h-0 flex flex-col bg-black overflow-hidden">
                <header className="relative flex-none flex items-center justify-between px-4 py-3 shrink-0 z-10">
                    <button
                        type="button"
                        onClick={() => setFocusedImageIndex(null)}
                        className="flex items-center gap-1.5 text-white hover:text-gray-200 py-2 px-2 -ml-2 rounded-lg hover:bg-white/10 active:scale-95 transition-colors duration-200"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <span className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-white truncate max-w-[50vw] pointer-events-none">
                        {focusedSectionTitle}
                    </span>
                    <button
                        type="button"
                        onClick={handleShare}
                        className="p-2 rounded-full text-white hover:bg-white/10 active:scale-95 transition-colors duration-200"
                        aria-label="Share"
                    >
                        <ShareIcon className="w-6 h-6" />
                    </button>
                </header>
                <div
                    className="flex-1 min-h-0 flex items-center justify-center p-0 overflow-hidden select-none cursor-grab active:cursor-grabbing"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <img
                        src={getMediaUrl(focusedImage.url)}
                        alt=""
                        className="max-w-full max-h-full w-auto h-full object-contain pointer-events-none"
                        draggable={false}
                    />
                </div>
                {total > 1 && (
                    <div className="flex-none py-3 flex justify-center pointer-events-none">
                        <span className="bg-black/70 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                            {currentIdx + 1} / {total}
                        </span>
                    </div>
                )}
            </div>
        );
    }

    let globalIndex = 0;

    return (
        <div className="h-full min-h-0 flex flex-col bg-white overflow-hidden">
            <header className="relative flex-none flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex items-center gap-1.5 text-gray-900 hover:text-gray-700 py-2 px-2 -ml-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-colors duration-200"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <span className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-gray-900 truncate max-w-[50vw] pointer-events-none">
                    {activeSectionTitle || 'Photo tour'}
                </span>
                <button
                    type="button"
                    onClick={handleShare}
                    className="p-2 rounded-full text-gray-900 hover:bg-gray-100 active:scale-95 transition-colors duration-200"
                    aria-label="Share"
                >
                    <ShareIcon className="w-6 h-6" />
                </button>
            </header>

            <div
                ref={scrollRef}
                className="flex-1 min-h-0 overflow-y-scroll overflow-x-hidden overscroll-y-contain"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                <div className="pl-4 pr-4 pt-5 pb-2">
                    <h1 className="text-2xl font-bold text-gray-900">Photo tour</h1>
                </div>

                {/* Horizontal strip: one layer card per section (not per image) */}
                <div className="pb-4">
                    <div
                        className="flex gap-4 overflow-x-auto pl-4 pr-4 pb-2 -mr-4"
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

                {/* Main content: one layer card per section, then that section's images */}
                <div className="flex flex-col gap-8 pb-8">
                    {sections.map((section) => {
                        const firstFlatIndex = flatImages.findIndex(
                            (im) => im === section.images[0] || (im.id && im.id === section.images[0]?.id)
                        );
                        const firstIdx = firstFlatIndex >= 0 ? firstFlatIndex : 0;
                        return (
                            <div
                                key={section.title}
                                ref={(el) => { sectionRefs.current[section.title] = el; }}
                                className="shrink-0"
                            >
                                <h2 className="text-lg font-bold text-xl text-gray-900 px-5 mb-3">{section.title}</h2>
                                {/* Layer design: stacked preview for this section; tap to scroll to images */}
                               
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
                                                    <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden">
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
                                                            className="aspect-[4/3] bg-gray-100 overflow-hidden cursor-pointer"
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
                                                                className="aspect-[4/3] bg-gray-100 overflow-hidden cursor-pointer"
                                                                onClick={() => openFocusedView(idx3)}
                                                                onKeyDown={(e) => e.key === 'Enter' && openFocusedView(idx3)}
                                                            >
                                                                <img src={getMediaUrl(img3.url)} alt="" className="w-full h-full object-cover block" />
                                                            </div>
                                                        ) : (
                                                            <div className="aspect-[4/3] bg-gray-100" />
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
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
