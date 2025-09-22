// src/pages/Training.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Training() {
    const [trainings, setTrainings] = useState([])
    const [userCertifications, setUserCertifications] = useState([])
    const [equipment, setEquipment] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingTraining, setEditingTraining] = useState(null)
    const [activeTab, setActiveTab] = useState('my-certifications')

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        equipment_id: '',
        required_for_equipment: true,
        duration_hours: 1,
        validity_months: 12,
        max_participants: 10,
        instructor: '',
        materials: ''
    })

    const { user, token } = useAuth()
    const navigate = useNavigate()
    const API_BASE_URL = '/api'

    const tabs = [
        { id: 'my-certifications', name: 'My Certifications', icon: '🎓' },
        { id: 'available-training', name: 'Available Training', icon: '📚' },
        ...(user?.role === 'admin' || user?.role === 'lab_technician' ? [
            { id: 'manage-training', name: 'Manage Training', icon: '⚙️' },
            { id: 'user-compliance', name: 'User Compliance', icon: '📊' }
        ] : [])
    ]

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
                fetchTrainings(),
                fetchUserCertifications(),
                fetchEquipment(),
                ...(user?.role === 'admin' ? [fetchUsers()] : [])
            ])
        } catch (error) {
            setError('Failed to load training data')
        } finally {
            setLoading(false)
        }
    }

    const fetchTrainings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/training`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const result = await response.json()
                setTrainings(result.data || [])
            }
        } catch (error) {
            console.error('Error fetching trainings:', error)
        }
    }

    const fetchUserCertifications = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/training/certifications/user/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const result = await response.json()
                setUserCertifications(result.data || [])
            }
        } catch (error) {
            console.error('Error fetching certifications:', error)
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

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const result = await response.json()
                setUsers(result.data || [])
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        try {
            const url = editingTraining
                ? `${API_BASE_URL}/training/${editingTraining.id}`
                : `${API_BASE_URL}/training`

            const method = editingTraining ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                await fetchTrainings()
                setShowModal(false)
                setEditingTraining(null)
                setFormData({
                    title: '',
                    description: '',
                    equipment_id: '',
                    required_for_equipment: true,
                    duration_hours: 1,
                    validity_months: 12,
                    max_participants: 10,
                    instructor: '',
                    materials: ''
                })
            } else {
                const result = await response.json()
                setError(result.message || 'Failed to save training')
            }
        } catch (error) {
            console.error('Error saving training:', error)
            setError('Failed to save training')
        }
    }

    const enrollInTraining = async (trainingId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/training/${trainingId}/enroll`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                await fetchUserCertifications()
                setError('')
            } else {
                const result = await response.json()
                setError(result.message || 'Failed to enroll in training')
            }
        } catch (error) {
            console.error('Error enrolling in training:', error)
            setError('Failed to enroll in training')
        }
    }

    const markCertificationComplete = async (certificationId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/training/certifications/${certificationId}/complete`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                await fetchUserCertifications()
            } else {
                setError('Failed to mark certification as complete')
            }
        } catch (error) {
            console.error('Error updating certification:', error)
            setError('Failed to update certification')
        }
    }

    const getCertificationStatus = (certification) => {
        if (!certification.completed_at) return 'In Progress'

        const completedDate = new Date(certification.completed_at)
        const expiryDate = new Date(completedDate)
        expiryDate.setMonth(expiryDate.getMonth() + certification.training.validity_months)

        if (new Date() > expiryDate) return 'Expired'
        if (new Date() > new Date(expiryDate.getTime() - 30 * 24 * 60 * 60 * 1000)) return 'Expiring Soon'
        return 'Valid'
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Valid': return 'bg-green-100 text-green-800'
            case 'Expiring Soon': return 'bg-yellow-100 text-yellow-800'
            case 'Expired': return 'bg-red-100 text-red-800'
            case 'In Progress': return 'bg-blue-100 text-blue-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const renderMyCertifications = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCertifications.map((cert) => {
                    const status = getCertificationStatus(cert)
                    const equipmentItem = equipment.find(eq => eq.id === cert.training.equipment_id)

                    return (
                        <div key={cert.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">{cert.training.title}</h3>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                                    {status}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                {equipmentItem && (
                                    <p><strong>Equipment:</strong> {equipmentItem.name}</p>
                                )}
                                <p><strong>Duration:</strong> {cert.training.duration_hours} hours</p>
                                {cert.completed_at && (
                                    <p><strong>Completed:</strong> {new Date(cert.completed_at).toLocaleDateString()}</p>
                                )}
                                {cert.completed_at && (
                                    <p><strong>Expires:</strong> {
                                        new Date(new Date(cert.completed_at).setMonth(
                                            new Date(cert.completed_at).getMonth() + cert.training.validity_months
                                        )).toLocaleDateString()
                                    }</p>
                                )}
                            </div>

                            {!cert.completed_at && (
                                <button
                                    onClick={() => markCertificationComplete(cert.id)}
                                    className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Mark as Complete
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>

            {userCertifications.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You don't have any certifications yet</p>
                    <button
                        onClick={() => setActiveTab('available-training')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Browse Available Training
                    </button>
                </div>
            )}
        </div>
    )

    const renderAvailableTraining = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainings.map((training) => {
                    const equipmentItem = equipment.find(eq => eq.id === training.equipment_id)
                    const isEnrolled = userCertifications.some(cert => cert.training_id === training.id)

                    return (
                        <div key={training.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">{training.title}</h3>

                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                {equipmentItem && (
                                    <p><strong>Equipment:</strong> {equipmentItem.name}</p>
                                )}
                                <p><strong>Duration:</strong> {training.duration_hours} hours</p>
                                <p><strong>Max Participants:</strong> {training.max_participants}</p>
                                <p><strong>Valid for:</strong> {training.validity_months} months</p>
                                {training.instructor && (
                                    <p><strong>Instructor:</strong> {training.instructor}</p>
                                )}
                            </div>

                            <p className="text-sm text-gray-700 mb-4">{training.description}</p>

                            {isEnrolled ? (
                                <div className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-center">
                                    Already Enrolled
                                </div>
                            ) : (
                                <button
                                    onClick={() => enrollInTraining(training.id)}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Enroll Now
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>

            {trainings.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No training programs available</p>
                </div>
            )}
        </div>
    )

    const renderManageTraining = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Training Programs</h3>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Add Training Program
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participants</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {trainings.map((training) => {
                            const equipmentItem = equipment.find(eq => eq.id === training.equipment_id)

                            return (
                                <tr key={training.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{training.title}</div>
                                        <div className="text-sm text-gray-500">{training.instructor}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {equipmentItem?.name || 'General'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {training.duration_hours}h
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {training.current_participants || 0}/{training.max_participants}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => {
                                                setEditingTraining(training)
                                                setFormData(training)
                                                setShowModal(true)
                                            }}
                                            className="text-blue-600 hover:text-blue-700 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteTraining(training.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )

    const renderUserCompliance = () => {
        const complianceData = users.map(user => {
            const userCerts = userCertifications.filter(cert => cert.user_id === user.id)
            const requiredTrainings = trainings.filter(t => t.required_for_equipment)
            const completedCerts = userCerts.filter(cert => cert.completed_at)
            const expiredCerts = userCerts.filter(cert => {
                if (!cert.completed_at) return false
                const expiryDate = new Date(cert.completed_at)
                expiryDate.setMonth(expiryDate.getMonth() + cert.training.validity_months)
                return new Date() > expiryDate
            })

            return {
                ...user,
                totalRequired: requiredTrainings.length,
                completed: completedCerts.length,
                expired: expiredCerts.length,
                complianceRate: requiredTrainings.length > 0 ?
                    Math.round((completedCerts.length / requiredTrainings.length) * 100) : 100
            }
        })

        return (
            <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">User Compliance Overview</h3>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compliance Rate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expired</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {complianceData.map((userData) => (
                                <tr key={userData.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                                        <div className="text-sm text-gray-500">{userData.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                                                <div
                                                    className={`h-2 rounded-full ${userData.complianceRate >= 80 ? 'bg-green-500' :
                                                            userData.complianceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${userData.complianceRate}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-gray-900">{userData.complianceRate}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {userData.completed}/{userData.totalRequired}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {userData.expired}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userData.complianceRate >= 80 ? 'bg-green-100 text-green-800' :
                                                userData.complianceRate >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {userData.complianceRate >= 80 ? 'Compliant' :
                                                userData.complianceRate >= 60 ? 'Needs Training' : 'Non-Compliant'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    const deleteTraining = async (id) => {
        if (!window.confirm('Are you sure you want to delete this training program?')) return

        try {
            const response = await fetch(`${API_BASE_URL}/training/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                await fetchTrainings()
            } else {
                setError('Failed to delete training program')
            }
        } catch (error) {
            console.error('Error deleting training:', error)
            setError('Failed to delete training program')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading training data...</p>
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
                            <h1 className="text-xl font-semibold text-gray-900">Training & Certifications</h1>
                        </div>
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

                {/* Tab Navigation */}
                <div className="mb-6">
                    <nav className="flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow-sm p-6 flex-1 overflow-y-auto">
                    {activeTab === 'my-certifications' && renderMyCertifications()}
                    {activeTab === 'available-training' && renderAvailableTraining()}
                    {activeTab === 'manage-training' && renderManageTraining()}
                    {activeTab === 'user-compliance' && renderUserCompliance()}
                </div>
            </div>

            {/* Training Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                                {editingTraining ? 'Edit Training Program' : 'Add Training Program'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Equipment</label>
                                        <select
                                            value={formData.equipment_id}
                                            onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">General Training</option>
                                            {equipment.map(item => (
                                                <option key={item.id} value={item.id}>
                                                    {item.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Duration (hours)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="40"
                                            required
                                            value={formData.duration_hours}
                                            onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Valid for (months)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="60"
                                            required
                                            value={formData.validity_months}
                                            onChange={(e) => setFormData({ ...formData, validity_months: parseInt(e.target.value) })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Max Participants</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            required
                                            value={formData.max_participants}
                                            onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Instructor</label>
                                    <input
                                        type="text"
                                        value={formData.instructor}
                                        onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.required_for_equipment}
                                            onChange={(e) => setFormData({ ...formData, required_for_equipment: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Required for equipment access</span>
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false)
                                            setEditingTraining(null)
                                            setFormData({
                                                title: '',
                                                description: '',
                                                equipment_id: '',
                                                required_for_equipment: true,
                                                duration_hours: 1,
                                                validity_months: 12,
                                                max_participants: 10,
                                                instructor: '',
                                                materials: ''
                                            })
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                                    >
                                        {editingTraining ? 'Update' : 'Create'}
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