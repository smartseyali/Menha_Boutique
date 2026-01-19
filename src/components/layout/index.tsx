"use client";

import { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Loader from "../loader/Loader";
import Toastify from "../toast-popup/Toastify";
import { useDispatch } from "react-redux";
import { setWishlistItems } from "@/store/reducer/wishlistSlice";
import { usePathname } from "next/navigation";
import { trackAttribution, getAttributionForConversion } from "@/utils/attribution";
import { useLoadCart } from "@/hooks/useCart";

const Layout = ({ children }: any) => {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const dispatch = useDispatch();

  // Initialize attribution tracking on mount
  useEffect(() => {
    // Track attribution on initial page load
    const attribution = trackAttribution();

    // Send page view to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: window.location.pathname,
        page_title: document.title,
        // Add attribution data
        ...(attribution.source && { source: attribution.source }),
        ...(attribution.medium && { medium: attribution.medium }),
        ...(attribution.campaign && { campaign: attribution.campaign }),
      });

      // Track page view event
      (window as any).gtag('event', 'page_view', {
        page_path: window.location.pathname,
        page_title: document.title,
        source: attribution.source || 'direct',
        medium: attribution.medium || 'none',
        campaign: attribution.campaign || '',
        channel: attribution.channel || 'Direct',
      });
    }

    // Send page view to Meta Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView', {
        content_name: document.title,
        content_category: 'page_view',
        source: attribution.source || 'direct',
        medium: attribution.medium || 'none',
        campaign: attribution.campaign || '',
      });
    }
  }, []); // Only run on mount

  useEffect(() => {
    // Immediately hide loading - no artificial delay
    setLoading(false);

    // Defer analytics tracking to not block navigation
    // Use requestIdleCallback or setTimeout to run after page is visible
    if (typeof window !== 'undefined') {
      const trackAnalytics = () => {
        const attribution = getAttributionForConversion();

        // Update Google Analytics page view
        if ((window as any).gtag) {
          (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
            page_path: pathname,
            page_title: document.title,
          });

          (window as any).gtag('event', 'page_view', {
            page_path: pathname,
            page_title: document.title,
            source: attribution?.source || 'direct',
            medium: attribution?.medium || 'none',
          });
        }

        // Update Meta Pixel page view
        if ((window as any).fbq) {
          (window as any).fbq('track', 'PageView', {
            content_name: document.title,
            source: attribution?.source || 'direct',
          });
        }
      };

      // Use requestIdleCallback if available, otherwise setTimeout with 0 delay
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(trackAnalytics, { timeout: 2000 });
      } else {
        setTimeout(trackAnalytics, 0);
      }
    }
  }, [pathname]);

  // Load cart from API or localStorage (only on mount, not on every navigation)
  // This prevents unnecessary API calls on every page change
  useLoadCart();

  // Load wishlist from API (database) instead of localStorage
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        // Check if user is authenticated
        if (typeof window !== 'undefined') {
          const token = sessionStorage.getItem('auth_token');
          if (token) {
            // User is authenticated, load wishlist from API
            const { wishlistApi, mapWishlistItemToFrontend } = await import('@/utils/api');
            const wishlistItems = await wishlistApi.getAll();
            const mappedItems = wishlistItems.map((item: any) => mapWishlistItemToFrontend(item));
            dispatch(setWishlistItems(mappedItems));
          }
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
        // If error, set empty wishlist
        dispatch(setWishlistItems([]));
      }
    };

    loadWishlist();
  }, [dispatch]);
  // Check if current route is admin route
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <>
      <Toastify />
      {!isAdminRoute && <Header />}
      {!isAdminRoute && <div className="d-block d-xl-none" style={{ height: '100px' }}></div>}
      {!isAdminRoute && <div className="d-none d-xl-block" style={{ height: '120px' }}></div>}
      {loading && <Loader />}
      {children}
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <div className="d-block d-xl-none" style={{ height: '70px' }}></div>}
    </>
  );
};

export default Layout;
