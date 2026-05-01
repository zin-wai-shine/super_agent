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
        <div className={`relative glass-card !rounded-xl p-8 shadow-lg border-2 transition-all duration-300 hover:scale-[1.02] ${plan.domain_type === 'custom' ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-transparent shadow-gray-200/50'} w-full max-w-sm mx-auto flex flex-col h-full`}>
            {plan.domain_type === 'custom' && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-primary-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg">
                    Recommended
                </div>
            )}

            <div className="text-center mb-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">{plan.plan_name || plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-extrabold gradient-text">{formatPrice(plan.price)}</span>
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">/month</span>
                </div>
            </div>

            <div className="flex-grow">
                <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                            <CheckIcon className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Up to <strong>{plan.max_listings}</strong> listings</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                            <CheckIcon className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300"><strong>{plan.max_sub_agents}</strong> Sub-Agents</span>
                    </li>
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-5 h-5 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                <CheckIcon className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">{feature.trim()}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <button
                onClick={() => onSelect(plan)}
                className={`w-full ${plan.domain_type === 'custom' ? 'btn-primary' : 'btn-secondary'} !rounded-xl !h-12 text-sm mt-auto`}
            >
                Choose {plan.plan_name || plan.name}
            </button>
        </div>
    );
};

export default PricingPlan;
