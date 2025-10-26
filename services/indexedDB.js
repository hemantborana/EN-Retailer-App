const DB_NAME = 'KambeshwarDB';
const DB_VERSION = 1;
const STORES = ['products', 'stock', 'features'];

let db;

const openDB = () => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const dbInstance = event.target.result;
            STORES.forEach(storeName => {
                if (!dbInstance.objectStoreNames.contains(storeName)) {
                    dbInstance.createObjectStore(storeName, { keyPath: 'id' });
                }
            });
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.errorCode);
            reject(event.target.errorCode);
        };
    });
};

export const saveData = async (storeName, data) => {
    const dbInstance = await openDB();
    const transaction = dbInstance.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    store.put({ id: storeName, data: data }); // Static ID for easy retrieval/overwrite
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event.target.error);
    });
};

export const loadData = async (storeName) => {
    const dbInstance = await openDB();
    const transaction = dbInstance.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(storeName); // Use the static ID
    return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
            resolve(event.target.result ? event.target.result.data : null);
        };
        request.onerror = (event) => reject(event.target.error);
    });
};