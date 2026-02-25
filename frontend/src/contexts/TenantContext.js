import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
            try {
                // Use dynamic API URL based on current host to support multi-tenant resolution
                // If we are on a subdomain (not localhost or main domain), we MUST use the current hostname
                // to ensure the backend receives the correct Host header for tenant resolution.
                const currentHost = window.location.hostname;
                const mainDomain = process.env.REACT_APP_MAIN_DOMAIN || 'superealestate.test';
                const isSubdomain = currentHost !== mainDomain && currentHost !== 'localhost' && currentHost !== '127.0.0.1';

                const apiUrl = (isSubdomain || !process.env.REACT_APP_API_URL)
                    ? `${window.location.protocol}//${currentHost}:8080/api`
                    : process.env.REACT_APP_API_URL;

                console.log('Fetching tenant config from:', apiUrl);
                const response = await axios.get(`${apiUrl}/public/tenant/config`, { timeout: 5000 });
                console.log('Tenant config received:', response.data);
                setTenantConfig(response.data);
            } catch (err) {
                console.error('Failed to fetch tenant configuration:', err);
                setError(err);

                // Smart fallback: guess if main domain based on hostname
                const hostname = window.location.hostname;
                const mainDomain = process.env.REACT_APP_MAIN_DOMAIN || 'superealestate.test';
                const isProbablyMain = hostname === mainDomain || hostname === 'localhost' || hostname === '127.0.0.1';

                console.log('API failed, guessing tenant config from hostname:', { hostname, isProbablyMain });
                setTenantConfig({ is_main_domain: isProbablyMain, agent: null });
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
            window.location.hostname === (process.env.REACT_APP_MAIN_DOMAIN || 'superealestate.test')
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
