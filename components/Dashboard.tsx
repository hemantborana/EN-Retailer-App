import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { User } from '../App';
import type { FirebaseItem, StockItem, Product, ProductVariant } from '../types';
import { fetchItems, fetchStock } from '../services/firebaseService';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import CartSidebar from './CartSidebar';
import OrderHistoryModal from './OrderHistoryModal';

// Icons
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


interface DashboardProps {
    user: User;
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isOrdersOpen, setIsOrdersOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { totalItems } = useCart();

    const processData = useCallback((items: FirebaseItem[], stock: StockItem[]) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        return products.filter(p => p.style.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

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
                        <div className="flex items-center space-x-4 md:space-x-6">
                            <button onClick={() => setIsOrdersOpen(true)} className="hidden md:block text-sm font-medium text-gray-600 hover:text-brand-primary">My Orders</button>
                            <button onClick={() => setIsCartOpen(true)} className="group">
                                <CartIcon count={totalItems} />
                            </button>
                            <div className="hidden md:flex items-center space-x-2">
                                <UserIcon />
                                <span className="text-sm font-medium">{user.name}</span>
                                <button onClick={onLogout} className="text-sm text-brand-text-light hover:underline">(Logout)</button>
                            </div>
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.style} product={product} onSelect={() => setSelectedProduct(product)} />
                        ))}
                    </div>
                )}
            </main>

            {selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}

            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            {isOrdersOpen && <OrderHistoryModal user={user} onClose={() => setIsOrdersOpen(false)} />}
        </div>
    );
};

export default Dashboard;
