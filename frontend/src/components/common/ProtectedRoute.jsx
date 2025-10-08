// src/components/common/ProtectedRoute.jsx - UPDATED VERSION
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function ProtectedRoute({ children, requiredRole = null }) {
    const { user, loading, isAuthenticated } = useAuth()
    const location = useLocation()

    // Show loading while authentication is being verified
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                    </div>
                    <p className="text-gray-600 mt-4 font-medium">Authenticating...</p>
                </div>
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Check for required role if specified
    if (requiredRole) {
        // Handle both single role and array of roles
        const hasRequiredRole = Array.isArray(requiredRole) 
            ? requiredRole.includes(user.role)
            : user.role === requiredRole;

        if (!hasRequiredRole) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md mx-auto text-center p-6">
                        <div className="mb-4">
                            <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
                        <p className="text-gray-600 mb-4">
                            You don't have permission to access this page.
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Your role: <span className="font-medium capitalize">{user.role?.replace('_', ' ')}</span>
                            <br />
                            Required: <span className="font-medium">
                                {Array.isArray(requiredRole) 
                                    ? requiredRole.map(role => role.replace('_', ' ')).join(' or ') 
                                    : requiredRole.replace('_', ' ')
                                }
                            </span>
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => window.history.back()}
                                className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                                Go Back
                            </button>
                            {/* ✅ FIXED: Use proper navigation */}
                            <button
                                onClick={() => window.location.href = '/dashboard'}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )
        }
    }

    return children
}

export default ProtectedRoute