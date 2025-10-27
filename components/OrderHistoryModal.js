import React from 'react';
import { fetchOrders } from '../services/firebaseService.js';
import { useAuth } from '../context/AuthContext.js';

function OrderHistoryModal({ onClose }) {
    const { user } = useAuth();
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadOrders = async () => {
            if (user) {
                try {
                    const userOrders = await fetchOrders(user.id);
                    setOrders(userOrders);
                } catch (error) {
                    console.error("Failed to fetch orders:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadOrders();
    }, [user]);

    return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop-enter', onClick: onClose },
        React.createElement('div', { className: 'bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col modal-content-enter', onClick: e => e.stopPropagation() },
            React.createElement('div', { className: 'p-4 border-b flex justify-between items-center' },
                React.createElement('h2', { className: 'text-xl font-bold text-gray-900' }, 'Your Order History'),
                React.createElement('button', { onClick: onClose, className: 'text-gray-500 hover:text-gray-800' },
                    React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
                        React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
                    )
                )
            ),
            React.createElement('div', { className: 'flex-grow overflow-y-auto p-4' },
                loading ? React.createElement('p', { className: 'text-gray-900' }, 'Loading orders...') :
                orders.length === 0 ? React.createElement('p', {className: 'text-gray-500'}, 'You have no past orders.') :
                React.createElement('div', { className: 'space-y-4 text-gray-900' },
                    orders.map(order =>
                        React.createElement('div', { key: order.id, className: 'border rounded-lg p-4' },
                            React.createElement('div', { className: 'flex justify-between items-start mb-2' },
                                React.createElement('div', null,
                                    React.createElement('p', { className: 'font-bold' }, `Order ID: ${order.id.slice(-6)}`),
                                    React.createElement('p', { className: 'text-sm text-gray-500' }, new Date(order.timestamp).toLocaleString())
                                ),
                                React.createElement('div', { className: 'text-right' },
                                    React.createElement('p', { className: 'font-bold text-lg' }, `₹${order.totalAmount.toFixed(2)}`),
                                    React.createElement('span', { className: 'px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full' }, order.status)
                                )
                            ),
                            React.createElement('div', { className: 'text-sm space-y-1' },
                                order.items.map(item =>
                                    React.createElement('div', { key: item.barcode, className: 'flex justify-between' },
                                        React.createElement('span', null, `${item.description} (x${item.quantity})`),
                                        React.createElement('span', null, `₹${(item.mrp * item.quantity).toFixed(2)}`)
                                    )
                                )
                            )
                        )
                    )
                )
            )
        )
    );
}

export default OrderHistoryModal;