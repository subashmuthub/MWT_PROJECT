const { Op, fn, col, literal } = require('sequelize');
const {
    Equipment,
    Booking,
    Maintenance,
    User,
    Report,
    sequelize
} = require('../models');

class ReportService {

    // Calculate date range based on selection
    static getDateRange(dateRange) {
        const endDate = new Date();
        let startDate = new Date();

        switch (dateRange) {
            case 'last7days':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case 'last30days':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case 'last3months':
                startDate.setMonth(endDate.getMonth() - 3);
                break;
            case 'last6months':
                startDate.setMonth(endDate.getMonth() - 6);
                break;
            case 'lastyear':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(endDate.getDate() - 30);
        }

        return { startDate, endDate };
    }

    // Generate Equipment Usage Report
    static async generateUsageReport(dateRange, customStart = null, customEnd = null) {
        const { startDate, endDate } = customStart && customEnd
            ? { startDate: new Date(customStart), endDate: new Date(customEnd) }
            : this.getDateRange(dateRange);

        try {
            // Get equipment usage data from bookings if available
            const equipmentUsage = await Booking.findAll({
                attributes: [
                    'equipment_id',
                    [fn('COUNT', col('id')), 'booking_count'],
                    [fn('SUM', literal('TIMESTAMPDIFF(HOUR, start_time, end_time)')), 'total_hours']
                ],
                where: {
                    start_time: {
                        [Op.between]: [startDate, endDate]
                    },
                    status: ['confirmed', 'completed']
                },
                include: [{
                    model: Equipment,
                    as: 'equipment',
                    attributes: ['id', 'name', 'model', 'category']
                }],
                group: ['equipment_id'],
                order: [[literal('booking_count'), 'DESC']]
            });

            // Get total bookings for percentage calculation
            const totalBookings = await Booking.count({
                where: {
                    start_time: {
                        [Op.between]: [startDate, endDate]
                    },
                    status: ['confirmed', 'completed']
                }
            });

            // Format data
            const formattedData = equipmentUsage.map(item => ({
                equipment_id: item.equipment_id,
                equipment_name: item.equipment?.name || 'Unknown',
                equipment_model: item.equipment?.model || '',
                category: item.equipment?.category || '',
                booking_count: parseInt(item.dataValues.booking_count),
                total_hours: parseFloat(item.dataValues.total_hours || 0),
                usage_percentage: totalBookings > 0
                    ? ((parseInt(item.dataValues.booking_count) / totalBookings) * 100).toFixed(2)
                    : 0
            }));

            return {
                summary: {
                    total_equipment: formattedData.length,
                    total_bookings: totalBookings,
                    most_used: formattedData[0]?.equipment_name || 'None',
                    date_range: { startDate, endDate }
                },
                data: formattedData
            };
        } catch (error) {
            console.error('Error in generateUsageReport:', error);
            return {
                summary: {
                    total_equipment: 0,
                    total_bookings: 0,
                    most_used: 'None',
                    date_range: { startDate, endDate }
                },
                data: []
            };
        }
    }

