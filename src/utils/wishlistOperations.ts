// Utility functions for wishlist operations that sync with API
import { wishlistApi, mapWishlistItemToFrontend } from './api';
import { setWishlistItems } from '@/store/reducer/wishlistSlice';
import { AppDispatch } from '@/store';
import { authStorage } from './authStorage';

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  return authStorage.isAuthenticated();
};

// Add item to wishlist (syncs with API - requires authentication)
export const addItemToWishlist = async (
  dispatch: AppDispatch,
  productId: string | number
) => {
  try {
    if (!isAuthenticated()) {
      throw new Error('Please login to add items to wishlist');
    }

    // Add to wishlist via API (database)
    await wishlistApi.add(productId.toString());
    
    // Reload wishlist from API to get updated data
    const wishlistItems = await wishlistApi.getAll();
    const mappedItems = wishlistItems.map((item: any) => mapWishlistItemToFrontend(item));
    dispatch(setWishlistItems(mappedItems));
    
    return true;
  } catch (error: any) {
    console.error('Error adding item to wishlist:', error);
    throw error;
  }
};

// Remove item from wishlist (syncs with API - requires authentication)
export const removeItemFromWishlist = async (
  dispatch: AppDispatch,
  wishlistItemId: string
) => {
  try {
    if (!isAuthenticated()) {
      throw new Error('Please login to remove items from wishlist');
    }

    // Remove wishlist item via API (database)
    await wishlistApi.remove(wishlistItemId);
    
    // Reload wishlist from API to get updated data
    const wishlistItems = await wishlistApi.getAll();
    const mappedItems = wishlistItems.map((item: any) => mapWishlistItemToFrontend(item));
    dispatch(setWishlistItems(mappedItems));
    
    return true;
  } catch (error: any) {
    console.error('Error removing item from wishlist:', error);
    throw error;
  }
};

// Load wishlist from API
export const loadWishlist = async (dispatch: AppDispatch) => {
  try {
    if (!isAuthenticated()) {
      return;
    }

    const wishlistItems = await wishlistApi.getAll();
    const mappedItems = wishlistItems.map((item: any) => mapWishlistItemToFrontend(item));
    dispatch(setWishlistItems(mappedItems));
  } catch (error: any) {
    console.error('Error loading wishlist:', error);
  }
};

