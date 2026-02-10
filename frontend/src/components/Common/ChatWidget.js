import React, { useState, useRef, useEffect } from 'react';
import { publicApi } from '../../services/api';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

// Line-style bubble for Line button
const LineIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.039 1.085l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
);

/**
 * Floating chat widget for agent website. Single assistant button; when assistant
 * is unavailable, shows agent contact info with buttons in the chat panel.
 */
const ChatWidget = ({ theme }) => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [assistantUnavailable, setAssistantUnavailable] = useState(false);
    const [agentContact, setAgentContact] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch agent contact when panel opens (for fallback when assistant unavailable)
    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        const fetchAgent = async () => {
            try {
                const res = await publicApi.getAgentInfo();
                if (!cancelled && res.data) {
                    setAgentContact({
                        name: res.data.name || 'Agent',
                        phone: res.data.phone || '',
                        email: res.data.email || '',
                        line_url: res.data.line_url || '',
                    });
                }
            } catch (_) {
                if (!cancelled) setAgentContact({ name: 'Agent', phone: '', email: '' });
            }
        };
        fetchAgent();
        return () => { cancelled = true; };
    }, [open]);

    const primaryColor = theme?.primaryColor || '#1E4ED8';

    // Normalize Thai phone for WhatsApp/Viber: 0XXXXXXXX -> 66XXXXXXXX
    const normalizedPhone = (agentContact?.phone || '').replace(/\s/g, '').replace(/^0/, '66');
    const hasAnyContact = agentContact && (agentContact.phone || agentContact.email || agentContact.line_url);

    // Backend returns 200 with a reply when assistant is not enabled/unavailable
    const isAssistantUnavailableReply = (reply) => {
        if (!reply || typeof reply !== 'string') return false;
        const r = reply.toLowerCase();
        return (
            r.includes('not enabled') ||
            r.includes('contact the agent') ||
            r.includes('not available') ||
            r.includes('reached its limit') ||
            r.includes('email or call the agent')
        );
    };

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: text }]);
        setLoading(true);
        setAssistantUnavailable(false);
        try {
            const res = await publicApi.postChat(text);
            const reply = res.data?.reply || 'Sorry, I could not get a reply.';
            setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
            if (isAssistantUnavailableReply(reply)) {
                setAssistantUnavailable(true);
            }
        } catch (err) {
            setAssistantUnavailable(true);
            const fallback = 'The assistant is not available right now. Please use the contact options below to reach the agent.';
            setMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Toggle button */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ backgroundColor: primaryColor }}
                aria-label="Open chat"
            >
                <ChatBubbleLeftRightIcon className="w-7 h-7" />
            </button>

            {/* Panel */}
            {open && (
                <div className="fixed bottom-24 right-6 z-40 w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                    <div
                        className="px-4 py-3 flex items-center justify-between text-white rounded-t-2xl"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <span className="font-semibold">Chat with us</span>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="p-1 rounded-lg hover:bg-white/20"
                            aria-label="Close chat"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[320px] p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50">
                        {messages.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ask about properties or schedule a viewing. We reply quickly.</p>
                        )}
                        {assistantUnavailable && agentContact && (
                            <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 space-y-3">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">Contact {agentContact.name}</p>
                                {hasAnyContact ? (
                                    <div className="grid grid-cols-1 gap-2">
                                        {agentContact.line_url && (
                                            <a
                                                href={agentContact.line_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                <LineIcon />
                                                <span>Line</span>
                                            </a>
                                        )}
                                        {agentContact.phone && (
                                            <>
                                                <a
                                                    href={`tel:${agentContact.phone.replace(/\s/g, '')}`}
                                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90"
                                                    style={{ backgroundColor: primaryColor }}
                                                >
                                                    <PhoneIcon className="w-5 h-5" />
                                                    <span>Call Agent</span>
                                                </a>
                                                {normalizedPhone && (
                                                    <>
                                                        <a
                                                            href={`viber://chat?number=%2B${normalizedPhone}`}
                                                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90"
                                                            style={{ backgroundColor: primaryColor }}
                                                        >
                                                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                                            <span>Viber</span>
                                                        </a>
                                                        <a
                                                            href={`https://wa.me/${normalizedPhone}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90"
                                                            style={{ backgroundColor: primaryColor }}
                                                        >
                                                            <DevicePhoneMobileIcon className="w-5 h-5" />
                                                            <span>WhatsApp</span>
                                                        </a>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        {agentContact.email && (
                                            <a
                                                href={`mailto:${agentContact.email}`}
                                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                <EnvelopeIcon className="w-5 h-5" />
                                                <span>Email</span>
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">No contact details listed. Please try again later or visit the agent&apos;s site.</p>
                                )}
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                                        m.role === 'user'
                                            ? 'text-white'
                                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                                    }`}
                                    style={m.role === 'user' ? { backgroundColor: primaryColor } : {}}
                                >
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-500">
                                    ...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 input-field text-sm py-2"
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="p-2 rounded-lg text-white disabled:opacity-50"
                            style={{ backgroundColor: primaryColor }}
                            aria-label="Send"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
