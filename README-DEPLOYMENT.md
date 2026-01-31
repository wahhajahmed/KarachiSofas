# Karachi Sofas - E-commerce Platform

A modern e-commerce platform built with Next.js, React, and Supabase for furniture shopping.

## Features

- Browse furniture by category
- User authentication & registration
- Shopping cart functionality
- Admin panel for product management
- Order tracking system

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database & authentication)
- **Deployment**: Vercel

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wahhajahmed/KARACHI-SOFAS)

### One-Click Deployment Steps:

1. **Click the "Deploy with Vercel" button above**
2. **Connect your GitHub account** (if not already connected)
3. **Add Environment Variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
4. **Click Deploy** - Vercel will automatically build and deploy your site!

### Get Supabase Credentials:
1. Go to [supabase.com](https://supabase.com)
2. Create a new project (or use existing)
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📦 Manual Deployment

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- A GitHub account
- A Vercel account

### Step-by-Step Setup

#### 1. Clone and Setup Repository

```bash
git clone https://github.com/wahhajahmed/KARACHI-SOFAS.git
cd KARACHI-SOFAS/KarachiSofas
npm install
```

#### 2. Configure Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

#### 3. Setup Database

Run the SQL schema in your Supabase project:
- Go to Supabase Dashboard > SQL Editor
- Run the schema from `db/schema.sql`

#### 4. Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel
```

**Option B: Using Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js
5. Add environment variables
6. Click "Deploy"

## 🛠️ Local Development

### Run Frontend (Customer Site)
```bash
npm run dev:frontend
# Runs on http://localhost:3000
```

### Run Admin Panel
```bash
npm run dev:admin
# Runs on http://localhost:3001
```

### Run Both (Production Build)
```bash
npm run build
```

## 📁 Project Structure

```
KarachiSofas/
├── frontend/          # Customer-facing e-commerce site (Port 3000)
│   ├── components/    # React components
│   ├── pages/         # Next.js pages
│   ├── styles/        # Tailwind CSS styles
│   └── lib/           # Utilities & Supabase client
├── admin/             # Admin panel (Port 3001)
│   ├── components/    # Admin components
│   ├── pages/         # Admin pages
│   └── context/       # State management
├── db/                # Database schema & migrations
├── vercel.json        # Vercel configuration
└── package.json       # Monorepo workspace config
```

## 🔧 Configuration Files

### `vercel.json`
Configures Vercel to build only the frontend workspace for production deployment.

### `.gitignore`
Ensures `.next`, `node_modules`, and sensitive files are not committed.

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key | ✅ Yes |

## 🐛 Troubleshooting

### Build Errors on Vercel

**Issue**: `WARNING: You should not upload the .next directory`
- **Solution**: Already fixed! `.next` is in `.gitignore`

**Issue**: Build fails with missing environment variables
- **Solution**: Add env vars in Vercel dashboard under Settings > Environment Variables

**Issue**: Supabase connection fails
- **Solution**: Double-check your Supabase URL and key are correct

### Local Development Issues

**Issue**: Port already in use
```bash
# Kill the process on port 3000
npx kill-port 3000
```

**Issue**: Module not found errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For issues or questions, please open an issue on GitHub.

## 📄 License

MIT License - feel free to use this project for your own purposes!
