import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);

    const [formData, setFormData] = useState({
        name: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const categoriesData = await getCategories();
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
            if (editingCategory) {
                await updateCategory(editingCategory.id_key, formData);
            } else {
                await createCategory(formData);
            }
            fetchData();
            resetForm();
        } catch (error) {
            const errorData = await error.response?.json();
            setError(errorData?.detail || error.message);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta categoría? Nota: No se puede eliminar si tiene productos asociados.')) {
            try {
                await deleteCategory(id);
                fetchData();
            } catch (error) {
                setError(error.message);
            }
        }
    };

    const resetForm = () => {
        setEditingCategory(null);
        setFormData({
            name: ''
        });
    };

    if (isLoading) {
        return <div>Cargando categorías...</div>;
    }

    return (
        <div className="container">
            <h1>Gestión de Categorías</h1>
            {error && <div className="error-message">Error: {error}</div>}

            <div className="form-container">
                <h2>{editingCategory ? 'Editar Categoría' : 'Agregar Nueva Categoría'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre:</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="form-actions">
                        <button type="submit">{editingCategory ? 'Actualizar Categoría' : 'Agregar Categoría'}</button>
                        {editingCategory && <button type="button" onClick={resetForm}>Cancelar Edición</button>}
                    </div>
                </form>
            </div>

            <div className="table-container">
                <h2>Lista de Categorías</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(category => (
                            <tr key={category.id_key}>
                                <td>{category.id_key}</td>
                                <td>{category.name}</td>
                                <td>
                                    <button className="edit" onClick={() => handleEdit(category)}>Editar</button>
                                    <button className="delete" onClick={() => handleDelete(category.id_key)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Category;
