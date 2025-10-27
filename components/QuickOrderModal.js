import React from 'react';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';

function QuickOrderModal({ products, onClose }) {
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const [inputText, setInputText] = React.useState('');
    const [parsedItems, setParsedItems] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const variantsMap = React.useMemo(() => {
        const map = new Map();
        products.forEach(product => {
            product.variants.forEach(variant => {
                const key = `${product.style.toUpperCase()}-${variant.size.toUpperCase()}-${variant.color.toUpperCase()}`;
                map.set(key, { ...variant, style: product.style });
            });
        });
        return map;
    }, [products]);

    const handleVerify = () => {
        setIsLoading(true);
        const lines = inputText.trim().split('\n').filter(line => line.trim() !== '');
        const verifiedItems = lines.map(line => {
            const parts = line.split(',').map(p => p.trim());
            if (parts.length !== 4) {
                return { line, status: 'Invalid format' };
            }
            const [style, size, color, quantityStr] = parts;
            const quantity = parseInt(quantityStr, 10);

            if (!style || !size || !color || isNaN(quantity) || quantity <= 0) {
                return { line, status: 'Invalid format' };
            }
            
            const key = `${style.toUpperCase()}-${size.toUpperCase()}-${color.toUpperCase()}`;
            const variant = variantsMap.get(key);

            if (!variant) {
                return { line, status: 'Variant not found' };
            }

            return {
                ...variant,
                quantity,
                status: 'Found',
            };
        });
        setParsedItems(verifiedItems);
        setIsLoading(false);
    };

    const handleAddToCart = () => {
        const validItems = parsedItems.filter(item => item.status === 'Found');
        if (validItems.length === 0) {
            showToast('No valid items to add.', 'error');
            return;
        }

        validItems.forEach(item => {
            addToCart({
                style: item.style,
                description: item.description,
                color: item.color,
                size: item.size,
                mrp: item.mrp,
                barcode: item.barcode,
                quantity: item.quantity
            });
        });

        showToast(`${validItems.length} item(s) have been added to your cart.`);
        onClose();
    };
    
    const validItemsCount = parsedItems.filter(item => item.status === 'Found').length;
    const errorItemsCount = parsedItems.length - validItemsCount;

    return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop-enter', onClick: onClose },
        React.createElement('div', { className: 'bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col modal-content-enter', onClick: e => e.stopPropagation() },
            React.createElement('div', { className: 'p-4 border-b flex justify-between items-center' },
                React.createElement('h2', { className: 'text-xl font-bold text-gray-900' }, 'Quick Order'),
                React.createElement('button', { onClick: onClose, className: 'text-gray-500 hover:text-gray-800' },
                    React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
                        React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
                    )
                )
            ),
            React.createElement('div', { className: 'flex-grow flex flex-col md:flex-row p-4 overflow-hidden gap-4' },
                React.createElement('div', { className: 'w-full md:w-1/3 flex flex-col' },
                    React.createElement('label', { htmlFor: 'quick-order-input', className: 'text-sm font-medium text-gray-700 mb-2' }, 'Paste your order below:'),
                    React.createElement('p', { className: 'text-xs text-gray-500 mb-2' }, 'Format: Style, Size, Color, Quantity'),
                    React.createElement('textarea', {
                        id: 'quick-order-input',
                        rows: 10,
                        className: 'flex-grow w-full p-2 border border-gray-300 rounded-md shadow-sm resize-none',
                        placeholder: 'e.g.\nA039,32B,SKIN,5\nF074,M,BLACK,10',
                        value: inputText,
                        onChange: e => setInputText(e.target.value)
                    }),
                     React.createElement('button', {
                        onClick: handleVerify,
                        disabled: isLoading || !inputText,
                        className: 'mt-2 w-full flex justify-center items-center py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:bg-pink-400'
                    }, isLoading ? 'Verifying...' : 'Verify Items')
                ),
                React.createElement('div', { className: 'w-full md:w-2/3 flex flex-col' },
                    React.createElement('p', { className: 'text-sm font-medium text-gray-700 mb-2' }, 'Verification Results'),
                     parsedItems.length > 0 && React.createElement('div', {className: 'text-sm mb-2'}, 
                        validItemsCount > 0 && React.createElement('span', {className: 'text-green-600'}, `✓ ${validItemsCount} valid item(s). `),
                        errorItemsCount > 0 && React.createElement('span', {className: 'text-red-600'}, `✗ ${errorItemsCount} item(s) with errors.`)
                     ),
                    React.createElement('div', { className: 'flex-grow border rounded-md overflow-auto' },
                        React.createElement('table', { className: 'w-full text-sm text-left' },
                            React.createElement('thead', { className: 'bg-gray-100 sticky top-0' },
                                React.createElement('tr', null,
                                    React.createElement('th', { className: 'p-2 font-semibold text-gray-600' }, 'Description'),
                                    React.createElement('th', { className: 'p-2 font-semibold text-gray-600' }, 'Qty'),
                                    React.createElement('th', { className: 'p-2 font-semibold text-gray-600' }, 'Status')
                                )
                            ),
                            React.createElement('tbody', null,
                                parsedItems.length === 0 ? 
                                React.createElement('tr', null, React.createElement('td', { colSpan: 3, className: 'text-center p-4 text-gray-500' }, 'Verify items to see results here.'))
                                :
                                parsedItems.map((item, index) =>
                                    React.createElement('tr', { key: index, className: `border-b ${item.status !== 'Found' ? 'bg-red-50' : ''}` },
                                        React.createElement('td', { className: 'p-2' }, 
                                            item.status === 'Found' ? `${item.style} - ${item.size} - ${item.color}` : React.createElement('span', {className: 'text-gray-500'}, item.line)
                                        ),
                                        React.createElement('td', { className: 'p-2' }, item.quantity || '-'),
                                        React.createElement('td', { className: `p-2 font-semibold ${item.status === 'Found' ? 'text-green-600' : 'text-red-600'}` }, item.status)
                                    )
                                )
                            )
                        )
                    )
                )
            ),
            React.createElement('div', { className: 'p-4 border-t flex justify-end space-x-2' },
                React.createElement('button', { onClick: onClose, className: 'px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300' }, 'Close'),
                React.createElement('button', {
                    onClick: handleAddToCart,
                    disabled: validItemsCount === 0,
                    className: 'px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:bg-gray-400'
                }, `Add ${validItemsCount} Items to Cart`)
            )
        )
    );
}

export default QuickOrderModal;