
<?php
$pageTitle = 'Home';
include 'includes/functions.php';
include 'includes/header.php';

// Fetch Data Server-Side
$banners = callApi('/banners');
$categories = callApi('/categories');
$products = callApi('/products');
$bestsellers = callApi('/products/bestselling'); // Check endpoint

// Normalize Data
$bannersList = is_array($banners) ? $banners : [];
$categoryList = isset($categories['categories']) ? $categories['categories'] : [];
$productList = isset($products['products']) ? $products['products'] : [];
$bestsellerList = isset($bestsellers['products']) ? $bestsellers['products'] : [];
?>

<!-- Banner Section -->
<div class="banner-container">
    <div class="banner-track" id="bannerTrack">
        <?php foreach ($bannersList as $banner): ?>
            <div class="banner-slide">
                <img src="<?php echo $banner['image_url'] ?? $banner['imageUrl'] ?? $banner['image'] ?? ''; ?>" alt="Banner" class="banner-image">
                <div class="banner-overlay">
                    <h2><?php echo $banner['title'] ?? ''; ?></h2>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<!-- Categories -->
<section class="section">
    <div class="container">
        <h2 class="section-title">Shop by Category</h2>
        <div class="category-row">
            <?php foreach ($categoryList as $cat): ?>
                <a href="category.php?id=<?php echo $cat['id']; ?>" class="category-item">
                    <div class="category-image-container">
                        <img src="<?php echo $cat['image'] ?? 'assets/images/placeholder.png'; ?>" alt="<?php echo $cat['name']; ?>" class="category-image">
                    </div>
                    <span class="category-name"><?php echo $cat['name']; ?></span>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- Best Sellers -->
<?php if (!empty($bestsellerList)): ?>
<section class="section bg-light">
    <div class="container">
        <div class="section-header">
            <h2 class="section-title">Best Scripts</h2>
            <a href="products.php?sort=best" class="view-all">View All</a>
        </div>
        <div class="product-grid">
            <?php foreach ($bestsellerList as $product): ?>
                <a href="product.php?id=<?php echo $product['id']; ?>" class="product-card">
                    <div class="product-image-container">
                        <img src="<?php echo $product['image'] ?? ($product['images'][0]['url'] ?? 'assets/images/placeholder.png'); ?>" alt="<?php echo $product['name']; ?>" class="product-image">
                        <button class="add-to-cart-btn" onclick="event.preventDefault(); addToCart('<?php echo $product['id']; ?>', 1)">
                            <i data-lucide="shopping-bag"></i>
                        </button>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title"><?php echo $product['name']; ?></h3>
                        <p class="product-price">₹<?php echo $product['newPrice'] ?? $product['price']; ?></p>
                    </div>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- New Arrivals -->
<section class="section">
    <div class="container">
        <div class="section-header">
            <h2 class="section-title">New Arrivals</h2>
            <a href="products.php" class="view-all">View All</a>
        </div>
        <div class="product-grid">
            <?php foreach ($productList as $product): ?>
                <a href="product.php?id=<?php echo $product['id']; ?>" class="product-card">
                    <div class="product-image-container">
                        <img src="<?php echo $product['image'] ?? ($product['images'][0]['url'] ?? 'assets/images/placeholder.png'); ?>" alt="<?php echo $product['name']; ?>" class="product-image">
                        <button class="add-to-cart-btn" onclick="event.preventDefault(); addToCart('<?php echo $product['id']; ?>', 1)">
                            <i data-lucide="shopping-bag"></i>
                        </button>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title"><?php echo $product['name']; ?></h3>
                        <p class="product-price">₹<?php echo $product['newPrice'] ?? $product['price']; ?></p>
                    </div>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<script>
    // Simple Slider Script
    let currentIndex = 0;
    const slides = document.querySelectorAll('.banner-slide');
    const track = document.getElementById('bannerTrack');
    
    if (slides.length > 1) {
        setInterval(() => {
            currentIndex = (currentIndex + 1) % slides.length;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
        }, 5000);
    }
</script>

<?php include 'includes/footer.php'; ?>
