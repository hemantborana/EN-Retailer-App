
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, push, set, query, orderByChild, equalTo } from "firebase/database";

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

export const saveOrder = async (order) => {
    const ordersRef = ref(database, 'hbgosample/orders');
    const newOrderRef = push(ordersRef);
    await set(newOrderRef, { ...order, id: newOrderRef.key });
    return newOrderRef.key;
};

export const fetchOrders = async (retailerId) => {
    const ordersRef = ref(database, 'hbgosample/orders');
    const q = query(ordersRef, orderByChild('retailerId'), equalTo(retailerId));
    const snapshot = await get(q);
    if (snapshot.exists()) {
        const orders = snapshot.val();
        return Object.values(orders).sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
};
