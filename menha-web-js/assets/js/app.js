document.addEventListener('DOMContentLoaded', async () => {
    // Initialize standard icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Load Data
    try {
        await Promise.all([
            loadBanners(),
            loadCategories(),
            loadProducts()
        ]);
        
        // Re-init icons for dynamic content
        lucide.createIcons();
    } catch (e) {
        console.error("Error initializing app:", e);
    }
});

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if(!badge) return;
    const count = CartManager.getTotalItems();
    badge.innerText = count;
    if (count > 0) {
        badge.style.display = 'flex';
        // Animation
        badge.style.transform = "translate(25%, -25%) scale(1.3)";
        setTimeout(() => {
            badge.style.transform = "translate(25%, -25%) scale(1)";
        }, 200);
    } else {
        badge.style.display = 'none';
    }
}

window.addToCartDirect = function(productStr) {
    const product = JSON.parse(decodeURIComponent(productStr));
    CartManager.add(product, 1);
};

window.addEventListener('cartUpdated', updateCartBadge);
document.addEventListener('DOMContentLoaded', updateCartBadge);

function initAuthUI() {
    if (MainAPI.isAuthenticated()) {
        const userBtn = document.querySelector('a[href="login.html"]');
        if (userBtn) {
            userBtn.title = "Logout";
            userBtn.innerHTML = '<i data-lucide="log-out"></i>';
            userBtn.href = "javascript:void(0)";
            userBtn.onclick = (e) => {
                e.preventDefault();
                MainAPI.logout();
            };
        }
    }
}
document.addEventListener('DOMContentLoaded', initAuthUI);

async function loadBanners() {
    const bannerContainer = document.getElementById('banner-container');
    if (!bannerContainer) return;

    const banners = await MainAPI.fetchBanners();
    if (banners && banners.length > 0) {
        const banner = banners[0];
        const img = banner.imageUrl || banner.image_url || 'https://via.placeholder.com/1200x500';
        bannerContainer.innerHTML = `<img src="${img}" alt="Banner" class="banner-img">`;
    } else {
        bannerContainer.innerHTML = '<div style="padding: 2rem; text-align:center;">Promotional Banner</div>';
    }
}

async function loadCategories() {
    const catContainer = document.getElementById('category-container');
    if (!catContainer) return;

    const categories = await MainAPI.fetchCategories();
    if (categories && categories.length > 0) {
        let html = '';
        const limit = Math.min(categories.length, 10);
        
        for (let i = 0; i < limit; i++) {
            const cat = categories[i];
            const img = cat.image || 'https://via.placeholder.com/100';
            const name = cat.name || 'Category';
            
            html += `
                <a href="categories.html" class="category-item">
                    <div class="cat-img-wrapper">
                        <img src="${img}" alt="${name}">
                    </div>
                    <span>${name}</span>
                </a>
            `;
        }
        catContainer.innerHTML = html;
    } else {
        catContainer.innerHTML = '<p>No categories found.</p>';
    }
}

async function loadProducts() {
    const prodContainer = document.getElementById('product-container');
    if (!prodContainer) return;

    const products = await MainAPI.fetchProducts();
    if (products && products.length > 0) {
        let html = '';
        const limit = Math.min(products.length, 12);
        
        for (let i = 0; i < limit; i++) {
            const prod = products[i];
            const img = MainAPI.getProductImage(prod);
            const name = prod.title || prod.name || 'Product';
            const price = MainAPI.getProductPrice(prod);
            const unit = prod.weight || prod.unit || '1 pc';
            const rating = prod.rating || '0.0';
            
            const id = prod.id || prod._id || '';
            const safeProdStr = encodeURIComponent(JSON.stringify(prod));

            html += `
                <a href="product.html?id=${id}" class="product-card">
                    <div class="prod-img-box">
                        <img src="${img}" alt="${name}">
                        
                        <div class="card-actions">
                            <button class="icon-btn tooltip" onclick="event.preventDefault(); event.stopPropagation(); window.addToCartDirect('${safeProdStr}');" title="Add to Cart">
                                <i data-lucide="plus"></i>
                            </button>
                            <button class="icon-btn tooltip" onclick="event.preventDefault(); event.stopPropagation(); alert('Added to wishlist');" title="Wishlist">
                                <i data-lucide="heart"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="prod-info">
                        <h3 class="prod-title">${name}</h3>
                        
                        <div class="prod-meta">
                            <span>${unit}</span>
                            <div class="rating-pill">
                                <i data-lucide="star"></i> ${rating}
                            </div>
                        </div>
                        
                        <div class="prod-price">₹${price}</div>
                    </div>
                </a>
            `;
        }
        prodContainer.innerHTML = html;
    } else {
        prodContainer.innerHTML = '<p>No products found.</p>';
    }
}
