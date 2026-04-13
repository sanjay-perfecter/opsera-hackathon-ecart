import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, RotateCcw, Plus, Eye, EyeOff, X, Search, User, Mail, Calendar, Shield } from 'lucide-react';
import userService from '../../services/userService';
import { formatDate } from '../../utils/helpers';
import { Card, ListCard, ViewToggle, Input, Button, Spinner, Alert, Badge, Select, PageHeader, ConfirmDialog } from '../../components/ui';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Must be a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').regex(/\d/, 'Password must contain at least one number'),
  role: z.enum(['user', 'admin']),
});

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleted, setShowDeleted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [confirm, setConfirm] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'user'
    }
  });

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDeleted, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        includeDeleted: showDeleted ? 'true' : 'false'
      };

      if (roleFilter) {
        params.role = roleFilter;
      }

      const response = await userService.getUsers(params);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
      setMessage({ type: 'error', text: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setMessage({ type: '', text: '' });
    setSubmitting(true);

    try {
      await userService.createUser(data);
      setMessage({ type: 'success', text: 'User created successfully!' });
      loadUsers();
      resetForm();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create user' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setConfirm({
      title: 'Change user role?',
      description: `This will update the user’s role to "${newRole}".`,
      confirmLabel: 'Change role',
      confirmVariant: 'primary',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await userService.updateUserRole(userId, newRole);
          setMessage({ type: 'success', text: 'User role updated successfully!' });
          loadUsers();
        } catch (error) {
          setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update role' });
        }
      },
    });
  };

  const handleDeleteUser = async (userId) => {
    setConfirm({
      title: 'Delete user?',
      description: 'This action can be reversed by restoring the user later.',
      confirmLabel: 'Delete',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await userService.deleteUser(userId);
          setMessage({ type: 'success', text: 'User deleted successfully!' });
          loadUsers();
        } catch (error) {
          setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete user' });
        }
      },
    });
  };

  const handleRestoreUser = async (userId) => {
    try {
      await userService.restoreUser(userId);
      setMessage({ type: 'success', text: 'User restored successfully!' });
      loadUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to restore user' });
    }
  };

  const resetForm = () => {
    reset({
      name: '',
      email: '',
      password: '',
      role: 'user'
    });
    setShowForm(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div>
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        description={confirm?.description}
        confirmLabel={confirm?.confirmLabel}
        confirmVariant={confirm?.confirmVariant}
        onClose={() => setConfirm(null)}
        onConfirm={confirm?.onConfirm}
      />
      <PageHeader
        title="Users"
        description="Create users, manage roles, and review account status."
        actions={
          <>
            <ViewToggle view={viewMode} onChange={setViewMode} />
            <Button
              variant={showDeleted ? 'secondary' : 'outline'}
              onClick={() => setShowDeleted(!showDeleted)}
              leftIcon={showDeleted ? EyeOff : Eye}
            >
              {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              leftIcon={showForm ? X : Plus}
            >
              {showForm ? 'Cancel' : 'Add User'}
            </Button>
          </>
        }
      />

      {message.text && (
        <Alert variant={message.type === 'success' ? 'success' : 'error'} className="mb-6">
          {message.text}
        </Alert>
      )}

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Add New User</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input
                label="Name"
                placeholder="John Doe"
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Must be at least 6 characters"
                error={errors.password?.message}
                {...register('password')}
              />

              <Select
                label="Role"
                error={errors.role?.message}
                {...register('role')}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button type="submit" loading={submitting}>
                Create User
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </Select>
        </div>
      </Card>

      <div className={viewMode === 'grid'
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        : "flex flex-col gap-4"
      }>
        {filteredUsers.map((user) => (
          <ListCard
            key={user._id}
            variant={viewMode}
            icon={User}
            iconBg={user.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'}
            iconColor={user.role === 'admin' ? 'text-purple-600' : 'text-blue-600'}
            title={user.name}
            isDeleted={user.isDeleted}
            badge={
              user.isDeleted ? (
                <Badge variant="danger" size="sm">Deleted</Badge>
              ) : (
                <Badge variant="success" size="sm">Active</Badge>
              )
            }
            metadata={[
              { icon: Mail, value: user.email },
              { icon: Shield, value: user.role === 'admin' ? 'Administrator' : 'User', className: user.role === 'admin' ? 'text-purple-600 font-medium' : 'text-gray-600' },
              { icon: Calendar, value: formatDate(user.createdAt) }
            ]}
            actions={
              <>
                {!user.isDeleted && viewMode === 'list' && (
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 bg-white mr-2"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                )}
                {!user.isDeleted ? (
                  <Button
                    variant="ghost-danger"
                    size="sm"
                    iconOnly
                    title="Delete"
                    onClick={() => handleDeleteUser(user._id)}
                    leftIcon={Trash2}
                  />
                ) : (
                  <Button
                    variant="ghost-success"
                    size="sm"
                    iconOnly
                    title="Restore"
                    onClick={() => handleRestoreUser(user._id)}
                    leftIcon={RotateCcw}
                  />
                )}
              </>
            }
          >
            {/* Role Change Select - only show in grid view */}
            {!user.isDeleted && viewMode === 'grid' && (
              <div className="mt-2">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 bg-white"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
          </ListCard>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="text-center py-12 text-slate-500">
          No users found matching your search.
        </Card>
      )}

      <div className="mt-4 text-sm text-slate-600">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
};

export default ManageUsers;
