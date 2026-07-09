# Gameboxd Architecture 🏗️

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser/Mobile)                  │
│  ┌─────────────────────────────────────────────────────────┐
│  │            Next.js 15 (React 19, TypeScript)            │
│  │  ┌─────────────────────────────────────────────────────┐
│  │  │           Tailwind CSS + UI Components              │
│  │  │  - GameCard, Header, RatingDisplay, etc.           │
│  │  └─────────────────────────────────────────────────────┘
│  │  ┌─────────────────────────────────────────────────────┐
│  │  │      App Router (src/app/) + Pages                  │
│  │  │  - Home, Explore, Game Detail, Auth, Profile        │
│  │  └─────────────────────────────────────────────────────┘
│  │  ┌─────────────────────────────────────────────────────┐
│  │  │      State Management (Zustand Store)               │
│  │  │  - User state, Reviews, Interactions                │
│  │  └─────────────────────────────────────────────────────┘
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │     API Layer (src/lib/)                │
        │  ┌──────────────────────────────────────┤
        │  │  ├─ supabase.ts  (Database client)   │
        │  │  ├─ rawg.ts      (Game API client)   │
        │  │  └─ store.ts     (State management)  │
        │  └──────────────────────────────────────┤
        └─────────────────────────────────────────┘
                    ↙                    ↘
        ┌──────────────────┐    ┌──────────────────┐
        │  Supabase Cloud  │    │   RAWG API       │
        │  ┌────────────┐  │    │ (Game Database)  │
        │  │ PostgreSQL │  │    │                  │
        │  │ Database   │  │    │ - Search games   │
        │  │ ┌────────┐ │  │    │ - Game details   │
        │  │ │ users  │ │  │    │ - Ratings        │
        │  │ │ games  │ │  │    │ - Platforms      │
        │  │ │reviews │ │  │    │ - Images         │
        │  │ │ inter. │ │  │    │                  │
        │  │ └────────┘ │  │    │                  │
        │  └────────────┘  │    │                  │
        │  ┌────────────┐  │    │                  │
        │  │Auth Module │  │    │                  │
        │  └────────────┘  │    │                  │
        └──────────────────┘    └──────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Images**: Next.js Image component

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth
- **External APIs**: RAWG API
- **Hosting**: Vercel (recommended) or any Node.js host

### PWA
- **Manifest**: manifest.json
- **Service Worker**: Public/sw.js
- **Offline**: Cache-first strategy for static assets

## Directory Structure

```
gameboxd/
├── public/                          # Static files
│   ├── manifest.json               # PWA manifest
│   ├── sw.js                       # Service Worker
│   ├── favicon.ico                 # App icon
│   └── icons/                      # PWA icons (192x192, 512x512)
│
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout (all pages)
│   │   ├── page.tsx                # Home page (/)
│   │   ├── globals.css             # Global styles
│   │   ├── explore/                # Search/browse games
│   │   │   └── page.tsx
│   │   ├── trending/               # Trending games
│   │   │   └── page.tsx
│   │   ├── game/[id]/              # Game detail page
│   │   │   └── page.tsx
│   │   ├── auth/                   # Authentication
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── community/              # Community features
│   │   │   └── page.tsx
│   │   └── api/                    # API routes (to implement)
│   │       ├── reviews/
│   │       ├── interactions/
│   │       └── auth/
│   │
│   ├── components/                 # React components
│   │   ├── Header.tsx              # Navigation header
│   │   ├── GameCard.tsx            # Game card display
│   │   └── RatingDisplay.tsx       # Star rating component
│   │
│   ├── lib/                        # Utility functions & services
│   │   ├── supabase.ts             # Supabase client initialization
│   │   ├── rawg.ts                 # RAWG API client & functions
│   │   └── store.ts                # Zustand global store
│   │
│   └── types/                      # TypeScript type definitions
│       └── database.ts             # Database schema types
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema (SQL)
│
├── Configuration Files
│   ├── package.json                # Dependencies
│   ├── tsconfig.json               # TypeScript config
│   ├── next.config.ts              # Next.js config
│   ├── tailwind.config.ts          # Tailwind config
│   ├── postcss.config.js           # PostCSS config
│   ├── .env.local.example          # Environment variables template
│   ├── .gitignore                  # Git ignore rules
│
└── Documentation
    ├── README.md                   # Main documentation
    ├── SETUP.md                    # Setup guide
    ├── ROADMAP.md                  # Development roadmap
    └── ARCHITECTURE.md             # This file
```

## Data Flow

### 1. Game Discovery Flow

```
User → Search Input
        ↓
    [ExplorePage]
        ↓
    rawg.searchGames()
        ↓
    RAWG API
        ↓
    Parse Response
        ↓
    [GameCard] × N
        ↓
    Display Results
```

### 2. Game Rating Flow

```
User → Click Star
        ↓
    [GameDetailPage]
        ↓
    updateRating() → Zustand Store
        ↓
    Display Rating
        ↓
    (Future) POST /api/reviews
        ↓
    Supabase Database
```

### 3. User Authentication Flow

