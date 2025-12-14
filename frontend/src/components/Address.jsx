import React, { useState, useEffect } from 'react';
import { getAddressesForClient, createAddress, updateAddress, deleteAddress } from '../services/api';

const Address = ({ clientId }) => {
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for form and editing
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({ street: '', number: '', city: '', client_id: clientId });

    useEffect(() => {
        if (clientId) {
            setFormData(prev => ({ ...prev, client_id: clientId }));
            fetchData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientId]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await getAddressesForClient(clientId);
            setAddresses(data || []);
            setError(null);
        } catch (err) {
            setError(err.message);
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
            if (editingAddress) {
                await updateAddress(editingAddress.id_key, formData);
            } else {
                await createAddress(formData);
            }
            fetchData();
            resetForm();
        } catch (err) {
            setError(err.message);
            alert(`Failed to save address: ${err.message}`);
        }
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        setFormData({
            street: address.street,
            number: address.number,
            city: address.city,
            client_id: address.client_id
        });
    };

    const resetForm = () => {
        setEditingAddress(null);
        setFormData({ street: '', number: '', city: '', client_id: clientId });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                await deleteAddress(id);
                fetchData();
            } catch (err) {
                setError(err.message);
                alert(`Failed to delete address: ${err.message}`);
            }
        }
    };

    if (!clientId) return null;

    return (
        <div className="space-y-6">
            {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md">Error: {error}</p>}
            
            {/* Add/Edit Address Form */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-700">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-1">
                        <label htmlFor="street" className="block text-sm font-medium text-gray-600">Street</label>
                        <input type="text" name="street" value={formData.street} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="number" className="block text-sm font-medium text-gray-600">Number</label>
                        <input type="text" name="number" value={formData.number} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-600">City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 h-10">
                            {editingAddress ? 'Update' : 'Add'}
                        </button>
                        {editingAddress && (
                            <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md h-10">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Address List */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Address List</h3>
                {isLoading ? <p className="text-gray-500">Loading addresses...</p> : (
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Street</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {addresses.length > 0 ? addresses.map(address => (
                                    <tr key={address.id_key} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{address.street}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{address.number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{address.city}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            <button onClick={() => handleEdit(address)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                            <button onClick={() => handleDelete(address.id_key)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-gray-500">No addresses found for this client.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Address;
