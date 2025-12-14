import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBillById, updateBill } from '../services/api';

const BillDetail = () => {
    const [bill, setBill] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();

    // State for editing
    const [isEditing, setIsEditing] = useState(false);
    const [editableDate, setEditableDate] = useState('');

    useEffect(() => {
        const fetchBill = async () => {
            try {
                setIsLoading(true);
                const billData = await getBillById(id);
                setBill(billData);
                // Initialize editable date in 'YYYY-MM-DD' format for the input
                setEditableDate(new Date(billData.date).toISOString().split('T')[0]);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBill();
    }, [id]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updatedBill = await updateBill(bill.id_key, { ...bill, date: editableDate });
            setBill(updatedBill);
            setIsEditing(false);
        } catch (err) {
            alert('Failed to update bill date.');
            console.error(err);
        }
    };

    if (isLoading) {
        return <div className="text-center mt-10">Cargando factura...</div>;
    }

    if (error) {
        return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
    }

    if (!bill) {
        return <div className="text-center mt-10">Factura no encontrada.</div>;
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Detalle de la Factura</h1>
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-gray-600 font-semibold">ID Factura:</p>
                        <p className="text-lg">{bill.id_key}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 font-semibold">ID Cliente:</p>
                        <p className="text-lg">{bill.client_id}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 font-semibold">Fecha:</p>
                        {isEditing ? (
                            <form onSubmit={handleUpdate}>
                                <input 
                                    type="date" 
                                    value={editableDate}
                                    onChange={(e) => setEditableDate(e.target.value)}
                                    className="px-2 py-1 border rounded"
                                />
                                <div className="flex gap-2 mt-2">
                                    <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded">Guardar</button>
                                    <button type="button" onClick={handleCancel} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded">Cancelar</button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex items-center gap-4">
                                <p className="text-lg">{new Date(bill.date).toLocaleDateString()}</p>
                                <button onClick={handleEdit} className="text-blue-500 hover:underline text-sm">Editar</button>
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-gray-600 font-semibold">Total:</p>
                        <p className="text-lg font-bold text-blue-600">${bill.total.toFixed(2)}</p>
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

export default BillDetail;