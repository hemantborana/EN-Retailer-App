import React from 'react';
import { fetchItems, fetchStock } from '../services/firebaseService.js';
import { saveData, loadData as loadDataFromDB } from '../services/indexedDB.js';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';
import ProductCard from './ProductCard.js';
import ProductDetailModal from './ProductDetailModal.js';
import CartSidebar from './CartSidebar.js';
import OrderHistoryModal from './OrderHistoryModal.js';
import OrderSuccessModal from './OrderSuccessModal.js';
import QuickOrderModal from './QuickOrderModal.js';

function Dashboard() {
    const { user, logout } = useAuth();
    const { cartItems } = useCart();
    const { showToast } = useToast();
    const [products, setProducts] = React.useState([]);
    const [stock, setStock] = React.useState({});
    const [loading, setLoading] = React.useState(true);
    const [selectedProduct, setSelectedProduct] = React.useState(null);
    const [isCartOpen, setCartOpen] = React.useState(false);
    const [isHistoryOpen, setHistoryOpen] = React.useState(false);
    const [isQuickOrderOpen, setQuickOrderOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [userMenuOpen, setUserMenuOpen] = React.useState(false);
    const [successfulOrder, setSuccessfulOrder] = React.useState(null);
    const [categories, setCategories] = React.useState([]);
    const [selectedCategory, setSelectedCategory] = React.useState('all');
    const itemsPerPage = 20;

    const bestSellerStyles = new Set(['A039', 'A042', 'F074', 'SB06', 'TS09', 'BR08', 'CR17', 'A032']);
    
    React.useEffect(() => {
        const processAndSetData = (itemsData, stockData) => {
            const stockMap = stockData.reduce((acc, item) => {
                if (!item || !item['item name'] || typeof item.color === 'undefined' || typeof item.size === 'undefined') return acc;
                const key = `${item['item name']}-${item.color}-${item.size}`;
                acc[key] = item.quantity;
                return acc;
            }, {});

            const productsMap = itemsData.reduce((acc, item) => {
                if (!item || !item.Style) return acc;
                const style = item.Style;
                const mrp = parseFloat(String(item.MRP || 0).trim().replace(/,/g, ''));

                if (!acc[style]) {
                    acc[style] = {
                        style: style,
                        minMrp: mrp,
                        maxMrp: mrp,
                        category: item["Cat'ry"],
                        variants: [],
                        colors: new Map(),
                    };
                } else {
                    acc[style].minMrp = Math.min(acc[style].minMrp, mrp);
                    acc[style].maxMrp = Math.max(acc[style].maxMrp, mrp);
                }
                
                const colorCode = String(item.Color || '').trim();
                const colorName = String(item['Color Name'] || colorCode).trim();
                const description = item.Description || '';

                if (acc[style].variants.length === 0) acc[style].description = description;

                acc[style].variants.push({
                    description: description, color: colorCode, colorName: colorName,
                    size: item.Size, mrp: mrp,
                    barcode: item.Barcode
                });

                if (!acc[style].colors.has(colorCode)) {
                    acc[style].colors.set(colorCode, { code: colorCode, name: colorName });
                }
                return acc;
            }, {});

            const productsArray = Object.values(productsMap).map(p => ({ 
                ...p, 
                colors: Array.from(p.colors.values()),
            }));
            
            const sortedProducts = productsArray.sort((a, b) => {
                const aIsBest = bestSellerStyles.has(a.style);
                const bIsBest = bestSellerStyles.has(b.style);
                if (aIsBest && !bIsBest) return -1;
                if (!aIsBest && bIsBest) return 1;
                return a.style.localeCompare(b.style);
            });

            const allCategories = [...new Set(itemsData.map(item => item && item["Cat'ry"]).filter(Boolean))];
            
            setProducts(sortedProducts);
            setStock(stockMap);
            setCategories(['all', ...allCategories.sort()]);
        };

        const loadInitialData = async () => {
            setLoading(true);
            try {
                const [cachedItems, cachedStock] = await Promise.all([
                    loadDataFromDB('products'), loadDataFromDB('stock')
                ]);
                
                if (cachedItems && cachedStock) {
                    processAndSetData(cachedItems, cachedStock);
                    setLoading(false);
                }

                const [itemsData, stockData] = await Promise.all([
                    fetchItems(), fetchStock()
                ]);
                
                const hasChanges = JSON.stringify(cachedItems) !== JSON.stringify(itemsData) ||
                                   JSON.stringify(cachedStock) !== JSON.stringify(stockData);
                
                if (hasChanges || !cachedItems || !cachedStock) {
                    processAndSetData(itemsData, stockData);
                    await Promise.all([
                        saveData('products', itemsData), saveData('stock', stockData)
                    ]);
                }
            } catch (error) {
                console.error("Failed to load data:", error);
                showToast("Error loading data. Please refresh.", "error");
            } finally {
                if (loading) setLoading(false);
            }
        };

        loadInitialData();
    }, [showToast]);

    const handleSearch = () => {
        setCurrentPage(1);
    };
    
    const filteredProducts = React.useMemo(() => products.filter(p => {
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        if (!matchesCategory) return false;

        if (searchTerm.trim()) {
            const searchTermLower = searchTerm.toLowerCase();
            return p.style.toLowerCase().includes(searchTermLower) ||
                   p.colors.some(c => c.name.toLowerCase().includes(searchTermLower)) ||
                   (p.description && p.description.toLowerCase().includes(searchTermLower));
        }
        return true;
    }), [products, selectedCategory, searchTerm]);

    const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const totalCartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const UserIcon = () => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }));
    const CartIcon = () => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' }));
    const SearchIcon = () => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement('path', { fillRule: "evenodd", d: "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z", clipRule: "evenodd" }));
    const QuickOrderIcon = () => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, 
        React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M13 10V3L4 14h7v7l9-11h-7z' })
    );

    const searchInput = React.createElement('div', { className: 'relative w-full' },
        React.createElement('input', {
            type: 'text',
            placeholder: 'Search by style, color, or description...',
            className: 'w-full pl-4 pr-12 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500',
            value: searchTerm,
            onChange: e => setSearchTerm(e.target.value),
            onKeyDown: e => e.key === 'Enter' && handleSearch()
        }),
        React.createElement('button', {
            onClick: handleSearch,
            className: 'absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-500 hover:text-pink-600'
        }, React.createElement(SearchIcon))
    );

    const categoryFilter = React.createElement('select', {
        value: selectedCategory,
        onChange: e => { setSelectedCategory(e.target.value); setCurrentPage(1); },
        className: 'w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white'
    }, categories.map(cat => React.createElement('option', { key: cat, value: cat }, cat === 'all' ? 'All Categories' : cat)));
    

    return React.createElement('div', { className: 'min-h-screen bg-gray-50' },
        React.createElement('header', { className: 'bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 sm:px-6 py-2 flex justify-between items-center sticky top-0 z-30' },
            React.createElement('div', { className: 'flex items-center space-x-3' },
                React.createElement('img', { src: 'components/HC_LOGO_-_Copy-removebg-preview.webp', alt: 'Kambeshwar Agencies Logo', className: 'h-12 w-auto' }),
                React.createElement('h1', { className: 'text-2xl font-bold text-gray-800 hidden lg:block' }, 'Kambeshwar Agencies')
            ),
            React.createElement('div', { className: 'hidden md:flex flex-1 mx-4 max-w-lg' }, searchInput),
            React.createElement('div', { className: 'flex items-center space-x-2 sm:space-x-4' },
                React.createElement('div', { className: 'hidden sm:block text-right' },
                    React.createElement('p', { className: 'text-sm font-semibold text-gray-800 truncate max-w-[150px]', title: user.name }, user.name),
                    React.createElement('p', { className: 'text-xs text-gray-500' }, 'Retailer Portal')
                ),
                React.createElement('div', { className: 'h-8 w-px bg-gray-200 hidden sm:block' }),
                React.createElement('button', { onClick: () => setQuickOrderOpen(true), className: 'p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-pink-600 transition-colors', title: 'Quick Order' },
                    React.createElement(QuickOrderIcon)
                ),
                React.createElement('div', { className: 'relative' },
                    React.createElement('button', { onClick: () => setCartOpen(true), className: 'p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-pink-600 transition-colors' }, React.createElement(CartIcon)),
                    totalCartQuantity > 0 && React.createElement('span', { className: 'absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white' }, totalCartQuantity)
                ),
                React.createElement('div', { className: 'relative' },
                    React.createElement('button', { onClick: () => setUserMenuOpen(!userMenuOpen), className: 'p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-pink-600 transition-colors' }, React.createElement(UserIcon)),
                    userMenuOpen && React.createElement('div', { className: 'absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5' },
                         React.createElement('div', { className: 'sm:hidden px-4 py-3 border-b' },
                            React.createElement('p', { className: 'text-sm font-semibold text-gray-800 truncate' }, user.name),
                            React.createElement('p', { className: 'text-xs text-gray-500' }, 'Retailer Portal')
                        ),
                        React.createElement('a', { href: '#', onClick: (e) => { e.preventDefault(); setHistoryOpen(true); setUserMenuOpen(false); }, className: 'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100' }, 'Order History'),
                        React.createElement('a', { href: '#', onClick: (e) => { e.preventDefault(); logout(); setUserMenuOpen(false); }, className: 'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100' }, 'Logout')
                    )
                )
            )
        ),
        
        React.createElement('div', { className: 'md:hidden p-4 bg-gray-100 border-b space-y-4' },
            searchInput,
            React.createElement('div', { className: 'max-w-xs mx-auto'}, categoryFilter)
        ),

        React.createElement('main', { className: 'p-4 md:p-8' },
            React.createElement('div', { className: 'mb-6 space-y-4' },
                React.createElement('div', { className: 'hidden md:flex items-center max-w-xs' },
                    categoryFilter
                )
            ),
            loading ?
                React.createElement('div', { className: 'flex justify-center items-center h-64' },
                    React.createElement('div', { className: 'spinner h-12 w-12 border-4 border-pink-500 border-t-transparent rounded-full' })
                ) :
                React.createElement(React.Fragment, null,
                    paginatedProducts.length === 0 ? 
                    React.createElement('div', {className: 'text-center py-10'},
                         React.createElement('p', {className: 'text-gray-500'}, 'No products match your criteria.')
                    )
                    :
                    React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6' },
                        paginatedProducts.map(product => React.createElement(ProductCard, {
                            key: product.style,
                            product: product,
                            onSelect: setSelectedProduct,
                            isBestSeller: bestSellerStyles.has(product.style)
                        }))
                    ),
                    totalPages > 1 && React.createElement('div', { className: 'flex justify-center items-center mt-8 space-x-4' },
                        React.createElement('button', { onClick: () => setCurrentPage(p => Math.max(1, p - 1)), disabled: currentPage === 1, className: 'px-4 py-2 bg-white border rounded-md disabled:opacity-50 text-gray-700' }, 'Prev'),
                        React.createElement('span', { className: 'text-gray-700' }, `Page ${currentPage} of ${totalPages}`),
                        React.createElement('button', { onClick: () => setCurrentPage(p => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages, className: 'px-4 py-2 bg-white border rounded-md disabled:opacity-50 text-gray-700' }, 'Next')
                    )
                )
        ),
        selectedProduct && React.createElement(ProductDetailModal, { product: selectedProduct, stock: stock, onClose: () => setSelectedProduct(null) }),
        React.createElement(CartSidebar, { isOpen: isCartOpen, onClose: () => setCartOpen(false), onOrderSuccess: setSuccessfulOrder }),
        isHistoryOpen && React.createElement(OrderHistoryModal, { onClose: () => setHistoryOpen(false) }),
        successfulOrder && React.createElement(OrderSuccessModal, { order: successfulOrder, onClose: () => setSuccessfulOrder(null) }),
        isQuickOrderOpen && React.createElement(QuickOrderModal, { products: products, onClose: () => setQuickOrderOpen(false) })
    );
}

export default Dashboard;