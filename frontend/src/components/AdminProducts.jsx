import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories } from '../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the new product form
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');

  // State for inline editing
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingProductData, setEditingProductData] = useState({ name: '', price: '', stock: '', category_id: '' });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const productsData = await getProducts();
      const categoriesData = await getCategories();
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      if (categoriesData && categoriesData.length > 0) {
        setNewProductCategory(categoriesData[0].id_key);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice || !newProductStock || !newProductCategory) {
      alert('Por favor, rellene todos los campos');
      return;
    }
    const newProduct = {
      name: newProductName,
      price: parseFloat(newProductPrice),
      stock: parseInt(newProductStock, 10),
      category_id: parseInt(newProductCategory, 10),
    };

    try {
      const created = await createProduct(newProduct);
      setProducts([...products, created]);
      // Clear form
      setNewProductName('');
      setNewProductPrice('');
      setNewProductStock('');
    } catch (err) {
      setError(err.message);
      alert('Error al crear el producto.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('¿Está seguro de que quiere eliminar este producto?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id_key !== id));
      } catch (err) {
        setError(err.message);
        alert('Error al eliminar el producto. Puede que esté asociado a un pedido.');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditingProductData({ ...product });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditingProductData({ name: '', price: '', stock: '', category_id: '' });
  };

  const handleUpdateProduct = async () => {
    const { id_key, created_at, updated_at, category, ...updateData } = editingProductData;
    try {
      await updateProduct(editingProduct.id_key, {
        ...updateData,
        price: parseFloat(updateData.price),
        stock: parseInt(updateData.stock, 10),
        category_id: parseInt(updateData.category_id, 10),
      });
      handleCancelEdit();
      fetchData(); // Refresh data
    } catch (err) {
      alert(`Error al actualizar el producto: ${err.message}`);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProductData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) return <p className="text-center text-gray-500">Cargando productos...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Gestionar Productos</h1>
      
      {/* Create Product Form Card */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Añadir Nuevo Producto</h2>
        <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              id="product-name"
              type="text"
              placeholder="ej., Portátil"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
            <input
              id="product-price"
              type="number"
              placeholder="ej., 999.99"
              value={newProductPrice}
              onChange={(e) => setNewProductPrice(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="product-stock" className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input
              id="product-stock"
              type="number"
              placeholder="ej., 50"
              value={newProductStock}
              onChange={(e) => setNewProductStock(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              id="product-category"
              value={newProductCategory}
              onChange={(e) => setNewProductCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              {categories.map(cat => (
                <option key={cat.id_key} value={cat.id_key}>{cat.name}</option>
              ))}
            </select>
          </div>
          <button 
            type="submit"
            className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10"
          >
            Añadir Producto
          </button>
        </form>
      </div>

      {/* Products Table Card */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Productos Existentes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.id_key} className="hover:bg-gray-50">
                  {editingProduct?.id_key === product.id_key ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.id_key}</td>
                      <td className="px-6 py-4">
                        <input type="text" name="name" value={editingProductData.name} onChange={handleEditInputChange} className="w-full border rounded px-1" />
                      </td>
                      <td className="px-6 py-4">
                        <input type="number" name="price" value={editingProductData.price} onChange={handleEditInputChange} className="w-full border rounded px-1" step="0.01" />
                      </td>
                      <td className="px-6 py-4">
                        <input type="number" name="stock" value={editingProductData.stock} onChange={handleEditInputChange} className="w-full border rounded px-1" />
                      </td>
                      <td className="px-6 py-4">
                        <select name="category_id" value={editingProductData.category_id} onChange={handleEditInputChange} className="w-full border rounded px-1">
                          {categories.map(cat => (
                            <option key={cat.id_key} value={cat.id_key}>{cat.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button type="button" onClick={handleUpdateProduct} className="text-green-600 hover:text-green-900">Guardar</button>
                        <button type="button" onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-900">Cancelar</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.id_key}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{categories.find(c => c.id_key === product.category_id)?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button type="button" onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                        <button onClick={() => handleDeleteProduct(product.id_key)} className="text-red-600 hover:text-red-900">Eliminar</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
