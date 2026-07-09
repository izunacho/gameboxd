# 🎮 START HERE - Gameboxd Setup 

Welcome! Follow this guide step by step. Takes ~20 minutes.

---

## 📋 Pre-Flight Checklist

Before you start, you have:
- [ ] Internet connection
- [ ] A text editor (VSCode recommended)
- [ ] This folder open
- [ ] Coffee/snacks ☕

---

## Step 1: Install Node.js (5 min)

### Do This ONCE Only

1. **Download Node.js**
   - Go to: https://nodejs.org
   - Download: **LTS** version (not Latest)
   - Double-click installer
   - Follow wizard (accept all defaults)

2. **Verify Installation**
   - Open Command Prompt (Windows) or Terminal (Mac/Linux)
   - Type: `node --version`
   - Should show: `v20.x.x` or higher ✅

---

## Step 2: Create API Accounts (10 min)

You need TWO free accounts. Takes ~10 minutes total.

### Account 1: Supabase (Database)

1. Go to: https://supabase.com
2. Click "Start your project"
3. Sign up → Create organization → Create project
4. **Wait 2-3 minutes** for project to initialize...
5. Go to **Settings → API**
6. **Copy these three values:**
   ```
   Project URL: https://xxx.supabase.co
   Anon Public Key: eyJ...
   Service Role Key: eyJ...
   ```
7. **Paste into: `.env.local` file** (see Step 3)

### Account 2: RAWG API (Games Database)

1. Go to: https://rawg.io/api
2. Sign up → Verify email
3. Go to **API Keys** section
4. Copy your API key
5. **Paste into: `.env.local` file** (see Step 3)

---

## Step 3: Create `.env.local` File

1. Open this folder (`gameboxd`)
2. Create new file: `.env.local`
3. Paste this (with YOUR keys from Step 2):

```env
# From Supabase Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...paste your anon key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...paste your service role key...

# From RAWG API
NEXT_PUBLIC_RAWG_API_KEY=your-rawg-api-key-here

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ IMPORTANT**: Never commit `.env.local` to GitHub!

---

## Step 4: Setup Database (5 min)

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Click **SQL Editor** (left sidebar)
   - Click **New Query**

2. **Copy Database Schema**
   - Open file: `supabase/migrations/001_initial_schema.sql`
   - Copy ALL the SQL code

3. **Run in Supabase**
   - Paste code into SQL Editor
   - Click **Run**
   - Should see ✅ green checkmarks

---

## Step 5: Install & Run (3 min)

### Open Terminal/Command Prompt

```bash
# Navigate to gameboxd folder
cd path/to/gameboxd

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Open Browser

```
Go to: http://localhost:3000
```

You should see Gameboxd home page! 🎉

---

## Step 6: Test It Works

Try these to verify everything:

### Test 1: Search Games
- Click **"Explore"**
- Type: `Elden Ring`
- Should see game results ✅

### Test 2: View Game
- Click any game card
- Should see game details ✅

### Test 3: Rate Game
- On game page, click a star
- Should see rating update ✅

### Test 4: Mobile View
- Press `F12` in browser
- Click mobile icon
- Should be responsive ✅

---

## 🎯 Success Criteria

If you see these, you're done:
- [ ] Node.js installed (`node --version` works)
- [ ] Supabase project created
- [ ] RAWG API key obtained
- [ ] `.env.local` file created with keys
- [ ] Database tables initialized
- [ ] `npm run dev` starts without errors
- [ ] Browser opens to http://localhost:3000
- [ ] Can search for games
- [ ] Can view game details
- [ ] Can rate games

**If all ✓**: You're ready! 🚀

---

## ⚠️ If Something Goes Wrong

### "npm command not found"
- Node.js not installed properly
- Restart Command Prompt after installing Node.js
- Try `npm --version`

### "Module not found" errors
- Run: `npm install` again
- Delete `node_modules` folder and retry

### "RAWG API not configured"
- Check `.env.local` has `NEXT_PUBLIC_RAWG_API_KEY`
- Verify key is correct (copy from RAWG again)
- Restart dev server (Ctrl+C, then `npm run dev`)

### "Supabase connection failed"
- Check `.env.local` has correct Supabase keys
- Verify database tables exist
- Check internet connection

### Can't find `.env.local` file?
- Create it manually:
  - Right-click in folder → New File
  - Name it: `.env.local`
  - Paste credentials

### "Port 3000 already in use"
```bash
# Use different port:
npm run dev -- -p 3001
# Visit: http://localhost:3001
```

---

## 📚 Documentation

After setup, read in this order:

1. **README.md** - What is Gameboxd?
2. **ARCHITECTURE.md** - How it works
3. **ROADMAP.md** - What to build next

