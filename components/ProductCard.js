
import React from 'react';
import { getStyleForColor } from '../types.js';

function ProductCard({ product, onSelect, isBestSeller }) {
    const displayedColors = product.colors.slice(0, 5);

    return React.createElement('div', {
        onClick: () => onSelect(product),
        className: 'relative bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden flex flex-col'
    },
        isBestSeller && React.createElement('div', {
            className: 'absolute top-2 right-2 bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full z-10'
        }, 'Best Seller'),
        React.createElement('div', { className: 'p-4 flex-grow' },
            React.createElement('h3', { className: 'text-lg font-bold text-gray-800 truncate' }, product.style),
            React.createElement('p', { className: 'text-sm text-gray-500' }, `₹${product.baseMrp.toFixed(2)}`)
        ),
        product.colors.length > 0 && React.createElement('div', { className: 'flex items-center p-2 bg-gray-50 border-t' },
            displayedColors.map(color => {
                const { style, isDefault } = getStyleForColor(color.code);
                return React.createElement('div', {
                    key: color.code,
                    className: 'h-5 w-5 rounded-full border-2 border-white shadow-sm -ml-1 text-[8px] font-bold',
                    style: style
                }, isDefault ? color.code.substring(0, 3) : null);
            })
        )
    );
}

export default ProductCard;
