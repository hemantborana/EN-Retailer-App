import React from 'react';
import { fetchFullOrderHistory } from '../services/firebaseService.js';
import { useAuth } from '../context/AuthContext.js';
import { formatTimestamp } from '../types.js';

const HistoryLog = ({ history }) => {
    if (!history || history.length === 0) return null;
    return React.createElement('div', { className: 'mt-4' },
        React.createElement('h4', { className: 'font-semibold text-gray-700 dark:text-gray-300 mb-1' }, 'Order History'),
        React.createElement('div', { className: 'border dark:border-gray-600 rounded-md p-2 space-y-2 bg-gray-50 dark:bg-gray-700/50 max-h-40 overflow-y-auto' },
            history.slice().sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map((entry, index) => React.createElement('div', { key: index, className: 'text-xs' },
                React.createElement('p', { className: 'font-semibold text-gray-800 dark:text-gray-200' }, `[${formatTimestamp(entry.timestamp)}] - ${entry.event}`),
                React.createElement('p', { className: 'text-gray-600 dark:text-gray-400 pl-2' }, entry.details)
            ))
        )
    );
};

const Tags = ({ tags }) => {
    if (!tags || tags.length === 0) return null;
    return React.createElement('div', { className: 'mt-4' },
        React.createElement('h4', { className: 'font-semibold text-gray-700 dark:text-gray-300 mb-1' }, 'Tags'),
        React.createElement('div', { className: 'flex flex-wrap gap-2' },
            tags.map(tag => React.createElement('span', { key: tag, className: 'px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 rounded-full' }, tag))
        )
    );
};

const ItemList = ({ title, items, isV2 = false }) => {
    if (!items || items.length === 0) {
        return React.createElement('div', { className: 'mt-4' },
            React.createElement('h4', { className: 'font-semibold text-gray-700 dark:text-gray-300' }, title),
            React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 italic' }, 'No items recorded for this stage.')
        );
    }

    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

    const renderV2Item = (item, index) => {
        const data = item.fullItemData || {};
        return React.createElement('div', { key: item.id || index, className: 'flex justify-between items-center text-sm py-1' },
            React.createElement('span', { className: 'text-gray-800 dark:text-gray-200 truncate pr-2' }, `${data.Style || 'N/A'} (${data.Size || 'N/A'}, ${data.Color || 'N/A'})`),
            React.createElement('span', { className: 'font-medium text-gray-600 dark:text-gray-300 flex-shrink-0' }, `Qty: ${item.quantity}`)
        );
    };

    const renderV1Item = (item, index) => {
        return React.createElement('div', { key: item.barcode || index, className: 'flex justify-between items-center text-sm py-1' },
             React.createElement('span', { className: 'text-gray-800 dark:text-gray-200 truncate pr-2' }, `${item.style} (${item.size}, ${item.color})`),
             React.createElement('span', { className: 'font-medium text-gray-600 dark:text-gray-300 flex-shrink-0' }, `Qty: ${item.quantity}`)
        );
    };

    return React.createElement('div', { className: 'mt-4' },
        React.createElement('div', { className: 'flex justify-between items-center' },
            React.createElement('h4', { className: 'font-semibold text-gray-700 dark:text-gray-300' }, title),
            React.createElement('span', { className: 'text-sm font-bold text-gray-600 dark:text-gray-300' }, `Total: ${totalQuantity}`)
        ),
        React.createElement('div', { className: 'mt-1 p-2 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/50 max-h-40 overflow-y-auto' },
            items.map(isV2 ? renderV2Item : renderV1Item)
        )
    );
};

