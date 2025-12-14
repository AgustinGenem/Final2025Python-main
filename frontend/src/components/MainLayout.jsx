import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>E-commerce Frontend</h1>
        <nav className="main-nav">
          <Link to="/products"><button>Products</button></Link>
          <Link to="/categories"><button>Categories</button></Link>
          <Link to="/orders"><button>Orders</button></Link>
          <Link to="/clients"><button>Clients</button></Link>
          <Link to="/reviews"><button>Reviews</button></Link>
          <Link to="/admin"><button style={{ backgroundColor: '#ffc107' }}>Admin Section</button></Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
