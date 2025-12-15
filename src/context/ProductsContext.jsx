import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time products listener
  useEffect(() => {
    const productsQuery = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const productsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
        setLoading(false);
      },
      (err) => {
        console.error('Products listener error:', err);
        setError('Failed to load products');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Upload media file (image or video/gif)
  const uploadMedia = async (file, type = 'image') => {
    if (!file) return null;

    // Validate file type
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      video: ['video/mp4', 'video/webm', 'image/gif']
    };

    if (!allowedTypes[type].includes(file.type)) {
      throw new Error(`Invalid ${type} file type`);
    }

    // Validate file size (max 50MB for videos, 10MB for images)
    const maxSize = type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`);
    }

    const fileName = `${type}s/${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  // Add new product
  const addProduct = useCallback(async (productData, imageFile, videoFile) => {
    try {
      setError(null);
      
      // Upload media files
      let imageUrl = productData.imageUrl || null;
      let videoUrl = productData.videoUrl || null;

      if (imageFile) {
        imageUrl = await uploadMedia(imageFile, 'image');
      }
      if (videoFile) {
        videoUrl = await uploadMedia(videoFile, 'video');
      }

      // Sanitize and validate product data
      const newProduct = {
        name: String(productData.name || '').trim().slice(0, 200),
        description: String(productData.description || '').trim().slice(0, 2000),
        price: Math.max(0, parseFloat(productData.price) || 0),
        imageUrl,
        videoUrl,
        category: String(productData.category || 'general').trim().slice(0, 100),
        inStock: productData.inStock !== false,
        featured: productData.featured === true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'products'), newProduct);
      return { id: docRef.id, ...newProduct };
    } catch (err) {
      console.error('Add product error:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Update product
  const updateProduct = useCallback(async (productId, productData, imageFile, videoFile) => {
    try {
      setError(null);

      // Upload new media files if provided
      let imageUrl = productData.imageUrl;
      let videoUrl = productData.videoUrl;

      if (imageFile) {
        imageUrl = await uploadMedia(imageFile, 'image');
      }
      if (videoFile) {
        videoUrl = await uploadMedia(videoFile, 'video');
      }

      const updateData = {
        name: String(productData.name || '').trim().slice(0, 200),
        description: String(productData.description || '').trim().slice(0, 2000),
        price: Math.max(0, parseFloat(productData.price) || 0),
        imageUrl,
        videoUrl,
        category: String(productData.category || 'general').trim().slice(0, 100),
        inStock: productData.inStock !== false,
        featured: productData.featured === true,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'products', productId), updateData);
      return { id: productId, ...updateData };
    } catch (err) {
      console.error('Update product error:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete product
  const deleteProduct = useCallback(async (productId) => {
    try {
      setError(null);
      
      // Get product to delete associated media
      const product = products.find(p => p.id === productId);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'products', productId));

      // Attempt to delete media files (non-blocking)
      if (product?.imageUrl) {
        try {
          const imageRef = ref(storage, product.imageUrl);
          await deleteObject(imageRef);
        } catch (e) {
          console.warn('Could not delete image:', e);
        }
      }
      if (product?.videoUrl) {
        try {
          const videoRef = ref(storage, product.videoUrl);
          await deleteObject(videoRef);
        } catch (e) {
          console.warn('Could not delete video:', e);
        }
      }

      return true;
    } catch (err) {
      console.error('Delete product error:', err);
      setError(err.message);
      throw err;
    }
  }, [products]);

  // Get single product by ID
  const getProduct = useCallback((productId) => {
    return products.find(p => p.id === productId) || null;
  }, [products]);

  // Get featured products
  const getFeaturedProducts = useCallback(() => {
    return products.filter(p => p.featured && p.inStock);
  }, [products]);

  // Get products by category
  const getProductsByCategory = useCallback((category) => {
    if (!category || category === 'all') return products.filter(p => p.inStock);
    return products.filter(p => p.category === category && p.inStock);
  }, [products]);

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const value = {
    products,
    loading,
    error,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    getFeaturedProducts,
    getProductsByCategory
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}

export default ProductsContext;
