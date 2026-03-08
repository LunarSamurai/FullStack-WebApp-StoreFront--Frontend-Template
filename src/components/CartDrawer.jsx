import { Fragment, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, CreditCard, Lock, ArrowRight, ArrowLeft, Loader2, Mail, MapPin } from 'lucide-react';
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

  // Checkout step state
  const [checkoutStep, setCheckoutStep] = useState('cart');
  const [customerEmail, setCustomerEmail] = useState('');
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    line1: '', line2: '', city: '', state: '', zip: '', country: 'US'
  });

  // Reset checkout step when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setCheckoutStep('cart');
      setCheckoutError(null);
    }
  }, [isOpen]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const handleProceedToInfo = () => {
    setCustomerEmail(user?.email || '');
    setCheckoutError(null);
    setCheckoutStep('info');
  };

  const handleBackToCart = () => {
    setCheckoutStep('cart');
    setCheckoutError(null);
  };

  const handleShippingChange = (field, value) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckout = async () => {
    if (!customerEmail || !customerEmail.includes('@')) {
      setCheckoutError('Please enter a valid email address');
      return;
    }

    if (!sameAsBilling && !shippingAddress.line1) {
      setCheckoutError('Please enter a shipping address');
      return;
    }

    setIsProcessing(true);
    setCheckoutError(null);

    try {
      const backendUrl = import.meta.env.VITE_STRIPE_BACKEND_URL
        || (import.meta.env.DEV ? 'http://localhost:3001' : '');
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
            productId: item.id,
          })),
          customerEmail,
          sameAsBilling,
          shippingAddress: sameAsBilling ? null : shippingAddress,
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
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

  const inputStyle = {
    borderColor: branding.colors.backgroundAlt,
    color: branding.colors.secondary,
  };

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
            {/* Header */}
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: branding.colors.backgroundAlt }}
            >
              <div className="flex items-center gap-3">
                {checkoutStep === 'info' && (
                  <button
                    onClick={handleBackToCart}
                    className="p-2 rounded-lg transition-colors hover:bg-cream-100"
                  >
                    <ArrowLeft size={20} style={{ color: branding.colors.secondary }} />
                  </button>
                )}
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${branding.colors.primary}20` }}
                >
                  {checkoutStep === 'cart'
                    ? <ShoppingBag size={20} style={{ color: branding.colors.primary }} />
                    : <Mail size={20} style={{ color: branding.colors.primary }} />
                  }
                </div>
                <div>
                  <h2
                    className="font-display text-xl font-semibold"
                    style={{ color: branding.colors.secondary }}
                  >
                    {checkoutStep === 'cart' ? 'Your Cart' : 'Checkout'}
                  </h2>
                  <p
                    className="text-sm"
                    style={{ color: branding.colors.textLight }}
                  >
                    {checkoutStep === 'cart'
                      ? `${items.length} ${items.length === 1 ? 'item' : 'items'}`
                      : 'Enter your details'
                    }
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

            {/* Cart Step */}
            {checkoutStep === 'cart' && (
              <>
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

                    <button
                      onClick={handleProceedToInfo}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-colors"
                      style={{ backgroundColor: branding.colors.primary, color: branding.colors.secondary }}
                    >
                      <CreditCard size={18} />
                      Proceed to Checkout
                      <ArrowRight size={16} />
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
              </>
            )}

            {/* Info Step */}
            {checkoutStep === 'info' && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {/* Email */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: branding.colors.secondary }}
                    >
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: branding.colors.textLight }}
                      />
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm"
                        style={{
                          ...inputStyle,
                          '--tw-ring-color': branding.colors.primary,
                        }}
                      />
                    </div>
                    <p
                      className="text-xs mt-1"
                      style={{ color: branding.colors.textLight }}
                    >
                      We'll send your order confirmation here
                    </p>
                  </div>

                  {/* Same as Billing Toggle */}
                  <div
                    className="p-4 rounded-xl border"
                    style={{ borderColor: branding.colors.backgroundAlt, backgroundColor: branding.colors.background }}
                  >
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <MapPin size={18} style={{ color: branding.colors.primary }} />
                        <span
                          className="text-sm font-medium"
                          style={{ color: branding.colors.secondary }}
                        >
                          Shipping same as billing
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSameAsBilling(!sameAsBilling)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          sameAsBilling ? '' : 'bg-cream-300'
                        }`}
                        style={sameAsBilling ? { backgroundColor: branding.colors.primary } : {}}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            sameAsBilling ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </label>
                    <p
                      className="text-xs mt-2 ml-8"
                      style={{ color: branding.colors.textLight }}
                    >
                      {sameAsBilling
                        ? 'Shipping address will match your billing address on the payment form'
                        : 'Enter a different shipping address below'
                      }
                    </p>
                  </div>

                  {/* Shipping Address Fields */}
                  <AnimatePresence>
                    {!sameAsBilling && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3 overflow-hidden"
                      >
                        <h4
                          className="font-medium text-sm flex items-center gap-2"
                          style={{ color: branding.colors.secondary }}
                        >
                          <MapPin size={16} />
                          Shipping Address
                        </h4>

                        <input
                          type="text"
                          value={shippingAddress.line1}
                          onChange={(e) => handleShippingChange('line1', e.target.value)}
                          placeholder="Street address *"
                          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm"
                          style={inputStyle}
                        />

                        <input
                          type="text"
                          value={shippingAddress.line2}
                          onChange={(e) => handleShippingChange('line2', e.target.value)}
                          placeholder="Apt, suite, unit (optional)"
                          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm"
                          style={inputStyle}
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={shippingAddress.city}
                            onChange={(e) => handleShippingChange('city', e.target.value)}
                            placeholder="City *"
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm"
                            style={inputStyle}
                          />
                          <input
                            type="text"
                            value={shippingAddress.state}
                            onChange={(e) => handleShippingChange('state', e.target.value)}
                            placeholder="State *"
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm"
                            style={inputStyle}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={shippingAddress.zip}
                            onChange={(e) => handleShippingChange('zip', e.target.value)}
                            placeholder="ZIP code *"
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm"
                            style={inputStyle}
                          />
                          <select
                            value={shippingAddress.country}
                            onChange={(e) => handleShippingChange('country', e.target.value)}
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm"
                            style={inputStyle}
                          >
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="GB">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                            <option value="IT">Italy</option>
                            <option value="ES">Spain</option>
                            <option value="NL">Netherlands</option>
                            <option value="JP">Japan</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Order Summary */}
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: branding.colors.background }}
                  >
                    <h4
                      className="text-sm font-medium mb-3"
                      style={{ color: branding.colors.secondary }}
                    >
                      Order Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div
                        className="flex justify-between"
                        style={{ color: branding.colors.textLight }}
                      >
                        <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      {showTax && (
                        <div
                          className="flex justify-between"
                          style={{ color: branding.colors.textLight }}
                        >
                          <span>Tax</span>
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
                      <div
                        className="flex justify-between font-display text-lg font-semibold pt-2 border-t"
                        style={{ color: branding.colors.secondary, borderColor: branding.colors.backgroundAlt }}
                      >
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Step Footer */}
                <div
                  className="border-t p-6 space-y-3"
                  style={{ borderColor: branding.colors.backgroundAlt, backgroundColor: branding.colors.background }}
                >
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
                        Continue to Payment
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
                </div>
              </>
            )}
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
