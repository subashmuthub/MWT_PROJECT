// src/services/authService.js - Enhanced Authentication Service
const API_BASE_URL = '/api'

// Gmail validation - only allow gmail.com addresses
export const isValidGmail = (email) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
    return gmailRegex.test(email)
}

// NEC email validation - allow nec.edu.in addresses
export const isValidNecEmail = (email) => {
    const necRegex = /^[a-zA-Z0-9._%+-]+@nec\.edu\.in$/
    return necRegex.test(email)
}

// Combined validation for login (Gmail OR NEC)
export const isValidLoginEmail = (email) => {
    return isValidGmail(email) || isValidNecEmail(email)
}

// Registration validation (Gmail only)
export const isValidRegistrationEmail = (email) => {
    return isValidGmail(email)
}

// Send OTP to Gmail (registration only)
export const sendOTP = async (email) => {
    try {
        if (!isValidRegistrationEmail(email)) {
            return { success: false, message: 'Only Gmail addresses are allowed for registration' }
        }

        const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        })

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Send OTP error:', error)
        return { success: false, message: 'Failed to send OTP' }
    }
}

// Verify OTP
export const verifyOTP = async (email, otp) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, otp })
        })

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Verify OTP error:', error)
        return { success: false, message: 'OTP verification failed' }
    }
}

// Register with OTP verification (Gmail only)
export const registerWithOTP = async (userData, otp) => {
    try {
        if (!isValidRegistrationEmail(userData.email)) {
            return { success: false, message: 'Only Gmail addresses are allowed for registration' }
        }

        const response = await fetch(`${API_BASE_URL}/auth/register-with-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...userData,
                otp
            })
        })

        const data = await response.json()
        
        if (data.success && data.data?.token) {
            // Store authentication data
            localStorage.setItem('token', data.data.token)
            localStorage.setItem('user', JSON.stringify(data.data.user))
        }
        
        return data
    } catch (error) {
        console.error('Register error:', error)
        return { success: false, message: 'Registration failed' }
    }
}

// Login with password (for existing users with Gmail or NEC email)
export const loginWithPassword = async (email, password) => {
    try {
        if (!isValidLoginEmail(email)) {
            return { success: false, message: 'Please use a valid Gmail or NEC email address' }
        }

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        })

        const data = await response.json()
        
        if (data.success && data.data?.token) {
            // Store authentication data
            localStorage.setItem('token', data.data.token)
            localStorage.setItem('user', JSON.stringify(data.data.user))
        }
        
        return data
    } catch (error) {
        console.error('Login error:', error)
        return { success: false, message: 'Login failed' }
    }
}

// Login with OTP verification (Gmail only)
export const loginWithOTP = async (email, otp) => {
    try {
        if (!isValidGmail(email)) {
            return { success: false, message: 'OTP login only available for Gmail addresses' }
        }

        const response = await fetch(`${API_BASE_URL}/auth/login-with-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                otp
            })
        })

        const data = await response.json()
        
        if (data.success && data.data?.token) {
            // Store authentication data
            localStorage.setItem('token', data.data.token)
            localStorage.setItem('user', JSON.stringify(data.data.user))
        }
        
        return data
    } catch (error) {
        console.error('Login error:', error)
        return { success: false, message: 'Login failed' }
    }
}

// Get Google OAuth URL
export const getGoogleAuthUrl = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/oauth/google`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Google OAuth URL error:', error)
        return { success: false, message: 'Failed to get Google auth URL' }
    }
}

// Get GitHub OAuth URL
export const getGitHubAuthUrl = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/oauth/github`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()
        return data
    } catch (error) {
        console.error('GitHub OAuth URL error:', error)
        return { success: false, message: 'Failed to get GitHub auth URL' }
    }
}

// Google OAuth login
export const loginWithGoogle = async () => {
    try {
        const response = await getGoogleAuthUrl()
        if (response.success && response.authUrl) {
            window.location.href = response.authUrl
        }
        return response
    } catch (error) {
        console.error('Google login error:', error)
        return { success: false, message: 'Google login failed' }
    }
}

// GitHub OAuth login
export const loginWithGitHub = async () => {
    try {
        const response = await getGitHubAuthUrl()
        if (response.success && response.authUrl) {
            window.location.href = response.authUrl
        }
        return response
    } catch (error) {
        console.error('GitHub login error:', error)
        return { success: false, message: 'GitHub login failed' }
    }
}

// Handle OAuth callback
export const handleOAuthCallback = async (code, state) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/oauth/callback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, state })
        })

        const data = await response.json()
        
        if (data.success && data.data?.token) {
            // Store authentication data
            localStorage.setItem('token', data.data.token)
            localStorage.setItem('user', JSON.stringify(data.data.user))
        }
        
        return data
    } catch (error) {
        console.error('OAuth callback error:', error)
        return { success: false, message: 'OAuth authentication failed' }
    }
}