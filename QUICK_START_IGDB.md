# Quick Start: IGDB Setup ⚡

**Time Required:** ~10 minutes

---

## Step 1: Get Twitch Credentials (5 min)

### Go to Twitch Developer Console
👉 https://dev.twitch.tv/console/apps

### Create App
1. Click **"Register Your Application"**
2. Fill in:
   - **Name:** `gameboxd`
   - **Redirect URL:** `http://localhost:3000`
   - **Category:** "Application"
3. Check terms
4. Click **"Create Application"**

### Copy Credentials
1. Click **"Manage"** on your app
2. You'll see:
   - **Client ID** → Copy this
   - **Client Secret** → Click "New Secret", copy it

---

## Step 2: Add to `.env.local` (2 min)

Open/create file: `.env.local` in your `gameboxd` folder

Paste this:
```env
# IGDB API Configuration (from Twitch Console)
IGDB_CLIENT_ID=your-client-id-here
IGDB_CLIENT_SECRET=your-client-secret-here

# Keep existing Supabase config
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 3: Restart Server (1 min)

```bash
# Stop current server (if running)
Ctrl + C

# Start dev server
npm run dev
```

---

## Step 4: Test It (2 min)

1. Open browser: http://localhost:3000
2. Click **"Explore"**
3. Type: `Elden Ring`
4. Should see games ✅

---

## 🎉 Done!

If you see game results with images, you're all set!

---

## Troubleshooting

### "Games not appearing"

**Check 1: Credentials Set?**
```bash
# Terminal should NOT show these errors:
# "IGDB_CLIENT_ID and IGDB_CLIENT_SECRET must be set"
```

**Check 2: Server Restarted?**
```bash
# Stop and restart:
Ctrl + C
npm run dev
```

**Check 3: Browser Console**
- Press F12 in browser
- Click "Console" tab
- Look for error messages

### "Error: Failed to authenticate"

**Solution:**
1. Go to: https://dev.twitch.tv/console/apps
2. Find your app
3. Click "Manage"
4. Copy Client ID and Secret again (carefully)
5. Update `.env.local`
6. Restart server

---

## Files You Don't Need to Touch

✅ Already done for you:
- ✅ `src/lib/igdb.ts` - IGDB service
- ✅ `src/lib/api-client.ts` - Frontend client
- ✅ `src/app/api/games/*` - API routes
- ✅ `src/components/GameCard.tsx` - Updated
- ✅ All pages updated

---

## What You Changed

1. Added Twitch app
2. Copied 2 credentials
3. Updated `.env.local`
4. Restarted server

**That's it!** Backend is ready to use.

---

## Where Are Credentials?

**In `.env.local` file:**
```
IGDB_CLIENT_ID=123abc...
IGDB_CLIENT_SECRET=456def...  ⚠️ KEEP SECRET!
```

**Never commit to GitHub** (it's in .gitignore)

---

## For Production

When deploying to Vercel:
1. Go to Project Settings → Environment Variables
2. Add `IGDB_CLIENT_ID`
3. Add `IGDB_CLIENT_SECRET`
4. Deploy

---

## Need More Help?

📖 Read:
- **IGDB_SETUP.md** - Detailed guide
- **MIGRATION_RAWG_TO_IGDB.md** - What changed
- **README.md** - General info

---

**Status:** Ready to develop! 🚀

Next: Build backend features (authentication, reviews, etc.)
