
// FIX: Switched to Firebase v9 compat library to resolve module import issues.
// All database calls have been updated to use the namespaced/compat API.
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import type { FirebaseItem, StockItem, Order } from '../types';

const firebaseConfig = {
    apiKey: "AIzaSyBRV-i_70Xdk86bNuQQ43jiYkRNCXGvvyo",
    authDomain: "hcoms-221aa.firebaseapp.com",
    databaseURL: "https://hcoms-221aa-default-rtdb.firebaseio.com",
    projectId: "hcoms-221aa",
    storageBucket: "hcoms-221aa.appspot.com",
    messagingSenderId: "817694176734",
    appId: "1:817694176734:web:176bf69333bd7119d3194f",
    measurementId: "G-JB143EY71N"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

export const fetchItems = async (): Promise<FirebaseItem[]> => {
    const snapshot = await database.ref('itemData/items').get();
    if (snapshot.exists()) {
        return snapshot.val();
    }
    return [];
};

export const fetchStock = async (): Promise<StockItem[]> => {
    const snapshot = await database.ref('stock').get();
    if (snapshot.exists()) {
        return snapshot.val();
    }
    return [];
};

export const saveOrder = async (order: Omit<Order, 'id'>): Promise<string> => {
    const dbRef = database.ref('hbgosample/orders');
    const newOrderRef = dbRef.push();
    await newOrderRef.set({ ...order, id: newOrderRef.key });
    return newOrderRef.key!;
};

export const fetchOrders = async (retailerId: string): Promise<Order[]> => {
    const dbRef = database.ref('hbgosample/orders');
    const snapshot = await dbRef.get();
    if (snapshot.exists()) {
        const allOrders: Record<string, Order> = snapshot.val();
        return Object.values(allOrders)
            .filter(order => order.retailerId === retailerId)
            .sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
};
