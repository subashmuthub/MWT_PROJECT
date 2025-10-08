import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [staySignedIn, setStaySignedIn] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        if (error) setError('')
    }

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!formData.email) {
            setError('Email is required')
            return false
        }
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address')
            return false
        }
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

        if (!validateForm()) {
            return
        }

        setLoading(true)
        console.log('🔐 Attempting login with:', { email: formData.email })

        try {
            const result = await login(formData.email, formData.password)

            if (result.success) {
                console.log('✅ Login successful:', result.user)
                const userRole = result.user.role
                console.log('🔀 Routing user based on role:', userRole)

                // All users go to the main dashboard which handles role-based features
                navigate('/dashboard', { replace: true })
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
        <div
            className="min-h-screen w-full flex flex-col bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/Images/Home.jpg')" }}
        >
            {/* College Header - matches your friend's design */}
            <div className="flex items-center justify-between bg-blue-900 text-yellow-400 px-5 py-3">
                <img
                    src="/Images/Logo.png"
                    alt="College Logo"
                    className="w-20 h-auto ml-2"
                />
                <div className="text-center flex-grow">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold m-0">
                        Lab Management System
                    </h1>
                    <p className="text-xs md:text-sm mt-1 leading-tight">
                        National Engineering College
                        <br />
                        (An Autonomous Institution Affiliated to Anna University Chennai)
                        <br />
                        K.R. Nagar, Kovilpatti - 628503, Thoothukudi Dist. Tamilnadu
                        <br />
                        Phone: 04632 - 222502, 230227 | Email: principal@nec.edu.in | Web: www.nec.edu.in
                    </p>
                </div>
                <img
                    src="/Images/Founder.jpg"
                    alt="Founder"
                    className="w-20 h-auto mr-2"
                />
            </div>

            {/* Login Section - matches your friend's centered layout */}
            <div className="flex-grow flex items-center justify-center p-5">
                <div className="bg-white bg-opacity-90 p-8 w-full max-w-md rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">Sign In</h1>

                    {/* Error Display - enhanced styling */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                            <div className="flex items-center">
                                <span className="text-lg mr-2">⚠️</span>
                                <span className="text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-bold text-left mb-2 text-blue-900">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                autoComplete="email"
                                className={`w-full px-3 py-3 border rounded-md text-base transition-all duration-200
                                    ${error && error.toLowerCase().includes('email')
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                        : 'border-gray-300 focus:border-blue-900 focus:ring-2 focus:ring-blue-200'
                                    } 
                                    focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed`}
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-bold text-left mb-2 text-blue-900">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                autoComplete="current-password"
                                className={`w-full px-3 py-3 border rounded-md text-base transition-all duration-200
                                    ${error && error.toLowerCase().includes('password')
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                        : 'border-gray-300 focus:border-blue-900 focus:ring-2 focus:ring-blue-200'
                                    } 
                                    focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed`}
                            />
                        </div>

                        {/* Stay Signed In Checkbox - matches your friend's styling */}
                        <div className="flex items-center gap-2 my-4">
                            <input
                                type="checkbox"
                                id="staySignedIn"
                                checked={staySignedIn}
                                onChange={(e) => setStaySignedIn(e.target.checked)}
                                disabled={loading}
                                className="w-5 h-5 text-blue-900 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <label htmlFor="staySignedIn" className="text-sm text-gray-700 cursor-pointer">
                                Stay signed in
                            </label>
                        </div>

                        {/* Login Button - matches your friend's blue styling */}
                        <button
                            type="submit"
                            disabled={loading || !formData.email || !formData.password}
                            className="w-full bg-blue-900 text-white border-none py-3 mt-6 rounded-md cursor-pointer text-base font-medium transition-all duration-200 hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Additional Links - matches your friend's layout */}
                    <div className="mt-6 text-center space-y-3">
                        <div className="text-sm">
                            <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="text-blue-900 hover:underline transition-all duration-200"
                            >
                                Forgot password / username
                            </a>
                        </div>
                        <div className="text-sm text-gray-600">
                            <p>
                                Don't have an account?{' '}
                                <Link
                                    to="/register"
                                    className="text-blue-900 hover:underline font-medium transition-all duration-200"
                                >
                                    Register here
                                </Link>
                            </p>
                        </div>
                        <div className="text-xs">
                            <Link
                                to="/"
                                className="text-gray-500 hover:text-blue-900 hover:underline transition-all duration-200"
                            >
                                ← Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage