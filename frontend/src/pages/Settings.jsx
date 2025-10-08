// src/pages/Settings.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Settings() {
    const [settings, setSettings] = useState({
        lab_name: '',
        organization: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        operating_hours: {
            monday: { open: '08:00', close: '18:00', closed: false },
            tuesday: { open: '08:00', close: '18:00', closed: false },
            wednesday: { open: '08:00', close: '18:00', closed: false },
            thursday: { open: '08:00', close: '18:00', closed: false },
            friday: { open: '08:00', close: '18:00', closed: false },
            saturday: { open: '09:00', close: '15:00', closed: false },
            sunday: { open: '09:00', close: '15:00', closed: true }
        },
        booking_rules: {
            max_booking_duration: 8,
            advance_booking_days: 30,
            cancellation_hours: 24,
            auto_approve_bookings: false,
            require_approval_for_equipment: true
        },
        notification_settings: {
            email_notifications: true,
            booking_confirmations: true,
            maintenance_reminders: true,
            incident_alerts: true,
            daily_digest: false
        },
        maintenance_settings: {
            default_maintenance_interval: 30,
            require_maintenance_approval: true,
            auto_schedule_maintenance: false,
            maintenance_buffer_days: 3
        },
        security_settings: {
            session_timeout: 60,
            require_2fa: false,
            password_expiry_days: 90,
            max_login_attempts: 5
        }
    })

    const [holidays, setHolidays] = useState([])
    const [newHoliday, setNewHoliday] = useState({ date: '', name: '', description: '' })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [activeTab, setActiveTab] = useState('general')

    const { user, token } = useAuth()
    const navigate = useNavigate()
    const API_BASE_URL = '/api'

    const tabs = [
        { id: 'general', name: 'General', icon: '⚙️' },
        { id: 'hours', name: 'Operating Hours', icon: '🕒' },
        { id: 'booking', name: 'Booking Rules', icon: '📅' },
        { id: 'notifications', name: 'Notifications', icon: '🔔' },
        { id: 'maintenance', name: 'Maintenance', icon: '🔧' },
        { id: 'security', name: 'Security', icon: '🔒' },
        { id: 'holidays', name: 'Holidays', icon: '🎉' }
    ]

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        if (user?.role !== 'admin') {
            navigate('/dashboard')
            return
        }
        fetchSettings()
        fetchHolidays()
    }, [token, user, navigate])

    const fetchSettings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const result = await response.json()
                if (result.data) {
                    setSettings(prev => ({ ...prev, ...result.data }))
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
            setError('Failed to fetch settings')
        } finally {
            setLoading(false)
        }
    }

    const fetchHolidays = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/settings/holidays`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const result = await response.json()
                setHolidays(result.data || [])
            }
        } catch (error) {
            console.error('Error fetching holidays:', error)
        }
    }

    const saveSettings = async () => {
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            const response = await fetch(`${API_BASE_URL}/settings`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            })

            if (response.ok) {
                setSuccess('Settings saved successfully')
                setTimeout(() => setSuccess(''), 3000)
            } else {
                const result = await response.json()
                setError(result.message || 'Failed to save settings')
            }
        } catch (error) {
            console.error('Error saving settings:', error)
            setError('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    const addHoliday = async () => {
        if (!newHoliday.date || !newHoliday.name) return

        try {
            const response = await fetch(`${API_BASE_URL}/settings/holidays`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newHoliday)
            })

            if (response.ok) {
                await fetchHolidays()
                setNewHoliday({ date: '', name: '', description: '' })
            } else {
                setError('Failed to add holiday')
            }
        } catch (error) {
            console.error('Error adding holiday:', error)
            setError('Failed to add holiday')
        }
    }

    const deleteHoliday = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/settings/holidays/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                await fetchHolidays()
            } else {
                setError('Failed to delete holiday')
            }
        } catch (error) {
            console.error('Error deleting holiday:', error)
            setError('Failed to delete holiday')
        }
    }

    const updateOperatingHours = (day, field, value) => {
        setSettings(prev => ({
            ...prev,
            operating_hours: {
                ...prev.operating_hours,
                [day]: {
                    ...prev.operating_hours[day],
                    [field]: value
                }
            }
        }))
    }

    const updateBookingRules = (field, value) => {
        setSettings(prev => ({
            ...prev,
            booking_rules: {
                ...prev.booking_rules,
                [field]: value
            }
        }))
    }

    const updateNotificationSettings = (field, value) => {
        setSettings(prev => ({
            ...prev,
            notification_settings: {
                ...prev.notification_settings,
                [field]: value
            }
        }))
    }

    const updateMaintenanceSettings = (field, value) => {
        setSettings(prev => ({
            ...prev,
            maintenance_settings: {
                ...prev.maintenance_settings,
                [field]: value
            }
        }))
    }

    const updateSecuritySettings = (field, value) => {
        setSettings(prev => ({
            ...prev,
            security_settings: {
                ...prev.security_settings,
                [field]: value
            }
        }))
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading settings...</p>
                </div>
            </div>
        )
    }

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lab Name</label>
                    <input
                        type="text"
                        value={settings.lab_name}
                        onChange={(e) => setSettings(prev => ({ ...prev, lab_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                    <input
                        type="text"
                        value={settings.organization}
                        onChange={(e) => setSettings(prev => ({ ...prev, organization: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                    rows={3}
                    value={settings.address}
                    onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                        type="url"
                        value={settings.website}
                        onChange={(e) => setSettings(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    )

    const renderOperatingHours = () => (
        <div className="space-y-4">
            {Object.entries(settings.operating_hours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-24">
                        <span className="text-sm font-medium text-gray-700 capitalize">{day}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={!hours.closed}
                                onChange={(e) => updateOperatingHours(day, 'closed', !e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-600">Open</span>
                        </label>
                    </div>
                    {!hours.closed && (
                        <>
                            <div>
                                <input
                                    type="time"
                                    value={hours.open}
                                    onChange={(e) => updateOperatingHours(day, 'open', e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                            </div>
                            <span className="text-gray-500">to</span>
                            <div>
                                <input
                                    type="time"
                                    value={hours.close}
                                    onChange={(e) => updateOperatingHours(day, 'close', e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                            </div>
                        </>
                    )}
                    {hours.closed && (
                        <span className="text-red-500 text-sm">Closed</span>
                    )}
                </div>
            ))}
        </div>
    )

    const renderBookingRules = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Booking Duration (hours)</label>
                    <input
                        type="number"
                        min="1"
                        max="24"
                        value={settings.booking_rules.max_booking_duration}
                        onChange={(e) => updateBookingRules('max_booking_duration', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Advance Booking Days</label>
                    <input
                        type="number"
                        min="1"
                        max="365"
                        value={settings.booking_rules.advance_booking_days}
                        onChange={(e) => updateBookingRules('advance_booking_days', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Notice (hours)</label>
                <input
                    type="number"
                    min="1"
                    max="168"
                    value={settings.booking_rules.cancellation_hours}
                    onChange={(e) => updateBookingRules('cancellation_hours', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="space-y-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={settings.booking_rules.auto_approve_bookings}
                        onChange={(e) => updateBookingRules('auto_approve_bookings', e.target.checked)}
                        className="mr-3"
                    />
                    <span className="text-sm font-medium text-gray-700">Auto-approve all bookings</span>
                </label>

                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={settings.booking_rules.require_approval_for_equipment}
                        onChange={(e) => updateBookingRules('require_approval_for_equipment', e.target.checked)}
                        className="mr-3"
                    />
                    <span className="text-sm font-medium text-gray-700">Require approval for equipment bookings</span>
                </label>
            </div>
        </div>
    )

    const renderNotificationSettings = () => (
        <div className="space-y-4">
            {Object.entries(settings.notification_settings).map(([key, value]) => (
                <label key={key} className="flex items-center">
                    <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateNotificationSettings(key, e.target.checked)}
                        className="mr-3"
                    />
                    <span className="text-sm font-medium text-gray-700">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                </label>
            ))}
        </div>
    )

    const renderMaintenanceSettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Maintenance Interval (days)</label>
                    <input
                        type="number"
                        min="1"
                        max="365"
                        value={settings.maintenance_settings.default_maintenance_interval}
                        onChange={(e) => updateMaintenanceSettings('default_maintenance_interval', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Buffer Days</label>
                    <input
                        type="number"
                        min="0"
                        max="30"
                        value={settings.maintenance_settings.maintenance_buffer_days}
                        onChange={(e) => updateMaintenanceSettings('maintenance_buffer_days', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={settings.maintenance_settings.require_maintenance_approval}
                        onChange={(e) => updateMaintenanceSettings('require_maintenance_approval', e.target.checked)}
                        className="mr-3"
                    />
                    <span className="text-sm font-medium text-gray-700">Require approval for maintenance schedules</span>
                </label>

                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={settings.maintenance_settings.auto_schedule_maintenance}
                        onChange={(e) => updateMaintenanceSettings('auto_schedule_maintenance', e.target.checked)}
                        className="mr-3"
                    />
                    <span className="text-sm font-medium text-gray-700">Auto-schedule recurring maintenance</span>
                </label>
            </div>
        </div>
    )

    const renderSecuritySettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <input
                        type="number"
                        min="5"
                        max="480"
                        value={settings.security_settings.session_timeout}
                        onChange={(e) => updateSecuritySettings('session_timeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                    <input
                        type="number"
                        min="30"
                        max="365"
                        value={settings.security_settings.password_expiry_days}
                        onChange={(e) => updateSecuritySettings('password_expiry_days', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                <input
                    type="number"
                    min="3"
                    max="10"
                    value={settings.security_settings.max_login_attempts}
                    onChange={(e) => updateSecuritySettings('max_login_attempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={settings.security_settings.require_2fa}
                        onChange={(e) => updateSecuritySettings('require_2fa', e.target.checked)}
                        className="mr-3"
                    />
                    <span className="text-sm font-medium text-gray-700">Require Two-Factor Authentication</span>
                </label>
            </div>
        </div>
    )

    const renderHolidays = () => (
        <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Add New Holiday</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="date"
                        value={newHoliday.date}
                        onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        placeholder="Holiday name"
                        value={newHoliday.name}
                        onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={addHoliday}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Add Holiday
                    </button>
                </div>
                <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newHoliday.description}
                    onChange={(e) => setNewHoliday(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="space-y-2">
                {holidays.map((holiday) => (
                    <div key={holiday.id} className="flex items-center justify-between p-3 bg-white border rounded-md">
                        <div>
                            <span className="font-medium text-gray-900">{holiday.name}</span>
                            <span className="ml-2 text-sm text-gray-600">
                                {new Date(holiday.date).toLocaleDateString()}
                            </span>
                            {holiday.description && (
                                <div className="text-sm text-gray-500">{holiday.description}</div>
                            )}
                        </div>
                        <button
                            onClick={() => deleteHoliday(holiday.id)}
                            className="text-red-600 hover:text-red-700"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                ))}
                {holidays.length === 0 && (
                    <div className="text-center py-4 text-gray-500">No holidays configured</div>
                )}
            </div>
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
                            <h1 className="text-xl font-semibold text-gray-900">System Settings</h1>
                        </div>
                        <button
                            onClick={saveSettings}
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
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
                            <h2 className="text-lg font-medium text-gray-900 mb-6">
                                {tabs.find(tab => tab.id === activeTab)?.name} Settings
                            </h2>

                            {activeTab === 'general' && renderGeneralSettings()}
                            {activeTab === 'hours' && renderOperatingHours()}
                            {activeTab === 'booking' && renderBookingRules()}
                            {activeTab === 'notifications' && renderNotificationSettings()}
                            {activeTab === 'maintenance' && renderMaintenanceSettings()}
                            {activeTab === 'security' && renderSecuritySettings()}
                            {activeTab === 'holidays' && renderHolidays()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}