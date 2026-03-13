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
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong.</h1>
                    <pre className="bg-gray-100 p-4 rounded-lg text-sm text-left overflow-auto max-w-full">
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold"
                    >
                        Reload Page
                    </button>
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
