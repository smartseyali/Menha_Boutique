
<?php
$pageTitle = 'Shopping Cart';
include 'includes/header.php';
?>

<div class="cart-page section">
    <div class="container">
        <h1>Shopping Cart <span id="cart-item-count" style="font-size:1rem;color:#777;"></span></h1>
        
        <div id="cart-loading">Loading cart...</div>
        
        <div id="cart-content" style="display:none;" class="cart-layout">
            <div id="cart-items-container" class="cart-items">
                <!-- Items injected here by JS -->
            </div>
            
            <div class="cart-summary bg-light" style="padding:1.5rem; border-radius:8px; height:fit-content;">
                <h3>Order Summary</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:1rem;">
                    <span>Subtotal</span>
                    <span id="cart-total">₹0</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:1rem;">
                    <span>Shipping</span>
                    <span>Free</span>
                </div>
                <hr>
                <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:1.2rem; margin-top:1rem;">
                    <span>Total</span>
                    <span id="cart-final-total">₹0</span>
                </div>
                
                <button class="btn btn-primary" style="width:100%; margin-top:1.5rem;" onclick="alert('Checkout not implemented')">
                    Proceed to Checkout
                </button>
            </div>
        </div>
        
        <div id="empty-cart-msg" style="display:none; text-align:center; padding:3rem;">
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <a href="index.php" class="btn btn-primary" style="display:inline-block; margin-top:1rem;">Start Shopping</a>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', async () => {
        const token = localStorage.getItem('auth_token');
        const loading = document.getElementById('cart-loading');
        const content = document.getElementById('cart-content');
        const emptyMsg = document.getElementById('empty-cart-msg');
        const itemsContainer = document.getElementById('cart-items-container');
        
        let cartItems = [];
        
        // Helper to format price
        const formatPrice = (p) => '₹' + p;

        if (token) {
            // Fetch from API
            try {
                // Adjust endpoint if needed
                const res = await fetch('https://menhaapi.smartseyali.app/api/cart', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    cartItems = data.items || [];
                    // API returns items with 'product' object populated usually
                }
            } catch (e) {
                console.error("Cart fetch error", e);
            }
        } else {
            // Guest Cart from LocalStorage
            // In a real app we'd need to fetch product info for these IDs
            // For now, let's just show basic info or try to fetch details
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            // We need to fetch product details for each item to show name/price/image
            // This is slow if we do it one by one. But it's what we have without a bulk API.
            if (localCart.length > 0) {
               loading.innerText = 'Fetching product details...';
               
               // Use Promise.all to fetch details
               const detailsPromises = localCart.map(async (item) => {
                   try {
                       const res = await fetch(`https://menhaapi.smartseyali.app/api/products/${item.productId}`);
                       const data = await res.json();
                       const prod = data.product || data;
                       return {
                           ...item,
                           product: prod
                       };
                   } catch (e) {
                       return { ...item, product: { name: 'Product ' + item.productId, price: 0 }};
                   }
               });
               
               cartItems = await Promise.all(detailsPromises);
            }
        }
        
        loading.style.display = 'none';
        
        if (cartItems.length === 0) {
            emptyMsg.style.display = 'block';
            return;
        }
        
        content.style.display = 'grid';
        content.classList.add('product-layout'); // Reuse grid layout or use flex
        
        let total = 0;
        let html = '';
        
        cartItems.forEach(item => {
            const product = item.product || {};
            const price = product.newPrice || product.price || 0;
            const image = product.image || (product.images && product.images[0]?.url) || 'assets/images/placeholder.png';
            const qty = item.quantity;
            const itemTotal = price * qty;
            
            total += itemTotal;
            
            html += `
            <div class="cart-item" style="display:flex; gap:1.5rem; margin-bottom:1.5rem; padding:1rem; border:1px solid #eee; border-radius:8px;">
                <div style="width:80px; height:80px;">
                    <img src="${image}" style="width:100%; height:100%; object-fit:cover; border-radius:4px;" alt="${product.name}">
                </div>
                <div style="flex:1;">
                    <h4 style="margin:0 0 0.5rem 0;">${product.name}</h4>
                    <p style="margin:0; color:#666;">${formatPrice(price)}</p>
                    
                    <div style="display:flex; align-items:center; gap:10px; margin-top:10px;">
                         <button style="padding:2px 8px;" onclick="updateCartItem('${item.id || item.productId}', -1, ${!!token})">-</button>
                         <span>${qty}</span>
                         <button style="padding:2px 8px;" onclick="updateCartItem('${item.id || item.productId}', 1, ${!!token})">+</button>
                         <button style="margin-left:auto; color:red; background:none; border:none;" onclick="removeCartItem('${item.id || item.productId}', ${!!token})">
                            <i data-lucide="trash-2"></i>
                         </button>
                    </div>
                </div>
                <div style="font-weight:bold;">
                    ${formatPrice(itemTotal)}
                </div>
            </div>`;
        });
        
        itemsContainer.innerHTML = html;
        document.getElementById('cart-total').innerText = formatPrice(total);
        document.getElementById('cart-final-total').innerText = formatPrice(total);
        document.getElementById('cart-item-count').innerText = `(${cartItems.length} items)`;
        
        lucide.createIcons();
    });
    
    // Placeholder actions
    function updateCartItem(id, delta, isAuth) {
        // Implement complex update logic (API call or LocalStorage update then reload)
        alert('Update logic needs implementation');
    }
    
    function removeCartItem(id, isAuth) {
        // Implement remove logic
        alert('Remove logic needs implementation');
    }
</script>

<?php include 'includes/footer.php'; ?>
