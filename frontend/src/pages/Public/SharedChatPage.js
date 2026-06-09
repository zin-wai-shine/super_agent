import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicApi } from '../../services/api';
import Logo from '../../components/Common/Logo';
import { ListingsCarousel } from '../../components/AIAssistant/AIAssistant';
import { useTheme } from '../../contexts/ThemeContext';
import {
    FiMessageSquare,
    FiActivity,
    FiInfo,
    FiGrid
} from 'react-icons/fi';

const SharedChatPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [savedStatus, setSavedStatus] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSharedChat = async () => {
            try {
                setLoading(true);
                const res = await publicApi.getSharedChat(id);
                setSession(res.data);
                if (res.data.messages) {
                    setMessages(JSON.parse(res.data.messages));
                }
                setError(null);
            } catch (err) {
                console.error('Failed to load shared chat:', err);
                setError('This shared conversation does not exist or has been removed.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSharedChat();
        }
    }, [id]);

    const formatMessageText = (text) => {
        if (!text) return null;
        let formatted = text.replace(/\*\*(.*?)\*"/g, '<strong>$1</strong>');
        formatted = formatted.replace(/^\*\s(.*)$/gm, '<li>$1</li>');
        formatted = formatted.replace(/^-\s(.*)$/gm, '<li>$1</li>');

        return formatted.split('\n').map((line, idx) => {
            if (line.trim().startsWith('<li>') || line.trim().endsWith('</li>')) {
                return (
                    <ul key={idx} className="list-disc pl-5 my-1 dark:text-gray-200">
                        <span dangerouslySetInnerHTML={{ __html: line }} />
                    </ul>
                );
            }
            return <p key={idx} className="my-1.5 leading-relaxed dark:text-gray-200 text-[15px]" dangerouslySetInnerHTML={{ __html: line }} />;
        });
    };

    const handleContinueConversation = () => {
        try {
            if (session) {
                const userKey = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : 'guest';
                const storageKey = `bolt_haven_chat_sessions_${userKey}`;
                const stored = localStorage.getItem(storageKey);
                let currentSessions = [];
                if (stored) {
                    currentSessions = JSON.parse(stored);
                }

                // Check if session already exists in current user's local storage
                const exists = currentSessions.some(s => s.id === session.id);
                if (!exists) {
                    const newSession = {
                        id: session.id,
                        title: session.title,
                        messages: messages,
                        preferences: {},
                        updatedAt: Date.now()
                    };
                    const updated = [newSession, ...currentSessions];
                    localStorage.setItem(storageKey, JSON.stringify(updated));
                    // Dispatch custom event to reload AIAssistant session list
                    window.dispatchEvent(new CustomEvent('reload-ai-assistant', { detail: session.id }));
                } else {
                    // Just select the existing session
                    window.dispatchEvent(new CustomEvent('select-ai-assistant-session', { detail: session.id }));
                }
            }
        } catch (err) {
            console.error('Failed to import shared session:', err);
        }

        // Open the AI Assistant panel by navigating to its route
        navigate(`/chat/${session.id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dashboard-dark">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" style={{ borderColor: theme.primaryColor || '#1a73e8' }}></div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-dashboard-dark">
                <div className="bg-white dark:bg-dashboard-card border border-gray-200 dark:border-white/10 rounded-3xl p-8 max-w-md text-center shadow-lg">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Conversation Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">{error || 'This conversation is unavailable.'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2.5 bg-gray-950 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl transition-all"
                    >
                        Go to Home Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="min-h-screen bg-gray-50 dark:bg-dashboard-dark py-12 px-4 md:px-6"
            style={{ fontFamily: "'Helvetica', 'Arial', sans-serif" }}
        >
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Banner */}
                <div className="bg-white dark:bg-dashboard-card rounded-3xl p-6 border border-gray-200/80 dark:border-white/5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 flex items-center gap-1.5" style={{ color: theme.primaryColor || '#1a73e8' }}>
                            <FiMessageSquare className="w-3.5 h-3.5" /> Shared AI Assistant Chat
                        </span>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                            {session.title}
                        </h1>
                    </div>
                    <button
                        onClick={handleContinueConversation}
                        className="px-6 py-3 bg-gray-955 dark:bg-white text-white dark:text-gray-905 font-bold text-sm rounded-full shadow-md hover:scale-105 active:scale-95 transition-all duration-200 flex-shrink-0 border-0 cursor-pointer"
                        style={{
                            backgroundColor: theme.primaryColor || '#1a73e8',
                            color: '#ffffff'
                        }}
                    >
                        Connect & Continue Chat
                    </button>
                </div>

                {/* Conversation Viewport */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 md:p-8 border border-gray-200/85 dark:border-white/5 shadow-sm space-y-8">
                    {messages.map((m, idx) => (
                        <div key={idx} className="space-y-6">
                            <div className="flex gap-4 items-start">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    {m.role === 'user' ? (
                                        <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-xs">
                                            U
                                        </div>
                                    ) : (
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                                            style={{ backgroundColor: theme.primaryColor || '#1a73e8' }}
                                        >
                                            <Logo className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-1">
                                    <span className="text-[11px] font-bold text-gray-400 block tracking-wider uppercase">
                                        {m.role === 'user' ? 'User' : 'Assistant'}
                                    </span>
                                    <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
                                        {formatMessageText(m.content)}
                                    </div>
                                </div>
                            </div>

                            {/* Listings Carousel */}
                            {m.listings && m.listings.length > 0 && (
                                <ListingsCarousel
                                    listings={m.listings}
                                    title="Matching Listings"
                                    icon={<FiActivity className="w-3.5 h-3.5 text-green-500 animate-pulse" />}
                                    savedStatus={savedStatus}
                                    setSavedStatus={setSavedStatus}
                                    theme={theme}
                                />
                            )}

                            {/* Alternatives */}
                            {m.alternatives && m.alternatives.length > 0 && (
                                <ListingsCarousel
                                    listings={m.alternatives}
                                    title="Recommended Alternatives"
                                    icon={<FiInfo className="w-3.5 h-3.5 text-yellow-500" />}
                                    savedStatus={savedStatus}
                                    setSavedStatus={setSavedStatus}
                                    theme={theme}
                                />
                            )}

                            {/* Comparisons */}
                            {m.compare_listings && m.compare_listings.length > 0 && (
                                <div className="pl-12 space-y-3 overflow-x-auto">
                                    <span className="text-[11px] uppercase tracking-wider font-bold text-blue-500 flex items-center gap-1.5">
                                        <FiGrid className="w-3.5 h-3.5" /> Side-by-Side Comparison
                                    </span>
                                    <table className="min-w-full divide-y divide-gray-100 dark:divide-white/5 border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden bg-gray-50 dark:bg-dashboard-card text-xs">
                                        <thead>
                                            <tr className="bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold">
                                                <th className="px-3 py-2 text-left">Feature</th>
                                                {m.compare_listings.map((c) => (
                                                    <th key={c.id} className="px-3 py-2 text-left truncate max-w-[120px]">{c.title}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-semibold text-gray-800 dark:text-gray-200">
                                            <tr>
                                                <td className="px-3 py-2 text-gray-400">Price</td>
                                                {m.compare_listings.map(c => (
                                                    <td key={c.id} className="px-3 py-2 text-primary-600 dark:text-primary-400 font-extrabold">฿{c.price.toLocaleString()}</td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="px-3 py-2 text-gray-400">Size</td>
                                                {m.compare_listings.map(c => (
                                                    <td key={c.id} className="px-3 py-2">{c.area} sqm</td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="px-3 py-2 text-gray-400">Bed/Bath</td>
                                                {m.compare_listings.map(c => (
                                                    <td key={c.id} className="px-3 py-2">{c.bedrooms}B / {c.bathrooms}B</td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="px-3 py-2 text-gray-400">Transit</td>
                                                {m.compare_listings.map(c => (
                                                    <td key={c.id} className="px-3 py-2">{c.station_name ? `${c.distance_to_station}m to ${c.station_name}` : 'N/A'}</td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* CTA Box */}
                <div className="bg-gradient-to-r from-gray-900 to-black dark:from-neutral-900 dark:to-neutral-950 rounded-3xl p-8 border border-white/5 text-center text-white space-y-4 shadow-lg">
                    <h2 className="text-xl md:text-2xl font-bold">Find Your Next Property with AI</h2>
                    <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                        Chat naturally to discover listings by location, budget, transit stations, and filter by custom facilities instantly.
                    </p>
                    <button
                        onClick={handleContinueConversation}
                        className="px-8 py-3 bg-white text-gray-950 font-extrabold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 text-sm border-0 cursor-pointer"
                        style={{
                            color: '#000000',
                            backgroundColor: '#ffffff'
                        }}
                    >
                        Start Your Own Search
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SharedChatPage;
