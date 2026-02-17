
<?php
$pageTitle = 'Login';
include 'includes/header.php';
?>

<div class="auth-container">
    <div class="auth-card">
        <h2 class="text-center">Welcome Back!</h2>
        <form id="login-form" class="auth-form">
            <div id="error-message" class="alert alert-danger" style="display:none; color:red; text-align:center;"></div>
            
            <div class="form-group mb-3">
                <label>Email or Phone Number</label>
                <input type="text" id="identifier" class="form-control" placeholder="Enter your email or phone" required>
            </div>

            <div class="form-group mb-3">
                <label>Password</label>
                <input type="password" id="password" class="form-control" placeholder="Enter your password" required>
            </div>

            <button type="submit" class="btn btn-primary block-btn">Sign In</button>
            
            <p class="text-center mt-3">
                Don't have an account? <a href="signup.php">Sign Up</a>
            </p>
        </form>
    </div>
</div>

<script>
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = document.getElementById('identifier').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error-message');
        
        try {
            const isEmail = identifier.includes('@');
            const payload = {
                password,
                ...(isEmail ? { email: identifier } : { phoneNumber: identifier })
            };
            
            const res = await fetch('https://menhaapi.smartseyali.app/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_info', JSON.stringify(data.user));
                window.location.href = 'index.php';
            } else {
                errorDiv.innerText = data.message || 'Login failed';
                errorDiv.style.display = 'block';
            }
        } catch (err) {
            console.error(err);
            errorDiv.innerText = 'Something went wrong';
            errorDiv.style.display = 'block';
        }
    });
</script>

<?php include 'includes/footer.php'; ?>
