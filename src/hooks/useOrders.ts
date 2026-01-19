import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setOrders } from '@/store/reducer/cartSlice';
import { orderApi, mapOrderToFrontend } from '@/utils/api';
import { authStorage } from '@/utils/authStorage';

export const useLoadOrders = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        // Check if user is authenticated
        if (authStorage.isAuthenticated()) {
          // Load orders from API (database)
          const orders = await orderApi.getAll();
          const mappedOrders = orders.map((order: any) => mapOrderToFrontend(order, order.items));
          dispatch(setOrders(mappedOrders));
        } else {
          // User not authenticated, check for guest order in sessionStorage
          const guestOrderId = sessionStorage.getItem('guest_last_order_id');
          if (guestOrderId) {
             // Fetch specific order for guest
             const order = await orderApi.getById(guestOrderId, true);
             if (order) {
                 const mappedOrder = mapOrderToFrontend(order, order.items);
                 dispatch(setOrders([mappedOrder]));
             } else {
                 dispatch(setOrders([]));
             }
          } else {
             // No guest order found
             dispatch(setOrders([]));
          }
        }
      } catch (error) {
        console.error('Error loading orders:', error);
        // If error, set empty orders (no fallback to localStorage)
        dispatch(setOrders([]));
      }
    };

    loadOrders();
  }, [dispatch]);
};

