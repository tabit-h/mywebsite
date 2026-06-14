import { eq, gte, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  playerProfiles, PlayerProfile,
  matches, Match,
  achievements, playerAchievements,
  dailyChallenges, playerChallenges,
  shopItems, playerInventory,
  tournaments, tournamentParticipants,
  notifications, Notification,
  notificationPreferences, NotificationPreferences,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Player Profiles ─────────────────────────────────────────────────────────

export async function getOrCreateProfile(userId: number, defaultUsername: string): Promise<PlayerProfile> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const existing = await db.select().from(playerProfiles).where(eq(playerProfiles.userId, userId)).limit(1);
  if (existing[0]) return existing[0];

  // Create unique username
  let username = defaultUsername.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20) || "Player";
  const count = await db.select({ c: sql<number>`count(*)` }).from(playerProfiles)
    .where(sql`username LIKE ${username + "%"}`);
  if ((count[0]?.c ?? 0) > 0) username = username + Math.floor(Math.random() * 9999);

  await db.insert(playerProfiles).values({ userId, username });
  const created = await db.select().from(playerProfiles).where(eq(playerProfiles.userId, userId)).limit(1);
  return created[0]!;
}

export async function getProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(playerProfiles).where(eq(playerProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function updateProfile(userId: number, data: Partial<PlayerProfile>) {
  const db = await getDb();
  if (!db) return;
  await db.update(playerProfiles).set(data).where(eq(playerProfiles.userId, userId));
}

// ─── ELO & Rank ──────────────────────────────────────────────────────────────

export function calculateElo(winnerElo: number, loserElo: number, isDraw = false) {
  const K = 32;
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 - expectedWinner;
  if (isDraw) {
    const winnerChange = Math.round(K * (0.5 - expectedWinner));
    const loserChange = Math.round(K * (0.5 - expectedLoser));
    return { winnerChange, loserChange };
  }
  const winnerChange = Math.round(K * (1 - expectedWinner));
  const loserChange = Math.round(K * (0 - expectedLoser));
  return { winnerChange, loserChange };
}

export function eloToRank(elo: number): "bronze" | "silver" | "gold" | "platinum" | "diamond" {
  if (elo >= 2000) return "diamond";
  if (elo >= 1600) return "platinum";
  if (elo >= 1300) return "gold";
  if (elo >= 1100) return "silver";
  return "bronze";
}

// ─── Matches ─────────────────────────────────────────────────────────────────

export async function saveMatch(data: {
  player1Id: number;
  player2Id?: number | null;
  mode: "ranked" | "casual" | "ai" | "friend";
  aiDifficulty?: "easy" | "medium" | "hard" | "impossible" | null;
  winnerId?: number | null;
  player1Score: number;
  player2Score: number;
  rounds: unknown;
  eloChange?: number;
  coinsEarned?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(matches).values(data);
  return result;
}

export async function getMatchHistory(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(matches)
    .where(eq(matches.player1Id, userId))
    .orderBy(desc(matches.createdAt))
    .limit(limit);
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export async function getLeaderboard(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: playerProfiles.id,
    userId: playerProfiles.userId,
    username: playerProfiles.username,
    avatarUrl: playerProfiles.avatarUrl,
    country: playerProfiles.country,
    elo: playerProfiles.elo,
    rank: playerProfiles.rank,
    wins: playerProfiles.wins,
    losses: playerProfiles.losses,
    draws: playerProfiles.draws,
    totalGames: playerProfiles.totalGames,
    currentStreak: playerProfiles.currentStreak,
  }).from(playerProfiles)
    .orderBy(desc(playerProfiles.elo))
    .limit(limit);
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export async function getAllAchievements() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(achievements);
}

export async function getPlayerAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(playerAchievements).where(eq(playerAchievements.userId, userId));
}

export async function upsertPlayerAchievement(userId: number, achievementKey: string, progress: number, unlocked: boolean) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(playerAchievements)
    .where(and(eq(playerAchievements.userId, userId), eq(playerAchievements.achievementKey, achievementKey)))
    .limit(1);

  if (existing[0]) {
    const updates: Record<string, unknown> = { progress };
    if (unlocked && !existing[0].unlockedAt) updates.unlockedAt = new Date();
    await db.update(playerAchievements).set(updates)
      .where(and(eq(playerAchievements.userId, userId), eq(playerAchievements.achievementKey, achievementKey)));
  } else {
    await db.insert(playerAchievements).values({
      userId, achievementKey, progress,
      unlockedAt: unlocked ? new Date() : undefined,
    });
  }
}

