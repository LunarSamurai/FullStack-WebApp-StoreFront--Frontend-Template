import { Fragment, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, CreditCard, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getStripe } from '../config/stripe';

// Backend API URL - UPDATE THIS after deploying your Stripe backend
const STRIPE_BACKEND_URL = import.meta.env.VITE_STRIPE_BACKEND_URL || 'https://stripe-backend-iblsab21j-intervallumdevelopments-projects.vercel.app';

export default function CartDrawer() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    removeItem, 
    updateQuantity,
    subtotal,
    tax,
    shipping,
    total,
    clearCart
  } = useCart();
  const { user, signInWithGoogle } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleCheckout = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }

    setIsProcessing(true);
    setCheckoutError(null);

    try {
      // Call your backend to create checkout session
      const response = await fetch(`${STRIPE_BACKEND_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            name: item.name,
            description: item.description,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
          })),
          customerEmail: user.email,
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/shop`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error.message || 'Failed to start checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-coffee-900/40 backdrop-blur-sm z-50"
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-cream-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold-100 rounded-lg">
                  <ShoppingBag size={20} className="text-gold-600" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-coffee-900">
                    Your Cart
                  </h2>
                  <p className="text-sm text-coffee-500">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
                aria-label="Close cart"
              >
                <X size={20} className="text-coffee-600" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={32} className="text-cream-400" />
                  </div>
                  <h3 className="font-display text-lg font-medium text-coffee-900">
                    Your cart is empty
                  </h3>
                  <p className="mt-2 text-sm text-coffee-500">
                    Discover our curated collection
                  </p>
                  <button
                    onClick={closeCart}
                    className="mt-6 btn-gold"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex gap-4 p-3 bg-cream-50 rounded-xl"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 bg-cream-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-display text-2xl text-cream-400">
                            {item.name?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-coffee-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gold-600 font-semibold mt-0.5">
                        {formatPrice(item.price)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-cream-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-cream-100 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} className="text-coffee-600" />
                          </button>
                          <span className="px-3 text-sm font-medium text-coffee-900 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-cream-100 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} className="text-coffee-600" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-coffee-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <span className="font-semibold text-coffee-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-cream-200 p-6 space-y-4 bg-cream-50">
                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-coffee-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-coffee-600">
                    <span>Tax (8%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-coffee-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  {subtotal < 100 && (
                    <p className="text-xs text-gold-600 text-center pt-1">
                      Add {formatPrice(100 - subtotal)} more for free shipping!
                    </p>
                  )}
                  <div className="flex justify-between font-display text-lg font-semibold text-coffee-900 pt-2 border-t border-cream-200">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Error Message */}
                {checkoutError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {checkoutError}
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full btn-gold flex items-center justify-center gap-2 py-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : user ? (
                    <>
                      <CreditCard size={18} />
                      Checkout with Stripe
                      <ArrowRight size={16} />
                    </>
                  ) : (
                    <>
                      Sign in to Checkout
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-coffee-500">
                  <Lock size={12} className="text-green-600" />
                  <span>Secure checkout powered by Stripe</span>
                </div>

                {/* Clear Cart */}
                <button
                  onClick={clearCart}
                  className="w-full text-sm text-coffee-500 hover:text-coffee-700 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
