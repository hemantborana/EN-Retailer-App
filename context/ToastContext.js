
import React from 'react';

const ToastContext = React.createContext();

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = React.useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const Toast = () => {
        if (!toast) return null;

        const successClasses = 'bg-green-500 dark:bg-green-600';
        const errorClasses = 'bg-red-500 dark:bg-red-600';
        
        return React.createElement('div', {
            className: `fixed bottom-5 right-5 ${toast.type === 'success' ? successClasses : errorClasses} text-white py-2 px-4 rounded-lg shadow-lg text-sm z-50 toast-enter`
        }, toast.message);
    };

    return React.createElement(ToastContext.Provider, { value: { showToast } },
        children,
        React.createElement(Toast)
    );
};

export const useToast = () => {
    return React.useContext(ToastContext);
};