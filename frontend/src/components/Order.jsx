import React, { useState, useEffect } from 'react';
import { getOrders, updateOrder, deleteOrder, getOrderDetails, updateOrderDetail, deleteOrderDetail, getClients, getProducts } from '../services/api';

const OrderStatus = { 1: 'Pendiente', 2: 'En Progreso', 3: 'Entregado', 4: 'Cancelado' };
const StatusColors = { 1: 'bg-yellow-200 text-yellow-800', 2: 'bg-blue-200 text-blue-800', 3: 'bg-green-200 text-green-800', 4: 'bg-red-200 text-red-800' };

const Order = () => {
    const [orders, setOrders] = useState([]);
    const [clients, setClients] = useState({});
    const [products, setProducts] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [editingDetail, setEditingDetail] = useState(null);
    const [editableDetailData, setEditableDetailData] = useState({ quantity: 0, price: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [ordersData, clientsData, productsData] = await Promise.all([ getOrders(), getClients(), getProducts() ]);
            setOrders(ordersData.sort((a, b) => new Date(b.date) - new Date(a.date)));
            setClients(clientsData.reduce((acc, client) => ({ ...acc, [client.id_key]: `${client.name} ${client.lastname}` }), {}));
            setProducts(productsData.reduce((acc, product) => ({ ...acc, [product.id_key]: product }), {}));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectOrder = async (order) => {
        if (selectedOrder?.id_key === order.id_key) {
            setSelectedOrder(null);
            setOrderDetails([]);
            return;
        }
        setSelectedOrder(order);
        try {
            const details = await getOrderDetails(order.id_key);
            setOrderDetails(details);
        } catch (err) {
            setError(err.message);
            setOrderDetails([]);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        if (!window.confirm(`Change status to "${OrderStatus[newStatus]}"?`)) return;
        try {
            // Get the current order to send all required fields
            const currentOrder = orders.find(o => o.id_key === orderId);
            if (!currentOrder) {
                throw new Error('Order not found');
            }

            // Send complete order data with updated status
            await updateOrder(orderId, {
                date: currentOrder.date,
                total: currentOrder.total,
                delivery_method: currentOrder.delivery_method,
                status: parseInt(newStatus, 10),
                client_id: currentOrder.client_id,
                bill_id: currentOrder.bill_id
            });
            
            fetchData();
            if (selectedOrder?.id_key === orderId) {
                setSelectedOrder({ ...selectedOrder, status: parseInt(newStatus, 10) });
            }
        } catch (err) {
            setError(err.message);
            alert('Failed to update status.');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) return;
        try {
            await deleteOrder(orderId);
            setSelectedOrder(null);
            setOrderDetails([]);
            fetchData();
        } catch (err) {
            setError(err.message);
            alert('Failed to delete order.');
        }
    };

    const handleEditDetail = (detail) => {
        setEditingDetail(detail);
        setEditableDetailData({ quantity: detail.quantity, price: detail.price });
    };

    const handleCancelEditDetail = () => {
        setEditingDetail(null);
        setEditableDetailData({ quantity: 0, price: 0 });
    };

    const handleUpdateDetail = async (e) => {
        e.preventDefault();
        try {
            // Only send the editable data, not the whole editingDetail object
            await updateOrderDetail(editingDetail.id_key, editableDetailData);
            handleCancelEditDetail();
            // Re-fetch details for the current order
            const details = await getOrderDetails(selectedOrder.id_key);
            setOrderDetails(details);
        } catch (err) {
            alert(`Failed to update detail: ${err.message}`);
        }
    };

    const handleDeleteDetail = async (detailId) => {
        if (!window.confirm('Are you sure you want to delete this item from the order?')) return;
        try {
            await deleteOrderDetail(detailId);
            // Re-fetch details for the current order
            const details = await getOrderDetails(selectedOrder.id_key);
            setOrderDetails(details);
        } catch (err) {
            alert(`Failed to delete detail: ${err.message}`);
        }
    };

    if (isLoading) return <p className="text-center text-gray-500">Loading orders...</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Orders</h1>
            {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md mb-6">Error: {error}</p>}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order List */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4">Orders</h2>
                    <ul className="space-y-3 h-[600px] overflow-y-auto pr-2">
                        {orders.map(order => (
                            <li key={order.id_key} onClick={() => handleSelectOrder(order)} className={`p-4 rounded-md cursor-pointer border-2 transition-colors ${selectedOrder?.id_key === order.id_key ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <strong className="text-gray-800">Order #{order.id_key}</strong>
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${StatusColors[order.status]}`}>{OrderStatus[order.status]}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p>{clients[order.client_id] || 'Unknown Client'}</p>
                                    <p>{new Date(order.date).toLocaleDateString()}</p>
                                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Order Details */}
                <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-md">
                    {selectedOrder ? (
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-semibold">Details for Order #{selectedOrder.id_key}</h2>
                                    <p className="text-gray-600">Client: <span className="font-medium text-gray-800">{clients[selectedOrder.client_id]}</span></p>
                                    <p className="text-gray-600">Date: <span className="font-medium text-gray-800">{new Date(selectedOrder.date).toLocaleString()}</span></p>
                                    <p className="text-xl font-bold text-gray-800 mt-2">Total: ${selectedOrder.total.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                     <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select id="status" value={selectedOrder.status} onChange={(e) => handleStatusChange(selectedOrder.id_key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                            {Object.entries(OrderStatus).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div className="self-end">
                                        <button onClick={() => handleDeleteOrder(selectedOrder.id_key)} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-red-700">
                                            Delete Order
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold mb-4">Products</h3>
                            <div className="overflow-x-auto border rounded-lg">
                                <form onSubmit={handleUpdateDetail}>
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {orderDetails.map(detail => {
                                                const product = products[detail.product_id];
                                                const isEditing = editingDetail?.id_key === detail.id_key;
                                                return (
                                                    <tr key={detail.id_key}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{product?.name || 'Unknown'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {isEditing ? (
                                                                <input type="number" value={editableDetailData.quantity} onChange={(e) => setEditableDetailData({...editableDetailData, quantity: parseInt(e.target.value)})} className="w-20 border rounded px-1" />
                                                            ) : detail.quantity}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {isEditing ? (
                                                                 <input type="number" value={editableDetailData.price} onChange={(e) => setEditableDetailData({...editableDetailData, price: parseFloat(e.target.value)})} className="w-24 border rounded px-1" step="0.01" />
                                                            ) : `${detail.price.toFixed(2)}`}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">${(detail.quantity * detail.price).toFixed(2)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                                            {isEditing ? (
                                                                <>
                                                                    <button type="submit" className="text-green-600 hover:text-green-900">Save</button>
                                                                    <button type="button" onClick={handleCancelEditDetail} className="text-gray-600 hover:text-gray-900">Cancel</button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button type="button" onClick={() => handleEditDetail(detail)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                                                    <button type="button" onClick={() => handleDeleteDetail(detail.id_key)} className="text-red-600 hover:text-red-900">Delete</button>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <p className="text-lg">Select an order to see its details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Order;