// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalLabs: 0,
        totalEquipment: 0,
        totalBookings: 0,
        activeBookings: 0,
        totalOrders: 0,
        pendingOrders: 0
    })
    const [recentLabs, setRecentLabs] = useState([])
    const [recentOrders, setRecentOrders] = useState([])
    const [systemStatus, setSystemStatus] = useState({
        server: 'checking',
        database: 'checking',
        lastBackup: null
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const { user, token, logout } = useAuth()
    const navigate = useNavigate()
    const API_BASE_URL = '/api'

    // Quick Actions with proper navigation
    const quickActions = [
        {
            title: 'Lab Management',
            description: 'Manage laboratories and facilities',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
            ),
            bgColor: "bg-blue-100",
            textColor: "text-blue-600",
            onClick: () => handleNavigation('/lab-management'),
            show: true
        },
        {
            title: 'Equipment Inventory',
            description: 'View and manage equipment',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
            ),
            bgColor: "bg-green-100",
            textColor: "text-green-600",
            onClick: () => handleNavigation('/equipment'),
            show: true
        },
        {
            title: 'Bookings',
            description: 'Manage lab bookings',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
            ),
            bgColor: "bg-purple-100",
            textColor: "text-purple-600",
            onClick: () => handleNavigation('/bookings'),
            show: true
        },
        {
            title: 'Order Management',
            description: 'Manage equipment orders (Admin Only)',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
            ),
            bgColor: "bg-cyan-100",
            textColor: "text-cyan-600",
            onClick: () => handleNavigation('/orders'),
            show: user?.role === 'admin'
        },
        {
            title: 'User Management',
            description: 'Manage system users',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
            ),
            bgColor: "bg-indigo-100",
            textColor: "text-indigo-600",
            onClick: () => handleNavigation('/users'),
            show: user?.role === 'admin'
        },
        {
            title: 'Reports',
            description: 'View analytics and reports',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
            ),
            bgColor: "bg-orange-100",
            textColor: "text-orange-600",
            onClick: () => handleNavigation('/reports'),
            show: user?.role === 'admin'
        },
        {
            title: 'Maintenance',
            description: 'Schedule maintenance tasks',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
            ),
            bgColor: "bg-gray-100",
            textColor: "text-gray-600",
            onClick: () => handleNavigation('/maintenance'),
            show: user?.role === 'admin' || user?.role === 'lab_technician'
        }
    ]

    // Navigation handler with error handling
    const handleNavigation = (path) => {
        try {
            console.log('Navigating to:', path)
            navigate(path)
        } catch (error) {
            console.error('Navigation error:', error)
            setError(`Failed to navigate to ${path}`)
        }
    }

    // Check system status
    const checkSystemStatus = async () => {
        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }

            // Check server health
            const healthResponse = await fetch(`${API_BASE_URL}/health`, { headers })
            const serverStatus = healthResponse.ok ? 'online' : 'offline'

            // Check database connection (through a simple API call)
            let databaseStatus = 'offline'
            try {
                const dbResponse = await fetch(`${API_BASE_URL}/labs/test/connection`, { headers })
                databaseStatus = dbResponse.ok ? 'connected' : 'disconnected'
            } catch {
                databaseStatus = 'disconnected'
            }

            setSystemStatus({
                server: serverStatus,
                database: databaseStatus,
                lastBackup: new Date().toISOString() // This would come from your backup service
            })
        } catch (error) {
            console.error('Error checking system status:', error)
            setSystemStatus({
                server: 'error',
                database: 'error',
                lastBackup: null
            })
        }
    }

    // Fetch all statistics from backend
    const fetchStats = async () => {
        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }

            // Initialize stats
            const newStats = {
                totalLabs: 0,
                totalEquipment: 0,
                totalBookings: 0,
                activeBookings: 0,
                totalOrders: 0,
                pendingOrders: 0
            }

            // Fetch lab stats
            try {
                const labStatsResponse = await fetch(`${API_BASE_URL}/labs/stats/dashboard`, { headers })
                if (labStatsResponse.ok) {
                    const labStatsResult = await labStatsResponse.json()
                    if (labStatsResult.success) {
                        newStats.totalLabs = labStatsResult.data.totalLabs || 0
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch lab stats:', error)
            }

            // Fetch equipment stats
            try {
                const equipmentResponse = await fetch(`${API_BASE_URL}/equipment`, { headers })
                if (equipmentResponse.ok) {
                    const equipmentResult = await equipmentResponse.json()
                    if (equipmentResult.success) {
                        newStats.totalEquipment = equipmentResult.data?.length || 0
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch equipment stats:', error)
            }

            // Fetch booking stats
            try {
                const bookingResponse = await fetch(`${API_BASE_URL}/bookings`, { headers })
                if (bookingResponse.ok) {
                    const bookingResult = await bookingResponse.json()
                    if (bookingResult.success) {
                        const bookings = bookingResult.data || []
                        newStats.totalBookings = bookings.length
                        newStats.activeBookings = bookings.filter(booking =>
                            booking.status === 'Confirmed' || booking.status === 'Active'
                        ).length
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch booking stats:', error)
            }

            // Fetch order stats (Admin only)
            if (user?.role === 'admin') {
                try {
                    const orderStatsResponse = await fetch(`${API_BASE_URL}/orders/stats/summary`, { headers })
                    if (orderStatsResponse.ok) {
                        const orderStatsResult = await orderStatsResponse.json()
                        if (orderStatsResult.success) {
                            newStats.totalOrders = orderStatsResult.data.totalOrders || 0
                            newStats.pendingOrders = orderStatsResult.data.pendingOrders || 0
                        }
                    }
                } catch (error) {
                    console.warn('Failed to fetch order stats:', error)
                }
            }

            setStats(newStats)
        } catch (error) {
            console.error('Error fetching stats:', error)
            setError('Failed to fetch dashboard statistics')
        }
    }

    // Fetch recent labs
    const fetchRecentLabs = async () => {
        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }

            const response = await fetch(`${API_BASE_URL}/labs?limit=5`, { headers })
            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    setRecentLabs(result.data?.labs?.slice(0, 5) || result.data?.slice(0, 5) || [])
                }
            }
        } catch (error) {
            console.warn('Failed to fetch recent labs:', error)
            setRecentLabs([])
        }
    }

    // Fetch recent orders (Admin only)
    const fetchRecentOrders = async () => {
        if (user?.role !== 'admin') return

        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }

            const response = await fetch(`${API_BASE_URL}/orders?limit=5`, { headers })
            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    setRecentOrders(result.data?.slice(0, 5) || [])
                }
            }
        } catch (error) {
            console.warn('Failed to fetch recent orders:', error)
            setRecentOrders([])
        }
    }

    // Handle logout
    const handleLogout = async () => {
        try {
            console.log('Logging out...')
            await logout()
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error)
            // Force navigation even if logout fails
            navigate('/login')
        }
    }

    // Handle notification navigation
    const handleNotificationClick = () => {
        try {
            navigate('/notifications')
        } catch (error) {
            console.error('Navigation error:', error)
            setError('Failed to navigate to notifications')
        }
    }

    // Load all data
    useEffect(() => {
        const loadDashboardData = async () => {
            if (!token) {
                console.log('No token found, redirecting to login')
                navigate('/login')
                return
            }

            setLoading(true)
            setError('')

            try {
                await Promise.all([
                    fetchStats(),
                    fetchRecentLabs(),
                    fetchRecentOrders(),
                    checkSystemStatus()
                ])
            } catch (error) {
                console.error('Error loading dashboard data:', error)
                setError('Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }

        loadDashboardData()
    }, [token, user?.role, navigate])

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown'
        try {
            return new Date(dateString).toLocaleString()
        } catch {
            return 'Invalid date'
        }
    }

    // Get status color helper
    const getStatusColor = (status) => {
        switch (status) {
            case 'online':
            case 'connected':
                return 'bg-green-100 text-green-800'
            case 'offline':
            case 'disconnected':
                return 'bg-red-100 text-red-800'
            case 'checking':
                return 'bg-yellow-100 text-yellow-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-semibold text-gray-900">
                                LabMS Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                Welcome, <span className="font-medium">{user?.name || user?.email}</span>
                                <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {user?.role}
                                </span>
                            </span>
                            <button
                                onClick={handleNotificationClick}
                                className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors"
                                title="Notifications"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                </svg>
                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                title="Logout"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
                {/* Error Display */}
                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{error}</span>
                        <button
                            className="absolute top-0 right-0 px-4 py-3 hover:bg-red-200"
                            onClick={() => setError('')}
                        >
                            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Welcome Section */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.name || user?.email}!
                    </h2>
                    <p className="mt-1 text-gray-600">
                        Here's what's happening with your lab management system today.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Labs</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalLabs}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalEquipment}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
                                <p className="text-xs text-gray-500">Total: {stats.totalBookings}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Orders Card - Admin Only */}
                    {user?.role === 'admin' && (
                        <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                                    <p className="text-xs text-gray-500">Total: {stats.totalOrders}</p>
                                </div>
                                <div className="p-3 bg-cyan-100 rounded-full">
                                    <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {quickActions.filter(action => action.show).map((action, index) => (
                                    <button
                                        key={`action-${index}`}
                                        onClick={action.onClick}
                                        className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        type="button"
                                    >
                                        <div className="flex items-center">
                                            <div className={`p-3 ${action.bgColor} rounded-lg`}>
                                                <div className={action.textColor}>
                                                    {action.icon}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-base font-medium text-gray-900">{action.title}</h4>
                                                <p className="text-xs text-gray-600">{action.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recent Data */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Labs */}
                            <div className="bg-white rounded-lg shadow-sm">
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-gray-900">Recent Labs</h3>
                                        <button
                                            onClick={() => handleNavigation('/lab-management')}
                                            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                        >
                                            View all labs →
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    {recentLabs.length > 0 ? (
                                        <div className="divide-y divide-gray-200">
                                            {recentLabs.map((lab) => (
                                                <div key={`lab-${lab.id}`} className="flex items-center justify-between py-3">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900">{lab.name}</h4>
                                                        <p className="text-xs text-gray-500">{lab.location || 'No location'}</p>
                                                    </div>
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {lab.lab_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-gray-500 mb-3">No labs found</p>
                                            <button
                                                onClick={() => handleNavigation('/lab-management')}
                                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                                            >
                                                Create Lab
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Orders - Admin Only */}
                            {user?.role === 'admin' && (
                                <div className="bg-white rounded-lg shadow-sm">
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                                            <button
                                                onClick={() => handleNavigation('/orders')}
                                                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                            >
                                                View all orders →
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        {recentOrders.length > 0 ? (
                                            <div className="divide-y divide-gray-200">
                                                {recentOrders.map((order) => (
                                                    <div key={`order-${order.id}`} className="flex items-center justify-between py-3">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-900">
                                                                Order #{order.id}
                                                            </h4>
                                                            <p className="text-xs text-gray-500">
                                                                {order.equipment_name} - {order.supplier}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                ${order.total_amount}
                                                            </p>
                                                        </div>
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                order.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                                                                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-gray-500 mb-3">No recent orders</p>
                                                <button
                                                    onClick={() => handleNavigation('/orders')}
                                                    className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors text-sm"
                                                >
                                                    Create Order
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <div className="space-y-6">
                        {/* System Status - Real Data */}
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">System Status</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Server</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(systemStatus.server)}`}>
                                        <span className={`w-2 h-2 mr-1 rounded-full ${systemStatus.server === 'online' ? 'bg-green-500' :
                                                systemStatus.server === 'offline' ? 'bg-red-500' :
                                                    'bg-yellow-500'
                                            }`}></span>
                                        {systemStatus.server}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Database</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(systemStatus.database)}`}>
                                        <span className={`w-2 h-2 mr-1 rounded-full ${systemStatus.database === 'connected' ? 'bg-green-500' :
                                                systemStatus.database === 'disconnected' ? 'bg-red-500' :
                                                    'bg-yellow-500'
                                            }`}></span>
                                        {systemStatus.database}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Last Backup</span>
                                    <span className="text-sm text-gray-600">
                                        {systemStatus.lastBackup ? formatDate(systemStatus.lastBackup) : 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Resources</span>
                                    <span className="text-sm text-gray-900 font-medium">
                                        {stats.totalLabs + stats.totalEquipment}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Active Sessions</span>
                                    <span className="text-sm text-gray-900 font-medium">{stats.activeBookings}</span>
                                </div>
                                {user?.role === 'admin' && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Pending Actions</span>
                                        <span className="text-sm text-gray-900 font-medium">{stats.pendingOrders}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Links</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleNavigation('/help')}
                                    className="flex items-center text-sm text-blue-600 hover:text-blue-700 w-full text-left transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    Help Center
                                </button>
                                <button
                                    onClick={() => handleNavigation('/settings')}
                                    className="flex items-center text-sm text-blue-600 hover:text-blue-700 w-full text-left transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.5a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    Settings
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex items-center text-sm text-blue-600 hover:text-blue-700 w-full text-left transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                    Refresh Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} Lab Management System. All rights reserved.</p>
            </footer>
        </div>
    )
}