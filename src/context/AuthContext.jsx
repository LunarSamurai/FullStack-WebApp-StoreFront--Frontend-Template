import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

const AuthContext = createContext(null);

// Admin emails - add your admin Google accounts here
const ADMIN_EMAILS = [
  import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com',
  // Add more admin emails as needed
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is admin
  const checkAdminStatus = async (email) => {
    // Check against admin emails list
    if (ADMIN_EMAILS.includes(email?.toLowerCase())) {
      return true;
    }
    
    // Also check Firestore for dynamic admin management
    try {
      const adminDoc = await getDoc(doc(db, 'admins', email?.toLowerCase()));
      return adminDoc.exists();
    } catch (e) {
      console.warn('Could not check admin status in Firestore:', e);
      return false;
    }
  };

  // Save user data to Firestore
  const saveUserToFirestore = async (user) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString(),
      };

      if (!userSnap.exists()) {
        userData.createdAt = new Date().toISOString();
      }

      await setDoc(userRef, userData, { merge: true });
    } catch (e) {
      console.error('Error saving user to Firestore:', e);
    }
  };

  useEffect(() => {
    // Check for redirect result on load
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const adminStatus = await checkAdminStatus(result.user.email);
          setIsAdmin(adminStatus);
          await saveUserToFirestore(result.user);
        }
      })
      .catch((err) => {
        console.error('Redirect result error:', err);
      });

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const adminStatus = await checkAdminStatus(currentUser.email);
        setIsAdmin(adminStatus);
        await saveUserToFirestore(currentUser);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    setError(null);
    try {
      // Try popup first
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      // If popup blocked, try redirect
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          setError('Sign-in failed. Please try again.');
          throw redirectErr;
        }
      } else {
        setError(err.message);
        throw err;
      }
    }
  };

  // Sign out
  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    isAdmin,
    loading,
    error,
    signInWithGoogle,
    logout
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
