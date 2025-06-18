// src/services/api.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const getAuthToken = () => {
  return localStorage.getItem('jwtToken');
};

const setAuthToken = (token) => {
  localStorage.setItem('jwtToken', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
};

const getAuthHeaders = (token) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const addToCart = async (productId, quantity = 1, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ productId, quantity })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const fetchCartItems = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'GET',
      headers: getAuthHeaders(token)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching cart items:", error);
    throw error;
  }
};

export const removeCartItem = async (productId, quantityToRemove, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/remove`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ productId, quantity: quantityToRemove })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
    }
    const data = await response.json();
    setAuthToken(data.jwtToken);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('username', data.username);
    return data;
  } catch (error) {
    console.error("Error during user registration:", error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
          const errorJson = JSON.parse(errorText);
          errorMessage += ` - ${errorJson.message || errorJson.error || 'Unknown Error'}`;
      } catch (e) {
          errorMessage += ` - ${errorText}`;
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    setAuthToken(data.jwtToken);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('username', data.username);
    return data;
  } catch (error) {
    console.error("Error during user login:", error);
    throw error;
  }
};

export const fetchUserDetails = async () => {
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token found.");

  try {
    console.log("[Simulated API] Fetching user details (mock data).");
    return new Promise(resolve => setTimeout(() => resolve({
      id: localStorage.getItem('userId'),
      name: localStorage.getItem('username'),
      email: localStorage.getItem('username'),
      address: "123 Mock Address, Mock City",
      phone: "555-1234"
    }), 500));
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};

export const placeOrder = async (cartItems, shippingDetails) => {
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token found. Please log in.");

  const orderItems = cartItems.map(item => ({
    productId: item.id,
    quantity: item.quantity
  }));

  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ items: orderItems, ...shippingDetails })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
};

export const fetchOrderHistory = async (authToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching order history:", error);
    throw error;
  }
};
