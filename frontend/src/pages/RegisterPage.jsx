import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function RegisterPage() {
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student'
    })
    const [otpData, setOtpData] = useState({
        otp: '',
        isOtpSent: false,
        isOtpVerified: false,
        otpLoading: false,
        otpCountdown: 0
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const { registerWithOTP, sendOTP, verifyOTP } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name === 'otp') {
            setOtpData(prev => ({
                ...prev,
                [name]: value
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters'
        } else if (formData.name.trim().length > 100) {
            newErrors.name = 'Name must not exceed 100 characters'
        }

        // Email validation - accept any valid email address
        if (!formData.email) {
            newErrors.email = 'Email is required'
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        // Role validation
        const validRoles = ['student', 'teacher', 'lab_assistant', 'admin']
        if (!validRoles.includes(formData.role)) {
            newErrors.role = 'Please select a valid role'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Send OTP to any valid email address
    const handleSendOTP = async () => {
        // Validate email first
        if (!formData.email) {
            setErrors({ email: 'Email is required' })
            return
        }
        if (!emailRegex.test(formData.email)) {
            setErrors({ email: 'Please enter a valid email address' })
            return
        }

        setOtpData(prev => ({ ...prev, otpLoading: true }))
        setErrors({})

        try {
            const result = await sendOTP(formData.email.toLowerCase())
            
            if (result.success) {
                setOtpData(prev => ({
                    ...prev,
                    isOtpSent: true,
                    otpLoading: false,
                    otpCountdown: result.expiresIn || 600 // 10 minutes
                }))
                
                // Start countdown timer
                const timer = setInterval(() => {
                    setOtpData(prev => {
                        if (prev.otpCountdown <= 1) {
                            clearInterval(timer)
                            return { ...prev, otpCountdown: 0, isOtpSent: false }
                        }
                        return { ...prev, otpCountdown: prev.otpCountdown - 1 }
                    })
                }, 1000)
                
            } else {
                setErrors({ email: result.message || 'Failed to send OTP' })
                setOtpData(prev => ({ ...prev, otpLoading: false }))
            }
        } catch (error) {
            console.error('Send OTP error:', error)
            setErrors({ email: 'Failed to send OTP. Please try again.' })
            setOtpData(prev => ({ ...prev, otpLoading: false }))
        }
    }

    // Verify OTP
    const handleVerifyOTP = async () => {
        if (!otpData.otp || otpData.otp.length !== 6) {
            setErrors({ otp: 'Please enter a valid 6-digit OTP' })
            return
        }

        setOtpData(prev => ({ ...prev, otpLoading: true }))
        setErrors({})

        try {
            const result = await verifyOTP(formData.email.toLowerCase(), otpData.otp)
            
            if (result.success) {
                setOtpData(prev => ({
                    ...prev,
                    isOtpVerified: true,
                    otpLoading: false
                }))
            } else {
                setErrors({ otp: result.message || 'Invalid OTP' })
                setOtpData(prev => ({ ...prev, otpLoading: false }))
            }
        } catch (error) {
            console.error('Verify OTP error:', error)
            setErrors({ otp: 'Failed to verify OTP. Please try again.' })
            setOtpData(prev => ({ ...prev, otpLoading: false }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate form
        if (!validateForm()) {
            console.log('Validation failed:', errors)
            return
        }

        // Check if OTP is verified
        if (!otpData.isOtpVerified) {
            setErrors({ general: 'Please verify your email with OTP first' })
            return
        }

        setLoading(true)
        console.log('� CREATE ACCOUNT BUTTON CLICKED!')
        console.log('�📝 Attempting registration with OTP for:', {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            otpProvided: !!otpData.otp,
            otpValue: otpData.otp
        })

        try {
            console.log('🔥 About to call registerWithOTP...')
            const result = await registerWithOTP(
                formData.name.trim(),
                formData.email.toLowerCase(),
                formData.password,
                formData.role,
                otpData.otp
            )
            console.log('🔥 registerWithOTP returned:', result)

            if (result.success) {
                console.log('✅ Registration successful:', result.user)

                // Route based on user role
                const userRole = result.user.role
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
                console.error('❌ Registration failed:', result.message)
                setErrors({ general: result.message || 'Registration failed. Please try again.' })
            }
        } catch (error) {
            console.error('💥 Registration error:', error)
            setErrors({ general: 'An error occurred during registration. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-600 mb-6">Lab Management System</p>
                    </div>

                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                            <p className="text-sm">{errors.general}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                disabled={loading}
                                placeholder="Enter your full name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    disabled={loading || otpData.isOtpSent}
                                    placeholder="Enter your email address (@gmail.com or @nec.edu.in)"
                                    autoComplete="email"
                                />
                                {!otpData.isOtpSent && (
                                    <button
                                        type="button"
                                        onClick={handleSendOTP}
                                        disabled={otpData.otpLoading || !formData.email}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                                    >
                                        {otpData.otpLoading ? 'Sending...' : 'Send OTP'}
                                    </button>
                                )}
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                            {otpData.isOtpSent && (
                                <p className="mt-1 text-sm text-green-600">
                                    ✅ OTP sent to your email! Check your inbox.
                                </p>
                            )}
                        </div>

                        {/* OTP Verification */}
                        {otpData.isOtpSent && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter OTP <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="otp"
                                        value={otpData.otp}
                                        onChange={handleChange}
                                        maxLength={6}
                                        className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.otp ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        disabled={loading || otpData.isOtpVerified}
                                        placeholder="Enter 6-digit OTP"
                                    />
                                    {!otpData.isOtpVerified && (
                                        <button
                                            type="button"
                                            onClick={handleVerifyOTP}
                                            disabled={otpData.otpLoading || !otpData.otp || otpData.otp.length !== 6}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                                        >
                                            {otpData.otpLoading ? 'Verifying...' : 'Verify'}
                                        </button>
                                    )}
                                </div>
                                {errors.otp && (
                                    <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
                                )}
                                {otpData.isOtpVerified && (
                                    <p className="mt-1 text-sm text-green-600">
                                        ✅ Email verified successfully!
                                    </p>
                                )}
                                {otpData.otpCountdown > 0 && (
                                    <p className="mt-1 text-sm text-gray-600">
                                        OTP expires in {Math.floor(otpData.otpCountdown / 60)}:{(otpData.otpCountdown % 60).toString().padStart(2, '0')}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                disabled={loading}
                                placeholder="Create a password (min 6 characters)"
                                autoComplete="new-password"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                disabled={loading}
                                placeholder="Re-enter your password"
                                autoComplete="new-password"
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Register As <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.role ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                disabled={loading}
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="lab_assistant">Lab Assistant</option>
                                <option value="admin">Admin</option>
                            </select>
                            {errors.role && (
                                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !otpData.isOtpVerified}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </div>
                            ) : !otpData.isOtpVerified ? (
                                'Verify Email First'
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Sign in
                            </Link>
                        </p>
                        <Link to="/" className="text-xs text-gray-500 hover:text-gray-700 mt-2 inline-block">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage