import React, { useState } from 'react';
import { createReview } from '../services/api';

const ReviewForm = ({ product, onReviewSubmit, onCancel }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (comment && comment.length < 10) {
            setError('El comentario debe tener al menos 10 caracteres.');
            return;
        }

        const reviewData = {
            rating: parseFloat(rating),
            comment: comment,
            product_id: product.id_key
        };
        try {
            await createReview(reviewData);
            onReviewSubmit();
        } catch (error) {
            setError('Failed to submit review. You may have already reviewed this product.');
        }
    };

    return (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md border-l-4 border-green-500">
            <h2 className="text-2xl font-bold mb-4">Escribir reseña para: {product.name}</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="rating" className="block text-gray-700 font-semibold mb-2">Calificación:</label>
                    <input
                        id="rating"
                        type="number"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        required
                        min="1"
                        max="5"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="comment" className="block text-gray-700 font-semibold mb-2">Comentario:</label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                    />
                </div>
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
                    >
                        Enviar Reseña
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
