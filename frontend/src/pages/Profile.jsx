// src/pages/Profile.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        employee_id: '',
        bio: '',
        avatar: null
    })

    const [bookingHistory, setBookingHistory] = useState([])
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    })

    const [notificationPreferences, setNotificationPreferences] = useState({
        email_notifications: true,
        booking_reminders: true,
        maintenance_alerts: false,
        system_updates: true
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [activeTab, setActiveTab] = useState('profile')
    const [avatarPreview, setAvatarPreview] = useState(null)

    const { user, token, updateUser } = useAuth()
    const navigate = useNavigate()
    const API_BASE_URL = '/api'

    const tabs = [
        { id: 'profile', name: 'Profile Information', icon: '👤' },
        { id: 'security', name: 'Security', icon: '🔒' },
        { id: 'notifications', name: 'Notifications', icon: '🔔' },
        { id: 'bookings', name: 'Booking History', icon: '📅' }
    ]

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        fetchProfile()
        fetchBookingHistory()
    }, [token, navigate])

    const fetchProfile = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const result = await response.json()
                setProfile(result.data)
                setNotificationPreferences(result.data.notification_preferences || notificationPreferences)
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            setError('Failed to fetch profile')
        } finally {
            setLoading(false)
        }
    }

    const fetchBookingHistory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/user/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const result = await response.json()
                setBookingHistory(result.data || [])
            }
        } catch (error) {
            console.error('Error fetching booking history:', error)
        }
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Avatar file size must be less than 5MB')
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result)
            }
            reader.readAsDataURL(file)
            setProfile(prev => ({ ...prev, avatar: file }))
        }
    }

    const saveProfile = async () => {
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            const formData = new FormData()
            Object.keys(profile).forEach(key => {
                if (profile[key] !== null && profile[key] !== undefined) {
                    formData.append(key, profile[key])
                }
            })

            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            if (response.ok) {
                const result = await response.json()
                setProfile(result.data)
                updateUser(result.data)
                setSuccess('Profile updated successfully')
                setTimeout(() => setSuccess(''), 3000)
            } else {
                const result = await response.json()
                setError(result.message || 'Failed to update profile')
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            setError('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const changePassword = async () => {
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setError('New passwords do not match')
            return
        }

        if (passwordForm.new_password.length < 8) {
            setError('New password must be at least 8 characters long')
            return
        }

        setSaving(true)
        setError('')

        try {
            const response = await fetch(`${API_BASE_URL}/profile/password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: passwordForm.current_password,
                    new_password: passwordForm.new_password
                })
            })

            if (response.ok) {
                setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
                setSuccess('Password changed successfully')
                setTimeout(() => setSuccess(''), 3000)
            } else {
                const result = await response.json()
                setError(result.message || 'Failed to change password')
            }
        } catch (error) {
            console.error('Error changing password:', error)
            setError('Failed to change password')
        } finally {
            setSaving(false)
        }
    }

    const saveNotificationPreferences = async () => {
        setSaving(true)
        setError('')

        try {
            const response = await fetch(`${API_BASE_URL}/profile/notifications`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(notificationPreferences)
            })

            if (response.ok) {
                setSuccess('Notification preferences updated')
                setTimeout(() => setSuccess(''), 3000)
            } else {
                setError('Failed to update notification preferences')
            }
        } catch (error) {
            console.error('Error updating preferences:', error)
            setError('Failed to update notification preferences')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        )
    }

    const renderProfileInfo = () => (
        <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {avatarPreview || profile.avatar_url ? (
                            <img
                                src={avatarPreview || profile.avatar_url}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                    </label>
                </div>
                <div>
                    <h3 className="text-lg font-medium text-gray-900">{profile.name || user.name}</h3>
                    <p className="text-sm text-gray-500">{profile.position}</p>
                    <p className="text-sm text-gray-500">{profile.department}</p>
                </div>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                    <input
                        type="text"
                        value={profile.employee_id}
                        onChange={(e) => setProfile(prev => ({ ...prev, employee_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                        type="text"
                        value={profile.department}
                        onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <input
                        type="text"
                        value={profile.position}
                        onChange={(e) => setProfile(prev => ({ ...prev, position: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex justify-end">
                <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>
        </div>
    )

    const renderSecurity = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input
                            type="password"
                            value={passwordForm.current_password}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                            type="password"
                            value={passwordForm.new_password}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            value={passwordForm.confirm_password}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        onClick={changePassword}
                        disabled={saving || !passwordForm.current_password || !passwordForm.new_password}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Changing...' : 'Change Password'}
                    </button>
                </div>
            </div>
        </div>
    )

    const renderNotifications = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                    {Object.entries(notificationPreferences).map(([key, value]) => (
                        <label key={key} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => setNotificationPreferences(prev => ({ ...prev, [key]: e.target.checked }))}
                                className="mr-3"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                        </label>
                    ))}
                </div>

                <button
                    onClick={saveNotificationPreferences}
                    disabled={saving}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
        </div>
    )

    const renderBookingHistory = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Your Booking History</h3>

            {bookingHistory.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bookingHistory.slice(0, 10).map((booking) => (
                                <tr key={booking.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {booking.equipment_name || booking.lab_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(booking.start_time).toLocaleDateString()} {' '}
                                        {new Date(booking.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {booking.purpose}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500">No booking history found</p>
                    <button
                        onClick={() => navigate('/bookings')}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Make Your First Booking
                    </button>
                </div>
            )}
        </div>
    )

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
                            <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
                {/* Status Messages */}
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

                {success && (
                    <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{success}</span>
                        <button
                            className="absolute top-0 right-0 px-4 py-3"
                            onClick={() => setSuccess('')}
                        >
                            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <nav className="bg-white rounded-lg shadow-sm overflow-hidden">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors ${activeTab === tab.id ? 'bg-blue-50 border-r-4 border-r-blue-500 text-blue-700' : 'text-gray-700'
                                        }`}
                                >
                                    <span className="mr-3">{tab.icon}</span>
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm p-6 h-full overflow-y-auto">
                            {activeTab === 'profile' && renderProfileInfo()}
                            {activeTab === 'security' && renderSecurity()}
                            {activeTab === 'notifications' && renderNotifications()}
                            {activeTab === 'bookings' && renderBookingHistory()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}