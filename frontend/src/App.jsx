import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ClientView from './ClientView';
import AdminView from './AdminView';
import ProductDetail from './ProductDetail';
import ClientDetail from './components/ClientDetail';
import CategoryDetail from './components/CategoryDetail';
import BillDetail from './components/BillDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ClientView />} />
      <Route path="/admin" element={<AdminView />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/admin/clients/:id" element={<ClientDetail />} />
      <Route path="/admin/categories/:id" element={<CategoryDetail />} />
      <Route path="/admin/bills/:id" element={<BillDetail />} />
    </Routes>
  );
}

export default App;
