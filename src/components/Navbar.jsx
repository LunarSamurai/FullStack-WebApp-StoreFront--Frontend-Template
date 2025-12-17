import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Shield, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBranding } from '../context/BrandingContext';

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const { items, toggleCart } = useCart();
  const { branding } = useBranding();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/about', label: 'About' },
  ];

  if (isAdmin) {
    navLinks.push({ path: '/admin', label: 'Admin', icon: Shield });
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gold-500 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="font-display text-xl font-bold text-coffee-900">{branding.logoText}</span>
            </div>
            <span className="font-display text-xl font-bold text-coffee-900">
              {branding.brandName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors relative ${
                  location.pathname === link.path
                    ? 'text-gold-600'
                    : 'text-coffee-700 hover:text-gold-600'
                }`}
              >
                {link.icon && <link.icon size={16} />}
                {link.label}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold-500 rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2.5 text-coffee-700 hover:text-gold-600 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={22} />
              {cartItemsCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gold-500 text-coffee-900 text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {cartItemsCount}
                </motion.span>
              )}
            </button>

            {/* User Button / Sign In */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  className="p-2.5 bg-gold-500 text-coffee-900 rounded-full hover:bg-gold-600 transition-colors"
                  aria-label="User menu"
                >
                  <User size={20} />
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-cream-200 overflow-hidden"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-cream-100 bg-cream-50">
                        <p className="text-sm font-medium text-coffee-900 truncate">
                          {user.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 mt-1 text-xs text-gold-600 font-medium">
                            <Shield size={12} />
                            Admin
                          </span>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-coffee-700 hover:bg-cream-50 transition-colors"
                        >
                          <Settings size={16} />
                          Account Settings
                        </Link>
                        
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-coffee-700 hover:bg-cream-50 transition-colors"
                          >
                            <Shield size={16} />
                            Admin Dashboard
                          </Link>
                        )}

                        <hr className="my-2 border-cream-100" />
                        
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="px-5 py-2.5 bg-coffee-900 text-cream-50 text-sm font-semibold rounded-full hover:bg-coffee-800 transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-coffee-700 hover:text-gold-600 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-cream-200"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-gold-100 text-gold-700'
                      : 'text-coffee-700 hover:bg-cream-100'
                  }`}
                >
                  {link.icon && <link.icon size={18} />}
                  {link.label}
                </Link>
              ))}
              
              <hr className="my-2 border-cream-200" />
              
              {user ? (
                <>
                  <Link
                    to="/account"
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-coffee-700 hover:bg-cream-100 transition-colors"
                  >
                    <Settings size={18} />
                    Account Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth/login"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-coffee-900 text-cream-50 rounded-xl text-sm font-semibold hover:bg-coffee-800 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}