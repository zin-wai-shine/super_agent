import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('access_token');
};

// Create axios instance with auth header
const createAuthRequest = () => {
    const token = getAuthToken();
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

// Save a listing
export const saveListing = async (listingId) => {
    const token = getAuthToken();
    if (!token) {
        throw { error: 'Unauthorized', message: 'Please login to save listings' };
    }

    try {
        const response = await axios.post(
            `${API_URL}/saved-listings`,
            { listing_id: listingId },
            createAuthRequest()
        );
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw { error: 'Unauthorized', message: 'Your session has expired. Please login again.' };
        }
        throw error.response?.data || error;
    }
};

// Unsave a listing
export const unsaveListing = async (listingId) => {
    const token = getAuthToken();
    if (!token) {
        throw { error: 'Unauthorized', message: 'Please login to save listings' };
    }

    try {
        const response = await axios.delete(
            `${API_URL}/saved-listings/${listingId}`,
            createAuthRequest()
        );
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw { error: 'Unauthorized', message: 'Your session has expired. Please login again.' };
        }
        throw error.response?.data || error;
    }
};

// Get all saved listings
export const getSavedListings = async () => {
    try {
        const response = await axios.get(
            `${API_URL}/saved-listings`,
            createAuthRequest()
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Check if a listing is saved
export const checkIfSaved = async (listingId) => {
    try {
        const response = await axios.get(
            `${API_URL}/saved-listings/check/${listingId}`,
            createAuthRequest()
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