    // Generate Equipment Availability Report
    static async generateAvailabilityReport(dateRange, customStart = null, customEnd = null) {
        const { startDate, endDate } = customStart && customEnd
            ? { startDate: new Date(customStart), endDate: new Date(customEnd) }
            : this.getDateRange(dateRange);

        try {
            // Get all equipment
            const allEquipment = await Equipment.findAll({
                attributes: ['id', 'name', 'model', 'status', 'category']
            });

            // Calculate availability for each equipment
            const availabilityData = await Promise.all(
                allEquipment.map(async (equipment) => {
                    // Get total booking hours (if Booking model exists)
                    let bookingHours = 0;
                    try {
                        bookingHours = await Booking.sum(
                            literal('TIMESTAMPDIFF(HOUR, start_time, end_time)'),
                            {
                                where: {
                                    equipment_id: equipment.id,
                                    start_time: {
                                        [Op.between]: [startDate, endDate]
                                    },
                                    status: ['confirmed', 'completed']
                                }
                            }
                        ) || 0;
                    } catch (err) {
                        // Booking table might not exist
                        bookingHours = 0;
                    }

                    // Get maintenance hours
                    let maintenanceHours = 0;
                    try {
                        maintenanceHours = await Maintenance.sum('actual_duration', {
                            where: {
                                equipment_id: equipment.id,
                                scheduled_date: {
                                    [Op.between]: [startDate, endDate]
                                },
                                status: 'completed'
                            }
                        }) || 0;
                    } catch (err) {
                        maintenanceHours = 0;
                    }

                    // Calculate total possible hours (assuming 8 hours per day)
                    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                    const totalPossibleHours = totalDays * 8;

                    const unavailableHours = parseFloat(bookingHours) + (parseFloat(maintenanceHours) / 60);
                    const availabilityPercentage = totalPossibleHours > 0
                        ? (((totalPossibleHours - unavailableHours) / totalPossibleHours) * 100).toFixed(2)
                        : 100;

                    return {
                        equipment_id: equipment.id,
                        equipment_name: equipment.name,
                        model: equipment.model,
                        status: equipment.status,
                        category: equipment.category,
                        booking_hours: parseFloat(bookingHours),
                        maintenance_hours: parseFloat(maintenanceHours) / 60,
                        availability_percentage: parseFloat(availabilityPercentage),
                        total_possible_hours: totalPossibleHours
                    };
                })
            );

            return {
                summary: {
                    total_equipment: availabilityData.length,
                    average_availability: availabilityData.length > 0
                        ? (availabilityData.reduce((sum, item) => sum + item.availability_percentage, 0) / availabilityData.length).toFixed(2)
                        : 0,
                    date_range: { startDate, endDate }
                },
                data: availabilityData.sort((a, b) => b.availability_percentage - a.availability_percentage)
            };
        } catch (error) {
            console.error('Error in generateAvailabilityReport:', error);
            return {
                summary: {
                    total_equipment: 0,
                    average_availability: 0,
                    date_range: { startDate, endDate }
                },
                data: []
            };
        }
    }

