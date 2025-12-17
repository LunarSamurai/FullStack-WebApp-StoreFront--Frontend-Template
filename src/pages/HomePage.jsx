import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Truck, Shield, Sparkles } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const { getFeaturedProducts, loading } = useProducts();
  const featuredProducts = getFeaturedProducts().slice(0, 4);

  return (
    <main className="min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cream-50 via-cream-100 to-cream-200">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(212,168,84,0.15) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(139,111,78,0.1) 0%, transparent 50%)`
          }} />
        </div>

        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 right-1/4 w-96 h-96 border border-gold-300/30 rounded-full"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur rounded-full border border-gold-300/50 mb-8">
              <Sparkles size={16} className="text-gold-500" />
              <span className="text-sm font-medium text-coffee-700">Premium Collection</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-coffee-900 leading-tight">
              Discover
              <span className="block gold-shimmer">Timeless Elegance</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-coffee-600 max-w-2xl mx-auto">
              Curated luxury goods crafted with exceptional quality. Every piece tells a story of artisanal excellence.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/shop" className="group btn-gold flex items-center gap-2 px-8 py-4 text-lg">
                Shop Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/about" className="px-8 py-4 text-coffee-700 font-medium hover:text-gold-600 transition-colors">
                Our Story
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            {[
              { icon: Truck, label: 'Free Shipping', sub: 'Orders over $100' },
              { icon: Shield, label: 'Secure Payment', sub: 'SSL Encrypted' },
              { icon: Star, label: 'Premium Quality', sub: 'Handcrafted' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 mx-auto bg-white rounded-xl shadow-card flex items-center justify-center mb-2">
                  <item.icon size={24} className="text-gold-500" />
                </div>
                <p className="font-medium text-coffee-900 text-sm">{item.label}</p>
                <p className="text-xs text-coffee-500">{item.sub}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-coffee-400/50 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-gold-500 rounded-full" />
          </div>
        </motion.div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-600 font-medium text-sm uppercase tracking-wider">Featured Collection</span>
            <h2 className="mt-2 font-display text-4xl font-bold text-coffee-900">Handpicked for You</h2>
            <div className="mt-4 w-24 h-1 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto rounded-full" />
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="spinner" /></div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-coffee-500">
              <p>No featured products yet.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-coffee-900 text-coffee-900 font-medium rounded-lg hover:bg-coffee-900 hover:text-cream-100 transition-colors">
              View All Products
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-coffee-900 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream-100">
            Experience <span className="text-gold-400">Luxury</span> Like Never Before
          </h2>
          <p className="mt-4 text-cream-300 text-lg">
            Join thousands of satisfied customers who trust LUXE for their premium needs.
          </p>
          <Link to="/shop" className="mt-8 inline-flex items-center gap-2 btn-gold">
            Explore Collection
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}