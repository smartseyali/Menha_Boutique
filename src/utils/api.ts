// API service utility for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pattikadai.com';

// Review API
export const reviewApi = {
  getByProductId: async (productId: string, page: number = 1, limit: number = 50) => {
    try {
      const response = await apiRequest(`/api/reviews/product/${productId}?page=${page}&limit=${limit}`, {
        method: 'GET',
      }, false);
      return response.reviews || [];
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  },

  create: async (productId: string, rating: number, comment: string) => {
    try {
      const response = await apiRequest(`/api/reviews`, {
        method: 'POST',
        body: JSON.stringify({ productId, rating, comment }),
      }, true);
      return response.review;
    } catch (error: any) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  update: async (reviewId: string, rating: number, comment: string) => {
    try {
      const response = await apiRequest(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify({ rating, comment }),
      }, true);
      return response.review;
    } catch (error: any) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  delete: async (reviewId: string) => {
    try {
      await apiRequest(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      }, true);
      return true;
    } catch (error: any) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },
};

// Get auth token from sessionStorage (secure storage)
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('auth_token');
  }
  return null;
};

// Generic API request function
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = false
): Promise<any> => {
  const token = getAuthToken();
  // Normalize headers to a plain object so we can safely add Authorization header
  const headersInit: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // For endpoints requiring authentication, token is mandatory
  // Add Authorization header if token is available, regardless of requireAuth
  // This supports optional authentication on the backend
  if (token) {
    headersInit['Authorization'] = `Bearer ${token}`;
  }

  // Only throw error if authentication is specifically required and no token exists
  if (requireAuth && !token) {
    throw new Error('Authentication required. Please login.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: headersInit,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let error: any;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || 'Request failed' };
      }
      
      // Handle 400/404 errors for public endpoints gracefully
      if ((response.status === 400 || response.status === 404) && !requireAuth) {
        // If this is a modification request (POST/PUT/DELETE), we shouldn't suppress the error
        // because the operation clearly failed
        if (options.method && options.method !== 'GET') {
          console.error(`Public endpoint ${endpoint} returned ${response.status}. Error: ${error.message}`);
          throw new Error(error.message || 'Request failed');
        }

        // Public GET endpoint returned 400/404 - return empty data instead of throwing
        console.warn(`Public endpoint ${endpoint} returned ${response.status}. Error: ${error.message}`);
        // Return empty data structure based on endpoint type
        if (endpoint.includes('/products')) {
          return { products: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } };
        }
        if (endpoint.includes('/categories')) {
          return { categories: [] };
        }
        return {};
      }
      
      // Handle 401 errors for public endpoints gracefully
      if (response.status === 401 && !requireAuth) {
        // Public endpoint returned 401 - this shouldn't happen but handle it
        console.warn(`Public endpoint ${endpoint} returned 401. Error: ${error.message}`);
        // Return empty data structure based on endpoint type
        if (endpoint.includes('/products')) {
          return { products: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } };
        }
        if (endpoint.includes('/categories')) {
          return { categories: [] };
        }
        return {};
      }
      
      // For authenticated endpoints, throw auth errors
      if (requireAuth && response.status === 401) {
        // Auto-logout: Clear invalid token and redirect if in browser
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('auth_token');
          // Only redirect if not already on the login page to avoid loops
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login?expired=true';
          }
        }
        throw new Error(error.message || 'Authentication required');
      }
      
      // For 400 errors on authenticated endpoints, still throw but with better message
      if (requireAuth && response.status === 400) {
        throw new Error(error.message || 'Bad request');
      }
      
      // For other errors, throw normally
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  } catch (error: any) {
    // Re-throw if it's an authentication or bad request error on authenticated endpoints
    if (requireAuth && error.message && (error.message.includes('Authentication required') || error.message.includes('Bad request'))) {
      throw error;
    }
    // For network errors on public endpoints, return empty data
    if (!requireAuth) {
      // For non-GET requests (POST, PUT, DELETE), we should usually throw the error
      // so the caller knows the operation failed. However, for public endpoints that might
      // fail due to network issues (like logging or analytics), we might want to be lenient.
      if (options.method && options.method !== 'GET') {
        console.warn(`API request failed for public ${endpoint} (${options.method}):`, error.message);
        // We still throw here because a failed POST/PUT/DELETE usually implies a user action failed
        throw new Error(error.message || 'Request failed');
      }

      console.warn(`Network error for public endpoint ${endpoint}, returning empty data:`, error.message);
      if (endpoint.includes('/products')) {
        return { products: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } };
      }
      if (endpoint.includes('/categories')) {
        return { categories: [] };
      }
      return {};
    }
    // For network errors on authenticated endpoints or other issues, log and re-throw
    console.error(`API request failed for ${endpoint}:`, error);
    throw new Error(error.message || 'Request failed');
  }
};

