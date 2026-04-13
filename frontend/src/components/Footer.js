import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';

const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">MetaYB</h3>
            <p className="text-gray-400 text-sm">
              Fresh products delivered to your doorstep.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white text-sm">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 hover:text-white text-sm">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((category) => (
                <li key={category._id}>
                  <Link
                    to={`/products?category=${category.slug}`}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="text-gray-400 text-sm">Loading...</li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Email: info@metayb.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Address: 123 Fresh St, Farm City</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} MetaYB. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
