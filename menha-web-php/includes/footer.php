
<!-- AOS JS -->
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
<script>
  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 50
  });
</script>

<footer class="footer">
    <div class="container">
        <div class="footer-content" style="display:flex; flex-wrap:wrap; justify-content:space-between; gap:2rem;">
            <div class="footer-section" style="flex:1; min-width:250px;">
                <h4>About Menha</h4>
                <p style="color:rgba(255,255,255,0.8);">Premium fashion for the modern lifestyle. Quality, elegance, and style in every piece.</p>
                <div style="margin-top:1rem; display:flex; gap:1rem;">
                    <a href="#"><i data-lucide="facebook"></i></a>
                    <a href="#"><i data-lucide="instagram"></i></a>
                    <a href="#"><i data-lucide="twitter"></i></a>
                </div>
            </div>
            <div class="footer-section" style="flex:1; min-width:250px;">
                <h4>Quick Links</h4>
                <ul style="display:flex; flex-direction:column; gap:0.5rem;">
                    <li><a href="index.php">Home</a></li>
                    <li><a href="products.php">Shop All</a></li>
                    <li><a href="cart.php">My Cart</a></li>
                    <li><a href="login.php">Login / Register</a></li>
                </ul>
            </div>
            <div class="footer-section" style="flex:1; min-width:250px;">
                <h4>Contact Us</h4>
                <p style="margin-bottom:0.5rem;"><i data-lucide="mail" style="vertical-align:middle; margin-right:5px;"></i> support@menha.com</p>
                <p><i data-lucide="phone" style="vertical-align:middle; margin-right:5px;"></i> +91 98765 43210</p>
            </div>
        </div>
        <div class="footer-bottom" style="text-align:center; margin-top:3rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.1);">
            <p>&copy; <?php echo date('Y'); ?> Menha Boutique. All rights reserved.</p>
        </div>
    </div>
</footer>

<!-- JS -->
<script src="assets/js/main.js"></script>
<script src="assets/js/cart_actions.js"></script>
</body>
</html>
