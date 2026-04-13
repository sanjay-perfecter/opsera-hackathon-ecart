import React, { useState, useEffect } from 'react';
import orderService from '../services/orderService';
import { formatPrice, formatDate, getImageUrl } from '../utils/helpers';
import { Card, Badge, Spinner, EmptyState, Button } from '../components/ui';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getUserOrders();
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No orders yet"
            description="Start shopping to place your first order!"
            actionLabel="Browse Products"
            onAction={() => window.location.href = '/products'}
          />
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order._id}>
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Order ID</p>
                      <p className="font-mono text-sm font-medium">{order._id.slice(-8)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Order Date</p>
                      <p className="font-medium">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total</p>
                      <p className="text-xl font-bold text-primary-600">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <Badge variant={getStatusBadgeVariant(order.status)} size="md">
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="py-4 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Payment Status: </span>
                  <span className={`text-sm font-bold ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>

                {/* Order Items */}
                <div className="pt-6">
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setSelectedOrder(selectedOrder === order._id ? null : order._id)
                    }
                    className="mb-4"
                  >
                    {selectedOrder === order._id ? 'Hide Items ▲' : 'View Items ▼'}
                  </Button>

                  {selectedOrder === order._id && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {/* Items List */}
                      <div className="space-y-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={getImageUrl(item.imageUrl)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                                }}
                              />
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="font-bold text-gray-900 mb-1">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                {formatPrice(item.price)} × {item.quantity}
                              </p>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="font-bold text-gray-900 mb-2 flex items-center">
                            <span className="mr-2">📍</span>
                            Shipping Address
                          </p>
                          <p className="text-sm text-gray-700">
                            {order.shippingAddress.street}
                            <br />
                            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                            {order.shippingAddress.zipCode}
                            <br />
                            {order.shippingAddress.country}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
