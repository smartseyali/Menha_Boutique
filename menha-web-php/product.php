
<?php
$pageTitle = 'Product Details';
include 'includes/functions.php';
include 'includes/header.php';

$id = isset($_GET['id']) ? $_GET['id'] : '';
$product = [];

if ($id) {
    try {
        $res = callApi('/products/' . $id);
        $product = $res['product'] ?? $res ?? [];
    } catch (Exception $e) {
        // Handle Error
    }
}

if (empty($product)) {
    echo '<div class="container section">Product not found</div>';
    include 'includes/footer.php';
    exit;
}

$image = $product['image'] ?? ($product['images'][0]['url'] ?? 'assets/images/placeholder.png');
$price = $product['newPrice'] ?? $product['price'];
$oldPrice = $product['oldPrice'] ?? null;
?>

<div class="product-detail-page section">
    <div class="container">
        <div class="product-layout">
            <div class="product-gallery">
                <img src="<?php echo $image; ?>" alt="<?php echo $product['name']; ?>" class="main-image">
            </div>
            
            <div class="product-info-column">
                <span class="product-category"><?php echo $product['category']['name'] ?? 'Category'; ?></span>
                <h1 class="product-title-lg"><?php echo $product['name']; ?></h1>
                
                <div class="product-price-box">
                    <span class="current-price">₹<?php echo $price; ?></span>
                    <?php if ($oldPrice): ?>
                        <span class="old-price" style="text-decoration: line-through; color: #999; margin-left: 10px;">₹<?php echo $oldPrice; ?></span>
                    <?php endif; ?>
                </div>

                <p class="product-description"><?php echo $product['description']; ?></p>
                
                <!-- Quantity & Actions -->
                <div class="action-buttons">
                    <div style="display:flex; gap:10px; align-items:center; border:1px solid #ccc; border-radius:4px; padding:5px;">
                        <button onclick="changeQty(-1)" style="border:none;background:none;font-size:1.2rem;">-</button>
                        <span id="qty-val" style="min-width:20px;text-align:center;">1</span>
                        <button onclick="changeQty(1)" style="border:none;background:none;font-size:1.2rem;">+</button>
                    </div>
                    <button class="btn btn-outline" onclick="addToCart('<?php echo $product['id']; ?>', parseInt(document.getElementById('qty-val').innerText))">
                        <i data-lucide="shopping-bag"></i> Add to Cart
                    </button>
                    <button class="btn btn-primary" onclick="buyNow('<?php echo $product['id']; ?>')">
                        Buy Now
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

<?php include 'includes/footer.php'; ?>
