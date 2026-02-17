
# How to Automate Deployment to Hostinger from GitHub

This guide explains two primary methods to deploy your `menha-web-php` application to Hostinger automatically:

## Method 1: Using GitHub Actions (Recommended)

This method automatically deploys your code to Hostinger whenever you push changes to GitHub. It's flexible and works for any hosting plan that supports FTP/SFTP.

### 1. Create the Workflow File
I have already created the workflow file for you at: `.github/workflows/deploy-php-site.yml`

This file is configured to:
- Run only when you push to the `main` branch.
- Run only when changes occur in the `menha-web-php` folder.
- Upload only the `menha-web-php` folder contents to your server.

### 2. Configure GitHub Secrets
You need to provide your FTP credentials securely to GitHub. Do not put them in the code directly.

1.  Go to your **GitHub Repository** page.
2.  Navigate to **Settings** > **Secrets and variables** > **Actions**.
3.  Click **New repository secret** and add the following three secrets:

| Name | Value Example | Description |
| :--- | :--- | :--- |
| `FTP_SERVER` | `ftp.your-domain.com` | Your Hostinger FTP Hostname (find in hPanel > Files > FTP Accounts) |
| `FTP_USERNAME` | `u123456789` | Your Hostinger FTP Username |
| `FTP_PASSWORD` | `SecurePassword123!` | Your Hostinger FTP Password |

### 3. Adjust Server Directory (Optional)
Open `.github/workflows/deploy-php-site.yml` and check the line:
```yaml
server-dir: ./public_html/
```
- If this site is your **main domain**, keep it as `./public_html/`.
- If this site is a **subdomain** (e.g., `shop.menhaboutique.com`), change it to `./domains/menhaboutique.com/public_html/shop/` or wherever your subdomain points.

---

## Method 2: Using Hostinger's Git Integration (Alternative)

Hostinger has a built-in Git tool, but it's often manual (you have to click "Deploy") or requires setting up a webhook strictly.

1.  Log in to **Hostinger hPanel**.
2.  Go to **Advanced** > **Git**.
3.  Enter your **Repository URL** and **Branch** (`main`).
4.  Set the **Directory** path (e.g., `public_html` or a subfolder).
    - **Note**: This method pulls the *entire* repository. Since your repo has `backend`, `MenhaMobile`, and `menha-web-php`, this might clutter your public folder with backend code you don't want public.
    - **Recommendation**: Use Method 1 (GitHub Actions) because it lets you deploy *only* the specific `menha-web-php` folder.

## Summary

The **GitHub Actions** approach (Method 1) is superior for your project structure because:
1.  You have a monorepo (multiple apps in one repo).
2.  You only want to deploy the `menha-web-php` folder to the web server, not the entire repository.
