import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const BrandingContext = createContext(null);

// Default branding settings
const defaultBranding = {
  // Brand Identity
  brandName: 'LUXE',
  tagline: 'Premium Quality, Timeless Style',
  logoText: 'L',
  
  // Colors
  colors: {
    primary: '#C4A052',      // Gold
    primaryHover: '#B8943E',
    secondary: '#3D2E1E',    // Coffee
    secondaryLight: '#5C4A3A',
    background: '#FAF8F5',   // Cream
    backgroundAlt: '#F5F0E8',
    text: '#3D2E1E',
    textLight: '#7A6A5A',
    accent: '#C4A052',
    success: '#22C55E',
    error: '#EF4444',
    white: '#FFFFFF',
  },
  
  // Typography
  fonts: {
    display: 'Playfair Display',
    body: 'Inter',
    accent: 'Cormorant Garamond',
  },
  
  // Text Content
  content: {
    heroTitle: 'Discover Luxury',
    heroSubtitle: 'Curated collections of premium products for the discerning individual',
    heroButtonText: 'Shop Now',
    shopTitle: 'Our Collection',
    shopSubtitle: 'Discover our curated selection of premium products',
    aboutTitle: 'Our Story',
    aboutText: 'We believe in quality over quantity. Every product in our collection is carefully selected to meet the highest standards of craftsmanship and design.',
    footerText: 'Premium quality products for the modern lifestyle.',
  },
  
  // Feature Toggles
  features: {
    showHeroVideo: false,
    showFeaturedBadge: true,
    showTaxInCart: true,
    freeShippingThreshold: 100,
    taxRate: 0.08,
  },
  
  // Social Links
  social: {
    instagram: '',
    twitter: '',
    facebook: '',
    tiktok: '',
  },
  
  // Contact Info
  contact: {
    email: '',
    phone: '',
    address: '',
  }
};

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(defaultBranding);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load branding from Supabase on mount
  useEffect(() => {
    loadBranding();
  }, []);

  // Apply CSS variables when branding changes
  useEffect(() => {
    applyBrandingStyles(branding);
  }, [branding]);

  const loadBranding = async () => {
    try {
      const { data, error } = await supabase
        .from('branding')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading branding:', error);
      }

      if (data?.settings) {
        setBranding(prev => deepMerge(prev, data.settings));
      }
    } catch (err) {
      console.error('Error loading branding:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveBranding = async (newBranding) => {
    setSaving(true);
    try {
      // Upsert branding settings
      const { error } = await supabase
        .from('branding')
        .upsert({ 
          id: 1, 
          settings: newBranding,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setBranding(newBranding);
      return { success: true };
    } catch (err) {
      console.error('Error saving branding:', err);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  const updateBranding = (path, value) => {
    setBranding(prev => {
      const newBranding = { ...prev };
      setNestedValue(newBranding, path, value);
      return newBranding;
    });
  };

  const resetBranding = () => {
    setBranding(defaultBranding);
  };

  const applyBrandingStyles = (brand) => {
    const root = document.documentElement;
    
    // Apply color variables
    root.style.setProperty('--color-gold-500', brand.colors.primary);
    root.style.setProperty('--color-gold-600', brand.colors.primaryHover);
    root.style.setProperty('--color-coffee-900', brand.colors.secondary);
    root.style.setProperty('--color-coffee-700', brand.colors.secondaryLight);
    root.style.setProperty('--color-coffee-600', brand.colors.textLight);
    root.style.setProperty('--color-coffee-500', brand.colors.textLight);
    root.style.setProperty('--color-cream-50', brand.colors.background);
    root.style.setProperty('--color-cream-100', brand.colors.backgroundAlt);
    
    // Apply font families
    root.style.setProperty('--font-display', brand.fonts.display);
    root.style.setProperty('--font-body', brand.fonts.body);
    root.style.setProperty('--font-accent', brand.fonts.accent);
  };

  const value = {
    branding,
    loading,
    saving,
    updateBranding,
    saveBranding,
    resetBranding,
    defaultBranding
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}

// Helper functions
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export default BrandingContext;