```
User → Signup Form
        ↓
    [SignUpPage]
        ↓
    supabase.auth.signUp()
        ↓
    Create Auth User
        ↓
    Create User Profile
        ↓
    Redirect to Login
        ↓
    supabase.auth.signInWithPassword()
        ↓
    Session Created
        ↓
    Redirect to Home
```

## Key Concepts

### State Management (Zustand)

```typescript
// Store structure
{
  user: null | User,
  reviews: { [gameId]: Review[] },
  interactions: GameInteraction[],
  
  // Methods
  setUser(),
  addReview(),
  addInteraction(),
  hasInteraction(),
}
```

**When to use:**
- User session state
- Temporary UI state
- Client-only interactions
- Caching API responses

**When NOT to use:**
- Permanent data (use database)
- Real-time data (use Supabase Realtime)
- Cross-user data (use API routes)

### API Clients

#### RAWG API Client (`lib/rawg.ts`)
```typescript
searchGames(query, page, pageSize)
getGameDetails(id)
getTrendingGames(page, pageSize)
```

**Note**: Calls are made directly from frontend with public API key.

#### Supabase Client (`lib/supabase.ts`)
```typescript
supabase.from('users').select()
supabase.from('reviews').insert()
supabase.auth.signUp()
```

**Security**: Uses Row Level Security (RLS) policies.

## Database Schema

### Users Table
```sql
id, email, username, avatar_url, bio, created_at, updated_at
```

### Games Table
```sql
id, rawg_id, name, background_image, metacritic_score, released
```

### Reviews Table
```sql
id, game_id (FK), user_id (FK), rating, content, liked_count
```

### Interactions Table
```sql
id, game_id (FK), user_id (FK), type (played|wishlist|liked)
```

### Review Likes Table
```sql
id, review_id (FK), user_id (FK)
```

## Security Considerations

### Row Level Security (RLS)

Every table has RLS policies:

```sql
-- Users can view public profiles
CREATE POLICY "view_profiles" ON users FOR SELECT USING (true);

-- Users can update only their own profile
CREATE POLICY "update_own_profile" ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Anyone can read games
CREATE POLICY "view_games" ON games FOR SELECT USING (true);

-- Users can only create their own reviews
CREATE POLICY "create_reviews" ON reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

### Environment Variables

**Public** (visible in browser):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_RAWG_API_KEY`
- `NEXT_PUBLIC_APP_URL`

**Private** (server-only):
- `SUPABASE_SERVICE_ROLE_KEY`

Never commit `.env.local` to Git!

## API Routes to Implement

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews` - List all reviews
- `GET /api/reviews/[gameId]` - Get game reviews
- `GET /api/reviews/[reviewId]` - Get review details
- `PUT /api/reviews/[reviewId]` - Update review
- `DELETE /api/reviews/[reviewId]` - Delete review

### Interactions
- `POST /api/interactions` - Create interaction
- `GET /api/interactions` - List user interactions
- `DELETE /api/interactions/[id]` - Delete interaction

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/stats` - Get user statistics

### Games
- `GET /api/games/[rawgId]/details` - Get game details with reviews
- `GET /api/games/trending` - Get trending games

## Performance Optimization

### Client-Side
- Image optimization with `next/image`
- Code splitting with dynamic imports
- Lazy loading of components
- Service Worker caching

### Server-Side
- Database indexes on foreign keys
- API response caching
- Query optimization
- Pagination on large datasets

### PWA
- Cache static assets
- Cache API responses (where appropriate)
- Offline fallback pages

## Scalability Considerations

### Current Limits
- Supabase free tier: ~500MB database
- RAWG API: 20 requests/min for free tier
- Browser caching only

### Future Improvements
1. **Database**: Upgrade Supabase plan for more capacity
2. **Caching**: Add Redis for API response caching
3. **CDN**: Use Cloudflare for static asset distribution
4. **Search**: Implement Algolia for better search
5. **Images**: Use Cloudinary for image optimization
6. **Real-time**: Supabase Realtime for live updates

## Monitoring & Debugging

### Local Development
```bash
npm run dev
# → http://localhost:3000
# → Check browser console for errors
# → Check terminal for server logs
```

### Browser DevTools
- **Network**: Check API calls to RAWG and Supabase
- **Console**: View JavaScript errors
- **Application**: Check Service Worker and cache
- **Performance**: Monitor page load times

### Supabase Dashboard
- **Logs**: View database queries
- **Realtime**: Monitor active connections
- **SQL Editor**: Test queries
- **Monitoring**: Check service health

## Deployment Architecture

### Development
```
localhost:3000 → Next.js Dev Server → Supabase Cloud → RAWG API
```

### Production (Vercel)
```
vercel.app (CDN) → Serverless Functions → Supabase Cloud → RAWG API
                   (Next.js on Edge)
```

### Environment-Specific Config
- Development: `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- Production: `NEXT_PUBLIC_APP_URL=https://gameboxd.vercel.app`

## Testing Strategy (To Implement)

### Unit Tests
- API client functions (rawg.ts, supabase.ts)
- Store logic (store.ts)
- Utilities

### Integration Tests
- Authentication flow
- Game search and display
- Review submission
- User interactions

### E2E Tests
- Complete user journey
- PWA installation
- Offline functionality

---

**Created**: 2026-01-09  
**Last Updated**: 2026-01-09
