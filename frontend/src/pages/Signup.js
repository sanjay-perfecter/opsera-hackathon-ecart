import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Alert, Card } from '../components/ui';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Signup = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    const result = await signup({
      name: data.name,
      email: data.email,
      password: data.password
    });

    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-3 text-center text-base text-gray-600">
          Or{' '}
          <Link to="/signin" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Full Name"
              type="text"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name')}
            />

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
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              Sign up
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
