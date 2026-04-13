import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import { Button, Input, Card, Alert } from '../components/ui';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

const Profile = () => {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  });

  const onSubmit = async (data) => {
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      await userService.updateUser(user._id, data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
      
      // Update local user data
      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset({
      name: user?.name || '',
      email: user?.email || ''
    });
    setEditing(false);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Profile</h1>

        <Card>
          <div className="pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              {!editing && (
                <Button onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          <div className="py-6">
            {message.text && (
              <Alert 
                variant={message.type === 'success' ? 'success' : 'error'}
                className="mb-6"
              >
                {message.text}
              </Alert>
            )}

            {editing ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  <Input
                    label="Full Name"
                    error={errors.name?.message}
                    {...register('name')}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    error={errors.email?.message}
                    {...register('email')}
                  />

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      loading={loading}
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Email Address</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Role</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{user?.role}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Member Since</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(user?.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Account Actions</h3>
            <Button
              variant="danger"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
