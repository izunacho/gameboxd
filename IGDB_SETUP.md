# IGDB API Setup Guide 🎮

Complete guide to setting up IGDB (Internet Game Database) with Twitch authentication.

---

## Overview

**What Changed:**
- ❌ Removed RAWG API
- ✅ Added IGDB API (better data, high-res images)
- ✅ Added Twitch Developer authentication
- ✅ Secure backend API routes (credentials never exposed to frontend)

**Why IGDB?**
- More games (500,000+)
- Better metadata (platforms, genres, storyline)
- High-quality cover images (2000x3000 resolution)
- Professional API documentation
- Free tier available

---

## Architecture: How It Works

### Before (Direct API Call - ❌ Insecure)
```
Frontend
  ↓
RAWG API (with key in browser)  ← EXPOSED!
  ↓
Games
```

### After (Secure Backend - ✅ Safe)
```
Frontend (Browser)
  ↓
Next.js API Routes
  ↓
IGDB API (using Twitch OAuth)
  ↓
Games

Benefits:
✅ Twitch credentials stay on server (secure)
✅ Token cached (fewer API calls)
✅ Rate limiting controlled server-side
✅ Frontend never sees sensitive data
```

---

## Step 1: Get Twitch Developer Credentials

### 1.1 Create Twitch Account
If you don't have one:
1. Go to: https://www.twitch.tv/
2. Click **Sign Up**
3. Create account
4. Verify email

### 1.2 Register Application
1. Go to: https://dev.twitch.tv/console/apps
2. Click **Register Your Application**
3. Fill in:
   - **Application Name**: `gameboxd` (or your project name)
   - **OAuth Redirect URL**: `http://localhost:3000` (for dev)
   - **Application Category**: Select `Application`
4. Check terms → **Create Application**

### 1.3 Get Credentials
1. You'll see your application listed
2. Click **Manage** on your app
3. You'll see:
   - **Client ID**: Copy this
   - **Client Secret**: Click "New Secret", copy it

### Important!
```
CLIENT_ID: public-ish (rarely exposed)
CLIENT_SECRET: ⚠️ NEVER share! Keep it SECRET!
```

---

## Step 2: Add Credentials to `.env.local`

Create/edit file: `.env.local` in your project root

```env
# ======================
# IGDB API CONFIGURATION
# ======================
# Get from: https://dev.twitch.tv/console/apps

# Your Twitch Application Client ID
IGDB_CLIENT_ID=your-client-id-here

# Your Twitch Application Client Secret
# ⚠️ KEEP THIS SECRET! Never commit to GitHub!
IGDB_CLIENT_SECRET=your-client-secret-here
```

### Where to Find Each Value:

**CLIENT_ID:**
- Twitch Console → Your App → "Client ID" section
- Looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

**CLIENT_SECRET:**
- Twitch Console → Your App → "Client Secret"
- Click blue "New Secret" button if you don't have one
- Looks like: `x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6`

### Never Commit `.env.local`
```bash
# ✅ DO THIS: .env.local is in .gitignore
git status  # .env.local should NOT appear

# ❌ DON'T DO THIS: Never commit secrets
git add .env.local  # This would be dangerous!
```

---

## Step 3: Restart Development Server

After adding credentials to `.env.local`:

```bash
# Stop current server (Ctrl+C)

# Restart dev server
npm run dev
```

Next.js reloads environment variables on restart.

---

## Step 4: Test It Works

### Test in Browser

1. Open: http://localhost:3000
2. Click **"Explore"**
3. Type: `Elden Ring`
4. Should see results ✅

If you see:
- ✅ Game results → Working!
- ❌ Error message → Check console (F12)

### Check Backend Logs

Terminal should show:
```
GET /api/games/search?q=Elden%20Ring 200 OK
```

If you see errors:
```
Failed to authenticate with IGDB/Twitch
IGDB_CLIENT_ID and IGDB_CLIENT_SECRET must be set
```

Then credentials are missing or incorrect.

---

## How It Works: Backend Flow

### 1. User Searches for Game

Frontend:
```typescript
// src/lib/api-client.ts
const results = await searchGames('Elden Ring');
// Calls: GET /api/games/search?q=Elden%20Ring
```

### 2. Next.js API Route Receives Request

```typescript
// src/app/api/games/search/route.ts
export async function GET(request) {
  const query = request.nextUrl.searchParams.get('q');
  const games = await searchGames(query);
  return Response.json({ data: games });
}
```

### 3. Backend Gets Access Token

```typescript
// src/lib/igdb.ts - getAccessToken()
Twitch OAuth Endpoint:
  ├─ Client ID: IGDB_CLIENT_ID
  ├─ Client Secret: IGDB_CLIENT_SECRET
  ├─ Grant Type: client_credentials
  └─ Response: access_token (cached 1 hour)
```

### 4. Query IGDB with Token

