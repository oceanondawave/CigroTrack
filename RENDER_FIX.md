# Fix Render Deployment Error

## The Problem

Render was trying to use `yarn` and the build command wasn't compiling TypeScript, so `dist/index.js` didn't exist.

## The Solution

You have two options:

### Option 1: Use render.yaml (Easiest)

1. **Commit and push the `render.yaml` file** that was just created:
   ```bash
   git add render.yaml
   git commit -m "Add render.yaml for deployment"
   git push
   ```

2. **In Render Dashboard:**
   - Go to your service
   - Click "Settings"
   - Scroll to "Build & Deploy"
   - Delete the existing service
   - Create a new service
   - Choose "Blueprint" instead of "Web Service"
   - Connect your repo
   - Render will auto-detect `render.yaml` and configure everything
   - Add your environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.)

### Option 2: Fix Manual Configuration

1. **Go to your Render service dashboard**
2. **Click "Settings"**
3. **Update Build Command:**
   ```
   npm install && npm run build
   ```
   (Make sure it's NOT using `yarn`)

4. **Update Start Command:**
   ```
   npm start
   ```

5. **Verify Root Directory is set to:** `backend`

6. **Clear build cache:**
   - Go to "Manual Deploy"
   - Click "Clear build cache & deploy"

7. **Redeploy**

## Verify It Works

After deployment, check:
- Visit: `https://your-app.onrender.com/health`
- Should return: `{"status":"ok",...}`

If you still see errors, check the logs in Render dashboard.

