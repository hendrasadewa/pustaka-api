ALTER TABLE `users` ADD `status` text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `resetToken` text;--> statement-breakpoint
ALTER TABLE `users` ADD `resetTokenExpiresAt` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `createdAt` integer DEFAULT (unixepoch()) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `updatedAt` integer DEFAULT (unixepoch()) NOT NULL;