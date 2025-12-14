import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getClients, createClient, updateClient, deleteClient } from '../services/api';
import Address from './Address'; // Import the new Address component

const Client = () => {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingClient, setEditingClient] = useState(null);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [selectedClientName, setSelectedClientName] = useState('');

    const [formData, setFormData] = useState({ name: '', lastname: '', email: '', telephone: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const clientsData = await getClients();
            setClients(clientsData || []);
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
            let apiCall;
            if (editingClient) {
                // Remove protected fields before sending the update payload
                const { id_key, created_at, updated_at, ...updateData } = formData;
                apiCall = updateClient(editingClient.id_key, updateData);
            } else {
                apiCall = createClient(formData);
            }
            await apiCall;
            fetchData();
            resetForm();
        } catch (error) {
            setError(error.message);
            alert(`Error al guardar el cliente: ${error.message}`);
        }
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setFormData({ ...client });
        setSelectedClientId(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de que quiere eliminar este cliente?')) {
            try {
                await deleteClient(id);
                if (selectedClientId === id) {
                    setSelectedClientId(null);
                }
                fetchData();
            } catch (error) {
                setError(error.message);
                alert(`Error al eliminar el cliente: ${error.message}`);
            }
        }
    };

    const resetForm = () => {
        setEditingClient(null);
        setFormData({ name: '', lastname: '', email: '', telephone: '' });
    };

    const handleManageAddress = (client) => {
        if (selectedClientId === client.id_key) {
            setSelectedClientId(null);
            setSelectedClientName('');
        } else {
            setSelectedClientId(client.id_key);
            setSelectedClientName(`${client.name} ${client.lastname}`);
            setEditingClient(null);
            resetForm();
        }
    };

    if (isLoading) return <p className="text-center text-gray-500">Cargando clientes...</p>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Gestionar Clientes</h1>
            {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md">Error: {error}</p>}

            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-6">{editingClient ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">Apellido</label>
                        <input type="text" name="lastname" id="lastname" value={formData.lastname} onChange={handleInputChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <input type="tel" name="telephone" id="telephone" value={formData.telephone} onChange={handleInputChange} required placeholder="+1234567890" className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-4">
                        <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            {editingClient ? 'Actualizar Cliente' : 'Añadir Cliente'}
                        </button>
                        {editingClient && <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-md hover:bg-gray-300">Cancelar</button>}
                    </div>
                </form>
            </div>

            {selectedClientId && (
                <div className="bg-white p-8 rounded-lg shadow-md">
                     <h2 className="text-2xl font-semibold mb-6">Gestionar Direcciones para <span className="text-indigo-600">{selectedClientName}</span></h2>
                    <Address clientId={selectedClientId} />
                </div>
            )}

            <div className="bg-white p-8 rounded-lg shadow-md">
                 <h2 className="text-2xl font-semibold mb-6">Lista de Clientes</h2>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {clients.map(client => (
                                <tr key={client.id_key} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name} {client.lastname}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{client.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{client.telephone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Link to={`/admin/clients/${client.id_key}`} className="text-blue-600 hover:text-blue-900">Ver</Link>
                                        <button onClick={() => handleEdit(client)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                        <button onClick={() => handleDelete(client.id_key)} className="text-red-600 hover:text-red-900">Eliminar</button>
                                        <button onClick={() => handleManageAddress(client)} className="text-green-600 hover:text-green-900">
                                            {selectedClientId === client.id_key ? 'Cerrar' : 'Direcciones'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Client;