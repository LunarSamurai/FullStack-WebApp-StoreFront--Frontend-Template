import { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, Save, X, Upload, Video, Image as ImageIcon,
  Package, DollarSign, Tag, FileText, Star, Check, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';

const initialFormState = {
  name: '',
  description: '',
  price: '',
  category: '',
  imageUrl: '',
  videoUrl: '',
  inStock: true,
  featured: false
};

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { products, loading: productsLoading, addProduct, updateProduct, deleteProduct, error } = useProducts();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        imageUrl: product.imageUrl || '',
        videoUrl: product.videoUrl || '',
        inStock: product.inStock !== false,
        featured: product.featured === true
      });
      setImagePreview(product.imageUrl || '');
      setVideoPreview(product.videoUrl || '');
    } else {
      setEditingProduct(null);
      setFormData(initialFormState);
      setImagePreview('');
      setVideoPreview('');
    }
    setImageFile(null);
    setVideoFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData(initialFormState);
    setImageFile(null);
    setVideoFile(null);
    setImagePreview('');
    setVideoPreview('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData, imageFile, videoFile);
      } else {
        await addProduct(formData, imageFile, videoFile);
      }
      closeModal();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <main className="min-h-screen pt-24 pb-16 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-coffee-900">
              Product Management
            </h1>
            <p className="mt-1 text-coffee-600">
              Manage your store listings
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="btn-gold flex items-center gap-2"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Products', value: products.length, icon: Package },
            { label: 'In Stock', value: products.filter(p => p.inStock !== false).length, icon: Check },
            { label: 'Featured', value: products.filter(p => p.featured).length, icon: Star },
            { label: 'Categories', value: [...new Set(products.map(p => p.category).filter(Boolean))].length, icon: Tag }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold-100 rounded-lg">
                  <stat.icon size={18} className="text-gold-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-coffee-900">{stat.value}</p>
                  <p className="text-xs text-coffee-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50 border-b border-cream-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-coffee-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-coffee-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-coffee-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-coffee-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-coffee-600 uppercase tracking-wider">
                    Media
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-coffee-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {productsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="spinner mx-auto" />
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-coffee-500">
                      No products yet. Click "Add Product" to create your first listing.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-cream-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-cream-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={20} className="text-cream-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-coffee-900 line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-sm text-coffee-500 line-clamp-1 max-w-xs">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-cream-100 text-coffee-700 text-sm rounded-full capitalize">
                          {product.category || 'general'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-coffee-900">
                          {formatPrice(product.price)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.inStock !== false
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                          </span>
                          {product.featured && (
                            <Star size={14} className="text-gold-500 fill-gold-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {product.imageUrl && (
                            <ImageIcon size={16} className="text-blue-500" />
                          )}
                          {product.videoUrl && (
                            <Video size={16} className="text-purple-500" />
                          )}
                          {!product.imageUrl && !product.videoUrl && (
                            <span className="text-cream-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(product)}
                            className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} className="text-coffee-600" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(product.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-coffee-900/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-cream-200">
                <h2 className="font-display text-xl font-semibold text-coffee-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-coffee-600" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-coffee-700 mb-2">
                    <Package size={16} />
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-luxe"
                    placeholder="Enter product name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-coffee-700 mb-2">
                    <FileText size={16} />
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-luxe resize-none"
                    placeholder="Describe your product"
                  />
                </div>

                {/* Price & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-coffee-700 mb-2">
                      <DollarSign size={16} />
                      Price (USD)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input-luxe"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-coffee-700 mb-2">
                      <Tag size={16} />
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-luxe"
                      placeholder="e.g., accessories"
                    />
                  </div>
                </div>

                {/* Media Upload */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Image */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-coffee-700 mb-2">
                      <ImageIcon size={16} />
                      Product Image
                    </label>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div 
                      onClick={() => imageInputRef.current?.click()}
                      className="border-2 border-dashed border-cream-300 rounded-xl p-4 cursor-pointer hover:border-gold-400 transition-colors"
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-24 object-cover rounded-lg" />
                      ) : (
                        <div className="flex flex-col items-center text-cream-500">
                          <Upload size={24} />
                          <span className="text-xs mt-1">Upload Image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-coffee-700 mb-2">
                      <Video size={16} />
                      Video/GIF (Hover)
                    </label>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*,image/gif"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                    <div 
                      onClick={() => videoInputRef.current?.click()}
                      className="border-2 border-dashed border-cream-300 rounded-xl p-4 cursor-pointer hover:border-gold-400 transition-colors"
                    >
                      {videoPreview ? (
                        <video src={videoPreview} className="w-full h-24 object-cover rounded-lg" muted />
                      ) : (
                        <div className="flex flex-col items-center text-cream-500">
                          <Upload size={24} />
                          <span className="text-xs mt-1">Upload Video</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="w-5 h-5 rounded border-cream-300 text-gold-500 focus:ring-gold-400"
                    />
                    <span className="text-sm text-coffee-700">In Stock</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-5 h-5 rounded border-cream-300 text-gold-500 focus:ring-gold-400"
                    />
                    <span className="text-sm text-coffee-700">Featured Product</span>
                  </label>
                </div>
              </form>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-cream-200 bg-cream-50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 text-coffee-700 hover:bg-cream-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="btn-gold flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-coffee-400 border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="fixed inset-0 bg-coffee-900/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 p-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Trash2 size={24} className="text-red-500" />
                </div>
                <h3 className="font-display text-lg font-semibold text-coffee-900">
                  Delete Product?
                </h3>
                <p className="mt-2 text-sm text-coffee-600">
                  This action cannot be undone. The product will be permanently removed.
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-5 py-2 text-coffee-700 hover:bg-cream-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
