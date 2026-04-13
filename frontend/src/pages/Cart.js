import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Lock, Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, getImageUrl } from '../utils/helpers';
import { Button, Card, Spinner, EmptyState, ConfirmDialog, PageHeader } from '../components/ui';

const Cart = () => {
  const { cart, loading, updateCartItem, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [confirm, setConfirm] = React.useState(null);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    setConfirm({
      title: 'Remove item?',
      description: 'This will remove the item from your cart.',
      confirmLabel: 'Remove',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setConfirm(null);
        await removeFromCart(productId);
      },
    });
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <EmptyState
          icon={<ShoppingCart className="h-6 w-6" aria-hidden="true" />}
          title="Your cart is empty"
          description="Add some fresh produce to get started!"
          actionLabel="Browse Products"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          title="Cart"
          description="Review items, update quantities, and proceed to checkout."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item.productId} className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Product Image */}
                <Link to={`/products/${item.productId}`} className="flex-shrink-0">
                  <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden">
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                      }}
                    />
                  </div>
                </Link>

                {/* Product Details */}
                <div className="flex-grow min-w-0">
                  <Link
                    to={`/products/${item.productId}`}
                    className="text-lg font-semibold text-slate-900 hover:text-primary-700 transition-colors block mb-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-slate-600 mb-4">{formatPrice(item.price)} per {item.unit}</p>

                  {/* Quantity Controls - Mobile */}
                  <div className="flex items-center gap-4 sm:hidden">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        iconOnly
                        title="Decrease quantity"
                        leftIcon={Minus}
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      />
                      <span className="w-12 text-center font-semibold text-slate-900">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        iconOnly
                        title="Increase quantity"
                        leftIcon={Plus}
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      />
                    </div>
                    <span className="text-base font-semibold text-slate-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>

                {/* Quantity Controls & Price - Desktop */}
                <div className="hidden sm:flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      iconOnly
                      title="Decrease quantity"
                      leftIcon={Minus}
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    />
                    <span className="w-12 text-center font-semibold text-slate-900">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      iconOnly
                      title="Increase quantity"
                      leftIcon={Plus}
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                    />
                  </div>

                  {/* Item Total */}
                  <div className="w-32 text-right">
                    <span className="text-base font-semibold text-slate-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost-danger"
                    size="sm"
                    iconOnly
                    title="Remove item"
                    leftIcon={Trash2}
                    onClick={() => handleRemoveItem(item.productId)}
                  />
                </div>

                {/* Remove Button - Mobile */}
                <div className="sm:hidden">
                  <Button
                    variant="ghost-danger"
                    size="sm"
                    onClick={() => handleRemoveItem(item.productId)}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}

            <Link
              to="/products"
              className="inline-flex items-center text-primary-700 hover:text-primary-800 font-medium group"
            >
              <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span className="font-medium">{formatPrice(cart.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Shipping</span>
                  <span className="text-accent-700 font-semibold">FREE</span>
                </div>
                <div className="border-t border-slate-200 pt-4 flex justify-between">
                  <span className="text-base font-semibold text-slate-900">Total</span>
                  <span className="text-base font-semibold text-primary-700">{formatPrice(cart.totalAmount)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                size="lg"
                className="w-full mb-4"
              >
                Proceed to Checkout
              </Button>

              <div className="text-center text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  Secure checkout
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
