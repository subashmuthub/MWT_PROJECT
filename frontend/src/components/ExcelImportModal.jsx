// ExcelImportModal.jsx - Excel Import with Drag & Drop
import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { apiConfig } from '../config/api'

const ExcelImportModal = ({ isOpen, onClose, onImportComplete, labs, token }) => {
    const [file, setFile] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [previewData, setPreviewData] = useState([])
    const [validationResults, setValidationResults] = useState([])
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [currentStep, setCurrentStep] = useState(1) // 1: Upload, 2: Preview, 3: Processing
    
    const fileInputRef = useRef(null)

    // Equipment categories and their required fields
    const equipmentCategories = {
        computer: ['name', 'serial_number', 'category', 'lab_id'],
        projector: ['name', 'serial_number', 'category', 'lab_id'],
        printer: ['name', 'serial_number', 'category', 'lab_id'],
        microscope: ['name', 'serial_number', 'category', 'lab_id'],
        lab_equipment: ['name', 'serial_number', 'category', 'lab_id'],
        network_equipment: ['name', 'serial_number', 'category', 'lab_id']
    }

    // Generate template data based on available labs
    const generateSampleData = () => {
        // Use actual lab IDs if available, otherwise use placeholder
        const labId = labs && labs.length > 0 ? labs[0].id : 1;
        
        return [
        {
            name: 'Dell OptiPlex 7090',
            description: 'High-performance desktop for CAD work',
            serial_number: 'DELL-2024-001',
            model: 'OptiPlex 7090',
            manufacturer: 'Dell',
            category: 'computer',
            lab_id: labId,
            location_details: 'Room 101 Desk A1',
            status: 'available',
            condition_status: 'excellent',
            purchase_price: 1200,
            current_value: 950,
            purchase_date: '2024-01-15',
            warranty_expiry: '2027-01-15',
            processor: 'Intel i7-11700',
            ram: '16GB DDR4',
            storage: '512GB SSD',
            graphics_card: 'Intel UHD Graphics',
            operating_system: 'Windows 11 Pro'
        },
        {
            name: 'HP EliteBook 840',
            description: 'Portable laptop for field research',
            serial_number: 'HP-2024-002',
            model: 'EliteBook 840 G8',
            manufacturer: 'HP',
            category: 'computer',
            lab_id: labId,
            location_details: 'Mobile Cart Station B',
            status: 'available',
            condition_status: 'good',
            purchase_price: 1500,
            current_value: 1200,
            purchase_date: '2024-02-01',
            warranty_expiry: '2027-02-01',
            processor: 'Intel i5-1135G7',
            ram: '8GB DDR4',
            storage: '256GB SSD',
            graphics_card: 'Intel Iris Xe',
            operating_system: 'Windows 11 Pro'
        },
        {
            name: 'Epson PowerLite L3150',
            description: 'Ultra short throw classroom projector',
            serial_number: 'EPSON-PRJ-001',
            model: 'PowerLite L3150',
            manufacturer: 'Epson',
            category: 'projector',
            lab_id: labId,
            location_details: 'Lecture Hall Ceiling Mount',
            status: 'available',
            condition_status: 'excellent',
            purchase_price: 2800,
            current_value: 2400,
            purchase_date: '2024-01-20',
            warranty_expiry: '2027-01-20',
            resolution: '1920x1080',
            brightness: '3800 lumens',
            contrast_ratio: '15000:1',
            lamp_hours: '245'
        },
        {
            name: 'Canon ImageClass MF445dw',
            description: 'Multifunction laser printer with duplex',
            serial_number: 'CANON-PRT-001',
            model: 'ImageClass MF445dw',
            manufacturer: 'Canon',
            category: 'printer',
            lab_id: labId,
            location_details: 'Main Office Print Station',
            status: 'available',
            condition_status: 'good',
            purchase_price: 350,
            current_value: 280,
            purchase_date: '2024-03-01',
            warranty_expiry: '2025-03-01',
            print_type: 'Laser',
            print_speed: '40 ppm',
            paper_size: 'Letter/Legal',
            connectivity: 'WiFi+Ethernet'
        },
        {
            name: 'Nikon Eclipse E200',
            description: 'Biological microscope for cell studies',
            serial_number: 'NIKON-MIC-001',
            model: 'Eclipse E200',
            manufacturer: 'Nikon',
            category: 'microscope',
            lab_id: labId,
            location_details: 'Biology Lab Bench Station 1',
            status: 'available',
            condition_status: 'excellent',
            purchase_price: 2500,
            current_value: 2200,
            purchase_date: '2024-01-10',
            warranty_expiry: '2026-01-10',
            magnification: '40x-1000x',
            objective_lenses: 'Plan Achromat 4x 10x 40x',
            illumination: 'LED'
        },
        {
            name: 'Autoclave SX-500',
            description: 'Steam sterilization equipment',
            serial_number: 'AUTOCLAVE-001',
            model: 'SX-500',
            manufacturer: 'Tuttnauer',
            category: 'lab_equipment',
            lab_id: labId,
            location_details: 'Sterilization Room',
            status: 'available',
            condition_status: 'excellent',
            purchase_price: 8500,
            current_value: 7500,
            purchase_date: '2024-02-01',
            warranty_expiry: '2029-02-01',
            capacity: '50L',
            power_rating: '2200W',
            temperature_range: '121-134°C',
            accuracy: '±1°C'
        },
        {
            name: 'Cisco Catalyst 2960',
            description: '24-port Ethernet switch',
            serial_number: 'CISCO-SW-001',
            model: 'Catalyst 2960-24TT-L',
            manufacturer: 'Cisco',
            category: 'network_equipment',
            lab_id: labId,
            location_details: 'Server Room Rack A',
            status: 'available',
            condition_status: 'excellent',
            purchase_price: 800,
            current_value: 600,
            purchase_date: '2023-10-15',
            warranty_expiry: '2026-10-15',
            ports: '24 Ethernet',
            speed: '100 Mbps',
            protocol: 'Ethernet'
        },
        {
            name: 'Legacy Desktop PC',
            description: 'Old desktop computer for basic tasks',
            serial_number: 'LEGACY-001',
            model: 'OptiPlex 3020',
            manufacturer: 'Dell',
            category: 'computer',
            lab_id: labId,
            location_details: 'Storage Room C',
            status: 'maintenance',
            condition_status: 'fair',
            purchase_price: 600,
            current_value: 150,
            purchase_date: '2020-03-10',
            warranty_expiry: '2023-03-10',
            processor: 'Intel i3-4150',
            ram: '4GB DDR3',
            storage: '500GB HDD',
            graphics_card: 'Intel HD Graphics',
            operating_system: 'Windows 10'
        }
    ]
    }

    const handleDragEnter = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        
        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            handleFileSelection(files[0])
        }
    }

    const handleFileSelection = (selectedFile) => {
        if (!selectedFile) return

        // Validate file type
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv' // .csv
        ]

        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Please select a valid Excel file (.xlsx, .xls) or CSV file')
            return
        }

        setFile(selectedFile)
        setError('')
        processFile(selectedFile)
    }

    const processFile = async (selectedFile) => {
        try {
            setCurrentStep(2)
            setUploadProgress(20)

            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    setUploadProgress(50)
                    const data = new Uint8Array(e.target.result)
                    const workbook = XLSX.read(data, { type: 'array' })
                    
                    // Get first sheet
                    const sheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[sheetName]
                    
                    // Convert to JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet)
                    
                    setUploadProgress(80)
                    
                    if (jsonData.length === 0) {
                        setError('The Excel file appears to be empty')
                        return
                    }

                    // Validate data
                    const validation = validateData(jsonData)
                    setPreviewData(jsonData.slice(0, 10)) // Show first 10 rows for preview
                    setValidationResults(validation)
                    setUploadProgress(100)

                } catch (error) {
                    console.error('Error processing file:', error)
                    setError('Error reading file. Please ensure it\'s a valid Excel file.')
                }
            }

            reader.readAsArrayBuffer(selectedFile)
        } catch (error) {
            console.error('File processing error:', error)
            setError('Failed to process file')
        }
    }

    const validateData = (data) => {
        const results = []
        
        data.forEach((row, index) => {
            const errors = []
            const warnings = []

            // Check required fields
            if (!row.name || row.name.trim() === '') {
                errors.push('Name is required')
            }
            if (!row.serial_number || row.serial_number.trim() === '') {
                errors.push('Serial number is required')
            }
            if (!row.category || row.category.trim() === '') {
                errors.push('Category is required')
            } else if (!equipmentCategories[row.category]) {
                errors.push(`Invalid category: ${row.category}`)
            }
            if (!row.lab_id) {
                errors.push('Lab ID is required')
            } else {
                const labExists = labs.find(lab => lab.id === parseInt(row.lab_id))
                if (!labExists) {
                    errors.push(`Lab with ID ${row.lab_id} not found`)
                }
            }

            // Check optional but important fields
            if (!row.manufacturer) warnings.push('Manufacturer not specified')
            if (!row.model) warnings.push('Model not specified')

            // Validate status values
            const validStatuses = ['available', 'in_use', 'maintenance', 'retired']
            if (row.status && !validStatuses.includes(row.status)) {
                errors.push(`Invalid status: ${row.status}. Must be one of: ${validStatuses.join(', ')}`)
            }

            // Validate condition status
            const validConditions = ['excellent', 'good', 'fair', 'poor', 'damaged']
            if (row.condition_status && !validConditions.includes(row.condition_status)) {
                errors.push(`Invalid condition: ${row.condition_status}. Must be one of: ${validConditions.join(', ')}`)
            }

            // Validate dates
            if (row.purchase_date && isNaN(new Date(row.purchase_date))) {
                errors.push('Invalid purchase date format')
            }
            if (row.warranty_expiry && isNaN(new Date(row.warranty_expiry))) {
                errors.push('Invalid warranty expiry date format')
            }

            results.push({
                row: index + 1,
                data: row,
                errors,
                warnings,
                isValid: errors.length === 0
            })
        })

        return results
    }

    const handleImport = async () => {
        try {
            setIsUploading(true)
            setCurrentStep(3)
            setUploadProgress(0)
            setError('')

            const validRows = validationResults.filter(result => result.isValid)
            
            if (validRows.length === 0) {
                setError('No valid rows to import. Please fix the errors and try again.')
                setIsUploading(false)
                return
            }

            // Prepare equipment data for bulk import
            const equipmentData = validRows.map(validationResult => ({
                ...validationResult.data,
                lab_id: parseInt(validationResult.data.lab_id),
                purchase_price: validationResult.data.purchase_price ? parseFloat(validationResult.data.purchase_price) : null,
                current_value: validationResult.data.current_value ? parseFloat(validationResult.data.current_value) : null,
                status: validationResult.data.status || 'available',
                condition_status: validationResult.data.condition_status || 'good'
            }))

            setUploadProgress(25)

            // Call bulk import endpoint
            const response = await fetch(`${apiConfig.baseURL}/api/equipment/bulk-import`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ equipmentData })
            })

            setUploadProgress(75)

            const result = await response.json()

            setUploadProgress(100)

            if (response.ok && result.success) {
                setSuccess(`Successfully imported ${result.data.success} equipment items!`)
                if (result.data.failed > 0) {
                    setError(`${result.data.failed} items failed to import:\n${result.data.errors.join('\n')}`)
                }
                onImportComplete()
            } else {
                setError(result.message || 'Import failed. Please try again.')
            }

        } catch (error) {
            console.error('Import error:', error)
            setError('Import failed. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    const downloadTemplate = () => {
        const sampleData = generateSampleData()
        const ws = XLSX.utils.json_to_sheet(sampleData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Equipment Template')
        XLSX.writeFile(wb, 'equipment_template.xlsx')
    }

    const resetModal = () => {
        setFile(null)
        setPreviewData([])
        setValidationResults([])
        setError('')
        setSuccess('')
        setUploadProgress(0)
        setCurrentStep(1)
        setIsUploading(false)
    }

    const handleClose = () => {
        resetModal()
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">📊 Import Equipment from Excel</h2>
                        <p className="text-blue-100 text-sm">Upload Excel file to bulk import equipment data</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white hover:text-gray-200 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                        <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                                1
                            </div>
                            <span className="ml-2 font-medium">Upload File</span>
                        </div>
                        <div className="flex-1 h-1 mx-4 bg-gray-300">
                            <div className={`h-full transition-all duration-300 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} style={{width: currentStep >= 2 ? '100%' : '0%'}}></div>
                        </div>
                        <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                                2
                            </div>
                            <span className="ml-2 font-medium">Preview & Validate</span>
                        </div>
                        <div className="flex-1 h-1 mx-4 bg-gray-300">
                            <div className={`h-full transition-all duration-300 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} style={{width: currentStep >= 3 ? '100%' : '0%'}}></div>
                        </div>
                        <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                                3
                            </div>
                            <span className="ml-2 font-medium">Import</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {/* Step 1: Upload */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            {/* Download Template */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-blue-900">📥 Download Template</h3>
                                        <p className="text-blue-700 text-sm">Get the Excel template with sample data and required columns</p>
                                    </div>
                                    <button
                                        onClick={downloadTemplate}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Download Template
                                    </button>
                                </div>
                            </div>

                            {/* Drag & Drop Area */}
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                    isDragging 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                                }`}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <div className="space-y-4">
                                    <div className="text-6xl">📁</div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {isDragging ? 'Drop your file here' : 'Drag & drop your Excel file here'}
                                        </h3>
                                        <p className="text-gray-600">or click to browse</p>
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Choose File
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={(e) => handleFileSelection(e.target.files[0])}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* File Requirements */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">📋 File Requirements</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Supported formats: .xlsx, .xls, .csv</li>
                                    <li>• Required columns: name, serial_number, category, lab_id</li>
                                    <li>• Optional columns: description, model, manufacturer, status, etc.</li>
                                    <li>• Maximum file size: 10MB</li>
                                    <li>• Maximum rows: 1000</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Preview & Validation */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold">📋 Data Preview & Validation</h3>
                                <div className="text-sm text-gray-600">
                                    File: {file?.name} ({previewData.length} rows shown)
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {uploadProgress < 100 && (
                                <div className="bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            )}

                            {/* Validation Summary */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-green-600">
                                        {validationResults.filter(r => r.isValid).length}
                                    </div>
                                    <div className="text-green-700 text-sm">Valid Rows</div>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-red-600">
                                        {validationResults.filter(r => !r.isValid).length}
                                    </div>
                                    <div className="text-red-700 text-sm">Invalid Rows</div>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {validationResults.reduce((acc, r) => acc + r.warnings.length, 0)}
                                    </div>
                                    <div className="text-yellow-700 text-sm">Warnings</div>
                                </div>
                            </div>

                            {/* Preview Table */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="overflow-x-auto max-h-96">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Row</th>
                                                <th className="px-3 py-2 text-left">Status</th>
                                                <th className="px-3 py-2 text-left">Name</th>
                                                <th className="px-3 py-2 text-left">Serial Number</th>
                                                <th className="px-3 py-2 text-left">Category</th>
                                                <th className="px-3 py-2 text-left">Lab ID</th>
                                                <th className="px-3 py-2 text-left">Issues</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {validationResults.slice(0, 10).map((result, index) => (
                                                <tr key={index} className={`border-t ${result.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                                                    <td className="px-3 py-2">{result.row}</td>
                                                    <td className="px-3 py-2">
                                                        {result.isValid ? (
                                                            <span className="text-green-600">✅ Valid</span>
                                                        ) : (
                                                            <span className="text-red-600">❌ Invalid</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">{result.data.name || '—'}</td>
                                                    <td className="px-3 py-2">{result.data.serial_number || '—'}</td>
                                                    <td className="px-3 py-2">{result.data.category || '—'}</td>
                                                    <td className="px-3 py-2">{result.data.lab_id || '—'}</td>
                                                    <td className="px-3 py-2">
                                                        {result.errors.length > 0 && (
                                                            <div className="text-red-600 text-xs">
                                                                {result.errors.join(', ')}
                                                            </div>
                                                        )}
                                                        {result.warnings.length > 0 && (
                                                            <div className="text-yellow-600 text-xs">
                                                                {result.warnings.join(', ')}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Import Progress */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-lg font-bold mb-4">🚀 Importing Equipment Data</h3>
                                
                                {/* Animated Progress Circle */}
                                <div className="relative w-32 h-32 mx-auto mb-6">
                                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="50"
                                            stroke="#e5e7eb"
                                            strokeWidth="8"
                                            fill="none"
                                        />
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="50"
                                            stroke="#3b82f6"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={314}
                                            strokeDashoffset={314 - (314 * uploadProgress) / 100}
                                            className="transition-all duration-300"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-blue-600">{uploadProgress}%</span>
                                    </div>
                                </div>

                                <p className="text-gray-600">
                                    {isUploading ? 'Processing equipment data...' : 'Import completed!'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error Messages */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <span className="text-red-600 mr-2">❌</span>
                                <div className="text-red-700 whitespace-pre-line">{error}</div>
                            </div>
                        </div>
                    )}

                    {/* Success Messages */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <span className="text-green-600 mr-2">✅</span>
                                <div className="text-green-700">{success}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        disabled={isUploading}
                    >
                        Cancel
                    </button>
                    <div className="space-x-3">
                        {currentStep === 2 && (
                            <button
                                onClick={() => {
                                    resetModal()
                                    setCurrentStep(1)
                                }}
                                className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                                disabled={isUploading}
                            >
                                Upload Different File
                            </button>
                        )}
                        {currentStep === 2 && validationResults.filter(r => r.isValid).length > 0 && (
                            <button
                                onClick={handleImport}
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                                disabled={isUploading}
                            >
                                Import {validationResults.filter(r => r.isValid).length} Valid Items
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExcelImportModal