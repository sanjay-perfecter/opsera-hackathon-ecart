import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ShoppingCart, DollarSign, ArrowRight } from 'lucide-react';
import userService from '../../services/userService';
import productService from '../../services/productService';
import orderService from '../../services/orderService';
import { formatPrice } from '../../utils/helpers';
import { Card, Spinner, PageHeader } from '../../components/ui';

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: null,
    products: null,
    orders: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [userStats, productStats, orderStats] = await Promise.all([
        userService.getUserStats(),
        productService.getProductStats(),
        orderService.getOrderStats()
      ]);

      setStats({
        users: userStats.data.stats,
        products: productStats.data.stats,
        orders: orderStats.data.stats
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, link, icon: Icon, iconBg }) => (
    <Link to={link}>
      <Card hover className="h-full group">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <p className="text-3xl font-semibold text-slate-900 mb-1 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-slate-600">{subtitle}</p>}
      </Card>
    </Link>
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Operational overview across users, products, and orders."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.users?.totalUsers || 0}
          subtitle={`${stats.users?.recentUsers || 0} new this week`}
          link="/admin/users"
          icon={Users}
          iconBg="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Total Products"
          value={stats.products?.totalProducts || 0}
          subtitle={`${stats.products?.outOfStock || 0} out of stock`}
          link="/admin/products"
          icon={Package}
          iconBg="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Total Orders"
          value={stats.orders?.totalOrders || 0}
          subtitle={`${stats.orders?.pendingOrders || 0} pending`}
          link="/admin/orders"
          icon={ShoppingCart}
          iconBg="bg-orange-100 text-orange-600"
        />
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats.orders?.totalRevenue || 0)}
          subtitle="From completed orders"
          link="/admin/orders"
          icon={DollarSign}
          iconBg="bg-green-100 text-green-600"
        />
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link 
            to="/admin/users" 
            className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors font-medium text-slate-700 hover:text-slate-900 group"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              <span>Manage Users</span>
            </div>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link 
            to="/admin/products" 
            className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors font-medium text-slate-700 hover:text-slate-900 group"
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5" />
              <span>Manage Products</span>
            </div>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link 
            to="/admin/orders" 
            className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors font-medium text-slate-700 hover:text-slate-900 group"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5" />
              <span>Manage Orders</span>
            </div>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </Card>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Product Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-sm text-slate-700">Vegetables</span>
              <span className="text-xl font-semibold text-slate-900">{stats.products?.totalVegetables || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-sm text-slate-700">Fruits</span>
              <span className="text-xl font-semibold text-slate-900">{stats.products?.totalFruits || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Low Stock</span>
              <span className="text-xl font-semibold text-orange-600">{stats.products?.lowStock || 0}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Order Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-sm text-slate-700">Processing</span>
              <span className="text-xl font-semibold text-blue-600">{stats.orders?.processingOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-sm text-slate-700">Completed</span>
              <span className="text-xl font-semibold text-green-600">{stats.orders?.completedOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Cancelled</span>
              <span className="text-xl font-semibold text-red-600">{stats.orders?.cancelledOrders || 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
