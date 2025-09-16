import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Base API URL - update this to match your backend
const API_BASE_URL = 'http://localhost:5000/api' // or your backend URL

function UserManagement() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showUserForm, setShowUserForm] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [stats, setStats] = useState({
        totalUsers: 0,
        students: 0,
        teachers: 0,
        admins: 0
    })
    const [filters, setFilters] = useState({
        search: '',
        role: '',
        status: ''
    })
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        role: 'student',
        password: ''
    })

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers()
        fetchUserStats()
    }, [])

    // Fetch users from backend
    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_BASE_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // if using JWT auth
                }
            })

            if (!response.ok) throw new Error('Failed to fetch users')

            const data = await response.json()
            setUsers(data)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching users:', err)
        } finally {
            setLoading(false)
        }
    }

    // Fetch user statistics
    const fetchUserStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/stats`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (!response.ok) throw new Error('Failed to fetch stats')

            const data = await response.json()
            setStats(data)
        } catch (err) {
            console.error('Error fetching stats:', err)
        }
    }

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target
        if (editingUser) {
            setEditingUser({ ...editingUser, [name]: value })
        } else {
            setNewUser({ ...newUser, [name]: value })
        }
    }

    // Handle user creation/update
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const url = editingUser
                ? `${API_BASE_URL}/users/${editingUser.id}`
                : `${API_BASE_URL}/users`

            const method = editingUser ? 'PUT' : 'POST'
            const userData = editingUser || newUser

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(userData)
            })

            if (!response.ok) throw new Error('Failed to save user')

            // Refresh user list
            await fetchUsers()
            await fetchUserStats()

            // Reset form
            setShowUserForm(false)
            setEditingUser(null)
            setNewUser({ name: '', email: '', role: 'student', password: '' })

            alert(editingUser ? 'User updated successfully!' : 'User created successfully!')
        } catch (err) {
            alert('Error saving user: ' + err.message)
            console.error('Error:', err)
        }
    }

    // Handle user edit
    const handleEdit = (user) => {
        setEditingUser({ ...user, password: '' }) // Don't include password in edit
        setShowUserForm(true)
    }

    // Handle password reset
    const handleResetPassword = async (userId) => {
        if (!window.confirm('Are you sure you want to reset this user\'s password?')) return

        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/reset-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (!response.ok) throw new Error('Failed to reset password')

            alert('Password reset email sent to user!')
        } catch (err) {
            alert('Error resetting password: ' + err.message)
            console.error('Error:', err)
        }
    }

    // Handle user deactivation/activation
    const handleToggleStatus = async (user) => {
        const action = user.status === 'Active' ? 'deactivate' : 'activate'
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return

        try {
            const response = await fetch(`${API_BASE_URL}/users/${user.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: user.status === 'Active' ? 'Inactive' : 'Active'
                })
            })

            if (!response.ok) throw new Error('Failed to update user status')

            await fetchUsers()
            alert(`User ${action}d successfully!`)
        } catch (err) {
            alert('Error updating user status: ' + err.message)
            console.error('Error:', err)
        }
    }

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters({ ...filters, [name]: value })
    }

    // Filter users based on search and filters
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            user.email.toLowerCase().includes(filters.search.toLowerCase())
        const matchesRole = !filters.role || user.role === filters.role
        const matchesStatus = !filters.status || user.status === filters.status

        return matchesSearch && matchesRole && matchesStatus
    })

    // Close form and reset
    const closeForm = () => {
        setShowUserForm(false)
        setEditingUser(null)
        setNewUser({ name: '', email: '', role: 'student', password: '' })
    }

    const getRoleColor = (role) => {
        switch (role) {
            case 'Admin': return 'bg-red-100 text-red-800'
            case 'Teacher': return 'bg-blue-100 text-blue-800'
            case 'Student': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusColor = (status) => {
        return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl">Loading users...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl text-red-600">Error: {error}</div>
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
                        <h1 className="text-2xl font-bold text-gray-800 mt-2">User Management</h1>
                    </div>
                    <button
                        onClick={() => setShowUserForm(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Add User
                    </button>
                </div>
            </div>

            <div className="p-6">
                {/* User Form Modal */}
                {showUserForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editingUser ? editingUser.name : newUser.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editingUser ? editingUser.email : newUser.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                                    <select
                                        name="role"
                                        value={editingUser ? editingUser.role : newUser.role}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="Student">Student</option>
                                        <option value="Teacher">Teacher</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                {!editingUser && (
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={newUser.password}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                            required={!editingUser}
                                        />
                                    </div>
                                )}
                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={closeForm}
                                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        {editingUser ? 'Update User' : 'Add User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-semibold text-gray-700">Students</h3>
                        <p className="text-3xl font-bold text-green-600">{stats.students}</p>
                    </div>
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-semibold text-gray-700">Teachers</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.teachers}</p>
                    </div>
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-semibold text-gray-700">Admins</h3>
                        <p className="text-3xl font-bold text-red-600">{stats.admins}</p>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white p-4 rounded shadow mb-6">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            name="search"
                            placeholder="Search users..."
                            value={filters.search}
                            onChange={handleFilterChange}
                            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                        />
                        <select
                            name="role"
                            value={filters.role}
                            onChange={handleFilterChange}
                            className="px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                        >
                            <option value="">All Roles</option>
                            <option value="Student">Student</option>
                            <option value="Teacher">Teacher</option>
                            <option value="Admin">Admin</option>
                        </select>
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {new Date(user.lastLogin).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="text-blue-500 hover:underline mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleResetPassword(user.id)}
                                                className="text-green-500 hover:underline mr-4"
                                            >
                                                Reset Password
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                className="text-red-500 hover:underline"
                                            >
                                                {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* User Permissions */}
                <div className="mt-6 bg-white rounded shadow p-6">
                    <h2 className="text-lg font-bold mb-4">Role Permissions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="border rounded p-4">
                            <h3 className="font-bold text-red-600 mb-2">Admin</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Full system access</li>
                                <li>• Manage all users</li>
                                <li>• View all reports</li>
                                <li>• System configuration</li>
                            </ul>
                        </div>
                        <div className="border rounded p-4">
                            <h3 className="font-bold text-blue-600 mb-2">Teacher</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Manage equipment bookings</li>
                                <li>• View student activity</li>
                                <li>• Generate reports</li>
                                <li>• Approve student requests</li>
                            </ul>
                        </div>
                        <div className="border rounded p-4">
                            <h3 className="font-bold text-green-600 mb-2">Student</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Book available equipment</li>
                                <li>• View own bookings</li>
                                <li>• Submit maintenance requests</li>
                                <li>• Limited access to reports</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserManagement