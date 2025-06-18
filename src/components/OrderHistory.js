// src/components/OrderHistory.js (Shopify-Inspired UI)
import React, { useState, useEffect } from 'react';
import { Package, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchOrderHistory, getAuthToken } from '../services/api';

const OrderHistory = ({ navigate }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const getOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        if (!token) {
          setError("You must be logged in to view order history.");
          setLoading(false);
          navigate('login');
          return;
        }
        const data = await fetchOrderHistory(token);
        setOrders(data);
      } catch (err) {
        console.error("Error fetching order history:", err);
        setError(err.message || "Failed to load order history. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    getOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div className="text-center py-10 bg-white rounded-lg shadow-sm">
        <p className="text-xl font-medium text-indigo-700 mb-4">Loading order history...</p>
        <svg className="animate-spin mx-auto h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg shadow-md mx-auto relative" role="alert">
        <p className="font-bold">Error loading orders:</p>
        <p>{error}</p>
        <button
          onClick={() => setError(null)}
          className="absolute top-2 right-2 p-1 rounded-full text-red-700 hover:text-red-900 hover:bg-red-200 transition-colors duration-200"
          aria-label="Close error message"
        >
          <XCircle size={20} />
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 bg-white rounded-lg shadow-sm">
        <p className="text-2xl font-semibold mb-4">No past orders found.</p>
        <p>Start shopping to see your orders here!</p>
        <button
            onClick={() => navigate('products')}
            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 transition-colors duration-200 font-semibold"
        >
            Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Your Order History</h2>
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-lg shadow-md p-5 border border-gray-100 transition-all duration-300 hover:shadow-lg">
          <div className="flex justify-between items-center cursor-pointer pb-3 border-b border-gray-200" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Order #{order.id}</h3>
              <p className="text-gray-600 text-sm">Date: {new Date(order.orderDate).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-indigo-700">${order.totalAmount.toFixed(2)}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status}
              </span>
              {expandedOrder === order.id ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
            </div>
          </div>

          {expandedOrder === order.id && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="font-semibold text-gray-800 mb-1">Shipping Address:</p>
              <p className="text-gray-700 text-sm">{order.shippingAddress}, {order.shippingCity}, {order.shippingPostalCode}, {order.shippingCountry}</p>

              <h4 className="font-semibold text-gray-800 mt-3 mb-2">Items:</h4>
              <ul className="space-y-2">
                {order.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-md shadow-sm border border-gray-100">
                    <img
                        src={item.productImageUrl}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded-md shadow-sm"
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/48x48/E0E0E0/999999?text=Item"; }}
                    />
                    <div className="flex-grow">
                      <p className="font-medium text-gray-800 text-base">{item.productName}</p>
                      <p className="text-sm text-gray-600">${item.priceAtOrder.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <span className="font-bold text-base text-indigo-700">${(item.priceAtOrder * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;
