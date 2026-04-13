import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import productService from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getImageUrl } from '../utils/helpers';
import { Button, Badge, Card, Alert, Spinner, PageHeader } from '../components/ui';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProduct(id);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Failed to load product:', error);
      setMessage({ type: 'error', text: 'Product not found' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/signin', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    if (quantity > product.quantity) {
      setMessage({ type: 'error', text: 'Not enough stock available' });
      return;
    }

    setAddingToCart(true);
    setMessage({ type: '', text: '' });

    const result = await addToCart(product._id, quantity);

    setAddingToCart(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Added to cart successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > product.quantity) {
      setMessage({ type: 'error', text: `Only ${product.quantity} items available` });
      return;
    }
    setQuantity(newQuantity);
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-2xl text-gray-600 mb-6">Product not found</p>
          <Button onClick={() => navigate('/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            leftIcon={ArrowLeft}
          >
            Back
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Product Image */}
            <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden">
              <img
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x800?text=No+Image';
                }}
              />
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              <div className="mb-4">
                <Badge variant="primary" size="md">
                  {product.category?.name || product.category}
                </Badge>
              </div>

              <PageHeader
                title={product.name}
                description={product.description}
                className="mb-4"
              />

              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-semibold text-primary-700 tracking-tight">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm text-slate-500">per {product.unit}</span>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                {product.quantity === 0 ? (
                  <Badge variant="danger" size="md">Out of Stock</Badge>
                ) : product.quantity < 10 ? (
                  <Badge variant="warning" size="md">Only {product.quantity} left in stock</Badge>
                ) : (
                  <Badge variant="success" size="md">In Stock</Badge>
                )}
              </div>

              {/* Quantity Selector */}
              {product.quantity > 0 && (
                <div className="mb-6">
                  <label className="block text-xs font-medium text-slate-700 mb-3">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      iconOnly
                      title="Decrease quantity"
                      leftIcon={Minus}
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    />
                    <span className="text-lg font-semibold w-16 text-center text-slate-900">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      iconOnly
                      title="Increase quantity"
                      leftIcon={Plus}
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.quantity}
                    />
                  </div>
                </div>
              )}

              {/* Messages */}
              {message.text && (
                <div className="mb-4">
                  <Alert variant={message.type === 'success' ? 'success' : 'error'}>
                    {message.text}
                  </Alert>
                </div>
              )}

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={product.quantity === 0 || addingToCart}
                loading={addingToCart}
                size="lg"
                className="w-full mb-4"
              >
                {product.quantity === 0
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </Button>

              {!isAuthenticated && (
                <p className="text-sm text-slate-600 text-center">
                  Please{' '}
                  <button 
                    onClick={() => navigate('/signin')} 
                    className="text-primary-700 hover:text-primary-800 font-medium underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
                  >
                    sign in
                  </button>
                  {' '}to add items to cart
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetail;
