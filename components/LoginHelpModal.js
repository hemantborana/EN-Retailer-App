
import React from 'react';
import { useToast } from '../context/ToastContext.js';

const loginIssues = {
    'Select a category...': [],
    'Login Issue': ['Not receiving OTP', 'My email is not registered', 'Incorrect business name is shown'],
    'Request for New Access': [],
    'Other': [],
};

const Input = ({ label, children }) => React.createElement('div', { className: 'mb-4' },
    React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, label),
    children
);

const NewAccessForm = ({ businessName, setBusinessName, city, setCity, email, setEmail, mobile, setMobile }) => React.createElement('div', { className: 'mt-4 border-t dark:border-gray-700 pt-4' },
    React.createElement('p', { className: 'text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2' }, 'Please provide your business details:'),
    React.createElement(Input, { label: 'Business Name' }, React.createElement('input', { type: 'text', value: businessName, onChange: e => setBusinessName(e.target.value), className: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white' })),
    React.createElement(Input, { label: 'City' }, React.createElement('input', { type: 'text', value: city, onChange: e => setCity(e.target.value), className: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white' })),
    React.createElement(Input, { label: 'Email' }, React.createElement('input', { type: 'email', value: email, onChange: e => setEmail(e.target.value), className: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white' })),
    React.createElement(Input, { label: 'Mobile Number' }, React.createElement('input', { type: 'tel', value: mobile, onChange: e => setMobile(e.target.value), className: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white' }))
);

function LoginHelpModal({ onClose }) {
    const { showToast } = useToast();

    const [mainIssue, setMainIssue] = React.useState(Object.keys(loginIssues)[0]);
    const [subIssue, setSubIssue] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [subIssues, setSubIssues] = React.useState([]);
    
    // State for New Access Request
    const [businessName, setBusinessName] = React.useState('');
    const [city, setCity] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [mobile, setMobile] = React.useState('');

    React.useEffect(() => {
        const availableSubIssues = loginIssues[mainIssue] || [];
        setSubIssues(availableSubIssues);
        setSubIssue('');
    }, [mainIssue]);

    const handleSend = () => {
        if (!mainIssue || mainIssue === 'Select a category...') {
            showToast('Please select a help category.', 'error');
            return;
        }

        const whatsAppNumber = '919284494154';
        let message = `*Login Help Request from Kambeshwar Agencies App*\n\n`;

        if (mainIssue === 'Request for New Access') {
            if (!businessName || !city || !email || !mobile) {
                showToast('Please fill all fields for the access request.', 'error');
                return;
            }
            message += `*Type:* New Access Request\n\n`;
            message += `*Business Name:* ${businessName}\n`;
            message += `*City:* ${city}\n`;
            message += `*Email:* ${email}\n`;
            message += `*Mobile:* ${mobile}\n`;
        } else {
            if (!description.trim()) {
                showToast('Please provide a description of your problem.', 'error');
                return;
            }
            message += `*Issue Category:* ${mainIssue}\n`;
            if (subIssue) {
                message += `*Sub-Issue:* ${subIssue}\n`;
            }
            message += `\n*Description:*\n${description}`;
        }

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${whatsAppNumber}?text=${encodedMessage}`, '_blank');
        
        onClose();
        showToast('Redirecting to WhatsApp to send your request.');
    };

    return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop-enter', onClick: onClose },
        React.createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col modal-content-enter', onClick: e => e.stopPropagation() },
            React.createElement('div', { className: 'p-4 border-b dark:border-gray-700 flex justify-between items-center' },
                React.createElement('h2', { className: 'text-xl font-bold text-gray-900 dark:text-gray-100' }, 'Login Help'),
                React.createElement('button', { onClick: onClose, className: 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200' },
                    React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
                        React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
                    )
                )
            ),
            React.createElement('div', { className: 'flex-grow overflow-y-auto p-6' },
                React.createElement(Input, { label: 'What is the problem?' },
                    React.createElement('select', {
                        value: mainIssue,
                        onChange: (e) => setMainIssue(e.target.value),
                        className: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white'
                    }, Object.keys(loginIssues).map(issue => React.createElement('option', { key: issue, value: issue }, issue)))
                ),

                mainIssue === 'Request for New Access' ? 
                    React.createElement(NewAccessForm, {
                        businessName, setBusinessName,
                        city, setCity,
                        email, setEmail,
                        mobile, setMobile
                    }) :
                    React.createElement(React.Fragment, null,
                        subIssues.length > 0 && React.createElement(Input, { label: 'Select a Sub-Issue' },
                             React.createElement('select', {
                                value: subIssue,
                                onChange: (e) => setSubIssue(e.target.value),
                                className: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white'
                            }, 
                                React.createElement('option', { value: '' }, 'Select a sub-issue...'),
                                subIssues.map(sub => React.createElement('option', { key: sub, value: sub }, sub))
                             )
                        ),
                        React.createElement(Input, { label: 'Please describe the problem' },
                            React.createElement('textarea', {
                                rows: 4,
                                value: description,
                                onChange: e => setDescription(e.target.value),
                                className: 'w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none dark:bg-gray-700 dark:text-white'
                            })
                        )
                    )
            ),
            React.createElement('div', { className: 'p-4 border-t dark:border-gray-700 flex justify-end space-x-2' },
                React.createElement('button', { onClick: onClose, className: 'px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500' }, 'Cancel'),
                React.createElement('button', { onClick: handleSend, className: 'px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700' }, 'Send Request')
            )
        )
    );
}

export default LoginHelpModal;