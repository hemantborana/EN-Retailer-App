import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { saveOrder } from '../services/firebaseService';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
    const { user } = useAuth();
    const { addToast } = useToast();
    const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);

    const handlePlaceOrder = async () => {
        if (!user) {
            addToast("You must be logged in to place an order.", 'error');
            return;
        }
        setIsPlacingOrder(true);
        try {
            await saveOrder({
                retailerId: user.id,
                timestamp: Date.now(),
                items: cartItems,
                totalAmount: totalAmount,
                status: 'Pending'
            });
            addToast('Order placed successfully!', 'success');
            clearCart();
            onClose();
        } catch (error) {
            console.error("Failed to place order: ", error);
            addToast("Failed to place order. Please try again.", 'error');
        } finally {
            setIsPlacingOrder(false);
        }
    };


    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg z-50 transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-xl font-semibold">Shopping Cart</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    {cartItems.length === 0 ? (
                        <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
                            <p className="text-lg text-gray-500">Your cart is empty.</p>
                            <p className="text-sm text-gray-400 mt-2">Add some products to get started!</p>
                        </div>
                    ) : (
                         <div className="flex-1 overflow-y-auto p-4 divide-y">
                            {cartItems.map(item => (
                                <div key={item.barcode} className="flex items-start space-x-4 py-4">
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="font-semibold text-brand-text">{item.style}</p>
                                                <p className="text-xs text-gray-500 max-w-[200px] truncate">{item.description}</p>
                                            </div>
                                            <p className="text-md font-medium text-right">₹{item.mrp.toFixed(2)}</p>
                                        </div>
                                    
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center border border-gray-200 rounded">
                                                <button onClick={() => updateQuantity(item.barcode, item.quantity - 1)} className="px-3 py-1 text-gray-500 hover:bg-gray-100 transition">-</button>
                                                <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.barcode, item.quantity + 1)} className="px-3 py-1 text-gray-500 hover:bg-gray-100 transition">+</button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.barcode)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {cartItems.length > 0 && (
                        <div className="p-4 border-t space-y-4 bg-gray-50">
                            <div className="flex justify-between font-semibold text-lg">
                                <span>Total</span>
                                <span>₹{totalAmount.toFixed(2)}</span>
                            </div>
                            <button 
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder}
                                className="w-full bg-brand-primary text-white py-3 rounded-md font-semibold hover:bg-opacity-90 disabled:bg-gray-400 transition"
                            >
                                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartSidebar;
