
import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

const issues = {
    'Select a category...': [],
    'Ordering Problem': ['Product not found', 'Price is incorrect', 'Stock level issue', 'Problem with placing order', 'Other'],
    'App Functionality': ['How to use Quick Order?', 'Search is not working', 'Report a technical bug', 'Suggest a new feature'],
    'My Account & History': ['Update my business details', 'Order history is incorrect', 'Account access issue', 'Other'],
    'Other': [],
};

const Input = ({ label, children }) => React.createElement('div', { className: 'mb-4' },
    React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, label),
    children
);

function HelpCenterModal({ onClose }) {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [mainIssue, setMainIssue] = React.useState(Object.keys(issues)[0]);
    const [subIssue, setSubIssue] = React.useState('');
    const [customIssue, setCustomIssue] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [subIssues, setSubIssues] = React.useState([]);

    React.useEffect(() => {
        setSubIssues(issues[mainIssue] || []);
        setSubIssue(''); 
    }, [mainIssue]);

    const handleSend = () => {
        if (!mainIssue || mainIssue === 'Select a category...') {
            showToast('Please select a main issue category.', 'error');
            return;
        }
        if (mainIssue === 'Other' && !customIssue.trim()) {
            showToast('Please specify your issue.', 'error');
            return;
        }
        if (!description.trim()) {
            showToast('Please provide a description of your problem.', 'error');
            return;
        }
        
        const whatsAppNumber = '919284494154';
        const finalMainIssue = mainIssue === 'Other' ? customIssue : mainIssue;

        let message = `*Help Request from Kambeshwar Agencies App*\n\n`;
        message += `*Retailer:* ${user.name}\n`;
        message += `*ID:* ${user.id}\n\n`;
        message += `*Issue Category:* ${finalMainIssue}\n`;
        if (subIssue) {
            message += `*Sub-Issue:* ${subIssue}\n`;
        }
        message += `\n*Description:*\n${description}`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${whatsAppNumber}?text=${encodedMessage}`, '_blank');
        
        onClose();
        showToast('Redirecting to WhatsApp to send your support request.');
    };
    
    return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop-enter', onClick: onClose },
        React.createElement('div', { className: 'bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col modal-content-enter', onClick: e => e.stopPropagation() },
            React.createElement('div', { className: 'p-4 border-b flex justify-between items-center' },
                React.createElement('h2', { className: 'text-xl font-bold text-gray-900' }, 'Help Center'),
                React.createElement('button', { onClick: onClose, className: 'text-gray-500 hover:text-gray-800' },
                    React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
                        React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
                    )
                )
            ),
            React.createElement('div', { className: 'flex-grow overflow-y-auto p-6' },
                React.createElement(Input, { label: 'What can we help you with?' },
                    React.createElement('select', {
                        value: mainIssue,
                        onChange: (e) => setMainIssue(e.target.value),
                        className: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500'
                    }, Object.keys(issues).map(issue => React.createElement('option', { key: issue, value: issue }, issue)))
                ),

                mainIssue === 'Other' && React.createElement(Input, { label: 'Please Specify Your Issue' },
                    React.createElement('input', {
                        type: 'text',
                        value: customIssue,
                        onChange: e => setCustomIssue(e.target.value),
                        className: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500'
                    })
                ),

                subIssues.length > 0 && React.createElement(Input, { label: 'Select a Sub-Issue' },
                     React.createElement('select', {
                        value: subIssue,
                        onChange: (e) => setSubIssue(e.target.value),
                        className: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500'
                    }, 
                        React.createElement('option', { value: '' }, 'Select a sub-issue...'),
                        subIssues.map(sub => React.createElement('option', { key: sub, value: sub }, sub))
                     )
                ),
                
                React.createElement(Input, { label: 'Please describe the problem in detail' },
                    React.createElement('textarea', {
                        rows: 5,
                        value: description,
                        onChange: e => setDescription(e.target.value),
                        className: 'w-full p-2 border border-gray-300 rounded-md shadow-sm resize-none focus:outline-none focus:ring-pink-500 focus:border-pink-500'
                    })
                )
            ),
            React.createElement('div', { className: 'p-4 border-t flex justify-end space-x-2' },
                React.createElement('button', { onClick: onClose, className: 'px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300' }, 'Cancel'),
                React.createElement('button', { onClick: handleSend, className: 'px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700' }, 'Send to WhatsApp')
            )
        )
    );
}

export default HelpCenterModal;
