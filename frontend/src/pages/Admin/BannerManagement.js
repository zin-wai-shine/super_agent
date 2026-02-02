import React, { useState, useEffect, useMemo } from 'react';
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
    LinkIcon,
    CalendarIcon,
    UserCircleIcon,
    SparklesIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';
import EmptyState from '../../components/Common/EmptyState';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
} from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const BannerManagement = () => {
    const { user, isSuperAdmin } = useAuth();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [bannerFile, setBannerFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8080';

    const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            description: '',
            target_role: 'public',
            days_active: 30
        }
    });

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
            }

            // For agents, title can be custom if they provide it, otherwise use default
            const finalTitle = data.title || `Agent Banner - ${format(new Date(), 'MMM dd, yyyy')}`;

            const payload = {
                ...data,
                title: finalTitle,
                image_url: imageUrl,
                days_active: parseInt(data.days_active, 10),
                is_active: true
            };

            await bannerApi.createBanner(payload);
            toast.success("Banner created successfully");
            fetchBanners();
            reset();
            setBannerFile(null);
            setPreviewUrl(null);
        } catch (error) {
            console.error("Failed to create banner", error);
            toast.error("Failed to create banner");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this banner?")) return;
        try {
            await bannerApi.deleteBanner(id);
            toast.success("Banner deleted");
            fetchBanners();
        } catch (error) {
            console.error("Failed to delete banner", error);
            toast.error("Failed to delete banner");
        }
    };

    // Table Columns
    const columns = useMemo(() => [
        {
            header: 'Banner',
            accessorKey: 'image_url',
            cell: ({ row }) => {
                const banner = row.original;
                const fullImageUrl = banner.image_url.startsWith('http')
                    ? banner.image_url
                    : `${API_URL}${banner.image_url}`;

                return (
                    <div className="flex items-center space-x-4 py-1 whitespace-nowrap">
                        <div className="w-24 h-14 bg-gray-100 dark:bg-gray-800 rounded-[3px] overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
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
                <span className="capitalize px-2 py-1 rounded-[3px] text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border dark:border-gray-700 whitespace-nowrap">
                    {getValue()}
                </span>
            )
        },
        {
            header: 'Status',
            accessorKey: 'is_active',
            cell: ({ getValue }) => (
                <span className={`inline-flex items-center px-2 py-1 rounded-[3px] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${getValue() ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
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
                        {format(parseISO(date), 'MMM dd, yyyy')}
                    </div>
                );
            }
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex items-center justify-end whitespace-nowrap gap-2">
                    <Link
                        to={`/banners/${row.original.id}`}
                        className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-[3px] transition-colors border border-transparent hover:border-primary-100"
                        title="Preview Banner"
                    >
                        <EyeIcon className="w-5 h-5" />
                    </Link>
                    <button
                        onClick={() => handleDelete(row.original.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-[3px] transition-colors border border-transparent hover:border-red-100"
                        title="Delete Banner"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            )
        }
    ], []);

    // Filter banners client-side for smoother interaction
    const filteredBanners = useMemo(() => {
        return banners.filter(banner => {
            return globalFilter
                ? (banner.title?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                    banner.target_role?.toLowerCase().includes(globalFilter.toLowerCase()))
                : true;
        });
    }, [banners, globalFilter]);

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
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Banner Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Promote your listings and brand with high-impact graphics.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Creation Sidebar */}
                <div className="xl:col-span-12 xxl:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-dashboard-card shadow-sm rounded-[3px] p-8 border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-bl-full -mr-10 -mt-10" />

                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <PlusIcon className="w-6 h-6 text-primary-500" />
                            {isSuperAdmin ? 'Platform Banner' : 'Upload New Design'}
                        </h2>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Banner Title</label>
                                        <input
                                            type="text"
                                            className="input-field rounded-[3px]"
                                            placeholder="E.g. Special Offer - Condo for Sale"
                                            {...register('title')}
                                        />
                                        {errors.title && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.title.message}</p>}
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                                            {isSuperAdmin ? 'Image URL' : 'Banner Graphic'}
                                        </label>
                                        {isSuperAdmin ? (
                                            <input
                                                type="url"
                                                className="input-field rounded-[3px]"
                                                placeholder="https://example.com/image.jpg"
                                                {...register('image_url', { required: 'Image URL is required' })}
                                            />
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="relative group">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                    />
                                                    <div className={`h-40 border-2 border-dashed rounded-[3px] flex flex-col items-center justify-center transition-all duration-300 ${previewUrl ? 'border-primary-500 bg-primary-50/50' : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-primary-400'}`}>
                                                        {previewUrl ? (
                                                            <img src={previewUrl} className="w-full h-full object-cover rounded-[3px]" />
                                                        ) : (
                                                            <>
                                                                <div className="p-3 bg-white dark:bg-gray-700 rounded-[3px] shadow-lg text-primary-500 mb-3 group-hover:scale-110 transition-transform">
                                                                    <ArrowUpTrayIcon className="w-6 h-6" />
                                                                </div>
                                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Graphic</span>
                                                                <span className="text-[10px] text-gray-400 mt-1">Recommended 1200x400px</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {errors.image_url && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.image_url.message}</p>}
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Link Destination (Optional)</label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="url"
                                                className="input-field pl-10 rounded-[3px]"
                                                placeholder="https://..."
                                                {...register('link_url')}
                                            />
                                        </div>
                                    </div>

                                    {isSuperAdmin && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Target Audience</label>
                                                <Controller
                                                    name="target_role"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <StyledSelect
                                                            {...field}
                                                            options={[
                                                                { value: 'all', label: 'Everyone' },
                                                                { value: 'agent', label: 'Agents only' },
                                                                { value: 'public', label: 'Site visitors' },
                                                            ]}
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div>
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Visibility (Days)</label>
                                                <input
                                                    type="number"
                                                    className="input-field rounded-[3px]"
                                                    {...register('days_active')}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Rich Description</label>
                                        <div className="bg-white dark:bg-gray-800 rounded-[3px] overflow-hidden border border-gray-200 dark:border-gray-700">
                                            <Controller
                                                name="description"
                                                control={control}
                                                render={({ field }) => (
                                                    <ReactQuill
                                                        {...field}
                                                        theme="snow"
                                                        modules={quillModules}
                                                        placeholder="Add detailed content for this banner campaign..."
                                                        className="h-64 dark:text-white"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading || uploading || (!isSuperAdmin && !bannerFile)}
                                            className="btn-primary w-full py-4 rounded-[3px] shadow-sm text-sm font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 group transition-all"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white" />
                                                    <span>Designing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                                    <span>{isSuperAdmin ? 'Publish Banner' : 'Activate Banner'}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Data Table */}
                <div className="xl:col-span-12 space-y-4">
                    <div className="bg-white dark:bg-dashboard-card rounded-[3px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">

                        {/* Table Toolbar/Header */}
                        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 font-medium">Show</span>
                                <div className="w-16">
                                    <StyledSelect
                                        options={[
                                            { value: 5, label: '5' },
                                            { value: 10, label: '10' },
                                            { value: 20, label: '20' },
                                            { value: 50, label: '50' },
                                        ]}
                                        value={{ value: table.getState().pagination.pageSize, label: `${table.getState().pagination.pageSize}` }}
                                        onChange={(val) => table.setPageSize(val)}
                                        isSearchable={false}
                                        styles={{
                                            control: (base) => ({ ...base, minHeight: '30px', height: '30px', borderRadius: '3px' }),
                                            valueContainer: (base) => ({ ...base, padding: '0 8px' }),
                                            singleValue: (base) => ({ ...base, fontSize: '12px' })
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="relative w-full sm:w-64">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={globalFilter}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                    placeholder="Search campaigns..."
                                    className="input-field pl-9 h-[34px] text-[12px] rounded-[3px]"
                                />
                            </div>
                        </div>

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
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 dark:bg-gray-800/20 border-b dark:border-gray-800">
                                        {table.getHeaderGroups().map(headerGroup => (
                                            <tr key={headerGroup.id}>
                                                {headerGroup.headers.map(header => (
                                                    <th key={header.id} className="px-8 py-5 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">
                                                        <div
                                                            className={`flex items-center gap-1 group ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                                                            onClick={header.column.getToggleSortingHandler()}
                                                        >
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

                                {/* Pagination Controls */}
                                <div className="px-8 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30 dark:bg-gray-800/10">
                                    <div className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                                        Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} campaigns
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => table.setPageIndex(0)}
                                            disabled={!table.getCanPreviousPage()}
                                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-[3px] hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                        >
                                            <ChevronDoubleLeftIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => table.previousPage()}
                                            disabled={!table.getCanPreviousPage()}
                                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-[3px] hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                        >
                                            <ChevronLeftIcon className="w-4 h-4" />
                                        </button>
                                        <div className="flex items-center space-x-1 mx-2">
                                            <span className="text-xs text-gray-500 font-bold">Page</span>
                                            <span className="text-xs text-primary-600 font-bold px-2 py-0.5 bg-primary-50 rounded-[3px]">{table.getState().pagination.pageIndex + 1}</span>
                                            <span className="text-xs text-gray-500 font-bold">of {table.getPageCount()}</span>
                                        </div>
                                        <button
                                            onClick={() => table.nextPage()}
                                            disabled={!table.getCanNextPage()}
                                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-[3px] hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                        >
                                            <ChevronRightIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                            disabled={!table.getCanNextPage()}
                                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-[3px] hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                        >
                                            <ChevronDoubleRightIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BannerManagement;