---

## 🚀 What's Next?

### After Verification (Day 1)
- [ ] Read README.md
- [ ] Explore the code structure
- [ ] Try the app in browser

### Soon (Week 1)
- [ ] Implement authentication APIs
- [ ] Connect database to frontend
- [ ] Build user profiles

### Production (Week 2-3)
- [ ] Deploy to Vercel
- [ ] Add community features
- [ ] Go live!

See **ROADMAP.md** for full development plan.

---

## Quick Reference

### Essential Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Run production
npm start

# Stop server
Ctrl + C

# Update dependencies
npm install
```

### Key Files

| File | Purpose |
|------|---------|
| `.env.local` | Your API keys ⚠️ |
| `src/app/page.tsx` | Home page |
| `src/app/explore/page.tsx` | Search games |
| `tailwind.config.ts` | Colors & styling |
| `src/lib/rawg.ts` | Game API |
| `src/lib/supabase.ts` | Database |

### Useful URLs

| Service | URL |
|---------|-----|
| Supabase | https://supabase.com |
| RAWG API | https://rawg.io/api |
| Next.js | https://nextjs.org/docs |
| Tailwind | https://tailwindcss.com |

---

## ✅ Validation Checklist

### Frontend Works? ✅
- [ ] App starts without errors
- [ ] Home page displays
- [ ] Header navigation works
- [ ] Mobile menu opens
- [ ] Can search games
- [ ] Game cards display

### Backend Works? ✅
- [ ] Supabase tables exist
- [ ] Can see games from RAWG
- [ ] Can rate games (locally)
- [ ] No console errors

### Configuration? ✅
- [ ] `.env.local` created
- [ ] All three Supabase keys set
- [ ] RAWG API key set
- [ ] `APP_URL` set to localhost

---

## Troubleshooting Tips

### General
- "Try turning it off and on again" (restart `npm run dev`)
- Check browser console: F12 → Console tab
- Check terminal output for error messages
- Verify internet connection

### Database Issues
- Go to Supabase dashboard
- Click "SQL Editor"
- Try: `SELECT * FROM games LIMIT 1;`
- If error: database not initialized

### API Issues
- Go to browser console (F12)
- Look for network errors
- Check API keys in `.env.local`
- Try manually: https://rawg.io/api/games?search=zelda

### Code Issues
- Check for typos
- Verify file paths
- Restart dev server
- Clear browser cache

---

## 💡 Pro Tips

1. **Use VSCode**
   - Free, has great TypeScript support
   - Extensions: Tailwind CSS, ESLint, Prettier

2. **Save Early and Often**
   - `git init` to start version control
   - `git add .` and `git commit -m "message"`

3. **Test on Mobile**
   - Press F12 → mobile icon to simulate
   - Or visit on actual phone: `http://[your-computer-ip]:3000`

4. **Read the Code**
   - Start with `src/app/page.tsx`
   - Then `src/components/Header.tsx`
   - Then other files

5. **Keep API Keys Safe**
   - Never commit `.env.local`
   - Never share keys publicly
   - Regenerate if leaked

---

## Support

Stuck? Check these in order:

1. **This file** - START_HERE.md
2. **Setup guide** - SETUP.md
3. **Quick start** - GETTING_STARTED.md
4. **Full docs** - README.md
5. **Architecture** - ARCHITECTURE.md
6. **Troubleshoot** - Look for similar issue

Or ask a developer friend / Stack Overflow!

---

## Timeline

| Task | Time | Status |
|------|------|--------|
| Install Node.js | 5 min | ⏱️ Do now |
| Create accounts | 10 min | ⏱️ Do now |
| Setup database | 5 min | ⏱️ Do now |
| Install & run | 3 min | ⏱️ Do now |
| **TOTAL** | **23 min** | 👈 You are here |

After this: Development takes weeks, deployment takes hours.

---

## Next: Onward! 🚀

**Once verification passes**, you're ready to:

1. Understand the architecture (ARCHITECTURE.md)
2. Plan development (ROADMAP.md)
3. Implement features (Coding phase)
4. Deploy to production (Vercel)

---

## Final Checklist Before You Start

- [ ] Read this entire file
- [ ] Have Supabase account ready
- [ ] Have RAWG API key ready
- [ ] Node.js installed
- [ ] Terminal open
- [ ] Ready to create `.env.local`

**If all checked**: Go to Step 1! ✅

---

# 🎮 Happy Coding!

Good luck! You're building something awesome. Feel free to reference any documentation as you go.

**Questions? See the documentation files in your project folder.**

---

**Last Updated**: 2026-01-09  
**Estimated Read Time**: 5 minutes  
**Estimated Setup Time**: 20 minutes
