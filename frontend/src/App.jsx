// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/common/ProtectedRoute' // Fixed import
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import EquipmentInventory from './pages/EquipmentInventory'
import EquipmentDetails from './pages/EquipmentDetails'
import BookingSystem from './pages/BookingSystem'
import OrderManagement from './pages/OrderManagement'
import UserManagement from './pages/UserManagement'
import ReportsAnalytics from './pages/ReportsAnalytics'
import MaintenanceSchedule from './pages/MaintenanceSchedule'
import Notifications from './pages/Notifications'
import LabManagement from './components/LabManagement' // Make sure this path is correct
import './index.css'

// Component to handle automatic redirects
const AuthRedirect = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is authenticated and tries to access login/register, redirect to dashboard
  if (user && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />

        {/* Auth Routes - redirect to dashboard if already logged in */}
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <LoginPage />
            </AuthRedirect>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute requiredRole="admin">
              <OrderManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRedirect>
              <RegisterPage />
            </AuthRedirect>
          }
        />

        {/* Protected Routes - require authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment"
          element={
            <ProtectedRoute>
              <EquipmentInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment/:id"
          element={
            <ProtectedRoute>
              <EquipmentDetails />
            </ProtectedRoute>
          }
        />

        {/* Lab Management - Protected Route */}
        <Route
          path="/lab-management"
          element={
            <ProtectedRoute>
              <LabManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"  // Changed from "/booking" to "/bookings"
          element={
            <ProtectedRoute>
              <BookingSystem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute>
              <MaintenanceSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Admin Only Routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Lab Management Admin Route - if you want it admin only */}
        <Route
          path="/lab-management-admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <LabManagement />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to dashboard if authenticated, otherwise to login */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;