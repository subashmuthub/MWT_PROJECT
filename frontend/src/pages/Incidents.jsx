// src/pages/Incidents.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Incidents() {
    const [incidents, setIncidents] = useState([])
    const [filteredIncidents, setFilteredIncidents] = useState([])
    const [equipment, setEquipment] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingIncident, setEditingIncident] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [priorityFilter, setPriorityFilter] = useState('all')

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        equipment_id: '',
        priority: 'medium',
        category: 'malfunction',
        location: '',
        reported_by: '',
        assigned_to: ''
    })

    const { user, token } = useAuth()
    const navigate = useNavigate()
    const API_BASE_URL = '/api'

    const priorities = ['low', 'medium', 'high', 'critical']
    const statuses = ['open', 'in_progress', 'resolved', 'closed']
    const categories = ['malfunction', 'damage', 'safety', 'maintenance', 'other']

    // Fetch all data
    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        fetchIncidents()
        fetchEquipment()
        fetchUsers()
    }, [token, navigate])

    // Filter incidents
    useEffect(() => {
        let filtered = incidents.filter(incident => {
            const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                incident.description.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesStatus = statusFilter === 'all' || incident.status === statusFilter
            const matchesPriority = priorityFilter === 'all' || incident.priority === priorityFilter
            return matchesSearch && matchesStatus && matchesPriority
        })
        setFilteredIncidents(filtered)
    }, [incidents, searchTerm, statusFilter, priorityFilter])

    const fetchIncidents = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/incidents`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const result = await response.json()
                setIncidents(result.data || [])
            } else {
                setError('Failed to fetch incidents')
            }
        } catch (error) {
            console.error('Error fetching incidents:', error)
            setError('Failed to fetch incidents')
        } finally {
            setLoading(false)
        }
    }

    const fetchEquipment = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/equipment`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const result = await response.json()
                setEquipment(result.data || [])
            }
        } catch (error) {
            console.error('Error fetching equipment:', error)
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const result = await response.json()
                setUsers(result.data || [])
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        try {
            const url = editingIncident
                ? `${API_BASE_URL}/incidents/${editingIncident.id}`
                : `${API_BASE_URL}/incidents`

            const method = editingIncident ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    reported_by: formData.reported_by || user.id
                })
            })

            if (response.ok) {
                await fetchIncidents()
                setShowModal(false)
                setEditingIncident(null)
                setFormData({
                    title: '',
                    description: '',
                    equipment_id: '',
                    priority: 'medium',
                    category: 'malfunction',
                    location: '',
                    reported_by: '',
                    assigned_to: ''
                })
            } else {
                const result = await response.json()
                setError(result.message || 'Failed to save incident')
            }
        } catch (error) {
            console.error('Error saving incident:', error)
            setError('Failed to save incident')
        }
    }

    const handleEdit = (incident) => {
        setEditingIncident(incident)
        setFormData({
            title: incident.title || '',
            description: incident.description || '',
            equipment_id: incident.equipment_id || '',
            priority: incident.priority || 'medium',
            category: incident.category || 'malfunction',
            location: incident.location || '',
            reported_by: incident.reported_by || '',
            assigned_to: incident.assigned_to || ''
        })
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this incident?')) return

        try {
            const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                await fetchIncidents()
            } else {
                setError('Failed to delete incident')
            }
        } catch (error) {
            console.error('Error deleting incident:', error)
            setError('Failed to delete incident')
        }
    }

    const updateStatus = async (id, newStatus) => {
        try {
            const response = await fetch(`${API_BASE_URL}/incidents/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (response.ok) {
                await fetchIncidents()
            } else {
                setError('Failed to update status')
            }
        } catch (error) {
            console.error('Error updating status:', error)
            setError('Failed to update status')
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return 'bg-blue-100 text-blue-800'
            case 'medium': return 'bg-yellow-100 text-yellow-800'
            case 'high': return 'bg-orange-100 text-orange-800'
            case 'critical': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-red-100 text-red-800'
            case 'in_progress': return 'bg-yellow-100 text-yellow-800'
            case 'resolved': return 'bg-green-100 text-green-800'
            case 'closed': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading incidents...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900">
                                Incident Tracking
                            </h1>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Report Incident
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
                {/* Error Display */}
                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{error}</span>
                        <button
                            className="absolute top-0 right-0 px-4 py-3"
                            onClick={() => setError('')}
                        >
                            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Search incidents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="all">All Statuses</option>
                                {statuses.map(status => (
                                    <option key={status} value={status}>
                                        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="all">All Priorities</option>
                                {priorities.map(priority => (
                                    <option key={priority} value={priority}>
                                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center justify-end">
                            <span className="text-sm text-gray-600">
                                {filteredIncidents.length} incident(s)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Incidents Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden flex-1">
                    <div className="overflow-x-auto h-full">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Incident
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Equipment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Assigned To
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredIncidents.map((incident) => {
                                    const equipmentItem = equipment.find(eq => eq.id === incident.equipment_id)
                                    const assignedUser = users.find(u => u.id === incident.assigned_to)

                                    return (
                                        <tr key={incident.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {incident.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {incident.category?.replace('_', ' ')}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {equipmentItem?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(incident.priority)}`}>
                                                    {incident.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={incident.status}
                                                    onChange={(e) => updateStatus(incident.id, e.target.value)}
                                                    className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(incident.status)}`}
                                                    disabled={user?.role !== 'admin' && user?.role !== 'lab_technician'}
                                                >
                                                    {statuses.map(status => (
                                                        <option key={status} value={status}>
                                                            {status.replace('_', ' ')}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {assignedUser?.name || 'Unassigned'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(incident.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(incident)}
                                                    className="text-blue-600 hover:text-blue-700 mr-3"
                                                >
                                                    Edit
                                                </button>
                                                {(user?.role === 'admin' || incident.reported_by === user.id) && (
                                                    <button
                                                        onClick={() => handleDelete(incident.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        {filteredIncidents.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No incidents found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                                {editingIncident ? 'Edit Incident' : 'Report New Incident'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Equipment</label>
                                    <select
                                        value={formData.equipment_id}
                                        onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="">Select Equipment (Optional)</option>
                                        {equipment.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            {priorities.map(priority => (
                                                <option key={priority} value={priority}>
                                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            {categories.map(category => (
                                                <option key={category} value={category}>
                                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>

                                {(user?.role === 'admin' || user?.role === 'lab_technician') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Assign To</label>
                                        <select
                                            value={formData.assigned_to}
                                            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            <option value="">Unassigned</option>
                                            {users.filter(u => u.role === 'admin' || u.role === 'lab_technician').map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false)
                                            setEditingIncident(null)
                                            setFormData({
                                                title: '',
                                                description: '',
                                                equipment_id: '',
                                                priority: 'medium',
                                                category: 'malfunction',
                                                location: '',
                                                reported_by: '',
                                                assigned_to: ''
                                            })
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                                    >
                                        {editingIncident ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}