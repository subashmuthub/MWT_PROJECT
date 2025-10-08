// Simple HomePage without useAuth
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const SimpleHomePage = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Bar */}
            <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-lg z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                LabMS
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/login"
                                className="text-gray-800 hover:text-blue-600 px-4 py-2 font-medium transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all transform hover:scale-105"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-16 min-h-screen bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white px-4 max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6">
                        Laboratory Management System
                    </h1>
                    <p className="text-2xl md:text-3xl mb-4">
                        Streamline Your Laboratory Operations
                    </p>
                    <p className="text-lg md:text-xl mb-8">
                        Comprehensive solution for managing equipment, bookings, and resources
                    </p>
                    <div className="space-x-4">
                        <Link
                            to="/login"
                            className="inline-block bg-white text-gray-800 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all shadow-xl"
                        >
                            Login Now
                        </Link>
                        <Link
                            to="/register"
                            className="inline-block border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-gray-800 transform hover:scale-105 transition-all"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Powerful Features
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Everything you need to manage your laboratory efficiently
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold mb-3">Lab Management</h3>
                            <p className="text-gray-600">Manage multiple labs with ease</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold mb-3">Equipment Inventory</h3>
                            <p className="text-gray-600">Real-time tracking of all equipment</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold mb-3">Booking System</h3>
                            <p className="text-gray-600">Schedule lab sessions easily</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SimpleHomePage;