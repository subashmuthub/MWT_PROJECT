// src/pages/EquipmentInventory.jsx - With Sidebar and Header
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

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

// Main Equipment Inventory Component with Sidebar
export default function EquipmentInventory() {
    const { token, user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Equipment state
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

    // Sidebar and UI state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Refs
    const userMenuRef = useRef(null)
    const notificationRef = useRef(null)

    // Fixed API base URL
    const API_BASE_URL = 'http://localhost:5000/api'

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
            show: true
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
            show: true
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
            show: true
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
            show: true
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
            show: true
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
            show: true
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
            show: true
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
            show: user?.role === 'admin'
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
            show: user?.role === 'admin'
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
            show: user?.role === 'admin'
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
            show: user?.role === 'admin' || user?.role === 'lab_technician'
        }
    ]

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

    useEffect(() => {
        document.title = 'Equipment Inventory | LabMS'
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                navigate('/login')
                return
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
    }, [filters, token, navigate])

    // Navigation functions
    const handleNavigation = (path) => {
        navigate(path)
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

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                    </div>
                    <p className="text-gray-600 mt-4 font-medium">Loading equipment inventory...</p>
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
                                        <span className="ml-3 flex-1 text-left">{item.title}</span>
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
                                        placeholder="Search anything..."
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
                                {/* Notifications */}
                                <div className="relative" ref={notificationRef}>
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                        title="Notifications"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                        </svg>
                                    </button>
                                </div>

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
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Equipment Inventory</h1>
                                <p className="mt-2 text-gray-600">
                                    Manage and track all laboratory equipment and assets.
                                </p>
                            </div>
                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    <span>Add Equipment</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                                    </svg>
                                    <span>{error}</span>
                                </div>
                                <button
                                    onClick={() => setError('')}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <span className="text-2xl">📦</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Available</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.available}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <span className="text-2xl">✅</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">In Use</p>
                                    <p className="text-3xl font-bold text-orange-600">{stats.inUse}</p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-full">
                                    <span className="text-2xl">🔄</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Maintenance</p>
                                    <p className="text-3xl font-bold text-red-600">{stats.maintenance}</p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-full">
                                    <span className="text-2xl">🔧</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Broken</p>
                                    <p className="text-3xl font-bold text-gray-600">{stats.broken}</p>
                                </div>
                                <div className="p-3 bg-gray-100 rounded-full">
                                    <span className="text-2xl">❌</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select
                                value={filters.lab_id}
                                onChange={(e) => handleFilterChange('lab_id', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">🏛️ All Labs</option>
                                {labs.map(lab => (
                                    <option key={lab.id} value={lab.id}>{lab.name}</option>
                                ))}
                            </select>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border border-gray-200">
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
                                    <button
                                        onClick={() => navigate(`/equipment/${item.id}`)}
                                        className="flex-1 bg-blue-600 text-white py-1 px-2 rounded text-sm hover:bg-blue-700 text-center"
                                    >
                                        👁️ View
                                    </button>
                                    {user?.role === 'admin' && (
                                        <>
                                            <button
                                                onClick={() => navigate(`/equipment/${item.id}/edit`)}
                                                className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-sm hover:bg-green-700 text-center"
                                            >
                                                ✏️ Edit
                                            </button>
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
                </main>
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