
<?php
// Proxy to fetch images avoiding CORS in WebGL
if (isset($_GET['url'])) {
    $url = $_GET['url'];
    // Basic validation
    if (filter_var($url, FILTER_VALIDATE_URL)) {
        header('Content-Type: image/jpeg'); // Default
        header('Access-Control-Allow-Origin: *'); 
        readfile($url);
        exit;
    }
}
?>
