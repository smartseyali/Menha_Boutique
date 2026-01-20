import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface CartContextType {
  cartCount: number;
  updateCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        // Authenticated: Fetch from API
        // Assuming there is an endpoint to get cart or cart count
        // If not, we might need to fetch cart and count items.
        // Let's assume GET /cart returns { cart: [...] }
        const response = await api.get('/cart').catch(() => ({ data: { cart: [] } }));
        const cartItems = response.data.cart || [];
        // Count total quantity or just distinct items? Usually distinct items for badge, or specific rule.
        // Let's default to total items (sum of quantities) or distinct. Users usually prefer distinct items count or 1 dot.
        // Let's go with number of distinct items like "3" in the mockup.
        setCartCount(cartItems.length);
      } else {
        // Guest: Fetch from AsyncStorage
        const cartJson = await AsyncStorage.getItem('cart');
        if (cartJson) {
           const cart = JSON.parse(cartJson);
           setCartCount(cart.length);
        } else {
           setCartCount(0);
        }
      }
    } catch (error) {
       console.error("Failed to update cart count", error);
    }
  };

  useEffect(() => {
    updateCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
