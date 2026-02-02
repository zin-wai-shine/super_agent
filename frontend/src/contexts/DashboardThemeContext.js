import React, { createContext, useContext, useState, useEffect } from 'react';

const DashboardThemeContext = createContext(null);

export const useDashboardTheme = () => {
    const context = useContext(DashboardThemeContext);
    if (!context) {
        throw new Error('useDashboardTheme must be used within a DashboardThemeProvider');
    }
    return context;
};

export const DashboardThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('dashboard_theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        // Default to light mode
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('dashboard_theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('dashboard_theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
    };

    return (
        <DashboardThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </DashboardThemeContext.Provider>
    );
};
