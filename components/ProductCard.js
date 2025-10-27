import React from 'react';
import { getStyleForColor } from '../types.js';

function ProductCard({ product, onSelect, isBestSeller }) {
    const displayedColors = product.colors.slice(0, 5);

    const priceDisplay = product.minMrp === product.maxMrp
        ? `₹${product.minMrp.toFixed(2)}`
        : `₹${product.minMrp.toFixed(2)} - ₹${product.maxMrp.toFixed(2)}`;

    return React.createElement('div', {
        onClick: () => onSelect(product),
        className: 'relative bg-white rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col'
    },
        React.createElement('div', { className: 'p-4 flex-grow' },
            React.createElement('div', { className: 'flex justify-between items-start gap-2' },
                 React.createElement('h3', { 
                     className: 'text-base sm:text-lg font-bold text-gray-800 truncate' 
                    }, product.style),
                 isBestSeller && React.createElement('div', {
                    className: 'bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full flex-shrink-0'
                }, 'Best Seller')
            ),
            React.createElement('p', { 
                className: 'text-xs sm:text-sm text-gray-500 whitespace-nowrap mt-1' 
            }, priceDisplay)
        ),
        product.colors.length > 0 && React.createElement('div', { className: 'flex items-center p-2 bg-gray-50 border-t space-x-1.5' },
            displayedColors.map(color => {
                const { style: baseStyle, isDefault } = getStyleForColor(color.code);
                const style = (baseStyle.background && (baseStyle.background.startsWith('url') || baseStyle.background.startsWith('linear')))
                    ? { ...baseStyle, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : baseStyle;

                return React.createElement('div', {
                    key: color.code,
                    title: color.name,
                    className: 'h-6 w-6 rounded-md border border-gray-200 shadow-sm text-[8px] font-bold flex items-center justify-center',
                    style: style
                }, isDefault ? React.createElement('span', { className: 'bg-white/50 px-0.5 rounded-sm' }, color.code.substring(0, 3)) : null);
            })
        )
    );
}

export default ProductCard;