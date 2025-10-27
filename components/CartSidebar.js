import React from 'react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { saveOrder } from '../services/firebaseService.js';

function CartGroup({ group, updateQuantity }) {
    const [isExpanded, setIsExpanded] = React.useState(true);

    const groupTotalQuantity = group.variants.reduce((sum, v) => sum + v.quantity, 0);
    
    const MinusIcon = () => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-4 w-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 }, React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M18 12H6' }));
    const PlusIcon = () => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-4 w-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 }, React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 6v12m6-6H6' }));
    const TrashIcon = () => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 1.5 }, React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' }));
    const ChevronIcon = () => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: `h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 1.5 }, React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M19 9l-7 7-7-7' }));

    return React.createElement('div', { className: 'border-b' },
        React.createElement('div', { className: 'p-4 cursor-pointer hover:bg-gray-50', onClick: () => setIsExpanded(!isExpanded) },
            React.createElement('div', { className: 'flex justify-between items-center' },
                React.createElement('div', null,
                    React.createElement('p', { className: 'font-bold text-gray-800' }, group.style),
                    React.createElement('p', { className: 'text-sm text-gray-600' }, group.color)
                ),
                React.createElement(ChevronIcon)
            ),
             React.createElement('div', { className: 'flex justify-between items-center mt-2 text-sm text-gray-500' },
                React.createElement('span', null, `Total Qty: ${groupTotalQuantity}`)
            )
        ),
        isExpanded && React.createElement('div', { className: 'bg-white px-4 pb-2' },
            React.createElement('div', { className: 'space-y-3' },
                group.variants.map(item =>
                    React.createElement('div', { key: item.barcode, className: 'flex items-center justify-between py-2 border-t' },
                        React.createElement('div', { className: 'font-medium text-gray-700 w-12' }, item.size),
                        React.createElement('div', { className: 'flex items-center border border-gray-200 rounded-md' },
                            React.createElement('button', { onClick: () => updateQuantity(item.barcode, item.quantity - 1), className: 'p-2 text-gray-600 hover:bg-gray-100 rounded-l-md' }, React.createElement(MinusIcon)),
                            React.createElement('span', { className: 'w-10 text-center font-medium text-gray-800' }, item.quantity),
                            React.createElement('button', { onClick: () => updateQuantity(item.barcode, item.quantity + 1), className: 'p-2 text-gray-600 hover:bg-gray-100 rounded-r-md' }, React.createElement(PlusIcon))
                        ),
                        React.createElement('div', { className: 'flex items-center space-x-2' },
                            React.createElement('button', { onClick: () => updateQuantity(item.barcode, 0), className: 'p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full' }, React.createElement(TrashIcon))
                        )
                    )
                )
            )
        )
    );
}

function CartSidebar({ isOpen, onClose, onOrderSuccess }) {
    const { cartItems, updateQuantity, clearCart, isLoadingCart } = useCart();
    const { user } = useAuth();
    const { showToast } = useToast();

    const groupedCart = React.useMemo(() => {
        return cartItems.reduce((acc, item) => {
            const groupKey = `${item.style}-${item.color}`;
            if (!acc[groupKey]) {
                acc[groupKey] = {
                    style: item.style,
                    color: item.color,
                    description: item.description,
                    variants: []
                };
            }
            acc[groupKey].variants.push(item);
            acc[groupKey].variants.sort((a, b) => a.size.localeCompare(b.size, undefined, { numeric: true }));
            return acc;
        }, {});
    }, [cartItems]);

    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            showToast('Your cart is empty.', 'error');
            return;
        }

        const totalAmount = cartItems.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
        const order = { retailerId: user.id, timestamp: Date.now(), items: cartItems, totalAmount: totalAmount, status: 'Pending' };

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

    const handleClearCart = () => {
        if (window.confirm('Are you sure you want to empty your cart?')) {
            clearCart();
            showToast('Cart has been cleared.');
        }
    };

    const EmptyCartIcon = () => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: "h-16 w-16 text-gray-300", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1 }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" }));

    return React.createElement('div', { className: `fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}` },
        React.createElement('div', { className: `absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0'}`, onClick: onClose }),
        React.createElement('div', { className: `relative w-full max-w-lg ml-auto h-full bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}` },
            React.createElement('div', { className: 'p-4 border-b flex justify-between items-center bg-gray-50' },
                React.createElement('h2', { className: 'text-xl font-bold text-gray-800' }, 'Your Cart'),
                React.createElement('button', { onClick: onClose, className: 'text-gray-500 hover:text-gray-800' },
                    React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
                        React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
                    )
                )
            ),
            isLoadingCart ?
                React.createElement('div', { className: 'flex-grow flex flex-col items-center justify-center text-center p-4' },
                    React.createElement('div', { className: 'spinner h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full' }),
                    React.createElement('p', { className: 'text-gray-500 mt-4' }, 'Loading Cart...')
                ) :
            cartItems.length === 0 ?
                React.createElement('div', { className: 'flex-grow flex flex-col items-center justify-center text-center p-4' },
                    React.createElement(EmptyCartIcon),
                    React.createElement('p', { className: 'text-gray-500 mt-4' }, 'Your cart is empty.'),
                    React.createElement('p', { className: 'text-sm text-gray-400' }, 'Add products to get started.')
                ) :
                React.createElement(React.Fragment, null,
                    React.createElement('div', { className: 'flex-grow overflow-y-auto bg-gray-50' },
                        Object.values(groupedCart).map(group =>
                            React.createElement(CartGroup, {
                                key: `${group.style}-${group.color}`,
                                group: group,
                                updateQuantity: updateQuantity
                            })
                        )
                    ),
                    React.createElement('div', { className: 'p-4 border-t bg-gray-50' },
                        React.createElement('div', { className: 'space-y-2 mb-4' },
                            React.createElement('div', { className: 'flex justify-between text-gray-600' },
                                React.createElement('span', { className: 'font-bold' }, 'Total Items'),
                                React.createElement('span', { className: 'font-bold' }, totalQuantity)
                            )
                        ),
                        React.createElement('button', {
                            onClick: handlePlaceOrder,
                            className: 'w-full bg-pink-600 text-white py-3 rounded-md hover:bg-pink-700 transition disabled:bg-gray-400',
                            disabled: cartItems.length === 0
                        }, 'Place Order'),
                        React.createElement('button', {
                            onClick: handleClearCart,
                            className: 'w-full text-center text-sm text-gray-500 hover:text-red-600 mt-3'
                        }, 'Clear Cart')
                    )
                )
        )
    );
}

export default CartSidebar;