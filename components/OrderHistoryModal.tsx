
import React, { useState, useEffect } from 'react';
import type { Order } from '../types';
import type { User } from '../App';
import { fetchOrders } from '../services/firebaseService';

interface OrderHistoryModalProps {
    user: User;
    onClose: () => void;
}

const Spinner = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>
    </div>
);

const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ user, onClose }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setIsLoading(true);
                const fetchedOrders = await fetchOrders(user.id);
                setOrders(fetchedOrders);
            } catch (err) {
                setError("Failed to fetch order history.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadOrders();
    }, [user.id]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">My Order History</h2>
                    <button onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? <Spinner /> : error ? <p className="text-red-500">{error}</p> : (
                        <div className="space-y-4">
                            {orders.length > 0 ? orders.map(order => (
                                <div key={order.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <p className="font-bold">Order ID: {order.id.slice(-6)}</p>
                                            <p className="text-sm text-gray-500">Date: {new Date(order.timestamp).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">₹{order.totalAmount.toFixed(2)}</p>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>{order.status}</span>
                                        </div>
                                    </div>
                                    <div className="border-t pt-2 mt-2">
                                        <h4 className="font-semibold text-sm mb-1">Items:</h4>
                                        <ul className="text-sm list-disc list-inside text-gray-600">
                                            {order.items.map(item => (
                                                <li key={item.barcode}>
                                                    {item.quantity} x {item.description}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-gray-500 mt-8">You have no past orders.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderHistoryModal;
