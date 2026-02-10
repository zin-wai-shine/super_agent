import React, { useState, useRef, useEffect } from 'react';
import { publicApi } from '../../services/api';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

/**
 * Floating chat widget for agent website. Uses public chat API (tenant from host).
 * Respects site theme via parent; uses existing design tokens.
 */
const ChatWidget = ({ theme }) => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const primaryColor = theme?.primaryColor || '#3b82f6';

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: text }]);
        setLoading(true);
        try {
            const res = await publicApi.postChat(text);
            const reply = res.data?.reply || 'Sorry, I could not get a reply.';
            setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again or contact the agent directly.' }]);
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
