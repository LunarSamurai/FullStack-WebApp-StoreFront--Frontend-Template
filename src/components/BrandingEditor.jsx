import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, Type, Image, Settings, Save, RotateCcw, Check, 
  ChevronDown, ChevronRight, Eye, EyeOff, Smartphone, Monitor,
  Sun, Moon, Loader2, AlertCircle, Share2, Mail, Phone, MapPin,
  Instagram, Twitter, Facebook, FileText
} from 'lucide-react';
import { useBranding } from '../context/BrandingContext';

// Color Picker Component
function ColorPicker({ label, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const presetColors = [
    '#C4A052', '#B8943E', '#D4AF37', '#FFD700', // Golds
    '#3D2E1E', '#5C4A3A', '#2C1810', '#1A0F0A', // Browns
    '#1F2937', '#374151', '#4B5563', '#6B7280', // Grays
    '#DC2626', '#EA580C', '#D97706', '#CA8A04', // Warm
    '#16A34A', '#0D9488', '#0891B2', '#0284C7', // Cool
    '#7C3AED', '#9333EA', '#C026D3', '#DB2777', // Purple/Pink
    '#FFFFFF', '#F9FAFB', '#F3F4F6', '#E5E7EB', // Lights
  ];

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-coffee-700 mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-xl border-2 border-cream-300 shadow-sm hover:border-gold-400 transition-colors"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-luxe flex-1 font-mono text-sm"
          placeholder="#000000"
        />
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-20 mt-2 p-4 bg-white rounded-xl shadow-2xl border border-cream-200"
          >
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-32 rounded-lg cursor-pointer mb-3"
            />
            <div className="grid grid-cols-7 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => { onChange(color); setIsOpen(false); }}
                  className="w-8 h-8 rounded-lg border-2 border-transparent hover:border-coffee-400 hover:scale-110 transition-all"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Slider Component
function Slider({ label, value, onChange, min = 0, max = 100, step = 1, suffix = '' }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-coffee-700">{label}</label>
        <span className="text-sm text-coffee-500">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
      />
    </div>
  );
}

// Toggle Component
function Toggle({ label, value, onChange, description }) {
  return (
    <label className="flex items-center justify-between cursor-pointer p-3 bg-cream-50 rounded-xl hover:bg-cream-100 transition-colors">
      <div>
        <span className="font-medium text-coffee-900">{label}</span>
        {description && <p className="text-xs text-coffee-500 mt-0.5">{description}</p>}
      </div>
      <div className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-gold-500' : 'bg-cream-300'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`} />
      </div>
    </label>
  );
}

// Section Component
function Section({ title, icon: Icon, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-cream-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-cream-50 hover:bg-cream-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold-100 rounded-lg">
            <Icon size={18} className="text-gold-600" />
          </div>
          <span className="font-semibold text-coffee-900">{title}</span>
        </div>
        {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4 bg-white">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Live Preview Component
function LivePreview({ branding, previewMode }) {
  const isMobile = previewMode === 'mobile';
  
  return (
    <div className={`bg-white rounded-2xl shadow-card overflow-hidden ${isMobile ? 'max-w-sm mx-auto' : ''}`}>
      {/* Mini Navbar Preview */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: branding.colors.white, borderColor: branding.colors.backgroundAlt }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: branding.colors.primary, color: branding.colors.secondary }}
          >
            {branding.logoText}
          </div>
          <span 
            className="font-semibold"
            style={{ color: branding.colors.secondary, fontFamily: branding.fonts.display }}
          >
            {branding.brandName}
          </span>
        </div>
        <div className="flex gap-4 text-sm" style={{ color: branding.colors.textLight }}>
          <span>Home</span>
          <span>Shop</span>
          <span>About</span>
        </div>
      </div>
      
      {/* Mini Hero Preview */}
      <div 
        className="p-6 text-center"
        style={{ backgroundColor: branding.colors.background }}
      >
        <h1 
          className="text-2xl font-bold mb-2"
          style={{ color: branding.colors.secondary, fontFamily: branding.fonts.display }}
        >
          {branding.content.heroTitle}
        </h1>
        <p 
          className="text-sm mb-4 max-w-xs mx-auto"
          style={{ color: branding.colors.textLight }}
        >
          {branding.content.heroSubtitle}
        </p>
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ 
            backgroundColor: branding.colors.primary, 
            color: branding.colors.secondary 
          }}
        >
          {branding.content.heroButtonText}
        </button>
      </div>
      
      {/* Mini Product Card Preview */}
      <div className="p-4" style={{ backgroundColor: branding.colors.backgroundAlt }}>
        <div 
          className="rounded-xl overflow-hidden shadow-sm"
          style={{ backgroundColor: branding.colors.white }}
        >
          <div 
            className="h-24 flex items-center justify-center"
            style={{ backgroundColor: branding.colors.background }}
          >
            {branding.features.showFeaturedBadge && (
              <span 
                className="px-2 py-1 text-xs rounded-full absolute top-2 left-2"
                style={{ backgroundColor: branding.colors.primary, color: branding.colors.secondary }}
              >
                Featured
              </span>
            )}
            <span style={{ color: branding.colors.textLight }}>Product Image</span>
          </div>
          <div className="p-3">
            <p className="text-xs" style={{ color: branding.colors.primary }}>CATEGORY</p>
            <h3 
              className="font-semibold text-sm"
              style={{ color: branding.colors.secondary, fontFamily: branding.fonts.display }}
            >
              Product Name
            </h3>
            <p className="text-sm font-bold mt-1" style={{ color: branding.colors.secondary }}>$99.00</p>
          </div>
        </div>
      </div>
      
      {/* Mini Footer Preview */}
      <div 
        className="p-4 text-center text-xs"
        style={{ backgroundColor: branding.colors.secondary, color: branding.colors.backgroundAlt }}
      >
        <p>{branding.content.footerText}</p>
        <p className="mt-1 opacity-60">© 2024 {branding.brandName}</p>
      </div>
    </div>
  );
}

