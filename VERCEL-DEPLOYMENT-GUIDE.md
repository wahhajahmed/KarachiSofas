# Karachi Sofas - Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
- GitHub repository with your code
- Supabase account with project created
- Vercel account

### Step 1: Configure Environment Variables

You need to add these environment variables in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://bqifhhlnyovcqzhuggdo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository: `wahhajahmed/KarachiSofas`
3. Configure the project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** Leave blank (vercel.json handles this)
   - **Build Command:** Auto-configured via vercel.json
   - **Output Directory:** Auto-configured via vercel.json
4. Add environment variables:
   - Click "Environment Variables"
   - Add both variables listed above
   - Apply to: Production, Preview, and Development
5. Click **Deploy**

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project directory
cd "C:\Users\ADMIN\Desktop\KARACHI SOFAS\KarachiSofas"

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

When prompted, add the environment variables.

### Step 3: Verify Deployment

After deployment:
- Your site will be live at: `https://your-project.vercel.app`
- Check Vercel dashboard for build logs
- Test all features to ensure proper functionality

### What's Configured

✅ **vercel.json** - Properly configured for monorepo  
✅ **Environment Variables** - Set up for both local and production  
✅ **.gitignore** - Excludes .next, node_modules, .env.local  
✅ **next.config.js** - Optimized for both frontend and admin  
✅ **Image Optimization** - Configured for Supabase and external sources  

### Automatic Deployments

Every push to `main` branch triggers automatic deployment on Vercel.

### Troubleshooting

**Build Fails:**
- Check Vercel build logs
- Verify environment variables are set correctly
- Ensure all dependencies are in package.json

**Environment Variables Not Working:**
- Variables must start with `NEXT_PUBLIC_` to be exposed to browser
- Redeploy after adding/changing environment variables
- Clear build cache in Vercel settings if needed

**Images Not Loading:**
- Verify Supabase URL is correct in environment variables
- Check image domains in next.config.js
- Ensure Supabase storage is publicly accessible

### Support

For issues:
1. Check Vercel deployment logs
2. Verify Supabase connection
3. Review environment variable configuration

---

**Note:** Never commit `.env.local` files to Git. Use `.env.example` as a template.
