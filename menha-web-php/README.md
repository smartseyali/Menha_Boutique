
# Menha Boutique Web Application (PHP Version)

This is the PHP version of the Menha Boutique web application. It replicates the functionality of the React app using a server-side rendering approach mixed with client-side API interactions.

## Architecture

-   **Backend API**: Connects to `https://menhaapi.smartseyali.app/api`.
-   **Structure**:
    -   `includes/`: Reusable components (header, footer, API helper).
    -   `assets/`: CSS, JS, Images.
    -   `index.php`: Home page (Server-Side Fetching).
    -   `product.php`: Product Details (Server-Side Fetching).
    -   `cart.php`: Cart Management (Client-Side Fetching).
    -   `login.php`: Authentication (Client-Side Fetching).

## Setup

1.  **Deployment**: Place the `menha-web-php` folder in your web server's root (e.g., `htdocs` or `/var/www/html`).
2.  **Configuration**: The API URL is defined in `includes/functions.php`.
3.  **Authentication**: Uses `localStorage` to store the JWT token. The PHP backend does not manage session state for API calls; client-side JS handles auth-dependent features like "Add to Cart" for logged-in users.

## Key Differences from React App

-   **Data Loading**: Initial page load (Home, Product) fetches data on the server (better for SEO). Interactive elements (Cart, Profile) fetch data in the browser.
-   **Routing**: Standard PHP file-based routing (`product.php?id=123`).
