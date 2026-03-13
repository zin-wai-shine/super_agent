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
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('public_theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        // Default to light mode for public site
        return false;
    });

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
    };

    useEffect(() => {
        localStorage.setItem('public_theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    return (
        <PublicDarkThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </PublicDarkThemeContext.Provider>
    );
};
