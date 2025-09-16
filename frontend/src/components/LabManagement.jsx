// LabManagement.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api'

// Add Lab Modal Component (kept within this file)
function AddLabModal({ isOpen, onClose, onLabAdded }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        lab_type: 'general_lab'
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const labTypes = [
        { value: 'general_lab', label: 'General Lab' },
        { value: 'computer_lab', label: 'Computer Lab' },
        { value: 'chemistry_lab', label: 'Chemistry Lab' },
        { value: 'physics_lab', label: 'Physics Lab' },
        { value: 'biology_lab', label: 'Biology Lab' },
        { value: 'electronics_lab', label: 'Electronics Lab' },
        { value: 'mechanical_lab', label: 'Mechanical Lab' },
        { value: 'research_lab', label: 'Research Lab' }
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (!formData.name.trim()) {
            setError('Lab name is required')
            setLoading(false)
            return
        }

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_BASE_URL}/labs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (result.success) {
                setFormData({
                    name: '',
                    description: '',
                    location: '',
                    lab_type: 'general_lab'
                })
                onLabAdded(result.data.lab)
                onClose()
            } else {
                throw new Error(result.message || 'Failed to create lab')
            }
        } catch (error) {
            console.error('Error creating lab:', error)
            setError(error.message || 'Failed to create lab. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setError('')
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add New Lab</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={loading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Lab Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                            placeholder="Enter lab name"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Lab Type
                        </label>
                        <select
                            name="lab_type"
                            value={formData.lab_type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                            disabled={loading}
                        >
                            {labTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                            placeholder="e.g., Building A, Floor 2, Room 201"
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                            rows="3"
                            placeholder="Brief description of the lab"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.name.trim()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Lab'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Edit Lab Modal Component
function EditLabModal({ isOpen, onClose, lab, onLabUpdated }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        lab_type: 'general_lab'
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const labTypes = [
        { value: 'general_lab', label: 'General Lab' },
        { value: 'computer_lab', label: 'Computer Lab' },
        { value: 'chemistry_lab', label: 'Chemistry Lab' },
        { value: 'physics_lab', label: 'Physics Lab' },
        { value: 'biology_lab', label: 'Biology Lab' },
        { value: 'electronics_lab', label: 'Electronics Lab' },
        { value: 'mechanical_lab', label: 'Mechanical Lab' },
        { value: 'research_lab', label: 'Research Lab' }
    ]

    useEffect(() => {
        if (lab) {
            setFormData({
                name: lab.name || '',
                description: lab.description || '',
                location: lab.location || '',
                lab_type: lab.lab_type || 'general_lab'
            })
        }
    }, [lab])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_BASE_URL}/labs/${lab.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (result.success) {
                onLabUpdated(result.data.lab)
                onClose()
            } else {
                throw new Error(result.message || 'Failed to update lab')
            }
        } catch (error) {
            console.error('Error updating lab:', error)
            setError(error.message || 'Failed to update lab. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setError('')
    }

    if (!isOpen || !lab) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Edit Lab</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={loading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Lab Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                            placeholder="Enter lab name"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Lab Type
                        </label>
                        <select
                            name="lab_type"
                            value={formData.lab_type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                            disabled={loading}
                        >
                            {labTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                            placeholder="e.g., Building A, Floor 2, Room 201"
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                            rows="3"
                            placeholder="Brief description of the lab"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Updating...' : 'Update Lab'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Main Lab Management Component
export default function LabManagement() {
    const [labs, setLabs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedLab, setSelectedLab] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')

    const { user } = useAuth()
    const navigate = useNavigate()

    // Fetch labs from backend
    const fetchLabs = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_BASE_URL}/labs`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            const result = await response.json()

            if (result.success) {
                setLabs(result.data.labs || [])
                setError('')
            } else {
                throw new Error(result.message || 'Failed to fetch labs')
            }
        } catch (error) {
            console.error('Error fetching labs:', error)
            setError(`Failed to load labs: ${error.message}`)
        }
    }

    // Delete lab
    const handleDeleteLab = async (labId) => {
        if (!confirm('Are you sure you want to delete this lab?')) {
            return
        }

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_BASE_URL}/labs/${labId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            const result = await response.json()

            if (result.success) {
                setLabs(labs.filter(lab => lab.id !== labId))
            } else {
                throw new Error(result.message || 'Failed to delete lab')
            }
        } catch (error) {
            console.error('Error deleting lab:', error)
            alert(`Failed to delete lab: ${error.message}`)
        }
    }

    // Handle lab added
    const handleLabAdded = (newLab) => {
        setLabs(prev => [newLab, ...prev])
    }

    // Handle lab updated
    const handleLabUpdated = (updatedLab) => {
        setLabs(prev => prev.map(lab =>
            lab.id === updatedLab.id ? updatedLab : lab
        ))
    }

    // Handle edit lab
    const handleEditLab = (lab) => {
        setSelectedLab(lab)
        setIsEditModalOpen(true)
    }

    // Handle view lab
    const handleViewLab = (labId) => {
        navigate(`/labs/${labId}`)
    }

    // Filter labs based on search and type
    const filteredLabs = labs.filter(lab => {
        const matchesSearch = lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lab.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lab.description?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesType = filterType === 'all' || lab.lab_type === filterType

        return matchesSearch && matchesType
    })

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            await fetchLabs()
            setLoading(false)
        }
        loadData()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading labs...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900">
                                Lab Management
                            </h1>
                        </div>
                        <div className="text-sm text-gray-600">
                            {user?.name || user?.email} ({user?.role})
                        </div>
                    </div>
                </div>
            </header>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Error Display */}
                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <div className="flex items-center justify-between">
                            <span>{error}</span>
                            <button
                                onClick={fetchLabs}
                                className="ml-4 px-3 py-1 bg-red-200 text-red-800 rounded text-sm hover:bg-red-300"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Search and Filter Bar */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search labs by name, location, or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="general_lab">General Lab</option>
                            <option value="computer_lab">Computer Lab</option>
                            <option value="chemistry_lab">Chemistry Lab</option>
                            <option value="physics_lab">Physics Lab</option>
                            <option value="biology_lab">Biology Lab</option>
                            <option value="electronics_lab">Electronics Lab</option>
                            <option value="mechanical_lab">Mechanical Lab</option>
                            <option value="research_lab">Research Lab</option>
                        </select>
                        {user?.role === 'admin' && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <span className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add New Lab
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Labs Grid or Table */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Labs ({filteredLabs.length})
                            </h2>
                            <button
                                onClick={fetchLabs}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {filteredLabs.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    {searchTerm || filterType !== 'all' ? 'No labs found matching your criteria' : 'No labs found'}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {user?.role === 'admin' ? 'Get started by creating a new lab.' : 'No labs available to view.'}
                                </p>
                                {user?.role === 'admin' && !searchTerm && filterType === 'all' && (
                                    <div className="mt-6">
                                        <button
                                            onClick={() => setIsAddModalOpen(true)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                        >
                                            Add Your First Lab
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full">
                                <table className="w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Lab Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Location
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredLabs.map((lab) => (
                                            <tr key={lab.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {lab.name}
                                                        </div>
                                                        {lab.description && (
                                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                                {lab.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {lab.lab_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General Lab'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {lab.location || 'Not specified'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {lab.created_at ? new Date(lab.created_at).toLocaleDateString() : 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-3">
                                                        <button
                                                            onClick={() => handleViewLab(lab.id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            View
                                                        </button>
                                                        {user?.role === 'admin' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEditLab(lab)}
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteLab(lab.id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {user?.role === 'admin' && (
                <>
                    <AddLabModal
                        isOpen={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                        onLabAdded={handleLabAdded}
                    />
                    <EditLabModal
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false)
                            setSelectedLab(null)
                        }}
                        lab={selectedLab}
                        onLabUpdated={handleLabUpdated}
                    />
                </>
            )}
        </div>
    )
}