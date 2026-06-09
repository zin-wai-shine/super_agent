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












































































                ))}
            </div>
        </div>
    );
};
const SidebarIcon = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
);
const NewChatComposeIcon = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
);
const SearchMagnifierIcon = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"






const SearchMagnifierIcon = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const PinBadgeIcon = ({ className }) => (
    <svg 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <line x1="12" x2="12" y1="17" y2="22" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-.44-1.24l-2.78-3.5A2 2 0 0 1 15 9.26V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4.26a2 2 0 0 1-.78 1.24l-2.78 3.5a2 2 0 0 0-.44 1.24Z" />
    </svg>
);

const ChatBubbleIcon = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const AIAssistant = () => {
    const { isAuthenticated, user } = useAuth();
    const { theme } = useTheme();
    const { agent } = useTenant();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
            if (lastUserMsg && lastUserMsg.content) {
                detectAndChangeLanguage(lastUserMsg.content);
            }
        }
    };
        { title: 'New Property Search', query: 'Show me condos near BTS Bangna budget 8,500 to 12,000' }
    const slugify = (text) => {
        if (!text) return 'chat';
        return text
            .toString()
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-\u00C0-\u017F\u0E00-\u0E7F\u1000-\u109F]+/g, '')
            .replace(/\-\-+/g, '-');
    };
                                </div>"""

range2_lines = range2_code.splitlines()

# Reconstruct all 1799 lines
reconstructed = []
offset = 1054  # Line 1502 in 1799-line version corresponds to Line 448 in 639-line version. (1502 - 448 = 1054)

for i in range(1, 1800):
    if 1054 <= i < 1054 + len(render_lines):
        reconstructed.append(render_lines[i - 1054])
    elif 1225 <= i < 1225 + len(range1_lines):
        reconstructed.append(range1_lines[i - 1225])
    elif 1441 <= i < 1441 + len(range2_lines):
        reconstructed.append(range2_lines[i - 1441])
    elif i in lines_dict:
        reconstructed.append(lines_dict[i])
    else:
        # Map to basic 639-line file viewport section
        basic_line_num = i - offset
        basic_idx = basic_line_num - 1
        if 0 <= basic_idx < len(basic_lines):
            reconstructed.append(basic_lines[basic_idx])
        else:
            reconstructed.append("")

with open(output_file, 'w', encoding='utf-8') as out:
    out.write('\n'.join(reconstructed) + '\n')

print("Fully and perfectly restored original AIAssistant.js!")

    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);
    const isFirstScrollRef = useRef(true);

    // Collapsible sidebar & Search state
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        return localStorage.getItem('bolt_haven_sidebar_collapsed') === 'true';
    });
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef(null);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(prev => {
                localStorage.setItem('bolt_haven_sidebar_collapsed', 'false');
                setTimeout(() => {
                    searchInputRef.current?.focus();
                }, 100);
    };

    const toggleSearch = () => {
        setIsSearchActive(prev => {
            const nextVal = !prev;
            if (!nextVal) {
                setSearchQuery('');
            } else {
                setIsSidebarCollapsed(false);
                localStorage.setItem('bolt_haven_sidebar_collapsed', 'false');
                setTimeout(() => {
                    searchInputRef.current?.focus();
                }, 100);
            }
            return nextVal;
        });
    };

    const handleSearchClickCollapsed = () => {
        setIsSidebarCollapsed(false);
        localStorage.setItem('bolt_haven_sidebar_collapsed', 'false');
        setIsSearchActive(true);
        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 100);
    };

    // Reset scroll behavior to instant on session switch or overlay toggle
    useEffect(() => {
        isFirstScrollRef.current = true;
    }, [currentSessionId, isOpen]);

    // Track previous non-chat path
    const previousPathRef = useRef('/');
    useEffect(() => {
        if (!location.pathname.startsWith('/chat')) {
            previousPathRef.current = location.pathname;
        }
    }, [location.pathname]);

    // Listen to custom open-ai-assistant event
    useEffect(() => {
        const handleOpen = () => {
            navigate('/chat');
        };
        window.addEventListener('open-ai-assistant', handleOpen);


























src/pages/Agent/FacilityManagement.js
  Line 14:5:    'ArrowsPointingOutIcon' is defined but never used  no-unused-vars
  Line 16:5:    'InboxIcon' is defined but never used              no-unused-vars
  Line 40:5:    'ChevronUpIcon' is defined but never used          no-unused-vars
  Line 41:5:    'ChevronDownIcon' is defined but never used        no-unused-vars
  Line 52:9:    'attributes' is assigned a value but never used    no-unused-vars
  Line 53:9:    'listeners' is assigned a value but never used     no-unused-vars
  Line 353:11:  'handleUpdate' is assigned a value but never used  no-unused-vars

src/pages/Agent/ProjectManagement.js
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
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        // Sort: pinned fi
                        const sorted = parsed.sort((a, b) => {
                  











                                const newSession = {
                                    id: routeSessionId,
                                    title: 'New Chat',
                                    messages: [defaultWelcomeMessage],
                                    preferences: {},
                                    updatedAt: Date.now()
                                };
                                const updated = [newSession, ...sorted];
                                setSessions(updated);
                                setCurrentSessionId(routeSessionId);
                                saveSessionsToStorage(updated);
                            }
                        } else {
                            setSessions(sorted);
                            setCurrentSessionId(sorted[0].id);
                        }
                        return;
                    }
                }
            } catch (err) {
                console.error('Failed to parse chat sessions from localStorage:', err);
            }
            
            // Fallback: Create a default fresh session
            const fallbackId = routeSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const newSession = {
                id: fallbackId,
                title: 'New Chat',
                messages: [defaultWelcomeMessage],
                preferences: {},
                updatedAt: Date.now()
            };
            setSessions([newSession]);
            setCurrentSessionId(fallbackId);
            saveSessionsToStorage([newSession]);
        };
        loadSessions();
    }, [storageKey]);

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
                            const sorted = sessionList.sort((a, b) => {
                                if (a.pinned && !b.pinned) return -1;
                                if (!a.pinned && b.pinned) return 1;
                                return (b.updatedAt || 0) - (a.updatedAt || 0);
                            });
                            setSessions(sorted);
                            setCurrentSessionId(routeId);
                        } else {
                            // If it doesn't exist at all, we can create a session with this ID!
                            const newSession = {
                                id: routeId,
                                title: 'New Chat',
                                messages: [defaultWelcomeMessage],
                                preferences: {},
                                updatedAt: Date.now()
                            };
                            const updated = [newSession, ...sessionList];
                            setSessions(updated);
                            setCurrentSessionId(routeId);
                            saveSessionsToStorage(updated);
                        }
                    }




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






















































                                            </span>
                                            <div className="space-y-1">
                                                {unpinnedSessions.map(renderSessionItem)}
                                            </div>
                                        </>
                                    )}
                                </div>"""

