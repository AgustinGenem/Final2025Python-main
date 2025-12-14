import React, { useState, useEffect } from 'react';
import { getReviews, deleteReview, updateReview, getProducts } from '../services/api';

const Review = () => {
    const [reviews, setReviews] = useState([]);
    const [products, setProducts] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for inline editing
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [currentRating, setCurrentRating] = useState(0);
    const [currentComment, setCurrentComment] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [reviewsData, productsData] = await Promise.all([ getReviews(), getProducts() ]);
            setReviews(reviewsData || []);
            setProducts(productsData.reduce((acc, product) => ({ ...acc, [product.id_key]: product.name }), {}));
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await deleteReview(id);
                fetchData();
            } catch (err) {
                setError(err.message);
                alert(`Failed to delete review: ${err.message}`);
            }
        }
    };
    
    const handleEdit = (review) => {
        setEditingReviewId(review.id_key);
        setCurrentRating(review.rating);
        setCurrentComment(review.comment);
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setCurrentRating(0);
        setCurrentComment('');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const reviewData = {
            rating: parseFloat(currentRating),
            comment: currentComment,
            product_id: reviews.find(r => r.id_key === editingReviewId).product_id
        };

        try {
            await updateReview(editingReviewId, reviewData);
            handleCancelEdit();
            fetchData();
        } catch (err) {
            alert(`Failed to update review: ${err.message}`);
        }
    };

    const renderStars = (rating) => {
        const fullStars = '★'.repeat(Math.floor(rating));
        const halfStar = rating % 1 !== 0 ? '½' : '';
        const emptyStars = '☆'.repeat(5 - Math.ceil(rating));
        return <span className="text-yellow-500 text-lg">{fullStars}{halfStar}{emptyStars}</span>;
    };

    if (isLoading) return <p className="text-center text-gray-500">Loading reviews...</p>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Manage Reviews</h1>
            {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md">Error: {error}</p>}

            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-6">All Reviews</h2>
                {reviews.length > 0 ? (
                    <ul className="space-y-6">
                        {reviews.map(review => (
                            <li key={review.id_key} className="p-5 border rounded-lg transition-shadow">
                                {editingReviewId === review.id_key ? (
                                    <form onSubmit={handleUpdate}>
                                        <div className="flex items-center mb-2">
                                            <label className="font-semibold mr-2">Rating:</label>
                                            <input 
                                                type="number" 
                                                value={currentRating} 
                                                onChange={(e) => setCurrentRating(e.target.value)} 
                                                min="0" max="5" step="0.5"
                                                className="w-20 px-2 py-1 border rounded"
                                            />
                                        </div>
                                        <textarea 
                                            value={currentComment}
                                            onChange={(e) => setCurrentComment(e.target.value)}
                                            className="w-full p-2 border rounded"
                                            rows="3"
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded">Save</button>
                                            <button type="button" onClick={handleCancelEdit} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded">Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-800">{products[review.product_id] || 'Unknown Product'}</p>
                                            <div className="flex items-center my-2">
                                                {renderStars(review.rating)}
                                                <span className="ml-2 text-sm text-gray-600">({review.rating.toFixed(1)})</span>
                                            </div>
                                            <p className="text-gray-700 max-w-prose">{review.comment}</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <button onClick={() => handleEdit(review)} className="text-blue-600 hover:text-blue-900 font-semibold">Edit</button>
                                            <button onClick={() => handleDelete(review.id_key)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No reviews have been submitted yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Review;
