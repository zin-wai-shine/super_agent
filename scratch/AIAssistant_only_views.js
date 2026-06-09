import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTenant } from '../../contexts/TenantContext';
import { publicApi } from '../../services/api';
import { saveListing, unsaveListing, checkIfSaved } from '../../services/savedListingsApi';
import { getMediaUrl } from '../../utils/media';
import ListingCard from '../Listings/ListingCard';
import Logo from '../Common/Logo';
import { toast } from 'react-hot-toast';
import {
    FiMessageSquare,
    FiSend,
    FiX,
    FiRefreshCw,
    FiShare2,
    FiHeart,
    FiChevronLeft,
    FiChevronRight,
    FiInfo,
    FiCalendar,
    FiMapPin,
    FiGrid,
    FiPlus,
    FiArrowLeft,
    FiActivity,
    FiSearch,
    FiTrash2,
    FiEdit,
    FiEdit2,
    FiCheck,
    FiMoreHorizontal
} from 'react-icons/fi';
import { BsChatSquareDots, BsHeartFill, BsHeart, BsPinAngle } from 'react-icons/bs';
import { LuShare, LuPencil, LuPin } from 'react-icons/lu';
import { PiChatCircle } from "react-icons/pi";


export const ListingsCarousel = ({ listings, title, icon, savedStatus, setSavedStatus, theme }) => {
    const scrollRef = useRef(null);
    const [showLeft, setShowLeft] = useState(false);


















































































































































































































































































































































        };

        window.addEventListener('reload-ai-assistant', handleReload);
        window.addEventListener('select-ai-assistant-session', handleSelect);
        return () => {
            window.removeEventListener('reload-ai-assistant', handleReload);
            window.removeEventListener('select-ai-assistant-session', handleSelect);
        };
    }, [storageKey, sessions, navigate]);

    // Save sessions helper
    const saveSessionsToStorage = (updatedSessions) => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(updatedSessions));
        } catch (err) {
            console.error('Failed to save chat sessions to localStorage:', err);
        }
    };

    // Load sessions from localStorage on mount and when userKey changes
    useEffect(() => {
        const loadSessions = () => {
            const pathParts = window.location.pathname.split('/');
            const routeSessionId = (pathParts[1] === 'chat' && pathParts[2]) ? pathParts[2] : null;

            try {
                const stored = localStorage.getItem(storageKey);
                if (stored) {
                    const parsed = JSON.parse(stored);
        window.addEventListener('select-ai-assistant-session', handleSelect);
        return () => {
            window.removeEventListener('reload-ai-assistant', handleReload);
            window.removeEventListener('select-ai-assistant-session', handleSelect);
        };
    }, [storageKey, sessions, navigate]);

    // Save sessions helper
    const saveSessionsToStorage = (updatedSessions) => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(updatedSessions));
        } catch (err) {
            console.error('Failed to save chat sessions to localStorage:', err);
        }
    };

    // Load sessions from localStorage on mount and when userKey changes
    useEffect(() => {
        const loadSessions = () => {
            const pathParts = window.location.pathname.split('/');
            const routeSessionId = (pathParts[1] === 'chat' && pathParts[2]) ? pathParts[2] : null;

            try {
                const stored = localStorage.getItem(storageKey);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        // Sort: pinned first, then by updatedAt descending
                        const sorted =
                            setCurrentSessionId(sorted[0].id);
                        }
                        return;
                    }
                }
            setCurrentSessionId(fallbackId);
            saveSessionsToStorage([newSession]);
        };
        loadSessions();
    }, [storageKey]);
        "1 bedroom room near BTS On Nut with washing machine",
    // Sync route with assistant visibility and current session
    useEffect(() => {
        const pathParts = location.pathname.split('/');
        // Path matches /chat or /chat/:id or /chat/:id/:name
        if (pathParts[1] === 'chat') {
            setIsOpen(true);
            const routeId = pathParts[2];
            if (routeId) {
                // If the route ID is different from current session, switch to it
                if (routeId !== currentSessionId) {
                    // Check if session exists in history
                    const exists = sessions.some(s => s.id === routeId);
                    if (exists) {
                        setCurrentSessionId(routeId);
                    } else {
                        // Check if we can load it from localStorage
                        let sessionList = [];
                        if (stored) {
                            try {
                                sessionList = JSON.parse(stored);
                            } catch (e) {}
                        }
                        const sessionExists = sessionList.some(s => s.id === routeId);
                        if (sessionExists) {
             
                    const exists = sessions.some(s => s.id === routeId);
                    if (exists) {
                        setCurrentSessionId(routeId);
                    } else {
                        // Check if we can load it from localStorage
                        let sessionList = [];
                        if (stored) {
                            try {
                                sessionList = JSON.parse(stored);
                            } catch (e) {}
                        }
                        const sessionExists = sessionList.some(s => s.id === routeId);
                        if (sessionExists) {
                            const sorted = sessionList.sort((a, b) => {
                                if (a.pinned && !b.pinned) return -1;
                                if (!a.pinned && b.pinned) return 1;
                                return (b.updatedAt || 0) - (a.updatedAt || 0);
                            });
                            setSessions(sorted);
                            setCurrentSessionId(routeId);
                    }
    const handleScroll = () => {
        const el = scrollRef.current;
        if (el) {
            setShowLeft(el.scrollLeft > 10);
                    }
                }
            } else {
                // Path is exactly /chat (no ID)
                // Open the assistant and navigate to the current or a new session
                if (currentSessionId) {
                    const active = sessions.find(s => s.id === currentSessionId);
                                            </div>
                    navigate(`/chat/${currentSessionId}/${titleSlug}`, { replace: true });
                } else {
                    const stored = localStorage.getItem(storageKey);
                    let sessionList = [];
                    if (stored) {
                        try {
                            sessionList = JSON.parse(stored);
                        } catch (e) {}
                    }
                    if (sessionList.length > 0) {
                        const first = sessionList[0];
                        const titleSlug = slugify(first.title);
                        navigate(`/chat/${first.id}/${titleSlug}`, { replace: true });
                    } else {
                        // Create a new session
                        const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                        const newSession = {
                            id: newId,
                            title: 'New Chat',
                            messages: [defaultWelcomeMessage],
                            preferences: {},
                            updatedAt: Date.now()
                    }
                    if (sessionList.length > 0) {
                        const first = sessionList[0];
                        const titleSlug = slugify(first.title);
                        navigate(`/chat/${first.id}/${titleSlug}`, { replace: true });
                    } else {
                        // Create a new session
                        const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                        const newSession = {
                            id: newId,
                            title: 'New Chat',
                            messages: [defaultWelcomeMessage],
                            preferences: {},
                            updatedAt: Date.now()
                        };
                        setSessions([newSession]);
                        setCurrentSessionId(newId);
                        saveSessionsToStorage([newSession]);
                        navigate(`/chat/${newId}/new-chat`, { replace: true });
                    }
                }
            }
        } else {
            // Path is not /chat, so close the assistant overlay
            setIsOpen(false);
        }
    }, [location.pathname, sessions, currentSessionId, navigate, storageKey]);

    // Focus input when overlay opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 150);
        }
    }, [isOpen]);

    // Derive active session values
    const activeSession = sessions.find(s => s.id === currentSessionId) || null;
    const messages = activeSession ? activeSession.messages : [];
    const activeSession = sessions.find(s => s.id === currentSessionId) || null;
    const messages = activeSession ? activeSession.messages : [];
    const preferences = activeSession ? activeSession.preferences : {};
    const pinnedSessions = sessions.filter(s => s.pinned);
    const unpinnedSessions = sessions.filter(s => !s.pinned);

    // Sync app language to active session query language
                    </button>
                </div>
            </div>

            {/* Scroll Container */}
            <div 
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x scroll-smooth"
            >
                {listings.map((l) => (
                    <div key={l.id} className="w-[280px] flex-shrink-0 snap-start bg-transparent">
                        <ListingCard
                            listing={l}
                            viewMode="grid"
                            showSave={true}
                            initialSaved={savedStatus[l.id]}
                            onSaveToggle={(isSaved) => {
                                setSavedStatus(prev => ({ ...prev, [l.id]: isSaved }));
                            }}
                        />
                    </div>

    // --- Render helpers ---
    const renderInputBox = () => {
        return (
            <div className="flex flex-col bg-white dark:bg-[#2f2f2f] rounded-[26px] border border-gray-200 dark:border-white/10 shadow-lg px-4 pt-3 pb-3 transition-all duration-200">
                    </button>
                </div>
            </div>

            {/* Scroll Container */}
            <div 
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x scroll-smooth"
            >
                {listings.map((l) => (
                    <div key={l.id} className="w-[280px] flex-shrink-0 snap-start bg-transparent">
                        <ListingCard
                            listing={l}
                            viewMode="grid"
                            showSave={true}
                            initialSaved={savedStatus[l.id]}
                            onSaveToggle={(isSaved) => {
                                setSavedStatus(prev => ({ ...prev, [l.id]: isSaved }));
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const AIAssistant = () => {
    const { isAuthenticated, user } = useAuth();
    const { theme } = useTheme();
    const { agent } = useTenant();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [preferences, setPreferences] = useState({});
    const [savedStatus, setSavedStatus] = useState({});
    const [historyList, setHistoryList] = useState([
        { title: 'New Property Search', query: 'Show me condos near BTS Bangna budget 8,500 to 12,000' }
    ]);
    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Auto-resize textarea height as content changes
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            // Set height based on scrollHeight, capped by css limits
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [input]);

    // Initial message on load
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    role: 'assistant',
                    content: `Hello! I am your AI Real Estate Assistant. 🏡\n\nI can help you search the property database using normal human language. You can say things l
        saveSessionsToStorage(remainingSessions);
        
        if (currentSessionId === sessionId) {
            if (remainingSessions.length > 0) {
                setCurrentSessionId(remainingSessions[0].id);
            } else {
                const newSession = {
                    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    title: 'New Chat',
                    messages: [defaultWelcomeMessage],
                    preferences: {},
                    updatedAt: Date.now()
                };
                setSessions([newSession]);
                setCurrentSessionId(newSession.id);
                saveSessionsToStorage([newSession]);
            }
        }
        
        toast.success('Chat deleted.');
    };

    const handleStartRename = (e, session) => {
        e.stopPropagation();
        setEditingSessionId(session.id);
        setEditingTitle(session.title);
    };

    const handleSaveRename = (sessionId) => {
        if (!editingTitle.trim()) return;
        
        setEditingTitle(session.title);
    };

    const handleSaveRename = (sessionId) => {
        if (!editingTitle.trim()) return;
        
        const updated = sessions.map(s => {
            if (s.id === sessionId) {
                return {
                    ...s,
                    title: editingTitle.trim(),
                    updatedAt: Date.now()
                };
            }
            return s;
        });
        
        const sorted = [...updated].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return (b.updatedAt || 0) - (a.updatedAt || 0);
        });
        setSessions(sorted);
        saveSessionsToStorage(sorted);
        setEditingSessionId(null);
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again in a few moments.'
            };
            updateActiveSession([...newMessages, errorMessage], preferences);
            toast.error('Could not connect to AI services.');
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = () => {
        // If the current active session has no user messages yet, just stay in it and focus the input
        const isCurrentSessionEmpty = activeSession && 
            activeSession.messages.filter(m => m.role === 'user').length === 0;

        if (isCurrentSessionEmpty) {
            setInput('');
            const titleSlug = slugify(activeSession?.title || 'New Chat');
            navigate(`/chat/${currentSessionId}/${titleSlug}`);
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 50);
            return;
        }

        const newSession = {
            id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: 'New Chat',
            messages: [defaultWelcomeMessage],
            preferences: {},
            updatedAt: Date.now()





        // Find if there is any existing session that has no user messages yet
        const existingEmptySession = sessions.find(s => 
            s.messages.filter(m => m.role === 'user').length === 0
        );

        if (existingEmptySession) {
            setInput('');
            setCurrentSessionId(existingEmptySession.id);
            const titleSlug = slugify(existingEmptySession.title || 'New Chat');
            navigate(`/chat/${existingEmptySession.id}/${titleSlug}`);
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 50);
            return;
        }

        const newSession = {
            id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: 'New Chat',
            messages: [defaultWelcomeMessage],
            preferences: {},
            updatedAt: Date.now()
        };
        
        const updatedSessions = [newSession, ...sessions];
        setSessions(updatedSessions);
        setCurrentSessionId(newSession.id);
        saveSessionsToStorage(updatedSessions);
        setInput('');
        navigate(`/chat/${newSession.id}/new-chat`);
        // Focus the textarea
        setTimeout(() => {
            textareaRef.current?.focus();
        }, 50);
    };

    const handleSelectSession = (sessionId) => {
        setEditingSessionId(null);
        setCurrentSessionId(sessionId);
        setInput('');
        const session = sessions.find(s => s.id === sessionId);
        const titleSlug = slugify(session?.title || 'New Chat');
        navigate(`/chat/${sessionId}/${titleSlug}`);
    };

    const handleTogglePinSession = (sessionId) => {
        const updated = sessions.map(s => {
            if (s.id === sessionId) {
                return {
                    ...s,
                    pinned: !s.pinned,
                    updatedAt: Date.now()
                };
            }
            return s;
        });
        
        const sorted = [...updated].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return (b.updatedAt || 0) - (a.updatedAt || 0);
        });

        setSessions(sorted);
        saveSessionsToStorage(sorted);
        
        const isPinnedNow = updated.find(s => s.id === sessionId)?.pinned;
        toast.success(isPinnedNow ? 'Chat pinned.' : 'Chat unpinned.');
    };

    const handleShareSession = async (session) => {
        try {
            const payload = {
                id: session.id,
                title: session.title,
                messages: JSON.stringify(session.messages)
            };

            await publicApi.saveSharedChat(payload);

            const shareUrl = `${window.location.origin}/shared-chat/${session.id}`;
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Share link copied to clipboard!');
        } catch (err) {
            consol
            toast.error('Failed to generate share link.');
        }
    };

    const handleDeleteSession = (e, sessionId) => {
        e.stopPropagation();
        
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        setSessions(remainingSessions);
        saveSessionsToStorage(remainingSessions);
        
        if (currentSessionId === sessionId) {
            if (remainingSessions.length > 0) {
                const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const newSession = {
                    id: newId,
                    title: 'New Chat',
                    messages: [defaultWelcomeMessage],
                    preferences: {},
                    updatedAt: Date.now()
                };
                const updated = [newSession];
                setSessions(updated);
                setCurrentSessionId(newId);
                saveSessionsToStorage(updated);
                navigate(`/chat/${newId}/new-chat`, { replace: true });
            }
        }
        
        toast.success('Chat deleted.');
    };

    const handleStartRename = (e, session) => {
        e.stopPropagation();
                        </div>

                        {/* New Chat Button */}
                        <div className="px-3 pt-3.5 pb-2">
                            <button
                                onClick={handleNewChat}
                                className="w-full flex items-center justify-start py-2.5 px-3.5 rounded-[8px] bg-gray-200/50 dark:bg-white/5 hover:bg-gray-200/80 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200 border-0 active:scale-[0.98] transition-all text-[13.5px] font-normal cursor-pointer"
                            >
                                <span>New Chat</span>
                            </button>
                        </div>

                        {/* Recent History List */}
                        <div className="px-3 pb-16 space-y-1 overflow-y-auto max-h-[60vh] custom-scrollbar-thin">
                            {pinnedSessions.length > 0 && (
                                <>
                                    {/* Pinned Section */}
                                    <span className="text-[14px] font-bold text-gray-955 dark:text-white px-3.5 block mb-2 mt-4 select-none">
                                        Pinned
                                    </span>
            return s;
        });
        
        const sorted = [...updated].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return (b.updatedAt || 0) - (a.updatedAt || 0);
        });
        setSessions(sorted);
        saveSessionsToStorage(sorted);
        setEditingSessionId(null);
        toast.success('Chat renamed.');

        if (sessionId === currentSessionId) {
            const titleSlug = slugify(editingTitle.trim());
            navigate(`/chat/${sessionId}/${titleSlug}`, { replace: true });
        }
    };

    const handleCancelRename = (e) => {
        e.stopPropagation();
        setEditingSessionId(null);
    };

    const handleSaveToggle = async (listingId) => {
        if (!isAuthenticated) {
            toast.error('Please sign in to save properties.');
            return;
        }
        const isSaved = savedStatus[listingId];
        try {
            if (isSaved) {
                await unsaveListing(listingId);
                setSavedStatus(prev => ({ ...prev, [listingId]: false }));
                toast.success('Property removed from favorites.');
            } else {
                await saveListing(listingId);
                setSavedStatus(prev => ({ ...prev, [listingId]: true }));
                toast.success('Property save
                                }}
                            >
                                <FiArrowLeft className="w-4 h-4 text-white" />
                                <span>Back to Site</span>
                            </button>
                        </div>
                                className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all active:rotate-180 duration-500"
                            >
                                <FiRefreshCw className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 px-5 py-2.5 text-white font-bold text-sm rounded-full shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] hover:brightness-105 border-0"
                                style={{
                                    backgroundColor: theme.primaryColor || '#1a73e8'
                                }}
                            >
                                <FiArrowLeft className="w-4 h-4 text-white" />
                                <span>Back to Site</span>
                            </button>
                        </div>
        updateDraft(bookingTemplate);
    };

    const resetChat = () => {
        const freshMessage = {
            role: 'assistant',
            content: `Let's start fresh! What kind of property are you searching for today? 🏡`
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

    const suggestedPrompts = [
        "Condos near BTS Bangna budget 8.5k to 12k",
        "1 bedroom room near BTS On Nut with washing machine",
        "Show me pet-friendly condos near BTS Asok",
        "I need a condo close to Mega Bangna"
    ];

    const getGreeting = () => {
        const hrs = new Date().getHours();
        const name = user?.first_name || '';
        const nameStr = name ? `, ${name}` : '';
        if (hrs < 12) return `Good morning${nameStr}`;
        if (hrs < 18) return `Good afternoon${nameStr}`;
        return `Good evening${nameStr}`;
    };

    const isInitialState = messages.filter(m => m.role === 'user').length === 0;

    const renderInputBox = () => {
        return (
            <div className="flex flex-col bg-white dark:bg-[#2f2f2f] rounded-[26px] border border-gray-200 dark:border-white/10 shadow-lg px-4 pt-3 pb-3 transition-all duration-200">
                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    <BsChatSquareDots className="w-6 h-6 animate-pulse" />
                    {/* Pulsing Ripple effect */}
                    <div className="absolute inset-0 rounded-full animate-ripple border-2" style={{ borderColor: theme.primaryColor || '#1a73e8' }}></div>
                </button>
            )}

            {/* TRULY FULL SCREEN CHAT INTERFACE */}
            <div
                className={`fixed inset-0 z-[260] transition-all duration-300 flex bg-white dark:bg-dashboard-dark
                    ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}
            >
                {/* 1. LEFT SIDEBAR (CHAT HISTORY PANEL - HIDDEN ON MOBILE) */}
                <div className="hidden md:flex flex-col w-64 bg-gray-50 text-gray-800 dark:bg-dashboard-card dark:text-gray-100 h-full border-r border-gray-200/80 dark:border-white/5 flex-shrink-0 justify-between">
                    <div>
                        {/* Sidebar Header Logo */}
                        <div className="py-1.5 px-5 border-b border-gray-200/60 dark:border-white/5 bg-gray-100/30 dark:bg-black/10">
                            <div className="flex items-center h-10 w-full">
                                {(agent?.theme?.logo_url || agent?.logo) ? (
                                    <div 
                                        className="h-10 w-full transition-all dur
                    style={{ width: isSidebarCollapsed ? '60px' : '288px' }}
                >
                    {/* COLLAPSED SIDEBAR CONTENT (THIN DOCK - w-[60px]) */}
                    <div 
                        className={`absolute inset-0 flex flex-col justify-between items-center py-4 select-none transition-all duration-300 ease-in-out ${
                            isSidebarCollapsed ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'
                        }`} 
                        style={{ width: '60px' }}
                    >
                        {/* Top Action Icons */}
                        <div className="flex flex-col items-center gap-4 w-full">
                            {/* Toggle Sidebar Button */}
                            <div className="relative group">
                                <button
                                    onClick={toggleSidebar}
                                    className="w-11 h-11 text-gray-500 hover:text-gray-955 dark:text-gray-400 dark:hover:text-white rounded-[12px] hover:bg-gray-200/80 dark:hover:bg-white/10 transition-all duration-200 border-0 bg-transparent cursor-pointer flex items-center justify-center"
                                >
                                    <SidebarIcon className="w-5 h-5" />
                                </button>













                    >
                        <FiCheck className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={handleCancelRename}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all"
                        title="Cancel"
                    >
                        <FiX className="w-3.5 h-3.5" />
                    </button>
                </div>
            );
        }

        return (
            <div
                key={s.id}
                onClick={() => handleSelectSession(s.id)}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-[8px] transition-all duration-300 text-[13.5px] text-left font-normal group cursor-pointer relative
                    ${currentSessionId === s.id 
                        ? 'bg-gray-200 dark:bg-white/10 text-gray-955 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/5 hover:text-gray-955 dark:hover:text-white'}`}
            >
                <div className="truncate flex-1 min-w-0 flex items-center gap-3">
                    {isDefaultNewChat && (

        const isDefaultNewChat = s.title === 'New Chat';
        const isPinned = s.pinned;
        const SessionIcon = isPinned ? LuPin : PiChatCircle;

        if (editingSessionId === s.id) {
            return (
                <div 
                    key={s.id} 
                    className="w-full flex items-center gap-3 px-3.5 py-1.5 rounded-[8px] bg-gray-200/80 dark:bg-white/10 border 
                    >
                        <FiX className="w-3.5 h-3.5" />
                    </button>
                </div>
            );
        }

                await unsaveListing(listingId);
                setSavedStatus(prev => ({ ...prev, [listingId]: false }));
                toast.success('Property removed from favorites.');
            } else {
                await saveListing(listingId);
                setSavedStatus(prev => ({ ...prev, [listingId]: true }));
                toast.success('Property saved to favorites!');
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/5 hover:text-gray-955 dark:hover:text-white'}`}
            >
                <div className="truncate flex-1 min-w-0 flex items-center gap-3">
                    {isDefaultNewChat && (
                        <PiChatCircle className="w-[17px] h-[17px] text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    )}
                    <span className="truncate">{s.title}</span>
                </div>
        navigator.clipboard.writeText(url);
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePinSession(s.id);
                        }}
                        className={`p-0.5 transition-colors duration-150 active:scale-90 flex-shrink-0 border-0 bg-transparent cursor-pointer
                            ${s.pinned 
                                ? 'flex text-gray-955 dark:text-white' 
                                : `text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white ${currentSessionId === s.id || activeDropdownId === s.id ? 'flex' : 'hidden group-hover:flex'}`
                            }`}
                        title={s.pinned ? "Unpin chat" : "Pin chat"}
                    >
                        <LuPin className="w-[17px] h-[17px] rotate-45" />
                    </button>

                    <div className="relative session-dropdown-container flex-shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (activeDropdownId === s.id) {
                                    setActiveDropdownId(null);
                                } else {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setDropdownCoords({
                                        top: rect.bottom + 6,
                                        left: rect.left - 12
                                    });
                                     <span>Share</span>
                                 </button>
                                 <button
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         handleStartRename(e, s);
                                         setActiveDropdownId(null);
                                     }}
                                     className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-150 text-gray-800 dark:text-gray-200 border-0 cursor-pointer rounded-[10px] font-normal"
                                 >
                                     <LuPencil className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                     <span>Rename</span>
                                 </button>
                                 <button
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         handleTogglePinSession(s.id);
                                         setActiveDropdownId(null);
                                     }}
                                     className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-150 text-gray-800 dark:text-gray-200 border-0 cursor-pointer rounded-[10px] font-normal"
                                 >
                                     <LuPin className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 rotate-45" />


                            const active = sessions.find(s => s.id === currentSessionId);
                            const titleSlug = slugify(active?.title || 'New Chat');
                            navigate(`/chat/${currentSessionId}/${titleSlug}`);
                        } else {
                            navigate('/chat');
                        }
                    }}
                                     className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950/35 text-red-600 dark:text-red-400 transition-all duration-150 font-medium border-0 cursor-pointer rounded-[10px]"
                                 >
                                     <FiTrash2 className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                                     <span>Delete</span>
                                 </button>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* FLOATING TRIGGER BUTTON */}
                                <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                    Open sidebar
                                </div>
                            </div>

                            {/* New Chat Button */}
                            <div className="relative group">
                                <button
                                    onClick={handle
                                >
                  
            {/* TRULY FULL SCREEN CHAT INTERFACE */}
            <div
                className={`fixed inset-0 z-[260] transition-all duration-300 flex bg-white dark:bg-dashboard-dark
                    ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}
                                        style={{
                                            backgroundImage: `url(${getMediaUrl(agent.theme?.logo_url || agent.logo)}?t=${theme.logoCacheBuster})`,
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'left center'
                                        }}
                                        title={agent.agency_name || agent.name || 'Agent Logo'}
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Logo className="w-8 h-8 text-primary-600 dark:text-primary-400" style={{ color: theme.primaryColor }} />
                                        <span className="text-lg font-black text-primary-600 dark:text-primary-400 uppercase tracking-tighter" style={{ color: theme.primaryColor }}>
                                            {agent?.subdomain || 'Agent'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

               




                                    <NewChatComposeIcon className="w-5 h-5" />
                                </button>
                                <div 
                                    className="absolute left-14 top-1/2 -translate-y-1/2 text-white text-[13px] font-semibold px-3 py-1.5 rounded-[8px] shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 backdrop-blur-sm"
                                    style={{ backgroundColor: 'rgba(34, 34, 34, 0.85)' }}
                                >
                                    New chat
                                </div>
                            </div>

                            {/* Search Button */}
                            <div className="relative group">
                                <button
                                    onClick={han
                                    className="w-11 h-11 text-gray-500 hover:text-gray-955 dark:text-gray-400 dark:hover:text-white rounded-[12px] hover:bg-gray-200/80 dark:hover:bg-white/10 transition-all duration-200 border-0 bg-transparent cursor-pointer flex items-center justify-center"
                                >
                                    <SearchMagnifierIcon className="w-5 h-5" />
                                </button>
                                <div 
                                    className="absolute left-14 top-1/2 -translate-y-1/2 text-white text-[13px] font-semibold px-3 py-1.5 rounded-[8px] shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 backdrop-blur-sm"
                                    style={{ backgroundColor: 'rgba(34, 34, 34, 0.85)' }}
                                >
                                    Search
                                </div>
                            </div>

                            <div className="w-9 h-9 rounded-full bg-orange-700/80 text-white flex items-center justify-center font-bold text-sm cursor-pointer select-none">
                                {user?.first_name ? user.first_name[0].toUpperCase() : 'G'}
                            </div>
                            <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-[#222222] text-white text-[13px] font-semibold px-3 py-1.5 rounded-[8px] shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                {user ? `${user.first_name || ''} ${user.last_name || ''}` : 'Guest User'}
                            </div>
                        </div>
                    </div>

                    {/* EXPANDED SIDEBAR CONTENT (FULL SIDEBAR - w-72) */}
                    <div 
                        className={`absolute inset-y-0 left-0 flex flex-col justify-between transition-all duration-300 ease-in-out ${
                            isSidebarCollapsed ? 'opacity-0 pointer-events-none translate-x-[-20px] scale-95' : 'opacity-100 pointer-events-auto translate-x-0 scale-100'
                        }`} 
                                >
                                    Pinned Chats
                                </div>
                            </div>

                            {/* Chat bubble icon */}
                            <div className="relative group">
                                <button
                                    onClick={() => {
                                        setIsSidebarCollapsed(false);
                                        localStorage.setItem('bolt_haven_sidebar_collapsed', 'false');
                                    }}
                                    className="w-11 h-11 text-gray-400 dark:text-gray-500 rounded-[12px] hover:text-gray-955 dark:hover:text-white hover:bg-gray-200/80 dark:hover:bg-white/10 transition-all duration-200 border-0 bg-transparent cursor-pointer flex items-center justify-center"
                                >
                                    <ChatBubbleIcon className="w-5 h-5" />
                                </button>
                                <div 
                                    className="absolute left-14 top-1/2 -translate-y-1/2 text-white text-[13px] font-semibold px-3 py-1.5 rounded-[8px] shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 backdrop-blur-sm"
                                    style={{ backgroundColor: 'rgba(34, 34, 34, 0.85)' }}
                                >
                                    Chats
                                </div>
                            </div>













                                        >
                                            <SearchMagnifierIcon className="w-5 h-5" />
                                        </button>
                                        {/* Collapse Sidebar Button */}
                                        <button
                                            onClick={toggleSidebar}
                                            className="w-11 h-11 text-gray-500 hover:text-gray-955 dark:text-gray-400 dark:hover:text-white rounded-[12px] hover:bg-gray-200/80 dark:hover:bg-white/10 border-0 bg-transparent cursor-pointer transition-all duration-200 flex items-center justify-center"
                                            title="Close sidebar"
                                        >
                                        BoltHaven
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {/* Search Toggle Button */}
                                        <button
                                            onClick={toggleSearch}
                                            className={`w-11 h-11 rounded-[12px] border-0 bg-transparent cursor-pointer transition-all duration-200 flex items-center justify-center
                                                ${isSearchActive 
                                                    ? 'text-primary-600 dark:text-primary-400 bg-gray-200/70 dark:bg-white/10' 
                                                    : 'text-gray-500 hover:text-gray-955 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/80 dark:hover:bg-white/10'}`}
                                            title="Search chats"
                                        >
                                            <SearchMagnifierIcon className="w-5 h-5" />
                                        </button>
                                        {/* Collapse Sidebar Button */}
                                        <button
                                            onClick={toggleSidebar}
                                            className="w-11 h-11 text-gray-500 hover:text-gray-955 dark:text
                                            {searchQuery && (
                                                <button 
                                                    onClick={() => setSearchQuery('')}
                                                    className="absolute right-2.5 text-gray-400 hover:text-gray-650 dark:hover:text-white bg-transparent border-0 cursor-pointer p-0.5 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-white/10"
                                                >
                                                    <FiX className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}


                                {/* New Chat Button */}
                                <div className="px-3 pt-3.5 pb-2 flex-shrink-0">
                                    <button
                                        onClick={handleNewChat}
                                        className="w-full flex items-center justify-start gap-3 py-2.5 px-3.5 rounded-[8px] bg-gray-200/50 dark:bg-white/5 hover:bg-gray-200/80 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200 border-0 active:scale-[0.98] transition-all text-[13.5px] font-normal cursor-pointer"
                                    >
                                        <NewChatComposeIcon className="w-[17px] h-[17px] text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span>New Chat</span>
                                    </button>
                                </div>

                                {/* Recent History List */}
                                <div className="px-3 pb-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar-thin">
                                    {pinnedSessions.length === 0 && unpinnedSessions.length === 0 && searchQuery && (
                                        <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-6 select-none animate-fade-in">
                                            No matches found
                                        </div>
                                    )}

                                    {pinnedSessions.length > 0 && (
                                        <>
                                            {/* Pinned Section */}
                                            <span className="text-[14px] font-bold text-gray-955 dark:text-white px-3.5 block mb-2 mt-4 select-none">
                                                Pinned
                                            </span>
                                            <div className="space-y-1">
                                                {pinnedSessions.map(renderSessionItem)}
                                            </div>
                                        </>
                                    )}
                                    {/* Chats Section */}
                                    {unpinnedSessions.length > 0 && (
                                        <>
                                            <span className={`text-[14px] font-bold text-gray-955 dark:text-white px-3.5 block mb-2 select-none ${pinnedSessions.length > 0 ? 'mt-6' : 'mt-4'}`}>
                                                Chats
                                            </span>
                                            <div className="space-y-1">
                                                {unpinnedSessions.map(renderSessionItem)}
                                            </div>
                                        </>
                                    <div className="px-3 pt-3 pb-1 flex-shrink-0">
                                        <div className="relative flex items-center w-full">
                                            <input 
                                                ref={searchInputRef}
                                                type="text" 
                                                value={searchQuery}
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                    <div className="w-9 h-9 rounded-full bg-orange-700/80 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 select-none">
                                        {user?.first_name ? user.first_name[0].toUpperCase() : 'G'}
                                    </div>
                                    <div className="flex flex-col truncate">
                                        <span className="text-[13.5px] font-bold text-gray-900 dark:text-white truncate">
                                            {user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Guest User'}
                                        </span>
                                        <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                            {user ? 'Personal account' : 'Free access'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 select-none">
                                    {!user && (
                                        <button 
                                            onClick={() => navigate('/login')}
                                            className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-150 text-white dark:text-gray-900 border-0 cursor-pointer active:scale-95 transition-all"










                                <div className="flex items-center gap-2 flex-shrink-0 select-none">
                                    {!user && (
                                        <button 
                                            onClick={() => navigate('/login')}
                                            className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-150 text-white dark:text-gray-900 border-0 cursor-pointer active:scale-95 transition-all"
                                        >
                                            Login
                                        </button>
                                    )}
                                    {user && (
                                        <button
                                            onClick={() => navigate('/profile')}
                                            className="px-2.5 py-1 text-[11px] font-bold text-gray-600 dark:text-gray-300 rounded-full border border-gray-300 dark:border-white/15 hover:bg-gray-200/50 dark:hover:bg-white/5 cursor-pointer active:scale-95 transition-all"
                                        >
                                            Upgrade
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. MAIN CONSOLE PANEL */}
                <div className="flex-1 flex flex-col h-full bg-white dark:bg-dashboard-dark relative overflow-hidden">
                    















                                        >
                                            Login
                                        </button>
                                    )}
                                    {user && (
                                        <button
                                            onClick={() => navigate('/profile')}
                                            className="px-2.5 py-1 text-[11px] font-bold text-gray-600 dark:text-gray-300 rounded-full border border-gray-300 dark:border-white/15 hover:bg-gray-200/50 dark:hover:bg-white/5 cursor-pointer active:scale-95 transition-all"
                                        >
                                            Upgrade
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. MAIN CONSOLE PANEL */}
                <div className="flex-1 flex flex-col h-full bg-white dark:bg-dashboard-dark relative overflow-hidden">
                    
                    {/* TOP STATUS BAR */}
                    <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 bg-transparent z-20 pointer-events-none">
                        {/* Left Side: Sidebar Toggle Button (Only visible when sidebar collapsed) */}
                        <div className="flex items-center gap-2 pointer-events-auto">
                            {isSidebarCollapsed && (
                                <div className="relative group">
                                    <button
                                        onClick={toggleSidebar}
                                        className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all duration-200 active:scale-95 border-0 bg-white/80 dark:bg-[#1e1e1e]/80 shadow-sm backdrop-blur-md cursor-pointer flex items-center justify-center h-9 w-9"
                                        title="Open sidebar"
                                    >
                                        <SidebarIcon className="w-4.5 h-4.5" />
                                    </button>
                                    <div className="absolute left-0 top-14 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                        Open sidebar
                         







                                    How can I help you with your property search today? 🏡
                                </p>
                                                </div>
                                            </div>

                                            {/* Interactive Listings Cards Grid */}
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

                                            {/* Alternatives Fallback Grid */}
                                            {m.alternatives && m.alternatives.length > 0 && (
                                                <ListingsCarousel
                                                    listings={m.alternatives}
                                                    title="Recommended Alternatives"
                                                    icon={<FiInfo className="w-3.5 h-3.5 text-yellow-500" />}

                                            {/* Interactive Listings Cards Grid */}
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

                                            {/* Alternatives Fallback Grid */}
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















                                                {/* Avatar */}
                                                <div className="flex-shrink-0">
                                                    {m.role === 'user' ? (
                                                        <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-xs">
                                                            {user?.first_name?.[0] || 'U'}
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

                                                {/* Bubble Text */}
                                                <div className="flex-1 space-y-1">
                                                    <span className="text-[11px] font-bold text-gray-400 block tracking-wider uppercase">
                                                        {m.role === 'user' ? 'You' : 'Assistant'}
                                                    </span>

















                                    <div
                                            >
                                                <Logo className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="bg-gray-50 dark:bg-dashboard-card dark:text-gray-200 px-4 py-2.5 rounded-full rounded-tl-none border border-gray-100 dark:border-white/5 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0s' }}></span>
                                                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                            </div>

                            {/* INPUT CONTROL AREA (CENTERED CHATGPT BOTTOM WRAPPER) */}
                            <div className="absolute bottom-0 left-0 right-0 px-4 md:px-6 pb-6 pt-2 bg-gradient-to-t from-white via-white to-transparent dark:from-dashboard-dar








                {/* Fixed Dropdown Menu (Rendered outside the sidebar container to avoid clipping) */}
                {activeDropdownId && (
                    (() => {
                        const activeSessionObj = sessions.find(s => s.id === activeDropdownId);
                        if (!activeSessionObj) return null;
                        return (
                            <div 
                                className="fixed w-48 bg-white dark:bg-[#2d2d2d] rounded-[16px] shadow-xl border border-gray-200/80 dark:border-white/10 p-1.5 z-[9999] text-gray-700 dark:text-gray-200 animate-fade-in"
                                style={{
                                    top: `${dropdownCoords.top}px`,
                                    left: `${dropdownCoords.left}px`
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={(e) => {
                                            <div className="bg-gray-50 dark:bg-dashboard-card dark:text-gray-200 px-4 py-2.5 rounded-full rounded-tl-none border border-gray-100 dark:border-white/5 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0s' }}></span>
                                                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-150 text-gray-800 dark:text-gray-200 border-0 cursor-pointer rounded-[10px] font-normal"
                                >
                                    <LuPencil className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <span>Rename</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTogglePinSession(activeSessionObj.id);
                                        setActiveDropdownId(null);
                                <div className="max-w-4xl mx-auto w-full pointer-events-auto">
                                    {renderInputBox()}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
                                            <span>Auto</span>
                                            <svg className="w-3.5 h-3.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                        <button
                                            onClick={() => handleSend()}
                                            disabled={!input.trim() || loading}
                                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex-shrink-0 bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </>
    );
};

export default AIAssistant;









































































                                                            </div>
                                                            {lastMsgSnippet && (
                                                                <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5 max-w-[400px] font-normal">
                                                                    {lastMsgSnippet}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 font-medium">
                                                        {formattedDate}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center text-sm text-gray-400 dark:text-gray-500 py-8 select-none">
                                            No chats found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AIAssistant;


    );
};

export default AIAssistant;



