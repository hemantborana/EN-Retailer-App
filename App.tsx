
import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { CartProvider } from './context/CartContext';

export interface User {
    id: string;
    name: string;
}

function App() {
    const [user, setUser] = useState<User | null>(null);

    const handleLogin = (loggedInUser: User) => {
        setUser(loggedInUser);
    };

    const handleLogout = () => {
        setUser(null);
    };

    return (
        <CartProvider>
            <div className="min-h-screen font-sans text-brand-text">
                {user ? (
                    <Dashboard user={user} onLogout={handleLogout} />
                ) : (
                    <Login onLogin={handleLogin} />
                )}
            </div>
        </CartProvider>
    );
}

export default App;
