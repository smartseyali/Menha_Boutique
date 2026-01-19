# Testing Instructions

## 1. Database Migration
The database migration script communicates with your DigitalOcean PostgreSQL instance.
If the automatic migration failed, please run:
```bash
cd backend
npm run migrate:up
```
*Ensure your `.env` file in `backend/` has the correct `DB_HOST`, `DB_USER`, etc.*

## 2. Backend Server
The backend API connects to the database.
```bash
cd backend
npm start
```
- Runs on: `http://localhost:5000` (default)
- Check health: `http://localhost:5000/api/health` (if implemented) or root.

## 3. Web Admin Panel (Frontend)
The Next.js application now enforces Admin Login.
```bash
npm run dev
```
- URL: `http://localhost:3000`
- **Note**: Accessing `/` will redirect to `/admin/login`.
- Login with Admin credentials (e.g., `admin@menhaboutique.com` / `password` - check your DB).

## 4. Mobile App (Customer Ordering)
The React Native (Expo) app is for customers.
```bash
cd MenhaMobile
npm install
npx expo start
```
- Scan the QR code with **Expo Go** on Android.
- Ensure your phone is on the same network or use an Emulator.
- If testing on Emulator, API URL in `src/services/api.ts` might need to be `http://10.0.2.2:5000/api`.
