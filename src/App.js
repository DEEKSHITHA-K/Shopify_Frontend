// src/App.js (Shopify-Inspired UI)
import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Package, LogOut, User, ListOrdered, Home, LogIn, UserPlus, Search, XCircle } from 'lucide-react';
import ProductList from './components/ProductList';
import Login from './components/Login';
import Register from './components/Register';
import OrderHistory from './components/OrderHistory';
import {
  placeOrder,
  addToCart,
  fetchCartItems,
  removeCartItem,
  clearAuthToken,
  loginUser,
  registerUser
} from './services/api';

const App = () => {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // { id, username }
  const [currentPage, setCurrentPage] = useState('products'); // For simple routing

  // Cart State
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckoutMessage, setShowCheckoutMessage] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [fetchError, setFetchError] = useState(null); // To display general fetch errors

  // Effect to check login status on app load
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    if (token && userId && username) {
      setIsLoggedIn(true);
      setCurrentUser({ id: userId, username: username });
    }
  }, []);

  // Fetch cart items from backend when user logs in or cart updates
  const updateCartFromBackend = useCallback(async () => {
    if (isLoggedIn && localStorage.getItem('jwtToken')) {
      try {
        const data = await fetchCartItems(localStorage.getItem('jwtToken'));
        const formattedCartItems = data.map(item => ({
            id: item.productId,
            name: item.productName,
            price: item.price,
            imageUrl: item.imageUrl,
            quantity: item.quantity
        }));
        setCartItems(formattedCartItems);
        setFetchError(null);
      } catch (error) {
        console.error("Failed to fetch cart items:", error);
        setFetchError(error.message || "Failed to load cart. Please log in again if session expired.");
        if (error.message.includes('Session expired')) {
          handleLogout();
        }
      }
    } else {
      setCartItems([]);
    }
  }, [isLoggedIn]);

  useEffect(() => {
      updateCartFromBackend();
  }, [updateCartFromBackend]);


  // Calculate total items in cart
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Add item to cart or update quantity if it already exists
  const handleAddToCart = async (product) => {
    if (!isLoggedIn) {
      setFetchError("Please log in to add items to your cart.");
      return;
    }
    try {
      await addToCart(product.id, 1, localStorage.getItem('jwtToken'));
      updateCartFromBackend();
      setIsCartOpen(true);
      setFetchError(null);
    } catch (error) {
      console.error("Failed to add product to cart:", error);
      setFetchError(error.message || "Failed to add product to cart. Please try again.");
    }
  };

  // Remove item from cart or decrease quantity
  const handleRemoveFromCart = async (productId) => {
    if (!isLoggedIn) return;
    try {
      await removeCartItem(productId, 1, localStorage.getItem('jwtToken'));
      updateCartFromBackend();
      setFetchError(null);
    } catch (error) {
      console.error("Failed to remove product from cart (decrease quantity):", error);
      setFetchError(error.message || "Failed to remove product. Please try again.");
    }
  };

  // Completely remove an item regardless of quantity
  const handleRemoveAllOfItem = async (productId) => {
    if (!isLoggedIn) return;
    try {
      await removeCartItem(productId, -1, localStorage.getItem('jwtToken'));
      updateCartFromBackend();
      setFetchError(null);
    } catch (error) {
      console.error("Failed to remove all of item from cart:", error);
      setFetchError(error.message || "Failed to remove all items. Please try again.");
    }
  };


  // Calculate total price of items in cart
  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const handleCheckout = async () => {
    setCheckoutError('');
    setFetchError(null);
    if (!isLoggedIn) {
      setCheckoutError("Please log in to place an order.");
      setCurrentPage('login');
      return;
    }

    if (cartItems.length === 0) {
      setCheckoutError("Your cart is empty. Add items before checking out.");
      return;
    }

    const shippingDetails = {
      shippingAddress: "123 Main St", // Placeholder, ideally from user input
      shippingCity: "Anytown",
      shippingPostalCode: "12345",
      shippingCountry: "USA"
    };

    try {
      const response = await placeOrder(cartItems, shippingDetails);
      console.log("Order placed successfully:", response);

      setCartItems([]);
      setIsCartOpen(false);
      setShowCheckoutMessage(true);
      setTimeout(() => setShowCheckoutMessage(false), 3000);
    } catch (error) {
      console.error("Error during checkout:", error);
      setCheckoutError(error.message || "Failed to place order. Please try again.");
    }
  };

  const handleLoginSuccess = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      setIsLoggedIn(true);
      setCurrentUser({
        id: response.userId,
        username: response.username
      });
      setCurrentPage('products');
      updateCartFromBackend();
      setFetchError(null);
    } catch (error) {
      setFetchError(error.message || "Login failed. Please check your credentials.");
      console.error("Login attempt failed:", error);
    }
  };

  const handleRegisterSuccess = async (name, email, password) => {
    try {
      const response = await registerUser({ name, email, password });
      setIsLoggedIn(true);
      setCurrentUser({
        id: response.userId,
        username: response.username
      });
      setCurrentPage('products');
      updateCartFromBackend();
      setFetchError(null);
    } catch (error) {
      setFetchError(error.message || "Registration failed. This email might already be registered.");
      console.error("Registration attempt failed:", error);
    }
  };


  const handleLogout = () => {
    clearAuthToken();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCartItems([]);
    setCurrentPage('products');
    setFetchError(null);
    setCheckoutError(null);
  };

  // Simple routing logic using switch/case
  const renderPage = () => {
    switch (currentPage) {
      case 'products':
        return <ProductList onAddToCart={handleAddToCart} />;
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} navigate={setCurrentPage} />;
      case 'register':
        return <Register onRegisterSuccess={handleRegisterSuccess} navigate={setCurrentPage} />;
      case 'order-history':
        return <OrderHistory navigate={setCurrentPage} />;
      default:
        return <ProductList onAddToCart={handleAddToCart} />;
    }
  };

  return (
    <div className="font-sans antialiased bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white text-gray-800 shadow-sm p-4 md:p-6 sticky top-0 z-50">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-4 mb-3 md:mb-0">
            <h1 className="text-3xl font-extrabold flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('products')}>
              <Package size={32} className="text-indigo-600" />
              <span className="text-gray-900">E-Shop</span>
            </h1>
            {/* Search Bar - Simplified, can be expanded */}
            <div className="relative flex items-center hidden md:flex">
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm w-48"
              />
              <Search size={18} className="absolute left-3 text-gray-400" />
            </div>
          </div>

          <nav className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentPage('products')}
              className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 flex items-center gap-1 text-base font-medium"
              aria-label="Home"
            >
              <Home size={20} /> <span className="hidden sm:inline">Home</span>
            </button>

            {isLoggedIn && (
              <>
                <button
                  onClick={() => setCurrentPage('order-history')}
                  className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 flex items-center gap-1 text-base font-medium"
                  aria-label="Order History"
                >
                  <ListOrdered size={20} /> <span className="hidden sm:inline">Orders</span>
                </button>
                <span className="hidden lg:inline text-gray-600 text-base font-medium">Hello, {currentUser?.username?.split('@')[0] || 'User'}!</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-200 flex items-center gap-1"
                  aria-label="Logout"
                >
                  <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
            {!isLoggedIn && (
              <>
                <button
                  onClick={() => setCurrentPage('login')}
                  className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 flex items-center gap-1 text-base font-medium"
                  aria-label="Login"
                >
                  <LogIn size={20} /> <span className="hidden sm:inline">Login</span>
                </button>
                <button
                  onClick={() => setCurrentPage('register')}
                  className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 flex items-center gap-1 text-base font-medium"
                  aria-label="Register"
                >
                  <UserPlus size={20} /> <span className="hidden sm:inline">Register</span>
                </button>
              </>
            )}
            <div className="relative">
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative p-2 rounded-full text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                aria-label="Toggle Cart"
              >
                <ShoppingCart size={24} />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    {totalCartItems}
                  </span>
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      {currentPage === 'products' && (
        <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-16 md:py-24 text-center shadow-lg">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-4 animate-fade-in-up">
              Discover Your Next Favorite Item
            </h2>
            <p className="text-lg md:text-xl opacity-90 mb-8 animate-fade-in-up delay-200">
              Quality products, unbeatable prices. Shop now!
            </p>
            <button
              onClick={() => { /* Scroll to products section or another action */ }}
              className="bg-white text-indigo-700 px-8 py-3 rounded-full text-lg font-bold shadow-md hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 animate-fade-in-up delay-400"
            >
              Start Shopping
            </button>
          </div>
        </section>
      )}


      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {/* Alerts and Messages */}
        {(fetchError || checkoutError || showCheckoutMessage) && (
          <div className={`p-4 mb-6 rounded-lg shadow-md max-w-full lg:max-w-3xl mx-auto flex items-center justify-between transition-all duration-300 ${
            fetchError || checkoutError ? 'bg-red-100 border-l-4 border-red-500 text-red-700' :
            showCheckoutMessage ? 'bg-green-100 border-l-4 border-green-500 text-green-700' : ''
          }`} role="alert">
            <div className="flex items-center">
              {fetchError || checkoutError ? <XCircle size={20} className="mr-3" /> : <Package size={20} className="mr-3" />}
              <div>
                <p className="font-bold">
                  {fetchError ? "Error!" : checkoutError ? "Checkout Error!" : "Order Placed!"}
                </p>
                <p className="text-sm">
                  {fetchError || checkoutError || "Your order has been successfully placed. Thank you for shopping with us!"}
                </p>
              </div>
            </div>
            <button
              onClick={() => { setFetchError(null); setCheckoutError(null); setShowCheckoutMessage(false); }}
              className="p-1 rounded-full text-current hover:bg-opacity-20 transition-colors duration-200"
              aria-label="Close message"
            >
              <XCircle size={20} />
            </button>
          </div>
        )}

        {/* Dynamic Page Content */}
        <section className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          {renderPage()}
        </section>
      </main>

      {/* Shopping Cart Sidebar */}
      <div className={`fixed inset-y-0 right-0 bg-white shadow-2xl z-50 w-80 max-w-full transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCart size={24} className="text-indigo-600" /> Your Cart
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors duration-200"
              aria-label="Close Cart"
            >
              <XCircle size={24} />
            </button>
          </div>

          {cartItems.length === 0 ? (
            <p className="text-gray-500 text-center py-10 px-4 flex-grow">
              {isLoggedIn ? "Your cart is empty." : "Please log in to view and manage your cart."}
            </p>
          ) : (
            <>
              <ul className="flex-grow space-y-3 overflow-y-auto p-4 custom-scrollbar">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/64x64/E0E0E0/999999?text=Item"; }}
                      />
                      <div>
                        <h4 className="font-semibold text-gray-800 text-base">{item.name}</h4>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)} x {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-lg text-indigo-700">${(item.price * item.quantity).toFixed(2)}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          -
                        </button>
                        <span className="font-medium text-md px-1">{item.quantity}</span>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemoveAllOfItem(item.id)}
                          className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors duration-200"
                          aria-label={`Remove all of ${item.name}`}
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="p-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-indigo-700">${calculateTotalPrice()}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-200 font-semibold text-lg flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={24} /> Checkout
                </button>
              </div>
            </>
          )}
        </div>
        {isCartOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsCartOpen(false)}></div>}


      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 p-6 text-center mt-auto">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} E-Shop Central. All rights reserved.</p>
          <p className="text-sm mt-2">Designed with <span role="img" aria-label="heart">❤️</span> for modern e-commerce.</p>
        </div>
      </footer>

      {/* Tailwind CSS CDN is usually in public/index.html or handled by build process.
          Custom styles from here will be injected via React. */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1; /* gray-300 */
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8; /* gray-400 */
          }
          /* Keyframe for fade-in-up animation */
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
            opacity: 0; /* Hidden by default */
          }
          .animate-fade-in-up.delay-200 {
            animation-delay: 0.2s;
          }
          .animate-fade-in-up.delay-400 {
            animation-delay: 0.4s;
          }
        `}
      </style>
    </div>
  );
};

export default App;
