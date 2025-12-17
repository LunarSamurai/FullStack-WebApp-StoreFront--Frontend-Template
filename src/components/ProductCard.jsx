import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Play, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useBranding } from '../context/BrandingContext';

export default function ProductCard({ product, viewMode = 'grid' }) {
  const { addItem } = useCart();
  const { branding } = useBranding();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef(null);

  // Fix: properly check for image and video URLs
  const hasImage = Boolean(product.image_url && product.image_url.length > 0 && !imageError);
  const hasVideo = Boolean(product.video_url && product.video_url.length > 0);
  
  // Fix: in_stock should default to true if undefined/null
  const isInStock = product.in_stock !== false;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && hasVideo) {
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

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image_url,
      description: product.description,
    });
    
    setTimeout(() => setIsAdding(false), 500);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  // List view
  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="flex gap-6 p-4 rounded-2xl transition-shadow hover:shadow-lg bg-white"
      >
        <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-cream-100">
          {hasImage ? (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-display text-3xl text-cream-400">
                {product.name?.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gold-600">
              {product.category || 'General'}
            </span>
            <h3 className="font-display text-lg font-semibold mt-1 text-coffee-900">
              {product.name}
            </h3>
            <p className="text-sm mt-1 line-clamp-2 text-coffee-600">
              {product.description}
            </p>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xl font-bold text-coffee-900">
              {formatPrice(product.price)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={!isInStock || isAdding}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 bg-gold-500 text-coffee-900 hover:bg-gold-600"
            >
              <ShoppingBag size={16} />
              {isInStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group rounded-2xl overflow-hidden transition-shadow hover:shadow-xl bg-white"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-cream-100">
        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-semibold bg-gold-500 text-coffee-900">
            Featured
          </div>
        )}

        {/* Video Indicator */}
        {hasVideo && (
          <div className="absolute top-3 right-3 z-10 p-2 rounded-full bg-coffee-900">
            <Play size={14} className="text-white" fill="white" />
          </div>
        )}

        {/* Image or Fallback */}
        {hasImage ? (
          <img
            src={product.image_url}
            alt={product.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isHovered && hasVideo ? 'opacity-0' : 'opacity-100'
            }`}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-6xl text-cream-400">
              {product.name?.charAt(0)}
            </span>
          </div>
        )}

        {/* Video */}
        {hasVideo && (
          <video
            ref={videoRef}
            src={product.video_url}
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Quick Add Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          className="absolute inset-x-4 bottom-4 z-10"
        >
          <button
            onClick={handleAddToCart}
            disabled={!isInStock || isAdding}
            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 bg-white text-coffee-900 hover:bg-cream-100"
          >
            <ShoppingBag size={18} />
            {isAdding ? 'Added!' : isInStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4">
        <span className="text-xs font-medium uppercase tracking-wider text-gold-600">
          {product.category || 'General'}
        </span>
        <h3 className="font-display text-lg font-semibold mt-1 line-clamp-1 text-coffee-900">
          {product.name}
        </h3>
        <p className="text-sm mt-1 line-clamp-2 min-h-[2.5rem] text-coffee-600">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-coffee-900">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!isInStock || isAdding}
            className="p-2 rounded-xl transition-colors disabled:opacity-50 bg-cream-100 text-coffee-900 hover:bg-cream-200"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}