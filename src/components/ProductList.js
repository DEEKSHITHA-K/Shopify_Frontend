// src/components/ProductList.js (Shopify-Inspired UI)
import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { fetchProducts } from '../services/api';

const ProductList = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10 bg-white rounded-lg shadow-sm">
        <p className="text-xl font-medium text-indigo-700 mb-4">Loading products...</p>
        <svg className="animate-spin mx-auto h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg shadow-md mx-auto" role="alert">
        <p className="font-bold">Error loading products:</p>
        <p>{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 bg-white rounded-lg shadow-sm">
        <p className="text-2xl font-semibold mb-4">No products found.</p>
        <p>Please add some products to the database to see them here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-103 hover:shadow-lg border border-gray-200">
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/E0E0E0/666666?text=${encodeURIComponent(product.name)}`; }}
            />
          </div>
          <div className="p-4 flex flex-col justify-between h-[calc(100%-12rem)]"> {/* Adjust height based on image height */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">{product.description}</p> {/* Consistent description height */}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center mt-2 pt-3 border-t border-gray-100">
              <span className="text-2xl font-extrabold text-indigo-700 mb-2 sm:mb-0">${product.price.toFixed(2)}</span>
              <button
                onClick={() => onAddToCart(product)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-200 text-sm"
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingCart size={16} /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
