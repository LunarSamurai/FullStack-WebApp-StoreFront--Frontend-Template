import { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Plus, Edit2, Trash2, Upload, X, Save, Loader2, Play,
  Users, Shield, ShieldCheck, AlertTriangle, Palette, TrendingUp,
  Image as ImageIcon, Check, Star, Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { supabase } from '../config/supabase';
import SalesDashboard from '../components/SalesDashboard';
import BrandingEditor from '../components/BrandingEditor';

export default function AdminPage() {
  const { user, isAdmin, verifyEscalationMFA, enrollMFA, getEscalationFactor } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, refreshProducts } = useProducts();
  
  const [activeTab, setActiveTab] = useState('products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  // Admin management state
  const [admins, setAdmins] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [escalationCode, setEscalationCode] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [hasEscalationMFA, setHasEscalationMFA] = useState(false);
  const [escalationSetupData, setEscalationSetupData] = useState(null);
  const [showEscalationSetup, setShowEscalationSetup] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    videoUrl: '',
    featured: false,
    inStock: true,
  });

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Calculate stats
  const stats = {
    totalProducts: products.length,
    inStock: products.filter(p => p.inStock !== false).length,
    featured: products.filter(p => p.featured).length,
    categories: [...new Set(products.map(p => p.category).filter(Boolean))].length,
  };

  useEffect(() => {
    if (isAdmin && activeTab === 'admins') {
      fetchAdmins();
      checkEscalationMFA();
    }
  }, [isAdmin, activeTab]);

  const checkEscalationMFA = async () => {
    try {
      const factor = await getEscalationFactor();
      setHasEscalationMFA(!!factor);
    } catch (err) {
      setHasEscalationMFA(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase.from('admins').select('*');
      if (error) throw error;
      setAdmins(data || []);
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  const handleSetupEscalationMFA = async () => {
    try {
      setAdminLoading(true);
      const { data, error } = await enrollMFA('Admin Escalation');
      if (error) throw error;
      setEscalationSetupData(data);
      setShowEscalationSetup(true);
    } catch (err) {
      console.error('Error setting up escalation MFA:', err);
      alert('Failed to setup escalation MFA');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleVerifyEscalationSetup = async () => {
    try {
      setAdminLoading(true);
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: escalationSetupData.id,
        code: escalationCode,
      });
      
      if (error) throw error;
      
      setHasEscalationMFA(true);
      setShowEscalationSetup(false);
      setEscalationSetupData(null);
      setEscalationCode('');
      alert('Escalation MFA setup complete!');
    } catch (err) {
      console.error('Error verifying escalation MFA:', err);
      alert('Invalid code. Please try again.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail) return;
    
    if (!hasEscalationMFA) {
      alert('Please set up escalation MFA first');
      return;
    }
    
    setPendingAction({ type: 'add', email: newAdminEmail });
    setShowEscalationModal(true);
  };

  const handleRemoveAdmin = async (adminId, adminEmail) => {
    if (adminEmail === user?.email) {
      alert('You cannot remove yourself as admin');
      return;
    }
    
    if (!hasEscalationMFA) {
      alert('Please set up escalation MFA first');
      return;
    }
    
    setPendingAction({ type: 'remove', id: adminId, email: adminEmail });
    setShowEscalationModal(true);
  };

  const executeAdminAction = async () => {
    try {
      setAdminLoading(true);
      
      const verified = await verifyEscalationMFA(escalationCode);
      if (!verified) {
        alert('Invalid escalation code');
        return;
      }
      
      if (pendingAction.type === 'add') {
        const existing = admins.find(a => a.email === pendingAction.email);
        if (existing) {
          alert('This email is already an admin');
          return;
        }
        
        const { error } = await supabase.from('admins').insert({
          email: pendingAction.email,
          added_by: user.email,
        });
        if (error) throw error;
        setNewAdminEmail('');
      } else if (pendingAction.type === 'remove') {
        const { error } = await supabase.from('admins').delete().eq('id', pendingAction.id);
        if (error) throw error;
      }
      
      await fetchAdmins();
      setShowEscalationModal(false);
      setEscalationCode('');
      setPendingAction(null);
    } catch (err) {
      console.error('Admin action error:', err);
      alert('Failed to complete action');
    } finally {
      setAdminLoading(false);
    }
  };

  // Product functions
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);
      
      setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);
      
      setFormData(prev => ({ ...prev, videoUrl: publicUrl }));
    } catch (err) {
      console.error('Video upload error:', err);
      alert('Failed to upload video');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }

      closeModal();
      refreshProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      category: product.category || '',
      imageUrl: product.imageUrl || '',
      videoUrl: product.videoUrl || '',
      featured: product.featured || false,
      inStock: product.inStock !== false,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await deleteProduct(id);
      refreshProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      imageUrl: '',
      videoUrl: '',
      featured: false,
      inStock: true,
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <Shield size={48} className="mx-auto text-coffee-400 mb-4" />
          <h1 className="text-2xl font-display font-bold text-coffee-900 mb-2">Access Denied</h1>
          <p className="text-coffee-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'admins', label: 'Admins', icon: Users },
    { id: 'branding', label: 'Branding', icon: Palette },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-coffee-900">Admin Dashboard</h1>
          <p className="text-coffee-500 mt-1">Manage your store and administrators</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-coffee-900 text-white'
                  : 'bg-white text-coffee-600 hover:bg-cream-100'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Add Product Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-coffee-900 rounded-xl font-semibold hover:bg-gold-600 transition-colors"
              >
                <Plus size={18} />
                Add Product
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-gold-100 rounded-xl">
                  <Package size={24} className="text-gold-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-coffee-900">{stats.totalProducts}</p>
                  <p className="text-sm text-coffee-500">Total Products</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Check size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-coffee-900">{stats.inStock}</p>
                  <p className="text-sm text-coffee-500">In Stock</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-gold-100 rounded-xl">
                  <Star size={24} className="text-gold-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-coffee-900">{stats.featured}</p>
                  <p className="text-sm text-coffee-500">Featured</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-gold-100 rounded-xl">
                  <Tag size={24} className="text-gold-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-coffee-900">{stats.categories}</p>
                  <p className="text-sm text-coffee-500">Categories</p>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-200">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Product</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Category</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Price</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-cream-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-cream-100 rounded-xl overflow-hidden flex-shrink-0">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon size={20} className="text-cream-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-coffee-900">{product.name}</p>
                            <p className="text-sm text-coffee-500 line-clamp-1">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-cream-100 text-coffee-600 text-sm rounded-full">
                          {product.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-coffee-900">{formatPrice(product.price)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            product.inStock !== false
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                          </span>
                          {product.featured && (
                            <Star size={16} className="text-gold-500 fill-gold-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-coffee-500 hover:text-coffee-700 hover:bg-cream-100 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {products.length === 0 && (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-cream-300 mb-4" />
                  <p className="text-coffee-500">No products yet. Add your first product!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && <SalesDashboard />}

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            {!hasEscalationMFA && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="text-amber-500 flex-shrink-0" size={24} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-800 mb-1">Escalation MFA Required</h3>
                    <p className="text-amber-700 text-sm mb-4">
                      To add or remove admins, you need to set up a separate MFA factor for escalation.
                    </p>
                    <button
                      onClick={handleSetupEscalationMFA}
                      disabled={adminLoading}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
                    >
                      {adminLoading ? 'Setting up...' : 'Set Up Escalation MFA'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-display font-semibold text-coffee-900 mb-4">Add New Admin</h3>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:border-gold-400"
                />
                <button
                  onClick={handleAddAdmin}
                  disabled={!newAdminEmail || adminLoading}
                  className="px-6 py-3 bg-gold-500 text-coffee-900 rounded-xl font-semibold hover:bg-gold-600 transition-colors disabled:opacity-50"
                >
                  Add Admin
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-display font-semibold text-coffee-900 mb-4">Current Admins</h3>
              <div className="space-y-3">
                {admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 bg-cream-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                        <ShieldCheck size={20} className="text-gold-600" />
                      </div>
                      <div>
                        <p className="font-medium text-coffee-900">{admin.email}</p>
                        <p className="text-xs text-coffee-500">Added {new Date(admin.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {admin.email !== user?.email && (
                      <button
                        onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && <BrandingEditor />}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-coffee-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-cream-200 flex justify-between items-center">
                <h2 className="text-xl font-display font-semibold text-coffee-900">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-cream-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:border-gold-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:border-gold-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:border-gold-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">Product Image</label>
                  <div className="flex gap-3">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex items-center gap-2 px-4 py-2 border border-cream-200 rounded-xl hover:bg-cream-50 transition-colors disabled:opacity-50"
                    >
                      {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      Upload Image
                    </button>
                    {formData.imageUrl && (
                      <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-sm">
                        <ImageIcon size={16} />
                        Image uploaded
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">Product Video (Optional)</label>
                  <div className="flex gap-3">
                    <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={uploadingVideo}
                      className="flex items-center gap-2 px-4 py-2 border border-cream-200 rounded-xl hover:bg-cream-50 transition-colors disabled:opacity-50"
                    >
                      {uploadingVideo ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      Upload Video
                    </button>
                    {formData.videoUrl && (
                      <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-sm">
                        <Play size={16} />
                        Video uploaded
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-5 h-5 rounded border-cream-300 text-gold-500 focus:ring-gold-400"
                    />
                    <span className="text-sm text-coffee-700">Featured Product</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="w-5 h-5 rounded border-cream-300 text-gold-500 focus:ring-gold-400"
                    />
                    <span className="text-sm text-coffee-700">In Stock</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 border border-cream-200 text-coffee-700 rounded-xl font-medium hover:bg-cream-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gold-500 text-coffee-900 rounded-xl font-semibold hover:bg-gold-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <><Loader2 size={18} className="animate-spin" />Saving...</> : <><Save size={18} />{editingProduct ? 'Update' : 'Create'}</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Escalation Setup Modal */}
      <AnimatePresence>
        {showEscalationSetup && escalationSetupData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-coffee-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-display font-semibold text-coffee-900 mb-4">Setup Escalation MFA</h3>
              <p className="text-coffee-600 text-sm mb-4">Scan this QR code with a <strong>different</strong> authenticator app than your login MFA.</p>
              <div className="bg-white p-4 rounded-xl border border-cream-200 mb-4 flex justify-center">
                <img src={escalationSetupData.totp.qr_code} alt="QR Code" className="w-48 h-48" />
              </div>
              <input type="text" value={escalationCode} onChange={(e) => setEscalationCode(e.target.value)} placeholder="Enter 6-digit code" className="w-full px-4 py-3 border border-cream-200 rounded-xl mb-4 text-center text-2xl tracking-widest" maxLength={6} />
              <div className="flex gap-3">
                <button onClick={() => { setShowEscalationSetup(false); setEscalationSetupData(null); setEscalationCode(''); }} className="flex-1 py-3 border border-cream-200 rounded-xl font-medium">Cancel</button>
                <button onClick={handleVerifyEscalationSetup} disabled={escalationCode.length !== 6 || adminLoading} className="flex-1 py-3 bg-gold-500 text-coffee-900 rounded-xl font-semibold disabled:opacity-50">{adminLoading ? 'Verifying...' : 'Verify'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Escalation Verification Modal */}
      <AnimatePresence>
        {showEscalationModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-coffee-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-xl"><ShieldCheck size={24} className="text-amber-600" /></div>
                <div>
                  <h3 className="text-lg font-display font-semibold text-coffee-900">Verify Escalation</h3>
                  <p className="text-sm text-coffee-500">{pendingAction?.type === 'add' ? `Adding ${pendingAction.email}` : `Removing ${pendingAction?.email}`}</p>
                </div>
              </div>
              <input type="text" value={escalationCode} onChange={(e) => setEscalationCode(e.target.value)} placeholder="Enter escalation code" className="w-full px-4 py-3 border border-cream-200 rounded-xl mb-4 text-center text-2xl tracking-widest" maxLength={6} />
              <div className="flex gap-3">
                <button onClick={() => { setShowEscalationModal(false); setEscalationCode(''); setPendingAction(null); }} className="flex-1 py-3 border border-cream-200 rounded-xl font-medium">Cancel</button>
                <button onClick={executeAdminAction} disabled={escalationCode.length !== 6 || adminLoading} className="flex-1 py-3 bg-gold-500 text-coffee-900 rounded-xl font-semibold disabled:opacity-50">{adminLoading ? 'Processing...' : 'Confirm'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}