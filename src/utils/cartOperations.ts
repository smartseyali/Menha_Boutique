// Utility functions for cart operations that sync with API
import { cartApi, mapCartItemToFrontend } from './api';
import { setItems } from '@/store/reducer/cartSlice';
import { AppDispatch } from '@/store';
import { authStorage } from './authStorage';

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  return authStorage.isAuthenticated();
};

// Add item to cart (syncs with API - requires authentication)
export const addItemToCart = async (
  dispatch: AppDispatch,
  item: any,
  quantity: number = 1
) => {
  try {
    if (!isAuthenticated()) {
      // Guest user - use localStorage
      const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
      const existingItemIndex = guestCart.findIndex((i: any) => i.id === item.id);
      
      if (existingItemIndex > -1) {
        guestCart[existingItemIndex].quantity += quantity;
        // Dispatch update to Redux
        // We need to import updateQuantity from cartSlice, but it's not imported yet.
        // Let's assume we will add it to imports.
        // Actually, let's just reload the whole cart from localStorage to be safe and consistent
      } else {
        const newItem = { ...item, quantity };
        guestCart.push(newItem);
      }
      
      localStorage.setItem('guest_cart', JSON.stringify(guestCart));
      dispatch(setItems(guestCart));
      return true;
    }

    // Add to cart via API (database)
    await cartApi.add(item.id.toString(), quantity);
    
    // Reload cart from API to get updated data
    const cartItems = await cartApi.get();
    const mappedItems = cartItems.map((cartItem: any) => mapCartItemToFrontend(cartItem));
    dispatch(setItems(mappedItems));
    
    return true;
  } catch (error: any) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
};

// Update cart item quantity (syncs with API - requires authentication)
export const updateCartItemQuantity = async (
  dispatch: AppDispatch,
  cartItemId: string,
  quantity: number,
  currentCartItems?: any[]
) => {
  try {
    if (!isAuthenticated()) {
       // Guest user - use localStorage
       const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
       // For guest users, cartItemId might be the product id or we need to find by product id
       // Since we don't have cartItemId for guest items (unless we generate fake ones), 
       // we should rely on finding the item.
       // However, the caller passes cartItemId. 
       // If we look at ProductsDetails, it passes existingItem.cartItemId.
       // For guest items, we should ensure they have some ID.
       // Let's assume for guest, cartItemId is passed as product ID if cartItemId is missing.
       
       // Actually, let's find the item by ID matching cartItemId (which might be product ID for guest)
       const itemIndex = guestCart.findIndex((i: any) => i.id.toString() === cartItemId.toString() || i.cartItemId === cartItemId);
       
       if (itemIndex > -1) {
           guestCart[itemIndex].quantity = quantity;
           localStorage.setItem('guest_cart', JSON.stringify(guestCart));
           dispatch(setItems(guestCart));
           return true;
       }
       return false;
    }

    // Update cart item via API (database)
    // cartItemId is the cart_item.id (UUID) from the database
    await cartApi.update(cartItemId, quantity);
    
    // Reload cart from API to get updated data
    const updatedCartItems = await cartApi.get();
    const mappedItems = updatedCartItems.map((cartItem: any) => mapCartItemToFrontend(cartItem));
    dispatch(setItems(mappedItems));
    
    return true;
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

// Remove item from cart (syncs with API - requires authentication)
export const removeItemFromCart = async (
  dispatch: AppDispatch,
  cartItemId: string,
  currentCartItems?: any[]
) => {
  try {
    if (!isAuthenticated()) {
      // Guest user - use localStorage
      let guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
      guestCart = guestCart.filter((i: any) => i.id.toString() !== cartItemId.toString() && i.cartItemId !== cartItemId);
      
      localStorage.setItem('guest_cart', JSON.stringify(guestCart));
      dispatch(setItems(guestCart));
      return true;
    }

    // Remove cart item via API (database)
    // cartItemId is the cart_item.id (UUID) from the database
    await cartApi.remove(cartItemId);
    
    // Reload cart from API to get updated data
    const updatedCartItems = await cartApi.get();
    const mappedItems = updatedCartItems.map((cartItem: any) => mapCartItemToFrontend(cartItem));
    dispatch(setItems(mappedItems));
    
    return true;
  } catch (error: any) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
};

// Increment item quantity in cart
export const incrementCartItem = async (
  dispatch: AppDispatch,
  item: any,
  currentCartItems: any[]
) => {
  const existingItem = currentCartItems.find((cartItem: any) => cartItem.productId === item.id || cartItem.id === item.id);
  if (existingItem && existingItem.cartItemId) {
    // Use cartItemId for API update
    return await updateCartItemQuantity(dispatch, existingItem.cartItemId, existingItem.quantity + 1);
  } else {
    // Add new item to cart
    return await addItemToCart(dispatch, item, 1);
  }
};

