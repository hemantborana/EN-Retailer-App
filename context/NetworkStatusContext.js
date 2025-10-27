
import React from 'react';

const NetworkStatusContext = React.createContext();

export const NetworkStatusProvider = ({ children }) => {
    const [isOnline, setIsOnline] = React.useState(navigator.onLine);

    React.useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const OfflineIndicator = () => {
        if (isOnline) return null;

        return React.createElement('div', {
            className: 'fixed bottom-0 left-0 right-0 bg-gray-800 text-white text-center p-3 text-sm z-50 flex items-center justify-center space-x-2'
        }, 
            React.createElement('span', null, '☁️'),
            React.createElement('span', null, "You're currently offline. Feel free to browse and edit your cart. We'll be ready to place your order once you're back online!")
        );
    };

    const value = { isOnline };

    return React.createElement(NetworkStatusContext.Provider, { value }, 
        children,
        React.createElement(OfflineIndicator)
    );
};

export const useNetworkStatus = () => {
    return React.useContext(NetworkStatusContext);
};
