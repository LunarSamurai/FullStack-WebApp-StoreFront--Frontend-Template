import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

const REASONS = [
  'I did not place this order',
  'Ordered by mistake',
  'Found a better price elsewhere',
  'Item no longer needed',
  'Other',
];

export default function CancelOrderPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const prefillEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(prefillEmail);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !reason) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const backendUrl = import.meta.env.VITE_STRIPE_BACKEND_URL
        || (import.meta.env.DEV ? 'http://localhost:3001' : '');

      const response = await fetch(`${backendUrl}/api/cancel-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, email, reason, details }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit cancellation');

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderId) {
    return (
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <h1 className="font-display text-2xl font-bold text-coffee-900 mb-2">Invalid Link</h1>
          <p className="text-coffee-600 mb-6">This cancellation link is missing required information.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gold-600 hover:text-gold-700"
          >
            Go to Home <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-4"
        >
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-coffee-900 mb-2">
            Request Submitted
          </h1>
          <p className="text-coffee-600 mb-6">
            Your cancellation request has been received. We'll review it and get back to you at <strong>{email}</strong>.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-coffee-900 text-cream-100 rounded-lg hover:bg-coffee-800 transition-colors"
          >
            Back to Home <ArrowRight size={16} />
          </Link>
        </motion.div>
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
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-amber-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-coffee-900">
            Request Order Cancellation
          </h1>
          <p className="mt-2 text-coffee-600 text-sm">
            Order #{orderId.slice(0, 8).toUpperCase()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter the email used for this order"
              required
              className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:border-gold-400 text-sm"
            />
            <p className="text-xs text-coffee-400 mt-1">
              Must match the email on the order for verification
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">
              Reason for Cancellation *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:border-gold-400 text-sm"
            >
              <option value="">Select a reason...</option>
              {REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">
              Additional Details (optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Any additional information..."
              rows={3}
              className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:border-gold-400 text-sm resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Cancellation Request'
            )}
          </button>

          <p className="text-xs text-coffee-400 text-center">
            Cancellation requests are reviewed by our team. You'll be contacted at the email above with the outcome.
          </p>
        </form>
      </motion.div>
    </main>
  );
}
