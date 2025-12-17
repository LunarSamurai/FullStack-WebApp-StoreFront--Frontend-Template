import { useState, useRef, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Upload, Package, DollarSign, Tag, FileText, Star, Check, AlertCircle, Video, Users, Shield, UserPlus, QrCode, Loader2, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { supabase } from '../config/supabase';
import QRCode from 'qrcode';
import BrandingEditor from '../components/BrandingEditor';

const initialForm = { name: '', description: '', price: '', category: '', image_url: '', video_url: '', in_stock: true, featured: false };

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading, enrollMFA, verifyMFAEnrollment, verifyEscalationMFA, getEscalationFactor, getMFAFactors } = useAuth();
  const { products, loading: productsLoading, addProduct, updateProduct, deleteProduct, error } = useProducts();
  
  // Product state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Admin management state
  const [activeTab, setActiveTab] = useState('products');
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminError, setAdminError] = useState(null);
  const [deleteAdminConfirm, setDeleteAdminConfirm] = useState(null);
  
  // Escalation MFA state
  const [showEscalationSetup, setShowEscalationSetup] = useState(false);
  const [escalationQrCode, setEscalationQrCode] = useState(null);
  const [escalationSecret, setEscalationSecret] = useState(null);
  const [escalationFactorId, setEscalationFactorId] = useState(null);
  const [escalationCode, setEscalationCode] = useState('');
  const [hasEscalationMFA, setHasEscalationMFA] = useState(false);
  const [showEscalationVerify, setShowEscalationVerify] = useState(false);
  const [pendingAdminAction, setPendingAdminAction] = useState(null);
  
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Load admins and check escalation MFA
  useEffect(() => {
    if (isAdmin) {
      loadAdmins();
      checkEscalationMFA();
    }
  }, [isAdmin]);

  const loadAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAdmins(data || []);
    } catch (err) {
      console.error('Error loading admins:', err);
      setAdminError(err.message);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const checkEscalationMFA = async () => {
    const factor = await getEscalationFactor();
    setHasEscalationMFA(!!factor);
    if (factor) {
      setEscalationFactorId(factor.id);
    }
  };

  const setupEscalationMFA = async () => {
    try {
      const data = await enrollMFA('Escalation MFA');
      setEscalationFactorId(data.id);
      setEscalationSecret(data.totp.secret);
      const qrUrl = await QRCode.toDataURL(data.totp.uri);
      setEscalationQrCode(qrUrl);
      setShowEscalationSetup(true);
    } catch (err) {
      setAdminError(err.message);
    }
  };

  const verifyEscalationSetup = async () => {
    try {
      await verifyMFAEnrollment(escalationFactorId, escalationCode);
      setHasEscalationMFA(true);
      setShowEscalationSetup(false);
      setEscalationCode('');
      setEscalationQrCode(null);
      setEscalationSecret(null);
    } catch (err) {
      setAdminError(err.message);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    
    if (!hasEscalationMFA) {
      setAdminError('You must set up Escalation MFA before adding admins');
      return;
    }
    
    // Show escalation verification
    setPendingAdminAction({ type: 'add', email: newAdminEmail.toLowerCase().trim() });
    setShowEscalationVerify(true);
  };

  const handleDeleteAdmin = (email) => {
    if (!hasEscalationMFA) {
      setAdminError('You must set up Escalation MFA before removing admins');
      return;
    }
    
    setPendingAdminAction({ type: 'delete', email });
    setShowEscalationVerify(true);
  };

  const executeAdminAction = async () => {
    if (!pendingAdminAction) return;
    
    setAddingAdmin(true);
    setAdminError(null);

    try {
      // Verify escalation MFA
      const result = await verifyEscalationMFA(escalationCode, escalationFactorId);
      if (!result.verified) {
        setAdminError('Invalid escalation code');
        setAddingAdmin(false);
        return;
      }

      if (pendingAdminAction.type === 'add') {
        // Check if admin already exists
        const { data: existing } = await supabase
          .from('admins')
          .select('email')
          .eq('email', pendingAdminAction.email)
          .single();

        if (existing) {
          setAdminError('This email is already an admin');
          setAddingAdmin(false);
          return;
        }

        // Add new admin
        const { error } = await supabase
          .from('admins')
          .insert([{ email: pendingAdminAction.email }]);

        if (error) throw error;
        setNewAdminEmail('');
      } else if (pendingAdminAction.type === 'delete') {
        // Prevent deleting yourself
        if (pendingAdminAction.email === user.email.toLowerCase()) {
          setAdminError('You cannot remove yourself as admin');
          setAddingAdmin(false);
          return;
        }

        const { error } = await supabase
          .from('admins')
          .delete()
          .eq('email', pendingAdminAction.email);

        if (error) throw error;
      }

      await loadAdmins();
      setShowEscalationVerify(false);
      setEscalationCode('');
      setPendingAdminAction(null);
    } catch (err) {
      setAdminError(err.message);
    } finally {
      setAddingAdmin(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        image_url: product.image_url || '',
        video_url: product.video_url || '',
        in_stock: product.in_stock !== false,
        featured: product.featured === true
      });
      setImagePreview(product.image_url || '');
      setVideoPreview(product.video_url || '');
    } else {
      setEditingProduct(null);
      setFormData(initialForm);
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
    setFormData(initialForm);
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

  const formatPrice = (price) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

  return (
    <main className="min-h-screen pt-24 pb-16 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-coffee-900">Admin Dashboard</h1>
            <p className="mt-1 text-coffee-600">Manage your store, administrators, and branding</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'products' 
                ? 'bg-coffee-900 text-cream-100' 
                : 'bg-white text-coffee-700 hover:bg-cream-100'
            }`}
          >
            <Package size={18} />
            Products
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'admins' 
                ? 'bg-coffee-900 text-cream-100' 
                : 'bg-white text-coffee-700 hover:bg-cream-100'
            }`}
          >
            <Users size={18} />
            Admins
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'branding' 
                ? 'bg-coffee-900 text-cream-100' 
                : 'bg-white text-coffee-700 hover:bg-cream-100'
            }`}
          >
            <Palette size={18} />
            Branding
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            <div className="flex justify-end mb-6">
              <button onClick={() => openModal()} className="btn-gold flex items-center gap-2">
                <Plus size={18} /> Add Product
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Products', value: products.length, icon: Package },
                { label: 'In Stock', value: products.filter(p => p.in_stock !== false).length, icon: Check },
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

            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-cream-50 border-b border-cream-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-coffee-600 uppercase">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-coffee-600 uppercase">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-coffee-600 uppercase">Price</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-coffee-600 uppercase">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-coffee-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {productsLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <div className="spinner mx-auto" />
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center text-coffee-500">
                          No products yet. Click "Add Product" to get started.
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id} className="hover:bg-cream-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-cream-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                {product.image_url ? (
                                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package size={20} className="text-cream-400" />
                                  </div>
                                )}
                                {product.video_url && (
                                  <div className="absolute bottom-1 right-1 p-1 bg-coffee-900/70 rounded">
                                    <Video size={10} className="text-white" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-coffee-900 line-clamp-1">{product.name}</p>
                                <p className="text-sm text-coffee-500 line-clamp-1 max-w-xs">{product.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-cream-100 text-coffee-700 text-sm rounded-full capitalize">
                              {product.category || 'general'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-coffee-900">{formatPrice(product.price)}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.in_stock !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {product.in_stock !== false ? 'In Stock' : 'Out of Stock'}
                              </span>
                              {product.featured && <Star size={14} className="text-gold-500 fill-gold-500" />}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openModal(product)} className="p-2 hover:bg-cream-100 rounded-lg">
                                <Edit2 size={16} className="text-coffee-600" />
                              </button>
                              <button onClick={() => setDeleteConfirm(product.id)} className="p-2 hover:bg-red-50 rounded-lg">
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
          </>
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            {adminError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                <AlertCircle size={20} /> {adminError}
                <button onClick={() => setAdminError(null)} className="ml-auto">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Escalation MFA Setup */}
            {!hasEscalationMFA && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <Shield size={24} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-semibold text-amber-900">Escalation MFA Required</h3>
                    <p className="mt-1 text-amber-700">
                      Before you can add or remove admins, you need to set up Escalation MFA. This provides an extra layer of security for sensitive admin actions.
                    </p>
                    <button
                      onClick={setupEscalationMFA}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                    >
                      <QrCode size={18} />
                      Set Up Escalation MFA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {hasEscalationMFA && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <Check size={20} className="text-green-600" />
                <span className="text-green-700 font-medium">Escalation MFA is enabled</span>
              </div>
            )}

            {/* Add Admin Form */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-display text-xl font-semibold text-coffee-900 mb-4 flex items-center gap-2">
                <UserPlus size={20} />
                Add New Admin
              </h3>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="input-luxe flex-1"
                  disabled={!hasEscalationMFA}
                />
                <button
                  onClick={handleAddAdmin}
                  disabled={!hasEscalationMFA || !newAdminEmail.trim() || addingAdmin}
                  className="btn-gold flex items-center gap-2 disabled:opacity-50"
                >
                  {addingAdmin ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  Add Admin
                </button>
              </div>
              {!hasEscalationMFA && (
                <p className="mt-2 text-sm text-coffee-500">Set up Escalation MFA to add admins</p>
              )}
            </div>

            {/* Admins List */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="p-6 border-b border-cream-200">
                <h3 className="font-display text-xl font-semibold text-coffee-900 flex items-center gap-2">
                  <Users size={20} />
                  Current Admins
                </h3>
              </div>
              <div className="divide-y divide-cream-100">
                {loadingAdmins ? (
                  <div className="p-8 text-center">
                    <div className="spinner mx-auto" />
                  </div>
                ) : admins.length === 0 ? (
                  <div className="p-8 text-center text-coffee-500">
                    No admins in database. The admin from VITE_ADMIN_EMAIL still has access.
                  </div>
                ) : (
                  admins.map((admin) => (
                    <div key={admin.email} className="flex items-center justify-between p-4 hover:bg-cream-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-gold-600">
                            {admin.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-coffee-900">{admin.email}</p>
                          <p className="text-xs text-coffee-500">
                            Added {new Date(admin.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAdmin(admin.email)}
                        disabled={admin.email === user.email.toLowerCase()}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                        title={admin.email === user.email.toLowerCase() ? "Can't remove yourself" : 'Remove admin'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <BrandingEditor />
        )}
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between p-6 border-b border-cream-200">
                  <h2 className="font-display text-xl font-semibold text-coffee-900">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button onClick={closeModal} className="p-2 hover:bg-cream-100 rounded-lg">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-coffee-700 mb-2">
                      <Package size={16} /> Product Name
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

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-coffee-700 mb-2">
                      <FileText size={16} /> Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-luxe resize-none"
                      placeholder="Describe your product"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-coffee-700 mb-2">
                        <DollarSign size={16} /> Price (USD)
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
                        <Tag size={16} /> Category
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

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-coffee-700 mb-2">
                      <Upload size={16} /> Product Image
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
                        <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                      ) : (
                        <div className="flex flex-col items-center text-cream-500 py-4">
                          <Upload size={24} />
                          <span className="text-xs mt-1">Upload Image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-coffee-700 mb-2">
                      <Video size={16} /> Product Video (optional - plays on hover)
                    </label>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                    <div
                      onClick={() => videoInputRef.current?.click()}
                      className="border-2 border-dashed border-cream-300 rounded-xl p-4 cursor-pointer hover:border-gold-400 transition-colors"
                    >
                      {videoPreview ? (
                        <video src={videoPreview} className="w-full h-32 object-cover rounded-lg" muted />
                      ) : (
                        <div className="flex flex-col items-center text-cream-500 py-4">
                          <Video size={24} />
                          <span className="text-xs mt-1">Upload Video</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.in_stock}
                        onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                        className="w-5 h-5 rounded border-cream-300 text-gold-500"
                      />
                      <span className="text-sm text-coffee-700">In Stock</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-5 h-5 rounded border-cream-300 text-gold-500"
                      />
                      <span className="text-sm text-coffee-700">Featured</span>
                    </label>
                  </div>
                </form>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-cream-200 bg-cream-50">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2.5 text-coffee-700 hover:bg-cream-200 rounded-lg"
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
                        {editingProduct ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Product Confirmation */}
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Trash2 size={24} className="text-red-500" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-coffee-900">Delete Product?</h3>
                  <p className="mt-2 text-sm text-coffee-600">This action cannot be undone.</p>
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-5 py-2 text-coffee-700 hover:bg-cream-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(deleteConfirm)}
                      className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Escalation MFA Setup Modal */}
      <AnimatePresence>
        {showEscalationSetup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEscalationSetup(false)}
              className="fixed inset-0 bg-coffee-900/50 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <Shield size={28} className="text-amber-600" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-coffee-900">Set Up Escalation MFA</h3>
                  <p className="mt-2 text-coffee-600 text-sm">
                    Scan this QR code with a <strong>different</strong> authenticator app or account than your login MFA.
                  </p>
                </div>

                {escalationQrCode && (
                  <img src={escalationQrCode} alt="Escalation MFA QR" className="mx-auto rounded-xl shadow-card mb-4" />
                )}

                {escalationSecret && (
                  <div className="p-3 bg-cream-100 rounded-lg mb-4">
                    <p className="text-xs text-coffee-500 mb-1">Manual entry code:</p>
                    <code className="text-sm font-mono text-coffee-900 break-all">{escalationSecret}</code>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-2">
                      Enter 6-digit code to verify
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={escalationCode}
                      onChange={(e) => setEscalationCode(e.target.value.replace(/\D/g, ''))}
                      className="input-luxe text-center text-2xl tracking-widest"
                      placeholder="000000"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowEscalationSetup(false);
                        setEscalationCode('');
                      }}
                      className="flex-1 px-4 py-2 text-coffee-700 hover:bg-cream-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={verifyEscalationSetup}
                      disabled={escalationCode.length !== 6}
                      className="flex-1 btn-gold disabled:opacity-50"
                    >
                      Verify & Enable
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Escalation MFA Verification Modal */}
      <AnimatePresence>
        {showEscalationVerify && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowEscalationVerify(false);
                setEscalationCode('');
                setPendingAdminAction(null);
              }}
              className="fixed inset-0 bg-coffee-900/50 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <Shield size={28} className="text-amber-600" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-coffee-900">Verify Escalation MFA</h3>
                  <p className="mt-2 text-coffee-600 text-sm">
                    Enter your Escalation MFA code to {pendingAdminAction?.type === 'add' ? 'add' : 'remove'} admin:
                    <br />
                    <strong>{pendingAdminAction?.email}</strong>
                  </p>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={escalationCode}
                    onChange={(e) => setEscalationCode(e.target.value.replace(/\D/g, ''))}
                    className="input-luxe text-center text-2xl tracking-widest"
                    placeholder="000000"
                    autoFocus
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowEscalationVerify(false);
                        setEscalationCode('');
                        setPendingAdminAction(null);
                      }}
                      className="flex-1 px-4 py-2 text-coffee-700 hover:bg-cream-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={executeAdminAction}
                      disabled={escalationCode.length !== 6 || addingAdmin}
                      className="flex-1 btn-gold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {addingAdmin ? <Loader2 size={18} className="animate-spin" /> : 'Confirm'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}