import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, Clock, Eye, X, Loader2, Package } from 'lucide-react';
import { supabase } from '../config/supabase';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  reviewed: { label: 'Reviewed', color: 'bg-blue-100 text-blue-700', icon: Eye },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  denied: { label: 'Denied', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function CancellationsDashboard() {
  const [cancellations, setCancellations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCancellation, setSelectedCancellation] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCancellations();
  }, []);

  const fetchCancellations = async () => {
    try {
      // Fetch cancellations with their order data
      const { data, error } = await supabase
        .from('cancellations')
        .select(`
          *,
          orders:order_id (
            id, stripe_session_id, customer_email, customer_name,
            subtotal, tax, shipping, total, status, created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCancellations(data || []);
    } catch (err) {
      console.error('Error fetching cancellations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (cancellation) => {
    setSelectedCancellation(cancellation);
    setAdminNotes(cancellation.admin_notes || '');

    // Fetch order items
    if (cancellation.order_id) {
      const { data } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', cancellation.order_id);
      setOrderItems(data || []);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedCancellation) return;
    setUpdating(true);

    try {
      // Update cancellation
      const { error: cancelError } = await supabase
        .from('cancellations')
        .update({
          status: newStatus,
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedCancellation.id);

      if (cancelError) throw cancelError;

      // Update order status if approved
      if (newStatus === 'approved') {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', selectedCancellation.order_id);
      } else if (newStatus === 'denied') {
        await supabase
          .from('orders')
          .update({ status: 'completed' })
          .eq('id', selectedCancellation.order_id);
      }

      setSelectedCancellation(null);
      fetchCancellations();
    } catch (err) {
      console.error('Error updating cancellation:', err);
      alert('Failed to update cancellation status');
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="text-gold-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const count = cancellations.filter(c => c.status === key).length;
          const Icon = config.icon;
          return (
            <div key={key} className="bg-white rounded-2xl p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${config.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-coffee-900">{count}</p>
                <p className="text-sm text-coffee-500">{config.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cream-200">
              <th className="text-left px-6 py-4 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Order</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Customer</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Reason</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Date</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100">
            {cancellations.map((c) => {
              const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
              return (
                <tr key={c.id} className="hover:bg-cream-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium text-coffee-900">
                      #{c.orders?.id?.slice(0, 8).toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-coffee-900">{c.customer_email}</p>
                      <p className="text-xs text-coffee-500">{c.orders?.customer_name || ''}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-coffee-700 line-clamp-1 max-w-[200px]">{c.reason}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-coffee-500">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleViewDetails(c)}
                      className="p-2 text-coffee-500 hover:text-coffee-700 hover:bg-cream-100 rounded-lg transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {cancellations.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-cream-300 mb-4" />
            <p className="text-coffee-500">No cancellation requests yet</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCancellation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-coffee-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCancellation(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-cream-200 flex justify-between items-center">
                <h2 className="text-xl font-display font-semibold text-coffee-900">
                  Cancellation Details
                </h2>
                <button
                  onClick={() => setSelectedCancellation(null)}
                  className="p-2 hover:bg-cream-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Order Info */}
                <div className="p-4 bg-cream-50 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-coffee-500">Order</span>
                    <span className="text-sm font-mono font-medium text-coffee-900">
                      #{selectedCancellation.orders?.id?.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-coffee-500">Customer</span>
                    <span className="text-sm text-coffee-900">{selectedCancellation.customer_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-coffee-500">Order Total</span>
                    <span className="text-sm font-semibold text-coffee-900">
                      {formatPrice(selectedCancellation.orders?.total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-coffee-500">Order Date</span>
                    <span className="text-sm text-coffee-900">
                      {selectedCancellation.orders?.created_at
                        ? new Date(selectedCancellation.orders.created_at).toLocaleString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Items */}
                {orderItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-coffee-500 uppercase tracking-wider mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm p-2 bg-cream-50 rounded-lg">
                          <span className="text-coffee-900">
                            {item.product_name} x{item.quantity}
                          </span>
                          <span className="text-coffee-700">{formatPrice(item.total_price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div>
                  <h4 className="text-sm font-semibold text-coffee-500 uppercase tracking-wider mb-2">Cancellation Reason</h4>
                  <p className="text-sm text-coffee-900 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    {selectedCancellation.reason}
                  </p>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm font-semibold text-coffee-500 uppercase tracking-wider mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this cancellation..."
                    rows={3}
                    className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:border-gold-400 text-sm resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdateStatus('reviewed')}
                    disabled={updating}
                    className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
                  >
                    Mark Reviewed
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('approved')}
                    disabled={updating}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('denied')}
                    disabled={updating}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 text-sm"
                  >
                    Deny
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
