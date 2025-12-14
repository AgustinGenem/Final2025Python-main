import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { createOrder, createOrderDetail, createBill, getClients } from '../services/api';

// Enums based on backend
const OrderStatus = { PENDING: 1, IN_PROGRESS: 2, DELIVERED: 3, CANCELED: 4 };
const PaymentType = { CASH: 1, CARD: 2, DEBIT: 3, CREDIT: 4, BANK_TRANSFER: 5 };


const DeliveryMethod = { DRIVE_THRU: 1, ON_HAND: 2, HOME_DELIVERY: 3 };

const Cart = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchClients = async () => {
        try {
          const clientsData = await getClients();
          setClients(clientsData || []);
          if (clientsData && clientsData.length > 0) {
            setSelectedClientId(clientsData[0].id_key);
          }
        } catch (error) {
          console.error("No se pudieron cargar los clientes:", error);
          alert("No se pudieron cargar los clientes. Por favor, inténtelo de nuevo.");
        }
      };
      fetchClients();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Su carrito está vacío.');
      return;
    }
    if (!selectedClientId) {
      alert('Por favor, seleccione un cliente.');
      return;
    }

    setIsCheckingOut(true);

    try {
      // Step 1: Create a Bill first
      const billData = {
        client_id: parseInt(selectedClientId, 10),
        date: new Date().toISOString().split('T')[0],
        total: cartTotal,
        payment_type: PaymentType.CASH,
        bill_number: `BILL-TEMP-${Date.now()}`,
        discount: 0,
      };
      const bill = await createBill(billData);

      // Step 2: Create an Order, linking the bill
      const orderData = {
        client_id: parseInt(selectedClientId, 10),
        date: new Date().toISOString(),
        status: OrderStatus.PENDING,
        total: cartTotal,
        delivery_method: DeliveryMethod.HOME_DELIVERY, // Default delivery method
        bill_id: bill.id_key, // Link to the created bill
      };
      const order = await createOrder(orderData);

      // Step 3: Create Order Details for each item
      const orderDetailPromises = cartItems.map(item =>
        createOrderDetail({
          order_id: order.id_key,
          product_id: item.id_key,
          quantity: item.quantity,
          price: item.price
        })
      );
      await Promise.all(orderDetailPromises);

      // Step 4: Clear the cart and close
      clearCart();
      alert('¡Compra finalizada con éxito! El pedido y la factura han sido creados.');
      onClose();
    } catch (error) {
      console.error('Error al finalizar la compra:', error);
      alert(`Error al finalizar la compra: ${error.message}`);
    } finally {
      setIsCheckingOut(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose}>
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-50 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out"
        onClick={e => e.stopPropagation()}
      >
        {/* Cart Header */}
        <header className="flex items-center justify-between p-4 border-b bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Tu Carrito</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            aria-label="Cerrar carrito"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Cart Body */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-white">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 pt-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <h3 className="text-xl font-medium text-gray-700">Tu carrito está vacío</h3>
              <p className="text-sm text-gray-500 mt-1">Añade artículos para empezar.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {cartItems.map(item => (
                <li key={item.id_key} className="flex items-center py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {/* Placeholder for product image */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-grow ml-4">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                    <div className="flex items-center mt-2">
                      <button onClick={() => updateQuantity(item.id_key, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center border rounded-full hover:bg-gray-200 transition-colors">-</button>
                      <span className="px-4 font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id_key, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center border rounded-full hover:bg-gray-200 transition-colors">+</button>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    <button onClick={() => removeFromCart(item.id_key)} className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100 mt-2 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cart Footer */}
        {cartItems.length > 0 && (
          <footer className="p-4 border-t bg-gray-100">
            <div className="mb-4">
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Cliente</label>
              <select
                id="client"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="" disabled>-- Seleccione un cliente --</option>
                {clients.map(client => (
                  <option key={client.id_key} value={client.id_key}>
                    {client.name} {client.lastname}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-lg font-medium text-gray-700">Subtotal</span>
              <span className="text-2xl font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:bg-blue-400"
            >
              {isCheckingOut ? 'Procesando...' : 'Finalizar Compra'}
            </button>
            <button onClick={clearCart} className="w-full mt-3 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">
              Vaciar Carrito
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

export default Cart;
