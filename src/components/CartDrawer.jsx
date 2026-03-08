import { Fragment, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, CreditCard, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { getStripe } from '../config/stripe';

export default function CartDrawer() {
  const { 
    items, isOpen, closeCart, removeItem, updateQuantity,
    subtotal, tax, shipping, total, clearCart
  } = useCart();
  const { user } = useAuth();
  const { branding } = useBranding();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    setCheckoutError(null);

    try {
      const backendUrl = import.meta.env.VITE_STRIPE_BACKEND_URL || 'http://localhost:3001';
      const apiUrl = `${backendUrl}/api/create-checkout-session`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            name: item.name,
            description: item.description,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
          })),
          customerEmail: user?.email || undefined,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/shop`,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Checkout failed');

      if (data.url) {
        window.location.href = data.url;
      } else {
        const stripe = await getStripe();
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) throw error;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error.message || 'Failed to start checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  const freeShippingThreshold = branding.features.freeShippingThreshold;
  const showTax = branding.features.showTaxInCart;

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: `${branding.colors.secondary}66` }}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md shadow-2xl z-50 flex flex-col"
            style={{ backgroundColor: branding.colors.white }}
          >
            <div 
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: branding.colors.backgroundAlt }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${branding.colors.primary}20` }}
                >
                  <ShoppingBag size={20} style={{ color: branding.colors.primary }} />
                </div>
                <div>
                  <h2 
                    className="font-display text-xl font-semibold"
                    style={{ color: branding.colors.secondary }}
                  >
                    Your Cart
                  </h2>
                  <p 
                    className="text-sm"
                    style={{ color: branding.colors.textLight }}
                  >
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <button 
                onClick={closeCart} 
                className="p-2 rounded-lg transition-colors hover:bg-cream-100"
              >
                <X size={20} style={{ color: branding.colors.textLight }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: branding.colors.background }}
                  >
                    <ShoppingBag size={32} style={{ color: branding.colors.textLight }} />
                  </div>
                  <h3 
                    className="font-display text-lg font-medium"
                    style={{ color: branding.colors.secondary }}
                  >
                    Your cart is empty
                  </h3>
                  <button 
                    onClick={closeCart} 
                    className="mt-6 px-6 py-3 rounded-xl font-semibold"
                    style={{ backgroundColor: branding.colors.primary, color: branding.colors.secondary }}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    key={item.id} 
                    layout 
                    className="flex gap-4 p-3 rounded-xl"
                    style={{ backgroundColor: branding.colors.background }}
                  >
                    <div 
                      className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: branding.colors.backgroundAlt }}
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span 
                            className="font-display text-2xl"
                            style={{ color: branding.colors.textLight }}
                          >
                            {item.name?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="font-medium truncate"
                        style={{ color: branding.colors.secondary }}
                      >
                        {item.name}
                      </h4>
                      <p 
                        className="text-sm font-semibold mt-0.5"
                        style={{ color: branding.colors.primary }}
                      >
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div 
                          className="flex items-center border rounded-lg"
                          style={{ borderColor: branding.colors.backgroundAlt }}
                        >
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                            className="p-1.5 hover:bg-cream-100"
                          >
                            <Minus size={14} style={{ color: branding.colors.textLight }} />
                          </button>
                          <span 
                            className="px-3 text-sm font-medium"
                            style={{ color: branding.colors.secondary }}
                          >
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                            className="p-1.5 hover:bg-cream-100"
                          >
                            <Plus size={14} style={{ color: branding.colors.textLight }} />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)} 
                          className="p-1.5 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                    <span 
                      className="font-semibold"
                      style={{ color: branding.colors.secondary }}
                    >
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div 
                className="border-t p-6 space-y-4"
                style={{ borderColor: branding.colors.backgroundAlt, backgroundColor: branding.colors.background }}
              >
                <div className="space-y-2 text-sm">
                  <div 
                    className="flex justify-between"
                    style={{ color: branding.colors.textLight }}
                  >
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {showTax && (
                    <div 
                      className="flex justify-between"
                      style={{ color: branding.colors.textLight }}
                    >
                      <span>Tax ({Math.round(branding.features.taxRate * 100)}%)</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                  )}
                  <div 
                    className="flex justify-between"
                    style={{ color: branding.colors.textLight }}
                  >
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  {subtotal < freeShippingThreshold && (
                    <p 
                      className="text-xs text-center pt-1"
                      style={{ color: branding.colors.primary }}
                    >
                      Add {formatPrice(freeShippingThreshold - subtotal)} more for free shipping!
                    </p>
                  )}
                  <div 
                    className="flex justify-between font-display text-lg font-semibold pt-2 border-t"
                    style={{ color: branding.colors.secondary, borderColor: branding.colors.backgroundAlt }}
                  >
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {checkoutError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {checkoutError}
                  </div>
                )}

                <button 
                  onClick={handleCheckout} 
                  disabled={isProcessing} 
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  style={{ backgroundColor: branding.colors.primary, color: branding.colors.secondary }}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      Checkout with Stripe
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div 
                  className="flex items-center justify-center gap-2 text-xs"
                  style={{ color: branding.colors.textLight }}
                >
                  <Lock size={12} className="text-green-600" />
                  <span>Secure checkout powered by Stripe</span>
                </div>

                <button 
                  onClick={clearCart} 
                  className="w-full text-sm hover:underline"
                  style={{ color: branding.colors.textLight }}
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