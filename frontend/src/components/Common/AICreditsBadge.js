import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aiApi } from '../../services/api';
import { SparklesIcon } from '@heroicons/react/24/outline';

/**
 * Shows current AI credits and upgrade CTA when low or in grace.
 * Use in dashboard header or sidebar for agent layout.
 */
const AICreditsBadge = () => {
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

    if (loading || credits === null) return null;
    if (!credits.ai_enabled) {
        return (
            <Link
                to="/agent/settings"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
            >
                <SparklesIcon className="w-4 h-4" />
                <span>Upgrade for AI</span>
            </Link>
        );
    }

    const remaining = credits.credits_remaining ?? 0;
    const total = credits.credits_total ?? 0;
    const inGrace = credits.in_grace;
    const low = total > 0 && remaining <= total * 0.2;

    return (
        <div className="flex items-center gap-2">
            <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                    inGrace
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
                        : low
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
                        : 'bg-primary-500/10 text-primary-700 dark:text-primary-300'
                }`}
                title={`AI credits: ${remaining} of ${total} left this month${inGrace ? ' (grace mode)' : ''}`}
            >
                <SparklesIcon className="w-4 h-4 shrink-0" />
                <span className="font-medium">{remaining}</span>
                <span className="text-gray-500 dark:text-gray-400">/ {total}</span>
                {inGrace && <span className="text-xs">(grace)</span>}
            </div>
            {(low || inGrace) && (
                <Link
                    to="/agent/settings"
                    className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                >
                    Upgrade
                </Link>
            )}
        </div>
    );
};

export default AICreditsBadge;
