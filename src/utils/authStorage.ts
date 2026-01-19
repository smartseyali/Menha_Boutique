// Secure token storage utility
// Uses sessionStorage instead of localStorage for better security
// sessionStorage is cleared when browser tab is closed

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export const authStorage = {
  // Store authentication token
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  },

  // Get authentication token
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(AUTH_TOKEN_KEY);
    }
    return null;
  },

  // Remove authentication token
  removeToken: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(USER_DATA_KEY);
    }
  },

  // Store user data (without password or sensitive info)
  setUserData: (userData: any) => {
    if (typeof window !== 'undefined') {
      // Only store non-sensitive user data
      const safeUserData = {
        id: userData.id || userData.uid,
        email: userData.email,
        phoneNumber: userData.phone_number || userData.phoneNumber,
        firstName: userData.first_name || userData.firstName,
        lastName: userData.last_name || userData.lastName,
        role: userData.role,
        isActive: userData.is_active || userData.isActive,
        // Additional profile fields
        address: userData.address,
        city: userData.city,
        postCode: userData.postCode || userData.post_code,
        country: userData.country,
        state: userData.state,
        profilePhoto: userData.profilePhoto || userData.profile_photo,
        description: userData.description,
        shippingAddress: userData.shippingAddress || userData.shipping_address,
        uid: userData.uid || userData.id, // For backward compatibility
      };
      sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(safeUserData));
    }
  },

  // Get user data
  getUserData: (): any | null => {
    if (typeof window !== 'undefined') {
      const userData = sessionStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return authStorage.getToken() !== null;
  },

  // Clear all auth data
  clear: () => {
    authStorage.removeToken();
  },
};

