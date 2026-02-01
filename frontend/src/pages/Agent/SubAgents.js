import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { agentApi } from '../../services/api';
import toast from 'react-hot-toast';
import { UserPlusIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/outline';

const SubAgents = () => {
    const [subAgents, setSubAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetchSubAgents = async () => {
        try {
            const response = await agentApi.getSubAgents();
            setSubAgents(response.data || []);
        } catch (error) {
            console.error('Failed to fetch sub-agents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubAgents();
    }, []);

    const onSubmit = async (data) => {
        try {
            await agentApi.createSubAgent(data);
            toast.success('Sub-agent created!');
            reset();
            setShowForm(false);
            fetchSubAgents();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create sub-agent');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this sub-agent?')) return;

        try {
            await agentApi.deleteSubAgent(id);
            toast.success('Sub-agent removed');
            fetchSubAgents();
        } catch (error) {
            toast.error('Failed to remove');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Sub-Agents</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center space-x-2">
                    <UserPlusIcon className="w-5 h-5" />
                    <span>Add Sub-Agent</span>
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl p-6 shadow-sm animate-slide-down">
                    <h2 className="text-lg font-semibold mb-4">Create Sub-Agent</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="input-label">First Name *</label>
                                <input
                                    type="text"
                                    className={`input-field ${errors.first_name ? 'border-red-300' : ''}`}
                                    {...register('first_name', { required: 'Required' })}
                                />
                            </div>
                            <div>
                                <label className="input-label">Last Name *</label>
                                <input
                                    type="text"
                                    className={`input-field ${errors.last_name ? 'border-red-300' : ''}`}
                                    {...register('last_name', { required: 'Required' })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Email *</label>
                            <input
                                type="email"
                                className={`input-field ${errors.email ? 'border-red-300' : ''}`}
                                {...register('email', { required: 'Required', pattern: /^\S+@\S+$/i })}
                            />
                        </div>
                        <div>
                            <label className="input-label">Password *</label>
                            <input
                                type="password"
                                className={`input-field ${errors.password ? 'border-red-300' : ''}`}
                                {...register('password', { required: 'Required', minLength: 8 })}
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">Create</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : subAgents.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {subAgents.map((agent) => (
                            <div key={agent.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                        <span className="text-primary-700 font-bold">
                                            {agent.first_name?.[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {agent.first_name} {agent.last_name}
                                        </div>
                                        <div className="text-sm text-gray-500">{agent.email}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(agent.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No sub-agents yet</h3>
                        <p className="text-gray-500">Add team members to help manage your listings.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubAgents;
