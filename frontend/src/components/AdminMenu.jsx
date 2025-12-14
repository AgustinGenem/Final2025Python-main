import React from 'react';
import { Link } from 'react-router-dom';

const AdminMenu = () => {
  return (
    <nav style={{ width: '200px', padding: '1rem', borderRight: '1px solid #ccc' }}>
      <h2>Menú de Administración</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li>
          <Link to="/admin/products">Gestionar Productos</Link>
        </li>
        <li>
          <Link to="/admin/categories">Gestionar Categorías</Link>
        </li>
        <li>
          <Link to="/admin/health">Estado del Sistema</Link>
        </li>
        <li>
          <Link to="/admin/bills">Gestionar Facturas</Link>
        </li>
      </ul>
    </nav>
  );
};

export default AdminMenu;