function OrderHistoryItem({ order }) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const { originalOrder, linkedOrderData, status, statusColor } = order;
    
    const finalLinkedOrder = linkedOrderData ? linkedOrderData.finalOrder : null;
    const internalOrderNumber = finalLinkedOrder ? finalLinkedOrder.orderNumber : null;

    const statusClasses = {
        yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
        red: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
        green: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
        indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200',
        gray: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300',
    };

    return React.createElement('div', { className: 'border dark:border-gray-700 rounded-lg overflow-hidden transition-shadow hover:shadow-md' },
        React.createElement('div', { className: 'p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50', onClick: () => setIsExpanded(!isExpanded) },
            React.createElement('div', { className: 'flex justify-between items-start' },
                React.createElement('div', { className: 'flex-1' },
                    React.createElement('p', { className: 'font-bold text-lg text-gray-800 dark:text-gray-100' }, `PO Reference #${originalOrder.referenceNumber}`),
                    internalOrderNumber && React.createElement('p', { className: 'text-xs text-gray-500 dark:text-gray-400 mt-1' }, `Internal Order: ${internalOrderNumber}`),
                    React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' }, formatTimestamp(originalOrder.dateTime))
                ),
                React.createElement('div', { className: 'flex flex-col items-end flex-shrink-0 ml-2' },
                    React.createElement('span', { className: `px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[statusColor]}` }, status),
                    React.createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-300 mt-1' }, `Total Qty: ${originalOrder.totalQuantity}`)
                )
            )
        ),
        isExpanded && React.createElement('div', { className: 'p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800' },
            (status === 'Deleted' || status === 'Expired') && finalLinkedOrder && React.createElement('div', { className: 'mb-4 p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/30' },
                React.createElement('h4', { className: 'font-semibold text-yellow-800 dark:text-yellow-200' }, `Reason for ${status} Status`),
                React.createElement('p', { className: 'text-sm text-yellow-700 dark:text-yellow-300 mt-1' }, finalLinkedOrder.deletionReason || finalLinkedOrder.expirationReason)
            ),
            originalOrder.approvedby && React.createElement('div', { className: 'mb-4 text-sm' },
                 React.createElement('p', { className: 'font-semibold text-gray-600 dark:text-gray-400' }, 'Processed by'),
                 React.createElement('p', { className: 'text-gray-800 dark:text-gray-200' }, `${originalOrder.approvedby} on ${formatTimestamp(originalOrder.ardate)}`)
            ),
            originalOrder.orderNote && React.createElement('div', { className: 'mb-4 text-sm' },
                React.createElement('p', { className: 'font-semibold text-gray-600 dark:text-gray-400' }, 'Retailer Note'),
                React.createElement('p', { className: 'text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md' }, originalOrder.orderNote)
            ),
            finalLinkedOrder && React.createElement(Tags, { tags: finalLinkedOrder.tags }),
            finalLinkedOrder && React.createElement(HistoryLog, { history: finalLinkedOrder.history }),

            linkedOrderData && linkedOrderData.pending && React.createElement(ItemList, { title: 'Unprocessed Items (Pending)', items: linkedOrderData.pending.items, isV2: true }),
            linkedOrderData && linkedOrderData.billing && React.createElement(ItemList, { title: 'Under Process Items (Ready for Billing)', items: linkedOrderData.billing.items, isV2: true }),
            linkedOrderData && linkedOrderData.billed && React.createElement(ItemList, { title: 'Processed Items (Billed)', items: linkedOrderData.billed.items, isV2: true }),

            React.createElement(ItemList, { title: 'Original Purchase Order Items', items: originalOrder.lineItems })
        )
    );
}

