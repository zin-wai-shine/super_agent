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
            console.log('Fetching tenant config from:', process.env.REACT_APP_API_URL || 'http://localhost:8080/api');
            try {
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
                const response = await axios.get(`${apiUrl}/public/tenant/config`, { timeout: 5000 });
                console.log('Tenant config received:', response.data);
                setTenantConfig(response.data);
            } catch (err) {
                console.error('Failed to fetch tenant configuration:', err);
                setError(err);
                // Fallback to main domain defaults if API is down
                setTenantConfig({ is_main_domain: true, agent: null });
            } finally {
                setLoading(false);
            }
        };

        fetchTenantConfig();
    }, []);

    const value = {
        isMainDomain: tenantConfig?.is_main_domain ?? true,
        agent: tenantConfig?.agent ?? null,
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
