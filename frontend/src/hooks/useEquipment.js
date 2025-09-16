// ========================================
// EQUIPMENT HOOK - src/hooks/useEquipment.js
// Custom hook for equipment operations
// ========================================

import { useState, useEffect, useCallback } from 'react';
import { equipmentAPI } from '../services/api';

export const useEquipment = (initialFilters = {}) => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(initialFilters);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Fetch all equipment with filters
    const fetchEquipment = useCallback(async (newFilters = {}) => {
        try {
            setLoading(true);
            setError(null);

            const allFilters = { ...filters, ...newFilters };
            const response = await equipmentAPI.getAll(allFilters);

            if (response.success) {
                setEquipment(response.equipment || []);
                setPagination(response.pagination || {
                    page: 1,
                    limit: 10,
                    total: response.equipment?.length || 0,
                    totalPages: 1
                });
            }
        } catch (err) {
            setError(err.message);
            setEquipment([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Create new equipment
    const createEquipment = async (equipmentData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await equipmentAPI.create(equipmentData);

            if (response.success) {
                // Add new equipment to the list
                setEquipment(prev => [response.equipment, ...prev]);
                return { success: true, equipment: response.equipment };
            } else {
                throw new Error(response.message || 'Failed to create equipment');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Update equipment
    const updateEquipment = async (id, equipmentData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await equipmentAPI.update(id, equipmentData);

            if (response.success) {
                // Update equipment in the list
                setEquipment(prev =>
                    prev.map(item =>
                        item.id === id ? { ...item, ...response.equipment } : item
                    )
                );
                return { success: true, equipment: response.equipment };
            } else {
                throw new Error(response.message || 'Failed to update equipment');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Delete equipment
    const deleteEquipment = async (id) => {
        try {
            setLoading(true);
            setError(null);

            const response = await equipmentAPI.delete(id);

            if (response.success) {
                // Remove equipment from the list
                setEquipment(prev => prev.filter(item => item.id !== id));
                return { success: true };
            } else {
                throw new Error(response.message || 'Failed to delete equipment');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Get equipment by ID
    const getEquipmentById = async (id) => {
        try {
            setLoading(true);
            setError(null);

            const response = await equipmentAPI.getById(id);

            if (response.success) {
                return { success: true, equipment: response.equipment };
            } else {
                throw new Error(response.message || 'Equipment not found');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Update filters
    const updateFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({});
    };

    // Refresh equipment list
    const refresh = () => {
        fetchEquipment();
    };

    // Clear error
    const clearError = () => {
        setError(null);
    };

    // Load equipment on mount and when filters change
    useEffect(() => {
        fetchEquipment();
    }, [fetchEquipment]);

    // Return hook values and functions
    return {
        // State
        equipment,
        loading,
        error,
        filters,
        pagination,

        // Actions
        fetchEquipment,
        createEquipment,
        updateEquipment,
        deleteEquipment,
        getEquipmentById,

        // Filter actions
        updateFilters,
        clearFilters,

        // Utility actions
        refresh,
        clearError,
    };
};

// Hook for single equipment item
export const useEquipmentDetails = (id) => {
    const [equipment, setEquipment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEquipment = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            const response = await equipmentAPI.getById(id);

            if (response.success) {
                setEquipment(response.equipment);
            } else {
                throw new Error(response.message || 'Equipment not found');
            }
        } catch (err) {
            setError(err.message);
            setEquipment(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchEquipment();
    }, [fetchEquipment]);

    const refresh = () => {
        fetchEquipment();
    };

    const clearError = () => {
        setError(null);
    };

    return {
        equipment,
        loading,
        error,
        refresh,
        clearError,
    };
};

export default useEquipment;