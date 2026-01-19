# DEPLOYMENT GUIDE: Pattikadai.com

## Pre-Deployment Requirements

### 1. Database Setup
The application now expects database name: **`pattikadai`**

On your PostgreSQL server, either:

#### Option A: Rename existing database
```sql
ALTER DATABASE thandattifoods RENAME TO pattikadai;
```

#### Option B: Create fresh database
```bash
createdb pattikadai -U dbadmin
```

### 2. Domain & DNS Configuration

Update your DNS provider with these records:

```
pattikadai.com          A       <your-server-ip>
www.pattikadai.com      A       <your-server-ip>
api.pattikadai.com      CNAME   pattikadai.com (or your server IP)
```

Wait for DNS propagation (typically 5-30 minutes).

### 3. SSL Certificate

Once DNS is propagated, request SSL certificates:

```bash
# On your server
sudo certbot --nginx -d pattikadai.com -d www.pattikadai.com -d api.pattikadai.com
```

## Environment Configuration for Production

### Frontend (.env.production)
Currently set correctly to:
```env
NEXT_PUBLIC_DOMAIN="https://pattikadai.com"
NEXT_PUBLIC_API_BASE_URL=https://api.pattikadai.com
```

### Backend (.env) - PRODUCTION VALUES
Update these for production:

```env
# Database Configuration
DB_HOST=159.89.163.255      # or your production DB host
DB_PORT=5432
DB_NAME=pattikadai          # ✅ Updated
DB_USER=dbadmin
DB_PASSWORD=YOUR_PASSWORD

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration - UPDATE THESE
CORS_ORIGIN=https://pattikadai.com
# Also allow www subdomain if needed:
# CORS_ORIGIN=https://www.pattikadai.com

# Add your payment credentials
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_SALT_KEY=your_salt_key
```

## Deployment Steps

### Step 1: Backend Deployment

```bash
# SSH into your server
ssh root@<your-server-ip>

# Navigate to backend directory
cd /var/www/pattikadai/backend

# Install dependencies (if not already done)
npm install

# Update .env with production values (see section above)
nano .env

# Create/verify database
node create-database.js

# Test database connection
node test-db-connection.js

# If using PM2, restart the backend
pm2 restart pattikadai-backend
# Or start it if not running:
# pm2 start npm --name pattikadai-backend -- run start
```

### Step 2: Frontend Deployment

```bash
# Build the frontend
npm run build

# Copy built files to web root
cp -r .next /var/www/pattikadai_frontend/
cp -r public /var/www/pattikadai_frontend/
```

### Step 3: Nginx Configuration

```bash
# Copy new nginx config
sudo cp deploy/nginx/pattikadai.conf /etc/nginx/sites-available/pattikadai.conf

# Enable it (disable old config if exists)
sudo ln -s /etc/nginx/sites-available/pattikadai.conf /etc/nginx/sites-enabled/
# Optional: remove old config
# sudo rm /etc/nginx/sites-enabled/thandattifoods.conf

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 4: Verify Deployment

Test your deployment with these commands:

```bash
# Test API health
curl -I https://api.pattikadai.com/health

# Test API products endpoint
curl https://api.pattikadai.com/api/products

# Test frontend (should redirect properly)
curl -I https://pattikadai.com/

# Check CORS headers
curl -H "Origin: https://pattikadai.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.pattikadai.com/api/products -v
```

## Monitoring After Deployment

### Check Logs

```bash
# Backend logs (if using PM2)
pm2 logs pattikadai-backend

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# System logs
journalctl -xe
```

### Common Issues and Solutions

#### Issue 1: CORS Errors
**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Check backend `.env` `CORS_ORIGIN` matches your domain
2. Verify nginx proxy headers are set correctly
3. Check browser console for actual origin being sent

```bash
# Verify CORS_ORIGIN in .env
grep CORS_ORIGIN /var/www/pattikadai/backend/.env
```

#### Issue 2: Database Connection Error
**Error**: `database pattikadai does not exist`

**Solution**:
```bash
# Check if database exists
psql -U dbadmin -h 159.89.163.255 -l | grep pattikadai

# If not, create it
createdb pattikadai -U dbadmin -h 159.89.163.255
```

#### Issue 3: API Not Responding
**Error**: `Cannot reach api.pattikadai.com`

**Solution**:
```bash
# Check if backend is running
pm2 status

# Check if listening on port 5000
lsof -i :5000

# Test locally
curl http://localhost:5000/health

# Check firewall
sudo ufw status
sudo ufw allow 5000  # if needed
```

#### Issue 4: SSL Certificate Issues
**Error**: `SSL_ERROR_RX_RECORD_TOO_LONG` or certificate errors

**Solution**:
```bash
# Renew certificate
sudo certbot renew --force-renewal

# Check certificate status
sudo certbot certificates

# Check nginx SSL configuration
sudo nginx -T | grep ssl
```

## Rollback Plan

If deployment fails:

### Option 1: Revert to Old Domain (Temporary)
```bash
# Reactivate old nginx config
sudo ln -s /etc/nginx/sites-available/thandattifoods.conf /etc/nginx/sites-enabled/thandattifoods.conf
sudo systemctl reload nginx
```

### Option 2: Database Restoration
```sql
-- Restore from backup if available
-- Contact your DBA for assistance
```

## Post-Deployment Maintenance

### Weekly Checks
- [ ] Verify API response times
- [ ] Check error logs for issues
- [ ] Monitor disk space on database server
- [ ] Test payment gateway connectivity

### Monthly Checks
- [ ] Renew SSL certificates (auto with certbot usually handles this)
- [ ] Review and archive old logs
- [ ] Backup database
- [ ] Performance analysis

### Certificate Auto-Renewal Setup (if not automatic)
```bash
# Add to crontab
crontab -e

# Add this line:
0 2 * * * /usr/bin/certbot renew --quiet && /bin/systemctl reload nginx
```

## Success Indicators

After successful deployment, verify:

✅ Frontend loads at `https://pattikadai.com`  
✅ API responds at `https://api.pattikadai.com`  
✅ SSL certificates are valid (green lock in browser)  
✅ Database connectivity working  
✅ CORS headers allowing frontend domain  
✅ Payment gateways connected  
✅ Product images loading  
✅ Admin panel accessible  
✅ User authentication working  

---

**Need Help?** Check the logs:
```bash
# All-in-one diagnostic
echo "=== Backend Status ===" && pm2 status && \
echo "=== Nginx Status ===" && sudo systemctl status nginx && \
echo "=== Database ===" && psql -U dbadmin -h 159.89.163.255 -l | grep pattikadai && \
echo "=== Recent Errors ===" && tail -20 /var/log/nginx/error.log
```
