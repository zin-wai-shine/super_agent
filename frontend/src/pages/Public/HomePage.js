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
import { useTenant } from '../../contexts/TenantContext';
import Logo from '../../components/Common/Logo';
import HeroFilter from '../../components/Home/HeroFilter';

const HomePage = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    const { isMainDomain, agent } = useTenant();

    useEffect(() => {
        if (!isMainDomain) {
            setLoading(false);
            return;
        }

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
    }, [isMainDomain]);

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
        <div className="bg-white dark:bg-dashboard-dark selection:bg-primary-100 selection:text-primary-900 transition-colors duration-500">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-12 pb-32">
                {/* Background Decoration - Clear Style */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-white dark:bg-dashboard-dark transition-colors duration-500"></div>
                    {/* Perspective Dot Grid */}
                    <div
                        className="absolute inset-0 z-0 opacity-[0.15] text-black dark:text-white"
                        style={{
                            backgroundImage: `radial-gradient(circle, currentColor 0.5px, transparent 0.5px)`,
                            backgroundSize: '32px 32px',
                            maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
                            WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)',
                            transform: 'perspective(1000px) rotateX(20deg) scale(1.2) translateY(-10%)',
                        }}
                    ></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    {/* Badge */}
                    {isMainDomain && (
                        <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
                            <div className="inline-flex items-center gap-3 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-4 py-1.5 rounded-full text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-12 backdrop-blur-sm">
                                <Logo className="w-4 h-4" style={{ color: 'var(--primary-color)' }} />
                                <span className="tracking-tight">
                                    Google Antigravity
                                </span>
                            </div>
                        </div>
                    )}

                    <h1 className="text-4xl md:text-6xl font-normal text-gray-950 dark:text-white mb-6 leading-[1.1] tracking-[-0.03em] animate-fade-up max-w-5xl mx-auto" style={{ animationDelay: '0.2s' }}>
                        {isMainDomain ? (
                            <>
                                Experience liftoff with the <br className="hidden md:block" />
                                <span className="text-primary-600 font-semibold italic">next-generation</span> real estate
                            </>
                        ) : (
                            <>
                                Find Your Dream Home <br className="hidden md:block" />
                                With <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-950 dark:from-white to-primary-600 font-normal inline-block w-fit pr-2">{agent?.name || 'Super Real Estate'}</span>
                            </>
                        )}
                    </h1>

                    <div className="animate-fade-up mb-12" style={{ animationDelay: '0.4s' }}>
                        <HeroFilter />
                    </div>

                    <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-16 leading-relaxed animate-fade-up font-normal" style={{ animationDelay: '0.3s' }}>
                        {isMainDomain ? (
                            <>
                                Empowering agents with state-of-the-art property search portals.
                                join <span className="text-gray-900 dark:text-white font-medium">500+ professionals</span> building their legacy.
                            </>
                        ) : (
                            <>
                                {agent?.description || 'Providing premium real estate services with a focus on quality and client satisfaction.'}
                            </>
                        )}
                    </p>
                </div>
            </section>

            {/* Feature Section With Video */}
            <section className="relative w-full bg-white dark:bg-dashboard-dark overflow-hidden">
                <div className="flex flex-col lg:flex-row min-h-[600px] lg:h-[800px]">
                    {/* Left Text */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center p-10 sm:p-16 lg:px-24 xl:px-32 bg-white dark:bg-dashboard-dark z-10 items-start">
                        <div className="max-w-[600px]">
                            <h2 className="text-[32px] md:text-[40px] lg:text-[44px] leading-[1.1] tracking-[-0.02em] font-medium text-gray-950 dark:text-white mb-6">
                                Higher-level<br />
                                Abstractions
                            </h2>
                            <p className="text-[16px] md:text-[18px] lg:text-[20px] text-gray-600 dark:text-gray-400 leading-[1.6] font-normal">
                                A more intuitive task-based approach to monitoring agent activity, presenting you with essential artifacts and verification results to build trust.
                            </p>
                        </div>
                    </div>
                    {/* Right Video Background */}
                    <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-full p-4 lg:py-10 lg:pl-0 lg:pr-0">
                        <div className="w-full h-full relative rounded-[40px] lg:rounded-r-none overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]">
                            <video
                                className="absolute inset-0 w-full h-full object-cover"
                                src="/hero_main_background.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                            {/* Cinematic Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 z-10 pointer-events-none" />
                            <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.4)] z-10 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision & Mission Section (Agent Only) */}
            {!isMainDomain && (agent?.vision || agent?.mission) && (
                <section className="py-24 bg-gray-50/50 dark:bg-white/5 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            {agent?.vision && (
                                <div className="animate-fade-up">
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 tracking-tight flex items-center gap-3">
                                        <div className="w-1.5 h-8 bg-primary-600 rounded-full"></div>
                                        Our Vision
                                    </h2>
                                    <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed italic">
                                        "{agent.vision}"
                                    </p>
                                </div>
                            )}
                            {agent?.mission && (
                                <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 tracking-tight flex items-center gap-3">
                                        <div className="w-1.5 h-8 bg-secondary-600 rounded-full"></div>
                                        Our Mission
                                    </h2>
                                    <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                        {agent.mission}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Features/Plans Section (Main Domain Only) */}
            {isMainDomain && (
                <>
                    {/* Features Section */}
                    {/* ... (keep existing features code but wrap in isMainDomain) */}
                </>
            )}

            {/* CTA Section (Main Domain Only) */}
            {isMainDomain && (
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
                                <span className="text-slate-500 text-sm font-bold" style={{ color: '#222222' }}>
                                    14-day free trial included
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default HomePage;
