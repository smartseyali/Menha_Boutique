
<?php
$pageTitle = 'Home';
include __DIR__ . '/includes/functions.php';
include __DIR__ . '/includes/header.php';

// Fetch Data Server-Side with Error Handling
$banners = callApi('/banners');
$categories = callApi('/categories');
$products = callApi('/products');
$bestsellers = callApi('/products/bestselling');

// Safe Initialization
$bannersList = (isset($banners) && is_array($banners)) ? $banners : [];
// Handle array wrappers
if (isset($categories['categories'])) $categoryList = $categories['categories'];
elseif (is_array($categories)) $categoryList = $categories;
else $categoryList = [];

if (isset($products['products'])) $productList = $products['products'];
elseif (is_array($products)) $productList = $products;
else $productList = [];

if (isset($bestsellers['products'])) $bestsellerList = $bestsellers['products'];
elseif (is_array($bestsellers)) $bestsellerList = $bestsellers;
else $bestsellerList = [];
?>

<!-- Banner Section -->
<div class="banner-container" data-aos="fade-in">
    <div class="banner-track" id="bannerTrack">
        <?php foreach ($bannersList as $banner): 
            $img = isset($banner['image_url']) ? $banner['image_url'] : (isset($banner['imageUrl']) ? $banner['imageUrl'] : 'assets/images/logo.png');
            $title = isset($banner['title']) ? $banner['title'] : '';
            $link = isset($banner['link']) ? $banner['link'] : '#';
        ?>
            <div class="banner-slide">
                <img src="<?php echo $img; ?>" alt="Banner" class="banner-image">
                <div class="banner-overlay">
                    <h2><?php echo $title; ?></h2>
                    <?php if ($link !== '#'): ?>
                        <a href="<?php echo $link; ?>" class="btn btn-primary">Shop Now</a>
                    <?php endif; ?>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<!-- Categories -->
<section class="section" data-aos="fade-up">
    <div class="container">
        <h2 class="section-title">Shop by Category</h2>
        <div class="category-row">
            <?php foreach ($categoryList as $cat): 
                $img = isset($cat['image']) ? $cat['image'] : 'assets/images/logo.png';
                $name = isset($cat['name']) ? $cat['name'] : 'Category';
                $id = isset($cat['id']) ? $cat['id'] : '#';
            ?>
                <a href="category.php?id=<?php echo $id; ?>" class="category-item">
                    <div class="category-image-container">
                        <img src="<?php echo $img; ?>" alt="<?php echo $name; ?>" class="category-image">
                    </div>
                    <span class="category-name"><?php echo $name; ?></span>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- Best Sellers -->
<?php if (!empty($bestsellerList)): ?>
<section class="section bg-white" data-aos="fade-up">
    <div class="container">
        <div class="section-header">
            <h2 class="section-title">Best Sellers</h2>
            <a href="products.php?sort=best" class="btn btn-outline" style="border-radius:20px; font-size: 0.9rem;">View All</a>
        </div>
        <div class="product-grid">
            <?php foreach (array_slice($bestsellerList, 0, 4) as $index => $product): 
                $id = isset($product['id']) ? $product['id'] : (isset($product['_id']) ? $product['_id'] : '');
                $name = isset($product['name']) ? $product['name'] : 'Product';
                $price = getProductPrice($product);
                $image = getProductImage($product);
                $rating = isset($product['rating']) ? $product['rating'] : '0.0';
                $unit = isset($product['unit']) ? $product['unit'] : '1 pc';
            ?>
                <a href="product.php?id=<?php echo $id; ?>" class="product-card" data-aos="fade-up" data-aos-delay="<?php echo $index * 100; ?>">
                    <div class="product-image-container">
                        <img src="<?php echo $image; ?>" alt="<?php echo $name; ?>" class="product-image">
                        <button class="add-to-cart-btn" onclick="event.preventDefault(); addToCart('<?php echo $id; ?>', 1)" aria-label="Add to Cart">
                            <i data-lucide="plus"></i>
                        </button>
                        <button class="wishlist-btn" onclick="event.preventDefault(); addToWishlist('<?php echo $id; ?>')" aria-label="Add to Wishlist">
                            <i data-lucide="heart"></i>
                        </button>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title"><?php echo $name; ?></h3>
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="font-size: 0.85rem; color: var(--color-text-light);"><?php echo $unit; ?></span>
                            <span style="background: var(--color-light-gray); padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; display: flex; align-items: center; gap: 4px; font-weight: 500;">
                                <i data-lucide="star" style="width: 12px; height: 12px; color: var(--color-accent); fill: var(--color-accent);"></i> <?php echo $rating; ?>
                            </span>
                        </div>
                        <p class="product-price">₹<?php echo $price; ?></p>
                    </div>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- New Arrivals -->
<section class="section" data-aos="fade-up">
    <div class="container">
        <div class="section-header">
            <h2 class="section-title">New Arrivals</h2>
            <a href="products.php" class="btn btn-outline" style="border-radius:20px; font-size: 0.9rem;">View All</a>
        </div>
        <div class="product-grid">
            <?php foreach (array_slice($productList, 0, 8) as $index => $product): 
                $id = isset($product['id']) ? $product['id'] : (isset($product['_id']) ? $product['_id'] : '');
                $name = isset($product['name']) ? $product['name'] : 'Product';
                $price = getProductPrice($product);
                $image = getProductImage($product);
                $rating = isset($product['rating']) ? $product['rating'] : '0.0';
                $unit = isset($product['unit']) ? $product['unit'] : '1 pc';
            ?>
                <a href="product.php?id=<?php echo $id; ?>" class="product-card" data-aos="fade-up" data-aos-delay="<?php echo $index * 50; ?>">
                    <div class="product-image-container">
                        <img src="<?php echo $image; ?>" alt="<?php echo $name; ?>" class="product-image">
                        <button class="add-to-cart-btn" onclick="event.preventDefault(); addToCart('<?php echo $id; ?>', 1)" aria-label="Add to Cart">
                            <i data-lucide="plus"></i>
                        </button>
                        <button class="wishlist-btn" onclick="event.preventDefault(); addToWishlist('<?php echo $id; ?>')" aria-label="Add to Wishlist">
                            <i data-lucide="heart"></i>
                        </button>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title"><?php echo $name; ?></h3>
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="font-size: 0.85rem; color: var(--color-text-light);"><?php echo $unit; ?></span>
                            <span style="background: var(--color-light-gray); padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; display: flex; align-items: center; gap: 4px; font-weight: 500;">
                                <i data-lucide="star" style="width: 12px; height: 12px; color: var(--color-accent); fill: var(--color-accent);"></i> <?php echo $rating; ?>
                            </span>
                        </div>
                        <p class="product-price">₹<?php echo $price; ?></p>
                    </div>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<script>
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

<?php include __DIR__ . '/includes/footer.php'; ?>
