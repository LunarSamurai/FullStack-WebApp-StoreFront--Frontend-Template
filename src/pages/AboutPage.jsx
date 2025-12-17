import { motion } from 'framer-motion';
import { Award, Heart, Shield, Sparkles } from 'lucide-react';
import { useBranding } from '../context/BrandingContext';

export default function AboutPage() {
  const { branding } = useBranding();

  const values = [
    {
      icon: Award,
      title: 'Quality',
      description: 'Only the finest materials and craftsmanship'
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'Love for excellence in every detail'
    },
    {
      icon: Shield,
      title: 'Trust',
      description: 'Secure shopping and authentic products'
    },
    {
      icon: Sparkles,
      title: 'Innovation',
      description: 'Constantly evolving to serve you better'
    }
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-coffee-900 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-gold-500 font-medium text-sm uppercase tracking-wider">
              Our Story
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mt-4 text-cream-50">
              Crafting Excellence, <span className="text-gold-500">Defining Luxury</span>
            </h1>
            <p className="mt-6 text-cream-300 text-lg max-w-2xl mx-auto">
              {branding.brandName} was founded with a singular vision: to bring exceptional quality and timeless 
              elegance to discerning customers worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl font-bold text-coffee-900">Our Values</h2>
            <div className="mt-4 w-16 h-1 bg-gold-500 mx-auto rounded-full" />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto bg-gold-100 rounded-2xl flex items-center justify-center mb-4">
                  <value.icon size={28} className="text-gold-600" />
                </div>
                <h3 className="font-display font-semibold text-coffee-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-coffee-500">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-coffee-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold text-cream-50 mb-6">Our Mission</h2>
            <p className="text-cream-300 text-lg leading-relaxed">
              We believe that luxury should be accessible without compromise. Every product in our collection is carefully 
              curated to meet the highest standards of quality, design, and sustainability.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="aspect-square bg-cream-100 rounded-2xl flex items-center justify-center">
                <span className="font-display text-8xl text-gold-500">
                  {branding.logoText}
                </span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-gold-600 font-medium text-sm uppercase tracking-wider">
                Our Journey
              </span>
              <h2 className="font-display text-3xl font-bold text-coffee-900 mt-2 mb-6">
                Built on a Foundation of Excellence
              </h2>
              <div className="space-y-4 text-coffee-600">
                <p>
                  {branding.brandName} was founded with a simple mission: to bring premium quality products 
                  to discerning customers who appreciate the finer things in life.
                </p>
                <p>
                  We believe that every purchase should bring joy, not just at the moment of unboxing, 
                  but for years to come. That's why we meticulously curate our collection, partnering 
                  only with artisans and manufacturers who share our commitment to excellence.
                </p>
                <p>
                  Today, we're proud to serve customers around the world, delivering not just products, 
                  but experiences that elevate everyday life.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-coffee-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold text-cream-50 mb-6">
              Ready to Experience the Difference?
            </h2>
            <p className="text-cream-300 mb-8">
              Browse our curated collection and discover products that inspire.
            </p>
            <a
              href="/shop"
              className="inline-block btn-gold px-8 py-4 text-lg"
            >
              Explore Our Collection
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}