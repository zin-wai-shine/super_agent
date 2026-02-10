import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ThemeContext = createContext(null);

const defaultTheme = {
    backgroundColor: '#f5f5f5',
    primaryColor: '#1E4ED8',
    secondaryColor: '#34a853',
    textColor: '#202124',
    fontFamily: 'Inter, sans-serif',
    logoUrl: '',
    headerText: 'Super Real Estate',
    footerText: '© 2024 Super Real Estate',
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(defaultTheme);
    const [loading, setLoading] = useState(true);

    // Check if running on agent subdomain and fetch their theme
    useEffect(() => {
        const fetchAgentTheme = async () => {
            try {
                // Try to get agent info from subdomain
                const response = await api.get('/public/agent/info');
                if (response.data?.theme) {
                    const t = response.data.theme;
                    setTheme({
                        backgroundColor: t.background_color || defaultTheme.backgroundColor,
                        primaryColor: t.primary_color || defaultTheme.primaryColor,
                        secondaryColor: t.secondary_color || defaultTheme.secondaryColor,
                        textColor: t.text_color || defaultTheme.textColor,
                        fontFamily: t.font_family || defaultTheme.fontFamily,
                        logoUrl: t.logo_url || '',
                        headerText: t.header_text || '',
                        footerText: t.footer_text || '',
                    });
                }
            } catch (err) {
                // Not on agent subdomain or no theme set, use default
            }
            setLoading(false);
        };
        fetchAgentTheme();
    }, []);

    // Apply theme to CSS variables
    useEffect(() => {
        document.documentElement.style.setProperty('--bg-color', theme.backgroundColor);
        document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
        document.documentElement.style.setProperty('--text-color', theme.textColor);
        document.documentElement.style.setProperty('--font-family', theme.fontFamily);
        document.body.style.backgroundColor = theme.backgroundColor;
    }, [theme]);

    const updateTheme = (newTheme) => {
        setTheme({ ...theme, ...newTheme });
    };

    const resetTheme = () => {
        setTheme(defaultTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, loading, updateTheme, resetTheme, defaultTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
