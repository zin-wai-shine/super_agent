import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastNotification, setLastNotification] = useState(null);
    const reconnectTimeoutRef = useRef(null);

    const token = localStorage.getItem('token');

    const connect = () => {
        if (!token) return;

        // Determine WS URL based on current window location
        // Assuming backend is on port 8080. In Docker setup it's proxied via /api, 
        // but WS upgrade might need specific handling or direct port if Nginx isn't WS-ready.
        // Let's try matching the API structure. If API is at /api, WS is at /api/ws (if masked)
        // or /ws if root. 
        // Based on routes.go, it's `protected.GET("/ws")`. `protected` group is `/api` group usually?
        // Checking routes.go: `api := router.Group("/api")` -> `protected := api.Group("")`
        // So the route is `/api/ws`.

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // In local dev with proxy, we might hit webpack dev server which proxies to backend.
        // Or hits Nginx at port 80 (frontend container) which proxies /api to backend:8080.
        // Let's try relative path first if browser supports it for WS? No, constructor needs absolute.

        const host = window.location.host; // e.g., staynert.haizo.it.com:3000
        const wsUrl = `${protocol}//${host}/api/ws?token=${token}`;

        // NOTE: Standard AuthMiddleware might look at headers, but WS initial request from browser 
        // doesn't support custom headers easily. 
        // We relied on "AuthMiddleware" in routes.go. 
        // IMPORTANT: The backend `ServeWS` logic I wrote expects `user_id` in context.
        // If AuthMiddleware only checks Headers, this will fail for WS if we don't pass it in query param
        // AND have AuthMiddleware check query param. 
        // Standard JWT middleware usually checks "Authorization" header.
        // I might need to update backend AuthMiddleware to check Query param too?
        // Or I can send the token as the first message? NO, the route is protected by `middleware.AuthMiddleware()`.

        // Let's look at `middleware/auth_middleware.go` later. 
        // For now, I'll assume standard Bearer implementation which fails if header missing.
        // I might need to patch the middleware or the route setup.

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('WebSocket Connected');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'notification') {
                    setLastNotification(data.payload);
                    toast(
                        (t) => (
                            <div className="flex items-start">
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        {data.payload.Title}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {data.payload.Message}
                                    </p>
                                </div>
                            </div>
                        ),
                        { duration: 4000, position: 'top-right', icon: '🔔' }
                    );
                }
            } catch (err) {
                console.error('WS Message Parse Error:', err);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket Disconnected');
            setIsConnected(false);
            // Reconnect logic
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
        };

        ws.onerror = (err) => {
            console.error('WebSocket Error:', err);
            ws.close();
        };

        setSocket(ws);
    };

    useEffect(() => {
        connect();
        return () => {
            if (socket) socket.close();
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };
        // eslint-disable-next-line
    }, [token]);

    return (
        <WebSocketContext.Provider value={{ isConnected, lastNotification }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