r1_lines = block_871_1224.splitlines()
r2_lines = block_1288_1440.splitlines()
r3_lines = block_1493_1501.splitlines()
range1_lines = range1_code.splitlines()
range2_lines = range2_code.splitlines()

# Reconstruct all 1799 lines
reconstructed = []
offset = 1054

for i in range(1, 1800):
    if 871 <= i < 871 + len(r1_lines):
        reconstructed.append(r1_lines[i - 871])
    elif 1054 <= i < 1054 + len(render_lines):
        reconstructed.append(render_lines[i - 1054])
    elif 1225 <= i < 1225 + len(range1_lines):
        reconstructed.append(range1_lines[i - 1225])
    elif 1288 <= i < 1288 + len(r2_lines):
        reconstructed.append(r2_lines[i - 1288])
    elif 1441 <= i < 1441 + len(range2_lines):
        reconstructed.append(range2_lines[i - 1441])
    elif 1493 <= i < 1493 + len(r3_lines):
        reconstructed.append(r3_lines[i - 1493])
    elif i in lines_dict:
        reconstructed.append(lines_dict[i])
    else:
        basic_line_num = i - offset
        basic_idx = basic_line_num - 1
        if 0 <= basic_idx < len(basic_lines):
            reconstructed.append(basic_lines[basic_idx])
        else:
            reconstructed.append("")

