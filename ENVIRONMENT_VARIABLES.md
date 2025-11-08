# Environment Variables Guide

## 📋 Overview

This project requires environment variables in two places:
1. **Frontend (Replit/Vercel)** - For client-side Supabase connection
2. **Backend (Supabase Edge Functions)** - For AI API keys

## 🔵 Frontend Environment Variables (Replit/Vercel)

### Required in Replit Secrets or Vercel Environment Variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### How to Get These:

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public key** → Use for `VITE_SUPABASE_PUBLISHABLE_KEY`

### Where to Set in Replit:

1. Click the **🔒 Secrets** tab in Replit
2. Add each variable:
   - Key: `VITE_SUPABASE_URL`
   - Value: `https://your-project-id.supabase.co`
   - Key: `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Value: `your-anon-key-here`
3. Click **"Add secret"** for each
4. **Restart the Repl** after adding secrets

### Where to Set in Vercel:

1. Go to **Project Settings** → **Environment Variables**
2. Add each variable for **Production**, **Preview**, and **Development**
3. Click **"Save"**
4. **Redeploy** if needed

## 🔴 Backend Environment Variables (Supabase Edge Functions)

### Required in Supabase Edge Functions:

```
LOVABLE_API_KEY=your_lovable_api_key
```

### Important Notes:

- **DO NOT** add `LOVABLE_API_KEY` to Replit or Vercel
- This key is **only** used in Supabase Edge Functions
- It's set in Supabase, not in your frontend hosting

### How to Set in Supabase:

1. Go to **Supabase Dashboard** → Your Project
2. Go to **Edge Functions** → **Settings**
3. Click **"Secrets"** or **"Environment Variables"**
4. Add:
   - Key: `LOVABLE_API_KEY`
   - Value: `your-lovable-api-key-here`
5. Click **"Save"**

### Alternative: Set via Supabase CLI

```bash
# Set secret for all functions
supabase secrets set LOVABLE_API_KEY=your-key-here

# Or set for specific function
supabase secrets set LOVABLE_API_KEY=your-key-here --project-ref your-project-ref
```

## 🎯 Summary

### Replit/Vercel (Frontend):
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_PUBLISHABLE_KEY`
- ❌ `LOVABLE_API_KEY` (NOT needed here)

### Supabase Edge Functions (Backend):
- ✅ `LOVABLE_API_KEY`
- ✅ `SUPABASE_URL` (automatically available)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (automatically available)

## 🔐 Security Notes

1. **Never commit** environment variables to Git
2. **Never share** your API keys publicly
3. **Use Secrets** in Replit/Vercel for sensitive data
4. **Use Supabase Secrets** for backend API keys
5. **Rotate keys** if accidentally exposed

## ✅ Checklist

Before deploying:

### Frontend (Replit/Vercel):
- [ ] `VITE_SUPABASE_URL` set in Replit Secrets or Vercel
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` set in Replit Secrets or Vercel
- [ ] Repl restarted or Vercel redeployed

### Backend (Supabase):
- [ ] `LOVABLE_API_KEY` set in Supabase Edge Functions secrets
- [ ] All Edge Functions deployed
- [ ] Functions tested and working

## 🐛 Troubleshooting

### "Supabase URL not found" error:
- Check `VITE_SUPABASE_URL` is set in Replit Secrets
- Verify the URL is correct (starts with `https://`)
- Restart the Repl after adding secrets

### "API key missing" error:
- Check `VITE_SUPABASE_PUBLISHABLE_KEY` is set
- Verify it's the **anon key**, not service role key
- Restart the Repl after adding secrets

### "LOVABLE_API_KEY not configured" error:
- This is a **backend error**, not frontend
- Set `LOVABLE_API_KEY` in Supabase Edge Functions secrets
- Redeploy the Edge Functions after setting the secret

### Functions not working:
- Verify `LOVABLE_API_KEY` is set in Supabase
- Check Edge Functions are deployed
- Verify CORS settings in functions
- Check Supabase function logs for errors

## 📚 Additional Resources

- [Supabase Environment Variables](https://supabase.com/docs/guides/functions/secrets)
- [Replit Secrets Documentation](https://docs.replit.com/programming-ide/storing-sensitive-information-environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

