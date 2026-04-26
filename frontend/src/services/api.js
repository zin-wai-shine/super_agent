import axios from 'axios';

const mainDomain = process.env.REACT_APP_MAIN_DOMAIN || 'srv1534108.hstgr.cloud';
const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
const isProbablySubdomain = currentHostname !== mainDomain && currentHostname !== 'localhost' && currentHostname !== '127.0.0.1' && !currentHostname.endsWith('.localhost');

// When hostname is subdomain.superealestate.<IP>, browser can't resolve it on mobile.
// Use the IP for connections and send subdomain in X-Tenant so backend can resolve tenant.
const mainDomainBase = mainDomain.indexOf('.') > 0 ? mainDomain.split('.')[0] : mainDomain;
const subdomainIpMatch = currentHostname.match(new RegExp(`^(.+)\\.${mainDomainBase}\\.(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})$`));
const apiHost = subdomainIpMatch ? subdomainIpMatch[2] : currentHostname;
const tenantSubdomainForIp = subdomainIpMatch ? subdomainIpMatch[1] : null;

export const API_URL = process.env.REACT_APP_API_URL ||
    ((typeof window !== 'undefined' && window.location.port === '3000')
        ? `${typeof window !== 'undefined' ? window.location.protocol : 'http:'}//${apiHost}:8080/api`
        : '/api');

export const BASE_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Detect subdomain from hostname (e.g. staynert.srv1534108.hstgr.cloud → staynert)
const getSubdomainFromCustomDomain = () => {
    if (typeof window === 'undefined') return null;
    const hostname = window.location.hostname;
    const domain = mainDomain;
    let sub = null;

    if (hostname.endsWith('.' + domain)) {
        sub = hostname.slice(0, -(domain.length + 1));
    } else if (hostname.endsWith('.srv1534108.hstgr.cloud')) {
        sub = hostname.slice(0, -13);
    } else if (hostname.endsWith('.superealestate.localhost')) {
        sub = hostname.slice(0, -25);
    } else if (hostname.endsWith('.superealestate.test')) {
        sub = hostname.slice(0, -20);
    } else if (hostname.endsWith('.superealestate.local')) {
        sub = hostname.slice(0, -21);
    } else if (hostname.endsWith('.localhost') && hostname !== 'localhost') {
        sub = hostname.slice(0, -10);
    }

    // Handle nested subdomains (e.g., staynert.project.localhost -> staynert)
    if (sub && sub.includes('.')) {
        sub = sub.split('.')[0];
    }

    if (sub && sub !== 'www' && sub !== 'api') return sub;
    return null;
};

const detectedSubdomain = tenantSubdomainForIp || getSubdomainFromCustomDomain();

