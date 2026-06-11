import React, { createContext, useContext, useState, useEffect } from 'react';

const PublicDarkThemeContext = createContext(null);

export const usePublicDarkTheme = () => {
    const context = useContext(PublicDarkThemeContext);
    if (!context) {
        throw new Error('usePublicDarkTheme must be used within a PublicDarkThemeProvider');
    }
    return context;
};

export const PublicDarkThemeProvider = ({ children }) => {
    const [themeMode, setThemeModeState] = useState(() => {
        return localStorage.getItem('settings_theme_mode') || 'auto';
    });

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('settings_theme_mode') || 'auto';
        if (savedMode === 'dark') return true;
        if (savedMode === 'light') return false;
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const setThemeMode = (mode) => {
        setThemeModeState(mode);
        localStorage.setItem('settings_theme_mode', mode);
        
        if (mode === 'dark') {
            setIsDarkMode(true);
        } else if (mode === 'light') {
            setIsDarkMode(false);
        } else {
            // auto
            setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
    };

    // Listen to system preference changes when mode is 'auto'
    useEffect(() => {
        if (themeMode !== 'auto') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            setIsDarkMode(e.matches);
        };

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
        } else {
            mediaQuery.addListener(handleChange);
        }

        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleChange);
            } else {
                mediaQuery.removeListener(handleChange);
            }
        };
    }, [themeMode]);

    // Sync isDarkMode to public_theme for any other legacy dependencies
    useEffect(() => {
        localStorage.setItem('public_theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    // Backward compatibility helper
    const toggleTheme = () => {
        setThemeMode(isDarkMode ? 'light' : 'dark');
    };

    return (
        <PublicDarkThemeContext.Provider value={{ isDarkMode, themeMode, setThemeMode, toggleTheme }}>
            {children}
        </PublicDarkThemeContext.Provider>
    );
};


