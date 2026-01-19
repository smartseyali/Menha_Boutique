import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setItems } from '@/store/reducer/cartSlice';
import { cartApi, mapCartItemToFrontend } from '@/utils/api';

export const useLoadCart = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.login.isAuthenticated);
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    // Skip if already loaded or currently loading or not authenticated
    if (hasLoadedRef.current || isLoadingRef.current || !isAuthenticated) {
      return;
    }

    const loadCart = async () => {
      isLoadingRef.current = true;
      
      try {
        // Load cart from API (database) only
        const load = async () => {
          try {
            const cartItems = await cartApi.get();
            const mappedItems = cartItems.map((item: any) => mapCartItemToFrontend(item));
            dispatch(setItems(mappedItems));
          } catch (error) {
            console.error('Error loading cart from API:', error);
            // If error, just set empty cart (no fallback to localStorage)
            dispatch(setItems([]));
          } finally {
            hasLoadedRef.current = true;
            isLoadingRef.current = false;
          }
        };

        // Use requestIdleCallback to defer if browser is busy
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          (window as any).requestIdleCallback(load, { timeout: 1000 });
        } else {
          setTimeout(load, 50); // Small delay to not block navigation
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        hasLoadedRef.current = true;
        isLoadingRef.current = false;
      }
    };

    loadCart();
  }, [dispatch, isAuthenticated]);
};

