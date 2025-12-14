import React, { useState } from 'react';
import AdminProducts from './components/AdminProducts';
import AdminCategories from './components/AdminCategories';
import AdminHealth from './components/AdminHealth';
import Order from './components/Order'; // Assuming this is the correct component for Orders
import Client from './components/Client'; // Assuming this is the correct component for Clients
import Review from './components/Review'; // Assuming this is the correct component for Reviews
import Bill from './components/Bill';

// Simple SVG Icons for the menu
const ProductIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const CategoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const OrderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const ClientIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const ReviewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
const HealthIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const BillIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;


const AdminView = () => {
  const [currentView, setCurrentView] = useState('products');

  const navItems = [
    { id: 'products', label: 'Productos', icon: <ProductIcon /> },
    { id: 'categories', label: 'Categorías', icon: <CategoryIcon /> },
    { id: 'orders', label: 'Pedidos', icon: <OrderIcon /> },
    { id: 'clients', label: 'Clientes', icon: <ClientIcon /> },
    { id: 'reviews', label: 'Reseñas', icon: <ReviewIcon /> },
    { id: 'bills', label: 'Facturas', icon: <BillIcon /> },
    { id: 'health', label: 'Estado', icon: <HealthIcon /> },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'products': return <AdminProducts />;
      case 'categories': return <AdminCategories />;
      case 'orders': return <Order />;
      case 'clients': return <Client />;
      case 'reviews': return <Review />;
      case 'bills': return <Bill />;
      case 'health': return <AdminHealth />;
      default: return <AdminProducts />;
    }
  };

  const NavLink = ({ item, isActive, onClick }) => (
    <button
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center p-4 text-left transition-colors duration-200 ${
        isActive
          ? 'bg-gray-700 text-white'
          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <span className="mr-3">{item.icon}</span>
      {item.label}
    </button>
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="h-20 flex items-center justify-center bg-gray-900">
          <h1 className="text-xl font-bold">Panel de Administración</h1>
        </div>
        <nav className="flex-grow">
          {navItems.map(item => (
            <NavLink
              key={item.id}
              item={item}
              isActive={currentView === item.id}
              onClick={setCurrentView}
            />
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
           <a href="/" className="w-full flex items-center p-4 text-left transition-colors duration-200 text-gray-400 hover:bg-gray-700 hover:text-white">
             <span className="mr-3"><StoreIcon /></span>
             Volver a Tienda
           </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {renderView()}
      </main>
    </div>
  );
};

export default AdminView;
