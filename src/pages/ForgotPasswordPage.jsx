import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const { resetPassword, error } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-4"
        >
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-coffee-900">Check Your Email</h1>
            <p className="mt-4 text-coffee-600">
              We sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset your password.
            </p>
            <p className="mt-2 text-sm text-coffee-500">
              Didn't get the email? Check your spam folder or try again.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => setSuccess(false)}
                className="text-gold-600 hover:text-gold-700 font-medium text-sm"
              >
                Try a different email
              </button>
              <Link to="/auth/login" className="btn-gold inline-block">
                Back to Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-4"
      >
        <div className="bg-white rounded-2xl shadow-card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-gold-100 rounded-2xl flex items-center justify-center mb-4">
              <Mail size={28} className="text-gold-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-coffee-900">Forgot Password?</h1>
            <p className="mt-2 text-coffee-600">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {(error || localError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <span className="text-sm">{error || localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  Email Address
                </div>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-luxe"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold flex items-center justify-center gap-2 py-3"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>

          <Link
            to="/auth/login"
            className="mt-6 flex items-center justify-center gap-2 text-sm text-coffee-600 hover:text-coffee-800"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
