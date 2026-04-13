import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import StoreLayout from './components/layouts/StoreLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Pages
import Home from './pages/Home';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageProducts from './pages/admin/ManageProducts';
import ManageCategories from './pages/admin/ManageCategories';
import ManageOrders from './pages/admin/ManageOrders';

// Components
import AdminRoute from './components/AdminRoute';
import UserRoute from './components/UserRoute';

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <Routes>
                        {/* Store Routes - wrapped with StoreLayout */}
                        <Route element={<StoreLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/signin" element={<Signin />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/products/:id" element={<ProductDetail />} />

                            {/* Protected User Routes */}
                            <Route element={<UserRoute />}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                                <Route path="/checkout/cancel" element={<CheckoutCancel />} />
                                <Route path="/orders" element={<Orders />} />
                                <Route path="/profile" element={<Profile />} />
                            </Route>
                        </Route>

                        {/* Admin Routes - wrapped with AdminRoute and AdminLayout */}
                        <Route element={<AdminRoute />}>
                            <Route element={<AdminLayout />}>
                                <Route path="/admin" element={<AdminDashboard />} />
                                <Route path="/admin/users" element={<ManageUsers />} />
                                <Route path="/admin/products" element={<ManageProducts />} />
                                <Route path="/admin/categories" element={<ManageCategories />} />
                                <Route path="/admin/orders" element={<ManageOrders />} />
                            </Route>
                        </Route>
                    </Routes>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
