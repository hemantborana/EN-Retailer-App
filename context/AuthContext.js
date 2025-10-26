
import React from 'react';
import { checkSession } from '../services/authService.js';

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const validateSession = async () => {
            setLoading(true);
            try {
                const sessionDataString = localStorage.getItem('userSession');
                if (!sessionDataString) {
                    setLoading(false);
                    return;
                }
                const sessionData = JSON.parse(sessionDataString);
                if (sessionData && new Date(sessionData.sessionExpiry) > new Date()) {
                    const response = await checkSession(sessionData.email, sessionData.sessionToken);
                    if (response.success) {
                        setUser(sessionData); // Restore session
                    } else {
                        localStorage.removeItem('userSession'); // Server invalidated session
                    }
                } else {
                     localStorage.removeItem('userSession'); // Expired locally
                }
            } catch (error) {
                console.error("Could not parse session data", error);
                localStorage.removeItem('userSession');
            } finally {
                setLoading(false);
            }
        };
        validateSession();
    }, []);

    const login = (userData) => {
        const sessionPayload = {
            id: userData.email, // Maintain compatibility with retailerId
            name: userData.businessName,
            ...userData
        };
        localStorage.setItem('userSession', JSON.stringify(sessionPayload));
        setUser(sessionPayload);
    };

    const logout = () => {
        localStorage.removeItem('userSession');
        setUser(null);
    };

    const value = { user, login, logout, loading };
    
    if (loading) {
        return React.createElement('div', { className: 'flex items-center justify-center h-screen bg-gray-100' },
            React.createElement('div', { className: 'spinner h-12 w-12 border-4 border-pink-500 border-t-transparent rounded-full' })
        );
    }

    return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
    return React.useContext(AuthContext);
};
