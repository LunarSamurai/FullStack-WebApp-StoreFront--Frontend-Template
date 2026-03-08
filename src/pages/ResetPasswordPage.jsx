import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ResetPasswordPage() {
  const { updatePassword, session, error } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Give Supabase a moment to process the recovery token from the URL hash
    const timer = setTimeout(() => {
      setReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // If no session after processing, the token may be invalid
  useEffect(() => {
    if (ready && !session) {
      setLocalError('Invalid or expired reset link. Please request a new one.');
    }
  }, [ready, session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      await updatePassword(password);
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
            <h1 className="font-display text-2xl font-bold text-coffee-900">Password Updated!</h1>
            <p className="mt-4 text-coffee-600">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Link to="/auth/login" className="mt-6 inline-block btn-gold">
              Sign In
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-gold-600 mx-auto" />
          <p className="mt-4 text-coffee-600">Processing reset link...</p>
        </div>
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
              <ShieldCheck size={28} className="text-gold-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-coffee-900">Set New Password</h1>
            <p className="mt-2 text-coffee-600">
              Enter your new password below.
            </p>
          </div>

          {(error || localError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <span className="text-sm">{error || localError}</span>
            </div>
          )}

          {!localError?.includes('Invalid or expired') ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Lock size={16} />
                    New Password
                  </div>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-luxe"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-coffee-500">At least 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Lock size={16} />
                    Confirm New Password
                  </div>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-luxe"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gold flex items-center justify-center gap-2 py-3"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <Link to="/auth/forgot-password" className="btn-gold inline-block">
                Request New Reset Link
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
