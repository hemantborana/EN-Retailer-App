
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

const ItemList = ({ title, items, itemType }) => {
    if (!items || items.length === 0) {
        return React.createElement('div', { className: 'mt-2' },
            React.createElement('h4', { className: 'font-semibold text-gray-700 dark:text-gray-300' }, title),
            React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 italic' }, 'No items in this category.')
        );
    }

    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const renderItem = (item, index) => {
        // 'sent' items have a `name` prop, original `lineItems` have `style`
        const style = item.style || item.name; 
        const description = item.description ? ` - ${item.description.split(',')[0]}` : '';
        return React.createElement('div', { key: item.barcode || `${style}-${item.size}-${item.color}-${index}`, className: 'flex justify-between items-center text-sm py-1' },
            React.createElement('span', { className: 'text-gray-800 dark:text-gray-200' }, `${style} (${item.size}, ${item.color})`),
            React.createElement('span', { className: 'font-medium text-gray-600 dark:text-gray-300' }, `Qty: ${item.quantity}`)
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

    const sentItems = sentData.flatMap(s => s.billedItems || []);
    const billingItems = flattenItems(billingData?.items);
    const pendingItems = flattenItems(pendingData?.items);

    return React.createElement('div', { className: 'border dark:border-gray-700 rounded-lg overflow-hidden' },
        React.createElement('div', { className: 'p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50', onClick: () => setIsExpanded(!isExpanded) },
            React.createElement('div', { className: 'flex justify-between items-start mb-2' },
                React.createElement('div', null,
                    React.createElement('p', { className: 'font-bold' }, `Ref: #${originalOrder.referenceNumber}`),
                    React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' }, new Date(originalOrder.dateTime).toLocaleString())
                ),
                React.createElement('div', { className: 'text-right' },
                    React.createElement('p', { className: 'font-bold text-lg' }, `₹${originalOrder.totalAmount.toFixed(2)}`),
                    React.createElement('span', { className: `px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[statusColor]}` }, status)
                )
            )
        ),
        isExpanded && React.createElement('div', { className: 'p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800' },
            originalOrder.approvedby && React.createElement('p', {className: 'text-sm text-gray-600 dark:text-gray-400'}, `Processed by ${originalOrder.approvedby} on ${new Date(originalOrder.ardate).toLocaleDateString()}`),
            originalOrder.orderNote && React.createElement('p', {className: 'text-sm text-gray-600 dark:text-gray-400 mt-1'}, `Note: ${originalOrder.orderNote}`),
            React.createElement(ItemList, { title: '✅ Sent Items', items: sentItems }),
            React.createElement(ItemList, { title: '⏳ Items in Billing', items: billingItems }),
            React.createElement(ItemList, { title: '📋 Pending Items', items: pendingItems }),
            React.createElement(ItemList, { title: '📦 Original Order', items: originalOrder.lineItems })
        )
    );
}

function OrderHistoryModal({ onClose }) {
    const { user } = useAuth();
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

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

                setOrders(processedOrders);
            } catch (error) {
                console.error("Failed to fetch order history:", error);
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
                loading ? React.createElement('div', { className: 'flex justify-center items-center h-full' }, React.createElement('p', { className: 'text-gray-900 dark:text-gray-200' }, 'Loading orders...')) :
                orders.length === 0 ? React.createElement('div', { className: 'flex justify-center items-center h-full' }, React.createElement('p', { className: 'text-gray-500 dark:text-gray-400' }, 'You have no past orders.')) :
                React.createElement('div', { className: 'space-y-4 text-gray-900 dark:text-gray-200' },
                    orders.map(order => React.createElement(OrderHistoryItem, { key: order.id, order: order }))
                )
            )
        )
    );
}

export default OrderHistoryModal;
