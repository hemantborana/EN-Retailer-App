import React from 'react';
import type { Product } from '../types';
import { getStyleForColor } from '../types';

interface ProductCardProps {
    product: Product;
    onSelect: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
    const visibleColors = product.colors.slice(0, 5);

    return (
        <div 
            onClick={onSelect}
            className="group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
        >
            <div className="relative w-full aspect-[4/5] bg-gray-100 flex items-center justify-center overflow-hidden">
                <span className="font-bold text-3xl text-gray-400 group-hover:text-brand-primary transition-colors duration-300">{product.style}</span>
            </div>
            <div className="p-3 md:p-4 border-t border-gray-100 flex-grow flex flex-col justify-between">
                <div>
                    <h3 className="text-base md:text-lg font-semibold text-brand-text truncate">{product.style}</h3>
                    <p className="text-sm md:text-md font-bold text-brand-primary mt-1">
                        ₹{product.baseMrp.toFixed(2)}
                    </p>
                </div>
                <div className="mt-3">
                     <p className="text-xs text-brand-text-light mb-2">{product.colors.length} {product.colors.length === 1 ? 'Color' : 'Colors'} Available</p>
                     <div className="flex items-center space-x-1.5">
                        {visibleColors.map(color => (
                            <div 
                                key={color}
                                className="h-4 w-4 rounded-full border border-gray-300"
                                style={getStyleForColor(color)}
                                title={color}
                            />
                        ))}
                        {product.colors.length > 5 && (
                             <div className="text-xs text-gray-500 ml-1">+{product.colors.length - 5}</div>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
