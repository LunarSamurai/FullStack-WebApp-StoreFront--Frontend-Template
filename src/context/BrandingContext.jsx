import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

const defaultBranding = {
  // Brand Identity
  brandName: 'LUXE',
  logoText: 'L',
  tagline: 'Premium Collection',
  
  // Colors
  colors: {
    primary: '#C4A052',
    primaryHover: '#B8943E',
    secondary: '#3D2E1E',
    secondaryLight: '#5C4A3A',
    background: '#FAF7F2',
    backgroundAlt: '#F5F0E8',
    white: '#FFFFFF',
    text: '#3D2E1E',
    textLight: '#7A6A5A',
  },
  
  // Fonts
  fonts: {
    display: 'Playfair Display',
    body: 'Inter',
  },
  
  // Content
  content: {
    heroTitle: 'Discover Timeless Elegance',
    heroTitle1: 'Discover',
    heroTitle2: 'Timeless Elegance',
    heroSubtitle: 'Curated luxury goods crafted with exceptional quality. Every piece tells a story of artisanal excellence.',
    heroButtonText: 'Shop Now',
    shopTitle: 'Our Collection',
    shopSubtitle: 'Discover our curated selection of premium products',
    aboutTitle: 'Our Story',
    aboutText: 'We are dedicated to bringing you the finest curated products.',
    footerText: 'Curated luxury goods for the discerning customer.',
    featuredLabel: 'Featured Collection',
    featuredTitle: 'Handpicked for You',
    viewAllText: 'View All Products',
    ctaTitle1: 'Experience',
    ctaTitle2: 'Luxury',
    ctaTitle3: 'Like Never Before',
    ctaSubtitle: 'Join thousands of satisfied customers who trust LUXE for their premium needs.',
    ctaButtonText: 'Explore Collection',
    feature1Title: 'Free Shipping',
    feature1Subtitle: 'Orders over $100',
    feature2Title: 'Secure Payment',
    feature2Subtitle: 'SSL Encrypted',
    feature3Title: 'Premium Quality',
    feature3Subtitle: 'Handcrafted',
    freeShippingThreshold: 100,
    freeShippingMessage: 'Free shipping on orders over $100',
  },
  
  // Features/Settings
  features: {
    showFeaturedBadge: true,
    showTaxInCart: true,
    freeShippingThreshold: 100,
    taxRate: 0.08,
    enableReviews: false,
    enableWishlist: false,
  },
  
  // Social Links
  social: {
    instagram: '',
    twitter: '',
    facebook: '',
  },
  
  // Contact Info
  contact: {
    email: 'support@luxe.store',
    phone: '',
    address: '',
  },
};

const BrandingContext = createContext(null);

// Helper: Convert hex to RGB values (space-separated for CSS)
function hexToRgb(hex) {
  if (!hex) return null;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
  }
  return null;
}

// Helper: Generate color shades from a base color
function generateShades(baseHex, type) {
  const base = hexToRgb(baseHex);
  if (!base) return {};
  
  const [r, g, b] = base.split(' ').map(Number);
  
  if (type === 'gold') {
    return {
      50: `${Math.min(r + 57, 255)} ${Math.min(g + 91, 255)} ${Math.min(b + 163, 255)}`,
      100: `${Math.min(r + 54, 255)} ${Math.min(g + 84, 255)} ${Math.min(b + 143, 255)}`,
      200: `${Math.min(r + 49, 255)} ${Math.min(g + 73, 255)} ${Math.min(b + 108, 255)}`,
      300: `${Math.min(r + 39, 255)} ${Math.min(g + 53, 255)} ${Math.min(b + 58, 255)}`,
      400: `${Math.min(r + 24, 255)} ${Math.min(g + 25, 255)} ${Math.min(b + 8, 255)}`,
      500: `${r} ${g} ${b}`,
      600: `${Math.max(r - 26, 0)} ${Math.max(g - 25, 0)} ${Math.max(b - 22, 0)}`,
      700: `${Math.max(r - 56, 0)} ${Math.max(g - 50, 0)} ${Math.max(b - 37, 0)}`,
    };
  }
  
  if (type === 'coffee') {
    return {
      50: `${Math.min(r + 189, 255)} ${Math.min(g + 201, 255)} ${Math.min(b + 212, 255)}`,
      100: `${Math.min(r + 184, 255)} ${Math.min(g + 194, 255)} ${Math.min(b + 202, 255)}`,
      200: `${Math.min(r + 174, 255)} ${Math.min(g + 179, 255)} ${Math.min(b + 180, 255)}`,
      300: `${Math.min(r + 139, 255)} ${Math.min(g + 134, 255)} ${Math.min(b + 125, 255)}`,
      400: `${Math.min(r + 99, 255)} ${Math.min(g + 94, 255)} ${Math.min(b + 85, 255)}`,
      500: `${Math.min(r + 61, 255)} ${Math.min(g + 60, 255)} ${Math.min(b + 60, 255)}`,
      600: `${Math.min(r + 39, 255)} ${Math.min(g + 39, 255)} ${Math.min(b + 40, 255)}`,
      700: `${Math.min(r + 19, 255)} ${Math.min(g + 22, 255)} ${Math.min(b + 25, 255)}`,
      800: `${r} ${g + 6} ${b + 12}`,
      900: `${r} ${g} ${b}`,
    };
  }
  
  if (type === 'cream') {
    return {
      50: '250 247 242',
      100: '245 240 232',
      200: '235 225 210',
      300: '220 208 190',
      400: '200 185 165',
    };
  }
  
  return {};
}

