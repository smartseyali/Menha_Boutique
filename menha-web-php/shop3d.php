
<?php
$pageTitle = '3D Supermarket';
include __DIR__ . '/includes/functions.php';

// Fetch all products
$products = callApi('/products');
$prodList = [];
if (isset($products['products'])) $prodList = $products['products'];
elseif (is_array($products)) $prodList = $products;

// Pass safe data to JS
$jsProducts = [];
foreach ($prodList as $p) {
    $img = getProductImage($p);
    // Use proxy for images to avoid CORS in WebGL
    $proxyImg = 'image_proxy.php?url=' . urlencode($img);
    
    $jsProducts[] = [
        'id' => isset($p['id']) ? $p['id'] : (isset($p['_id']) ? $p['_id'] : ''),
        'name' => isset($p['name']) ? $p['name'] : 'Product',
        'price' => getProductPrice($p),
        'image' => $proxyImg,
        'cat' => isset($p['category']['name']) ? $p['category']['name'] : 'Item'
    ];
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Supermarket | Menha Boutique</title>
    <!-- Styles -->
    <link rel="stylesheet" href="assets/css/style.css">
    <!-- Font -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body, html { margin: 0; padding: 0; overflow: hidden; height: 100%; width: 100%; font-family: 'Inter', sans-serif; }
        #canvas-container { width: 100%; height: 100vh; display: block; }
        
        #ui-overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;
            display: flex; flex-direction: column; justify-content: space-between;
        }
        
        #hud-top {
            padding: 20px;
            display: flex; justify-content: space-between; align-items: center;
            background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent);
            pointer-events: auto;
        }
        
        #crosshair {
            position: absolute; top: 50%; left: 50%; width: 10px; height: 10px;
            background: white; border-radius: 50%; transform: translate(-50%, -50%);
            border: 2px solid rgba(0,0,0,0.5); z-index: 10;
        }
        
        #instruction-box {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            text-align: center; background: rgba(0,0,0,0.8); color: white; padding: 20px;
            border-radius: 10px; pointer-events: auto; cursor: pointer;
            z-index: 20;
        }
        
        #hover-info {
            position: absolute; bottom: 100px; left: 50%; transform: translateX(-50%);
            background: rgba(255,255,255,0.95); padding: 15px 25px; border-radius: 30px;
            font-weight: bold; color: #333; box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            opacity: 0; transition: opacity 0.2s; pointer-events: none;
            display: flex; align-items: center; gap: 10px;
        }

        #cart-hud {
            background: rgba(255,255,255,0.2); backdrop-filter: blur(5px);
            padding: 10px 20px; border-radius: 30px; color: white; font-weight: bold;
            display: flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,0.3);
            pointer-events: auto; cursor: pointer;
        }
    </style>
</head>
<body>

<!-- Setup Data -->
<script>
    const serverProducts = <?php echo json_encode($jsProducts); ?>;
</script>

<!-- 3D Viewport -->
<div id="canvas-container"></div>

<!-- HUD -->
<div id="crosshair"></div>
<div id="ui-overlay">
    <div id="hud-top">
        <a href="index.php" style="color:white; text-decoration:none; display:flex; align-items:center; gap:5px;">
            <i data-lucide="arrow-left"></i> Exit Market
        </a>
        <div id="cart-hud" onclick="window.location.href='cart.php'">
            <i data-lucide="shopping-bag"></i> <span id="cart-count">0</span> Items
        </div>
    </div>
    
    <div id="hover-info">
        <i data-lucide="package"></i> <span id="hover-text">Product Name</span>
        <span style="background:var(--color-primary); color:white; padding:2px 8px; border-radius:10px; margin-left:5px;" id="hover-price">$0</span>
        <span style="font-size:0.8rem; color:#666;">(Click to Add)</span>
    </div>
</div>

<div id="instruction-box">
    <h2>Welcome to 3D Market</h2>
    <p>Use <b>W, A, S, D</b> to Walk</p>
    <p>Move <b>Mouse</b> to Look</p>
    <p><b>Click</b> a Product to Add to Cart</p>
    <br>
    <button class="btn btn-primary" id="start-btn">Click to Start Shopping</button>
