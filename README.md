# RPS Royale

A premium competitive **Rock Paper Scissors** esports platform with ELO ranking, achievements, tournaments, and cosmetic shop. Built with React 19, Express 4, tRPC 11, Tailwind CSS 4, and MySQL.

**Live Demo:** [rpsroyale-adomjxuf.manus.space](https://rpsroyale-adomjxuf.manus.space)

---

## Features

| Feature | Details |
|---|---|
| **Core Game** | Animated RPS choice buttons, 4 AI difficulty levels (Easy → Impossible), round-by-round logic, match result screen |
| **ELO Ranking** | Full K=32 ELO system, 5 tiers (Bronze → Diamond), rank-up animation on promotion |
| **Leaderboard** | Global rankings by ELO, win rate, streak — live from the database |
| **Player Profiles** | Stats dashboard, match history, favorite move, equipped cosmetics, rank badge |
| **Achievements** | 16 unlockable badges (First Win, Streak Master, Rock/Paper/Scissors Master, etc.) with coin rewards |
| **Daily Challenges** | 3 randomized challenges per day with 24h reset, progress tracking, coin claims |
| **Coin Shop** | Cosmetic borders and skins across 4 rarity tiers (Common → Legendary), purchase + equip flow |
| **Tournaments** | Scheduled single-elimination brackets, join flow, participant listing, prize pool display |
| **Settings** | Profile editing (username, bio), account info, preference toggles |
| **Cinematic UI** | Chiaroscuro dark theme, warm gold neon accents, Orbitron/Rajdhani fonts, particle backgrounds, animated floating RPS icons |

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Framer Motion, shadcn/ui
- **Backend:** Node.js, Express 4, tRPC 11
- **Database:** MySQL (via Drizzle ORM)
- **Authentication:** Manus OAuth (built-in)
- **Testing:** Vitest (13 tests, all passing)
- **Build:** Vite, esbuild

---

## Local Development

### Prerequisites

- **Node.js** 22.13.0+ and pnpm 10.4.1+
- **MySQL** 8.0+ (local or remote)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/tabit-beter/RPS-Royale.git
   cd RPS-Royale
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the project root:
   ```env
   # Database
   DATABASE_URL=mysql://user:password@localhost:3306/rps_royale
   
   # Authentication (Manus OAuth)
   VITE_APP_ID=your_manus_app_id
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
   JWT_SECRET=your_jwt_secret_key
   
   # Owner Info
   OWNER_OPEN_ID=your_open_id
   OWNER_NAME=Your Name
   
   # Analytics (optional)
   VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
   VITE_ANALYTICS_WEBSITE_ID=your_website_id
   
   # Manus Built-in APIs
   BUILT_IN_FORGE_API_URL=https://api.manus.im
   BUILT_IN_FORGE_API_KEY=your_api_key
   VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
   VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
   ```

4. **Create database and run migrations**
   ```bash
   # Create the database
   mysql -u root -p -e "CREATE DATABASE rps_royale;"
   
   # Run migrations
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

5. **Start the dev server**
   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`

### Development Commands

```bash
pnpm dev        # Start dev server with hot reload
pnpm build      # Build for production
pnpm start      # Run production build
pnpm test       # Run vitest tests
pnpm check      # TypeScript type checking
pnpm format     # Format code with Prettier
```

---

## Database Schema

The database includes the following tables:

- **users** — Authentication and user identity
- **playerProfiles** — Player stats, ELO, rank, coins, cosmetics
- **matches** — Match history (winner, loser, result, ELO delta)
- **achievements** — Achievement definitions (badges, unlock conditions)
- **playerAchievements** — Player achievement progress
- **dailyChallenges** — Challenge definitions and player progress
- **shopItems** — Cosmetic items (skins, borders, rarity)
- **playerInventory** — Purchased cosmetics per player
- **tournaments** — Tournament definitions and brackets
- **tournamentParticipants** — Tournament enrollment and elimination status

See `drizzle/schema.ts` for full schema definition.

---

## Deployment

### Option 1: Deploy to Render

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a new Web Service**
   - Connect your GitHub repository (tabit-beter/RPS-Royale)
   - Select "Node" as the runtime
   - Build command: `pnpm install && pnpm build`
   - Start command: `pnpm start`

3. **Add environment variables** in Render dashboard
   - Copy all variables from `.env.local` (see Local Development section)
   - Set `NODE_ENV=production`

4. **Create a MySQL database** (Render or external)
   - Get the `DATABASE_URL` connection string
   - Add it to Render environment variables

5. **Deploy**
   - Render will automatically deploy on every push to `main`

### Option 2: Deploy to Railway

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Create a new project**
   - Connect your GitHub repository
   - Select Node.js template

3. **Add MySQL database**
   - Add a MySQL plugin
   - Railway will auto-generate `DATABASE_URL`

4. **Set environment variables**
   - Copy all variables from `.env.local`
   - Set `NODE_ENV=production`

5. **Deploy**
   - Railway deploys automatically on push to `main`

### Option 3: Deploy to Vercel (Frontend Only)

⚠️ **Note:** Vercel is for static/serverless frontends. RPS Royale requires a persistent Node.js backend and database, so **Render or Railway are recommended**.

If you want to deploy the frontend to Vercel separately:
```bash
pnpm build
# Deploy the `dist/` folder to Vercel
```

---

## Project Structure

```
rps-royale/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components (Home, Game, Leaderboard, etc.)
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts (Theme, Auth)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities (tRPC client)
│   │   ├── App.tsx           # Main app router
│   │   ├── main.tsx          # React entry point
│   │   └── index.css         # Global styles (Tailwind + theme)
│   ├── public/               # Static assets (favicon, robots.txt)
│   └── index.html            # HTML template
│
├── server/                    # Express backend
│   ├── routers.ts            # tRPC procedure definitions
│   ├── db.ts                 # Database query helpers
│   ├── game.test.ts          # Vitest tests
│   ├── auth.logout.test.ts   # Auth test example
│   └── _core/                # Framework internals (OAuth, context, etc.)
│
├── drizzle/                   # Database schema & migrations
│   ├── schema.ts             # Table definitions
│   ├── migrations/           # Auto-generated SQL migrations
│   └── relations.ts          # Drizzle ORM relations
│
├── shared/                    # Shared types & constants
│   ├── types.ts              # Shared TypeScript types
│   └── const.ts              # Shared constants
│
├── storage/                   # S3 storage helpers
├── references/               # Documentation & references
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite build config
├── vitest.config.ts          # Vitest test config
└── drizzle.config.ts         # Drizzle ORM config
```

---

## Key Files

| File | Purpose |
|---|---|
| `server/routers.ts` | All tRPC procedures (game, profile, leaderboard, achievements, etc.) |
| `server/db.ts` | Database query helpers (ELO calculation, match saving, stats aggregation) |
| `drizzle/schema.ts` | Database table definitions and types |
| `client/src/pages/Game.tsx` | Main RPS game screen with AI opponent |
| `client/src/pages/Leaderboard.tsx` | Global leaderboard with live rankings |
| `client/src/pages/Profile.tsx` | Player profile with stats dashboard |
| `client/src/index.css` | Cinematic chiaroscuro theme and animations |
| `server/game.test.ts` | Vitest tests for game logic and ELO calculations |

---

## Authentication Flow

RPS Royale uses **Manus OAuth** for authentication:

1. User clicks "Sign In" on the homepage
2. Redirected to Manus OAuth portal
3. After login, redirected back to `/api/oauth/callback`
4. Session cookie is set automatically
5. User data is available via `useAuth()` hook in React components
6. Protected procedures check `ctx.user` on the backend

No manual password management required — all handled by Manus.

---

## Testing

Run the test suite:

```bash
pnpm test
```

Current test coverage includes:

- **Auth tests** — Session logout flow
- **Game logic tests** — RPS win/loss/draw detection, ELO calculations, AI difficulty levels
- **Ranking tests** — Tier progression, rank-up conditions
- **Achievement tests** — Unlock conditions and progression

All 13 tests passing ✓

---

## Performance & Optimization

- **Frontend:** React 19 with automatic batching, optimistic updates for instant UI feedback
- **Backend:** tRPC with automatic type inference, no manual REST routes
- **Database:** Indexed queries, connection pooling via Drizzle ORM
- **Caching:** Leaderboard and stats cached at query level
- **CSS:** Tailwind CSS 4 with tree-shaking, only used utilities included in build
- **Animations:** GPU-accelerated transforms and opacity only, respects `prefers-reduced-motion`

---

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:** Ensure MySQL is running and `DATABASE_URL` is correct in `.env.local`

### OAuth Token Invalid
```
Error: Invalid or expired OAuth token
```
**Solution:** Regenerate OAuth credentials in Manus dashboard and update `.env.local`

### Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
**Solution:** Change port in `server/_core/index.ts` or kill existing process: `lsof -i :3000 | kill -9 <PID>`

### TypeScript Errors
```
error TS2307: Cannot find module
```
**Solution:** Run `pnpm install` and `pnpm check` to rebuild type definitions

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test: `pnpm test`
3. Commit with clear messages: `git commit -m "Add feature: description"`
4. Push and open a pull request

---

## License

MIT License — see LICENSE file for details

---

## Support & Resources

- **Manus Documentation:** [docs.manus.im](https://docs.manus.im)
- **tRPC Documentation:** [trpc.io](https://trpc.io)
- **Tailwind CSS:** [tailwindcss.com](https://tailwindcss.com)
- **Drizzle ORM:** [orm.drizzle.team](https://orm.drizzle.team)
- **React 19:** [react.dev](https://react.dev)

---

## Roadmap

Future features in development:

- Real-time PvP matchmaking (Socket.io)
- Automated tournament progression
- Custom avatar upload
- Seasonal reset mechanics with historical tracking
- Social features (friend requests, direct messaging)
- Mobile app (React Native)

---

**Built with ❤️ using Manus**