// Product API (public endpoints - no auth required)
export const productApi = {
  getAll: async (params?: { page?: number; limit?: number; categoryId?: string; status?: string; search?: string }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);

      const query = queryParams.toString();
      const response = await apiRequest(`/api/products${query ? `?${query}` : ''}`, {}, false);
      // Return both products and pagination if available
      if (response.pagination) {
        return response;
      }
      return response.products || [];
    } catch (error: any) {
      console.error('Error fetching products:', error);
      // Return empty array on error for public endpoints
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      const response = await apiRequest(`/api/products/${id}`, {}, false);
      return response.product;
    } catch (error: any) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  search: async (query: string) => {
    try {
      const response = await apiRequest(`/api/products/search?q=${encodeURIComponent(query)}`, {}, false);
      return response.products || [];
    } catch (error: any) {
      console.error('Error searching products:', error);
      return [];
    }
  },

  getBestSelling: async (limit: number = 50) => {
    try {
      const response = await apiRequest(`/api/products/bestselling?limit=${limit}`, {}, false);
      return response.products || [];
    } catch (error: any) {
      console.error('Error fetching best selling products:', error);
      return [];
    }
  },
};

// Cart API (requires authentication)
export const cartApi = {
  get: async () => {
    try {
      const response = await apiRequest('/api/cart', {}, true);
      return response.cart || [];
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      return [];
    }
  },

  add: async (productId: string, quantity: number = 1) => {
    try {
      const response = await apiRequest('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      }, true);
      return response.cartItem;
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  update: async (id: string, quantity: number) => {
    try {
      const response = await apiRequest(`/api/cart/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }, true);
      return response.cartItem;
    } catch (error: any) {
      console.error('Error updating cart:', error);
      throw error;
    }
  },

  remove: async (id: string) => {
    try {
      await apiRequest(`/api/cart/${id}`, {
        method: 'DELETE',
      }, true);
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  clear: async () => {
    try {
      await apiRequest('/api/cart', {
        method: 'DELETE',
      }, true);
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },
};

// Order API (requires authentication)
export const orderApi = {
  getAll: async () => {
    try {
      const response = await apiRequest('/api/orders', {}, true);
      return response.orders || [];
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  getById: async (id: string, isGuest: boolean = false) => {
    try {
      const response = await apiRequest(`/api/orders/${id}`, {}, !isGuest);
      return response.order;
    } catch (error: any) {
      console.error('Error fetching order:', error);
      return null;
    }
  },

  getByTransactionId: async (transactionId: string) => {
    try {
      const response = await apiRequest(`/api/orders/by-transaction/${transactionId}`, {}, true);
      return response.order;
    } catch (error: any) {
      console.error('Error fetching order by transaction:', error);
      return null;
    }
  },

  create: async (orderData: any, isGuest: boolean = false) => {
    try {
      const response = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      }, !isGuest);
      return response;
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
};

// Payment API (requires authentication)
export const paymentApi = {
  createOrder: async (paymentData: {
    orderId: string;
    gateway: string;
    amount: number;
    currency?: string;
    callbackUrl?: string;
    mobileNumber?: string;
  }) => {
    try {
      const response = await apiRequest('/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      }, false);
      return response.paymentOrder;
    } catch (error: any) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  },

  verifyPayment: async (verificationData: {
    orderId: string;
    gateway: string;
    paymentData: any;
  }) => {
    try {
      const response = await apiRequest('/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify(verificationData),
      }, false);
      return response;
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },

  verifyPaymentLink: async (verificationData: {
    razorpay_payment_id: string;
    razorpay_payment_link_id: string;
    razorpay_payment_link_reference_id: string;
    razorpay_payment_link_status: string;
    razorpay_signature: string;
  }) => {
    try {
      const response = await apiRequest('/api/payments/verify-link', {
        method: 'POST',
        body: JSON.stringify(verificationData),
      }, false);
      return response;
    } catch (error: any) {
      console.error('Error verifying payment link:', error);
      throw error;
    }
  },
};

// Category API (public endpoints - no auth required)
export const categoryApi = {
  getAll: async () => {
    try {
      const response = await apiRequest('/api/categories', {}, false);
      return response.categories || [];
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      // Return empty array on error for public endpoints
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      const response = await apiRequest(`/api/categories/${id}`, {}, false);
      return response.category;
    } catch (error: any) {
      console.error('Error fetching category:', error);
      return null;
    }
  },
};

// Wishlist API (requires authentication)
export const wishlistApi = {
  getAll: async () => {
    try {
      const response = await apiRequest('/api/wishlist', {}, true);
      return response.wishlist || [];
    } catch (error: any) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  },

  add: async (productId: string) => {
    try {
      const response = await apiRequest('/api/wishlist/add', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      }, true);
      return response.wishlistItem;
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  remove: async (id: string) => {
    try {
      await apiRequest(`/api/wishlist/${id}`, {
        method: 'DELETE',
      }, true);
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },
};

// Address API (requires authentication)
export const addressApi = {
  getAll: async () => {
    try {
      const response = await apiRequest('/api/addresses', {}, true);
      return response.addresses || [];
    } catch (error: any) {
      console.error('Error fetching addresses:', error);
      return [];
    }
  },

  create: async (addressData: any, isGuest: boolean = false) => {
    try {
      const response = await apiRequest('/api/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData),
      }, !isGuest);
      return response.address;
    } catch (error: any) {
      console.error('Error creating address:', error);
      throw error;
    }
  },

  update: async (id: string, addressData: any) => {
    try {
      const response = await apiRequest(`/api/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(addressData),
      }, true);
      return response.address;
    } catch (error: any) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      await apiRequest(`/api/addresses/${id}`, {
        method: 'DELETE',
      }, true);
    } catch (error: any) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },
};

// Location API (public endpoints - no auth required)
export const locationApi = {
  getCountries: async () => {
    try {
      const response = await apiRequest('/api/locations/countries', {}, false);
      return response.countries || [];
    } catch (error: any) {
      console.error('Error fetching countries:', error);
      return [];
    }
  },

  getStates: async (countryId: string) => {
    try {
      const response = await apiRequest(`/api/locations/states?countryId=${countryId}`, {}, false);
      return response.states || [];
    } catch (error: any) {
      console.error('Error fetching states:', error);
      return [];
    }
  },

  getCities: async (stateId: string) => {
    try {
      const response = await apiRequest(`/api/locations/cities?stateId=${stateId}`, {}, false);
      return response.cities || [];
    } catch (error: any) {
      console.error('Error fetching cities:', error);
      return [];
    }
  },
};

// Delivery API (public endpoints - no auth required)
export const deliveryApi = {
  calculate: async (data: { state: string; items: any[] }) => {
    try {
      const response = await apiRequest('/api/delivery/calculate', {
        method: 'POST',
        body: JSON.stringify(data),
      }, false);
      return response.deliveryCharge || 0;
    } catch (error: any) {
      console.error('Error calculating delivery charge:', error);
      return 0;
    }
  },
};



// Helper function to convert image path to full URL if needed (exported for reuse)
// Must be defined before mapProductToFrontend since it's used there
export const getImageUrl = (imagePath: string | null | undefined): string => {
  // Handle null, undefined, or empty strings
  if (!imagePath || imagePath.trim() === '' || imagePath === 'null' || imagePath === 'undefined') {
    return `${API_BASE_URL}/assets/img/product/default.jpg`;
  }
  
  // Trim whitespace
  const trimmedPath = imagePath.trim();
  
  // Helper function to encode path segments while preserving slashes
  const encodePathSegments = (path: string): string => {
    return path.split('/').map(segment => {
      // Don't encode empty segments (for leading/trailing slashes)
      if (!segment) return segment;
      // Encode each segment to handle spaces and special characters
      return encodeURIComponent(segment);
    }).join('/');
  };
  
  // If already a full URL (http/https), encode the pathname part
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    try {
      const url = new URL(trimmedPath);
      // Encode the pathname to handle spaces and special characters
      const encodedPathname = encodePathSegments(url.pathname);
      return `${url.protocol}//${url.host}${encodedPathname}${url.search}${url.hash}`;
    } catch {
      // If URL parsing fails, try to encode manually
      const urlMatch = trimmedPath.match(/^(https?:\/\/[^/]+)(\/.*)$/);
      if (urlMatch) {
        return urlMatch[1] + encodePathSegments(urlMatch[2]);
      }
      return trimmedPath;
    }
  }
  
  // If path starts with /assets, it's served from backend, so prepend API URL and encode
  if (trimmedPath.startsWith('/assets')) {
    const encodedPath = encodePathSegments(trimmedPath);
    return `${API_BASE_URL}${encodedPath}`;
  }
  
  // If path starts with /, it's a relative path, check if it's an asset
  if (trimmedPath.startsWith('/')) {
    // If it looks like an asset path (product images), prepend API URL and encode
    if (trimmedPath.includes('/assets/') || trimmedPath.includes('/img/') || trimmedPath.includes('/product/')) {
      const encodedPath = encodePathSegments(trimmedPath);
      return `${API_BASE_URL}${encodedPath}`;
    }
    // Otherwise, it might be a Next.js public asset, return as is (but encode for safety)
    return encodePathSegments(trimmedPath);
  }
  
  // If no leading slash, add it and check
  const pathWithSlash = `/${trimmedPath}`;
  if (pathWithSlash.includes('/assets/') || pathWithSlash.includes('/img/') || pathWithSlash.includes('/product/')) {
    const encodedPath = encodePathSegments(pathWithSlash);
    return `${API_BASE_URL}${encodedPath}`;
  }
  
  // If it's just a filename, assume it's in the product folder and encode
  if (!trimmedPath.includes('/')) {
    return `${API_BASE_URL}/assets/img/product/${encodeURIComponent(trimmedPath)}`;
  }
  
  // Encode the final path
  const encodedFinalPath = encodePathSegments(pathWithSlash);
  // If it looks like an asset path, prepend API URL
  if (encodedFinalPath.includes('/assets/') || encodedFinalPath.includes('/img/') || encodedFinalPath.includes('/product/')) {
    return `${API_BASE_URL}${encodedFinalPath}`;
  }
  return encodedFinalPath;
};

