
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { ToastProvider } from './context/ToastContext.js';
import Login from './components/Login.js';
import Dashboard from './components/Dashboard.js';

function AppContent() {
    const { user } = useAuth();
    return user ? React.createElement(Dashboard) : React.createElement(Login);
}

function App() {
    return React.createElement(ToastProvider, null,
        React.createElement(AuthProvider, null,
            React.createElement(CartProvider, null,
                React.createElement(AppContent)
            )
        )
    );
}

export default App;
