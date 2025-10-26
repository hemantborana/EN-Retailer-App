
import React from 'react';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';
import { getStyleForColor } from '../types.js';

function ProductDetailModal({ product, onClose }) {
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const [selectedColor, setSelectedColor] = React.useState(product.colors[0]);
    const [quantities, setQuantities] = React.useState({});

    const handleQuantityChange = (barcode, value) => {
        const newQuantities = { ...quantities };
        newQuantities[barcode] = parseInt(value, 10) || 0;
        setQuantities(newQuantities);
    };

    const handleAddToCart = () => {
        let itemsAdded = 0;
        Object.entries(quantities).forEach(([barcode, quantity]) => {
            if (quantity > 0) {
                const variant = product.variants.find(v => v.barcode === barcode);
                if (variant) {
                    addToCart({
                        style: product.style,
                        barcode: variant.barcode,
                        description: variant.description,
                        mrp: variant.mrp,
                        quantity: quantity
                    });
                    itemsAdded += quantity;
                }
            }
        });

        if (itemsAdded > 0) {
            showToast(`${itemsAdded} item(s) added to cart!`);
            onClose();
        } else {
            showToast('Please enter a quantity.', 'error');
        }
    };
    
    const variantsForSelectedColor = product.variants
        .filter(v => v.color === selectedColor)
        .sort((a,b) => a.size.localeCompare(b.size, undefined, {numeric: true}));

    return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4', onClick: onClose },
        React.createElement('div', { className: 'bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col', onClick: e => e.stopPropagation() },
            React.createElement('div', { className: 'p-4 border-b flex justify-between items-center' },
                React.createElement('h2', { className: 'text-2xl font-bold' }, product.style),
                React.createElement('button', { onClick: onClose, className: 'text-gray-500 hover:text-gray-800' },
                    React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
                        React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
                    )
                )
            ),
            React.createElement('div', { className: 'p-4' },
                 React.createElement('h3', { className: 'text-sm font-semibold text-gray-600 mb-2' }, 'Color'),
                 React.createElement('div', { className: 'flex flex-wrap gap-2 mb-4' },
                    product.colors.map(color =>
                        React.createElement('button', {
                            key: color, onClick: () => setSelectedColor(color),
                            className: `h-8 w-8 rounded-full border-2 transition ${selectedColor === color ? 'border-pink-500 ring-2 ring-pink-500' : 'border-gray-300'}`
                        }, React.createElement('div', {className: 'h-full w-full rounded-full', style: getStyleForColor(color) }))
                    )
                )
            ),
            React.createElement('div', { className: 'p-4 overflow-y-auto' },
                React.createElement('div', { className: 'grid grid-cols-3 gap-x-4 gap-y-2 text-sm font-semibold text-gray-500 mb-2' },
                    React.createElement('span', null, 'Size'),
                    React.createElement('span', { className: 'text-center' }, 'Stock'),
                    React.createElement('span', { className: 'text-center' }, 'Order Qty')
                ),
                variantsForSelectedColor.map(variant =>
                     React.createElement('div', { key: variant.barcode, className: 'grid grid-cols-3 gap-x-4 items-center py-2 border-b' },
                        React.createElement('span', { className: 'font-medium' }, variant.size),
                        React.createElement('span', { className: `text-center font-bold ${variant.stock > 0 ? 'text-green-600' : 'text-red-500'}` }, variant.stock),
                        React.createElement('input', {
                            type: 'number',
                            min: 0,
                            max: variant.stock,
                            value: quantities[variant.barcode] || '',
                            onChange: e => handleQuantityChange(variant.barcode, e.target.value),
                            className: 'w-full text-center border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500'
                        })
                    )
                )
            ),
            React.createElement('div', { className: 'p-4 border-t mt-auto' },
                React.createElement('button', {
                    onClick: handleAddToCart,
                    className: 'w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 transition'
                }, 'Add to Cart')
            )
        )
    );
}

export default ProductDetailModal;
