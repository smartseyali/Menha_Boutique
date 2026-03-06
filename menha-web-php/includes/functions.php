
<?php
define('API_BASE_URL', 'https://menhaapi.smartseyali.app/api');

function callApi($endpoint, $method = 'GET', $data = []) {
    $url = API_BASE_URL . $endpoint;
    $ch = curl_init($url);
    
    // Set options
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    // Disable SSL verification for development/if certs are missing on host
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    // Execute
    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        return ['error' => curl_error($ch)];
    }
    
    curl_close($ch);
    
    $decoded = json_decode($response, true);
    return $decoded ? $decoded : [];
}

// Data Helper Functions
function getProductPrice($product) {
    if (isset($product['newPrice']) && $product['newPrice']) return $product['newPrice'];
    if (isset($product['price']) && $product['price']) return $product['price'];
    if (isset($product['sellingPrice'])) return $product['sellingPrice'];
    if (isset($product['mrp'])) return $product['mrp'];
    return '0.00';
}

function getProductImage($product) {
    if (isset($product['image']) && $product['image']) return $product['image'];
    if (isset($product['imageUrl']) && $product['imageUrl']) return $product['imageUrl'];
    if (isset($product['images']) && is_array($product['images']) && !empty($product['images'])) {
        $first = $product['images'][0];
        if (is_array($first) && isset($first['url'])) return $first['url'];
        if (is_string($first)) return $first;
    }
    return 'assets/images/logo.png'; // Fallback
}
?>
