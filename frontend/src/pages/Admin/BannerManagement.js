import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';

import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { bannerApi, publicApi, agentApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import StyledSelect from '../../components/Form/StyledSelect';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    PhotoIcon,
    TrashIcon,
    PlusIcon,
    InboxIcon,
    ArrowUpTrayIcon,
    MagnifyingGlassIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    EyeIcon,
    PencilSquareIcon,
    LinkIcon,
    CalendarIcon,
    SparklesIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    XMarkIcon,
    ArrowPathIcon,
    AdjustmentsHorizontalIcon,
    MegaphoneIcon,
} from '@heroicons/react/24/outline';
import { PiUser } from 'react-icons/pi';
import EmptyState from '../../components/Common/EmptyState';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
} from '@tanstack/react-table';
import { format, parseISO, startOfDay, endOfDay, subDays, startOfMonth, isWithinInterval, subMonths, addMonths, getMonth, getYear, setMonth, setYear } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import toast from 'react-hot-toast';
import { getMediaUrl } from '../../utils/media';
import ConfirmModal from '../../components/ui/ConfirmModal';

const BannerManagement = () => {
    const { user, isSuperAdmin } = useAuth();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [bannerFile, setBannerFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState(null);

    // Modal & Filter States
    const [showModal, setShowModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState([
        {
            startDate: startOfDay(new Date()),
            endDate: endOfDay(new Date()),
            key: 'selection'
        }
    ]);
    const [datePreset, setDatePreset] = useState('today');
    const [isDateFiltered, setIsDateFiltered] = useState(false); // Default: Off for banners unless user clicks
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [shownDate, setShownDate] = useState(new Date());
    const datePickerRef = useRef(null);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });



    // UI States
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [viewMode, setViewMode] = useState('create'); // 'create', 'edit', 'view'
    const [selectedBanner, setSelectedBanner] = useState(null);

    const { register, handleSubmit, reset, control, setValue, watch, formState: { errors, isDirty } } = useForm({
        defaultValues: {
            title: '',
            description: '',
            target_role: 'public',
            days_active: 30,
            is_active: true
        }
    });

    // Unsaved Changes Protection
    const hasUnsavedChanges = isDirty || !!bannerFile;

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (showModal && hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [showModal, hasUnsavedChanges]);

    const handleCloseModal = (force = false) => {
        if (!force && viewMode !== 'view' && hasUnsavedChanges) {
            setShowConfirmClose(true);
        } else {
            setShowModal(false);
            setShowConfirmClose(false);
            reset();
            setBannerFile(null);
            setPreviewUrl(null);
            setSelectedBanner(null);
        }
    };

    const confirmClose = () => {
        setShowConfirmClose(false);
        setShowModal(false);
        reset();
        setBannerFile(null);
        setPreviewUrl(null);
    };

    const cancelClose = () => {
        setShowConfirmClose(false);
    };

    // Close datepicker when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setShowDatePicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const response = await bannerApi.getBanners(isSuperAdmin ? {} : { agent_id: user?.agent_id });
            setBanners(response.data);
        } catch (error) {
            console.error("Failed to fetch banners", error);
            toast.error("Failed to load banners");
        }
    };

    const handleDatePresetChange = (preset) => {
        setDatePreset(preset);
        const today = new Date();

        switch (preset) {
            case 'today':
                setDateRange([{
                    startDate: startOfDay(today),
                    endDate: endOfDay(today),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                setShowDatePicker(false);
                break;
            case 'yesterday':
                const yesterday = subDays(today, 1);
                setDateRange([{
                    startDate: startOfDay(yesterday),
                    endDate: endOfDay(yesterday),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                setShowDatePicker(false);
                break;
            case 'last7days':
                setDateRange([{
                    startDate: startOfDay(subDays(today, 6)),
                    endDate: endOfDay(today),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                setShowDatePicker(false);
                break;
            case 'thismonth':
                setDateRange([{
                    startDate: startOfMonth(today),
                    endDate: endOfDay(today),
                    key: 'selection'
                }]);
                setIsDateFiltered(true);
                setShowDatePicker(false);
                break;
            case 'alltime':
                setIsDateFiltered(false);
                setShowDatePicker(false);
                break;
            case 'custom':
                setShowDatePicker(true);
                break;
            default:
                break;
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            let imageUrl = data.image_url;

            // Handle file upload if a new file is selected
            if (!isSuperAdmin && bannerFile) {
                setUploading(true);
                try {
                    const uploadRes = await agentApi.uploadBanner(bannerFile);
                    imageUrl = uploadRes.data.url;
                } catch (err) {
                    toast.error("Failed to upload image");
                    setLoading(false);
                    setUploading(false);
                    return;
                }
                setUploading(false);
            } else if (viewMode === 'edit' && selectedBanner && !bannerFile) {
                // Keep existing image if no new file
                imageUrl = selectedBanner.image_url;
            }

            // For agents, title can be custom if they provide it, otherwise use default
            const finalTitle = data.title || `Agent Banner - ${format(new Date(), 'MMM dd, yyyy')}`;

            const payload = {
                ...data,
                title: finalTitle,
                image_url: imageUrl,
                days_active: parseInt(data.days_active, 10),
                is_active: data.is_active
            };

            if (viewMode === 'edit' && selectedBanner) {
                await bannerApi.updateBanner(selectedBanner.id, payload);
                toast.success("Banner updated successfully");
            } else {
                await bannerApi.createBanner(payload);
                toast.success("Banner created successfully");
            }

            fetchBanners();
            handleCloseModal(true); // Force close
        } catch (error) {
            console.error("Failed to save banner", error);
            toast.error("Failed to save banner");
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        setBannerToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!bannerToDelete) return;
        try {
            await bannerApi.deleteBanner(bannerToDelete);
            toast.success("Banner deleted");
            fetchBanners();
        } catch (error) {
            console.error("Failed to delete banner", error);
            toast.error("Failed to delete banner");
        } finally {
            setDeleteConfirmOpen(false);
            setBannerToDelete(null);
        }
    };

    const handlePreview = (banner) => { // Now handles View Mode
        setViewMode('view');
        setSelectedBanner(banner);
        setValue('title', banner.title);
        setValue('description', banner.description || '');
        setValue('target_role', banner.target_role);
        setValue('days_active', banner.days_active || 30);
        setValue('is_active', banner.is_active);

        const fullImageUrl = getMediaUrl(banner.image_url);
        setPreviewUrl(fullImageUrl);

        setShowModal(true);
    };

    const handleEdit = (banner) => {
        setViewMode('edit');
        setSelectedBanner(banner);
        setValue('title', banner.title);
        setValue('description', banner.description || '');
        setValue('target_role', banner.target_role);
        setValue('days_active', banner.days_active || 30);
        setValue('is_active', banner.is_active);

        const fullImageUrl = getMediaUrl(banner.image_url);
        setPreviewUrl(fullImageUrl);

        setShowModal(true);
    };

    const handleCreate = () => {
        setViewMode('create');
        setSelectedBanner(null);
        reset({
            title: '',
            description: '',
            target_role: 'public',
            days_active: 30,
            is_active: true
        });
        setBannerFile(null);
        setPreviewUrl(null);
        setShowModal(true);
    };

    // Filter banners client-side for smoother interaction
    const filteredBanners = useMemo(() => {
        return banners.filter(banner => {
            // Status Filter
            const matchesStatus = statusFilter === 'all'
                ? true
                : statusFilter === 'active' ? banner.is_active : !banner.is_active;

            // Global Filter (Search)
            const matchesSearch = globalFilter
                ? (banner.title?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                    banner.target_role?.toLowerCase().includes(globalFilter.toLowerCase()))
                : true;

            // Date Filter
            let matchesDate = true;
            if (isDateFiltered && dateRange[0].startDate && dateRange[0].endDate) {
                if (!banner.created_at) {
                    matchesDate = false;
                } else {
                    const bannerDate = parseISO(banner.created_at);
                    if (isNaN(bannerDate.getTime())) {
                        matchesDate = false;
                    } else {
                        matchesDate = isWithinInterval(bannerDate, {
                            start: startOfDay(dateRange[0].startDate),
                            end: endOfDay(dateRange[0].endDate)
                        });
                    }
                }
            }

            return matchesStatus && matchesSearch && matchesDate;
        });
    }, [banners, globalFilter, statusFilter, isDateFiltered, dateRange]);
    const columns = useMemo(() => [
        {
            header: 'Banner',
            accessorKey: 'image_url',
            cell: ({ row }) => {
                const banner = row.original;
                const fullImageUrl = getMediaUrl(banner.image_url);

                return (
                    <div className="flex items-center space-x-4 py-1 whitespace-nowrap">
                        <div className="w-24 h-14 bg-gray-100 dark:bg-gray-800 rounded-admin overflow-hidden border-admin shadow-sm">
                            <img src={fullImageUrl} alt={banner.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white line-clamp-1">{banner.title}</div>
                            {banner.link_url && (
                                <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary-500 hover:underline flex items-center gap-1 mt-0.5">
                                    <LinkIcon className="w-3 h-3" />
                                    {banner.link_url}
                                </a>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Target',
            accessorKey: 'target_role',
            cell: ({ getValue }) => (
                <span className="capitalize px-2 py-1 rounded-admin text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-admin whitespace-nowrap">
                    {getValue()}
                </span>
            )
        },
        {
            header: 'Status',
            accessorKey: 'is_active',
            cell: ({ getValue }) => (
                <span className={`inline-flex items-center px-2 py-1 rounded-admin text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${getValue() ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                    {getValue() ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: 'Created At',
            accessorKey: 'created_at',
            cell: ({ getValue }) => {
                const date = getValue();
                return (
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[11px] whitespace-nowrap">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {date ? format(parseISO(date), 'MMM dd, yyyy') : '-'}
                    </div>
                );
            }
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex items-center justify-end whitespace-nowrap gap-2.5">
                    <button
                        onClick={() => handlePreview(row.original)}
                        className="p-2.5 text-[#222222] bg-[#222222]/5 hover:bg-[#222222]/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 rounded-admin transition-all border border-[#222222]/15 dark:border-white/10 shadow-sm flex items-center justify-center"
                        title="View Details"
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleEdit(row.original)}
                        className="p-2.5 text-blue-600 bg-blue-100/40 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-admin transition-all border border-blue-600/20 dark:border-blue-500/20 shadow-sm flex items-center justify-center"
                        title="Edit Banner"
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.original.id)}
                        className="p-2.5 text-red-600 bg-red-100/40 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-admin transition-all border border-red-600/20 dark:border-red-500/20 shadow-sm flex items-center justify-center"
                        title="Delete Banner"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            )
        }
    ], [handleDelete, handlePreview, handleEdit]);

    const table = useReactTable({
        data: filteredBanners,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 pb-2">
                <div className="lg:min-w-[280px]">
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-[color-mix(in_srgb,var(--primary-color),transparent_95%)] dark:bg-[color-mix(in_srgb,var(--primary-color),transparent_90%)] rounded-admin flex items-center justify-center shadow-sm border border-[color-mix(in_srgb,var(--primary-color),transparent_90%)] dark:border-[color-mix(in_srgb,var(--primary-color),transparent_80%)]">
                            <MegaphoneIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        Banner Management
                    </h1>
                </div>



                <div className="hidden lg:block lg:min-w-[280px]"></div>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
                {/* LEFT: Page Size */}
                <div className="flex items-center space-x-2 h-[38px] w-full lg:w-auto">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Show</span>
                    <div className="w-16">
                        <StyledSelect
                            options={[
                                { value: 5, label: '5' },
                                { value: 10, label: '10' },
                                { value: 20, label: '20' },
                                { value: 50, label: '50' },
                            ]}
                            value={table.getState().pagination.pageSize}
                            onChange={(val) => table.setPageSize(val)}
                            isSearchable={false}
                            components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                }),
                                valueContainer: (base) => ({
                                    ...base,
                                    justifyContent: 'center',
                                    padding: '0'
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    margin: '0',
                                    textAlign: 'center',
                                    width: '100%'
                                })
                            }}
                        />
                    </div>
                </div>

                {/* CENTER: Status & Date Filters */}
                <div className="flex flex-wrap items-center lg:justify-center gap-3 flex-1 w-full">
                    {/* Status Filter */}
                    <div className="w-full sm:w-36">
                        <StyledSelect
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                            ]}
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val)}
                            isSearchable={false}
                        />
                    </div>

                    {/* Date Filters */}
                    <div className="relative flex items-center gap-2" ref={datePickerRef}>
                        <div className="w-full sm:w-56">
                            <StyledSelect
                                options={[
                                    { value: 'today', label: 'Today' },
                                    { value: 'yesterday', label: 'Yesterday' },
                                    { value: 'last7days', label: 'Last 7 Days' },
                                    { value: 'thismonth', label: 'This Month' },
                                    { value: 'alltime', label: 'All Time' },
                                    { value: 'custom', label: 'Custom Range...' },
                                ]}
                                value={datePreset}
                                formatOptionLabel={(option) => {
                                    if (option.value === 'custom' && datePreset === 'custom' && dateRange?.[0]?.startDate && dateRange?.[0]?.endDate) {
                                        try {
                                            const start = dateRange[0].startDate instanceof Date ? dateRange[0].startDate : new Date(dateRange[0].startDate);
                                            const end = dateRange[0].endDate instanceof Date ? dateRange[0].endDate : new Date(dateRange[0].endDate);
                                            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                                                return (
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{format(start, "MMM dd")} - {format(end, "MMM dd")}</span>
                                                    </div>
                                                );
                                            }
                                        } catch (e) {
                                            console.error('Date formatting error:', e);
                                        }
                                    }
                                    return (
                                        <div className="flex items-center justify-between w-full">
                                            <span>{option.label}</span>
                                        </div>
                                    );
                                }}
                                onChange={(val) => handleDatePresetChange(val)}
                                isSearchable={false}
                            />
                        </div>

                        <button
                            onClick={() => handleDatePresetChange('alltime')}
                            className={`p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-600/10 backdrop-blur-sm rounded-admin transition-colors ${!isDateFiltered ? 'invisible' : ''}`}
                            title="Clear Date Filter"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                        </button>

                        {showDatePicker && (
                            <div className="absolute top-full right-0 mt-2 z-50 shadow-2xl rounded-admin overflow-hidden border-admin bg-white dark:bg-dashboard-card w-[350px]">
                                <div className="flex items-center justify-between p-3 border-b border-admin">
                                    <button onClick={() => setShownDate(subMonths(shownDate, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500"><ChevronLeftIcon className="w-5 h-5" /></button>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32">
                                            <StyledSelect
                                                value={getMonth(shownDate instanceof Date && !isNaN(shownDate.getTime()) ? shownDate : new Date())}
                                                onChange={(val) => setShownDate(setMonth(shownDate, val))}
                                                options={Array.from({ length: 12 }, (_, i) => ({ value: i, label: format(new Date(2000, i, 1), 'MMMM') }))}
                                                isSearchable={false}
                                            />
                                        </div>
                                        <div className="w-24">
                                            <StyledSelect
                                                value={getYear(shownDate instanceof Date && !isNaN(shownDate.getTime()) ? shownDate : new Date())}
                                                onChange={(val) => setShownDate(setYear(shownDate, val))}
                                                options={Array.from({ length: 5 }, (_, i) => ({ value: getYear(new Date()) - 2 + i, label: (getYear(new Date()) - 2 + i).toString() }))}
                                                isSearchable={false}
                                            />
                                        </div>
                                    </div>
                                    <button onClick={() => setShownDate(addMonths(shownDate, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500"><ChevronRightIcon className="w-5 h-5" /></button>
                                </div>
                                <DateRange
                                    locale={enUS}
                                    editableDateInputs={true}
                                    onChange={item => {
                                        setDateRange([item.selection]);
                                        setIsDateFiltered(true);
                                        setDatePreset('custom');
                                    }}
                                    moveRangeOnFirstSelection={false}
                                    ranges={dateRange && dateRange.length > 0 ? dateRange : [{ startDate: new Date(), endDate: new Date(), key: 'selection' }]}
                                    shownDate={shownDate instanceof Date && !isNaN(shownDate.getTime()) ? shownDate : new Date()}
                                    showMonthAndYearPickers={false}
                                    rangeColors={['#3b82f6']}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Search & Add Button */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="relative w-full lg:w-64 h-[34px]">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                        <input
                            type="text"
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search campaigns..."
                            className="input-field pl-9 h-[34px] min-h-0 text-[12px]"
                        />
                    </div>
                    <button
                        onClick={handleCreate}
                        className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-2 whitespace-nowrap px-4 h-[34px] text-[12px] rounded-admin shadow-none hover:shadow-none transform-none"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Add Banner</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-dashboard-card rounded-admin border-admin overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                {banners.length === 0 ? (
                    <div className="py-20">
                        <EmptyState
                            icon={InboxIcon}
                            title="No active banners"
                            description="Your showcase is currently empty. Design your first banner to stand out."
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse divide-y divide-gray-100 dark:divide-gray-700">
                            <thead className="bg-gray-50/50 dark:bg-gray-800/20">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id} className="px-8 py-3 text-[10px] font-extrabold text-gray-400 tracking-[0.2em] whitespace-nowrap">
                                                <div className={`flex items-center gap-1 group ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`} onClick={header.column.getToggleSortingHandler()}>
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getCanSort() && (
                                                        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ChevronUpIcon className={`w-2 h-2 ${header.column.getIsSorted() === 'asc' ? 'text-primary-500' : ''}`} />
                                                            <ChevronDownIcon className={`w-2 h-2 ${header.column.getIsSorted() === 'desc' ? 'text-primary-500' : ''}`} />
                                                        </div>
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors group">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-8 py-5 text-sm whitespace-nowrap">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30 dark:bg-gray-800/10">
                            <div className="text-[11px] text-gray-500 font-bold tracking-normal">
                                <span className="text-gray-900 dark:text-white">{table.getFilteredRowModel().rows.length}</span> results
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 border-admin rounded-admin hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all text-gray-400"
                                >
                                    <ChevronDoubleLeftIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 border-admin rounded-admin hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all text-gray-400"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-2 mx-2">
                                    <span className="text-[11px] font-bold text-gray-500 tracking-normal">Page</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={table.getPageCount()}
                                        value={table.getState().pagination.pageIndex + 1}
                                        onChange={e => {
                                            const page = e.target.value ? Number(e.target.value) - 1 : 0;
                                            table.setPageIndex(page);
                                        }}
                                        className="w-12 h-9 border-admin rounded-admin bg-white dark:bg-dashboard-input text-center text-[13px] font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all no-spinner"
                                    />
                                    <span className="text-[11px] font-bold text-gray-500 tracking-normal whitespace-nowrap">of {table.getPageCount() || 1}</span>
                                </div>

                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border-admin rounded-admin hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all text-gray-400"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border-admin rounded-admin hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all text-gray-400"
                                >
                                    <ChevronDoubleRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Creation Modal */}
            {showModal && createPortal(
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-dashboard-card shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-admin border-admin w-full max-w-5xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">

                        {/* Premium Header with Gradient - Standardized */}
                        <div className="relative z-20 shadow-none overflow-hidden flex items-center justify-between px-8 py-3 bg-gradient-to-r from-primary-600 to-indigo-700 text-white sticky top-0">
                            <div className="relative z-10 flex items-center gap-3">
                                <SparklesIcon className="w-5 h-5 text-white/80" />
                                <h2 className="text-[16px] font-bold text-white tracking-tight">
                                    {viewMode === 'create'
                                        ? (isSuperAdmin ? 'Platform Campaign Studio' : 'Banner Design Studio')
                                        : viewMode === 'edit' ? 'Edit Campaign' : 'Campaign Details'}
                                </h2>
                            </div>
                            <button onClick={() => handleCloseModal()} className="relative z-10 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto overflow-x-hidden flex-1 bg-white dark:bg-gray-900">
                            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                                <div className="w-full">
                                    {/* Unified Unified Card */}
                                    <div className="bg-white dark:bg-dashboard-card border-b border-admin space-y-10 p-10">

                                        {/* Row 1: Visual Asset */}
                                        <div className="space-y-4">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block">
                                                {isSuperAdmin ? '1. Asset Source' : '1. Campaign Visual Design'}
                                            </label>
                                            {isSuperAdmin ? (
                                                viewMode === 'view' ? (
                                                    <div className="h-[46px] flex items-center px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
                                                        {watch('image_url')}
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="url"
                                                        className="input-field rounded-admin h-[46px] border-admin"
                                                        placeholder="https://images.unsplash.com/..."
                                                        {...register('image_url', { required: 'Image URL is required' })}
                                                    />
                                                )
                                            ) : (
                                                <div className="relative group">
                                                    {viewMode !== 'view' && (
                                                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30" />
                                                    )}
                                                    <div className={`aspect-video sm:aspect-[16/6] rounded-admin flex flex-col items-center justify-center transition-all duration-500 ${previewUrl ? '' : 'border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/20 glass-effect hover:border-primary-400'}`}>
                                                        {previewUrl ? (
                                                            <div className="relative w-full h-full">
                                                                <img src={previewUrl} className="w-full h-full object-cover rounded-admin" alt="Preview" />
                                                                {viewMode !== 'view' && (
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-admin backdrop-blur-[2px]">
                                                                        <ArrowPathIcon className="w-8 h-8 text-white animate-spin-slow" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="p-5 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-admin shadow-xl text-white mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                                                    <ArrowUpTrayIcon className="w-8 h-8" />
                                                                </div>
                                                                <span className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-tighter">Click to Upload Graphic</span>
                                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 font-bold tracking-widest uppercase">1200 × 400 PX RECOMMENDED</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {errors.image_url && <p className="text-red-500 text-[10px] mt-2 font-black tracking-widest uppercase">{errors.image_url.message}</p>}
                                        </div>

                                        <div className="h-px bg-gray-100 dark:bg-gray-800" />

                                        {/* Row 2: Identity & Deployment */}
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                            <div className="md:col-span-12 lg:col-span-12 space-y-6">
                                                <div className="space-y-4">
                                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block">2. Campaign Identity</label>
                                                    <div className="relative group">
                                                        {viewMode === 'view' ? (
                                                            <div className="h-[46px] flex items-center text-xl font-bold text-gray-900 dark:text-white px-1">
                                                                {watch('title')}
                                                            </div>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                className="input-field rounded-admin h-[46px] pr-10 border-gray-200 dark:border-gray-700 focus:border-primary-500 transition-all font-medium"
                                                                placeholder="E.g. Exclusive Waterfront Properties"
                                                                {...register('title')}
                                                            />
                                                        )}
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                                            <SparklesIcon className="w-4 h-4 text-primary-400" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {isSuperAdmin && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Visibility Duration</label>
                                                            <div className="relative">
                                                                {viewMode === 'view' ? (
                                                                    <div className="h-[46px] flex items-center px-4 rounded-admin border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300">
                                                                        {watch('days_active')} Days
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <input type="number" className="input-field rounded-admin h-[46px] pr-12" {...register('days_active')} />
                                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">Days</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Targeting</label>
                                                            {viewMode === 'view' ? (
                                                                <div className="h-[46px] flex items-center px-4 rounded-admin border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">
                                                                    {watch('target_role') === 'all' ? 'Everyone' : watch('target_role') === 'agent' ? 'Agents' : 'Visitors'}
                                                                </div>
                                                            ) : (
                                                                <Controller
                                                                    name="target_role"
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <StyledSelect
                                                                            {...field}
                                                                            options={[
                                                                                { value: 'all', label: 'Everyone' },
                                                                                { value: 'agent', label: 'Agents' },
                                                                                { value: 'public', label: 'Visitors' },
                                                                            ]}
                                                                        />
                                                                    )}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {isSuperAdmin && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Campaign Status</label>
                                                            <div className="flex items-center gap-3">
                                                                <Controller
                                                                    name="is_active"
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <button
                                                                            type="button"
                                                                            disabled={viewMode === 'view'}
                                                                            onClick={() => field.onChange(!field.value)}
                                                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${field.value ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'} ${viewMode === 'view' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                        >
                                                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${field.value ? 'translate-x-5' : 'translate-x-0'}`} />
                                                                        </button>
                                                                    )}
                                                                />
                                                                <span className={`text-xs font-bold uppercase tracking-widest ${watch('is_active') ? 'text-green-600' : 'text-gray-400'}`}>
                                                                    {watch('is_active') ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {isSuperAdmin && (
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Action Destination (URL)</label>
                                                        <div className="relative group">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md rounded-admin group-focus-within:bg-primary-50/50 transition-colors">
                                                                <LinkIcon className="w-4 h-4 text-gray-400 group-focus-within:text-primary-500" />
                                                            </div>
                                                            {viewMode === 'view' ? (
                                                                <div className="h-[46px] flex items-center px-4 pl-12 rounded-admin border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-primary-600 truncate">
                                                                    {watch('link_url')}
                                                                </div>
                                                            ) : (
                                                                <input type="url" className="input-field pl-12 rounded-admin h-[46px] border-gray-200 dark:border-gray-700" placeholder="https://app.example.com/listings/123" {...register('link_url')} />
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="h-px bg-gray-100 dark:bg-gray-800" />

                                        {/* Row 3: Rich Details */}
                                        <div className="space-y-4">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block">3. Storytelling & Details</label>
                                            <div className="bg-white dark:bg-gray-950 rounded-admin border border-gray-200 dark:border-gray-800 overflow-hidden group">
                                                {viewMode === 'view' ? (
                                                    <div
                                                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-admin text-gray-700 dark:text-gray-300 min-h-[250px] prose dark:prose-invert max-w-none"
                                                        dangerouslySetInnerHTML={{ __html: watch('description') }}
                                                    />
                                                ) : (
                                                    <Controller
                                                        name="description"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <ReactQuill
                                                                {...field}
                                                                theme="snow"
                                                                modules={{
                                                                    toolbar: [
                                                                        [{ 'header': [1, 2, 3, false] }, { 'size': ['small', false, 'large', 'huge'] }],
                                                                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                                        [{ 'align': [] }],
                                                                        [{ 'color': [] }, { 'background': [] }],
                                                                        ['link'],
                                                                        ['clean']
                                                                    ],
                                                                }}
                                                                placeholder="Craft a compelling story that captures interest..."
                                                                className="h-[250px] dark:text-white"
                                                            />
                                                        )}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center justify-between px-10 py-8 border-t border-gray-100 dark:border-gray-800">
                                    <div className="hidden sm:flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <EyeIcon className="w-4 h-4" />
                                        Interactive Preview enabled
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                        {viewMode === 'view' ? (
                                            <div className="flex gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleCloseModal()}
                                                    className="h-[38px] px-6 text-[11px] font-black text-white hover:text-white/80 uppercase tracking-widest bg-gray-900 dark:bg-gray-700 rounded-admin transition-colors"
                                                >
                                                    Close
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setViewMode('edit')}
                                                    className="h-[38px] px-8 bg-primary-600 text-white rounded-admin text-[11px] font-black uppercase tracking-widest hover:bg-primary-700 transition-colors flex items-center gap-2"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                    Edit Campaign
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <button type="button" onClick={() => handleCloseModal()} className="h-[38px] px-6 text-[11px] font-black text-gray-500 hover:text-primary-600 uppercase tracking-widest transition-colors">
                                                    {viewMode === 'edit' ? 'Cancel' : 'Discard Draft'}
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading || uploading || (!isSuperAdmin && !bannerFile && viewMode === 'create')}
                                                    className="h-[38px] group relative overflow-hidden bg-gradient-to-r from-primary-600 to-indigo-600 text-white px-8 rounded-admin text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3"
                                                >
                                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-[-20deg]" />
                                                    {loading ? (
                                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white" />
                                                    ) : (
                                                        <SparklesIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    )}
                                                    <span>
                                                        {viewMode === 'create'
                                                            ? (isSuperAdmin ? 'Deploy Campaign' : 'Initialize Design')
                                                            : 'Save Changes'}
                                                    </span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}


            {/* Custom Confirmation Alert */}
            {showConfirmClose && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in pointer-events-auto">

                    <div className="bg-white dark:bg-gray-800 rounded-admin shadow-2xl p-6 w-full max-w-sm border border-gray-200 dark:border-gray-700 animate-slide-down relative overflow-hidden">

                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                <XMarkIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-1">Unsaved Changes</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                                    You have unsaved changes in your banner design. Discarding them will lose all progress.
                                </p>
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={cancelClose}
                                        className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        Keep Editing
                                    </button>
                                    <button
                                        onClick={confirmClose}
                                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-admin transition-all"
                                    >
                                        Discard Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <ConfirmModal
                isOpen={deleteConfirmOpen}
                onClose={() => {
                    setDeleteConfirmOpen(false);
                    setBannerToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Banner"
                message="Are you sure you want to delete this banner? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isDestructive={true}
            />
        </div>
    );
};

export default BannerManagement;
