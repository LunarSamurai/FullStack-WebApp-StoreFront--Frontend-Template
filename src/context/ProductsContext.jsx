import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

// Upload file to Supabase Storage
const uploadFile = async (file, bucket = 'products') => {
  if (!file) return null;

  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  console.log('Uploaded file URL:', urlData.publicUrl);
  return urlData.publicUrl;
};

  // Add product
  const addProduct = useCallback(async (productData, imageFile, videoFile) => {
    try {
      setError(null);

      let imageUrl = productData.imageUrl || null;
      let videoUrl = productData.videoUrl || null;

      if (imageFile) {
        imageUrl = await uploadFile(imageFile, 'products');
      }
      if (videoFile) {
        videoUrl = await uploadFile(videoFile, 'products');
      }

      const newProduct = {
        name: String(productData.name || '').trim().slice(0, 200),
        description: String(productData.description || '').trim().slice(0, 2000),
        price: Math.max(0, parseFloat(productData.price) || 0),
        image_url: imageUrl,
        video_url: videoUrl,
        category: String(productData.category || 'general').trim().slice(0, 100),
        in_stock: productData.inStock !== false,
        featured: productData.featured === true
      };

      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

      if (error) throw error;
      return data;
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

      let imageUrl = productData.imageUrl;
      let videoUrl = productData.videoUrl;

      if (imageFile) {
        imageUrl = await uploadFile(imageFile, 'products');
      }
      if (videoFile) {
        videoUrl = await uploadFile(videoFile, 'products');
      }

      const updateData = {
        name: String(productData.name || '').trim().slice(0, 200),
        description: String(productData.description || '').trim().slice(0, 2000),
        price: Math.max(0, parseFloat(productData.price) || 0),
        image_url: imageUrl,
        video_url: videoUrl,
        category: String(productData.category || 'general').trim().slice(0, 100),
        in_stock: productData.inStock !== false,
        featured: productData.featured === true,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      return data;
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

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Delete product error:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Get single product
  const getProduct = useCallback((productId) => {
    return products.find(p => p.id === productId) || null;
  }, [products]);

  // Get featured products
  const getFeaturedProducts = useCallback(() => {
    return products.filter(p => p.featured && p.in_stock);
  }, [products]);

  // Get products by category
  const getProductsByCategory = useCallback((category) => {
    if (!category || category === 'all') return products.filter(p => p.in_stock);
    return products.filter(p => p.category === category && p.in_stock);
  }, [products]);

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  // Transform product for frontend (snake_case to camelCase)
  const transformProduct = (p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.image_url,
    videoUrl: p.video_url,
    category: p.category,
    inStock: p.in_stock,
    featured: p.featured,
    createdAt: p.created_at
  });

  const transformedProducts = products.map(transformProduct);

  const value = {
    products: transformedProducts,
    loading,
    error,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct: (id) => {
      const p = products.find(prod => prod.id === id);
      return p ? transformProduct(p) : null;
    },
    getFeaturedProducts: () => transformedProducts.filter(p => p.featured && p.inStock),
    getProductsByCategory: (cat) => {
      if (!cat || cat === 'all') return transformedProducts.filter(p => p.inStock);
      return transformedProducts.filter(p => p.category === cat && p.inStock);
    }
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
