import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import api from '../services/api';

interface WishlistContextType {
  wishlist: any[];
  addToWishlist: (product: any) => Promise<void>;
  removeFromWishlist: (wishlistId: string) => Promise<void>;
  toggleWishlist: (product: any) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<any[]>([]);

  const refreshWishlist = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const response = await api.get('/wishlist');
        setWishlist(response.data.wishlist || response.data || []);
      } else {
          setWishlist([]);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, []);

  const addToWishlist = async (product: any) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('Auth required');

      await api.post('/wishlist/add', { productId: product.id });
      await refreshWishlist();
    } catch (error) {
      console.error("Failed to add to wishlist", error);
      throw error;
    }
  };

  const removeFromWishlist = async (wishlistId: string) => {
    try {
        const token = await AsyncStorage.getItem('auth_token');
        if (!token) throw new Error('Auth required');
  
        await api.delete(`/wishlist/${wishlistId}`);
        await refreshWishlist();
    } catch (error) {
        console.error("Failed to remove from wishlist", error);
        throw error;
    }
  };

  const isInWishlist = (productId: string) => {
      // API returns item.product_id usually
      return wishlist.some(item => item.product_id === productId || item.id === productId); 
      // Note: Backend findByUserId returns items joined with products. 
      // The row usually has 'id' (wishlist id) and 'product_id'.
  };

  const toggleWishlist = async (product: any) => {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
          throw new Error('Login Required');
      }

      // Find if item exists
      // The wishlist array from backend has "product_id"
      const existingItem = wishlist.find(item => item.product_id === product.id);

      if (existingItem) {
          // Remove
          await removeFromWishlist(existingItem.id); // existingItem.id is the wishlist UUID
      } else {
          // Add
          await addToWishlist(product);
      }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
