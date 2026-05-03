CREATE TABLE `books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`isbn` text,
	`isbn13` text,
	`publisher` text,
	`publishedYear` integer,
	`edition` integer DEFAULT 1,
	`language` text DEFAULT 'id',
	`pageCount` integer,
	`genre` text,
	`description` text,
	`coverUrl` text,
	`shelfCode` text,
	`totalCopies` integer DEFAULT 1 NOT NULL,
	`availableCopies` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `books_isbn_unique` ON `books` (`isbn`);--> statement-breakpoint
CREATE UNIQUE INDEX `books_isbn13_unique` ON `books` (`isbn13`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`displayName` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);