# Getting Started with Gameboxd ⚡

Welcome! This is your quick-start guide to get Gameboxd running in 15 minutes.

## What You Need (5 min)

### 1. Install Node.js
- Go to https://nodejs.org
- Download LTS version
- Follow installation wizard
- Verify: Open terminal and type `node --version`

### 2. Create Free Accounts (2 services)

**Supabase** (Database)
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up → Create organization → Create project
4. Wait for project to initialize (~2 min)

**RAWG.io** (Game Database)
1. Go to https://rawg.io/api
2. Sign up
3. Go to API Keys section
4. Copy your API key

## Installation (5 min)

### Step 1: Clone Project
```bash
# In your terminal/command prompt:
git clone https://github.com/yourusername/gameboxd.git
cd gameboxd
npm install
```

### Step 2: Configure Environment

Create file `.env.local` in the `gameboxd` folder:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_RAWG_API_KEY=your-rawg-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**How to get each key:**

**Supabase Keys:**
1. Log into Supabase dashboard
2. Go to Settings → API
3. Copy the two keys

**RAWG Key:**
1. Log into RAWG
2. Go to API Keys section
3. Copy your key

### Step 3: Setup Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open file: `supabase/migrations/001_initial_schema.sql`
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **Run**

You should see green checkmarks ✓ for each SQL statement.

### Step 4: Run App

```bash
npm run dev
```

You'll see:
```
> next dev
✓ Ready in 1.2s
```

**Open browser**: http://localhost:3000

## What Works Now ✅

- **Home Page** - Landing page with features
- **Explore** - Search for games by name
- **Trending** - View top-rated games
- **Game Details** - Click any game to see details
- **Ratings** - Star rating system (saves locally)
- **Interactions** - Mark games as played, add to wishlist, like
- **Responsive Design** - Works on mobile and desktop
- **PWA Ready** - Can be installed as app (work in progress)

## What Needs API Routes ⚠️

These features work locally but need backend APIs to persist data:

- User signup/login (UI done, backend connection needed)
- Review submission (UI done, needs database connection)
- Saving interactions (local only)
- User profiles (not yet implemented)

## Test It Out! 🎮

Try these:

1. **Search Games**
   - Click "Explore"
   - Type "Elden Ring"
   - Click on a game card

2. **Rate a Game**
   - On game detail page
   - Click 5 stars
   - See rating update

3. **Mark as Played**
   - On game detail page
   - Click "Played" button
   - Button changes color

## What's Next?

### Immediate (Next Session)
- [ ] Implement authentication APIs
- [ ] Connect review submission to database
- [ ] Add user profile pages
- [ ] Set up API routes

### Soon (Week 2)
- [ ] Display community reviews
- [ ] User stats dashboard
- [ ] Social features
- [ ] Advanced search

### Later (Week 3+)
- [ ] Real-time updates
- [ ] Notifications
- [ ] Mobile app optimization
- [ ] Production deployment

## Troubleshooting

### "Can't find games"
```
✓ Check RAWG API key in .env.local
✓ Restart dev server (Ctrl+C, npm run dev)
✓ Check browser console (F12)
```

### "Database connection failed"
```
✓ Check Supabase keys in .env.local
✓ Verify tables exist in Supabase
✓ Check internet connection
```

### "Port 3000 in use"
```bash
# Use different port:
npm run dev -- -p 3001
# Visit http://localhost:3001
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Home page |
| `src/app/explore/page.tsx` | Game search |
| `src/app/game/[id]/page.tsx` | Game details |
| `src/lib/rawg.ts` | Game API |
| `src/lib/supabase.ts` | Database |
| `src/lib/store.ts` | State management |
| `.env.local` | Your secrets ⚠️ |

## Quick Command Reference

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Clear terminal
clear  # Mac/Linux
cls    # Windows
```

## Project Structure

```
gameboxd/
├── public/        → Icons, manifest, service worker
├── src/
│   ├── app/       → Pages (home, explore, game details)
│   ├── components/ → UI components (Header, GameCard)
│   ├── lib/       → Services (RAWG, Supabase, state)
│   └── types/     → TypeScript definitions
├── supabase/      → Database schema
└── .env.local     → Your API keys (create this!)
```

## Need Help?

1. **Documentation**: Read SETUP.md and README.md
2. **Architecture**: See ARCHITECTURE.md
3. **Roadmap**: Check ROADMAP.md for planned features
4. **Errors**: Check browser console (F12) and terminal

## Quick Tips

### Styling
- **Colors**: Primary=#00D084 (green), Dark theme
- **Spacing**: Using Tailwind utilities (px-4, py-8, etc.)
- **Components**: Glass effect, card styling already included

### Adding Features
1. Create page in `src/app/`
2. Use components from `src/components/`
3. Connect to API via `src/lib/`
4. Style with Tailwind CSS

### Best Practices
- ✅ Use TypeScript types
- ✅ Keep components small and reusable
- ✅ Put business logic in `src/lib/`
- ✅ Use Zustand for UI state
- ✅ Never commit `.env.local`

## ⚡ Performance Tips

The app is already optimized:
- ✓ Images compressed
- ✓ CSS minimized
- ✓ Service Worker for offline
- ✓ Lazy loading components
- ✓ Database indexes on important columns

## 🔒 Security

Your `.env.local` contains secrets:
```env
SUPABASE_SERVICE_ROLE_KEY=SECRET  ← Never share this!
NEXT_PUBLIC_RAWG_API_KEY=KEY      ← Only for API rate limiting
```

`.env.local` is in `.gitignore` - won't be uploaded to GitHub.

---

## 🎯 Success Checklist

- [ ] Node.js installed
- [ ] Supabase account created
- [ ] RAWG account created
- [ ] `.env.local` file created with keys
- [ ] Database initialized (SQL executed)
- [ ] `npm install` ran successfully
- [ ] `npm run dev` runs without errors
- [ ] Browser opens to http://localhost:3000
- [ ] Can search for games
- [ ] Can view game details
- [ ] Can rate games (locally)

**If all ✓, you're ready to develop!**

---

## 📚 Documentation Files

Read in this order:

1. **This file** (you are here) - Overview
2. **README.md** - Features and deployment
3. **SETUP.md** - Detailed setup instructions
4. **ARCHITECTURE.md** - Technical details
5. **ROADMAP.md** - Development plan

---

**🎮 Welcome to Gameboxd! Happy coding!**

Still stuck? Check the Troubleshooting section or read the full SETUP.md guide.
