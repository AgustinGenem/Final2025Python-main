import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from './services/api';
import { useCart } from './context/CartContext';
import Cart from './components/Cart';

// Cart Icon Component
const CartIcon = ({ count, onClick }) => (
    <button onClick={onClick} className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {count}
            </span>
        )}
    </button>
);


const ClientView = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart, totalItems } = useCart();
    const [isCartOpen, setCartOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const productsData = await getProducts();
                setProducts(productsData || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddToCart = (e, product) => {
        e.preventDefault(); // Prevent navigation
        addToCart(product);
        setCartOpen(true); // Open cart on adding item
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Cart isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Tienda E-commerce</h1>
                    <nav className="flex items-center gap-4">
                        <CartIcon count={totalItems} onClick={() => setCartOpen(true)} />
                        <Link to="/admin">
                            <button className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 transition">
                                Administrador
                            </button>
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="container mx-auto px-6 py-8">
                <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-10">Nuestro Catálogo</h2>
                {isLoading && <p className="text-center">Cargando productos...</p>}
                {error && <p className="text-center text-red-500">Error: {error}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {products.map(product => (
                        <div key={product.id_key} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                            <Link to={`/products/${product.id_key}`} className="group block">
                                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500">Imagen no disponible</span>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 truncate group-hover:text-indigo-600">{product.name}</h3>
                                    <p className="text-lg text-blue-600 font-semibold mb-2">${product.price.toFixed(2)}</p>
                                    <p className="text-sm text-gray-600 mb-4">Stock: {product.stock}</p>
                                </div>
                            </Link>
                            <div className="p-6 pt-0 mt-auto">
                                <button 
                                    onClick={(e) => handleAddToCart(e, product)}
                                    className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
                                    disabled={product.stock === 0}
                                >
                                    {product.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default ClientView;
