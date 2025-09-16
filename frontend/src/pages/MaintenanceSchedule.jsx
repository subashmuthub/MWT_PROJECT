import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { maintenanceAPI } from '../services/api'

function MaintenanceSchedule() {
    const [maintenance, setMaintenance] = useState([])
    const [stats, setStats] = useState({
        scheduled: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showMaintenanceForm, setShowMaintenanceForm] = useState(false)
    const [newMaintenance, setNewMaintenance] = useState({
        equipment: '',
        type: 'routine',
        date: '',
        technician: '',
        description: '',
        estimatedCost: '',
        priority: 'medium'
    })

    // Fetch data on component mount
    useEffect(() => {
        fetchMaintenance()
        fetchStats()
    }, [])

    const fetchMaintenance = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await maintenanceAPI.getAll()

            // Handle different response structures
            const maintenanceData = response.data || response || []
            setMaintenance(Array.isArray(maintenanceData) ? maintenanceData : [])
        } catch (err) {
            console.error('Error fetching maintenance:', err)
            setError(`Failed to fetch maintenance records: ${err.message}`)
            setMaintenance([])
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await maintenanceAPI.getStats()
            const statsData = response.data || response
            setStats(statsData || {
                scheduled: 0,
                inProgress: 0,
                completed: 0,
                overdue: 0
            })
        } catch (err) {
            console.error('Error fetching stats:', err)
            setStats({
                scheduled: 0,
                inProgress: 0,
                completed: 0,
                overdue: 0
            })
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setNewMaintenance(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setError(null)

            // Map frontend fields to backend fields
            const maintenanceData = {
                equipment: newMaintenance.equipment,
                type: newMaintenance.type,
                date: newMaintenance.date,
                technician: newMaintenance.technician,
                description: newMaintenance.description,
                estimatedCost: newMaintenance.estimatedCost,
                priority: newMaintenance.priority
            }

            const response = await maintenanceAPI.create(maintenanceData)
            const newRecord = response.data || response
            setMaintenance(prev => [...prev, newRecord])

            setShowMaintenanceForm(false)
            setNewMaintenance({
                equipment: '',
                type: 'routine',
                date: '',
                technician: '',
                description: '',
                estimatedCost: '',
                priority: 'medium'
            })

            fetchStats()
        } catch (err) {
            console.error('Error creating maintenance:', err)
            setError(`Failed to create maintenance record: ${err.message}`)
        }
    }

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            setError(null)
            const response = await maintenanceAPI.update(id, { status: newStatus })
            const updatedRecord = response.data || response

            setMaintenance(prev => prev.map(item =>
                item.id === id ? updatedRecord : item
            ))
            fetchStats()
        } catch (err) {
            console.error('Error updating maintenance:', err)
            setError(`Failed to update maintenance status: ${err.message}`)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this maintenance record?')) {
            try {
                setError(null)
                await maintenanceAPI.delete(id)
                setMaintenance(prev => prev.filter(item => item.id !== id))
                fetchStats()
            } catch (err) {
                console.error('Error deleting maintenance:', err)
                setError(`Failed to delete maintenance record: ${err.message}`)
            }
        }
    }

    const getStatusColor = (status) => {
        const statusLower = status?.toLowerCase()
        switch (statusLower) {
            case 'scheduled': return 'bg-blue-100 text-blue-800'
            case 'in_progress': return 'bg-yellow-100 text-yellow-800'
            case 'completed': return 'bg-green-100 text-green-800'
            case 'overdue': return 'bg-red-100 text-red-800'
            case 'cancelled': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getTypeColor = (type) => {
        const typeLower = type?.toLowerCase()
        switch (typeLower) {
            case 'routine':
            case 'preventive': return 'bg-green-100 text-green-800'
            case 'repair': return 'bg-orange-100 text-orange-800'
            case 'emergency': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const formatStatus = (status) => {
        if (!status) return 'Unknown'
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    const formatType = (type) => {
        if (!type) return 'Unknown'
        return type.charAt(0).toUpperCase() + type.slice(1)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl">Loading maintenance records...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="px-6 py-4 flex justify-between items-center">
                    <div>
                        <Link to="/dashboard" className="text-blue-500 hover:underline">← Dashboard</Link>
                        <h1 className="text-2xl font-bold text-gray-800 mt-2">Maintenance Schedule</h1>
                    </div>
                    <button
                        onClick={() => setShowMaintenanceForm(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Schedule Maintenance
                    </button>
                </div>
            </div>

            <div className="p-6">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                        <button
                            onClick={() => {
                                setError(null)
                                fetchMaintenance()
                                fetchStats()
                            }}
                            className="float-right text-red-700 hover:text-red-900 underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Maintenance Form Modal */}
                {showMaintenanceForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">Schedule Maintenance</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Equipment</label>
                                    <select
                                        name="equipment"
                                        value={newMaintenance.equipment}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select Equipment</option>
                                        <option value="Computer-001">Computer-001</option>
                                        <option value="Computer-002">Computer-002</option>
                                        <option value="Printer-001">Printer-001</option>
                                        <option value="Printer-002">Printer-002</option>
                                        <option value="Projector-001">Projector-001</option>
                                        <option value="Projector-002">Projector-002</option>
                                        <option value="Scanner-001">Scanner-001</option>
                                        <option value="Scanner-002">Scanner-002</option>
                                        <option value="Microscope-001">Microscope-001</option>
                                        <option value="Oscilloscope-001">Oscilloscope-001</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Maintenance Type</label>
                                    <select
                                        name="type"
                                        value={newMaintenance.type}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="routine">Routine</option>
                                        <option value="preventive">Preventive</option>
                                        <option value="repair">Repair</option>
                                        <option value="emergency">Emergency</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Priority</label>
                                    <select
                                        name="priority"
                                        value={newMaintenance.priority}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Scheduled Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={newMaintenance.date}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Technician</label>
                                    <input
                                        type="text"
                                        name="technician"
                                        value={newMaintenance.technician}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                        placeholder="Assigned technician name"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={newMaintenance.description}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                        rows="3"
                                        placeholder="Maintenance details and requirements"
                                    ></textarea>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Estimated Cost ($)</label>
                                    <input
                                        type="number"
                                        name="estimatedCost"
                                        value={newMaintenance.estimatedCost}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowMaintenanceForm(false)}
                                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Schedule
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Maintenance Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-semibold text-gray-700">Scheduled</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.scheduled}</p>
                    </div>
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-semibold text-gray-700">In Progress</h3>
                        <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
                    </div>
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
                        <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                    </div>
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-semibold text-gray-700">Overdue</h3>
                        <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
                    </div>
                </div>

                {/* Filter Options */}
                <div className="bg-white p-4 rounded shadow mb-6">
                    <div className="flex flex-wrap gap-4">
                        <select className="px-3 py-2 border rounded focus:outline-none focus:border-blue-500">
                            <option>All Equipment</option>
                            <option>Computer-001</option>
                            <option>Printer-001</option>
                            <option>Projector-001</option>
                            <option>Scanner-001</option>
                        </select>
                        <select className="px-3 py-2 border rounded focus:outline-none focus:border-blue-500">
                            <option>All Types</option>
                            <option>Routine</option>
                            <option>Preventive</option>
                            <option>Repair</option>
                            <option>Emergency</option>
                        </select>
                        <select className="px-3 py-2 border rounded focus:outline-none focus:border-blue-500">
                            <option>All Status</option>
                            <option>Scheduled</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                            <option>Overdue</option>
                        </select>
                        <select className="px-3 py-2 border rounded focus:outline-none focus:border-blue-500">
                            <option>All Priorities</option>
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                            <option>Critical</option>
                        </select>
                    </div>
                </div>

                {/* Maintenance Table */}
                <div className="bg-white rounded shadow overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-bold">Maintenance Schedule</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {maintenance.length > 0 ? maintenance.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 text-sm text-gray-900">{item.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                            {item.equipment_name || item.equipment || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(item.maintenance_type || item.type)}`}>
                                                {formatType(item.maintenance_type || item.type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${item.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                                    item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {item.priority ? item.priority.charAt(0).toUpperCase() + item.priority.slice(1) : 'Medium'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {item.scheduled_date || item.date || 'Not set'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                                {formatStatus(item.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {item.technician_name || item.technician || 'Unassigned'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                            ${parseFloat(item.estimated_cost || item.cost || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex flex-wrap gap-2">
                                                {item.status !== 'completed' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(item.id, 'completed')}
                                                        className="text-green-500 hover:underline text-xs"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                                {item.status === 'scheduled' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(item.id, 'in_progress')}
                                                        className="text-blue-500 hover:underline text-xs"
                                                    >
                                                        Start
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-500 hover:underline text-xs"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                                            No maintenance records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Upcoming Maintenance */}
                <div className="mt-6 bg-white rounded shadow p-6">
                    <h2 className="text-lg font-bold mb-4">Upcoming Maintenance (Next 7 Days)</h2>
                    <div className="space-y-4">
                        {maintenance
                            .filter(item => {
                                const itemDate = new Date(item.scheduled_date || item.date);
                                const today = new Date();
                                const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                                return itemDate >= today && itemDate <= nextWeek && (item.status === 'scheduled' || item.status === 'in_progress');
                            })
                            .slice(0, 3)
                            .map(item => (
                                <div key={item.id} className="flex justify-between items-center p-4 border rounded bg-blue-50">
                                    <div>
                                        <h4 className="font-medium">
                                            {item.equipment_name || item.equipment} - {formatType(item.maintenance_type || item.type)} Maintenance
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {item.scheduled_date || item.date} • {item.technician_name || item.technician || 'Unassigned'}
                                        </p>
                                        {item.priority && item.priority !== 'medium' && (
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1 ${item.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                                    item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-blue-600 font-medium">
                                        ${parseFloat(item.estimated_cost || item.cost || 0).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        {maintenance.filter(item => {
                            const itemDate = new Date(item.scheduled_date || item.date);
                            const today = new Date();
                            const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                            return itemDate >= today && itemDate <= nextWeek && (item.status === 'scheduled' || item.status === 'in_progress');
                        }).length === 0 && (
                                <p className="text-gray-500 text-center py-4">No upcoming maintenance scheduled</p>
                            )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MaintenanceSchedule