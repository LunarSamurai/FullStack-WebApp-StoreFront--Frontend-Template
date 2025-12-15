import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Grid3X3, LayoutGrid } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import ProductCard from '../components/ProductCard';

export default function ShopPage() {
  const { products, categories, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [gridSize, setGridSize] = useState('large');

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.inStock !== false);

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
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
        result.sort((a, b) => a.name?.localeCompare(b.name));
        break;
      case 'newest':
      default:
        // Already sorted by createdAt desc from Firestore
        break;
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-coffee-900">
            Our Collection
          </h1>
          <p className="mt-4 text-coffee-600 max-w-2xl mx-auto">
            Discover our curated selection of premium products, each crafted with exceptional attention to detail.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-coffee-900 text-cream-100'
                    : 'bg-cream-100 text-coffee-700 hover:bg-cream-200'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap capitalize transition-colors ${
                    selectedCategory === cat
                      ? 'bg-coffee-900 text-cream-100'
                      : 'bg-cream-100 text-coffee-700 hover:bg-cream-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort & Grid */}
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-sm text-coffee-700 focus:outline-none focus:border-gold-400"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
              </select>

              <div className="hidden sm:flex items-center border border-cream-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setGridSize('large')}
                  className={`p-2.5 ${gridSize === 'large' ? 'bg-cream-200' : 'hover:bg-cream-100'}`}
                >
                  <LayoutGrid size={18} className="text-coffee-600" />
                </button>
                <button
                  onClick={() => setGridSize('small')}
                  className={`p-2.5 ${gridSize === 'small' ? 'bg-cream-200' : 'hover:bg-cream-100'}`}
                >
                  <Grid3X3 size={18} className="text-coffee-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-coffee-600">
          <span className="font-medium text-coffee-900">{filteredProducts.length}</span> products found
          {selectedCategory !== 'all' && (
            <span> in <span className="capitalize font-medium text-gold-600">{selectedCategory}</span></span>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="spinner" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div 
            layout
            className={`grid gap-6 ${
              gridSize === 'large' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            }`}
          >
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-32">
            <div className="w-24 h-24 mx-auto bg-cream-100 rounded-full flex items-center justify-center mb-6">
              <Search size={32} className="text-cream-400" />
            </div>
            <h3 className="font-display text-xl font-semibold text-coffee-900">
              No products found
            </h3>
            <p className="mt-2 text-coffee-500">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-6 px-6 py-2 bg-coffee-900 text-cream-100 rounded-lg hover:bg-coffee-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
