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






























































































































































































































































































































































































































































































                                            </div>










































































































































































































































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
            console.error('Fai










































































































































































































































































































































































































































































































































































































































































































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

