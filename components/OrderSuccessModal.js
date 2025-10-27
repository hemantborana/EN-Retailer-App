
import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../context/AuthContext.js';
import { generateOrderSummary } from '../services/geminiService.js';

function OrderSuccessModal({ order, onClose }) {
    if (!order) return null;
    
    const { user } = useAuth();
    const [aiSummary, setAiSummary] = React.useState('');
    const [isSummaryLoading, setIsSummaryLoading] = React.useState(true);

    React.useEffect(() => {
        if (order && user) {
            const fetchSummary = async () => {
                setIsSummaryLoading(true);
                const summary = await generateOrderSummary(order, user.id);
                setAiSummary(summary || '');
                setIsSummaryLoading(false);
            };
            fetchSummary();
        } else {
            setIsSummaryLoading(false);
        }
    }, [order, user]);


    const generatePdf = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text('Kambeshwar Agencies', 14, 22);
        doc.setFontSize(12);
        doc.text('Order Confirmation', 14, 30);

        // Order Details
        doc.setFontSize(10);
        doc.text(`Order ID: ${order.id.slice(-6)}`, 14, 40);
        doc.text(`Date: ${new Date(order.timestamp).toLocaleString()}`, 14, 45);
        doc.text(`Retailer ID: ${order.retailerId}`, 14, 50);

        // Items Table
        const tableColumn = ["Style", "Description", "Color", "Size", "Qty", "MRP", "Total"];
        const tableRows = [];

        order.items.forEach(item => {
            const itemData = [
                item.style,
                item.description,
                item.color,
                item.size,
                item.quantity,
                `₹${item.mrp.toFixed(2)}`,
                `₹${(item.mrp * item.quantity).toFixed(2)}`
            ];
            tableRows.push(itemData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55,
        });

        // Total Amount
        const finalY = doc.lastAutoTable.finalY;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Amount: ₹${order.totalAmount.toFixed(2)}`, 14, finalY + 10);

        // Save PDF
        doc.save(`order_${order.id.slice(-6)}.pdf`);
    };

    const renderAiSummary = () => {
        if (isSummaryLoading) {
            return React.createElement('div', { className: 'text-sm text-gray-500 dark:text-gray-400 animate-pulse text-left mt-4' }, 'Generating AI summary...');
        }
        if (aiSummary) {
            return React.createElement('div', {className: 'text-left mt-4'}, 
                React.createElement('p', {className: 'font-semibold text-gray-700 dark:text-gray-300 mb-1'}, 'AI Summary:'),
                React.createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-3 rounded-md' }, aiSummary)
            );
        }
        return null;
    };
    
    return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop-enter', onClick: onClose },
        React.createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg text-center p-6 modal-content-enter', onClick: e => e.stopPropagation() },
            React.createElement('div', { className: 'mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50' },
                React.createElement('svg', { className: 'h-6 w-6 text-green-600 dark:text-green-400', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
                    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M5 13l4 4L19 7' })
                )
            ),
            React.createElement('h3', { className: 'text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mt-4' }, 'Order Placed Successfully!'),
            React.createElement('div', { className: 'mt-2 px-7 py-3' },
                React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' }, `Your order with ID ${order.id.slice(-6)} has been placed.`),
                renderAiSummary()
            ),
            React.createElement('div', { className: 'items-center px-4 py-3 space-y-2 sm:space-y-0 sm:flex sm:space-x-2 justify-center' },
                React.createElement('button', {
                    onClick: generatePdf,
                    className: 'w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-pink-600 text-base font-medium text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500'
                }, 'Download PDF'),
                React.createElement('button', {
                    onClick: onClose,
                    className: 'w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }, 'Close')
            )
        )
    );
}

export default OrderSuccessModal;