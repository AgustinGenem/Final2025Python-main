import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from './services/api';
import ReviewForm from './components/ReviewForm';
import { useCart } from './context/CartContext';
import Cart from './components/Cart';

// Cart Icon Component (Could be moved to a shared file later)
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


const ProductDetail = () => {
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isCartOpen, setCartOpen] = useState(false);
    
    const { id } = useParams();
    const { addToCart, totalItems } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                const selectedProduct = await getProductById(id);
                if (selectedProduct) {
                    setProduct(selectedProduct);
                } else {
                    setError('Producto no encontrado.');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, quantity);
        setCartOpen(true);
    };

    const handleReviewSubmitted = () => {
        setShowReviewForm(false);
        alert('¡Gracias por su reseña! Su reseña aparecerá después de la moderación.');
    };

    if (isLoading) return <div className="text-center mt-10">Cargando producto...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
    if (!product) return null;

    return (
        <div className="bg-gray-100 min-h-screen">
            <Cart isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                        <Link to="/">Tienda E-commerce</Link>
                    </h1>
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
                <div className="bg-white p-8 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div>
                        <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">Imagen no disponible</span>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h2>
                        <p className="text-sm text-gray-500 mb-4">Stock: {product.stock}</p>
                        <p className="text-3xl text-blue-600 font-bold mb-6">${product.price.toFixed(2)}</p>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <label htmlFor="quantity" className="font-semibold">Cantidad:</label>
                            <div className="flex items-center">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-1 border rounded-l-md hover:bg-gray-100">-</button>
                                <input 
                                    type="number" 
                                    id="quantity"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-16 text-center py-1 border-t border-b"
                                />
                                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3 py-1 border rounded-r-md hover:bg-gray-100">+</button>
                            </div>
                        </div>

                        <button 
                            onClick={handleAddToCart}
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
                            disabled={product.stock === 0 || quantity > product.stock}
                        >
                           {product.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                        </button>
                        {quantity > product.stock && product.stock > 0 && <p className="text-red-500 text-sm mt-2">Solo quedan {product.stock} unidades en stock.</p>}
                        
                        <div className="mt-auto pt-6">
                            <button 
                                onClick={() => setShowReviewForm(!showReviewForm)}
                                className="text-blue-500 hover:underline"
                            >
                                {showReviewForm ? 'Cancelar Reseña' : 'Dejar una reseña'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                    <div className="mt-8">
                        <ReviewForm 
                            product={product}
                            onReviewSubmit={handleReviewSubmitted}
                            onCancel={() => setShowReviewForm(false)}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProductDetail;
