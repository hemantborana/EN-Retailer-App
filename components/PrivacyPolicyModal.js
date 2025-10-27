
import React from 'react';

function PrivacyPolicyModal({ onClose }) {
    const PolicySection = ({ title, children }) => React.createElement('div', { className: 'mb-4' },
        React.createElement('h3', { className: 'text-lg font-semibold text-gray-800 mb-2' }, title),
        React.createElement('div', { className: 'space-y-2 text-gray-600' }, children)
    );

    return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop-enter', onClick: onClose },
        React.createElement('div', { className: 'bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col modal-content-enter', onClick: e => e.stopPropagation() },
            React.createElement('div', { className: 'p-4 border-b flex justify-between items-center' },
                React.createElement('h2', { className: 'text-xl font-bold text-gray-900' }, 'Privacy Policy'),
                React.createElement('button', { onClick: onClose, className: 'text-gray-500 hover:text-gray-800' },
                    React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
                        React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
                    )
                )
            ),
            React.createElement('div', { className: 'flex-grow overflow-y-auto p-6 text-sm' },
                React.createElement('p', { className: 'mb-4 text-gray-600' }, `Last updated: ${new Date().toLocaleDateString()}`),
                
                React.createElement(PolicySection, { title: "1. Introduction" },
                    React.createElement('p', null, "Welcome to the Kambeshwar Agencies Ordering App. We are committed to protecting the privacy and security of our users' information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.")
                ),

                React.createElement(PolicySection, { title: "2. Information We Collect" },
                    React.createElement('p', null, "We may collect information about you in a variety of ways. The information we may collect via the Application includes:"),
                    React.createElement('ul', { className: 'list-disc list-inside ml-4' },
                        React.createElement('li', null, React.createElement('strong', null, "Personal Data:"), " Personally identifiable information, such as your business name, email address, and city, that you voluntarily give to us when you register with the Application."),
                        React.createElement('li', null, React.createElement('strong', null, "Order Data:"), " Information related to orders you place, including product details, quantities, and pricing."),
                        React.createElement('li', null, React.createElement('strong', null, "Usage Data:"), " We may automatically collect information about your device and how you use the Application, such as your IP address, browser type, and operating system.")
                    )
                ),

                React.createElement(PolicySection, { title: "3. How We Use Your Information" },
                     React.createElement('p', null, "Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:"),
                    React.createElement('ul', { className: 'list-disc list-inside ml-4' },
                        React.createElement('li', null, "Create and manage your account."),
                        React.createElement('li', null, "Process your orders and manage your order history."),
                        React.createElement('li', null, "Improve our Application and offerings."),
                        React.createElement('li', null, "Provide customer support and respond to your inquiries.")
                    )
                ),

                React.createElement(PolicySection, { title: "4. Data Security" },
                    React.createElement('p', null, "We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.")
                ),

                React.createElement(PolicySection, { title: "5. Changes to This Privacy Policy" },
                    React.createElement('p', null, "We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons.")
                ),

                React.createElement(PolicySection, { title: "6. Contact Us" },
                    React.createElement('p', null, "If you have questions or comments about this Privacy Policy, please contact us through the Help Center feature in the application.")
                )
            ),
             React.createElement('div', { className: 'p-4 border-t flex justify-end' },
                React.createElement('button', { onClick: onClose, className: 'px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700' }, 'Close')
            )
        )
    );
}

export default PrivacyPolicyModal;
