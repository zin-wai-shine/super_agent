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
            const aiTier = (plan.ai_tier || 'none').toString().toLowerCase();
            const validTier = ['none', 'basic', 'pro', 'millionaire'].includes(aiTier) ? aiTier : 'none';
            reset({
                name: plan.plan_name || plan.name,
                domain_type: plan.domain_type || 'subdomain',
                price: plan.price,
                max_listings: plan.max_listings,
                max_sub_agents: plan.max_sub_agents,
                allow_custom_domain: plan.allow_custom_domain || false,
                features: typeof plan.features === 'string' ? plan.features : (Array.isArray(plan.features) ? plan.features.join(', ') : (plan.features?.join ? plan.features.join(', ') : '')),
                ai_tier: validTier,
                monthly_ai_credits: plan.monthly_ai_credits ?? 0,
            });
        } else {
            reset({
                name: '',
                domain_type: 'subdomain',
                price: '',
                max_listings: 10,
                max_sub_agents: 1,
                allow_custom_domain: false,
                features: '',
                ai_tier: 'none',
                monthly_ai_credits: 0,
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
                max_listings: parseInt(data.max_listings, 10),
                max_sub_agents: parseInt(data.max_sub_agents, 10),
                allow_custom_domain: data.allow_custom_domain || false,
                features: data.features ? data.features.split(',').map((f) => f.trim()).filter(Boolean).join(',') : '',
                ai_tier: (data.ai_tier?.value ?? data.ai_tier ?? 'none').toString().toLowerCase(),
                monthly_ai_credits: parseInt(data.monthly_ai_credits, 10) || 0,
            };
            if (!['none', 'basic', 'pro', 'millionaire'].includes(payload.ai_tier)) payload.ai_tier = 'none';

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
                        <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
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
                        <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">/mo</span>
                    </div>
                ),
            },
            {
                accessorKey: 'max_listings',
                header: 'Max Listings',
                cell: ({ row }) => (
                    <span className="text-gray-600 dark:text-gray-300">
                        {row.original.max_listings === -1 ? 'Unlimited' : row.original.max_listings}
                    </span>
                ),
            },
            {
                accessorKey: 'max_sub_agents',
                header: 'Max Sub-Agents',
                cell: ({ row }) => (
                    <span className="text-gray-600 dark:text-gray-300">
                        {row.original.max_sub_agents === -1 ? 'Unlimited' : row.original.max_sub_agents}
                    </span>
                ),
            },
            {
                accessorKey: 'ai_tier',
                header: 'AI Tier',
                cell: ({ row }) => {
                    const tier = row.original.ai_tier || 'none';
                    const labels = { none: 'None', basic: 'Basic', pro: 'Pro', millionaire: 'Millionaire' };
                    const styles = {
                        none: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
                        basic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                        pro: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                        millionaire: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                    };
                    return (
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${styles[tier] || styles.none}`}>
                            {labels[tier] || tier}
                        </span>
                    );
                },
            },
            {
                accessorKey: 'monthly_ai_credits',
                header: 'AI Credits/mo',
                cell: ({ row }) => (
                    <span className="text-gray-600 dark:text-gray-300">
                        {(row.original.monthly_ai_credits ?? 0) === 0 ? '—' : row.original.monthly_ai_credits.toLocaleString()}
                    </span>
                ),
            },
            {
                accessorKey: 'features',
                header: 'Features',
                cell: ({ row }) => {
                    const features = Array.isArray(row.original.features)
                        ? row.original.features
                        : (row.original.features?.split ? row.original.features.split(',') : []);
                    return (
                        <div className="flex flex-wrap gap-1">
                            {features.slice(0, 2).map((f, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] rounded-md">
                                    {f.trim()}
                                </span>
                            ))}
                            {features.length > 2 && (
                                <span className="text-[10px] text-gray-400 dark:text-gray-500">+{features.length - 2} more</span>
                            )}
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
                            className="p-1.5 text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-400 dark:hover:bg-primary-500/20 rounded-lg transition-all duration-200"
                            title="Edit Plan"
                        >
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleDelete(row.original.id)}
                            className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-lg transition-all duration-200"
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Plans</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage plans and pricing for your agents</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap shadow-sm h-[34px] text-[12px] px-3">
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

            {/* Modal - wider, scrollable, centered */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-dashboard-card rounded-2xl w-full max-w-2xl my-8 p-6 animate-scale-in border dark:border-gray-700 shadow-xl max-h-[90vh] flex flex-col">
                        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white shrink-0">
                            {editingPlan ? 'Edit Plan' : 'Create Plan'}
                        </h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
                            <div className="space-y-4 overflow-y-auto flex-1 min-h-0 pr-1">
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
                                    <input type="number" className="input-field" placeholder="-1 = unlimited" {...register('max_listings', { required: true })} />
                                </div>
                                <div>
                                    <label className="input-label">Max Sub-Agents</label>
                                    <input type="number" className="input-field" placeholder="-1 = unlimited" {...register('max_sub_agents', { required: true })} />
                                </div>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">AI Assistant (Agent Assistant)</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="input-label">AI Tier</label>
                                        <Controller
                                            name="ai_tier"
                                            control={control}
                                            defaultValue="none"
                                            render={({ field }) => {
                                                const v = (typeof field.value === 'string' ? field.value : field.value?.value) ?? 'none';
                                                const labels = { none: 'None (no AI)', basic: 'Basic', pro: 'Pro', millionaire: 'Millionaire' };
                                                const aiTierOptions = [
                                                    { value: 'none', label: 'None (no AI)' },
                                                    { value: 'basic', label: 'Basic' },
                                                    { value: 'pro', label: 'Pro' },
                                                    { value: 'millionaire', label: 'Millionaire' },
                                                ];
                                                return (
                                                    <StyledSelect
                                                        options={aiTierOptions}
                                                        value={v ? { value: v, label: labels[v] || v } : aiTierOptions[0]}
                                                        onChange={(selected) => {
                                                            const val = selected && typeof selected === 'object' && 'value' in selected ? selected.value : selected;
                                                            field.onChange(val ?? 'none');
                                                        }}
                                                    />
                                                );
                                            }}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Determines which AI features agents on this plan can use.</p>
                                    </div>
                                    <div>
                                        <label className="input-label">Monthly AI Credits</label>
                                        <input type="number" min={0} className="input-field" {...register('monthly_ai_credits', { min: 0 })} />
                                        <p className="text-xs text-gray-500 mt-1">Credits reset each billing cycle. 0 = no AI.</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="input-label flex items-center space-x-2">
                                    <input type="checkbox" {...register('allow_custom_domain')} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                    <span>Allow Custom Domain</span>
                                </label>
                                <p className="text-xs text-gray-500 mt-1">
                                    Enable to allow agents to upgrade to custom domains later
                                </p>
                            </div>
                            <div>
                                <label className="input-label">Features (comma-separated)</label>
                                <textarea
                                    className="input-field"
                                    placeholder="e.g. Custom domain, Priority support, Analytics"
                                    rows={3}
                                    {...register('features')}
                                />
                                <p className="text-xs text-gray-500 mt-1">Add plan features as comma-separated text. Shown on plan cards.</p>
                            </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
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
