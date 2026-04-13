import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Tags, 
  ShoppingCart, 
  Store, 
  Menu, 
  LogOut,
  Leaf
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Breadcrumbs } from '../ui';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Tags },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const breadcrumbs = (() => {
    const path = location.pathname;
    if (!path.startsWith('/admin')) return [];

    const items = [{ label: 'Admin', to: '/admin' }];
    if (path === '/admin') {
      items.push({ label: 'Dashboard' });
      return items;
    }

    const match = navigation
      .filter((n) => n.href !== '/admin')
      .find((n) => path.startsWith(n.href));

    if (match) {
      items.push({ label: match.name });
      return items;
    }

    const rest = path.replace('/admin/', '').split('/')[0];
    items.push({ label: rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : 'Dashboard' });
    return items;
  })();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-slate-950/40 border-b border-white/10">
            <Link to="/admin" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MetaYB Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                    isActive(item.href)
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Back to Store */}
          <div className="p-4 border-t border-white/10">
            <Link
              to="/"
              className="flex items-center px-4 py-3 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <Store className="w-5 h-5 mr-3" />
              Back to Store
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-700">
              <span className="font-medium">{user?.name}</span>
              <span className="ml-2 text-xs text-slate-500">(Admin)</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
