import axios from 'axios'

// Create axios instance - Use full backend URL
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Changed this line
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
})

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error) // Add this for debugging
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Auth API functions
export const authAPI = {
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Network error' }
        }
    },

    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Network error' }
        }
    },

    getMe: async () => {
        try {
            const response = await api.get('/auth/me')
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Network error' }
        }
    },

    getProfile: async () => {
        try {
            const response = await api.get('/auth/profile')
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Network error' }
        }
    }
}

// Maintenance API functions
export const maintenanceAPI = {
    getAll: async () => {
        try {
            console.log('Fetching maintenance records...') // Debug log
            const response = await api.get('/maintenance')
            console.log('Maintenance response:', response.data) // Debug log
            return response.data
        } catch (error) {
            console.error('Maintenance fetch error:', error) // Debug log
            throw error.response?.data || { message: 'Network error' }
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/maintenance/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Network error' }
        }
    },

    create: async (maintenanceData) => {
        try {
            console.log('Creating maintenance:', maintenanceData) // Debug log
            const response = await api.post('/maintenance', maintenanceData)
            console.log('Create response:', response.data) // Debug log
            return response.data
        } catch (error) {
            console.error('Create error:', error) // Debug log
            throw error.response?.data || { message: 'Network error' }
        }
    },

    update: async (id, maintenanceData) => {
        try {
            const response = await api.put(`/maintenance/${id}`, maintenanceData)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Network error' }
        }
    },

    delete: async (id) => {
        try {
            const response = await api.delete(`/maintenance/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Network error' }
        }
    },

    getStats: async () => {
        try {
            console.log('Fetching maintenance stats...') // Debug log
            const response = await api.get('/maintenance/stats/summary')
            console.log('Stats response:', response.data) // Debug log
            return response.data
        } catch (error) {
            console.error('Stats fetch error:', error) // Debug log
            throw error.response?.data || { message: 'Network error' }
        }
    }
}// Reports API functions
export const reportsAPI = {
    // Get quick stats for dashboard
    getQuickStats: async () => {
        try {
            const response = await api.get('/reports/analytics/quick-stats')
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Network error' }
        }
    },

    // Get popular equipment data
    getPopularEquipment: async (dateRange = 'last30days') => {
        try {
            const response = await api.get(`/reports/analytics/popular-equipment?dateRange=${dateRange}`)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Network error' }
        }
    },

    // Generate report
    generateReport: async (reportData) => {
        try {
            const response = await api.post('/reports/generate', reportData)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Network error' }
        }
    },

    // Get all reports
    getReports: async (params = {}) => {
        try {
            const response = await api.get('/reports', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Network error' }
        }
    },

    // Get report by ID
    getReportById: async (id) => {
        try {
            const response = await api.get(`/reports/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Network error' }
        }
    },

    // Delete report
    deleteReport: async (id) => {
        try {
            const response = await api.delete(`/reports/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Network error' }
        }
    },

    // Get report schedules
    getSchedules: async () => {
        try {
            const response = await api.get('/reports/schedules/all')
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Network error' }
        }
    },

    // Create report schedule
    createSchedule: async (scheduleData) => {
        try {
            const response = await api.post('/reports/schedules', scheduleData)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Network error' }
        }
    },

    // Update report schedule
    updateSchedule: async (id, scheduleData) => {
        try {
            const response = await api.put(`/reports/schedules/${id}`, scheduleData)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Network error' }
        }
    },

    // Delete report schedule
    deleteSchedule: async (id) => {
        try {
            const response = await api.delete(`/reports/schedules/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Network error' }
        }
    }
}

export default api