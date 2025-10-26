import React from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

export interface User {
    id: string;
    name: string;
}

const AppContent: React.FC = () => {
    const { isAuthenticated } = useAuth();
    
    return isAuthenticated ? <Dashboard /> : <Login />;
}

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <ToastProvider>
                    <div className="min-h-screen font-sans text-brand-text">
                        <AppContent />
                    </div>
                </ToastProvider>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
