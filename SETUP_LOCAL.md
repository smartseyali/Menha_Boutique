# Local Setup Guide for Thandatti Foods

## Prerequisites
- Node.js (v14 or higher)
- PostgreSQL client access to remote server
- Database credentials

## Configuration

### 1. Backend Configuration (.env)
The backend `.env` file has been created in `backend/.env` with the following configuration:
- **Database Host**: 159.89.163.255
- **Database Name**: pattikadai
- **Database Port**: 5432
- **Database User**: postgres

**IMPORTANT**: You need to update the `DB_PASSWORD` in `backend/.env` with your actual database password.

### 2. Frontend Configuration (.env.local)
The frontend `.env.local` file has been created with:
- **API URL**: http://localhost:5000

## Setup Steps

### Step 1: Update Database Password
**CRITICAL**: Edit `backend/.env` and replace `your_password_here` with your actual PostgreSQL password.

You can test the database connection using:
```bash
cd backend
node test-db-connection.js
```

This will verify that your database password and connection settings are correct.

### Step 2: Install Dependencies
Dependencies have been installed. If you need to reinstall:
```bash
# Backend
cd backend
npm install

# Frontend (from root directory)
npm install
```

### Step 3: Run Database Migrations
```bash
cd backend
npm run migrate:up
```

### Step 4: Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on http://localhost:5000

### Step 5: Start Frontend Server
In a new terminal:
```bash
npm run dev
```
The frontend will run on http://localhost:3000

## Quick Start Script

You can use the PowerShell script to start both servers:
```powershell
.\start-local.ps1
```

This script will:
1. Check if .env file exists
2. Test database connection
3. Start backend server in a new window
4. Start frontend server in a new window

## Testing

### Test Database Connection
```bash
cd backend
node test-db-connection.js
```

### Test Backend Health
```bash
curl http://localhost:5000/health
```
Or open http://localhost:5000/health in your browser.

### Test Frontend
Open http://localhost:3000 in your browser.

## Troubleshooting

### Database Connection Issues

**Password Authentication Failed**
- The database server is reachable, but the password is incorrect
- Update `DB_PASSWORD` in `backend/.env` with the correct password
- Run `node backend/test-db-connection.js` to test the connection

**Connection Refused**
- Verify the database server (159.89.163.255) is accessible from your machine
- Check if firewall allows connections on port 5432
- Verify the database server is running

**Database Name Issues**
- Verify database name is exactly "pattikadai" (case-sensitive)
- Check if the database exists on the remote server

### Port Already in Use
- Backend (5000): Change `PORT` in `backend/.env`
- Frontend (3000): Use `npm run dev -- -p 3001` or change port in package.json

### CORS Issues
If you see CORS errors, verify `CORS_ORIGIN` in `backend/.env` matches your frontend URL (default: http://localhost:3000)

