
# Menha Boutique Admin Panel

This is the dedicated Admin Panel for Menha Boutique, built with React, Vite, and Bootstrap.

## Features

- **Dashboard**: Overview of key metrics (stats, recent orders).
- **Products**: Manage product catalog (CRUD, images, attributes).
- **Categories**: Manage product categories.
- **Orders**: View and manage customer orders (status updates).
- **Users**: View registered users.
- **Delivery**: Configure delivery tariff slabs and state zones.
- **Banners**: Manage homepage banners and videos.

## Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **UI Library**: React Bootstrap
- **Icons**: Remix Icon
- **State Management**: React Context / Local State
- **Routing**: React Router DOM

## Setup & Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Ensure `.env` exists with the correct API URL:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   The admin panel will be available at `http://localhost:5173` (or the port shown in terminal).

4. **Build for Production**
   ```bash
   npm run build
   ```
   The output will be in the `dist` folder.

## Project Structure

- `src/components/admin`: specialized admin components/tabs.
- `src/components/common`: reusable UI components.
- `src/utils`: API clients and helpers.
- `src/App.tsx`: Main routing and layout composition.
