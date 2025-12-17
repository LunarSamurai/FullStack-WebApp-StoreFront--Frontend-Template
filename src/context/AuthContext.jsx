import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext(null);

// Admin emails list - add your admin emails here
const ADMIN_EMAILS = [
  import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase(),
].filter(Boolean);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState(null);
  const [adminMfaRequired, setAdminMfaRequired] = useState(false);
  const [pendingAdminSession, setPendingAdminSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.email);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminStatus(session.user.email);
      } else {
        setIsAdmin(false);
      }

      if (event === 'MFA_CHALLENGE_VERIFIED') {
        setMfaRequired(false);
        setAdminMfaRequired(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (email) => {
    if (!email) {
      setIsAdmin(false);
      return false;
    }
    
    // Check against admin emails list
    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
      setIsAdmin(true);
      return true;
    }

    // Also check database for dynamic admin management
    try {
      const { data } = await supabase
        .from('admins')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();
      
      const adminStatus = !!data;
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch {
      setIsAdmin(false);
      return false;
    }
  };

  // Sign up with email/password
  const signUp = async (email, password) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      return { data, needsVerification: true };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with email/password
  const signIn = async (email, password) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Check if user is admin
      const isUserAdmin = await checkAdminStatus(email);

      // Check if MFA is enrolled
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const hasMFA = factors?.totp?.length > 0;

      // If admin without MFA, they need to set it up
      if (isUserAdmin && !hasMFA) {
        return { data, requiresMfaSetup: true };
      }

      // If admin with MFA, require verification
      if (isUserAdmin && hasMFA) {
        setAdminMfaRequired(true);
        setMfaFactorId(factors.totp[0].id);
        setPendingAdminSession(data);
        return { adminMfaRequired: true, factorId: factors.totp[0].id };
      }

      return { data };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Verify MFA code
  const verifyMFA = async (code) => {
    setError(null);
    try {
      const { data: challenge } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId
      });

      const { data, error } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challenge.id,
        code
      });

      if (error) throw error;
      setMfaRequired(false);
      setAdminMfaRequired(false);
      setPendingAdminSession(null);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Verify escalation MFA for sensitive admin actions
  const verifyEscalationMFA = async (code, factorId) => {
    setError(null);
    try {
      const { data: challenge } = await supabase.auth.mfa.challenge({
        factorId: factorId
      });

      const { data, error } = await supabase.auth.mfa.verify({
        factorId: factorId,
        challengeId: challenge.id,
        code
      });

      if (error) throw error;
      return { verified: true, data };
    } catch (err) {
      setError(err.message);
      return { verified: false, error: err.message };
    }
  };

  // Enroll MFA (setup)
  const enrollMFA = async (friendlyName = 'Authenticator App') => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName
      });

      if (error) throw error;
      return data; // Contains QR code and secret
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Verify and complete MFA enrollment
  const verifyMFAEnrollment = async (factorId, code) => {
    setError(null);
    try {
      const { data: challenge } = await supabase.auth.mfa.challenge({ factorId });
      
      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code
      });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Unenroll MFA
  const unenrollMFA = async (factorId) => {
    setError(null);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get MFA factors
  const getMFAFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error getting MFA factors:', err);
      return null;
    }
  };

  // Get escalation MFA factor
  const getEscalationFactor = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      // Find the escalation factor by name
      const escalationFactor = data?.totp?.find(f => f.friendly_name === 'Escalation MFA');
      return escalationFactor || null;
    } catch (err) {
      console.error('Error getting escalation factor:', err);
      return null;
    }
  };

  // Sign out
  const signOut = async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setMfaRequired(false);
      setAdminMfaRequired(false);
      setPendingAdminSession(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      if (error) throw error;
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update password
  const updatePassword = async (newPassword) => {
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    session,
    isAdmin,
    loading,
    error,
    mfaRequired,
    adminMfaRequired,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    enrollMFA,
    verifyMFA,
    verifyMFAEnrollment,
    verifyEscalationMFA,
    unenrollMFA,
    getMFAFactors,
    getEscalationFactor,
    checkAdminStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;