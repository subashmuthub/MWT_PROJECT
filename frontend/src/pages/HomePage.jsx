// src/pages/HomePage.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useAuth } from '../hooks/useAuth';

const HomePage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Set document title
        document.title = 'Home | NEC LabMS'
    }, [])
    
    // Safely get user, with fallback if auth context isn't ready
    let user = null;
    try {
        const authData = useAuth();
        user = authData?.user;
    } catch (error) {
        console.log('Auth context not ready yet:', error.message);
        // This is expected on initial load
    }

    // Hero Slides Data - NEC Campus Images
    const heroSlides = [
        {
            title: "NATIONAL ENGINEERING COLLEGE",
            subtitle: "DST-FIST Sponsored Institution",
            description: "K.R.Nagar, Kovilpatti - An Autonomous Institution Affiliated to Anna University, Chennai",
            image: "/Images/nec-main-building.jpg",
            fallback: "/Images/Home.jpg",
            gradient: "from-blue-900/70 to-purple-900/70"
        },
        {
            title: "EXCELLENCE IN PLACEMENTS",
            subtitle: "Few of Our Prestigious Recruiters - (2025 Batch)",
            description: "125+ Companies • 450+ Offers • 76 Students Got 8-10 LPA • 90% Consistent Placement",
            image: "/Images/nec-achievements.png",
            fallback: "/Images/Home.jpg",
            gradient: "from-purple-900/80 to-blue-900/80"
        },
        {
            title: "BEAUTIFUL CAMPUS",
            subtitle: "State-of-the-art Infrastructure",
            description: "Modern facilities with lush green environment and advanced laboratory management system",
            image: "/Images/NEC-Front-Mobile-Slider-scaled.webp",
            fallback: "/Images/Home.jpg",
            gradient: "from-green-900/70 to-blue-900/70"
        }
    ];

    // Features Data
    const features = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            title: "Lab Management",
            description: "Manage multiple labs with ease. Track usage, availability, and maintenance schedules.",
            color: "blue"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            title: "Equipment Inventory",
            description: "Real-time tracking of all laboratory equipment, components, and supplies.",
            color: "green"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            title: "Booking System",
            description: "Schedule lab sessions, equipment usage, and manage conflicts automatically.",
            color: "purple"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            title: "Analytics & Reports",
            description: "Comprehensive reports on lab usage, equipment utilization, and maintenance.",
            color: "yellow"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            title: "User Management",
            description: "Role-based access control for administrators, faculty, and students.",
            color: "indigo"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            title: "Maintenance Tracking",
            description: "Schedule and track equipment maintenance to ensure optimal performance.",
            color: "red"
        }
    ];

    // Statistics
    const stats = [
        { number: "50+", label: "Labs Managed", icon: "🏢" },
        { number: "500+", label: "Equipment Items", icon: "🔬" },
        { number: "1000+", label: "Active Users", icon: "👥" },
        { number: "99.9%", label: "Uptime", icon: "⚡" }
    ];

    useEffect(() => {
        // Auto-rotate slides
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [heroSlides.length]);

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Bar */}
            <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-lg z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden">
                                    <img 
                                        src="/nec-logo.png" 
                                        alt="NEC Logo" 
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    NEC LabMS
                                </div>
                            </div>
                            <div className="hidden md:block ml-10">
                                <div className="flex items-baseline space-x-4">
                                    <a href="#home" className="text-gray-800 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Home</a>
                                    <a href="#about" className="text-gray-800 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">About</a>
                                    <a href="#features" className="text-gray-800 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Features</a>
                                    <a href="#stats" className="text-gray-800 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Statistics</a>
                                    <a href="#contact" className="text-gray-800 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Contact</a>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center space-x-4">
                            {user ? (
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all transform hover:scale-105"
                                >
                                    Dashboard
                                </button>
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-gray-800 hover:text-blue-600 p-2"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <a href="#home" className="block px-3 py-2 text-gray-800 hover:text-blue-600">Home</a>
                            <a href="#about" className="block px-3 py-2 text-gray-800 hover:text-blue-600">About</a>
                            <a href="#features" className="block px-3 py-2 text-gray-800 hover:text-blue-600">Features</a>
                            <a href="#stats" className="block px-3 py-2 text-gray-800 hover:text-blue-600">Statistics</a>
                            <a href="#contact" className="block px-3 py-2 text-gray-800 hover:text-blue-600">Contact</a>
                            {user ? (
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full text-left px-3 py-2 text-blue-600 font-medium"
                                >
                                    Dashboard
                                </button>
                            ) : (
                                <>
                                    <Link to="/login" className="block px-3 py-2 text-gray-800">Login</Link>
                                    <Link to="/register" className="block px-3 py-2 text-blue-600 font-medium">Register</Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section with Carousel */}
            <section id="home" className="relative h-screen overflow-hidden">
                {heroSlides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-90`}></div>
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                console.log('Image failed to load:', slide.image);
                                e.target.src = slide.fallback;
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-white px-4 max-w-4xl">
                                <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
                                    {slide.title}
                                </h1>
                                <p className="text-2xl md:text-3xl mb-4 animate-fade-in-up animation-delay-200">
                                    {slide.subtitle}
                                </p>
                                <p className="text-lg md:text-xl mb-8 animate-fade-in-up animation-delay-400">
                                    {slide.description}
                                </p>
                                <div className="space-x-4 animate-fade-in-up animation-delay-600">
                                    {user ? (
                                        <button
                                            onClick={() => navigate('/dashboard')}
                                            className="bg-white text-gray-800 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all shadow-xl"
                                        >
                                            Go to Dashboard
                                        </button>
                                    ) : (
                                        <>
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
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Slide Indicators */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                                }`}
                        />
                    ))}
                </div>

                {/* Scroll Down Arrow */}
                <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            About Lab Management System
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-8"></div>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Our comprehensive Lab Management System is designed to streamline laboratory operations
                            in educational institutions, making it easier for administrators, faculty, and students
                            to manage and utilize lab resources effectively.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
                            <p className="text-gray-600">Intuitive interface designed for users of all technical levels</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
                            <p className="text-gray-600">Enterprise-grade security with 99.9% uptime guarantee</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
                            <p className="text-gray-600">Instant notifications and live status updates</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Powerful Features
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-8"></div>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Everything you need to manage your laboratory efficiently in one platform
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
                            >
                                <div className={`bg-${feature.color}-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                                    <div className={`text-${feature.color}-600`}>
                                        {feature.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section id="stats" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Our Impact in Numbers
                        </h2>
                        <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-5xl mb-2">{stat.icon}</div>
                                <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                                <div className="text-white/80">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Ready to Transform Your Lab Management?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join hundreds of institutions already using our platform
                    </p>
                    <div className="space-x-4">
                        <Link
                            to="/register"
                            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transform hover:scale-105 transition-all"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            to="/login"
                            className="inline-block border-2 border-gray-800 text-gray-800 px-8 py-4 rounded-full font-semibold hover:bg-gray-800 hover:text-white transition-all"
                        >
                            Login to Dashboard
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer - NEC Style */}
            <footer id="contact" className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Technical Support */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-white">For Technical Support</h4>
                            <div className="text-gray-300 space-y-2">
                                <p className="font-medium">Dr. D. Venkatkumar M.E.,Ph.D</p>
                                <p>Professor / Mechanical Engineering</p>
                                <p className="flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Email: dvkmech@nec.edu.in
                                </p>
                                <p className="flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Ph: 9443660339
                                </p>
                            </div>
                        </div>

                        {/* Info Links */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-blue-400">Info</h4>
                            <ul className="space-y-2 text-gray-300">
                                <li>
                                    <a href="https://nec.edu.in" className="hover:text-blue-400 transition-colors flex items-center" target="_blank" rel="noopener noreferrer">
                                        <span className="text-blue-400 mr-1">→</span>
                                        NEC WEBSITE
                                    </a>
                                </li>
                                <li><a href="#about" className="hover:text-blue-400 transition-colors">About Lab Management</a></li>
                                <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">User Guide</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Support</a></li>
                            </ul>
                        </div>

                        {/* Contact Us */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-green-400">Contact Us</h4>
                            <div className="text-gray-300 space-y-2">
                                <p className="font-medium">National Engineering College, K.R. Nagar,</p>
                                <p>Kovilpatti - 628503. Thoothukudi District,</p>
                                <p>Tamilnadu</p>
                                <p className="flex items-center mt-3">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Phone : 04632 – 222 502 93859 76674,
                                </p>
                                <p className="ml-6">93859 76684</p>
                                <p className="flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Email : principal@nec.edu.in
                                </p>
                            </div>
                        </div>

                        {/* Follow Us */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-purple-400">Follow Us</h4>
                            <div className="flex space-x-3 mb-4">
                                {/* Twitter */}
                                <a href="#" className="bg-blue-500 hover:bg-blue-600 p-2 rounded transition-colors">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                                    </svg>
                                </a>
                                
                                {/* Google+ */}
                                <a href="#" className="bg-red-500 hover:bg-red-600 p-2 rounded transition-colors">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.017 14.089v-2.299h9.348c.118.718.175 1.548.175 2.479 0 2.209-.553 4.925-2.326 6.698-1.652 1.652-3.76 2.48-7.197 2.48C5.849 23.447 0 18.693 0 12.525 0 6.357 5.849 1.603 12.017 1.603c3.269 0 5.625 1.117 7.396 2.561l-2.244 2.244c-.631-.63-1.724-1.368-3.152-1.368-2.720 0-4.925 2.256-4.925 5.040 0 2.784 2.205 5.040 4.925 5.040 1.749 0 2.73-.632 3.366-1.367.51-.590.837-1.347.969-2.199h-4.335z"/>
                                    </svg>
                                </a>
                                
                                {/* Facebook */}
                                <a href="#" className="bg-blue-600 hover:bg-blue-700 p-2 rounded transition-colors">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </a>
                            </div>
                            <div className="space-y-2 text-sm text-gray-400">
                                <p>Stay connected with us for updates</p>
                                <p>and latest announcements</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bottom Copyright */}
                    <div className="border-t border-gray-700 mt-8 pt-6 text-center">
                        <p className="text-blue-400 font-medium">Powered by NEC LMS</p>
                        <p className="text-gray-400 text-sm mt-1">&copy; 2024 National Engineering College Lab Management System. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;