
import React from 'react';
import { fetchItems, fetchStock } from '../services/firebaseService.js';
import ProductCard from './ProductCard.js';
import ProductDetailModal from './ProductDetailModal.js';
import CartSidebar from './CartSidebar.js';
import OrderHistoryModal from './OrderHistoryModal.js';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';

const ITEMS_PER_PAGE = 20;

function Dashboard() {
    const { user, logout } = useAuth();
    const { cartItems } = useCart();
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedProduct, setSelectedProduct] = React.useState(null);
    const [isCartOpen, setCartOpen] = React.useState(false);
    const [isHistoryOpen, setHistoryOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isMenuOpen, setMenuOpen] = React.useState(false);
    
    React.useEffect(() => {
        const loadData = async () => {
            try {
                const [items, stock] = await Promise.all([fetchItems(), fetchStock()]);
                const groupedProducts = groupAndProcessData(items, stock);
                setProducts(Object.values(groupedProducts));
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const groupAndProcessData = (items, stock) => {
        const stockMap = new Map();
        stock.forEach(s => {
            const key = `${s['item name']?.toUpperCase()}-${s.color?.toUpperCase()}-${s.size?.toUpperCase()}`;
            stockMap.set(key, s.quantity);
        });

        const productsMap = new Map();
        items.forEach(item => {
            const style = item.Style;
            if (!style) return;

            if (!productsMap.has(style)) {
                productsMap.set(style, {
                    style: style,
                    baseMrp: parseFloat(item.MRP.replace(/,/g, '')) || 0,
                    colors: new Set(),
                    variants: [],
                });
            }

            const product = productsMap.get(style);
            const variantStock = stockMap.get(`${style.toUpperCase()}-${item.Color?.toUpperCase()}-${item.Size?.toUpperCase()}`) || 0;
            
            product.colors.add(item.Color);
            product.variants.push({
                barcode: item.Barcode,
                color: item.Color,
                description: item.Description,
                mrp: parseFloat(item.MRP.replace(/,/g, '')) || 0,
                size: item.Size,
                stock: variantStock,
            });
        });
        
        productsMap.forEach(p => p.colors = Array.from(p.colors));
        return Object.fromEntries(productsMap);
    };

    const filteredProducts = products.filter(p => p.style.toLowerCase().includes(searchQuery.toLowerCase()));
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    if (loading) {
        return React.createElement('div', { className: 'flex items-center justify-center h-screen' }, 
            React.createElement('div', { className: 'text-lg font-semibold' }, 'Loading Products...')
        );
    }
    
    const UserMenu = () => (
        React.createElement('div', { className: 'relative' },
            React.createElement('button', { onClick: () => setMenuOpen(!isMenuOpen), className: 'flex items-center space-x-2' },
                 React.createElement('span', { className: 'text-white' }, user.name),
                 React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: `h-5 w-5 text-white transition-transform ${isMenuOpen ? 'rotate-180' : ''}`, viewBox: '0 0 20 20', fill: 'currentColor' },
                    React.createElement('path', { fillRule: 'evenodd', d: 'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z', clipRule: 'evenodd' })
                )
            ),
            isMenuOpen && React.createElement('div', { className: 'absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50' },
                React.createElement('button', { onClick: () => { setHistoryOpen(true); setMenuOpen(false); }, className: 'block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100' }, 'Order History'),
                React.createElement('button', { onClick: logout, className: 'block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100' }, 'Logout')
            )
        )
    );
    
    return React.createElement('div', { className: 'min-h-screen bg-gray-50' },
        React.createElement('header', { className: 'bg-pink-600 shadow-md sticky top-0 z-40' },
            React.createElement('div', { className: 'container mx-auto px-4 sm:px-6 lg:px-8' },
                React.createElement('div', { className: 'flex items-center justify-between h-16' },
                    React.createElement('h1', { className: 'text-2xl font-bold text-white' }, 'ENAMOR'),
                    React.createElement('div', { className: 'flex items-center space-x-4' },
                        React.createElement('input', { 
                            type: 'text', 
                            placeholder: 'Search by style...', 
                            value: searchQuery,
                            onChange: e => setSearchQuery(e.target.value),
                            className: 'hidden md:block w-64 px-3 py-1.5 rounded-md border border-pink-400 bg-pink-500 text-white placeholder-pink-200 focus:outline-none focus:ring-2 focus:ring-white'
                        }),
                        React.createElement('button', { onClick: () => setCartOpen(true), className: 'relative text-white hover:text-pink-200' },
                            React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
                                React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' })
                            ),
                            cartItems.length > 0 && React.createElement('span', { className: 'absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 bg-white text-pink-600 rounded-full text-xs font-bold' }, cartItems.length)
                        ),
                        React.createElement(UserMenu)
                    )
                )
            )
        ),
        React.createElement('main', { className: 'container mx-auto p-4 sm:p-6 lg:p-8' },
            React.createElement('div', {
                className: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6'
            }, paginatedProducts.map(product => React.createElement(ProductCard, { key: product.style, product: product, onSelect: setSelectedProduct }))),
            totalPages > 1 && React.createElement('div', { className: 'flex justify-center mt-8' },
                 Array.from({ length: totalPages }, (_, i) => i + 1).map(page => 
                    React.createElement('button', {
                        key: page,
                        onClick: () => setCurrentPage(page),
                        className: `mx-1 px-3 py-1 rounded ${currentPage === page ? 'bg-pink-600 text-white' : 'bg-white text-gray-700'}`
                    }, page)
                )
            )
        ),
        selectedProduct && React.createElement(ProductDetailModal, { product: selectedProduct, onClose: () => setSelectedProduct(null) }),
        React.createElement(CartSidebar, { isOpen: isCartOpen, onClose: () => setCartOpen(false) }),
        isHistoryOpen && React.createElement(OrderHistoryModal, { onClose: () => setHistoryOpen(false) })
    );
}

export default Dashboard;
