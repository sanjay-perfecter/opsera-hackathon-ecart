import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../components/ui';

const CheckoutCancel = () => {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12">
      <Card className="max-w-2xl w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 text-yellow-600 text-5xl mb-4">
            ⚠
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Your payment was cancelled. No charges have been made to your account.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/checkout">
            <Button size="lg">
              Try Again
            </Button>
          </Link>
          <Link to="/cart">
            <Button variant="outline" size="lg">
              Back to Cart
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            If you experienced any issues during checkout, please{' '}
            <a href="mailto:support@metayb.com" className="text-primary-600 hover:text-primary-700 font-medium">
              contact our support team
            </a>.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default CheckoutCancel;
