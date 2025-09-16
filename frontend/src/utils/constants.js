// src/utils/constants.js
export const EQUIPMENT_TYPES = [
    'Desktop',
    'Laptop',
    'Printer',
    'Projector',
    'Scanner'
];

export const USER_ROLES = {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin'
};

export const BOOKING_STATUS = {
    CONFIRMED: 'Confirmed',
    PENDING: 'Pending',
    CANCELLED: 'Cancelled'
};

export const MAINTENANCE_TYPES = {
    ROUTINE: 'Routine',
    REPAIR: 'Repair',
    EMERGENCY: 'Emergency'
};

// src/utils/helpers.js
export const getStatusColor = (status) => {
    const statusColors = {
        'Confirmed': 'bg-green-100 text-green-800',
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Cancelled': 'bg-red-100 text-red-800',
        'Available': 'bg-green-100 text-green-800',
        'In Use': 'bg-orange-100 text-orange-800',
        'Maintenance': 'bg-red-100 text-red-800',
        'Active': 'bg-green-100 text-green-800',
        'Inactive': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const getRoleColor = (role) => {
    const roleColors = {
        'Admin': 'bg-red-100 text-red-800',
        'Teacher': 'bg-blue-100 text-blue-800',
        'Student': 'bg-green-100 text-green-800'
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
};

export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
};

// src/components/common/Modal.jsx (Optional reusable modal)
import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;