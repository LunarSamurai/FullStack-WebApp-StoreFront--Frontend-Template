import { motion } from 'framer-motion';
import { Award, Heart, Shield, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="py-20 bg-coffee-900 text-cream-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-gold-400 font-medium text-sm uppercase tracking-wider">
              Our Story
            </span>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold">
              Crafting Excellence, <span className="text-gold-400">Defining Luxury</span>
            </h1>
            <p className="mt-6 text-lg text-cream-300 max-w-2xl mx-auto">
              LUXE was founded with a singular vision: to bring exceptional quality and timeless elegance to discerning customers worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-coffee-900">Our Values</h2>
            <div className="mt-4 w-24 h-1 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Award, title: 'Quality', desc: 'Only the finest materials and craftsmanship' },
              { icon: Heart, title: 'Passion', desc: 'Love for excellence in every detail' },
              { icon: Shield, title: 'Trust', desc: 'Secure shopping and authentic products' },
              { icon: Sparkles, title: 'Innovation', desc: 'Constantly evolving to serve you better' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 mx-auto bg-gold-100 rounded-2xl flex items-center justify-center mb-4">
                  <item.icon size={28} className="text-gold-600" />
                </div>
                <h3 className="font-display text-xl font-semibold text-coffee-900">{item.title}</h3>
                <p className="mt-2 text-coffee-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-cream-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-coffee-900">Our Mission</h2>
          <p className="mt-6 text-lg text-coffee-700 leading-relaxed">
            We believe that luxury should be accessible without compromise. Every product in our collection is carefully curated to meet the highest standards of quality, design, and sustainability. Our commitment to excellence extends beyond our products to every interaction you have with us.
          </p>
        </div>
      </section>
    </main>
  );
}
