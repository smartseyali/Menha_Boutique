
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($pageTitle) ? $pageTitle . ' | Menha Boutique' : 'Menha Boutique'; ?></title>
    <!-- Styles -->
    <link rel="stylesheet" href="assets/css/style.css">
    <!-- Font -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Icons placeholder -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- AOS CSS -->
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
</head>
<body>

<header class="header" id="main-header">
    <div class="header-top">
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                
                <!-- Mobile Menu & Brand -->
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <button class="menu-toggle action-btn" onclick="toggleMenu()">
                        <i data-lucide="menu"></i>
                    </button>
                    
                    <a href="index.php" class="brand">
                        <img src="assets/images/logo.png" alt="Menha" class="logo">
                        <span class="brand-text">Menha</span>
                    </a>
                </div>

                <!-- Desktop Search (Hidden on Mobile) -->
                <div class="search-bar-container" style="display: none; flex: 1; margin: 0 2rem; padding: 0;">
                    <form action="search.php" method="GET" class="search-form" style="margin: 0;">
                        <input type="text" name="q" placeholder="Search for products..." class="search-input">
                        <button type="submit" class="search-btn action-btn" style="border:none; padding: 0;">
                            <i data-lucide="search" size="20"></i>
                        </button>
                    </form>
                </div>
                
                <!-- Actions -->
                <div class="header-actions">
                    <button class="action-btn" onclick="toggleSearchMobile()" id="mobile-search-trigger">
                        <i data-lucide="search"></i>
                    </button>
                    <a href="wishlist.php" class="action-btn">
                        <i data-lucide="heart"></i>
                    </a>
                    <a href="cart.php" class="action-btn" style="position: relative;">
                        <i data-lucide="shopping-bag"></i>
                        <span class="badge" id="cart-count" style="display:none;">0</span>
                    </a>
                    <a href="login.php" class="action-btn" id="user-icon">
                        <i data-lucide="user"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Mobile Search Overlay -->
    <div id="mobile-search-bar" style="display: none; padding: 1rem; background: white; border-top: 1px solid #eee;">
        <div class="container">
            <form action="search.php" method="GET" class="search-form" style="width: 100%;">
                <input type="text" name="q" placeholder="Search..." class="search-input">
                <button type="submit" style="background:none; border:none;"><i data-lucide="search"></i></button>
            </form>
        </div>
    </div>
</header>

<!-- Mobile Menu Drawer -->
<div id="mobile-menu-overlay" onclick="toggleMenu()" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1999; backdrop-filter: blur(2px);"></div>
<div id="mobile-menu" style="transform: translateX(-100%); transition: transform 0.3s ease; position:fixed; top:0; left:0; width:80%; max-width: 300px; height:100%; background:white; z-index:2000; padding:2rem; box-shadow: 2px 0 10px rgba(0,0,0,0.1);">
    <div style="display:flex; justify-content:space-between; margin-bottom:2rem; align-items: center;">
        <span style="font-weight:800; font-size:1.5rem; color: var(--color-primary);">Menu</span>
        <button onclick="toggleMenu()" class="action-btn"><i data-lucide="x"></i></button>
    </div>
    <nav style="display:flex; flex-direction:column; gap:1.5rem;">
        <a href="index.php" style="font-size:1.1rem; font-weight: 600;">Home</a>
        <a href="categories.php" style="font-size:1.1rem; font-weight: 600;">Shop All Categories</a>
        <a href="cart.php" style="font-size:1.1rem; font-weight: 600;">My Cart</a>
        <a href="login.php" style="font-size:1.1rem; font-weight: 600;">My Profile</a>
    </nav>
</div>

<script>
    // Header Scroll Effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    function toggleMenu() {
        const menu = document.getElementById('mobile-menu');
        const overlay = document.getElementById('mobile-menu-overlay');
        const isOpen = menu.style.transform === 'translateX(0%)';
        
        menu.style.transform = isOpen ? 'translateX(-100%)' : 'translateX(0%)';
        overlay.style.display = isOpen ? 'none' : 'block';
    }
    
    function toggleSearchMobile() {
        const bar = document.getElementById('mobile-search-bar');
        bar.style.display = bar.style.display === 'none' ? 'block' : 'none';
    }
    
    // Auth Check
    document.addEventListener('DOMContentLoaded', () => {
        const token = localStorage.getItem('auth_token');
        const userBtn = document.getElementById('user-icon');
        const cartCount = document.getElementById('cart-count');
        
        if(token) userBtn.href = "profile.php";

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cart.length > 0) {
            cartCount.innerText = cart.length;
            cartCount.style.display = 'flex';
        }
        
        // Responsive Search Logic
        if (window.innerWidth > 768) {
            document.querySelector('.search-bar-container').style.display = 'block';
            document.getElementById('mobile-search-trigger').style.display = 'none';
        }
        
        lucide.createIcons();
    });
</script>