// Apply CSS variables to document root
function applyCSSVariables(branding) {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Generate color shades from primary (gold) color
  const goldShades = generateShades(branding.colors?.primary || '#C4A052', 'gold');
  Object.entries(goldShades).forEach(([shade, value]) => {
    root.style.setProperty(`--color-gold-${shade}`, value);
  });
  
  // Generate color shades from secondary (coffee) color
  const coffeeShades = generateShades(branding.colors?.secondary || '#3D2E1E', 'coffee');
  Object.entries(coffeeShades).forEach(([shade, value]) => {
    root.style.setProperty(`--color-coffee-${shade}`, value);
  });
  
  // Cream shades
  const creamShades = generateShades(branding.colors?.background || '#FAF7F2', 'cream');
  Object.entries(creamShades).forEach(([shade, value]) => {
    root.style.setProperty(`--color-cream-${shade}`, value);
  });
}

// Deep merge helper
function deepMerge(target, source) {
  const output = { ...target };
  if (!source) return output;
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (target[key] && typeof target[key] === 'object') {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = { ...source[key] };
      }
    } else if (source[key] !== undefined) {
      output[key] = source[key];
    }
  }
  
  return output;
}

// Set nested value by path (e.g., 'colors.primary')
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const newObj = { ...obj };
  let current = newObj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = { ...current[keys[i]] };
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
  return newObj;
}

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(defaultBranding);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBranding = async () => {
    try {
      const { data, error } = await supabase
        .from('branding')
        .select('*')
        .eq('id', 1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching branding:', error);
      }

      if (data?.settings) {
        const merged = deepMerge(defaultBranding, data.settings);
        setBranding(merged);
        applyCSSVariables(merged);
      } else {
        applyCSSVariables(defaultBranding);
      }
    } catch (err) {
      console.error('Error fetching branding:', err);
      applyCSSVariables(defaultBranding);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  // Update a single field by path (e.g., 'colors.primary', '#FF0000')
  const updateBranding = useCallback((path, value) => {
    setBranding(prev => {
      const newBranding = setNestedValue(prev, path, value);
      // Apply CSS variables in real-time for color changes
      if (path.startsWith('colors.')) {
        applyCSSVariables(newBranding);
      }
      return newBranding;
    });
  }, []);

  // Save current branding to database
  const saveBranding = async (brandingToSave) => {
    setSaving(true);
    const dataToSave = brandingToSave || branding;
    try {
      const { error } = await supabase
        .from('branding')
        .upsert({
          id: 1,
          settings: dataToSave,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      applyCSSVariables(dataToSave);
      return { success: true };
    } catch (err) {
      console.error('Error saving branding:', err);
      return { success: false, error: err };
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const resetBranding = useCallback(() => {
    setBranding(defaultBranding);
    applyCSSVariables(defaultBranding);
  }, []);

  // Refetch from database
  const refetchBranding = () => {
    fetchBranding();
  };

  return (
    <BrandingContext.Provider value={{ 
      branding, 
      loading, 
      saving,
      updateBranding, 
      saveBranding, 
      resetBranding,
      refetchBranding 
    }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    return { 
      branding: defaultBranding, 
      loading: false,
      saving: false,
      updateBranding: () => {},
      saveBranding: async () => ({ success: false }),
      resetBranding: () => {},
      refetchBranding: () => {},
    };
  }
  return context;
}

export { defaultBranding };