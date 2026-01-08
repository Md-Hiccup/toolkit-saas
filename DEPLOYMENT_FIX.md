# CORS Fix for Vercel + Render Deployment

## Problem
Frontend on Vercel (`https://toolkit-saas.vercel.app`) was blocked by CORS when calling backend on Render (`https://toolkit-saas.onrender.com`).

## Solution Applied

### Backend Changes (Already Done)
✅ Updated `app/main.py` to read `FRONTEND_URL` from environment variables
✅ CORS now allows the production frontend URL dynamically

### Required: Update Render Environment Variable

**CRITICAL:** You must update the `FRONTEND_URL` environment variable on Render:

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your backend service (`toolkit-saas`)
3. Go to **Environment** tab
4. Find or add `FRONTEND_URL` variable
5. Set value to: `https://toolkit-saas.vercel.app`
6. Click **Save Changes**
7. Render will automatically redeploy with the new configuration

### Frontend Configuration
✅ Created `.env.production` with backend URL: `https://toolkit-saas.onrender.com`

## Verification Steps

After updating Render environment variable:

1. **Wait for Render to redeploy** (check deployment logs)

2. **Test the API directly:**
   ```bash
   curl https://toolkit-saas.onrender.com/health
   ```
   Should return: `{"status":"healthy"}`

3. **Test CORS from browser:**
   - Open https://toolkit-saas.vercel.app
   - Open browser DevTools (F12) → Console
   - Try using any feature that calls the API
   - Should work without CORS errors

4. **Check CORS headers:**
   ```bash
   curl -I -X OPTIONS https://toolkit-saas.onrender.com/encoder/generate/uuid \
     -H "Origin: https://toolkit-saas.vercel.app" \
     -H "Access-Control-Request-Method: POST"
   ```
   Should include: `Access-Control-Allow-Origin: https://toolkit-saas.vercel.app`

## What Changed

### Backend (`app/main.py`)
- Now imports `settings` from config
- Dynamically builds `allowed_origins` list
- Includes `FRONTEND_URL` from environment variable
- Maintains localhost URLs for local development

### Environment Variables
- **Render (Backend):** `FRONTEND_URL=https://toolkit-saas.vercel.app`
- **Vercel (Frontend):** `NEXT_PUBLIC_API_URL=https://toolkit-saas.onrender.com`

## Troubleshooting

### Still getting CORS errors?
1. Verify `FRONTEND_URL` is set correctly on Render
2. Check Render deployment logs for the startup message
3. Ensure Render service has redeployed after environment variable change
4. Clear browser cache and hard refresh (Cmd+Shift+R on Mac)

### API not responding?
1. Check Render service status
2. Verify backend is running: `curl https://toolkit-saas.onrender.com/health`
3. Check Render logs for errors

### Frontend not connecting?
1. Verify Vercel deployment succeeded
2. Check browser console for actual error messages
3. Ensure `.env.production` is committed to git (or set in Vercel dashboard)
