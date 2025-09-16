// src/pages/Notifications.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Notifications() {
    // Initial mock data for notifications
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'booking',
            title: 'Booking Confirmation',
            message: 'Your booking for Computer-001 has been confirmed for August 12, 2024 at 09:00 AM',
            time: '2 minutes ago',
            read: false,
            priority: 'normal'
        },
        {
            id: 2,
            type: 'maintenance',
            title: 'Maintenance Alert',
            message: 'Printer-003 maintenance scheduled for tomorrow at 2:00 PM',
            time: '1 hour ago',
            read: false,
            priority: 'high'
        },
        {
            id: 3,
            type: 'system',
            title: 'System Update',
            message: 'Lab management system will undergo maintenance tonight from 12:00 AM to 2:00 AM',
            time: '3 hours ago',
            read: true,
            priority: 'normal'
        },
        {
            id: 4,
            type: 'equipment',
            title: 'Equipment Available',
            message: 'Computer-002 is now available for booking',
            time: '5 hours ago',
            read: true,
            priority: 'low'
        },
        {
            id: 5,
            type: 'reminder',
            title: 'Booking Reminder',
            message: 'Your booking for Projector-001 starts in 30 minutes',
            time: '1 day ago',
            read: false,
            priority: 'high'
        }
    ])

    const [settings, setSettings] = useState({
        booking_confirmations: true,
        maintenance_alerts: true,
        equipment_availability: false,
        system_updates: true,
        notification_method: 'email'
    })

    const [filter, setFilter] = useState('all')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [settingsSaved, setSettingsSaved] = useState(false)

    const { token } = useAuth()

    // Uncomment this when your backend is ready
    /*
    useEffect(() => {
        // Function to fetch notifications from API
        const fetchNotifications = async () => {
            if (!token) return;
            
            try {
                setLoading(true);
                const response = await fetch('/api/notifications', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch notifications');
                }
                
                const data = await response.json();
                if (data.success) {
                    setNotifications(data.data.notifications);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
                setError('Failed to load notifications');
            } finally {
                setLoading(false);
            }
        };
        
        fetchNotifications();
    }, [token]);
    */

    // Mark a notification as read
    const markAsRead = (id) => {
        // For now, just update the local state
        setNotifications(notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
        ));

        // When backend is ready, uncomment:
        /*
        const markNotificationAsRead = async (id) => {
            try {
                const response = await fetch(`/api/notifications/${id}/read`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to mark notification as read');
                }
            } catch (error) {
                console.error('Error marking notification as read:', error);
                setError('Failed to update notification');
            }
        };
        
        markNotificationAsRead(id);
        */
    }

    // Mark all notifications as read
    const markAllAsRead = () => {
        // For now, just update the local state
        setNotifications(notifications.map(notification => ({ ...notification, read: true })));

        // When backend is ready, uncomment:
        /*
        const markAllNotificationsAsRead = async () => {
            try {
                const response = await fetch('/api/notifications/mark-all-read', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to mark all notifications as read');
                }
            } catch (error) {
                console.error('Error marking all notifications as read:', error);
                setError('Failed to update notifications');
            }
        };
        
        markAllNotificationsAsRead();
        */
    }

    // Delete a notification
    const deleteNotification = (id) => {
        // For now, just update the local state
        setNotifications(notifications.filter(notification => notification.id !== id));

        // When backend is ready, uncomment:
        /*
        const deleteNotificationFromAPI = async (id) => {
            try {
                const response = await fetch(`/api/notifications/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete notification');
                }
            } catch (error) {
                console.error('Error deleting notification:', error);
                setError('Failed to delete notification');
            }
        };
        
        deleteNotificationFromAPI(id);
        */
    }

    // Clear all notifications
    const clearAllNotifications = () => {
        // For now, just update the local state
        setNotifications([]);

        // When backend is ready, uncomment:
        /*
        const clearAllNotificationsFromAPI = async () => {
            try {
                const response = await fetch('/api/notifications', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to clear all notifications');
                }
            } catch (error) {
                console.error('Error clearing all notifications:', error);
                setError('Failed to clear notifications');
            }
        };
        
        clearAllNotificationsFromAPI();
        */
    }

    // Save notification settings
    const saveNotificationSettings = () => {
        // Show success message
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);

        // When backend is ready, uncomment:
        /*
        const saveSettingsToAPI = async () => {
            try {
                const response = await fetch('/api/notifications/settings', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(settings)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to save notification settings');
                }
                
                setSettingsSaved(true);
                setTimeout(() => setSettingsSaved(false), 3000);
            } catch (error) {
                console.error('Error saving settings:', error);
                setError('Failed to save settings');
            }
        };
        
        saveSettingsToAPI();
        */
    }

    // Handle settings changes
    const handleSettingChange = (setting, value) => {
        setSettings(prev => ({
            ...prev,
            [setting]: value
        }));
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'booking':
                return '📅'
            case 'maintenance':
                return '🔧'
            case 'system':
                return '⚙️'
            case 'equipment':
                return '💻'
            case 'reminder':
                return '⏰'
            default:
                return '📢'
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'border-l-red-500'
            case 'normal':
                return 'border-l-blue-500'
            case 'low':
                return 'border-l-gray-400'
            default:
                return 'border-l-gray-400'
        }
    }

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true
        if (filter === 'unread') return !notification.read
        return notification.type === filter
    })

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="px-6 py-4 flex justify-between items-center">
                    <div>
                        <Link to="/dashboard" className="text-blue-500 hover:underline">← Dashboard</Link>
                        <h1 className="text-2xl font-bold text-gray-800 mt-2">
                            Notifications {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full ml-2">
                                    {unreadCount}
                                </span>
                            )}
                        </h1>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={markAllAsRead}
                            className="text-blue-500 hover:underline"
                            disabled={unreadCount === 0}
                        >Mark All Read</button>
                        <button
                            onClick={clearAllNotifications}
                            className="text-red-500 hover:underline"
                            disabled={notifications.length === 0}
                        >Clear All</button>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Error Display */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
                        {error}
                        <button
                            onClick={() => setError('')}
                            className="absolute top-0 right-0 px-4 py-3"
                        >
                            <span className="text-red-500 font-semibold">×</span>
                        </button>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="bg-white rounded shadow mb-6">
                    <div className="flex overflow-x-auto">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-6 py-3 font-medium ${filter === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-6 py-3 font-medium ${filter === 'unread' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                        >
                            Unread ({unreadCount})
                        </button>
                        <button
                            onClick={() => setFilter('booking')}
                            className={`px-6 py-3 font-medium ${filter === 'booking' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                        >
                            Bookings
                        </button>
                        <button
                            onClick={() => setFilter('maintenance')}
                            className={`px-6 py-3 font-medium ${filter === 'maintenance' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                        >
                            Maintenance
                        </button>
                        <button
                            onClick={() => setFilter('system')}
                            className={`px-6 py-3 font-medium ${filter === 'system' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                        >
                            System
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`bg-white rounded shadow p-6 border-l-4 ${getPriorityColor(notification.priority)} ${!notification.read ? 'bg-blue-50' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                    <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {notification.title}
                                            </h3>
                                            {!notification.read && (
                                                <span className="bg-blue-500 w-2 h-2 rounded-full"></span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 mt-1">{notification.message}</p>
                                        <p className="text-sm text-gray-500 mt-2">{notification.time}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    {!notification.read && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="text-blue-500 hover:underline text-sm"
                                        >
                                            Mark Read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="text-red-500 hover:underline text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredNotifications.length === 0 && (
                        <div className="bg-white rounded shadow p-12 text-center">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                            <p className="text-gray-600">You're all caught up! No new notifications to show.</p>
                        </div>
                    )}
                </div>

                {/* Notification Settings */}
                <div className="mt-8 bg-white rounded shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">Notification Settings</h2>
                        {settingsSaved && (
                            <span className="text-green-600 text-sm">Settings saved successfully!</span>
                        )}
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Booking Confirmations</h4>
                                <p className="text-sm text-gray-600">Get notified when bookings are confirmed or cancelled</p>
                            </div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.booking_confirmations}
                                    onChange={(e) => handleSettingChange('booking_confirmations', e.target.checked)}
                                    className="mr-2"
                                />
                                <span className="text-sm">Enable</span>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Maintenance Alerts</h4>
                                <p className="text-sm text-gray-600">Get notified about scheduled maintenance</p>
                            </div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.maintenance_alerts}
                                    onChange={(e) => handleSettingChange('maintenance_alerts', e.target.checked)}
                                    className="mr-2"
                                />
                                <span className="text-sm">Enable</span>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Equipment Availability</h4>
                                <p className="text-sm text-gray-600">Get notified when equipment becomes available</p>
                            </div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.equipment_availability}
                                    onChange={(e) => handleSettingChange('equipment_availability', e.target.checked)}
                                    className="mr-2"
                                />
                                <span className="text-sm">Enable</span>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">System Updates</h4>
                                <p className="text-sm text-gray-600">Get notified about system maintenance and updates</p>
                            </div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.system_updates}
                                    onChange={(e) => handleSettingChange('system_updates', e.target.checked)}
                                    className="mr-2"
                                />
                                <span className="text-sm">Enable</span>
                            </label>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h4 className="font-medium mb-2">Notification Method</h4>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="method"
                                    checked={settings.notification_method === 'email'}
                                    onChange={() => handleSettingChange('notification_method', 'email')}
                                    className="mr-2"
                                />
                                <span className="text-sm">Email notifications</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="method"
                                    checked={settings.notification_method === 'sms'}
                                    onChange={() => handleSettingChange('notification_method', 'sms')}
                                    className="mr-2"
                                />
                                <span className="text-sm">SMS notifications</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="method"
                                    checked={settings.notification_method === 'both'}
                                    onChange={() => handleSettingChange('notification_method', 'both')}
                                    className="mr-2"
                                />
                                <span className="text-sm">Both email and SMS</span>
                            </label>
                        </div>
                    </div>
                    <button
                        onClick={saveNotificationSettings}
                        className="mt-6 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Notifications