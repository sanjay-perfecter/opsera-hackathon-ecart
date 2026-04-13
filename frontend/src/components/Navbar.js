import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Leaf, ShoppingCart, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape
  useEffect(() => {
    if (!dropdownOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
  };

  return (
    <nav className="bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm">
                  <Leaf className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-base font-semibold text-slate-900 tracking-tight">MetaYB</span>
              </span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `inline-flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                    isActive ? 'text-slate-900 bg-slate-100' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `inline-flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                    isActive ? 'text-slate-900 bg-slate-100' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                Products
              </NavLink>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/cart"
                  className="relative p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                    aria-haspopup="menu"
                    aria-expanded={dropdownOpen}
                  >
                    <span>{user?.name}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {dropdownOpen && (
                    <div role="menu" className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-1.5 z-50 border border-slate-200">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                        role="menuitem"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                        role="menuitem"
                      >
                        My Orders
                      </Link>
                      <div className="my-1 border-t border-slate-200" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors rounded-md px-2 py-1.5 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
