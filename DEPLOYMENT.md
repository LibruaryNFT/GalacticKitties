# Deployment Instructions

## Quick Fix for Current Deployment

The error you're seeing is because the server is trying to serve JSX files directly. You need to build the React app first.

### Step 1: Build the App

```bash
cd viewer
npm run build
```

This creates a `dist/` folder with the production-ready files.

### Step 2: Deploy the Built Files

**For GitHub Pages:**
1. Go to your repository Settings → Pages
2. Set "Source" to "GitHub Actions" (if using the workflow) OR
3. Set "Source" to "Deploy from a branch" and select the branch with the `dist/` folder
4. Set the folder to `/dist`

**For Other Hosting:**
- Upload the **contents** of the `dist/` folder to your web server's root directory
- Make sure your server serves `index.html` for all routes (for React Router compatibility)

### Step 3: Update Your Server Configuration

If you're using a custom server, make sure it:
- Serves static files from the `dist/` folder
- Has proper MIME types configured (`.js` files should be `application/javascript`)
- Serves `index.html` for all routes (SPA routing)

## Automatic Deployment (GitHub Pages)

I've created a GitHub Actions workflow (`.github/workflows/deploy.yml`) that will:
1. Build the app automatically on push
2. Deploy to GitHub Pages

**To enable:**
1. Go to repository Settings → Pages
2. Set "Source" to "GitHub Actions"
3. Push to `main` or `master` branch to trigger deployment

## Manual Build Scripts

- **PowerShell:** Run `.\build-and-deploy.ps1`
- **Bash:** Run `./build-and-deploy.sh`

## Troubleshooting

**"Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of 'text/jsx'"**
- Solution: Build the app first (see Step 1 above)

**"404 for /vite.svg"**
- This is harmless - it's just the favicon. The build process removes this reference.

**"Failed to load resource"**
- Make sure all files in `dist/` are uploaded
- Check that your server is serving from the correct directory
- Verify MIME types are correct

