import React from 'react';
import { fetchItems, fetchStock } from '../services/firebaseService.js';
import { useAuth } from '../context/AuthContext.js';
import ProductCard from './ProductCard.js';
import ProductDetailModal from './ProductDetailModal.js';
import CartSidebar from './CartSidebar.js';
import OrderHistoryModal from './OrderHistoryModal.js';

function Dashboard() {
    const { user, logout } = useAuth();
    const [products, setProducts] = React.useState([]);
    const [stock, setStock] = React.useState({});
    const [loading, setLoading] = React.useState(true);
    const [selectedProduct, setSelectedProduct] = React.useState(null);
    const [isCartOpen, setCartOpen] = React.useState(false);
    const [isHistoryOpen, setHistoryOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [userMenuOpen, setUserMenuOpen] = React.useState(false);
    const itemsPerPage = 20;

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const [itemsData, stockData] = await Promise.all([fetchItems(), fetchStock()]);

                const stockMap = stockData.reduce((acc, item) => {
                    const key = `${item['item name']}-${item.color}-${item.size}`;
                    acc[key] = item.quantity;
                    return acc;
                }, {});
                setStock(stockMap);

                const productsMap = itemsData.reduce((acc, item) => {
                    const style = item.Style;
                    if (!acc[style]) {
                        acc[style] = {
                            style: style,
                            baseMrp: parseFloat(item.MRP.trim()),
                            variants: [],
                            colors: new Set()
                        };
                    }
                    acc[style].variants.push({
                        description: item.Description,
                        color: item.Color.trim(),
                        size: item.Size,
                        mrp: parseFloat(item.MRP.trim()),
                        barcode: item.Barcode
                    });
                    acc[style].colors.add(item.Color.trim());
                    return acc;
                }, {});

                const productsArray = Object.values(productsMap).map(p => ({ ...p, colors: Array.from(p.colors) }));
                setProducts(productsArray);
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredProducts = products.filter(p =>
        p.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.colors.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const UserIcon = () => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }));
    const CartIcon = () => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' }));
    
    return React.createElement('div', { className: 'min-h-screen bg-gray-50' },
        React.createElement('header', { className: 'bg-white shadow-md p-4 flex justify-between items-center' },
            React.createElement('h1', { className: 'text-2xl font-bold text-pink-600' }, 'ENAMOR'),
            React.createElement('div', { className: 'flex-1 mx-4 max-w-lg' },
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Search by style or color...',
                    className: 'w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500',
                    value: searchTerm,
                    onChange: e => { setSearchTerm(e.target.value); setCurrentPage(1); }
                })
            ),
            React.createElement('div', { className: 'flex items-center space-x-4' },
                React.createElement('button', { onClick: () => setCartOpen(true), className: 'text-gray-600 hover:text-pink-600' }, React.createElement(CartIcon)),
                React.createElement('div', { className: 'relative' },
                    React.createElement('button', { onClick: () => setUserMenuOpen(!userMenuOpen), className: 'text-gray-600 hover:text-pink-600' }, React.createElement(UserIcon)),
                    userMenuOpen && React.createElement('div', { className: 'absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20' },
                        React.createElement('a', { href: '#', onClick: (e) => { e.preventDefault(); setHistoryOpen(true); setUserMenuOpen(false); }, className: 'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100' }, 'Order History'),
                        React.createElement('a', { href: '#', onClick: (e) => { e.preventDefault(); logout(); setUserMenuOpen(false); }, className: 'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100' }, 'Logout')
                    )
                )
            )
        ),
        React.createElement('main', { className: 'p-4 md:p-8' },
            loading ?
                React.createElement('div', { className: 'flex justify-center items-center h-64' },
                    React.createElement('div', { className: 'spinner h-12 w-12 border-4 border-pink-500 border-t-transparent rounded-full' })
                ) :
                React.createElement(React.Fragment, null,
                    React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6' },
                        paginatedProducts.map(product => React.createElement(ProductCard, { key: product.style, product: product, onSelect: setSelectedProduct }))
                    ),
                    totalPages > 1 && React.createElement('div', { className: 'flex justify-center items-center mt-8 space-x-4' },
                        React.createElement('button', { onClick: () => setCurrentPage(p => Math.max(1, p - 1)), disabled: currentPage === 1, className: 'px-4 py-2 bg-white border rounded-md disabled:opacity-50 text-gray-700' }, 'Prev'),
                        React.createElement('span', { className: 'text-gray-700' }, `Page ${currentPage} of ${totalPages}`),
                        React.createElement('button', { onClick: () => setCurrentPage(p => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages, className: 'px-4 py-2 bg-white border rounded-md disabled:opacity-50 text-gray-700' }, 'Next')
                    )
                )
        ),
        selectedProduct && React.createElement(ProductDetailModal, { product: selectedProduct, stock: stock, onClose: () => setSelectedProduct(null) }),
        React.createElement(CartSidebar, { isOpen: isCartOpen, onClose: () => setCartOpen(false) }),
        isHistoryOpen && React.createElement(OrderHistoryModal, { onClose: () => setHistoryOpen(false) })
    );
}

export default Dashboard;