import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  upsertUser, getUserByOpenId,
  getOrCreateProfile, getProfileByUserId, updateProfile,
  calculateElo, eloToRank,
  saveMatch, getMatchHistory,
  getLeaderboard,
  getAllAchievements, getPlayerAchievements, upsertPlayerAchievement,
  getTodayChallenges, getPlayerChallenges, upsertPlayerChallenge, claimChallenge,
  getShopItems, getPlayerInventory, purchaseItem,
  getTournaments, joinTournament, getTournamentParticipants,
  getDb, getHomepageStats,
  createNotification, getUserNotifications, getUnreadNotificationCount,
  markNotificationAsRead, markAllNotificationsAsRead,
  getOrCreateNotificationPreferences, updateNotificationPreferences,
} from "./db";
import { eq } from "drizzle-orm";
import { playerProfiles, matches, playerAchievements, dailyChallenges, shopItems } from "../drizzle/schema";

// ─── AI Logic ────────────────────────────────────────────────────────────────

type Move = "rock" | "paper" | "scissors";
const moves: Move[] = ["rock", "paper", "scissors"];

function getAiMove(difficulty: string, playerHistory: Move[]): Move {
  if (difficulty === "easy") {
    return moves[Math.floor(Math.random() * 3)]!;
  }
  if (difficulty === "medium") {
    if (Math.random() < 0.4) return moves[Math.floor(Math.random() * 3)]!;
    // Counter most common player move
    const counts = { rock: 0, paper: 0, scissors: 0 };
    playerHistory.forEach(m => counts[m]++);
    const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]![0] as Move;
    const counters: Record<Move, Move> = { rock: "paper", paper: "scissors", scissors: "rock" };
    return counters[mostCommon];
  }
  if (difficulty === "hard") {
    if (Math.random() < 0.2) return moves[Math.floor(Math.random() * 3)]!;
    if (playerHistory.length === 0) return moves[Math.floor(Math.random() * 3)]!;
    const lastMove = playerHistory[playerHistory.length - 1]!;
    const counters: Record<Move, Move> = { rock: "paper", paper: "scissors", scissors: "rock" };
    return counters[lastMove];
  }
  // impossible: always counter
  if (playerHistory.length === 0) return moves[Math.floor(Math.random() * 3)]!;
  const lastMove = playerHistory[playerHistory.length - 1]!;
  const counters: Record<Move, Move> = { rock: "paper", paper: "scissors", scissors: "rock" };
  return counters[lastMove];
}

function getRoundResult(p1: Move, p2: Move): "win" | "loss" | "draw" {
  if (p1 === p2) return "draw";
  if (
    (p1 === "rock" && p2 === "scissors") ||
    (p1 === "paper" && p2 === "rock") ||
    (p1 === "scissors" && p2 === "paper")
  ) return "win";
  return "loss";
}

// ─── Achievement Checker ─────────────────────────────────────────────────────

async function checkAndAwardAchievements(userId: number, profile: Awaited<ReturnType<typeof getProfileByUserId>>) {
  if (!profile) return [];
  const allAchievements = await getAllAchievements();
  const playerAchs = await getPlayerAchievements(userId);
  const unlockedKeys = new Set(playerAchs.filter(a => a.unlockedAt).map(a => a.achievementKey));
  const newlyUnlocked: string[] = [];

  const checks: Record<string, { progress: number; requirement: number }> = {
    first_win: { progress: profile.wins, requirement: 1 },
    wins_10: { progress: profile.wins, requirement: 10 },
    wins_50: { progress: profile.wins, requirement: 50 },
    wins_100: { progress: profile.wins, requirement: 100 },
    wins_500: { progress: profile.wins, requirement: 500 },
    streak_3: { progress: profile.currentStreak, requirement: 3 },
    streak_5: { progress: profile.currentStreak, requirement: 5 },
    streak_10: { progress: profile.currentStreak, requirement: 10 },
    reach_silver: { progress: profile.rank === "silver" || profile.rank === "gold" || profile.rank === "platinum" || profile.rank === "diamond" ? 1 : 0, requirement: 1 },
    reach_gold: { progress: profile.rank === "gold" || profile.rank === "platinum" || profile.rank === "diamond" ? 1 : 0, requirement: 1 },
    reach_platinum: { progress: profile.rank === "platinum" || profile.rank === "diamond" ? 1 : 0, requirement: 1 },
    reach_diamond: { progress: profile.rank === "diamond" ? 1 : 0, requirement: 1 },
    rock_master: { progress: profile.rockCount, requirement: 100 },
    paper_master: { progress: profile.paperCount, requirement: 100 },
    scissors_master: { progress: profile.scissorsCount, requirement: 100 },
    games_100: { progress: profile.totalGames, requirement: 100 },
  };

  for (const ach of allAchievements) {
    const check = checks[ach.key];
    if (!check) continue;
    const isUnlocked = check.progress >= check.requirement;
    if (isUnlocked && !unlockedKeys.has(ach.key)) {
      newlyUnlocked.push(ach.key);
      // Award coins
      await updateProfile(userId, { coins: (profile.coins || 0) + ach.rewardCoins });
    }
    await upsertPlayerAchievement(userId, ach.key, Math.min(check.progress, check.requirement), isUnlocked);
  }
  return newlyUnlocked;
}