// Request interceptor: auth token + X-Tenant for subdomain/IP/custom-domain access
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (detectedSubdomain) {
            config.headers['X-Tenant'] = detectedSubdomain;
        } else if (typeof window !== 'undefined' && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(window.location.hostname)) {
            const tenant = new URLSearchParams(window.location.search).get('tenant');
            if (tenant) config.headers['X-Tenant'] = tenant;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_URL}/auth/refresh`, {
                        refresh_token: refreshToken,
                    });

                    const { access_token } = response.data;
                    localStorage.setItem('access_token', access_token);

                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Only clear tokens and redirect if the refresh failed with 401 or 400 (invalid token)
                    if (refreshError.response?.status === 401 || refreshError.response?.status === 400) {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;

// Auth API
export const authApi = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (data) => api.post('/auth/register', data),
    refresh: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
    getProfile: () => api.get('/me'),
    updateProfile: (data) => api.put('/me', data),
    changePassword: (currentPassword, newPassword) =>
        api.put('/me/password', { current_password: currentPassword, new_password: newPassword }),
};

// Public API
export const publicApi = {
    getListings: (params) => api.get('/public/listings', { params }),
    getProjects: (params) => api.get('/public/projects', { params }),
    getDevelopers: (params) => api.get('/public/developers', { params }),
    getListing: (id, params) => api.get(`/public/listings/${id}`, { params }),
    getStations: (params) => api.get('/public/stations', { params }),
    getListingsByStation: (stationId) => api.get(`/public/listings/by-station/${stationId}`),
    getAgentInfo: (params) => api.get('/public/agent/info', { params }),
    getPublicBanners: (params) => api.get('/public/banners', { params }),
    getPublicBanner: (id) => api.get(`/public/banners/${id}`),
    getPlans: () => api.get('/public/plans'),
};

// Agent API
export const agentApi = {
    getDashboard: () => api.get('/agent/dashboard'),
    getListings: (params) => api.get('/agent/listings', { params }),
    getListing: (id) => api.get(`/agent/listings/${id}`),
    createListing: (data) => api.post('/agent/listings', data),
    updateListing: (id, data) => api.put(`/agent/listings/${id}`, data),
    deleteListing: (id) => api.delete(`/agent/listings/${id}`),
    publishListing: (id) => api.post(`/agent/listings/${id}/publish`),
    unpublishListing: (id) => api.post(`/agent/listings/${id}/unpublish`),
    getSubAgents: () => api.get('/agent/sub-agents'),
    createSubAgent: (data) => api.post('/agent/sub-agents', data),
    updateSubAgent: (id, data) => api.put(`/agent/sub-agents/${id}`, data),
    deleteSubAgent: (id) => api.delete(`/agent/sub-agents/${id}`),
    getUsers: () => api.get('/agent/users'),
    toggleUserStatus: (id) => api.put(`/agent/users/${id}/toggle`),
    deleteUser: (id) => api.delete(`/agent/users/${id}`),
    getTheme: () => api.get('/agent/theme'),
    updateTheme: (data) => api.put('/agent/theme', data),
    getSettings: () => api.get('/agent/settings'),
    updateSettings: (data) => api.put('/agent/settings', data),
    uploadLogo: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload/logo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    uploadBanner: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload/banner', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

// Developer & Project API
export const developerApi = {
    getDevelopers: () => api.get('/agent/developers'),
    createDeveloper: (data) => api.post('/agent/developers', data),
    updateDeveloper: (id, data) => api.put(`/agent/developers/${id}`, data),
    deleteDeveloper: (id) => api.delete(`/agent/developers/${id}`),
    getProjects: (params) => api.get('/agent/projects', { params }),
    createProject: (data) => api.post('/agent/projects', data),
    updateProject: (id, data) => api.put(`/agent/projects/${id}`, data),
    deleteProject: (id) => api.delete(`/agent/projects/${id}`),
};

// Super Admin API
export const adminApi = {
    getStats: () => api.get('/admin/stats'),
    getAgents: (params) => api.get('/admin/agents', { params }),
    getAgent: (id) => api.get(`/admin/agents/${id}`),
    createAgent: (data) => api.post('/admin/agents', data),
    updateAgent: (id, data) => api.put(`/admin/agents/${id}`, data),
    deleteAgent: (id) => api.delete(`/admin/agents/${id}`),
    suspendAgent: (id) => api.post(`/admin/agents/${id}/suspend`),
    activateAgent: (id) => api.post(`/admin/agents/${id}/activate`),
    getPlans: () => api.get('/admin/plans'),
    createPlan: (data) => api.post('/admin/plans', data),
    updatePlan: (id, data) => api.put(`/admin/plans/${id}`, data),
    deletePlan: (id) => api.delete(`/admin/plans/${id}`),
    getUsers: (params) => api.get('/admin/users', { params }),
};

// Photo room types for listing photos — Bedroom first, then Living Room, then rest (display & count order)
export const PHOTO_ROOM_TYPES = [
    'Bedroom',
    'Living Room',
    'Dining Area',
    'Shared Full Bathroom',
    'Laundry area',
    'Exterior',
    'Additional Photos',
];

// Upload API
export const uploadApi = {
    uploadImage: (listingId, file, options = {}) => {
        const { caption = '', roomType = 'Additional Photos' } = typeof options === 'string' ? { caption: options } : options;
        const formData = new FormData();
        formData.append('listing_id', listingId);
        formData.append('file', file);
        formData.append('caption', caption);
        formData.append('room_type', roomType);
        return api.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    uploadCollectionImage: (collectionId, file) => {
        const formData = new FormData();
        formData.append('collection_id', collectionId);
        formData.append('file', file);
        return api.post('/upload/collection-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    uploadVideo: (listingId, file, caption = '') => {
        const formData = new FormData();
        formData.append('listing_id', listingId);
        formData.append('file', file);
        formData.append('caption', caption);
        return api.post('/upload/video', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    updateMedia: (id, data) => api.patch(`/upload/${id}`, data),
    deleteMedia: (id) => api.delete(`/upload/${id}`),
    uploadAvatar: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

// Notification API
export const notificationApi = {
    getMyNotifications: () => api.get('/notifications'),
    getSentNotifications: () => api.get('/notifications/sent'),
    createNotification: (data) => api.post('/notifications', data),
    markRead: (id) => api.post(`/notifications/${id}/read`),
};

// Banner API
export const bannerApi = {
    getBanners: (params) => api.get('/banners', { params }), // params can include target_role, agent_id
    getBanner: (id) => api.get(`/banners/${id}`),
    createBanner: (data) => api.post('/banners', data),
    updateBanner: (id, data) => api.put(`/banners/${id}`, data),
    deleteBanner: (id) => api.delete(`/banners/${id}`),
};

// Appointment API
export const appointmentApi = {
    // Public (no auth required)
    getAvailableSlots: (params) => api.get('/public/appointments/slots', { params }),
    softLockSlot: (data) => api.post('/public/appointments/lock', data),
    createAppointment: (data) => api.post('/public/appointments', data),
    // Protected (User)
    getMyAppointments: () => api.get('/appointments/my'),
    cancelAppointment: (id, data) => api.post(`/appointments/${id}/cancel`, data),
    // Agent
    getAppointments: (params) => api.get('/agent/appointments', { params }),
    getAppointment: (id) => api.get(`/agent/appointments/${id}`),
    updateAppointment: (id, data) => api.put(`/agent/appointments/${id}`, data),
    deleteAppointment: (id) => api.delete(`/agent/appointments/${id}`),
    // Admin
    getAllAppointments: (params) => api.get('/admin/appointments', { params }),
    getAppointmentStats: () => api.get('/admin/appointment-stats'),
};

// Collection API
export const collectionApi = {
    // Public
    getPublicCollections: (params) => api.get('/public/collections', { params }),
    getPublicCollection: (id) => api.get(`/public/collections/${id}`),
    // Agent
    getCollections: (params) => api.get('/agent/collections', { params }),
    getCollection: (id) => api.get(`/agent/collections/${id}`),
    createCollection: (data) => api.post('/agent/collections', data),
    updateCollection: (id, data) => api.put(`/agent/collections/${id}`, data),
    deleteCollection: (id) => api.delete(`/agent/collections/${id}`),
    addListing: (colId, listingId) => api.post(`/agent/collections/${colId}/listings/${listingId}`),
    removeListing: (colId, listingId) => api.delete(`/agent/collections/${colId}/listings/${listingId}`),
};
