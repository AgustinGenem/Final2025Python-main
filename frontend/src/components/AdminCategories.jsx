import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the new category form
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // State for inline editing
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const categoriesData = await getCategories();
      setCategories(categoriesData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName) {
      alert('Por favor, introduzca un nombre de categoría');
      return;
    }
    const newCategory = { name: newCategoryName };

    try {
      const created = await createCategory(newCategory);
      setCategories([...categories, created]);
      setNewCategoryName(''); // Clear form
    } catch (err) {
      setError(err.message);
      alert('Error al crear la categoría. Puede que ya exista.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('¿Está seguro de que quiere eliminar esta categoría? Esto podría afectar a los productos asociados.')) {
      try {
        await deleteCategory(id);
        setCategories(categories.filter(c => c.id_key !== id));
      } catch (err) {
        setError(err.message);
        alert('Error al eliminar la categoría. Puede que tenga productos asociados.');
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setEditingCategoryName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditingCategoryName('');
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategoryName) {
      alert('El nombre de la categoría no puede estar vacío');
      return;
    }
    
    try {
      await updateCategory(editingCategory.id_key, { name: editingCategoryName });
      handleCancelEdit();
      fetchData(); // Refresh data
    } catch (err) {
      alert(`Error al actualizar la categoría: ${err.message}`);
    }
  };


  if (isLoading) return <p className="text-center text-gray-500">Cargando categorías...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Gestionar Categorías</h1>
      
      {/* Create Category Form Card */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Añadir Nueva Categoría</h2>
        <form onSubmit={handleCreateCategory} className="flex items-end gap-4">
          <div className="flex-grow">
            <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              id="category-name"
              type="text"
              placeholder="ej., Electrónica"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <button 
            type="submit"
            className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10"
          >
            Añadir Categoría
          </button>
        </form>
      </div>

      {/* Categories List Card */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Categorías Existentes</h2>
        <div className="overflow-x-auto">
          <ul className="divide-y divide-gray-200">
            {categories.map(category => (
              <li key={category.id_key} className="py-4 flex items-center justify-between hover:bg-gray-50 px-2">
                {editingCategory?.id_key === category.id_key ? (
                   <form onSubmit={handleUpdateCategory} className="flex-grow flex items-center gap-4">
                      <input 
                        type="text"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="text-green-600 hover:text-green-900 font-semibold">Guardar</button>
                        <button type="button" onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-900">Cancelar</button>
                      </div>
                   </form>
                ) : (
                  <>
                    <div className="text-sm font-medium text-gray-800">{category.name}</div>
                    <div className="text-sm font-medium space-x-4">
                      <button onClick={() => handleEdit(category)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                      <button onClick={() => handleDeleteCategory(category.id_key)} className="text-red-600 hover:text-red-900">Eliminar</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;