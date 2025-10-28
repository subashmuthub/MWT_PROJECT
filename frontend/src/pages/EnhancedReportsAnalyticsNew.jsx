// src/pages/EnhancedReportsAnalyticsNew.jsx - Enhanced Reports with Traditional Sidebar
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import * as XLSX from 'xlsx'

const API_BASE_URL = '/api'

export default function EnhancedReportsAnalyticsNew() {
    const { user, token } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    
    // State management
    const [loading, setLoading] = useState(false)
    const [reportData, setReportData] = useState([])
    const [reportStats, setReportStats] = useState({ totalItems: 0 })
    const [filteredData, setFilteredData] = useState([])
    
    // Sidebar state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    
    // Report configuration state
    const [selectedReportType, setSelectedReportType] = useState('lab_management')
    const [selectedLab, setSelectedLab] = useState('')
    const [selectedEquipmentCategory, setSelectedEquipmentCategory] = useState('')
    // const [selectedEquipment, setSelectedEquipment] = useState('') // Unused
    const [dateRange, setDateRange] = useState('all_time')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    
    // Data state
    const [labs, setLabs] = useState([])
    const [equipment, setEquipment] = useState([])

    const reportTypes = [
        { 
            value: 'lab_management', 
            label: 'Lab Management', 
            description: 'Lab information, capacity, and location details',
            icon: '🏢'
        },
        { 
            value: 'equipment_management', 
            label: 'Equipment Management', 
            description: 'Complete equipment listing with specifications',
            icon: '⚙️'
        },
        { 
            value: 'bookings', 
            label: 'Bookings', 
            description: 'Booking trends and user patterns',
            icon: '📅'
        },
        { 
            value: 'incidents', 
            label: 'Incidents', 
            description: 'Incident reports and safety tracking',
            icon: '⚠️'
        },
        { 
            value: 'orders', 
            label: 'Orders', 
            description: 'Order management and procurement tracking',
            icon: '📦'
        },
        { 
            value: 'maintenance', 
            label: 'Maintenance', 
            description: 'Maintenance schedules and history',
            icon: '🔧'
        }
    ]

    const equipmentCategories = [
        { value: 'computer', label: 'Computer Equipment', icon: '💻' },
        { value: 'projector', label: 'Projector Equipment', icon: '📽️' },
        { value: 'printer', label: 'Printer Equipment', icon: '🖨️' },
        { value: 'microscope', label: 'Microscope Equipment', icon: '🔬' },
        { value: 'laboratory', label: 'Laboratory Equipment', icon: '⚗️' },
        { value: 'network', label: 'Network Equipment', icon: '🌐' }
    ]

    // Navigation items (complete list matching Dashboard)
    const navigationItems = [
        {
            id: 'dashboard',
            title: 'Dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z"></path>
                </svg>
            ),
            path: '/dashboard',
            show: true,
            badge: null
        },
        {
            id: 'lab-management',
            title: 'Lab Management',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
            ),
            path: '/lab-management',
            show: true,
            badge: labs.length > 0 ? labs.length : null
        },
        {
            id: 'equipment',
            title: 'Equipment',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
            ),
            path: '/equipment',
            show: true,
            badge: equipment.length > 0 ? equipment.length : null
        },
        {
            id: 'bookings',
            title: 'Bookings',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
            ),
            path: '/bookings',
            show: true,
            badge: null
        },
        {
            id: 'calendar',
            title: 'Calendar',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
            ),
            path: '/calendar',
            show: true,
            badge: null
        },
        {
            id: 'training',
            title: 'Training',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
            ),
            path: '/training',
            show: true,
            badge: 0
        },
        {
            id: 'incidents',
            title: 'Incidents',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
            ),
            path: '/incidents',
            show: true,
            badge: 1,
            badgeColor: 'bg-red-500 text-white'
        },
        {
            id: 'orders',
            title: 'Orders',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
            ),
            path: '/orders',
            show: user?.role === 'admin',
            badge: null
        },
        {
            id: 'users',
            title: 'Users',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
            ),
            path: '/users',
            show: user?.role === 'admin',
            badge: 0
        },
        {
            id: 'reports',
            title: 'Reports',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
            ),
            path: '/reports',
            show: user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'lab_assistant',
            badge: null
        },
        {
            id: 'maintenance',
            title: 'Maintenance',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
            ),
            path: '/maintenance',
            show: user?.role === 'admin' || user?.role === 'lab_technician',
            badge: null
        },
        {
            id: 'notifications',
            title: 'Notifications',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
            ),
            path: '/notifications',
            show: true,
            badge: null
        }
    ]

    // Handle navigation
    const handleNavigation = (path) => {
        try {
            navigate(path)
        } catch (error) {
            console.error(`Failed to navigate to ${path}:`, error)
        }
    }

    // Fetch initial data
    const fetchInitialData = useCallback(async () => {
        try {
            setLoading(true)
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
            
            // Fetch labs data
            const labsResponse = await fetch(`${API_BASE_URL}/labs`, { headers })
            if (labsResponse.ok) {
                const labsData = await labsResponse.json()
                setLabs(labsData.data?.labs || [])
            }
            
            // Fetch real equipment data for initial report display
            const equipmentResponse = await fetch(`${API_BASE_URL}/equipment?limit=1000`, { headers })
            if (equipmentResponse.ok) {
                const equipmentData = await equipmentResponse.json()
                const equipmentList = equipmentData.data?.equipment || []
                
                // Transform real equipment data for display
                const transformedData = equipmentList.map(equipment => ({
                    'Equipment ID': equipment.id || 'N/A',
                    'Name': equipment.name || 'Unknown Equipment',
                    'Category': equipment.category || 'Uncategorized', 
                    'Status': equipment.status || 'Unknown',
                    'Location': equipment.lab?.name || 'No Location',
                    'Purchase Date': equipment.purchase_date || 'N/A',
                    'Cost': equipment.purchase_price ? `$${equipment.purchase_price}` : 'N/A',
                    'Brand': equipment.manufacturer || 'N/A',
                    'Model': equipment.model || 'N/A',
                    'Serial Number': equipment.serial_number || 'N/A'
                }))
                
                setReportData(transformedData)
                setFilteredData(transformedData)
                setReportStats({ totalItems: transformedData.length })
                setEquipment(equipmentList)
            }
            
        } catch (error) {
            console.error('Error fetching initial data:', error)
            // Set empty data instead of mock data on error
            setReportData([])
            setFilteredData([])
            setReportStats({ totalItems: 0 })
        } finally {
            setLoading(false)
        }
    }, [token])

    useEffect(() => {
        // Set document title
        document.title = 'Reports | NEC LabMS'
        
        if (token) {
            fetchInitialData()
        }
    }, [token, fetchInitialData])

    // Generate comprehensive real report data based on selected type
    const generateRealData = async () => {
        try {
            setLoading(true)
            
            let transformedData = []
            
            switch (selectedReportType) {
                case 'lab_management':
                    transformedData = await fetchLabManagementReport()
                    break
                case 'equipment_management':
                    transformedData = await fetchEquipmentReport()
                    break
                case 'bookings':
                    transformedData = await fetchBookingReport()
                    break
                case 'incidents':
                    transformedData = await fetchIncidentsReport()
                    break
                case 'orders':
                    transformedData = await fetchOrdersReport()
                    break
                case 'maintenance':
                    transformedData = await fetchMaintenanceReport()
                    break
                default:
                    transformedData = await fetchLabManagementReport()
            }
            
            setReportData(transformedData)
            setFilteredData(transformedData)
            setReportStats({ totalItems: transformedData.length })
            
        } catch (error) {
            console.error('Error fetching report data:', error)
            setReportData([])
            setFilteredData([])
            setReportStats({ totalItems: 0 })
        } finally {
            setLoading(false)
        }
    }

    // Fetch Equipment Inventory Report
    const fetchEquipmentReport = async () => {
        const response = await fetch(`${API_BASE_URL}/equipment?limit=1000`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        
        if (!response.ok) throw new Error('Failed to fetch equipment data')
        
        const data = await response.json()
        const equipmentList = data.data?.equipment || []
        
        return equipmentList.map(equipment => ({
            'Equipment ID': equipment.id || 'N/A',
            'Name': equipment.name || 'Unknown Equipment',
            'Category': equipment.category || 'Uncategorized', 
            'Status': equipment.status || 'Unknown',
            'Location': equipment.lab?.name || 'No Location',
            'Purchase Date': equipment.purchase_date || 'N/A',
            'Cost': equipment.purchase_price ? `$${equipment.purchase_price}` : 'N/A',
            'Brand': equipment.manufacturer || 'N/A',
            'Model': equipment.model || 'N/A',
            'Serial Number': equipment.serial_number || 'N/A'
        }))
    }

    // Fetch Maintenance Report
    const fetchMaintenanceReport = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/maintenance`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            
            if (!response.ok) throw new Error('Failed to fetch maintenance data')
            
            const data = await response.json()
            const maintenanceList = data.data || []
            
            return maintenanceList.map(maintenance => ({
                'Maintenance ID': maintenance.id || 'N/A',
                'Equipment': maintenance.equipment?.name || 'Unknown Equipment',
                'Type': maintenance.maintenance_type || 'N/A',
                'Status': maintenance.status || 'Unknown',
                'Scheduled Date': maintenance.scheduled_date || 'N/A',
                'Completed Date': maintenance.completed_date || 'Pending',
                'Technician': maintenance.technician?.name || 'Not Assigned',
                'Cost': maintenance.cost ? `$${maintenance.cost}` : 'N/A',
                'Description': maintenance.description || 'No description',
                'Priority': maintenance.priority || 'Medium'
            }))
        } catch (error) {
            console.error('Maintenance API not available:', error.message)
            return []
        }
    }

    // Fetch Lab Management Report
    const fetchLabManagementReport = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/labs`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            
            if (!response.ok) throw new Error('Failed to fetch lab data')
            
            const data = await response.json()
            const labsList = data.data?.labs || []
            
            return labsList.map(lab => ({
                'Lab ID': lab.id || 'N/A',
                'Lab Name': lab.name || 'Unknown Lab',
                'Lab Type': lab.lab_type || 'Not Specified',
                'Location': lab.location || 'No Location',
                'Capacity': lab.capacity || 'N/A',
                'Status': lab.is_active ? 'Active' : 'Inactive',
                'Created Date': lab.created_at ? new Date(lab.created_at).toLocaleDateString() : 'N/A',
                'Description': lab.description || 'No description',
                'Equipment Count': lab.equipment?.length || 0,
                'Manager': lab.labCreator?.name || 'Not Assigned'
            }))
        } catch (error) {
            console.error('Labs API not available:', error.message)
            return []
        }
    }

    // Fetch Incidents Report
    const fetchIncidentsReport = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/incidents`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            
            if (!response.ok) throw new Error('Failed to fetch incidents data')
            
            const data = await response.json()
            const incidentsList = data.data || []
            
            return incidentsList.map(incident => ({
                'Incident ID': incident.id || 'N/A',
                'Title': incident.title || 'Unknown Incident',
                'Priority': incident.priority || 'Unknown',
                'Status': incident.status || 'Unknown',
                'Category': incident.category || 'Unknown',
                'Equipment': incident.relatedEquipment?.name || incident.equipment?.name || 'No Equipment',
                'Reporter': incident.incidentReporter?.name || incident.reporter?.name || 'Unknown Reporter',
                'Assignee': incident.incidentAssignee?.name || incident.assignee?.name || 'Not Assigned',
                'Location': incident.location || 'No Location',
                'Created Date': incident.created_at ? new Date(incident.created_at).toLocaleDateString() : 'N/A',
                'Resolved Date': incident.resolved_at ? new Date(incident.resolved_at).toLocaleDateString() : 'Not Resolved',
                'Description': incident.description || 'No description'
            }))
        } catch (error) {
            console.error('Incidents API not available:', error.message)
            return []
        }
    }

    // Fetch Orders Report
    const fetchOrdersReport = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            
            if (!response.ok) throw new Error('Failed to fetch orders data')
            
            const data = await response.json()
            const ordersList = data.data || []
            
            return ordersList.map(order => ({
                'Order ID': order.id || 'N/A',
                'Supplier': order.supplier || 'Unknown Supplier',
                'Equipment Name': order.equipment_name || 'Unknown Equipment',
                'Quantity': order.quantity || 0,
                'Unit Price': order.unit_price ? `$${order.unit_price}` : 'N/A',
                'Total Amount': order.total_amount ? `$${order.total_amount}` : 'N/A',
                'Status': order.status || 'Unknown',
                'Priority': order.priority || 'Medium',
                'Order Date': order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A',
                'Expected Delivery': order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : 'Not Set',
                'Created By': order.creator?.name || 'Unknown User'
            }))
        } catch (error) {
            console.error('Orders API not available:', error.message)
            return []
        }
    }

    // Fetch Booking Analysis Report
    const fetchBookingReport = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            
            if (!response.ok) throw new Error('Failed to fetch booking data')
            
            const data = await response.json()
            const bookingList = data.data?.bookings || []
            
            return bookingList.map(booking => {
                // Calculate duration in hours
                const startTime = new Date(booking.start_time)
                const endTime = new Date(booking.end_time)
                const durationMs = endTime - startTime
                const durationHours = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10 // Round to 1 decimal

                return {
                    'Booking ID': booking.id || 'N/A',
                    'Booking Type': booking.booking_type || 'N/A',
                    'Equipment': booking.equipment?.name || 'N/A',
                    'User': booking.user?.name || 'Unknown User',
                    'Lab': booking.lab?.name || 'No Lab',
                    'Start Time': booking.start_time ? new Date(booking.start_time).toLocaleString() : 'N/A',
                    'End Time': booking.end_time ? new Date(booking.end_time).toLocaleString() : 'N/A',
                    'Status': booking.status || 'Unknown',
                    'Purpose': booking.purpose || 'No purpose specified',
                    'Duration Hours': durationHours || 'N/A',
                    'Created Date': booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'
                }
            })
        } catch (error) {
            console.error('Bookings API not available:', error.message)
            return []
        }
    }

    // Export to Excel with enhanced functionality
    const exportToExcel = async () => {
        if (!reportData.length) {
            alert('No data available to export. Please generate a report first.')
            return
        }

        try {
            const workbook = XLSX.utils.book_new()
            
            // Create main data sheet with the selected report type name
            const reportTypeNames = {
                'lab_management': 'Lab Management',
                'equipment_management': 'Equipment Management',
                'bookings': 'Bookings',
                'incidents': 'Incidents',
                'orders': 'Orders',
                'maintenance': 'Maintenance'
            }
            
            const sheetName = reportTypeNames[selectedReportType] || 'Report Data'
            const worksheet = XLSX.utils.json_to_sheet(reportData)
            
            // Style the worksheet (add some formatting)
            const range = XLSX.utils.decode_range(worksheet['!ref'])
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const address = XLSX.utils.encode_cell({ c: C, r: 0 })
                if (!worksheet[address]) continue
                worksheet[address].s = {
                    font: { bold: true },
                    fill: { fgColor: { rgb: "EEEEEE" } }
                }
            }
            
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
            
            // Create comprehensive metadata sheet
            const selectedLabName = labs.find(lab => lab.id == selectedLab)?.name || 'All Labs'
            const selectedCategoryName = equipmentCategories.find(cat => cat.value === selectedEquipmentCategory)?.label || 'All Categories'
            
            const metadataSheet = XLSX.utils.json_to_sheet([
                { 'Property': 'Report Type', 'Value': reportTypeNames[selectedReportType] || selectedReportType },
                { 'Property': 'Generated By', 'Value': user?.name || 'Unknown User' },
                { 'Property': 'User Email', 'Value': user?.email || 'No Email' },
                { 'Property': 'User Role', 'Value': user?.role || 'No Role' },
                { 'Property': 'Generated Date', 'Value': new Date().toLocaleDateString() },
                { 'Property': 'Generated Time', 'Value': new Date().toLocaleTimeString() },
                { 'Property': 'Total Records', 'Value': reportData.length },
                { 'Property': 'Date Range', 'Value': 
                    dateRange === 'custom_range' && fromDate && toDate 
                        ? `${fromDate} to ${toDate}` 
                        : dateRange.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) 
                },
                { 'Property': 'Lab Filter', 'Value': selectedLabName },
                { 'Property': 'Category Filter', 'Value': selectedCategoryName },
                { 'Property': 'Data Source', 'Value': 'Real Database Records' },
                { 'Property': 'Export Format', 'Value': 'Microsoft Excel (.xlsx)' }
            ])
            XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Report Metadata')
            
            // Create summary sheet for certain report types
            if ((selectedReportType === 'equipment_management' || selectedReportType === 'lab_management') && reportData.length > 0) {
                const statusCounts = reportData.reduce((acc, item) => {
                    const status = item.Status || 'Unknown'
                    acc[status] = (acc[status] || 0) + 1
                    return acc
                }, {})
                
                const categoryCounts = reportData.reduce((acc, item) => {
                    const category = selectedReportType === 'lab_management' ? 
                        (item['Lab Type'] || 'Unspecified') : 
                        (item.Category || 'Uncategorized')
                    acc[category] = (acc[category] || 0) + 1
                    return acc
                }, {})
                
                const summaryData = [
                    { 'Metric': selectedReportType === 'lab_management' ? 'Total Labs' : 'Total Equipment', 'Count': reportData.length },
                    ...Object.entries(statusCounts).map(([status, count]) => ({
                        'Metric': `${status} ${selectedReportType === 'lab_management' ? 'Labs' : 'Equipment'}`,
                        'Count': count
                    })),
                    { 'Metric': '', 'Count': '' }, // Empty row
                    { 'Metric': selectedReportType === 'lab_management' ? 'LAB TYPES' : 'CATEGORIES', 'Count': 'COUNT' },
                    ...Object.entries(categoryCounts).map(([category, count]) => ({
                        'Metric': category,
                        'Count': count
                    }))
                ]
                
                const summarySheet = XLSX.utils.json_to_sheet(summaryData)
                XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
            }
            
            // Generate meaningful filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 16).replace(/:/g, '-')
            const filename = `LabMS_${reportTypeNames[selectedReportType].replace(/\s+/g, '_')}_${timestamp}.xlsx`
            
            // Save file
            XLSX.writeFile(workbook, filename)
            
            // Show success message
            const successMsg = document.createElement('div')
            successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
            successMsg.innerHTML = `
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Excel report exported successfully!</span>
                </div>
                <div class="text-sm mt-1">File: ${filename}</div>
            `
            document.body.appendChild(successMsg)
            setTimeout(() => {
                if (document.body.contains(successMsg)) {
                    document.body.removeChild(successMsg)
                }
            }, 5000)
            
        } catch (error) {
            console.error('Export error:', error)
            alert(`Failed to export Excel file: ${error.message}`)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg border-r border-gray-200 transition-all duration-300`}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                    {!sidebarCollapsed && (
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden">
                                <img 
                                    src="/nec-logo.png" 
                                    alt="NEC Logo" 
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                NEC LabMS
                            </h1>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <svg className={`w-5 h-5 text-gray-600 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
                        </svg>
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="mt-6 px-3">
                    <div className="space-y-1">
                        {navigationItems.filter(item => item.show).map((item) => {
                            const isActive = location.pathname === item.path
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigation(item.path)}
                                    className={`w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                    title={sidebarCollapsed ? item.title : ''}
                                >
                                    <div className="flex items-center">
                                        <div className="flex items-center justify-center w-5 h-5">
                                            {item.icon}
                                        </div>
                                        {!sidebarCollapsed && (
                                            <span className="ml-3 flex-1 text-left">{item.title}</span>
                                        )}
                                    </div>
                                    {!sidebarCollapsed && item.badge !== null && (
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            item.badgeColor || 'bg-gray-200 text-gray-800'
                                        }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </nav>

                {/* User Profile Section */}
                {!sidebarCollapsed && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                                {user?.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.name || 'Unknown User'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.role?.replace('_', ' ') || 'No Role'} • {user?.email || 'No Email'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className={`${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 min-h-screen`}>
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-3xl">📊</span>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                        Advanced Reports & Analytics
                                    </h1>
                                </div>
                                <p className="mt-1 text-gray-600">
                                    Generate comprehensive Excel reports with hierarchical filtering
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6 max-w-full overflow-x-hidden">
            {/* Report Type Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xl">📋</span>
                    <h2 className="text-xl font-semibold text-gray-900">Select Report Type</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportTypes.map((type) => (
                        <button
                            key={type.value}
                            onClick={() => setSelectedReportType(type.value)}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                                selectedReportType === type.value
                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center space-x-3 mb-2">
                                <span className="text-2xl">{type.icon}</span>
                                <span className="font-medium text-gray-900">{type.label}</span>
                            </div>
                            <div className="text-sm text-gray-600">{type.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Hierarchical Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xl">🔍</span>
                    <h2 className="text-xl font-semibold text-gray-900">Hierarchical Filters</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
                    {/* Lab Selection */}
                    <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                            <span>🏢</span>
                            <span>Select Lab</span>
                        </label>
                        <select
                            value={selectedLab}
                            onChange={(e) => setSelectedLab(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Labs</option>
                            {labs.map((lab) => (
                                <option key={lab.id} value={lab.id}>{lab.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Equipment Category */}
                    <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                            <span>📦</span>
                            <span>Equipment Category</span>
                        </label>
                        <select
                            value={selectedEquipmentCategory}
                            onChange={(e) => setSelectedEquipmentCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            {equipmentCategories.map((category) => (
                                <option key={category.value} value={category.value}>
                                    {category.icon} {category.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range Type */}
                    <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                            <span>📅</span>
                            <span>Date Range Type</span>
                        </label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all_time">All Time</option>
                            <option value="last_7_days">Last 7 Days</option>
                            <option value="last_30_days">Last 30 Days</option>
                            <option value="last_90_days">Last 90 Days</option>
                            <option value="this_year">This Year</option>
                            <option value="custom_range">Custom Date Range</option>
                        </select>
                    </div>

                    {/* Generate Button */}
                    <div className="flex items-end">
                        <button
                            onClick={generateRealData}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center space-x-2">
                                    <span>⏳</span>
                                    <span>Loading...</span>
                                </span>
                            ) : (
                                <span className="flex items-center justify-center space-x-2">
                                    <span>📊</span>
                                    <span>Generate Report</span>
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Custom Date Range Inputs */}
                {dateRange === 'custom_range' && (
                    <div className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                    <span>📅</span>
                                    <span>From Date</span>
                                </label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                    <span>📅</span>
                                    <span>To Date</span>
                                </label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min={fromDate}
                                />
                            </div>
                        </div>
                        {fromDate && toDate && fromDate > toDate && (
                            <div className="mt-2 text-red-600 text-sm flex items-center space-x-2">
                                <span>⚠️</span>
                                <span>From Date cannot be later than To Date</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Report Results */}
            {reportData.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-xl">📊</span>
                            <h2 className="text-xl font-semibold text-gray-900">Report Results</h2>
                        </div>
                        <button
                            onClick={exportToExcel}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            <span className="flex items-center space-x-2">
                                <span>📥</span>
                                <span>Export to Excel</span>
                            </span>
                        </button>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-4">
                        Total Records: {reportStats.totalItems}
                    </div>

                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {reportData.length > 0 && Object.keys(reportData[0]).map((key) => (
                                        <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reportData.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        {Object.values(row).map((value, cellIndex) => (
                                            <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {value}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {reportData.length === 0 && !loading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Report Generated</h3>
                    <p className="text-gray-600 mb-6">Select your filters and click "Generate Report" to view data</p>
                </div>
            )}
                </main>
            </div>
        </div>
    )
}