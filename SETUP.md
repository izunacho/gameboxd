# Gameboxd Setup Guide 🚀

Complete step-by-step guide to get Gameboxd running on your machine.

## Prerequisites

Before you start, make sure you have:

- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org)
- **Git** - Download from [git-scm.com](https://git-scm.com)
- **A text editor** - VSCode recommended from [code.visualstudio.com](https://code.visualstudio.com)

Verify installation:
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
git --version   # Should show a version
```

## Step 1: Clone and Setup

### 1.1 Open Terminal/Command Prompt

- **Windows**: Press `Win + R`, type `cmd`, press Enter
- **Mac/Linux**: Open Terminal app

### 1.2 Navigate to desired folder and clone

```bash
# Navigate to where you want the project (example)
cd C:\Users\YourName\Documents

# Clone the repository (replace with your GitHub URL)
git clone https://github.com/yourusername/gameboxd.git

# Enter the project directory
cd gameboxd
```

### 1.3 Install dependencies

```bash
npm install
```

This downloads all required packages (~500MB). Takes 2-5 minutes.

## Step 2: Get RAWG API Key (Video Game Database)

### 2.1 Visit RAWG.io

Go to: https://rawg.io/api

### 2.2 Sign Up
1. Click "Sign Up" (top right)
2. Enter email and password
3. Verify your email

### 2.3 Get Your API Key
1. After signing in, go to "Settings" → "API Keys"
2. Click "Create New API Key" (or view existing)
3. Copy the key (looks like: `abc123def456...`)

Keep this key safe!

## Step 3: Setup Supabase (Database)

Supabase provides free database hosting. It's like Firebase but with PostgreSQL.

### 3.1 Create Supabase Account

Go to: https://supabase.com

1. Click "Start your project" 
2. Sign up with GitHub (easiest) or email
3. Create new organization (name: whatever you want)

### 3.2 Create New Project

1. Click "New Project"
2. Configure:
   - **Name**: `gameboxd` (or any name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you (us-east-1 recommended)
3. Click "Create new project" and wait (~2 minutes)

### 3.3 Get Your Project Keys

Once project is created:

1. Go to **Settings** (bottom left) → **API**
2. You'll see:
   - **Project URL** (starts with `https://...supabase.co`)
   - **Project API keys** section with two keys:
     - `anon public` key (for client-side)
     - `service_role secret` key (for admin operations)

Copy these carefully:

```
NEXT_PUBLIC_SUPABASE_URL = [Project URL from step above]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [anon public key]
SUPABASE_SERVICE_ROLE_KEY = [service_role secret key]
```

## Step 4: Setup Database Schema

### 4.1 Open SQL Editor in Supabase

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**

### 4.2 Create Tables

1. Open the file `supabase/migrations/001_initial_schema.sql` in your project
2. Copy ALL the SQL code
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

You should see green checkmarks indicating success.

### 4.3 Verify Tables Created

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - `users`
   - `games`
   - `reviews`
   - `interactions`
   - `review_likes`

## Step 5: Create .env.local File

### 5.1 In your `gameboxd` folder, create a new file named `.env.local`

**Windows (Command Prompt):**
```bash
type nul > .env.local
```

Or just create a file using your editor.

### 5.2 Add Your Credentials

Open `.env.local` and paste (replace with YOUR actual keys):

```env
# Supabase - Copy from Step 3.3
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# RAWG API - From Step 2.3
NEXT_PUBLIC_RAWG_API_KEY=your-rawg-api-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

⚠️ **IMPORTANT**: Never commit `.env.local` to GitHub! It's in `.gitignore` for security.

## Step 6: Run Development Server

### 6.1 Start the app

```bash
npm run dev
```

You should see:
```
> gameboxd@0.1.0 dev
> next dev

  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
```

### 6.2 Open in Browser

Go to: **http://localhost:3000**

You should see the Gameboxd homepage!

### 6.3 Test Features

1. **Search Games**: Click "Explore" → search for "Elden Ring"
2. **View Game Details**: Click any game card
3. **Rate Games**: Go to game page → use star rating

## Step 7: Troubleshooting

### "RAWG API not configured"

**Problem**: Games won't load, you see this message.

**Solution**:
1. Check `.env.local` has `NEXT_PUBLIC_RAWG_API_KEY` set
2. Verify the key is correct from rawg.io
3. Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

### "Supabase connection failed"

**Problem**: Can't connect to database.

**Solution**:
1. Check `.env.local` has correct Supabase keys
2. Verify Supabase project is active (not paused)
3. Check your internet connection
4. Verify database tables exist (go to Supabase → Table Editor)

### "Port 3000 already in use"

**Problem**: Another app is using port 3000.

**Solution**:
```bash
# Use a different port
npm run dev -- -p 3001
# Now open http://localhost:3001
```

### "npm install failed"

**Problem**: Modules won't install.

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules folder
rm -rf node_modules

# Try installing again
npm install
```

## Step 8: Next Development Steps

Now that it's running, you can:

### Add Authentication Pages
- Complete login/signup flow
- User profile pages

### Connect API Routes
Create `src/app/api/` routes to:
- Handle review submissions
- Save user interactions to database
- Fetch reviews from database

### Add User Profiles
- Show user's games played, wishlist, reviews
- Allow following other users

### Deploy to Production
- Push to GitHub
- Deploy on Vercel (free)
- Your app will have a public URL

## Step 9: Project Structure Guide

```
gameboxd/
├── src/
│   ├── app/                    # Pages and routes
│   │   ├── page.tsx            # Home page (/)
│   │   ├── explore/            # Search games (/explore)
│   │   ├── game/[id]/          # Game detail (/game/123)
│   │   ├── trending/           # Trending (/trending)
│   │   ├── auth/               # Auth pages
│   │   └── layout.tsx          # Root layout (shared on all pages)
│   ├── components/             # Reusable React components
│   │   ├── Header.tsx          # Top navigation
│   │   └── GameCard.tsx        # Game card display
│   ├── lib/                    # Helper functions and services
│   │   ├── supabase.ts         # Database client
│   │   ├── rawg.ts             # Game API client
│   │   └── store.ts            # State management
│   └── types/                  # TypeScript definitions
├── public/                     # Static files
│   ├── manifest.json           # PWA settings
│   └── sw.js                   # Service Worker
├── supabase/
│   └── migrations/             # Database setup SQL
├── .env.local                  # Your secret keys (created by you)
├── package.json                # Dependencies list
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind CSS config
└── README.md                   # Documentation
```

## Step 10: Common Git Commands

When you're ready to upload to GitHub:

```bash
# Check status
git status

# Add all changes
git add .

# Create a commit
git commit -m "Initial gameboxd setup"

# Push to GitHub (if you've set up remote)
git push origin main
```

## Getting Help

If you get stuck:

1. **Check the README.md** - Most questions answered there
2. **Check error messages** - Copy paste into Google
3. **Supabase Docs** - https://supabase.com/docs
4. **RAWG API Docs** - https://rawg.io/api
5. **Next.js Docs** - https://nextjs.org/docs

---

🎮 **You're all set! Start building Gameboxd!**

For more info, see README.md

