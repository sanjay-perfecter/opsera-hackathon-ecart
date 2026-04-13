import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Filter, ShoppingCart, User, Calendar, DollarSign, Eye } from 'lucide-react';
import orderService from '../../services/orderService';
import { formatPrice, formatDate } from '../../utils/helpers';
import { Card, ListCard, ViewToggle, Select, Badge, Spinner, Alert, Button, PageHeader, Toolbar } from '../../components/ui';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setMessage({ type: 'error', text: 'Failed to load orders' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setMessage({ type: 'success', text: 'Order status updated successfully!' });
      loadOrders();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update status' });
    }
  };

  const getPaymentBadgeVariant = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'default';
    }
  };

  const filteredOrders = filter
    ? orders.filter((order) => order.status === filter)
    : orders;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Review orders, update fulfillment status, and inspect details."
        actions={<ViewToggle view={viewMode} onChange={setViewMode} />}
      />

      {message.text && (
        <Alert variant={message.type === 'success' ? 'success' : 'error'} className="mb-6">
          {message.text}
        </Alert>
      )}

      <Toolbar
        left={
          <Card padding={false} className="w-full md:w-[420px]">
            <div className="flex items-center gap-3 p-4">
              <Filter className="w-4 h-4 text-slate-500" />
              <Select
                label=""
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1"
              >
                <option value="">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          </Card>
        }
      />

      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
        : "flex flex-col gap-4"
      }>
        {filteredOrders.map((order) => (
          (() => {
            const userObj = order.user || (order.userId && typeof order.userId === 'object' ? order.userId : null);
            const userId = typeof order.userId === 'string' ? order.userId : (order.userId?._id || order.userId?.id || '');
            const userLabel = userObj?.name || (userId ? `User #${String(userId).slice(-8)}` : 'User N/A');
            const userEmail = userObj?.email || (userId ? `ID: ${String(userId)}` : 'No email');

            return (
          <ListCard
            key={order._id}
            variant={viewMode}
            icon={ShoppingCart}
            iconBg={order.status === 'completed' ? 'bg-green-100' : order.status === 'cancelled' ? 'bg-red-100' : 'bg-orange-100'}
            iconColor={order.status === 'completed' ? 'text-green-600' : order.status === 'cancelled' ? 'text-red-600' : 'text-orange-600'}
            title={`#${order._id.slice(-8)}`}
            subtitle={userLabel}
            badge={
              <Badge variant={getPaymentBadgeVariant(order.paymentStatus)} size="sm">
                {order.paymentStatus}
              </Badge>
            }
            metadata={[
              { icon: User, value: userEmail },
              { icon: Calendar, value: formatDate(order.createdAt) },
              { icon: DollarSign, value: formatPrice(order.totalAmount), className: 'font-bold text-primary-600' }
            ]}
            actions={
              <>
                {viewMode === 'list' && (
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 bg-white mr-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  title={expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                  onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                  leftIcon={Eye}
                />
              </>
            }
          >
            {/* Status Select - only in grid view */}
            {viewMode === 'grid' && (
              <div className="mt-2">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}

            {/* Expanded Details */}
            {expandedOrder === order._id && (
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-2">Order Items</h4>
                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs bg-slate-50 p-2 rounded">
                        <span className="text-slate-900">{item.name}</span>
                        <span className="text-slate-600">
                          {item.quantity} x {formatPrice(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {order.shippingAddress && (
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-2">Shipping</h4>
                    <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded">
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ListCard>
            );
          })()
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card className="text-center py-12 text-slate-500">
          No orders found matching your filters.
        </Card>
      )}
      
      <div className="mt-4 text-sm text-slate-600">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>
    </div>
  );
};

export default ManageOrders;
