import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const TenantContext = createContext(null);

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
};

export const TenantProvider = ({ children }) => {
    const [tenantConfig, setTenantConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTenantConfig = async () => {
            const hostname = window.location.hostname;
            const mainDomain = process.env.REACT_APP_MAIN_DOMAIN || 'srv1534108.hstgr.cloud';
            const cacheKey = `tenantConfig_${hostname}`;

            try {
                // Use api instance so base URL and X-Tenant (for subdomain.superealestate.IP) are correct
                const apiUrl = api.defaults.baseURL;
                console.log('Fetching tenant config from:', apiUrl);
                const response = await api.get('/public/tenant/config', { timeout: 8000 });
                console.log('Tenant config received:', response.data);
                
                // Cache the config to prevent unnecessary reloads
                sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
                setTenantConfig(response.data);
            } catch (err) {
                console.error('Failed to fetch tenant configuration:', err);

                // If the error is a 404 (from our middleware), clear the cache as the agent is invalid/suspended
                if (err.response?.status === 404) {
                    sessionStorage.removeItem(cacheKey);
                }

                // Try to recover from cache ONLY if it wasn't a 404
                const cached = sessionStorage.getItem(cacheKey);
                if (cached && err.response?.status !== 404) {
                    console.log('Recovered tenant config from cache after API network failure');
                    setTenantConfig(JSON.parse(cached));
                    setLoading(false);
                    return;
                }

                setError(err);

                // Determine if it was probably the main domain based on hostname
                const devMainDomains = ['localhost', '127.0.0.1', 'superealestate.localhost', 'superealestate.test', 'superealestate.local'];
                const isProbablyMainLabel = hostname === mainDomain ||
                    hostname === 'www.' + mainDomain ||
                    devMainDomains.includes(hostname) ||
                    hostname === 'srv1534108.hstgr.cloud' ||
                    hostname === 'www.srv1534108.hstgr.cloud';

                console.log('API failed definitively, guessing tenant config from hostname:', { hostname, isProbablyMainLabel });
                setTenantConfig({ is_main_domain: isProbablyMainLabel, agent: null });
            } finally {
                setLoading(false);
            }
        };

        fetchTenantConfig();
    }, []);

    const value = {
        isMainDomain: tenantConfig?.is_main_domain ?? (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname === 'superealestate.localhost' ||
            window.location.hostname === 'superealestate.test' ||
            window.location.hostname === 'superealestate.local' ||
            window.location.hostname === 'srv1534108.hstgr.cloud' ||
            window.location.hostname === 'www.srv1534108.hstgr.cloud' ||
            window.location.hostname === (process.env.REACT_APP_MAIN_DOMAIN || 'srv1534108.hstgr.cloud') ||
            window.location.hostname === 'www.' + (process.env.REACT_APP_MAIN_DOMAIN || 'srv1534108.hstgr.cloud')
        ),
        agent: tenantConfig?.agent ?? null,
        actual_min_price: tenantConfig?.actual_min_price ?? 0,
        actual_max_price: tenantConfig?.actual_max_price ?? 5000000,
        loading,
        error
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <TenantContext.Provider value={value}>
            {children}
        </TenantContext.Provider>
    );
};
