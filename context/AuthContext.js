
import React from 'react';

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = React.useState(null);

    const login = (username, password) => {
        if (username === 'retailer' && password === 'enamor123') {
            const userData = { id: 'retailer', name: 'Kambeshwar Agencies' };
            setUser(userData);
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
    };

    const value = { user, login, logout };

    return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
    return React.useContext(AuthContext);
};