// src/pages/Calendar.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Calendar() {
    const [bookings, setBookings] = useState([])
    const [equipment, setEquipment] = useState([])
    const [labs, setLabs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState('month') // month, week, day
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [showModal, setShowModal] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)

    const { user, token } = useAuth()
    const navigate = useNavigate()
    const API_BASE_URL = '/api'

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        fetchData()
    }, [token, navigate])

    const fetchData = async () => {
        setLoading(true)
        try {
            await Promise.all([
                fetchBookings(),
                fetchEquipment(),
                fetchLabs()
            ])
        } catch (error) {
            setError('Failed to load calendar data')
        } finally {
            setLoading(false)
        }
    }

    const fetchBookings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const result = await response.json()
                setBookings(result.data || [])
            }
        } catch (error) {
            console.error('Error fetching bookings:', error)
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

    const fetchLabs = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/labs`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const result = await response.json()
                setLabs(result.data?.labs || result.data || [])
            }
        } catch (error) {
            console.error('Error fetching labs:', error)
        }
    }

    // Calendar helper functions
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const formatDate = (date) => {
        return date.toISOString().split('T')[0]
    }

    const isSameDay = (date1, date2) => {
        return formatDate(date1) === formatDate(date2)
    }

    const getBookingsForDate = (date) => {
        return bookings.filter(booking => {
            const bookingStart = new Date(booking.start_time)
            const bookingEnd = new Date(booking.end_time)
            return date >= bookingStart.setHours(0, 0, 0, 0) && date <= bookingEnd.setHours(23, 59, 59, 999)
        })
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-500'
            case 'Pending': return 'bg-yellow-500'
            case 'Cancelled': return 'bg-red-500'
            case 'Completed': return 'bg-blue-500'
            default: return 'bg-gray-500'
        }
    }

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate)
        newDate.setMonth(newDate.getMonth() + direction)
        setCurrentDate(newDate)
    }

    const navigateWeek = (direction) => {
        const newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() + (direction * 7))
        setCurrentDate(newDate)
    }

    const navigateDay = (direction) => {
        const newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() + direction)
        setCurrentDate(newDate)
    }

    const handleBookingClick = (booking) => {
        setSelectedBooking(booking)
        setShowModal(true)
    }

    const updateBookingStatus = async (bookingId, newStatus) => {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (response.ok) {
                await fetchBookings()
                setShowModal(false)
            } else {
                setError('Failed to update booking status')
            }
        } catch (error) {
            console.error('Error updating booking:', error)
            setError('Failed to update booking status')
        }
    }

    const renderMonthView = () => {
        const daysInMonth = getDaysInMonth(currentDate)
        const firstDay = getFirstDayOfMonth(currentDate)
        const days = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 border border-gray-200"></div>)
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const dayBookings = getBookingsForDate(date)
            const isToday = isSameDay(date, new Date())
            const isSelected = isSameDay(date, selectedDate)

            days.push(
                <div
                    key={day}
                    className={`h-32 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 ${isToday ? 'bg-blue-50' : ''
                        } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedDate(date)}
                >
                    <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                        {day}
                    </div>
                    <div className="mt-1 space-y-1">
                        {dayBookings.slice(0, 3).map((booking, index) => {
                            const equipmentItem = equipment.find(eq => eq.id === booking.equipment_id)
                            const lab = labs.find(l => l.id === booking.lab_id)

                            return (
                                <div
                                    key={booking.id}
                                    className={`text-xs p-1 rounded text-white cursor-pointer ${getStatusColor(booking.status)}`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleBookingClick(booking)
                                    }}
                                    title={`${equipmentItem?.name || lab?.name} - ${booking.status}`}
                                >
                                    {equipmentItem?.name || lab?.name || 'Booking'}
                                </div>
                            )
                        })}
                        {dayBookings.length > 3 && (
                            <div className="text-xs text-gray-500">
                                +{dayBookings.length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            )
        }

        return (
            <div className="grid grid-cols-7 gap-0 h-full">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700 border border-gray-200">
                        {day}
                    </div>
                ))}
                {days}
            </div>
        )
    }

    const renderWeekView = () => {
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

        const weekDays = []
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek)
            date.setDate(startOfWeek.getDate() + i)
            weekDays.push(date)
        }

        return (
            <div className="grid grid-cols-7 gap-0 h-full">
                {weekDays.map((date, index) => {
                    const dayBookings = getBookingsForDate(date)
                    const isToday = isSameDay(date, new Date())

                    return (
                        <div key={index} className="border border-gray-200 flex flex-col">
                            <div className={`p-2 text-center text-sm font-medium ${isToday ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-700'
                                }`}>
                                {date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                            </div>
                            <div className="flex-1 p-1 overflow-y-auto">
                                {dayBookings.map(booking => {
                                    const equipmentItem = equipment.find(eq => eq.id === booking.equipment_id)
                                    const lab = labs.find(l => l.id === booking.lab_id)
                                    const startTime = new Date(booking.start_time).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit'
                                    })

                                    return (
                                        <div
                                            key={booking.id}
                                            className={`text-xs p-2 mb-1 rounded text-white cursor-pointer ${getStatusColor(booking.status)}`}
                                            onClick={() => handleBookingClick(booking)}
                                        >
                                            <div className="font-medium">{startTime}</div>
                                            <div>{equipmentItem?.name || lab?.name}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderDayView = () => {
        const dayBookings = getBookingsForDate(currentDate)
        const hours = Array.from({ length: 24 }, (_, i) => i)

        return (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
                <div className="p-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-medium text-gray-900">
                        {currentDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {hours.map(hour => (
                        <div key={hour} className="flex border-b border-gray-100">
                            <div className="w-16 p-2 text-right text-sm text-gray-500 bg-gray-50">
                                {hour.toString().padStart(2, '0')}:00
                            </div>
                            <div className="flex-1 p-2">
                                {dayBookings
                                    .filter(booking => new Date(booking.start_time).getHours() === hour)
                                    .map(booking => {
                                        const equipmentItem = equipment.find(eq => eq.id === booking.equipment_id)
                                        const lab = labs.find(l => l.id === booking.lab_id)
                                        const startTime = new Date(booking.start_time).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit'
                                        })
                                        const endTime = new Date(booking.end_time).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit'
                                        })

                                        return (
                                            <div
                                                key={booking.id}
                                                className={`text-sm p-2 rounded text-white cursor-pointer mb-1 ${getStatusColor(booking.status)}`}
                                                onClick={() => handleBookingClick(booking)}
                                            >
                                                <div className="font-medium">{equipmentItem?.name || lab?.name}</div>
                                                <div className="text-xs">{startTime} - {endTime}</div>
                                                <div className="text-xs">{booking.purpose}</div>
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading calendar...</p>
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
                            <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
                        </div>
                        <button
                            onClick={() => navigate('/bookings')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            New Booking
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
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

                {/* Calendar Controls */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => {
                                    if (viewMode === 'month') navigateMonth(-1)
                                    else if (viewMode === 'week') navigateWeek(-1)
                                    else navigateDay(-1)
                                }}
                                className="p-2 text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                            </button>

                            <h2 className="text-xl font-semibold text-gray-900">
                                {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                {viewMode === 'week' && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                                {viewMode === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            </h2>

                            <button
                                onClick={() => {
                                    if (viewMode === 'month') navigateMonth(1)
                                    else if (viewMode === 'week') navigateWeek(1)
                                    else navigateDay(1)
                                }}
                                className="p-2 text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                Today
                            </button>

                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {['month', 'week', 'day'].map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        className={`px-3 py-1 text-sm rounded ${viewMode === mode
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar Views */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden flex-1">
                    {viewMode === 'month' && renderMonthView()}
                    {viewMode === 'week' && renderWeekView()}
                    {viewMode === 'day' && renderDayView()}
                </div>

                {/* Legend */}
                <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Status Legend</h3>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                            <span className="text-sm text-gray-600">Confirmed</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                            <span className="text-sm text-gray-600">Pending</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                            <span className="text-sm text-gray-600">Completed</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                            <span className="text-sm text-gray-600">Cancelled</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Details Modal */}
            {showModal && selectedBooking && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                                Booking Details
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Resource: </span>
                                    <span className="text-sm text-gray-900">
                                        {equipment.find(eq => eq.id === selectedBooking.equipment_id)?.name ||
                                            labs.find(l => l.id === selectedBooking.lab_id)?.name}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Time: </span>
                                    <span className="text-sm text-gray-900">
                                        {new Date(selectedBooking.start_time).toLocaleString()} - {' '}
                                        {new Date(selectedBooking.end_time).toLocaleString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Purpose: </span>
                                    <span className="text-sm text-gray-900">{selectedBooking.purpose}</span>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Status: </span>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-1 text-white ${getStatusColor(selectedBooking.status)}`}>
                                        {selectedBooking.status}
                                    </span>
                                </div>

                                {(user?.role === 'admin' || user?.role === 'lab_technician') && selectedBooking.status === 'Pending' && (
                                    <div className="flex space-x-2 pt-4">
                                        <button
                                            onClick={() => updateBookingStatus(selectedBooking.id, 'Confirmed')}
                                            className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => updateBookingStatus(selectedBooking.id, 'Cancelled')}
                                            className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}