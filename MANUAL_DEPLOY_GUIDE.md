
# Manual Deployment to Hostinger (PHP Website)

Since you've chosen to deploy manually, here are the steps to upload your PHP website (`menha-web-php`) to Hostinger using their File Manager.

## Step 1: Prepare Your Files
I have already zipped the latest version of your `menha-web-php` directory into a file named **`menha-web-deploy.zip`** in the root of your project folder (`d:\SmartSeyaliGit\menha_boutique\`).

## Step 2: Upload to Hostinger
1.  Log in to your **Hostinger hPanel**.
2.  Go to **Files** -> **File Manager**.
3.  Select your domain.
4.  Navigate to the `public_html` directory.
    - If you are hosting this on a subdomain (e.g., `shop.menhaboutique.com`), navigate to `domains/menhaboutique.com/public_html/shop/`.
5.  Click the **upload icon** (up arrow) in the top-right toolbar.
6.  Select and upload the **`menha-web-deploy.zip`** file from your computer.

## Step 3: Extract and Configure
1.  Once uploaded, right-click on `menha-web-deploy.zip` in the File Manager.
2.  Select **Extract**.
3.  Choose the current directory (`.` or just click Extract) as the destination.
4.  Once extracted, verify that your files (`index.php`, `assets/`, `includes/`) are visible directly in `public_html` (or your subdomain folder).
    - If they ended up inside a subfolder (e.g., `menha-web-php/`), select all files inside that subfolder and **Move** them up one level to the main directory.
5.  Delete the `menha-web-deploy.zip` file to save space.

## Step 4: Verify Your Site
Visit your website URL (e.g., `https://menhaboutique.com` or your subdomain) to confirm everything is working correctly.

### Troubleshooting
-   **API Issues**: If products don't load, ensure your `includes/functions.php` file has the correct API URL.
-   **Permissions**: Standard file permissions (644 for files, 755 for folders) are usually set automatically, but check if you encounter "Forbidden" errors.