with open(output_file, 'w', encoding='utf-8') as out:
    out.write('\n'.join(reconstructed) + '\n')

print("Completely and perfectly restored AIAssistant.js!")

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
            preferences: {},
            updatedAt: Date.now()
        };
        
        const updatedSessions = [newSession, ...sessions];
        // Find if there is any existing session that has no user messages yet
        const existingEmptySession = sessions.find(s => 
            s.messages.filter(m => m.role === 'user').length === 0
        );

        if (existingEmptySession) {
            setInput('');
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
            console.error('Fai
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
               
                        onClick={() => handleSaveRename(s.id)
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








                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/5 hover:text-gray-955 dark:hover:text-white'}`}
            >
                <div className="truncate flex-1 min-w-0 flex items-center gap-3">
                    {isDefaultNewChat && (
                        <PiChatCircle className="w-[17px] h-[17px] text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    )}
                    <span className="truncate">{s.title}</span>
                </div>
                
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
                             >
                                 <button
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         handleShareSession(s);
                                         setActiveDropdownId(null);
                                     }}
                                     className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-150 text-gray-800 dark:text-gray-200 border-0 cursor-pointer rounded-[10px] font-normal"
                                 >
                                     <LuShare className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
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
        );
    };
        );
    };

    return (
        <>
            {/* FLOATING TRIGGER BUTTON */}
            {!isOpen && (
                <button


                            const active = sessions.find(s => s.id === currentSessionId);
                            const titleSlug = slugify(active?.title || 'New Chat');
                            navigate(`/chat/${currentSessionId}/${titleSlug}`);
                        } else {
                            navigate('/chat');
                        }
                    }}
                    className="fixed bottom-6 right-6 z-[250] flex items-center justify-center w-14 h-14 rounded-full text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 animate-bounce-subtle border border-white/10"
                    style={{
                        backgroundColor: theme.primaryColor || '#1a73e8',
                        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.15)`
                    }}
                >
                    <BsChatSquareDots className="w-6 h-6 animate-pulse" />
                    {/* Pulsing Ripple effect */}
                    <div className="absolute inset-0 rounded-full animate-ripple border-2" style={{ borderColor: theme.primaryColor || '#1a73e8' }}></div>
                </button>
            )}

            {/* TRULY FULL SCREEN CHAT INTERFACE */}
            <div
                className={`fixed inset-0 z-[260] transition-all duration-300 flex bg-white dark:bg-dashboard-dark
                    ${isOpen ? 'translate-y-0 opacity-100' : 'translate-







































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

















                                            >
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
                            <div className="absolute bottom-0 left-0 right-0 px-4 md:px-6 pb-6 pt-2 bg-gradient-to-t from-white via-white to-transparent dark:from-dashboard-dark dark:via-dashboard-dark to-transparent z-20 p








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
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-150 text-gray-800 dark:text-gray-200 border-0 cursor-pointer rounded-[10px] font-normal"
                                >
                                    <LuPin className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 rotate-45" />
                                    <span>{activeSessionObj.pinned ? 'Unpin chat' : 'Pin chat'}</span>
                                </button>
                                <hr className="my-1 border-gray-150 dark:border-white/10" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSession(e, activeSessionObj.id);
                                        setActiveDropdownId(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950/35 text-red-650 dark:text-red-400 transition-all duration-150 font-medium border-0 cursor-pointer rounded-[10px]"
                                >
                                    <FiTrash2 className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        );
                    })()
                )}


                {/* SEARCH MODAL OVERLAY */}
                {isSearchActive && (
                    <div 
                        className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
                        onClick={() => {
                            setIsSearchActive(false);
                            setSearchQuery('');
                        }}
                    >
                        <div 
                            className="bg-white dark:bg-dashboard-card border border-gray-200/80 dark:border-dashboard-border 





































































                                                            </div>
                                                            {lastMsgSnippet && (
                                                                <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5 max-w-[400px] font-normal">
                                                                    {lastMsgSnippet}
                                                                </div>
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


