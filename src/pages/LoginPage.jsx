import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, AlertCircle, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { signIn, verifyMFA, adminMfaRequired, error } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [requiresMfaSetup, setRequiresMfaSetup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    try {
      const result = await signIn(email, password);
      
      if (result.requiresMfaSetup) {
        // Admin needs to set up MFA first
        setRequiresMfaSetup(true);
        setLoading(false);
        return;
      }
      
      if (result.adminMfaRequired) {
        // Admin needs to verify MFA
        setShowMfaInput(true);
        setLoading(false);
        return;
      }
      
      navigate(redirect);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMFASubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    try {
      await verifyMFA(mfaCode);
      navigate(redirect);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Redirect to account page to set up MFA
  if (requiresMfaSetup) {
    return (
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-4"
        >
          <div className="bg-white rounded-2xl shadow-card p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
                <AlertTriangle size={32} className="text-amber-600" />
              </div>
              <h1 className="font-display text-2xl font-bold text-coffee-900">MFA Required</h1>
              <p className="mt-2 text-coffee-600">
                As an admin, you must set up two-factor authentication before accessing your account.
              </p>
            </div>

            <Link
              to="/account"
              className="w-full btn-gold flex items-center justify-center gap-2 py-3"
            >
              <Shield size={18} />
              Set Up MFA Now
            </Link>

            <button
              onClick={() => {
                setRequiresMfaSetup(false);
                setEmail('');
                setPassword('');
              }}
              className="w-full mt-4 text-sm text-coffee-500 hover:text-coffee-700"
            >
              Sign in with different account
            </button>
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
              <span className="font-accent text-3xl text-gold-600">L</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-coffee-900">
              {showMfaInput || adminMfaRequired ? 'Admin Verification' : 'Welcome Back'}
            </h1>
            <p className="mt-2 text-coffee-600">
              {showMfaInput || adminMfaRequired 
                ? 'Enter the code from your authenticator app' 
                : 'Sign in to your account'}
            </p>
          </div>

          {(error || localError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <span className="text-sm">{error || localError}</span>
            </div>
          )}

          {(showMfaInput || adminMfaRequired) ? (
            <form onSubmit={handleMFASubmit} className="space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 text-amber-700 mb-2">
                  <Shield size={18} />
                  <span className="font-medium">Admin MFA Required</span>
                </div>
                <p className="text-sm text-amber-600">
                  For security, admin accounts require two-factor authentication.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Shield size={16} />
                    Authentication Code
                  </div>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="input-luxe text-center text-2xl tracking-widest"
                  placeholder="000000"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || mfaCode.length !== 6}
                className="w-full btn-gold flex items-center justify-center gap-2 py-3"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Sign In'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMfaInput(false);
                  setMfaCode('');
                  setEmail('');
                  setPassword('');
                }}
                className="w-full text-sm text-coffee-500 hover:text-coffee-700"
              >
                Use different account
              </button>
            </form>
          ) : (
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

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Lock size={16} />
                    Password
                  </div>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-luxe"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link to="/auth/forgot-password" className="text-gold-600 hover:text-gold-700">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gold flex items-center justify-center gap-2 py-3"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
              </button>
            </form>
          )}

          {!showMfaInput && !adminMfaRequired && (
            <p className="mt-6 text-center text-sm text-coffee-600">
              Don't have an account?{' '}
              <Link to="/auth/register" className="text-gold-600 hover:text-gold-700 font-medium">
                Create one
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </main>
  );
}