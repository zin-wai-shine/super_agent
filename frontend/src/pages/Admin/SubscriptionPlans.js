import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, CreditCardIcon, CheckIcon } from '@heroicons/react/24/outline';

const SubscriptionPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    const { register, handleSubmit, reset } = useForm();

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
                name: plan.name,
                price: plan.price,
                max_listings: plan.max_listings,
                max_sub_agents: plan.max_sub_agents,
                features: plan.features?.join(', ') || '',
            });
        } else {
            reset({ name: '', price: '', max_listings: 10, max_sub_agents: 1, features: '' });
        }
        setShowModal(true);
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                price: parseFloat(data.price),
                max_listings: parseInt(data.max_listings),
                max_sub_agents: parseInt(data.max_sub_agents),
                features: data.features.split(',').map((f) => f.trim()).filter(Boolean),
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
                <button onClick={() => openModal()} className="btn-primary flex items-center space-x-2">
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Plan</span>
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <div
                            key={plan.id}
                            className={`bg-white rounded-2xl p-6 shadow-sm border-2 ${index === 1 ? 'border-primary-500' : 'border-transparent'
                                }`}
                        >
                            {index === 1 && (
                                <div className="text-center mb-4">
                                    <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <div className="inline-flex p-3 bg-primary-50 rounded-xl mb-4">
                                    <CreditCardIcon className="w-8 h-8 text-primary-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                                    <span className="text-gray-500">/month</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                                    Up to {plan.max_listings} listings
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                                    {plan.max_sub_agents} sub-agent{plan.max_sub_agents > 1 ? 's' : ''}
                                </li>
                                {plan.features?.map((feature, i) => (
                                    <li key={i} className="flex items-center text-sm text-gray-600">
                                        <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => openModal(plan)}
                                    className="flex-1 btn-secondary text-sm py-2"
                                >
                                    <PencilIcon className="w-4 h-4 inline mr-1" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {plans.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No plans yet</h3>
                            <p className="text-gray-500">Create subscription plans for your agents.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-scale-in">
                        <h2 className="text-xl font-bold mb-6">
                            {editingPlan ? 'Edit Plan' : 'Create Plan'}
                        </h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="input-label">Plan Name</label>
                                <input type="text" className="input-field" {...register('name', { required: true })} />
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