// ─── Daily Challenges ─────────────────────────────────────────────────────────

export function getTodayDate() {
  return new Date().toISOString().split("T")[0]!;
}

export async function getTodayChallenges() {
  const db = await getDb();
  if (!db) return [];
  const today = getTodayDate();
  const existing = await db.select().from(dailyChallenges).where(eq(dailyChallenges.challengeDate, today));
  if (existing.length > 0) return existing;

  // Generate today's challenges
  const challengePool = [
    { key: "win_3", name: "Triple Threat", description: "Win 3 matches today", requirement: 3, rewardCoins: 100, rewardXp: 50 },
    { key: "win_5", name: "High Five", description: "Win 5 matches today", requirement: 5, rewardCoins: 150, rewardXp: 75 },
    { key: "rock_5", name: "Rock On", description: "Use Rock 5 times and win", requirement: 5, rewardCoins: 80, rewardXp: 40 },
    { key: "paper_5", name: "Paper Chase", description: "Use Paper 5 times and win", requirement: 5, rewardCoins: 80, rewardXp: 40 },
    { key: "scissors_5", name: "Cutting Edge", description: "Use Scissors 5 times and win", requirement: 5, rewardCoins: 80, rewardXp: 40 },
    { key: "streak_3", name: "On a Roll", description: "Win 3 in a row", requirement: 3, rewardCoins: 120, rewardXp: 60 },
    { key: "play_10", name: "Dedicated", description: "Play 10 matches today", requirement: 10, rewardCoins: 75, rewardXp: 35 },
    { key: "ranked_win", name: "Ranked Warrior", description: "Win a ranked match", requirement: 1, rewardCoins: 200, rewardXp: 100 },
  ];

  // Pick 3 random challenges
  const shuffled = challengePool.sort(() => Math.random() - 0.5).slice(0, 3);
  for (const c of shuffled) {
    await db.insert(dailyChallenges).values({ ...c, challengeDate: today });
  }
  return db.select().from(dailyChallenges).where(eq(dailyChallenges.challengeDate, today));
}

export async function getPlayerChallenges(userId: number, challengeIds: number[]) {
  const db = await getDb();
  if (!db) return [];
  if (challengeIds.length === 0) return [];
  return db.select().from(playerChallenges)
    .where(and(eq(playerChallenges.userId, userId)));
}

export async function upsertPlayerChallenge(userId: number, challengeId: number, progress: number, completed: boolean) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(playerChallenges)
    .where(and(eq(playerChallenges.userId, userId), eq(playerChallenges.challengeId, challengeId)))
    .limit(1);

  if (existing[0]) {
    if (existing[0].completed) return; // already done
    const updates: Record<string, unknown> = { progress };
    if (completed) updates.completed = true;
    await db.update(playerChallenges).set(updates)
      .where(and(eq(playerChallenges.userId, userId), eq(playerChallenges.challengeId, challengeId)));
  } else {
    await db.insert(playerChallenges).values({ userId, challengeId, progress, completed });
  }
}

export async function claimChallenge(userId: number, challengeId: number) {
  const db = await getDb();
  if (!db) return false;
  const existing = await db.select().from(playerChallenges)
    .where(and(eq(playerChallenges.userId, userId), eq(playerChallenges.challengeId, challengeId)))
    .limit(1);
  if (!existing[0] || !existing[0].completed || existing[0].claimedAt) return false;
  await db.update(playerChallenges).set({ claimedAt: new Date() })
    .where(and(eq(playerChallenges.userId, userId), eq(playerChallenges.challengeId, challengeId)));
  return true;
}

// ─── Shop ─────────────────────────────────────────────────────────────────────

export async function getShopItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shopItems).where(eq(shopItems.isActive, true));
}

export async function getPlayerInventory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(playerInventory).where(eq(playerInventory.userId, userId));
}

export async function purchaseItem(userId: number, itemKey: string, price: number) {
  const db = await getDb();
  if (!db) return { success: false, error: "DB unavailable" };

  const profile = await getProfileByUserId(userId);
  if (!profile) return { success: false, error: "Profile not found" };
  if (profile.coins < price) return { success: false, error: "Insufficient coins" };

  // Check already owned
  const owned = await db.select().from(playerInventory)
    .where(and(eq(playerInventory.userId, userId), eq(playerInventory.itemKey, itemKey)))
    .limit(1);
  if (owned[0]) return { success: false, error: "Already owned" };

  await db.update(playerProfiles).set({ coins: profile.coins - price }).where(eq(playerProfiles.userId, userId));
  await db.insert(playerInventory).values({ userId, itemKey });
  return { success: true };
}

