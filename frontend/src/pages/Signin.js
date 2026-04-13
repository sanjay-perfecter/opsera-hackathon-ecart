import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Shield, User as UserIcon } from 'lucide-react';
import { Button, Input, Alert, Card } from '../components/ui';

const signinSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Signin = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signin, user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;
  const [activePane, setActivePane] = useState('user'); // 'user' | 'admin'

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signinSchema),
  });

  // If already logged in, route to the correct dashboard
  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (isAdmin()) {
      navigate('/admin', { replace: true });
      return;
    }
    navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate, isAdmin]);

  const resolvePostLoginRedirect = (nextUser) => {
    const role = nextUser?.role;
    const isAdminUser = role === 'admin';

    if (activePane === 'admin' && !isAdminUser) {
      return { error: 'This account does not have admin access.' };
    }

    if (isAdminUser) {
      if (from && from.startsWith('/admin')) return { to: from };
      return { to: '/admin' };
    }

    if (from && !from.startsWith('/admin')) return { to: from };
    return { to: '/dashboard' };
  };

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    const result = await signin(data);

    setLoading(false);

    if (result.success) {
      const redirect = resolvePostLoginRedirect(result.user);
      if (redirect.error) {
        setError(redirect.error);
        return;
      }
      navigate(redirect.to, { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-semibold text-slate-900 tracking-tight">
          Sign in
        </h2>
        <p className="mt-3 text-center text-sm text-slate-600">
          Or{' '}
          <Link to="/signup" className="font-medium text-primary-700 hover:text-primary-600 transition-colors">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <div className="mb-6">
            <div className="inline-flex w-full rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => { setActivePane('user'); setError(''); }}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                  activePane === 'user'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserIcon className="h-4 w-4" aria-hidden="true" />
                User Login
              </button>
              <button
                type="button"
                onClick={() => { setActivePane('admin'); setError(''); }}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                  activePane === 'admin'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="h-4 w-4" aria-hidden="true" />
                Admin Login
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-600 leading-5">
              {activePane === 'admin'
                ? 'Admin accounts are required to access the admin console.'
                : 'Use your customer account to access your dashboard and orders.'}
            </p>
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              {activePane === 'admin' ? 'Sign in as admin' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-600 bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="font-medium mb-2">For testing purposes:</p>
              <p className="text-xs mb-1">
                <strong>Admin:</strong> Create account and manually set role to 'admin' in database
              </p>
              <p className="text-xs">
                <strong>User:</strong> Any new registration
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Signin;
