import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTenant } from './TenantContext';

const ThemeContext = createContext(null);

const defaultTheme = {
    backgroundColor: '#f5f5f5',
    primaryColor: '#2663EB',
    secondaryColor: '#34a853',
    textColor: '#202124',
    fontFamily: 'Inter, sans-serif',
    logoUrl: '',
    headerText: 'Super Real Estate',
    footerText: '© 2024 Super Real Estate',
    buttonRadius: '0.3rem',
    cardRadius: '0.3rem',
    menuRadius: '0.3rem',
    buttonGradient: false,
    shadowStyle: 'soft',
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const { agent, loading: tenantLoading } = useTenant();
    const [theme, setTheme] = useState(defaultTheme);

    useEffect(() => {
        if (!tenantLoading) {
            if (agent?.theme) {
                const t = agent.theme;
                setTheme({
                    backgroundColor: t.background_color || defaultTheme.backgroundColor,
                    primaryColor: t.primary_color || defaultTheme.primaryColor,
                    secondaryColor: t.secondary_color || defaultTheme.secondaryColor,
                    textColor: t.text_color || defaultTheme.textColor,
                    fontFamily: t.font_family || defaultTheme.fontFamily,
                    logoUrl: t.logo_url || '',
                    headerText: t.header_text || '',
                    footerText: t.footer_text || '',
                    buttonRadius: t.button_radius || defaultTheme.buttonRadius,
                    cardRadius: t.card_radius || defaultTheme.cardRadius,
                    menuRadius: t.menu_radius || defaultTheme.menuRadius,
                    buttonGradient: t.button_gradient || defaultTheme.buttonGradient,
                    shadowStyle: t.shadow_style || defaultTheme.shadowStyle,
                });
            } else {
                setTheme(defaultTheme);
            }
        }
    }, [agent, tenantLoading]);

    // Helper to ensure units
    const addUnits = (val) => {
        if (!val) return '0rem';
        if (typeof val === 'number') return `${val}rem`;
        if (val.match(/^[0-9.]+$/)) return `${val}rem`;
        return val;
    };

    // Apply theme to CSS variables
    useEffect(() => {
        document.documentElement.style.setProperty('--bg-color', theme.backgroundColor);
        document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
        document.documentElement.style.setProperty('--text-color', theme.textColor);
        document.documentElement.style.setProperty('--font-family', theme.fontFamily);

        // New Customizations
        document.documentElement.style.setProperty('--btn-radius', addUnits(theme.buttonRadius));
        document.documentElement.style.setProperty('--card-radius', addUnits(theme.cardRadius));
        document.documentElement.style.setProperty('--menu-radius', addUnits(theme.menuRadius));

        // Shadow Styles
        let shadowValue = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
        if (theme.shadowStyle === 'hard') shadowValue = '4px 4px 0px 0px rgba(0,0,0,1)';
        if (theme.shadowStyle === 'none') shadowValue = 'none';
        document.documentElement.style.setProperty('--card-shadow', shadowValue);

        // Button Gradient Logic (Handled in components usually, but set var for global usage)
        document.documentElement.style.setProperty('--btn-gradient', theme.buttonGradient ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` : 'none');

        document.body.style.backgroundColor = theme.backgroundColor;
    }, [theme]);

    const updateTheme = (newTheme) => {
        setTheme({ ...theme, ...newTheme });
    };

    const resetTheme = () => {
        setTheme(defaultTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, loading: tenantLoading, updateTheme, resetTheme, defaultTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
