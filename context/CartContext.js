
import React from 'react';
import { useAuth } from './AuthContext.js';
import { saveCart, fetchCart } from '../services/firebaseService.js';

const CartContext = React.createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { user } = useAuth();

    React.useEffect(() => {
        const loadCart = async () => {
            if (user && user.id) {
                setIsLoading(true);
                try {
                    const savedCart = await fetchCart(user.id);
                    setCartItems(Array.isArray(savedCart) ? savedCart : []);
                } catch (error) {
                    console.error("Failed to load cart from Firebase:", error);
                    setCartItems([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setCartItems([]);
                setIsLoading(false);
            }
        };

        loadCart();
    }, [user]);

    React.useEffect(() => {
        if (!isLoading && user && user.id) {
            saveCart(user.id, cartItems);
        }
    }, [cartItems, user, isLoading]);

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

    const value = { cartItems, addToCart, updateQuantity, clearCart, isLoadingCart: isLoading };

    return React.createElement(CartContext.Provider, { value }, children);
};

export const useCart = () => {
    return React.useContext(CartContext);
};