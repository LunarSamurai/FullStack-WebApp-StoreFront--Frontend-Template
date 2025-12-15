import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Play, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && product.videoUrl) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="product-card group bg-white rounded-2xl overflow-hidden shadow-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Media Container */}
      <div className="media-container bg-cream-100 relative">
        {/* Main Image */}
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-500"
            style={{ opacity: isHovered && product.videoUrl ? 0 : 1 }}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-cream-200">
            <span className="font-display text-4xl text-cream-400">
              {product.name?.charAt(0) || 'L'}
            </span>
          </div>
        )}

        {/* Video Overlay */}
        {product.videoUrl && (
          <div 
            className="video-overlay absolute inset-0 bg-black"
            style={{ opacity: isHovered ? 1 : 0 }}
          >
            <video
              ref={videoRef}
              src={product.videoUrl}
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Hover Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-coffee-900/60 via-transparent to-transparent flex items-end justify-center pb-6 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={isHovered ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleAddToCart}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/95 text-coffee-900 font-medium text-sm rounded-full shadow-lg hover:bg-gold-400 transition-colors"
          >
            <ShoppingCart size={16} />
            Add to Cart
          </motion.button>
        </div>

        {/* Video indicator */}
        {product.videoUrl && (
          <div className="absolute top-3 right-3 p-2 bg-coffee-900/70 rounded-full">
            <Play size={14} className="text-white fill-white" />
          </div>
        )}

        {/* Featured badge */}
        {product.featured && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-gold-400 to-gold-500 text-coffee-900 text-xs font-semibold rounded-full">
            Featured
          </div>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-cream-50/80 flex items-center justify-center">
            <span className="px-4 py-2 bg-coffee-900 text-cream-100 text-sm font-medium rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5">
        {/* Category */}
        <span className="text-xs font-medium text-gold-600 uppercase tracking-wider">
          {product.category}
        </span>

        {/* Name */}
        <h3 className="mt-1.5 font-display text-xl font-semibold text-coffee-900 line-clamp-1 group-hover:text-gold-700 transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-coffee-600 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>

        {/* Price and Action */}
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-2xl font-bold text-coffee-900">
            {formatPrice(product.price)}
          </span>
          
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`p-3 rounded-xl transition-all ${
              product.inStock
                ? 'bg-cream-200 hover:bg-gold-400 hover:shadow-gold text-coffee-800'
                : 'bg-cream-100 text-cream-400 cursor-not-allowed'
            }`}
            aria-label="Add to cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
