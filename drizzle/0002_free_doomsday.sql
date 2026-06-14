CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailOnMatchResult` boolean NOT NULL DEFAULT true,
	`emailOnRankUp` boolean NOT NULL DEFAULT true,
	`emailOnAchievement` boolean NOT NULL DEFAULT true,
	`emailOnChallenge` boolean NOT NULL DEFAULT false,
	`emailOnFriendActivity` boolean NOT NULL DEFAULT false,
	`pushOnMatchResult` boolean NOT NULL DEFAULT true,
	`pushOnRankUp` boolean NOT NULL DEFAULT true,
	`pushOnAchievement` boolean NOT NULL DEFAULT true,
	`pushOnChallenge` boolean NOT NULL DEFAULT true,
	`pushOnFriendActivity` boolean NOT NULL DEFAULT false,
	`soundEnabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('match_result','rank_up','achievement_unlocked','challenge_completed','friend_ranked_up','tournament_started','tournament_result','shop_item_sale','system_announcement') NOT NULL,
	`title` varchar(128) NOT NULL,
	`message` text NOT NULL,
	`data` json,
	`isRead` boolean NOT NULL DEFAULT false,
	`isPushed` boolean NOT NULL DEFAULT false,
	`isEmailed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
