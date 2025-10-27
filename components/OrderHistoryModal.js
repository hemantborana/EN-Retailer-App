
import React from 'react';
import { fetchFullOrderHistory } from '../services/firebaseService.js';
import { useAuth } from '../context/AuthContext.js';

const flattenItems = (items) => {
    if (!items) return [];
    const flatList = [];
    items.forEach(style => {
        const styleName = style.name;
        Object.keys(style.colors).forEach(colorName => {
            Object.keys(style.colors[colorName]).forEach(size => {
                flatList.push({
                    name: styleName,
                    color: colorName,
                    size: size,
                    quantity: style.colors[colorName][size]
                });
            });
        });
    });
    return flatList;
};

const ItemList = ({ title, items }) => {
    if (!items || items.length === 0) {
        return React.createElement('div', { className: 'mt-4' },
            React.createElement('h4', { className: 'font-semibold text-gray-700 dark:text-gray-300' }, title),
            React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 italic' }, 'No items in this category.')
        );
    }

    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const renderItem = (item, index) => {
        const style = item.style || item.name;
        return React.createElement('div', { key: item.barcode || `${style}-${item.size}-${item.color}-${index}`, className: 'flex justify-between items-center text-sm py-1' },
            React.createElement('span', { className: 'text-gray-800 dark:text-gray-200 truncate pr-2' }, `${style} (${item.size}, ${item.color})`),
            React.createElement('span', { className: 'font-medium text-gray-600 dark:text-gray-300 flex-shrink-0' }, `Qty: ${item.quantity}`)
        );
    };

    return React.createElement('div', { className: 'mt-4' },
        React.createElement('div', { className: 'flex justify-between items-center' },
            React.createElement('h4', { className: 'font-semibold text-gray-700 dark:text-gray-300' }, title),
            React.createElement('span', { className: 'text-sm font-bold text-gray-600 dark:text-gray-300' }, `Total: ${totalQuantity}`)
        ),
        React.createElement('div', { className: 'mt-1 p-2 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/50 max-h-40 overflow-y-auto' },
            items.map(renderItem)
        )
    );
};

function OrderHistoryItem({ order }) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const { originalOrder, pendingData, billingData, sentData, status, statusColor } = order;

    const statusClasses = {
        yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
        red: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
        green: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
        indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200',
        gray: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300',
    };
    
    const showProcessingDetails = status !== 'Approval Pending' && status !== 'Rejected';
    
    const sentItems = showProcessingDetails ? sentData.flatMap(s => s.billedItems || []) : [];
    const billingItems = showProcessingDetails ? flattenItems(billingData?.items) : [];
    const pendingItems = showProcessingDetails ? flattenItems(pendingData?.items) : [];

    return React.createElement('div', { className: 'border dark:border-gray-700 rounded-lg overflow-hidden transition-shadow hover:shadow-md' },
        React.createElement('div', { className: 'p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50', onClick: () => setIsExpanded(!isExpanded) },
            React.createElement('div', { className: 'flex justify-between items-center' },
                React.createElement('div', null,
                    React.createElement('p', { className: 'font-bold text-lg text-gray-800 dark:text-gray-100' }, `Reference #${originalOrder.referenceNumber}`),
                    React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' }, new Date(originalOrder.dateTime).toLocaleString())
                ),
                React.createElement('div', { className: 'flex flex-col items-end' },
                    React.createElement('span', { className: `px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[statusColor]}` }, status),
                    React.createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-300 mt-1' }, `Total Qty: ${originalOrder.totalQuantity}`)
                )
            )
        ),
        isExpanded && React.createElement('div', { className: 'p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800' },
            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4' },
                originalOrder.approvedby && React.createElement('div', null,
                    React.createElement('p', { className: 'font-semibold text-gray-600 dark:text-gray-400' }, 'Processed by'),
                    React.createElement('p', { className: 'text-gray-800 dark:text-gray-200' }, `${originalOrder.approvedby} on ${new Date(originalOrder.ardate).toLocaleDateString()}`)
                ),
                originalOrder.orderNote && React.createElement('div', { className: 'md:col-span-2' },
                    React.createElement('p', { className: 'font-semibold text-gray-600 dark:text-gray-400' }, 'Retailer Note'),
                    React.createElement('p', { className: 'text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md' }, originalOrder.orderNote)
                )
            ),
            
            showProcessingDetails && React.createElement(React.Fragment, null,
                React.createElement(ItemList, { title: '✅ Billed Items', items: sentItems }),
                React.createElement(ItemList, { title: '⏳ Processing Items', items: billingItems }),
                React.createElement(ItemList, { title: '📋 Pending Items', items: pendingItems })
            ),
            React.createElement(ItemList, { title: '📦 Original Order Details', items: originalOrder.lineItems })
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
                const { unapproved, pending, billing, sent } = await fetchFullOrderHistory(user.id);

                const sentByOrderNumber = sent.reduce((acc, sentItem) => {
                    const orderNum = sentItem.orderNumber;
                    if (!acc[orderNum]) acc[orderNum] = [];
                    acc[orderNum].push(sentItem);
                    return acc;
                }, {});

                const processedOrders = unapproved.map(originalOrder => {
                    const refNum = originalOrder.referenceNumber;
                    const pendingData = pending[refNum];
                    const billingData = billing[refNum];
                    const sentData = sentByOrderNumber[refNum] || [];

                    let status = 'Unknown';
                    let statusColor = 'gray';

                    if (originalOrder.status === 'Approval Pending') {
                        status = 'Approval Pending';
                        statusColor = 'yellow';
                    } else if (originalOrder.status === 'Rejected') {
                        status = 'Rejected';
                        statusColor = 'red';
                    } else if (originalOrder.status === 'Approved') {
                        const totalSentQty = sentData.reduce((sum, s) =>
                            sum + (s.billedItems || []).reduce((isum, i) => isum + i.quantity, 0), 0);

                        if (totalSentQty >= originalOrder.totalQuantity) {
                            status = 'Completed';
                            statusColor = 'green';
                        } else if (totalSentQty > 0) {
                            status = 'Partially Fulfilled';
                            statusColor = 'blue';
                        } else if (!pendingData && !billingData) {
                            status = 'Expired';
                            statusColor = 'gray';
                        } else {
                            status = 'Processing';
                            statusColor = 'indigo';
                        }
                    }

                    return {
                        id: refNum,
                        originalOrder,
                        pendingData,
                        billingData,
                        sentData,
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
