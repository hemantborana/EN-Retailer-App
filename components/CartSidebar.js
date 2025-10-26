
import React from 'react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { saveOrder } from '../services/firebaseService.js';

function CartSidebar({ isOpen, onClose, onOrderSuccess }) {
    const { cartItems, updateQuantity, clearCart } = useCart();
    const { user } = useAuth();
    const { showToast } = useToast();

    const totalAmount = cartItems.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            showToast('Your cart is empty.', 'error');
            return;
        }

        const order = {
            retailerId: user.id,
            timestamp: Date.now(),
            items: cartItems,
            totalAmount: totalAmount,
            status: 'Pending'
        };

        try {
            const orderId = await saveOrder(order);
            onOrderSuccess({ ...order, id: orderId });
            clearCart();
            onClose();
        } catch (error) {
            showToast('Failed to place order.', 'error');
            console.error('Order placement error:', error);
        }
    };
    
    return React.createElement('div', {
        className: `fixed inset-0 z-50 transition-transform transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
    },
        React.createElement('div', { className: 'absolute inset-0 bg-black bg-opacity-50', onClick: onClose }),
        React.createElement('div', { className: 'relative w-full max-w-md ml-auto h-full bg-white shadow-xl flex flex-col' },
            React.createElement('div', { className: 'p-4 border-b flex justify-between items-center' },
                React.createElement('h2', { className: 'text-xl font-bold' }, 'Your Cart'),
                React.createElement('button', { onClick: onClose, className: 'text-gray-500 hover:text-gray-800' },
                    React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
                        React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
                    )
                )
            ),
            cartItems.length === 0 ?
                React.createElement('div', { className: 'flex-grow flex items-center justify-center' },
                    React.createElement('p', { className: 'text-gray-500' }, 'Your cart is empty.')
                ) :
                React.createElement('div', { className: 'flex-grow overflow-y-auto p-4 space-y-4' },
                    cartItems.map(item =>
                        React.createElement('div', { key: item.barcode, className: 'flex items-center justify-between' },
                            React.createElement('div', { className: 'flex-grow' },
                                React.createElement('p', { className: 'font-semibold' }, item.style),
                                React.createElement('p', { className: 'text-sm text-gray-500' }, item.description),
                                React.createElement('p', { className: 'text-sm' }, `₹${item.mrp.toFixed(2)}`)
                            ),
                            React.createElement('div', { className: 'flex items-center' },
                                React.createElement('input', {
                                    type: 'number',
                                    value: item.quantity,
                                    onChange: e => updateQuantity(item.barcode, parseInt(e.target.value, 10)),
                                    className: 'w-16 text-center border-gray-300 rounded-md shadow-sm'
                                })
                            )
                        )
                    )
                ),
            React.createElement('div', { className: 'p-4 border-t' },
                React.createElement('div', { className: 'flex justify-between font-bold text-lg mb-4' },
                    React.createElement('span', null, 'Total'),
                    React.createElement('span', null, `₹${totalAmount.toFixed(2)} (${totalQuantity} items)`)
                ),
                React.createElement('button', {
                    onClick: handlePlaceOrder,
                    className: 'w-full bg-pink-600 text-white py-3 rounded-md hover:bg-pink-700 transition disabled:bg-gray-400',
                    disabled: cartItems.length === 0
                }, 'Place Order')
            )
        )
    );
}

export default CartSidebar;