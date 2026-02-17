
const API_URL = 'https://menhaapi.smartseyali.app/api';

// Auth State Helper
function getToken() {
    return localStorage.getItem('auth_token');
}

function isLoggedIn() {
    return !!getToken();
}

// Cart Helper (Guest + Auth)
async function addToCart(productId, quantity = 1) {
    if (isLoggedIn()) {
        try {
            const res = await fetch(`${API_URL}/cart`, {
                method: 'POST',
                headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ productId, quantity })
            });
            if (res.ok) {
                alert('Added to cart!');
                // Update badge
            } else {
                alert('Failed to add to cart');
            }
        } catch (e) {
            console.error(e);
        }
    } else {
        // Guest Cart
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find(i => i.productId === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({ productId, quantity });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Added to cart (Guest)!');
        updateBadge(cart.length);
    }
}

function updateBadge(count) {
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.innerText = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if(cart.length > 0) updateBadge(cart.length);
});
