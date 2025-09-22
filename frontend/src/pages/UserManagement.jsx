import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usersAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext' // Make sure you have this

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

    const navigate = useNavigate()
    const { user, isAuthenticated, logout } = useAuth()

    // Check authentication on component mount
    useEffect(() => {
        checkAuthentication()
    }, [])

    // Fetch data only if authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            // Check if user has permission to access user management
            if (user.role === 'admin' || user.role === 'teacher') {
                fetchUsers()
                fetchUserStats()
            } else {
                setError('You do not have permission to access user management')
                setLoading(false)
            }
        }
    }, [isAuthenticated, user])

    const checkAuthentication = () => {
        const token = localStorage.getItem('token')

        if (!token) {
            console.log('❌ No token found, redirecting to login')
            navigate('/login')
            return
        }

        // Check if token is expired
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            const currentTime = Date.now() / 1000

            if (payload.exp < currentTime) {
                console.log('❌ Token expired, redirecting to login')
                logout()
                navigate('/login')
                return
            }

            console.log('✅ Valid token found for user:', payload.email)
        } catch (error) {
            console.log('❌ Invalid token, redirecting to login')
            logout()
            navigate('/login')
            return
        }
    }

    const fetchUsers = async () => {
        try {
            setLoading(true)
            setError(null)
            console.log('👥 Fetching users...')

            const data = await usersAPI.getAll()
            setUsers(data)
            console.log(`✅ Found ${data.length} users`)
        } catch (err) {
            console.error('Error fetching users:', err)

            // Handle authentication errors
            if (err.message.includes('401') || err.message.includes('Unauthorized')) {
                console.log('🔓 Authentication failed, redirecting to login')
                logout()
                navigate('/login')
                return
            }

            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchUserStats = async () => {
        try {
            console.log('📊 Fetching user stats...')
            const data = await usersAPI.getStats()
            setStats(data)
            console.log('✅ User stats loaded')
        } catch (err) {
            console.error('Error fetching stats:', err)

            if (err.message.includes('401') || err.message.includes('Unauthorized')) {
                logout()
                navigate('/login')
                return
            }
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        if (editingUser) {
            setEditingUser({ ...editingUser, [name]: value })
        } else {
            setNewUser({ ...newUser, [name]: value })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const userData = editingUser || newUser

            console.log('💾 Saving user:', userData.name)

            if (editingUser) {
                await usersAPI.update(editingUser.id, userData)
                console.log('✅ User updated successfully')
            } else {
                await usersAPI.create(userData)
                console.log('✅ User created successfully')
            }

            await fetchUsers()
            await fetchUserStats()

            setShowUserForm(false)
            setEditingUser(null)
            setNewUser({ name: '', email: '', role: 'student', password: '' })

            alert(editingUser ? 'User updated successfully!' : 'User created successfully!')
        } catch (err) {
            console.error('Error saving user:', err)

            if (err.message.includes('401') || err.message.includes('Unauthorized')) {
                logout()
                navigate('/login')
                return
            }

            alert('Error saving user: ' + err.message)
        }
    }

    const handleEdit = (user) => {
        setEditingUser({ ...user, password: '' })
        setShowUserForm(true)
    }

    const handleResetPassword = async (userId) => {
        if (!window.confirm('Are you sure you want to reset this user\'s password?')) return

        try {
            console.log('🔐 Resetting password for user:', userId)
            await usersAPI.resetPassword(userId)
            alert('Password reset email sent to user!')
            console.log('✅ Password reset successful')
        } catch (err) {
            console.error('Error resetting password:', err)

            if (err.message.includes('401') || err.message.includes('Unauthorized')) {
                logout()
                navigate('/login')
                return
            }

            alert('Error resetting password: ' + err.message)
        }
    }

    const handleToggleStatus = async (user) => {
        const action = user.status === 'Active' ? 'deactivate' : 'activate'
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return

        try {
            const newStatus = user.status === 'Active' ? 'Inactive' : 'Active'
            console.log(`🔄 ${action}ing user:`, user.name)

            await usersAPI.updateStatus(user.id, newStatus)
            await fetchUsers()

            alert(`User ${action}d successfully!`)
            console.log('✅ User status updated')
        } catch (err) {
            console.error('Error updating user status:', err)

            if (err.message.includes('401') || err.message.includes('Unauthorized')) {
                logout()
                navigate('/login')
                return
            }

            alert('Error updating user status: ' + err.message)
        }
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters({ ...filters, [name]: value })
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            user.email.toLowerCase().includes(filters.search.toLowerCase())
        const matchesRole = !filters.role || user.role === filters.role
        const matchesStatus = !filters.status || user.status === filters.status

        return matchesSearch && matchesRole && matchesStatus
    })

    const closeForm = () => {
        setShowUserForm(false)
        setEditingUser(null)
        setNewUser({ name: '', email: '', role: 'student', password: '' })
    }

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800'
            case 'teacher': return 'bg-blue-100 text-blue-800'
            case 'student': return 'bg-green-100 text-green-800'
            case 'lab_assistant': return 'bg-purple-100 text-purple-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusColor = (status) => {
        return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-xl mb-4">Loading...</div>
                    <div className="text-sm text-gray-600">
                        {!isAuthenticated ? 'Checking authentication...' : 'Loading users...'}
                    </div>
                </div>
            </div>
        )
    }

    // Show error if user doesn't have permission
    if (error && error.includes('permission')) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-xl text-red-600 mb-4">Access Denied</div>
                    <div className="text-gray-600 mb-4">{error}</div>
                    <Link
                        to="/dashboard"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    // Show error with retry option
    if (error && !error.includes('permission')) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-xl text-red-600 mb-4">Error: {error}</div>
                    <div className="space-x-2">
                        <button
                            onClick={fetchUsers}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Retry
                        </button>
                        <Link
                            to="/dashboard"
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
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
                        <Link to="/admin-dashboard" className="text-blue-500 hover:underline">← Dashboard</Link>
                        <h1 className="text-2xl font-bold text-gray-800 mt-2">User Management</h1>
                        <p className="text-sm text-gray-600">
                            Logged in as: {user?.name} ({user?.role})
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {user?.role === 'admin' && (
                            <button
                                onClick={() => setShowUserForm(true)}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Add User
                            </button>
                        )}
                        <button
                            onClick={logout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* User Form Modal - Only for Admins */}
                {showUserForm && user?.role === 'admin' && (
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
                                        <option value="student">Student</option>
                                        <option value="teacher">Teacher</option>
                                        <option value="lab_assistant">Lab Assistant</option>
                                        <option value="admin">Admin</option>
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
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="lab_assistant">Lab Assistant</option>
                            <option value="admin">Admin</option>
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
                                {user?.role === 'admin' && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((userItem) => (
                                    <tr key={userItem.id}>
                                        <td className="px-6 py-4 text-sm text-gray-900">{userItem.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{userItem.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{userItem.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(userItem.role)}`}>
                                                {userItem.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(userItem.status)}`}>
                                                {userItem.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {userItem.lastLogin ? new Date(userItem.lastLogin).toLocaleDateString() : 'Never'}
                                        </td>
                                        {user?.role === 'admin' && (
                                            <td className="px-6 py-4 text-sm">
                                                <button
                                                    onClick={() => handleEdit(userItem)}
                                                    className="text-blue-500 hover:underline mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleResetPassword(userItem.id)}
                                                    className="text-green-500 hover:underline mr-4"
                                                >
                                                    Reset Password
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(userItem)}
                                                    className="text-red-500 hover:underline"
                                                >
                                                    {userItem.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={user?.role === 'admin' ? "7" : "6"} className="px-6 py-4 text-center text-gray-500">
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                            <h3 className="font-bold text-purple-600 mb-2">Lab Assistant</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Equipment maintenance</li>
                                <li>• Inventory management</li>
                                <li>• Basic user support</li>
                                <li>• Equipment checkout</li>
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