    // Generate Maintenance Report
    static async generateMaintenanceReport(dateRange, customStart = null, customEnd = null) {
        const { startDate, endDate } = customStart && customEnd
            ? { startDate: new Date(customStart), endDate: new Date(customEnd) }
            : this.getDateRange(dateRange);

        try {
            // Get maintenance data
            const maintenanceRecords = await Maintenance.findAll({
                where: {
                    scheduled_date: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                include: [
                    {
                        model: Equipment,
                        as: 'equipment',
                        attributes: ['id', 'name', 'model', 'category'],
                        required: false
                    },
                    {
                        model: User,
                        as: 'technician',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    }
                ],
                order: [['scheduled_date', 'DESC']]
            });

            // Calculate statistics
            const totalCost = maintenanceRecords.reduce((sum, record) =>
                sum + parseFloat(record.estimated_cost || 0), 0);

            const completedMaintenance = maintenanceRecords.filter(r => r.status === 'completed');
            const actualCost = completedMaintenance.reduce((sum, record) =>
                sum + parseFloat(record.actual_cost || record.estimated_cost || 0), 0);

            const statusCounts = maintenanceRecords.reduce((acc, record) => {
                acc[record.status] = (acc[record.status] || 0) + 1;
                return acc;
            }, {});

            const typeCounts = maintenanceRecords.reduce((acc, record) => {
                acc[record.maintenance_type] = (acc[record.maintenance_type] || 0) + 1;
                return acc;
            }, {});

            return {
                summary: {
                    total_maintenance: maintenanceRecords.length,
                    total_estimated_cost: totalCost.toFixed(2),
                    total_actual_cost: actualCost.toFixed(2),
                    cost_variance: (actualCost - totalCost).toFixed(2),
                    completion_rate: maintenanceRecords.length > 0
                        ? ((completedMaintenance.length / maintenanceRecords.length) * 100).toFixed(2)
                        : 0,
                    status_breakdown: statusCounts,
                    type_breakdown: typeCounts,
                    date_range: { startDate, endDate }
                },
                data: maintenanceRecords.map(record => ({
                    id: record.id,
                    equipment_name: record.equipment?.name || record.equipment_name,
                    maintenance_type: record.maintenance_type,
                    scheduled_date: record.scheduled_date,
                    status: record.status,
                    technician: record.technician?.name || record.technician_name,
                    estimated_cost: parseFloat(record.estimated_cost || 0),
                    actual_cost: parseFloat(record.actual_cost || 0),
                    priority: record.priority
                }))
            };
        } catch (error) {
            console.error('Error in generateMaintenanceReport:', error);
            return {
                summary: {
                    total_maintenance: 0,
                    total_estimated_cost: 0,
                    total_actual_cost: 0,
                    cost_variance: 0,
                    completion_rate: 0,
                    status_breakdown: {},
                    type_breakdown: {},
                    date_range: { startDate, endDate }
                },
                data: []
            };
        }
    }

    // Generate User Activity Report
    static async generateUserReport(dateRange, customStart = null, customEnd = null) {
        const { startDate, endDate } = customStart && customEnd
            ? { startDate: new Date(customStart), endDate: new Date(customEnd) }
            : this.getDateRange(dateRange);

        try {
            // Get user activity data
            const userActivity = await User.findAll({
                attributes: [
                    'id', 'name', 'email', 'role', 'department', 'student_id',
                    [fn('COUNT', col('bookings.id')), 'booking_count'],
                    [fn('SUM', literal('TIMESTAMPDIFF(HOUR, bookings.start_time, bookings.end_time)')), 'total_hours']
                ],
                include: [{
                    model: Booking,
                    as: 'bookings',
                    attributes: [],
                    where: {
                        start_time: {
                            [Op.between]: [startDate, endDate]
                        },
                        status: ['confirmed', 'completed']
                    },
                    required: false
                }],
                group: ['User.id'],
                having: literal('booking_count > 0'),
                order: [[literal('booking_count'), 'DESC']]
            });

            // Get role-based statistics
            const roleStats = await User.findAll({
                attributes: [
                    'role',
                    [fn('COUNT', col('User.id')), 'user_count']
                ],
                group: ['role']
            });

            return {
                summary: {
                    total_active_users: userActivity.length,
                    most_active_user: userActivity[0]?.name || 'None',
                    total_user_hours: userActivity.reduce((sum, user) =>
                        sum + parseFloat(user.dataValues.total_hours || 0), 0).toFixed(2),
                    role_distribution: roleStats.reduce((acc, role) => {
                        acc[role.role] = {
                            user_count: parseInt(role.dataValues.user_count)
                        };
                        return acc;
                    }, {}),
                    date_range: { startDate, endDate }
                },
                data: userActivity.map(user => ({
                    user_id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    student_id: user.student_id,
                    booking_count: parseInt(user.dataValues.booking_count || 0),
                    total_hours: parseFloat(user.dataValues.total_hours || 0)
                }))
            };
        } catch (error) {
            console.error('Error in generateUserReport:', error);
            return {
                summary: {
                    total_active_users: 0,
                    most_active_user: 'None',
                    total_user_hours: 0,
                    role_distribution: {},
                    date_range: { startDate, endDate }
                },
                data: []
            };
        }
    }

    // Generate Financial Report
    static async generateFinancialReport(dateRange, customStart = null, customEnd = null) {
        const { startDate, endDate } = customStart && customEnd
            ? { startDate: new Date(customStart), endDate: new Date(customEnd) }
            : this.getDateRange(dateRange);

        try {
            // Calculate maintenance costs
            const maintenanceCosts = await Maintenance.findAll({
                attributes: [
                    [fn('SUM', col('estimated_cost')), 'total_estimated'],
                    [fn('SUM', col('actual_cost')), 'total_actual'],
                    [fn('COUNT', col('id')), 'maintenance_count']
                ],
                where: {
                    scheduled_date: {
                        [Op.between]: [startDate, endDate]
                    }
                }
            });

            // Monthly breakdown of maintenance costs
            const monthlyMaintenance = await Maintenance.findAll({
                attributes: [
                    [fn('YEAR', col('scheduled_date')), 'year'],
                    [fn('MONTH', col('scheduled_date')), 'month'],
                    [fn('SUM', col('estimated_cost')), 'monthly_cost'],
                    [fn('COUNT', col('id')), 'monthly_count']
                ],
                where: {
                    scheduled_date: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                group: [fn('YEAR', col('scheduled_date')), fn('MONTH', col('scheduled_date'))],
                order: [[fn('YEAR', col('scheduled_date')), 'ASC'], [fn('MONTH', col('scheduled_date')), 'ASC']]
            });

            const totalEstimated = parseFloat(maintenanceCosts[0]?.dataValues.total_estimated || 0);
            const totalActual = parseFloat(maintenanceCosts[0]?.dataValues.total_actual || 0);

            return {
                summary: {
                    total_maintenance_cost: totalEstimated.toFixed(2),
                    actual_maintenance_cost: totalActual.toFixed(2),
                    cost_variance: (totalActual - totalEstimated).toFixed(2),
                    cost_variance_percentage: totalEstimated > 0
                        ? (((totalActual - totalEstimated) / totalEstimated) * 100).toFixed(2)
                        : 0,
                    maintenance_count: parseInt(maintenanceCosts[0]?.dataValues.maintenance_count || 0),
                    average_cost_per_maintenance: totalEstimated > 0 && maintenanceCosts[0]?.dataValues.maintenance_count > 0
                        ? (totalEstimated / parseInt(maintenanceCosts[0].dataValues.maintenance_count)).toFixed(2)
                        : 0,
                    date_range: { startDate, endDate }
                },
                monthly_breakdown: monthlyMaintenance.map(item => ({
                    year: item.dataValues.year,
                    month: item.dataValues.month,
                    cost: parseFloat(item.dataValues.monthly_cost || 0),
                    count: parseInt(item.dataValues.monthly_count || 0)
                }))
            };
        } catch (error) {
            console.error('Error in generateFinancialReport:', error);
            return {
                summary: {
                    total_maintenance_cost: 0,
                    actual_maintenance_cost: 0,
                    cost_variance: 0,
                    cost_variance_percentage: 0,
                    maintenance_count: 0,
                    average_cost_per_maintenance: 0,
                    date_range: { startDate, endDate }
                },
                monthly_breakdown: []
            };
        }
    }

    // Get Quick Analytics Stats
    static async getQuickStats() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        try {
            // Current period stats
            const [currentMaintenance, previousMaintenance] = await Promise.all([
                Maintenance.sum('estimated_cost', {
                    where: {
                        scheduled_date: { [Op.gte]: thirtyDaysAgo }
                    }
                }),
                Maintenance.sum('estimated_cost', {
                    where: {
                        scheduled_date: {
                            [Op.between]: [sixtyDaysAgo, thirtyDaysAgo]
                        }
                    }
                })
            ]);

            // Try to get booking stats if Booking model exists
            let currentBookings = 0;
            let previousBookings = 0;
            let avgSession = 0;
            let utilization = 50; // Default value

            try {
                [currentBookings, previousBookings] = await Promise.all([
                    Booking.count({
                        where: {
                            created_at: { [Op.gte]: thirtyDaysAgo },
                            status: ['confirmed', 'completed']
                        }
                    }),
                    Booking.count({
                        where: {
                            created_at: {
                                [Op.between]: [sixtyDaysAgo, thirtyDaysAgo]
                            },
                            status: ['confirmed', 'completed']
                        }
                    })
                ]);

                // Calculate average session duration
                const avgSessionResult = await Booking.findAll({
                    attributes: [
                        [fn('AVG', literal('TIMESTAMPDIFF(HOUR, start_time, end_time)')), 'avg_duration']
                    ],
                    where: {
                        start_time: { [Op.gte]: thirtyDaysAgo },
                        status: ['confirmed', 'completed']
                    }
                });

                avgSession = parseFloat(avgSessionResult[0]?.dataValues.avg_duration || 0);

                // Calculate equipment utilization
                const totalEquipment = await Equipment.count({ where: { status: 'available' } });
                const usedEquipment = await Equipment.count({
                    include: [{
                        model: Booking,
                        as: 'bookings',
                        where: {
                            start_time: { [Op.gte]: thirtyDaysAgo },
                            status: ['confirmed', 'completed']
                        },
                        required: true
                    }],
                    distinct: true
                });

                utilization = totalEquipment > 0 ? (usedEquipment / totalEquipment * 100) : 50;
            } catch (err) {
                // Booking model might not exist or have different structure
                console.log('Booking data not available, using defaults');
            }

            return {
                totalBookings: {
                    current: currentBookings,
                    previous: previousBookings,
                    change: previousBookings > 0
                        ? (((currentBookings - previousBookings) / previousBookings) * 100).toFixed(0)
                        : 0
                },
                equipmentUtilization: {
                    percentage: utilization.toFixed(0),
                    change: 5 // Default change
                },
                averageSession: {
                    hours: avgSession.toFixed(1),
                    change: 0 // Default change
                },
                maintenanceCost: {
                    current: parseFloat(currentMaintenance || 0).toFixed(0),
                    previous: parseFloat(previousMaintenance || 0).toFixed(0),
                    change: previousMaintenance > 0
                        ? (((parseFloat(currentMaintenance || 0) - parseFloat(previousMaintenance || 0)) / parseFloat(previousMaintenance)) * 100).toFixed(0)
                        : 0
                }
            };
        } catch (error) {
            console.error('Error in getQuickStats:', error);
            // Return default stats if there's an error
            return {
                totalBookings: { current: 0, previous: 0, change: 0 },
                equipmentUtilization: { percentage: 50, change: 0 },
                averageSession: { hours: 2.5, change: 0 },
                maintenanceCost: { current: 0, previous: 0, change: 0 }
            };
        }
    }
}

module.exports = ReportService;