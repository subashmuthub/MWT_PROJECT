import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

// Add Equipment Modal Component
function AddEquipmentModal({ isOpen, onClose, onEquipmentAdded, labs }) {
    const { token } = useAuth()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        serial_number: '',
        model: '',
        manufacturer: '',
        category: 'other',
        lab_id: '',
        location_details: '',
        status: 'available',
        condition_status: 'good',
        purchase_price: '',
        current_value: '',
        purchase_date: new Date().toISOString().split('T')[0],
        warranty_expiry: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const categories = [
        { value: 'computer', label: '💻 Computer' },
        { value: 'printer', label: '🖨️ Printer' },
        { value: 'projector', label: '📽️ Projector' },
        { value: 'scanner', label: '📄 Scanner' },
        { value: 'microscope', label: '🔬 Microscope' },
        { value: 'centrifuge', label: '🌀 Centrifuge' },
        { value: 'spectrophotometer', label: '📊 Spectrophotometer' },
        { value: 'ph_meter', label: '🧪 pH Meter' },
        { value: 'balance', label: '⚖️ Balance' },
        { value: 'incubator', label: '🌡️ Incubator' },
        { value: 'autoclave', label: '🔥 Autoclave' },
        { value: 'pipette', label: '💧 Pipette' },
        { value: 'thermometer', label: '🌡️ Thermometer' },
        { value: 'glassware', label: '🧪 Glassware' },
        { value: 'safety_equipment', label: '🛡️ Safety Equipment' },
        { value: 'other', label: '📦 Other' }
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('http://localhost:5000/api/equipment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (result.success) {
                onEquipmentAdded(result.data.equipment)
                onClose()
                setFormData({
                    name: '',
                    description: '',
                    serial_number: '',
                    model: '',
                    manufacturer: '',
                    category: 'other',
                    lab_id: '',
                    location_details: '',
                    status: 'available',
                    condition_status: 'good',
                    purchase_price: '',
                    current_value: '',
                    purchase_date: new Date().toISOString().split('T')[0],
                    warranty_expiry: ''
                })
            } else {
                setError(result.message || 'Failed to create equipment')
            }
        } catch (error) {
            console.error('Error creating equipment:', error)
            setError('Failed to create equipment. Please try again.')
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
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">➕ Add New Equipment</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={loading}
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Equipment Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                placeholder="Enter equipment name"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Serial Number *
                            </label>
                            <input
                                type="text"
                                name="serial_number"
                                value={formData.serial_number}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                placeholder="Serial number"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                required
                                disabled={loading}
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Lab *
                            </label>
                            <select
                                name="lab_id"
                                value={formData.lab_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                required
                                disabled={loading}
                            >
                                <option value="">🏛️ Select Lab</option>
                                {labs.map(lab => (
                                    <option key={lab.id} value={lab.id}>
                                        {lab.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Model
                            </label>
                            <input
                                type="text"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                placeholder="Equipment model"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Manufacturer
                            </label>
                            <input
                                type="text"
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                placeholder="Manufacturer name"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Purchase Price
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="purchase_price"
                                value={formData.purchase_price}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                placeholder="0.00"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Purchase Date
                            </label>
                            <input
                                type="date"
                                name="purchase_date"
                                value={formData.purchase_date}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                disabled={loading}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Location Details
                            </label>
                            <input
                                type="text"
                                name="location_details"
                                value={formData.location_details}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                placeholder="e.g., Shelf A, Cabinet 1"
                                disabled={loading}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                rows="3"
                                placeholder="Equipment description"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
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
                            disabled={loading || !formData.name.trim() || !formData.serial_number.trim() || !formData.lab_id}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : '➕ Create Equipment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Main Equipment Inventory Component
function EquipmentInventory() {
    const { token, isAuthenticated, user } = useAuth()
    const [equipment, setEquipment] = useState([])
    const [labs, setLabs] = useState([])
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        inUse: 0,
        maintenance: 0,
        broken: 0
    })
    const [filters, setFilters] = useState({
        lab_id: '',
        status: '',
        category: '',
        search: ''
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)

    // Fixed API base URL
    const API_BASE_URL = 'http://localhost:5000/api';

    useEffect(() => {
        document.title = 'Equipment Inventory | NEC LabMS'
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticated || !token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true)
                setError('')

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }

                // Build query parameters for equipment filtering
                const queryParams = new URLSearchParams()
                Object.keys(filters).forEach(key => {
                    if (filters[key]) {
                        queryParams.append(key, filters[key])
                    }
                })

                // Fetch labs first
                const labsResponse = await fetch(`${API_BASE_URL}/labs`, { headers })
                if (labsResponse.ok) {
                    const labsData = await labsResponse.json()
                    setLabs(labsData.data?.labs || [])
                }

                // Fetch equipment with filters
                const equipmentResponse = await fetch(`${API_BASE_URL}/equipment?${queryParams}`, { headers })
                if (equipmentResponse.ok) {
                    const equipmentData = await equipmentResponse.json()
                    setEquipment(equipmentData.data?.equipment || [])

                    // Calculate stats from equipment data
                    const equipmentList = equipmentData.data?.equipment || []
                    const calculatedStats = {
                        total: equipmentList.length,
                        available: equipmentList.filter(item => item.status === 'available').length,
                        inUse: equipmentList.filter(item => item.status === 'in_use').length,
                        maintenance: equipmentList.filter(item => item.status === 'maintenance').length,
                        broken: equipmentList.filter(item => item.status === 'broken').length
                    }
                    setStats(calculatedStats)
                } else {
                    const errorText = await equipmentResponse.text()
                    console.error('Equipment fetch error:', errorText)
                    setError('Failed to load equipment data')
                }

            } catch (error) {
                console.error('Error fetching data:', error)
                setError('Failed to load data. Please check your connection.')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [filters, token, isAuthenticated])

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const handleStatusUpdate = async (equipmentId, newStatus) => {
        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }

            const response = await fetch(`${API_BASE_URL}/equipment/${equipmentId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status: newStatus })
            })

            if (response.ok) {
                // Update equipment list locally
                setEquipment(prev => prev.map(item =>
                    item.id === equipmentId ? { ...item, status: newStatus } : item
                ))

                // Recalculate stats
                const updatedEquipment = equipment.map(item =>
                    item.id === equipmentId ? { ...item, status: newStatus } : item
                )
                const newStats = {
                    total: updatedEquipment.length,
                    available: updatedEquipment.filter(item => item.status === 'available').length,
                    inUse: updatedEquipment.filter(item => item.status === 'in_use').length,
                    maintenance: updatedEquipment.filter(item => item.status === 'maintenance').length,
                    broken: updatedEquipment.filter(item => item.status === 'broken').length
                }
                setStats(newStats)
            } else {
                const result = await response.json()
                setError(result.message || 'Failed to update equipment status')
            }
        } catch (error) {
            console.error('Error updating equipment:', error)
            setError('Failed to update equipment status')
        }
    }

    const handleDelete = async (equipmentId) => {
        if (window.confirm('Are you sure you want to delete this equipment?')) {
            try {
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }

                const response = await fetch(`${API_BASE_URL}/equipment/${equipmentId}`, {
                    method: 'DELETE',
                    headers
                })

                if (response.ok) {
                    setEquipment(prev => prev.filter(item => item.id !== equipmentId))
                    // Recalculate stats after deletion
                    const updatedEquipment = equipment.filter(item => item.id !== equipmentId)
                    const newStats = {
                        total: updatedEquipment.length,
                        available: updatedEquipment.filter(item => item.status === 'available').length,
                        inUse: updatedEquipment.filter(item => item.status === 'in_use').length,
                        maintenance: updatedEquipment.filter(item => item.status === 'maintenance').length,
                        broken: updatedEquipment.filter(item => item.status === 'broken').length
                    }
                    setStats(newStats)
                } else {
                    const result = await response.json()
                    setError(result.message || 'Failed to delete equipment')
                }
            } catch (error) {
                console.error('Error deleting equipment:', error)
                setError('Failed to delete equipment')
            }
        }
    }

    const handleEquipmentAdded = (newEquipment) => {
        setEquipment(prev => [newEquipment, ...prev])
        // Recalculate stats
        const updatedEquipment = [newEquipment, ...equipment]
        const newStats = {
            total: updatedEquipment.length,
            available: updatedEquipment.filter(item => item.status === 'available').length,
            inUse: updatedEquipment.filter(item => item.status === 'in_use').length,
            maintenance: updatedEquipment.filter(item => item.status === 'maintenance').length,
            broken: updatedEquipment.filter(item => item.status === 'broken').length
        }
        setStats(newStats)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800'
            case 'in_use': return 'bg-orange-100 text-orange-800'
            case 'maintenance': return 'bg-red-100 text-red-800'
            case 'broken': return 'bg-gray-100 text-gray-800'
            case 'retired': return 'bg-purple-100 text-purple-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'computer': return '💻'
            case 'printer': return '🖨️'
            case 'projector': return '📽️'
            case 'scanner': return '📄'
            case 'microscope': return '🔬'
            case 'centrifuge': return '🌀'
            case 'spectrophotometer': return '📊'
            case 'ph_meter': return '🧪'
            case 'balance': return '⚖️'
            case 'incubator': return '🌡️'
            case 'autoclave': return '🔥'
            case 'pipette': return '💧'
            case 'thermometer': return '🌡️'
            case 'glassware': return '🧪'
            case 'safety_equipment': return '🛡️'
            default: return '📦'
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">🔒</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">🔐 Authentication Required</h2>
                    <p className="text-gray-600 mb-4">Please log in to view equipment inventory</p>
                    <Link
                        to="/login"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        🚀 Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-white font-bold text-xl">🏛️</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">NEC LabMS</h2>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading equipment inventory...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="px-6 py-4 flex justify-between items-center">
                    <div>
                        <Link to="/dashboard" className="text-blue-500 hover:underline mb-2 inline-block">
                            ← Back to Dashboard
                        </Link>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">📦</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">🏛️ Equipment Inventory</h1>
                                <p className="text-sm text-gray-600">NEC Laboratory Management System</p>
                            </div>
                        </div>
                    </div>
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <span>➕</span>
                            <span>Add Equipment</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="p-6">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
                        <span className="text-lg mr-2">⚠️</span>
                        <span>{error}</span>
                        <button
                            onClick={() => setError('')}
                            className="ml-auto text-red-500 hover:text-red-700"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <div className="p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <span className="text-2xl">📦</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Available</p>
                                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <span className="text-2xl">✅</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">In Use</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.inUse}</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <span className="text-2xl">🔄</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                                <p className="text-2xl font-bold text-red-600">{stats.maintenance}</p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-full">
                                <span className="text-2xl">🔧</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Broken</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.broken}</p>
                            </div>
                            <div className="p-3 bg-gray-100 rounded-full">
                                <span className="text-2xl">❌</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <span className="mr-2">🔍</span>
                        Search & Filter Equipment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Search equipment..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                        />
                        <select
                            value={filters.lab_id}
                            onChange={(e) => handleFilterChange('lab_id', e.target.value)}
                            className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                        >
                            <option value="">🏛️ All Labs</option>
                            {labs.map(lab => (
                                <option key={lab.id} value={lab.id}>{lab.name}</option>
                            ))}
                        </select>
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                        >
                            <option value="">📂 All Categories</option>
                            <option value="computer">💻 Computer</option>
                            <option value="printer">🖨️ Printer</option>
                            <option value="projector">📽️ Projector</option>
                            <option value="scanner">📄 Scanner</option>
                            <option value="microscope">🔬 Microscope</option>
                            <option value="centrifuge">🌀 Centrifuge</option>
                            <option value="spectrophotometer">📊 Spectrophotometer</option>
                            <option value="ph_meter">🧪 pH Meter</option>
                            <option value="balance">⚖️ Balance</option>
                            <option value="incubator">🌡️ Incubator</option>
                            <option value="autoclave">🔥 Autoclave</option>
                            <option value="pipette">💧 Pipette</option>
                            <option value="thermometer">🌡️ Thermometer</option>
                            <option value="glassware">🧪 Glassware</option>
                            <option value="safety_equipment">🛡️ Safety Equipment</option>
                            <option value="other">📦 Other</option>
                        </select>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                        >
                            <option value="">📊 All Status</option>
                            <option value="available">✅ Available</option>
                            <option value="in_use">🔄 In Use</option>
                            <option value="maintenance">🔧 Maintenance</option>
                            <option value="broken">❌ Broken</option>
                            <option value="retired">🚫 Retired</option>
                        </select>
                    </div>
                </div>

                {/* Equipment Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {equipment.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                    {item.status?.replace('_', ' ')}
                                </span>
                            </div>

                            <h3 className="font-bold text-gray-800 mb-2">{item.name}</h3>

                            <div className="text-sm text-gray-600 space-y-1">
                                <p><span className="font-medium">🏷️ Category:</span> {item.category}</p>
                                <p><span className="font-medium">🏛️ Lab:</span> {item.lab?.name || 'Unassigned'}</p>
                                {item.model && <p><span className="font-medium">📋 Model:</span> {item.model}</p>}
                                {item.serial_number && <p><span className="font-medium">🔢 S/N:</span> {item.serial_number}</p>}
                                {item.manufacturer && <p><span className="font-medium">🏭 Brand:</span> {item.manufacturer}</p>}
                            </div>

                            <div className="mt-4 flex gap-2">
                                <Link
                                    to={`/equipment/${item.id}`}
                                    className="flex-1 bg-blue-600 text-white py-1 px-2 rounded text-sm hover:bg-blue-700 text-center"
                                >
                                    👁️ View
                                </Link>
                                {user?.role === 'admin' && (
                                    <>
                                        <Link
                                            to={`/equipment/${item.id}/edit`}
                                            className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-sm hover:bg-green-700 text-center"
                                        >
                                            ✏️ Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="flex-1 bg-red-600 text-white py-1 px-2 rounded text-sm hover:bg-red-700"
                                        >
                                            🗑️ Del
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Quick Status Actions */}
                            {item.status === 'available' && (
                                <div className="mt-2">
                                    <button
                                        onClick={() => handleStatusUpdate(item.id, 'in_use')}
                                        className="w-full bg-orange-100 text-orange-800 py-1 px-2 rounded text-xs hover:bg-orange-200"
                                    >
                                        🔄 Mark as In Use
                                    </button>
                                </div>
                            )}
                            {item.status === 'in_use' && (
                                <div className="mt-2">
                                    <button
                                        onClick={() => handleStatusUpdate(item.id, 'available')}
                                        className="w-full bg-green-100 text-green-800 py-1 px-2 rounded text-xs hover:bg-green-200"
                                    >
                                        ✅ Mark as Available
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* No Results */}
                {equipment.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Equipment Found</h3>
                        <p className="text-gray-500 mb-4">
                            {labs.length === 0
                                ? '🏛️ Please create a lab first before adding equipment'
                                : '➕ Click "Add Equipment" to get started'}
                        </p>
                        {user?.role === 'admin' && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                ➕ Add Equipment
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Add Equipment Modal */}
            {user?.role === 'admin' && (
                <AddEquipmentModal
                    isOpen={showAddForm}
                    onClose={() => setShowAddForm(false)}
                    onEquipmentAdded={handleEquipmentAdded}
                    labs={labs}
                />
            )}
        </div>
    )
}

export default EquipmentInventory