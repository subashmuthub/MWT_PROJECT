// ========================================
// STUDENT DASHBOARD - src/pages/StudentDashboard.jsx
// ========================================
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

function StudentDashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-blue-600 shadow">
                <div className="px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-white">Student Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-white">Welcome, {user?.name}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* My Courses */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">My Courses</h3>
                        <p className="text-gray-600">View your enrolled courses</p>
                        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            View Courses
                        </button>
                    </div>

                    {/* Assignments */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Assignments</h3>
                        <p className="text-gray-600">Check pending assignments</p>
                        <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                            View Assignments
                        </button>
                    </div>

                    {/* Grades */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">My Grades</h3>
                        <p className="text-gray-600">View your academic progress</p>
                        <button className="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                            View Grades
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ========================================
// TEACHER DASHBOARD - src/pages/TeacherDashboard.jsx
// ========================================
function TeacherDashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-green-600 shadow">
                <div className="px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-white">Teacher Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-white">Welcome, Prof. {user?.name}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* My Classes */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">My Classes</h3>
                        <p className="text-gray-600">Manage your teaching classes</p>
                        <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                            View Classes
                        </button>
                    </div>

                    {/* Create Assignment */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Assignments</h3>
                        <p className="text-gray-600">Create and manage assignments</p>
                        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Manage Assignments
                        </button>
                    </div>

                    {/* Grade Students */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Grading</h3>
                        <p className="text-gray-600">Grade student submissions</p>
                        <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                            Grade Students
                        </button>
                    </div>

                    {/* Student Reports */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Student Reports</h3>
                        <p className="text-gray-600">View student progress reports</p>
                        <button className="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                            View Reports
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ========================================
// ADMIN DASHBOARD - src/pages/AdminDashboard.jsx
// ========================================
function AdminDashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-red-600 shadow">
                <div className="px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-white">Welcome, Admin {user?.name}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* User Management */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">User Management</h3>
                        <p className="text-gray-600">Manage students and teachers</p>
                        <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                            Manage Users
                        </button>
                    </div>

                    {/* Course Management */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Course Management</h3>
                        <p className="text-gray-600">Create and manage courses</p>
                        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Manage Courses
                        </button>
                    </div>

                    {/* System Settings */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">System Settings</h3>
                        <p className="text-gray-600">Configure system settings</p>
                        <button className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                            System Settings
                        </button>
                    </div>

                    {/* Reports */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Reports</h3>
                        <p className="text-gray-600">View system-wide reports</p>
                        <button className="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                            View Reports
                        </button>
                    </div>

                    {/* Analytics */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Analytics</h3>
                        <p className="text-gray-600">System usage analytics</p>
                        <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                            View Analytics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Export all dashboards
export { StudentDashboard, TeacherDashboard, AdminDashboard }