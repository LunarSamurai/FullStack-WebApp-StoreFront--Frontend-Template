import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../config/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Processing...');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User clicked the password reset link — redirect to reset form
        setMessage('Redirecting to password reset...');
        navigate('/auth/reset-password', { replace: true });
      } else if (event === 'SIGNED_IN') {
        // User verified their email or completed auth
        setMessage('Email verified! Redirecting...');
        setTimeout(() => navigate('/', { replace: true }), 500);
      }
    });

    // Fallback: if no event fires within 5 seconds, redirect to home
    const fallbackTimer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, [navigate]);

  return (
    <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={32} className="animate-spin text-gold-600 mx-auto" />
        <p className="mt-4 text-coffee-600">{message}</p>
      </div>
    </main>
  );
}