// ─── Routers ─────────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Profile ───────────────────────────────────────────────────────────────
  profile: router({
    me: protectedProcedure.query(async ({ ctx }) => {
      return getOrCreateProfile(ctx.user.id, ctx.user.name || "Player");
    }),

    byUserId: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input }) => {
      return getProfileByUserId(input.userId);
    }),

    update: protectedProcedure.input(z.object({
      username: z.string().min(3).max(32).optional(),
      bio: z.string().max(200).optional(),
      country: z.string().max(4).optional(),
      avatarUrl: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      await updateProfile(ctx.user.id, input);
      return { success: true };
    }),

    equipItem: protectedProcedure.input(z.object({
      type: z.enum(["border", "skin"]),
      itemKey: z.string(),
    })).mutation(async ({ ctx, input }) => {
      const update = input.type === "border"
        ? { equippedBorder: input.itemKey }
        : { equippedSkin: input.itemKey };
      await updateProfile(ctx.user.id, update);
      return { success: true };
    }),

    matchHistory: protectedProcedure.query(async ({ ctx }) => {
      return getMatchHistory(ctx.user.id, 20);
    }),
  }),

  // ─── Game ──────────────────────────────────────────────────────────────────
  game: router({
    playRound: protectedProcedure.input(z.object({
      playerMove: z.enum(["rock", "paper", "scissors"]),
      aiDifficulty: z.enum(["easy", "medium", "hard", "impossible"]),
      playerHistory: z.array(z.enum(["rock", "paper", "scissors"])),
    })).mutation(async ({ input }) => {
      const aiMove = getAiMove(input.aiDifficulty, input.playerHistory);
      const result = getRoundResult(input.playerMove, aiMove);
      return { aiMove, result };
    }),

    finishMatch: protectedProcedure.input(z.object({
      mode: z.enum(["ranked", "casual", "ai", "friend"]),
      aiDifficulty: z.enum(["easy", "medium", "hard", "impossible"]).optional(),
      playerScore: z.number(),
      opponentScore: z.number(),
      rounds: z.array(z.object({
        playerMove: z.string(),
        aiMove: z.string(),
        result: z.string(),
      })),
      isWin: z.boolean(),
      isDraw: z.boolean(),
    })).mutation(async ({ ctx, input }) => {
      const profile = await getOrCreateProfile(ctx.user.id, ctx.user.name || "Player");
      let eloChange = 0;
      let coinsEarned = input.isWin ? 25 : input.isDraw ? 5 : 0;

      // Count moves
      const rockCount = input.rounds.filter(r => r.playerMove === "rock").length;
      const paperCount = input.rounds.filter(r => r.playerMove === "paper").length;
      const scissorsCount = input.rounds.filter(r => r.playerMove === "scissors").length;

      // ELO for ranked
      if (input.mode === "ranked") {
        const baseElo = 1000; // AI/opponent base
        if (input.isWin) {
          const { winnerChange } = calculateElo(profile.elo, baseElo);
          eloChange = winnerChange;
          coinsEarned += 50;
        } else if (input.isDraw) {
          eloChange = 0;
        } else {
          const { loserChange } = calculateElo(baseElo, profile.elo);
          eloChange = loserChange;
        }
      }

      const newElo = Math.max(100, profile.elo + eloChange);
      const newRank = eloToRank(newElo);
      const oldRank = profile.rank;
      const rankUp = newRank !== oldRank && ["silver", "gold", "platinum", "diamond"].indexOf(newRank) > ["silver", "gold", "platinum", "diamond"].indexOf(oldRank);

      const newWins = profile.wins + (input.isWin ? 1 : 0);
      const newLosses = profile.losses + (!input.isWin && !input.isDraw ? 1 : 0);
      const newDraws = profile.draws + (input.isDraw ? 1 : 0);
      const newStreak = input.isWin ? profile.currentStreak + 1 : 0;
      const newLongestStreak = Math.max(profile.longestStreak, newStreak);
      const newTotal = profile.totalGames + 1;
      const newRockCount = profile.rockCount + rockCount;
      const newPaperCount = profile.paperCount + paperCount;
      const newScissorsCount = profile.scissorsCount + scissorsCount;
      const favoriteMove = newRockCount >= newPaperCount && newRockCount >= newScissorsCount ? "rock"
        : newPaperCount >= newScissorsCount ? "paper" : "scissors";

      await updateProfile(ctx.user.id, {
        elo: newElo,
        rank: newRank,
        wins: newWins,
        losses: newLosses,
        draws: newDraws,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        totalGames: newTotal,
        rockCount: newRockCount,
        paperCount: newPaperCount,
        scissorsCount: newScissorsCount,
        favoriteMove,
        coins: profile.coins + coinsEarned,
      });

      await saveMatch({
        player1Id: ctx.user.id,
        mode: input.mode,
        aiDifficulty: input.aiDifficulty || null,
        winnerId: input.isWin ? ctx.user.id : null,
        player1Score: input.playerScore,
        player2Score: input.opponentScore,
        rounds: input.rounds,
        eloChange,
        coinsEarned,
      });

      // Check achievements
      const updatedProfile = await getProfileByUserId(ctx.user.id);
      const newAchievements = await checkAndAwardAchievements(ctx.user.id, updatedProfile!);

      return { eloChange, newElo, newRank, oldRank, rankUp, coinsEarned, newAchievements };
    }),
  }),

  // ─── Leaderboard ───────────────────────────────────────────────────────────
  leaderboard: router({
    global: publicProcedure.query(async () => {
      return getLeaderboard(50);
    }),
  }),

  // ─── Achievements ──────────────────────────────────────────────────────────
  achievements: router({
    all: publicProcedure.query(async () => {
      return getAllAchievements();
    }),
    mine: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getOrCreateProfile(ctx.user.id, ctx.user.name || "Player");
      await checkAndAwardAchievements(ctx.user.id, profile);
      return getPlayerAchievements(ctx.user.id);
    }),
  }),

  // ─── Daily Challenges ──────────────────────────────────────────────────────
  challenges: router({
    today: protectedProcedure.query(async ({ ctx }) => {
      const challenges = await getTodayChallenges();
      const ids = challenges.map(c => c.id);
      const progress = await getPlayerChallenges(ctx.user.id, ids);
      return { challenges, progress };
    }),
    claim: protectedProcedure.input(z.object({ challengeId: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const challenge = await db.select().from(dailyChallenges)
        .where(eq(dailyChallenges.id, input.challengeId)).limit(1);
      const claimed = await claimChallenge(ctx.user.id, input.challengeId);
      if (claimed && challenge[0]) {
        const profile = await getProfileByUserId(ctx.user.id);
        if (profile) {
          await updateProfile(ctx.user.id, { coins: profile.coins + challenge[0].rewardCoins });
        }
      }
      return { success: claimed };
    }),
  }),

  // ─── Shop ──────────────────────────────────────────────────────────────────
  shop: router({
    items: publicProcedure.query(async () => {
      return getShopItems();
    }),
    inventory: protectedProcedure.query(async ({ ctx }) => {
      return getPlayerInventory(ctx.user.id);
    }),
    purchase: protectedProcedure.input(z.object({
      itemKey: z.string(),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false, error: "DB unavailable" };
      const item = await db.select().from(shopItems)
        .where(eq(shopItems.key, input.itemKey)).limit(1);
      if (!item[0]) return { success: false, error: "Item not found" };
      return purchaseItem(ctx.user.id, input.itemKey, item[0].price);
    }),
  }),

  // ─── Homepage ───────────────────────────────────────────────────────────────
  homepage: router({
    stats: publicProcedure.query(async () => {
      return getHomepageStats();
    }),
  }),

  // ─── Tournaments ───────────────────────────────────────────────────────────
  tournaments: router({
    list: publicProcedure.query(async () => {
      return getTournaments();
    }),
    participants: publicProcedure.input(z.object({ tournamentId: z.number() })).query(async ({ input }) => {
      return getTournamentParticipants(input.tournamentId);
    }),
    join: protectedProcedure.input(z.object({ tournamentId: z.number() })).mutation(async ({ ctx, input }) => {
      return joinTournament(input.tournamentId, ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;


  // Notifications
  notifications: router({
    list: protectedProcedure.input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
    })).query(async ({ ctx, input }) => {
      return getUserNotifications(ctx.user.id, input.limit, input.offset);
    }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return getUnreadNotificationCount(ctx.user.id);
    }),
    markAsRead: protectedProcedure.input(z.object({
      notificationId: z.number(),
    })).mutation(async ({ input }) => {
      await markNotificationAsRead(input.notificationId);
      return { success: true };
    }),
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),
    preferences: protectedProcedure.query(async ({ ctx }) => {
      return getOrCreateNotificationPreferences(ctx.user.id);
    }),
    updatePreferences: protectedProcedure.input(z.object({
      emailOnMatchResult: z.boolean().optional(),
      emailOnRankUp: z.boolean().optional(),
      emailOnAchievement: z.boolean().optional(),
      emailOnChallenge: z.boolean().optional(),
      emailOnFriendActivity: z.boolean().optional(),
      pushOnMatchResult: z.boolean().optional(),
      pushOnRankUp: z.boolean().optional(),
      pushOnAchievement: z.boolean().optional(),
      pushOnChallenge: z.boolean().optional(),
      pushOnFriendActivity: z.boolean().optional(),
      soundEnabled: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      await updateNotificationPreferences(ctx.user.id, input);
      return { success: true };
    }),
  }),
