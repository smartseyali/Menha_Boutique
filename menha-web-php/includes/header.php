
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($pageTitle) ? $pageTitle . ' | Menha Boutique' : 'Menha Boutique'; ?></title>
    <link rel="stylesheet" href="assets/css/style.css">
    <!-- Font -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- Icons placeholder (using Lucide CDN or simple svg) -->
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>

<header class="header">
    <div class="header-top">
        <div class="container">
            <!-- Mobile Menu Toggle -->
            <button class="menu-toggle" onclick="toggleMenu()">
                <i data-lucide="menu"></i>
            </button>
            
            <a href="index.php" class="brand">
                <img src="assets/images/logo.png" alt="Menha" class="logo">
                <span class="brand-text">Menha Boutique</span>
            </a>

            <div class="header-actions">
                <a href="wishlist.php" class="action-btn">
                    <i data-lucide="heart"></i>
                </a>
                <a href="cart.php" class="action-btn cart-btn">
                    <i data-lucide="shopping-bag"></i>
                    <span class="badge" id="cart-count" style="display:none;">0</span>
                </a>
                <a href="login.php" class="action-btn" id="user-icon">
                    <i data-lucide="user"></i>
                </a>
            </div>
        </div>
    </div>

    <div class="search-bar-container">
       <div class="container">
          <form action="search.php" method="GET" class="search-form">
              <input type="text" name="q" placeholder="Search for products..." class="search-input">
              <button type="submit" class="search-btn">
                  <i data-lucide="search"></i>
              </button>
          </form>
       </div>
    </div>
</header>

<!-- Mobile Menu (Hidden by default) -->
<div id="mobile-menu" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:white; z-index:2000; padding:1rem;">
    <div style="display:flex; justify-content:space-between; margin-bottom:2rem;">
        <span style="font-weight:bold; font-size:1.2rem;">Menu</span>
        <button onclick="toggleMenu()" style="background:none; border:none;"><i data-lucide="x"></i></button>
    </div>
    <nav style="display:flex; flex-direction:column; gap:1rem;">
        <a href="index.php" style="font-size:1.2rem; padding:0.5rem 0; border-bottom:1px solid #eee;">Home</a>
        <a href="categories.php" style="font-size:1.2rem; padding:0.5rem 0; border-bottom:1px solid #eee;">Categories</a>
        <a href="cart.php" style="font-size:1.2rem; padding:0.5rem 0; border-bottom:1px solid #eee;">Cart</a>
        <a href="login.php" style="font-size:1.2rem; padding:0.5rem 0; border-bottom:1px solid #eee;">Profile</a>
    </nav>
</div>

<script>
    function toggleMenu() {
        const menu = document.getElementById('mobile-menu');
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
    
    // Auth Check Implementation (Client-Side)
    document.addEventListener('DOMContentLoaded', () => {
        const token = localStorage.getItem('auth_token');
        const userBtn = document.getElementById('user-icon');
        const cartCount = document.getElementById('cart-count');
        
        if(token) {
           userBtn.href = "profile.php";
           // Ideally fetch cart count here
           const cart = JSON.parse(localStorage.getItem('cart') || '[]');
           if (cart.length > 0) {
               cartCount.innerText = cart.length;
               cartCount.style.display = 'flex';
           }
        } else {
           // Guest cart
           const cart = JSON.parse(localStorage.getItem('cart') || '[]');
           if (cart.length > 0) {
               cartCount.innerText = cart.length;
               cartCount.style.display = 'flex';
           }
        }
        
        lucide.createIcons();
    });
</script>
