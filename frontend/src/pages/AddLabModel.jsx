// AddLab.jsx - Full Page Component
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function AddLab() {
    const navigate = useNavigate()

    // State for form data
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        lab_type: 'general_lab',
        capacity: 30 // Add capacity field
    })

    // State for loading and error handling
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // Ref for input focus
    const nameInputRef = useRef(null)

    // Focus on name input when component mounts
    useEffect(() => {
        if (nameInputRef.current) {
            nameInputRef.current.focus()
        }
    }, [])

    // Update form field values
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        // Clear error when user starts typing
        if (error) setError('')
    }

    // Submit form data to create a new lab
    const handleSubmit = async (e) => {
        e?.preventDefault()
        setLoading(true)
        setError('')

        // Validate form data
        if (!formData.name.trim()) {
            setError('Lab name is required')
            setLoading(false)
            return
        }

        try {
            const token = localStorage.getItem('token')

            const response = await fetch('http://localhost:5000/api/labs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (data.success) {
                setSuccess(true)
                // Show success message
                setTimeout(() => {
                    navigate('/labs') // Navigate back to labs list
                }, 1500)
            } else {
                setError(data.message || 'Failed to create lab')
            }
        } catch (error) {
            console.error('Error creating lab:', error)
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/labs')}
                                className="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
                                aria-label="Go back"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Add New Lab</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => navigate('/labs')}
                                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || !formData.name.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </span>
                                ) : 'Create Lab'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Lab Information</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Fill in the details below to create a new lab. Fields marked with an asterisk (*) are required.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Success Message */}
                                {success && (
                                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
                                        <div className="flex items-center">
                                            <svg className="h-5 w-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span>Lab created successfully! Redirecting...</span>
                                        </div>
                                    </div>
                                )}

                                {/* Error Display */}
                                {error && (
                                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                                        <div className="flex items-center">
                                            <svg className="h-5 w-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>{error}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Lab Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Lab Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        ref={nameInputRef}
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter lab name (e.g., Computer Lab 101)"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Choose a descriptive name for the lab</p>
                                </div>

                                {/* Lab Type and Capacity */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Lab Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="lab_type"
                                            value={formData.lab_type}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            required
                                        >
                                            <option value="general_lab">General Lab</option>
                                            <option value="computer_lab">Computer Lab</option>
                                            <option value="chemistry_lab">Chemistry Lab</option>
                                            <option value="physics_lab">Physics Lab</option>
                                            <option value="biology_lab">Biology Lab</option>
                                            <option value="electronics_lab">Electronics Lab</option>
                                            <option value="mechanical_lab">Mechanical Lab</option>
                                            <option value="research_lab">Research Lab</option>
                                        </select>
                                        <p className="mt-1 text-xs text-gray-500">Select the type of laboratory</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Capacity
                                        </label>
                                        <input
                                            type="number"
                                            name="capacity"
                                            value={formData.capacity}
                                            onChange={handleChange}
                                            min="1"
                                            max="500"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            placeholder="30"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Maximum number of people</p>
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="e.g., Building A, Floor 2, Room 201"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Specify where the lab is located</p>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        rows="5"
                                        placeholder="Provide a detailed description of the lab, including its purpose, equipment, and any other relevant information."
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Add details about the lab's purpose and features</p>
                                </div>

                                {/* Form Actions - Mobile */}
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 lg:hidden">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/labs')}
                                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !formData.name.trim()}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Creating...' : 'Create Lab'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column - Additional Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Tips</h3>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Choose a clear, descriptive name that helps users quickly identify the lab.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Include specific room numbers and building names in the location field.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Add important details in the description like available equipment, safety requirements, or access restrictions.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Lab Type Legend */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Lab Types Guide</h4>
                                <dl className="space-y-2 text-xs">
                                    <div>
                                        <dt className="font-medium text-gray-700">Computer Lab</dt>
                                        <dd className="text-gray-500">For programming and digital work</dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-gray-700">Chemistry Lab</dt>
                                        <dd className="text-gray-500">For chemical experiments</dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-gray-700">Research Lab</dt>
                                        <dd className="text-gray-500">For advanced research projects</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default AddLab