import React, { createContext, useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (storedToken && storedUser) {
                    // Verify token is still valid
                    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
                        headers: {
                            'Authorization': `Bearer ${storedToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            setToken(storedToken);
                            setUser(JSON.parse(storedUser));
                        } else {
                            // Token invalid, clear storage
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                        }
                    } else {
                        // Token invalid, clear storage
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            console.log('Attempting login for:', email);

            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (response.ok && data.success && data.data && data.data.token) {
                // Store token and user data
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));

                // Update state
                setToken(data.data.token);
                setUser(data.data.user);

                console.log('Login successful, user:', data.data.user);
                return { success: true, user: data.data.user };
            } else {
                console.error('Login failed:', data.message);
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please check your connection.' };
        }
    };

    // Send OTP to Gmail for verification
    const sendOTP = async (email) => {
        try {
            console.log('Sending OTP to:', email);

            const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            console.log('Send OTP response:', data);

            if (response.ok && data.success) {
                return { success: true, message: data.message, expiresIn: data.expiresIn };
            } else {
                return { success: false, message: data.message || 'Failed to send OTP' };
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            return { success: false, message: 'Network error. Please check your connection.' };
        }
    };

    // Verify OTP
    const verifyOTP = async (email, otp) => {
        try {
            console.log('Verifying OTP for:', email);

            const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, otp })
            });

            const data = await response.json();
            console.log('Verify OTP response:', data);

            return {
                success: data.success,
                message: data.message || (data.success ? 'OTP verified successfully' : 'OTP verification failed')
            };
        } catch (error) {
            console.error('Verify OTP error:', error);
            return { success: false, message: 'Network error. Please check your connection.' };
        }
    };

    // Register with OTP verification
    const registerWithOTP = async (name, email, password, role = 'student', otp) => {
        try {
            console.log('🔥 DEBUG: registerWithOTP called with:', { name, email, role, otp: otp ? 'PROVIDED' : 'MISSING' });
            console.log('Attempting registration with OTP for:', email);

            const response = await fetch(`${API_BASE_URL}/api/auth/register-with-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, role, otp })
            });

            const data = await response.json();
            console.log('Registration with OTP response:', data);

            if (response.ok && data.success && data.data && data.data.token) {
                // Store token and user data
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));

                // Update state
                setToken(data.data.token);
                setUser(data.data.user);

                console.log('Registration successful, user:', data.data.user);
                return { success: true, user: data.data.user };
            } else {
                console.error('Registration failed:', data.message);
                return { success: false, message: data.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Network error. Please check your connection.' };
        }
    };

    const register = async (name, email, password, role = 'student') => {
        try {
            console.log('Attempting registration for:', email);

            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, role })
            });

            const data = await response.json();
            console.log('Registration response:', data);

            if (response.ok && data.success && data.data && data.data.token) {
                // Store token and user data
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));

                // Update state
                setToken(data.data.token);
                setUser(data.data.user);

                console.log('Registration successful, user:', data.data.user);
                return { success: true, user: data.data.user };
            } else {
                console.error('Registration failed:', data.message);
                return { success: false, message: data.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Network error. Please check your connection.' };
        }
    };

    const logout = () => {
        console.log('Logging out user');

        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Clear state
        setToken(null);
        setUser(null);

        // Optional: Call backend logout endpoint
        fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            }
        }).catch(error => {
            console.error('Logout error:', error);
        });
    };

    // Helper function to make authenticated requests
    const makeAuthenticatedRequest = async (url, options = {}) => {
        const authToken = token || localStorage.getItem('token');

        if (!authToken) {
            throw new Error('No authentication token available');
        }

        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        return fetch(url, { ...options, ...defaultOptions });
    };

    // Function to update user data in context and localStorage
    const updateUser = (updatedUserData) => {
        const newUser = { ...user, ...updatedUserData };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const value = {
        user,
        token,
        login,
        register,
        registerWithOTP,
        sendOTP,
        verifyOTP,
        logout,
        loading,
        isAuthenticated: !!token && !!user,
        makeAuthenticatedRequest,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};