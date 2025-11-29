# Deploy Frontend to Vercel - Quick Guide

## Step 1: Push Your Code to GitHub

Make sure all your changes are committed and pushed:

```bash
git add .
git commit -m "Ready for frontend deployment"
git push
```

## Step 2: Deploy on Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. **Click "Add New Project"** (or "Import Project" if you see it)

3. **Import Your Repository**
   - Find your `CigroTrack` repository
   - Click "Import"

4. **Configure Project Settings:**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT: Change from `/` to `/frontend`**
   - **Build Command**: `npm run build` (default is fine)
   - **Output Directory**: `.next` (default is fine)
   - **Install Command**: `npm install` (default is fine)

5. **Add Environment Variable:**
   - Click "Environment Variables"
   - Add this variable:
     - **Key**: `NEXT_PUBLIC_API_URL`
     - **Value**: `https://YOUR-RENDER-URL.onrender.com/api`
     - Replace `YOUR-RENDER-URL` with your actual Render backend URL
     - **Important:** Include `/api` at the end!
   
   Example:
   ```
   NEXT_PUBLIC_API_URL=https://cigrotrack-backend.onrender.com/api
   ```

6. **Click "Deploy"**

7. **Wait for Build** (takes 1-3 minutes)

8. **Get Your Frontend URL** - Vercel will give you something like:
   ```
   https://cigrotrack.vercel.app
   ```

## Step 3: Update Backend CORS

Now update your Render backend to allow requests from your Vercel frontend:

1. **Go to Render Dashboard** → Your backend service
2. **Go to Environment Variables**
3. **Update `FRONTEND_URL`** to your Vercel URL:
   ```
   FRONTEND_URL=https://cigrotrack.vercel.app
   ```
4. **Save** - Render will automatically redeploy

## Step 4: Test Everything

1. Visit your Vercel frontend URL
2. Try to sign up / sign in
3. Check browser console for any errors
4. If you see CORS errors, make sure `FRONTEND_URL` in Render matches your Vercel URL

## 🎉 Done!

Your app should now be fully deployed:
- ✅ Backend: `https://your-backend.onrender.com`
- ✅ Frontend: `https://your-app.vercel.app`
- ✅ Database: Supabase (already configured)

---

## 🔍 Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` in Render matches your Vercel URL exactly
- Wait a few minutes for Render to redeploy after changing env vars

### API Connection Errors
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Make sure it includes `/api` at the end
- Check that your Render backend is running (visit `/health` endpoint)

### Can't Sign In
- Check browser console for errors
- Verify cookies are working (check Network tab)
- Make sure backend has correct `FRONTEND_URL` for CORS

