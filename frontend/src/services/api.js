const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiCall = async (endpoint, options = {}) => {
    try {
        const token = localStorage.getItem('token');

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            ...options,
        };

        console.log('Making API call to:', `${API_BASE_URL}${endpoint}`);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Download file helper function
const downloadFile = async (endpoint, filename) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Download Error:', error);
        throw error;
    }
};

// ✅ ADDED: Users API - This was missing!
export const usersAPI = {
    // Get all users
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/users${queryString ? '?' + queryString : ''}`);
    },

    // Get user statistics
    getStats: () => apiCall('/users/stats'),

    // Get user by ID
    getById: (id) => apiCall(`/users/${id}`),

    // Create new user
    create: (userData) => apiCall('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),

    // Update user
    update: (id, userData) => apiCall(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    }),

    // Update user status
    updateStatus: (id, status) => apiCall(`/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    }),

    // Reset user password
    resetPassword: (id) => apiCall(`/users/${id}/reset-password`, {
        method: 'POST',
    }),

    // Delete user
    delete: (id) => apiCall(`/users/${id}`, {
        method: 'DELETE',
    }),

    // Get current user profile
    getProfile: () => apiCall('/users/profile'),

    // Update current user profile
    updateProfile: (profileData) => apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
    }),

    // Change password
    changePassword: (passwordData) => apiCall('/users/change-password', {
        method: 'POST',
        body: JSON.stringify(passwordData),
    }),

    // Test users endpoint
    test: () => apiCall('/users/test'),
};

// Authentication API
export const authAPI = {
    login: (credentials) => apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    logout: () => apiCall('/auth/logout', { method: 'POST' }),
    getCurrentUser: () => apiCall('/auth/me'),
    register: (userData) => apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),
    forgotPassword: (email) => apiCall('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    }),
    resetPassword: (token, password) => apiCall('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
    }),
};

// Equipment API
export const equipmentAPI = {
    getEquipment: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/equipment${queryString ? '?' + queryString : ''}`);
    },
    getEquipmentById: (id) => apiCall(`/equipment/${id}`),
    createEquipment: (data) => apiCall('/equipment', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateEquipment: (id, data) => apiCall(`/equipment/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteEquipment: (id) => apiCall(`/equipment/${id}`, {
        method: 'DELETE',
    }),
    getStats: () => apiCall('/equipment/stats'),
    testEquipment: () => apiCall('/equipment/test'),
};

// Bookings API
export const bookingsAPI = {
    getBookings: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/bookings${queryString ? '?' + queryString : ''}`);
    },
    getBookingById: (id) => apiCall(`/bookings/${id}`),
    createBooking: (data) => apiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateBooking: (id, data) => apiCall(`/bookings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteBooking: (id) => apiCall(`/bookings/${id}`, {
        method: 'DELETE',
    }),
    approveBooking: (id) => apiCall(`/bookings/${id}/approve`, {
        method: 'PATCH',
    }),
    rejectBooking: (id, reason) => apiCall(`/bookings/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
    }),
    getStats: () => apiCall('/bookings/stats'),
    testBookings: () => apiCall('/bookings/test'),
};

// Maintenance API
export const maintenanceAPI = {
    // Get all maintenance records
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/maintenance${queryString ? '?' + queryString : ''}`);
    },

    // Get maintenance statistics
    getStats: () => apiCall('/maintenance/stats/summary'),

    // Get maintenance by ID
    getById: (id) => apiCall(`/maintenance/${id}`),

    // Create new maintenance record
    create: (maintenanceData) => apiCall('/maintenance', {
        method: 'POST',
        body: JSON.stringify(maintenanceData),
    }),

    // Update maintenance record
    update: (id, maintenanceData) => apiCall(`/maintenance/${id}`, {
        method: 'PUT',
        body: JSON.stringify(maintenanceData),
    }),

    // Delete maintenance record
    delete: (id) => apiCall(`/maintenance/${id}`, {
        method: 'DELETE',
    }),

    // Get upcoming maintenance
    getUpcoming: (days = 7) => apiCall(`/maintenance/upcoming/week?days=${days}`),

    // Get overdue maintenance
    getOverdue: () => apiCall('/maintenance/overdue/list'),

    // Test maintenance endpoint
    test: () => apiCall('/maintenance/test'),
};

// Reports API
export const reportsAPI = {
    testConnection: () => apiCall('/reports/test'),
    getQuickStats: () => apiCall('/reports/quick-stats'),
    getPopularEquipment: (dateRange) =>
        apiCall(`/reports/popular-equipment?dateRange=${dateRange}`),
    getReports: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/reports${queryString ? '?' + queryString : ''}`);
    },
    getReportById: (id) => apiCall(`/reports/${id}`),
    generateReport: (reportData) => apiCall('/reports/generate', {
        method: 'POST',
        body: JSON.stringify(reportData),
    }),
    deleteReport: (id) => apiCall(`/reports/${id}`, {
        method: 'DELETE',
    }),
    downloadReport: (id, filename) => downloadFile(`/reports/download/${id}`, filename || `report_${id}.json`),
    getSchedules: () => apiCall('/reports/schedules/list'),
};

// Orders API
export const ordersAPI = {
    getOrders: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/orders${queryString ? '?' + queryString : ''}`);
    },
    getOrderById: (id) => apiCall(`/orders/${id}`),
    createOrder: (orderData) => apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
    }),
    updateOrder: (id, orderData) => apiCall(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(orderData),
    }),
    deleteOrder: (id) => apiCall(`/orders/${id}`, {
        method: 'DELETE',
    }),
    getOrderStats: () => apiCall('/orders/stats/summary'),
    testOrders: () => apiCall('/orders/test'),
};

// Dashboard API
export const dashboardAPI = {
    getOverview: () => apiCall('/dashboard/overview'),
    getRecentActivity: () => apiCall('/dashboard/recent-activity'),
    getStats: () => apiCall('/dashboard/stats'),
    getNotifications: () => apiCall('/dashboard/notifications'),
};

// Default export with all APIs
export default {
    users: usersAPI,
    auth: authAPI,
    equipment: equipmentAPI,
    bookings: bookingsAPI,
    maintenance: maintenanceAPI,
    reports: reportsAPI,
    orders: ordersAPI,
    dashboard: dashboardAPI,
};

// Named exports for convenience
export {
    API_BASE_URL,
    apiCall,
}; 