</div>

<!-- Three.js Libraries -->
<script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
<script src="https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js" type="module"></script>

<!-- Market Logic -->
<script type="module">
    import { PointerLockControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js';

    // State
    let camera, scene, renderer, controls;
    let productsMeshes = [];
    const objects = [];
    let raycaster;
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    let canJump = false;
    let prevTime = performance.now();
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    
    // Auth & Cart Helper
    const token = localStorage.getItem('auth_token');
    
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        document.getElementById('cart-count').innerText = cart.length;
    }

    async function addToCart3D(prodId) {
        // Simple Guest/Auth cart logic reused
        if (token) {
             // API Add
             try {
                const res = await fetch('https://menhaapi.smartseyali.app/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ productId: prodId, quantity: 1 })
                });
                if(res.ok) {
                    alert('Added to Cart!'); 
                    // ideally create a toast in 3D
                }
             } catch(e) {}
        } else {
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existing = cart.find(i => i.productId === prodId);
            if (existing) existing.quantity++;
            else cart.push({ productId: prodId, quantity: 1 });
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
        }
        
        // Visual Feedback
        const hoverInfo = document.getElementById('hover-info');
        hoverInfo.style.background = '#4caf50';
        hoverInfo.style.color = 'white';
        setTimeout(() => {
            hoverInfo.style.background = 'rgba(255,255,255,0.95)';
            hoverInfo.style.color = '#333';
        }, 500);
    }

    init();
    animate();

    function init() {
        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        scene.fog = new THREE.Fog(0xf0f0f0, 10, 50);

        // Camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.y = 1.6; // Eye height

        // Light
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
        scene.add(hemiLight);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(10, 20, 10);
        scene.add(dirLight);

        // Controls
        controls = new PointerLockControls(camera, document.body);

        const blocker = document.getElementById('instruction-box');
        const startBtn = document.getElementById('start-btn');

        startBtn.addEventListener('click', function () {
            controls.lock();
        });

        controls.addEventListener('lock', function () {
            blocker.style.display = 'none';
        });

        controls.addEventListener('unlock', function () {
            blocker.style.display = 'block';
        });

        scene.add(controls.getObject());

        // Movement Listeners
        const onKeyDown = function (event) {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW': moveForward = true; break;
                case 'ArrowLeft':
                case 'KeyA': moveLeft = true; break;
                case 'ArrowDown':
                case 'KeyS': moveBackward = true; break;
                case 'ArrowRight':
                case 'KeyD': moveRight = true; break;
            }
        };

        const onKeyUp = function (event) {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW': moveForward = false; break;
                case 'ArrowLeft':
                case 'KeyA': moveLeft = false; break;
                case 'ArrowDown':
                case 'KeyS': moveBackward = false; break;
                case 'ArrowRight':
                case 'KeyD': moveRight = false; break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        
        // Raycaster (Picking)
        raycaster = new THREE.Raycaster();
        document.addEventListener('click', onMouseClick);

        // --- Build Market Environment --- //
        
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(200, 200);
        floorGeometry.rotateX(-Math.PI / 2);
        
        // Checkerboard texture manually
        const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
        // Add grid helper better
        const grid = new THREE.GridHelper(200, 50);
        scene.add(grid);
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        scene.add(floor);

        // Shelves Generation
        const shelfGeo = new THREE.BoxGeometry(2, 2, 10);
        const shelfMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63 }); // Wood color
        
        // Generate Aisles
        // We have serverProducts array
        const aisleSpacing = 6;
        const productsPerShelfSide = 8;
        
        let pIndex = 0;
        
        // 3 Aisles
        for (let i = 0; i < 3; i++) {
            const shelf = new THREE.Mesh(shelfGeo, shelfMat);
            shelf.position.set((i * aisleSpacing) - aisleSpacing, 1, -5); // Offset Z
            scene.add(shelf);
            objects.push(shelf); // Collision checks?
            
            // Add Products to Left and Right of shelf
            // Left Side
            for (let j = 0; j < 5; j++) { // 5 Products deep
                 if(pIndex < serverProducts.length) createProduct(serverProducts[pIndex++], (i * aisleSpacing) - aisleSpacing - 1.2, 1.5, -1 - (j*1.5));
                 if(pIndex < serverProducts.length) createProduct(serverProducts[pIndex++], (i * aisleSpacing) - aisleSpacing - 1.2, 0.8, -1 - (j*1.5));
            }
            // Right Side
            for (let j = 0; j < 5; j++) {
                 if(pIndex < serverProducts.length) createProduct(serverProducts[pIndex++], (i * aisleSpacing) - aisleSpacing + 1.2, 1.5, -1 - (j*1.5));
                 if(pIndex < serverProducts.length) createProduct(serverProducts[pIndex++], (i * aisleSpacing) - aisleSpacing + 1.2, 0.8, -1 - (j*1.5));
            }
        }

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('canvas-container').appendChild(renderer.domElement);

        window.addEventListener('resize', onWindowResize);
        
        updateCartCount();
        lucide.createIcons();
    }
    
    function createProduct(data, x, y, z) {
        // Product Box
        const pGeo = new THREE.BoxGeometry(0.5, 0.6, 0.5);
        
        // Load Texture
        const textureLoader = new THREE.TextureLoader();
        // Use proxy url
        const map = textureLoader.load(data.image);
        
        // Materials (Front face has texture, others simple color)
        const materials = [
            new THREE.MeshStandardMaterial({ color: 0xeeeeee }), // Right
            new THREE.MeshStandardMaterial({ color: 0xeeeeee }), // Left
            new THREE.MeshStandardMaterial({ color: 0xeeeeee }), // Top
            new THREE.MeshStandardMaterial({ color: 0xeeeeee }), // Bottom
            new THREE.MeshStandardMaterial({ map: map }), // Front
            new THREE.MeshStandardMaterial({ color: 0xeeeeee }), // Back
        ];
        
        const mesh = new THREE.Mesh(pGeo, materials);
        mesh.position.set(x, y, z);
        
        // Face the aisle (simplification: rotate Y based on side? assume front facing Z for now)
        // Adjust rotation if needed
        mesh.rotation.y = x > 0 ? -Math.PI/2 : Math.PI/2; 
        
        // Metadata for interaction
        mesh.userData = { isProduct: true, id: data.id, name: data.name, price: data.price };
        
        scene.add(mesh);
        productsMeshes.push(mesh);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    function onMouseClick() {
        if (!controls.isLocked) return;
        
        // Raycast from center
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const intersects = raycaster.intersectObjects(productsMeshes);
        
        if (intersects.length > 0) {
            const obj = intersects[0].object;
            if (obj.userData.isProduct) {
                // Add Animation
                obj.scale.set(1.2, 1.2, 1.2);
                setTimeout(() => obj.scale.set(1, 1, 1), 200);
                
                addToCart3D(obj.userData.id);
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);

        const time = performance.now();

        if (controls.isLocked) {
            const delta = (time - prevTime) / 1000;

            velocity.x -= velocity.x * 10.0 * delta;
            velocity.z -= velocity.z * 10.0 * delta;
            velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

            direction.z = Number(moveForward) - Number(moveBackward);
            direction.x = Number(moveRight) - Number(moveLeft);
            direction.normalize(); // this ensures consistent movements in all directions

            if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
            if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

            controls.moveRight(-velocity.x * delta);
            controls.moveForward(-velocity.z * delta);
        }

        prevTime = time;
        
        // Raycast for Hover Effect
        if (controls.isLocked) {
            raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
            const intersects = raycaster.intersectObjects(productsMeshes);
            const hoverInfo = document.getElementById('hover-info');
            
            if (intersects.length > 0) {
                const data = intersects[0].object.userData;
                document.getElementById('hover-text').innerText = data.name;
                document.getElementById('hover-price').innerText = '₹' + data.price;
                hoverInfo.style.opacity = 1;
            } else {
                hoverInfo.style.opacity = 0;
            }
        }

        renderer.render(scene, camera);
    }
</script>

</body>
</html>
