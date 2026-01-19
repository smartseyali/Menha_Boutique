// Admin API service utility for backend communication
import { authStorage } from './authStorage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pattikadai.com';

// Get auth token from sessionStorage (secure storage)
const getAuthToken = (): string | null => {
  return authStorage.getToken();
};

// Generic API request function for admin endpoints (requires auth)
const adminApiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please login.');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let error: any;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || 'Request failed' };
      }
      
      // Log detailed error for debugging
      console.error(`Admin API Error [${response.status}] for ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        error: error.message || errorText,
        headers: Object.fromEntries(response.headers.entries()),
      });
      
      if (response.status === 401) {
        // Clear auth data if token is invalid
        authStorage.clear();
        throw new Error('Authentication required. Please login again.');
      }
      
      if (response.status === 403) {
        // Check if user data exists and log role for debugging
        const userData = authStorage.getUserData();
        console.error('403 Forbidden - User role check:', {
          userRole: userData?.role,
          userId: userData?.id,
          endpoint,
        });
        throw new Error(error.message || 'Access denied. Admin privileges required. Please ensure your account has admin role.');
      }
      
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    console.error(`Admin API request failed for ${endpoint}:`, error);
    throw new Error(error.message || 'Request failed');
  }
};

// Admin API
export const adminApi = {
  // Dashboard Statistics
  getStats: async () => {
    try {
      const response = await adminApiRequest('/api/admin/stats');
      return response.stats;
    } catch (error: any) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

  // Users Management
  getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);

      const query = queryParams.toString();
      const response = await adminApiRequest(`/api/admin/users${query ? `?${query}` : ''}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUserDetails: async (userId: string) => {
    try {
      const response = await adminApiRequest(`/api/admin/users/${userId}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  },

  updateUserStatus: async (userId: string, data: { role?: string; is_active?: boolean }) => {
    try {
      const response = await adminApiRequest(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Orders Management
  getAllOrders: async (params?: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    search?: string; 
    fromDate?: string; 
    toDate?: string; 
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params?.toDate) queryParams.append('toDate', params.toDate);

      const query = queryParams.toString();
      const response = await adminApiRequest(`/api/orders/all${query ? `?${query}` : ''}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      const response = await adminApiRequest(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      return response.order;
    } catch (error: any) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Products Management
  createProduct: async (productData: any) => {
    try {
      const response = await adminApiRequest('/api/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
      return response.product;
    } catch (error: any) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (productId: string, productData: any) => {
    try {
      const response = await adminApiRequest(`/api/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
      return response.product;
    } catch (error: any) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (productId: string) => {
    try {
      await adminApiRequest(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Categories Management
  createCategory: async (categoryData: any) => {
    try {
      const response = await adminApiRequest('/api/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      });
      return response.category;
    } catch (error: any) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  updateCategory: async (categoryId: string, categoryData: any) => {
    try {
      const response = await adminApiRequest(`/api/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData),
      });
      return response.category;
    } catch (error: any) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  deleteCategory: async (categoryId: string) => {
    try {
      await adminApiRequest(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Image Upload
  uploadImage: async (formData: FormData) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let message = `Upload failed (${response.status})`;
        
        try {
          if (errorText && errorText.startsWith('{')) {
            const json = JSON.parse(errorText);
            if (json && json.message) {
              message = json.message;
            }
          } else if (errorText) {
             message = errorText.substring(0, 200);
          }
        } catch (e) {
          // ignore parsing error
        }
        
        if (response.status === 401) {
          authStorage.clear();
          throw new Error('Authentication required. Please login again.');
        }
        
        throw new Error(message);
      }

      return response.json();
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      console.error('Image upload failed:', error);
      throw new Error(error.message || 'Upload failed');
    }
  },

  // Upload Multiple Images
  uploadMultipleImages: async (formData: FormData) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/api/upload/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let message = `Upload failed (${response.status})`;
        
        try {
          if (errorText && errorText.startsWith('{')) {
            const json = JSON.parse(errorText);
            if (json && json.message) {
              message = json.message;
            }
          } else if (errorText) {
             message = errorText.substring(0, 200);
          }
        } catch (e) {
          // ignore parsing error
        }
        
        if (response.status === 401) {
          authStorage.clear();
          throw new Error('Authentication required. Please login again.');
        }
        
        throw new Error(message);
      }

      return response.json();
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      console.error('Multiple image upload failed:', error);
      throw new Error(error.message || 'Upload failed');
    }
  },

  // Delivery Management
  getDeliveryCharges: async () => {
    try {
      const response = await adminApiRequest('/api/delivery/charges');
      return response;
    } catch (error: any) {
      console.error('Error fetching delivery charges:', error);
      throw error;
    }
  },

  createDeliveryCharge: async (data: any) => {
    try {
      const response = await adminApiRequest('/api/delivery/charges', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.charge;
    } catch (error: any) {
      console.error('Error creating delivery charge:', error);
      throw error;
    }
  },

  updateDeliveryCharge: async (id: string, data: any) => {
    try {
      const response = await adminApiRequest(`/api/delivery/charges/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.charge;
    } catch (error: any) {
      console.error('Error updating delivery charge:', error);
      throw error;
    }
  },

  deleteDeliveryCharge: async (id: string) => {
    try {
      await adminApiRequest(`/api/delivery/charges/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting delivery charge:', error);
      throw error;
    }
  },

  // Dynamic Delivery Rules
  saveDeliveryRule: async (data: any) => {
    try {
      const response = await adminApiRequest('/api/delivery/rules', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.rule;
    } catch (error: any) {
      console.error('Error saving delivery rule:', error);
      throw error;
    }
  },

  deleteDeliveryRule: async (id: string) => {
    try {
      await adminApiRequest(`/api/delivery/rules/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting delivery rule:', error);
      throw error;
    }
  },

  // Tariff Management
  createTariff: async (data: any) => {
    try {
      const response = await adminApiRequest('/api/delivery/tariffs', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
       console.error('Error creating tariff:', error);
       throw error;
    }
  },

  updateTariff: async (id: string, data: any) => {
    try {
        const response = await adminApiRequest(`/api/delivery/tariffs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response;
    } catch (error: any) {
        console.error('Error updating tariff:', error);
        throw error;
    }
  },

  deleteTariff: async (id: string) => {
      try {
          await adminApiRequest(`/api/delivery/tariffs/${id}`, {
              method: 'DELETE'
          });
          return true;
      } catch (error: any) {
          console.error('Error deleting tariff:', error);
          throw error;
      }
  },

  updateStateZone: async (id: string, zone: string) => {
      try {
          const response = await adminApiRequest(`/api/delivery/states/${id}/zone`, {
              method: 'PUT',
              body: JSON.stringify({ zone })
          });
          return response;
      } catch (error: any) {
          console.error('Error updating state zone:', error);
          throw error;
      }
  },

  // Banners Management
  getBanners: async (params?: { type?: string; activeOnly?: boolean }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.type) queryParams.append('type', params.type);
      if (params?.activeOnly) queryParams.append('activeOnly', 'true');
      
      const query = queryParams.toString();
      const response = await adminApiRequest(`/api/banners${query ? `?${query}` : ''}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  },

  createBanner: async (data: any) => {
    try {
      const response = await adminApiRequest('/api/banners', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      console.error('Error creating banner:', error);
      throw error;
    }
  },

  updateBanner: async (id: string, data: any) => {
    try {
      const response = await adminApiRequest(`/api/banners/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      console.error('Error updating banner:', error);
      throw error;
    }
  },

  deleteBanner: async (id: string) => {
    try {
      await adminApiRequest(`/api/banners/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  },
};

