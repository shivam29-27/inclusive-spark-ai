# Quick Deployment to Vercel

## 🚀 Fastest Way to Deploy

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add Vercel configuration"
git push origin main
```

### Step 2: Deploy via Vercel Dashboard

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with GitHub
3. **Click "Add New Project"**
4. **Import your repository** (`inclusive-spark-ai`)
5. **Configure project**:
   - Framework Preset: **Vite** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
6. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add:
     ```
     VITE_SUPABASE_URL=your_supabase_url_here
     VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key_here
     ```
7. **Click "Deploy"**

### Step 3: Wait for Deployment
- Vercel will build and deploy your app
- You'll get a live URL (e.g., `https://inclusive-spark-ai.vercel.app`)

### Step 4: Test Your Deployment
Visit your Vercel URL and test:
- ✅ Homepage loads
- ✅ All routes work
- ✅ Sign up/Login
- ✅ All features

## 📋 Environment Variables Needed

You need these from your Supabase project:

1. **Get Supabase Credentials**:
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Go to: Settings → API
   - Copy:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **anon public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`

2. **Add to Vercel**:
   - Project Settings → Environment Variables
   - Add both variables
   - Redeploy if needed

## 🔧 Alternative: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## ⚠️ Important Notes

1. **Supabase Edge Functions**: Deploy separately using Supabase CLI
2. **Environment Variables**: Must be set in Vercel dashboard
3. **Custom Domain**: Can be added in Vercel project settings
4. **Auto Deployments**: Every push to main branch auto-deploys

## 🐛 Troubleshooting

**Build fails?**
- Check environment variables are set
- Verify Node.js version (Vercel uses 18+)
- Check build logs in Vercel dashboard

**API errors?**
- Verify Supabase functions are deployed
- Check CORS settings
- Verify environment variables match

**Routes not working?**
- The `vercel.json` file handles SPA routing
- All routes redirect to `index.html`

## ✅ Success!

Once deployed, you'll have:
- ✅ Live production URL
- ✅ Auto-deployments on git push
- ✅ SSL certificate (HTTPS)
- ✅ Global CDN
- ✅ Analytics (optional)

