import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Shield, Truck, RefreshCw } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { useBranding } from '../context/BrandingContext';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const { products, loading } = useProducts();
  const { branding } = useBranding();
  
  const featuredProducts = products.filter(p => p.featured).slice(0, 4);

  const features = [
    {
      icon: Shield,
      title: 'Premium Quality',
      description: 'Every product meets our high standards'
    },
    {
      icon: Truck,
      title: 'Free Shipping',
      description: `On orders over $${branding.features.freeShippingThreshold}`
    },
    {
      icon: RefreshCw,
      title: 'Easy Returns',
      description: '30-day hassle-free returns'
    },
    {
      icon: Star,
      title: 'Curated Selection',
      description: 'Handpicked for excellence'
    }
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center justify-center"
        style={{ backgroundColor: branding.colors.background }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: branding.colors.primary }}
          />
          <div 
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: branding.colors.primary }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span 
              className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ backgroundColor: `${branding.colors.primary}20`, color: branding.colors.primary }}
            >
              {branding.tagline}
            </span>
            <h1 
              className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight"
              style={{ color: branding.colors.secondary }}
            >
              {branding.content.heroTitle}
            </h1>
            <p 
              className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto"
              style={{ color: branding.colors.textLight }}
            >
              {branding.content.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/shop"
                className="group flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all hover:gap-3"
                style={{ backgroundColor: branding.colors.primary, color: branding.colors.secondary }}
              >
                {branding.content.heroButtonText}
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 rounded-xl font-semibold border-2 transition-colors"
                style={{ 
                  borderColor: branding.colors.secondary, 
                  color: branding.colors.secondary 
                }}
              >
                Our Story
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div 
            className="w-6 h-10 rounded-full border-2 flex items-start justify-center p-2"
            style={{ borderColor: branding.colors.textLight }}
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: branding.colors.textLight }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20" style={{ backgroundColor: branding.colors.white }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div 
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${branding.colors.primary}20` }}
                >
                  <feature.icon size={28} style={{ color: branding.colors.primary }} />
                </div>
                <h3 
                  className="font-display font-semibold mb-2"
                  style={{ color: branding.colors.secondary }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm" style={{ color: branding.colors.textLight }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-20" style={{ backgroundColor: branding.colors.background }}>
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 
                className="font-display text-4xl font-bold mb-4"
                style={{ color: branding.colors.secondary }}
              >
                Featured Collection
              </h2>
              <p style={{ color: branding.colors.textLight }}>
                Our most loved pieces, curated just for you
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all hover:gap-3"
                style={{ backgroundColor: branding.colors.secondary, color: branding.colors.background }}
              >
                View All Products
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section 
        className="py-20"
        style={{ backgroundColor: branding.colors.secondary }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 
              className="font-display text-4xl font-bold mb-6"
              style={{ color: branding.colors.background }}
            >
              Ready to Elevate Your Style?
            </h2>
            <p 
              className="text-lg mb-10"
              style={{ color: branding.colors.backgroundAlt }}
            >
              Join thousands of satisfied customers who have discovered the {branding.brandName} difference.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all hover:gap-3"
              style={{ backgroundColor: branding.colors.primary, color: branding.colors.secondary }}
            >
              Start Shopping
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}