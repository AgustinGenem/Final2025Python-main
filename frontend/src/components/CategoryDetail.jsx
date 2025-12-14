import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategoryById } from '../services/api';

const CategoryDetail = () => {
    const [category, setCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                setIsLoading(true);
                const categoryData = await getCategoryById(id);
                setCategory(categoryData);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategory();
    }, [id]);

    if (isLoading) {
        return <div className="text-center mt-10">Cargando categoría...</div>;
    }

    if (error) {
        return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
    }

    if (!category) {
        return <div className="text-center mt-10">Categoría no encontrada.</div>;
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Detalle de la Categoría</h1>
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-gray-600 font-semibold">ID:</p>
                        <p className="text-lg">{category.id_key}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 font-semibold">Nombre:</p>
                        <p className="text-lg">{category.name}</p>
                    </div>
                </div>
                <div className="mt-8">
                    <Link to="/admin" className="text-blue-500 hover:underline">
                        &larr; Volver al panel de administración
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CategoryDetail;
