import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

const PricingPlan = ({ plan, onSelect }) => {
    const features = Array.isArray(plan.features)
        ? plan.features
        : (plan.features?.split ? plan.features.split(',') : []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(price);
    };

    return (
        <div className={`relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border-2 transition-all duration-300 hover:scale-105 ${plan.domain_type === 'custom' ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-gray-100 dark:border-gray-700'}`}>
            {plan.domain_type === 'custom' && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                    Recommended
                </div>
            )}

            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.plan_name || plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{formatPrice(plan.price)}</span>
                    <span className="text-gray-500 dark:text-gray-400">/mo</span>
                </div>
            </div>

            <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Up to <strong>{plan.max_listings}</strong> listings</span>
                </li>
                <li className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300"><strong>{plan.max_sub_agents}</strong> Sub-Agents</span>
                </li>
                {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <CheckIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{feature.trim()}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={() => onSelect(plan)}
                className={`w-full py-4 rounded-xl font-bold transition-all duration-200 ${plan.domain_type === 'custom'
                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
                Choose {plan.plan_name || plan.name}
            </button>
        </div>
    );
};

export default PricingPlan;
