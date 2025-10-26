import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { FirebaseItem, StockItem, Product, ProductVariant } from '../types';
import { fetchItems, fetchStock } from '../services/firebaseService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import CartSidebar from './CartSidebar';
import OrderHistoryModal from './OrderHistoryModal';

// --- ICONS ---
const CartIcon = ({ count }: { count: number }) => (
    <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 group-hover:text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-brand-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{count}</span>
        )}
    </div>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const Spinner = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>
    </div>
);

// --- USER DROPDOWN ---
const UserDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100">
                <UserIcon />
                <span className="hidden md:block text-sm font-medium">{user.name}</span>
                 <svg className="h-4 w-4 hidden md:block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    <div className="px-4 py-2 text-sm text-gray-700 md:hidden">
                        <p className="font-semibold">{user.name}</p>
                    </div>
                     <div className="md:hidden border-t border-gray-100"></div>
                    <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Logout
                    </a>
                </div>
            )}
        </div>
    );
}

const ITEMS_PER_PAGE = 20;

const Dashboard: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isOrdersOpen, setIsOrdersOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const { user } = useAuth();
    const { totalItems } = useCart();

    const processData = useCallback((items: FirebaseItem[], stock: StockItem[]) => {
        // ... (data processing logic is unchanged)
        const stockMap = new Map<string, number>();
        stock.forEach(s => {
            const key = `${s['item name']}-${s.color.toUpperCase()}-${s.size.toUpperCase()}`;
            stockMap.set(key, s.quantity);
        });

        const productMap = new Map<string, { variants: ProductVariant[], colors: Set<string> }>();
        items.forEach(item => {
            if (!item.Style || !item.Color || !item.Size || !item.MRP) return;

            const style = item.Style.trim();
            if (!productMap.has(style)) {
                productMap.set(style, { variants: [], colors: new Set() });
            }

            const mrp = parseFloat(item.MRP.trim().replace(/,/g, ''));
            const color = item.Color.trim().toUpperCase();
            const size = item.Size.trim().toUpperCase();
            
            const stockKey = `${style}-${color}-${size}`;
            const variant: ProductVariant = {
                barcode: item.Barcode,
                color,
                description: item.Description,
                mrp: isNaN(mrp) ? 0 : mrp,
                size,
                stock: stockMap.get(stockKey) || 0,
            };

            const productEntry = productMap.get(style)!;
            productEntry.variants.push(variant);
            productEntry.colors.add(color);
        });

        const processedProducts: Product[] = Array.from(productMap.entries()).map(([style, data]) => {
            const baseMrp = data.variants.length > 0 ? data.variants[0].mrp : 0;
            return {
                style,
                baseMrp,
                colors: Array.from(data.colors),
                variants: data.variants.sort((a,b) => a.size.localeCompare(b.size)),
            };
        });

        setProducts(processedProducts);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const [items, stock] = await Promise.all([fetchItems(), fetchStock()]);
                processData(items, stock);
            } catch (err) {
                console.error("Failed to load data:", err);
                setError("Failed to load product data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [processData]);

    const filteredProducts = useMemo(() => {
        setCurrentPage(1); // Reset page on search
        if (!searchTerm) return products;
        return products.filter(p => p.style.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    return (
        <div className="min-h-screen bg-brand-background">
            <header className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="text-2xl font-bold text-brand-primary">enamor</div>
                        <div className="flex-1 max-w-lg mx-4">
                            <input
                                type="text"
                                placeholder="Search by style (e.g., A039)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-full focus:ring-brand-primary focus:border-brand-primary"
                            />
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <button onClick={() => setIsOrdersOpen(true)} className="text-sm font-medium text-gray-600 hover:text-brand-primary p-2 rounded-full hover:bg-gray-100">My Orders</button>
                            <button onClick={() => setIsCartOpen(true)} className="group p-2 rounded-full hover:bg-gray-100">
                                <CartIcon count={totalItems} />
                            </button>
                            <UserDropdown />
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {isLoading ? (
                    <div className="pt-20"><Spinner /></div>
                ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                            {paginatedProducts.map(product => (
                                <ProductCard key={product.style} product={product} onSelect={() => setSelectedProduct(product)} />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-8 space-x-4">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                         {filteredProducts.length === 0 && !isLoading && (
                            <div className="text-center py-16">
                                <h3 className="text-xl font-semibold text-gray-700">No products found</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your search term.</p>
                            </div>
                         )}
                    </>
                )}
            </main>

            {selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}

            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            {isOrdersOpen && <OrderHistoryModal onClose={() => setIsOrdersOpen(false)} />}
        </div>
    );
};

export default Dashboard;