// Banner API (public endpoints - no auth required)
export const bannerApi = {
  getAll: async (params?: { type?: string }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.type) queryParams.append('type', params.type);
      queryParams.append('activeOnly', 'true'); // Public always fetches active only

      const query = queryParams.toString();
      const response = await apiRequest(`/api/banners${query ? `?${query}` : ''}`, {}, false);
      
      if (Array.isArray(response)) {
        return response.map((banner: any) => ({
          ...banner,
          image_url: getImageUrl(banner.image_url)
        }));
      }
      return [];
    } catch (error: any) {
      console.error('Error fetching banners:', error);
      return [];
    }
  },
};

// Map backend product to frontend format
export const mapProductToFrontend = (product: any, images?: any[]) => {
  if (!product) {
    return null;
  }

  // Get images array - prioritize passed images, then product.images
  const productImages = images || product.images || [];
  
  // Find primary image - check if any image in the array is marked as primary
  let primaryImage = product.primary_image || null;
  if (!primaryImage && productImages.length > 0) {
    // Look for image marked as primary
    const primaryImg = productImages.find((img: any) => img.is_primary === true || img.isPrimary === true);
    if (primaryImg) {
      primaryImage = primaryImg.image_url || primaryImg.imageUrl || primaryImg.url;
    } else {
      // Use first image if no primary is marked
      primaryImage = productImages[0].image_url || productImages[0].imageUrl || productImages[0].url || '';
    }
  }
  
  // Fallback to default if still no image
  if (!primaryImage || primaryImage === '') {
    primaryImage = '/assets/img/product/default.jpg';
  }
  
  // Get secondary image - use second image if available, otherwise use primary
  let secondaryImage = primaryImage;
  if (productImages.length > 1) {
    const secondaryImg = productImages[1];
    secondaryImage = secondaryImg.image_url || secondaryImg.imageUrl || secondaryImg.url || primaryImage;
  } else if (productImages.length > 0 && productImages[0].image_url !== primaryImage) {
    // If we have one image and it's not the primary, use it
    secondaryImage = productImages[0].image_url || productImages[0].imageUrl || productImages[0].url || primaryImage;
  }

  // Ensure we have valid image paths (handle both absolute and relative paths)
  const finalPrimaryImage = getImageUrl(primaryImage);
  const finalSecondaryImage = getImageUrl(secondaryImage);

  // Get default price from attributes if available, otherwise use product price
  const attributes = product.attributes || [];
  const defaultAttribute = attributes.find((attr: any) => attr.is_default === true || attr.isDefault === true) || attributes[0];
  const displayPrice = defaultAttribute ? parseFloat(defaultAttribute.price || 0) : parseFloat(product.new_price || product.newPrice || 0);
  const displayOldPrice = defaultAttribute && defaultAttribute.old_price 
    ? parseFloat(defaultAttribute.old_price) 
    : (product.old_price || product.oldPrice ? parseFloat(product.old_price || product.oldPrice) : null);

  return {
    id: product.id || '',
    title: product.title || 'Untitled Product',
    newPrice: displayPrice || 0,
    oldPrice: displayOldPrice,
    image: finalPrimaryImage,
    imageTwo: finalSecondaryImage,
    category: product.category_name || product.category || '',
    brand: product.brand_name || product.brand || '',
    sku: product.sku || '',
    status: product.status || 'In Stock',
    rating: parseFloat(product.rating || 0) || 0,
    weight: product.weight || '',
    location: product.location || 'In Store,online',
    sale: product.sale_tag || product.saleTag || '',
    quantity: 1,
    date: product.created_at || product.createdAt || '',
    itemLeft: product.item_left || product.itemLeft || product.stock_quantity || product.stockQuantity || 0,
    description: product.description || '',
    // New fields for enhanced product structure
    detailedDescription: product.detailed_description || product.detailedDescription || '',
    productDetails: product.product_details || product.productDetails || null,
    productInformation: product.product_information || product.productInformation || null,
    attributes: attributes.map((attr: any) => ({
      id: attr.id,
      attributeType: attr.attribute_type || attr.attributeType || 'weight',
      attributeValue: attr.attribute_value || attr.attributeValue || '',
      price: parseFloat(attr.price || 0),
      oldPrice: attr.old_price ? parseFloat(attr.old_price) : null,
      stockQuantity: attr.stock_quantity || attr.stockQuantity || 0,
      skuSuffix: attr.sku_suffix || attr.skuSuffix || '',
      isDefault: attr.is_default || attr.isDefault || false,
      displayOrder: attr.display_order || attr.displayOrder || 0,
    })),
    reviews: product.reviews || [],
    isSpecial: product.is_special || product.isSpecial || false,
    isCombo: product.is_combo || product.isCombo || false,
    sequence: product.sequence || 0,
  };
};

