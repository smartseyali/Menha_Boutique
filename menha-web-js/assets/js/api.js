const API_BASE_URL = 'https://menhaapi.smartseyali.app/api';

const MainAPI = {
    async fetchBanners() {
        try {
            const response = await fetch(`${API_BASE_URL}/banners`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching banners:", error);
            return [];
        }
    },

    async fetchCategories() {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return data.categories || data || [];
        } catch (error) {
            console.error("Error fetching categories:", error);
            return [];
        }
    },

    async fetchProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return data.products || data || [];
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    },
    
    // Helper formats
    getProductImage(product) {
        if (product.primary_image) return `https://menhaapi.smartseyali.app${product.primary_image}`;
        if (product.image) return product.image;
        if (product.imageUrl) return product.imageUrl;
        if (product.images && product.images.length > 0) {
            return product.images[0].url || product.images[0];
        }
        return 'https://via.placeholder.com/300x300?text=No+Image'; // fallback
    },

    getProductPrice(product) {
        return product.new_price || product.newPrice || product.price || product.sellingPrice || product.mrp || 0;
    },

    async createOrder(orderData) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to place order');
            return data;
        } catch (error) {
            console.error("Order error:", error);
            throw error;
        }
    },

    async getActiveGateway() {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/active-gateway`);
            if (!response.ok) return null;
            const data = await response.json();
            return data.success ? data.gateway : null;
        } catch (e) {
            console.error(e);
            return null;
        }
    },

    async calculateDeliveryCharge(state, items) {
        try {
            const itemsPayload = items.map(i => ({
                quantity: i.quantity,
                attributeValue: i.product.weight || i.product.unit || '0g'
            }));
            const response = await fetch(`${API_BASE_URL}/delivery/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ state, items: itemsPayload })
            });
            if (!response.ok) return 0;
            const data = await response.json();
            return data.deliveryCharge || 0;
        } catch (e) {
            console.error(e);
            return 0;
        }
    },

    // Authentication
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');
            return data;
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        }
    },

    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Registration failed');
            return data;
        } catch (error) {
            console.error("Registration Error:", error);
            throw error;
        }
    },

    async getUserAddresses() {
        try {
            const token = this.getAuthToken();
            if (!token) return [];
            const response = await fetch(`${API_BASE_URL}/addresses`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) return [];
            const data = await response.json();
            return data.addresses || [];
        } catch (error) {
            console.error("Error fetching addresses:", error);
            return [];
        }
    },

    async getOrders() {
        try {
            const token = this.getAuthToken();
            if (!token) return [];
            const response = await fetch(`${API_BASE_URL}/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) return [];
            const data = await response.json();
            return data.orders || [];
        } catch (error) {
            console.error("Error fetching orders:", error);
            return [];
        }
    },

    // Locations
    async getCountries() {
        try {
            const response = await fetch(`${API_BASE_URL}/locations/countries`);
            if (!response.ok) return [];
            const data = await response.json();
            return data.countries || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async getStates(countryId) {
        try {
            const response = await fetch(`${API_BASE_URL}/locations/states?countryId=${countryId}`);
            if (!response.ok) return [];
            const data = await response.json();
            return data.states || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async getCities(stateId) {
        try {
            const response = await fetch(`${API_BASE_URL}/locations/cities?stateId=${stateId}`);
            if (!response.ok) return [];
            const data = await response.json();
            return data.cities || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    setAuthToken(token, user) {
        const sessionData = {
            token,
            user,
            storedAt: new Date().getTime()
        };
        localStorage.setItem('login_user', JSON.stringify(sessionData));
    },

    getAuthToken() {
        try {
            const sessionData = JSON.parse(localStorage.getItem('login_user'));
            return sessionData ? sessionData.token : null;
        } catch (e) {
            return null;
        }
    },

    getUser() {
        try {
            const sessionData = JSON.parse(localStorage.getItem('login_user'));
            return sessionData ? sessionData.user : null;
        } catch (e) {
            return null;
        }
    },

    logout() {
        localStorage.removeItem('login_user');
        window.location.reload();
    },

    isAuthenticated() {
        return !!this.getAuthToken();
    }
};

const CartManager = {
    getCart() {
        return JSON.parse(localStorage.getItem('mb_cart') || '[]');
    },
    saveCart(cart) {
        localStorage.setItem('mb_cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
    },
    add(product, quantity = 1) {
        const cart = this.getCart();
        const existing = cart.find(item => item.product.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({ product, quantity });
        }
        this.saveCart(cart);
    },
    update(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(i => i.product.id === productId);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                this.remove(productId);
                return;
            }
            this.saveCart(cart);
        }
    },
    remove(productId) {
        let cart = this.getCart();
        cart = cart.filter(i => i.product.id !== productId);
        this.saveCart(cart);
    },
    clear() {
        this.saveCart([]);
    },
    getTotalItems() {
        return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
    },
    getTotalPrice() {
        return this.getCart().reduce((sum, item) => {
            return sum + (MainAPI.getProductPrice(item.product) * item.quantity);
        }, 0);
    }
};

window.MainAPI = MainAPI;
window.CartManager = CartManager;
