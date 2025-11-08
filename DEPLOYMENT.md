# Deployment Guide for Vercel

## Prerequisites
- GitHub account with your repository pushed
- Vercel account (sign up at https://vercel.com)

## Step 1: Push to GitHub
Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)
1. Go to https://vercel.com and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite configuration
5. Configure environment variables (see Step 3)
6. Click "Deploy"

### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Step 3: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

### Required Variables:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### How to get Supabase credentials:
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`

## Step 4: Deploy Supabase Edge Functions

Your Supabase Edge Functions need to be deployed separately:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy
```

Or deploy individual functions:
```bash
supabase functions deploy chat
supabase functions deploy translate-sign
supabase functions deploy analyze-emotion
supabase functions deploy describe-visual
supabase functions deploy scan-accessibility
supabase functions deploy community-posts
supabase functions deploy clean-link
```

## Step 5: Verify Deployment

After deployment:
1. Visit your Vercel deployment URL
2. Test all features:
   - Sign up/Login
   - All feature pages
   - API integrations
   - Accessibility features

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify Node.js version (Vercel uses Node 18+ by default)
- Check build logs in Vercel dashboard

### API Errors
- Verify Supabase Edge Functions are deployed
- Check CORS settings in Supabase functions
- Verify environment variables match Supabase project

### Routing Issues
- The `vercel.json` file handles SPA routing
- All routes should redirect to `index.html`

## Environment Variables Checklist

Before deploying, ensure you have:
- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon key
- [ ] Supabase Edge Functions deployed
- [ ] `LOVABLE_API_KEY` set in Supabase Edge Functions (for AI features)

## Post-Deployment

1. Update your Supabase project URL in production
2. Test all features in production
3. Set up custom domain (optional)
4. Configure analytics (optional)

## Support

For issues:
- Check Vercel logs: Project → Deployments → View Logs
- Check Supabase logs: Project → Edge Functions → Logs
- Verify environment variables are set correctly

