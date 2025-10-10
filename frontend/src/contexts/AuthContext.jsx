import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Validate token on mount
    useEffect(() => {
        const validateToken = async () => {
            const storedToken = localStorage.getItem('token');

            if (!storedToken) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
                    headers: {
                        'Authorization': `Bearer ${storedToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.valid) {
                        setUser(data.user);
                        setToken(storedToken);
                    } else {
                        // Token invalid, clear it
                        localStorage.removeItem('token');
                        setToken(null);
                        setUser(null);
                    }
                } else {
                    // Token invalid, clear it
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            } catch (err) {
                console.error('Error validating token:', err);
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        validateToken();
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            setError(null);
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed');
            }

            const data = await response.json();

            // Store token
            localStorage.setItem('token', data.token);
            setToken(data.token);

            // Set user data
            setUser({
                id: data.userId,
                name: data.name,
                email: data.email
            });

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Register function
    const register = async (name, email, password) => {
        try {
            setError(null);
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Registration failed');
            }

            const data = await response.json();

            // Store token
            localStorage.setItem('token', data.token);
            setToken(data.token);

            // Set user data
            setUser({
                id: data.userId,
                name: data.name,
                email: data.email
            });

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setError(null);
    };

    // Get auth header for API calls
    const getAuthHeader = () => {
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const value = {
        user,
        token,
        loading,
        error,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        getAuthHeader
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};