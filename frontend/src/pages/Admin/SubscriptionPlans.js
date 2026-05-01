import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import StyledSelect from '../../components/Form/StyledSelect';
import {
    useReactTable,
    getCoreRowModel,
    flexRender
} from '@tanstack/react-table';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CreditCardIcon,
    CheckIcon,
    InboxIcon
} from '@heroicons/react/24/outline';
import EmptyState from '../../components/Common/EmptyState';

const SubscriptionPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    const { register, control, handleSubmit, reset } = useForm();

    const fetchPlans = async () => {
        try {
            const response = await adminApi.getPlans();
            setPlans(response.data || []);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const openModal = (plan = null) => {
        setEditingPlan(plan);
        if (plan) {
            reset({
                name: plan.plan_name || plan.name,
                domain_type: plan.domain_type || 'subdomain',
                price: plan.price,
                max_listings: plan.max_listings,
                max_sub_agents: plan.max_sub_agents,
                allow_custom_domain: plan.allow_custom_domain || false,
                allow_appointments: plan.allow_appointments ?? true,
                allow_theme: plan.allow_theme ?? true,
                allow_sub_agents: plan.allow_sub_agents ?? true,
                allow_notifications: plan.allow_notifications ?? true,
                allow_banners: plan.allow_banners ?? true,
                features: plan.features?.join ? plan.features.join(', ') : (plan.features || ''),
            });
        } else {
            reset({
                name: '',
                domain_type: 'subdomain',
                price: '',
                max_listings: 10,
                max_sub_agents: 1,
                allow_custom_domain: false,
                allow_appointments: true,
                allow_theme: true,
                allow_sub_agents: true,
                allow_notifications: true,
                allow_banners: true,
                features: ''
            });
        }
        setShowModal(true);
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                plan_name: data.name,
                domain_type: data.domain_type,
                price: parseFloat(data.price),
                max_listings: parseInt(data.max_listings),
                max_sub_agents: parseInt(data.max_sub_agents),
                allow_custom_domain: data.allow_custom_domain || false,
                allow_appointments: data.allow_appointments,
                allow_theme: data.allow_theme,
                allow_sub_agents: data.allow_sub_agents,
                allow_notifications: data.allow_notifications,
                allow_banners: data.allow_banners,
                features: data.features ? data.features.split(',').map((f) => f.trim()).filter(Boolean).join(',') : '',
            };

            if (editingPlan) {
                await adminApi.updatePlan(editingPlan.id, payload);
                toast.success('Plan updated!');
            } else {
                await adminApi.createPlan(payload);
                toast.success('Plan created!');
            }
            setShowModal(false);
            fetchPlans();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this plan?')) return;
        try {
            await adminApi.deletePlan(id);
            toast.success('Plan deleted');
            fetchPlans();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(price);
    };

    // Use useMemo for columns to prevent unnecessary re-renders
    const columns = React.useMemo(
        () => [
            {
                accessorKey: 'plan_name',
                header: 'Plan Name',
                cell: ({ row }) => (
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-50/50 dark:bg-primary-500/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                            <CreditCardIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{row.original.plan_name || row.original.name}</span>
                    </div>
                ),
            },
            {
                accessorKey: 'domain_type',
                header: 'Domain Type',
                cell: ({ row }) => (
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${row.original.domain_type === 'custom'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                        {row.original.domain_type === 'custom' ? '🔗 Custom Domain' : '🌐 Subdomain'}
                    </span>
                ),
            },
            {
                accessorKey: 'price',
                header: 'Price',
                cell: ({ row }) => (
                    <div className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(row.original.price)}
                        <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">/ month</span>
                    </div>
                ),
            },
            {
                accessorKey: 'max_listings',
                header: 'Max Listings',
                cell: ({ row }) => (
                    <span className="text-gray-600 dark:text-gray-300">{row.original.max_listings}</span>
                ),
            },
            {
                accessorKey: 'max_sub_agents',
                header: 'Max Sub-Agents',
                cell: ({ row }) => (
                    <span className="text-gray-600 dark:text-gray-300">{row.original.max_sub_agents}</span>
                ),
            },
            {
                accessorKey: 'features',
                header: 'Plan Features',
                cell: ({ row }) => {
                    const plan = row.original;
                    const features = [
                        { name: 'Appointments', enabled: plan.allow_appointments },
                        { name: 'Theme', enabled: plan.allow_theme },
                        { name: 'Sub-Agents', enabled: plan.allow_sub_agents },
                        { name: 'Notifications', enabled: plan.allow_notifications },
                        { name: 'Banners', enabled: plan.allow_banners },
                    ];
                    return (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {features.map((f, i) => (
                                <span key={i} className={`px-2 py-0.5 text-[10px] rounded-xl border ${f.enabled
                                    ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                    : 'bg-gray-50 text-gray-400 border-gray-100 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700 opacity-50'
                                    }`}>
                                    {f.name}
                                </span>
                            ))}
                        </div>
                    );
                },
            },
            {
                id: 'actions',
                header: () => <div className="text-right">Actions</div>,
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => openModal(row.original)}
                            className="p-1.5 text-primary-600 bg-primary-50/50 hover:bg-primary-100/50 dark:bg-primary-500/10 dark:text-primary-400 dark:hover:bg-primary-500/20 backdrop-blur-sm rounded-xl transition-all duration-200"
                            title="Edit Plan"
                        >
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleDelete(row.original.id)}
                            className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-xl transition-all duration-200"
                            title="Delete Plan"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    const {
        getHeaderGroups,
        getRowModel,
    } = useReactTable({
        data: plans,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Plans</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage plans and pricing for your agents</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-2 whitespace-nowrap h-[34px] text-[12px] px-4 rounded-xl">
                    <PlusIcon className="w-4 h-4" />
                    <span>Add Plan</span>
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="bg-white dark:bg-dashboard-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {plans.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                                    {getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <th
                                                    key={header.id}
                                                    className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                                >
                                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {getRowModel().rows.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="px-6 py-4 text-sm align-middle">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState
                            icon={CreditCardIcon}
                            title="No plans yet"
                            description="You haven't created any subscription plans. Create your first plan to start onboarding agents."
                            action={
                                <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                                    <PlusIcon className="w-5 h-5" />
                                    Create First Plan
                                </button>
                            }
                        />
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dashboard-card rounded-2xl w-full max-w-md p-6 animate-scale-in border dark:border-gray-700">
                        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                            {editingPlan ? 'Edit Plan' : 'Create Plan'}
                        </h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="input-label">Plan Name</label>
                                <input type="text" className="input-field" {...register('name', { required: true })} />
                            </div>
                            <div>
                                <label className="input-label">Domain Type</label>
                                <Controller
                                    name="domain_type"
                                    control={control}
                                    defaultValue="subdomain"
                                    render={({ field }) => (
                                        <StyledSelect
                                            {...field}
                                            options={[
                                                { value: 'subdomain', label: '🌐 Subdomain (agent.super.app)' },
                                                { value: 'custom', label: '🔗 Custom Domain (agent.com)' },
                                            ]}
                                        />
                                    )}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    This determines which agents can use this plan
                                </p>
                            </div>
                            <div>
                                <label className="input-label">Price (THB/month)</label>
                                <input type="number" className="input-field" {...register('price', { required: true })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="input-label">Max Listings</label>
                                    <input type="number" className="input-field" {...register('max_listings', { required: true })} />
                                </div>
                                <div>
                                    <label className="input-label">Max Sub-Agents</label>
                                    <input type="number" className="input-field" {...register('max_sub_agents', { required: true })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-y-2 py-2 border-y border-gray-100 dark:border-gray-700">
                                <label className="flex items-center space-x-2 text-sm">
                                    <input type="checkbox" {...register('allow_appointments')} className="w-4 h-4 rounded-xl border-gray-300 text-primary-600 focus:ring-primary-500" />
                                    <span>Appointments</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm">
                                    <input type="checkbox" {...register('allow_theme')} className="w-4 h-4 rounded-xl border-gray-300 text-primary-600 focus:ring-primary-500" />
                                    <span>Theme Customization</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm">
                                    <input type="checkbox" {...register('allow_sub_agents')} className="w-4 h-4 rounded-xl border-gray-300 text-primary-600 focus:ring-primary-500" />
                                    <span>Sub-Agents</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm">
                                    <input type="checkbox" {...register('allow_notifications')} className="w-4 h-4 rounded-xl border-gray-300 text-primary-600 focus:ring-primary-500" />
                                    <span>Notifications</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm">
                                    <input type="checkbox" {...register('allow_banners')} className="w-4 h-4 rounded-xl border-gray-300 text-primary-600 focus:ring-primary-500" />
                                    <span>Banners</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm">
                                    <input type="checkbox" {...register('allow_custom_domain')} className="w-4 h-4 rounded-xl border-gray-300 text-primary-600 focus:ring-primary-500" />
                                    <span>Custom Domain</span>
                                </label>
                            </div>
                            <div>
                                <label className="input-label">Features (comma-separated)</label>
                                <textarea
                                    className="input-field"
                                    placeholder="Custom domain, Priority support, Analytics"
                                    {...register('features')}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingPlan ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionPlans;
