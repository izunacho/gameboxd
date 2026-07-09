# Gameboxd 🎮

A Progressive Web App (PWA) inspired by Letterboxd for sharing and rating video games.

## Features

✨ **PWA Support** - Install on iOS and Android as a native-like app
🎮 **Game Discovery** - Search and explore thousands of games via RAWG API
⭐ **Rate & Review** - Leave ratings (0-100) and written reviews
❤️ **Interactions** - Mark games as played, add to wishlist, or like
👥 **Community** - See reviews and ratings from other gamers
📱 **Responsive Design** - Beautiful dark theme optimized for all devices
🔐 **Authentication** - Secure user accounts with Supabase

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **APIs**: RAWG API for game data
- **State Management**: Zustand
- **PWA**: Next.js PWA support with Service Workers

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier available at supabase.com)
- A RAWG API key (free at rawg.io)

### 2. Setup Instructions

#### Clone the repository
```bash
git clone https://github.com/yourusername/gameboxd.git
cd gameboxd
```

#### Install dependencies
```bash
npm install
```

#### Create environment variables
```bash
cp .env.local.example .env.local
```

#### Configure your .env.local file with:

**Supabase Configuration:**
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy these values from your Supabase project settings:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your anonymous public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (for admin operations)

**RAWG API Configuration:**
1. Get a free API key at [rawg.io/api](https://rawg.io/api)
2. Set `NEXT_PUBLIC_RAWG_API_KEY` in your `.env.local`

**Example .env.local:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_RAWG_API_KEY=your-rawg-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Initialize Supabase Database

1. In your Supabase dashboard, go to SQL Editor
2. Create a new query and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the query to create all tables and policies

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
gameboxd/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home page
│   │   ├── explore/            # Game exploration page
│   │   ├── game/[id]/          # Game detail page
│   │   ├── auth/               # Auth pages (login, signup)
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── components/             # Reusable components
│   │   ├── Header.tsx          # Navigation header
│   │   └── GameCard.tsx        # Game card component
│   ├── lib/                    # Utilities and services
│   │   ├── supabase.ts         # Supabase client
│   │   ├── rawg.ts             # RAWG API client
│   │   └── store.ts            # Zustand state management
│   └── types/                  # TypeScript types
│       └── database.ts         # Database schema types
├── public/                     # Static files & PWA assets
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service Worker
│   └── favicon.ico             # App icon
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## Key Features Explained

### PWA Support

The app works as a Progressive Web App:
- **iOS**: Open in Safari → Share → Add to Home Screen
- **Android**: Open in Chrome → Menu → Install App (or Add to Home Screen)

### Game Discovery

- Browse trending games on the home page
- Search for specific games
- View game details with ratings, platforms, and descriptions
- See critic scores (Metacritic) and community ratings

### User Reviews

- Rate games on a 0-100 scale using star ratings
- Write optional reviews (up to 500 characters)
- See community reviews and ratings
- Like other users' reviews

### Interactions

Three types of game interactions:
- **Played** - Mark games you've completed
- **Wishlist** - Games you want to play
- **Like** - Your favorite games

## Credential Setup Guide

### Getting RAWG API Key (Free)

1. Visit [rawg.io/api](https://rawg.io/api)
2. Click "Sign Up" or "Sign In"
3. Go to Settings → API Keys
4. Create a new API key
5. Copy and paste into `.env.local`

### Setting Up Supabase (Free)

1. Visit [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up and create a new organization
4. Create a new project (free tier available)
5. In Project Settings:
   - Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Go to API Keys section
   - Copy **Anon Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy **Service Role Secret Key** → `SUPABASE_SERVICE_ROLE_KEY`

## Development Guide

### Adding New Features

1. **New Pages**: Create files in `src/app/`
2. **New Components**: Add to `src/components/`
3. **API Integration**: Add to `src/lib/`
4. **Database Changes**: Create migrations in `supabase/migrations/`

### Database Operations

All database operations use Supabase client:

```typescript
import { supabase } from '@/lib/supabase';

// Read data
const { data, error } = await supabase
  .from('reviews')
  .select('*')
  .eq('game_id', gameId);

// Write data
const { error } = await supabase
  .from('reviews')
  .insert({ game_id: gameId, rating: 85, user_id: userId });
```

### State Management

Use Zustand store for client-side state:

```typescript
import { useAppStore } from '@/lib/store';

const { user, setUser, addReview } = useAppStore();
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy

### Deploy to Other Platforms

Works with any Node.js hosting (Railway, Render, etc.)

```bash
npm run build
npm start
```

## API Routes to Add

The following API routes need implementation:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/reviews` - Create review
- `GET /api/reviews/[gameId]` - Get game reviews
- `POST /api/interactions` - Create interaction
- `DELETE /api/interactions/[id]` - Delete interaction
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

## Known Limitations

- Currently uses in-memory state for interactions (will be persisted to Supabase)
- Service Worker is basic (development only)
- No real-time updates yet (Supabase Realtime can be added)

## Next Steps

After initial setup, consider:

1. Complete API route implementation
2. Add user profile pages
3. Implement trending algorithms
4. Add social features (following, comments)
5. Add push notifications
6. Optimize images with Next.js Image component
7. Add dark/light theme toggle
8. Set up CI/CD with GitHub Actions

## Troubleshooting

**"RAWG API not configured"**
- Check that `NEXT_PUBLIC_RAWG_API_KEY` is set in `.env.local`
- Restart dev server after updating env variables

**"Supabase connection failed"**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and keys are correct
- Check Supabase project is active
- Ensure database tables were created

**"Games not loading"**
- Check browser console for errors
- Verify RAWG API key is valid
- Check that API rate limit not exceeded

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open a GitHub issue.

---

**Happy gaming! 🎮**
