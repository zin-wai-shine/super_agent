import api from './api';

// No need for local createAuthRequest anymore, use the shared 'api' instance

export const saveListing = async (listingId) => {
    try {
        const response = await api.post('/saved-listings', { listing_id: listingId });
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw { error: 'Unauthorized', message: 'Your session has expired. Please login again.' };
        }
        throw error.response?.data || error;
    }
};

export const unsaveListing = async (listingId) => {
    try {
        const response = await api.delete(`/saved-listings/${listingId}`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw { error: 'Unauthorized', message: 'Your session has expired. Please login again.' };
        }
        throw error.response?.data || error;
    }
};

export const getSavedListings = async () => {
    try {
        const response = await api.get('/saved-listings');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const checkIfSaved = async (listingId) => {
    try {
        const response = await api.get(`/saved-listings/check/${listingId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
