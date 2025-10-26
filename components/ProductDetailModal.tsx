import React, { useState, useMemo, useEffect } from 'react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { getStyleForColor, colorMap } from '../types';

interface ProductDetailModalProps {
    product: Product;
    onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
    const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    const { addToCart } = useCart();

    const handleAddToCart = () => {
        if (!selectedVariant) return;

        addToCart({
            style: product.style,
            barcode: selectedVariant.barcode,
            description: selectedVariant.description,
            mrp: selectedVariant.mrp,
            quantity: quantity,
        });
        onClose();
    };
    
    const sizesForSelectedColor = useMemo(() => {
        return product.variants
            .filter(v => v.color === selectedColor)
            .map(v => v.size);
    }, [product.variants, selectedColor]);

    const selectedVariant = useMemo(() => {
        if (!selectedSize || !selectedColor) return null;
        return product.variants.find(v => v.color === selectedColor && v.size === selectedSize) || null;
    }, [product.variants, selectedColor, selectedSize]);
    
    // Reset size when color changes
    useEffect(() => {
        setSelectedSize(null);
        setQuantity(1);
    }, [selectedColor]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-start p-5 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-brand-text">{product.style}</h2>
                        <p className="text-xl font-semibold text-brand-primary mt-1">₹{selectedVariant?.mrp.toFixed(2) || product.baseMrp.toFixed(2)}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 p-2 -mt-2 -mr-2 rounded-full hover:bg-gray-100 transition">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <h3 className="text-md font-medium text-gray-900 mb-3">Color: <span className="font-semibold">{selectedColor}</span></h3>
                        <div className="flex flex-wrap gap-3">
                            {product.colors.map(color => (
                                <button 
                                    key={color} 
                                    onClick={() => setSelectedColor(color)}
                                    title={color}
                                    className={`h-10 w-10 rounded-full border-2 transition-transform transform hover:scale-110 focus:outline-none ${selectedColor === color ? 'border-brand-primary scale-110 ring-2 ring-brand-primary ring-offset-2' : 'border-gray-300'}`}
                                    style={getStyleForColor(color)}
                                >
                                  {colorMap[color.toUpperCase()] === '#FFFFFF' && <span className={`text-xs ${selectedColor === color ? 'text-brand-primary' : 'text-gray-400'}`}>✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-md font-medium text-gray-900 mb-3">Size</h3>
                        <div className="flex flex-wrap gap-2">
                             {sizesForSelectedColor.map(size => (
                                <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2 text-sm border rounded-lg transition ${selectedSize === size ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'}`}>
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {selectedVariant && (
                       <p className={`text-sm font-medium ${selectedVariant.stock > 5 ? 'text-green-600' : selectedVariant.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                           {selectedVariant.stock > 10 ? 'Available' : selectedVariant.stock > 0 ? `Only ${selectedVariant.stock} left` : 'Out of stock'}
                       </p>
                    )}
                     {!selectedSize && sizesForSelectedColor.length > 0 && (
                        <p className="text-sm text-brand-text-light animate-pulse">Please select a size.</p>
                     )}
                </div>
                
                <div className="mt-auto p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-3 text-gray-600 rounded-l-lg hover:bg-gray-200 transition">-</button>
                            <span className="w-12 text-center font-semibold text-brand-text">{quantity}</span>
                            <button onClick={() => setQuantity(q => Math.max(1, q + 1))} className="px-4 py-3 text-gray-600 rounded-r-lg hover:bg-gray-200 transition">+</button>
                        </div>
                        <button 
                            onClick={handleAddToCart}
                            disabled={!selectedVariant || selectedVariant.stock === 0}
                            className="flex-1 bg-brand-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
