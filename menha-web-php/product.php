
<?php
$pageTitle = 'Product Details';
include __DIR__ . '/includes/functions.php';
include __DIR__ . '/includes/header.php';

$id = isset($_GET['id']) ? $_GET['id'] : '';
$product = [];

if ($id) {
    try {
        $res = callApi('/products/' . $id);
        $product = isset($res['product']) ? $res['product'] : (isset($res) ? $res : []);
    } catch (Exception $e) {
        // Silent failure
    }
}

// Fallback if product still empty
if (empty($product) || !is_array($product)) {
    echo '<div class="container section">Product not found</div>';
    include __DIR__ . '/includes/footer.php';
    exit;
}

// Safe Getters
$id = isset($product['id']) ? $product['id'] : (isset($product['_id']) ? $product['_id'] : '');
$name = isset($product['name']) ? $product['name'] : 'Product';
$description = isset($product['description']) ? $product['description'] : '';
$image = getProductImage($product);
$price = getProductPrice($product);
$oldPrice = isset($product['oldPrice']) ? $product['oldPrice'] : null;
$categoryName = isset($product['category']['name']) ? $product['category']['name'] : 'Category';
?>

<div class="product-detail-page section">
    <div class="container">
        <div class="product-layout">
            <div class="product-gallery" style="background:white; border-radius:12px; overflow:hidden;">
                <img src="<?php echo $image; ?>" alt="<?php echo $name; ?>" class="main-image">
            </div>
            
            <div class="product-info-column" style="padding: 1rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span class="product-category" style="color:var(--color-primary); font-weight:600; text-transform:uppercase; letter-spacing:1px; font-size:0.9rem;"><?php echo $categoryName; ?></span>
                    <span style="border: 1px solid var(--color-primary); color: var(--color-primary); padding: 2px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">In Stock</span>
                </div>
                <h1 class="product-title-lg" style="margin-top:0.5rem;"><?php echo $name; ?></h1>
                
                <div class="product-price-box" style="margin: 1.5rem 0;">
                    <span class="current-price">₹<?php echo $price; ?></span>
                    <?php if ($oldPrice): ?>
                        <span class="old-price" style="text-decoration: line-through; color: #999; margin-left: 10px; font-size: 1.2rem;">₹<?php echo $oldPrice; ?></span>
                    <?php endif; ?>
                </div>

                <div class="product-description" style="color:var(--color-text-light); margin-bottom: 2rem;">
                    <?php echo nl2br($description); ?>
                </div>
                
                <!-- Quantity & Actions -->
                <div class="action-buttons" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div style="display:flex; justify-content: space-between; align-items:center; background: var(--color-light-gray); border-radius:12px; padding:10px 20px;">
                        <span style="font-weight: 600; color: var(--color-text);">Quantity</span>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <button onclick="changeQty(-1)" style="border:none;background:none;font-size:1.5rem; cursor:pointer; color: var(--color-primary); width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: 600;">-</button>
                            <span id="qty-val" style="min-width:30px;text-align:center; font-weight:bold; font-size: 1.1rem;">1</span>
                            <button onclick="changeQty(1)" style="border:none;background:none;font-size:1.5rem; cursor:pointer; color: var(--color-primary); width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: 600;">+</button>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="addToCart('<?php echo $id; ?>', parseInt(document.getElementById('qty-val').innerText))" style="border-radius:12px; width: 100%; padding: 1.2rem; font-size: 1.1rem; justify-content: center;">
                        <i data-lucide="shopping-bag" style="margin-right: 8px;"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    function changeQty(delta) {
        const el = document.getElementById('qty-val');
        let val = parseInt(el.innerText) + delta;
        if (val < 1) val = 1;
        el.innerText = val;
    }
    
    function buyNow(id) {
        addToCart(id, parseInt(document.getElementById('qty-val').innerText));
        window.location.href = 'cart.php';
    }
</script>

<?php include __DIR__ . '/includes/footer.php'; ?>
