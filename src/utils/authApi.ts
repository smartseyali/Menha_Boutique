// Auth API service utility for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pattikadai.com';

// Generic API request function
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  // Normalize headers to a plain object so we can add Authorization safely
  const headersInit: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Add token if available
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('auth_token');
    if (token) {
      headersInit['Authorization'] = `Bearer ${token}`;
    }
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
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  } catch (error: any) {
    console.error(`Auth API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Auth API
export const authApi = {
  login: async (phoneNumber: string, password: string) => {
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ 
          phoneNumber,
          password 
        }),
      });
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await apiRequest('/api/auth/me');
      return response.user;
    } catch (error: any) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  getUserOrders: async () => {
    try {
      const response = await apiRequest('/api/orders');
      return response.orders;
    } catch (error: any) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },
};

