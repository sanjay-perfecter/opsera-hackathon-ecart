import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Card, Button } from '../components/ui';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const { refreshCart } = useCart();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refresh cart to clear items after successful payment
    refreshCart();
  }, [refreshCart]);

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12">
      <Card className="max-w-2xl w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 text-5xl mb-4">
            ✓
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Order Successful!
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Thank you for your purchase! Your order has been confirmed and will be delivered soon.
        </p>

        {sessionId && (
          <p className="text-sm text-gray-500 mb-8">
            Session ID: {sessionId.slice(-12)}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/orders">
            <Button size="lg">
              View My Orders
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            You will receive an email confirmation shortly with your order details.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default CheckoutSuccess;
