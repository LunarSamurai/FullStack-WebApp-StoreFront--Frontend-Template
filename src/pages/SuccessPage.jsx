import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, ArrowRight, Package, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../config/supabase';

export default function SuccessPage() {
  const { clearCart } = useCart();
  const hasCleared = useRef(false);
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(!!sessionId);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!hasCleared.current) {
      hasCleared.current = true;
      localStorage.removeItem('luxe-cart');
      clearCart();
    }
  }, [clearCart]);

  useEffect(() => {
    if (!sessionId) return;

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .single();

      if (data) {
        setOrder(data);
        // Fetch order items
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', data.id);
        setOrderItems(items || []);
        setLoading(false);
      } else if (retryCount < 3) {
        // Webhook might not have processed yet, retry
        setTimeout(() => setRetryCount(c => c + 1), 2000);
      } else {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [sessionId, retryCount]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  // Loading state while waiting for webhook
  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto text-gold-500 animate-spin mb-4" />
          <p className="text-coffee-600">Loading your order details...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg mx-4"
      >
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="font-display text-3xl font-bold text-coffee-900">
            Thank You!
          </h1>
          <p className="mt-2 text-coffee-600">
            Your order has been placed successfully.
          </p>
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-8">
            <div className="p-6 border-b border-cream-200">
              <div className="flex items-center gap-3">
                <Package size={20} className="text-gold-600" />
                <div>
                  <p className="text-sm text-coffee-500">Order Number</p>
                  <p className="font-display font-bold text-coffee-900">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            {orderItems.length > 0 && (
              <div className="p-6 border-b border-cream-200">
                <h3 className="text-sm font-semibold text-coffee-500 uppercase tracking-wider mb-3">Items</h3>
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.product_name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-cream-100 flex items-center justify-center">
                            <span className="font-display text-sm text-cream-400">
                              {item.product_name?.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-coffee-900">{item.product_name}</p>
                          <p className="text-xs text-coffee-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-coffee-900">
                        {formatPrice(item.total_price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="p-6 bg-cream-50 space-y-2 text-sm">
              <div className="flex justify-between text-coffee-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.shipping > 0 && (
                <div className="flex justify-between text-coffee-600">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shipping)}</span>
                </div>
              )}
              {order.shipping === 0 && (
                <div className="flex justify-between text-coffee-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between text-coffee-600">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-display text-lg font-bold text-coffee-900 pt-2 border-t border-cream-200">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Email Note */}
            <div className="p-4 bg-gold-50 text-center">
              <p className="text-sm text-coffee-700">
                A confirmation email has been sent to <strong>{order.customer_email}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Fallback if no order data */}
        {!order && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 text-center">
            <p className="text-coffee-600">
              You'll receive a confirmation email shortly with your order details.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/shop"
            className="flex items-center gap-2 px-6 py-3 bg-coffee-900 text-cream-100 rounded-lg hover:bg-coffee-800 transition-colors"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-coffee-700 hover:text-gold-600"
          >
            Back to Home
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
