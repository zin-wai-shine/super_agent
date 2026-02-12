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
    ArrowPathIcon,
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
        <div className="bg-white selection:bg-primary-100 selection:text-primary-900">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
                {/* mesh background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-[#fcfcfc]"></div>
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-100/40 rounded-full blur-[120px] animate-mesh"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary-100/40 rounded-full blur-[120px] animate-mesh" style={{ animationDelay: '-5s' }}></div>
                    <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-50/60 rounded-full blur-[100px] animate-mesh" style={{ animationDelay: '-10s' }}></div>
                </div>

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-[-5vh]">
                    <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-primary-100/50 text-primary-700 px-5 py-2.5 rounded-full text-sm font-bold mb-10 shadow-sm ring-4 ring-primary-50/30">
                            <SparklesIcon className="w-5 h-5 text-primary-500" />
                            <span className="tracking-tight">The Ultimate Platform for Real Estate Agents</span>
                        </div>
                    </div>

                    <h1 className="text-6xl sm:text-8xl font-black text-gray-900 mb-8 leading-[1.05] tracking-tight animate-fade-up" style={{ animationDelay: '0.3s' }}>
                        Sell Homes Faster <br className="hidden sm:block" />
                        <span className="relative inline-block mt-2">
                            <span className="relative z-10 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text text-transparent">
                                Personalized Portal
                            </span>
                            <div className="absolute bottom-4 left-0 w-full h-4 bg-primary-100/50 -z-10 -rotate-1 rounded-full blur-sm"></div>
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-up font-medium" style={{ animationDelay: '0.5s' }}>
                        Empowering agents with state-of-the-art property search portals.
                        Join <span className="text-gray-900 font-bold">500+ professionals</span> building their legacy.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-up" style={{ animationDelay: '0.7s' }}>
                        <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-primary-600 text-white font-bold rounded-2xl shadow-2xl shadow-primary-600/30 hover:bg-primary-700 transition-all hover:-translate-y-1.5 active:scale-[0.98] text-lg flex items-center justify-center gap-3">
                            Get Started Free
                            <SparklesIcon className="w-5 h-5" />
                        </Link>
                        <a href="#plans" className="w-full sm:w-auto px-10 py-5 font-bold text-gray-900 hover:text-primary-600 transition-all flex items-center justify-center gap-2 group text-lg">
                            View Pricing Plans
                            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
                    <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center p-1">
                        <div className="w-1 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 bg-white relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Everything You Need to Scale</h2>
                            <p className="text-xl text-gray-500 font-medium">
                                Professional tools designed for the modern agent, helping you close deals while you sleep.
                            </p>
                        </div>
                        <div className="hidden lg:block pb-2">
                            <div className="px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 font-bold text-sm tracking-widest uppercase">
                                Global Standards
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, i) => (
                            <div key={i} className="group bg-gray-50/50 p-10 rounded-[40px] border border-gray-100 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 cursor-default">
                                <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                                    <feature.icon className="w-9 h-9" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-medium text-lg">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="plans" className="py-32 relative overflow-hidden bg-gray-50/30">
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary-50/30 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Flexible Plans for Every Stage</h2>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
                            Choose the perfect platform for your business. Upgrade or downgrade anytime as you grow.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto px-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] h-[500px] bg-white rounded-[32px] animate-pulse border border-gray-100 shadow-sm"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto px-4">
                            {plans.map((plan) => (
                                <div key={plan.id} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] xl:w-[calc(25%-1.5rem)] max-w-sm">
                                    <PricingPlan
                                        plan={plan}
                                        onSelect={() => navigate('/register')}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-4">
                <div className="max-w-6xl mx-auto bg-slate-900 rounded-[60px] p-12 md:p-24 text-center relative overflow-hidden group shadow-[0_40px_100px_-20px_rgba(15,23,42,0.3)]">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500/10 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-10 tracking-tight leading-tight">
                            Build Your Legacy <br />
                            <span className="text-primary-400">Join the Future</span> of Real Estate
                        </h2>
                        <p className="text-slate-400 text-xl mb-14 max-w-3xl mx-auto font-medium leading-relaxed">
                            No technical knowledge required. We handle everything from domains to
                            performance analytics while you focus on what matters most: <span className="text-white">your clients.</span>
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link to="/register" className="w-full sm:w-auto px-12 py-6 bg-white text-slate-900 font-bold rounded-2xl hover:bg-primary-50 transition-all shadow-xl hover:-translate-y-1 active:scale-95 text-xl flex items-center justify-center gap-3">
                                Create My Portal
                                <ArrowRightIcon className="w-6 h-6" />
                            </Link>
                            <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                                14-day free trial included
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
