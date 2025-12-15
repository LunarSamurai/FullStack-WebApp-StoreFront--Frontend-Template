import { Link } from 'react-router-dom';
import { Shield, Lock, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-coffee-900 text-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gold-500 flex items-center justify-center">
                <span className="font-accent text-xl text-coffee-900">L</span>
              </div>
              <span className="font-display text-2xl font-semibold">LUXE</span>
            </div>
            <p className="mt-4 text-cream-400 max-w-sm">
              Curated luxury goods for the discerning customer. Quality craftsmanship, timeless elegance.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs text-cream-400">
                <Lock size={14} className="text-green-400" />
                SSL Secured
              </div>
              <div className="flex items-center gap-2 text-xs text-cream-400">
                <Shield size={14} className="text-green-400" />
                Secure Payments
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold text-cream-100 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {['Home', 'Shop', 'About', 'Contact'].map(link => (
                <li key={link}>
                  <Link to={link === 'Home' ? '/' : `/${link.toLowerCase()}`} className="text-cream-400 hover:text-gold-400 transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display text-lg font-semibold text-cream-100 mb-4">Support</h3>
            <ul className="space-y-3 text-cream-400">
              <li>support@luxe.store</li>
              <li>1-800-LUXE-STORE</li>
              <li className="pt-2">
                <div className="flex items-center gap-2">
                  <CreditCard size={20} />
                  <span className="text-xs">Powered by Stripe</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-coffee-700 text-center text-sm text-cream-500">
          <p>© {new Date().getFullYear()} LUXE Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
