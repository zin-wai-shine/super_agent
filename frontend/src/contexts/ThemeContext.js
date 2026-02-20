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
    menuBackgroundColor: '#111827',
    buttonGradient: false,
    buttonGradientColor2: '#34a853',
    shadowStyle: 'soft',
    shadowX: 0,
    shadowY: 4,
    shadowBlur: 4,
    shadowSpread: 0,
    shadowColor: '#000000',
    shadowOpacity: 25,
    buttonShadowX: 0,
    buttonShadowY: 4,
    buttonShadowBlur: 4,
    buttonShadowSpread: 0,
    buttonShadowColor: '#000000',
    buttonShadowOpacity: 25,
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
                    headerText: t.header_text ?? '',
                    footerText: t.footer_text ?? defaultTheme.footerText,
                    buttonRadius: t.button_radius || defaultTheme.buttonRadius,
                    cardRadius: t.card_radius || defaultTheme.cardRadius,
                    menuRadius: t.menu_radius || defaultTheme.menuRadius,
                    menuBackgroundColor: t.menu_background_color || defaultTheme.menuBackgroundColor,
                    buttonGradient: t.button_gradient || defaultTheme.buttonGradient,
                    buttonGradientColor2: t.button_gradient_color2 || defaultTheme.buttonGradientColor2,
                    shadowStyle: t.shadow_style || defaultTheme.shadowStyle,
                    shadowX: t.shadow_x ?? defaultTheme.shadowX,
                    shadowY: t.shadow_y ?? defaultTheme.shadowY,
                    shadowBlur: t.shadow_blur ?? defaultTheme.shadowBlur,
                    shadowSpread: t.shadow_spread ?? defaultTheme.shadowSpread,
                    shadowColor: t.shadow_color || defaultTheme.shadowColor,
                    shadowOpacity: t.shadow_opacity ?? defaultTheme.shadowOpacity,
                    buttonShadowX: t.button_shadow_x ?? defaultTheme.buttonShadowX,
                    buttonShadowY: t.button_shadow_y ?? defaultTheme.buttonShadowY,
                    buttonShadowBlur: t.button_shadow_blur ?? defaultTheme.buttonShadowBlur,
                    buttonShadowSpread: t.button_shadow_spread ?? defaultTheme.buttonShadowSpread,
                    buttonShadowColor: t.button_shadow_color || defaultTheme.buttonShadowColor,
                    buttonShadowOpacity: t.button_shadow_opacity ?? defaultTheme.buttonShadowOpacity,
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

    // Helper to determine text contrast
    const getBrightness = (hex) => {
        if (!hex) return 0;
        let color = hex.replace('#', '');
        if (color.length === 3) {
            color = color.split('').map(c => c + c).join('');
        }
        const r = parseInt(color.slice(0, 2), 16);
        const g = parseInt(color.slice(2, 4), 16);
        const b = parseInt(color.slice(4, 6), 16);
        return (r * 299 + g * 587 + b * 114) / 1000;
    };

    const hexToRgba = (hex, opacity) => {
        if (!hex) return 'rgba(0,0,0,0.25)';
        let color = hex.replace('#', '');
        if (color.length === 3) {
            color = color.split('').map(c => c + c).join('');
        }
        const r = parseInt(color.slice(0, 2), 16);
        const g = parseInt(color.slice(2, 4), 16);
        const b = parseInt(color.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
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
        document.documentElement.style.setProperty('--menu-bg-color', theme.menuBackgroundColor);

        // Adaptive Menu Colors
        const brightness = getBrightness(theme.menuBackgroundColor);
        const isMenuLight = brightness > 165;

        document.documentElement.style.setProperty('--menu-text-primary', isMenuLight ? '#111827' : '#FFFFFF');
        document.documentElement.style.setProperty('--menu-text-secondary', isMenuLight ? '#4B5563' : '#9CA3AF');
        document.documentElement.style.setProperty('--menu-text-muted', isMenuLight ? '#9CA3AF' : '#6B7280');
        document.documentElement.style.setProperty('--menu-border', isMenuLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)');
        document.documentElement.style.setProperty('--menu-hover-bg', isMenuLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)');
        document.documentElement.style.setProperty('--menu-divider', isMenuLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)');

        // Nav Bar Contrast
        const navBrightness = getBrightness(theme.primaryColor);
        const isNavLight = navBrightness > 165;
        document.documentElement.style.setProperty('--nav-text', isNavLight ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)');
        document.documentElement.style.setProperty('--nav-text-muted', isNavLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)');
        document.documentElement.style.setProperty('--nav-hover-bg', isNavLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)');
        document.documentElement.style.setProperty('--nav-border', isNavLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)');

        // Shadow Styles (Construct Figma-style strings)
        const shadowValue = `${theme.shadowX}px ${theme.shadowY}px ${theme.shadowBlur}px ${theme.shadowSpread}px ${hexToRgba(theme.shadowColor, theme.shadowOpacity)}`;
        document.documentElement.style.setProperty('--card-shadow', shadowValue);

        const btnShadowValue = `${theme.buttonShadowX}px ${theme.buttonShadowY}px ${theme.buttonShadowBlur}px ${theme.buttonShadowSpread}px ${hexToRgba(theme.buttonShadowColor, theme.buttonShadowOpacity)}`;
        document.documentElement.style.setProperty('--btn-shadow', btnShadowValue);

        // Button Gradient Logic
        document.documentElement.style.setProperty('--btn-gradient', theme.buttonGradient ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.buttonGradientColor2})` : 'none');

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
