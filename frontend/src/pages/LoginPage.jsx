import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (error) setError('')
    }

    const validateForm = () => {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!formData.email) {
            setError('Email is required')
            return false
        }
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address')
            return false
        }

        // Password validation
        if (!formData.password) {
            setError('Password is required')
            return false
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return false
        }

        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validate form before submission
        if (!validateForm()) {
            return
        }

        setLoading(true)
        console.log('🔐 Attempting login with:', { email: formData.email })

        try {
            const result = await login(formData.email, formData.password)

            if (result.success) {
                console.log('✅ Login successful:', result.user)

                // Route based on user role from database
                const userRole = result.user.role
                console.log('🔀 Routing user based on role:', userRole)

                switch (userRole) {
                    case 'admin':
                        navigate('/admin-dashboard', { replace: true })
                        break
                    case 'teacher':
                        navigate('/teacher-dashboard', { replace: true })
                        break
                    case 'student':
                        navigate('/student-dashboard', { replace: true })
                        break
                    case 'lab_assistant':
                        navigate('/lab-assistant-dashboard', { replace: true })
                        break
                    default:
                        navigate('/dashboard', { replace: true })
                }
            } else {
                console.error('❌ Login failed:', result.message)
                setError(result.message || 'Login failed. Please check your credentials.')
            }
        } catch (error) {
            console.error('💥 Login error:', error)
            setError('An error occurred during login. Please try again.')
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
                        <p className="text-gray-600 mb-6">Lab Management System</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error && error.includes('email') ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                                disabled={loading}
                                placeholder="Enter your email address"
                                autoComplete="email"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error && error.includes('password') ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                                disabled={loading}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !formData.email || !formData.password}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                Register here
                            </Link>
                        </p>
                        <Link to="/" className="text-xs text-gray-500 hover:text-gray-700 mt-2 inline-block">
                            ← Back to Home
                        </Link>
                    </div>
                </div >
            </div >
        </div >
    )
}

export default LoginPage