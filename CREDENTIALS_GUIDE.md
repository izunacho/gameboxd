# Gameboxd Credentials & API Keys Guide 🔑

Complete guide to obtaining all credentials needed for Gameboxd.

## Summary: What You Need

| Service | Type | Free? | Time | Status |
|---------|------|-------|------|--------|
| Node.js | Runtime | Yes | 5 min | Install locally |
| Supabase | Database | Yes | 5 min | Cloud account |
| RAWG API | Game DB | Yes | 2 min | Cloud account |
| GitHub | Code Hosting | Yes | 2 min | Cloud account |
| Vercel | Hosting | Yes | 2 min | Cloud account |

**Total Setup Time**: ~15 minutes

---

## 1. Node.js (Required)

### What is it?
Runtime environment to run JavaScript/Next.js on your machine.

### Get it
1. Go to: https://nodejs.org/en/
2. Download: **LTS** version (not latest)
3. Run installer, accept defaults
4. Restart terminal/command prompt

### Verify
```bash
node --version   # Should show v20.x.x or higher
npm --version    # Should show 10.x.x or higher
```

### ✅ Status
- [x] Installed locally on your machine

---

## 2. Supabase (Database)

### What is it?
PostgreSQL database in the cloud + authentication service.

### Get it

#### Step 1: Create Account
1. Go to: https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (fastest) or email
4. Create organization (name: anything)

#### Step 2: Create Project
1. Click "New Project"
2. Fill in:
   - **Name**: `gameboxd`
   - **Database Password**: Create strong password (save it!)
   - **Region**: Choose closest region (US: `us-east-1`)
3. Click "Create new project"
4. Wait 2-3 minutes...

#### Step 3: Get Your Keys
Once project is created:

1. Go to **Settings** → **API**
2. You'll see:
   - **Project URL** (looks like: `https://abc123def.supabase.co`)
   - **API Keys** section with two keys:
     - `anon public` - Use in `.env.local`
     - `service_role secret` - Keep private!

#### Step 4: Copy Keys to .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

#### Step 5: Initialize Database
1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy from: `supabase/migrations/001_initial_schema.sql`
4. Paste into SQL Editor
5. Click **Run**

✅ Tables created: `users`, `games`, `reviews`, `interactions`, `review_likes`

### 📋 Copy These Values

```
NEXT_PUBLIC_SUPABASE_URL = 
  [paste Project URL here]

NEXT_PUBLIC_SUPABASE_ANON_KEY = 
  [paste anon public key here]

SUPABASE_SERVICE_ROLE_KEY = 
  [paste service_role secret here]
```

### ✅ Status
- [ ] Supabase account created
- [ ] Project created
- [ ] Keys copied to .env.local
- [ ] Database schema initialized

---

## 3. RAWG API (Game Database)

### What is it?
Free API with database of 500,000+ video games, ratings, screenshots, platforms.

### Get it

#### Step 1: Visit RAWG
Go to: https://rawg.io/api

#### Step 2: Sign Up
1. Click "Sign Up" (top right)
2. Enter email + password
3. Verify email
4. Sign in

#### Step 3: Get API Key
1. After signing in, click your **username** → **Settings**
2. Go to **API Keys**
3. You'll see your API key (40+ character string)
4. Copy it

#### Step 4: Add to .env.local
```env
NEXT_PUBLIC_RAWG_API_KEY=[paste your key here]
```

### Important
- **Rate Limit**: 20 requests/minute (free tier)
- **No Authentication**: Key is public (no need for secret key)
- **No Costs**: Free forever for reasonable usage

### 📋 Copy This Value

```
NEXT_PUBLIC_RAWG_API_KEY = 
  [paste your RAWG API key here]
```

### ✅ Status
- [ ] RAWG account created
- [ ] API key obtained
- [ ] Added to .env.local

---

## 4. GitHub (Code Hosting - Optional but Recommended)

### What is it?
Version control and code hosting platform. Upload your code here before deploying.

