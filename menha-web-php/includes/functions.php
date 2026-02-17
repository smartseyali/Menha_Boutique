
<?php
define('API_BASE_URL', 'https://menhaapi.smartseyali.app/api');

function callApi($endpoint, $method = 'GET', $data = []) {
    $url = API_BASE_URL . $endpoint;
    $ch = curl_init($url);
    
    // Set options
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    // Execute
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        return ['error' => curl_error($ch)];
    }
    
    curl_close($ch);
    
    $decoded = json_decode($response, true);
    return $decoded ? $decoded : [];
}

function getAssetUrl($path) {
    // Determine base URL dynamically or hardcode for now
    return 'assets/' . ltrim($path, '/');
}
?>
