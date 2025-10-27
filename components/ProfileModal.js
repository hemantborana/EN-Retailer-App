
import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';

const InfoRow = ({ label, value }) => React.createElement('div', { className: 'py-3 sm:grid sm:grid-cols-3 sm:gap-4' },
    React.createElement('dt', { className: 'text-sm font-medium text-gray-500 dark:text-gray-400' }, label),
    React.createElement('dd', { className: 'mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-gray-200' }, value)
);

const Toggle = ({ enabled, onChange }) => {
    const SunIcon = () => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: "h-4 w-4 text-yellow-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" }));
    const MoonIcon = () => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: "h-4 w-4 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" }));

    return React.createElement('button', {
        onClick: onChange,
        className: `relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-gray-600' : 'bg-gray-200'}`
    },
        React.createElement('span', { className: 'sr-only' }, 'Enable dark mode'),
        React.createElement('span', { className: `inline-flex items-center justify-center transform transition-transform duration-200 ease-in-out h-5 w-5 rounded-full bg-white shadow ${enabled ? 'translate-x-6' : 'translate-x-1'}` },
            enabled ? React.createElement(MoonIcon) : React.createElement(SunIcon)
        )
    );
};

function ProfileModal({ onClose }) {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop-enter', onClick: onClose },
        React.createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col modal-content-enter', onClick: e => e.stopPropagation() },
            React.createElement('div', { className: 'p-4 border-b dark:border-gray-700 flex justify-between items-center' },
                React.createElement('h2', { className: 'text-xl font-bold text-gray-900 dark:text-gray-100' }, 'My Profile'),
                React.createElement('button', { onClick: onClose, className: 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300' },
                    React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
                        React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
                    )
                )
            ),
            React.createElement('div', { className: 'flex-grow overflow-y-auto p-6 space-y-6' },
                React.createElement('div', null,
                    React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 dark:text-gray-100' }, 'Business Information'),
                    React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mt-1' }, 'To update your details, please contact support via the Help Center.'),
                    React.createElement('div', { className: 'mt-4 border-t border-b border-gray-200 dark:border-gray-700' },
                        React.createElement('dl', { className: 'divide-y divide-gray-200 dark:divide-gray-700' },
                            React.createElement(InfoRow, { label: 'Business Name', value: user.name }),
                            React.createElement(InfoRow, { label: 'Registered ID / Email', value: user.id }),
                            React.createElement(InfoRow, { label: 'City', value: user.city || 'Not specified' })
                        )
                    )
                ),
                React.createElement('div', null,
                    React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 dark:text-gray-100' }, 'App Preferences'),
                    React.createElement('div', { className: 'mt-4 border-t border-gray-200 dark:border-gray-700' },
                         React.createElement('dl', { className: 'divide-y divide-gray-200 dark:divide-gray-700' },
                            React.createElement('div', { className: 'py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center' },
                                React.createElement('dt', { className: 'text-sm font-medium text-gray-500 dark:text-gray-400' }, 'Dark Mode'),
                                React.createElement('dd', { className: 'mt-1 sm:mt-0 sm:col-span-2' },
                                    React.createElement(Toggle, { enabled: theme === 'dark', onChange: toggleTheme })
                                )
                            )
                        )
                    )
                )
            ),
             React.createElement('div', { className: 'p-4 border-t dark:border-gray-700 flex justify-end' },
                React.createElement('button', { onClick: onClose, className: 'px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700' }, 'Close')
            )
        )
    );
}

export default ProfileModal;
