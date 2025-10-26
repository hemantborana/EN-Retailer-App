
import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { CartItem } from '../types';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (barcode: string) => void;
    updateQuantity: (barcode: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const addToCart = (item: CartItem) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(i => i.barcode === item.barcode);
            if (existingItem) {
                return prevItems.map(i =>
                    i.barcode === item.barcode
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }
            return [...prevItems, item];
        });
    };

    const removeFromCart = (barcode: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.barcode !== barcode));
    };

    const updateQuantity = (barcode: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(barcode);
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.barcode === barcode ? { ...item, quantity } : item
                )
            );
        }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce((sum, item) => sum + item.mrp * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
