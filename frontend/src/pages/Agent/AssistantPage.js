import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aiApi } from '../../services/api';
import {
    SparklesIcon,
    PlusIcon,
    BuildingOfficeIcon,
    DocumentTextIcon,
    LanguageIcon,
    CurrencyDollarIcon,
    PhotoIcon,
} from '@heroicons/react/24/outline';

/**
 * Agent AI Assistant hub: credits, usage summary, quick actions.
 * Uses existing dashboard theme (no new theme rules).
 */
const AssistantPage = () => {
    const [credits, setCredits] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const res = await aiApi.getCredits();
                setCredits(res.data);
            } catch (err) {
                if (err.response?.status === 403 || err.response?.data?.code === 'no_plan') {
                    setCredits({ ai_enabled: false, credits_remaining: 0, credits_total: 0 });
                } else {
                    setCredits(null);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchCredits();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const remaining = credits?.credits_remaining ?? 0;
    const total = credits?.credits_total ?? 0;
    const used = total > 0 ? Math.max(0, total - remaining) : 0;
    const aiEnabled = credits?.ai_enabled ?? false;
    const inGrace = credits?.in_grace ?? false;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Credits, usage, and quick actions for listing tools.</p>
            </div>

            {/* Credits card */}
            <div className="bg-white dark:bg-dashboard-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-primary-500" />
                    Credits this month
                </h2>
                {!aiEnabled ? (
                    <>
                        <p className="text-gray-600 dark:text-gray-400">AI is not available on your current plan. Upgrade to use descriptions, translation, price suggestions, and more.</p>
                        <Link to="/agent/settings" className="inline-block mt-4 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">
                            View plan
                        </Link>
                    </>
                ) : (
                    <>
                        <div className="flex flex-wrap items-baseline gap-4">
                            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">{remaining}</span>
                            <span className="text-gray-500 dark:text-gray-400">/ {total} remaining</span>
                            {inGrace && (
                                <span className="text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">Grace mode</span>
                            )}
                        </div>
                        {total > 0 && (
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Used this month: {used} credits</p>
                        )}
                        <div className="mt-4 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden max-w-xs">
                            <div
                                className="h-full bg-primary-500 rounded-full transition-all"
                                style={{ width: total > 0 ? `${(remaining / total) * 100}%` : '0%' }}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Quick actions */}
            <div className="bg-white dark:bg-dashboard-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                        to="/agent/listings/new"
                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-200 dark:hover:border-primary-700 transition-colors"
                    >
                        <div className="p-2.5 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
                            <PlusIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-medium text-gray-900 dark:text-white">Create listing</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Use AI for description, translate, price</p>
                        </div>
                    </Link>
                    <Link
                        to="/agent/listings"
                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-200 dark:hover:border-primary-700 transition-colors"
                    >
                        <div className="p-2.5 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
                            <BuildingOfficeIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-medium text-gray-900 dark:text-white">Manage listings</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Edit, publish, add photos</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* What uses credits */}
            <div className="bg-white dark:bg-dashboard-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What uses credits</h2>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-3">
                        <DocumentTextIcon className="w-4 h-4 text-primary-500 shrink-0" />
                        Generate description (Create/Edit listing)
                    </li>
                    <li className="flex items-center gap-3">
                        <LanguageIcon className="w-4 h-4 text-primary-500 shrink-0" />
                        Translate (EN / TH / MM)
                    </li>
                    <li className="flex items-center gap-3">
                        <CurrencyDollarIcon className="w-4 h-4 text-primary-500 shrink-0" />
                        Suggest price
                    </li>
                    <li className="flex items-center gap-3">
                        <PhotoIcon className="w-4 h-4 text-primary-500 shrink-0" />
                        Enhance image (when configured)
                    </li>
                    <li className="flex items-center gap-3">
                        <SparklesIcon className="w-4 h-4 text-primary-500 shrink-0" />
                        Website chat &amp; smart search (visitor-facing)
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default AssistantPage;