```typescript
// src/lib/igdb.ts - searchGames()
IGDB API:
  ├─ Client-ID: header
  ├─ Authorization: Bearer {access_token}
  ├─ Query: search "Elden Ring"; fields ...
  └─ Response: Game objects
```

### 5. Return to Frontend

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 28366,
      "name": "Elden Ring",
      "cover": {
        "image_id": "co3z4h",
        ...
      },
      "rating": 92,
      ...
    }
  ]
}
```

---

## API Endpoints Available

### Search Games
```
GET /api/games/search?q=query
```

**Parameters:**
- `q` (required): Game name (2-100 chars)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [{ game objects }]
}
```

**Example:**
```bash
curl "http://localhost:3000/api/games/search?q=zelda"
```

### Get Game Details
```
GET /api/games/[id]
```

**Parameters:**
- `id` (required): IGDB game ID (number)

**Response:**
```json
{
  "success": true,
  "data": { full game object }
}
```

**Example:**
```bash
curl "http://localhost:3000/api/games/1942"  # Breath of the Wild
```

### Trending Games
```
GET /api/games/trending?limit=20
```

**Parameters:**
- `limit` (optional): 1-50 games (default: 20)

**Response:**
```json
{
  "success": true,
  "count": 20,
  "data": [{ game objects }]
}
```

---

## IGDB Data Structure

### Game Object
```typescript
interface IGDBGame {
  id: number;
  name: string;
  cover?: {
    image_id: string;        // Convert to URL
    height: number;
    width: number;
  };
  rating?: number;           // 0-100
  first_release_date?: number; // Unix timestamp
  platforms?: [{
    name: string;
    abbreviation: string;
  }];
  genres?: [{
    name: string;
  }];
  summary?: string;
  aggregated_rating?: number; // 0-100
  aggregated_rating_count?: number;
}
```

### Image URLs

IGDB returns `image_id`, not full URLs.

**Convert to URL:**
```typescript
// Use helper function:
import { getIGDBImageUrl } from '@/lib/igdb';

const url = getIGDBImageUrl('co3z4h', 'cover_big');
// Result: https://images.igdb.com/igdb/image/upload/t_cover_big/co3z4h.jpg
```

**Available Sizes:**
- `thumb` - Small thumbnail
- `cover_small` - Small cover (264x352)
- `cover_big` - Large cover (264x352, better quality)
- `screenshot_med` - Medium screenshot
- `screenshot_big` - Large screenshot

---

## Token Caching

### How It Works
Tokens are cached in memory to reduce API calls:

```typescript
// First request
1. getAccessToken() called
2. No cached token
3. Call Twitch OAuth
4. Cache token for 1 hour (minus 1 min buffer)
5. Return token

// Next 59 minutes
1. getAccessToken() called
2. Cached token found
3. Return immediately (no API call!)
4. No Twitch calls needed

// After 1 hour
1. getAccessToken() called
2. Token expired
3. Refresh from Twitch
4. Cache new token
```

### Production Note

In production, use **Redis** instead of memory cache:
```typescript
// Production (not yet implemented)
const token = await redis.get('igdb_token');
if (token) return token;
// ... get new token
await redis.set('igdb_token', token, { EX: 3600 });
```

---

## Troubleshooting

### "IGDB_CLIENT_ID and IGDB_CLIENT_SECRET must be set"

**Problem:** Environment variables not found

**Solutions:**
1. Create `.env.local` file in project root
2. Add both variables:
   ```env
   IGDB_CLIENT_ID=your-id
   IGDB_CLIENT_SECRET=your-secret
   ```
3. Restart dev server (Ctrl+C, then `npm run dev`)
4. Verify values are correct at Twitch console

### "Failed to authenticate with IGDB/Twitch"

**Problem:** Twitch OAuth failed (wrong credentials)

**Solutions:**
1. Verify Client ID (from Twitch Console)
2. Verify Client Secret (from Twitch Console)
3. Make sure Client Secret is up-to-date (generate new if needed)
4. Check Twitch console app status (should be "Active")

### "Games not showing in search"

**Problem:** API working but no results

**Solutions:**
1. Check browser console (F12)
2. Look for network errors in DevTools
3. Try simple search like "zelda"
4. Check IGDB API status: https://status.igdb.com
5. Check rate limits (20 req/sec by default)

### "Images not loading"

**Problem:** Cover images showing as broken

**Solutions:**
1. Verify image_id exists in game object
2. Check IGDB image CDN: https://images.igdb.com
3. Try different size: `cover_small` → `cover_big`
4. Some games may not have covers

### Console shows "Invalid Client ID"

**Problem:** Twitch rejecting credentials

**Solutions:**
1. Go to: https://dev.twitch.tv/console/apps
2. Find your app
3. Click "Manage"
4. Verify "Status" is "Active"
5. Copy Client ID and Secret again (carefully)
6. Update `.env.local`

---

## Security Best Practices

