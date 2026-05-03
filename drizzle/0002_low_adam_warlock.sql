DROP INDEX `books_isbn13_unique`;--> statement-breakpoint
ALTER TABLE `books` DROP COLUMN `isbn13`;--> statement-breakpoint
ALTER TABLE `books` DROP COLUMN `publishedYear`;--> statement-breakpoint
ALTER TABLE `books` DROP COLUMN `edition`;--> statement-breakpoint
ALTER TABLE `books` DROP COLUMN `pageCount`;