// Main Branding Editor Component
export default function BrandingEditor() {
  const { branding, updateBranding, saveBranding, resetBranding, saving } = useBranding();
  const [previewMode, setPreviewMode] = useState('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSave = async () => {
    const result = await saveBranding(branding);
    if (result.success) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      setSaveStatus('error');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all branding to defaults?')) {
      resetBranding();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-xl p-4 shadow-card">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              showPreview ? 'bg-gold-100 text-gold-700' : 'bg-cream-100 text-coffee-600'
            }`}
          >
            {showPreview ? <Eye size={18} /> : <EyeOff size={18} />}
            Preview
          </button>
          {showPreview && (
            <div className="flex items-center bg-cream-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-lg transition-colors ${previewMode === 'desktop' ? 'bg-white shadow-sm' : ''}`}
              >
                <Monitor size={18} />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-lg transition-colors ${previewMode === 'mobile' ? 'bg-white shadow-sm' : ''}`}
              >
                <Smartphone size={18} />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-coffee-600 hover:bg-cream-100 rounded-lg transition-colors"
          >
            <RotateCcw size={18} />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-gold flex items-center gap-2"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : saveStatus === 'saved' ? (
              <Check size={18} />
            ) : (
              <Save size={18} />
            )}
            {saving ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {saveStatus === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          Failed to save branding settings. Please try again.
        </div>
      )}

      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : ''}`}>
        {/* Editor Panel */}
        <div className="space-y-4">
          {/* Brand Identity */}
          <Section title="Brand Identity" icon={Image} defaultOpen={true}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">Brand Name</label>
                <input
                  type="text"
                  value={branding.brandName}
                  onChange={(e) => updateBranding('brandName', e.target.value)}
                  className="input-luxe"
                  placeholder="Your Brand Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">Logo Text (1-2 characters)</label>
                <input
                  type="text"
                  value={branding.logoText}
                  onChange={(e) => updateBranding('logoText', e.target.value.slice(0, 2))}
                  className="input-luxe w-24 text-center text-2xl font-bold"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">Tagline</label>
                <input
                  type="text"
                  value={branding.tagline}
                  onChange={(e) => updateBranding('tagline', e.target.value)}
                  className="input-luxe"
                  placeholder="Your brand tagline"
                />
              </div>
            </div>
          </Section>

          {/* Colors */}
          <Section title="Colors" icon={Palette}>
            <div className="grid grid-cols-2 gap-4">
              <ColorPicker
                label="Primary Color"
                value={branding.colors.primary}
                onChange={(v) => updateBranding('colors.primary', v)}
              />
              <ColorPicker
                label="Primary Hover"
                value={branding.colors.primaryHover}
                onChange={(v) => updateBranding('colors.primaryHover', v)}
              />
              <ColorPicker
                label="Secondary Color"
                value={branding.colors.secondary}
                onChange={(v) => updateBranding('colors.secondary', v)}
              />
              <ColorPicker
                label="Secondary Light"
                value={branding.colors.secondaryLight}
                onChange={(v) => updateBranding('colors.secondaryLight', v)}
              />
              <ColorPicker
                label="Background"
                value={branding.colors.background}
                onChange={(v) => updateBranding('colors.background', v)}
              />
              <ColorPicker
                label="Background Alt"
                value={branding.colors.backgroundAlt}
                onChange={(v) => updateBranding('colors.backgroundAlt', v)}
              />
              <ColorPicker
                label="Text Color"
                value={branding.colors.text}
                onChange={(v) => updateBranding('colors.text', v)}
              />
              <ColorPicker
                label="Text Light"
                value={branding.colors.textLight}
                onChange={(v) => updateBranding('colors.textLight', v)}
              />
            </div>
          </Section>

          {/* Typography */}
          <Section title="Typography" icon={Type}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">Display Font</label>
                <select
                  value={branding.fonts.display}
                  onChange={(e) => updateBranding('fonts.display', e.target.value)}
                  className="input-luxe"
                >
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Cormorant Garamond">Cormorant Garamond</option>
                  <option value="Libre Baskerville">Libre Baskerville</option>
                  <option value="Merriweather">Merriweather</option>
                  <option value="Lora">Lora</option>
                  <option value="DM Serif Display">DM Serif Display</option>
                  <option value="Inter">Inter</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">Body Font</label>
                <select
                  value={branding.fonts.body}
                  onChange={(e) => updateBranding('fonts.body', e.target.value)}
                  className="input-luxe"
                >
                  <option value="Inter">Inter</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Source Sans Pro">Source Sans Pro</option>
                  <option value="Nunito">Nunito</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
            </div>
          </Section>

          {/* Content */}
          <Section title="Page Content" icon={FileText}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">Hero Title</label>
                <input
                  type="text"
                  value={branding.content.heroTitle}
                  onChange={(e) => updateBranding('content.heroTitle', e.target.value)}
                  className="input-luxe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">Hero Subtitle</label>
                <textarea
                  value={branding.content.heroSubtitle}
                  onChange={(e) => updateBranding('content.heroSubtitle', e.target.value)}
                  className="input-luxe resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">Hero Button Text</label>
                <input
                  type="text"
                  value={branding.content.heroButtonText}
                  onChange={(e) => updateBranding('content.heroButtonText', e.target.value)}
                  className="input-luxe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">Shop Page Title</label>
                <input
                  type="text"
                  value={branding.content.shopTitle}
                  onChange={(e) => updateBranding('content.shopTitle', e.target.value)}
                  className="input-luxe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">Footer Text</label>
                <input
                  type="text"
                  value={branding.content.footerText}
                  onChange={(e) => updateBranding('content.footerText', e.target.value)}
                  className="input-luxe"
                />
              </div>
            </div>
          </Section>

          {/* Store Settings */}
          <Section title="Store Settings" icon={Settings}>
            <div className="space-y-4">
              <Toggle
                label="Show Featured Badge"
                description="Display 'Featured' badge on featured products"
                value={branding.features.showFeaturedBadge}
                onChange={(v) => updateBranding('features.showFeaturedBadge', v)}
              />
              <Toggle
                label="Show Tax in Cart"
                description="Display tax calculation in cart"
                value={branding.features.showTaxInCart}
                onChange={(v) => updateBranding('features.showTaxInCart', v)}
              />
              <Slider
                label="Free Shipping Threshold"
                value={branding.features.freeShippingThreshold}
                onChange={(v) => updateBranding('features.freeShippingThreshold', v)}
                min={0}
                max={500}
                step={10}
                suffix="$"
              />
              <Slider
                label="Tax Rate"
                value={Math.round(branding.features.taxRate * 100)}
                onChange={(v) => updateBranding('features.taxRate', v / 100)}
                min={0}
                max={20}
                step={0.5}
                suffix="%"
              />
            </div>
          </Section>

          {/* Social Links */}
          <Section title="Social Links" icon={Share2}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Instagram size={20} className="text-coffee-400" />
                <input
                  type="text"
                  value={branding.social.instagram}
                  onChange={(e) => updateBranding('social.instagram', e.target.value)}
                  className="input-luxe flex-1"
                  placeholder="Instagram URL"
                />
              </div>
              <div className="flex items-center gap-3">
                <Twitter size={20} className="text-coffee-400" />
                <input
                  type="text"
                  value={branding.social.twitter}
                  onChange={(e) => updateBranding('social.twitter', e.target.value)}
                  className="input-luxe flex-1"
                  placeholder="Twitter/X URL"
                />
              </div>
              <div className="flex items-center gap-3">
                <Facebook size={20} className="text-coffee-400" />
                <input
                  type="text"
                  value={branding.social.facebook}
                  onChange={(e) => updateBranding('social.facebook', e.target.value)}
                  className="input-luxe flex-1"
                  placeholder="Facebook URL"
                />
              </div>
            </div>
          </Section>

          {/* Contact Info */}
          <Section title="Contact Information" icon={Mail}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-coffee-400" />
                <input
                  type="email"
                  value={branding.contact.email}
                  onChange={(e) => updateBranding('contact.email', e.target.value)}
                  className="input-luxe flex-1"
                  placeholder="contact@example.com"
                />
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-coffee-400" />
                <input
                  type="tel"
                  value={branding.contact.phone}
                  onChange={(e) => updateBranding('contact.phone', e.target.value)}
                  className="input-luxe flex-1"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-coffee-400" />
                <input
                  type="text"
                  value={branding.contact.address}
                  onChange={(e) => updateBranding('contact.address', e.target.value)}
                  className="input-luxe flex-1"
                  placeholder="123 Main St, City, State"
                />
              </div>
            </div>
          </Section>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-cream-100 rounded-2xl p-4">
              <h3 className="font-semibold text-coffee-900 mb-4 flex items-center gap-2">
                <Eye size={18} />
                Live Preview
              </h3>
              <LivePreview branding={branding} previewMode={previewMode} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}