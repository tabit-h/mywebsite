# RPS Royale - TODO

## Phase 1: Schema & Backend
- [x] Database schema: players, matches, achievements, challenges, shop items, tournaments
- [x] DB migrations applied
- [x] tRPC routers: game, profile, leaderboard, achievements, challenges, shop, tournament

## Phase 2: Global Theme & Navigation
- [x] Global CSS: chiaroscuro dark theme, gold neon accents, fonts
- [x] App.tsx routing for all pages
- [x] Navigation bar: logo, online count, user dropdown, auth

## Phase 3: Hero & Core Game
- [x] Hero/Home page with animated RPS visual and CTAs
- [x] Game mode cards (Ranked, Casual, vs AI, vs Friend)
- [x] Core RPS game screen with animated choice buttons
- [x] AI opponent with Easy/Medium/Hard/Impossible difficulty
- [x] Round logic: win/loss/draw detection, score tracking
- [x] Match result animations (win/loss/draw)
- [x] Post-match ELO update and coin reward

## Phase 4: Leaderboard & Profile
- [x] Global leaderboard page with rank, username, ELO, win rate
- [x] ELO ranking system with 5 tiers: Bronze, Silver, Gold, Platinum, Diamond
- [x] Rank-up animation sequence
- [x] Player profile page: avatar, rank badge, bio, stats
- [x] Match history list on profile

## Phase 5: Achievements, Challenges, Shop, Stats
- [x] Achievement system with unlockable badges
- [x] Achievement showcase on profile
- [x] Daily challenges with 24h reset
- [x] Coin rewards for challenges and wins
- [x] Cosmetic shop: skins, borders
- [x] Stats dashboard: win rate chart, favorite move, streaks

## Phase 6: Tournaments & Settings
- [x] Tournament bracket system (single elimination)
- [x] Join/create tournament UI
- [x] Settings page: account, appearance, audio, notifications

## Phase 7: Polish & Delivery
- [x] Particle effects and animated backgrounds
- [x] Rank-up sequences and micro-interactions
- [x] Mobile responsive design
- [x] Vitest tests (13 tests passing)
- [x] Final checkpoint


## Post-Launch: Real Data Integration
- [x] Replace placeholder stats on homepage with real DB queries (player count, total matches, total players)
- [x] Add backend procedures for homepage stats aggregation
- [x] Wire up tRPC queries in Home.tsx


## Notifications System (New)
- [ ] Database schema: notifications table, notification preferences
- [ ] Backend procedures: create notification, mark as read, get user notifications
- [ ] Toast notification system (in-app alerts)
- [ ] Push notifications (browser notifications API)
- [ ] Real-time event notifications (Socket.io)
- [ ] Email notifications for important events
- [ ] Notification Center UI (persistent inbox)
- [ ] Notification preferences page
- [ ] Tests for notification system
