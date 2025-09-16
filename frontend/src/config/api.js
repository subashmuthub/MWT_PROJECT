// frontend/src/config/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const apiConfig = {
    baseURL: API_BASE_URL,
    getHeaders: (token) => ({
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
    })
};

export const apiEndpoints = {
    equipment: `${API_BASE_URL}/api/equipment`,
    labs: `${API_BASE_URL}/api/labs`,
    auth: `${API_BASE_URL}/api/auth`
};