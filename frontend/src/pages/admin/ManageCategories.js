import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2, RotateCcw, Plus, Eye, EyeOff, X, Tags, Link } from 'lucide-react';
import productService from '../../services/productService';
import { Button, Input, Card, ListCard, ViewToggle, Spinner, Alert, Badge, PageHeader, ConfirmDialog } from '../../components/ui';

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [confirm, setConfirm] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: ''
    }
  });

  const name = watch('name');

  useEffect(() => {
    loadCategories();
  }, [showDeleted]);

  useEffect(() => {
    // Auto-generate slug from name when creating a new category
    if (!editingCategory && name) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [name, editingCategory, setValue]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await productService.getCategories({ 
        includeDeleted: showDeleted ? 'true' : 'false' 
      });
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setMessage({ type: 'error', text: 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setMessage({ type: '', text: '' });
    setSubmitting(true);

    try {
      if (editingCategory) {
        await productService.updateCategory(editingCategory._id, data);
        setMessage({ type: 'success', text: 'Category updated successfully!' });
      } else {
        await productService.createCategory(data);
        setMessage({ type: 'success', text: 'Category created successfully!' });
      }
      loadCategories();
      resetForm();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save category' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      slug: category.slug
    });
    setShowForm(true);
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (id) => {
    setConfirm({
      title: 'Delete category?',
      description: 'This action can be reversed by restoring the category later.',
      confirmLabel: 'Delete',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await productService.deleteCategory(id);
          setMessage({ type: 'success', text: 'Category deleted successfully!' });
          loadCategories();
        } catch (error) {
          setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete category' });
        }
      },
    });
  };

  const handleRestore = async (id) => {
    try {
      await productService.restoreCategory(id);
      setMessage({ type: 'success', text: 'Category restored successfully!' });
      loadCategories();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to restore category' });
    }
  };

  const resetForm = () => {
    reset({
      name: '',
      slug: ''
    });
    setEditingCategory(null);
    setShowForm(false);
  };

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
        title="Categories"
        description="Create and manage product categories."
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
              {showForm ? 'Cancel' : 'Add Category'}
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
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input
                label="Category Name"
                placeholder="Vegetables"
                error={errors.name?.message}
                {...register('name')}
              />
              
              <Input
                label="Slug (URL-friendly)"
                placeholder="vegetables"
                error={errors.slug?.message}
                {...register('slug')}
              />
            </div>
            
            <div className="flex gap-4">
              <Button type="submit" loading={submitting}>
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
        : "flex flex-col gap-4"
      }>
        {categories.map((category) => (
          <ListCard
            key={category._id}
            variant={viewMode}
            icon={Tags}
            iconBg="bg-accent-100"
            iconColor="text-accent-700"
            title={category.name}
            isDeleted={category.isDeleted}
            badge={category.isDeleted ? <Badge variant="danger" size="sm">Deleted</Badge> : null}
            metadata={[
              { icon: Link, value: `/${category.slug}` }
            ]}
            actions={
              !category.isDeleted ? (
                <>
                  <Button 
                    onClick={() => handleEdit(category)} 
                    variant="ghost"
                    size="sm"
                    iconOnly
                    title="Edit"
                    leftIcon={Pencil}
                  />
                  <Button 
                    onClick={() => handleDelete(category._id)} 
                    variant="ghost-danger"
                    size="sm"
                    iconOnly
                    title="Delete"
                    leftIcon={Trash2}
                  />
                </>
              ) : (
                <Button 
                  onClick={() => handleRestore(category._id)} 
                  variant="ghost-success"
                  size="sm"
                  iconOnly
                  title="Restore"
                  leftIcon={RotateCcw}
                />
              )
            }
          />
        ))}
      </div>

      {categories.length === 0 && (
        <Card className="text-center py-12 text-slate-500">
          No categories found.
        </Card>
      )}
    </div>
  );
};

export default ManageCategories;
