# API Integration Summary

This document summarizes the changes made to integrate the frontend with the backend API for products, carts, and orders.

## Overview

The frontend has been updated to fetch data from the backend API instead of using hardcoded data. The integration supports both authenticated users (API-based) and guest users (localStorage-based).

## Changes Made

### 1. API Service Utility (`src/utils/api.ts`)

Created a centralized API service utility that:
- Handles authentication tokens from localStorage
- Provides functions for products, cart, and orders APIs
- Maps backend API responses to frontend format
- Includes error handling

**Key Functions:**
- `productApi.getAll()` - Fetch all products
- `productApi.getById()` - Fetch single product
- `cartApi.get()` - Get user's cart
- `cartApi.add()` - Add item to cart
- `cartApi.update()` - Update cart item quantity
- `cartApi.remove()` - Remove item from cart
- `orderApi.getAll()` - Get user's orders
- `orderApi.getById()` - Get single order

### 2. Cart Operations Utility (`src/utils/cartOperations.ts`)

Created utility functions for cart operations that:
- Sync with backend API for authenticated users
- Use localStorage for guest users
- Handle errors gracefully with fallback to localStorage

**Key Functions:**
- `addItemToCart()` - Add item to cart (API or localStorage)
- `updateCartItemQuantity()` - Update cart item quantity
- `removeItemFromCart()` - Remove item from cart
- `incrementCartItem()` - Increment item quantity

### 3. Hooks for Data Loading

#### `src/hooks/useCart.ts`
- Loads cart from API if user is authenticated
- Falls back to localStorage for guest users
- Automatically syncs on authentication state changes

#### `src/hooks/useOrders.ts`
- Loads orders from API if user is authenticated
- Falls back to localStorage for guest users

### 4. Updated Next.js API Routes

#### `src/app/api/all-product/route.ts`
- Now fetches products from backend API
- Maps backend format to frontend format
- Supports pagination, filtering, and search

#### `src/app/api/all-arrivals/route.ts`
- Fetches products from backend API
- Maintains existing filtering and sorting logic

#### `src/app/api/deal-slider/route.ts`
- Fetches products with sale tags from backend API

### 5. Updated Redux Store

#### `src/store/reducer/cartSlice.ts`
- Removed hardcoded `defaultItems` and `defaultOrders`
- Initial state is now empty arrays
- Cart and orders are loaded from API or localStorage

### 6. Updated Components

#### Layout Component (`src/components/layout/index.tsx`)
- Uses `useLoadCart()` hook to load cart on app initialization

#### Order Components
- `src/components/order-page/Orders.tsx` - Uses `useLoadOrders()` hook
- `src/components/order-page/OrderPage.tsx` - Fetches order from API if not in Redux store

#### Checkout Component (`src/components/login/Checkout.tsx`)
- Updated to use `useLoadOrders()` hook from new location

## Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

For production, update this to your production API URL.

## Backend API Endpoints Used

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/search?q=...` - Search products

### Cart
- `GET /api/cart` - Get user's cart (requires authentication)
- `POST /api/cart/add` - Add item to cart (requires authentication)
- `PUT /api/cart/:id` - Update cart item (requires authentication)
- `DELETE /api/cart/:id` - Remove item from cart (requires authentication)
- `DELETE /api/cart` - Clear cart (requires authentication)

### Orders
- `GET /api/orders` - Get user's orders (requires authentication)
- `GET /api/orders/:id` - Get single order (requires authentication)
- `POST /api/orders` - Create order (requires authentication)

## Data Mapping

### Product Mapping
Backend format → Frontend format:
- `id` → `id`
- `title` → `title`
- `new_price` → `newPrice`
- `old_price` → `oldPrice` (formatted as currency string)
- `primary_image` → `image` and `imageTwo`
- `category_name` → `category`
- `brand_name` → `brand`
- `status` → `status`
- `sale_tag` → `sale`

### Cart Item Mapping
- `product_id` → `id` (main ID for frontend)
- `id` → `cartItemId` (stored for API operations)
- `new_price` → `newPrice`
- `primary_image` → `image`
- `quantity` → `quantity`

### Order Mapping
- `order_number` → `orderId`
- `total_items` → `totalItems`
- `total_price` → `totalPrice`
- `status` → `status`
- `items` → `products` (array of order items)

## Authentication

The API integration uses JWT tokens stored in localStorage under the key `login_user`. The token is automatically included in API requests via the `Authorization: Bearer <token>` header.

## Guest User Support

For non-authenticated users:
- Cart operations use localStorage
- Orders are stored in localStorage
- No API calls are made for cart/order operations

## Error Handling

All API calls include error handling:
- Network errors fall back to localStorage
- Invalid responses are caught and logged
- User experience is maintained even if API is unavailable

## Next Steps

1. **Update Cart Components**: Update cart-related components (Cart.tsx, QuantitySelector, etc.) to use the new `cartOperations` utility functions for better API synchronization.

2. **Update Product Components**: Update product card components to use the new `addItemToCart` function from `cartOperations.ts`.

3. **Testing**: Test the integration with:
   - Authenticated users
   - Guest users
   - API errors/scenarios
   - Network failures

4. **Environment Setup**: Ensure the backend API is running and accessible at the configured URL.

## Notes

- The backend API uses UUIDs for IDs, but the frontend currently uses numbers in some places. The mapping functions handle this conversion.
- Cart operations for authenticated users require the backend API to be running.
- The integration maintains backward compatibility with localStorage for guest users.

