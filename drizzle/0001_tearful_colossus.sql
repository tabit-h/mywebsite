CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`icon` varchar(32),
	`requirement` int NOT NULL DEFAULT 1,
	`rewardCoins` int NOT NULL DEFAULT 50,
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`),
	CONSTRAINT `achievements_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `daily_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`challengeDate` varchar(16) NOT NULL,
	`key` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`requirement` int NOT NULL DEFAULT 1,
	`rewardCoins` int NOT NULL DEFAULT 100,
	`rewardXp` int NOT NULL DEFAULT 50,
	CONSTRAINT `daily_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`player1Id` int NOT NULL,
	`player2Id` int,
	`mode` enum('ranked','casual','ai','friend') NOT NULL,
	`aiDifficulty` enum('easy','medium','hard','impossible'),
	`winnerId` int,
	`player1Score` int NOT NULL DEFAULT 0,
	`player2Score` int NOT NULL DEFAULT 0,
	`rounds` json,
	`eloChange` int DEFAULT 0,
	`coinsEarned` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `matches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `player_achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementKey` varchar(64) NOT NULL,
	`progress` int NOT NULL DEFAULT 0,
	`unlockedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `player_achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `player_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`challengeId` int NOT NULL,
	`progress` int NOT NULL DEFAULT 0,
	`completed` boolean NOT NULL DEFAULT false,
	`claimedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `player_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `player_inventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`itemKey` varchar(64) NOT NULL,
	`purchasedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `player_inventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `player_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`username` varchar(32) NOT NULL,
	`avatarUrl` text,
	`bio` text,
	`country` varchar(4),
	`elo` int NOT NULL DEFAULT 1000,
	`rank` enum('bronze','silver','gold','platinum','diamond') NOT NULL DEFAULT 'bronze',
	`totalGames` int NOT NULL DEFAULT 0,
	`wins` int NOT NULL DEFAULT 0,
	`losses` int NOT NULL DEFAULT 0,
	`draws` int NOT NULL DEFAULT 0,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`favoriteMove` enum('rock','paper','scissors') DEFAULT 'rock',
	`rockCount` int NOT NULL DEFAULT 0,
	`paperCount` int NOT NULL DEFAULT 0,
	`scissorsCount` int NOT NULL DEFAULT 0,
	`coins` int NOT NULL DEFAULT 100,
	`equippedBorder` varchar(64),
	`equippedSkin` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `player_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `player_profiles_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `player_profiles_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `shop_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`category` enum('border','skin','banner','effect') NOT NULL,
	`price` int NOT NULL,
	`rarity` enum('common','rare','epic','legendary') NOT NULL DEFAULT 'common',
	`previewData` text,
	`isActive` boolean NOT NULL DEFAULT true,
	CONSTRAINT `shop_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `shop_items_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `tournament_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tournamentId` int NOT NULL,
	`userId` int NOT NULL,
	`seed` int,
	`eliminated` boolean NOT NULL DEFAULT false,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tournament_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tournaments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`status` enum('upcoming','active','completed') NOT NULL DEFAULT 'upcoming',
	`maxPlayers` int NOT NULL DEFAULT 8,
	`currentPlayers` int NOT NULL DEFAULT 0,
	`prizeCoins` int NOT NULL DEFAULT 500,
	`startTime` timestamp NOT NULL,
	`bracket` json,
	`winnerId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tournaments_id` PRIMARY KEY(`id`)
);
