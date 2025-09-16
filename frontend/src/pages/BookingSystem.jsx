import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

function BookingSystem() {
    const { token, isAuthenticated, user } = useAuth()
    const [bookings, setBookings] = useState([])
    const [labs, setLabs] = useState([])
    const [equipment, setEquipment] = useState([])
    const [filteredEquipment, setFilteredEquipment] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [showBookingForm, setShowBookingForm] = useState(false)
    const [newBooking, setNewBooking] = useState({
        booking_type: 'lab', // 'lab' or 'equipment'
        lab_id: '',
        equipment_id: '',
        date: '',
        start_time: '',
        end_time: '',
        purpose: ''
    })

    // Define API base URL
    const API_BASE_URL = 'http://localhost:5000/api';

    // Fetch labs, equipment and bookings
    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticated || !token) {
                console.log('Waiting for authentication...');
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

                // Fetch labs
                const labsResponse = await fetch(`${API_BASE_URL}/labs`, { headers })
                if (labsResponse.ok) {
                    const labsData = await labsResponse.json()
                    setLabs(labsData.data?.labs || [])
                } else {
                    console.error('Failed to fetch labs:', labsResponse.status)
                }

                // Fetch equipment
                const equipmentResponse = await fetch(`${API_BASE_URL}/equipment`, { headers })
                if (equipmentResponse.ok) {
                    const equipmentData = await equipmentResponse.json()
                    setEquipment(equipmentData.data?.equipment || [])
                    setFilteredEquipment(equipmentData.data?.equipment || [])
                } else {
                    console.error('Failed to fetch equipment:', equipmentResponse.status)
                }

                // Fetch bookings
                const bookingsResponse = await fetch(`${API_BASE_URL}/bookings`, { headers })
                if (bookingsResponse.ok) {
                    const bookingsData = await bookingsResponse.json()
                    setBookings(bookingsData.data?.bookings || [])
                } else {
                    console.error('Failed to fetch bookings:', bookingsResponse.status)
                }

            } catch (error) {
                console.error('Error fetching data:', error)
                setError('Failed to load data. Please check your connection.')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [token, isAuthenticated])

    // Filter equipment when lab is selected
    useEffect(() => {
        if (newBooking.lab_id) {
            const filtered = equipment.filter(item => item.lab_id === parseInt(newBooking.lab_id))
            setFilteredEquipment(filtered)
        } else {
            setFilteredEquipment(equipment)
        }
        // Reset equipment selection when lab changes
        setNewBooking(prev => ({ ...prev, equipment_id: '' }))
    }, [newBooking.lab_id, equipment])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setNewBooking({ ...newBooking, [name]: value })
    }

    const handleBookingTypeChange = (e) => {
        const bookingType = e.target.value
        setNewBooking({
            ...newBooking,
            booking_type: bookingType,
            lab_id: '',
            equipment_id: ''
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!isAuthenticated || !token) {
            setError('You must be logged in to create a booking')
            return
        }

        // Validation
        if (newBooking.booking_type === 'lab' && !newBooking.lab_id) {
            setError('Please select a lab')
            return
        }
        if (newBooking.booking_type === 'equipment' && (!newBooking.lab_id || !newBooking.equipment_id)) {
            setError('Please select both lab and equipment')
            return
        }

        try {
            setLoading(true)
            setError('')

            // Format booking data
            const bookingData = {
                booking_type: newBooking.booking_type,
                lab_id: parseInt(newBooking.lab_id),
                equipment_id: newBooking.booking_type === 'equipment' ? parseInt(newBooking.equipment_id) : null,
                date: newBooking.date,
                start_time: `${newBooking.start_time}:00`,
                end_time: `${newBooking.end_time}:00`,
                purpose: newBooking.purpose
            }

            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            })

            const data = await response.json()

            if (response.ok) {
                // Add new booking to the list
                setBookings([data.data.booking, ...bookings])
                setShowBookingForm(false)
                setNewBooking({
                    booking_type: 'lab',
                    lab_id: '',
                    equipment_id: '',
                    date: '',
                    start_time: '',
                    end_time: '',
                    purpose: ''
                })
            } else {
                setError(data.message || 'Failed to create booking')
            }
        } catch (error) {
            console.error('Error creating booking:', error)
            setError('Failed to create booking. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleCancelBooking = async (id) => {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return
        }

        try {
            const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                // Remove booking from list
                setBookings(bookings.filter(booking => booking.id !== id))
            } else {
                const data = await response.json()
                setError(data.message || 'Failed to cancel booking')
            }
        } catch (error) {
            console.error('Error cancelling booking:', error)
            setError('Failed to cancel booking. Please try again.')
        }
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'bg-green-100 text-green-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getBookingTypeColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'lab': return 'bg-blue-100 text-blue-800'
            case 'equipment': return 'bg-purple-100 text-purple-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' }
        return new Date(dateString).toLocaleDateString(undefined, options)
    }

    // Format time for display
    const formatTime = (timeString) => {
        if (!timeString) return '';
        // If it's a full timestamp, extract just the time portion
        if (timeString.includes('T')) {
            timeString = timeString.split('T')[1];
        }

        // Handle various time formats
        let hours, minutes;
        if (timeString.includes(':')) {
            [hours, minutes] = timeString.split(':');
        } else {
            hours = timeString.substring(0, 2);
            minutes = timeString.substring(2, 4);
        }

        const parsedHours = parseInt(hours);
        const ampm = parsedHours >= 12 ? 'PM' : 'AM';
        const displayHours = parsedHours % 12 || 12;

        return `${displayHours}:${minutes} ${ampm}`;
    }

    if (loading && !bookings.length) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading bookings...</p>
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
                        <button
                            onClick={() => window.history.back()}
                            className="text-blue-500 hover:underline">← Dashboard</button>
                        <h1 className="text-2xl font-bold text-gray-800 mt-2">Lab & Equipment Booking System</h1>
                    </div>
                    <button
                        onClick={() => setShowBookingForm(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        disabled={!isAuthenticated}
                    >
                        New Booking
                    </button>
                </div>
            </div>

            <div className="p-6">
                {/* Error Display */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        <div className="flex justify-between items-center">
                            <span>{error}</span>
                            <button
                                onClick={() => setError('')}
                                className="text-red-700 hover:text-red-900"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* Booking Form Modal */}
                {showBookingForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">New Booking</h2>
                            <form onSubmit={handleSubmit}>
                                {/* Booking Type Selection */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Booking Type</label>
                                    <select
                                        name="booking_type"
                                        value={newBooking.booking_type}
                                        onChange={handleBookingTypeChange}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                        required
                                    >
                                        <option value="lab">Book Entire Lab</option>
                                        <option value="equipment">Book Specific Equipment</option>
                                    </select>
                                </div>

                                {/* Lab Selection */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Lab</label>
                                    <select
                                        name="lab_id"
                                        value={newBooking.lab_id}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select Lab</option>
                                        {labs.map(lab => (
                                            <option key={lab.id} value={lab.id}>
                                                {lab.name} {lab.location && `(${lab.location})`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Equipment Selection (only if booking type is equipment) */}
                                {newBooking.booking_type === 'equipment' && (
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Equipment</label>
                                        <select
                                            name="equipment_id"
                                            value={newBooking.equipment_id}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                            required={newBooking.booking_type === 'equipment'}
                                        >
                                            <option value="">Select Equipment</option>
                                            {filteredEquipment.map(item => (
                                                <option key={item.id} value={item.id}>
                                                    {item.name} ({item.serial_number})
                                                </option>
                                            ))}
                                        </select>
                                        {newBooking.lab_id && filteredEquipment.length === 0 && (
                                            <p className="text-sm text-gray-500 mt-1">No equipment available in this lab</p>
                                        )}
                                    </div>
                                )}

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={newBooking.date}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div className="mb-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Start Time</label>
                                        <input
                                            type="time"
                                            name="start_time"
                                            value={newBooking.start_time}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">End Time</label>
                                        <input
                                            type="time"
                                            name="end_time"
                                            value={newBooking.end_time}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Purpose</label>
                                    <textarea
                                        name="purpose"
                                        value={newBooking.purpose}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                        rows="3"
                                        placeholder="Describe the purpose of booking"
                                        required
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowBookingForm(false)}
                                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                        disabled={loading}
                                    >
                                        {loading ? 'Creating...' : 'Create Booking'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Bookings Table */}
                <div className="bg-white rounded shadow overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-bold">Current Bookings</h2>
                    </div>

                    {bookings.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No bookings found. Click "New Booking" to create one.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lab</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {bookings.map((booking) => (
                                        <tr key={booking.id}>
                                            <td className="px-6 py-4 text-sm text-gray-900">{booking.id}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getBookingTypeColor(booking.booking_type)}`}>
                                                    {booking.booking_type?.charAt(0).toUpperCase() + booking.booking_type?.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                {booking.lab?.name || 'Unknown Lab'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {booking.equipment?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {booking.user?.name || 'Unknown User'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatDate(booking.date)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                    {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {booking.status !== 'cancelled' && (
                                                    <button
                                                        className="text-red-500 hover:underline"
                                                        onClick={() => handleCancelBooking(booking.id)}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="text-lg font-semibold mb-2">Total Bookings</h3>
                        <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="text-lg font-semibold mb-2">Lab Bookings</h3>
                        <p className="text-2xl font-bold text-green-600">
                            {bookings.filter(b => b.booking_type === 'lab').length}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="text-lg font-semibold mb-2">Equipment Bookings</h3>
                        <p className="text-2xl font-bold text-purple-600">
                            {bookings.filter(b => b.booking_type === 'equipment').length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookingSystem