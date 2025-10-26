
import React from 'react';

const CartContext = React.createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = React.useState([]);

    const addToCart = (item) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(i => i.barcode === item.barcode);
            if (existingItem) {
                return prevItems.map(i =>
                    i.barcode === item.barcode ? { ...i, quantity: i.quantity + item.quantity } : i
                );
            }
            return [...prevItems, item];
        });
    };

    const updateQuantity = (barcode, quantity) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.barcode === barcode ? { ...item, quantity: quantity } : item
            ).filter(item => item.quantity > 0)
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const value = { cartItems, addToCart, updateQuantity, clearCart };

    return React.createElement(CartContext.Provider, { value }, children);
};

export const useCart = () => {
    return React.useContext(CartContext);
};
