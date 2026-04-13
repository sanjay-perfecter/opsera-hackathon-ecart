import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingCart, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import { formatPrice } from '../utils/helpers';
import { Button, Input, Alert, Card, EmptyState, PageHeader } from '../components/ui';
import AddressFields from '../components/AddressFields';

const checkoutSchema = z.object({
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(1, 'Please select a city'),
  state: z.string().min(1, 'Please select a state'),
  country: z.string().min(1, 'Please select a country'),
  zipCode: z.number().min(3, 'Please enter a valid ZIP code'),
});

const Checkout = () => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      // Create order
      const orderResponse = await orderService.createOrder({
        shippingAddress: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country
        }
      });

      const orderId = orderResponse.data.order._id;

      // Create Stripe checkout session
      const paymentResponse = await paymentService.createCheckoutSession(orderId);

      // Redirect to Stripe checkout
      window.location.href = paymentResponse.url;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process checkout');
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12">
        <EmptyState
          icon={<ShoppingCart className="h-6 w-6" aria-hidden="true" />}
          title="Your cart is empty"
          description="Add some items to your cart before checking out"
          actionLabel="Browse Products"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Checkout"
          description="Enter your shipping information and continue to secure payment."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Shipping Information</h2>

              {error && (
                <Alert variant="error" className="mb-6">
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  <Input
                    label="Street Address"
                    placeholder="123 Main St, Apt 4B"
                    error={errors.street?.message}
                    {...register('street')}
                  />

                  <AddressFields
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    watch={watch}
                  />

                  <Input
                    label="ZIP / Postal Code"
                    placeholder="10001"
                    error={errors.zipCode?.message}
                    {...register('zipCode')}
                  />
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/cart')}
                    className="flex-1"
                  >
                    Back to Cart
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    className="flex-1"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-accent-700 font-medium">FREE</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-primary-700">{formatPrice(cart.totalAmount)}</span>
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  Secure payment with Stripe
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
