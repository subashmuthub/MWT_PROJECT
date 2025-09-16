// src/pages/OrderManagement.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function OrderManagement() {
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingOrder, setEditingOrder] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [ordersPerPage] = useState(10)

    const { user, token } = useAuth()
    const navigate = useNavigate()
    const API_BASE_URL = '/api'

    // Form state
    const [formData, setFormData] = useState({
        supplier: '',
        equipment_name: '',
        quantity: 1,
        unit_price: '',
        total_amount: '',
        status: 'Pending',
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery: '',
        description: '',
        priority: 'Medium'
    })

    // Check if user is admin
    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard')
            return
        }
    }, [user, navigate])

    // Fetch orders
    const fetchOrders = async () => {
        try {
            setLoading(true)
            setError('')

            const response = await fetch(`${API_BASE_URL}/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch orders: ${response.status}`)
            }

            const result = await response.json()
            if (result.success) {
                setOrders(result.data || [])
                setFilteredOrders(result.data || [])
            } else {
                throw new Error(result.message || 'Failed to fetch orders')
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    // Create order
    const createOrder = async (orderData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            })

            if (!response.ok) {
                throw new Error(`Failed to create order: ${response.status}`)
            }

            const result = await response.json()
            if (result.success) {
                setOrders(prev => [result.data, ...prev])
                setFilteredOrders(prev => [result.data, ...prev])
                setShowCreateModal(false)
                resetForm()
                return { success: true }
            } else {
                throw new Error(result.message || 'Failed to create order')
            }
        } catch (error) {
            console.error('Error creating order:', error)
            return { success: false, error: error.message }
        }
    }

    // Update order
    const updateOrder = async (id, orderData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            })

            if (!response.ok) {
                throw new Error(`Failed to update order: ${response.status}`)
            }

            const result = await response.json()
            if (result.success) {
                setOrders(prev => prev.map(order =>
                    order.id === id ? result.data : order
                ))
                setFilteredOrders(prev => prev.map(order =>
                    order.id === id ? result.data : order
                ))
                setEditingOrder(null)
                setShowCreateModal(false)
                resetForm()
                return { success: true }
            } else {
                throw new Error(result.message || 'Failed to update order')
            }
        } catch (error) {
            console.error('Error updating order:', error)
            return { success: false, error: error.message }
        }
    }

    // Delete order
    const deleteOrder = async (id) => {
        if (!confirm('Are you sure you want to delete this order?')) return

        try {
            const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to delete order: ${response.status}`)
            }

            const result = await response.json()
            if (result.success) {
                setOrders(prev => prev.filter(order => order.id !== id))
                setFilteredOrders(prev => prev.filter(order => order.id !== id))
            } else {
                throw new Error(result.message || 'Failed to delete order')
            }
        } catch (error) {
            console.error('Error deleting order:', error)
            setError(error.message)
        }
    }

    // Reset form
    const resetForm = () => {
        setFormData({
            supplier: '',
            equipment_name: '',
            quantity: 1,
            unit_price: '',
            total_amount: '',
            status: 'Pending',
            order_date: new Date().toISOString().split('T')[0],
            expected_delivery: '',
            description: '',
            priority: 'Medium'
        })
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        const orderData = {
            ...formData,
            quantity: parseInt(formData.quantity),
            unit_price: parseFloat(formData.unit_price),
            total_amount: parseFloat(formData.total_amount),
            created_by: user.id
        }

        if (editingOrder) {
            const result = await updateOrder(editingOrder.id, orderData)
            if (!result.success) {
                setError(result.error)
            }
        } else {
            const result = await createOrder(orderData)
            if (!result.success) {
                setError(result.error)
            }
        }
    }

    // Filter orders
    const filterOrders = () => {
        let filtered = orders

        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.equipment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.id.toString().includes(searchTerm)
            )
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter)
        }

        setFilteredOrders(filtered)
        setCurrentPage(1)
    }

    // Calculate total amount
    const calculateTotal = () => {
        const quantity = parseFloat(formData.quantity) || 0
        const unitPrice = parseFloat(formData.unit_price) || 0
        const total = quantity * unitPrice
        setFormData(prev => ({ ...prev, total_amount: total.toFixed(2) }))
    }

    // Effects
    useEffect(() => {
        if (user?.role === 'admin') {
            fetchOrders()
        }
    }, [user])

    useEffect(() => {
        filterOrders()
    }, [searchTerm, statusFilter, orders])

    useEffect(() => {
        calculateTotal()
    }, [formData.quantity, formData.unit_price])

    // Pagination
    const indexOfLastOrder = currentPage * ordersPerPage
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

    // Status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800'
            case 'Approved': return 'bg-blue-100 text-blue-800'
            case 'Ordered': return 'bg-purple-100 text-purple-800'
            case 'Delivered': return 'bg-green-100 text-green-800'
            case 'Cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    // Priority badge color
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-800'
            case 'Medium': return 'bg-yellow-100 text-yellow-800'
            case 'Low': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading orders...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-blue-500 hover:underline mb-2"
                            >
                                ← Back to Dashboard
                            </button>
                            <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
                            <p className="text-gray-600">Manage equipment orders and procurement (Admin Only)</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Create New Order
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Error Display */}
                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{error}</span>
                        <button
                            className="absolute top-0 right-0 px-4 py-3"
                            onClick={() => setError('')}
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Search and Filter Controls */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Orders
                            </label>
                            <input
                                type="text"
                                placeholder="Search by supplier, equipment, or order ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Ordered">Ordered</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={fetchOrders}
                                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Supplier
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentOrders.length > 0 ? (
                                    currentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        Order #{order.id}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {order.equipment_name}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        Qty: {order.quantity}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{order.supplier}</div>
                                                <div className="text-xs text-gray-500">
                                                    {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    ${order.total_amount}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    ${order.unit_price} each
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                                                    {order.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingOrder(order)
                                                            setFormData({
                                                                supplier: order.supplier,
                                                                equipment_name: order.equipment_name,
                                                                quantity: order.quantity,
                                                                unit_price: order.unit_price,
                                                                total_amount: order.total_amount,
                                                                status: order.status,
                                                                order_date: order.order_date ? order.order_date.split('T')[0] : '',
                                                                expected_delivery: order.expected_delivery ? order.expected_delivery.split('T')[0] : '',
                                                                description: order.description || '',
                                                                priority: order.priority
                                                            })
                                                            setShowCreateModal(true)
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteOrder(order.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                            No orders found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-700">
                                    Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1 rounded ${currentPage === 1
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        Previous
                                    </button>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded">
                                        {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-1 rounded ${currentPage === totalPages
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Order Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingOrder ? 'Edit Order' : 'Create New Order'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Supplier
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.supplier}
                                            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Equipment Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.equipment_name}
                                            onChange={(e) => setFormData({ ...formData, equipment_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Quantity
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Unit Price ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            required
                                            value={formData.unit_price}
                                            onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Total Amount ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            readOnly
                                            value={formData.total_amount}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Ordered">Ordered</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Priority
                                        </label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Order Date
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.order_date}
                                            onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Expected Delivery
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.expected_delivery}
                                            onChange={(e) => setFormData({ ...formData, expected_delivery: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Additional details about the order..."
                                    />
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false)
                                            setEditingOrder(null)
                                            resetForm()
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                    >
                                        {editingOrder ? 'Update Order' : 'Create Order'}
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