### Get it
1. Go to: https://github.com
2. Click "Sign up"
3. Create account
4. Verify email

### Usage
```bash
# Initialize git in your project
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial gameboxd setup"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/gameboxd.git

# Push to GitHub
git push -u origin main
```

### ✅ Status
- [ ] GitHub account created
- [ ] Repository created
- [ ] Code pushed

---

## 5. Vercel (Hosting - Optional but Recommended)

### What is it?
Free hosting platform optimized for Next.js applications.

### Get it
1. Go to: https://vercel.com
2. Sign up with GitHub (recommended)
3. Connect your GitHub account
4. Import `gameboxd` repository

### Deploy
1. Click "Import Project"
2. Select your gameboxd GitHub repo
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL = ...
   NEXT_PUBLIC_SUPABASE_ANON_KEY = ...
   SUPABASE_SERVICE_ROLE_KEY = ...
   NEXT_PUBLIC_RAWG_API_KEY = ...
   NEXT_PUBLIC_APP_URL = https://gameboxd-yourusername.vercel.app
   ```
4. Click "Deploy"
5. Your app is live! 🎉

### ✅ Status
- [ ] Vercel account created
- [ ] GitHub connected
- [ ] Environment variables added
- [ ] Deployed successfully

---

## Your .env.local Template

Create file: `.env.local` in your project root

```env
# ==================== SUPABASE ====================
# From: Supabase Dashboard → Settings → API → Project Configuration

NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ==================== RAWG API ====================
# From: RAWG.io → Settings → API Keys

NEXT_PUBLIC_RAWG_API_KEY=your-rawg-api-key-here

# ==================== APPLICATION ====================

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step-by-Step Checklist

### ✅ Phase 1: Local Setup (15 min)
- [ ] Install Node.js
- [ ] Create Supabase account
- [ ] Create RAWG account
- [ ] Create `.env.local` with all keys
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Search for a game (e.g., "Elden Ring")

### ✅ Phase 2: Persistence (Optional, 10 min)
- [ ] Create GitHub account
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Connect to Vercel
- [ ] Deploy to Vercel
- [ ] Share live URL with team

---

## Credential Security

### DO ✅
- Keep `.env.local` **SECRET** (in `.gitignore`)
- Use strong passwords for Supabase
- Rotate RAWG key if leaked
- Regenerate Supabase keys if needed

### DON'T ❌
- Commit `.env.local` to GitHub
- Share `.env.local` file
- Expose `SUPABASE_SERVICE_ROLE_KEY` in frontend
- Use same password everywhere

### If Compromised
1. **RAWG Key**: Generate new key at rawg.io/api
2. **Supabase Keys**: Regenerate at Supabase dashboard
3. **Database Password**: Reset via Supabase dashboard
4. Update `.env.local` with new keys

---

## Troubleshooting

### "Cannot find RAWG_API_KEY"
```
1. Check .env.local exists
2. Verify NEXT_PUBLIC_RAWG_API_KEY is set
3. Restart npm run dev
4. Check browser console (F12)
```

### "Supabase connection refused"
```
1. Verify NEXT_PUBLIC_SUPABASE_URL is correct
2. Check anon key is set correctly
3. Verify database tables exist
4. Check internet connection
5. Check Supabase project is active (not paused)
```

### "Key not working - 401 error"
```
1. Double-check you copied the entire key
2. Check for extra spaces or quotes
3. Regenerate key and try again
4. Check API rate limit not exceeded
```

---

## Quick Reference URLs

| Service | URL |
|---------|-----|
| Node.js Download | https://nodejs.org/en/ |
| Supabase | https://supabase.com |
| RAWG API | https://rawg.io/api |
| GitHub | https://github.com |
| Vercel | https://vercel.com |

---

## Support

- **Node.js Help**: https://nodejs.org/en/docs/
- **Supabase Docs**: https://supabase.com/docs
- **RAWG API Docs**: https://rawg.io/api
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

---

**Last Updated**: 2026-01-09  
**Next Review**: When setting up production credentials
