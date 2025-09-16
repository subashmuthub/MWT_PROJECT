import { Link, useParams } from 'react-router-dom'

function EquipmentDetails() {
    const { id } = useParams()

    // Mock data - replace with API call
    const equipment = {
        id: id,
        name: 'Computer-001',
        type: 'Desktop Computer',
        brand: 'Dell',
        model: 'OptiPlex 7090',
        serialNumber: 'DL123456789',
        status: 'Available',
        location: 'Lab-A',
        purchaseDate: '2023-01-15',
        warrantyExpiry: '2026-01-15',
        specifications: {
            processor: 'Intel i7-11700',
            ram: '16GB DDR4',
            storage: '512GB SSD',
            graphics: 'Intel UHD Graphics 750'
        },
        lastMaintenance: '2024-06-15',
        nextMaintenance: '2024-12-15'
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="px-6 py-4">
                    <Link to="/equipment" className="text-blue-500 hover:underline">← Back to Inventory</Link>
                    <h1 className="text-2xl font-bold text-gray-800 mt-2">Equipment Details</h1>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Basic Information</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="font-medium">Equipment ID:</span>
                                <span>{equipment.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Name:</span>
                                <span>{equipment.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Type:</span>
                                <span>{equipment.type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Brand:</span>
                                <span>{equipment.brand}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Model:</span>
                                <span>{equipment.model}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Serial Number:</span>
                                <span>{equipment.serialNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Status:</span>
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                    {equipment.status}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Location:</span>
                                <span>{equipment.location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Specifications */}
                    <div className="bg-white rounded shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Specifications</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="font-medium">Processor:</span>
                                <span>{equipment.specifications.processor}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">RAM:</span>
                                <span>{equipment.specifications.ram}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Storage:</span>
                                <span>{equipment.specifications.storage}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Graphics:</span>
                                <span>{equipment.specifications.graphics}</span>
                            </div>
                        </div>
                    </div>

                    {/* Purchase & Warranty */}
                    <div className="bg-white rounded shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Purchase & Warranty</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="font-medium">Purchase Date:</span>
                                <span>{equipment.purchaseDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Warranty Expiry:</span>
                                <span>{equipment.warrantyExpiry}</span>
                            </div>
                        </div>
                    </div>

                    {/* Maintenance */}
                    <div className="bg-white rounded shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Maintenance</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="font-medium">Last Maintenance:</span>
                                <span>{equipment.lastMaintenance}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Next Maintenance:</span>
                                <span>{equipment.nextMaintenance}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 bg-white rounded shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Actions</h2>
                    <div className="flex flex-wrap gap-4">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Book Equipment
                        </button>
                        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                            Edit Details
                        </button>
                        <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                            Schedule Maintenance
                        </button>
                        <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                            Generate QR Code
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EquipmentDetails