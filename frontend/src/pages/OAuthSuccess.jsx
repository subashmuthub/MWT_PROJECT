// src/pages/OAuthSuccess.jsx - OAuth Success Handler
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function OAuthSuccess() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { login } = useAuth()

    useEffect(() => {
        const handleOAuthSuccess = async () => {
            const token = searchParams.get('token')
            const error = searchParams.get('error')

            if (error) {
                console.error('OAuth error:', error)
                navigate('/login?error=' + encodeURIComponent(error))
                return
            }

            if (token) {
                try {
                    // Store token and get user data
                    localStorage.setItem('token', token)
                    
                    // Decode token to get user data (simple decode, not verification)
                    const base64Url = token.split('.')[1]
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
                    const jsonPayload = decodeURIComponent(
                        atob(base64)
                            .split('')
                            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                            .join('')
                    )
                    const userData = JSON.parse(jsonPayload)
                    
                    localStorage.setItem('user', JSON.stringify(userData))
                    
                    // Update auth context
                    login(userData, token)
                    
                    // Redirect to dashboard
                    navigate('/dashboard')
                } catch (error) {
                    console.error('Token processing error:', error)
                    navigate('/login?error=token_invalid')
                }
            } else {
                navigate('/login?error=no_token')
            }
        }

        handleOAuthSuccess()
    }, [searchParams, navigate, login])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900">Processing OAuth login...</h2>
                <p className="text-gray-600 mt-2">Please wait while we complete your authentication.</p>
            </div>
        </div>
    )
}

export default OAuthSuccess