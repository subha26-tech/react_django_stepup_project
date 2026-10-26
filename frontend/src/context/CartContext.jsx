import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();
const CART_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/cart`;

const readCart = () => {
  try {
    const saved = localStorage.getItem('stepup_cart');
    const items = saved ? JSON.parse(saved) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

const requestCart = async (url, token, method = 'GET', items) => {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Token ${token}`,
      ...(method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(method !== 'GET' ? { body: JSON.stringify({ items }) } : {}),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('The cart service returned an invalid response.');
  }
  if (!response.ok) {
    throw new Error(data.error || 'Unable to sync your cart.');
  }
  if (!Array.isArray(data.items)) {
    throw new Error('The cart service returned an invalid cart.');
  }
  return data.items;
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const token = isAuthenticated ? user.token : null;
  const [cartItems, setCartItems] = useState(readCart);
  const [lastOrder, setLastOrder] = useState(() => {
    const saved = localStorage.getItem('stepup_last_order');
    return saved ? JSON.parse(saved) : {
      order_number: '#Bh2300006',
      customer_name: 'Beverley',
      total_amount: 2799,
      payment_method: 'COD',
      status: 'In Transit',
      expected_delivery: 'Exp : Delivery by sun, May 31'
    };
  });
  const [cartSyncError, setCartSyncError] = useState('');
  const [cartLoadedFor, setCartLoadedFor] = useState(null);
  const syncRequestRef = useRef(null);
  const previousTokenRef = useRef(token);
  const activeTokenRef = useRef(token);
  const saveQueueRef = useRef(Promise.resolve());

  useEffect(() => {
    localStorage.setItem('stepup_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('stepup_last_order', JSON.stringify(lastOrder));
  }, [lastOrder]);

  useEffect(() => {
    const previousToken = previousTokenRef.current;
    previousTokenRef.current = token;
    activeTokenRef.current = token;

    if (previousToken && previousToken !== token) {
      setCartItems([]);
      setCartLoadedFor(null);
      setCartSyncError('');
      localStorage.setItem('stepup_cart', JSON.stringify([]));
      syncRequestRef.current = null;
    }
    if (!token) return;

    if (syncRequestRef.current?.token !== token) {
      syncRequestRef.current = {
        token,
        promise: (async () => {
          const accountItems = await requestCart(CART_API_URL + '/', token);
          const guestItems = readCart();
          if (guestItems.length === 0) return accountItems;
          return requestCart(`${CART_API_URL}/merge/`, token, 'POST', guestItems);
        })(),
      };
    }

    const { promise } = syncRequestRef.current;
    promise.then(items => {
      if (activeTokenRef.current !== token) return;
      setCartItems(items);
      localStorage.setItem('stepup_cart', JSON.stringify(items));
      setCartLoadedFor(token);
      setCartSyncError('');
    }).catch(error => {
      if (activeTokenRef.current !== token) return;
      console.error('Cart synchronization failed:', error);
      setCartSyncError(error instanceof Error ? error.message : 'Unable to sync your cart.');
    });
  }, [token]);

  useEffect(() => {
    if (!token || cartLoadedFor !== token) return undefined;

    const timeoutId = setTimeout(() => {
      saveQueueRef.current = saveQueueRef.current
        .catch(() => {})
        .then(() => requestCart(CART_API_URL + '/', token, 'PUT', cartItems))
        .then(() => setCartSyncError(''))
        .catch(error => {
          console.error('Cart save failed:', error);
          setCartSyncError(error instanceof Error ? error.message : 'Unable to save your cart.');
        });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [cartItems, cartLoadedFor, token]);

  const addToCart = (product, size = '41', quantity = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item => String(item.id) === String(product.id) && String(item.size) === String(size)
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + quantity };
        return updated;
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        brand: product.brand?.name || product.brand || 'Comfy Steps',
        price: Number(product.price),
        size: String(size),
        quantity,
        image: product.main_image || '/assets/image (46).png',
        deliveryFee: 0
      }];
    });
  };

  const removeFromCart = (id, size) => {
    setCartItems(prev => prev.filter(
      item => !(String(item.id) === String(id) && String(item.size) === String(size))
    ));
  };

  const updateQuantity = (id, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id, size);
      return;
    }
    setCartItems(prev => prev.map(item =>
      String(item.id) === String(id) && String(item.size) === String(size)
        ? { ...item, quantity }
        : item
    ));
  };

  const updateSize = (id, oldSize, newSize) => {
    setCartItems(prev => prev.map(item =>
      String(item.id) === String(id) && String(item.size) === String(oldSize)
        ? { ...item, size: String(newSize) }
        : item
    ));
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateSize,
      clearCart,
      cartTotal,
      cartCount,
      lastOrder,
      setLastOrder,
      cartSyncError,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
