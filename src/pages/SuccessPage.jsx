import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function SuccessPage() {
  const { clearCart } = useCart();
  const hasCleared = useRef(false);

  useEffect(() => {
    if (!hasCleared.current) {
      hasCleared.current = true;
      // Clear cart and localStorage
      localStorage.removeItem('luxe-cart');
      clearCart();
    }
  }, [clearCart]);

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
        <h1 className="font-display text-3xl font-bold text-coffee-900">
          Thank You!
        </h1>
        <p className="mt-4 text-coffee-600">
          Your order has been placed successfully. You'll receive a confirmation email shortly.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
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