function OrderHistoryModal({ onClose }) {
    const { user } = useAuth();
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const loadOrders = async () => {
            if (!user) return;
            try {
                const allData = await fetchFullOrderHistory(user.id);
                const { unapproved, pending, billing, billed, deleted, expired } = allData;

                const pendingMap = new Map(Object.values(pending).map(o => [o.orderNumber, o]));
                const billingMap = new Map(Object.values(billing).map(o => [o.orderNumber, o]));
                const billedMap = new Map(Object.values(billed).map(o => [o.orderNumber, o]));
                const deletedMap = new Map(Object.values(deleted).map(o => [o.orderNumber, o]));
                const expiredMap = new Map(Object.values(expired).map(o => [o.orderNumber, o]));

                const findInitialV2Order = (poReference) => {
                    const searchString = `PO #${poReference}`;
                    for (const v2Order of Object.values(pending)) {
                        if (v2Order.history && Array.isArray(v2Order.history) && v2Order.history.some(h => h.details && h.details.includes(searchString))) {
                            return v2Order;
                        }
                    }
                    return null;
                };

                const processedOrders = unapproved.map(originalOrder => {
                    const refNum = originalOrder.referenceNumber;
                    let status = 'Unknown';
                    let statusColor = 'gray';
                    let linkedOrderData = {
                        pending: null,
                        billing: null,
                        billed: null,
                        deleted: null,
                        expired: null,
                        finalOrder: null,
                    };

                    if (originalOrder.status === 'Approval Pending') {
                        status = 'Approval Pending';
                        statusColor = 'yellow';
                    } else if (originalOrder.status === 'Rejected') {
                        status = 'Rejected';
                        statusColor = 'red';
                    } else if (originalOrder.status === 'Approved') {
                        const initialV2Order = findInitialV2Order(refNum);
                        
                        if (initialV2Order) {
                            const internalOrderNumber = initialV2Order.orderNumber;

                            if (pendingMap.has(internalOrderNumber)) {
                                linkedOrderData.pending = pendingMap.get(internalOrderNumber);
                            }
                            if (billingMap.has(internalOrderNumber)) {
                                linkedOrderData.billing = billingMap.get(internalOrderNumber);
                            }
                            if (billedMap.has(internalOrderNumber)) {
                                linkedOrderData.billed = billedMap.get(internalOrderNumber);
                            }
                            if (deletedMap.has(internalOrderNumber)) {
                                linkedOrderData.deleted = deletedMap.get(internalOrderNumber);
                            }
                            if (expiredMap.has(internalOrderNumber)) {
                                linkedOrderData.expired = expiredMap.get(internalOrderNumber);
                            }
                            
                            if (linkedOrderData.billed) {
                                status = 'Billed';
                                statusColor = 'green';
                                linkedOrderData.finalOrder = linkedOrderData.billed;
                            } else if (linkedOrderData.billing) {
                                status = 'Processing';
                                statusColor = 'blue';
                                linkedOrderData.finalOrder = linkedOrderData.billing;
                            } else if (linkedOrderData.deleted) {
                                status = 'Deleted';
                                statusColor = 'gray';
                                linkedOrderData.finalOrder = linkedOrderData.deleted;
                            } else if (linkedOrderData.expired) {
                                status = 'Expired';
                                statusColor = 'gray';
                                linkedOrderData.finalOrder = linkedOrderData.expired;
                            } else if (linkedOrderData.pending) {
                                status = 'Pending';
                                statusColor = 'indigo';
                                linkedOrderData.finalOrder = linkedOrderData.pending;
                            }
                        }
                        
                        if (!linkedOrderData.finalOrder) {
                            status = 'Approved';
                            statusColor = 'indigo';
                        }
                    }

                    return {
                        id: refNum,
                        originalOrder,
                        linkedOrderData,
                        status,
                        statusColor
                    };
                });
                
                processedOrders.sort((a, b) => new Date(b.originalOrder.dateTime) - new Date(a.originalOrder.dateTime));
                setOrders(processedOrders);
            } catch (err) {
                setError("Failed to fetch order history. Please try again later.");
                console.error("Failed to fetch order history:", err);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, [user]);

    return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop-enter', onClick: onClose },
        React.createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col modal-content-enter', onClick: e => e.stopPropagation() },
            React.createElement('div', { className: 'p-4 border-b dark:border-gray-700 flex justify-between items-center' },
                React.createElement('h2', { className: 'text-xl font-bold text-gray-900 dark:text-gray-100' }, 'Your Order History'),
                React.createElement('button', { onClick: onClose, className: 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200' },
                    React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
                        React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
                    )
                )
            ),
            React.createElement('div', { className: 'flex-grow overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900' },
                loading ? React.createElement('div', { className: 'flex justify-center items-center h-full' }, 
                    React.createElement('div', { className: 'spinner h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full' }),
                    React.createElement('p', { className: 'text-gray-900 dark:text-gray-200 ml-3' }, 'Loading orders...')
                ) :
                error ? React.createElement('div', { className: 'flex justify-center items-center h-full text-red-600 dark:text-red-400' }, React.createElement('p', null, error)) :
                orders.length === 0 ? React.createElement('div', { className: 'flex justify-center items-center h-full' }, React.createElement('p', { className: 'text-gray-500 dark:text-gray-400' }, 'You have not placed any orders yet.')) :
                React.createElement('div', { className: 'space-y-4' },
                    orders.map(order => React.createElement(OrderHistoryItem, { key: order.id, order: order }))
                )
            ),
            React.createElement('div', { className: 'p-4 border-t dark:border-gray-700 flex justify-end' },
                React.createElement('button', { onClick: onClose, className: 'px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700' }, 'Close')
            )
        )
    );
}

export default OrderHistoryModal;
