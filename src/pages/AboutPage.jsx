import { motion } from 'framer-motion';
import { Heart, Award, Users, Globe } from 'lucide-react';
import { useBranding } from '../context/BrandingContext';

export default function AboutPage() {
  const { branding } = useBranding();

  const values = [
    {
      icon: Heart,
      title: 'Passion for Quality',
      description: 'Every product we offer is carefully selected to meet our exacting standards.'
    },
    {
      icon: Award,
      title: 'Excellence in Design',
      description: 'We believe beautiful design enhances the everyday experience.'
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Your satisfaction drives everything we do.'
    },
    {
      icon: Globe,
      title: 'Sustainable Practices',
      description: 'We\'re committed to responsible sourcing and packaging.'
    }
  ];

  return (
    <main className="min-h-screen pt-24 pb-16" style={{ backgroundColor: branding.colors.background }}>
      {/* Hero */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 
              className="font-display text-4xl md:text-5xl font-bold mb-6"
              style={{ color: branding.colors.secondary }}
            >
              {branding.content.aboutTitle}
            </h1>
            <p 
              className="text-lg leading-relaxed"
              style={{ color: branding.colors.textLight }}
            >
              {branding.content.aboutText}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16" style={{ backgroundColor: branding.colors.white }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div 
                className="aspect-square rounded-2xl"
                style={{ backgroundColor: branding.colors.background }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <span 
                    className="font-display text-8xl"
                    style={{ color: branding.colors.primary }}
                  >
                    {branding.logoText}
                  </span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span 
                className="text-sm font-medium uppercase tracking-wider"
                style={{ color: branding.colors.primary }}
              >
                Our Story
              </span>
              <h2 
                className="font-display text-3xl font-bold mt-2 mb-6"
                style={{ color: branding.colors.secondary }}
              >
                Built on a Foundation of Excellence
              </h2>
              <div 
                className="space-y-4"
                style={{ color: branding.colors.textLight }}
              >
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

      {/* Values */}
      <section className="py-16" style={{ backgroundColor: branding.colors.background }}>
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 
              className="font-display text-3xl font-bold mb-4"
              style={{ color: branding.colors.secondary }}
            >
              Our Values
            </h2>
            <p style={{ color: branding.colors.textLight }}>
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl text-center"
                style={{ backgroundColor: branding.colors.white }}
              >
                <div 
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${branding.colors.primary}20` }}
                >
                  <value.icon size={28} style={{ color: branding.colors.primary }} />
                </div>
                <h3 
                  className="font-display font-semibold mb-2"
                  style={{ color: branding.colors.secondary }}
                >
                  {value.title}
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: branding.colors.textLight }}
                >
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section 
        className="py-16"
        style={{ backgroundColor: branding.colors.secondary }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 
              className="font-display text-3xl font-bold mb-6"
              style={{ color: branding.colors.background }}
            >
              Ready to Experience the Difference?
            </h2>
            <p 
              className="mb-8"
              style={{ color: branding.colors.backgroundAlt }}
            >
              Browse our curated collection and discover products that inspire.
            </p>
            <a
              href="/shop"
              className="inline-block px-8 py-4 rounded-xl font-semibold transition-colors"
              style={{ backgroundColor: branding.colors.primary, color: branding.colors.secondary }}
            >
              Explore Our Collection
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}