// src/pages/EquipmentInventory.jsx - Enhanced Professional UI
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'

// Enhanced Add Equipment Modal Component with Dynamic Fields
function AddEquipmentModal({ isOpen, onClose, onEquipmentAdded, labs }) {
    const { token } = useAuth()
    const API_BASE_URL = '/api' // Use relative URL for proxy
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        serial_number: '',
        model: '',
        manufacturer: '',
        category: 'computer',
        lab_id: '',
        location_details: '',
        status: 'available',
        condition_status: 'excellent',
        purchase_price: '',
        current_value: '',
        purchase_date: new Date().toISOString().split('T')[0],
        warranty_expiry: '',
        // Computer specific
        processor: '',
        ram: '',
        storage: '',
        graphics_card: '',
        operating_system: '',
        // Projector specific
        resolution: '',
        brightness: '',
        contrast_ratio: '',
        lamp_hours: '',
        // Printer specific
        print_type: '',
        print_speed: '',
        paper_size: '',
        connectivity: '',
        // Microscope specific
        magnification: '',
        objective_lenses: '',
        illumination: '',
        // Lab Equipment specific
        capacity: '',
        power_rating: '',
        temperature_range: '',
        accuracy: '',
        // Network Equipment specific
        ports: '',
        speed: '',
        protocol: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Enhanced categories - only 6 main categories
    const categories = [
        {
            value: 'computer',
            label: '💻 Computer & IT Equipment',
            icon: '💻',
            color: 'bg-blue-100 text-blue-800'
        },
        {
            value: 'projector',
            label: '📽️ Projectors & Displays',
            icon: '📽️',
            color: 'bg-purple-100 text-purple-800'
        },
        {
            value: 'printer',
            label: '🖨️ Printers & Scanners',
            icon: '🖨️',
            color: 'bg-green-100 text-green-800'
        },
        {
            value: 'microscope',
            label: '🔬 Microscopes & Optics',
            icon: '🔬',
            color: 'bg-indigo-100 text-indigo-800'
        },
        {
            value: 'lab_equipment',
            label: '⚗️ Laboratory Equipment',
            icon: '⚗️',
            color: 'bg-emerald-100 text-emerald-800'
        },
        {
            value: 'network',
            label: '🌐 Network Equipment',
            icon: '🌐',
            color: 'bg-orange-100 text-orange-800'
        }
    ]

    // Dynamic fields based on category
    const getSpecificFields = () => {
        switch (formData.category) {
            case 'computer':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="col-span-2">
                            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                                💻 Computer Specifications
                            </h4>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Processor/CPU
                            </label>
                            <input
                                type="text"
                                name="processor"
                                value={formData.processor}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Intel Core i7-12700K"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                RAM Memory
                            </label>
                            <input
                                type="text"
                                name="ram"
                                value={formData.ram}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 16GB DDR4"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Storage
                            </label>
                            <input
                                type="text"
                                name="storage"
                                value={formData.storage}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 512GB SSD + 1TB HDD"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Graphics Card
                            </label>
                            <input
                                type="text"
                                name="graphics_card"
                                value={formData.graphics_card}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., NVIDIA RTX 4060"
                                disabled={loading}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Operating System
                            </label>
                            <select
                                name="operating_system"
                                value={formData.operating_system}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                            >
                                <option value="">Select OS</option>
                                <option value="Windows 11 Pro">Windows 11 Pro</option>
                                <option value="Windows 11 Home">Windows 11 Home</option>
                                <option value="Windows 10 Pro">Windows 10 Pro</option>
                                <option value="macOS Ventura">macOS Ventura</option>
                                <option value="Ubuntu Linux">Ubuntu Linux</option>
                                <option value="Other Linux">Other Linux</option>
                            </select>
                        </div>
                    </div>
                )

            case 'projector':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="col-span-2">
                            <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                                📽️ Projector Specifications
                            </h4>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Resolution
                            </label>
                            <select
                                name="resolution"
                                value={formData.resolution}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                disabled={loading}
                            >
                                <option value="">Select Resolution</option>
                                <option value="4K UHD (3840x2160)">4K UHD (3840x2160)</option>
                                <option value="Full HD (1920x1080)">Full HD (1920x1080)</option>
                                <option value="HD (1280x720)">HD (1280x720)</option>
                                <option value="XGA (1024x768)">XGA (1024x768)</option>
                                <option value="SVGA (800x600)">SVGA (800x600)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Brightness (Lumens)
                            </label>
                            <input
                                type="text"
                                name="brightness"
                                value={formData.brightness}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g., 3500 Lumens"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Contrast Ratio
                            </label>
                            <input
                                type="text"
                                name="contrast_ratio"
                                value={formData.contrast_ratio}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g., 15000:1"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Lamp Hours Used
                            </label>
                            <input
                                type="number"
                                name="lamp_hours"
                                value={formData.lamp_hours}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="0"
                                disabled={loading}
                            />
                        </div>
                    </div>
                )

            case 'printer':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="col-span-2">
                            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                                🖨️ Printer Specifications
                            </h4>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Print Type
                            </label>
                            <select
                                name="print_type"
                                value={formData.print_type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                disabled={loading}
                            >
                                <option value="">Select Type</option>
                                <option value="Laser Printer">Laser Printer</option>
                                <option value="Inkjet Printer">Inkjet Printer</option>
                                <option value="3D Printer">3D Printer</option>
                                <option value="Label Printer">Label Printer</option>
                                <option value="Scanner">Scanner</option>
                                <option value="Multifunction">Multifunction (Print/Scan/Copy)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Print Speed
                            </label>
                            <input
                                type="text"
                                name="print_speed"
                                value={formData.print_speed}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., 30 ppm (pages per minute)"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Paper Size Support
                            </label>
                            <input
                                type="text"
                                name="paper_size"
                                value={formData.paper_size}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., A4, A3, Letter, Legal"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Connectivity
                            </label>
                            <input
                                type="text"
                                name="connectivity"
                                value={formData.connectivity}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., WiFi, Ethernet, USB, Bluetooth"
                                disabled={loading}
                            />
                        </div>
                    </div>
                )

            case 'microscope':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <div className="col-span-2">
                            <h4 className="font-semibold text-indigo-800 mb-3 flex items-center">
                                🔬 Microscope Specifications
                            </h4>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Maximum Magnification
                            </label>
                            <input
                                type="text"
                                name="magnification"
                                value={formData.magnification}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., 1000x, 2000x"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Objective Lenses
                            </label>
                            <input
                                type="text"
                                name="objective_lenses"
                                value={formData.objective_lenses}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., 4x, 10x, 40x, 100x"
                                disabled={loading}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Illumination Type
                            </label>
                            <select
                                name="illumination"
                                value={formData.illumination}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={loading}
                            >
                                <option value="">Select Illumination</option>
                                <option value="LED">LED</option>
                                <option value="Halogen">Halogen</option>
                                <option value="Fluorescence">Fluorescence</option>
                                <option value="Phase Contrast">Phase Contrast</option>
                                <option value="Darkfield">Darkfield</option>
                            </select>
                        </div>
                    </div>
                )

            case 'lab_equipment':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <div className="col-span-2">
                            <h4 className="font-semibold text-emerald-800 mb-3 flex items-center">
                                ⚗️ Laboratory Equipment Specifications
                            </h4>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Capacity/Volume
                            </label>
                            <input
                                type="text"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g., 500ml, 2L, 50 samples"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Power Rating
                            </label>
                            <input
                                type="text"
                                name="power_rating"
                                value={formData.power_rating}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g., 220V, 1500W"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Temperature Range
                            </label>
                            <input
                                type="text"
                                name="temperature_range"
                                value={formData.temperature_range}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g., -20°C to +150°C"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Accuracy/Precision
                            </label>
                            <input
                                type="text"
                                name="accuracy"
                                value={formData.accuracy}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g., ±0.1mg, ±0.01pH"
                                disabled={loading}
                            />
                        </div>
                    </div>
                )

            case 'network':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <div className="col-span-2">
                            <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                                🌐 Network Equipment Specifications
                            </h4>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Number of Ports
                            </label>
                            <input
                                type="text"
                                name="ports"
                                value={formData.ports}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="e.g., 24 Ethernet, 4 SFP+"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Speed/Bandwidth
                            </label>
                            <input
                                type="text"
                                name="speed"
                                value={formData.speed}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="e.g., 1Gbps, 10Gbps, WiFi 6"
                                disabled={loading}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Supported Protocols
                            </label>
                            <input
                                type="text"
                                name="protocol"
                                value={formData.protocol}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="e.g., 802.11ax, VLAN, SNMP, PoE+"
                                disabled={loading}
                            />
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch(`${API_BASE_URL}/equipment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (result.success) {
                onEquipmentAdded(result.data.equipment)
                onClose()
                // Reset form
                setFormData({
                    name: '',
                    description: '',
                    serial_number: '',
                    model: '',
                    manufacturer: '',
                    category: 'computer',
                    lab_id: '',
                    location_details: '',
                    status: 'available',
                    condition_status: 'excellent',
                    purchase_price: '',
                    current_value: '',
                    purchase_date: new Date().toISOString().split('T')[0],
                    warranty_expiry: '',
                    processor: '',
                    ram: '',
                    storage: '',
                    graphics_card: '',
                    operating_system: '',
                    resolution: '',
                    brightness: '',
                    contrast_ratio: '',
                    lamp_hours: '',
                    print_type: '',
                    print_speed: '',
                    paper_size: '',
                    connectivity: '',
                    magnification: '',
                    objective_lenses: '',
                    illumination: '',
                    capacity: '',
                    power_rating: '',
                    temperature_range: '',
                    accuracy: '',
                    ports: '',
                    speed: '',
                    protocol: ''
                })
            } else {
                setError(result.message || 'Failed to create equipment')
            }
        } catch (error) {
            console.error('Error creating equipment:', error)
            setError('Failed to create equipment. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setError('')
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">➕</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Add New Equipment</h2>
                                <p className="text-blue-100 text-sm">Enter equipment details and specifications</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                            disabled={loading}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                                </svg>
                                <span className="font-medium">⚠️ {error}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information Section */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <span className="mr-2">📋</span>
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Equipment Category *
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {categories.map(cat => (
                                            <label key={cat.value} className="relative">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    value={cat.value}
                                                    checked={formData.category === cat.value}
                                                    onChange={handleChange}
                                                    className="sr-only"
                                                    disabled={loading}
                                                />
                                                <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.category === cat.value
                                                        ? `${cat.color} border-current`
                                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                                    }`}>
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-1">{cat.icon}</div>
                                                        <div className="text-xs font-medium">
                                                            {cat.label.split(' ').slice(1).join(' ')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Equipment Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter equipment name"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Serial Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="serial_number"
                                        value={formData.serial_number}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Serial number"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Assigned Lab *
                                    </label>
                                    <select
                                        name="lab_id"
                                        value={formData.lab_id}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">🏛️ Select Lab</option>
                                        {labs.map(lab => (
                                            <option key={lab.id} value={lab.id}>
                                                {lab.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Manufacturer/Brand
                                    </label>
                                    <input
                                        type="text"
                                        name="manufacturer"
                                        value={formData.manufacturer}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Manufacturer name"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Model Number
                                    </label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Equipment model"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Condition Status
                                    </label>
                                    <select
                                        name="condition_status"
                                        value={formData.condition_status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={loading}
                                    >
                                        <option value="excellent">✨ Excellent</option>
                                        <option value="good">✅ Good</option>
                                        <option value="fair">⚠️ Fair</option>
                                        <option value="poor">❌ Poor</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Location Details
                                    </label>
                                    <input
                                        type="text"
                                        name="location_details"
                                        value={formData.location_details}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="e.g., Room 101, Shelf A, Cabinet 2"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                        rows="3"
                                        placeholder="Detailed equipment description"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Category-Specific Specifications */}
                        {getSpecificFields()}

                        {/* Purchase Information Section */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <span className="mr-2">💰</span>
                                Purchase Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Purchase Price
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="purchase_price"
                                            value={formData.purchase_price}
                                            onChange={handleChange}
                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="0.00"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Current Value
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="current_value"
                                            value={formData.current_value}
                                            onChange={handleChange}
                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="0.00"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Purchase Date
                                    </label>
                                    <input
                                        type="date"
                                        name="purchase_date"
                                        value={formData.purchase_date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Warranty Expiry
                                    </label>
                                    <input
                                        type="date"
                                        name="warranty_expiry"
                                        value={formData.warranty_expiry}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !formData.name.trim() || !formData.serial_number.trim() || !formData.lab_id}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>➕</span>
                                        <span>Create Equipment</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

// Main Equipment Inventory Component - Enhanced UI
export default function EquipmentInventory() {
    const { token, user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // All existing state and functions remain the same...
    const [equipment, setEquipment] = useState([])
    const [labs, setLabs] = useState([])
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        inUse: 0,
        maintenance: 0,
        broken: 0
    })
    const [filters, setFilters] = useState({
        lab_id: '',
        status: '',
        category: '',
        search: ''
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const userMenuRef = useRef(null)
    const notificationRef = useRef(null)

    const API_BASE_URL = '/api'

    // Enhanced categories for filtering
    const categoryOptions = [
        { value: 'computer', label: '💻 Computer & IT', color: 'bg-blue-100 text-blue-800' },
        { value: 'projector', label: '📽️ Projectors', color: 'bg-purple-100 text-purple-800' },
        { value: 'printer', label: '🖨️ Printers', color: 'bg-green-100 text-green-800' },
        { value: 'microscope', label: '🔬 Microscopes', color: 'bg-indigo-100 text-indigo-800' },
        { value: 'lab_equipment', label: '⚗️ Lab Equipment', color: 'bg-emerald-100 text-emerald-800' },
        { value: 'network', label: '🌐 Network', color: 'bg-orange-100 text-orange-800' }
    ]

    // Enhanced navigation items
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
            show: true
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
            show: true
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
            show: true
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
            show: true
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
            show: true
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
            show: true
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
            show: true
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
            show: user?.role === 'admin'
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
            show: user?.role === 'admin'
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
            show: user?.role === 'admin'
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
            show: user?.role === 'admin' || user?.role === 'lab_technician'
        }
    ]

    // All existing useEffect and function implementations remain the same...
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false)
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        document.title = 'Equipment Inventory | LabMS'
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                navigate('/login')
                return
            }

            try {
                setLoading(true)
                setError('')

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }

                const queryParams = new URLSearchParams()
                Object.keys(filters).forEach(key => {
                    if (filters[key]) {
                        queryParams.append(key, filters[key])
                    }
                })

                const labsResponse = await fetch(`${API_BASE_URL}/labs`, { headers })
                if (labsResponse.ok) {
                    const labsData = await labsResponse.json()
                    setLabs(labsData.data?.labs || [])
                }

                const equipmentResponse = await fetch(`${API_BASE_URL}/equipment?${queryParams}`, { headers })
                if (equipmentResponse.ok) {
                    const equipmentData = await equipmentResponse.json()
                    setEquipment(equipmentData.data?.equipment || [])

                    const equipmentList = equipmentData.data?.equipment || []
                    const calculatedStats = {
                        total: equipmentList.length,
                        available: equipmentList.filter(item => item.status === 'available').length,
                        inUse: equipmentList.filter(item => item.status === 'in_use').length,
                        maintenance: equipmentList.filter(item => item.status === 'maintenance').length,
                        broken: equipmentList.filter(item => item.status === 'broken').length
                    }
                    setStats(calculatedStats)
                } else {
                    const errorText = await equipmentResponse.text()
                    console.error('Equipment fetch error:', errorText)
                    setError('Failed to load equipment data')
                }

            } catch (error) {
                console.error('Error fetching data:', error)
                setError('Failed to load data. Please check your connection.')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [filters, token, navigate])

    // All existing handler functions remain the same...
    const handleNavigation = (path) => {
        navigate(path)
    }

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error)
            navigate('/login')
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const handleStatusUpdate = async (equipmentId, newStatus) => {
        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }

            const response = await fetch(`${API_BASE_URL}/equipment/${equipmentId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status: newStatus })
            })

            if (response.ok) {
                setEquipment(prev => prev.map(item =>
                    item.id === equipmentId ? { ...item, status: newStatus } : item
                ))

                const updatedEquipment = equipment.map(item =>
                    item.id === equipmentId ? { ...item, status: newStatus } : item
                )
                const newStats = {
                    total: updatedEquipment.length,
                    available: updatedEquipment.filter(item => item.status === 'available').length,
                    inUse: updatedEquipment.filter(item => item.status === 'in_use').length,
                    maintenance: updatedEquipment.filter(item => item.status === 'maintenance').length,
                    broken: updatedEquipment.filter(item => item.status === 'broken').length
                }
                setStats(newStats)
            } else {
                const result = await response.json()
                setError(result.message || 'Failed to update equipment status')
            }
        } catch (error) {
            console.error('Error updating equipment:', error)
            setError('Failed to update equipment status')
        }
    }

    const handleDelete = async (equipmentId) => {
        if (window.confirm('Are you sure you want to delete this equipment?')) {
            try {
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }

                const response = await fetch(`${API_BASE_URL}/equipment/${equipmentId}`, {
                    method: 'DELETE',
                    headers
                })

                if (response.ok) {
                    setEquipment(prev => prev.filter(item => item.id !== equipmentId))
                    const updatedEquipment = equipment.filter(item => item.id !== equipmentId)
                    const newStats = {
                        total: updatedEquipment.length,
                        available: updatedEquipment.filter(item => item.status === 'available').length,
                        inUse: updatedEquipment.filter(item => item.status === 'in_use').length,
                        maintenance: updatedEquipment.filter(item => item.status === 'maintenance').length,
                        broken: updatedEquipment.filter(item => item.status === 'broken').length
                    }
                    setStats(newStats)
                } else {
                    const result = await response.json()
                    setError(result.message || 'Failed to delete equipment')
                }
            } catch (error) {
                console.error('Error deleting equipment:', error)
                setError('Failed to delete equipment')
            }
        }
    }

    const handleEquipmentAdded = (newEquipment) => {
        setEquipment(prev => [newEquipment, ...prev])
        const updatedEquipment = [newEquipment, ...equipment]
        const newStats = {
            total: updatedEquipment.length,
            available: updatedEquipment.filter(item => item.status === 'available').length,
            inUse: updatedEquipment.filter(item => item.status === 'in_use').length,
            maintenance: updatedEquipment.filter(item => item.status === 'maintenance').length,
            broken: updatedEquipment.filter(item => item.status === 'broken').length
        }
        setStats(newStats)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800 border border-green-200'
            case 'in_use': return 'bg-orange-100 text-orange-800 border border-orange-200'
            case 'maintenance': return 'bg-red-100 text-red-800 border border-red-200'
            case 'broken': return 'bg-gray-100 text-gray-800 border border-gray-200'
            case 'retired': return 'bg-purple-100 text-purple-800 border border-purple-200'
            default: return 'bg-gray-100 text-gray-800 border border-gray-200'
        }
    }

    const getCategoryInfo = (category) => {
        const categoryInfo = categoryOptions.find(cat => cat.value === category)
        return categoryInfo || { label: '📦 Other', color: 'bg-gray-100 text-gray-800' }
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200"></div>
                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                    </div>
                    <p className="text-gray-600 mt-6 font-medium text-lg">Loading equipment inventory...</p>
                    <div className="mt-2 text-sm text-gray-500">Please wait while we fetch your data</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
            {/* Enhanced Sidebar - Same as before */}
            <div className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-xl border-r border-gray-200 transition-all duration-300`}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
                    {!sidebarCollapsed && (
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">L</span>
                            </div>
                            <h1 className="text-xl font-bold text-white">
                                LabMS
                            </h1>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors text-white"
                    >
                        <svg className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                    title={sidebarCollapsed ? item.title : ''}
                                >
                                    <div className="flex items-center justify-center w-5 h-5">
                                        {item.icon}
                                    </div>
                                    {!sidebarCollapsed && (
                                        <span className="ml-3 flex-1 text-left">{item.title}</span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </nav>

                {/* Sidebar Footer */}
                {!sidebarCollapsed && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                    {(user?.name || user?.email)?.charAt(0)?.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.name || user?.email}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {user?.role?.replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
                {/* Enhanced Top Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            {/* Enhanced Search Bar */}
                            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search equipment, labs, or categories..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                    />
                                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                            </form>

                            {/* Header Right Section */}
                            <div className="flex items-center space-x-4">
                                {/* Notifications */}
                                <div className="relative" ref={notificationRef}>
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-lg hover:bg-gray-100"
                                        title="Notifications"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                        </svg>
                                    </button>
                                </div>

                                {/* User Menu */}
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-medium text-sm">
                                                {(user?.name || user?.email)?.charAt(0)?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
                                            <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                                        </div>
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>

                                    {/* User Dropdown */}
                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
                                                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                                            </div>
                                            <button
                                                onClick={() => handleNavigation('/profile')}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                </svg>
                                                <span>Profile Settings</span>
                                            </button>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                                </svg>
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Enhanced Main Content */}
                <main className="p-6">
                    {/* Enhanced Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    Equipment Inventory
                                </h1>
                                <p className="mt-2 text-gray-600">
                                    Manage and track all laboratory equipment and assets with detailed specifications.
                                </p>
                            </div>
                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    <span>Add Equipment</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                                    </svg>
                                    <span className="text-red-700 font-medium">{error}</span>
                                </div>
                                <button
                                    onClick={() => setError('')}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                                    <p className="text-xs text-gray-500 mt-1">All categories</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <span className="text-2xl">📦</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Available</p>
                                    <p className="text-3xl font-bold text-green-600 mt-1">{stats.available}</p>
                                    <p className="text-xs text-gray-500 mt-1">Ready to use</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <span className="text-2xl">✅</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">In Use</p>
                                    <p className="text-3xl font-bold text-orange-600 mt-1">{stats.inUse}</p>
                                    <p className="text-xs text-gray-500 mt-1">Currently occupied</p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-xl">
                                    <span className="text-2xl">🔄</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Maintenance</p>
                                    <p className="text-3xl font-bold text-red-600 mt-1">{stats.maintenance}</p>
                                    <p className="text-xs text-gray-500 mt-1">Under repair</p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-xl">
                                    <span className="text-2xl">🔧</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Out of Order</p>
                                    <p className="text-3xl font-bold text-gray-600 mt-1">{stats.broken}</p>
                                    <p className="text-xs text-gray-500 mt-1">Needs attention</p>
                                </div>
                                <div className="p-3 bg-gray-100 rounded-xl">
                                    <span className="text-2xl">❌</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Search and Filter */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
                            <span className="mr-3 text-2xl">🔍</span>
                            Advanced Search & Filters
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input
                                type="text"
                                placeholder="Search by name, model, serial..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            <select
                                value={filters.lab_id}
                                onChange={(e) => handleFilterChange('lab_id', e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="">🏛️ All Laboratories</option>
                                {labs.map(lab => (
                                    <option key={lab.id} value={lab.id}>{lab.name}</option>
                                ))}
                            </select>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="">📂 All Categories</option>
                                {categoryOptions.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="">📊 All Status</option>
                                <option value="available">✅ Available</option>
                                <option value="in_use">🔄 In Use</option>
                                <option value="maintenance">🔧 Maintenance</option>
                                <option value="broken">❌ Out of Order</option>
                                <option value="retired">🚫 Retired</option>
                            </select>
                        </div>
                    </div>

                    {/* Enhanced Equipment Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {equipment.map((item) => {
                            const categoryInfo = getCategoryInfo(item.category)
                            return (
                                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                                    {/* Equipment Card Header */}
                                    <div className="p-6 pb-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                                                {categoryInfo.label}
                                            </span>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                {item.status?.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-blue-600 transition-colors">
                                            {item.name}
                                        </h3>

                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <span className="w-20 font-medium">🏛️ Lab:</span>
                                                <span className="flex-1">{item.lab?.name || 'Unassigned'}</span>
                                            </div>
                                            {item.model && (
                                                <div className="flex items-center">
                                                    <span className="w-20 font-medium">📋 Model:</span>
                                                    <span className="flex-1 truncate">{item.model}</span>
                                                </div>
                                            )}
                                            {item.serial_number && (
                                                <div className="flex items-center">
                                                    <span className="w-20 font-medium">🔢 S/N:</span>
                                                    <span className="flex-1 font-mono text-xs">{item.serial_number}</span>
                                                </div>
                                            )}
                                            {item.manufacturer && (
                                                <div className="flex items-center">
                                                    <span className="w-20 font-medium">🏭 Brand:</span>
                                                    <span className="flex-1 truncate">{item.manufacturer}</span>
                                                </div>
                                            )}
                                            {item.location_details && (
                                                <div className="flex items-center">
                                                    <span className="w-20 font-medium">📍 Location:</span>
                                                    <span className="flex-1 truncate">{item.location_details}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Equipment Card Actions */}
                                    <div className="px-6 pb-6">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/equipment/${item.id}`)}
                                                className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                </svg>
                                                <span>View</span>
                                            </button>
                                            {user?.role === 'admin' && (
                                                <>
                                                    <button
                                                        onClick={() => navigate(`/equipment/${item.id}/edit`)}
                                                        className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center space-x-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                        </svg>
                                                        <span>Edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="bg-red-50 text-red-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                        </svg>
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {/* Quick Status Actions */}
                                        {item.status === 'available' && (
                                            <div className="mt-3">
                                                <button
                                                    onClick={() => handleStatusUpdate(item.id, 'in_use')}
                                                    className="w-full bg-orange-50 text-orange-700 py-2 px-3 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors"
                                                >
                                                    🔄 Mark as In Use
                                                </button>
                                            </div>
                                        )}
                                        {item.status === 'in_use' && (
                                            <div className="mt-3">
                                                <button
                                                    onClick={() => handleStatusUpdate(item.id, 'available')}
                                                    className="w-full bg-green-50 text-green-700 py-2 px-3 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                                                >
                                                    ✅ Mark as Available
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Enhanced No Results */}
                    {equipment.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                            <div className="text-8xl mb-6">📦</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Equipment Found</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                {labs.length === 0
                                    ? '🏛️ Please create a laboratory first before adding equipment'
                                    : '➕ Start building your equipment inventory by adding your first item'}
                            </p>
                            {user?.role === 'admin' && labs.length > 0 && (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
                                >
                                    ➕ Add Your First Equipment
                                </button>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Enhanced Add Equipment Modal */}
            {user?.role === 'admin' && (
                <AddEquipmentModal
                    isOpen={showAddForm}
                    onClose={() => setShowAddForm(false)}
                    onEquipmentAdded={handleEquipmentAdded}
                    labs={labs}
                />
            )}
        </div>
    )
}