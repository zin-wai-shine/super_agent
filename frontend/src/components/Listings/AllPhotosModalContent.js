import React, { useMemo, useRef, useState, useEffect } from 'react';
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

export default function AllPhotosModalContent({ images, initialIndex, onClose }) {
    const scrollRef = useRef(null);
    const sectionRefs = useRef({});
    const [activeSectionTitle, setActiveSectionTitle] = useState('');
    const { sections, flatImages } = useMemo(() => groupImagesByRoomType(images), [images]);

    // Show section title in nav bar center based on scroll position
    useEffect(() => {
        const container = scrollRef.current;
        if (!container || !sections.length) return;
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
    }, [sections]);

    // Only scrolling when user clicks a card in the photo tour strip (not on open)
    const scrollToIndex = (idx) => {
        const el = scrollRef.current?.querySelector(`[data-photo-index="${idx}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    let globalIndex = 0;

    return (
        <div className="h-full min-h-0 flex flex-col bg-white overflow-hidden">
            <header className="relative flex-none flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex items-center gap-1.5 text-gray-900 hover:text-gray-700 py-2 px-2 -ml-2 rounded-lg hover:bg-gray-100 active:scale-95"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <span className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-gray-900 truncate max-w-[50vw] pointer-events-none">
                    {activeSectionTitle || 'Photo tour'}
                </span>
                <button
                    type="button"
                    onClick={handleShare}
                    className="p-2 rounded-full text-gray-900 hover:bg-gray-100 active:scale-95"
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
                                                <div key={img1.id || idx1} data-photo-index={idx1} className="shrink-0">
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
                                                        <div data-photo-index={idx2} className="aspect-[4/3] bg-gray-100 overflow-hidden">
                                                            <img src={getMediaUrl(img2.url)} alt="" className="w-full h-full object-cover block" />
                                                        </div>
                                                        {img3 ? (
                                                            <div data-photo-index={idx3} className="aspect-[4/3] bg-gray-100 overflow-hidden">
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
