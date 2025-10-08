// src/pages/ReportsAnalytics.jsx - Professional Reports & Analytics with Excel Export
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { reportsAPI } from '../services/api'

export default function ReportsAnalytics() {
    // Reports-specific state
    const [selectedReport, setSelectedReport] = useState('usage')
    const [dateRange, setDateRange] = useState('last30days')
    const [customStartDate, setCustomStartDate] = useState('')
    const [customEndDate, setCustomEndDate] = useState('')
    const [quickStats, setQuickStats] = useState({
        totalBookings: { current: 0, change: 0 },
        equipmentUtilization: { percentage: 0, change: 0 },
        averageSession: { hours: 0, change: 0 },
        maintenanceCost: { current: 0, change: 0 }
    })
    const [popularEquipment, setPopularEquipment] = useState([])
    const [recentReports, setRecentReports] = useState([])
    const [reportSchedules, setReportSchedules] = useState([])
    const [generatedReportData, setGeneratedReportData] = useState(null)

    // Dashboard-style state
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())

    const { user, token, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const userMenuRef = useRef(null)
    const notificationRef = useRef(null)

    // Sidebar Navigation Items
    const navigationItems = [
        {
            id: 'dashboard',
            title: 'Dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z"></path>
                </svg>
            ),
            path: '/dashboard',
            show: true,
            badge: null
        },
        {
            id: 'lab-management',
            title: 'Lab Management',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
            ),
            path: '/lab-management',
            show: true,
            badge: null
        },
        {
            id: 'equipment',
            title: 'Equipment',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
            ),
            path: '/equipment',
            show: true,
            badge: null
        },
        {
            id: 'bookings',
            title: 'Bookings',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
            ),
            path: '/bookings',
            show: true,
            badge: null
        },
        {
            id: 'calendar',
            title: 'Calendar',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
            ),
            path: '/calendar',
            show: true,
            badge: null
        },
        {
            id: 'training',
            title: 'Training',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
            ),
            path: '/training',
            show: true,
            badge: null
        },
        {
            id: 'incidents',
            title: 'Incidents',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
            ),
            path: '/incidents',
            show: true,
            badge: null
        },
        {
            id: 'orders',
            title: 'Orders',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
            ),
            path: '/orders',
            show: user?.role === 'admin',
            badge: null
        },
        {
            id: 'users',
            title: 'Users',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
            ),
            path: '/users',
            show: user?.role === 'admin',
            badge: null
        },
        {
            id: 'reports',
            title: 'Reports',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
            ),
            path: '/reports',
            show: user?.role === 'admin',
            badge: null
        },
        {
            id: 'maintenance',
            title: 'Maintenance',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
            ),
            path: '/maintenance',
            show: user?.role === 'admin' || user?.role === 'lab_technician',
            badge: null
        }
    ]

    // Report types
    const reports = [
        { id: 'usage', name: 'Equipment Usage Report', description: 'Track how frequently equipment is used' },
        { id: 'availability', name: 'Availability Report', description: 'Monitor equipment availability and downtime' },
        { id: 'maintenance', name: 'Maintenance Report', description: 'Track maintenance schedules and costs' },
        { id: 'user', name: 'User Activity Report', description: 'Monitor user bookings and activity' },
        { id: 'financial', name: 'Financial Report', description: 'Track orders, costs and budget' }
    ]

    // Time update effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    // Click outside handler for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false)
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Load data on component mount
    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        loadInitialData()
    }, [token, navigate])

    useEffect(() => {
        fetchPopularEquipment()
    }, [dateRange])

    const loadInitialData = async () => {
        setLoading(true)
        setError('')

        try {
            await Promise.all([
                fetchQuickStats(),
                fetchPopularEquipment(),
                fetchRecentReports(),
                fetchReportSchedules()
            ])
        } catch (err) {
            console.error('Error loading initial data:', err)
            setError('Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    const fetchQuickStats = async () => {
        try {
            const response = await reportsAPI.getQuickStats()
            if (response.success) {
                setQuickStats(response.data)
            }
        } catch (err) {
            console.error('Error fetching quick stats:', err)
        }
    }

    const fetchPopularEquipment = async () => {
        try {
            const response = await reportsAPI.getPopularEquipment(dateRange)
            if (response.success) {
                const formattedData = (response.data || []).map(item => ({
                    ...item,
                    usage_percentage: parseFloat(item.usage_percentage) || 0
                }))
                setPopularEquipment(formattedData)
            }
        } catch (err) {
            console.error('Error fetching popular equipment:', err)
        }
    }

    const fetchRecentReports = async () => {
        try {
            const response = await reportsAPI.getReports({ limit: 5 })
            if (response.success) {
                setRecentReports(response.data || [])
            }
        } catch (err) {
            console.error('Error fetching recent reports:', err)
        }
    }

    const fetchReportSchedules = async () => {
        try {
            const response = await reportsAPI.getSchedules()
            if (response.success) {
                setReportSchedules(response.data || [])
            }
        } catch (err) {
            console.error('Error fetching report schedules:', err)
        }
    }

    const handleNavigation = (path) => {
        try {
            navigate(path)
        } catch (error) {
            setError(`Failed to navigate to ${path}`)
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error)
            navigate('/login')
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    const handleGenerateReport = async () => {
        try {
            setLoading(true)
            setError('')

            const reportData = {
                reportType: selectedReport,
                dateRange: dateRange === 'custom' ? 'custom' : dateRange,
                customStartDate: dateRange === 'custom' ? customStartDate : null,
                customEndDate: dateRange === 'custom' ? customEndDate : null
            }

            const response = await reportsAPI.generateReport(reportData)

            if (response.success) {
                setGeneratedReportData(response.reportData)
                await fetchRecentReports()
                showSuccessMessage('Report generated successfully!')
            } else {
                setError('Failed to generate report')
            }
        } catch (err) {
            setError(`Failed to generate report: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    // ✅ NEW: Excel Export Functions
    const handleGenerateAndDownloadExcel = async () => {
        try {
            setLoading(true)
            setError('')

            const reportData = {
                reportType: selectedReport,
                dateRange: dateRange === 'custom' ? 'custom' : dateRange,
                customStartDate: dateRange === 'custom' ? customStartDate : null,
                customEndDate: dateRange === 'custom' ? customEndDate : null
            }

            await reportsAPI.generateAndDownloadExcel(reportData)
            showSuccessMessage('📊 Excel report downloaded successfully!')
        } catch (err) {
            setError(`Failed to generate Excel report: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadExcelReport = async (reportId, reportTitle) => {
        try {
            setError('')
            const filename = `${reportTitle.replace(/\s+/g, '_')}_${reportId}.xlsx`
            await reportsAPI.downloadExcelReport(reportId, filename)
            showSuccessMessage('📊 Excel report downloaded successfully!')
        } catch (err) {
            setError(`Failed to download Excel report: ${err.message}`)
        }
    }

    const handleGenerateComprehensiveExcel = async () => {
        try {
            setLoading(true)
            setError('')

            await reportsAPI.generateComprehensiveExcel(
                dateRange === 'custom' ? 'custom' : dateRange,
                dateRange === 'custom' ? customStartDate : null,
                dateRange === 'custom' ? customEndDate : null
            )
            showSuccessMessage('📊 Comprehensive Excel report downloaded successfully!')
        } catch (err) {
            setError(`Failed to generate comprehensive Excel report: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleViewReport = async (reportId) => {
        try {
            setError('')
            const response = await reportsAPI.getReportById(reportId)
            if (response.success) {
                setGeneratedReportData(response.data.report_data)
                showSuccessMessage('Report loaded successfully!')
            }
        } catch (err) {
            setError(`Failed to load report: ${err.message}`)
        }
    }

    const handleDeleteReport = async (reportId) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            try {
                const response = await reportsAPI.deleteReport(reportId)
                if (response.success) {
                    await fetchRecentReports()
                    showSuccessMessage('Report deleted successfully!')
                }
            } catch (err) {
                setError(`Failed to delete report: ${err.message}`)
            }
        }
    }

    const handleDownloadReport = async (reportId, reportTitle) => {
        try {
            setError('')
            const filename = `${reportTitle.replace(/\s+/g, '_')}_${reportId}.json`
            await reportsAPI.downloadReport(reportId, filename)
            showSuccessMessage('Report downloaded successfully!')
        } catch (err) {
            setError(`Failed to download report: ${err.message}`)
        }
    }

    const handleExportJSON = async () => {
        if (!generatedReportData) {
            setError('Please generate a report first before exporting')
            return
        }

        try {
            const dataStr = JSON.stringify(generatedReportData, null, 2)
            const dataBlob = new Blob([dataStr], { type: 'application/json' })
            const url = URL.createObjectURL(dataBlob)

            const link = document.createElement('a')
            link.href = url
            link.download = `${selectedReport}_report_${dateRange}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            showSuccessMessage('Report exported as JSON successfully!')
        } catch (err) {
            setError(`Failed to export report: ${err.message}`)
        }
    }

    const handleExportCSV = async () => {
        if (!generatedReportData) {
            setError('Please generate a report first before exporting')
            return
        }

        try {
            let csvContent = "data:text/csv;charset=utf-8,"

            if (generatedReportData.equipmentUsage && generatedReportData.equipmentUsage.length > 0) {
                csvContent += "Equipment Name,Category,Total Bookings,Total Hours,Avg Hours per Booking\n"
                generatedReportData.equipmentUsage.forEach(item => {
                    csvContent += `"${item.equipment_name || ''}","${item.category || ''}",${item.total_bookings || 0},${item.total_hours || 0},${(item.avg_hours_per_booking || 0).toFixed(2)}\n`
                })
            } else if (generatedReportData.userActivity && generatedReportData.userActivity.length > 0) {
                csvContent += "User Name,Email,Department,Total Bookings,Completed,Cancelled\n"
                generatedReportData.userActivity.forEach(item => {
                    csvContent += `"${item.name || ''}","${item.email || ''}","${item.department || ''}",${item.total_bookings || 0},${item.completed_bookings || 0},${item.cancelled_bookings || 0}\n`
                })
            } else if (generatedReportData.equipmentAvailability && generatedReportData.equipmentAvailability.length > 0) {
                csvContent += "Equipment Name,Status,Condition,Bookings Count,Availability Status\n"
                generatedReportData.equipmentAvailability.forEach(item => {
                    csvContent += `"${item.name || ''}","${item.status || ''}","${item.condition_status || ''}",${item.bookings_count || 0},"${item.availability_status || ''}"\n`
                })
            } else {
                csvContent += "Report Type,Generated At,Data\n"
                csvContent += `"${generatedReportData.reportType || ''}","${generatedReportData.generatedAt || ''}","${JSON.stringify(generatedReportData).replace(/"/g, '""')}"\n`
            }

            const encodedUri = encodeURI(csvContent)
            const link = document.createElement('a')
            link.setAttribute('href', encodedUri)
            link.setAttribute('download', `${selectedReport}_report_${dateRange}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            showSuccessMessage('Report exported as CSV successfully!')
        } catch (err) {
            setError(`Failed to export as CSV: ${err.message}`)
        }
    }

    const testConnection = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await reportsAPI.testConnection()
            if (response.success) {
                showSuccessMessage('Connection test successful!')
            }
        } catch (err) {
            setError(`Connection test failed: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const showSuccessMessage = (message) => {
        const successDiv = document.createElement('div')
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50'
        successDiv.textContent = message
        document.body.appendChild(successDiv)
        setTimeout(() => {
            if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv)
            }
        }, 3000)
    }

    const formatChange = (change) => {
        const changeNum = parseFloat(change) || 0
        if (changeNum > 0) return `↑ ${changeNum.toFixed(1)}%`
        if (changeNum < 0) return `↓ ${Math.abs(changeNum).toFixed(1)}%`
        return `→ No change`
    }

    const getChangeColor = (change) => {
        const changeNum = parseFloat(change) || 0
        if (changeNum > 0) return 'text-green-600'
        if (changeNum < 0) return 'text-red-600'
        return 'text-gray-600'
    }

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString()
        } catch {
            return 'Invalid Date'
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'generating':
                return 'bg-yellow-100 text-yellow-800'
            case 'failed':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const formatNumber = (value) => {
        const num = parseFloat(value) || 0
        return num.toFixed(1)
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                    </div>
                    <p className="text-gray-600 mt-4 font-medium">Loading reports data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full bg-gray-50 flex">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg border-r border-gray-200 transition-all duration-300`}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                    {!sidebarCollapsed && (
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">L</span>
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                LabMS
                            </h1>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <svg className={`w-5 h-5 text-gray-600 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
                        </svg>
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="mt-6 px-3">
                    <div className="space-y-1">
                        {navigationItems.filter(item => item.show).map((item) => {
                            const isActive = location.pathname === item.path
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigation(item.path)}
                                    className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    title={sidebarCollapsed ? item.title : ''}
                                >
                                    <div className="flex items-center justify-center w-5 h-5">
                                        {item.icon}
                                    </div>
                                    {!sidebarCollapsed && (
                                        <>
                                            <span className="ml-3 flex-1 text-left">{item.title}</span>
                                            {item.badge && (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.badgeColor || 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                    {sidebarCollapsed && item.badge && (
                                        <span className={`absolute left-8 top-2 w-2 h-2 rounded-full ${item.badgeColor || 'bg-blue-500'
                                            }`}></span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </nav>

                {/* Sidebar Footer */}
                {!sidebarCollapsed && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                    {(user?.name || user?.email)?.charAt(0)?.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.name || user?.email}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {user?.role}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search reports and analytics..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    />
                                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                            </form>

                            {/* Header Right Section */}
                            <div className="flex items-center space-x-4">
                                {/* Current Time */}
                                <div className="hidden md:block text-sm text-gray-600">
                                    {currentTime.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </div>

                                {/* Refresh Button */}
                                <button
                                    onClick={loadInitialData}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Refresh Data"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                </button>

                                {/* Test Connection Button */}
                                <button
                                    onClick={testConnection}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Test API Connection"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span>Test</span>
                                </button>

                                {/* User Menu */}
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-medium text-sm">
                                                {(user?.name || user?.email)?.charAt(0)?.toUpperCase()}
                                            </span>
                                        </div>
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>

                                    {/* User Dropdown */}
                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
                                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                            </div>
                                            <button
                                                onClick={() => handleNavigation('/profile')}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                </svg>
                                                <span>Profile</span>
                                            </button>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                                </svg>
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-6">
                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                                </svg>
                                <span>{error}</span>
                                <button
                                    onClick={() => setError('')}
                                    className="ml-auto hover:text-red-900"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                        <p className="mt-2 text-gray-600">
                            Generate comprehensive reports and analyze lab usage patterns, equipment performance, and user activities.
                        </p>
                    </div>

                    {/* Connection Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
                                    <p className="text-sm text-gray-600">API connection is working correctly</p>
                                </div>
                            </div>
                            <button
                                onClick={testConnection}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Testing...' : 'Test Connection'}
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {quickStats.totalBookings?.current || 0}
                                    </p>
                                    <p className={`text-sm ${getChangeColor(quickStats.totalBookings?.change)}`}>
                                        {formatChange(quickStats.totalBookings?.change)} from last month
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Equipment Utilization</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {quickStats.equipmentUtilization?.percentage || 0}%
                                    </p>
                                    <p className={`text-sm ${getChangeColor(quickStats.equipmentUtilization?.change)}`}>
                                        {formatChange(quickStats.equipmentUtilization?.change)} from last month
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Average Session</p>
                                    <p className="text-3xl font-bold text-orange-600">
                                        {formatNumber(quickStats.averageSession?.hours)}h
                                    </p>
                                    <p className={`text-sm ${getChangeColor(quickStats.averageSession?.change)}`}>
                                        {formatChange(quickStats.averageSession?.change)} from last month
                                    </p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-full">
                                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Maintenance Cost</p>
                                    <p className="text-3xl font-bold text-red-600">
                                        ${quickStats.maintenanceCost?.current || 0}
                                    </p>
                                    <p className={`text-sm ${getChangeColor(quickStats.maintenanceCost?.change)}`}>
                                        {formatChange(quickStats.maintenanceCost?.change)} from last month
                                    </p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-full">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Report Generation */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate Report</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Report Type
                                </label>
                                <select
                                    value={selectedReport}
                                    onChange={(e) => setSelectedReport(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {reports.map((report) => (
                                        <option key={report.id} value={report.id}>
                                            {report.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-sm text-gray-600 mt-2">
                                    {reports.find(r => r.id === selectedReport)?.description}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date Range
                                </label>
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="last7days">Last 7 Days</option>
                                    <option value="last30days">Last 30 Days</option>
                                    <option value="last3months">Last 3 Months</option>
                                    <option value="last6months">Last 6 Months</option>
                                    <option value="lastyear">Last Year</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>
                            {dateRange === 'custom' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={customStartDate}
                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={customEndDate}
                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex flex-wrap gap-4">
                            <button
                                onClick={handleGenerateReport}
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                                <span>{loading ? 'Generating...' : 'Generate Report'}</span>
                            </button>

                            <button
                                onClick={handleGenerateAndDownloadExcel}
                                disabled={loading}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <span>📊 Generate Excel Report</span>
                            </button>

                            <button
                                onClick={handleGenerateComprehensiveExcel}
                                disabled={loading}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                </svg>
                                <span>📈 Comprehensive Excel</span>
                            </button>

                            <button
                                onClick={handleExportJSON}
                                disabled={!generatedReportData || loading}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <span>Export JSON</span>
                            </button>

                            <button
                                onClick={handleExportCSV}
                                disabled={!generatedReportData || loading}
                                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <span>Export CSV</span>
                            </button>
                        </div>
                        {!generatedReportData && (
                            <p className="text-sm text-gray-500 mt-4">
                                📊 Excel reports include comprehensive documentation, multiple worksheets, and professional formatting. Generate a report first to enable JSON/CSV export options.
                            </p>
                        )}
                    </div>

                    {/* Generated Report Data */}
                    {generatedReportData && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Generated Report Data</h2>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleExportJSON}
                                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                                    >
                                        Export JSON
                                    </button>
                                    <button
                                        onClick={handleExportCSV}
                                        className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
                                    >
                                        Export CSV
                                    </button>
                                </div>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-4">
                                <pre className="text-sm overflow-auto max-h-96 whitespace-pre-wrap text-gray-800">
                                    {JSON.stringify(generatedReportData, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Charts and Popular Equipment */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Equipment Usage Trend</h3>
                            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <div className="p-4 bg-blue-100 rounded-full inline-block mb-4">
                                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                        </svg>
                                    </div>
                                    <p className="text-gray-600 mb-2">Charts included in Excel reports</p>
                                    <p className="text-sm text-gray-400">Download Excel for interactive charts</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Popular Equipment</h3>
                            <div className="space-y-4">
                                {popularEquipment.length > 0 ? (
                                    popularEquipment.map((equipment, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm font-medium truncate max-w-32" title={equipment.name}>
                                                {equipment.name}
                                            </span>
                                            <div className="flex items-center ml-4">
                                                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${Math.min(equipment.usage_percentage, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600 w-12 text-right">
                                                    {formatNumber(equipment.usage_percentage)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 mb-2">No equipment usage data available</p>
                                        <p className="text-sm text-gray-400">Try generating a usage report</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Reports */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentReports.length > 0 ? (
                                    recentReports.map((report) => (
                                        <div key={report.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">{report.title}</h4>
                                                <p className="text-sm text-gray-600">
                                                    Generated on {formatDate(report.created_at)}
                                                </p>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusColor(report.status)}`}>
                                                    {report.status?.charAt(0).toUpperCase() + report.status?.slice(1)}
                                                </span>
                                            </div>
                                            <div className="flex space-x-2 ml-4">
                                                {report.status === 'completed' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleViewReport(report.id)}
                                                            className="text-blue-600 hover:text-blue-700 px-3 py-1 text-sm border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadExcelReport(report.id, report.title)}
                                                            className="text-green-600 hover:text-green-700 px-3 py-1 text-sm border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                                                        >
                                                            📊 Excel
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDownloadReport(report.id, report.title)}
                                                    className="text-green-600 hover:text-green-700 px-3 py-1 text-sm border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                                                >
                                                    JSON
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteReport(report.id)}
                                                    className="text-red-600 hover:text-red-700 px-3 py-1 text-sm border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 text-lg font-medium">No reports available</p>
                                        <p className="text-sm text-gray-400 mt-1">Generate your first report above</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Scheduled Reports */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Scheduled Reports</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reportSchedules.length > 0 ? (
                                reportSchedules.map((schedule) => (
                                    <div key={schedule.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <h4 className="font-medium text-gray-900 mb-2">{schedule.name}</h4>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {schedule.frequency} at {schedule.time}
                                        </p>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mb-3 ${schedule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {schedule.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        <div>
                                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                                                Edit Schedule
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 text-center py-12">
                                    <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 text-lg font-medium">No scheduled reports configured</p>
                                    <p className="text-sm text-gray-400 mt-1">Set up automated reports for regular insights</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}