// Map backend cart item to frontend format
export const mapCartItemToFrontend = (cartItem: any) => {
  // Store both cart_item_id and product_id for API operations
  const imagePath = cartItem.primary_image || '/assets/img/product/default.jpg';
  return {
    id: cartItem.product_id || cartItem.id, // Use product_id as the main ID for frontend
    cartItemId: cartItem.id, // Store cart item ID for API operations
    productId: cartItem.product_id,
    title: cartItem.title,
    newPrice: parseFloat(cartItem.new_price) || 0,
    oldPrice: cartItem.old_price ? `₹${parseFloat(cartItem.old_price).toFixed(2)}` : '',
    image: getImageUrl(imagePath),
    imageTwo: getImageUrl(imagePath),
    category: cartItem.category_name || '',
    brand: cartItem.brand_name || '',
    sku: cartItem.sku || '',
    status: cartItem.product_status || 'In Stock',
    rating: parseFloat(cartItem.rating || cartItem.product?.rating || 0),
    weight: '',
    location: 'In Store,online',
    quantity: parseInt(cartItem.quantity) || 1,
    date: cartItem.created_at || '',
  };
};

// Map backend wishlist item to frontend format
export const mapWishlistItemToFrontend = (wishlistItem: any) => {
  // Store both wishlist_item_id and product_id for API operations
  const imagePath = wishlistItem.primary_image || '/assets/img/product/default.jpg';
  return {
    id: wishlistItem.product_id || wishlistItem.id, // Use product_id as the main ID for frontend
    wishlistItemId: wishlistItem.id, // Store wishlist item ID for API operations (UUID)
    productId: wishlistItem.product_id,
    title: wishlistItem.title || '',
    newPrice: parseFloat(wishlistItem.new_price) || 0,
    oldPrice: wishlistItem.old_price ? parseFloat(wishlistItem.old_price) : null,
    image: getImageUrl(imagePath),
    imageTwo: getImageUrl(imagePath),
    category: wishlistItem.category_name || wishlistItem.category || '',
    brand: wishlistItem.brand_name || wishlistItem.brand || '',
    sku: wishlistItem.sku || '',
    status: wishlistItem.status || 'In Stock',
    rating: parseFloat(wishlistItem.rating) || 0,
    weight: wishlistItem.weight || '',
    location: 'In Store,online',
    quantity: 1,
    date: wishlistItem.created_at || '',
    sale: wishlistItem.sale_tag || '',
    itemLeft: wishlistItem.stock_quantity || 0,
  };
};

