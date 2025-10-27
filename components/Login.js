
import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { generateOTP, verifyOTP } from '../services/authService.js';
import OtpInput from './OtpInput.js';
import LoginHelpModal from './LoginHelpModal.js';

function Login() {
    const [step, setStep] = React.useState('email'); // 'email', 'otp'
    const [email, setEmail] = React.useState('');
    const [error, setError] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [businessName, setBusinessName] = React.useState('');
    const [isHelpOpen, setHelpOpen] = React.useState(false);
    const { login } = useAuth();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        const response = await generateOTP(email);
        
        if (response.success) {
            if (response.data && response.data.isAdmin) {
                const adminResponse = await verifyOTP(email, email);
                 if (adminResponse.success) {
                    login(adminResponse.data);
                } else {
                    setError(adminResponse.message || 'Admin login failed.');
                }
                setIsLoading(false);
                return;
            }
            setBusinessName(response.data.businessName);
            setMessage(response.message);
            setStep('otp');
        } else {
            setError(response.message || 'Failed to send OTP.');
        }
        setIsLoading(false);
    };

    const handleVerifyOTP = async (submittedOtp) => {
        if (isLoading) return;
        setError('');
        setMessage('');
        setIsLoading(true);

        const response = await verifyOTP(email, submittedOtp);
        setIsLoading(false);

        if (response.success) {
            login(response.data);
        } else {
            setError(response.message || 'Invalid OTP.');
        }
    };

    const Spinner = () => React.createElement('svg', { className: "animate-spin h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
        React.createElement('circle', { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
        React.createElement('path', { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
    );

    const emailForm = React.createElement('form', { onSubmit: handleSendOTP, className: 'space-y-6' },
        React.createElement('div', null,
            React.createElement('label', { htmlFor: 'email', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300' }, 'Registered Email / ID'),
            React.createElement('input', {
                type: 'text', id: 'email', value: email,
                onChange: (e) => setEmail(e.target.value),
                className: 'w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400',
                placeholder: 'Enter your email or ID',
                required: true
            })
        ),
        React.createElement('button', {
            type: 'submit',
            disabled: isLoading || !email,
            className: 'w-full flex justify-center items-center space-x-2 py-3 text-white bg-pink-600 rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition duration-300 disabled:bg-pink-400 disabled:cursor-not-allowed'
        },
            isLoading && React.createElement(Spinner),
            React.createElement('span', null, 'Send OTP')
        )
    );

    const otpForm = React.createElement('div', { className: 'space-y-6' },
        React.createElement('div', { className: 'text-center' },
            React.createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-400' }, `Enter the OTP sent to your registered email for:`),
            React.createElement('p', { className: 'font-bold text-gray-800 dark:text-gray-200' }, businessName)
        ),
        React.createElement(OtpInput, { length: 6, onComplete: handleVerifyOTP }),
        isLoading && React.createElement('div', { className: 'flex justify-center items-center' }, React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' }, 'Verifying...')),
        React.createElement('div', { className: 'text-center' },
             React.createElement('button', {
                onClick: () => { setStep('email'); setError(''); setMessage(''); },
                className: 'text-sm text-pink-600 hover:underline'
            }, 'Use a different email/ID')
        )
    );

    return React.createElement(React.Fragment, null,
        React.createElement('div', { className: 'flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4' },
            React.createElement('div', { className: 'w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg' },
                React.createElement('div', { className: 'text-center' },
                    React.createElement('img', { src: 'components/HC_LOGO_-_Copy-removebg-preview.webp', alt: 'Kambeshwar Agencies Logo', className: 'h-20 w-auto mx-auto mb-4' }),
                    React.createElement('h1', { className: 'text-2xl font-bold text-gray-800 dark:text-gray-100' }, 'Kambeshwar Agencies'),
                    React.createElement('p', { className: 'mt-2 text-gray-500 dark:text-gray-400' }, 
                        step === 'email' ? 'Retailer Ordering Portal' : 'OTP Verification'
                    )
                ),
                error && React.createElement('div', { className: 'p-3 text-center text-sm text-red-800 bg-red-100 dark:bg-red-200 dark:text-red-900 rounded-lg', role: 'alert' }, error),
                message && !error && React.createElement('div', { className: 'p-3 text-center text-sm text-green-800 bg-green-100 dark:bg-green-200 dark:text-green-900 rounded-lg', role: 'status' }, message),
                step === 'email' ? emailForm : otpForm,
                 React.createElement('div', { className: 'text-center pt-4' },
                    React.createElement('button', {
                        onClick: () => setHelpOpen(true),
                        className: 'text-sm text-pink-600 hover:underline'
                    }, 'Need Help?')
                )
            )
        ),
        isHelpOpen && React.createElement(LoginHelpModal, { onClose: () => setHelpOpen(false) })
    );
}

export default Login;