### DO ✅
- [ ] Keep CLIENT_SECRET in `.env.local` only
- [ ] Never commit `.env.local` to Git
- [ ] Use `.env.local.example` template in Git
- [ ] Regenerate token if compromised
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Log API errors (not keys!)
- [ ] Rotate CLIENT_SECRET annually

### DON'T ❌
- [ ] Commit `.env.local` to GitHub
- [ ] Share CLIENT_SECRET publicly
- [ ] Use CLIENT_SECRET in frontend code
- [ ] Log or display secrets
- [ ] Use same secret for dev/staging/prod
- [ ] Hard-code credentials
- [ ] Share credentials via email/Slack

---

## Production Deployment

### Setting Environment Variables

**On Vercel:**
1. Go to Project Settings → Environment Variables
2. Add two variables:
   ```
   IGDB_CLIENT_ID = your-id
   IGDB_CLIENT_SECRET = your-secret
   ```
3. Deploy (automatic)

**On Other Hosts (Railway, Render, etc):**
1. Add env vars to hosting dashboard
2. Or use `.env` files (if supported)
3. Restart application

**Never:**
```bash
# ❌ Don't do this in production
git commit .env.local

# ✅ Do this instead
# Add via hosting dashboard or CI/CD secrets
```

---

## Testing Your Setup

### Test 1: Search Works
```bash
curl "http://localhost:3000/api/games/search?q=mario"
# Should return JSON with games
```

### Test 2: Game Details Work
```bash
curl "http://localhost:3000/api/games/1942"
# Should return Zelda: Breath of the Wild
```

### Test 3: Trending Works
```bash
curl "http://localhost:3000/api/games/trending?limit=5"
# Should return top 5 games
```

### Test 4: Frontend Works
1. Open http://localhost:3000
2. Click Explore
3. Search for a game
4. Should see results with images

---

## API Rate Limits

**Twitch OAuth:**
- 1 token per grant
- Cached for 1 hour
- Minimal requests

**IGDB API:**
- 4 requests/second (4 QPS)
- Tokens last 1 hour
- Implement exponential backoff on rate limit

---

## Files Modified/Created

### New Files
- ✅ `src/lib/igdb.ts` - IGDB service
- ✅ `src/lib/api-client.ts` - Frontend API client
- ✅ `src/app/api/games/search/route.ts` - Search endpoint
- ✅ `src/app/api/games/[id]/route.ts` - Details endpoint
- ✅ `src/app/api/games/trending/route.ts` - Trending endpoint
- ✅ `IGDB_SETUP.md` - This file

### Updated Files
- ✅ `.env.local.example` - Added IGDB variables
- ✅ `src/app/explore/page.tsx` - Uses new API client
- ✅ `src/app/trending/page.tsx` - Uses new API client
- ✅ `src/app/game/[id]/page.tsx` - Uses new API client
- ✅ `src/components/GameCard.tsx` - Updated for IGDB data
- ✅ `package.json` - Dependencies unchanged

### Removed/Deprecated
- ❌ `src/lib/rawg.ts` - RAWG client (no longer used)

---

## FAQ

**Q: Do I need a paid Twitch account?**
A: No, free account works fine.

**Q: What if I lose my CLIENT_SECRET?**
A: Generate a new one at Twitch Console → Your App → "New Secret".

**Q: Can I use IGDB without Twitch?**
A: No, IGDB requires Twitch OAuth. But creating a free Twitch account takes 2 minutes.

**Q: What if IGDB API goes down?**
A: Users will see "Failed to load games" error. Implement status page monitoring.

**Q: Can I cache responses?**
A: Yes, implement Redis or database caching for popular searches.

**Q: Are there image rate limits?**
A: Images use CDN (images.igdb.com), no rate limits on image requests.

**Q: Can I use this in production?**
A: Yes, IGDB has free tier for reasonable usage. Check their pricing page.

**Q: What's the rate limit?**
A: IGDB limits to 4 requests/second. With token caching, you'll rarely hit this.

---

## Next Steps

1. ✅ Get Twitch credentials (Twitch Console)
2. ✅ Add to `.env.local`
3. ✅ Restart dev server
4. ✅ Test in browser
5. ✅ Deploy with environment variables set
6. ⏳ Implement Redis caching (production optimization)
7. ⏳ Add error tracking (Sentry)
8. ⏳ Monitor API usage (Twitch Console)

---

## Resources

- **IGDB API Docs**: https://api-docs.igdb.com
- **Twitch Developer Console**: https://dev.twitch.tv/console/apps
- **IGDB Status**: https://status.igdb.com
- **Image CDN**: https://images.igdb.com

---

## Support

If you encounter issues:

1. Check Twitch Console (app active?)
2. Verify credentials in `.env.local`
3. Check terminal for error messages
4. Look at browser console (F12)
5. Check API rate limits
6. Review IGDB API docs

---

**Last Updated:** 2026-01-09  
**IGDB API Version:** v4  
**Status:** ✅ Production Ready
