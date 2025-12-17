import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { useBranding } from '../context/BrandingContext';

export default function Footer() {
  const { branding } = useBranding();
  const currentYear = new Date().getFullYear();

  const hasSocialLinks = branding.social.instagram || branding.social.twitter || branding.social.facebook;
  const hasContactInfo = branding.contact.email || branding.contact.phone || branding.contact.address;

  return (
    <footer style={{ backgroundColor: branding.colors.secondary }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: branding.colors.primary }}
              >
                <span 
                  className="font-accent text-xl"
                  style={{ color: branding.colors.secondary }}
                >
                  {branding.logoText}
                </span>
              </div>
              <span 
                className="font-display text-xl font-bold"
                style={{ color: branding.colors.background }}
              >
                {branding.brandName}
              </span>
            </Link>
            <p 
              className="max-w-sm mb-6"
              style={{ color: branding.colors.backgroundAlt }}
            >
              {branding.content.footerText}
            </p>
            
            {/* Social Links */}
            {hasSocialLinks && (
              <div className="flex gap-4">
                {branding.social.instagram && (
                  <a 
                    href={branding.social.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg transition-colors hover:bg-white/10"
                    style={{ color: branding.colors.backgroundAlt }}
                  >
                    <Instagram size={20} />
                  </a>
                )}
                {branding.social.twitter && (
                  <a 
                    href={branding.social.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg transition-colors hover:bg-white/10"
                    style={{ color: branding.colors.backgroundAlt }}
                  >
                    <Twitter size={20} />
                  </a>
                )}
                {branding.social.facebook && (
                  <a 
                    href={branding.social.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg transition-colors hover:bg-white/10"
                    style={{ color: branding.colors.backgroundAlt }}
                  >
                    <Facebook size={20} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 
              className="font-display font-semibold mb-4"
              style={{ color: branding.colors.background }}
            >
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { path: '/', label: 'Home' },
                { path: '/shop', label: 'Shop' },
                { path: '/about', label: 'About' },
                { path: '/account', label: 'Account' },
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-sm transition-colors hover:underline"
                    style={{ color: branding.colors.backgroundAlt }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          {hasContactInfo && (
            <div>
              <h3 
                className="font-display font-semibold mb-4"
                style={{ color: branding.colors.background }}
              >
                Contact
              </h3>
              <ul className="space-y-3">
                {branding.contact.email && (
                  <li className="flex items-center gap-2 text-sm" style={{ color: branding.colors.backgroundAlt }}>
                    <Mail size={16} />
                    <a href={`mailto:${branding.contact.email}`} className="hover:underline">
                      {branding.contact.email}
                    </a>
                  </li>
                )}
                {branding.contact.phone && (
                  <li className="flex items-center gap-2 text-sm" style={{ color: branding.colors.backgroundAlt }}>
                    <Phone size={16} />
                    <a href={`tel:${branding.contact.phone}`} className="hover:underline">
                      {branding.contact.phone}
                    </a>
                  </li>
                )}
                {branding.contact.address && (
                  <li className="flex items-start gap-2 text-sm" style={{ color: branding.colors.backgroundAlt }}>
                    <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{branding.contact.address}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div 
          className="mt-12 pt-8 border-t text-center text-sm"
          style={{ borderColor: branding.colors.secondaryLight, color: branding.colors.backgroundAlt }}
        >
          <p>© {currentYear} {branding.brandName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}