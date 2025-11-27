
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
    // 1. Get all POs submitted by this retailer, which is our starting point.
    const unapprovedOrders = await fetchOrders(retailerId);

    // 2. Fetch all possible subsequent order states from the new V2 paths.
    const [
        pendingSnapshot,
        billingSnapshot,
        billedSnapshot,
        deletedSnapshot,
        expiredSnapshot
    ] = await Promise.all([
        get(ref(database, 'Pending_Order_V2')),
        get(ref(database, 'Ready_For_Billing_V2')),
        get(ref(database, 'Billed_Orders_V2')),
        get(ref(database, 'Deleted_Orders_V2')),
        get(ref(database, 'Expired_Orders_V2'))
    ]);

    // 3. Convert snapshots to value objects for easier processing in the component.
    const pendingData = pendingSnapshot.exists() ? pendingSnapshot.val() : {};
    const billingData = billingSnapshot.exists() ? billingSnapshot.val() : {};
    const billedData = billedSnapshot.exists() ? billedSnapshot.val() : {};
    const deletedData = deletedSnapshot.exists() ? deletedSnapshot.val() : {};
    const expiredData = expiredSnapshot.exists() ? expiredSnapshot.val() : {};

    // 4. Return all data to the component for client-side linking and processing.
    return {
        unapproved: unapprovedOrders,
        pending: pendingData,
        billing: billingData,
        billed: billedData,
        deleted: deletedData,
        expired: expiredData,
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
