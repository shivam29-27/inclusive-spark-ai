# 🚀 Quick Environment Variables Setup

## ✅ For Replit (Frontend) - ONLY These 2 Variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Where to Get:
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to: **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`

### Where to Add in Replit:
1. Click **🔒 Secrets** tab
2. Add each variable
3. Restart Repl

---

## ❌ DO NOT Add to Replit:

- ~~`LOVABLE_API_KEY`~~ ← This goes in Supabase, NOT Replit!
- ~~`SUPABASE_URL`~~ ← Use `VITE_SUPABASE_URL` instead
- ~~`SUPABASE_SERVICE_ROLE_KEY`~~ ← Never use in frontend!

---

## 🔴 For Supabase Edge Functions (Backend):

```
LOVABLE_API_KEY=your_lovable_api_key
```

### Where to Add:
1. Go to: Supabase Dashboard → Your Project
2. Go to: **Edge Functions** → **Settings** → **Secrets**
3. Add: `LOVABLE_API_KEY`
4. Value: Your Lovable API key

### OR via CLI:
```bash
supabase secrets set LOVABLE_API_KEY=your-key-here
```

---

## 📋 Summary:

| Variable | Where to Set | Purpose |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Replit Secrets | Frontend → Supabase connection |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Replit Secrets | Frontend → Supabase auth |
| `LOVABLE_API_KEY` | Supabase Secrets | Backend → AI API calls |

---

## ⚠️ Common Mistakes:

1. ❌ Adding `LOVABLE_API_KEY` to Replit → **WRONG!**
2. ❌ Using service role key in frontend → **DANGEROUS!**
3. ❌ Forgetting to restart Repl after adding secrets → **Won't work!**

---

## ✅ Quick Checklist:

- [ ] `VITE_SUPABASE_URL` added to Replit Secrets
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` added to Replit Secrets
- [ ] Repl restarted after adding secrets
- [ ] `LOVABLE_API_KEY` added to Supabase Edge Functions Secrets
- [ ] All Edge Functions deployed

---

## 🆘 Still Having Issues?

See `ENVIRONMENT_VARIABLES.md` for detailed instructions.

