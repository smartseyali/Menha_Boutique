**Readme Deploy**

This file describes how to deploy the project to a production Ubuntu server (DigitalOcean Droplet) and host the UI at `thanndattifoods.com` and the API at `api.pattikadai.com`.

**Prerequisites**
- Ubuntu 22.04+ server with a public IP
- Domain DNS control (set A records for `thanndattifoods.com` and `api.pattikadai.com` to the server IP)
- SSH access to the server and an SSH key added to Droplet
- Node.js 18+ (LTS) installed on the server or use Docker
- `nginx`, `certbot`, and `pm2` (or Docker) installed on the server

**High-level steps**
1. Provision Droplet and add DNS A records for the two hostnames.
2. SSH to server, install runtime dependencies, clone repo.
3. Configure environment files (`.env.production` for frontend, `.env` for backend).
4. Build frontend, install backend deps.
5. Configure `nginx` to serve the frontend and reverse-proxy the API subdomain.
6. Obtain TLS certificates with Certbot.
7. Start processes with `pm2` (or Docker Compose) and enable on boot.

**Server setup (Ubuntu)**
Run these commands on the server as a user with sudo privileges:

```bash
# update & essentials
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential nginx certbot python3-certbot-nginx

# Install Node 18+ (example using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 process manager
sudo npm install -g pm2
pm2 --version

# Enable firewall and allow SSH + HTTP/HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

**Clone project and prepare directories**

```bash
sudo mkdir -p /var/www/thanndattifoods
sudo chown $USER:$USER /var/www/thanndattifoods
cd /var/www/thanndattifoods
git clone https://github.com/<your-org>/thandatti_foods.git .

# Ensure your `.env.production` exists in repo root (we include an example in the repo)
```

**Environment files**
- Frontend: create or verify `/.env.production` (repo root). Example:

```dotenv
NEXT_PUBLIC_DOMAIN="https://pattikadai.com"
NEXT_PUBLIC_API_BASE_URL=https://api.pattikadai.com
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=production
```

- Backend (create `backend/.env`):

```env
PORT=3000
DATABASE_URL=postgres://user:pass@localhost:5432/dbname
JWT_SECRET=replace_with_secure_secret
RAZORPAY_KEY_ID=replace
RAZORPAY_KEY_SECRET=replace
# Add other required secrets (SMTP, storage paths, etc.)
```

**Build frontend (production)**

```bash
cd /var/www/thanndattifoods
npm ci
npm run build

# Start Next.js production server on port 3002 (example)
pm2 start --name thanndattifoods-frontend --interpreter bash -- "npx next start -p 3002"
pm2 save
pm2 startup systemd
```

Notes: If you prefer to serve a static export, review `next export` options — this app uses server features (dynamic pages and API routes), so running the Next server is recommended.

**Start backend (API)**

```bash
cd /var/www/thanndattifoods/backend
npm ci
pm2 start server.js --name thanndattifoods-backend
pm2 save
```

Or (use npm start):

```bash
cd /var/www/thanndattifoods/backend
pm2 start npm --name thanndattifoods-backend -- run start
```

**Nginx configuration**
- This repo contains a sample Nginx configuration at `deploy/nginx/pattikadai.conf`.
- Copy or symlink it to `/etc/nginx/sites-available/pattikadai.conf` and enable it:

```bash
sudo cp deploy/nginx/pattikadai.conf /etc/nginx/sites-available/pattikadai.conf
sudo ln -s /etc/nginx/sites-available/pattikadai.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Adjust the backend `proxy_pass` port if you started the backend on a different port.

**Obtain TLS certificates (Let's Encrypt)**

```bash
sudo certbot --nginx -d pattikadai.com -d www.pattikadai.com -d api.pattikadai.com
# Test renewal
sudo certbot renew --dry-run
```

**Automatic deploy / updates**
- To pull and deploy a new version:

```bash
cd /var/www/thanndattifoods
git pull origin main
cd backend && npm ci && pm2 restart thanndattifoods-backend || true
cd ..
npm ci && npm run build
pm2 restart thanndattifoods-frontend || true
```

**Logs & monitoring**
- View logs:

```bash
pm2 logs thanndattifoods-backend
pm2 logs thanndattifoods-frontend
```

- Check Nginx logs:

```bash
sudo tail -f /var/log/nginx/error.log /var/log/nginx/access.log
```

**Docker alternative (optional)**
- If you prefer containers, create a `docker-compose.yml` with services for `frontend`, `backend`, and `nginx`/`reverse-proxy` (Traefik or nginx-proxy + letsencrypt). This repo already contains a `deploy/nginx` sample; I can add a `docker-compose.yml` on request.

**Troubleshooting**
- If Next fails to start due to Node version, install Node 18+.
- If build errors occur, run `npm run build` locally to inspect stack traces.

**Resources / references**
- Nginx: https://nginx.org/
- PM2: https://pm2.keymetrics.io/
- Certbot: https://certbot.eff.org/

---
If you want, I can also:
- add a `pm2` ecosystem file
- add a `start-prod.sh` script and `systemd` unit
- add a `docker-compose.yml` for containerized deployment

Replace `<your-org>` and secret placeholders with your actual values before deploying.
