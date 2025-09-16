import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { reportsAPI } from '../services/api'

function ReportsAnalytics() {
    const [selectedReport, setSelectedReport] = useState('usage')
    const [dateRange, setDateRange] = useState('last30days')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
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

    const reports = [
        { id: 'usage', name: 'Equipment Usage Report', description: 'Track how frequently equipment is used' },
        { id: 'availability', name: 'Availability Report', description: 'Monitor equipment availability and downtime' },
        { id: 'maintenance', name: 'Maintenance Report', description: 'Track maintenance schedules and costs' },
        { id: 'user', name: 'User Activity Report', description: 'Monitor user bookings and activity' },
        { id: 'financial', name: 'Financial Report', description: 'Track orders, costs and budget' }
    ]

    useEffect(() => {
        fetchQuickStats()
        fetchPopularEquipment()
        fetchRecentReports()
        fetchReportSchedules()
    }, [])

    useEffect(() => {
        fetchPopularEquipment()
    }, [dateRange])

    const fetchQuickStats = async () => {
        try {
            const response = await reportsAPI.getQuickStats()
            setQuickStats(response.data)
        } catch (err) {
            console.error('Error fetching quick stats:', err)
        }
    }

    const fetchPopularEquipment = async () => {
        try {
            const response = await reportsAPI.getPopularEquipment(dateRange)
            setPopularEquipment(response.data)
        } catch (err) {
            console.error('Error fetching popular equipment:', err)
        }
    }

    const fetchRecentReports = async () => {
        try {
            const response = await reportsAPI.getReports({ limit: 5 })
            setRecentReports(response.data)
        } catch (err) {
            console.error('Error fetching recent reports:', err)
        }
    }

    const fetchReportSchedules = async () => {
        try {
            const response = await reportsAPI.getSchedules()
            setReportSchedules(response.data)
        } catch (err) {
            console.error('Error fetching report schedules:', err)
        }
    }

    const handleGenerateReport = async () => {
        try {
            setLoading(true)
            setError(null)

            const reportData = {
                reportType: selectedReport,
                dateRange: dateRange,
                userId: 1 // You should get this from your auth context
            }

            const response = await reportsAPI.generateReport(reportData)
            setGeneratedReportData(response.reportData)

            // Refresh recent reports
            fetchRecentReports()

        } catch (err) {
            setError(`Failed to generate report: ${err.message}`)
            console.error('Error generating report:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleViewReport = async (reportId) => {
        try {
            const response = await reportsAPI.getReportById(reportId)
            setGeneratedReportData(response.data.report_data)
        } catch (err) {
            setError(`Failed to load report: ${err.message}`)
        }
    }

    const handleDeleteReport = async (reportId) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            try {
                await reportsAPI.deleteReport(reportId)
                fetchRecentReports()
            } catch (err) {
                setError(`Failed to delete report: ${err.message}`)
            }
        }
    }

    const formatChange = (change) => {
        const changeNum = parseFloat(change)
        if (changeNum > 0) return `↑ ${changeNum}%`
        if (changeNum < 0) return `↓ ${Math.abs(changeNum)}%`
        return `→ Same as last month`
    }

    const getChangeColor = (change) => {
        const changeNum = parseFloat(change)
        if (changeNum > 0) return 'text-green-600'
        if (changeNum < 0) return 'text-red-600'
        return 'text-gray-600'
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="px-6 py-4">
                    <Link to="/dashboard" className="text-blue-500 hover:underline">← Dashboard</Link>
                    <h1 className="text-2xl font-bold text-gray-800 mt-2">Reports & Analytics</h1>
                </div>
            </div>

            <div className="p-6">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                        <button
                            onClick={() => setError(null)}
                            className="float-right text-red-700 hover:text-red-900"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Report Selection */}
                <div className="bg-white rounded shadow p-6 mb-6">
                    <h2 className="text-lg font-bold mb-4">Generate Report</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Report Type</label>
                            <select
                                value={selectedReport}
                                onChange={(e) => setSelectedReport(e.target.value)}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
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
                            <label className="block text-gray-700 text-sm font-bold mb-2">Date Range</label>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                            >
                                <option value="last7days">Last 7 Days</option>
                                <option value="last30days">Last 30 Days</option>
                                <option value="last3months">Last 3 Months</option>
                                <option value="last6months">Last 6 Months</option>
                                <option value="lastyear">Last Year</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex gap-4">
                        <button
                            onClick={handleGenerateReport}
                            disabled={loading}
                            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                        <button className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
                            Export PDF
                        </button>
                        <button className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
                            Export Excel
                        </button>
                    </div>
                </div>

                {/* Generated Report Data Display */}
                {generatedReportData && (
                    <div className="bg-white rounded shadow p-6 mb-6">
                        <h2 className="text-lg font-bold mb-4">Generated Report Data</h2>
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                            {JSON.stringify(generatedReportData, null, 2)}
                        </pre>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-semibold text-gray-700">Total Bookings</h3>
                        <p className="text-3xl font-bold text-blue-600">{quickStats.totalBookings.current}</p>
                        <p className={`text-sm ${getChangeColor(quickStats.totalBookings.change)}`}>
                            {formatChange(quickStats.totalBookings.change)} from last month
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-semibold text-gray-700">Equipment Utilization</h3>
                        <p className="text-3xl font-bold text-green-600">{quickStats.equipmentUtilization.percentage}%</p>
                        <p className={`text-sm ${getChangeColor(quickStats.equipmentUtilization.change)}`}>
                            {formatChange(quickStats.equipmentUtilization.change)} from last month
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-semibold text-gray-700">Average Session</h3>
                        <p className="text-3xl font-bold text-orange-600">{quickStats.averageSession.hours}h</p>
                        <p className={`text-sm ${getChangeColor(quickStats.averageSession.change)}`}>
                            {formatChange(quickStats.averageSession.change)} from last month
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-semibold text-gray-700">Maintenance Cost</h3>
                        <p className="text-3xl font-bold text-red-600">${quickStats.maintenanceCost.current}</p>
                        <p className={`text-sm ${getChangeColor(quickStats.maintenanceCost.change)}`}>
                            {formatChange(quickStats.maintenanceCost.change)} from last month
                        </p>
                    </div>
                </div>

                {/* Charts and Graphs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded shadow p-6">
                        <h3 className="text-lg font-bold mb-4">Equipment Usage Trend</h3>
                        <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                            <p className="text-gray-500">Usage Chart Placeholder</p>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-6">
                        <h3 className="text-lg font-bold mb-4">Popular Equipment</h3>
                        <div className="space-y-4">
                            {popularEquipment.map((equipment, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span>{equipment.name}</span>
                                    <div className="flex items-center">
                                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${equipment.usage_percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600">{equipment.usage_percentage}%</span>
                                    </div>
                                </div>
                            ))}
                            {popularEquipment.length === 0 && (
                                <p className="text-gray-500 text-center">No equipment usage data available</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Reports */}
                <div className="bg-white rounded shadow">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-bold">Recent Reports</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {recentReports.map((report) => (
                                <div key={report.id} className="flex justify-between items-center p-4 border rounded">
                                    <div>
                                        <h4 className="font-medium">{report.title}</h4>
                                        <p className="text-sm text-gray-600">
                                            Generated on {new Date(report.created_at).toLocaleDateString()}
                                        </p>
                                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${report.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {report.status === 'completed' && (
                                            <button
                                                onClick={() => handleViewReport(report.id)}
                                                className="text-blue-500 hover:underline"
                                            >
                                                View
                                            </button>
                                        )}
                                        <button className="text-green-500 hover:underline">Download</button>
                                        <button
                                            onClick={() => handleDeleteReport(report.id)}
                                            className="text-red-500 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {recentReports.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No reports generated yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scheduled Reports */}
                <div className="mt-6 bg-white rounded shadow p-6">
                    <h2 className="text-lg font-bold mb-4">Scheduled Reports</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {reportSchedules.map((schedule) => (
                            <div key={schedule.id} className="border rounded p-4">
                                <h4 className="font-medium mb-2">{schedule.name}</h4>
                                <p className="text-sm text-gray-600 mb-2">
                                    {schedule.frequency} at {schedule.time}
                                </p>
                                <span className={`inline-block px-2 py-1 text-xs rounded-full mb-2 ${schedule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {schedule.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <br />
                                <button className="text-blue-500 hover:underline text-sm">Edit Schedule</button>
                            </div>
                        ))}
                        {reportSchedules.length === 0 && (
                            <div className="col-span-3 text-center text-gray-500 py-4">
                                No scheduled reports configured
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReportsAnalytics