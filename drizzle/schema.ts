import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  float,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Extended player profile
export const playerProfiles = mysqlTable("player_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  username: varchar("username", { length: 32 }).notNull().unique(),
  avatarUrl: text("avatarUrl"),
  bio: text("bio"),
  country: varchar("country", { length: 4 }),
  // ELO & rank
  elo: int("elo").default(1000).notNull(),
  rank: mysqlEnum("rank", ["bronze", "silver", "gold", "platinum", "diamond"]).default("bronze").notNull(),
  // Stats
  totalGames: int("totalGames").default(0).notNull(),
  wins: int("wins").default(0).notNull(),
  losses: int("losses").default(0).notNull(),
  draws: int("draws").default(0).notNull(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  favoriteMove: mysqlEnum("favoriteMove", ["rock", "paper", "scissors"]).default("rock"),
  rockCount: int("rockCount").default(0).notNull(),
  paperCount: int("paperCount").default(0).notNull(),
  scissorsCount: int("scissorsCount").default(0).notNull(),
  // Currency
  coins: int("coins").default(100).notNull(),
  // Cosmetics
  equippedBorder: varchar("equippedBorder", { length: 64 }),
  equippedSkin: varchar("equippedSkin", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlayerProfile = typeof playerProfiles.$inferSelect;

// Match history
export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  player1Id: int("player1Id").notNull(),
  player2Id: int("player2Id"), // null = AI
  mode: mysqlEnum("mode", ["ranked", "casual", "ai", "friend"]).notNull(),
  aiDifficulty: mysqlEnum("aiDifficulty", ["easy", "medium", "hard", "impossible"]),
  winnerId: int("winnerId"), // null = draw
  player1Score: int("player1Score").default(0).notNull(),
  player2Score: int("player2Score").default(0).notNull(),
  rounds: json("rounds"), // array of round results
  eloChange: int("eloChange").default(0),
  coinsEarned: int("coinsEarned").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Match = typeof matches.$inferSelect;

// Achievements
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 32 }),
  requirement: int("requirement").default(1).notNull(),
  rewardCoins: int("rewardCoins").default(50).notNull(),
});

export const playerAchievements = mysqlTable("player_achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  achievementKey: varchar("achievementKey", { length: 64 }).notNull(),
  progress: int("progress").default(0).notNull(),
  unlockedAt: timestamp("unlockedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlayerAchievement = typeof playerAchievements.$inferSelect;

// Daily challenges
export const dailyChallenges = mysqlTable("daily_challenges", {
  id: int("id").autoincrement().primaryKey(),
  challengeDate: varchar("challengeDate", { length: 16 }).notNull(), // YYYY-MM-DD
  key: varchar("key", { length: 64 }).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  requirement: int("requirement").default(1).notNull(),
  rewardCoins: int("rewardCoins").default(100).notNull(),
  rewardXp: int("rewardXp").default(50).notNull(),
});

export const playerChallenges = mysqlTable("player_challenges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  challengeId: int("challengeId").notNull(),
  progress: int("progress").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  claimedAt: timestamp("claimedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlayerChallenge = typeof playerChallenges.$inferSelect;

// Shop items
export const shopItems = mysqlTable("shop_items", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["border", "skin", "banner", "effect"]).notNull(),
  price: int("price").notNull(),
  rarity: mysqlEnum("rarity", ["common", "rare", "epic", "legendary"]).default("common").notNull(),
  previewData: text("previewData"), // CSS class or color
  isActive: boolean("isActive").default(true).notNull(),
});

export const playerInventory = mysqlTable("player_inventory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  itemKey: varchar("itemKey", { length: 64 }).notNull(),
  purchasedAt: timestamp("purchasedAt").defaultNow().notNull(),
});

// Tournaments
export const tournaments = mysqlTable("tournaments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  status: mysqlEnum("status", ["upcoming", "active", "completed"]).default("upcoming").notNull(),
  maxPlayers: int("maxPlayers").default(8).notNull(),
  currentPlayers: int("currentPlayers").default(0).notNull(),
  prizeCoins: int("prizeCoins").default(500).notNull(),
  startTime: timestamp("startTime").notNull(),
  bracket: json("bracket"), // bracket data
  winnerId: int("winnerId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const tournamentParticipants = mysqlTable("tournament_participants", {
  id: int("id").autoincrement().primaryKey(),
  tournamentId: int("tournamentId").notNull(),
  userId: int("userId").notNull(),
  seed: int("seed"),
  eliminated: boolean("eliminated").default(false).notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});


// Notifications
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", [
    "match_result",
    "rank_up",
    "achievement_unlocked",
    "challenge_completed",
    "friend_ranked_up",
    "tournament_started",
    "tournament_result",
    "shop_item_sale",
    "system_announcement",
  ]).notNull(),
  title: varchar("title", { length: 128 }).notNull(),
  message: text("message").notNull(),
  data: json("data"), // Additional metadata (relatedUserId, matchId, etc.)
  isRead: boolean("isRead").default(false).notNull(),
  isPushed: boolean("isPushed").default(false).notNull(), // Whether push notification was sent
  isEmailed: boolean("isEmailed").default(false).notNull(), // Whether email was sent
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export type Notification = typeof notifications.$inferSelect;

// Notification preferences
export const notificationPreferences = mysqlTable("notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  emailOnMatchResult: boolean("emailOnMatchResult").default(true).notNull(),
  emailOnRankUp: boolean("emailOnRankUp").default(true).notNull(),
  emailOnAchievement: boolean("emailOnAchievement").default(true).notNull(),
  emailOnChallenge: boolean("emailOnChallenge").default(false).notNull(),
  emailOnFriendActivity: boolean("emailOnFriendActivity").default(false).notNull(),
  pushOnMatchResult: boolean("pushOnMatchResult").default(true).notNull(),
  pushOnRankUp: boolean("pushOnRankUp").default(true).notNull(),
  pushOnAchievement: boolean("pushOnAchievement").default(true).notNull(),
  pushOnChallenge: boolean("pushOnChallenge").default(true).notNull(),
  pushOnFriendActivity: boolean("pushOnFriendActivity").default(false).notNull(),
  soundEnabled: boolean("soundEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
