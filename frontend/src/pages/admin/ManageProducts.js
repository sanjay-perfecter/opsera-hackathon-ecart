import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2, RotateCcw, Plus, Eye, EyeOff, X, Tag, Package } from 'lucide-react';
import productService from '../../services/productService';
import { formatPrice, getImageUrl } from '../../utils/helpers';
import { Button, Input, Select, Textarea, Card, ListCard, ViewToggle, Badge, Spinner, Alert, PageHeader, ConfirmDialog } from '../../components/ui';

const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  category: z.string().min(1, 'Please select a category'),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Price must be a positive number'
  }),
  quantity: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: 'Quantity must be a non-negative number'
  }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  unit: z.string().min(1, 'Please select a unit'),
});

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [confirm, setConfirm] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: '',
      price: '',
      quantity: '',
      description: '',
      unit: 'kg'
    }
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDeleted]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productService.getProducts({ includeDeleted: showDeleted ? 'true' : 'false' }),
        productService.getCategories()
      ]);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.error('Failed to load data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setMessage({ type: '', text: '' });
    setSubmitting(true);

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('category', data.category);
    formData.append('price', data.price);
    formData.append('quantity', data.quantity);
    formData.append('description', data.description);
    formData.append('unit', data.unit);
    if (imageFile) formData.append('image', imageFile);

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, formData);
        setMessage({ type: 'success', text: 'Product updated successfully!' });
      } else {
        await productService.createProduct(formData);
        setMessage({ type: 'success', text: 'Product created successfully!' });
      }
      loadData();
      resetForm();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save product' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      category: product.category?.slug || product.category,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      description: product.description,
      unit: product.unit
    });
    setShowForm(true);
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (id) => {
    setConfirm({
      title: 'Delete product?',
      description: 'This action can be reversed by restoring the product later.',
      confirmLabel: 'Delete',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await productService.deleteProduct(id);
          setMessage({ type: 'success', text: 'Product deleted successfully!' });
          loadData();
        } catch (error) {
          setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete product' });
        }
      },
    });
  };

  const handleRestore = async (id) => {
    try {
      await productService.restoreProduct(id);
      setMessage({ type: 'success', text: 'Product restored successfully!' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to restore product' });
    }
  };

  const resetForm = () => {
    reset({
      name: '',
      category: '',
      price: '',
      quantity: '',
      description: '',
      unit: 'kg'
    });
    setImageFile(null);
    setEditingProduct(null);
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
        title="Products"
        description="Create, edit, and manage product inventory."
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
              {showForm ? 'Cancel' : 'Add Product'}
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
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input
                label="Product Name"
                placeholder="Fresh Tomatoes"
                error={errors.name?.message}
                {...register('name')}
              />

              <Select
                label="Category"
                error={errors.category?.message}
                {...register('category')}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </Select>

              <Input
                label="Price"
                type="number"
                step="0.01"
                placeholder="99.99"
                error={errors.price?.message}
                {...register('price')}
              />

              <Input
                label="Quantity"
                type="number"
                placeholder="100"
                error={errors.quantity?.message}
                {...register('quantity')}
              />

              <Select
                label="Unit"
                error={errors.unit?.message}
                {...register('unit')}
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="piece">Piece</option>
                <option value="dozen">Dozen</option>
                <option value="bunch">Bunch</option>
              </Select>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus:border-transparent outline-none hover:border-slate-400 bg-white file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-800 hover:file:bg-slate-200"
                />
              </div>
            </div>

            <Textarea
              label="Description"
              placeholder="Describe the product..."
              rows={4}
              error={errors.description?.message}
              {...register('description')}
            />

            <div className="flex gap-4 mt-6">
              <Button type="submit" loading={submitting}>
                {editingProduct ? 'Update Product' : 'Create Product'}
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
        {products.map((product) => (
          <ListCard
            key={product._id}
            variant={viewMode}
            image={getImageUrl(product.imageUrl)}
            title={product.name}
            subtitle={product.category?.name || product.category}
            isDeleted={product.isDeleted}
            badge={product.isDeleted ? <Badge variant="danger" size="sm">Deleted</Badge> : null}
            metadata={[
              { icon: Tag, value: formatPrice(product.price), className: 'font-semibold text-primary-700' },
              { icon: Package, value: `Stock: ${product.quantity} ${product.unit}` }
            ]}
            actions={
              !product.isDeleted ? (
                <>
                  <Button
                    onClick={() => handleEdit(product)}
                    variant="ghost"
                    size="sm"
                    iconOnly
                    title="Edit"
                    leftIcon={Pencil}
                  />
                  <Button
                    onClick={() => handleDelete(product._id)}
                    variant="ghost-danger"
                    size="sm"
                    iconOnly
                    title="Delete"
                    leftIcon={Trash2}
                  />
                </>
              ) : (
                <Button
                  onClick={() => handleRestore(product._id)}
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
    </div>
  );
};

export default ManageProducts;
