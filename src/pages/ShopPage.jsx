import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Grid, List, X } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { useBranding } from '../context/BrandingContext';
import ProductCard from '../components/ProductCard';

export default function ShopPage() {
  const { products, loading } = useProducts();
  const { branding } = useBranding();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return ['all', ...cats];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <main className="min-h-screen pt-24 pb-16" style={{ backgroundColor: branding.colors.background }}>
      {/* Header */}
      <section className="py-12 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 
            className="font-display text-4xl md:text-5xl font-bold mb-4"
            style={{ color: branding.colors.secondary }}
          >
            {branding.content.shopTitle}
          </h1>
          <p style={{ color: branding.colors.textLight }}>
            {branding.content.shopSubtitle}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        {/* Toolbar */}
        <div 
          className="rounded-2xl p-4 mb-8 flex flex-wrap items-center gap-4"
          style={{ backgroundColor: branding.colors.white }}
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search 
              size={18} 
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: branding.colors.textLight }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border transition-colors focus:outline-none"
              style={{ 
                borderColor: branding.colors.backgroundAlt,
                backgroundColor: branding.colors.background
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full"
                style={{ backgroundColor: branding.colors.backgroundAlt }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors capitalize"
                style={{ 
                  backgroundColor: selectedCategory === cat ? branding.colors.secondary : branding.colors.background,
                  color: selectedCategory === cat ? branding.colors.background : branding.colors.textLight
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort & View */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-xl text-sm border focus:outline-none"
              style={{ 
                borderColor: branding.colors.backgroundAlt,
                color: branding.colors.secondary
              }}
            >
              <option value="featured">Featured</option>
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <div 
              className="flex rounded-xl p-1"
              style={{ backgroundColor: branding.colors.background }}
            >
              <button
                onClick={() => setViewMode('grid')}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: viewMode === 'grid' ? branding.colors.white : 'transparent',
                  color: branding.colors.secondary
                }}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: viewMode === 'list' ? branding.colors.white : 'transparent',
                  color: branding.colors.secondary
                }}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <p 
          className="mb-6 text-sm"
          style={{ color: branding.colors.textLight }}
        >
          <span style={{ color: branding.colors.secondary, fontWeight: 600 }}>
            {filteredProducts.length}
          </span> products found
        </p>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div 
              className="w-12 h-12 border-4 rounded-full animate-spin"
              style={{ 
                borderColor: branding.colors.backgroundAlt,
                borderTopColor: branding.colors.primary
              }}
            />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div 
            className="text-center py-20 rounded-2xl"
            style={{ backgroundColor: branding.colors.white }}
          >
            <p style={{ color: branding.colors.textLight }}>No products found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-6 py-2 rounded-xl font-medium"
              style={{ backgroundColor: branding.colors.primary, color: branding.colors.secondary }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} viewMode={viewMode} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}