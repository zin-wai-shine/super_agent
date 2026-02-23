import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    MapPinIcon,
    LinkIcon
} from '@heroicons/react/24/outline';
import { getMediaUrl } from '../../utils/media';
import { TbTrain } from "react-icons/tb";

const ProjectCard = ({ project, viewMode = 'grid', to }) => {
    const {
        id,
        name,
        developer,
        description,
        status,
        project_type,
        district,
        station_id,
        cover_image,
        created_at,
    } = project;

    // Use cover image or fallback placeholder
    const featuredImage = getMediaUrl(cover_image) || '/placeholder-image.jpg';

    const [copied, setCopied] = React.useState(false);
    const [searchParams] = useSearchParams();

    const handleCopyLink = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const url = `${window.location.origin}/projects?project=${id}`;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } else {
                // Fallback for non-secure contexts
                const textArea = document.createElement("textarea");
                textArea.value = url;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                textArea.style.top = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }
                document.body.removeChild(textArea);
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const isListView = viewMode === 'list';
    const isMapListView = viewMode === 'map-list';

    // Format proper status labels natively without needing complex map
    const formatStatus = (s) => {
        if (!s) return 'Unknown Status';
        return s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    // Format project type
    const formatType = (t) => {
        if (!t) return 'Project';
        return t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    if (isMapListView) {
        const detailParams = new URLSearchParams(searchParams);
        detailParams.set('project', id);
        return (
            <Link
                to={to || `/projects?${detailParams.toString()}`}
                className="group flex flex-row gap-4 py-4 md:py-5 border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-300 px-2 -mx-2 rounded-xl"
            >
                {/* Image Section */}
                <div className="w-[160px] md:w-[240px] aspect-[4/3] relative rounded-[var(--card-radius)] overflow-hidden flex-none">
                    <img
                        src={featuredImage}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />

                    {/* Status Badge in Image */}
                    {status && (
                        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
                            <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded shadow-sm border border-gray-100/80">
                                <span className="text-gray-900 font-bold text-[13px] md:text-[14px] tracking-tight">{formatStatus(status)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5 md:py-1">
                    <div className="flex flex-col gap-1.5 md:gap-2">
                        {/* Title */}
                        <h3 className="text-sm md:text-[15px] font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                            {name}
                        </h3>

                        {/* Location / Information (Vertical stack) */}
                        <div className="flex flex-col gap-1.5 mt-1 md:mt-2">
                            <div className="flex items-center text-[12px] md:text-[13px] text-gray-500 shrink-0">
                                <span className="font-medium text-gray-400 w-24">Developer</span>
                                <span className="font-bold text-gray-700 truncate">: &nbsp; {developer?.name || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center text-[12px] md:text-[13px] text-gray-500 shrink-0">
                                <span className="font-medium text-gray-400 w-24">Location</span>
                                <span className="font-bold text-gray-700 truncate">: &nbsp; {district || 'Bangkok'}</span>
                            </div>
                            {station_id && (
                                <div className="flex items-center text-[12px] md:text-[13px] text-gray-500 shrink-0">
                                    <span className="font-medium text-gray-400 w-24">Station</span>
                                    <span className="font-bold text-gray-700 truncate">: &nbsp; {station_id}</span>
                                </div>
                            )}
                            <div className="flex items-center text-[12px] md:text-[13px] text-gray-500 shrink-0">
                                <span className="font-medium text-gray-400 w-24">Type</span>
                                <span className="font-bold text-gray-700">: &nbsp; {formatType(project_type)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-3 pt-3 border-t border-gray-100/60 flex items-center justify-start gap-5 sm:gap-8">
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 transition-colors"
                        >
                            <LinkIcon className="w-[16px] h-[16px] text-gray-500" />
                            <span className="text-[13px] font-medium text-gray-500">
                                {copied ? 'Copied' : 'Copy Link'}
                            </span>
                        </button>
                    </div>
                </div>
            </Link>
        );
    }

    if (isListView) {
        const detailParams = new URLSearchParams(searchParams);
        detailParams.set('project', id);
        return (
            <Link
                to={to || `/projects?${detailParams.toString()}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100/50 flex flex-row group hover:shadow-lg transition-all duration-500 h-[135px] md:h-[190px] animate-fade-in-scale"
            >
                {/* Image Section */}
                <div className="w-[135px] md:w-[35%] h-full relative overflow-hidden flex-none">
                    <img
                        src={featuredImage}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />

                    {status && (
                        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
                            <div className="text-[12px] md:text-[13px] font-bold px-2.5 py-1 rounded-[3px] bg-[#2f3e46]/90 backdrop-blur-md text-white shadow-sm tracking-tight">
                                {formatStatus(status)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-4 md:p-6 flex flex-col flex-1 min-w-0">
                    <div className="flex flex-col gap-2">
                        {/* Top Meta Row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-1 text-primary-600">
                                <span className="text-sm font-bold tracking-tight uppercase tracking-wider">{formatType(project_type)}</span>
                            </div>
                            <span className="text-[10px] md:text-[11px] text-gray-300 font-mono">#{id.slice(0, 5)}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                            {name}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-[13px] md:text-[14px] text-gray-400 mb-1">
                            <div className="flex items-center">
                                <MapPinIcon className="w-4 h-4 mr-1 text-gray-300 shrink-0" />
                                <span className="truncate">{district || 'Bangkok'}</span>
                            </div>
                            {station_id && (
                                <>
                                    <div className="w-px h-3 bg-gray-200" />
                                    <div className="flex items-center">
                                        <TbTrain className="w-4 h-4 mr-1 text-gray-300 shrink-0" />
                                        <span className="truncate">{station_id}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                        {/* Developer */}
                        <div className="flex items-center gap-2">
                            {developer?.logo && (
                                <img src={getMediaUrl(developer.logo)} className="h-4 object-contain opacity-50 grayscale" alt={developer.name} />
                            )}
                            <span className="font-medium text-xs text-gray-500">{developer?.name}</span>
                        </div>

                        {/* Actions aligned to right */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 transition-colors min-w-[30px] sm:min-w-[80px] justify-end"
                            >
                                <LinkIcon className="w-4 h-4" />
                                <span className="text-[13px] font-medium hidden sm:inline">
                                    {copied ? 'Copied' : 'Copy'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // Default Grid View (matching original design)
    const detailParams = new URLSearchParams(searchParams);
    detailParams.set('project', id);
    const linkTo = to || `/projects?${detailParams.toString()}`;

    return (
        <div className="group bg-white rounded-[var(--card-radius)] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col h-full animate-fade-in-scale transform hover:-translate-y-1">
            {/* Upper Section: Image & Status */}
            <Link to={linkTo} className="relative aspect-[4/3] overflow-hidden block">
                <img
                    src={featuredImage}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110"
                />

                {/* Top badges gradient protection */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

                {/* Top Label Layer */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
                    {/* Status Badge */}
                    <div className="flex flex-col gap-2 relative z-20 pointer-events-auto">
                        {status && (
                            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-[3px] shadow-sm transform transition-transform duration-300 origin-left hover:scale-105">
                                <span className="text-gray-900 font-black text-[11px] md:text-[12px] tracking-[0.05em] uppercase">{formatStatus(status)}</span>
                            </div>
                        )}
                        {project_type && (
                            <div className="bg-primary-600/95 backdrop-blur-md px-2 py-1 rounded-[3px] shadow-sm transform transition-transform duration-300 origin-left hover:scale-105">
                                <span className="text-white font-bold text-[10px] md:text-[11px] uppercase">{formatType(project_type)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            {/* Lower Section: Content */}
            <div className="p-5 md:p-6 flex flex-col flex-1 relative bg-white transition-colors duration-300">
                <div className="flex-1 flex flex-col gap-3 md:gap-4 relative z-10">
                    <Link to={linkTo} className="group-hover:opacity-80 transition-opacity">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-[16px] md:text-[18px] font-black text-[#2e2e2e] leading-tight line-clamp-2 min-h-[44px]">
                                {name}
                            </h3>

                            {/* Location line */}
                            <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                                <MapPinIcon className="w-4 h-4 shrink-0 text-gray-400" />
                                <span className="text-[13px] truncate">{district || 'Bangkok'}</span>
                                {station_id && (
                                    <>
                                        <span className="text-gray-300 mx-1">•</span>
                                        <TbTrain className="w-4 h-4 shrink-0 text-gray-400" />
                                        <span className="text-[13px] truncate">{station_id}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </Link>

                    {/* Developer Info */}
                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {developer?.logo && (
                                <img src={getMediaUrl(developer.logo)} className="h-5 object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt={developer.name} />
                            )}
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest truncate max-w-[120px]">{developer?.name}</span>
                        </div>

                        <button
                            onClick={handleCopyLink}
                            className="bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-primary-600 rounded-full p-2 transition-all transform hover:scale-110 shadow-sm"
                            title="Copy link to project"
                        >
                            <LinkIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
