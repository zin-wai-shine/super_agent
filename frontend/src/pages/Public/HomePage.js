import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { publicApi } from '../../services/api';
import PricingPlan from '../../components/Pricing/PricingPlan';
import {
    SparklesIcon,
    ArrowRightIcon,
    DevicePhoneMobileIcon,
    MapIcon,
    ChartBarSquareIcon,
    AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

const HomePage = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await publicApi.getPlans();
                setPlans(response.data || []);
            } catch (error) {
                console.error('Failed to fetch plans:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const features = [
        {
            title: 'Your Own Branded Portal',
            description: 'Get a professional property search site on your own subdomain or custom domain.',
            icon: DevicePhoneMobileIcon,
            color: 'text-blue-600 bg-blue-50',
        },
        {
            title: 'Interactive Transit Maps',
            description: "Help clients find homes near Bangkok's BTS and MRT stations with our built-in interactive map.",
            icon: MapIcon,
            color: 'text-purple-600 bg-purple-50',
        },
        {
            title: 'Advanced Analytics',
            description: 'Track views, leads, and performance of each listing in real-time.',
            icon: ChartBarSquareIcon,
            color: 'text-emerald-600 bg-emerald-50',
        },
        {
            title: 'Team Management',
            description: 'Add sub-agents to your team and manage their listings from a single dashboard.',
            icon: AdjustmentsHorizontalIcon,
            color: 'text-amber-600 bg-amber-50',
        },
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-primary-50 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-secondary-50 rounded-full blur-3xl opacity-50"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-bold mb-8">
                        <SparklesIcon className="w-4 h-4" />
                        <span>The Ultimate Platform for Real Estate Agents</span>
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                        Sell Homes Faster with Your <br />
                        <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            Personal Property Portal
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Join hundreds of top agents using Super to showcase their listings,
                        manage their teams, and close more deals.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-xl shadow-primary-600/20 hover:bg-primary-700 transition-all hover:-translate-y-1">
                            Get Started Now
                        </Link>
                        <a href="#plans" className="w-full sm:w-auto px-8 py-4 font-bold text-gray-700 hover:text-primary-600 transition-colors">
                            View Pricing
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We've built a comprehensive suite of tools specifically designed for modern real estate agents in Thailand.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
                                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                                    <feature.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="plans" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Start with a simple subdomain or go professional with your own custom domain.
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-96 bg-gray-100 rounded-3xl"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {plans.map((plan) => (
                                <PricingPlan
                                    key={plan.id}
                                    plan={plan}
                                    onSelect={() => navigate('/register')}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-primary-900 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <svg width="100%" height="100%"><pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="white" /></pattern><rect width="100%" height="100%" fill="url(#dots)" /></svg>
                </div>
                <div className="relative max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-white mb-8">Ready to Transform Your Real Estate Business?</h2>
                    <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">
                        Join the fastest-growing network of real estate professionals in Bangkok.
                        No technical skills required.
                    </p>
                    <Link to="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-primary-900 font-bold rounded-2xl hover:bg-primary-50 transition-all shadow-2xl">
                        Start Your Free Trial
                        <ArrowRightIcon className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
