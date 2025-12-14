import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBills, createBill, deleteBill, getClients } from '../services/api';

const PaymentType = {
    CASH: 1,
    CARD: 2,
    DEBIT: 3,
    CREDIT: 4,
    BANK_TRANSFER: 5,
};

const Bill = () => {
    const [bills, setBills] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        bill_number: '',
        date: new Date().toISOString().split('T')[0],
        total: '',
        payment_type: PaymentType.CASH,
        client_id: '',
        discount: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [billsData, clientsData] = await Promise.all([getBills(), getClients()]);
                setBills(billsData);
                setClients(clientsData);
                if (clientsData.length > 0) {
                    setFormData(prev => ({ ...prev, client_id: clientsData[0].id_key }));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de que quiere eliminar esta factura?')) {
            try {
                await deleteBill(id);
                setBills(bills.filter(bill => bill.id_key !== id));
            } catch (err) {
                setError(err.message);
                alert(`Error al eliminar la factura: ${err.message}`);
            }
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateBill = async (e) => {
        e.preventDefault();
        const { bill_number, date, total, payment_type, client_id } = formData;
        if (!bill_number || !date || !total || !payment_type || !client_id) {
            alert('Por favor, rellene todos los campos requeridos.');
            return;
        }

        try {
            const newBill = {
                ...formData,
                total: parseFloat(total),
                client_id: parseInt(client_id, 10),
                payment_type: parseInt(payment_type, 10),
                discount: formData.discount ? parseFloat(formData.discount) : null,
            };
            const created = await createBill(newBill);
            setBills([created, ...bills]);
            // Reset form
            setFormData({
                bill_number: '',
                date: new Date().toISOString().split('T')[0],
                total: '',
                payment_type: PaymentType.CASH,
                client_id: clients.length > 0 ? clients[0].id_key : '',
                discount: ''
            });
        } catch (err) {
            alert(`Error al crear la factura: ${err.message}`);
        }
    };

    if (loading) {
        return <div className="text-center p-4">Cargando facturas...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Gestión de Facturas</h1>
            
            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-6">Crear Nueva Factura</h2>
                <form onSubmit={handleCreateBill} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">Cliente</label>
                        <select name="client_id" id="client_id" value={formData.client_id} onChange={handleInputChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm">
                            {clients.map(c => <option key={c.id_key} value={c.id_key}>{c.name} {c.lastname}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="bill_number" className="block text-sm font-medium text-gray-700">Número de Factura</label>
                        <input type="text" name="bill_number" id="bill_number" value={formData.bill_number} onChange={handleInputChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Fecha</label>
                        <input type="date" name="date" id="date" value={formData.date} onChange={handleInputChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="total" className="block text-sm font-medium text-gray-700">Total</label>
                        <input type="number" name="total" id="total" value={formData.total} onChange={handleInputChange} required step="0.01" className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                     <div>
                        <label htmlFor="discount" className="block text-sm font-medium text-gray-700">Descuento</label>
                        <input type="number" name="discount" id="discount" value={formData.discount} onChange={handleInputChange} step="0.01" className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="payment_type" className="block text-sm font-medium text-gray-700">Tipo de Pago</label>
                        <select name="payment_type" id="payment_type" value={formData.payment_type} onChange={handleInputChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm">
                            {Object.entries(PaymentType).map(([key, value]) => <option key={value} value={value}>{key}</option>)}
                        </select>
                    </div>
                    <div className="lg:col-span-3">
                        <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-md shadow-sm hover:bg-indigo-700">Crear Factura</button>
                    </div>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bills.map(bill => (
                    <div key={bill.id_key} className="bg-white p-4 rounded-lg shadow">
                        <h2 className="text-lg font-semibold">Factura #{bill.id_key}</h2>
                        <p className="text-gray-600">Fecha: {new Date(bill.date).toLocaleDateString()}</p>
                        <p className="text-gray-800 font-bold mt-2">Total: ${bill.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Cliente: {clients.find(c => c.id_key === bill.client_id)?.name || 'Desconocido'}</p>
                        <div className="mt-4 flex justify-end gap-2">
                             <Link to={`/admin/bills/${bill.id_key}`} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded">
                                Ver
                            </Link>
                            <button
                                onClick={() => handleDelete(bill.id_key)}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Bill;