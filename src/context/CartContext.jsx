import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('luxe-cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setItems(parsed.filter(item => 
            item.id && item.productId && item.name && 
            typeof item.price === 'number' && typeof item.quantity === 'number'
          ));
        }
      }
    } catch (e) {
      console.error('Error loading cart:', e);
      localStorage.removeItem('luxe-cart');
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('luxe-cart', JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [items]);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ id: uuidv4(), message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const addItem = useCallback((product, quantity = 1) => {
    if (!product || quantity < 1) return;

    setItems(currentItems => {
      const existingIndex = currentItems.findIndex(
        item => item.productId === product.id
      );

      if (existingIndex >= 0) {
        const updated = [...currentItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      }

      return [...currentItems, {
        id: uuidv4(),
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl || null,
        description: product.description || ''
      }];
    });

    showNotification(`${product.name} added to cart`);
    setIsOpen(true);
  }, [showNotification]);

  const removeItem = useCallback((itemId) => {
    setItems(currentItems => {
      const item = currentItems.find(i => i.id === itemId);
      if (item) {
        showNotification(`${item.name} removed from cart`, 'info');
      }
      return currentItems.filter(i => i.id !== itemId);
    });
  }, [showNotification]);

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    showNotification('Cart cleared', 'info');
  }, [showNotification]);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  const toggleCart = useCallback(() => setIsOpen(prev => !prev), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = {
    items,
    itemCount,
    subtotal,
    tax,
    shipping,
    total,
    isOpen,
    notification,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
