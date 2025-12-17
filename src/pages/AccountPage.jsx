import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Smartphone, Loader2, AlertCircle, CheckCircle, Trash2, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QRCode from 'qrcode';

export default function AccountPage() {
  const { user, loading, enrollMFA, verifyMFAEnrollment, unenrollMFA, getMFAFactors } = useAuth();
  
  const [mfaFactors, setMfaFactors] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [secret, setSecret] = useState(null);
  const [factorId, setFactorId] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadMFAFactors();
    }
  }, [user]);

  const loadMFAFactors = async () => {
    const factors = await getMFAFactors();
    setMfaFactors(factors);
  };

  const handleEnrollMFA = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await enrollMFA();
      setFactorId(data.id);
      setSecret(data.totp.secret);
      
      // Generate QR code
      const qrUrl = await QRCode.toDataURL(data.totp.uri);
      setQrCodeUrl(qrUrl);
      setEnrolling(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEnrollment = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await verifyMFAEnrollment(factorId, verificationCode);
      setSuccess('Two-factor authentication enabled successfully!');
      setEnrolling(false);
      setQrCodeUrl(null);
      setVerificationCode('');
      loadMFAFactors();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnenrollMFA = async (factorId) => {
    if (!confirm('Are you sure you want to disable two-factor authentication?')) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await unenrollMFA(factorId);
      setSuccess('Two-factor authentication disabled');
      loadMFAFactors();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEnrollment = () => {
    setEnrolling(false);
    setQrCodeUrl(null);
    setSecret(null);
    setFactorId(null);
    setVerificationCode('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  const hasMFA = mfaFactors?.totp?.length > 0;

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold text-coffee-900">Account Settings</h1>
          <p className="mt-2 text-coffee-600">Manage your account and security settings</p>

          {/* Account Info */}
          <div className="mt-8 bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-display text-xl font-semibold text-coffee-900">Account Information</h2>
            <div className="mt-4 space-y-3">
              <div>
                <span className="text-sm text-coffee-500">Email</span>
                <p className="font-medium text-coffee-900">{user.email}</p>
              </div>
            </div>
          </div>

          {/* MFA Section */}
          <div className="mt-6 bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gold-100 rounded-lg">
                <Shield size={20} className="text-gold-600" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-coffee-900">Two-Factor Authentication</h2>
                <p className="text-sm text-coffee-600">Add an extra layer of security to your account</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                <AlertCircle size={20} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
                <CheckCircle size={20} />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {enrolling ? (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-coffee-700 mb-4">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  {qrCodeUrl && (
                    <img src={qrCodeUrl} alt="MFA QR Code" className="mx-auto rounded-xl shadow-card" />
                  )}
                  <div className="mt-4 p-3 bg-cream-100 rounded-lg">
                    <p className="text-xs text-coffee-500 mb-1">Or enter this code manually:</p>
                    <code className="text-sm font-mono text-coffee-900 break-all">{secret}</code>
                  </div>
                </div>

                <form onSubmit={handleVerifyEnrollment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-2">
                      Enter the 6-digit code from your app
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      className="input-luxe text-center text-2xl tracking-widest"
                      placeholder="000000"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={cancelEnrollment}
                      className="flex-1 px-4 py-3 border border-cream-300 text-coffee-700 rounded-lg hover:bg-cream-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || verificationCode.length !== 6}
                      className="flex-1 btn-gold flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Enable MFA'}
                    </button>
                  </div>
                </form>
              </div>
            ) : hasMFA ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="text-green-700 font-medium">Two-factor authentication is enabled</span>
                </div>

                {mfaFactors?.totp?.map((factor) => (
                  <div key={factor.id} className="flex items-center justify-between p-4 bg-cream-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Smartphone size={20} className="text-coffee-600" />
                      <div>
                        <p className="font-medium text-coffee-900">{factor.friendly_name || 'Authenticator App'}</p>
                        <p className="text-sm text-coffee-500">Added {new Date(factor.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnenrollMFA(factor.id)}
                      disabled={isLoading}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-cream-100 rounded-xl">
                  <div className="flex items-start gap-3">
                    <QrCode size={24} className="text-coffee-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-coffee-900">Protect your account</p>
                      <p className="text-sm text-coffee-600 mt-1">
                        Use an authenticator app to generate one-time codes for signing in.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleEnrollMFA}
                  disabled={isLoading}
                  className="w-full btn-gold flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                    <>
                      <Shield size={18} />
                      Enable Two-Factor Authentication
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
