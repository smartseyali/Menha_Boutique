# Quick Start Guide - Thandatti Foods

## Current Status
✅ Environment files created
✅ Dependencies installed
⚠️  **Database password needs to be configured**

## Next Steps

### 1. Update Database Password (REQUIRED)

Edit `backend/.env` and replace `your_password_here` with your actual PostgreSQL password:

```env
DB_PASSWORD=your_actual_password_here
```

### 2. Test Database Connection

```bash
cd backend
node test-db-connection.js
```

You should see: `✅ Database connected successfully!`

### 3. Run Database Migrations

```bash
cd backend
npm run migrate:up
```

### 4. Start Servers

**Option A: Use the startup script**
```powershell
.\start-local.ps1
```

**Option B: Manual startup**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

### 5. Access the Application

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Configuration Files

- **Backend**: `backend/.env`
  - Database: 159.89.163.255:5432/pattikadai
  - Server: http://localhost:5000 (local) or https://api.pattikadai.com (production)

- **Frontend**: `.env.local`
  - API URL: http://localhost:5000 (local) or https://api.pattikadai.com (production)

## Troubleshooting

### Database Password Error
```
password authentication failed for user "postgres"
```
**Solution**: Update `DB_PASSWORD` in `backend/.env`

### Connection Refused
```
ECONNREFUSED
```
**Solution**: Check if the database server is accessible and firewall allows port 5432

### Port Already in Use
**Solution**: Change ports in configuration files or stop the existing process

## Need Help?

See `SETUP_LOCAL.md` for detailed setup instructions and troubleshooting.

