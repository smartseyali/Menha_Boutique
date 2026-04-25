import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://nmvglqfqjfhiolreascc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tdmdscWZxamZoaW9scmVhc2NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3OTA5NzUsImV4cCI6MjA5MTM2Njk3NX0.zzVYmqcsXdi-3ITdWKm-QHiuUwcvBrhX2txv7dZnkb0';

const api = axios.create({
  baseURL: `${SUPABASE_URL}/rest/v1`,
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Helper to set auth token globally for the axios instance
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    api.defaults.headers.common['Authorization'] = `Bearer ${SUPABASE_KEY}`;
  }
};

// Replicating web app's MainAPI logic for Mobile
export const MainAPI = {
    async fetchBanners() {
        try {
            const res = await api.get('/banners?select=*&is_active=eq.true&order=sequence.asc');
            return res.data;
        } catch (error) {
            console.error("Error fetching banners:", error);
            return [];
        }
    },

    async fetchCategories() {
        try {
            const res = await api.get('/categories?select=*&order=sequence.asc');
            return res.data;
        } catch (error) {
            console.error("Error fetching categories:", error);
            return [];
        }
    },

    async fetchProducts() {
        try {
            const res = await api.get('/products?select=*,product_attributes(*)&order=sequence.asc');
            return res.data;
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    },

    async fetchProductById(id: string) {
        try {
            const res = await api.get(`/products?select=*,product_attributes(*)&id=eq.${id}`);
            const product = res.data.length ? res.data[0] : null;
            if (product) {
                const [images, reviews] = await Promise.all([
                    this.fetchProductImages(id),
                    this.fetchReviews(id)
                ]);
                product.additional_images = images;
                product.reviews = reviews;
            }
            return product;
        } catch (error) {
            console.error("Error fetching product by ID:", error);
            return null;
        }
    },

    async fetchProductImages(productId: string) {
        try {
            const res = await api.get(`/product_images?select=*&product_id=eq.${productId}&order=display_order.asc`);
            return res.data;
        } catch (error) {
            console.error("Error fetching product images:", error);
            return [];
        }
    },

    async fetchReviews(productId: string) {
        try {
            const res = await api.get(`/product_reviews?select=*,users(first_name,last_name)&product_id=eq.${productId}&order=created_at.desc`);
            return res.data;
        } catch (error) {
            console.error("Error fetching reviews:", error);
            return [];
        }
    },

    async login(identifier: string, password: any) {
        try {
            // Identifier can be email or phone
            const query = `or=(email.eq.${identifier},phone_number.eq.${identifier})`;
            const res = await api.get(`/users?select=*&${query}`);
            if (!res.data.length) throw new Error('User not found');
            const user = res.data[0];
            if (user.password_hash !== password) throw new Error('Invalid password');
            
            const token = 'mock-jwt-token-' + user.id;
            await AsyncStorage.setItem('auth_token', token);
            await AsyncStorage.setItem('user_info', JSON.stringify(user));
            setAuthToken(token);
            return { user, token };
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        }
    },

    async register(userData: any) {
        try {
            const res = await api.post('/users', {
                email: userData.email,
                password_hash: userData.password,
                first_name: userData.firstName,
                last_name: userData.lastName,
                phone_number: userData.phoneNumber,
                role: 'customer'
            }, { headers: { 'Prefer': 'return=representation' } });
            
            const user = res.data[0];
            const token = 'mock-jwt-token-' + user.id;
            await AsyncStorage.setItem('auth_token', token);
            await AsyncStorage.setItem('user_info', JSON.stringify(user));
            setAuthToken(token);
            return { user, token };
        } catch (error) {
            console.error("Registration Error:", error);
            throw error;
        }
    },

    async getCountries() {
        try {
            const res = await api.get('/countries?select=*&order=name.asc');
            return res.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async getStates(countryId: string) {
        try {
            const res = await api.get(`/states?select=*&country_id=eq.${countryId}&order=name.asc`);
            return res.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async getCities(stateId: string) {
        try {
            const res = await api.get(`/cities?select=*&state_id=eq.${stateId}&order=name.asc`);
            return res.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async getAddresses() {
        try {
            const userJson = await AsyncStorage.getItem('user_info');
            if (!userJson) return [];
            const user = JSON.parse(userJson);
            const res = await api.get(`/addresses?select=*&user_id=eq.${user.id}`);
            return res.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async saveAddress(addr: any) {
        try {
            const userJson = await AsyncStorage.getItem('user_info');
            if (!userJson) throw new Error('Not logged in');
            const user = JSON.parse(userJson);
            
            const data = {
                user_id: user.id,
                first_name: addr.firstName || addr.first_name,
                last_name: addr.lastName || addr.last_name,
                address_line1: addr.addressLine || addr.address_line1,
                city: addr.city,
                state: addr.state,
                zip_code: addr.postalCode || addr.zip_code,
                country: addr.country || 'India',
                phone_number: addr.phoneNumber || user.phone_number,
                is_default: addr.isDefault || false,
                updated_at: new Date().toISOString()
            };

            const res = await api.post('/addresses', data, { headers: { 'Prefer': 'return=representation' } });
            return res.data[0];
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    async createOrder(orderData: any) {
        try {
            const userJson = await AsyncStorage.getItem('user_info');
            const user = userJson ? JSON.parse(userJson) : null;
            
            const orderPayload = {
                user_id: user ? user.id : null,
                order_number: 'ORD-' + Math.floor(Math.random() * 1000000), // Should ideally come from sequence but simple for now
                email: orderData.email || user?.email,
                total_price: orderData.total,
                status: 'pending',
                payment_status: 'unpaid',
                payment_method: orderData.paymentMethod,
                delivery_charge: 0,
                address_id: orderData.shippingAddressId,
                updated_at: new Date().toISOString()
            };

            const res = await api.post('/orders', orderPayload, { headers: { 'Prefer': 'return=representation' } });
            const newOrder = res.data[0];

            // Insert items
            for (const item of orderData.items) {
                await api.post('/order_items', {
                    order_id: newOrder.id,
                    product_id: item.productId,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total_price: item.total
                });
            }

            return newOrder;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    async getOrders() {
        try {
            const userJson = await AsyncStorage.getItem('user_info');
            if (!userJson) return [];
            const user = JSON.parse(userJson);
            const res = await api.get(`/orders?select=*,order_items(*,products(*)),addresses(*)&user_id=eq.${user.id}&order=created_at.desc`);
            return res.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async submitReview(reviewData: any) {
        try {
            const userJson = await AsyncStorage.getItem('user_info');
            if (!userJson) throw new Error('Not logged in');
            const user = JSON.parse(userJson);

            const payload = {
                product_id: reviewData.product_id,
                user_id: user.id,
                rating: parseInt(reviewData.rating),
                comment: reviewData.comment,
                updated_at: new Date().toISOString()
            };

            const res = await api.post('/product_reviews', payload, { headers: { 'Prefer': 'return=representation' } });
            return res.data[0];
        } catch (error) {
            console.error("Error submitting review:", error);
            throw error;
        }
    }
};

export default api;