// Map backend order to frontend format
export const mapOrderToFrontend = (order: any, items?: any[]) => {
  const products = (items || order.items || []).map((item: any) => {
    const imagePath = item.primary_image || '/assets/img/product/default.jpg';
    return {
      id: item.product_id,
      title: item.title || '',
      newPrice: parseFloat(item.unit_price) || 0,
      oldPrice: '',
      image: getImageUrl(imagePath),
      imageTwo: getImageUrl(imagePath),
      category: '',
      brand: '',
      sku: item.sku || '',
      status: 'In Stock',
      rating: 0,
      weight: '',
      location: '',
      quantity: parseInt(item.quantity) || 1,
      date: order.created_at || '',
    };
  });

  return {
    orderId: order.order_number || order.id,
    date: order.created_at,
    shippingMethod: order.shipping_method || 'free',
    totalItems: parseInt(order.total_items) || 0,
    totalPrice: parseFloat(order.total_price) || 0,
    status: order.status || 'Pending',
    products,
    address: order.shipping_address_id ? {
      id: order.shipping_address_id,
      firstName: order.shipping_first_name || '',
      lastName: order.shipping_last_name || '',
      address: order.shipping_address || '',
      city: order.shipping_city || '',
      postalCode: order.shipping_postal_code || '',
      country: order.shipping_country || '',
      state: '',
      countryName: order.shipping_country || '',
      stateName: '',
    } : null,
  };
};

