
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, query, orderByChild, equalTo, runTransaction } from "firebase/database";

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Helper to encode a string to a valid Firebase key using Base64.
// Firebase keys cannot contain '.', '#', '$', '[', or ']'.
const sanitizeFirebaseKey = (key) => {
    return btoa(key);
};

const fetchDataAsArray = async (path) => {
    const dataRef = ref(database, path);
    const snapshot = await get(dataRef);
    if (!snapshot.exists()) {
        return [];
    }
    const data = snapshot.val();
    const dataArray = Array.isArray(data) ? data : Object.values(data);
    return dataArray.filter(item => item !== null);
};


export const fetchItems = async () => {
    return fetchDataAsArray('itemData/items');
};

export const fetchStock = async () => {
    return fetchDataAsArray('stock');
};

export const getNextReferenceNumber = async () => {
    const counterRef = ref(database, 'referenceNumbers/counter');
    const transactionResult = await runTransaction(counterRef, (currentData) => {
        return (currentData || 0) + 1;
    });

    if (transactionResult.committed) {
        return transactionResult.snapshot.val();
    } else {
        throw new Error("Could not retrieve a unique order reference number. Please try again.");
    }
};

export const saveOrder = async (order) => {
    const orderRef = ref(database, `unapprovedorders/${order.referenceNumber}`);
    await set(orderRef, order);
    return order.referenceNumber;
};

export const fetchOrders = async (retailerId) => {
    const ordersRef = ref(database, 'unapprovedorders');
    // Fetch all orders and filter client-side to avoid needing a Firebase index.
    // This is less performant for very large datasets but resolves the current error.
    const snapshot = await get(ordersRef);
    if (snapshot.exists()) {
        const allOrders = snapshot.val();
        const userOrders = Object.values(allOrders).filter(order => order && order.retailerId === retailerId);
        return userOrders.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    }
    return [];
};

export const fetchFullOrderHistory = async (retailerId) => {
    const unapprovedOrders = await fetchOrders(retailerId);

    const pendingRef = ref(database, 'orders');
    const billingRef = ref(database, 'billingOrders');
    const sentRef = ref(database, 'sentOrders');

    const [pendingSnapshot, billingSnapshot, sentSnapshot] = await Promise.all([
        get(pendingRef),
        get(billingRef),
        get(sentRef)
    ]);

    const pendingData = pendingSnapshot.exists() ? pendingSnapshot.val() : {};
    const billingData = billingSnapshot.exists() ? billingSnapshot.val() : {};
    const sentData = sentSnapshot.exists() ? Object.values(sentSnapshot.val()) : [];

    return {
        unapproved: unapprovedOrders,
        pending: pendingData,
        billing: billingData,
        sent: sentData,
    };
};


export const saveCart = async (userId, cartItems) => {
    const sanitizedUserId = sanitizeFirebaseKey(userId);
    const cartRef = ref(database, `PARTY_APP_CART/${sanitizedUserId}`);
    await set(cartRef, cartItems);
};

export const fetchCart = async (userId) => {
    const sanitizedUserId = sanitizeFirebaseKey(userId);
    const cartRef = ref(database, `PARTY_APP_CART/${sanitizedUserId}`);
    const snapshot = await get(cartRef);
    if (snapshot.exists()) {
        return snapshot.val();
    }
    return [];
};

export const getGeminiUsage = async (userId) => {
    const sanitizedUserId = sanitizeFirebaseKey(userId);
    const usageRef = ref(database, `hbgosample/geminiUsage/${sanitizedUserId}`);
    const snapshot = await get(usageRef);
    if (snapshot.exists()) {
        return snapshot.val();
    }
    return { date: '', count: 0 };
};

export const setGeminiUsage = async (userId, usageData) => {
    const sanitizedUserId = sanitizeFirebaseKey(userId);
    const usageRef = ref(database, `hbgosample/geminiUsage/${sanitizedUserId}`);
    await set(usageRef, usageData);
};
