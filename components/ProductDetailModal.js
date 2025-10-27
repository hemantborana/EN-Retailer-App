
import React from 'react';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';
import { getStyleForColor } from '../types.js';

function ProductDetailModal({ product, stock, onClose }) {
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const [quantities, setQuantities] = React.useState({});
    const [selectedColor, setSelectedColor] = React.useState(product.colors[0]);

    const handleQuantityChange = (barcode, value) => {
        const quantity = parseInt(value, 10);
        setQuantities(prev => ({ ...prev, [barcode]: isNaN(quantity) ? '' : quantity }));
    };

    const handleAddToCart = () => {
        let itemsAdded = 0;
        const variantsForColor = product.variants.filter(v => v.color === selectedColor.code);

        variantsForColor.forEach(variant => {
            const quantity = quantities[variant.barcode];
            if (quantity > 0) {
                addToCart({
                    style: product.style,
                    description: variant.description,
                    color: variant.color,
                    size: variant.size,
                    mrp: variant.mrp,
                    barcode: variant.barcode,
                    quantity: quantity
                });
                itemsAdded += 1;
            }
        });

        if (itemsAdded > 0) {
            showToast(`${itemsAdded} item(s) added to cart.`);
            setQuantities({});
        } else {
            showToast('Please enter a quantity.', 'error');
        }
    };

    const variantsForColor = product.variants.filter(v => v.color === selectedColor.code);
    const MinusIcon = () => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-4 w-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 }, React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M18 12H6' }));
    const PlusIcon = () => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-4 w-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 }, React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 6v12m6-6H6' }));

    return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop-enter', onClick: onClose },
        React.createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col modal-content-enter', onClick: e => e.stopPropagation() },
            React.createElement('div', { className: 'p-4 border-b dark:border-gray-700' },
                React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100' }, product.style),
                React.createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-400' }, product.description),
                React.createElement('div', { className: 'flex flex-wrap items-center gap-3 mt-3' },
                    product.colors.map(color => {
                        const { style: baseStyle, isDefault } = getStyleForColor(color.code);
                        const style = (baseStyle.background && (baseStyle.background.startsWith('url') || baseStyle.background.startsWith('linear')))
                            ? { ...baseStyle, backgroundSize: 'cover', backgroundPosition: 'center' }
                            : baseStyle;
                            
                        return React.createElement('button', {
                            key: color.code,
                            title: color.name,
                            onClick: () => setSelectedColor(color),
                            className: `h-10 w-10 rounded-md border-2 transition-all duration-200 text-[10px] font-bold flex items-center justify-center ${selectedColor.code === color.code ? 'border-pink-500 ring-2 ring-pink-500 scale-110' : 'border-gray-300 dark:border-gray-600 hover:border-pink-400'}`,
                            style: style,
                        }, isDefault ? React.createElement('span', { className: 'text-gray-600 bg-white/50 rounded-sm px-1' }, color.code.substring(0, 3)) : null);
                    })
                )
            ),
            React.createElement('div', { className: 'flex-grow overflow-y-auto p-4' },
                React.createElement('div', { className: 'text-gray-800 dark:text-gray-200' },
                    React.createElement('p', { className: 'font-semibold' }, `Color: ${selectedColor.name}`),
                    React.createElement('p', { className: 'text-xs text-gray-500 dark:text-gray-400 mt-1' }, '*Stock levels are an estimate. You may order more than the available quantity.')
                ),
                React.createElement('table', { className: 'w-full mt-4 text-sm text-left text-gray-800 dark:text-gray-200' },
                    React.createElement('thead', null,
                        React.createElement('tr', { className: 'bg-gray-100 dark:bg-gray-700' },
                            React.createElement('th', { className: 'p-2 font-semibold text-gray-600 dark:text-gray-300' }, 'Size'),
                            React.createElement('th', { className: 'p-2 font-semibold text-gray-600 dark:text-gray-300' }, 'MRP'),
                            React.createElement('th', { className: 'p-2 font-semibold text-gray-600 dark:text-gray-300' }, 'Stock'),
                            React.createElement('th', { className: 'p-2 font-semibold text-gray-600 dark:text-gray-300' }, 'Order Qty')
                        )
                    ),
                    React.createElement('tbody', null,
                        variantsForColor.map(variant => {
                            const stockKey = `${product.style}-${variant.color}-${variant.size}`;
                            const availableStock = stock[stockKey] || 0;
                            const currentQuantity = Number(quantities[variant.barcode] || 0);
                            return React.createElement('tr', { key: variant.barcode, className: 'border-b dark:border-gray-700' },
                                React.createElement('td', { className: 'p-2' }, variant.size),
                                React.createElement('td', { className: 'p-2' }, `₹${variant.mrp.toFixed(2)}`),
                                React.createElement('td', { className: 'p-2' }, availableStock),
                                React.createElement('td', { className: 'p-2' },
                                    React.createElement('div', { className: 'flex items-center w-32' },
                                        React.createElement('button', {
                                            onClick: () => handleQuantityChange(variant.barcode, String(Math.max(0, currentQuantity - 1))),
                                            className: 'p-2 text-gray-600 dark:text-gray-300 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none'
                                        }, React.createElement(MinusIcon)),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 0,
                                            value: quantities[variant.barcode] || '',
                                            onChange: e => handleQuantityChange(variant.barcode, e.target.value),
                                            className: 'w-full text-center border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-pink-500 py-2'
                                        }),
                                        React.createElement('button', {
                                            onClick: () => handleQuantityChange(variant.barcode, String(currentQuantity + 1)),
                                            className: 'p-2 text-gray-600 dark:text-gray-300 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none'
                                        }, React.createElement(PlusIcon))
                                    )
                                )
                            );
                        })
                    )
                )
            ),
            React.createElement('div', { className: 'p-4 border-t dark:border-gray-700 flex justify-end space-x-2' },
                React.createElement('button', { onClick: onClose, className: 'px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500' }, 'Close'),
                React.createElement('button', { onClick: handleAddToCart, className: 'px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700' }, 'Add to Cart')
            )
        )
    );
}

export default ProductDetailModal;