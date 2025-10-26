
import React from 'react';
import { useAuth } from '../context/AuthContext.js';

function Login() {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!login(username, password)) {
            setError('Invalid username or password');
        }
    };

    return React.createElement('div', { className: 'flex items-center justify-center h-screen bg-gray-100' },
        React.createElement('div', { className: 'w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg' },
            React.createElement('div', { className: 'text-center' },
                React.createElement('h1', { className: 'text-4xl font-bold text-pink-600' }, 'ENAMOR'),
                React.createElement('p', { className: 'mt-2 text-gray-500' }, 'Retailer Ordering Portal')
            ),
            React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-6' },
                React.createElement('div', null,
                    React.createElement('label', { htmlFor: 'username', className: 'text-sm font-medium text-gray-700' }, 'Username'),
                    React.createElement('input', {
                        type: 'text', id: 'username', value: username,
                        onChange: (e) => setUsername(e.target.value),
                        className: 'w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500',
                        required: true
                    })
                ),
                React.createElement('div', null,
                    React.createElement('label', { htmlFor: 'password', className: 'text-sm font-medium text-gray-700' }, 'Password'),
                    React.createElement('input', {
                        type: 'password', id: 'password', value: password,
                        onChange: (e) => setPassword(e.target.value),
                        className: 'w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500',
                        required: true
                    })
                ),
                error && React.createElement('p', { className: 'text-sm text-center text-red-500' }, error),
                React.createElement('button', { type: 'submit', className: 'w-full py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition duration-300' },
                    'Sign In'
                )
            )
        )
    );
}

export default Login;
