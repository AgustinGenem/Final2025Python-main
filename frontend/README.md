# Frontend Implementation Guide

This guide outlines the steps to build the React frontend based on the user stories provided in the backend documentation.

## 1. Foundational Setup

- **API Service:** All backend communication should be centralized in `src/services/api.js`. This service will handle HTTP requests to the defined endpoints.
- **Routing:** Use `react-router-dom` to manage client-side navigation.
  ```bash
  npm install react-router-dom
  ```
- **UI Component Library:** It is recommended to use a component library like Material-UI or React-Bootstrap to build the UI faster.
  ```bash
  # Example for Material-UI
  npm install @mui/material @emotion/react @emotion/styled
  ```

## 2. Component Implementation Plan

The existing components (`Category.jsx`, `Client.jsx`, `Order.jsx`, `Product.jsx`, `Review.jsx`) should be developed to implement the features outlined in the user stories.

### `src/components/Client.jsx`
- **User Registration:** Create a registration form (`/register`). On submit, call `POST /clients`.
- **User Profile:**
  - Create a profile page (`/profile`) to display user data (fetch from `GET /clients/{id}`).
  - Add a form to update user information (`PUT /clients/{id}`).
- **Address Management:**
  - On the profile page, list addresses (`GET /addresses?client_id={id}`).
  - Add forms/buttons to create (`POST /addresses`) and delete (`DELETE /addresses/{id}`) addresses.

### `src/components/Category.jsx` & `src/components/Product.jsx`
- **Product List (`/products`):**
  - Fetch and display paginated products from `GET /products`.
  - Use the `Category.jsx` component to display a list of categories (`GET /categories`) for filtering.
- **Product Details (`/products/:id`):**
  - Display detailed product information fetched from `GET /products/{id}`.
- **Admin Product Management (`/admin/products`):**
  - Create, update, and delete products (`POST`, `PUT`, `DELETE /products`).
- **Admin Category Management (`/admin/categories`):**
  - Create, update, and delete categories (`POST`, `PUT`, `DELETE /categories`).

### `src/components/Order.jsx`
- **Shopping Cart:**
  - Use React Context or another state management library to manage the cart.
  - Allow adding products to the cart from the product pages.
- **Checkout Process:**
  - Create a checkout page that guides the user through payment.
  - The checkout logic should perform the following API calls in sequence:
    1. `POST /bills` to create a bill.
    2. `POST /orders` to create an order associated with the bill.
    3. `POST /order_details` for each item in the cart.
- **Order History (`/orders`):**
  - List all of a user's orders.
- **Order Details (`/orders/:id`):**
  - Show details for a specific order (`GET /orders/{id}`).
  - Allow cancellation (`PUT /orders/{id}`) if the order status is appropriate.

### `src/components/Review.jsx`
- **Submit Review:**
  - On the product detail page, add a form for users to submit a review (`POST /reviews`).
- **Display Reviews:**
  - Display all existing reviews for a product.

## 3. Main Application Structure (`App.jsx`)

- Set up the main router using `react-router-dom`.
- Define the routes for all pages and components.
- Implement a main layout that includes navigation.

Example `App.jsx` structure:

```jsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// Import components

function App() {
  return (
    <Router>
      {/* Add Navigation Bar here */}
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        {/* Add Admin routes here */}
      </Routes>
    </Router>
  );
}

export default App;
```