import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DashboardThemeProvider } from './contexts/DashboardThemeContext';
import { PublicDarkThemeProvider } from './contexts/PublicDarkThemeContext';
import './index.css';

// Suppress benign ResizeObserver loop error (browser quirk when layout triggers more resize callbacks in same frame)
const resizeObserverErr = (msg) => typeof msg === 'string' && msg.includes('ResizeObserver loop');
window.addEventListener('error', (e) => {
    if (resizeObserverErr(e.message)) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return true;
    }
}, true);
const prevOnError = window.onerror;
window.onerror = function (message, source, lineno, colno, error) {
    if (resizeObserverErr(message)) return true;
    return prevOnError ? prevOnError(message, source, lineno, colno, error) : false;
};
window.addEventListener('unhandledrejection', (e) => {
    const msg = e.reason?.message || e.reason?.toString?.() || '';
    if (typeof msg === 'string' && msg.includes('ResizeObserver loop')) {
        e.preventDefault();
        e.stopPropagation();
    }
}, true);

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("App Crash:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dashboard-dark p-6 text-center overflow-hidden relative">
                    {/* Background Decorations */}
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

                    <div className="relative z-10 w-full max-w-md animate-fade-up">
                        <div className="bg-white/80 dark:bg-dashboard-card/80 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-6">
                                <svg className="w-10 h-10 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Something went wrong</h1>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
                                We encountered an unexpected error. Our team has been notified. Please try reloading the page.
                            </p>

                            <div className="bg-gray-950/5 dark:bg-white/5 rounded-2xl p-4 mb-8">
                                <pre className="text-[11px] text-gray-600 dark:text-gray-400 font-mono text-left overflow-auto max-h-[120px] scrollbar-thin">
                                    {this.state.error?.toString() || 'Unknown runtime error'}
                                </pre>
                            </div>

                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-4 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] transition-all text-white font-bold rounded-full shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Reload Page
                            </button>
                        </div>

                        <div className="mt-8 text-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Error Protection Active</span>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <TenantProvider>
                    <AuthProvider>
                        <ThemeProvider>
                            <DashboardThemeProvider>
                                <PublicDarkThemeProvider>
                                    <App />
                                </PublicDarkThemeProvider>
                            </DashboardThemeProvider>
                        </ThemeProvider>
                    </AuthProvider>
                </TenantProvider>
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>
);
