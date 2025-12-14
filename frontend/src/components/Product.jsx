import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, createReview } from '../services/api';

const ReviewForm = ({ product, onReviewSubmit, onCancel }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const reviewData = {
            rating: parseFloat(rating),
            comment: comment,
            product_id: product.id_key
        };
        try {
            await createReview(reviewData);
            onReviewSubmit();
        } catch (error) {
            alert('Failed to submit review.');
        }
    };

    return (
        <div className="form-container" style={{ border: '2px solid #28a745', marginTop: '2rem' }}>
            <h2>Escribir reseña para: {product.name}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Calificación:</label>
                    <input type="number" value={rating} onChange={(e) => setRating(e.target.value)} required min="0" max="5" step="0.5" />
                </div>
                <div className="form-group">
                    <label>Comentario:</label>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
                </div>
                <div className="form-actions">
                    <button type="submit">Enviar Reseña</button>
                    <button type="button" onClick={onCancel}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

const Product = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [reviewingProduct, setReviewingProduct] = useState(null); // State for review form

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        category_id: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [productsData, categoriesData] = await Promise.all([getProducts(), getCategories()]);
            setProducts(productsData);
            setCategories(categoriesData);
            setError(null);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10),
                category_id: parseInt(formData.category_id, 10)
            };

            if (editingProduct) {
                await updateProduct(editingProduct.id_key, productData);
            } else {
                await createProduct(productData);
            }
            fetchData();
            resetForm();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEdit = (product) => {
        setReviewingProduct(null);
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price.toString(),
            stock: product.stock.toString(),
            category_id: product.category_id.toString()
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
            try {
                await deleteProduct(id);
                fetchData();
            } catch (error) {
                setError(error.message);
            }
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            price: '',
            stock: '',
            category_id: ''
        });
    };

    const handleLeaveReview = (product) => {
        setEditingProduct(null);
        setReviewingProduct(product);
    };

    const handleReviewSubmitted = () => {
        setReviewingProduct(null);
        alert('¡Gracias por su reseña!');
    };

    if (isLoading) {
        return <div>Cargando productos...</div>;
    }

    return (
        <div className="container">
            <h1>Gestión de Productos</h1>
            {error && <div className="error-message">Error: {error}</div>}

            <div className="form-container">
                <h2>{editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre:</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label>Precio:</label>
                        <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0.01" step="0.01" />
                    </div>
                    <div className="form-group">
                        <label>Stock:</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required min="0" step="1" />
                    </div>
                    <div className="form-group">
                        <label>Categoría:</label>
                        <select name="category_id" value={formData.category_id} onChange={handleInputChange} required>
                            <option value="">Seleccione una categoría</option>
                            {categories.map(cat => (
                                <option key={cat.id_key} value={cat.id_key}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="submit">{editingProduct ? 'Actualizar Producto' : 'Agregar Producto'}</button>
                        {editingProduct && <button type="button" onClick={resetForm}>Cancelar Edición</button>}
                    </div>
                </form>
            </div>

            <div className="table-container">
                <h2>Lista de Productos</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Categoría</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => {
                            const category = categories.find(c => c.id_key === product.category_id);
                            return (
                                <tr key={product.id_key}>
                                    <td>{product.id_key}</td>
                                    <td>{product.name}</td>
                                    <td>${product.price.toFixed(2)}</td>
                                    <td>{product.stock}</td>
                                    <td>{category ? category.name : 'N/A'}</td>
                                    <td className="actions-cell">
                                        <button className="edit" onClick={() => handleEdit(product)}>Editar</button>
                                        <button className="delete" onClick={() => handleDelete(product.id_key)}>Eliminar</button>
                                        <button className="review" onClick={() => handleLeaveReview(product)}>Dejar reseña</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {reviewingProduct && (
                <ReviewForm
                    product={reviewingProduct}
                    onReviewSubmit={handleReviewSubmitted}
                    onCancel={() => setReviewingProduct(null)}
                />
            )}
        </div>
    );
};

export default Product;
