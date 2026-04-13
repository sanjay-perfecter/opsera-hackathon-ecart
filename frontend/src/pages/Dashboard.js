import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ClipboardList, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, PageHeader, Button } from '../components/ui';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Dashboard"
          description={user?.name ? `Welcome back, ${user.name}.` : 'Welcome back.'}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Shop products</h2>
                <p className="mt-1 text-sm text-slate-600 leading-6">
                  Browse inventory and add items to your cart.
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/products">
                <Button variant="outline">Browse products</Button>
              </Link>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Your orders</h2>
                <p className="mt-1 text-sm text-slate-600 leading-6">
                  Track recent purchases and delivery details.
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <ClipboardList className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/orders">
                <Button variant="outline">View orders</Button>
              </Link>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Profile</h2>
                <p className="mt-1 text-sm text-slate-600 leading-6">
                  Update your account information.
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <UserIcon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/profile">
                <Button variant="outline">Manage profile</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
