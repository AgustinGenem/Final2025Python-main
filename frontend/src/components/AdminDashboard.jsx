import React from 'react';
import AdminMenu from './AdminMenu';

const AdminDashboard = ({ children }) => {
  return (
    <div style={{ display: 'flex' }}>
      <AdminMenu />
      <main style={{ flexGrow: 1, padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
};

export default AdminDashboard;