// ─── Tournaments ─────────────────────────────────────────────────────────────

export async function getTournaments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tournaments).orderBy(desc(tournaments.startTime));
}

export async function joinTournament(tournamentId: number, userId: number) {
  const db = await getDb();
  if (!db) return { success: false, error: "DB unavailable" };

  const t = await db.select().from(tournaments).where(eq(tournaments.id, tournamentId)).limit(1);
  if (!t[0]) return { success: false, error: "Tournament not found" };
  if (t[0].status !== "upcoming") return { success: false, error: "Tournament not open" };
  if (t[0].currentPlayers >= t[0].maxPlayers) return { success: false, error: "Tournament full" };

  const existing = await db.select().from(tournamentParticipants)
    .where(and(eq(tournamentParticipants.tournamentId, tournamentId), eq(tournamentParticipants.userId, userId)))
    .limit(1);
  if (existing[0]) return { success: false, error: "Already joined" };

  await db.insert(tournamentParticipants).values({ tournamentId, userId });
  await db.update(tournaments).set({ currentPlayers: t[0].currentPlayers + 1 }).where(eq(tournaments.id, tournamentId));
  return { success: true };
}

export async function getTournamentParticipants(tournamentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: tournamentParticipants.id,
    userId: tournamentParticipants.userId,
    seed: tournamentParticipants.seed,
    eliminated: tournamentParticipants.eliminated,
    username: playerProfiles.username,
    elo: playerProfiles.elo,
    rank: playerProfiles.rank,
  }).from(tournamentParticipants)
    .leftJoin(playerProfiles, eq(tournamentParticipants.userId, playerProfiles.userId))
    .where(eq(tournamentParticipants.tournamentId, tournamentId));
}


// ─── Homepage Stats ───────────────────────────────────────────────────────────

export async function getHomepageStats() {
  const db = await getDb();
  if (!db) return { totalPlayers: 0, totalMatches: 0, onlinePlayers: 0 };

  // Total registered players
  const playerCount = await db.select({ count: sql<number>`count(*)` }).from(playerProfiles);
  const totalPlayers = playerCount[0]?.count ?? 0;

  // Total matches played
  const matchCount = await db.select({ count: sql<number>`count(*)` }).from(matches);
  const totalMatches = matchCount[0]?.count ?? 0;

  // Online players (logged in within last 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const onlineCount = await db.select({ count: sql<number>`count(*)` }).from(users)
    .where(gte(users.lastSignedIn, fiveMinutesAgo));
  const onlinePlayers = onlineCount[0]?.count ?? 0;

  return { totalPlayers, totalMatches, onlinePlayers };
}

// ─── Notifications ───────────────────────────────────────────────────────────

export async function createNotification(
  userId: number,
  type: string,
  title: string,
  message: string,
  data?: Record<string, unknown>
): Promise<Notification | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(notifications).values({
    userId,
    type: type as any,
    title,
    message,
    data: data ? JSON.stringify(data) : null,
    isRead: false,
    isPushed: false,
    isEmailed: false,
  });

  // Fetch and return the created notification
  const created = await db.select().from(notifications)
    .where(eq(notifications.id, result[0].insertId as any))
    .limit(1);
  return created[0] ?? null;
}

export async function getUserNotifications(
  userId: number,
  limit: number = 20,
  offset: number = 0
): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ count: sql<number>`count(*)` }).from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return result[0]?.count ?? 0;
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

export async function getOrCreateNotificationPreferences(
  userId: number
): Promise<NotificationPreferences> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  if (existing.length > 0) return existing[0];

  // Create default preferences
  await db.insert(notificationPreferences).values({
    userId,
    emailOnMatchResult: true,
    emailOnRankUp: true,
    emailOnAchievement: true,
    emailOnChallenge: false,
    emailOnFriendActivity: false,
    pushOnMatchResult: true,
    pushOnRankUp: true,
    pushOnAchievement: true,
    pushOnChallenge: true,
    pushOnFriendActivity: false,
    soundEnabled: true,
  });

  const created = await db.select().from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);
  return created[0]!;
}

export async function updateNotificationPreferences(
  userId: number,
  updates: Partial<NotificationPreferences>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(notificationPreferences)
    .set(updates)
    .where(eq(notificationPreferences.userId, userId));
}

export async function markNotificationAsPushed(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(notifications)
    .set({ isPushed: true })
    .where(eq(notifications.id, notificationId));
}

export async function markNotificationAsEmailed(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(notifications)
    .set({ isEmailed: true })
    .where(eq(notifications.id, notificationId));
}
