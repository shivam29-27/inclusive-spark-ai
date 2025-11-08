# Deploy to Replit

## 🚀 Quick Start Guide

### Step 1: Create a New Repl

1. Go to https://replit.com
2. Sign in or create an account
3. Click **"Create Repl"**
4. Select **"Import from GitHub"**
5. Enter your repository URL: `https://github.com/yourusername/inclusive-spark-ai`
6. Click **"Import"**

### Step 2: Configure Environment Variables

1. In Replit, click on the **"Secrets"** tab (🔒 icon) in the left sidebar
2. Add the following secrets:

   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   PORT=8080
   ```

3. Click **"Add secret"** for each variable

### Step 3: Install Dependencies

Replit will automatically run `npm install` when you import the project. If it doesn't:

1. Open the **Shell** tab
2. Run:
   ```bash
   npm install
   ```

### Step 4: Run Your App

1. Click the **"Run"** button at the top
2. Replit will start the development server
3. Your app will be available at the URL shown in the output

### Step 5: Deploy to Production (Optional)

1. Click the **"Deploy"** button (rocket icon)
2. Follow the prompts to create a deployment
3. Your app will be live at a public URL

## 📋 Environment Variables Setup

### Required Secrets in Replit (Frontend Only):

1. **VITE_SUPABASE_URL**
   - Get from: Supabase Dashboard → Settings → API → Project URL
   - Example: `https://your-project-id.supabase.co`

2. **VITE_SUPABASE_PUBLISHABLE_KEY**
   - Get from: Supabase Dashboard → Settings → API → anon public key
   - ⚠️ Use the **anon/public key**, NOT the service role key

3. **PORT** (optional, defaults to 8080)
   - Replit will set this automatically, but you can override it

### ⚠️ Important: LOVABLE_API_KEY

**DO NOT** add `LOVABLE_API_KEY` to Replit Secrets!

- `LOVABLE_API_KEY` is only needed in **Supabase Edge Functions** (backend)
- Set it in Supabase Dashboard → Edge Functions → Secrets
- See `ENVIRONMENT_VARIABLES.md` for detailed instructions

### How to Add Secrets:

1. Click the **🔒 Secrets** tab in Replit
2. Click **"New secret"**
3. Enter the key and value
4. Click **"Add secret"**
5. Restart the Repl for changes to take effect

## 🔧 Replit Configuration Files

### `.replit` File
- Configures how Replit runs your project
- Sets the run command and language
- Configures deployment settings

### `replit.nix` File
- Defines system dependencies
- Specifies Node.js version
- Configures language servers

## 🎯 Development Workflow

### Running in Development Mode:
1. Click **"Run"** button
2. App runs on port 8080 (or PORT env variable)
3. Hot reload is enabled
4. Changes auto-refresh

### Building for Production:
```bash
npm run build
```

### Preview Production Build:
```bash
npm run preview
```

## 🚨 Troubleshooting

### Port Already in Use
- Replit automatically assigns ports
- Use `$PORT` environment variable
- Check the console for the actual port

### Environment Variables Not Working
- Make sure secrets are added in Replit Secrets tab
- Restart the Repl after adding secrets
- Check that variable names start with `VITE_` for Vite

### Build Errors
- Check Node.js version (should be 18+)
- Run `npm install` to ensure dependencies are installed
- Check console for specific error messages

### API Errors
- Verify Supabase credentials are correct
- Check that Supabase Edge Functions are deployed
- Verify CORS settings in Supabase

## 📦 Replit Features

### Auto-Deploy
- Replit can auto-deploy on every run
- Or deploy manually using the Deploy button

### Custom Domain
- Upgrade to Replit Hacker plan
- Add custom domain in project settings

### Collaboration
- Share your Repl with others
- Real-time collaboration
- Comments and suggestions

## 🔐 Security Notes

1. **Never commit secrets** to Git
2. Use Replit Secrets for sensitive data
3. Environment variables are secure in Replit
4. Production deployments use HTTPS

## ✅ Checklist

Before deploying:
- [ ] Environment variables set in Replit Secrets
- [ ] Dependencies installed (`npm install`)
- [ ] App runs locally in Replit
- [ ] All features tested
- [ ] Supabase functions deployed
- [ ] Build succeeds (`npm run build`)

## 🎉 Success!

Once deployed, you'll have:
- ✅ Live production URL
- ✅ HTTPS enabled
- ✅ Auto-reload on changes
- ✅ Public access
- ✅ Replit hosting

## 📚 Additional Resources

- [Replit Documentation](https://docs.replit.com)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Documentation](https://supabase.com/docs)

