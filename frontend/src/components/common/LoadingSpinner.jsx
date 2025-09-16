// src/components/common/LoadingSpinner.jsx
import React from 'react'

export default function LoadingSpinner({ size = 'medium', message = 'Loading...' }) {
    const sizeClasses = {
        small: 'h-8 w-8',
        medium: 'h-12 w-12',
        large: 'h-16 w-16'
    }

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
            {message && (
                <p className="mt-4 text-gray-600 text-sm">{message}</p>
            )}
        </div>
    )
}