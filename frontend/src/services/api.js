const API_URL = 'http://localhost:8000';

export const getProducts = async () => {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    return await response.json();
};

export const getProductById = async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch product ${id}`);
    }
    return await response.json();
};

export const createProduct = async (product) => {
    const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
    });
    if (!response.ok) {
        throw new Error('Failed to create product');
    }
    return await response.json();
};

export const updateProduct = async (id, product) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
    });
    if (!response.ok) {
        throw new Error('Failed to update product');
    }
    return await response.json();
};

export const deleteProduct = async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete product');
    }
    // For DELETE, there might be no content, so we don't try to parse json
    return response;
};

export const getCategories = async () => {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) {
        throw new Error('Failed to fetch categories');
    }
    return await response.json();
};

export const getCategoryById = async (id) => {
    const response = await fetch(`${API_URL}/categories/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch category ${id}`);
    }
    return await response.json();
};

export const createCategory = async (category) => {
    const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
    });
    if (!response.ok) {
        throw new Error('Failed to create category');
    }
    return await response.json();
};

export const updateCategory = async (id, category) => {
    const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
    });
    if (!response.ok) {
        throw new Error('Failed to update category');
    }
    return await response.json();
};

export const deleteCategory = async (id) => {
    const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete category');
    }
    return response;
};

// --- Order API ---
export const getOrders = async () => {
    const response = await fetch(`${API_URL}/orders`);
    if (!response.ok) {
        throw new Error('Failed to fetch orders');
    }
    return await response.json();
};

export const getOrderById = async (id) => {
    const response = await fetch(`${API_URL}/orders/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch order ${id}`);
    }
    return await response.json();
};

export const updateOrder = async (id, orderUpdate) => {
    const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderUpdate),
    });
    if (!response.ok) {
        throw new Error('Failed to update order');
    }
    return await response.json();
};

export const createOrder = async (order) => {
    const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
    });
    if (!response.ok) {
        throw new Error('Failed to create order');
    }
    return await response.json();
};

export const deleteOrder = async (id) => {
    const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete order');
    }
    return response;
};

// --- Order Detail API ---
export const getOrderDetails = async (orderId) => {
    // Note: The API doesn't have a direct /orders/{id}/details endpoint.
    // We fetch all details and filter, which is not ideal for production
    // but works for this admin panel. A dedicated endpoint would be better.
    const response = await fetch(`${API_URL}/order_details`);
    if (!response.ok) {
        throw new Error('Failed to fetch order details');
    }
    const allDetails = await response.json();
    if (orderId) {
        return allDetails.filter(detail => detail.order_id === orderId);
    }
    return allDetails;
};

export const getOrderDetailById = async (id) => {
    const response = await fetch(`${API_URL}/order_details/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch order detail');
    }
    return await response.json();
};

export const createOrderDetail = async (orderDetail) => {
    const response = await fetch(`${API_URL}/order_details`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetail),
    });
    if (!response.ok) {
        throw new Error('Failed to create order detail');
    }
    return await response.json();
};

export const updateOrderDetail = async (id, data) => {
    const response = await fetch(`${API_URL}/order_details/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to update order detail');
    }
    return await response.json();
};

export const deleteOrderDetail = async (id) => {
    const response = await fetch(`${API_URL}/order_details/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
        throw new InactiveOrderError('Failed to delete order detail');
    }
    return response;
};

// --- Client API ---
export const getClients = async () => {
    const response = await fetch(`${API_URL}/clients`);
    if (!response.ok) {
        throw new Error('Failed to fetch clients');
    }
    return await response.json();
};

export const getClientById = async (id) => {
    const response = await fetch(`${API_URL}/clients/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch client ${id}`);
    }
    return await response.json();
};

export const createClient = async (client) => {
    const response = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(client),
    });
    if (!response.ok) {
        throw new Error('Failed to create client');
    }
    return await response.json();
};

export const updateClient = async (id, clientUpdate) => {
    const response = await fetch(`${API_URL}/clients/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientUpdate),
    });
    if (!response.ok) {
        throw new Error('Failed to update client');
    }
    return await response.json();
};

export const deleteClient = async (id) => {
    const response = await fetch(`${API_URL}/clients/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete client');
    }
    return response;
};

// --- Review API ---
export const getReviews = async () => {
    const response = await fetch(`${API_URL}/reviews`);
    if (!response.ok) {
        throw new Error('Failed to fetch reviews');
    }
    return await response.json();
};

export const getReviewById = async (id) => {
    const response = await fetch(`${API_URL}/reviews/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch review');
    }
    return await response.json();
};

export const createReview = async (review) => {
    const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(review),
    });
    if (!response.ok) {
        throw new Error('Failed to create review');
    }
    return await response.json();
};

export const updateReview = async (id, reviewData) => {
    const response = await fetch(`${API_URL}/reviews/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
    });
    if (!response.ok) {
        throw new Error('Failed to update review');
    }
    return await response.json();
};

export const deleteReview = async (id) => {
    const response = await fetch(`${API_URL}/reviews/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete review');
    }
    return response;
};

// --- Health Check API ---
export const getHealthCheck = async () => {
    const response = await fetch(`${API_URL}/health_check`);
    if (!response.ok) {
        throw new Error('Failed to fetch system health');
    }
    return await response.json();
};

// --- Address API ---
export const getAddressesForClient = async (clientId) => {
    const response = await fetch(`${API_URL}/addresses?client_id=${clientId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch addresses');
    }
    return await response.json();
};

export const getAddressById = async (addressId) => {
    const response = await fetch(`${API_URL}/addresses/${addressId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch address');
    }
    return await response.json();
};

export const createAddress = async (address) => {
    const response = await fetch(`${API_URL}/addresses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(address),
    });
    if (!response.ok) {
        throw new Error('Failed to create address');
    }
    return await response.json();
};

export const updateAddress = async (addressId, addressData) => {
    const response = await fetch(`${API_URL}/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
    });
    if (!response.ok) {
        throw new Error('Failed to update address');
    }
    return await response.json();
};

export const deleteAddress = async (addressId) => {
    const response = await fetch(`${API_URL}/addresses/${addressId}`, {
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete address');
    }
    return response;
};

// --- Bill API ---
export const getBills = async () => {
    const response = await fetch(`${API_URL}/bills`);
    if (!response.ok) {
        throw new Error('Failed to fetch bills');
    }
    return await response.json();
};

export const getBillById = async (id) => {
    const response = await fetch(`${API_URL}/bills/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch bill ${id}`);
    }
    return await response.json();
};

export const createBill = async (bill) => {
    const response = await fetch(`${API_URL}/bills`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bill),
    });
    if (!response.ok) {
        throw new Error('Failed to create bill');
    }
    return await response.json();
};

export const updateBill = async (id, billUpdate) => {
    const response = await fetch(`${API_URL}/bills/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(billUpdate),
    });
    if (!response.ok) {
        throw new Error('Failed to update bill');
    }
    return await response.json();
};

export const deleteBill = async (id) => {
    const response = await fetch(`${API_URL}/bills/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete bill');
    }
    return response;
};
